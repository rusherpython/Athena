import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { userApi } from '../api/userApi';
import { Settings, User, Shield, Bell, Palette, Info, LogOut, ChevronRight, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { DEMO_MODE } from '../api/apiClient';

const SECTIONS = [
  { id: 'account', icon: User, label: 'Account' },
  { id: 'privacy', icon: Shield, label: 'Privacy' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'about', icon: Info, label: 'About' },
];

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('account');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || user?.personalInformation?.fullName || '',
    email: user?.email || '',
  });

  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('athena_theme') || 'crimson';
  });

  const handleThemeChange = (themeId) => {
    setActiveTheme(themeId);
    localStorage.setItem('athena_theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    addToast({
      title: 'Theme updated',
      message: `Active theme set to ${themeId.charAt(0).toUpperCase() + themeId.slice(1)}.`,
      type: 'success',
    });
  };

  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userApi.updateProfile(form);
      updateUser(updated);
      addToast({ title: 'Settings saved', type: 'success' });
    } catch { addToast({ title: 'Save failed', type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={22} color="#dc2626" />
        </div>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 800 }}>Settings</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Manage your ATHENA account and preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'start' }}>
        {/* Section nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none',
                background: active ? 'rgba(220,38,38,0.1)' : 'transparent', cursor: 'pointer',
                color: active ? '#dc2626' : '#64748b', fontWeight: active ? 600 : 400, fontSize: 14,
                transition: 'all 0.2s', width: '100%', textAlign: 'left',
              }}>
                <Icon size={15} />
                {s.label}
              </button>
            );
          })}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: '#f87171', fontWeight: 500, fontSize: 14, transition: 'all 0.2s', width: '100%', textAlign: 'left' }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="glass-card" style={{ padding: 28, minWidth: 0 }}>
          {/* Account */}
          {activeSection === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700 }}>Account Information</h2>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #7f1d1d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 800 }}>
                  {(form.name || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>{form.name || 'User'}</p>
                  <p style={{ color: '#64748b', fontSize: 13 }}>{form.email}</p>
                </div>
              </div>
              <div><label className="athena-label">Full name</label><input className="athena-input" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
              <div><label className="athena-label">Email address</label><input type="email" className="athena-input" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
              {DEMO_MODE && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}><p style={{ color: '#fde68a', fontSize: 12 }}>⚡ Demo Mode — Profile changes are not persisted to a real database.</p></div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleSave} disabled={saving} className="athena-btn-primary">
                  {saving ? <LoadingSpinner size={16} /> : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeSection === 'privacy' && (
            <div>
              <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Privacy & Data</h2>
              {[
                { label: 'Data Storage', desc: 'Your data is stored only in your configured database and is never shared with third parties.', status: 'Secure' },
                { label: 'AI Processing', desc: 'Chat messages are processed by the configured LLM. No conversation data is retained by Antigravity.', status: 'On-device profile' },
                { label: 'Spotify Data', desc: 'Used as a lifestyle signal only. Never for mood diagnosis. Requires explicit connection.', status: 'Requires permission' },
                { label: 'Safety Features', desc: 'Emergency contacts are only notified when you manually trigger SOS or enable auto-escalation.', status: 'Manual only' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{item.label}</p>
                    <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.5, marginTop: 3 }}>{item.desc}</p>
                  </div>
                  <span style={{ color: '#4ade80', fontSize: 11, fontWeight: 600, background: 'rgba(34,197,94,0.1)', padding: '3px 8px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0 }}>{item.status}</span>
                </div>
              ))}
              <button onClick={() => navigate('/onboarding/permissions')} className="athena-btn-secondary" style={{ marginTop: 16, fontSize: 12 }}>
                Review All Permissions <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div>
              <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Notification Preferences</h2>
              {[
                { label: 'Task reminders', desc: 'Get notified before task deadlines', defaultOn: true },
                { label: 'Medicine reminders', desc: 'Daily medicine/supplement alerts', defaultOn: true },
                { label: 'ATHENA check-ins', desc: 'Periodic wellbeing check-ins', defaultOn: true },
                { label: 'Daily digest', desc: 'Morning overview of your day', defaultOn: false },
                { label: 'Streak alerts', desc: 'Celebrate your daily streaks', defaultOn: true },
                { label: 'Pet feeding times', desc: 'Reminders for your pet\'s schedule', defaultOn: true },
              ].map((item) => (
                <NotifToggle key={item.label} {...item} />
              ))}
            </div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div>
              <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Appearance</h2>
              <div style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--athena-accent-soft)', border: '1px solid var(--athena-accent-border)', marginBottom: 16 }}>
                <p style={{ color: 'var(--athena-accent-light)', fontSize: 13 }}>
                  Theme: <span style={{ fontWeight: 700 }}>{activeTheme.charAt(0).toUpperCase() + activeTheme.slice(1)}</span>
                </p>
                <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>
                  Select an accent theme below to instantly customize ATHENA's futuristic interface across all pages and components.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                {[
                  { id: 'crimson', name: 'Crimson', color: '#dc2626' },
                  { id: 'ocean', name: 'Ocean', color: '#0ea5e9' },
                  { id: 'emerald', name: 'Emerald', color: '#10b981' },
                  { id: 'violet', name: 'Violet', color: '#9333ea' },
                ].map((theme) => {
                  const isActive = activeTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      style={{
                        padding: '16px 14px',
                        borderRadius: 12,
                        background: isActive ? `${theme.color}15` : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${isActive ? theme.color : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? `0 0 16px ${theme.color}40` : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          background: theme.color,
                          margin: '0 auto 8px',
                          boxShadow: isActive ? `0 0 12px ${theme.color}88` : 'none',
                        }}
                      />
                      <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{theme.name}</p>
                      {isActive ? (
                        <p style={{ color: theme.color, fontSize: 11, fontWeight: 700, marginTop: 4 }}>Active</p>
                      ) : (
                        <p style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>Click to apply</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* About */}
          {activeSection === 'about' && (
            <div>
              <h2 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 18 }}>About ATHENA</h2>
              <div style={{ display: 'flex', flex: 'column', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Product', value: 'ATHENA — HumanTwin AI' },
                  { label: 'Event', value: 'GATEWAYS 2026 Hackathon' },
                  { label: 'Domain', value: 'Personal Productivity & Lifestyle' },
                  { label: 'Version', value: '1.0.0-alpha' },
                  { label: 'Frontend', value: 'React + Vite + Tailwind CSS v4' },
                  { label: 'Backend', value: 'FastAPI + MongoDB' },
                  { label: 'AI Architecture', value: '7-agent orchestration system' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#64748b', fontSize: 13 }}>{label}</span>
                    <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
                <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', marginTop: 4 }}>
                  <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>
                    ATHENA is an evolving personal digital twin that learns from your routines, preferences, hobbies, habits, productivity patterns, and lifestyle to become a truly personalized AI companion.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotifToggle({ label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <p style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 500 }}>{label}</p>
        <p style={{ color: '#64748b', fontSize: 12 }}>{desc}</p>
      </div>
      <button onClick={() => setOn(!on)} style={{ width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', background: on ? '#dc2626' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'all 0.3s', flexShrink: 0, marginLeft: 16 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 4, left: on ? 24 : 4, transition: 'left 0.3s ease' }} />
      </button>
    </div>
  );
}
