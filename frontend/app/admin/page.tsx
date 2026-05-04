'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalDecks: number;
  totalCards: number;
  totalSessions: number;
  avgMastery: number;
  categories: string[];
}

interface DeckFull {
  _id: string;
  title: string;
  description: string;
  course: string;
  category: string;
  icon: string;
  color: string;
  cards: { _id: string; front: string; back: string; hint: string; difficulty: string }[];
  cardCount: number;
  masteryPercent: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [decks, setDecks] = useState<DeckFull[]>([]);
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
  const [showModal, setShowModal] = useState(false);
  const [editDeck, setEditDeck] = useState<DeckFull | null>(null);
  
  // Card management state
  const [manageCardsDeck, setManageCardsDeck] = useState<DeckFull | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({ front: '', back: '', hint: '', difficulty: 'medium' });
  const [editCardId, setEditCardId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', course: 'REDES DE DATOS', category: 'General', icon: '📚', color: '#6366f1',
  });

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      const [sRes, dRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/decks'),
      ]);
      setStats(await sRes.json());
      const data = await dRes.json();
      setDecks(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async () => {
    try {
      const url = editDeck ? `/api/decks/${editDeck._id}` : '/api/decks';
      const method = editDeck ? 'PUT' : 'POST';
      const body = editDeck
        ? { title: form.title, description: form.description, course: form.course, category: form.category, icon: form.icon, color: form.color }
        : { ...form, cards: [] };
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      showToast(editDeck ? 'Mazo actualizado' : 'Mazo creado');
      setShowModal(false);
      setEditDeck(null);
      setForm({ title: '', description: '', course: 'REDES DE DATOS', category: 'General', icon: '📚', color: '#6366f1' });
      fetchAll();
    } catch (e) { showToast('Error al guardar', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este mazo?')) return;
    await fetch(`/api/decks/${id}`, { method: 'DELETE' });
    showToast('Mazo eliminado');
    fetchAll();
  };

  const handleResetProgress = async () => {
    if (!confirm('¿Reiniciar todo el progreso de estudio?')) return;
    await fetch('/api/admin/reset-progress', { method: 'POST' });
    showToast('Progreso reiniciado');
    fetchAll();
  };

  const handleSeed = async () => {
    await fetch('/api/decks/seed', { method: 'POST' });
    showToast('Mazos de ejemplo creados');
    fetchAll();
  };

  const openEdit = (deck: DeckFull) => {
    setEditDeck(deck);
    setForm({ title: deck.title, description: deck.description, course: deck.course || 'REDES DE DATOS', category: deck.category, icon: deck.icon, color: deck.color });
    setShowModal(true);
  };

  const openNew = () => {
    setEditDeck(null);
    setForm({ title: '', description: '', course: activeCourse, category: 'General', icon: '📚', color: '#6366f1' });
    setShowModal(true);
  };

  const openManageCards = async (deck: DeckFull) => {
    try {
      const res = await fetch(`/api/decks/${deck._id}`);
      const fullDeck = await res.json();
      setManageCardsDeck(fullDeck);
      setShowCardModal(true);
    } catch (e) {
      showToast('Error al cargar mazo', 'error');
    }
  };

  const closeCardModal = () => {
    setShowCardModal(false);
    setManageCardsDeck(null);
    setCardForm({ front: '', back: '', hint: '', difficulty: 'medium' });
    setEditCardId(null);
    fetchAll(); // Refresh counts
  };

  const handleSaveCard = async () => {
    if (!manageCardsDeck) return;
    try {
      const url = editCardId 
        ? `/api/cards/${manageCardsDeck._id}/${editCardId}`
        : `/api/cards/${manageCardsDeck._id}`;
      const method = editCardId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardForm)
      });
      const updatedDeck = await res.json();
      setManageCardsDeck(updatedDeck);
      setCardForm({ front: '', back: '', hint: '', difficulty: 'medium' });
      setEditCardId(null);
      showToast(editCardId ? 'Tarjeta actualizada' : 'Tarjeta añadida');
    } catch (e) {
      showToast('Error al guardar tarjeta', 'error');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!manageCardsDeck || !confirm('¿Eliminar esta tarjeta?')) return;
    try {
      await fetch(`/api/cards/${manageCardsDeck._id}/${cardId}`, { method: 'DELETE' });
      const res = await fetch(`/api/decks/${manageCardsDeck._id}`);
      setManageCardsDeck(await res.json());
      showToast('Tarjeta eliminada');
    } catch (e) {
      showToast('Error al eliminar', 'error');
    }
  };
  
  const editCard = (card: any) => {
    setEditCardId(card._id);
    setCardForm({ front: card.front, back: card.back, hint: card.hint || '', difficulty: card.difficulty || 'medium' });
  };

  return (
    <div className="container">
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      <div className="app-layout" style={{ paddingTop: 24 }}>
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Filtro por Curso</h3>
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

        {/* Content */}
        <main className="main-content">
          <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(true)} style={{ marginTop: 0 }}>
            ☰ Seleccionar Curso
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>⚙️ Panel de Administración</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={openNew}>+ Nuevo Mazo</button>
              <button className="btn btn-ghost" onClick={handleSeed}>🌱 Seed</button>
              <button className="btn btn-danger btn-sm" onClick={handleResetProgress}>🔄 Reset</button>
            </div>
          </div>

          {stats && (
            <div className="admin-grid">
              <div className="admin-stat-card">
                <div className="stat-number">{stats.totalDecks}</div>
                <div className="stat-label">Mazos</div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-number">{stats.totalCards}</div>
                <div className="stat-label">Tarjetas</div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-number">{stats.totalSessions}</div>
                <div className="stat-label">Sesiones</div>
              </div>
              <div className="admin-stat-card">
                <div className="stat-number">{stats.avgMastery}%</div>
                <div className="stat-label">Dominio Promedio</div>
              </div>
            </div>
          )}

          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>Mazos en {activeCourse}</h2>
          {decks.filter(d => d.course === activeCourse || (!d.course && activeCourse === 'REDES DE DATOS')).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
              No hay mazos para este curso. Crea uno usando el botón "+ Nuevo Mazo".
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {decks.filter(d => d.course === activeCourse || (!d.course && activeCourse === 'REDES DE DATOS')).map(deck => (
                <div key={deck._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '16px 20px', flexWrap: 'wrap', gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <span style={{ fontSize: '1.5rem' }}>{deck.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{deck.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {deck.cardCount} tarjetas · {deck.category} · {deck.masteryPercent}% dominio
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openManageCards(deck)}>🃏 Tarjetas</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(deck)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(deck._id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Deck Edit/Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editDeck ? 'Editar Mazo' : 'Nuevo Mazo'}</h2>
            <div className="form-group">
              <label>Título</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ej: Modelo OSI" />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe el mazo..." />
            </div>
            <div className="form-group">
              <label>Curso</label>
              <select className="form-input form-select" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}>
                <option value="DERECHO INFORMÁTICO">Derecho Informático</option>
                <option value="GESTIÓN DE DATOS E INFORMACIÓN">Gestión de Datos e Información</option>
                <option value="GESTIÓN DE RIESGOS Y SEGURIDAD TI">Gestión de Riesgos y Seguridad TI</option>
                <option value="INGLÉS">Inglés</option>
                <option value="METODOLOGÍA DE LA INVESTIGACIÓN CIENTÍFICA">Metodología de la Investigación Científica</option>
                <option value="PRUEBA Y ASEGURAMIENTO DE CALIDAD">Prueba y Aseguramiento de Calidad</option>
                <option value="REDES DE DATOS">Redes de Datos</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Categoría</label>
                <input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Ícono (emoji)</label>
                <input className="form-input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Color del acento</label>
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: 60, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!form.title.trim()}>
                {editDeck ? 'Guardar Cambios' : 'Crear Mazo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Cards Modal */}
      {showCardModal && manageCardsDeck && (
        <div className="modal-overlay" onClick={closeCardModal}>
          <div className="modal" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Tarjetas: {manageCardsDeck.title}</h2>
              <button className="btn btn-ghost btn-sm" onClick={closeCardModal}>✕ Cerrar</button>
            </div>

            <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
              {/* Formulario para añadir/editar */}
              <div style={{ background: 'var(--bg-secondary)', padding: 20, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>{editCardId ? 'Editar Tarjeta' : 'Añadir Nueva Tarjeta'}</h3>
                
                <div className="form-group">
                  <label>Pregunta (Frente)</label>
                  <textarea className="form-textarea" style={{ minHeight: 60 }} value={cardForm.front} onChange={e => setCardForm({ ...cardForm, front: e.target.value })} />
                </div>
                
                <div className="form-group">
                  <label>Respuesta (Reverso)</label>
                  <textarea className="form-textarea" style={{ minHeight: 60 }} value={cardForm.back} onChange={e => setCardForm({ ...cardForm, back: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label>Pista (Opcional)</label>
                    <input className="form-input" value={cardForm.hint} onChange={e => setCardForm({ ...cardForm, hint: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Dificultad</label>
                    <select className="form-input form-select" value={cardForm.difficulty} onChange={e => setCardForm({ ...cardForm, difficulty: e.target.value })}>
                      <option value="easy">Fácil</option>
                      <option value="medium">Media</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                  {editCardId && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditCardId(null); setCardForm({ front: '', back: '', hint: '', difficulty: 'medium' }); }}>Cancelar Edición</button>
                  )}
                  <button className="btn btn-success btn-sm" onClick={handleSaveCard} disabled={!cardForm.front.trim() || !cardForm.back.trim()}>
                    {editCardId ? 'Actualizar Tarjeta' : '+ Añadir Tarjeta'}
                  </button>
                </div>
              </div>

              {/* Lista de tarjetas */}
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Tarjetas Existentes ({manageCardsDeck.cards.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
                  {manageCardsDeck.cards.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No hay tarjetas en este mazo aún.</p>
                  ) : (
                    manageCardsDeck.cards.map((card, idx) => (
                      <div key={card._id} style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{idx + 1} • Nivel: {card.difficulty}</span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => editCard(card)}>✏️</button>
                            <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleDeleteCard(card._id)}>🗑️</button>
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>P: {card.front}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>R: {card.back}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
