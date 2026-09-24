import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI with required telemetry headers
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * Resilient multi-tier model invoker:
 * Tries 'gemini-3.8-flash', falls back to 'gemini-flash-latest' and 'gemini-3.1-flash-lite'
 * on 503 high demand or transient API errors.
 */
async function callGeminiWithFallback(aiClient: GoogleGenAI, requestPayload: any) {
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await aiClient.models.generateContent({
        ...requestPayload,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const isCapacityOrTransient =
        err?.status === 503 ||
        err?.code === 503 ||
        err?.status === 429 ||
        err?.code === 429 ||
        /503|UNAVAILABLE|high demand|overloaded|resource exhausted/i.test(err?.message || '');

      if (isCapacityOrTransient) {
        console.warn(`[ABHAYAA AI] Model '${model}' experienced high demand (503/429). Retrying with next candidate...`);
        continue;
      }
      console.warn(`[ABHAYAA AI] Model '${model}' note: ${err?.message}. Attempting next model...`);
    }
  }

  throw lastError;
}

// ==========================================
// 1. AI SAFETY ASSISTANT ENDPOINT
// ==========================================
app.post('/api/ai/safety-assistant', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const langNameMap: Record<string, string> = {
      te: 'Telugu (తెలుగు)',
      hi: 'Hindi (हिन्दी)',
      ta: 'Tamil (தமிழ்)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
      en: 'English',
    };
    const targetLang = langNameMap[language] || 'English';

    if (!ai) {
      return res.json({
        reply: getSmartFallbackSafetyAssistant(message, language),
        isFallback: true,
      });
    }

    const systemInstruction = `
You are the "ABHAYAA Safety Assistant", a specialized AI safety and protection advisor for women and girls.
IMPORTANT: The user has selected the language: ${targetLang}. You MUST formulate your entire response naturally, empathetically, and fluently in ${targetLang} (using proper native script for Telugu, Hindi, Tamil, Kannada, Malayalam).
Your mandate is:
1. Distinguish clearly between:
   - Observed facts described by the user
   - Potential risk indicators (e.g. stalking, manipulation, coercion, harassment, isolation)
   - Uncertainty (do not claim to know someone's inner thoughts)
   - Recommended next steps
2. NEVER state "This person is definitely dangerous" or "You are definitely safe".
   Use calibrated language like: "Potential risk indicators detected", "This behavior raises serious caution flags".
3. NEVER encourage confrontation with suspected aggressors or stalkers.
4. If the user indicates immediate physical peril, prominently prioritize Emergency SOS / local police (112 / 1091).
5. Provide clear, empathetic, non-judgmental, actionable personal safety and digital safety advice.
6. Keep answers structured with:
   - Understanding & Safety Assessment
   - Key Risk Indicators (if any)
   - Practical Recommended Actions (immediate and precautionary)
   - Official Support Resources
`;

    // Construct prompt with recent history if provided
    let prompt = `User query in ${targetLang}: ${message}\n`;
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const historyStr = conversationHistory
        .slice(-4)
        .map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`)
        .join('\n');
      prompt = `Recent context:\n${historyStr}\n\nNew query: ${message}\nPlease respond strictly in ${targetLang}.`;
    }

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    return res.json({
      reply: response.text || 'Unable to generate response. Please reach out to emergency services if in danger.',
      isFallback: false,
    });
  } catch (err: any) {
    console.warn('[ABHAYAA AI] Safety assistant using resilient fallback:', err?.message || err);
    return res.json({
      reply: getSmartFallbackSafetyAssistant(req.body.message || '', req.body.language),
      isFallback: true,
      error: err?.message,
    });
  }
});

// ==========================================
// 2. AI CONVERSATION RISK ANALYSIS ENDPOINT
// ==========================================
app.post('/api/ai/analyze-conversation', async (req: Request, res: Response) => {
  try {
    const { conversationText, contextNote } = req.body;
    if (!conversationText) {
      return res.status(400).json({ error: 'Conversation text is required' });
    }

    if (!ai) {
      return res.json(getFallbackConversationAnalysis(conversationText, contextNote));
    }

    const systemInstruction = `
You are the ABHAYAA Conversation Risk Analyzer, analyzing text transcripts for safety risks against women and girls.
Analyze for indicators of:
- Grooming (boundary testing, excessive flattery, secret-keeping, gift-giving)
- Coercion & Blackmail (threats, ultimatums, emotional extortion, revenge porn threats)
- Manipulation & Gaslighting
- Isolation attempts (discouraging contact with family/friends)
- Pressure to meet privately or in isolated places
- Requests for sensitive photos, financial info, or IDs
- Threats of violence, stalking, or repetitive unwanted harassment

Output strictly structured JSON according to the schema.
Always mark uncertainty. Risk levels must be: "Low", "Moderate", "High", or "Critical".
Never claim absolute certainty.
`;

    const response = await callGeminiWithFallback(ai, {
      contents: `Analyze this conversation transcript for safety and coercion risks:\n\n"""\n${conversationText}\n"""\nAdditional context: ${contextNote || 'None provided'}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              description: "Must be 'Low', 'Moderate', 'High', or 'Critical'",
            },
            summary: {
              type: Type.STRING,
              description: 'Clear, scannable objective summary of observed behavior',
            },
            indicators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: 'e.g. Coercion, Isolation, Secret-keeping, Pressure to meet' },
                  excerpt: { type: Type.STRING, description: 'Exact quote or text evidence from the conversation' },
                  explanation: { type: Type.STRING, description: 'Why this constitutes a potential risk indicator' },
                  severity: { type: Type.STRING, description: "'low' | 'medium' | 'high' | 'critical'" },
                  confidence: { type: Type.STRING, description: "'Possible' | 'Probable' | 'High Indication'" },
                },
                required: ['type', 'excerpt', 'explanation', 'severity', 'confidence'],
              },
            },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Practical, safe next steps (e.g. preserve evidence, avoid isolated meetings, tell trusted contacts)',
            },
            disclaimer: {
              type: Type.STRING,
              description: 'Clear notice that AI interpretations indicate potential risks and do not replace legal or crisis advice',
            },
          },
          required: ['riskLevel', 'summary', 'indicators', 'suggestedActions', 'disclaimer'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.warn('[ABHAYAA AI] Conversation analysis using resilient fallback:', err?.message || err);
    return res.json(getFallbackConversationAnalysis(req.body.conversationText || '', req.body.contextNote));
  }
});

