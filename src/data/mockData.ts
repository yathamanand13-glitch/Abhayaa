import {
  EmergencyContact,
  Volunteer,
  Incident,
  EvidenceItem,
  PublicReport,
  MissingPersonAlert,
  SafetyNewsItem,
  AwarenessModule,
} from '../types';

export const initialEmergencyContacts: EmergencyContact[] = [
  {
    id: 'c-01',
    name: 'Kavita Verma (Mother)',
    phone: '+91 98200 12345',
    relationship: 'Mother',
    isPrimary: true,
  },
  {
    id: 'c-02',
    name: 'Rohan Verma (Brother)',
    phone: '+91 98200 67890',
    relationship: 'Sibling',
    isPrimary: false,
  },
  {
    id: 'c-03',
    name: 'Sneha Patel (Roommate)',
    phone: '+91 98330 55443',
    relationship: 'Friend / Roommate',
    isPrimary: false,
  },
];

export const initialVolunteers: Volunteer[] = [
  {
    id: 'vol-01',
    name: 'Priya Sharma',
    area: 'Andheri West (Sector 4)',
    phone: '+91 98211 44552',
    verificationStatus: 'Verified (Govt ID + Police Clearance)',
    trainingBadge: 'Self-Defense & First Aid',
    availability: 'Available',
    distance: '320m away',
    completedAssists: 14,
    rating: 4.9,
  },
  {
    id: 'vol-02',
    name: 'Sunita Patil',
    area: 'Andheri East Station Link',
    phone: '+91 98192 77881',
    verificationStatus: 'Verified (Govt ID + Police Clearance)',
    trainingBadge: 'Crisis Intervention',
    availability: 'Assisting',
    distance: '650m away',
    completedAssists: 22,
    rating: 5.0,
  },
  {
    id: 'vol-03',
    name: 'Meenakshi Iyer',
    area: 'Juhu Tara Rd',
    phone: '+91 98670 11223',
    verificationStatus: 'Verified (Govt ID + Police Clearance)',
    trainingBadge: 'Community Escort',
    availability: 'Available',
    distance: '1.1 km away',
    completedAssists: 9,
    rating: 4.8,
  },
  {
    id: 'vol-04',
    name: 'Dr. Aruna Deshmukh',
    area: 'Vile Parle East',
    phone: '+91 98205 99001',
    verificationStatus: 'Verified (Govt ID + Police Clearance)',
    trainingBadge: 'Self-Defense & First Aid',
    availability: 'Offline',
    distance: '1.8 km away',
    completedAssists: 31,
    rating: 4.95,
  },
];

