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

export default function HomePage() {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeCourse, setActiveCourse] = useState('REDES DE DATOS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const COURSES = [
    'DERECHO INFORMÁTICO',
    'GESTIÓN DE DATOS E INFORMACIÓN',
    'GESTIÓN DE RIESGOS Y SEGURIDAD TI',
    'INGLÉS',
    'METODOLOGÍA DE LA INVESTIGACIÓN CIENTÍFICA',
    'PRUEBA Y ASEGURAMIENTO DE CALIDAD',
    'REDES DE DATOS',
  ];

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

  return (
    <>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      <div className="app-layout" style={{ paddingTop: 24 }}>
        {/* Course Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>📚 Mis Cursos</h3>
            <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>
          </div>
          {COURSES.map(course => (
            <button 
              key={course}
              onClick={() => { setActiveCourse(course); setIsSidebarOpen(false); }}
              className={`btn ${activeCourse === course ? 'btn-primary' : 'btn-ghost'}`}
              style={{ textAlign: 'left', padding: '12px 16px', justifyContent: 'flex-start', whiteSpace: 'normal', height: 'auto', lineHeight: 1.4 }}
            >
              {course}
            </button>
          ))}
        </aside>

        <main className="main-content">
          <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(true)} style={{ marginTop: 0 }}>
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
                <div key={i} className="skeleton" style={{ height: 220 }} />
              ))}
            </div>
          ) : decks.filter(d => d.course === activeCourse || (!d.course && activeCourse === 'REDES DE DATOS')).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '3rem', marginBottom: 16 }}>📭</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>No hay mazos para este curso todavía.</p>
              <button className="btn btn-primary btn-lg" onClick={handleSeed} disabled={seeding}>
                {seeding ? '⏳ Creando...' : '🚀 Cargar Mazos de Ejemplo (Redes)'}
              </button>
            </div>
          ) : (
            <div className="deck-grid">
              {decks.filter(d => d.course === activeCourse || (!d.course && activeCourse === 'REDES DE DATOS')).map((deck) => (
                <a key={deck._id} href={`/study/${deck._id}`}>
                  <div
                    className="deck-card"
                    style={{ '--deck-color': deck.color } as React.CSSProperties}
                  >
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
                  </div>
                </a>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
