import { useState, useEffect } from 'react';
import { safetyApi } from '../api/safetyApi';
import { useNotification } from '../contexts/NotificationContext';
import { Shield, Plus, Trash2, Phone, AlertTriangle, Check } from 'lucide-react';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const RELATIONSHIPS = ['Mother', 'Father', 'Sibling', 'Spouse', 'Friend', 'Other'];

export default function SafetyPage() {
  const { addToast } = useNotification();
  const [contacts, setContacts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSosConfirm, setShowSosConfirm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relationship: 'Friend' });
  const [saving, setSaving] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, s] = await Promise.all([safetyApi.getContacts(), safetyApi.getSettings()]);
        setContacts(Array.isArray(c) ? c : []);
        setSettings(s);
      } catch { addToast({ title: 'Load error', type: 'error' }); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const addContact = async () => {
    if (!contactForm.name || !contactForm.phone) { addToast({ title: 'Fill in name and phone', type: 'warning' }); return; }
    setSaving(true);
    try {
      const updated = [...contacts, { ...contactForm, id: Date.now() }];
      await safetyApi.updateContacts(updated);
      setContacts(updated);
      addToast({ title: 'Contact added', type: 'success' });
      setShowContactModal(false);
      setContactForm({ name: '', phone: '', relationship: 'Friend' });
    } catch { addToast({ title: 'Error', type: 'error' }); }
    finally { setSaving(false); }
  };

  const removeContact = async (id) => {
    const updated = contacts.filter((c) => c.id !== id);
    await safetyApi.updateContacts(updated);
    setContacts(updated);
  };

  const handleCheckIn = async (status) => {
    setCheckInStatus(status);
    await safetyApi.checkIn(status);
    addToast({ title: status === 'safe' ? '✅ Check-in recorded' : '⚠️ Check-in recorded', message: `Your status "${status}" has been noted.`, type: status === 'safe' ? 'success' : 'warning' });
  };

  const handleSOS = async () => {
    if (contacts.length === 0) {
      addToast({ title: 'No emergency contacts', message: 'Add emergency contacts before triggering SOS.', type: 'warning' });
      setShowSosConfirm(false);
      return;
    }
    try {
      const res = await safetyApi.triggerSOS();
      addToast({ title: res.success ? '🚨 SOS sent' : 'SOS Note', message: res.message, type: res.success ? 'error' : 'info' });
    } catch { addToast({ title: 'Error triggering SOS', type: 'error' }); }
    setShowSosConfirm(false);
  };

  const toggleAutoEscalation = async () => {
    if (!settings) return;
    const updated = { ...settings, autoEscalation: !settings.autoEscalation };
    await safetyApi.updateSettings(updated);
    setSettings(updated);
    addToast({ title: updated.autoEscalation ? 'Auto-escalation enabled' : 'Auto-escalation disabled', type: 'info' });
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="#dc2626" />
          </div>
          <div>
            <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 800 }}>Safety & Emergency</h1>
            <p style={{ color: '#64748b', fontSize: 13 }}>SOS · Emergency Contacts · Check-ins</p>
          </div>
        </div>
      </div>

      {/* Important disclaimer */}
      <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', marginBottom: 24 }}>
        <p style={{ color: '#fca5a5', fontSize: 13, lineHeight: 1.7, fontWeight: 500 }}>
          ⚠️ <strong>Important:</strong> ATHENA will NEVER automatically contact emergency contacts. SOS is triggered only by you, manually, through this page. Mood changes and app usage alone do not trigger SOS.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* SOS Button */}
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>SOS Alert</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>This will alert your emergency contacts immediately.</p>
          <button
            onClick={() => setShowSosConfirm(true)}
            className="sos-pulse"
            style={{
              width: 100, height: 100, borderRadius: '50%', cursor: 'pointer',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              border: '4px solid rgba(220,38,38,0.5)',
              color: 'white', fontSize: 28, fontWeight: 900,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 30px rgba(220,38,38,0.5)',
            }}
          >
            🆘
          </button>
          <p style={{ color: '#64748b', fontSize: 11 }}>Hold to confirm SOS</p>
        </div>

        {/* Check-in */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Safety Check-In</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Let ATHENA know you're safe — or that you need support.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { status: 'safe', label: "I'm safe ✅", color: '#4ade80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
              { status: 'returning_late', label: 'Returning late ⏰', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
              { status: 'need_support', label: 'I need support 💙', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
            ].map((opt) => (
              <button key={opt.status} onClick={() => handleCheckIn(opt.status)} style={{
                padding: '12px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, textAlign: 'left',
                background: checkInStatus === opt.status ? opt.bg : 'rgba(255,255,255,0.04)',
                border: `1px solid ${checkInStatus === opt.status ? opt.border : 'rgba(255,255,255,0.08)'}`,
                color: checkInStatus === opt.status ? opt.color : '#94a3b8', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                {opt.label}
                {checkInStatus === opt.status && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Emergency contacts */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700 }}>Emergency Contacts ({contacts.length}/3)</h2>
            {contacts.length < 3 && <button onClick={() => setShowContactModal(true)} className="athena-btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}><Plus size={12} /> Add</button>}
          </div>
          {contacts.length === 0 ? (
            <p style={{ color: '#475569', fontSize: 13 }}>No contacts added. Add up to 3 emergency contacts.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {contacts.map((c, idx) => (
                <div key={c.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {(c.name?.[0] || 'C').toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{c.name}</p>
                    <p style={{ color: '#94a3b8', fontSize: 12 }}>{c.phone} · {c.relationship}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`tel:${c.phone}`} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: 6, color: '#4ade80', display: 'flex', alignItems: 'center' }}><Phone size={13} /></a>
                    <button onClick={() => removeContact(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 6, display: 'flex' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto-escalation settings */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Auto-Escalation</h2>
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 16 }}>
            <p style={{ color: '#fde68a', fontSize: 12, lineHeight: 1.6 }}>⚠️ When enabled, ATHENA will contact your emergency contacts automatically if a check-in is missed. This only applies to check-ins YOU set up.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>Auto-Escalation</p>
              <p style={{ color: '#64748b', fontSize: 12 }}>Contact emergency contacts on missed check-in</p>
            </div>
            <button onClick={toggleAutoEscalation} style={{
              width: 46, height: 26, borderRadius: 100, border: 'none', cursor: 'pointer',
              background: settings?.autoEscalation ? '#dc2626' : 'rgba(255,255,255,0.1)',
              position: 'relative', transition: 'all 0.3s',
            }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 4, left: settings?.autoEscalation ? 24 : 4, transition: 'left 0.3s ease' }} />
            </button>
          </div>
        </div>
      </div>

      {/* SOS Confirm modal */}
      <Modal isOpen={showSosConfirm} onClose={() => setShowSosConfirm(false)} title="Confirm SOS" size="sm">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <AlertTriangle size={32} color="#dc2626" />
          </div>
          <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Send SOS Alert?</h3>
          <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            This will immediately alert your {contacts.length} emergency contact(s). Only confirm if you are in a genuine emergency situation.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => setShowSosConfirm(false)} className="athena-btn-secondary">Cancel</button>
            <button onClick={handleSOS} style={{
              background: 'linear-gradient(135deg, #dc2626, #991b1b)', border: 'none', borderRadius: 10,
              padding: '10px 24px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14,
            }}>
              🆘 Send SOS
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Contact modal */}
      <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title="Add Emergency Contact" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label className="athena-label">Name *</label><input className="athena-input" placeholder="Contact name" value={contactForm.name} onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="athena-label">Phone *</label><input className="athena-input" placeholder="+91 XXXXX XXXXX" value={contactForm.phone} onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))} /></div>
          <div>
            <label className="athena-label">Relationship</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {RELATIONSHIPS.map((r) => (
                <button key={r} onClick={() => setContactForm((p) => ({ ...p, relationship: r }))} style={{ padding: '5px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: contactForm.relationship === r ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${contactForm.relationship === r ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.08)'}`, color: contactForm.relationship === r ? '#dc2626' : '#94a3b8', transition: 'all 0.2s' }}>{r}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button onClick={() => setShowContactModal(false)} className="athena-btn-secondary">Cancel</button>
            <button onClick={addContact} disabled={saving} className="athena-btn-primary">{saving ? <LoadingSpinner size={16} /> : 'Add Contact'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