export const initialIncidents: Incident[] = [
  {
    id: 'ABH-2026-0814',
    timestamp: '2026-09-23 22:42',
    userId: 'user-001',
    userName: 'Ananya S.',
    type: 'Emergency SOS — Stalking / Hostile Following',
    location: {
      lat: 19.1136,
      lng: 72.8697,
      address: 'Near Metro Station Gate 3, Andheri East, Mumbai',
    },
    status: 'Responders En Route',
    policeStatus: 'Dispatched (PCR-18)',
    medicalStatus: 'Standby',
    assignedVolunteer: {
      id: 'vol-01',
      name: 'Priya Sharma (Verified Volunteer)',
      distance: '320m away',
      phone: '+91 98211 44552',
      status: 'On Foot (ETA 2 mins)',
    },
    timeline: [
      { time: '22:42:10', event: 'SOS Triggered by Citizen', actor: 'Citizen' },
      { time: '22:42:15', event: 'High-precision GPS Pin broadcast to trusted contacts', actor: 'System' },
      { time: '22:42:30', event: 'Police Emergency 112 PCR Van #18 auto-dispatched', actor: 'Police' },
      { time: '22:43:05', event: 'Verified Volunteer Priya Sharma accepted alert (320m)', actor: 'Volunteer' },
      { time: '22:44:12', event: 'PCR-18 Patrol vehicle confirmed visual tracking (ETA 3 mins)', actor: 'Police' },
    ],
    audioRecorded: true,
  },
  {
    id: 'ABH-2026-0792',
    timestamp: '2026-09-22 19:15',
    userId: 'user-042',
    userName: 'Ritu N.',
    type: 'Harassment on Public Bus 340',
    location: {
      lat: 19.0825,
      lng: 72.8856,
      address: 'Kurla Depot Junction, Mumbai',
    },
    status: 'Resolved',
    policeStatus: 'Report Filed',
    medicalStatus: 'Not Required',
    assignedVolunteer: {
      id: 'vol-02',
      name: 'Sunita Patil',
      distance: 'Escorted Safely',
      phone: '+91 98192 77881',
      status: 'Citizen escorted to police outpost',
    },
    timeline: [
      { time: '19:15:02', event: 'SOS activated inside moving bus', actor: 'Citizen' },
      { time: '19:16:30', event: 'Bus route tracked by police dispatch', actor: 'System' },
      { time: '19:22:00', event: 'Depot traffic police intercepted vehicle', actor: 'Police' },
      { time: '19:35:10', event: 'Volunteer Sunita Patil met citizen at station', actor: 'Volunteer' },
      { time: '19:50:00', event: 'Incident closed with formal warning issued to offender', actor: 'Authority' },
    ],
    audioRecorded: false,
  },
];

export const initialEvidenceItems: EvidenceItem[] = [
  {
    id: 'ev-01',
    incidentId: 'ABH-2026-0814',
    type: 'screenshot',
    title: 'Coercive Instagram Direct Messages from anonymous burner account',
    timestamp: '2026-09-23 21:15',
    description: 'Sender repeated my exact travel route and threatened disclosure if I blocked them.',
    hashPreview: 'SHA256: 8a7c4...b91e0',
    tamperNotice: 'Evidence metadata preserved. Timestamp and hash cryptographically logged.',
  },
  {
    id: 'ev-02',
    incidentId: 'ABH-2026-0814',
    type: 'audio',
    title: 'SOS Emergency Ambient Audio Capture (60s)',
    timestamp: '2026-09-23 22:42',
    description: 'Auto-recorded during SOS trigger capturing verbal threats and bike engine revving.',
    hashPreview: 'SHA256: 3d1f0...77a94',
    tamperNotice: 'Secure local prototype recording. Do not modify or trim file.',
  },
  {
    id: 'ev-03',
    incidentId: 'ABH-2026-0792',
    type: 'image',
    title: 'Photo of offender vehicle registration plate',
    timestamp: '2026-09-22 19:18',
    description: 'Clear photograph of motorcycle tail-light and number plate MH-02-CJ-XXXX.',
    hashPreview: 'SHA256: e55b9...4412c',
    tamperNotice: 'Cryptographically hashed and catalogued for police complaint docket.',
  },
];

export const initialPublicReports: PublicReport[] = [
  {
    id: 'PR-901',
    category: 'Eve Teasing / Stalking Spot',
    location: 'Subway Underpass connecting East and West, Bandra Station',
    timestamp: '2026-09-23 18:30',
    description: 'Group of 4 men blocking pedestrian ramp and passing aggressive lewd remarks to women commuters between 7 PM - 10 PM.',
    hasMedia: true,
    reporterIdentityPreference: 'Protected from Public (Visible to Authority only)',
    status: 'Verified',
    authorityNote: 'Beat Marshal 7 deployed for continuous evening surveillance.',
  },
  {
    id: 'PR-902',
    category: 'Poor Street Lighting',
    location: 'Behind Mithibai College lane, Vile Parle West',
    timestamp: '2026-09-22 21:00',
    description: 'Three consecutive street sodium vapor lights non-functional for past 2 weeks creating pitch-black 200m stretch.',
    hasMedia: false,
    reporterIdentityPreference: 'Protected from Public (Visible to Authority only)',
    status: 'Action Taken',
    authorityNote: 'BMC Electrical division ticket #BMC-9934 raised; temporary mobile mast light deployed.',
  },
  {
    id: 'PR-903',
    category: 'Public Transit Harassment',
    location: 'Shared Auto Stand outside Ghatkopar Metro Station',
    timestamp: '2026-09-23 09:15',
    description: 'Auto drivers refusing solo women passengers unless accompanied or overcharging excessively after dark.',
    hasMedia: true,
    reporterIdentityPreference: 'Completely Anonymous',
    status: 'Under Review',
    authorityNote: 'RTO squad notified for surprise inspection.',
  },
];

