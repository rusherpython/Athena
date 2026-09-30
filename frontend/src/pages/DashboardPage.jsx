import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { taskApi } from '../api/taskApi';
import { reminderApi } from '../api/reminderApi';
import { rewardsApi } from '../api/rewardsApi';
import { behaviorApi } from '../api/behaviorApi';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  MessageCircle, Shield, CheckSquare, Bell, Star,
  Brain, Zap, ChevronRight, AlertCircle, PawPrint,
  Dumbbell, TrendingUp, Smile, Meh, Frown,
} from 'lucide-react';

const MOOD_OPTIONS = [
  { icon: '😊', label: 'Good', value: 'good' },
  { icon: '😐', label: 'Okay', value: 'okay' },
  { icon: '😔', label: 'Not great', value: 'not_great' },
  { icon: '🆘', label: 'Need help', value: 'help' },
];

function QuickCard({ icon: Icon, iconColor, label, value, onClick, accent }) {
  return (
    <div
      className="glass-card"
      onClick={onClick}
      style={{ padding: '18px 20px', cursor: onClick ? 'pointer' : 'default', flex: 1, minWidth: 140 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: accent ? `rgba(${accent},0.1)` : 'var(--athena-accent-soft)',
          border: accent ? `1px solid rgba(${accent},0.2)` : '1px solid var(--athena-accent-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={17} color={iconColor || 'var(--athena-accent)'} />
        </div>
        <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <p style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800 }}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { addToast, addNotification } = useNotification();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState(null);

  // Derive daily goals from user's real tasks
  const dailyGoals = tasks.map((t) => ({
    id: t.id,
    text: t.title,
    done: t.status === 'completed',
  }));

  const name = user?.name || user?.personalInformation?.fullName || 'there';
  const firstName = name.split(' ')[0];

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const completedGoals = dailyGoals.filter((g) => g.done).length;
  const goalProgress = dailyGoals.length > 0 ? Math.round((completedGoals / dailyGoals.length) * 100) : 0;

  const upcomingReminders = reminders
    .filter((r) => r.status === 'pending')
    .sort((a, b) => a.time?.localeCompare(b.time))
    .slice(0, 3);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, r, rw, ins] = await Promise.all([
          taskApi.getTasks(),
          reminderApi.getReminders(),
          rewardsApi.getRewards(),
          behaviorApi.getInsights(),
        ]);
        setTasks(t);
        setReminders(r);
        setRewards(rw);
        setInsights(Array.isArray(ins) ? ins : []);
      } catch {
        addToast({ title: 'Load error', message: 'Some dashboard data could not be loaded.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMoodSelect = (m) => {
    setMood(m.value);
    if (m.value === 'help') {
      addNotification({ title: 'ATHENA is here for you 💙', message: "We noticed you might need support. Check in with ATHENA or reach out to someone you trust.", type: 'info' });
    }
    addToast({ title: 'Mood recorded', message: `Feeling ${m.label.toLowerCase()} — noted.`, type: 'success' });
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero greeting */}
      <div style={{
        background: 'linear-gradient(135deg, var(--athena-accent-soft), transparent)',
        border: '1px solid var(--athena-accent-border)',
        borderRadius: 20, padding: '24px 28px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Hello, <span style={{ color: 'var(--athena-accent-light)' }}>{firstName}</span> 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            {dailyGoals.length === 0
              ? "No goals for today"
              : completedGoals === dailyGoals.length
                ? "All goals done today — outstanding! 🎉"
                : `${completedGoals}/${dailyGoals.length} goals done · ${dailyGoals.length - completedGoals} remaining`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/chat')} className="athena-btn-primary">
            <MessageCircle size={15} /> Chat with ATHENA
          </button>
          <button
            onClick={() => navigate('/safety')}
            style={{
              background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
              borderRadius: 10, padding: '10px 18px', cursor: 'pointer', color: '#f87171',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700,
            }}
            className="sos-pulse"
          >
            <Shield size={15} /> SOS
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <QuickCard icon={CheckSquare} label="Tasks" value={`${completedTasks}/${totalTasks}`} onClick={() => navigate('/tasks')} />
        <QuickCard icon={Bell} label="Reminders" value={upcomingReminders.length} onClick={() => navigate('/reminders')} accent="59,130,246" iconColor="#60a5fa" />
        <QuickCard icon={Star} label="Points" value={rewards?.points ?? 0} onClick={() => navigate('/rewards')} accent="245,158,11" iconColor="#fbbf24" />
        <QuickCard icon={TrendingUp} label="Streak" value={`${rewards?.streak ?? 0}d 🔥`} accent="34,197,94" iconColor="#4ade80" />
      </div>

      {/* Daily goals + upcoming reminders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Goals */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700 }}>Today's Goals</h2>
            <span style={{ color: 'var(--athena-accent)', fontSize: 14, fontWeight: 800 }}>{goalProgress}%</span>
          </div>
          <ProgressBar value={goalProgress} showLabel={false} />
          {dailyGoals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 10 }}>No goals for today</p>
              <button onClick={() => navigate('/tasks')} className="athena-btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
                Add a task
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {dailyGoals.map((g) => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: g.done ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${g.done ? '#4ade80' : 'rgba(255,255,255,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {g.done && <span style={{ color: '#4ade80', fontSize: 10, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ color: g.done ? '#64748b' : '#f1f5f9', fontSize: 13, textDecoration: g.done ? 'line-through' : 'none' }}>{g.text}</span>
                </div>
              ))}
            </div>
          )}
          {dailyGoals.length > 0 && completedGoals === dailyGoals.length && (
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
              <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 600 }}>🎉 All goals completed! +50 points earned</p>
            </div>
          )}
        </div>

        {/* Reminders */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700 }}>Upcoming Reminders</h2>
            <button onClick={() => navigate('/reminders')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--athena-accent)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ChevronRight size={13} />
            </button>
          </div>
          {upcomingReminders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 10 }}>No reminders yet</p>
              <button onClick={() => navigate('/reminders')} className="athena-btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
                Set a reminder
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingReminders.map((r) => {
                const typeIcon = { medicine: '💊', exam: '📚', habit: '⚡', meeting: '👥', pet: '🐾', event: '📅' };
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 18 }}>{typeIcon[r.type] || '🔔'}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{r.title}</p>
                      <p style={{ color: '#64748b', fontSize: 11 }}>{r.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ATHENA insight + mood */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* AI Insight */}
        <div className="glass-card" style={{ padding: 22, background: 'linear-gradient(135deg, var(--athena-accent-soft), transparent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--athena-accent-soft)', border: '1px solid var(--athena-accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={16} color="var(--athena-accent)" />
            </div>
            <h2 style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 700 }}>ATHENA Insight</h2>
          </div>
          {insights.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {insights.slice(0, 2).map((ins, i) => (
                <p key={i} style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, borderLeft: '3px solid var(--athena-accent)' }}>
                  {ins}
                </p>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: 13, padding: '16px 0' }}>No insights yet. ATHENA is learning about your patterns.</p>
          )}
          <button onClick={() => navigate('/behavior')} className="athena-btn-secondary" style={{ marginTop: 14, fontSize: 12, padding: '7px 14px' }}>
            View My Twin <ChevronRight size={13} />
          </button>
        </div>

        {/* Mood check-in */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>How are you feeling?</h2>
          <p style={{ color: '#64748b', fontSize: 12, marginBottom: 14 }}>Your mood is just for you — ATHENA uses it to tailor support.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                onClick={() => handleMoodSelect(m)}
                style={{
                  padding: '12px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  background: mood === m.value ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${mood === m.value ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 22, display: 'block', marginBottom: 4 }}>{m.icon}</span>
                <span style={{ color: mood === m.value ? '#f1f5f9' : '#94a3b8', fontSize: 12, fontWeight: 500 }}>{m.label}</span>
              </button>
            ))}
          </div>
          {mood === 'help' && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p style={{ color: '#93c5fd', fontSize: 12 }}>💙 You're not alone. Chat with ATHENA or reach out to someone you trust.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tasks quick view */}
      <div className="glass-card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700 }}>Today's Tasks</h2>
          <button onClick={() => navigate('/tasks')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ChevronRight size={13} />
          </button>
        </div>
        {tasks.length === 0 ? (
          <p style={{ color: '#475569', fontSize: 13 }}>No tasks yet. <button onClick={() => navigate('/tasks')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 600 }}>Add one!</button></p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tasks.slice(0, 4).map((task) => {
              const priorityColors = { high: '#f87171', medium: '#fbbf24', low: '#4ade80' };
              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: task.status === 'completed' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${task.status === 'completed' ? '#4ade80' : 'rgba(255,255,255,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {task.status === 'completed' && <span style={{ color: '#4ade80', fontSize: 10, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: task.status === 'completed' ? '#64748b' : '#f1f5f9', fontSize: 13, fontWeight: 500, textDecoration: task.status === 'completed' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                    {task.deadline && <p style={{ color: '#475569', fontSize: 11 }}>Due {new Date(task.deadline).toLocaleDateString()}</p>}
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColors[task.priority] || '#94a3b8', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