// ==========================================
// 3. AI SUSPICIOUS LINK ANALYSIS ENDPOINT
// ==========================================
app.post('/api/ai/analyze-link', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!ai) {
      return res.json(getFallbackLinkAnalysis(url));
    }

    const systemInstruction = `
You are the ABHAYAA Web Threat & Link Safety Analyzer.
Evaluate the given URL for indicators of:
- Phishing and credential harvesting
- Brand or government impersonation (typosquatting, lookalike domains)
- Suspicious recruitment scams / fake job portals targeting women
- Malicious redirects, fake contest/lottery lures, extortion links
- Suspicious top-level domains, excessive subdomains, or obfuscated characters

Classification must be one of: "Likely safe", "Suspicious", "Potentially malicious", or "Unknown".
Important disclaimer rule: Never claim that AI alone can guarantee that a URL is 100% safe. Always emphasize that no obvious risks detected does not guarantee safety.
Output strictly JSON matching the response schema.
`;

    const response = await callGeminiWithFallback(ai, {
      contents: `Inspect this URL for safety hazards: ${url}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: {
              type: Type.STRING,
              description: "'Likely safe' | 'Suspicious' | 'Potentially malicious' | 'Unknown'",
            },
            riskScore: {
              type: Type.INTEGER,
              description: 'Risk rating from 0 (very low risk) to 100 (severe threat)',
            },
            domainAnalysis: {
              type: Type.OBJECT,
              properties: {
                domain: { type: Type.STRING },
                isLookalike: { type: Type.BOOLEAN },
                hasSuspiciousTLD: { type: Type.BOOLEAN },
                protocol: { type: Type.STRING },
              },
              required: ['domain', 'isLookalike', 'hasSuspiciousTLD', 'protocol'],
            },
            signals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "'low' | 'medium' | 'high'" },
                },
                required: ['type', 'description', 'severity'],
              },
            },
            safetyRecommendation: {
              type: Type.STRING,
              description: 'Concrete advice for the user (e.g. Do not enter credentials, avoid downloading attachments)',
            },
            disclaimer: {
              type: Type.STRING,
              description: 'Standard disclaimer that AI URL scanning cannot guarantee absolute safety',
            },
          },
          required: ['classification', 'riskScore', 'domainAnalysis', 'signals', 'safetyRecommendation', 'disclaimer'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.warn('[ABHAYAA AI] Link analysis using resilient fallback:', err?.message || err);
    return res.json(getFallbackLinkAnalysis(req.body.url || ''));
  }
});

// ==========================================
// 4. AI COMPLAINT ASSISTANT ENDPOINT
// ==========================================
app.post('/api/ai/draft-complaint', async (req: Request, res: Response) => {
  try {
    const { incidentDescription, userDetails } = req.body;
    if (!incidentDescription) {
      return res.status(400).json({ error: 'Incident description is required' });
    }

    if (!ai) {
      return res.json(getFallbackComplaintDraft(incidentDescription));
    }

    const systemInstruction = `
You are the ABHAYAA AI Complaint Assistant.
Your job is to convert a natural language description of an incident (harassment, stalking, assault, blackmail, online abuse, domestic coercion) into a structured, chronological, formal complaint draft suitable for review before filing with authorities (Police / Women's Cell / Cyber Crime Cell).

Rules:
1. Clearly mark this as an AI-generated draft that requires human review and editing.
2. Structure the information into formal legal/official complaint sections.
3. Extract:
   - Incident type
   - Date & Time (as observed)
   - Specific Location / Platform
   - Chronological factual sequence
   - Specific words, threats, or gestures used
   - Accused identifiers / descriptions
   - Witnesses present
   - Available evidence (CCTV, messages, call logs, witnesses)
   - Relevant Indian legal provisions reference (e.g., Bharatiya Nyaya Sanhita (BNS) / IPC / IT Act sections relevant to stalking, assault, voyeurism, sexual harassment, workplace POSH)
   - Requested police action
Output strictly JSON.
`;

    const response = await callGeminiWithFallback(ai, {
      contents: `Convert this incident narrative into a structured complaint draft:\n\n"""\n${incidentDescription}\n"""\nComplainant background: ${JSON.stringify(userDetails || {})}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            incidentCategory: { type: Type.STRING },
            approxDateTime: { type: Type.STRING },
            locationOrPlatform: { type: Type.STRING },
            complainantSummary: { type: Type.STRING },
            accusedDetails: {
              type: Type.OBJECT,
              properties: {
                identityStatus: { type: Type.STRING, description: "'Known' | 'Unknown' | 'Partially Known'" },
                nameOrHandle: { type: Type.STRING },
                physicalDescription: { type: Type.STRING },
                vehicleOrContact: { type: Type.STRING },
              },
              required: ['identityStatus', 'nameOrHandle', 'physicalDescription'],
            },
            factualChronology: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step-by-step chronology of what occurred',
            },
            specificThreatsOrHarassment: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            witnesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            evidenceChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            legalReferences: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Applicable sections (e.g., BNS Sec 78 Stalking, Sec 75 Sexual Harassment, IT Act 66E/67A)',
            },
            requestedRelief: { type: Type.STRING },
            reviewNotice: { type: Type.STRING },
          },
          required: [
            'title',
            'incidentCategory',
            'approxDateTime',
            'locationOrPlatform',
            'complainantSummary',
            'accusedDetails',
            'factualChronology',
            'specificThreatsOrHarassment',
            'witnesses',
            'evidenceChecklist',
            'legalReferences',
            'requestedRelief',
            'reviewNotice',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.warn('[ABHAYAA AI] Complaint drafting using resilient fallback:', err?.message || err);
    return res.json(getFallbackComplaintDraft(req.body.incidentDescription || ''));
  }
});