export const initialMissingPersonAlerts: MissingPersonAlert[] = [
  {
    id: 'MP-2026-104',
    caseNumber: 'CR-104/2026-ANDHERI',
    name: 'Pooja Ramesh Sawant',
    age: 19,
    lastSeenLocation: 'Near Bhavan’s College Campus, Munshi Nagar, Andheri West',
    lastSeenDate: '2026-09-21 16:30',
    physicalDescription: 'Height 5 ft 3 in, wheatish complexion, shoulder-length black hair, small scar on left wrist.',
    wearing: 'Blue denim jacket, black jeans, white sneakers, carrying maroon backpack.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    issuingAuthority: 'Mumbai Police Special Juvenile & Missing Persons Unit',
    status: 'Active Alert',
    sightingsCount: 3,
  },
  {
    id: 'MP-2026-098',
    caseNumber: 'CR-098/2026-BANDRA',
    name: 'Shreya D. Kulkarni',
    age: 15,
    lastSeenLocation: 'Bandra Terminus Platform 4, Mumbai',
    lastSeenDate: '2026-09-20 11:00',
    physicalDescription: 'Height 5 ft 1 in, fair complexion, wears thin silver spectacles.',
    wearing: 'Green kurti with white leggings, brown flat sandals.',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    issuingAuthority: 'Government Railway Police (GRP) Bandra Division',
    status: 'Under Investigation',
    sightingsCount: 7,
  },
];

export const initialSafetyNews: SafetyNewsItem[] = [
  {
    id: 'sn-01',
    title: 'Night Escort & Pink Patrol Intensified at 14 Suburban Metro Stations',
    category: 'Police Advisory',
    source: 'City Police Commissionerate (Women Safety Cell)',
    date: '2026-09-23',
    area: 'Greater Mumbai Metro Corridors 2A & 7',
    status: 'Confirmed',
    summary: 'Dedicated female police marshals deployed from 8:00 PM to 1:00 AM at all key interchange stations.',
    content:
      'Following commuter safety audits, the city administration has launched dedicated Pink Patrol squads equipped with body-worn cameras and direct SOS dispatch link at 14 identified transit hubs. Women traveling alone after 9 PM may also request escorted walking to the auto-rickshaw bay by approaching the station helpdesk.',
    isDemo: true,
  },
  {
    id: 'sn-02',
    title: 'Advisory: Fake "Part-time Influencer & Modeling" Recruitment Scam Targeting Students',
    category: 'Safety Alert',
    source: 'Cyber Crime Investigation Department',
    date: '2026-09-22',
    area: 'Statewide Digital Advisory',
    status: 'Confirmed',
    summary: 'Scammers operating via fake Telegram channels demanding video introductions and upfront caution deposits.',
    content:
      'The Cyber Division has issued a public warning regarding fraudulent agencies posing as well-known talent agencies. Victims are lured with promises of work-from-home brand promotions, then pressured into sending private photographs or transferring registration fees. Verified recruitment agencies NEVER demand upfront deposits.',
    isDemo: true,
  },
  {
    id: 'sn-03',
    title: 'Sakhi One-Stop Crisis Center Expands 24/7 Legal and Trauma Psychological Aid',
    category: 'Government Initiative',
    source: 'Ministry of Women & Child Development',
    date: '2026-09-20',
    area: 'District Civil Hospital Campus',
    status: 'Confirmed',
    summary: 'Integrated medical, legal, police facilitation, and psycho-social counseling under a single roof.',
    content:
      'The Sakhi One-Stop Center provides immediate holistic assistance to women affected by violence, harassment, or domestic coercion. Walk-in and emergency referral services are open 24x7 with complete confidentiality guarantees.',
    isDemo: true,
  },
];

