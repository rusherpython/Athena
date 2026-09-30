import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Sparkles, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useState } from 'react';

const MOOD_OPTIONS = ['Music', 'YouTube', 'Gaming', 'Sleep', 'Social media', 'Talk to friends', 'Go outside', 'Eat', 'Exercise', 'Read'];
const MOODS = [
  { key: 'bored', emoji: '😐', label: 'Bored' },
  { key: 'sad', emoji: '😔', label: 'Sad' },
  { key: 'happy', emoji: '😊', label: 'Happy' },
  { key: 'angry', emoji: '😠', label: 'Angry' },
  { key: 'stressed', emoji: '😰', label: 'Stressed' },
];
const SOCIAL = ['Instagram', 'YouTube', 'WhatsApp', 'Snapchat', 'X (Twitter)', 'Reddit', 'TikTok'];
const DIETARY = ['Vegetarian', 'Non-vegetarian', 'Vegan', 'Pescatarian', 'Other', 'Prefer not to say'];

function TagList({ field, label, items, onAdd, onRemove }) {
  const [val, setVal] = useState('');

  const handleAdd = () => {
    const trimmed = val.trim();
    if (trimmed && !(items || []).includes(trimmed)) {
      onAdd(field, trimmed);
      setVal('');
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label className="athena-label" htmlFor={`input-${field}`}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {(items || []).map((item) => (
          <span
            key={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: 100,
              background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.25)',
              color: '#f87171',
              fontSize: 12,
            }}
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(field, item)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 0, display: 'flex' }}
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          id={`input-${field}`}
          name={`input-${field}`}
          className="athena-input"
          placeholder={`Add ${label.toLowerCase()}...`}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="athena-btn-secondary"
          style={{ padding: '10px 14px', flexShrink: 0 }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function OnboardingLifestyle() {
  const { data, updateData } = useOnboarding();
  const navigate = useNavigate();
  const [activeMood, setActiveMood] = useState('bored');

  const toggleMoodOption = (mood, option) => {
    const current = data.moodPreferences[mood] || [];
    const updated = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
    updateData({ moodPreferences: { ...data.moodPreferences, [mood]: updated } });
  };

  const addFood = (field, item) => {
    updateData({ [field]: [...(data[field] || []), item] });
  };

  const removeItem = (field, item) => {
    updateData({ [field]: (data[field] || []).filter((i) => i !== item) });
  };

  const toggleSocial = (platform) => {
    const platforms = data.socialMediaPlatforms.includes(platform)
      ? data.socialMediaPlatforms.filter((p) => p !== platform)
      : [...data.socialMediaPlatforms, platform];
    updateData({ socialMediaPlatforms: platforms });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#dc2626" />
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800 }}>Lifestyle & Preferences</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14 }}>Your food preferences, mood behaviors, and social media habits.</p>
      </div>

      {/* Food preferences */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🍕 Food Preferences</h3>
        <TagList field="favoriteFoods" label="Favorite Foods" items={data.favoriteFoods} onAdd={addFood} onRemove={removeItem} />
        <TagList field="favoriteCuisines" label="Favorite Cuisines" items={data.favoriteCuisines} onAdd={addFood} onRemove={removeItem} />
        <TagList field="favoriteSnacks" label="Favorite Snacks" items={data.favoriteSnacks} onAdd={addFood} onRemove={removeItem} />
        <TagList field="favoriteDrinks" label="Favorite Drinks" items={data.favoriteDrinks} onAdd={addFood} onRemove={removeItem} />
        <TagList field="dislikedFoods" label="Foods You Dislike" items={data.dislikedFoods} onAdd={addFood} onRemove={removeItem} />

        <div>
          <label className="athena-label">Dietary preference</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DIETARY.map((d) => (
              <button key={d} onClick={() => updateData({ dietaryPreference: d })} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                background: data.dietaryPreference === d ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${data.dietaryPreference === d ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: data.dietaryPreference === d ? '#dc2626' : '#94a3b8', transition: 'all 0.2s',
              }}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mood preferences */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>🧠 What do you usually do when...</h3>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>This helps ATHENA understand your emotional patterns.</p>

        {/* Mood tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {MOODS.map((m) => (
            <button key={m.key} onClick={() => setActiveMood(m.key)} style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 13, cursor: 'pointer',
              background: activeMood === m.key ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeMood === m.key ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: activeMood === m.key ? '#dc2626' : '#94a3b8', transition: 'all 0.2s',
            }}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10 }}>When you're <strong style={{ color: '#f1f5f9' }}>{MOODS.find((m) => m.key === activeMood)?.label.toLowerCase()}</strong>, you usually:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {MOOD_OPTIONS.map((opt) => {
            const selected = (data.moodPreferences[activeMood] || []).includes(opt);
            return (
              <button key={opt} onClick={() => toggleMoodOption(activeMood, opt)} style={{
                padding: '7px 14px', borderRadius: 100, fontSize: 13, cursor: 'pointer',
                background: selected ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selected ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: selected ? '#dc2626' : '#94a3b8', transition: 'all 0.2s',
              }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Social media */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📱 Social Media</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {SOCIAL.map((p) => {
            const selected = data.socialMediaPlatforms.includes(p);
            return (
              <button key={p} onClick={() => toggleSocial(p)} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                background: selected ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selected ? 'rgba(220,38,38,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: selected ? '#dc2626' : '#94a3b8', transition: 'all 0.2s',
              }}>
                {p}
              </button>
            );
          })}
        </div>
        {data.socialMediaPlatforms.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className="athena-label">Approximate daily usage (minutes)</label>
            {data.socialMediaPlatforms.map((p) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#94a3b8', fontSize: 13, width: 100, flexShrink: 0 }}>{p}</span>
                <input type="number" className="athena-input" placeholder="min/day" min={0} max={720}
                  value={data.socialMediaUsage[p] || ''}
                  onChange={(e) => updateData({ socialMediaUsage: { ...data.socialMediaUsage, [p]: e.target.value } })}
                  style={{ flex: 1 }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <button onClick={() => navigate('/onboarding/personal')} className="athena-btn-secondary">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={() => navigate('/onboarding/wellness')} className="athena-btn-primary">
          Continue <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
