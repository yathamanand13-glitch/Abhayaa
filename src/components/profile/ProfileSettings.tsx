import React, { useState } from 'react';
import {
  User,
  Shield,
  PhoneCall,
  Mic,
  EyeOff,
  Lock,
  CheckCircle2,
  Camera,
  MapPin,
  Bell,
  Trash2,
  Plus,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
  FileText,
  HeartHandshake,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { EmergencyContact, AppMode, ComplaintDraft } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { LanguageCode } from '../../i18n/translations';
import { AiComplaintAssistant } from '../after/AiComplaintAssistant';
import { RecoverySupportDirectory } from '../after/RecoverySupportDirectory';
import { DevicePermissionsCard } from './DevicePermissionsCard';

const LanguageSelectorGrid: React.FC = () => {
  const { language, setLanguage, languages } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {languages.map((lang) => {
        const isSelected = language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
              isSelected
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-xs'
                : 'bg-stone-50 border-stone-200 hover:border-stone-300 hover:bg-stone-100/70'
            }`}
          >
            {isSelected && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            )}
            <div className="text-base font-bold text-stone-900 leading-tight">
              {lang.nativeName}
            </div>
            <div className="text-xs text-stone-500 font-medium mt-0.5">
              {lang.name}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-stone-400 uppercase">
              {isSelected ? (
                <span className="text-rose-700 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              ) : (
                <span>Tap to switch</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

interface ProfileSettingsProps {
  appMode: AppMode;
  onToggleDiscreet: () => void;
  safetyWord: string;
  onUpdateSafetyWord: (newWord: string) => void;
  contacts: EmergencyContact[];
  onUpdateContacts: (contacts: EmergencyContact[]) => void;
  onTestSafetyWord: () => void;
  onCaseSubmitted?: (draft: ComplaintDraft) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  appMode,
  onToggleDiscreet,
  safetyWord,
  onUpdateSafetyWord,
  contacts,
  onUpdateContacts,
  onTestSafetyWord,
  onCaseSubmitted,
}) => {
  const [userName, setUserName] = useState('Ananya Sen');
  const [userPhone, setUserPhone] = useState('+91 98200 12345');
  const [editingWord, setEditingWord] = useState(safetyWord);
  const [isEditingWord, setIsEditingWord] = useState(false);
  const [wordSaved, setWordSaved] = useState(false);

  // New contact modal / inline inputs
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('Family / Parent');

  // Reporting & Assistance toggle
  const [activeAssistTool, setActiveAssistTool] = useState<'none' | 'complaint' | 'directory' | 'resources'>('none');

  const handleSaveWord = () => {
    if (editingWord.trim()) {
      onUpdateSafetyWord(editingWord.trim().toUpperCase());
      setIsEditingWord(false);
      setWordSaved(true);
      setTimeout(() => setWordSaved(false), 2000);
    }
  };

  const handleAddContact = () => {
    if (newContactName && newContactPhone) {
      const newContact: EmergencyContact = {
        id: `c-${Date.now()}`,
        name: newContactName,
        phone: newContactPhone,
        relationship: newContactRel,
        isPrimary: contacts.length === 0,
      };
      onUpdateContacts([...contacts, newContact]);
      setNewContactName('');
      setNewContactPhone('');
      setIsAddingContact(false);
    }
  };

  const handleDeleteContact = (id: string) => {
    onUpdateContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Profile Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-700 to-amber-600 flex items-center justify-center text-white text-xl font-bold shadow-xs">
            {userName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">{userName}</h2>
            <p className="text-xs text-stone-500">{userPhone} · Andheri West, Mumbai</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Identity Protected · AES-256
              </span>
              <span className="text-[10px] font-medium text-stone-400">
                ABHAYAA Citizen ID: #ABH-9821
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onToggleDiscreet}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
            appMode === 'discreet'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
          }`}
        >
          <EyeOff className="w-4 h-4" />
          <span>{appMode === 'discreet' ? 'Exit Discreet Mode' : 'Switch to Discreet Mode'}</span>
        </button>
      </div>

      {/* LANGUAGE SELECTOR (REQUIREMENT 13 & 15: Profile -> Settings -> Language) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-sm">
              🌐
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Language / భాష / भाषा / மொழி / ಭಾಷೆ / ഭാഷ
              </h3>
              <p className="text-xs text-stone-500">
                Select your preferred language. All navigation, emergency alerts, safety instructions, and AI assistant will adapt instantly.
              </p>
            </div>
          </div>
        </div>

        <LanguageSelectorGrid />
      </div>

      {/* EMERGENCY SAFETY WORD CONFIGURATION (SECTION 15 & 6) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Mic className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Emergency Voice Safety Word
              </h3>
              <p className="text-xs text-stone-500">
                Spoken hotword trigger for hands-free emergency dispatch when you cannot reach the phone.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            Status: Configured & Active
          </span>
        </div>

        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs text-stone-500">Current Safety Word:</span>
              {isEditingWord ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingWord}
                    onChange={(e) => setEditingWord(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-sm font-mono font-bold text-stone-900 uppercase"
                    placeholder="e.g. ABHAYAA"
                  />
                  <button
                    onClick={handleSaveWord}
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black font-mono tracking-wider text-rose-700">
                    "{safetyWord}"
                  </span>
                  <button
                    onClick={() => {
                      setEditingWord(safetyWord);
                      setIsEditingWord(true);
                    }}
                    className="text-xs text-stone-500 hover:text-stone-900 underline cursor-pointer"
                  >
                    Change Phrase
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onTestSafetyWord}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              Test Spoken Safety Word Trigger
            </button>
          </div>

          <p className="text-[11px] text-stone-600 leading-relaxed">
            Choose a memorable, distinct word. When detected in an emergency context, ABHAYAA triggers immediate location broadcast, starts 30s dual-camera evidence recording, and summons verified responders.
          </p>
        </div>
      </div>

      {/* TRUSTED EMERGENCY CONTACTS CIRCLE */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Trusted Emergency Contacts ({contacts.length})
              </h3>
              <p className="text-xs text-stone-500">
                Notified instantly with your live GPS location and audio stream during SOS.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingContact(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Inline Add Contact Form */}
        {isAddingContact && (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 animate-fadeIn">
            <span className="text-xs font-bold text-stone-800 block">Add New Trusted Guardian</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Phone Number (+91)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
              />
              <select
                value={newContactRel}
                onChange={(e) => setNewContactRel(e.target.value)}
                className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
              >
                <option value="Family / Parent">Family / Parent</option>
                <option value="Sister / Sibling">Sister / Sibling</option>
                <option value="Trusted Friend">Trusted Friend</option>
                <option value="Hostel Warden / Mentor">Hostel Warden / Mentor</option>
                <option value="Spouse / Partner">Spouse / Partner</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setIsAddingContact(false)}
                className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                className="px-4 py-1.5 bg-stone-900 text-white font-bold rounded-xl text-xs hover:bg-stone-800 cursor-pointer"
              >
                Save Contact
              </button>
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="space-y-2.5">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-800">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-stone-900">{contact.name}</strong>
                    {contact.isPrimary && (
                      <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-semibold">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-500">
                    {contact.relationship} · {contact.phone}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteContact(contact.id)}
                className="p-2 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Remove contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* REAL DEVICE PERMISSIONS MANAGER */}
      <DevicePermissionsCard />

      {/* 9. REPORTING & ASSISTANCE */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Reporting & Assistance
              </h3>
              <p className="text-xs text-stone-500">
                AI complaint preparation, recovery directories, and legal rights.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons to toggle assistant tools */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveAssistTool(activeAssistTool === 'complaint' ? 'none' : 'complaint')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
              activeAssistTool === 'complaint'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-900">Prepare Complaint with AI</span>
              {activeAssistTool === 'complaint' ? <ChevronUp className="w-3.5 h-3.5 text-rose-600" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-400" />}
            </div>
            <p className="text-[11px] text-stone-500">
              Transform notes or incident accounts into a structured legal draft.
            </p>
          </button>

          <button
            onClick={() => setActiveAssistTool(activeAssistTool === 'directory' ? 'none' : 'directory')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
              activeAssistTool === 'directory'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-900">Support & Legal Directory</span>
              {activeAssistTool === 'directory' ? <ChevronUp className="w-3.5 h-3.5 text-emerald-600" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-400" />}
            </div>
            <p className="text-[11px] text-stone-500">
              One Stop Centres (Sakhi), legal aid, and trauma helplines.
            </p>
          </button>

          <button
            onClick={() => setActiveAssistTool(activeAssistTool === 'resources' ? 'none' : 'resources')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
              activeAssistTool === 'resources'
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-900">Safety Rights & Laws</span>
              {activeAssistTool === 'resources' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-400" />}
            </div>
            <p className="text-[11px] text-stone-500">
              BNS Sec 78/79, Zero FIR rights, and Cyber Crime Portal (1930).
            </p>
          </button>
        </div>

        {/* TOOL 1: PREPARE FORMAL COMPLAINT WITH AI */}
        {activeAssistTool === 'complaint' && (
          <div className="pt-2 space-y-3 animate-in fade-in duration-200">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">AI-generated draft — review carefully before submission.</strong>
                <span>
                  This tool assists with legal structuring and facts organization. It does not automatically accuse anyone or submit a complaint without your explicit verification and signature.
                </span>
              </div>
            </div>

            <AiComplaintAssistant
              onCaseSubmitted={(draft) => {
                if (onCaseSubmitted) onCaseSubmitted(draft);
              }}
            />
          </div>
        )}

        {/* TOOL 2: RECOVERY & LEGAL DIRECTORY */}
        {activeAssistTool === 'directory' && (
          <div className="pt-2 animate-in fade-in duration-200">
            <RecoverySupportDirectory />
          </div>
        )}

        {/* TOOL 3: SAFETY RIGHTS & LEGAL RESOURCES */}
        {activeAssistTool === 'resources' && (
          <div className="pt-2 space-y-3 text-xs animate-in fade-in duration-200">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <strong className="text-stone-900 block font-bold text-sm">
                1. Zero FIR Provision
              </strong>
              <p className="text-stone-600 leading-relaxed">
                Under Indian law, an FIR can be registered at ANY police station regardless of jurisdiction where the incident occurred. The police station cannot refuse to register the complaint; they must register a 'Zero FIR' and transfer it to the competent jurisdiction.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <strong className="text-stone-900 block font-bold text-sm">
                2. Bharatiya Nyaya Sanhita (BNS) Protections
              </strong>
              <ul className="list-disc list-inside space-y-1 text-stone-600">
                <li><strong>Section 78 (Stalking):</strong> Criminalizes physical or digital following, online monitoring, or unsolicited persistent contact.</li>
                <li><strong>Section 79 (Outraging Modesty):</strong> Penalizes words, gestures, sounds, or visual transmissions insulting the modesty of a woman.</li>
                <li><strong>Section 354:</strong> Non-bailable protections against assault or criminal force against women.</li>
              </ul>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
              <strong className="text-stone-900 block font-bold text-sm">
                3. National Cyber Crime Reporting Portal
              </strong>
              <p className="text-stone-600 leading-relaxed">
                For online harassment, morphed imagery, or non-consensual media sharing, report directly at <strong>cybercrime.gov.in</strong> or call the 24x7 National Helpline at <strong>1930</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECURITY & PRIVACY ARCHITECTURE NOTE (SECTION 16) */}
      <div className="bg-stone-900 text-stone-300 rounded-3xl p-6 border border-stone-800 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Security & Privacy Architecture
          </h3>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed">
          ABHAYAA handles sensitive evidence. In production architecture:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60">
            <strong className="text-white font-semibold block mb-0.5">Encrypted Evidence</strong>
            <span className="text-[11px] text-stone-400">
              Media is encrypted at rest using AES-256-GCM. Never shared publicly.
            </span>
          </div>

          <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60">
            <strong className="text-white font-semibold block mb-0.5">Protected Identity</strong>
            <span className="text-[11px] text-stone-400">
              Citizen spot reports protect reporter identity from public view.
            </span>
          </div>

          <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60">
            <strong className="text-white font-semibold block mb-0.5">Discreet Disguise</strong>
            <span className="text-[11px] text-stone-400">
              One-tap weather app facade protects user from snooping in hostile environments.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