export const initialAwarenessModules: AwarenessModule[] = [
  {
    id: 'aw-01',
    title: 'De-coding Digital Grooming & Online Manipulation',
    category: 'Grooming & Coercion',
    readTime: '4 min read',
    summary: 'Recognize the 5 systematic stages used by online predators and manipulative partners.',
    takeaways: [
      'Stage 1: Flattery and rapid intimacy ("Nobody understands you like I do").',
      'Stage 2: Boundary testing through small favors or subtle personal questions.',
      'Stage 3: Isolation from friends and parents ("They don’t want us to be close").',
      'Stage 4: Secret keeping ("Don’t show this conversation to anyone, it’s our secret").',
      'Stage 5: Coercion & emotional blackmail ("If you really cared about me, you would send this").',
    ],
    quiz: {
      question: 'Which of the following is a classic indicator of emotional coercion?',
      options: [
        'Asking what time you finished your classes today.',
        'Demanding that you keep conversations hidden from your parents and friends.',
        'Inviting you to study in a crowded public university library.',
        'Suggesting you take an auto-rickshaw instead of walking alone late.',
      ],
      correctIndex: 1,
      explanation:
        'Pressure to enforce secrecy and cut off family or friends is a hallmark tactic of abusers attempting to isolate victims.',
    },
  },
  {
    id: 'aw-02',
    title: 'Stalking Laws & Your Rights Under Bharatiya Nyaya Sanhita (BNS)',
    category: 'Legal Rights & Laws',
    readTime: '5 min read',
    summary: 'Understanding legal provisions against physical following, cyber stalking, and persistent unwanted contact.',
    takeaways: [
      'Section 78 BNS strictly penalizes following a woman, contacting her despite clear disinterest, or monitoring her digital internet use.',
      'First conviction carries imprisonment up to 3 years and fine; second conviction up to 5 years.',
      'Zero FIR: A woman can file a police complaint at ANY police station regardless of jurisdictional boundary.',
      'Right to Privacy: A woman complainant’s identity and statement can be recorded by a woman police officer at her place of residence.',
    ],
    quiz: {
      question: 'What is a "Zero FIR"?',
      options: [
        'An FIR that incurs zero government filing charges.',
        'An FIR that can be registered at any police station regardless of where the crime occurred.',
        'An anonymous FIR filed without any complainant signature.',
        'An FIR filed exclusively by traffic marshals.',
      ],
      correctIndex: 1,
      explanation:
        'A Zero FIR can be lodged at any police station in India to avoid delay in medical exam or emergency investigation, which is then transferred to the jurisdictional police station.',
    },
  },
  {
    id: 'aw-03',
    title: 'Tactical Travel Safety & Personal Red Flags in Taxis/Autos',
    category: 'Street Safety',
    readTime: '3 min read',
    summary: 'Practical situational awareness protocols when riding solo in cabs, app taxis, and auto-rickshaws.',
    takeaways: [
      'Verify child-lock status before closing the rear passenger door.',
      'Always confirm vehicle license plate and driver photo before stepping in.',
      'Keep a fake call or live audio location link open with a family member.',
      'If the driver deviates from the designated GPS route and refuses to turn back, trigger SOS immediately.',
    ],
  },
];

