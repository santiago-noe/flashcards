const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');

// POST add card to deck
router.post('/:deckId', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.deckId);
    if (!deck) return res.status(404).json({ error: 'Mazo no encontrado' });

    deck.cards.push(req.body);
    await deck.save();
    res.status(201).json(deck);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update card in deck
router.put('/:deckId/:cardId', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.deckId);
    if (!deck) return res.status(404).json({ error: 'Mazo no encontrado' });

    const card = deck.cards.id(req.params.cardId);
    if (!card) return res.status(404).json({ error: 'Tarjeta no encontrada' });

    Object.assign(card, req.body);
    await deck.save();
    res.json(deck);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE card from deck
router.delete('/:deckId/:cardId', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.deckId);
    if (!deck) return res.status(404).json({ error: 'Mazo no encontrado' });

    deck.cards.pull({ _id: req.params.cardId });
    await deck.save();
    res.json({ message: 'Tarjeta eliminada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
