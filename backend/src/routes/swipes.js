import express from 'express';
import { db } from '../db/database.js';

export const swipesRouter = express.Router();

swipesRouter.post('/', (req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const { targetBusinessId, targetOfferingId, action } = req.body;

  if (!targetBusinessId || !action) {
    return res.status(400).json({ error: 'targetBusinessId and action are required' });
  }

  // Prevent swiping on own business
  if (targetBusinessId === currentBusinessId) {
    return res.status(400).json({ error: 'Cannot swipe on your own business' });
  }

  // Check if duplicate swipe exists
  const existingSwipe = db.get('swipes', (s) => s.actor_business_id === currentBusinessId && s.target_business_id === targetBusinessId);
  if (existingSwipe) {
    return res.json({ success: true, message: 'Already recorded', swipe: existingSwipe, matched: false });
  }

  const swipe = db.insert('swipes', {
    id: `swipe-${Date.now()}`,
    actor_business_id: currentBusinessId,
    target_business_id: targetBusinessId,
    target_offering_id: targetOfferingId,
    action,
  });

  // Server-authoritative mutual matching check
  let isMutualMatch = false;
  let matchRecord = null;

  if (action === 'shortlist' || action === 'rfq') {
    const actorBusiness = db.get('businesses', (b) => b.id === currentBusinessId);
    const targetBusiness = db.get('businesses', (b) => b.id === targetBusinessId);

    const reverseInterest = db.get('interests', (i) => i.manufacturer_id === targetBusinessId && i.buyer_id === currentBusinessId);
    const reverseSwipe = db.get('swipes', (s) => s.actor_business_id === targetBusinessId && s.target_business_id === currentBusinessId);

    // Reciprocal rules: cluster leaders with verified high-rated buyers
    const meetsReciprocalRule =
      actorBusiness?.rating >= 4.8 &&
      (actorBusiness?.payment_reliability?.score >= 95 || actorBusiness?.paymentReliability?.score >= 95) &&
      ['mfg-sabarmati', 'mfg-apex', 'mfg-peenya'].includes(targetBusinessId);

    if (reverseInterest || reverseSwipe || meetsReciprocalRule) {
      isMutualMatch = true;

      const existingMatch = db.get(
        'matches',
        (m) => (m.buyer_id === currentBusinessId && m.manufacturer_id === targetBusinessId) ||
               (m.buyer_id === targetBusinessId && m.manufacturer_id === currentBusinessId)
      );

      if (!existingMatch) {
        const product = db.get('products', (p) => (p.manufacturer_id || p.manufacturerId) === targetBusinessId);

        matchRecord = db.insert('matches', {
          id: `match-${Date.now()}`,
          buyer_id: currentBusinessId,
          manufacturer_id: targetBusinessId,
          buyerBusiness: actorBusiness,
          manufacturerBusiness: targetBusiness,
          matchedOffering: {
            id: `offering-${targetBusinessId}`,
            manufacturer: targetBusiness,
            product,
          },
          status: 'active',
          unread_count: 0,
          last_message: `Connected! ${targetBusiness?.name} accepted reciprocal interest.`,
          last_message_timestamp: 'Just now',
          messages: [
            {
              id: `msg-${Date.now()}`,
              senderId: 'system',
              senderName: 'Sourcingo Match Engine',
              text: `Reciprocal connection established between ${actorBusiness?.name} and ${targetBusiness?.name}! Direct chat is active.`,
              timestamp: 'Just now',
              isSystemNotice: true,
            },
          ],
        });
      } else {
        matchRecord = existingMatch;
      }
    }
  }

  res.json({
    success: true,
    swipe,
    matched: isMutualMatch,
    match: matchRecord,
  });
});

swipesRouter.get('/', (_req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const swipes = db.all('swipes', (s) => s.actor_business_id === currentBusinessId);
  res.json({ success: true, count: swipes.length, data: swipes });
});

swipesRouter.post('/undo', (_req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const swipes = db.all('swipes', (s) => s.actor_business_id === currentBusinessId);

  if (swipes.length === 0) {
    return res.status(400).json({ error: 'No swipes to undo' });
  }

  const lastSwipe = swipes[swipes.length - 1];
  db.delete('swipes', lastSwipe.id);

  // If a match was created by this swipe, delete it
  const matchToDelete = db.get('matches', (m) => m.buyer_id === currentBusinessId && m.manufacturer_id === lastSwipe.target_business_id);
  if (matchToDelete) {
    db.delete('matches', matchToDelete.id);
  }

  res.json({ success: true, undoneSwipe: lastSwipe });
});