// Preloaded realistic samples for 1-click testing
export const sampleConversations = [
  {
    label: 'Coercive Relationship & Secrecy Pressure',
    context: 'Messages from an acquaintance on WhatsApp after a mutual friend gathering',
    text: `Sender: "Hey, why didn't you reply to my message earlier? You were online."
You: "I was busy with college project, please don't monitor my online status."
Sender: "I only do it because I care about you more than anyone else does. Your friends don't actually get you like I do. Listen, I have something really important to tell you, but you MUST promise me you won't tell your roommate or parents. It's strictly between us."
You: "I don't keep secrets from my family."
Sender: "If you don't meet me alone at the cafe near the highway tonight at 9 PM, I might share those photos from the party with your college group. Don't test me, just come alone and don't make a scene."`,
  },
  {
    label: 'Suspicious "Work-from-Home Modeling" Recruitment',
    context: 'Unsolicited DM received on Instagram from a profile claiming to be a talent casting scout',
    text: `Sender: "Hi Ananya! I am scouting talent for an upcoming youth lifestyle apparel campaign. You have an amazing presence! Remuneration is ₹45,000 for a single 4-hour shoot."
You: "Which agency is this? Do you have an official website or company registration?"
Sender: "We are an elite boutique agency. Due to client NDA, the portfolio shortlist is confidential. To fast-track your casting, please send 3 full-length outfit photos in private casual wear without watermarks to this personal WhatsApp number right now."
You: "I only submit via verified corporate email or at your physical office."
Sender: "If you hesitate, this spot will go to someone else in 15 minutes. We don't have time for formal bureaucratics. Don't lose this once-in-a-lifetime career chance, send the photos now and don't discuss with your parents yet until you get selected."`,
  },
  {
    label: 'Persistent Unwanted DM / Boundary Crossing',
    context: 'Repeated messages from a college senior who was previously told to stop contacting',
    text: `Sender: "Saw you wearing the black kurti today at the library 2nd floor window. You looked pretty."
You: "I have told you multiple times to stop following me and stop texting. Please leave me alone."
Sender: "Come on, why are you being so rude? I know you actually like the attention. I know which bus you take back home at 6:15 PM every Tuesday. You can't avoid me forever, let's just grab coffee and talk."`,
  },
];

export const sampleLinks = [
  {
    label: 'Phishing Prize & Identity Harvest Link',
    url: 'https://women-empowerment-free-laptop-scheme2026.xyz/claim-grant?id=8831',
    description: 'Suspicious domain claiming free government laptop grants for women, asking for OTP and Aadhaar.',
  },
  {
    label: 'Spoofed Job Portal Login',
    url: 'https://careers-indigo-airlines-internship.secure-portal-auth.live/login',
    description: 'Lookalike domain imitating commercial airline flight-attendant recruitment.',
  },
  {
    label: 'Legitimate Official Portal',
    url: 'https://ncw.nic.in/helplines',
    description: 'Official National Commission for Women (NCW) Government of India website.',
  },
];

export const sampleComplaintDescriptions = [
  {
    label: 'Repeated Following & Bus Stop Harassment',
    text: `Yesterday evening around 8:15 PM, while I was walking back from the D.N. Nagar Metro station towards my hostel on Link Road, an unknown man in his late 20s riding a black Pulsar motorcycle without a front number plate started tailing me slowly. He kept honking, blocking my walking path, and making sexually suggestive gestures and comments asking me to get on his bike. When I tried to take shelter near a chemist shop, he waited across the street for nearly 20 minutes staring at me until a shopkeeper noticed and yelled at him, after which he sped away towards J.P. Road. I felt terrified and feared for my physical safety. The chemist shop has outdoor CCTV cameras that clearly captured the motorcycle and the individual's face.`,
  },
  {
    label: 'Online Threat & Blackmail Attempt',
    text: `For the past 4 days, an unknown person operating the Instagram account @rider_akash_99 has been sending me abusive voice notes and threatening to morph my social media photos and circulate them to my college professors and family unless I pay ₹20,000 via UPI. I had blocked his previous account, but he created this new one and messaged my sister as well. I have saved all chat screenshots, audio notes, and the UPI ID provided by him.`,
  },
];
