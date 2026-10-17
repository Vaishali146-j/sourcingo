import express from 'express';
import { db } from '../db/database.js';

export const discoveryRouter = express.Router();

discoveryRouter.get('/', (req, res) => {
  const currentBusinessId = db.getCurrentBusinessId();
  const { sector, maxBudget, maxMoq, geographicReach, state } = req.query;

  const products = db.all('products');
  const businesses = db.all('businesses');
  const swipes = db.all('swipes', (s) => s.actor_business_id === currentBusinessId);

  const swipedTargetIds = new Set(swipes.map((s) => s.target_business_id));

  const offerings = [];

  for (const product of products) {
    const mfgId = product.manufacturer_id || product.manufacturerId;
    const manufacturer = businesses.find((b) => b.id === mfgId);
    if (!manufacturer) continue;

    // RULE: EXCLUDE THE SIGNED-IN USER'S OWN BUSINESS FROM DISCOVERY FEED!
    if (manufacturer.id === currentBusinessId) {
      continue;
    }

    // Exclude previously swiped candidates
    if (swipedTargetIds.has(manufacturer.id)) {
      continue;
    }

    // Sector Filter
    if (sector && sector !== 'all' && product.category !== sector) {
      continue;
    }

    // Budget Filter
    const unitPrice = product.unitPrice || product.unit_price;
    if (maxBudget && unitPrice > Number(maxBudget)) {
      continue;
    }

    // MOQ Filter
    if (maxMoq && product.moq > Number(maxMoq)) {
      continue;
    }

    // State Filter
    if (geographicReach === 'state' && state) {
      if (manufacturer.state.toLowerCase() !== String(state).toLowerCase()) {
        continue;
      }
    }

    offerings.push({
      id: `offering-${manufacturer.id}`,
      manufacturer,
      product: {
        ...product,
        unitPrice: product.unitPrice || product.unit_price,
        priceUnit: product.priceUnit || product.price_unit,
        monthlyCapacity: product.monthlyCapacity || product.monthly_capacity,
        remainingMonthlyCapacity: product.remainingMonthlyCapacity || product.remaining_monthly_capacity,
        leadTimeDays: product.leadTimeDays || product.lead_time_days,
        valueLabel: product.valueLabel || product.value_label || 'Good',
        valueProposition: product.valueProposition || product.value_proposition,
        valueExplanation: product.valueExplanation || product.value_explanation,
      },
      compositeScore: product.compositeScore || 90,
      matchReasons: [
        `${manufacturer.city} industrial cluster verified`,
        `Lead time: ${product.leadTimeDays || product.lead_time_days || 10} days`,
      ],
      distanceEstimateKm: 480,
    });
  }

  res.json({
    success: true,
    count: offerings.length,
    data: offerings,
  });
});
