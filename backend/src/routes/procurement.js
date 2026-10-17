import express from 'express';
import { generateProcurementAdvice } from '../services/geminiService.js';

export const procurementRouter = express.Router();

procurementRouter.post('/recommendations', async (req, res) => {
  const { priority, suppliers, buyerRequirement } = req.body;

  if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
    return res.status(400).json({ error: 'At least one supplier is required' });
  }

  const selectedPriority = priority || 'Best Overall';
  const advice = await generateProcurementAdvice(selectedPriority, suppliers, buyerRequirement);
  res.json(advice);
});
