import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { userApi } from '../../api/userApi';
import { Lock, ChevronLeft, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PERMISSIONS = [
  { key: 'notifications', icon: '🔔', label: 'Push Notifications', description: 'Reminders, task alerts, and ATHENA check-ins.' },
  { key: 'healthInfo', icon: '❤️', label: 'Health Information', description: 'Stores wellness data to provide personalized support. Not shared externally.' },
  { key: 'spotify', icon: '🎵', label: 'Spotify Integration', description: 'Used as a lifestyle context signal only. Never for mood diagnosis.' },
  { key: 'youtube', icon: '📺', label: 'YouTube Activity', description: 'Activity patterns for personalization. Requires explicit backend connection.' },
  { key: 'safetyFeatures', icon: '🛡️', label: 'Safety Features', description: 'Enables SOS and check-in features. Automatic escalation must be separately configured.' },
];

export default function OnboardingPermissions() {
  const { data, updateData } = useOnboarding();
  const { updateUser } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const togglePermission = (key) => {
    updateData({ permissions: { ...data.permissions, [key]: !data.permissions[key] } });
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await userApi.saveOnboarding(data);
      await userApi.completeOnboarding();
      updateUser({ onboardingComplete: true });
      setDone(true);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      const data = err?.response?.data;
      let errorMsg = '';
      if (typeof data?.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data?.detail)) {
        errorMsg = data.detail.map((d) => d.msg || d.message).join(', ');
      } else if (data?.message) {
        errorMsg = data.message;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      addToast({
        title: 'Setup notice',
        message: errorMsg || 'Could not save your profile. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="#4ade80" />
        </div>
        <h1 style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Your digital twin is ready!</h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>ATHENA is learning about you. Taking you to your dashboard...</p>
        <div style={{ marginTop: 24 }}><LoadingSpinner size={24} /></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={20} color="#dc2626" />
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800 }}>Privacy & Permissions</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14 }}>ATHENA never requests permissions silently. Review and grant only what you're comfortable with.</p>
      </div>

      <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {PERMISSIONS.map((perm) => (
          <div key={perm.key} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{perm.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{perm.label}</p>
              <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>{perm.description}</p>
            </div>
            <button
              onClick={() => togglePermission(perm.key)}
              style={{
                width: 46, height: 26, borderRadius: 100, border: 'none', cursor: 'pointer',
                background: data.permissions[perm.key] ? '#dc2626' : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'all 0.3s', flexShrink: 0,
                boxShadow: data.permissions[perm.key] ? '0 0 10px rgba(220,38,38,0.4)' : 'none',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 4,
                left: data.permissions[perm.key] ? 24 : 4,
                transition: 'left 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.7 }}>
          Your data is stored locally and in your configured database. ATHENA does not share personal data with third parties. You can update these permissions at any time in Settings → Privacy.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <button onClick={() => navigate('/onboarding/safety')} className="athena-btn-secondary" disabled={loading}><ChevronLeft size={16} /> Back</button>
        <button onClick={handleFinish} disabled={loading} className="athena-btn-primary" style={{ minWidth: 160, justifyContent: 'center' }}>
          {loading ? <LoadingSpinner size={18} /> : '🚀 Launch ATHENA'}
        </button>
      </div>
    </div>
  );
}
