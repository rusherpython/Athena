import { useState, useEffect } from 'react';
import { wellnessApi } from '../api/wellnessApi';
import { useNotification } from '../contexts/NotificationContext';
import { Heart, Moon, Dumbbell, Info, Pill } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function WellnessPage() {
  const { addToast } = useNotification();
  const [wellness, setWellness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await wellnessApi.getWellness();
        setWellness(data);
        const h = data?.bmi?.height || data?.height;
        const w = data?.bmi?.weight || data?.weight;
        if (h) setBmiHeight(String(h));
        if (w) setBmiWeight(String(w));
      } catch (err) {
        addToast({ title: 'Load error', message: 'Could not load wellness details', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const bmi = bmiHeight && bmiWeight ? (bmiWeight / ((bmiHeight / 100) ** 2)).toFixed(1) : null;
  const bmiCat = bmi ? bmi < 18.5 ? ['Underweight', '#60a5fa'] : bmi < 25 ? ['Normal weight', '#4ade80'] : bmi < 30 ? ['Overweight', '#fbbf24'] : ['Obese', '#f87171'] : null;

  const sleepDuration = wellness?.sleep
    ? (() => {
      const [bH, bM] = (wellness.sleep.bedtime || '23:30').split(':').map(Number);
      const [wH, wM] = (wellness.sleep.wakeTime || '07:00').split(':').map(Number);
      let diff = (wH * 60 + wM) - (bH * 60 + bM);
      if (diff < 0) diff += 1440;
      return (diff / 60).toFixed(1);
    })()
    : null;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-enter">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={22} color="#dc2626" />
          </div>
          <div>
            <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 800 }}>Wellness</h1>
            <p style={{ color: '#64748b', fontSize: 13 }}>Sleep · Workout · BMI · Period tracking · Health Profile</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', marginBottom: 24 }}>
        <Info size={14} color="#60a5fa" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ color: '#93c5fd', fontSize: 12, lineHeight: 1.6 }}>ATHENA uses information you provide to personalize reminders and wellness support. It does not diagnose medical conditions. All information is private and stored only in your profile.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Sleep */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Moon size={18} color="#60a5fa" />
            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700 }}>Sleep</h2>
          </div>
          {wellness?.sleep ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>BEDTIME</p>
                  <p style={{ color: '#60a5fa', fontSize: 18, fontWeight: 700 }}>{wellness.sleep.bedtime || '—'}</p>
                </div>
                <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>WAKE UP</p>
                  <p style={{ color: '#60a5fa', fontSize: 18, fontWeight: 700 }}>{wellness.sleep.wakeTime || '—'}</p>
                </div>
              </div>
              {sleepDuration && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>ESTIMATED DURATION</p>
                  <p style={{ color: '#60a5fa', fontSize: 24, fontWeight: 800 }}>{sleepDuration}h</p>
                  <p style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>Based on your reported bedtime and wake time</p>
                </div>
              )}
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>Quality</span>
                <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 13 }}>{wellness.sleep.quality || 'Not set'}</span>
              </div>
            </div>
          ) : <p style={{ color: '#475569', fontSize: 13 }}>No sleep data configured.</p>}
        </div>

        {/* Workout */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Dumbbell size={18} color="#4ade80" />
            <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700 }}>Workout</h2>
          </div>
          {wellness?.workout?.doesWorkout ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Type', wellness.workout.type],
                ['Days/week', wellness.workout.daysPerWeek],
                ['Preferred time', wellness.workout.preferredTime],
                ['Goal', wellness.workout.goal],
              ].map(([label, val]) => val ? (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>{label}</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 13 }}>{val}</span>
                </div>
              ) : null)}
            </div>
          ) : <p style={{ color: '#475569', fontSize: 13 }}>No workout data configured.</p>}
        </div>

        {/* BMI */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>⚖️ BMI Calculator</h2>
          <p style={{ color: '#64748b', fontSize: 12, marginBottom: 14 }}>BMI is a general screening metric, not a medical diagnosis.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div><label className="athena-label">Height (cm)</label><input type="number" className="athena-input" placeholder="175" value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} /></div>
            <div><label className="athena-label">Weight (kg)</label><input type="number" className="athena-input" placeholder="70" value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} /></div>
          </div>
          {bmi && bmiCat && (
            <div style={{ textAlign: 'center', padding: '16px', borderRadius: 12, background: `rgba(${bmiCat[1] === '#4ade80' ? '34,197,94' : bmiCat[1] === '#60a5fa' ? '59,130,246' : bmiCat[1] === '#fbbf24' ? '245,158,11' : '248,113,113'},0.08)`, border: `1px solid ${bmiCat[1]}33` }}>
              <p style={{ color: bmiCat[1], fontSize: 36, fontWeight: 900 }}>{bmi}</p>
              <p style={{ color: bmiCat[1], fontSize: 14, fontWeight: 600 }}>{bmiCat[0]}</p>
            </div>
          )}
        </div>

        {/* Period tracking */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>🌸 Period Tracking</h2>
          {wellness?.periodTracking?.enabled ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}>
                <p style={{ color: '#64748b', fontSize: 11 }}>ESTIMATED NEXT PERIOD</p>
                <p style={{ color: '#f9a8d4', fontWeight: 700, fontSize: 16 }}>{wellness.periodTracking.nextEstimated || 'Calculating...'}</p>
                <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>Based on your average cycle length ({wellness.periodTracking.averageCycleLength || 28} days)</p>
              </div>
              {wellness.periodTracking.symptoms && wellness.periodTracking.symptoms.length > 0 && (
                <div>
                  <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>RECORDED SYMPTOMS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {wellness.periodTracking.symptoms.map((s) => (
                      <span key={s} style={{ padding: '3px 8px', borderRadius: 100, fontSize: 11, background: 'rgba(236,72,153,0.15)', color: '#f9a8d4', border: '1px solid rgba(236,72,153,0.3)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p style={{ color: '#64748b', fontSize: 11 }}>This is an estimate only and not a medical prediction.</p>
            </div>
          ) : (
            <div>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>Period tracking is not enabled.</p>
              <p style={{ color: '#475569', fontSize: 12 }}>You can enable it to activate cycle reminders and wellness support.</p>
            </div>
          )}
        </div>

        {/* Health Profile & Medicines */}
        {(wellness?.healthConditions || wellness?.allergies || (wellness?.medicines && wellness.medicines.length > 0)) && (
          <div className="glass-card" style={{ padding: 22, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Pill size={18} color="#a855f7" />
              <h2 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700 }}>Health Profile & Medicines</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
              {wellness.healthConditions && (
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Health Conditions</p>
                  <p style={{ color: '#f1f5f9', fontSize: 13, lineHeight: 1.5 }}>{wellness.healthConditions}</p>
                </div>
              )}
              {wellness.allergies && (
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Allergies</p>
                  <p style={{ color: '#f1f5f9', fontSize: 13, lineHeight: 1.5 }}>{wellness.allergies}</p>
                </div>
              )}
            </div>

            {wellness.medicines && wellness.medicines.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Configured Medicines & Reminders</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {wellness.medicines.map((m, idx) => (
                    <div key={m.id || idx} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.18)' }}>
                      <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{m.name}</p>
                      <p style={{ color: '#d8b4fe', fontSize: 12, marginTop: 2 }}>{[m.dosage, m.frequency, m.time].filter(Boolean).join(' · ')}</p>
                      {m.notes && <p style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>Note: {m.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
