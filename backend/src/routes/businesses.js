import express from 'express';
import { db } from '../db/database.js';

export const businessesRouter = express.Router();

businessesRouter.get('/', (req, res) => {
  const { role, state, city } = req.query;
  let businesses = db.all('businesses');

  if (role) {
    businesses = businesses.filter((b) => b.role === role);
  }
  if (state) {
    businesses = businesses.filter((b) => b.state.toLowerCase() === String(state).toLowerCase());
  }
  if (city) {
    businesses = businesses.filter((b) => b.city.toLowerCase() === String(city).toLowerCase());
  }

  res.json({ success: true, count: businesses.length, data: businesses });
});

businessesRouter.get('/:id', (req, res) => {
  const business = db.get('businesses', (b) => b.id === req.params.id);
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }
  res.json({ success: true, data: business });
});
