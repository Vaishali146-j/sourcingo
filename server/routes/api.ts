import express, { Request, Response } from 'express';
import { db } from '../db/database.ts';
import { GoogleGenAI } from '@google/genai';

export const apiRouter = express.Router();

// Initialize Gemini SDK if API key exists
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// -------------------------------------------------------------
// 1. Health and Demo Session
// -------------------------------------------------------------
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      seeded: db.isSeeded(),
      businessesCount: db.getCollection('businesses').length,
      productsCount: db.getCollection('products').length,
    },
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

apiRouter.get('/demo/session', (_req: Request, res: Response) => {
  const session = db.getSession();
  const buyer = db.findById('businesses', session.buyerId);
  const manufacturer = db.findById('businesses', session.manufacturerId);

  res.json({
    success: true,
    data: {
      session,
      currentBusinessId: db.getCurrentUserBusinessId(),
      buyer,
      manufacturer,
    },
  });
});

apiRouter.post('/demo/switch-role', (req: Request, res: Response) => {
  const { role, businessId } = req.body;
  if (role !== 'buyer' && role !== 'manufacturer') {
    return res.status(400).json({ error: 'Role must be buyer or manufacturer' });
  }

  const updatedSession = db.setSession(role, businessId);
  const currentBusinessId = db.getCurrentUserBusinessId();
  const currentBusiness = db.findById('businesses', currentBusinessId);

  res.json({
    success: true,
    data: {
      session: updatedSession,
      currentBusinessId,
      currentBusiness,
    },
  });
});

// -------------------------------------------------------------
// 2. Businesses and Products
// -------------------------------------------------------------
apiRouter.get('/businesses', (req: Request, res: Response) => {
  const { role, state, city } = req.query;
  let businesses = db.getCollection('businesses');

  if (role) {
    businesses = businesses.filter((b) => b.role === role);
  }
  if (state) {
    businesses = businesses.filter((b) => b.state.toLowerCase() === String(state).toLowerCase());
  }
  if (city) {
    businesses = businesses.filter((b) => b.city.toLowerCase() === String(city).toLowerCase());
  }

  res.json({ success: true, data: businesses });
});

apiRouter.get('/businesses/:id', (req: Request, res: Response) => {
  const business = db.findById('businesses', req.params.id);
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }
  res.json({ success: true, data: business });
});

