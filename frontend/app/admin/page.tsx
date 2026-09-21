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

const COURSES: { name: string; icon: string }[] = [
  { name: 'REDES DE DATOS', icon: '🌐' },
  { name: 'DERECHO INFORMÁTICO', icon: '⚖️' },
  { name: 'GESTIÓN DE DATOS E INFORMACIÓN', icon: '🗄️' },
  { name: 'GESTIÓN DE RIESGOS Y SEGURIDAD TI', icon: '🔒' },
  { name: 'INGLÉS', icon: '🇬🇧' },
  { name: 'METODOLOGÍA DE LA INVESTIGACIÓN CIENTÍFICA', icon: '🔬' },
  { name: 'PRUEBA Y ASEGURAMIENTO DE CALIDAD', icon: '🧪' },
];

const STAT_ICONS = ['📚', '🃏', '📖', '🎯'];

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [decks, setDecks] = useState<DeckFull[]>([]);
  const [activeCourse, setActiveCourse] = useState('REDES DE DATOS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editDeck, setEditDeck] = useState<DeckFull | null>(null);

  // Card management state
  const [manageCardsDeck, setManageCardsDeck] = useState<DeckFull | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({ front: '', back: '', hint: '', difficulty: 'medium' });
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [cardTab, setCardTab] = useState<'add' | 'list'>('add');

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
      showToast(editDeck ? '✅ Mazo actualizado' : '✅ Mazo creado');
      setShowModal(false);
      setEditDeck(null);
      setForm({ title: '', description: '', course: 'REDES DE DATOS', category: 'General', icon: '📚', color: '#6366f1' });
      fetchAll();
    } catch (e) { showToast('Error al guardar', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este mazo y todas sus tarjetas?')) return;
    await fetch(`/api/decks/${id}`, { method: 'DELETE' });
    showToast('🗑️ Mazo eliminado');
    fetchAll();
  };

  const handleResetProgress = async () => {
    if (!confirm('¿Reiniciar todo el progreso de estudio? Esta acción no se puede deshacer.')) return;
    await fetch('/api/admin/reset-progress', { method: 'POST' });
    showToast('🔄 Progreso reiniciado');
    fetchAll();
  };

  const handleSeed = async () => {
    await fetch('/api/decks/seed', { method: 'POST' });
    showToast('🌱 Mazos de ejemplo creados');
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
      setCardTab('add');
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
    fetchAll();
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
      showToast(editCardId ? '✅ Tarjeta actualizada' : '✅ Tarjeta añadida');
      if (!editCardId) setCardTab('list');
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
      showToast('🗑️ Tarjeta eliminada');
    } catch (e) {
      showToast('Error al eliminar', 'error');
    }
  };

  const editCard = (card: any) => {
    setEditCardId(card._id);
    setCardForm({ front: card.front, back: card.back, hint: card.hint || '', difficulty: card.difficulty || 'medium' });
    setCardTab('add');
  };

  const filteredDecks = decks.filter(
    d => d.course === activeCourse || (!d.course && activeCourse === 'REDES DE DATOS')
  );

  const difficultyColor: Record<string, string> = {
    easy: 'var(--green)', medium: 'var(--yellow)', hard: 'var(--red)',
  };

  return (
    <div>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      <div className="app-layout" style={{ paddingTop: 24 }}>
        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="sidebar-label">Filtrar por Curso</span>
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

        {/* Content */}
        <main className="main-content">
          <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(true)}>
            ☰ Seleccionar Curso
          </button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.4px' }}>⚙️ Administración</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                Gestiona mazos y tarjetas de tus cursos
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={openNew}>+ Nuevo Mazo</button>
              <button className="btn btn-ghost" onClick={handleSeed}>🌱 Seed</button>
              <button className="btn btn-danger btn-sm" onClick={handleResetProgress}>🔄 Reset</button>
            </div>
          </div>

          {/* Stat Cards */}
          {stats && (
            <div className="admin-grid">
              {[
                { icon: '📚', value: stats.totalDecks, label: 'Mazos' },
                { icon: '🃏', value: stats.totalCards, label: 'Tarjetas' },
                { icon: '📖', value: stats.totalSessions, label: 'Sesiones' },
                { icon: '🎯', value: `${stats.avgMastery}%`, label: 'Dominio Avg' },
              ].map(({ icon, value, label }) => (
                <div key={label} className="admin-stat-card">
                  <span className="stat-icon">{icon}</span>
                  <div className="stat-number">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Deck List */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Mazos en <span style={{ color: 'var(--accent-secondary)' }}>{activeCourse}</span>
            </h2>
            <span style={{
              padding: '2px 10px', borderRadius: 999,
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-secondary)'
            }}>
              {filteredDecks.length}
            </span>
          </div>

          {filteredDecks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</p>
              <p>No hay mazos para este curso.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={openNew}>
                + Crear el primero
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredDecks.map(deck => (
                <div
                  key={deck._id}
                  className="admin-deck-row"
                  style={{ '--row-color': deck.color } as React.CSSProperties}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{deck.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {deck.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span>🃏 {deck.cardCount} tarjetas</span>
                        <span>📁 {deck.category}</span>
                        <span style={{ color: deck.masteryPercent >= 80 ? 'var(--green)' : deck.masteryPercent >= 40 ? 'var(--yellow)' : 'var(--text-muted)' }}>
                          🎯 {deck.masteryPercent}% dominio
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openManageCards(deck)}>
                      🃏 Tarjetas
                    </button>
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
            <h2>{editDeck ? '✏️ Editar Mazo' : '+ Nuevo Mazo'}</h2>
            <div className="form-group">
              <label>Título</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ej: Modelo OSI" autoFocus />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe el contenido del mazo..." />
            </div>
            <div className="form-group">
              <label>Curso</label>
              <select className="form-input form-select" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}>
                {COURSES.map(({ name, icon }) => (
                  <option key={name} value={name}>{icon} {name}</option>
                ))}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                  style={{ width: 48, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{form.color}</span>
              </div>
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
          <div className="modal" style={{ maxWidth: 740 }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ marginBottom: 4 }}>{manageCardsDeck.icon} {manageCardsDeck.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {manageCardsDeck.cards.length} tarjeta{manageCardsDeck.cards.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={closeCardModal}>✕ Cerrar</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
              {(['add', 'list'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setCardTab(tab)}
                  style={{
                    padding: '9px 18px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: cardTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    color: cardTab === tab ? 'var(--accent-secondary)' : 'var(--text-muted)',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem', fontWeight: 700,
                    cursor: 'pointer',
                    marginBottom: -1,
                    transition: 'color 0.2s',
                  }}
                >
                  {tab === 'add' ? (editCardId ? '✏️ Editar Tarjeta' : '+ Añadir Tarjeta') : `📋 Lista (${manageCardsDeck.cards.length})`}
                </button>
              ))}
            </div>

            {/* Tab: Add/Edit */}
            {cardTab === 'add' && (
              <div>
                <div className="form-group">
                  <label>Pregunta (Frente)</label>
                  <textarea className="form-textarea" style={{ minHeight: 70 }} value={cardForm.front}
                    onChange={e => setCardForm({ ...cardForm, front: e.target.value })}
                    placeholder="¿Cuántas capas tiene el modelo OSI?" autoFocus />
                </div>
                <div className="form-group">
                  <label>Respuesta (Reverso)</label>
                  <textarea className="form-textarea" style={{ minHeight: 70 }} value={cardForm.back}
                    onChange={e => setCardForm({ ...cardForm, back: e.target.value })}
                    placeholder="7 capas: Física, Enlace..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label>Pista (Opcional)</label>
                    <input className="form-input" value={cardForm.hint}
                      onChange={e => setCardForm({ ...cardForm, hint: e.target.value })}
                      placeholder="Ej: Piensa en capas..." />
                  </div>
                  <div className="form-group">
                    <label>Dificultad</label>
                    <select className="form-input form-select" value={cardForm.difficulty}
                      onChange={e => setCardForm({ ...cardForm, difficulty: e.target.value })}>
                      <option value="easy">🟢 Fácil</option>
                      <option value="medium">🟡 Media</option>
                      <option value="hard">🔴 Difícil</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                  {editCardId && (
                    <button className="btn btn-ghost btn-sm" onClick={() => {
                      setEditCardId(null);
                      setCardForm({ front: '', back: '', hint: '', difficulty: 'medium' });
                    }}>Cancelar</button>
                  )}
                  <button className="btn btn-success" onClick={handleSaveCard}
                    disabled={!cardForm.front.trim() || !cardForm.back.trim()}>
                    {editCardId ? 'Actualizar Tarjeta' : '+ Añadir Tarjeta'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab: List */}
            {cardTab === 'list' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 440, overflowY: 'auto', paddingRight: 4 }}>
                {manageCardsDeck.cards.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '2rem', marginBottom: 12 }}>🃏</p>
                    <p>No hay tarjetas aún. Ve a la pestaña <strong>+ Añadir</strong>.</p>
                  </div>
                ) : (
                  manageCardsDeck.cards.map((card, idx) => (
                    <div key={card._id} style={{
                      background: 'var(--bg-secondary)', padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                      borderLeft: `3px solid ${difficultyColor[card.difficulty] || 'var(--text-muted)'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          #{idx + 1} · {card.difficulty === 'easy' ? '🟢 Fácil' : card.difficulty === 'hard' ? '🔴 Difícil' : '🟡 Media'}
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" style={{ padding: '4px 10px' }} onClick={() => editCard(card)}>✏️</button>
                          <button className="btn btn-danger btn-sm" style={{ padding: '4px 10px' }} onClick={() => handleDeleteCard(card._id)}>🗑️</button>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' }}>P: {card.front}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.45 }}>R: {card.back}</div>
                      {card.hint && (
                        <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--yellow)' }}>💡 {card.hint}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
