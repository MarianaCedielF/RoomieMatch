import React, { useState, useRef } from 'react';
import { X, Heart, Star, MapPin, BookOpen, Home, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateCompatibility, getCompatibilityColor, getCompatibilityLabel } from '../utils/compatibility';
import type { UserProfile } from '../types';

const HOUSING_LABELS = { A: 'Busca cuarto y roomie', B: 'Tiene cuarto disponible', C: 'Tiene roomie, busca cuarto' };
const HOUSING_COLORS = { A: 'badge-teal', B: 'badge-purple', C: 'badge-amber' };

export default function DiscoverScreen() {
  const { state, swipeLike, swipePass } = useApp();
  const [showDetail, setShowDetail] = useState<UserProfile | null>(null);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentUser = state.currentUser!;
  const matchedIds = new Set(state.matches.flatMap(m => m.users));

  // Filter: not swiped, not already matched, compatible housing state
  const candidates = state.profiles.filter(p => {
    if (state.swipedIds.includes(p.id)) return false;
    if (matchedIds.has(p.id)) return false;
    // State B can't match with State B
    if (currentUser.housingState === 'B' && p.housingState === 'B') return false;
    // State C looks for State B
    if (currentUser.housingState === 'C') return p.housingState === 'B';
    return true;
  });

  const topCard = candidates[0];
  const nextCard = candidates[1];

  if (!topCard) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Descubrir</h1>
      </div>
      <div className="empty-state" style={{ flex: 1 }}>
        <div className="empty-state-icon">🎉</div>
        <div className="empty-state-title">¡Lo viste todo!</div>
        <div className="empty-state-desc">No hay más perfiles por ahora. Vuelve pronto o revisa tus matches.</div>
      </div>
    </div>
  );

  const compat = calculateCompatibility(currentUser.compatibility, topCard.compatibility);

  function handleLike() {
    setSwipeDir('right');
    const prevMatchCount = state.matches.length;
    setTimeout(() => {
      swipeLike(topCard.id);
      setSwipeDir(null);
      // Check if new match was created (simplified check)
      if (topCard.likedBy.includes(currentUser.id)) {
        setMatchedUser(topCard);
      }
    }, 350);
  }

  function handlePass() {
    setSwipeDir('left');
    setTimeout(() => {
      swipePass(topCard.id);
      setSwipeDir(null);
    }, 350);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Descubrir</h1>
        <span className="badge badge-teal">{candidates.length} disponibles</span>
      </div>

      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
        {/* Cards stack */}
        <div style={{ position: 'relative', flex: 1 }}>
          {/* Next card (behind) */}
          {nextCard && (
            <div style={{ position: 'absolute', inset: 0, transform: 'scale(0.95) translateY(8px)', borderRadius: 'var(--radius-xl)', background: 'var(--gray-100)', zIndex: 0 }} />
          )}

          {/* Top card */}
          <div ref={cardRef} style={{
            position: 'absolute', inset: 0, borderRadius: 'var(--radius-xl)', overflow: 'hidden',
            background: 'white', boxShadow: 'var(--shadow-lg)', zIndex: 1,
            animation: swipeDir === 'left' ? 'swipeLeft 0.35s ease forwards' : swipeDir === 'right' ? 'swipeRight 0.35s ease forwards' : undefined,
          }}>
            {/* Header gradient */}
            <div style={{ background: 'linear-gradient(160deg, #0F6E56, #1D9E75)', padding: '24px 20px 20px', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
                  {topCard.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800 }}>{topCard.name}, {topCard.age}</h2>
                    {topCard.verified && <span style={{ fontSize: 16 }}>✅</span>}
                  </div>
                  <p style={{ opacity: 0.85, fontSize: 13, marginTop: 2 }}>{topCard.career} · Sem. {topCard.semester}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, opacity: 0.85, fontSize: 12 }}>
                    <MapPin size={12} /> {topCard.originCity} → {topCard.university.city}
                  </div>
                </div>
                {/* Compatibility score */}
                <div style={{ flexShrink: 0, textAlign: 'center' }}>
                  <div className="score-ring" style={{ background: getCompatibilityColor(compat.score) }}>
                    {compat.score}%
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{getCompatibilityLabel(compat.label)}</div>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100% - 160px)', padding: '16px 20px' }}>
              {/* Housing state */}
              <div style={{ marginBottom: 12 }}>
                <span className={`badge ${HOUSING_COLORS[topCard.housingState]}`}>{HOUSING_LABELS[topCard.housingState]}</span>
              </div>

              {/* Housing details if B */}
              {topCard.housingState === 'B' && topCard.housingDetails && (
                <div style={{ background: 'var(--purple-light)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Home size={14} color="var(--purple)" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple)' }}>Cuarto disponible</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-700)' }}>
                    {topCard.housingDetails.neighborhood}, {topCard.housingDetails.city} · ${topCard.housingDetails.rent}k COP/mes
                  </p>
                  {topCard.housingDetails.availableFrom && (
                    <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>Disponible desde {topCard.housingDetails.availableFrom}</p>
                  )}
                </div>
              )}

              {/* Bio */}
              <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.6, marginBottom: 14 }}>{topCard.bio}</p>

              {/* University */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                <BookOpen size={14} color="var(--gray-400)" />
                <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{topCard.university.name}</span>
              </div>

              {/* Reviews */}
              {topCard.reviewScore && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <Star size={14} color="#FFC107" fill="#FFC107" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{topCard.reviewScore}</span>
                  <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>({topCard.reviewCount} reseña{(topCard.reviewCount || 0) > 1 ? 's' : ''})</span>
                </div>
              )}

              {/* Compatibility breakdown */}
              <button onClick={() => setShowDetail(topCard)} style={{ width: '100%', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>Ver compatibilidad detallada</span>
                <Info size={15} color="var(--gray-400)" />
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, paddingBottom: 8 }}>
          <button onClick={handlePass} style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', border: '2px solid var(--gray-200)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)', transition: 'transform 0.1s' }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
            <X size={28} color="var(--coral)" strokeWidth={2.5} />
          </button>
          <button onClick={handleLike} style={{ width: 72, height: 72, borderRadius: 'var(--radius-full)', background: 'var(--teal)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(29,158,117,0.35)', transition: 'transform 0.1s' }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}>
            <Heart size={32} color="white" fill="white" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && <CompatibilityModal user={showDetail} currentUser={currentUser} onClose={() => setShowDetail(null)} />}

      {/* Match Modal */}
      {matchedUser && <MatchModal user={matchedUser} onClose={() => setMatchedUser(null)} />}
    </div>
  );
}

