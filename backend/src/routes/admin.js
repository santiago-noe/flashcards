const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');

// GET dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const decks = await Deck.find();
    const totalDecks = decks.length;
    const totalCards = decks.reduce((sum, d) => sum + d.cards.length, 0);
    const totalSessions = decks.reduce((sum, d) => sum + d.totalStudySessions, 0);

    const categories = [...new Set(decks.map(d => d.category))];

    const avgMastery = totalDecks > 0
      ? Math.round(decks.reduce((sum, d) => sum + d.masteryPercent, 0) / totalDecks)
      : 0;

    res.json({
      totalDecks,
      totalCards,
      totalSessions,
      avgMastery,
      categories,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST reset all study progress
router.post('/reset-progress', async (req, res) => {
  try {
    const decks = await Deck.find();
    for (const deck of decks) {
      deck.totalStudySessions = 0;
      deck.lastStudied = null;
      for (const card of deck.cards) {
        card.timesStudied = 0;
        card.timesCorrect = 0;
        card.lastStudied = null;
      }
      await deck.save();
    }
    res.json({ message: 'Progreso reiniciado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
