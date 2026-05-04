'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface Card {
  _id: string;
  front: string;
  back: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Deck {
  _id: string;
  title: string;
  icon: string;
  color: string;
  cards: Card[];
}

const difficultyColors: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
};

export default function StudyPage() {
  const params = useParams();
  const id = params?.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<{ cardId: string; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/decks/${id}`)
      .then(r => r.json())
      .then(data => { setDeck(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const currentCard = deck?.cards[currentIndex];
  const total = deck?.cards.length || 0;

  const handleAnswer = useCallback((correct: boolean) => {
    if (!currentCard) return;
    const newResults = [...results, { cardId: currentCard._id, correct }];
    setResults(newResults);
    setIsFlipped(false);
    setShowHint(false);

    if (currentIndex + 1 >= total) {
      // Submit results
      fetch(`/api/decks/${id}/study`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: newResults }),
      }).catch(console.error);
      setFinished(true);
    } else {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  }, [currentCard, currentIndex, total, results, id]);

  const restart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setResults([]);
    setFinished(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(f => !f); }
      if (e.key === 'ArrowRight' && isFlipped) handleAnswer(true);
      if (e.key === 'ArrowLeft' && isFlipped) handleAnswer(false);
      if (e.key === 'h' || e.key === 'H') setShowHint(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFlipped, handleAnswer]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div className="skeleton" style={{ width: 200, height: 30, margin: '0 auto 20px' }} />
        <div className="skeleton" style={{ width: '100%', maxWidth: 600, height: 380, margin: '0 auto' }} />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <p style={{ fontSize: '3rem' }}>😵</p>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0' }}>Mazo no encontrado</p>
        <a href="/" className="btn btn-primary">← Volver</a>
      </div>
    );
  }

  if (finished) {
    const correct = results.filter(r => r.correct).length;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="results-container">
        <p style={{ fontSize: '4rem' }}>
          {percent >= 80 ? '🏆' : percent >= 50 ? '👍' : '💪'}
        </p>
        <div className="results-score">{percent}%</div>
        <p className="results-label">
          {correct} de {total} correctas
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={restart}>🔄 Repetir Mazo</button>
          <a href="/" className="btn btn-ghost btn-lg">← Todos los Mazos</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="study-header">
        <h1>{deck.icon} {deck.title}</h1>
        <div className="study-progress">
          <span>{currentIndex + 1} / {total}</span>
          <div className="progress-bar-wrapper">
            <div
              className="progress-bar-fill"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="flashcard-scene">
          <div
            className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}
            onClick={() => setIsFlipped(f => !f)}
          >
            <div className="flashcard-face flashcard-front">
              <div
                className="difficulty-dot"
                style={{ background: difficultyColors[currentCard?.difficulty || 'medium'] }}
                title={currentCard?.difficulty}
              />
              <span className="flashcard-label">Pregunta</span>
              <p className="flashcard-text">{currentCard?.front}</p>
              {showHint && currentCard?.hint && (
                <p className="flashcard-hint">💡 {currentCard.hint}</p>
              )}
              {!showHint && currentCard?.hint && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 16 }}
                  onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                >
                  💡 Ver pista
                </button>
              )}
            </div>
            <div className="flashcard-face flashcard-back">
              <span className="flashcard-label">Respuesta</span>
              <p className="flashcard-text" style={{ whiteSpace: 'pre-line' }}>
                {currentCard?.back}
              </p>
            </div>
          </div>
        </div>

        <div className="study-controls">
          {!isFlipped ? (
            <>
              <button className="btn btn-primary btn-lg" onClick={() => setIsFlipped(true)}>
                🔄 Voltear Tarjeta
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'center' }}>
                Espacio / Enter
              </span>
            </>
          ) : (
            <>
              <button className="btn btn-danger btn-lg" onClick={() => handleAnswer(false)}>
                ❌ No sabía
              </button>
              <button className="btn btn-success btn-lg" onClick={() => handleAnswer(true)}>
                ✅ ¡La sabía!
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'center' }}>
                ← / →
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
