const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/deckController');

// GET all decks (summaries)
router.get('/', ctrl.getAllDecks);

// POST seed sample decks
router.post('/seed', ctrl.seedDecks);

// GET single deck
router.get('/:id', ctrl.getDeckById);

// POST create deck
router.post('/', ctrl.createDeck);

// PUT update deck
router.put('/:id', ctrl.updateDeck);

// DELETE deck
router.delete('/:id', ctrl.deleteDeck);

// POST record study session
router.post('/:id/study', ctrl.recordStudySession);

module.exports = router;
