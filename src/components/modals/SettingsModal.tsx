import React, { useState } from 'react';
import {
  X,
  Users,
  Shield,
  EyeOff,
  UserCheck,
  Plus,
  Trash2,
  Check,
  Phone,
  Lock,
} from 'lucide-react';
import { EmergencyContact, UserRole, AppMode } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: EmergencyContact[];
  onAddContact: (contact: EmergencyContact) => void;
  onDeleteContact: (id: string) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onAddContact,
  onDeleteContact,
  userRole,
  onRoleChange,
  appMode,
  onModeChange,
}) => {
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('Parent');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    onAddContact({
      id: `c-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      relationship: newRelation,
      isPrimary: contacts.length === 0,
    });

    setNewName('');
    setNewPhone('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 border border-stone-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-stone-900">ABHAYAA Safety Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 1. Discreet Mode Toggle */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-stone-700" />
              <span className="text-xs font-bold text-stone-900">Discreet Application Identity</span>
            </div>
            <button
              onClick={() => onModeChange(appMode === 'safety' ? 'discreet' : 'safety')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                appMode === 'discreet'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              {appMode === 'discreet' ? 'Discreet Mode Active' : 'Switch to Weather Disguise'}
            </button>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            When enabled, ABHAYAA transforms into a functioning Weather forecast app to protect users living in surveillance environments or domestic distress.
          </p>
        </div>

        {/* 2. Role Simulation Switcher */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-800">
            Active System Role Simulation
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(
              [
                { id: 'citizen', label: 'Citizen / User' },
                { id: 'volunteer', label: 'Verified Volunteer' },
                { id: 'authority', label: 'Police Officer' },
                { id: 'medical', label: 'Medical Dispatch' },
              ] as const
            ).map((r) => (
              <button
                key={r.id}
                onClick={() => onRoleChange(r.id)}
                className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                  userRole === r.id
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Trusted Emergency Contacts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800">
              Trusted Emergency Contacts ({contacts.length})
            </span>
            <span className="text-[10px] text-stone-400">Notified immediately upon SOS</span>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <span>{c.name}</span>
                    {c.isPrimary && (
                      <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {c.relationship} · {c.phone}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteContact(c.id)}
                  className="text-stone-300 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add contact form */}
          <form onSubmit={handleAdd} className="pt-2 border-t border-stone-100 space-y-2 text-xs">
            <span className="text-[11px] font-semibold text-stone-700 block">Add Trusted Contact</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Trusted Circle</span>
            </button>
          </form>
        </div>

        <div className="pt-2 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Save & Return
          </button>
        </div>
      </div>
    </div>
  );
};
