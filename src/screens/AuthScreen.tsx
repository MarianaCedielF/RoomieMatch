import React, { useState } from 'react';
import { Home, ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { useApp, UNIVERSITIES } from '../context/AppContext';
import type { UserProfile, HousingState, CompatibilityAnswers } from '../types';

const DEFAULT_COMPATIBILITY: CompatibilityAnswers = {
  sleepTime: 'normal', wakeTime: 'normal', cleanlinessLevel: 3,
  cleaningFrequency: 'weekly', noiseLevel: 'quiet', studyEnvironment: 'music',
  guestsFrequency: 'rarely', overnightGuests: false, expenseSplit: 'strict_50',
  budgetRange: '400_600', socialStyle: 'ambivert', sharedSpaces: 'neutral',
  hasPets: false, acceptsPets: true, smokes: false, acceptsSmoking: false,
  studySchedule: 'afternoons',
};

type Step = 'welcome' | 'info' | 'housing' | 'compatibility' | 'done';

export default function AuthScreen() {
  const { dispatch } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const [form, setForm] = useState({
    name: '', age: '20', email: '', career: '', semester: '1', originCity: '',
    bio: '', avatar: '🧑', universityId: UNIVERSITIES[0].id, housingState: 'A' as HousingState,
    neighborhood: '', city: '', rent: '600',
  });
  const [compat, setCompat] = useState<CompatibilityAnswers>(DEFAULT_COMPATIBILITY);

  const setF = (k: string, v: string | boolean | number) => setForm(p => ({ ...p, [k]: v }));
  const setC = (k: keyof CompatibilityAnswers, v: unknown) => setCompat(p => ({ ...p, [k]: v }));

  const AVATARS = ['🧑', '👦', '👧', '👨', '👩', '🧑🏽', '👦🏽', '👧🏽', '👨🏽', '👩🏽', '🧑🏾', '👩🏾'];

  function register() {
    const uni = UNIVERSITIES.find(u => u.id === form.universityId)!;
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      name: form.name,
      age: parseInt(form.age),
      email: form.email || `${form.name.toLowerCase().replace(' ', '.')}@${uni.emailDomain}`,
      university: uni,
      career: form.career,
      semester: parseInt(form.semester),
      originCity: form.originCity,
      bio: form.bio,
      avatar: form.avatar,
      housingState: form.housingState,
      housingDetails: form.housingState === 'B' ? {
        neighborhood: form.neighborhood,
        city: form.city || uni.city,
        rent: parseInt(form.rent),
        rules: [],
      } : undefined,
      compatibility: compat,
      verified: true,
      joinedAt: new Date().toISOString(),
      likedBy: [],
      reviewScore: undefined,
      reviewCount: 0,
    };
    dispatch({ type: 'REGISTER', payload: profile });
  }

  const housingStateLabels: Record<HousingState, { label: string; desc: string; icon: string }> = {
    A: { label: 'Sin cuarto ni roomie', desc: 'Busco a alguien con quien buscar y rentar un lugar juntos', icon: '🔍' },
    B: { label: 'Tengo cuarto disponible', desc: 'Ya tengo un espacio y busco a alguien con quien compartir', icon: '🏠' },
    C: { label: 'Tengo roomie, busco cuarto', desc: 'Ya encontré mi roomie y juntos buscamos donde vivir', icon: '👫' },
  };

  if (step === 'welcome') return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(160deg, #0F6E56 0%, #1D9E75 50%, #2DD4A0 100%)', padding: '0 24px', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'white', marginBottom: 48 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🏠</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>RoomieMatch</h1>
        <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
          Encuentra tu roomie ideal para vivir tu vida universitaria en Colombia
        </p>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn btn-primary" style={{ background: 'white', color: 'var(--teal-dark)', fontSize: 16, padding: '16px', borderRadius: 'var(--radius-lg)' }} onClick={() => setStep('info')}>
          Crear cuenta
        </button>
        <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 16, padding: '16px', borderRadius: 'var(--radius-lg)' }}
          onClick={() => {
            // Demo login
            const demoUser: UserProfile = {
              id: 'user-1', name: 'Demo Usuario', age: 21,
              email: 'demo@unal.edu.co', university: UNIVERSITIES[0],
              career: 'Ingeniería de Sistemas', semester: 3, originCity: 'Manizales',
              bio: 'Estudiante foráneo buscando roomie. Me gusta la música y el café ☕',
              avatar: '🧑', housingState: 'A', verified: true,
              joinedAt: new Date().toISOString(), likedBy: [], reviewCount: 0,
              compatibility: DEFAULT_COMPATIBILITY,
            };
            dispatch({ type: 'LOGIN', payload: demoUser });
          }}>
          Entrar como demo
        </button>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 24, textAlign: 'center' }}>
        Solo para universitarios verificados en Colombia 🇨🇴
      </p>
    </div>
  );

  return (
    <div className="app-container" style={{ maxWidth: '430px', margin: '0 auto' }}>
      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--gray-200)', position: 'relative' }}>
        <div style={{ height: '100%', background: 'var(--teal)', width: step === 'info' ? '33%' : step === 'housing' ? '66%' : step === 'compatibility' ? '90%' : '100%', transition: 'width 0.3s' }} />
      </div>

      <div className="page-content" style={{ padding: '0 0 100px' }}>
        {/* Step: Info */}
        {step === 'info' && (
          <div style={{ padding: '24px 20px' }} className="animate-slide-up">
            <button onClick={() => setStep('welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)' }}>
              <ArrowLeft size={16} /> Volver
            </button>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Tu perfil</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: 14 }}>Cuéntanos sobre ti para encontrar el roomie ideal</p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {AVATARS.map(a => (
                <button key={a} onClick={() => setF('avatar', a)}
                  style={{ width: 44, height: 44, fontSize: 24, border: '2px solid', borderColor: form.avatar === a ? 'var(--teal)' : 'var(--gray-200)', borderRadius: 'var(--radius)', background: form.avatar === a ? 'var(--teal-light)' : 'white', cursor: 'pointer' }}>
                  {a}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input className="form-input" placeholder="Ej: María García" value={form.name} onChange={e => setF('name', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Edad</label>
                <input className="form-input" type="number" value={form.age} onChange={e => setF('age', e.target.value)} min="16" max="35" />
              </div>
              <div className="form-group">
                <label className="form-label">Semestre</label>
                <input className="form-input" type="number" value={form.semester} onChange={e => setF('semester', e.target.value)} min="1" max="12" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Universidad</label>
              <select className="form-select" value={form.universityId} onChange={e => setF('universityId', e.target.value)}>
                {UNIVERSITIES.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Carrera</label>
              <input className="form-input" placeholder="Ej: Ingeniería de Sistemas" value={form.career} onChange={e => setF('career', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ciudad de origen</label>
              <input className="form-input" placeholder="Ej: Cali" value={form.originCity} onChange={e => setF('originCity', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio (cuéntate un poco)</label>
              <textarea className="form-input" rows={3} placeholder="Me gusta el café, soy muy ordenada y busco un ambiente tranquilo..." value={form.bio} onChange={e => setF('bio', e.target.value)} style={{ resize: 'none' }} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 16, marginTop: 8 }} onClick={() => setStep('housing')} disabled={!form.name || !form.career || !form.originCity}>
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step: Housing State */}
        {step === 'housing' && (
          <div style={{ padding: '24px 20px' }} className="animate-slide-up">
            <button onClick={() => setStep('info')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)' }}>
              <ArrowLeft size={16} /> Volver
            </button>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>¿Cuál es tu situación?</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: 14 }}>Esto define cómo te emparejamos con otros foráneos</p>

            {(['A', 'B', 'C'] as HousingState[]).map(state => {
              const info = housingStateLabels[state];
              const colors = { A: 'var(--teal)', B: 'var(--purple)', C: 'var(--amber)' };
              const lightColors = { A: 'var(--teal-light)', B: 'var(--purple-light)', C: 'var(--amber-light)' };
              const selected = form.housingState === state;
              return (
                <button key={state} onClick={() => setF('housingState', state)}
                  style={{ width: '100%', textAlign: 'left', padding: '16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${selected ? colors[state] : 'var(--gray-200)'}`, background: selected ? lightColors[state] : 'white', cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 32 }}>{info.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: selected ? colors[state] : 'var(--dark)' }}>{info.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{info.desc}</div>
                  </div>
                  {selected && <CheckCircle size={20} color={colors[state]} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}

            {form.housingState === 'B' && (
              <div style={{ marginTop: 8, padding: 16, background: 'var(--purple-light)', borderRadius: 'var(--radius)', border: '1px solid var(--purple-light)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--purple)', marginBottom: 12 }}>Detalles de tu cuarto</p>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label">Barrio / Sector</label>
                  <input className="form-input" placeholder="Ej: Chapinero" value={form.neighborhood} onChange={e => setF('neighborhood', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Arriendo por persona (miles COP)</label>
                  <input className="form-input" type="number" value={form.rent} onChange={e => setF('rent', e.target.value)} />
                </div>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', padding: 16, marginTop: 20 }} onClick={() => setStep('compatibility')}>
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step: Compatibility Test */}
        {step === 'compatibility' && (
          <div style={{ padding: '24px 20px' }} className="animate-slide-up">
            <button onClick={() => setStep('housing')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)' }}>
              <ArrowLeft size={16} /> Volver
            </button>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Test de compatibilidad</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: 14 }}>Tus respuestas generan el score de compatibilidad con otros foráneos</p>

            {/* Sleep */}
            <SectionTitle>🌙 Horarios de sueño</SectionTitle>
            <ChoiceGroup label="¿A qué hora te acuestas normalmente?"
              options={[{ value: 'early', label: 'Antes de 10pm' }, { value: 'normal', label: '10-11pm' }, { value: 'late', label: '11pm-1am' }, { value: 'very_late', label: 'Después de 1am' }]}
              value={compat.sleepTime} onChange={v => setC('sleepTime', v)} />
            <ChoiceGroup label="¿A qué hora te despiertas?"
              options={[{ value: 'very_early', label: 'Antes de 6am' }, { value: 'early', label: '6-7am' }, { value: 'normal', label: '7-9am' }, { value: 'late', label: 'Después de 9am' }]}
              value={compat.wakeTime} onChange={v => setC('wakeTime', v)} />

            {/* Cleanliness */}
            <SectionTitle>🧹 Limpieza</SectionTitle>
            <div className="form-group">
              <label className="form-label">Nivel de limpieza (1=muy desord. / 5=muy ordenado)</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setC('cleanlinessLevel', n as 1|2|3|4|5)}
                    style={{ flex: 1, padding: '10px 0', border: '2px solid', borderColor: compat.cleanlinessLevel === n ? 'var(--teal)' : 'var(--gray-200)', borderRadius: 'var(--radius)', fontWeight: 700, background: compat.cleanlinessLevel === n ? 'var(--teal-light)' : 'white', color: compat.cleanlinessLevel === n ? 'var(--teal)' : 'var(--gray-600)', cursor: 'pointer' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <ChoiceGroup label="¿Cada cuánto limpias áreas comunes?"
              options={[{ value: 'daily', label: 'Diario' }, { value: 'weekly', label: 'Semanal' }, { value: 'biweekly', label: 'Quincenal' }, { value: 'monthly', label: 'Mensual' }]}
              value={compat.cleaningFrequency} onChange={v => setC('cleaningFrequency', v)} />

            {/* Noise */}
            <SectionTitle>🔊 Ruido y estudio</SectionTitle>
            <ChoiceGroup label="Nivel de ruido que produces normalmente"
              options={[{ value: 'silent', label: 'Silencioso' }, { value: 'quiet', label: 'Tranquilo' }, { value: 'moderate', label: 'Moderado' }, { value: 'loud', label: 'Ruidoso' }]}
              value={compat.noiseLevel} onChange={v => setC('noiseLevel', v)} />
            <ChoiceGroup label="¿Cómo estudias mejor?"
              options={[{ value: 'silence', label: 'En silencio' }, { value: 'ambient', label: 'Ruido ambiental' }, { value: 'music', label: 'Con música' }, { value: 'any', label: 'Me adapto' }]}
              value={compat.studyEnvironment} onChange={v => setC('studyEnvironment', v)} />

            {/* Guests */}
            <SectionTitle>🚪 Visitas</SectionTitle>
            <ChoiceGroup label="¿Con qué frecuencia recibes visitas?"
              options={[{ value: 'never', label: 'Nunca' }, { value: 'rarely', label: 'Rara vez' }, { value: 'sometimes', label: 'Seguido' }, { value: 'often', label: 'Muy seguido' }]}
              value={compat.guestsFrequency} onChange={v => setC('guestsFrequency', v)} />
            <div className="form-group">
              <label className="form-label">¿Aceptas que tu roomie tenga visitas que duerman?</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {[{ v: true, l: 'Sí' }, { v: false, l: 'No' }].map(({ v, l }) => (
                  <button key={l} onClick={() => setC('overnightGuests', v)}
                    style={{ flex: 1, padding: '10px 0', border: '2px solid', borderColor: compat.overnightGuests === v ? 'var(--teal)' : 'var(--gray-200)', borderRadius: 'var(--radius)', fontWeight: 700, background: compat.overnightGuests === v ? 'var(--teal-light)' : 'white', color: compat.overnightGuests === v ? 'var(--teal)' : 'var(--gray-600)', cursor: 'pointer' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <SectionTitle>💰 Presupuesto</SectionTitle>
            <ChoiceGroup label="Arriendo mensual que puedes pagar (miles COP)"
              options={[{ value: 'under_400', label: '<$400k' }, { value: '400_600', label: '$400-600k' }, { value: '600_800', label: '$600-800k' }, { value: 'over_800', label: '>$800k' }]}
              value={compat.budgetRange} onChange={v => setC('budgetRange', v)} />
            <ChoiceGroup label="¿Cómo prefieres dividir los gastos?"
              options={[{ value: 'strict_50', label: '50/50 exacto' }, { value: 'flexible', label: 'Flexible' }, { value: 'whoever_has_more', label: 'Según ingresos' }]}
              value={compat.expenseSplit} onChange={v => setC('expenseSplit', v)} />

            {/* Social */}
            <SectionTitle>🧑‍🤝‍🧑 Estilo social</SectionTitle>
            <ChoiceGroup label="¿Cómo te describes?"
              options={[{ value: 'introvert', label: 'Introvertido' }, { value: 'ambivert', label: 'Ambivertido' }, { value: 'extrovert', label: 'Extrovertido' }]}
              value={compat.socialStyle} onChange={v => setC('socialStyle', v)} />
            <ChoiceGroup label="Espacios compartidos con roomie"
              options={[{ value: 'prefer_alone', label: 'Prefiero mi espacio' }, { value: 'neutral', label: 'Neutral' }, { value: 'enjoy_together', label: 'Me gusta compartir' }]}
              value={compat.sharedSpaces} onChange={v => setC('sharedSpaces', v)} />

            {/* Pets & Smoking */}
            <SectionTitle>🐾 Mascotas y fumar</SectionTitle>
            <BoolChoice label="¿Tienes mascotas?" value={compat.hasPets} onChange={v => setC('hasPets', v)} />
            <BoolChoice label="¿Aceptas mascotas de tu roomie?" value={compat.acceptsPets} onChange={v => setC('acceptsPets', v)} />
            <BoolChoice label="¿Fumas?" value={compat.smokes} onChange={v => setC('smokes', v)} />
            <BoolChoice label="¿Aceptas que tu roomie fume?" value={compat.acceptsSmoking} onChange={v => setC('acceptsSmoking', v)} />

            <button className="btn btn-primary" style={{ width: '100%', padding: 16, marginTop: 20 }} onClick={register}>
              Crear mi perfil 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-700)', margin: '20px 0 12px', paddingBottom: 6, borderBottom: '1px solid var(--gray-200)' }}>{children}</div>;
}

function ChoiceGroup({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            style={{ padding: '8px 12px', border: '2px solid', borderColor: value === o.value ? 'var(--teal)' : 'var(--gray-200)', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: 13, background: value === o.value ? 'var(--teal-light)' : 'white', color: value === o.value ? 'var(--teal)' : 'var(--gray-600)', cursor: 'pointer', transition: 'all 0.1s' }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BoolChoice({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {[{ v: true, l: 'Sí' }, { v: false, l: 'No' }].map(({ v, l }) => (
          <button key={l} onClick={() => onChange(v)}
            style={{ flex: 1, padding: '10px 0', border: '2px solid', borderColor: value === v ? 'var(--teal)' : 'var(--gray-200)', borderRadius: 'var(--radius)', fontWeight: 700, background: value === v ? 'var(--teal-light)' : 'white', color: value === v ? 'var(--teal)' : 'var(--gray-600)', cursor: 'pointer' }}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
