import express from 'express';
import { db } from '../db/database.js';

export const ordersRouter = express.Router();

ordersRouter.post('/quotations/:id/accept', (req, res) => {
  const quote = db.get('quotations', (q) => q.id === req.params.id);
  if (!quote) {
    return res.status(404).json({ error: 'Quotation not found' });
  }

  const rfq = db.get('rfqs', (r) => r.id === (quote.rfq_id || quote.rfqId));
  if (!rfq) {
    return res.status(404).json({ error: 'Associated RFQ not found' });
  }

  db.update('quotations', quote.id, { status: 'accepted' });

  // Create confirmed order
  const order = db.insert('orders', {
    id: `order-${Date.now()}`,
    rfq_id: rfq.id,
    quotation_id: quote.id,
    buyer_id: rfq.buyer_id || rfq.buyerId,
    manufacturer_id: rfq.manufacturer_id || rfq.manufacturerId,
    confirmed_quantity: rfq.quantity,
    unit_price: quote.unit_price || quote.unitPrice,
    total_amount: (quote.unit_price || quote.unitPrice) * rfq.quantity,
    delivery_location: rfq.delivery_location || rfq.deliveryLocation,
    status: 'Order Confirmed',
    timeline: [
      {
        status: 'Order Confirmed',
        timestamp: 'Just now',
        note: `Buyer accepted quote at ₹${quote.unit_price || quote.unitPrice}/${rfq.unit}. Purchase Order issued.`,
      },
    ],
  });

  // Update RFQ status
  db.update('rfqs', rfq.id, {
    status: 'Order Confirmed',
    timeline: [
      ...(rfq.timeline || []),
      {
        status: 'Order Confirmed',
        timestamp: 'Just now',
        note: `Buyer confirmed order. Generated PO ID: ${order.id}.`,
      },
    ],
  });

  res.json({ success: true, data: order });
});

ordersRouter.get('/', (_req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const session = db.getSession();

  let orders = db.all('orders');
  if (session.role === 'buyer') {
    orders = orders.filter((o) => (o.buyer_id || o.buyerId) === currentBusinessId);
  } else {
    orders = orders.filter((o) => (o.manufacturer_id || o.manufacturerId) === currentBusinessId);
  }

  res.json({ success: true, count: orders.length, data: orders });
});

ordersRouter.get('/:id', (req, res) => {
  const order = db.get('orders', (o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

ordersRouter.patch('/:id/status', (req, res) => {
  const { status, note } = req.body;
  const order = db.get('orders', (o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const timeline = [
    ...(order.timeline || []),
    {
      status,
      timestamp: 'Just now',
      note: note || `Order status updated to ${status}`,
    },
  ];

  const updatedOrder = db.update('orders', order.id, {
    status,
    timeline,
  });

  // Keep parent RFQ status in sync
  const rfqId = order.rfq_id || order.rfqId;
  const rfq = db.get('rfqs', (r) => r.id === rfqId);
  if (rfq) {
    db.update('rfqs', rfq.id, {
      status,
      timeline: [
        ...(rfq.timeline || []),
        {
          status,
          timestamp: 'Just now',
          note: note || `Order status updated to ${status}`,
        },
      ],
    });
  }

  res.json({ success: true, data: updatedOrder });
});
