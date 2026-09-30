import { useState, useEffect } from 'react';
import { memoryApi } from '../api/memoryApi';
import { useNotification } from '../contexts/NotificationContext';
import { Brain, Plus, Trash2, AlertCircle } from 'lucide-react';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

const TYPE_CONFIG = {
  explicit: { label: 'Explicit', color: 'blue', desc: 'You told ATHENA this directly.' },
  observed: { label: 'Observed', color: 'amber', desc: 'Noticed from your activity.' },
  learned: { label: 'Learned', color: 'purple', desc: 'Inferred from patterns over time.' },
};
const CATEGORIES = ['preference', 'food', 'hobby', 'behavior', 'productivity', 'wellness', 'personal', 'other'];

export default function MemoryPage() {
  const { addToast } = useNotification();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ content: '', type: 'explicit', category: 'preference' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await memoryApi.getMemory();
      setMemories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load memories:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Unable to load memories.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.content.trim()) {
      addToast({ title: 'Empty memory', message: 'Please enter something for ATHENA to remember.', type: 'warning' });
      return;
    }
    setSaving(true);
    try {
      const created = await memoryApi.addMemory(form);
      setMemories((prev) => [created, ...prev]);
      addToast({ title: 'Memory saved!', message: 'ATHENA will remember this.', type: 'success' });
      setShowModal(false);
      setForm({ content: '', type: 'explicit', category: 'preference' });
    } catch (err) {
      console.error('Failed to save memory:', err);
      const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Could not save memory';
      addToast({
        title: 'Could not save memory',
        message: typeof detail === 'string' ? detail : JSON.stringify(detail),
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await memoryApi.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      addToast({ title: 'Memory removed', type: 'info' });
    } catch (err) {
      console.error('Failed to delete memory:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Failed to delete memory';
      addToast({ title: 'Delete failed', message: detail, type: 'error' });
    }
  };

  const filtered = filter === 'all' ? memories : memories.filter((m) => m.type === filter);

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 800 }}>My Memory</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>What ATHENA knows about you.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="athena-btn-primary"><Plus size={15} /> Add Memory</button>
      </div>

      {/* Info note */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.entries(TYPE_CONFIG).map(([type, config]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Badge variant={config.color}>{config.label}</Badge>
            <span style={{ color: '#64748b', fontSize: 12 }}>{config.desc}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {['all', 'explicit', 'observed', 'learned'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 100, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
            background: filter === f ? 'var(--athena-accent-soft)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${filter === f ? 'var(--athena-accent-border)' : 'rgba(255,255,255,0.1)'}`,
            color: filter === f ? 'var(--athena-accent-light)' : '#94a3b8', transition: 'all 0.2s',
          }}>
            {f === 'all' ? 'All' : TYPE_CONFIG[f]?.label || f}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner fullPage />}
      {error && <EmptyState icon={AlertCircle} title="Load failed" message={error} action={load} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState icon={Brain} title="No memories yet" message="Start telling ATHENA about yourself." action={() => setShowModal(true)} actionLabel="Add Memory" />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filtered.map((m) => {
            const config = TYPE_CONFIG[m.type] || TYPE_CONFIG.explicit;
            return (
              <div key={m.id} className="glass-card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge variant={config.color}>{config.label}</Badge>
                    <span style={{ color: '#475569', fontSize: 11, textTransform: 'capitalize', alignSelf: 'center' }}>{m.category}</span>
                  </div>
                  <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: 2 }}><Trash2 size={13} /></button>
                </div>
                <p style={{ color: '#f1f5f9', fontSize: 14, lineHeight: 1.6 }}>"{m.content}"</p>
                {m.type === 'learned' && m.confidence !== undefined && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b', fontSize: 11 }}>Confidence</span>
                      <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 600 }}>{Math.round(m.confidence * 100)}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 100, height: 4, overflow: 'hidden' }}>
                      <div style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', height: '100%', width: `${m.confidence * 100}%`, borderRadius: 100 }} />
                    </div>
                  </div>
                )}
                <p style={{ color: '#334155', fontSize: 11, marginTop: 8 }}>{formatDate(m.timestamp)}</p>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Memory">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="athena-label">Memory / Preference *</label><textarea className="athena-input" placeholder='e.g. "I prefer studying at night" or "My favorite food is biryani"' value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} rows={3} style={{ resize: 'vertical' }} /></div>
          <div>
            <label className="athena-label">Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setForm((p) => ({ ...p, category: c }))} style={{ padding: '5px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', background: form.category === c ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form.category === c ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.08)'}`, color: form.category === c ? '#dc2626' : '#94a3b8', transition: 'all 0.2s' }}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowModal(false)} className="athena-btn-secondary">Cancel</button>
            <button onClick={handleAdd} disabled={saving} className="athena-btn-primary">{saving ? <LoadingSpinner size={16} /> : 'Save Memory'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
