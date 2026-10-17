import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

let aiClient = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client in backend service:', err);
  }
}

/**
 * Natural language requirement parsing via Gemini API with deterministic fallback
 */
export async function parseRequirement(requirementText) {
  if (aiClient) {
    try {
      const prompt = `You are an expert Indian industrial procurement analyst for Sourcingo.
Parse the following buyer procurement requirement into a strict JSON object.
Return ONLY valid JSON matching this schema:
{
  "productCategory": string,
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
      return { success: true, source: 'gemini', data: JSON.parse(responseText) };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic parser:', err.message);
    }
  }

  // Deterministic fallback parser
  return { success: true, source: 'fallback', data: parseDeterministic(requirementText) };
}

/**
 * AI procurement advice and trade-off explanations via Gemini API
 */
export async function generateProcurementAdvice(priority, suppliers, buyerRequirement) {
  if (aiClient) {
    try {
      const prompt = `You are a Senior Industrial Sourcing Director at Sourcingo.
Selected Priority: "${priority}".
Buyer Requirement: ${JSON.stringify(buyerRequirement || {})}
Shortlisted Suppliers: ${JSON.stringify(suppliers, null, 2)}

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
}

RULES:
- Do NOT invent certifications, prices, or ratings not provided in the input.
- Distinguish between verified facts and manufacturer claims.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text || '{}';
      return { success: true, source: 'gemini', data: JSON.parse(responseText) };
    } catch (err) {
      console.warn('Gemini procurement advice failed, using deterministic fallback:', err.message);
    }
  }

  return { success: true, source: 'fallback', data: generateDeterministicAdvice(priority, suppliers) };
}

function parseDeterministic(text) {
  const lower = text.toLowerCase();
  let productCategory = 'Industrial Components';
  let material = null;

  if (lower.includes('fabric') || lower.includes('cotton') || lower.includes('yarn')) {
    productCategory = 'Textiles & Fabrics';
    if (lower.includes('cotton')) material = '100% Cotton Duck Canvas';
  } else if (lower.includes('cnc') || lower.includes('machin') || lower.includes('shaft')) {
    productCategory = 'CNC Machining & Precision Parts';
    material = 'Alloy Steel EN19';
  } else if (lower.includes('pump') || lower.includes('casing') || lower.includes('motor')) {
    productCategory = 'Pumps & Electric Motors';
    material = 'Cast Iron FG 260';
  } else if (lower.includes('brass') || lower.includes('valve')) {
    productCategory = 'Brass Hardware & Valves';
    material = 'Forged Brass CW617N';
  }

  const qtyMatch = text.match(/([\d,]+)\s*(meters?|pcs?|pieces?|units?|kg)/i);
  const quantity = qtyMatch ? parseInt(qtyMatch[1].replace(/,/g, ''), 10) : 2500;
  const unit = qtyMatch ? qtyMatch[2].toLowerCase() : 'units';

  const budgetMatch = text.match(/(?:under|below|max|budget)?\s*(?:₹|rs\.?)?\s*([\d,]+)\s*(?:per|\/)?\s*(meter|piece|pc|unit)?/i);
  const maxBudget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ''), 10) : 200;

  return {
    productCategory,
    material: material || 'Standard MSME Grade',
    quantity,
    unit,
    maxBudget,
    priceUnit: `per ${unit}`,
    technicalSpecifications: ['Industrial Tolerance Tested'],
    preferredLocation: {
      city: null,
      state: lower.includes('gujarat') ? 'Gujarat' : lower.includes('punjab') ? 'Punjab' : 'Gujarat',
      reach: 'state',
    },
    deadlineDays: 14,
    requiredCertifications: ['ISO 9001:2015', 'GST Registered'],
    hardConstraints: [`Unit price ≤ ₹${maxBudget}`, 'Lead time ≤ 14 days'],
    softPreferences: ['Direct Manufacturer Dispatch'],
    interpretationSummary: `Looking for ${quantity.toLocaleString()} ${unit} of ${productCategory} under ₹${maxBudget} delivered within 14 days.`,
  };
}

function generateDeterministicAdvice(priority, suppliers) {
  const sorted = [...suppliers].sort((a, b) => {
    if (priority === 'Lowest Cost') return (a.product?.unitPrice || a.product?.unit_price || 0) - (b.product?.unitPrice || b.product?.unit_price || 0);
    if (priority === 'Fastest Delivery') return (a.product?.leadTimeDays || a.product?.lead_time_days || 0) - (b.product?.leadTimeDays || b.product?.lead_time_days || 0);
    if (priority === 'Highest Quality') return (b.manufacturer?.rating || 0) - (a.manufacturer?.rating || 0);
    return (b.compositeScore || 85) - (a.compositeScore || 85);
  });

  const top = sorted[0];
  const runnerUp = sorted[1] || sorted[0];

  const evaluations = sorted.map((s, index) => {
    const unitPrice = s.product?.unitPrice || s.product?.unit_price || 0;
    const leadTime = s.product?.leadTimeDays || s.product?.lead_time_days || 10;
    const topPrice = top.product?.unitPrice || top.product?.unit_price || 0;
    const topLead = top.product?.leadTimeDays || top.product?.lead_time_days || 10;

    let badge = index === 0 ? 'Best Overall Match' : 'Vetted Alternative';
    if (index === 0) {
      if (priority === 'Lowest Cost') badge = 'Lowest Unit Cost Leader';
      else if (priority === 'Fastest Delivery') badge = 'Fastest Turnaround';
      else if (priority === 'Highest Quality') badge = 'Highest Spec Compliance';
    }

    return {
      supplierId: s.id,
      rank: index + 1,
      badge,
      keyStrengths: [
        `${s.manufacturer.city}, ${s.manufacturer.state} cluster proximity`,
        `Lead time: ${leadTime} days`,
        s.manufacturer.verificationStatus?.isGstVerified || s.manufacturer.verification_status?.isGstVerified ? 'GST Verified' : 'Registered MSME',
      ],
      tradeOffs:
        s.id === top.id
          ? `Offers optimal alignment for ${priority}. Competitor ${runnerUp.manufacturer.name} is priced at ₹${runnerUp.product?.unitPrice || runnerUp.product?.unit_price} with ${runnerUp.product?.leadTimeDays || runnerUp.product?.lead_time_days}d lead time.`
          : `Quotes ₹${unitPrice} vs ₹${topPrice} (${unitPrice - topPrice >= 0 ? `+₹${unitPrice - topPrice}` : `-₹${Math.abs(unitPrice - topPrice)}`}).`,
      riskOrUncertainty: '48h test sample inspection recommended.',
      recommendedAction: index === 0 ? 'Transmit official RFQ for pilot batch' : 'Keep active in secondary shortlist',
    };
  });

  return {
    topRecommendationId: top.id,
    executiveSummary: `Under the "${priority}" sourcing strategy, ${top.manufacturer.name} in ${top.manufacturer.city}, ${top.manufacturer.state} ranks highest with verified compliance and strong cluster throughput.`,
    supplierEvaluations: evaluations,
    procurementTip: `In Indian industrial clusters like ${top.manufacturer.city}, MSMEs routinely offer 3-8% cash discounts on milestone-based payments.`,
  };
}