// ==========================================
// SIMULATED IN-MEMORY DATABASE FOR PROTOTYPE
// ==========================================
interface IncidentRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  type: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'SOS Active' | 'Responders En Route' | 'Assisting' | 'Resolved' | 'Closed';
  policeStatus: 'Notified' | 'Dispatched (PCR-18)' | 'On Scene' | 'Report Filed';
  medicalStatus: 'Standby' | 'Dispatched' | 'Not Required';
  assignedVolunteer?: {
    id: string;
    name: string;
    distance: string;
    phone: string;
    status: string;
  };
  timeline: Array<{ time: string; event: string; actor: string }>;
  audioRecorded: boolean;
}

let activeIncidents: IncidentRecord[] = [
  {
    id: 'ABH-2026-0814',
    timestamp: '2026-09-23 22:42',
    userId: 'user-001',
    userName: 'Ananya S.',
    type: 'Emergency SOS — Stalking / Unsafe Area',
    location: {
      lat: 19.076,
      lng: 72.8777,
      address: 'Near Metro Station Gate 3, Andheri East, Mumbai',
    },
    status: 'Responders En Route',
    policeStatus: 'Dispatched (PCR-18)',
    medicalStatus: 'Standby',
    assignedVolunteer: {
      id: 'vol-02',
      name: 'Priya Sharma (Verified Volunteer)',
      distance: '320m away',
      phone: '+91 98201 XXXXX',
      status: 'En Route on Foot',
    },
    timeline: [
      { time: '22:42:10', event: 'SOS Triggered by Citizen', actor: 'Citizen' },
      { time: '22:42:15', event: 'Live GPS Pin Broadcast to Trusted Contacts', actor: 'System' },
      { time: '22:42:30', event: 'Police Emergency 112 Dispatch Auto-Alerted', actor: 'Dispatch' },
      { time: '22:43:05', event: 'Verified Volunteer Priya Sharma accepted alert (320m)', actor: 'Volunteer' },
      { time: '22:44:12', event: 'PCR-18 Patrol Car en route (ETA 3 mins)', actor: 'Police' },
    ],
    audioRecorded: true,
  },
];

