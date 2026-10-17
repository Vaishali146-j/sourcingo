import express from 'express';
import { db } from '../db/database.js';

export const rfqsRouter = express.Router();

rfqsRouter.post('/', (req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const buyer = db.get('businesses', (b) => b.id === currentBusinessId);

  const {
    manufacturerId,
    productId,
    productName,
    productCategory,
    quantity,
    unit,
    specifications,
    deliveryLocation,
    deliveryState,
    requestedDate,
    targetBudget,
    notes,
  } = req.body;

  if (!manufacturerId || !quantity) {
    return res.status(400).json({ error: 'manufacturerId and quantity are required' });
  }

  const manufacturer = db.get('businesses', (b) => b.id === manufacturerId);
  const rfqCount = db.all('rfqs').length + 101;
  const rfqNumber = `RFQ-IND-2026-${String(rfqCount).padStart(3, '0')}`;

  const newRfq = db.insert('rfqs', {
    id: `rfq-${Date.now()}`,
    rfq_number: rfqNumber,
    rfqNumber,
    buyer_id: currentBusinessId,
    buyerId: currentBusinessId,
    buyer_name: buyer?.name || 'Enterprise Buyer',
    buyerName: buyer?.name || 'Enterprise Buyer',
    manufacturer_id: manufacturerId,
    manufacturerId,
    manufacturer_name: manufacturer?.name || 'MSME Manufacturer',
    manufacturerName: manufacturer?.name || 'MSME Manufacturer',
    offering_id: `offering-${manufacturerId}`,
    offeringId: `offering-${manufacturerId}`,
    product_id: productId || 'prod-custom',
    productId: productId || 'prod-custom',
    product_name: productName || 'Industrial Component',
    productName: productName || 'Industrial Component',
    product_category: productCategory || 'Components',
    productCategory: productCategory || 'Components',
    quantity: Number(quantity),
    unit: unit || 'units',
    specifications: specifications || 'Standard tolerances',
    delivery_location: deliveryLocation || 'Pune, Maharashtra',
    deliveryLocation: deliveryLocation || 'Pune, Maharashtra',
    delivery_state: deliveryState || 'Maharashtra',
    deliveryState: deliveryState || 'Maharashtra',
    requested_date: requestedDate || '2026-11-15',
    requestedDate: requestedDate || '2026-11-15',
    target_budget: targetBudget ? Number(targetBudget) : undefined,
    targetBudget: targetBudget ? Number(targetBudget) : undefined,
    notes,
    status: 'RFQ Requested',
    timeline: [
      {
        status: 'RFQ Requested',
        timestamp: 'Just now',
        note: `Procurement inquiry submitted for ${Number(quantity).toLocaleString()} ${unit || 'units'}.`,
      },
    ],
  });

  res.status(201).json({ success: true, data: newRfq });
});

rfqsRouter.get('/', (_req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const session = db.getSession();

  let rfqs = db.all('rfqs');
  if (session.role === 'buyer') {
    rfqs = rfqs.filter((r) => (r.buyer_id || r.buyerId) === currentBusinessId);
  } else {
    rfqs = rfqs.filter((r) => (r.manufacturer_id || r.manufacturerId) === currentBusinessId);
  }

  res.json({ success: true, count: rfqs.length, data: rfqs });
});

rfqsRouter.get('/:id', (req, res) => {
  const rfq = db.get('rfqs', (r) => r.id === req.params.id);
  if (!rfq) {
    return res.status(404).json({ error: 'RFQ not found' });
  }
  res.json({ success: true, data: rfq });
});

rfqsRouter.patch('/:id/status', (req, res) => {
  const { status, note } = req.body;
  const rfq = db.get('rfqs', (r) => r.id === req.params.id);
  if (!rfq) {
    return res.status(404).json({ error: 'RFQ not found' });
  }

  const timeline = [
    ...(rfq.timeline || []),
    {
      status,
      timestamp: 'Just now',
      note: note || `Status transitioned to ${status}`,
    },
  ];

  const updated = db.update('rfqs', rfq.id, {
    status,
    timeline,
  });

  res.json({ success: true, data: updated });
});

rfqsRouter.post('/:id/quotations', (req, res) => {
  const rfq = db.get('rfqs', (r) => r.id === req.params.id);
  if (!rfq) {
    return res.status(404).json({ error: 'RFQ not found' });
  }

  const { unitPrice, unit_price, moq, leadTimeDays, lead_time_days, validity, deliveryTerms, delivery_terms, notes } = req.body;
  const price = Number(unitPrice || unit_price);
  if (!price) {
    return res.status(400).json({ error: 'Valid unitPrice is required' });
  }

  const quotation = {
    id: `quote-${Date.now()}`,
    rfq_id: rfq.id,
    rfqId: rfq.id,
    manufacturer_id: rfq.manufacturer_id || rfq.manufacturerId,
    manufacturerId: rfq.manufacturer_id || rfq.manufacturerId,
    unit_price: price,
    unitPrice: price,
    total_amount: price * rfq.quantity,
    totalAmount: price * rfq.quantity,
    moq: Number(moq || rfq.quantity),
    lead_time_days: Number(leadTimeDays || lead_time_days || 10),
    leadTimeDays: Number(leadTimeDays || lead_time_days || 10),
    validity: validity || '15 Days',
    delivery_terms: deliveryTerms || delivery_terms || 'FOR Destination',
    deliveryTerms: deliveryTerms || delivery_terms || 'FOR Destination',
    notes: notes || 'Commercial quotation submitted',
    status: 'pending',
    submitted_at: new Date().toISOString(),
  };

  db.insert('quotations', quotation);

  const timeline = [
    ...(rfq.timeline || []),
    {
      status: 'Quote Received',
      timestamp: 'Just now',
      note: `Manufacturer quoted ₹${price}/${rfq.unit} with ${quotation.leadTimeDays}d turnaround.`,
    },
  ];

  const updatedRfq = db.update('rfqs', rfq.id, {
    status: 'Quote Received',
    quotation,
    timeline,
  });

  res.status(201).json({ success: true, data: updatedRfq, quotation });
});
