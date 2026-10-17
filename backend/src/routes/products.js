import express from 'express';
import { db } from '../db/database.js';

export const productsRouter = express.Router();

productsRouter.get('/', (req, res) => {
  const { category, manufacturerId, maxPrice, maxMoq } = req.query;
  let products = db.all('products');

  if (category && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }
  if (manufacturerId) {
    products = products.filter((p) => (p.manufacturer_id || p.manufacturerId) === manufacturerId);
  }
  if (maxPrice) {
    products = products.filter((p) => (p.unit_price || p.unitPrice) <= Number(maxPrice));
  }
  if (maxMoq) {
    products = products.filter((p) => p.moq <= Number(maxMoq));
  }

  res.json({ success: true, count: products.length, data: products });
});

productsRouter.get('/:id', (req, res) => {
  const product = db.get('products', (p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

productsRouter.post('/', (req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const session = db.getSession();

  if (session.role !== 'manufacturer') {
    return res.status(403).json({ error: 'Only manufacturers can publish products' });
  }

  const {
    name,
    category,
    material,
    unitPrice,
    unit_price,
    priceUnit,
    price_unit,
    moq,
    monthlyCapacity,
    monthly_capacity,
    remainingMonthlyCapacity,
    remaining_monthly_capacity,
    leadTimeDays,
    lead_time_days,
    specifications,
    valueProposition,
    deliveryTerms,
    imageUrl,
  } = req.body;

  const finalPrice = Number(unitPrice || unit_price);
  const finalMoq = Number(moq);

  if (!name || isNaN(finalPrice) || isNaN(finalMoq)) {
    return res.status(400).json({ error: 'Valid name, unitPrice, and moq are required' });
  }

  const newProduct = db.insert('products', {
    id: `prod-${Date.now()}`,
    manufacturer_id: currentBusinessId,
    name,
    category: category || 'Industrial Components',
    image_url: imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    material: material || 'Standard MSME Grade',
    specifications: specifications || { 'Tolerance': 'ISO standard' },
    unit_price: finalPrice,
    unitPrice: finalPrice,
    currency: 'INR',
    price_unit: priceUnit || price_unit || 'per piece',
    priceUnit: priceUnit || price_unit || 'per piece',
    moq: finalMoq,
    monthly_capacity: Number(monthlyCapacity || monthly_capacity || 25000),
    monthlyCapacity: Number(monthlyCapacity || monthly_capacity || 25000),
    remaining_monthly_capacity: Number(remainingMonthlyCapacity || remaining_monthly_capacity || 8000),
    remainingMonthlyCapacity: Number(remainingMonthlyCapacity || remaining_monthly_capacity || 8000),
    lead_time_days: Number(leadTimeDays || lead_time_days || 10),
    leadTimeDays: Number(leadTimeDays || lead_time_days || 10),
    value_label: 'Good',
    valueLabel: 'Good',
    value_proposition: valueProposition || 'Direct factory catalog product',
    valueProposition: valueProposition || 'Direct factory catalog product',
    delivery_terms: deliveryTerms || 'Ex-Factory or Door delivery',
    deliveryTerms: deliveryTerms || 'Ex-Factory or Door delivery',
  });

  res.status(201).json({ success: true, data: newProduct });
});

productsRouter.patch('/:id', (req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const product = db.get('products', (p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if ((product.manufacturer_id || product.manufacturerId) !== currentBusinessId) {
    return res.status(403).json({ error: 'Unauthorized: You do not own this product' });
  }

  const updated = db.update('products', req.params.id, req.body);
  res.json({ success: true, data: updated });
});

productsRouter.delete('/:id', (req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const product = db.get('products', (p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if ((product.manufacturer_id || product.manufacturerId) !== currentBusinessId) {
    return res.status(403).json({ error: 'Unauthorized: You do not own this product' });
  }

  db.delete('products', req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});