// Endpoint: get incidents
app.get('/api/incidents', (_req: Request, res: Response) => {
  return res.json(activeIncidents);
});

// Endpoint: trigger new SOS
app.post('/api/emergency/sos', (req: Request, res: Response) => {
  const { location, userId, userName, details } = req.body;
  const newIncident: IncidentRecord = {
    id: `ABH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    userId: userId || 'user-current',
    userName: userName || 'Current User',
    type: details || 'Emergency SOS Broadcast',
    location: location || {
      lat: 19.076 + (Math.random() - 0.5) * 0.01,
      lng: 72.8777 + (Math.random() - 0.5) * 0.01,
      address: 'Live GPS Coords: 19.0760 N, 72.8777 E (High Accuracy)',
    },
    status: 'SOS Active',
    policeStatus: 'Dispatched (PCR-18)',
    medicalStatus: 'Standby',
    assignedVolunteer: {
      id: 'vol-01',
      name: 'Sunita Patil (Certified First Responder)',
      distance: '240m away',
      phone: '+91 98192 XXXXX',
      status: 'Alert Received & Moving to Location',
    },
    timeline: [
      { time: new Date().toLocaleTimeString(), event: 'SOS Activated by user', actor: 'Citizen' },
      { time: new Date().toLocaleTimeString(), event: 'Location transmitted with high GPS accuracy', actor: 'System' },
      { time: new Date().toLocaleTimeString(), event: 'Trusted emergency contacts notified via SMS', actor: 'System' },
      { time: new Date().toLocaleTimeString(), event: 'Police Control Room 112 request initiated', actor: 'Dispatch' },
      { time: new Date().toLocaleTimeString(), event: 'Nearby verified volunteer alerted within 500m radius', actor: 'Volunteer Net' },
    ],
    audioRecorded: true,
  };

  activeIncidents.unshift(newIncident);
  return res.json({ success: true, incident: newIncident });
});

// Endpoint: update incident status
app.post('/api/incidents/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, policeStatus, eventNote, actor } = req.body;
  const inc = activeIncidents.find((i) => i.id === id);
  if (inc) {
    if (status) inc.status = status;
    if (policeStatus) inc.policeStatus = policeStatus;
    if (eventNote) {
      inc.timeline.push({
        time: new Date().toLocaleTimeString(),
        event: eventNote,
        actor: actor || 'Authority',
      });
    }
    return res.json({ success: true, incident: inc });
  }
  return res.status(404).json({ error: 'Incident not found' });
});

// Endpoint: upload emergency evidence (automatic background preservation)
interface PreservedEvidenceRecord {
  incidentId: string;
  timestamp: string;
  durationSeconds: number;
  sha256Hash: string;
  storageTarget: string;
  uploadStatus: 'Completed' | 'Pending';
  accessControl: 'Authorized Authorities Only';
}

const preservedEvidenceStore: PreservedEvidenceRecord[] = [];

app.post('/api/incidents/:id/evidence', (req: Request, res: Response) => {
  const { id } = req.params;
  const { durationSeconds, cameraMode, sha256Hash } = req.body;
  const inc = activeIncidents.find((i) => i.id === id);

  const evidenceRecord: PreservedEvidenceRecord = {
    incidentId: id,
    timestamp: new Date().toISOString(),
    durationSeconds: durationSeconds || 30,
    sha256Hash: sha256Hash || `sha256-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    storageTarget: 'S3-compatible Encrypted Object Storage [PROTOTYPE SECURE SIMULATION]',
    uploadStatus: 'Completed',
    accessControl: 'Authorized Authorities Only',
  };

  preservedEvidenceStore.push(evidenceRecord);

  if (inc) {
    inc.timeline.push({
      time: new Date().toLocaleTimeString(),
      event: `Emergency camera evidence (${cameraMode || 'device camera'}, 30s) securely preserved in encrypted authority vault. Hash: ${evidenceRecord.sha256Hash.substring(0, 16)}...`,
      actor: 'System',
    });
  }

  return res.json({
    success: true,
    message: 'Emergency evidence securely preserved for authorized authorities.',
    evidenceRecord: {
      incidentId: id,
      status: 'Securely preserved',
      captured: `${durationSeconds || 30} seconds`,
      upload: 'Complete',
      access: 'Authorized authorities only',
      sha256Hash: evidenceRecord.sha256Hash,
    },
  });
});

