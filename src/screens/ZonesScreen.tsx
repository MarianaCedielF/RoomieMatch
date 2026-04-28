import React, { useState } from 'react';
import { MapPin, Shield, Bus, ChevronRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Zone } from '../types';

function ScoreDots({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <div key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: n <= score ? color : 'var(--gray-200)' }} />
      ))}
    </div>
  );
}

export default function ZonesScreen() {
  const { state } = useApp();
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const cities = ['all', ...Array.from(new Set(state.zones.map(z => z.city)))];
  const filtered = selectedCity === 'all' ? state.zones : state.zones.filter(z => z.city === selectedCity);

  const CITY_FLAGS: Record<string, string> = {
    'Bogotá': '🏙️', 'Medellín': '🌸', 'Cali': '💃', 'Barranquilla': '🎺', 'Manizales': '⛰️', 'Bucaramanga': '🌳',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="page-header">
        <h1 className="page-title">Guía de Zonas</h1>
      </div>

      <div className="page-content" style={{ padding: '0 0 20px' }}>
        {/* City filter */}
        <div style={{ padding: '12px 16px', display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--gray-100)' }}>
          {cities.map(city => (
            <button key={city} onClick={() => setSelectedCity(city)}
              style={{ padding: '7px 14px', borderRadius: 'var(--radius-full)', border: '1.5px solid', borderColor: selectedCity === city ? 'var(--teal)' : 'var(--gray-200)', background: selectedCity === city ? 'var(--teal-light)' : 'white', color: selectedCity === city ? 'var(--teal)' : 'var(--gray-600)', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {city === 'all' ? '🇨🇴 Todas' : `${CITY_FLAGS[city] || '🏘️'} ${city}`}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px' }}>
          {filtered.map(zone => (
            <button key={zone.id} onClick={() => setSelectedZone(zone)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: 12 }}>
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} color="var(--teal)" />
                      <span style={{ fontWeight: 800, fontSize: 16 }}>{zone.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{zone.city}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--teal)' }}>${zone.avgRent}k</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>COP/mes</div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5, marginBottom: 12 }}>{zone.description}</p>

                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Shield size={10} /> Seguridad
                    </div>
                    <ScoreDots score={zone.safetyScore} color="var(--teal)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Bus size={10} /> Transporte
                    </div>
                    <ScoreDots score={zone.transitScore} color="var(--blue)" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {zone.tags.map(tag => (
                    <span key={tag} className="badge badge-gray" style={{ fontSize: 11 }}>{tag}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone detail modal */}
      {selectedZone && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={() => setSelectedZone(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', width: '100%', padding: '24px 20px 48px', maxHeight: '80vh', overflowY: 'auto' }} className="animate-slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 24, fontWeight: 800 }}>{selectedZone.name}</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>{selectedZone.city}</p>
              </div>
              <button onClick={() => setSelectedZone(null)} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 'var(--radius-full)', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--teal-light)', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)' }}>${selectedZone.avgRent}k</div>
                <div style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600 }}>COP/mes</div>
              </div>
              <div style={{ background: '#E6F1FB', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue)' }}>{selectedZone.safetyScore}/5</div>
                <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>Seguridad</div>
              </div>
              <div style={{ background: '#F0FFF4', borderRadius: 'var(--radius)', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#2E7D32' }}>{selectedZone.transitScore}/5</div>
                <div style={{ fontSize: 11, color: '#2E7D32', fontWeight: 600 }}>Transporte</div>
              </div>
            </div>

            <p style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.7, marginBottom: 20 }}>{selectedZone.description}</p>

            {selectedZone.nearUniversities.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🎓 Universidades cercanas</p>
                {selectedZone.nearUniversities.map(uniId => {
                  const uni = { unal: 'Universidad Nacional', uandes: 'Uniandes', 'jav-bog': 'Javeriana', udea: 'U. de Antioquia', eafit: 'EAFIT', icesi: 'ICESI', uninorte: 'U. del Norte', umanizales: 'U. de Manizales' }[uniId];
                  return uni ? <div key={uniId} style={{ fontSize: 13, color: 'var(--gray-600)', padding: '4px 0' }}>• {uni}</div> : null;
                })}
              </div>
            )}

            <div>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🏷️ Características</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {selectedZone.tags.map(tag => <span key={tag} className="badge badge-teal">{tag}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
