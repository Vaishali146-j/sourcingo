import express from 'express';
import { db } from '../db/database.js';

export const matchesRouter = express.Router();

matchesRouter.get('/', (_req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const matches = db.all(
    'matches',
    (m) => m.buyer_id === currentBusinessId || m.manufacturer_id === currentBusinessId
  );
  res.json({ success: true, count: matches.length, data: matches });
});

matchesRouter.post('/:id/messages', (req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const match = db.get('matches', (m) => m.id === req.params.id);

  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Valid message text required' });
  }

  const sender = db.get('businesses', (b) => b.id === currentBusinessId);
  const newMessage = {
    id: `msg-${Date.now()}`,
    senderId: currentBusinessId,
    senderName: sender?.contact?.name || sender?.name || 'User',
    text: text.trim(),
    timestamp: 'Just now',
  };

  const updatedMessages = [...(match.messages || []), newMessage];
  const updatedMatch = db.update('matches', match.id, {
    messages: updatedMessages,
    last_message: `${newMessage.senderName}: ${newMessage.text}`,
    last_message_timestamp: 'Just now',
  });

  res.json({ success: true, data: updatedMatch, message: newMessage });
});

matchesRouter.post('/accept-interest', (req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const { buyerId, offeringId } = req.body;

  if (!buyerId) {
    return res.status(400).json({ error: 'buyerId is required' });
  }

  const buyer = db.get('businesses', (b) => b.id === buyerId);
  const manufacturer = db.get('businesses', (b) => b.id === currentBusinessId);
  const product = db.get('products', (p) => (p.manufacturer_id || p.manufacturerId) === currentBusinessId);

  const existing = db.get('matches', (m) => m.buyer_id === buyerId && m.manufacturer_id === currentBusinessId);
  if (existing) {
    return res.json({ success: true, data: existing });
  }

  const newMatch = db.insert('matches', {
    id: `match-${Date.now()}`,
    buyer_id: buyerId,
    manufacturer_id: currentBusinessId,
    buyerBusiness: buyer,
    manufacturerBusiness: manufacturer,
    matchedOffering: {
      id: offeringId || `offering-${currentBusinessId}`,
      manufacturer,
      product,
    },
    status: 'active',
    unread_count: 0,
    last_message: `${manufacturer?.name} accepted inbound interest. Direct chat is active.`,
    last_message_timestamp: 'Just now',
    messages: [
      {
        id: `msg-${Date.now()}`,
        senderId: 'system',
        senderName: 'Sourcingo Match Engine',
        text: `${manufacturer?.name} accepted inquiry from ${buyer?.name}. Commercial line open.`,
        timestamp: 'Just now',
        isSystemNotice: true,
      },
    ],
  });

  res.json({ success: true, data: newMatch });
});