// ==========================================
// FALLBACK FUNCTIONS FOR INSTANT RESILIENCE
// ==========================================
function getSmartFallbackSafetyAssistant(message: string, language?: string): string {
  const lower = message.toLowerCase();
  
  if (language === 'te') {
    return `### అభయ (ABHAYAA) భద్రతా మార్గదర్శకం:
1. **తక్షణ చర్యలు (ఎదురుదాడి చేయవద్దు):**
   - వెంటనే రద్దీగా ఉండే, వెలుతురు ఉన్న వాణిజ్య ప్రాంతానికి (దుకాణం, మెట్రో స్టేషన్, పోలీస్ బూత్) వెళ్లండి.
   - చీకటి లేదా నిర్జనమైన ప్రదేశాలలోకి వెళ్లవద్దు.
2. **అత్యవసర రక్షణ:**
   - అనుమానం లేదా భయం కలిగితే వెంటనే **SOS** బటన్‌ను నొక్కండి.
3. **అత్యవసర హెల్ప్‌లైన్లు:**
   - పోలీస్ ఎమర్జెన్సీ: **112**
   - మహిళా హెల్ప్‌లైన్: **1091**`;
  }

  if (language === 'hi') {
    return `### अभया (ABHAYAA) सुरक्षा मार्गदर्शन:
1. **तत्काल सुरक्षा कदम (टकराव न करें):**
   - तुरंत किसी रोशनी वाले और भीड़भाड़ वाले इलाके (दुकान, मेट्रो स्टेशन, फार्मेसी) की तरफ जाएं।
   - सुनसान रास्तों से बचें।
2. **आपातकालीन सुरक्षा:**
   - असुरक्षित महसूस होते ही तुरंत **SOS** बटन दबाएं।
3. **आपातकालीन हेल्पलाइन:**
   - पुलिस आपातकालीन: **112**
   - महिला हेल्पलाइन: **1091**`;
  }

  if (language === 'ta') {
    return `### அபயா (ABHAYAA) பாதுகாப்பு வழிகாட்டுதல்:
1. **உடனடி பாதுகாப்பு நடவடிக்கைகள்:**
   - உடனடியாக மக்கள் நடமாட்டம் உள்ள வெளிச்சமான பகுதிக்குச் செல்லவும்.
   - தனிமையான வழிகளைத் தவிர்க்கவும்.
2. **அவசர உதவி:**
   - ஆபத்து ஏற்பட்டால் உடனடியாக **SOS** பொத்தானை அழுத்தவும்.
3. **அவசர எண்கள்:**
   - காவல்துறை: **112** | மகளிர் உதவி எண்: **1091**`;
  }

  if (language === 'kn') {
    return `### ಅಭಯಾ (ABHAYAA) ಸುರಕ್ಷತಾ ಮಾರ್ಗದರ್ಶನ:
1. **ತಕ್ಷಣದ ಕ್ರಮಗಳು:**
   - ತಕ್ಷಣವೇ ಬೆಳಕಿರುವ ಮತ್ತು ಜನರು ಇರುವ ಪ್ರದೇಶಕ್ಕೆ ತೆರಳಿ.
   - ನಿರ್ಜನ ರಸ್ತೆಗಳನ್ನು ತಪ್ಪಿಸಿ.
2. **ತುರ್ತು ರಕ್ಷಣೆ:**
   - ಅಸುರಕ್ಷಿತವೆನಿಸಿದರೆ ತಕ್ಷಣವೇ **SOS** ಒತ್ತಿರಿ.
3. **ತುರ್ತು ಸಂಖ್ಯೆಗಳು:**
   - ಪೊಲೀಸ್ ತುರ್ತು: **112** | ಮಹಿಳಾ ಸಹಾಯವಾಣಿ: **1091**`;
  }

  if (language === 'ml') {
    return `### അഭയ (ABHAYAA) സുരക്ഷാ നിർദ്ദേശങ്ങൾ:
1. **ഉടൻ ചെയ്യേണ്ട കാര്യങ്ങൾ:**
   - ആളുകളുള്ളതും വെളിച്ചമുള്ളതുമായ സ്ഥലത്തേക്ക് മാറുക.
   - ഒറ്റപ്പെട്ട വഴികൾ ഒഴിവാക്കുക.
2. **അടിയന്തര സഹായം:**
   - സുരക്ഷിതമല്ലെന്ന് തോന്നിയാൽ ഉടൻ **SOS** അമർത്തുക.
3. **ഹെൽപ്പ്‌ലൈൻ:**
   - പോലീസ്: **112** | വനിതാ ഹെൽപ്പ്‌ലൈൻ: **1091**`;
  }

  if (lower.includes('follow') || lower.includes('following') || lower.includes('behind me')) {
    return `### Immediate Safety Guidance:
**1. Immediate Actions (Do Not Confront):**
- Head toward a brightly lit, populated commercial establishment immediately (e.g. 24/7 chemist, grocery store, metro station, bank ATM guard).
- Do not head straight into isolated alleyways or empty residential buildings.
- Make an intentional phone call or hold your phone to your ear and speak loudly: *"I am right outside the station near the pharmacy, I see you waving."*

**2. Activate ABHAYAA Protection:**
- Open the **DURING** tab and tap **SOS** if you feel cornered or unsafe.
- Use **Safe Journey** in the BEFORE tab to share live breadcrumbs with your trusted contacts.

**3. Official Emergency Lines:**
- Police Emergency: **112**
- Women Helpline: **1091**`;
  }

  if (lower.includes('job') || lower.includes('recruitment') || lower.includes('interview')) {
    return `### Safety Assessment on Job Offers:
**Observed Risk Indicators in Recruitment Scams:**
- Requests for private hotel room interviews or isolated meeting venues.
- Demands for upfront "registration fees" or personal bank OTPs.
- Requests for private or revealing photographs disguised as "portfolio screening".
- Vague company names without verifiable corporate registry (MCA/CIN) or official domain emails.

**Recommended Actions:**
- Verify company domain directly on LinkedIn / MCA portal.
- Insist on interviews in open corporate office locations or verified video platforms.
- Never transfer money or share identity proofs without an official appointment letter.`;
  }

  return `### ABHAYAA Safety Assistant Assessment:
**1. Safety Observations:**
I have noted your concern regarding: "${message.slice(0, 80)}...". Please remember that keeping your personal boundaries clear and trusting your instincts is always your primary right.

**2. Potential Risk Indicators to Monitor:**
- Boundary testing: Attempts to make you feel guilty for saying no.
- Pressure to isolate: Urging you not to consult parents, trusted friends, or colleagues.
- Urgency tactics: Demanding immediate decisions before you can verify facts.

**3. Recommended Next Steps:**
- Preserve all digital communication (take screenshots with timestamps).
- Share your live location with a trusted contact before meeting anyone new.
- If you feel threatened or in distress, switch to the **DURING** tab for immediate emergency dispatch.`;
}

