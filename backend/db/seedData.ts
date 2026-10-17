import { CURRENT_DEMO_BUYER, MOCK_SUPPLIER_OFFERINGS } from '../../frontend/src/data/mockSuppliers.ts';
import { db } from './database.ts';

export function initializeDatabase() {
  if (db.isSeeded()) {
    console.log('Database already initialized with seed data.');
    return;
  }

  console.log('Seeding database with Indian MSME manufacturers, products, and demo records...');

  const businesses: any[] = [
    CURRENT_DEMO_BUYER,
    ...MOCK_SUPPLIER_OFFERINGS.map((o) => o.manufacturer),
  ];

  const products: any[] = MOCK_SUPPLIER_OFFERINGS.map((o) => ({
    ...o.product,
    offeringId: o.id,
    compositeScore: o.compositeScore,
    matchReasons: o.matchReasons,
    distanceEstimateKm: o.distanceEstimateKm,
  }));

  const initialMatches: any[] = [
    {
      id: 'match-sabarmati-zenith',
      buyerId: CURRENT_DEMO_BUYER.id,
      manufacturerId: 'mfg-sabarmati',
      buyerBusiness: CURRENT_DEMO_BUYER,
      manufacturerBusiness: MOCK_SUPPLIER_OFFERINGS[0].manufacturer,
      matchedOffering: MOCK_SUPPLIER_OFFERINGS[0],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'active',
      unreadCount: 1,
      lastMessage: 'Pareshbhai Patel: We can arrange 50m trial duck canvas dispatched tomorrow.',
      lastMessageTimestamp: 'Yesterday, 4:30 PM',
      messages: [
        {
          id: 'msg-1',
          senderId: 'system',
          senderName: 'Sourcingo Match Engine',
          text: 'Mutual connection established! Both Zenith Industrial and Sabarmati Weaving expressed reciprocal interest in heavy cotton canvas sourcing.',
          timestamp: '2 days ago',
          isSystemNotice: true,
        },
        {
          id: 'msg-2',
          senderId: CURRENT_DEMO_BUYER.id,
          senderName: CURRENT_DEMO_BUYER.contact.name,
          text: 'Greetings Pareshbhai. We are seeking 5,000m of 450 GSM duck canvas for pump protection shroud fabrication.',
          timestamp: '2 days ago',
        },
        {
          id: 'msg-3',
          senderId: 'mfg-sabarmati',
          senderName: 'Pareshbhai Patel',
          text: 'Namaste Vikramadityaji. We have regular spinning for 450 GSM plain duck. We can arrange 50m trial duck canvas dispatched tomorrow.',
          timestamp: 'Yesterday, 4:30 PM',
        },
      ],
    },
  ];

  const initialRfqs: any[] = [
    {
      id: 'rfq-2026-081',
      rfqNumber: 'RFQ-GJ-2026-081',
      buyerId: CURRENT_DEMO_BUYER.id,
      buyerName: CURRENT_DEMO_BUYER.name,
      manufacturerId: 'mfg-sabarmati',
      manufacturerName: 'Sabarmati Weaving & Technical Fabrics',
      offeringId: 'offering-sabarmati-textiles',
      productId: 'prod-cotton-canvas-5000',
      productName: 'Heavy Industrial Cotton Duck Canvas (450 GSM)',
      productCategory: 'Textiles & Fabrics',
      quantity: 5000,
      unit: 'meters',
      specifications: '450 GSM, DWR Grade 4 water repellent coating, 152 cm roll width, warp tensile > 1800N.',
      deliveryLocation: 'Plot 42, Bhosari MIDC, Pune, Maharashtra',
      deliveryState: 'Maharashtra',
      requestedDate: '2026-11-05',
      targetBudget: 150,
      notes: 'Urgent pilot batch for pump enclosure lines. Need test certificate with shipment.',
      status: 'Quote Received',
      quotation: {
        id: 'quote-sab-081',
        rfqId: 'rfq-2026-081',
        manufacturerId: 'mfg-sabarmati',
        unitPrice: 140,
        totalAmount: 700000,
        moq: 1000,
        leadTimeDays: 10,
        validity: '15 Days (Valid till 2026-11-01)',
        deliveryTerms: 'FOR Bhosari MIDC Pune inclusive of freight & transit insurance.',
        notes: 'Special 1.4% cluster volume concession applied for Zenith Industrial.',
        submittedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        status: 'pending',
      },
      timeline: [
        {
          status: 'RFQ Requested',
          timestamp: '2 days ago',
          note: 'Buyer submitted formal procurement inquiry with technical specs.',
        },
        {
          status: 'Quote Received',
          timestamp: '18 hours ago',
          note: 'Manufacturer submitted formal quotation at ₹140/meter (within target budget).',
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  db.seed({
    businesses,
    products,
    matches: initialMatches,
    rfqs: initialRfqs,
  });

  console.log(`Successfully seeded ${businesses.length} businesses and ${products.length} products.`);
}
