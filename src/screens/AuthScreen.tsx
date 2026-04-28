import React, { useState } from 'react';
import { ChevronRight, CheckCircle, ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useApp, UNIVERSITIES } from '../context/AppContext';
import type { UserProfile, HousingState, CompatibilityAnswers } from '../types';

const DEFAULT_COMPATIBILITY: CompatibilityAnswers = {
  sleepTime: 'normal', wakeTime: 'normal', cleanlinessLevel: 3,
  cleaningFrequency: 'weekly', noiseLevel: 'quiet', studyEnvironment: 'music',
  guestsFrequency: 'rarely', overnightGuests: false, expenseSplit: 'strict_50',
  budgetRange: '400_600', socialStyle: 'ambivert', sharedSpaces: 'neutral',
  hasPets: false, acceptsPets: true, smokes: false, acceptsSmoking: false,
  studySchedule: 'afternoons', cleaningService: 'open',
};

// ── Security helpers ──────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + ':roomiematch-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateVerifCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Local storage helpers ─────────────────────────────────────────────────────

interface StoredAccount { email: string; passwordHash: string; profile: UserProfile; }

function getAccounts(): StoredAccount[] {
  try { return JSON.parse(localStorage.getItem('roomie_accounts') || '[]'); }
  catch { return []; }
}
function saveAccount(account: StoredAccount) {
  const accounts = getAccounts();
  const idx = accounts.findIndex(a => a.email.toLowerCase() === account.email.toLowerCase());
  if (idx >= 0) accounts[idx] = account; else accounts.push(account);
  localStorage.setItem('roomie_accounts', JSON.stringify(accounts));
}

type Step = 'welcome' | 'login' | 'info' | 'housing' | 'compatibility' | 'verify';