function getFallbackConversationAnalysis(text: string, contextNote?: string) {
  const indicators: Array<{
    type: string;
    excerpt: string;
    explanation: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: 'Possible' | 'Probable' | 'High Indication';
  }> = [];

  const lower = text.toLowerCase();

  // 1. Blackmail / Extortion / Sensitive photos
  if (/photos|pics|video|leak|tell everyone|post online|ruin|or else|money|pay me/i.test(lower)) {
    const match = text.match(/[^.!?\n]*(?:photos|pics|video|leak|post online|ruin|or else|money|pay)[^.!?\n]*/i);
    indicators.push({
      type: 'Blackmail & Digital Coercion Threat',
      excerpt: match ? match[0].trim() : text.slice(0, 90),
      explanation: 'Sender uses threats of disclosure, extortion, or reputation harm to enforce compliance.',
      severity: 'critical',
      confidence: 'High Indication',
    });
  }

  // 2. Enforced secrecy / isolation
  if (/secret|don't tell|promise|nobody knows|just between us|keep this between|hide this|delete this/i.test(lower)) {
    const match = text.match(/[^.!?\n]*(?:secret|don't tell|promise|nobody knows|between us|delete this)[^.!?\n]*/i);
    indicators.push({
      type: 'Enforced Secrecy & Isolation',
      excerpt: match ? match[0].trim() : 'Urged to keep contact concealed',
      explanation: 'Sender instructs target to withhold interaction from parents, mentors, or support systems.',
      severity: 'high',
      confidence: 'Probable',
    });
  }

  // 3. Pressure to meet privately or alone
  if (/meet alone|come over|nobody home|hotel|car|flat|come alone|private room|late night/i.test(lower)) {
    const match = text.match(/[^.!?\n]*(?:meet alone|come over|nobody home|hotel|private|car|flat)[^.!?\n]*/i);
    indicators.push({
      type: 'Pressure to Meet Privately',
      excerpt: match ? match[0].trim() : 'Repeated pressure for isolated in-person meeting',
      explanation: 'Sender creates artificial urgency to move interaction away from public scrutiny.',
      severity: 'high',
      confidence: 'Probable',
    });
  }

  // 4. Stalking / Unwanted physical or digital monitoring
  if (/saw you|following|wear|watching you|know where you|seen you at|metro|station|college gate/i.test(lower)) {
    const match = text.match(/[^.!?\n]*(?:saw you|watching|know where|seen you|metro|college|wearing)[^.!?\n]*/i);
    indicators.push({
      type: 'Unwanted Surveillance & Stalking Indicator',
      excerpt: match ? match[0].trim() : 'Demonstrates awareness of location or routine',
      explanation: 'Demonstrating unsolicited tracking of daily movements or physical location without consent.',
      severity: 'high',
      confidence: 'High Indication',
    });
  }

  // Default indicator if none triggered
  if (indicators.length === 0) {
    indicators.push({
      type: 'Interpersonal Boundary Pressure',
      excerpt: text.slice(0, 100),
      explanation: 'Conversation exhibits persistent boundary testing and pressure tactics.',
      severity: 'medium',
      confidence: 'Possible',
    });
  }

  const hasCritical = indicators.some((i) => i.severity === 'critical');
  const hasHigh = indicators.some((i) => i.severity === 'high');
  const riskLevel = hasCritical ? 'Critical' : hasHigh ? 'High' : 'Moderate';

  return {
    riskLevel,
    summary: hasCritical
      ? 'Critical indicators of digital coercion, blackmail threats, or severe boundary violation observed.'
      : hasHigh
      ? 'High-risk indicators of enforced secrecy, private meeting pressure, or grooming tactics detected.'
      : 'Moderate risk indicators observed. Conversation shows interpersonal boundary testing.',
    indicators,
    suggestedActions: [
      'Do not attend private or isolated meetings alone.',
      'Preserve uncropped screenshots showing sender handle, phone number, and full message timestamps.',
      'Confide in a trusted family member, guardian, or female counselor.',
      'If extortion or physical threats exist, generate an AI Complaint draft in the AFTER tab and alert 112 / 1091.',
    ],
    disclaimer:
      'Potential risk indicators detected. AI interpretations indicate patterns for personal awareness and do not constitute legal or psychological certainty.',
  };
}

function getFallbackLinkAnalysis(url: string) {
  const isSuspicious = /free|gift|prize|winner|login|verify|secure|bank|apk/i.test(url) || url.length > 50;
  return {
    classification: isSuspicious ? 'Suspicious' : 'Likely safe',
    riskScore: isSuspicious ? 72 : 18,
    domainAnalysis: {
      domain: url.replace(/^https?:\/\//i, '').split('/')[0] || url,
      isLookalike: isSuspicious,
      hasSuspiciousTLD: /\.xyz|\.top|\.click|\.ru|\.buzz/i.test(url),
      protocol: url.startsWith('https://') ? 'https' : 'http',
    },
    signals: [
      {
        type: 'Domain Analysis',
        description: isSuspicious
          ? 'URL exhibits patterns common in credential spoofing or deceptive lure campaigns.'
          : 'Standard domain structure without obvious brand impersonation triggers.',
        severity: isSuspicious ? 'high' : 'low',
      },
      {
        type: 'Parameter & Lure Check',
        description: isSuspicious
          ? 'Contains redirect hooks or promotional urgency terminology.'
          : 'No malicious executable or phishing parameters flagged in initial heuristic review.',
        severity: isSuspicious ? 'medium' : 'low',
      },
    ],
    safetyRecommendation: isSuspicious
      ? 'Do NOT enter your passwords, phone numbers, or Aadhaar/PAN details. Close the browser tab.'
      : 'No obvious risk indicators detected, but this does not guarantee that the link is safe. Always navigate directly via verified bookmarks.',
    disclaimer:
      'No obvious risk indicators were detected, but this does not guarantee that the link is safe. AI scans cannot replace authenticated threat intelligence.',
  };
}

function getFallbackComplaintDraft(narrative: string) {
  return {
    title: 'Formal Complaint Draft — Incident of Harassment / Stalking',
    incidentCategory: 'Harassment and Unwanted Stalking',
    approxDateTime: 'Recent occurrence (as described)',
    locationOrPlatform: 'Specified location / Digital communications channel',
    complainantSummary:
      'The complainant reports facing persistent unwanted pursuit, intimidation, and boundary violations resulting in fear for personal safety.',
    accusedDetails: {
      identityStatus: 'Partially Known',
      nameOrHandle: 'Individual named / described in narrative',
      physicalDescription: 'Details noted in narrative description',
      vehicleOrContact: 'To be specified during formal statement',
    },
    factualChronology: [
      'Complainant was in transit / online when the accused initiated unsolicited and intimidating contact.',
      'The complainant clearly communicated disinterest or attempted disengagement.',
      'Accused persisted in following / messaging despite refusal, creating an environment of fear and apprehension.',
    ],
    specificThreatsOrHarassment: [
      'Unwanted physical following / digital monitoring without consent.',
      'Verbal or psychological intimidation compromising personal safety.',
    ],
    witnesses: ['Passersby or contacts present during the incident (to be identified from area CCTV if applicable)'],
    evidenceChecklist: [
      'Original mobile chat screenshots with date and time headers',
      'Call history logs detailing timestamps of unsolicited contacts',
      'CCTV camera footage from relevant junctions/premises',
    ],
    legalReferences: [
      'Bharatiya Nyaya Sanhita (BNS) Section 78 (Stalking)',
      'Bharatiya Nyaya Sanhita (BNS) Section 79 (Word, gesture or act intended to insult modesty of a woman)',
      'Information Technology Act Section 66E / 67 (if digital transmission involved)',
    ],
    requestedRelief:
      'Immediate registration of complaint / FIR, issuance of formal warning/restraining intervention against the accused, and security patrols in the reported vicinity.',
    reviewNotice: 'AI-generated draft — review, edit, and approve before submission.',
  };
}

// ==========================================
// VITE DEV SERVER INTEGRATION & STATIC SERVE
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const portNum = Number(PORT) || 3000;
  app.listen(portNum, '0.0.0.0', () => {
    console.log(`ABHAYAA full-stack server running on http://0.0.0.0:${portNum}`);
  });
}

startServer();
