import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK if API key exists
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

/**
 * Endpoint: Parse natural-language procurement requirements into structured fields
 */
app.post('/api/parse-requirement', async (req: Request, res: Response) => {
  const { requirementText } = req.body;
  if (!requirementText || typeof requirementText !== 'string') {
    return res.status(400).json({ error: 'Valid requirementText is required' });
  }

  // If Gemini API is available, ask it to parse
  if (aiClient) {
    try {
      const prompt = `You are an expert Indian industrial procurement analyst for Sourcingo.
Parse the following buyer procurement requirement into a strict JSON object.
Return ONLY valid JSON matching this schema:
{
  "productCategory": string (e.g. "Textiles & Fabrics", "Industrial Fasteners", "Pumps & Motors", "Automotive Components", "CNC Machining", "Pipes & Fittings", "Electrical Hardware"),
  "material": string or null (e.g. "100% Cotton", "SS 316 Stainless Steel", "Cast Iron FG 260", "Brass C36000", "Cold Rolled Carbon Steel"),
  "quantity": number or null (numeric quantity only),
  "unit": string or null (e.g. "meters", "pieces", "kg", "tons", "sets"),
  "maxBudget": number or null (numeric maximum price/budget per unit or total in INR),
  "priceUnit": string or null (e.g. "per meter", "per piece", "per kg", "total INR"),
  "technicalSpecifications": string[],
  "preferredLocation": {
    "city": string or null,
    "state": string or null (Indian State like "Gujarat", "Punjab", "Tamil Nadu", "Maharashtra", "Karnataka", "Uttar Pradesh", "West Bengal", "Rajasthan", "Haryana"),
    "reach": "city" | "state" | "pan-india"
  },
  "deadlineDays": number or null (delivery deadline in days from now),
  "requiredCertifications": string[],
  "hardConstraints": string[],
  "softPreferences": string[],
  "interpretationSummary": string (1 concise sentence explaining the buyer's procurement need)
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
      console.error('Gemini parsing error, falling back to deterministic parser:', err);
    }
  }

  // Deterministic fallback parser
  const fallback = parseRequirementDeterministic(requirementText);
  return res.json({ success: true, source: 'fallback', data: fallback });
});

/**
 * Endpoint: Explain supplier ranking, trade-offs, and procurement recommendation
 */
app.post('/api/procurement-advice', async (req: Request, res: Response) => {
  const { priority, suppliers, buyerRequirement } = req.body;

  if (!suppliers || !Array.isArray(suppliers) || suppliers.length === 0) {
    return res.status(400).json({ error: 'At least one supplier is required' });
  }

  if (aiClient) {
    try {
      const prompt = `You are a Senior Industrial Sourcing Director at Sourcingo advising an enterprise buyer.
The buyer selected priority: "${priority || 'Best Overall'}".
Requirement: ${JSON.stringify(buyerRequirement || {})}
Eligible Shortlisted Suppliers with calculated scores and verified data:
${JSON.stringify(suppliers, null, 2)}

Provide an explainable, fact-grounded procurement recommendation in strict JSON matching this schema:
{
  "topRecommendationId": string (id of highest ranked supplier),
  "executiveSummary": string (2-3 sentences explaining why the top supplier was selected for this priority),
  "supplierEvaluations": [
    {
      "supplierId": string,
      "rank": number,
      "badge": string (e.g. "Best Value Choice", "Fastest Dispatch", "Lowest Unit Cost", "Highest Quality & Compliance"),
      "keyStrengths": string[],
      "tradeOffs": string (1-2 sentences stating concrete trade-offs vs alternatives, e.g. "Cheapest unit price but 5 days longer lead time than Supplier B"),
      "riskOrUncertainty": string (or "None identified" / "Document verification pending"),
      "recommendedAction": string (e.g. "Request RFQ with test sample", "Issue PO for trial batch", "Clarify delivery terms")
    }
  ],
  "procurementTip": string (practical advice for negotiating with Indian MSMEs in this category)
}

RULES:
- Do NOT invent certifications, prices, or scores not provided in the input.
- Distinguish between verified facts and manufacturer claims.
- Return ONLY valid JSON.`;

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

  // Deterministic fallback advice generator
  const fallback = generateDeterministicProcurementAdvice(priority, suppliers);
  return res.json({ success: true, source: 'fallback', data: fallback });
});

// Deterministic helpers
function parseRequirementDeterministic(text: string) {
  const lower = text.toLowerCase();
  
  // Category detection
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

  // Quantity detection
  let quantity: number | null = null;
  let unit: string | null = null;
  const qtyMatch = text.match(/([\d,]+)\s*(meters?|mtrs?|pcs?|pieces?|units?|tons?|tonnes?|kg|sets?)/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1].replace(/,/g, ''), 10);
    unit = qtyMatch[2].toLowerCase();
  } else {
    const numOnly = text.match(/\b([\d,]{2,8})\b/);
    if (numOnly) {
      quantity = parseInt(numOnly[1].replace(/,/g, ''), 10);
      unit = 'units';
    }
  }

  // Budget detection
  let maxBudget: number | null = null;
  let priceUnit: string | null = null;
  const budgetMatch = text.match(/(?:under|below|max|budget of|within|upto|up to)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)\s*(?:per|\/)\s*(meter|piece|pc|kg|unit)?/i);
  if (budgetMatch && budgetMatch[1]) {
    maxBudget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    priceUnit = budgetMatch[2] ? `per ${budgetMatch[2].toLowerCase()}` : 'per unit';
  }

  // Location detection
  let state: string | null = null;
  let city: string | null = null;
  const indianStates = ['Gujarat', 'Punjab', 'Tamil Nadu', 'Maharashtra', 'Karnataka', 'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Haryana', 'Madhya Pradesh'];
  for (const s of indianStates) {
    if (lower.includes(s.toLowerCase())) {
      state = s;
      break;
    }
  }
  const indianCities = ['Ahmedabad', 'Surat', 'Ludhiana', 'Coimbatore', 'Rajkot', 'Moradabad', 'Bengaluru', 'Bangalore', 'Pune', 'Howrah', 'Bhiwadi', 'Gurugram', 'Faridabad'];
  for (const c of indianCities) {
    if (lower.includes(c.toLowerCase())) {
      city = c;
      break;
    }
  }

  // Deadline detection
  let deadlineDays: number | null = null;
  if (lower.includes('week')) {
    const weekMatch = lower.match(/(\d+)\s*weeks?/);
    const weeks = weekMatch ? parseInt(weekMatch[1], 10) : 1;
    deadlineDays = weeks * 7;
  } else if (lower.includes('day')) {
    const dayMatch = lower.match(/(\d+)\s*days?/);
    if (dayMatch) deadlineDays = parseInt(dayMatch[1], 10);
  }

  if (lower.includes('iso')) certs.push('ISO 9001:2015');
  if (lower.includes('gst')) certs.push('GST Registered');
  if (lower.includes('ce')) certs.push('CE Certified');

  const hardConstraints: string[] = [];
  if (maxBudget) hardConstraints.push(`Unit price ≤ ₹${maxBudget}`);
  if (quantity) hardConstraints.push(`Minimum capacity to fulfill ${quantity.toLocaleString()} ${unit || 'units'}`);
  if (state) hardConstraints.push(`Region: ${state}`);
  if (deadlineDays) hardConstraints.push(`Lead time ≤ ${deadlineDays} days`);

  return {
    productCategory,
    material: material || 'Standard Industrial Grade',
    quantity: quantity || 2500,
    unit: unit || 'units',
    maxBudget: maxBudget || 200,
    priceUnit: priceUnit || 'per unit',
    technicalSpecifications: ['Industrial Grade Tolerance', 'Batch Quality Test Report Required'],
    preferredLocation: {
      city,
      state: state || (city ? null : 'Gujarat'),
      reach: state ? 'state' : 'pan-india',
    },
    deadlineDays: deadlineDays || 14,
    requiredCertifications: certs.length > 0 ? certs : ['GST Registered', 'ISO 9001:2015'],
    hardConstraints,
    softPreferences: ['Direct Manufacturer', 'Sample Dispatch within 48h'],
    interpretationSummary: `Looking for ${quantity ? quantity.toLocaleString() : 'bulk'} ${unit || 'units'} of ${productCategory}${material ? ` (${material})` : ''}${maxBudget ? ` under ₹${maxBudget} ${priceUnit}` : ''}${state ? ` based in ${state}` : ''}${deadlineDays ? ` delivered within ${deadlineDays} days` : ''}.`,
  };
}

function generateDeterministicProcurementAdvice(priority: string, suppliers: any[]) {
  // Sort suppliers based on priority
  const sorted = [...suppliers].sort((a, b) => {
    if (priority === 'Lowest Cost') return (a.product?.unitPrice || 0) - (b.product?.unitPrice || 0);
    if (priority === 'Fastest Delivery') return (a.product?.leadTimeDays || 0) - (b.product?.leadTimeDays || 0);
    if (priority === 'Highest Quality') return (b.manufacturer?.rating || 0) - (a.manufacturer?.rating || 0);
    // Best Overall (calculated composite score or rating/price balance)
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
    
    let tradeOff = '';
    if (s.id === top.id && runnerUp && runnerUp.id !== top.id) {
      tradeOff = `Offers superior ${priority.toLowerCase()} alignment. Next competitor ${runnerUp.manufacturer.name} is priced at ₹${runnerUp.product.unitPrice} with ${runnerUp.product.leadTimeDays}d lead time.`;
    } else {
      tradeOff = `Priced at ₹${s.product.unitPrice} (${priceDiff >= 0 ? `+₹${priceDiff}` : `-₹${Math.abs(priceDiff)}`} vs ${top.manufacturer.name}) with ${s.product.leadTimeDays}d lead time (${leadDiff >= 0 ? `+${leadDiff}d` : `${leadDiff}d`}).`;
    }

    return {
      supplierId: s.id,
      rank: index + 1,
      badge,
      keyStrengths: [
        `${s.manufacturer.city}, ${s.manufacturer.state} cluster advantage`,
        `Capacity: ${(s.product.monthlyCapacity || 0).toLocaleString()} ${s.product.priceUnit || 'units'}/mo`,
        s.manufacturer.verificationStatus?.isGstVerified ? 'GST Verified Entity' : 'Registered MSME',
      ],
      tradeOffs: tradeOff,
      riskOrUncertainty: s.manufacturer.ratingCount < 10 ? 'Moderate review count; request production sample batch first.' : 'Low risk; established delivery history in cluster.',
      recommendedAction: index === 0 ? 'Issue formal RFQ for sample lot and negotiate volume tiered discount.' : 'Keep as active secondary supplier in shortlist.',
    };
  });

  return {
    topRecommendationId: top.id,
    executiveSummary: `Based on your "${priority}" preference, ${top.manufacturer.name} in ${top.manufacturer.city}, ${top.manufacturer.state} is the recommended partner. They quote ₹${top.product.unitPrice} ${top.product.priceUnit} with an estimated ${top.product.leadTimeDays}-day turnaround and verified ${top.manufacturer.verificationStatus?.certifications?.join(', ') || 'ISO standards'}.`,
    supplierEvaluations: evaluations,
    procurementTip: `In Indian industrial clusters like ${top.manufacturer.city}, MSMEs routinely offer 3-8% cash discounts on milestone-based payments and can prioritize die-casting/tooling when MOQ commitments are met.`,
  };
}

// Start dev or production server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sourcingo Full-Stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
