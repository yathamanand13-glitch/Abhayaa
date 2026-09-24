export type UserRole = 'citizen' | 'volunteer' | 'medical' | 'admin' | 'authority';

export type AppMode = 'safety' | 'discreet';

export type NavigationTab = 'home' | 'safety' | 'map' | 'community' | 'profile';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface Volunteer {
  id: string;
  name: string;
  avatar?: string;
  area: string;
  phone: string;
  verificationStatus: 'Verified (Govt ID + Police Clearance)' | 'Pending Verification';
  trainingBadge: 'Self-Defense & First Aid' | 'Crisis Intervention' | 'Community Escort';
  availability: 'Available' | 'Assisting' | 'Offline';
  distance: string;
  completedAssists: number;
  rating: number;
}

export interface IncidentTimelineEvent {
  time: string;
  event: string;
  actor: 'Citizen' | 'System' | 'Police' | 'Volunteer' | 'Medical' | 'Authority';
}

export interface Incident {
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
  policeStatus: 'Notified' | 'Dispatched (PCR-18)' | 'Dispatched (PCR-18 En Route)' | 'On Scene' | 'Report Filed';
  medicalStatus: 'Standby' | 'Dispatched' | 'Not Required';
  assignedVolunteer?: {
    id: string;
    name: string;
    distance: string;
    phone: string;
    status: string;
  };
  timeline: IncidentTimelineEvent[];
  audioRecorded: boolean;
  cameraEvidenceCaptured?: boolean;
  cameraCaptureProgress?: number;
  captureDetails?: {
    frontCameraStatus: string;
    rearCameraStatus: string;
    durationSeconds: number;
    mediaHash: string;
  };
}

export interface EvidenceItem {
  id: string;
  incidentId?: string;
  type: 'image' | 'audio' | 'screenshot' | 'chat_export' | 'url' | 'document' | 'note';
  title: string;
  timestamp: string;
  description: string;
  fileReference?: string;
  hashPreview: string;
  tamperNotice: string;
}

export interface ComplaintDraft {
  title: string;
  incidentCategory: string;
  approxDateTime: string;
  locationOrPlatform: string;
  complainantSummary: string;
  accusedDetails: {
    identityStatus: string;
    nameOrHandle: string;
    physicalDescription: string;
    vehicleOrContact?: string;
  };
  factualChronology: string[];
  specificThreatsOrHarassment: string[];
  witnesses: string[];
  evidenceChecklist: string[];
  legalReferences: string[];
  requestedRelief: string;
  reviewNotice: string;
}

export interface PublicReport {
  id: string;
  category: 'Eve Teasing / Stalking Spot' | 'Poor Street Lighting' | 'Suspicious Gathering' | 'Public Transit Harassment' | 'Other Hazard';
  location: string;
  timestamp: string;
  description: string;
  hasMedia: boolean;
  reporterIdentityPreference: 'Protected from Public (Visible to Authority only)' | 'Completely Anonymous';
  status: 'Received' | 'Under Review' | 'Verified' | 'Patrol Dispatched' | 'Action Taken';
  authorityNote?: string;
}

export interface MissingPersonAlert {
  id: string;
  caseNumber: string;
  name: string;
  age: number;
  lastSeenLocation: string;
  lastSeenDate: string;
  physicalDescription: string;
  wearing: string;
  photoUrl: string;
  issuingAuthority: string;
  status: 'Active Alert' | 'Located / Safe' | 'Under Investigation';
  sightingsCount: number;
}

export interface SightingSubmission {
  id: string;
  missingPersonId: string;
  reportedAt: string;
  location: string;
  details: string;
  reporterContactProtected: string;
  status: 'Pending Verification' | 'Verified Relevant' | 'Discarded';
}

export interface SafetyNewsItem {
  id: string;
  title: string;
  category: 'Safety Alert' | 'Police Advisory' | 'Public Awareness' | 'Government Initiative';
  source: string;
  date: string;
  area: string;
  status: 'Confirmed' | 'Reported' | 'Under Investigation' | 'Resolved';
  summary: string;
  content: string;
  isDemo: true;
}

export interface AwarenessModule {
  id: string;
  title: string;
  category: 'Online & Cyber' | 'Grooming & Coercion' | 'Street Safety' | 'Legal Rights & Laws';
  readTime: string;
  summary: string;
  takeaways: string[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}
