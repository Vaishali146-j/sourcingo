import express from 'express';
import { db } from '../db/database.js';
import { parseRequirement } from '../services/geminiService.js';

export const requirementsRouter = express.Router();

requirementsRouter.post('/parse', async (req, res) => {
  const { requirementText } = req.body;
  if (!requirementText || typeof requirementText !== 'string') {
    return res.status(400).json({ error: 'Valid requirementText is required' });
  }

  const result = await parseRequirement(requirementText);
  res.json(result);
});

requirementsRouter.post('/', (req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const newReq = db.insert('buyer_requirements', {
    ...req.body,
    buyer_id: currentBusinessId,
  });
  res.status(201).json({ success: true, data: newReq });
});

requirementsRouter.get('/', (_req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const list = db.all('buyer_requirements', (r) => (r.buyer_id || r.buyerId) === currentBusinessId);
  res.json({ success: true, data: list });
});
