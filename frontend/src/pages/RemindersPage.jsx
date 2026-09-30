import { useState, useEffect } from 'react';
import { reminderApi } from '../api/reminderApi';
import { useNotification } from '../contexts/NotificationContext';
import { Bell, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const REMINDER_TYPES = [
  { value: 'medicine', label: '💊 Medicine', color: 'red' },
  { value: 'exam', label: '📚 Exam', color: 'amber' },
  { value: 'meeting', label: '👥 Meeting', color: 'blue' },
  { value: 'event', label: '📅 Event', color: 'purple' },
  { value: 'habit', label: '⚡ Habit', color: 'green' },
  { value: 'workout', label: '🏋️ Workout', color: 'green' },
  { value: 'pet', label: '🐾 Pet', color: 'amber' },
  { value: 'period', label: '🌸 Period', color: 'red' },
  { value: 'family', label: '👨‍👩‍👧 Family', color: 'blue' },
  { value: 'custom', label: '🔔 Custom', color: 'purple' },
];
const REPEAT_OPTIONS = ['none', 'daily', 'weekly', 'monthly'];
const EMPTY_FORM = { title: '', type: 'custom', date: '', time: '', repeat: 'none', status: 'pending' };

export default function RemindersPage() {
  const { addToast } = useNotification();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await reminderApi.getReminders();
      setReminders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Unable to load reminders.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.title.trim()) {
      addToast({ title: 'Missing title', message: 'Please enter a reminder title.', type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      let remind_at;
      if (form.date && form.time) {
        remind_at = `${form.date}T${form.time}:00`;
      } else if (form.date) {
        remind_at = `${form.date}T09:00:00`;
      } else {
        remind_at = new Date().toISOString();
      }

      const payload = {
        ...form,
        title: form.title.trim(),
        remind_at,
        description: form.type || 'custom',
      };

      const created = await reminderApi.createReminder(payload);
      setReminders((prev) => [created, ...prev]);
      addToast({ title: 'Reminder set!', message: `"${payload.title}" has been saved.`, type: 'success' });
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error('Failed to save reminder:', err);
      const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Could not save reminder';
      addToast({
        title: 'Could not save reminder',
        message: typeof detail === 'string' ? detail : JSON.stringify(detail),
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await reminderApi.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      addToast({ title: 'Reminder removed', type: 'info' });
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Failed to delete reminder';
      addToast({ title: 'Delete failed', message: detail, type: 'error' });
    }
  };

  const handleMarkDone = async (r) => {
    const newStatus = r.status === 'completed' ? 'pending' : 'completed';
    try {
      await reminderApi.updateReminder(r.id, { status: newStatus, completed: newStatus === 'completed' });
      setReminders((prev) => prev.map((rem) => rem.id === r.id ? { ...rem, status: newStatus, completed: newStatus === 'completed' } : rem));
    } catch (err) {
      console.error('Failed to update reminder:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Failed to update reminder';
      addToast({ title: 'Update failed', message: detail, type: 'error' });
    }
  };

  const filtered = filterType === 'all' ? reminders : reminders.filter((r) => r.type === filterType);
  const pending = filtered.filter((r) => r.status === 'pending');
  const done = filtered.filter((r) => r.status === 'completed');

  const typeInfo = (type) => REMINDER_TYPES.find((t) => t.value === type) || REMINDER_TYPES[REMINDER_TYPES.length - 1];

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 800 }}>Reminders</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>{pending.length} pending · {done.length} done</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }} className="athena-btn-primary"><Plus size={15} /> New Reminder</button>
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        <button onClick={() => setFilterType('all')} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, cursor: 'pointer', background: filterType === 'all' ? 'var(--athena-accent-soft)' : 'rgba(255,255,255,0.05)', border: `1px solid ${filterType === 'all' ? 'var(--athena-accent-border)' : 'rgba(255,255,255,0.1)'}`, color: filterType === 'all' ? 'var(--athena-accent-light)' : '#94a3b8', transition: 'all 0.2s' }}>All</button>
        {REMINDER_TYPES.map((t) => (
          <button key={t.value} onClick={() => setFilterType(t.value)} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, cursor: 'pointer', background: filterType === t.value ? 'var(--athena-accent-soft)' : 'rgba(255,255,255,0.05)', border: `1px solid ${filterType === t.value ? 'var(--athena-accent-border)' : 'rgba(255,255,255,0.1)'}`, color: filterType === t.value ? 'var(--athena-accent-light)' : '#94a3b8', transition: 'all 0.2s' }}>{t.label}</button>
        ))}
      </div>

      {loading && <LoadingSpinner fullPage />}
      {error && <EmptyState icon={AlertCircle} title="Load failed" message={error} action={load} actionLabel="Try Again" />}
      {!loading && !error && filtered.length === 0 && <EmptyState title="No reminders yet" message="Add a reminder to get started." action={() => setShowModal(true)} actionLabel="Add Reminder" />}

      {/* Pending */}
      {!loading && pending.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>PENDING ({pending.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map((r) => {
              const info = typeInfo(r.type);
              return (
                <div key={r.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{info.label.split(' ')[0]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{r.title}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Badge variant={info.color}>{r.type}</Badge>
                      {r.time && <span style={{ color: '#64748b', fontSize: 11 }}>🕐 {r.time}</span>}
                      {r.date && <span style={{ color: '#64748b', fontSize: 11 }}>📅 {new Date(r.date).toLocaleDateString()}</span>}
                      {r.repeat !== 'none' && <span style={{ color: '#64748b', fontSize: 11 }}>🔁 {r.repeat}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleMarkDone(r)} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#4ade80', display: 'flex' }}><Check size={14} /></button>
                    <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 6, display: 'flex' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Done */}
      {!loading && done.length > 0 && (
        <div>
          <p style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>COMPLETED ({done.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {done.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', opacity: 0.7 }}>
                <Check size={16} color="#4ade80" style={{ flexShrink: 0 }} />
                <p style={{ color: '#64748b', fontSize: 13, flex: 1, textDecoration: 'line-through' }}>{r.title}</p>
                <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155' }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Reminder">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="athena-label">Title *</label><input className="athena-input" placeholder="Reminder title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
          <div>
            <label className="athena-label">Type</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {REMINDER_TYPES.map((t) => (
                <button key={t.value} onClick={() => setForm((p) => ({ ...p, type: t.value }))} style={{ padding: '5px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: form.type === t.value ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form.type === t.value ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.08)'}`, color: form.type === t.value ? '#dc2626' : '#94a3b8', transition: 'all 0.2s' }}>{t.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label className="athena-label">Date</label><input type="date" className="athena-input" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></div>
            <div><label className="athena-label">Time</label><input type="time" className="athena-input" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} /></div>
          </div>
          <div><label className="athena-label">Repeat</label><select className="athena-select" value={form.repeat} onChange={(e) => setForm((p) => ({ ...p, repeat: e.target.value }))}>{REPEAT_OPTIONS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}</select></div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowModal(false)} className="athena-btn-secondary">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="athena-btn-primary">{saving ? <LoadingSpinner size={16} /> : 'Set Reminder'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
