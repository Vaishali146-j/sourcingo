import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  MapPin,
  Clock,
  Coins,
  ShieldCheck,
  Edit2,
  AlertCircle,
  RotateCw,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BuyerRequirement, GeographicReach } from '../../types';

interface RequirementParserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequirementParserModal: React.FC<RequirementParserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeRequirement,
    setActiveRequirement,
    parseNaturalLanguageRequirement,
    isParsingRequirement,
    setFilter,
  } = useApp();

  const [promptText, setPromptText] = useState(
    activeRequirement?.rawText || 'Need 5,000 meters of cotton fabric under ₹150 per meter from Gujarat, delivered within two weeks.'
  );

  const [parsedDraft, setParsedDraft] = useState<BuyerRequirement | null>(activeRequirement);
  const [isEditing, setIsEditing] = useState(false);

  // Editable draft states
  const [category, setCategory] = useState(parsedDraft?.productCategory || 'Textiles & Fabrics');
  const [material, setMaterial] = useState(parsedDraft?.material || '100% Cotton Duck Canvas');
  const [quantity, setQuantity] = useState(parsedDraft?.quantity || 5000);
  const [unit, setUnit] = useState(parsedDraft?.unit || 'meters');
  const [maxBudget, setMaxBudget] = useState(parsedDraft?.maxBudget || 150);
  const [priceUnit, setPriceUnit] = useState(parsedDraft?.priceUnit || 'per meter');
  const [state, setState] = useState(parsedDraft?.preferredLocation.state || 'Gujarat');
  const [reach, setReach] = useState<GeographicReach>(parsedDraft?.preferredLocation.reach || 'state');
  const [deadlineDays, setDeadlineDays] = useState(parsedDraft?.deadlineDays || 14);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!promptText.trim()) return;
    const result = await parseNaturalLanguageRequirement(promptText);
    if (result) {
      setParsedDraft(result);
      setCategory(result.productCategory);
      setMaterial(result.material);
      setQuantity(result.quantity);
      setUnit(result.unit);
      setMaxBudget(result.maxBudget);
      setPriceUnit(result.priceUnit);
      setState(result.preferredLocation.state || 'Gujarat');
      setReach(result.preferredLocation.reach);
      setDeadlineDays(result.deadlineDays);
      setIsEditing(false);
    }
  };

  const handleApply = () => {
    if (parsedDraft) {
      const updated: BuyerRequirement = {
        ...parsedDraft,
        productCategory: category,
        material,
        quantity: Number(quantity),
        unit,
        maxBudget: Number(maxBudget),
        priceUnit,
        preferredLocation: {
          ...parsedDraft.preferredLocation,
          state,
          reach,
        },
        selectedStates: state ? [state] : [],
        deadlineDays: Number(deadlineDays),
        hardConstraints: [
          `Unit price ≤ ₹${maxBudget}`,
          `Lead time ≤ ${deadlineDays} days`,
          reach === 'state' && state ? `Region: ${state}` : 'Pan-India',
        ].filter(Boolean) as string[],
      };

      setActiveRequirement(updated);
      setFilter('sector', updated.productCategory);
      setFilter('maxBudget', updated.maxBudget);
      setFilter('geographicReach', updated.preferredLocation.reach);
      setFilter('selectedStates', updated.selectedStates || []);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-[#172033]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#14283F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Natural-Language Procurement Search</h3>
              <p className="text-xs text-slate-300">
                AI interprets technical specifications, budget caps, and geographic constraints.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Prompt Entry Box */}
          <div>
            <label className="block text-xs font-semibold text-[#14283F] uppercase tracking-wider mb-2">
              Buyer Procurement Brief
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Type your industrial requirement in plain English or Hindi mix..."
                className="w-full p-3.5 bg-[#F5F7FA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#14283F] text-[#172033] resize-none"
              />
              <button
                type="button"
                onClick={handleParse}
                disabled={isParsingRequirement || !promptText.trim()}
                className="absolute right-3 bottom-3 px-4 py-1.5 bg-[#14283F] hover:bg-[#0A1624] disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isParsingRequirement ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Interpreting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Parse Requirement</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Prompts */}
            <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-[#64748B]">
              <span className="text-[11px] font-medium text-[#14283F]">Sample industrial inquiries:</span>
              <button
                type="button"
                onClick={() => setPromptText('Need 5,000 meters of cotton fabric under ₹150 per meter from Gujarat, delivered within two weeks.')}
                className="text-[11px] text-[#0F766E] hover:underline cursor-pointer"
              >
                Cotton duck fabric (Gujarat)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setPromptText('Need 500 hardened CNC splined shafts under ₹400/pc from Punjab within 12 days for tractor gearbox.')}
                className="text-[11px] text-[#0F766E] hover:underline cursor-pointer"
              >
                CNC Machined Shafts (Punjab)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setPromptText('Looking for 2,000 forged brass PN25 ball valves under ₹280 from Moradabad or North India.')}
                className="text-[11px] text-[#0F766E] hover:underline cursor-pointer"
              >
                Brass Valves (UP)
              </button>
            </div>
          </div>

          {/* Interpreted Requirement Preview */}
          {parsedDraft && (
            <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#F5F7FA]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                  <span className="font-semibold text-xs text-[#14283F]">
                    Structured Procurement Parameters
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs text-[#0F766E] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  {isEditing ? 'Close Editor' : 'Edit Values'}
                </button>
              </div>

              {/* Interpretation Sentence */}
              <div className="text-xs text-[#172033] bg-white p-2.5 rounded-lg border border-[#E2E8F0] mb-3 leading-relaxed">
                <span className="font-semibold text-[#14283F]">Interpreted Need: </span>
                {parsedDraft.interpretationSummary}
              </div>

              {isEditing ? (
                /* Editable Form */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[#64748B] mb-1 font-medium">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 bg-white border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="Textiles & Fabrics">Textiles & Fabrics</option>
                      <option value="CNC Machining & Precision Parts">CNC Machining & Precision Parts</option>
                      <option value="Pumps & Electric Motors">Pumps & Electric Motors</option>
                      <option value="Brass Hardware & Valves">Brass Hardware & Valves</option>
                      <option value="Pipes & Industrial Tubes">Pipes & Industrial Tubes</option>
                      <option value="Industrial Fasteners">Industrial Fasteners</option>
                      <option value="Electrical Hardware & Terminals">Electrical Hardware & Terminals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#64748B] mb-1 font-medium">Material</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="w-full p-2 bg-white border border-[#E2E8F0] rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[#64748B] mb-1 font-medium">Quantity</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-2/3 p-2 bg-white border border-[#E2E8F0] rounded-lg"
                      />
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-1/3 p-2 bg-white border border-[#E2E8F0] rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#64748B] mb-1 font-medium">Max Budget (₹)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(Number(e.target.value))}
                        className="w-2/3 p-2 bg-white border border-[#E2E8F0] rounded-lg"
                      />
                      <input
                        type="text"
                        value={priceUnit}
                        onChange={(e) => setPriceUnit(e.target.value)}
                        className="w-1/3 p-2 bg-white border border-[#E2E8F0] rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#64748B] mb-1 font-medium">Location Scope</label>
                    <div className="flex gap-2">
                      <select
                        value={reach}
                        onChange={(e) => setReach(e.target.value as GeographicReach)}
                        className="w-1/2 p-2 bg-white border border-[#E2E8F0] rounded-lg"
                      >
                        <option value="state">Specific State</option>
                        <option value="pan-india">Pan-India</option>
                      </select>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State name"
                        className="w-1/2 p-2 bg-white border border-[#E2E8F0] rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#64748B] mb-1 font-medium">Max Lead Time (Days)</label>
                    <input
                      type="number"
                      value={deadlineDays}
                      onChange={(e) => setDeadlineDays(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-[#E2E8F0] rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                /* Structured Clean Readout (Zero Pill Discipline) */
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block">Sector</span>
                      <span className="font-semibold text-[#14283F]">{category}</span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block">Target Quantity</span>
                      <span className="font-semibold text-[#14283F]">
                        {quantity.toLocaleString()} {unit}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block">Budget Ceiling</span>
                      <span className="font-semibold text-[#14283F]">
                        ₹{maxBudget} {priceUnit}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] block">Lead Time</span>
                      <span className="font-semibold text-[#0F766E]">{deadlineDays} Days max</span>
                    </div>
                  </div>

                  {/* Hard Constraints vs Preferences Distinction */}
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-[#14283F] mb-1">
                      Hard Exclusion Constraints:
                    </div>
                    <ul className="list-disc pl-4 text-[11px] text-[#64748B] space-y-0.5">
                      <li>Unit price must not exceed ₹{maxBudget} {priceUnit}</li>
                      <li>Lead time must be within {deadlineDays} days</li>
                      {reach === 'state' && state && <li>Manufacturer must operate in {state} cluster</li>}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F5F7FA] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#64748B]">
            {parsedDraft ? 'Ready to apply structured filters to discovery feed' : 'Enter prompt and click parse'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E2E8F0] text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!parsedDraft}
              className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] disabled:bg-slate-300 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Apply to Discovery Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