function CompatibilityModal({ user, currentUser, onClose }: { user: UserProfile; currentUser: UserProfile; onClose: () => void }) {
  const compat = calculateCompatibility(currentUser.compatibility, user.compatibility);
  const breakdown = [
    { key: 'schedule', label: 'Horarios', icon: '🌙' },
    { key: 'cleanliness', label: 'Limpieza', icon: '🧹' },
    { key: 'noise', label: 'Ruido', icon: '🔊' },
    { key: 'guests', label: 'Visitas', icon: '🚪' },
    { key: 'social', label: 'Estilo social', icon: '🤝' },
    { key: 'budget', label: 'Presupuesto', icon: '💰' },
  ] as const;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', width: '100%', padding: '24px 20px 40px', maxHeight: '80vh', overflowY: 'auto' }} className="animate-slide-up">
        <div style={{ width: 36, height: 4, background: 'var(--gray-200)', borderRadius: 2, margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Compatibilidad con {user.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="score-ring" style={{ background: getCompatibilityColor(compat.score), width: 64, height: 64, fontSize: 20 }}>{compat.score}%</div>
          <div>
            <div style={{ fontWeight: 700, color: getCompatibilityColor(compat.score) }}>{getCompatibilityLabel(compat.label)} compatibilidad</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Basado en tus respuestas</div>
          </div>
        </div>
        {breakdown.map(({ key, label, icon }) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{icon} {label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: getCompatibilityColor(compat.breakdown[key]) }}>{compat.breakdown[key]}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${compat.breakdown[key]}%`, background: getCompatibilityColor(compat.breakdown[key]), borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchModal({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(29,158,117,0.95)', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }} className="animate-fade-in">
      <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
      <h2 style={{ fontSize: 36, fontWeight: 900, color: 'white', marginBottom: 8, textAlign: 'center' }}>¡Es un Match!</h2>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, textAlign: 'center', lineHeight: 1.6, marginBottom: 32 }}>
        Tú y <strong>{user.name}</strong> se dieron like mutuamente.<br />¡Ya pueden chatear!
      </p>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, fontSize: 56 }}>
        <span>🧑</span><span>❤️</span><span>{user.avatar}</span>
      </div>
      <button className="btn btn-primary" style={{ background: 'white', color: 'var(--teal-dark)', padding: '16px 32px', fontSize: 16 }} onClick={onClose}>
        Ver mis matches
      </button>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', marginTop: 16, cursor: 'pointer', fontSize: 14 }}>
        Seguir explorando
      </button>
    </div>
  );
}
