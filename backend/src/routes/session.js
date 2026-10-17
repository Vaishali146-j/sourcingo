import express from 'express';
import { db } from '../db/database.js';

export const sessionRouter = express.Router();

sessionRouter.get('/session', (_req, res) => {
  const session = db.getSession();
  const buyer = db.get('businesses', (b) => b.id === session.buyer_id);
  const manufacturer = db.get('businesses', (b) => b.id === session.manufacturer_id);

  res.json({
    success: true,
    data: {
      session,
      currentBusinessId: db.getCurrentBusinessId(),
      buyer,
      manufacturer,
    },
  });
});

sessionRouter.post('/switch-role', (req, res) => {
  const { role, businessId } = req.body;
  if (role !== 'buyer' && role !== 'manufacturer') {
    return res.status(400).json({ error: 'Role must be buyer or manufacturer' });
  }

  const session = db.setSession(role, businessId);
  const currentBusinessId = db.getCurrentBusinessId();
  const currentBusiness = db.get('businesses', (b) => b.id === currentBusinessId);

  res.json({
    success: true,
    data: {
      session,
      currentBusinessId,
      currentBusiness,
    },
  });
});
