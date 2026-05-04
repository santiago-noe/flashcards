const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
  hint: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  timesStudied: { type: Number, default: 0 },
  timesCorrect: { type: Number, default: 0 },
  lastStudied: { type: Date, default: null },
}, { timestamps: true });

const deckSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  course: { type: String, default: 'REDES DE DATOS' },
  category: { type: String, default: 'General' },
  icon: { type: String, default: '📚' },
  color: { type: String, default: '#6366f1' },
  cards: [cardSchema],
  totalStudySessions: { type: Number, default: 0 },
  lastStudied: { type: Date, default: null },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

// Virtual for card count
deckSchema.virtual('cardCount').get(function () {
  return this.cards.length;
});

// Virtual for mastery percentage
deckSchema.virtual('masteryPercent').get(function () {
  if (this.cards.length === 0) return 0;
  const totalCorrect = this.cards.reduce((sum, c) => sum + c.timesCorrect, 0);
  const totalStudied = this.cards.reduce((sum, c) => sum + c.timesStudied, 0);
  if (totalStudied === 0) return 0;
  return Math.round((totalCorrect / totalStudied) * 100);
});

deckSchema.set('toJSON', { virtuals: true });
deckSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Deck', deckSchema);
