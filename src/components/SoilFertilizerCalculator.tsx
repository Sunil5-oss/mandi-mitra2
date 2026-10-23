import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateFertilizerNeeds, CROP_NPK_BENCHMARKS } from '../utils/calculator';
import { POPULAR_COMMODITIES } from '../data/mandiData';
import {
  FlaskConical,
  Sprout,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Calendar,
} from 'lucide-react';

export const SoilFertilizerCalculator: React.FC = () => {
  const { language, farmerProfile } = useApp();

  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [landArea, setLandArea] = useState<number>(farmerProfile.landSizeAcres || 5);
  const [hasSoilReport, setHasSoilReport] = useState<boolean>(true);

  // Soil health card inputs
  const [soilData, setSoilData] = useState({
    pH: 7.2,
    nLevel: 'Medium' as 'Low' | 'Medium' | 'High',
    pLevel: 'Medium' as 'Low' | 'Medium' | 'High',
    kLevel: 'Medium' as 'Low' | 'Medium' | 'High',
    organicCarbonPercent: 0.55,
  });

  const calcResult = calculateFertilizerNeeds(
    selectedCrop,
    landArea,
    hasSoilReport ? soilData : undefined
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
                {language === 'hi'
                  ? 'मृदा स्वास्थ्य एवं सटीक खाद कैलकुलेटर (Fertilizer Calculator)'
                  : 'Soil Health & Fertilizer Dose Calculator'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {language === 'hi'
                  ? 'ICAR कृषि मानकों के अनुसार यूरिया, डीएपी एवं पोटाश की सही बोरी संख्या व समयबद्ध छिड़काव'
                  : 'Calculate exact bags of Urea, DAP, MOP & Zinc Sulphate based on soil test and crop yield targets'}
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-emerald-900 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
          🌱 अनुशंसित: <strong>संतुलित पोषण (4:2:1 NPK)</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form (Left Column) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              1. फसल एवं खेत का आकार (Farm Details)
            </h2>

            {/* Crop Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                फसल चुनें (Select Crop):
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {['Wheat', 'Paddy', 'Mustard', 'Maize'].map((c) => (
                  <option key={c} value={c}>
                    {c === 'Wheat'
                      ? '🌾 गेहूं (Wheat)'
                      : c === 'Paddy'
                      ? '🌾 धान (Paddy)'
                      : c === 'Mustard'
                      ? '🌼 सरसों (Mustard)'
                      : '🌽 मक्का (Maize)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Area in Acres */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                खेत का क्षेत्रफल (Area in Acres):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.25"
                  step="0.5"
                  value={landArea}
                  onChange={(e) => setLandArea(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">
                  एकड़ (Acres)
                </span>
              </div>
            </div>

            {/* Soil Health Card Toggle */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-800">
                  मृदा स्वास्थ्य कार्ड (Soil Test Record)?
                </span>
                <input
                  type="checkbox"
                  id="soilCardToggle"
                  checked={hasSoilReport}
                  onChange={(e) => setHasSoilReport(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </div>

              {hasSoilReport && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-600 font-semibold mb-1">
                        मिट्टी का pH मान:
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="5.0"
                        max="9.5"
                        value={soilData.pH}
                        onChange={(e) =>
                          setSoilData({ ...soilData, pH: parseFloat(e.target.value) || 7.0 })
                        }
                        className="w-full px-2 py-1.5 bg-white border rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-600 font-semibold mb-1">
                        जैविक कार्बन (OC %):
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={soilData.organicCarbonPercent}
                        onChange={(e) =>
                          setSoilData({
                            ...soilData,
                            organicCarbonPercent: parseFloat(e.target.value) || 0.5,
                          })
                        }
                        className="w-full px-2 py-1.5 bg-white border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* N, P, K levels */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-gray-500 block font-bold">नाइट्रोजन (N):</span>
                      <select
                        value={soilData.nLevel}
                        onChange={(e: any) => setSoilData({ ...soilData, nLevel: e.target.value })}
                        className="w-full px-1.5 py-1 bg-white border rounded text-[11px]"
                      >
                        <option value="Low">कम (Low)</option>
                        <option value="Medium">मध्यम (Med)</option>
                        <option value="High">अधिक (High)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block font-bold">फास्फोरस (P):</span>
                      <select
                        value={soilData.pLevel}
                        onChange={(e: any) => setSoilData({ ...soilData, pLevel: e.target.value })}
                        className="w-full px-1.5 py-1 bg-white border rounded text-[11px]"
                      >
                        <option value="Low">कम (Low)</option>
                        <option value="Medium">मध्यम (Med)</option>
                        <option value="High">अधिक (High)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block font-bold">पोटाश (K):</span>
                      <select
                        value={soilData.kLevel}
                        onChange={(e: any) => setSoilData({ ...soilData, kLevel: e.target.value })}
                        className="w-full px-1.5 py-1 bg-white border rounded text-[11px]"
                      >
                        <option value="Low">कम (Low)</option>
                        <option value="Medium">मध्यम (Med)</option>
                        <option value="High">अधिक (High)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Output Calculations & Bags (Right Column) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Bags Required Grid */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-emerald-950">
                  कुल आवश्यक खाद की बोरियां ({landArea} एकड़ हेतु)
                </h3>
                <span className="text-xs text-gray-500">
                  लक्ष्य उत्पादन: {calcResult.targetYieldQuintalsPerAcre} क्विंटल प्रति एकड़
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">
                  अनुमानित सरकारी सब्सिडी लागत:
                </span>
                <span className="text-lg font-black text-emerald-800">
                  ₹{calcResult.totalEstimatedCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Urea */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center space-y-1">
                <span className="text-xs font-bold text-emerald-900 block">यूरिया (Urea)</span>
                <div className="text-2xl font-black text-emerald-800">{calcResult.ureaBags}</div>
                <span className="text-[11px] text-gray-600 block">बोरी (45 kg)</span>
                <div className="text-[10px] text-emerald-700 font-semibold pt-1 border-t border-emerald-200/60">
                  कुल: {calcResult.ureaKg} kg
                </div>
              </div>

              {/* DAP */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center space-y-1">
                <span className="text-xs font-bold text-amber-900 block">डीएपी (DAP)</span>
                <div className="text-2xl font-black text-amber-800">{calcResult.dapBags}</div>
                <span className="text-[11px] text-gray-600 block">बोरी (50 kg)</span>
                <div className="text-[10px] text-amber-700 font-semibold pt-1 border-t border-amber-200/60">
                  कुल: {calcResult.dapKg} kg
                </div>
              </div>

              {/* MOP (Potash) */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-center space-y-1">
                <span className="text-xs font-bold text-purple-900 block">पोटाश (MOP)</span>
                <div className="text-2xl font-black text-purple-800">{calcResult.mopBags}</div>
                <span className="text-[11px] text-gray-600 block">बोरी (50 kg)</span>
                <div className="text-[10px] text-purple-700 font-semibold pt-1 border-t border-purple-200/60">
                  कुल: {calcResult.mopKg} kg
                </div>
              </div>

              {/* Zinc Sulphate */}
              <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 text-center space-y-1">
                <span className="text-xs font-bold text-sky-900 block">जिंक सल्फेट (33%)</span>
                <div className="text-2xl font-black text-sky-800">{calcResult.zincSulphateKg}</div>
                <span className="text-[11px] text-gray-600 block">किलोग्राम (kg)</span>
                <div className="text-[10px] text-sky-700 font-semibold pt-1 border-t border-sky-200/60">
                  कल्ले व रोगरोधक
                </div>
              </div>
            </div>

            {/* Split Schedule Stages */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>अवस्थावार खाद डालने का कार्यक्रम (Split Application Schedule):</span>
              </h4>

              <div className="space-y-2.5">
                {calcResult.splitSchedule.map((stage, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-950">{stage.stage}</span>
                      <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border">
                        {stage.timing}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {stage.fertilizers.map((f, i) => (
                        <span
                          key={i}
                          className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[11px]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-gray-600 italic">⚠️ {stage.precaution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilFertilizerCalculator;