export default function AuthScreen() {
  const { dispatch } = useApp();
  const [step, setStep] = useState<Step>('welcome');

  // Registration form
  const [form, setForm] = useState({
    name: '', age: '20', email: '', password: '', career: '', semester: '1', originCity: '',
    bio: '', avatar: '🧑', universityId: UNIVERSITIES[0].id, housingState: 'A' as HousingState,
    neighborhood: '', city: '', rent: '600', preferredZone: '',
  });
  const [compat, setCompat] = useState<CompatibilityAnswers>(DEFAULT_COMPATIBILITY);
  const [showRegPass, setShowRegPass] = useState(false);
  const [registerError, setRegisterError] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Email verification
  const [verifCode, setVerifCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [verifError, setVerifError] = useState('');
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const [pendingPasswordHash, setPendingPasswordHash] = useState('');

  const setF = (k: string, v: string | boolean | number) => setForm(p => ({ ...p, [k]: v }));
  const setC = (k: keyof CompatibilityAnswers, v: unknown) => setCompat(p => ({ ...p, [k]: v }));

  const AVATARS = ['🧑', '👦', '👧', '👨', '👩', '🧑🏽', '👦🏽', '👧🏽', '👨🏽', '👩🏽', '🧑🏾', '👩🏾'];

  const selectedUni = UNIVERSITIES.find(u => u.id === form.universityId)!;
  const emailDomainOk = !form.email.trim() || form.email.trim().toLowerCase().endsWith('@' + selectedUni.emailDomain);
  const canContinueInfo = form.name.trim() && form.career.trim() && form.originCity.trim()
    && form.email.trim() && emailDomainOk && form.password.length >= 4;

  // ── Login ────────────────────────────────────────────────────────────────────
  async function handleLogin() {
    setLoginError('');
    const accounts = getAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === loginEmail.toLowerCase().trim());
    if (!account) { setLoginError('no_account'); return; }
    const hash = await hashPassword(loginPassword);
    // Support both old plaintext (migration) and new hash
    if (account.passwordHash !== hash && (account as any).password !== loginPassword) {
      setLoginError('wrong_password'); return;
    }
    dispatch({ type: 'LOGIN', payload: account.profile });
  }

  // ── Registration: prepare → verify → finalize ─────────────────────────────
  async function prepareVerification() {
    setRegisterError('');
    const email = form.email.trim();
    const existing = getAccounts().find(a => a.email.toLowerCase() === email.toLowerCase());
    if (existing) { setRegisterError('email_exists'); return; }

    const passwordHash = await hashPassword(form.password);
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      name: form.name,
      age: parseInt(form.age),
      email,
      university: selectedUni,
      career: form.career,
      semester: parseInt(form.semester),
      originCity: form.originCity,
      bio: form.bio,
      avatar: form.avatar,
      housingState: form.housingState,
      housingDetails: form.housingState === 'B' ? {
        neighborhood: form.neighborhood,
        city: form.city || selectedUni.city,
        rent: parseInt(form.rent),
        rules: [],
      } : undefined,
      preferredZone: form.preferredZone.trim() || undefined,
      compatibility: compat,
      verified: false,
      emailVerified: false,
      joinedAt: new Date().toISOString(),
      likedBy: [], reviewScore: undefined, reviewCount: 0,
    };

    const code = generateVerifCode();
    setVerifCode(code);
    setPendingProfile(profile);
    setPendingPasswordHash(passwordHash);
    setStep('verify');
    // In production: call email API here. For demo, code shown on screen.
  }

  function finalizeRegistration(inputCode: string) {
    setVerifError('');
    if (inputCode !== verifCode) { setVerifError('Código incorrecto. Intenta de nuevo.'); return; }
    if (!pendingProfile) return;
    const verified = { ...pendingProfile, verified: true, emailVerified: true };
    saveAccount({ email: verified.email, passwordHash: pendingPasswordHash, profile: verified });
    dispatch({ type: 'REGISTER', payload: verified });
  }

  function demoLogin() {
    const demoUser: UserProfile = {
      id: 'user-1', name: 'Demo Usuario', age: 21,
      email: 'demo@unal.edu.co', university: UNIVERSITIES[0],
      career: 'Ingeniería de Sistemas', semester: 3, originCity: 'Manizales',
      bio: 'Estudiante foráneo buscando roomie. Me gusta la música y el café ☕',
      avatar: '🧑', housingState: 'A', verified: true, emailVerified: true,
      joinedAt: new Date().toISOString(), likedBy: [], reviewCount: 0,
      compatibility: DEFAULT_COMPATIBILITY,
    };
    dispatch({ type: 'LOGIN', payload: demoUser });
  }

  const housingStateLabels: Record<HousingState, { label: string; desc: string; icon: string }> = {
    A: { label: 'Sin cuarto ni roomie', desc: 'Busco a alguien con quien buscar y rentar un lugar juntos', icon: '🔍' },
    B: { label: 'Tengo cuarto disponible', desc: 'Ya tengo un espacio y busco a alguien con quien compartir', icon: '🏠' },
    C: { label: 'Tengo roomie, busco cuarto', desc: 'Ya encontré mi roomie y juntos buscamos donde vivir', icon: '👫' },
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Welcome ── */}
      {step === 'welcome' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #0F6E56 0%, #1D9E75 55%, #2DD4A0 100%)', padding: '0 28px', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', color: 'white', marginBottom: 48 }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🏠</div>
            <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>RoomieMatch</h1>
            <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
              Encuentra tu roomie ideal para vivir tu vida universitaria en Colombia
            </p>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-primary" style={{ background: 'white', color: 'var(--teal-dark)', fontSize: 16, padding: '16px', borderRadius: 'var(--radius-lg)', width: '100%' }}
              onClick={() => setStep('info')}>
              Crear cuenta
            </button>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 16, padding: '16px', borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(255,255,255,0.4)', width: '100%' }}
              onClick={() => { setLoginError(''); setStep('login'); }}>
              Iniciar sesión
            </button>
            <button style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: 15, padding: '12px', cursor: 'pointer', fontWeight: 500 }}
              onClick={demoLogin}>
              Entrar como demo →
            </button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 28, textAlign: 'center' }}>
            Solo para universitarios verificados en Colombia 🇨🇴
          </p>
        </div>
      )}

      {/* ── Login ── */}
      {step === 'login' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '28px 24px 48px' }} className="animate-slide-up">
            <button onClick={() => setStep('welcome')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)' }}>
              <ArrowLeft size={16} /> Volver
            </button>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Bienvenido de vuelta</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 28, fontSize: 14 }}>Ingresa con tu email y contraseña</p>

            <div className="form-group">
              <label className="form-label">Email institucional</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type="email" placeholder="tu@universidad.edu.co"
                  value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }}
                  onKeyDown={e => e.key === 'Enter' && void handleLogin()}
                  style={{ paddingLeft: 42 }} />
                <Mail size={16} color="var(--gray-400)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showLoginPass ? 'text' : 'password'} placeholder="••••••••"
                  value={loginPassword} onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }}
                  onKeyDown={e => e.key === 'Enter' && void handleLogin()}
                  style={{ paddingLeft: 42, paddingRight: 46 }} />
                <Lock size={16} color="var(--gray-400)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <button onClick={() => setShowLoginPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0 }}>
                  {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginError === 'no_account' && (
              <div style={{ background: 'var(--coral-light)', border: '1px solid var(--coral)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 16 }}>
                <p style={{ color: 'var(--coral)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>⚠️ No encontramos esa cuenta</p>
                <p style={{ color: 'var(--coral)', fontSize: 12, marginBottom: 8 }}>¿Es la primera vez que usas la app?</p>
                <button onClick={() => { setLoginError(''); setF('email', loginEmail); setStep('info'); }}
                  style={{ background: 'var(--coral)', color: 'white', border: 'none', borderRadius: 'var(--radius)', padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Crear una cuenta →
                </button>
              </div>
            )}
            {loginError === 'wrong_password' && (
              <div style={{ background: 'var(--coral-light)', border: '1px solid var(--coral)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ color: 'var(--coral)', fontSize: 13, fontWeight: 500 }}>⚠️ Contraseña incorrecta. Intenta de nuevo.</p>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', padding: 16, marginTop: 4, fontSize: 16 }}
              onClick={() => void handleLogin()} disabled={!loginEmail || !loginPassword}>
              Ingresar
            </button>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>¿Aún no tienes cuenta? </span>
              <button onClick={() => { setLoginError(''); setF('email', loginEmail); setStep('info'); }}
                style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Crear una aquí
              </button>
            </div>

            <div style={{ marginTop: 24, padding: '14px 16px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>¿Quieres explorar sin cuenta?</p>
              <button onClick={demoLogin} style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0 }}>
                Entrar como demo →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Progress bar ── */}
      {(step === 'info' || step === 'housing' || step === 'compatibility') && (
        <div style={{ height: 4, background: 'var(--gray-200)', flexShrink: 0 }}>
          <div style={{ height: '100%', background: 'var(--teal)', width: step === 'info' ? '33%' : step === 'housing' ? '66%' : '100%', transition: 'width 0.3s' }} />
        </div>
      )}

      {/* ── Info step ── */}
      {step === 'info' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px 20px 48px' }} className="animate-slide-up">
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
              <label className="form-label">Nombre completo *</label>
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
              <label className="form-label">Universidad *</label>
              <select className="form-select" value={form.universityId} onChange={e => setF('universityId', e.target.value)}>
                {UNIVERSITIES.map(u => <option key={u.id} value={u.id}>{u.name} — {u.city}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Carrera *</label>
              <input className="form-input" placeholder="Ej: Ingeniería de Sistemas" value={form.career} onChange={e => setF('career', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ciudad de origen *</label>
              <input className="form-input" placeholder="Ej: Cali" value={form.originCity} onChange={e => setF('originCity', e.target.value)} />
            </div>

            <div style={{ height: 1, background: 'var(--gray-200)', margin: '4px 0 20px' }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 16 }}>🔐 Datos de acceso</p>

            <div className="form-group">
              <label className="form-label">
                Email institucional *
                {form.email && !emailDomainOk && <span style={{ color: 'var(--coral)', fontWeight: 400, marginLeft: 6 }}>— debe terminar en @{selectedUni.emailDomain}</span>}
                {form.email && emailDomainOk && <span style={{ color: 'var(--teal)', fontWeight: 400, marginLeft: 6 }}>✓</span>}
              </label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type="email" value={form.email}
                  onChange={e => setF('email', e.target.value)}
                  placeholder={`tu@${selectedUni.emailDomain}`}
                  style={{ paddingLeft: 42, borderColor: form.email && !emailDomainOk ? 'var(--coral)' : undefined }} />
                <Mail size={15} color={form.email && !emailDomainOk ? 'var(--coral)' : 'var(--gray-400)'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Recibirás un código de verificación aquí</span>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña * <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(mín. 4 caracteres)</span></label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showRegPass ? 'text' : 'password'} placeholder="Crea una contraseña"
                  value={form.password} onChange={e => setF('password', e.target.value)}
                  style={{ paddingLeft: 42, paddingRight: 46 }} />
                <Lock size={15} color="var(--gray-400)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <button onClick={() => setShowRegPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0 }}>
                  {showRegPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio (opcional)</label>
              <textarea className="form-input" rows={3}
                placeholder="Me gusta el café, soy muy ordenada y busco un ambiente tranquilo..."
                value={form.bio} onChange={e => setF('bio', e.target.value)} style={{ resize: 'none' }} />
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: 16, marginTop: 8 }}
              onClick={() => { setRegisterError(''); setStep('housing'); }}
              disabled={!canContinueInfo}>
              Continuar <ChevronRight size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span style={{ color: 'var(--gray-500)', fontSize: 14 }}>¿Ya tienes cuenta? </span>
              <button onClick={() => setStep('login')} style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Housing step ── */}
      {step === 'housing' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px 20px 48px' }} className="animate-slide-up">
            <button onClick={() => setStep('info')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)' }}>
              <ArrowLeft size={16} /> Volver
            </button>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>¿Cuál es tu situación?</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: 14 }}>Esto define cómo te emparejamos con otros foráneos</p>

            {(['A', 'B', 'C'] as HousingState[]).map(st => {
              const info = housingStateLabels[st];
              const colors = { A: 'var(--teal)', B: 'var(--purple)', C: 'var(--amber)' };
              const lightColors = { A: 'var(--teal-light)', B: 'var(--purple-light)', C: 'var(--amber-light)' };
              const selected = form.housingState === st;
              return (
                <button key={st} onClick={() => setF('housingState', st)}
                  style={{ width: '100%', textAlign: 'left', padding: '16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${selected ? colors[st] : 'var(--gray-200)'}`, background: selected ? lightColors[st] : 'white', cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 32 }}>{info.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: selected ? colors[st] : 'var(--dark)' }}>{info.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{info.desc}</div>
                  </div>
                  {selected && <CheckCircle size={20} color={colors[st]} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}

            {form.housingState === 'B' && (
              <div style={{ marginTop: 8, padding: 16, background: 'var(--purple-light)', borderRadius: 'var(--radius)' }}>
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

            <div style={{ height: 1, background: 'var(--gray-200)', margin: '20px 0 16px' }} />
            <div className="form-group">
              <label className="form-label">📍 Zona preferida en {selectedUni.city}</label>
              <input className="form-input" placeholder={`Ej: Chapinero, El Poblado, San Fernando…`}
                value={form.preferredZone} onChange={e => setF('preferredZone', e.target.value)} />
              <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Barrio o sector donde preferirías vivir</span>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: 16, marginTop: 8 }} onClick={() => setStep('compatibility')}>
              Continuar <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── Compatibility step ── */}
      {step === 'compatibility' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px 20px 48px' }} className="animate-slide-up">
            <button onClick={() => setStep('housing')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-500)' }}>
              <ArrowLeft size={16} /> Volver
            </button>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Test de compatibilidad</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: 14 }}>Tus respuestas generan el score de compatibilidad con otros foráneos</p>

            <SectionTitle>🌙 Horarios de sueño</SectionTitle>
            <ChoiceGroup label="¿A qué hora te acuestas normalmente?"
              options={[{ value: 'early', label: 'Antes de 10pm' }, { value: 'normal', label: '10-11pm' }, { value: 'late', label: '11pm-1am' }, { value: 'very_late', label: 'Después de 1am' }]}
              value={compat.sleepTime} onChange={v => setC('sleepTime', v)} />
            <ChoiceGroup label="¿A qué hora te despiertas?"
              options={[{ value: 'very_early', label: 'Antes de 6am' }, { value: 'early', label: '6-7am' }, { value: 'normal', label: '7-9am' }, { value: 'late', label: 'Después de 9am' }]}
              value={compat.wakeTime} onChange={v => setC('wakeTime', v)} />

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
            <ChoiceGroup label="¿Estarías dispuesto/a a contratar servicio de limpieza?"
              options={[{ value: 'yes', label: 'Sí, pagaría' }, { value: 'open', label: 'Lo converso' }, { value: 'no', label: 'No, lo hacemos nosotros' }]}
              value={compat.cleaningService ?? 'open'} onChange={v => setC('cleaningService', v)} />

            <SectionTitle>🔊 Ruido y estudio</SectionTitle>
            <ChoiceGroup label="Nivel de ruido que produces normalmente"
              options={[{ value: 'silent', label: 'Silencioso' }, { value: 'quiet', label: 'Tranquilo' }, { value: 'moderate', label: 'Moderado' }, { value: 'loud', label: 'Ruidoso' }]}
              value={compat.noiseLevel} onChange={v => setC('noiseLevel', v)} />
            <ChoiceGroup label="¿Cómo estudias mejor?"
              options={[{ value: 'silence', label: 'En silencio' }, { value: 'ambient', label: 'Ruido ambiental' }, { value: 'music', label: 'Con música' }, { value: 'any', label: 'Me adapto' }]}
              value={compat.studyEnvironment} onChange={v => setC('studyEnvironment', v)} />

            <SectionTitle>🚪 Visitas</SectionTitle>
            <ChoiceGroup label="¿Con qué frecuencia recibes visitas?"
              options={[{ value: 'never', label: 'Nunca' }, { value: 'rarely', label: 'Rara vez' }, { value: 'sometimes', label: 'Seguido' }, { value: 'often', label: 'Muy seguido' }]}
              value={compat.guestsFrequency} onChange={v => setC('guestsFrequency', v)} />
            <BoolChoice label="¿Aceptas que tu roomie tenga visitas que duerman?" value={compat.overnightGuests} onChange={v => setC('overnightGuests', v)} />

            <SectionTitle>💰 Presupuesto</SectionTitle>
            <ChoiceGroup label="Arriendo mensual que puedes pagar (miles COP)"
              options={[{ value: 'under_400', label: '<$400k' }, { value: '400_600', label: '$400-600k' }, { value: '600_800', label: '$600-800k' }, { value: 'over_800', label: '>$800k' }]}
              value={compat.budgetRange} onChange={v => setC('budgetRange', v)} />
            <ChoiceGroup label="¿Cómo prefieres dividir los gastos?"
              options={[{ value: 'strict_50', label: '50/50 exacto' }, { value: 'flexible', label: 'Flexible' }, { value: 'whoever_has_more', label: 'Según ingresos' }]}
              value={compat.expenseSplit} onChange={v => setC('expenseSplit', v)} />

            <SectionTitle>🧑‍🤝‍🧑 Estilo social</SectionTitle>
            <ChoiceGroup label="¿Cómo te describes?"
              options={[{ value: 'introvert', label: 'Introvertido' }, { value: 'ambivert', label: 'Ambivertido' }, { value: 'extrovert', label: 'Extrovertido' }]}
              value={compat.socialStyle} onChange={v => setC('socialStyle', v)} />
            <ChoiceGroup label="Espacios compartidos con roomie"
              options={[{ value: 'prefer_alone', label: 'Prefiero mi espacio' }, { value: 'neutral', label: 'Neutral' }, { value: 'enjoy_together', label: 'Me gusta compartir' }]}
              value={compat.sharedSpaces} onChange={v => setC('sharedSpaces', v)} />

            <SectionTitle>🐾 Mascotas y fumar</SectionTitle>
            <BoolChoice label="¿Tienes mascotas?" value={compat.hasPets} onChange={v => setC('hasPets', v)} />
            <BoolChoice label="¿Aceptas mascotas de tu roomie?" value={compat.acceptsPets} onChange={v => setC('acceptsPets', v)} />
            <BoolChoice label="¿Fumas?" value={compat.smokes} onChange={v => setC('smokes', v)} />
            <BoolChoice label="¿Aceptas que tu roomie fume?" value={compat.acceptsSmoking} onChange={v => setC('acceptsSmoking', v)} />

            {registerError === 'email_exists' && (
              <div style={{ background: 'var(--coral-light)', border: '1px solid var(--coral)', borderRadius: 'var(--radius)', padding: '12px 14px', marginTop: 20 }}>
                <p style={{ color: 'var(--coral)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>⚠️ Ese email ya tiene una cuenta</p>
                <button onClick={() => { setRegisterError(''); setLoginEmail(form.email.trim()); setStep('login'); }}
                  style={{ background: 'var(--coral)', color: 'white', border: 'none', borderRadius: 'var(--radius)', padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Iniciar sesión →
                </button>
              </div>
            )}

            <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal)', borderRadius: 'var(--radius)', padding: '12px 14px', marginTop: 24, marginBottom: 4 }}>
              <p style={{ fontSize: 12, color: 'var(--teal-dark)', fontWeight: 600, marginBottom: 2 }}>📧 Tu email para iniciar sesión:</p>
              <p style={{ fontSize: 14, color: 'var(--teal-dark)', fontWeight: 700 }}>{form.email.trim()}</p>
              <p style={{ fontSize: 11, color: 'var(--teal)', marginTop: 2 }}>Te enviaremos un código de verificación a este correo</p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: 16, marginTop: 12 }}
              onClick={() => void prepareVerification()}>
              Verificar correo y crear perfil ✉️
            </button>
          </div>
        </div>
      )}

      {/* ── Verification step ── */}
      {step === 'verify' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '28px 24px 48px' }} className="animate-slide-up">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-full)', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 36 }}>
                <ShieldCheck size={36} color="var(--teal)" />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Verifica tu correo</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 14, lineHeight: 1.6 }}>
                Enviamos un código de 6 dígitos a<br />
                <strong style={{ color: 'var(--dark)' }}>{form.email.trim()}</strong>
              </p>
            </div>

            {/* Demo mode: show code */}
            <div style={{ background: 'linear-gradient(135deg, #FFF8E1, #FFF3CD)', border: '1.5px solid #FFC107', borderRadius: 'var(--radius-lg)', padding: '14px 16px', marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#856404', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Modo demo — código de prueba</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: '#856404', letterSpacing: 6, textAlign: 'center', fontFamily: 'monospace' }}>{verifCode}</p>
              <p style={{ fontSize: 11, color: '#856404', textAlign: 'center', marginTop: 4 }}>En producción este código llegaría a tu email institucional</p>
            </div>

            <div className="form-group">
              <label className="form-label">Ingresa el código de 6 dígitos</label>
              <input className="form-input"
                type="text" inputMode="numeric" maxLength={6}
                placeholder="_ _ _ _ _ _"
                value={enteredCode}
                onChange={e => { setEnteredCode(e.target.value.replace(/\D/g, '')); setVerifError(''); }}
                style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, letterSpacing: 8, fontFamily: 'monospace' }} />
            </div>

            {verifError && (
              <div style={{ background: 'var(--coral-light)', border: '1px solid var(--coral)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ color: 'var(--coral)', fontSize: 13 }}>⚠️ {verifError}</p>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', padding: 16 }}
              onClick={() => finalizeRegistration(enteredCode)}
              disabled={enteredCode.length !== 6}>
              Verificar y crear cuenta ✅
            </button>

            <button onClick={() => setStep('compatibility')}
              style={{ width: '100%', background: 'none', border: 'none', color: 'var(--gray-500)', fontSize: 14, cursor: 'pointer', marginTop: 16, padding: 8 }}>
              ← Volver atrás
            </button>
          </div>
        </div>
      )}

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
