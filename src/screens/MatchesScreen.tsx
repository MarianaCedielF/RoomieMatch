import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, FileText, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateCompatibility, getCompatibilityColor } from '../utils/compatibility';
import type { Match, UserProfile } from '../types';

type View = 'list' | 'chat' | 'agreement' | 'review';

export default function MatchesScreen() {
  const { state, sendMessage, dispatch, getMatchPartner } = useApp();
  const [view, setView] = useState<View>('list');
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [msgText, setMsgText] = useState('');
  const [agreementForm, setAgreementForm] = useState({
    cleaningSchedule: 'Limpiar cocina y baño cada semana, turnos alternos',
    guestsPolicy: 'Avisar con 24h de anticipación para visitas. No visitas después de las 11pm entre semana',
    noiseHours: 'Silencio entre 11pm y 7am. Música con audífonos después de las 10pm',
    expensesSplit: '50/50 exacto para arriendo y servicios. Gastos personales de cada quien',
    commonAreaRules: 'Dejar la cocina limpia después de cocinar. No dejar objetos personales en zonas comunes',
    otherRules: '',
  });
  const [reviewForm, setReviewForm] = useState({ score: 5, comment: '', cleanliness: 5, noise: 5, respect: 5, payments: 5 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = state.currentUser!;
  const { matches, messages } = state;

  const SUGGESTED_MESSAGES = [
    '¡Hola! ¿Cómo va la búsqueda?',
    '¿Ya tienes claro qué zona buscas?',
    '¿Cuándo necesitas el cuarto?',
    '¿Tienes mascotas o eres alérgico a algo?',
  ];

  useEffect(() => {
    if (view === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [view, messages]);

  function openChat(match: Match) {
    setActiveMatch(match);
    setView('chat');
  }

  function handleSend() {
    if (!msgText.trim() || !activeMatch) return;
    sendMessage(activeMatch.id, msgText.trim());
    setMsgText('');
  }

  function saveAgreement() {
    if (!activeMatch) return;
    const partner = getMatchPartner(activeMatch.id);
    dispatch({
      type: 'CREATE_AGREEMENT',
      payload: {
        id: `ag-${Date.now()}`,
        matchId: activeMatch.id,
        users: [currentUser.id, partner?.id || ''],
        ...agreementForm,
        signedBy: [currentUser.id],
        createdAt: new Date().toISOString(),
      },
    });
    setView('chat');
  }

  function saveReview() {
    if (!activeMatch) return;
    const partner = getMatchPartner(activeMatch.id);
    if (!partner) return;
    dispatch({
      type: 'ADD_REVIEW',
      payload: {
        id: `rev-${Date.now()}`,
        fromUserId: currentUser.id,
        toUserId: partner.id,
        score: reviewForm.score,
        comment: reviewForm.comment,
        categories: { cleanliness: reviewForm.cleanliness, noise: reviewForm.noise, respect: reviewForm.respect, payments: reviewForm.payments },
        createdAt: new Date().toISOString(),
      },
    });
    setView('chat');
  }

  const activeAgreement = activeMatch ? state.agreements.find(a => a.matchId === activeMatch.id) : null;

  // ── List view ──────────────────────────────────────────────────────────────
  if (view === 'list') return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Mis Matches</h1>
        <span className="badge badge-teal">{matches.length}</span>
      </div>
      <div className="page-content" style={{ padding: 16 }}>
        {matches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <div className="empty-state-title">Sin matches aún</div>
            <div className="empty-state-desc">Explora perfiles y cuando haya like mutuo aparecerán aquí.</div>
          </div>
        ) : matches.map(match => {
          const partner = getMatchPartner(match.id);
          if (!partner) return null;
          const lastMsg = match.lastMessage;
          const compat = calculateCompatibility(currentUser.compatibility, partner.compatibility);
          return (
            <button key={match.id} onClick={() => openChat(match)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: 8 }}>
              <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-full)', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{partner.avatar}</div>
                  <div className="score-ring" style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, fontSize: 9, background: getCompatibilityColor(compat.score) }}>{compat.score}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{partner.name}</span>
                    {lastMsg && <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(lastMsg.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lastMsg ? lastMsg.text : `¡Match! — ${partner.university.city}`}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Chat view ──────────────────────────────────────────────────────────────
  if (view === 'chat' && activeMatch) {
    const partner = getMatchPartner(activeMatch.id)!;
    const chatMessages = messages[activeMatch.id] || [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '12px 16px', background: 'white', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={22} />
          </button>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{partner.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{partner.name}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{partner.university.city} · {partner.career}</div>
          </div>
          <button onClick={() => setView('agreement')} title="Acuerdo de convivencia"
            style={{ background: 'var(--teal-light)', border: 'none', borderRadius: 'var(--radius)', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--teal)' }}>
            <FileText size={15} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Acuerdo</span>
          </button>
          <button onClick={() => setView('review')} title="Dejar reseña"
            style={{ background: 'var(--amber-light)', border: 'none', borderRadius: 'var(--radius)', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--amber)' }}>
            <Star size={15} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 80 }}>
          {chatMessages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}>¡Nuevo match con {partner.name}! Empieza la conversación 👋</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SUGGESTED_MESSAGES.map(msg => (
                  <button key={msg} onClick={() => sendMessage(activeMatch.id, msg)}
                    style={{ padding: '10px 16px', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: 13, color: 'var(--gray-700)' }}>
                    {msg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatMessages.map(msg => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMe ? 'var(--teal)' : 'var(--gray-100)', color: isMe ? 'white' : 'var(--dark)', fontSize: 14, lineHeight: 1.5 }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'white', borderTop: '1px solid var(--gray-200)', padding: '10px 16px', display: 'flex', gap: 10 }}>
          <input className="form-input" value={msgText} onChange={e => setMsgText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Escribe un mensaje..." style={{ flex: 1, borderRadius: 'var(--radius-full)' }} />
          <button onClick={handleSend} disabled={!msgText.trim()}
            style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', background: 'var(--teal)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Send size={18} color="white" />
          </button>
        </div>
      </div>
    );
  }

  // ── Agreement view ─────────────────────────────────────────────────────────
  if (view === 'agreement' && activeMatch) {
    const partner = getMatchPartner(activeMatch.id)!;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '12px 16px', background: 'white', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setView('chat')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)' }}><ArrowLeft size={22} /></button>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Acuerdo de convivencia</h2>
        </div>

        <div className="page-content" style={{ padding: '20px 20px 100px' }}>
          {activeAgreement ? (
            <div>
              <div style={{ background: 'var(--teal-light)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>✅</span>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--teal-dark)' }}>Acuerdo activo</p>
                  <p style={{ fontSize: 12, color: 'var(--teal)' }}>Firmado el {new Date(activeAgreement.createdAt).toLocaleDateString('es-CO')}</p>
                </div>
              </div>
              {[
                { label: '🧹 Limpieza', val: activeAgreement.cleaningSchedule },
                { label: '🚪 Visitas', val: activeAgreement.guestsPolicy },
                { label: '🔊 Horarios de ruido', val: activeAgreement.noiseHours },
                { label: '💰 Gastos', val: activeAgreement.expensesSplit },
                { label: '🛋️ Zonas comunes', val: activeAgreement.commonAreaRules },
                { label: '📋 Otras reglas', val: activeAgreement.otherRules },
              ].filter(r => r.val).map(({ label, val }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.5 }}>{val}</p>
                  <hr className="divider" style={{ marginTop: 14 }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                Define las reglas de convivencia con <strong>{partner.name}</strong>. Esto evita conflictos desde el inicio.
              </p>
              {[
                { key: 'cleaningSchedule', label: '🧹 Limpieza y aseo', placeholder: 'Ej: Turnos semanales para limpiar cocina y baño' },
                { key: 'guestsPolicy', label: '🚪 Política de visitas', placeholder: 'Ej: Avisar 24h antes, no visitas después de 11pm' },
                { key: 'noiseHours', label: '🔊 Horarios de silencio', placeholder: 'Ej: Silencio después de las 11pm' },
                { key: 'expensesSplit', label: '💰 División de gastos', placeholder: 'Ej: 50/50 para arriendo y servicios' },
                { key: 'commonAreaRules', label: '🛋️ Zonas comunes', placeholder: 'Ej: Dejar cocina limpia después de cocinar' },
                { key: 'otherRules', label: '📋 Otras reglas', placeholder: 'Cualquier otra regla importante...' },
              ].map(({ key, label, placeholder }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <textarea className="form-input" rows={2} value={agreementForm[key as keyof typeof agreementForm]}
                    onChange={e => setAgreementForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder} style={{ resize: 'none' }} />
                </div>
              ))}
              <button className="btn btn-primary" style={{ width: '100%', padding: 16 }} onClick={saveAgreement}>
                ✅ Crear acuerdo
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Review view ────────────────────────────────────────────────────────────
  if (view === 'review' && activeMatch) {
    const partner = getMatchPartner(activeMatch.id)!;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '12px 16px', background: 'white', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setView('chat')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)' }}><ArrowLeft size={22} /></button>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Reseña de convivencia</h2>
        </div>
        <div className="page-content" style={{ padding: '20px 20px 100px' }}>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 20 }}>
            Califica tu experiencia con <strong>{partner.name}</strong>. Tu reseña es verificada y aparece en su perfil.
          </p>

          <div className="form-group">
            <label className="form-label">Calificación general</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setReviewForm(p => ({ ...p, score: n }))}
                  style={{ flex: 1, padding: '12px 0', border: '2px solid', borderColor: reviewForm.score >= n ? '#FFC107' : 'var(--gray-200)', borderRadius: 'var(--radius)', background: reviewForm.score >= n ? '#FFF8E1' : 'white', cursor: 'pointer', fontSize: 20 }}>
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'cleanliness', label: '🧹 Limpieza' },
            { key: 'noise', label: '🔊 Ruido' },
            { key: 'respect', label: '🤝 Respeto' },
            { key: 'payments', label: '💰 Puntualidad en pagos' },
          ].map(({ key, label }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setReviewForm(p => ({ ...p, [key]: n }))}
                    style={{ flex: 1, padding: '8px 0', border: '2px solid', borderColor: (reviewForm[key as keyof typeof reviewForm] as number) >= n ? 'var(--teal)' : 'var(--gray-200)', borderRadius: 'var(--radius)', background: (reviewForm[key as keyof typeof reviewForm] as number) >= n ? 'var(--teal-light)' : 'white', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: (reviewForm[key as keyof typeof reviewForm] as number) >= n ? 'var(--teal)' : 'var(--gray-400)' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Comentario</label>
            <textarea className="form-input" rows={4} value={reviewForm.comment}
              onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
              placeholder="Cuéntale a otros cómo fue la convivencia..." style={{ resize: 'none' }} />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: 16 }} onClick={saveReview}>
            Publicar reseña
          </button>
        </div>
      </div>
    );
  }

  return null;
}