apiRouter.get('/products', (req: Request, res: Response) => {
  const { category, manufacturerId, maxPrice, maxMoq } = req.query;
  let products = db.getCollection('products');

  if (category && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }
  if (manufacturerId) {
    products = products.filter((p) => p.manufacturerId === manufacturerId);
  }
  if (maxPrice) {
    products = products.filter((p) => p.unitPrice <= Number(maxPrice));
  }
  if (maxMoq) {
    products = products.filter((p) => p.moq <= Number(maxMoq));
  }

  res.json({ success: true, data: products });
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = db.findById('products', req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

apiRouter.post('/products', (req: Request, res: Response) => {
  const session = db.getSession();
  const currentBusinessId = db.getCurrentUserBusinessId();
  const business = db.findById('businesses', currentBusinessId);

  if (session.role !== 'manufacturer' && !business) {
    return res.status(403).json({ error: 'Only manufacturers can publish products' });
  }

  const {
    name,
    category,
    material,
    unitPrice,
    priceUnit,
    moq,
    monthlyCapacity,
    remainingMonthlyCapacity,
    leadTimeDays,
    specifications,
    valueProposition,
    deliveryTerms,
    imageUrl,
  } = req.body;

  if (!name || !unitPrice || !moq) {
    return res.status(400).json({ error: 'Missing required product fields: name, unitPrice, moq' });
  }

  const newProduct = db.insert('products', {
    id: `prod-${Date.now()}`,
    manufacturerId: currentBusinessId,
    name,
    category: category || 'Industrial Components',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    material: material || 'Standard Spec',
    specifications: specifications || { 'Quality Standard': 'Verified MSME Grade' },
    unitPrice: Number(unitPrice),
    currency: 'INR',
    priceUnit: priceUnit || 'per piece',
    moq: Number(moq),
    monthlyCapacity: Number(monthlyCapacity || 25000),
    remainingMonthlyCapacity: Number(remainingMonthlyCapacity || Math.round((monthlyCapacity || 25000) * 0.35)),
    leadTimeDays: Number(leadTimeDays || 10),
    valueLabel: 'Good',
    valueProposition: valueProposition || 'Direct factory catalog product with verified batch traceability.',
    valueExplanation: 'Competitive cluster pricing backed by verified MSME credentials.',
    certifications: business?.verificationStatus?.certifications || ['ISO 9001:2015'],
    deliveryTerms: deliveryTerms || 'Ex-Factory or Door delivery across India',
    sampleAvailable: true,
    samplePriceInr: Math.round(Number(unitPrice) * 1.5),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({ success: true, data: newProduct });
});

apiRouter.patch('/products/:id', (req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const product = db.findById('products', req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.manufacturerId !== currentBusinessId) {
    return res.status(403).json({ error: 'Unauthorized: You do not own this product' });
  }

  const updated = db.update('products', req.params.id, req.body);
  res.json({ success: true, data: updated });
});

apiRouter.delete('/products/:id', (req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const product = db.findById('products', req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.manufacturerId !== currentBusinessId) {
    return res.status(403).json({ error: 'Unauthorized: You do not own this product' });
  }

  db.delete('products', req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

// -------------------------------------------------------------
// 3. Discovery Feed (EXCLUDES SIGNED-IN USER'S OWN BUSINESS!)
// -------------------------------------------------------------
apiRouter.get('/discovery', (req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const { sector, maxBudget, maxMoq, geographicReach, state } = req.query;

  const products = db.getCollection('products');
  const businesses = db.getCollection('businesses');
  const swipes = db.getCollection('swipes');

  // Find IDs already swiped by the current user
  const swipedTargetIds = new Set(
    swipes
      .filter((s) => s.actorBusinessId === currentBusinessId)
      .map((s) => s.targetBusinessId)
  );

  // Build unified supplier offerings
  const offerings: any[] = [];

  for (const product of products) {
    const manufacturer = businesses.find((b) => b.id === product.manufacturerId);
    if (!manufacturer) continue;

    // RULE 1: EXCLUDE THE SIGNED-IN USER'S OWN BUSINESS CARDS!
    // Never show the current user's own business in the discovery feed
    if (manufacturer.id === currentBusinessId) {
      continue;
    }

    // Exclude already swiped/shortlisted/passed businesses for this actor
    if (swipedTargetIds.has(manufacturer.id)) {
      continue;
    }

    // Sector Filter
    if (sector && sector !== 'all' && product.category !== sector) {
      continue;
    }

    // Budget Filter
    if (maxBudget && product.unitPrice > Number(maxBudget)) {
      continue;
    }

    // MOQ Filter
    if (maxMoq && product.moq > Number(maxMoq)) {
      continue;
    }

    // Geographic Reach Filter
    if (geographicReach === 'state' && state) {
      if (manufacturer.state.toLowerCase() !== String(state).toLowerCase()) {
        continue;
      }
    }

    offerings.push({
      id: `offering-${manufacturer.id}`,
      manufacturer,
      product,
      compositeScore: product.compositeScore || 90,
      matchReasons: product.matchReasons || [
        `${manufacturer.city} MSME cluster verification`,
        `Lead time: ${product.leadTimeDays} days`,
      ],
      distanceEstimateKm: product.distanceEstimateKm || 500,
    });
  }

  res.json({
    success: true,
    count: offerings.length,
    data: offerings,
  });
});

// -------------------------------------------------------------
// 4. Requirements & Natural Language Parsing
// -------------------------------------------------------------
apiRouter.post('/requirements/parse', async (req: Request, res: Response) => {
  const { requirementText } = req.body;
  if (!requirementText || typeof requirementText !== 'string') {
    return res.status(400).json({ error: 'Valid requirementText is required' });
  }

  if (aiClient) {
    try {
      const prompt = `You are an expert Indian industrial procurement analyst for Sourcingo.
Parse the following buyer procurement requirement into a strict JSON object.
Return ONLY valid JSON matching this schema:
{
  "productCategory": string (e.g. "Textiles & Fabrics", "Industrial Fasteners", "Pumps & Motors", "Automotive Components", "CNC Machining", "Pipes & Fittings", "Electrical Hardware"),
  "material": string or null,
  "quantity": number or null,
  "unit": string or null,
  "maxBudget": number or null,
  "priceUnit": string or null,
  "technicalSpecifications": string[],
  "preferredLocation": {
    "city": string or null,
    "state": string or null,
    "reach": "city" | "state" | "pan-india"
  },
  "deadlineDays": number or null,
  "requiredCertifications": string[],
  "hardConstraints": string[],
  "softPreferences": string[],
  "interpretationSummary": string
}

Buyer requirement: "${requirementText}"`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, source: 'gemini', data: parsed });
    } catch (err) {
      console.error('Gemini parsing error, using deterministic fallback:', err);
    }
  }

  // Deterministic fallback
  const fallback = parseRequirementDeterministic(requirementText);
  return res.json({ success: true, source: 'fallback', data: fallback });
});

// Alias for existing endpoint
apiRouter.post('/parse-requirement', (req: Request, res: Response) => {
  return res.redirect(307, '/api/requirements/parse');
});

apiRouter.post('/requirements', (req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const reqItem = db.insert('buyer_requirements', {
    ...req.body,
    buyerId: currentBusinessId,
    createdAt: new Date().toISOString(),
  });
  res.status(201).json({ success: true, data: reqItem });
});

apiRouter.get('/requirements', (_req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const requirements = db
    .getCollection('buyer_requirements')
    .filter((r) => r.buyerId === currentBusinessId);
  res.json({ success: true, data: requirements });
});

// -------------------------------------------------------------
// 5. Swipes & Mutual Matching Logic (Server Authoritative)
// -------------------------------------------------------------
apiRouter.post('/swipes', (req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const { targetBusinessId, targetOfferingId, action } = req.body;

  if (!targetBusinessId || !action) {
    return res.status(400).json({ error: 'targetBusinessId and action are required' });
  }

  // RULE: Users cannot swipe on themselves!
  if (targetBusinessId === currentBusinessId) {
    return res.status(400).json({ error: 'Cannot swipe on your own business' });
  }

  // Prevent duplicate swipe
  const existingSwipe = db.getCollection('swipes').find(
    (s) => s.actorBusinessId === currentBusinessId && s.targetBusinessId === targetBusinessId
  );

  if (existingSwipe) {
    return res.json({ success: true, message: 'Already recorded', swipe: existingSwipe, matched: false });
  }

  const newSwipe = db.insert('swipes', {
    id: `swipe-${Date.now()}`,
    actorBusinessId: currentBusinessId,
    targetBusinessId,
    targetOfferingId,
    action,
    createdAt: new Date().toISOString(),
  });

  // MUTUAL MATCHING RULE ENFORCED ON SERVER:
  // A genuine mutual match occurs ONLY when:
  // 1. Both businesses have expressed interest in each other, OR
  // 2. The target business has a reciprocal acceptance rule for high-tier verified buyers (rating >= 4.8, payment score >= 95).
  let isMutualMatch = false;
  let matchRecord: any = null;

  if (action === 'shortlist' || action === 'rfq') {
    const actorBusiness = db.findById('businesses', currentBusinessId);
    const targetBusiness = db.findById('businesses', targetBusinessId);

    // Check if target business previously swiped/expressed interest in actor
    const reverseInterest = db.getCollection('interests').find(
      (i) => i.manufacturerId === targetBusinessId && i.buyerId === currentBusinessId
    );

    const reverseSwipe = db.getCollection('swipes').find(
      (s) => s.actorBusinessId === targetBusinessId && s.targetBusinessId === currentBusinessId
    );

    // Reciprocal criteria
    const meetsReciprocalRule =
      actorBusiness?.rating >= 4.8 &&
      actorBusiness?.paymentReliability?.score >= 95 &&
      ['mfg-sabarmati', 'mfg-apex', 'mfg-peenya'].includes(targetBusinessId);

    if (reverseInterest || reverseSwipe || meetsReciprocalRule) {
      isMutualMatch = true;

      // Check if match already exists
      const existingMatch = db.getCollection('matches').find(
        (m) =>
          (m.buyerId === currentBusinessId && m.manufacturerId === targetBusinessId) ||
          (m.buyerId === targetBusinessId && m.manufacturerId === currentBusinessId)
      );

      if (!existingMatch) {
        // Find product offering
        const product = db.getCollection('products').find((p) => p.manufacturerId === targetBusinessId);

        matchRecord = db.insert('matches', {
          id: `match-${Date.now()}`,
          buyerId: currentBusinessId,
          manufacturerId: targetBusinessId,
          buyerBusiness: actorBusiness,
          manufacturerBusiness: targetBusiness,
          matchedOffering: {
            id: `offering-${targetBusinessId}`,
            manufacturer: targetBusiness,
            product,
          },
          status: 'active',
          createdAt: new Date().toISOString(),
          unreadCount: 0,
          lastMessage: `Connected! ${targetBusiness?.name} accepted reciprocal interest.`,
          lastMessageTimestamp: 'Just now',
          messages: [
            {
              id: `msg-${Date.now()}`,
              senderId: 'system',
              senderName: 'Sourcingo Match Engine',
              text: `Mutual connection established! ${targetBusiness?.name} and ${actorBusiness?.name} have reciprocal verified interest.`,
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
    swipe: newSwipe,
    matched: isMutualMatch,
    match: matchRecord,
  });
});

apiRouter.get('/swipes', (_req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const swipes = db
    .getCollection('swipes')
    .filter((s) => s.actorBusinessId === currentBusinessId);
  res.json({ success: true, data: swipes });
});

apiRouter.post('/swipes/undo', (_req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const swipes = db
    .getCollection('swipes')
    .filter((s) => s.actorBusinessId === currentBusinessId);

  if (swipes.length === 0) {
    return res.status(400).json({ error: 'No swipes to undo' });
  }

  const lastSwipe = swipes[swipes.length - 1];
  db.delete('swipes', lastSwipe.id);

  // If this swipe created a match, remove it as well
  const matches = db.getCollection('matches');
  const matchToDelete = matches.find(
    (m) => m.buyerId === currentBusinessId && m.manufacturerId === lastSwipe.targetBusinessId
  );
  if (matchToDelete) {
    db.delete('matches', matchToDelete.id);
  }

  res.json({ success: true, undoneSwipe: lastSwipe });
});

// -------------------------------------------------------------
// 6. Matches & Chat Messages
// -------------------------------------------------------------
apiRouter.get('/matches', (_req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const matches = db
    .getCollection('matches')
    .filter((m) => m.buyerId === currentBusinessId || m.manufacturerId === currentBusinessId);

  res.json({ success: true, data: matches });
});

apiRouter.post('/matches/:id/messages', (req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const sender = db.findById('businesses', currentBusinessId);
  const match = db.findById('matches', req.params.id);

  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Valid message text required' });
  }

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
    lastMessage: `${newMessage.senderName}: ${newMessage.text}`,
    lastMessageTimestamp: 'Just now',
  });

  res.json({ success: true, data: updatedMatch, message: newMessage });
});

apiRouter.post('/interests/accept', (req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const { buyerId, offeringId } = req.body;

  if (!buyerId) {
    return res.status(400).json({ error: 'buyerId is required' });
  }

  const buyer = db.findById('businesses', buyerId);
  const manufacturer = db.findById('businesses', currentBusinessId);
  const product = db.getCollection('products').find((p) => p.manufacturerId === currentBusinessId);

  // Check if match already exists
  const existing = db.getCollection('matches').find(
    (m) => m.buyerId === buyerId && m.manufacturerId === currentBusinessId
  );

  if (existing) {
    return res.json({ success: true, data: existing });
  }

  const newMatch = db.insert('matches', {
    id: `match-${Date.now()}`,
    buyerId,
    manufacturerId: currentBusinessId,
    buyerBusiness: buyer,
    manufacturerBusiness: manufacturer,
    matchedOffering: {
      id: offeringId || `offering-${currentBusinessId}`,
      manufacturer,
      product,
    },
    status: 'active',
    createdAt: new Date().toISOString(),
    unreadCount: 0,
    lastMessage: `${manufacturer?.name} accepted inbound interest. Direct chat is active.`,
    lastMessageTimestamp: 'Just now',
    messages: [
      {
        id: `msg-${Date.now()}`,
        senderId: 'system',
        senderName: 'Sourcingo Match Engine',
        text: `${manufacturer?.name} accepted inbound interest from ${buyer?.name}. Commercial line open.`,
        timestamp: 'Just now',
        isSystemNotice: true,
      },
    ],
  });

  res.json({ success: true, data: newMatch });
});

// -------------------------------------------------------------
// 7. AI Procurement Assistant
// -------------------------------------------------------------
apiRouter.post('/procurement/recommendations', async (req: Request, res: Response) => {
  const { priority, suppliers, buyerRequirement } = req.body;

  if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
    return res.status(400).json({ error: 'At least one supplier is required' });
  }

  // 1. Deterministic scoring
  const selectedPriority = priority || 'Best Overall';

  if (aiClient) {
    try {
      const prompt = `You are a Senior Industrial Sourcing Director at Sourcingo.
Priority: "${selectedPriority}".
Buyer Requirement: ${JSON.stringify(buyerRequirement || {})}
Suppliers: ${JSON.stringify(suppliers, null, 2)}

Provide explainable procurement advice in strict JSON:
{
  "topRecommendationId": string,
  "executiveSummary": string,
  "supplierEvaluations": [
    {
      "supplierId": string,
      "rank": number,
      "badge": string,
      "keyStrengths": string[],
      "tradeOffs": string,
      "riskOrUncertainty": string,
      "recommendedAction": string
    }
  ],
  "procurementTip": string
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, source: 'gemini', data: parsed });
    } catch (err) {
      console.error('Gemini procurement advice error, falling back:', err);
    }
  }

  // Deterministic fallback
  const fallback = generateDeterministicProcurementAdvice(selectedPriority, suppliers);
  return res.json({ success: true, source: 'fallback', data: fallback });
});

// Alias for existing endpoint
apiRouter.post('/procurement-advice', (req: Request, res: Response) => {
  return res.redirect(307, '/api/procurement/recommendations');
});

// -------------------------------------------------------------
// 8. RFQ & Quotation Lifecycle
// -------------------------------------------------------------
apiRouter.post('/rfqs', (req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const buyer = db.findById('businesses', currentBusinessId);

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

  const manufacturer = db.findById('businesses', manufacturerId);
  const rfqCount = db.getCollection('rfqs').length + 101;
  const rfqNumber = `RFQ-IND-2026-${String(rfqCount).padStart(3, '0')}`;

  const newRfq = db.insert('rfqs', {
    id: `rfq-${Date.now()}`,
    rfqNumber,
    buyerId: currentBusinessId,
    buyerName: buyer?.name || 'Enterprise Buyer',
    manufacturerId,
    manufacturerName: manufacturer?.name || 'MSME Manufacturer',
    offeringId: `offering-${manufacturerId}`,
    productId: productId || 'prod-custom',
    productName: productName || 'Industrial Component',
    productCategory: productCategory || 'Components',
    quantity: Number(quantity),
    unit: unit || 'units',
    specifications: specifications || 'Standard spec tolerances',
    deliveryLocation: deliveryLocation || 'Pune, Maharashtra',
    deliveryState: deliveryState || 'Maharashtra',
    requestedDate: requestedDate || '2026-11-15',
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({ success: true, data: newRfq });
});

apiRouter.get('/rfqs', (_req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const session = db.getSession();

  let rfqs = db.getCollection('rfqs');
  if (session.role === 'buyer') {
    rfqs = rfqs.filter((r) => r.buyerId === currentBusinessId);
  } else {
    rfqs = rfqs.filter((r) => r.manufacturerId === currentBusinessId);
  }

  res.json({ success: true, data: rfqs });
});

apiRouter.get('/rfqs/:id', (req: Request, res: Response) => {
  const rfq = db.findById('rfqs', req.params.id);
  if (!rfq) {
    return res.status(404).json({ error: 'RFQ not found' });
  }
  res.json({ success: true, data: rfq });
});

apiRouter.patch('/rfqs/:id/status', (req: Request, res: Response) => {
  const { status, note } = req.body;
  const rfq = db.findById('rfqs', req.params.id);
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

  const updated = db.update('rfqs', req.params.id, {
    status,
    timeline,
  });

  res.json({ success: true, data: updated });
});

apiRouter.post('/rfqs/:id/quotations', (req: Request, res: Response) => {
  const rfq = db.findById('rfqs', req.params.id);
  if (!rfq) {
    return res.status(404).json({ error: 'RFQ not found' });
  }

  const { unitPrice, moq, leadTimeDays, validity, deliveryTerms, notes } = req.body;
  if (!unitPrice) {
    return res.status(400).json({ error: 'unitPrice is required' });
  }

  const quotation = {
    id: `quote-${Date.now()}`,
    rfqId: rfq.id,
    manufacturerId: rfq.manufacturerId,
    unitPrice: Number(unitPrice),
    totalAmount: Number(unitPrice) * rfq.quantity,
    moq: Number(moq || rfq.quantity),
    leadTimeDays: Number(leadTimeDays || 10),
    validity: validity || '15 Days',
    deliveryTerms: deliveryTerms || 'FOR Destination',
    notes: notes || 'Standard commercial quote submitted',
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };

  db.insert('quotations', quotation);

  const timeline = [
    ...(rfq.timeline || []),
    {
      status: 'Quote Received',
      timestamp: 'Just now',
      note: `Manufacturer submitted quotation: ₹${unitPrice}/${rfq.unit} with ${leadTimeDays || 10}d turnaround.`,
    },
  ];

  const updatedRfq = db.update('rfqs', rfq.id, {
    status: 'Quote Received',
    quotation,
    timeline,
  });

  res.status(201).json({ success: true, data: updatedRfq, quotation });
});

apiRouter.post('/quotations/:id/accept', (req: Request, res: Response) => {
  const quote = db.findById('quotations', req.params.id);
  if (!quote) {
    return res.status(404).json({ error: 'Quotation not found' });
  }

  const rfq = db.findById('rfqs', quote.rfqId);
  if (!rfq) {
    return res.status(404).json({ error: 'Associated RFQ not found' });
  }

  db.update('quotations', quote.id, { status: 'accepted' });

  // Create confirmed Order
  const order = db.insert('orders', {
    id: `order-${Date.now()}`,
    rfqId: rfq.id,
    quotationId: quote.id,
    buyerId: rfq.buyerId,
    manufacturerId: rfq.manufacturerId,
    confirmedQuantity: rfq.quantity,
    unitPrice: quote.unitPrice,
    totalAmount: quote.unitPrice * rfq.quantity,
    deliveryLocation: rfq.deliveryLocation,
    status: 'Order Confirmed',
    timeline: [
      {
        status: 'Order Confirmed',
        timestamp: 'Just now',
        note: `Buyer accepted commercial quote at ₹${quote.unitPrice}/${rfq.unit}. Purchase Order initiated.`,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Update RFQ status
  db.update('rfqs', rfq.id, {
    status: 'Order Confirmed',
    timeline: [
      ...(rfq.timeline || []),
      {
        status: 'Order Confirmed',
        timestamp: 'Just now',
        note: `Buyer accepted quote ₹${quote.unitPrice}. PO generated: ${order.id}.`,
      },
    ],
  });

  res.json({ success: true, data: order });
});

// -------------------------------------------------------------
// 9. Orders
// -------------------------------------------------------------
apiRouter.get('/orders', (_req: Request, res: Response) => {
  const currentBusinessId = db.getCurrentUserBusinessId();
  const session = db.getSession();

  let orders = db.getCollection('orders');
  if (session.role === 'buyer') {
    orders = orders.filter((o) => o.buyerId === currentBusinessId);
  } else {
    orders = orders.filter((o) => o.manufacturerId === currentBusinessId);
  }

  res.json({ success: true, data: orders });
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

apiRouter.patch('/orders/:id/status', (req: Request, res: Response) => {
  const { status, note } = req.body;
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const timeline = [
    ...(order.timeline || []),
    {
      status,
      timestamp: 'Just now',
      note: note || `Order transitioned to ${status}`,
    },
  ];

  const updatedOrder = db.update('orders', order.id, {
    status,
    timeline,
  });

  // Also sync with parent RFQ
  db.update('rfqs', order.rfqId, {
    status,
    timeline: [
      ...(db.findById('rfqs', order.rfqId)?.timeline || []),
      {
        status,
        timestamp: 'Just now',
        note: note || `Order transitioned to ${status}`,
      },
    ],
  });

  res.json({ success: true, data: updatedOrder });
});

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function parseRequirementDeterministic(text: string) {
  const lower = text.toLowerCase();
  let productCategory = 'Industrial Components';
  let material: string | null = null;
  const certs: string[] = [];

  if (lower.includes('fabric') || lower.includes('cotton') || lower.includes('yarn') || lower.includes('textile')) {
    productCategory = 'Textiles & Fabrics';
    if (lower.includes('cotton')) material = '100% Combed Cotton';
    if (lower.includes('poly') || lower.includes('polyester')) material = 'Polyester Blend';
  } else if (lower.includes('machin') || lower.includes('cnc') || lower.includes('lathe') || lower.includes('turned')) {
    productCategory = 'CNC Machining & Precision Parts';
    if (lower.includes('steel') || lower.includes('ss')) material = 'SS 316 / Alloy Steel';
    if (lower.includes('aluminum') || lower.includes('aluminium')) material = 'Aluminium 6061-T6';
  } else if (lower.includes('fastener') || lower.includes('bolt') || lower.includes('nut') || lower.includes('screw')) {
    productCategory = 'Industrial Fasteners';
    material = 'High Tensile Grade 8.8 / SS 304';
  } else if (lower.includes('pump') || lower.includes('motor') || lower.includes('rotor') || lower.includes('casting')) {
    productCategory = 'Pumps & Electric Motors';
    material = 'Cast Iron FG 260 / Copper Winding';
  } else if (lower.includes('brass') || lower.includes('valve') || lower.includes('hardware')) {
    productCategory = 'Brass Hardware & Valves';
    material = 'Forged Brass CW617N / C36000';
  } else if (lower.includes('pipe') || lower.includes('tube') || lower.includes('fitting')) {
    productCategory = 'Pipes & Industrial Tubes';
    material = 'Seamless Carbon Steel ASTM A106';
  }

  let quantity: number | null = null;
  let unit: string | null = null;
  const qtyMatch = text.match(/([\d,]+)\s*(meters?|mtrs?|pcs?|pieces?|units?|tons?|tonnes?|kg|sets?)/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1].replace(/,/g, ''), 10);
    unit = qtyMatch[2].toLowerCase();
  }

  let maxBudget: number | null = null;
  let priceUnit: string | null = null;
  const budgetMatch = text.match(/(?:under|below|max|budget of|within|upto|up to)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)\s*(?:per|\/)\s*(meter|piece|pc|kg|unit)?/i);
  if (budgetMatch && budgetMatch[1]) {
    maxBudget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    priceUnit = budgetMatch[2] ? `per ${budgetMatch[2].toLowerCase()}` : 'per unit';
  }

  let state: string | null = null;
  const indianStates = ['Gujarat', 'Punjab', 'Tamil Nadu', 'Maharashtra', 'Karnataka', 'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Haryana'];
  for (const s of indianStates) {
    if (lower.includes(s.toLowerCase())) {
      state = s;
      break;
    }
  }

  let deadlineDays: number | null = null;
  if (lower.includes('week')) {
    const weekMatch = lower.match(/(\d+)\s*weeks?/);
    const weeks = weekMatch ? parseInt(weekMatch[1], 10) : 1;
    deadlineDays = weeks * 7;
  } else if (lower.includes('day')) {
    const dayMatch = lower.match(/(\d+)\s*days?/);
    if (dayMatch) deadlineDays = parseInt(dayMatch[1], 10);
  }

  return {
    productCategory,
    material: material || 'Standard Industrial Grade',
    quantity: quantity || 2500,
    unit: unit || 'units',
    maxBudget: maxBudget || 200,
    priceUnit: priceUnit || 'per unit',
    technicalSpecifications: ['Industrial Grade Tolerance', 'Batch Quality Test Report Required'],
    preferredLocation: {
      city: null,
      state: state || 'Gujarat',
      reach: state ? 'state' : 'pan-india',
    },
    deadlineDays: deadlineDays || 14,
    requiredCertifications: certs.length > 0 ? certs : ['GST Registered', 'ISO 9001:2015'],
    hardConstraints: [
      maxBudget ? `Unit price ≤ ₹${maxBudget}` : '',
      deadlineDays ? `Lead time ≤ ${deadlineDays} days` : '',
    ].filter(Boolean),
    softPreferences: ['Direct Manufacturer', 'Sample Dispatch within 48h'],
    interpretationSummary: `Looking for ${quantity ? quantity.toLocaleString() : 'bulk'} ${unit || 'units'} of ${productCategory}${material ? ` (${material})` : ''}${maxBudget ? ` under ₹${maxBudget} ${priceUnit}` : ''}${state ? ` based in ${state}` : ''}${deadlineDays ? ` delivered within ${deadlineDays} days` : ''}.`,
  };
}

function generateDeterministicProcurementAdvice(priority: string, suppliers: any[]) {
  const sorted = [...suppliers].sort((a, b) => {
    if (priority === 'Lowest Cost') return (a.product?.unitPrice || 0) - (b.product?.unitPrice || 0);
    if (priority === 'Fastest Delivery') return (a.product?.leadTimeDays || 0) - (b.product?.leadTimeDays || 0);
    if (priority === 'Highest Quality') return (b.manufacturer?.rating || 0) - (a.manufacturer?.rating || 0);
    return (b.compositeScore || 85) - (a.compositeScore || 85);
  });

  const top = sorted[0];
  const runnerUp = sorted[1] || sorted[0];

  const evaluations = sorted.map((s, index) => {
    let badge = 'Balanced Candidate';
    if (index === 0) {
      if (priority === 'Lowest Cost') badge = 'Lowest Unit Cost Leader';
      else if (priority === 'Fastest Delivery') badge = 'Fastest Turnaround';
      else if (priority === 'Highest Quality') badge = 'Highest Spec Compliance';
      else badge = 'Best Overall Value Choice';
    }

    const priceDiff = s.product.unitPrice - top.product.unitPrice;
    const leadDiff = s.product.leadTimeDays - top.product.leadTimeDays;

    return {
      supplierId: s.id,
      rank: index + 1,
      badge,
      keyStrengths: [
        `${s.manufacturer.city}, ${s.manufacturer.state} cluster advantage`,
        `Capacity: ${(s.product.monthlyCapacity || 0).toLocaleString()} ${s.product.priceUnit || 'units'}/mo`,
        s.manufacturer.verificationStatus?.isGstVerified ? 'GST Verified Entity' : 'Registered MSME',
      ],
      tradeOffs:
        s.id === top.id && runnerUp && runnerUp.id !== top.id
          ? `Offers superior ${priority.toLowerCase()} alignment. Next competitor ${runnerUp.manufacturer.name} is priced at ₹${runnerUp.product.unitPrice} with ${runnerUp.product.leadTimeDays}d lead time.`
          : `Priced at ₹${s.product.unitPrice} (${priceDiff >= 0 ? `+₹${priceDiff}` : `-₹${Math.abs(priceDiff)}`} vs ${top.manufacturer.name}) with ${s.product.leadTimeDays}d lead time.`,
      riskOrUncertainty:
        s.manufacturer.ratingCount < 10
          ? 'Moderate review count; request production sample batch first.'
          : 'Low risk; established delivery history in cluster.',
      recommendedAction:
        index === 0
          ? 'Issue formal RFQ for sample lot and negotiate volume tiered discount.'
          : 'Keep as active secondary supplier in shortlist.',
    };
  });

  return {
    topRecommendationId: top.id,
    executiveSummary: `Based on your "${priority}" preference, ${top.manufacturer.name} in ${top.manufacturer.city}, ${top.manufacturer.state} is the recommended partner. They quote ₹${top.product.unitPrice} ${top.product.priceUnit} with an estimated ${top.product.leadTimeDays}-day turnaround.`,
    supplierEvaluations: evaluations,
    procurementTip: `In Indian industrial clusters like ${top.manufacturer.city}, MSMEs routinely offer 3-8% cash discounts on milestone-based payments.`,
  };
}
