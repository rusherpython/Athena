import { useState, useEffect } from 'react';
import { rewardsApi } from '../api/rewardsApi';
import { useNotification } from '../contexts/NotificationContext';
import { Gift, Star, Zap, Trophy, AlertCircle } from 'lucide-react';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function RewardsPage() {
  const { addToast } = useNotification();
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redeeming, setRedeeming] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await rewardsApi.getRewards();
      setRewards(data);
    } catch (err) {
      console.error('Failed to load rewards:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Unable to load rewards.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRedeem = async (reward) => {
    if ((rewards?.points ?? 0) < reward.cost) {
      addToast({ title: 'Insufficient points', message: `You need ${reward.cost - (rewards?.points ?? 0)} more ATHENA points.`, type: 'warning' });
      return;
    }
    setRedeeming(reward.id);
    try {
      const res = await rewardsApi.redeemReward(reward.id);
      setRewards((prev) => ({ ...prev, points: prev.points - reward.cost }));
      addToast({ title: res.success ? '🎉 Reward redeemed!' : 'Notice', message: res.message, type: res.success ? 'success' : 'warning' });
    } catch (err) {
      console.error('Failed to redeem reward:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Redeem failed';
      addToast({ title: 'Error', message: detail, type: 'error' });
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return <EmptyState icon={AlertCircle} title="Load failed" message={error} action={load} />;

  const streakMultiplier = rewards?.streak >= 7 ? 2 : rewards?.streak >= 3 ? 1.5 : 1;

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gift size={22} color="#fbbf24" />
          </div>
          <div>
            <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 800 }}>Rewards</h1>
            <p style={{ color: '#64748b', fontSize: 13 }}>Earn points by completing tasks and habits</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '⭐', label: 'ATHENA Points', value: rewards?.points ?? 0, color: '#fbbf24' },
          { icon: '🔥', label: 'Day Streak', value: `${rewards?.streak ?? 0} days`, color: '#f87171' },
          { icon: '✅', label: 'Tasks Done', value: rewards?.tasksCompleted ?? 0, color: '#4ade80' },
          { icon: '🏆', label: 'Achievements', value: rewards?.achievements?.length ?? 0, color: '#a78bfa' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: '18px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>{stat.icon}</span>
            <p style={{ color: stat.color, fontSize: 22, fontWeight: 800 }}>{stat.value}</p>
            <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Streak info */}
      {rewards?.streak > 0 && (
        <div style={{ marginBottom: 24, padding: '16px 20px', borderRadius: 14, background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(220,38,38,0.06))', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ color: '#fde68a', fontWeight: 700 }}>🔥 {rewards.streak}-day streak!</p>
            <span style={{ color: '#fbbf24', fontSize: 13, fontWeight: 600 }}>{streakMultiplier}x points multiplier</span>
          </div>
          <ProgressBar value={rewards.streak} max={7} showLabel={false} color="amber" />
          <p style={{ color: '#64748b', fontSize: 11, marginTop: 6 }}>{Math.max(0, 7 - rewards.streak)} days to reach 7-day streak (2x multiplier)</p>
        </div>
      )}

      {/* Points earning guide */}
      <div className="glass-card" style={{ padding: 22, marginBottom: 24 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Earning Points</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { action: 'Complete a task', points: '+10', icon: '✅' },
            { action: 'Complete all daily goals', points: '+50', icon: '🎯' },
            { action: 'Log your mood', points: '+5', icon: '😊' },
            { action: 'Daily streak bonus', points: '+20', icon: '🔥' },
            { action: 'Log wellness data', points: '+15', icon: '❤️' },
            { action: 'Complete a habit', points: '+10', icon: '⚡' },
          ].map((item) => (
            <div key={item.action} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#94a3b8', fontSize: 12 }}>{item.action}</p>
                <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13 }}>{item.points}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      {rewards?.achievements?.length > 0 && (
        <div className="glass-card" style={{ padding: 22, marginBottom: 24 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 14 }}>🏆 Achievements</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {rewards.achievements.map((ach) => (
              <div key={ach.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)' }}>
                <span style={{ fontSize: 18 }}>{ach.icon}</span>
                <div>
                  <p style={{ color: '#a78bfa', fontWeight: 600, fontSize: 13 }}>{ach.title}</p>
                  <p style={{ color: '#64748b', fontSize: 11 }}>{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available rewards */}
      <div className="glass-card" style={{ padding: 22, marginBottom: 24 }}>
        <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 14 }}>🎁 Available Rewards</h2>
        {(!rewards?.available || rewards.available.length === 0) ? (
          <p style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No rewards available yet</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {rewards.available.map((reward) => {
              const canAfford = (rewards?.points ?? 0) >= reward.cost;
              return (
                <div key={reward.id} style={{ padding: '16px 18px', borderRadius: 12, background: canAfford ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${canAfford ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 28 }}>{reward.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Demo Reward</span>
                  </div>
                  <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{reward.title}</p>
                  <p style={{ color: '#64748b', fontSize: 12, marginBottom: 12 }}>{reward.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 14 }}>⭐ {reward.cost}</span>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford || redeeming === reward.id}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: canAfford ? 'pointer' : 'not-allowed',
                        background: canAfford ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${canAfford ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: canAfford ? '#fbbf24' : '#475569', transition: 'all 0.2s',
                      }}
                    >
                      {redeeming === reward.id ? '...' : canAfford ? 'Redeem' : 'Locked'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History */}
      {rewards?.history?.length > 0 && (
        <div className="glass-card" style={{ padding: 22 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Recent History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rewards.history.slice(0, 10).map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                <p style={{ color: '#94a3b8', fontSize: 13 }}>{h.action}</p>
                <span style={{ color: h.points > 0 ? '#4ade80' : '#f87171', fontWeight: 700, fontSize: 13 }}>{h.points > 0 ? '+' : ''}{h.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
