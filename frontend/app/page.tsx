'use client';

import { useEffect, useState } from 'react';

interface DeckSummary {
  _id: string;
  title: string;
  description: string;
  course: string;
  category: string;
  icon: string;
  color: string;
  cardCount: number;
  masteryPercent: number;
  totalStudySessions: number;
  lastStudied: string | null;
}

interface Stats {
  totalDecks: number;
  totalCards: number;
  totalSessions: number;
  avgMastery: number;
}

const COURSES: { name: string; icon: string }[] = [
  { name: 'REDES DE DATOS', icon: '🌐' },
  { name: 'DERECHO INFORMÁTICO', icon: '⚖️' },
  { name: 'GESTIÓN DE DATOS E INFORMACIÓN', icon: '🗄️' },
  { name: 'GESTIÓN DE RIESGOS Y SEGURIDAD TI', icon: '🔒' },
  { name: 'INGLÉS', icon: '🇬🇧' },
  { name: 'METODOLOGÍA DE LA INVESTIGACIÓN CIENTÍFICA', icon: '🔬' },
  { name: 'PRUEBA Y ASEGURAMIENTO DE CALIDAD', icon: '🧪' },
];

function formatLastStudied(dateStr: string | null): string {
  if (!dateStr) return 'Sin estudiar';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 2) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function getMasteryStatus(mastery: number, sessions: number): 'mastered' | 'learning' | 'new' {
  if (sessions === 0) return 'new';
  if (mastery >= 80) return 'mastered';
  return 'learning';
}

const masteryStatusLabel: Record<string, string> = {
  mastered: 'Dominado',
  learning: 'En progreso',
  new: 'Sin estudiar',
};

export default function HomePage() {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeCourse, setActiveCourse] = useState('REDES DE DATOS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [decksRes, statsRes] = await Promise.all([
        fetch('/api/decks'),
        fetch('/api/admin/stats'),
      ]);
      const decksData = await decksRes.json();
      const statsData = await statsRes.json();
      setDecks(Array.isArray(decksData) ? decksData : []);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await fetch('/api/decks/seed', { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('Error seeding:', err);
    } finally {
      setSeeding(false);
    }
  };

  const filteredDecks = decks.filter(
    d => d.course === activeCourse || (!d.course && activeCourse === 'REDES DE DATOS')
  );

  return (
    <>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      <div className="app-layout" style={{ paddingTop: 24 }}>
        {/* Course Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="sidebar-label">Mis Cursos</span>
            <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>
          </div>
          {COURSES.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => { setActiveCourse(name); setIsSidebarOpen(false); }}
              className={`sidebar-item ${activeCourse === name ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{icon}</span>
              {name}
            </button>
          ))}
        </aside>

        <main className="main-content">
          <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(true)}>
            ☰ Seleccionar Curso
          </button>

          <section className="hero" style={{ paddingTop: 20 }}>
            <h1>Centro de Estudio de Sistemas</h1>
            <p>Selecciona tu curso, elige un mazo y comienza a estudiar de forma interactiva.</p>

            {stats && (
              <div className="stats-bar">
                <div className="stat-chip">
                  <span>📚</span>
                  <span className="stat-value">{stats.totalDecks}</span> Mazos
                </div>
                <div className="stat-chip">
                  <span>🃏</span>
                  <span className="stat-value">{stats.totalCards}</span> Tarjetas
                </div>
                <div className="stat-chip">
                  <span>🎯</span>
                  <span className="stat-value">{stats.avgMastery}%</span> Dominio
                </div>
                <div className="stat-chip">
                  <span>📖</span>
                  <span className="stat-value">{stats.totalSessions}</span> Sesiones
                </div>
              </div>
            )}
          </section>

          {loading ? (
            <div className="deck-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="skeleton" style={{ height: 230 }} />
              ))}
            </div>
          ) : filteredDecks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px' }}>
              <p style={{ fontSize: '3.5rem', marginBottom: 16 }}>📭</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '1.1rem', fontWeight: 600 }}>
                Sin mazos para este curso
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.9rem' }}>
                Crea uno desde el panel Admin o carga los de ejemplo.
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSeed}
                disabled={seeding}
                style={{ animation: seeding ? 'none' : 'pulse 2s ease-in-out infinite' }}
              >
                {seeding ? '⏳ Creando...' : '🚀 Cargar Mazos de Ejemplo'}
              </button>
            </div>
          ) : (
            <div className="deck-grid">
              {filteredDecks.map((deck) => {
                const status = getMasteryStatus(deck.masteryPercent, deck.totalStudySessions);
                return (
                  <a key={deck._id} href={`/study/${deck._id}`}>
                    <div
                      className="deck-card"
                      style={{ '--deck-color': deck.color } as React.CSSProperties}
                    >
                      {/* Status dot */}
                      <div
                        className={`deck-status ${status}`}
                        title={masteryStatusLabel[status]}
                      />
                      <span className="category-badge">{deck.category}</span>
                      <div className="deck-icon">{deck.icon}</div>
                      <h3 className="deck-title">{deck.title}</h3>
                      <p className="deck-desc">{deck.description}</p>
                      <div className="deck-meta">
                        <span>🃏 {deck.cardCount} tarjetas</span>
                        <span>📖 {deck.totalStudySessions} sesiones</span>
                        <div className="mastery-bar-container">
                          <div className="mastery-bar">
                            <div
                              className="mastery-bar-fill"
                              style={{ width: `${deck.masteryPercent}%` }}
                            />
                          </div>
                        </div>
                        <span>{deck.masteryPercent}%</span>
                      </div>
                      <div className="last-studied">
                        🕐 {formatLastStudied(deck.lastStudied)}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
