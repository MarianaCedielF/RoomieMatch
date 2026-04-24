import React, { useState } from 'react';
import { Star, MapPin, BookOpen, Home, LogOut, Edit3, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { HousingState } from '../types';

const HOUSING_INFO = {
  A: { label: 'Sin cuarto ni roomie', color: 'var(--teal)', bg: 'var(--teal-light)', icon: '🔍' },
  B: { label: 'Tengo cuarto disponible', color: 'var(--purple)', bg: 'var(--purple-light)', icon: '🏠' },
  C: { label: 'Tengo roomie, busco cuarto', color: 'var(--amber)', bg: 'var(--amber-light)', icon: '👫' },
};

export default function ProfileScreen() {
  const { state, dispatch } = useApp();
  const [editBio, setEditBio] = useState(false);
  const [bioText, setBioText] = useState(state.currentUser?.bio || '');
  const [showStateModal, setShowStateModal] = useState(false);

  const user = state.currentUser!;
  const myReviews = state.reviews.filter(r => r.toUserId === user.id);
  const housingInfo = HOUSING_INFO[user.housingState];

  function saveBio() {
    dispatch({ type: 'UPDATE_PROFILE', payload: { bio: bioText } });
    setEditBio(false);
  }

  function changeHousingState(newState: HousingState) {
    dispatch({ type: 'UPDATE_HOUSING_STATE', payload: newState });
    setShowStateModal(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-content">
        {/* Hero */}
        <div style={{ background: 'linear-gradient(160deg, #0F6E56, #1D9E75)', padding: '32px 20px 24px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42 }}>
              {user.avatar}
            </div>
            <button onClick={() => dispatch({ type: 'LOGOUT' })}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 'var(--radius)', padding: '8px 12px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <LogOut size={15} /> Salir
            </button>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800 }}>{user.name}</h2>
          <p style={{ opacity: 0.85, fontSize: 14, marginTop: 2 }}>{user.career} · Sem. {user.semester}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, opacity: 0.8, fontSize: 13 }}>
            <MapPin size={13} /> {user.originCity} → {user.university.city}
          </div>
          {user.verified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <CheckCircle size={15} color="#A7F3D0" />
              <span style={{ fontSize: 13, color: '#A7F3D0', fontWeight: 600 }}>Verificado con correo universitario</span>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 20px' }}>
          {/* Housing state */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-700)' }}>Mi situación actual</span>
              <button onClick={() => setShowStateModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)', fontSize: 13, fontWeight: 600 }}>Cambiar</button>
            </div>
            <div style={{ background: housingInfo.bg, borderRadius: 'var(--radius)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{housingInfo.icon}</span>
              <div>
                <p style={{ fontWeight: 700, color: housingInfo.color, fontSize: 14 }}>{housingInfo.label}</p>
                {user.housingDetails && (
                  <p style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 2 }}>
                    {user.housingDetails.neighborhood}, {user.housingDetails.city} · ${user.housingDetails.rent}k COP
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* University */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', borderBottom: '1px solid var(--gray-100)', marginBottom: 12 }}>
            <BookOpen size={16} color="var(--gray-400)" />
            <span style={{ fontSize: 14, color: 'var(--gray-700)' }}>{user.university.name}</span>
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-700)' }}>Bio</span>
              <button onClick={() => editBio ? saveBio() : setEditBio(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                {editBio ? '✅ Guardar' : <><Edit3 size={13} /> Editar</>}
              </button>
            </div>
            {editBio ? (
              <textarea className="form-input" rows={4} value={bioText} onChange={e => setBioText(e.target.value)} style={{ resize: 'none' }} />
            ) : (
              <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.6 }}>{user.bio || 'Sin bio aún. ¡Agrega una para que otros foráneos te conozcan!'}</p>
            )}
          </div>

          {/* Compatibility summary */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-700)', marginBottom: 12 }}>Mis hábitos de convivencia</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: '🌙', label: 'Duerme', value: { early: 'Antes de 10pm', normal: '10-11pm', late: '11pm-1am', very_late: 'Después de 1am' }[user.compatibility.sleepTime] },
                { icon: '🧹', label: 'Limpieza', value: `${user.compatibility.cleanlinessLevel}/5` },
                { icon: '🔊', label: 'Ruido', value: { silent: 'Silencioso', quiet: 'Tranquilo', moderate: 'Moderado', loud: 'Ruidoso' }[user.compatibility.noiseLevel] },
                { icon: '💰', label: 'Presupuesto', value: { under_400: '<$400k', '400_600': '$400-600k', '600_800': '$600-800k', over_800: '>$800k' }[user.compatibility.budgetRange] },
                { icon: '🚪', label: 'Visitas', value: { never: 'Nunca', rarely: 'Rara vez', sometimes: 'Seguido', often: 'Muy seguido' }[user.compatibility.guestsFrequency] },
                { icon: '🧑‍🤝‍🧑', label: 'Social', value: { introvert: 'Introvertido', ambivert: 'Ambivertido', extrovert: 'Extrovertido' }[user.compatibility.socialStyle] },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>{icon} {label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dark)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Matches', value: state.matches.length },
              { label: 'Reseñas', value: myReviews.length },
              { label: 'Score promedio', value: user.reviewScore ? `${user.reviewScore}⭐` : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: '14px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark)' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Reviews received */}
          {myReviews.length > 0 && (
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-700)', marginBottom: 12 }}>Reseñas recibidas</p>
              {myReviews.map(review => (
                <div key={review.id} className="card" style={{ padding: 14, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div className="stars">{'⭐'.repeat(review.score)}</div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{review.score}/5</span>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 'auto' }}>{new Date(review.createdAt).toLocaleDateString('es-CO')}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5 }}>{review.comment}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Limpieza', val: review.categories.cleanliness },
                      { label: 'Ruido', val: review.categories.noise },
                      { label: 'Respeto', val: review.categories.respect },
                      { label: 'Pagos', val: review.categories.payments },
                    ].map(({ label, val }) => (
                      <span key={label} className="badge badge-gray" style={{ fontSize: 11 }}>{label}: {val}/5</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Housing state modal */}
      {showStateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowStateModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', width: '100%', padding: '24px 20px 48px' }} className="animate-slide-up">
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Cambiar situación habitacional</h3>
            {(['A', 'B', 'C'] as HousingState[]).map(s => {
              const info = HOUSING_INFO[s];
              const selected = user.housingState === s;
              return (
                <button key={s} onClick={() => changeHousingState(s)}
                  style={{ width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${selected ? info.color : 'var(--gray-200)'}`, background: selected ? info.bg : 'white', cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{info.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, color: selected ? info.color : 'var(--dark)', fontSize: 14 }}>{info.label}</p>
                  </div>
                  {selected && <CheckCircle size={18} color={info.color} style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
