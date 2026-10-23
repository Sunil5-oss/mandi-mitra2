import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { POPULAR_COMMODITIES } from '../data/mandiData';
import { SellingOption } from '../types';
import {
  calculateSingleOption,
  generateExplainableRecommendation,
  calculateWhatIf,
} from '../utils/calculator';
import {
  Scale,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  BookmarkCheck,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const NetReturnAdvisor: React.FC = () => {
  const {
    language,
    selectedCrop,
    setSelectedCrop,
    cropQuantity,
    setCropQuantity,
    sellingOptions,
    addSellingOption,
    updateSellingOption,
    removeSellingOption,
    calculatedResults,
    whatIfScenario,
    setWhatIfScenario,
    resetWhatIfScenario,
    saveCurrentComparison,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'comparison' | 'whatif' | 'recommendation'>(
    'comparison'
  );
  const [showAddOptionModal, setShowAddOptionModal] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);

  // New option state for modal
  const [newOption, setNewOption] = useState<SellingOption>({
    id: '',
    name: '',
    buyerType: 'apmc_mandi',
    offeredPricePerQuintal: 5600,
    distanceKm: 20,
    expenses: {
      transportCost: 1800,
      transportType: 'per_trip',
      distanceKm: 20,
      loadingUnloadingCost: 500,
      commissionFee: 0,
      commissionType: 'fixed',
      packagingCost: 350,
      weighbridgeCost: 80,
      miscellaneousCost: 100,
    },
    paymentTerm: 'Same Day Transfer',
    notes: '',
  });

  // Explainable recommendation
  const recommendation = generateExplainableRecommendation(
    calculatedResults,
    selectedCrop,
    cropQuantity
  );

  // Best option for what-if baseline
  const bestResult = calculatedResults[0];
  const whatIfResult = bestResult
    ? calculateWhatIf(bestResult.option, cropQuantity, whatIfScenario)
    : null;

  const handleAddNewOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOption.name.trim()) return;

    addSellingOption({
      ...newOption,
      id: `opt-${Date.now()}`,
    });

    setShowAddOptionModal(false);
    // Reset form
    setNewOption({
      id: '',
      name: '',
      buyerType: 'apmc_mandi',
      offeredPricePerQuintal: 5600,
      distanceKm: 20,
      expenses: {
        transportCost: 1800,
        transportType: 'per_trip',
        distanceKm: 20,
        loadingUnloadingCost: 500,
        commissionFee: 0,
        commissionType: 'fixed',
        packagingCost: 350,
        weighbridgeCost: 80,
        miscellaneousCost: 100,
      },
      paymentTerm: 'Same Day Transfer',
      notes: '',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner: Master Selling Strategy */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
                {language === 'hi'
                  ? 'स्मार्ट मंडी शुद्ध मुनाफा कैलकुलेटर (Net Return Engine)'
                  : 'Smart Mandi Net Return Comparison Engine'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {language === 'hi'
                  ? 'सकल भाव में से भाड़ा, हम्माली, आढ़त और बारदाना खर्च घटाकर जानें जेब में बचने वाला असली पैसा'
                  : 'Calculate actual in-hand earnings after deducting transportation, loading, mandi tax, and packaging'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => saveCurrentComparison('Manual Save from Selling Advisor')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors"
          >
            <BookmarkCheck className="w-4 h-4 text-emerald-700" />
            <span>{language === 'hi' ? 'तुलना सुरक्षित करें' : 'Save Comparison'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddOptionModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नया विकल्प जोड़ें' : 'Add Selling Option'}</span>
          </button>
        </div>
      </div>

      {/* Global Selling Parameters Bar: Crop & Total Quantity */}
      <div className="bg-linear-to-r from-emerald-900 to-emerald-800 text-white p-5 rounded-2xl shadow-md border border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Crop Selector */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-1">
              {language === 'hi' ? 'फसल चुनें' : 'Selected Crop'}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-emerald-950 text-white px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {POPULAR_COMMODITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {language === 'hi' ? c.nameHi : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity in Quintals */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-1">
              {language === 'hi' ? 'कुल उपज (क्विंटल में)' : 'Total Quantity (Quintals)'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0.5"
                step="1"
                value={cropQuantity}
                onChange={(e) => setCropQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
                className="w-28 bg-emerald-950 text-white font-bold px-3 py-2 rounded-xl text-sm border border-emerald-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="text-xs text-emerald-200 font-medium">क्विंटल (Quintals)</span>
            </div>
          </div>
        </div>

        {/* Highlight Winner Preview */}
        {bestResult && (
          <div className="bg-emerald-950/80 border border-amber-400/50 rounded-xl px-4 py-2.5 text-right w-full sm:w-auto">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
              सर्वश्रेष्ठ विकल्प (Winner)
            </span>
            <div className="text-sm font-bold text-white truncate">{bestResult.option.name}</div>
            <div className="text-xl font-black text-amber-400">
              ₹{bestResult.estimatedNetReturn.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-emerald-200">
                (₹{bestResult.netReturnPerQuintal}/क्विंटल)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3 Sub-Navigation Tabs */}
      <div className="flex border-b border-gray-200 space-x-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveSubTab('comparison')}
          className={`pb-3 px-3 transition-colors flex items-center space-x-1.5 border-b-2 ${
            activeSubTab === 'comparison'
              ? 'border-emerald-700 text-emerald-900 font-black'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{language === 'hi' ? '1. सभी विकल्पों की तुलना (Net Return)' : '1. Option Comparison'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('whatif')}
          className={`pb-3 px-3 transition-colors flex items-center space-x-1.5 border-b-2 ${
            activeSubTab === 'whatif'
              ? 'border-emerald-700 text-emerald-900 font-black'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-600" />
          <span>{language === 'hi' ? '2. क्या-अगर सिमुलेटर (What-If Simulator)' : '2. What-If Simulator'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('recommendation')}
          className={`pb-3 px-3 transition-colors flex items-center space-x-1.5 border-b-2 ${
            activeSubTab === 'recommendation'
              ? 'border-emerald-700 text-emerald-900 font-black'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{language === 'hi' ? '3. पारदर्शी सिफारिश (Explainable AI)' : '3. Recommendation Analysis'}</span>
        </button>
      </div>

      {/* ==================== SUB-TAB 1: NET RETURN COMPARISON ==================== */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {calculatedResults.map((item, idx) => {
              const opt = item.option;
              const isWinner = item.isBestOption;
              const exp = opt.expenses;

              return (
                <div
                  key={opt.id}
                  className={`bg-white rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                    isWinner
                      ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                      : 'border-gray-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-gray-100 text-gray-700">
                          विकल्प {idx + 1} • {opt.buyerType.replace('_', ' ')}
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-base mt-1.5 leading-snug">
                          {opt.name}
                        </h3>
                        <div className="text-xs text-gray-500 mt-0.5">
                          दूरी: <strong>{opt.distanceKm} किमी</strong> • भुगतान:{' '}
                          <span className="text-emerald-700 font-medium">{opt.paymentTerm}</span>
                        </div>
                      </div>

                      {isWinner ? (
                        <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                          विजेता 🏆
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeSellingOption(opt.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                          title="विकल्प हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Headline Price & Gross Value */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-gray-600 font-medium">प्रस्तावित मंडी भाव:</span>
                        <span className="text-base font-black text-gray-900">
                          ₹{opt.offeredPricePerQuintal}
                          <span className="text-xs font-normal text-gray-500">/क्विंटल</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs text-gray-500 pt-1 border-t border-gray-200/60">
                        <span>कुल सकल बिक्री (Gross):</span>
                        <span className="font-semibold text-gray-700">
                          ₹{item.grossSaleValue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Itemized Expenses Breakdown */}
                    <div className="space-y-1.5 text-xs">
                      <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px] block">
                        कटौती एवं खर्च विवरण (Deductions):
                      </span>

                      <div className="flex justify-between text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Truck className="w-3.5 h-3.5 text-gray-400" />
                          <span>परिवहन भाड़ा (Transport):</span>
                        </span>
                        <span className="font-semibold text-red-600">
                          -₹{exp.transportCost.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>हम्माली / पल्लेदारी (Loading/Unloading):</span>
                        <span className="font-semibold text-red-600">
                          -₹{exp.loadingUnloadingCost.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {exp.commissionFee > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>आढ़त / मंडी सेस (Commission):</span>
                          <span className="font-semibold text-red-600">
                            -₹{exp.commissionFee.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {exp.packagingCost > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>बारदाना / बोरी खर्च (Bags):</span>
                          <span className="font-semibold text-red-600">
                            -₹{exp.packagingCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {exp.weighbridgeCost > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>धर्म कांटा / तौल पर्ची (Weighment):</span>
                          <span className="font-semibold text-red-600">
                            -₹{exp.weighbridgeCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {exp.miscellaneousCost > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>टोल व अन्य विविध खर्च (Misc):</span>
                          <span className="font-semibold text-red-600">
                            -₹{exp.miscellaneousCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      <div className="pt-1.5 border-t border-gray-100 flex justify-between font-bold text-red-700">
                        <span>कुल विक्रय खर्च (Total Deductions):</span>
                        <span>-₹{item.totalExpenses.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* NET RETURN CALLOUT (The In-Hand Amount) */}
                    <div
                      className={`p-3.5 rounded-xl border ${
                        isWinner
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-gray-100 border-gray-200 text-gray-900'
                      }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          शुद्ध नकद मुनाफा (Net In-Hand):
                        </span>
                        <span className="text-xl font-black text-emerald-800">
                          ₹{item.estimatedNetReturn.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-1 text-gray-600">
                        <span>प्रति क्विंटल शुद्ध प्राप्ति:</span>
                        <strong className="text-emerald-900 font-bold">
                          ₹{item.netReturnPerQuintal}/क्विंटल
                        </strong>
                      </div>
                    </div>

                    {/* Difference from Winner */}
                    {!isWinner && (
                      <div className="text-xs text-red-700 bg-red-50 p-2 rounded-lg font-medium border border-red-200/60">
                        विजेता विकल्प की तुलना में <strong>₹{item.differenceFromBest.toLocaleString('en-IN')} कम</strong> हाथ में बचेंगे।
                      </div>
                    )}
                  </div>

                  {opt.notes && (
                    <p className="text-[11px] text-gray-500 italic mt-3 pt-2 border-t border-gray-100">
                      💡 {opt.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 2: WHAT-IF SIMULATOR ==================== */}
      {activeSubTab === 'whatif' && whatIfResult && bestResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-emerald-950 flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-amber-600" />
                  <span>
                    {language === 'hi'
                      ? 'इंटरैक्टिव क्या-अगर सिमुलेटर (What-If Market Sensitivity)'
                      : 'Interactive What-If Scenario Simulator'}
                  </span>
                </h2>
                <p className="text-xs text-gray-500">
                  मूल आधार: <strong>{bestResult.option.name}</strong> ({cropQuantity} क्विंटल {selectedCrop})
                </p>
              </div>

              <button
                type="button"
                onClick={resetWhatIfScenario}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'रीसेट सिमुलेशन' : 'Reset Scenario'}</span>
              </button>
            </div>

            {/* Scenario Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* SCENARIO A: Transport Adjustment */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    सिनेरियो A: परिवहन भाड़ा परिवर्तन
                  </span>
                  <Truck className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-[11px] text-gray-500">
                  डीजल की दर या वाहन उपलब्धता के आधार पर भाड़ा घटाएं या बढ़ाएं।
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>परिवहन में बदलाव:</span>
                    <span className={whatIfScenario.transportAdjustment.value > 0 ? 'text-red-600' : 'text-emerald-700'}>
                      {whatIfScenario.transportAdjustment.value > 0 ? '+' : ''}₹
                      {whatIfScenario.transportAdjustment.value}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-1500"
                    max="3000"
                    step="100"
                    value={whatIfScenario.transportAdjustment.value}
                    onChange={(e) =>
                      setWhatIfScenario({
                        ...whatIfScenario,
                        transportAdjustment: {
                          ...whatIfScenario.transportAdjustment,
                          value: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>-₹1,500 (छूट)</span>
                    <span>शून्य</span>
                    <span>+₹3,000 (महंगा)</span>
                  </div>
                </div>
              </div>

              {/* SCENARIO B: Buyer Offer Change */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    सिनेरियो B: व्यापारी / मंडी भाव परिवर्तन
                  </span>
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                </div>
                <p className="text-[11px] text-gray-500">
                  यदि बोली में व्यापारी भाव ₹100 घटा दे या कोई नया खरीदार ऊंचा भाव दे।
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>भाव में बदलाव (प्रति क्विंटल):</span>
                    <span className={whatIfScenario.priceAdjustment.value >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                      {whatIfScenario.priceAdjustment.value >= 0 ? '+' : ''}₹
                      {whatIfScenario.priceAdjustment.value}/क्विंटल
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-400"
                    max="600"
                    step="50"
                    value={whatIfScenario.priceAdjustment.value}
                    onChange={(e) =>
                      setWhatIfScenario({
                        ...whatIfScenario,
                        priceAdjustment: {
                          ...whatIfScenario.priceAdjustment,
                          value: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>-₹400 (मंदी)</span>
                    <span>स्थिर</span>
                    <span>+₹600 (तेजी)</span>
                  </div>
                </div>
              </div>

              {/* SCENARIO C: What If Farmer Waits (Storage vs Selling Now) */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    सिनेरियो C: फसल रोककर रखने का विश्लेषण
                  </span>
                  <Clock className="w-4 h-4 text-purple-700" />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="waitToggle"
                    checked={whatIfScenario.waitScenario.enabled}
                    onChange={(e) =>
                      setWhatIfScenario({
                        ...whatIfScenario,
                        waitScenario: {
                          ...whatIfScenario.waitScenario,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="waitToggle" className="text-xs font-bold text-emerald-900 cursor-pointer">
                    रुककर बेचने का जोखिम जोड़ें
                  </label>
                </div>

                {whatIfScenario.waitScenario.enabled && (
                  <div className="space-y-2 pt-1 border-t border-gray-200 text-xs">
                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold block">
                        अपेक्षित भावी भाव (Future Price):
                      </label>
                      <input
                        type="number"
                        value={whatIfScenario.waitScenario.expectedFuturePrice}
                        onChange={(e) =>
                          setWhatIfScenario({
                            ...whatIfScenario,
                            waitScenario: {
                              ...whatIfScenario.waitScenario,
                              expectedFuturePrice: parseInt(e.target.value, 10) || 0,
                            },
                          })
                        }
                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded font-bold text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-gray-500">भंडारण दिन:</span>
                        <input
                          type="number"
                          value={whatIfScenario.waitScenario.storageDays}
                          onChange={(e) =>
                            setWhatIfScenario({
                              ...whatIfScenario,
                              waitScenario: {
                                ...whatIfScenario.waitScenario,
                                storageDays: parseInt(e.target.value, 10) || 30,
                              },
                            })
                          }
                          className="w-full px-2 py-1 bg-white border rounded text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-gray-500">वजन नमी क्षरण %:</span>
                        <input
                          type="number"
                          step="0.5"
                          value={whatIfScenario.waitScenario.estimatedMoistureLossPercent}
                          onChange={(e) =>
                            setWhatIfScenario({
                              ...whatIfScenario,
                              waitScenario: {
                                ...whatIfScenario.waitScenario,
                                estimatedMoistureLossPercent: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-2 py-1 bg-white border rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Before-and-After Comparison Card */}
            <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Baseline (Before) */}
                <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-700/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                    मूल स्थिति (Baseline)
                  </span>
                  <div className="text-xl font-black text-white mt-1">
                    ₹{whatIfResult.baselineNetReturn.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-emerald-200 mt-0.5">
                    ₹{whatIfResult.baselineNetPerQtl}/क्विंटल शुद्ध
                  </div>
                </div>

                {/* Simulated Result (After) */}
                <div className="bg-emerald-950/80 p-4 rounded-xl border-2 border-amber-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                    सिम्युलेटेड स्थिति (What-If Outcome)
                  </span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    ₹{whatIfResult.simulatedNetReturn.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-amber-200 mt-0.5">
                    ₹{whatIfResult.simulatedNetPerQtl}/क्विंटल शुद्ध
                  </div>
                </div>

                {/* Net Variance */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                    मुनाफे में शुद्ध अंतर (Net Variance)
                  </span>
                  <div
                    className={`text-2xl font-black ${
                      whatIfResult.netDifference >= 0 ? 'text-emerald-300' : 'text-red-400'
                    }`}
                  >
                    {whatIfResult.netDifference >= 0 ? '+' : ''}₹
                    {whatIfResult.netDifference.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-emerald-100">
                    {whatIfResult.sensitivityInsight}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 3: EXPLAINABLE RECOMMENDATION ==================== */}
      {activeSubTab === 'recommendation' && recommendation && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-950">
                  पारदर्शी बिक्री सिफारिश (Explainable Decision Rationale)
                </h2>
                <p className="text-xs text-gray-500">
                  यह कोई मनगढ़ंत एआई स्कोर नहीं है — यह आपके द्वारा दर्ज वास्तविक भाड़ा, आढ़त और वजन के गणित पर आधारित है।
                </p>
              </div>
            </div>

            {/* Plain Hindi & English Explanations */}
            <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-5 space-y-3">
              <h3 className="font-extrabold text-emerald-950 text-sm flex items-center space-x-2">
                <span>🎯 अंतिम निष्कर्ष (Final Verdict):</span>
              </h3>
              <p className="text-sm font-semibold text-emerald-900 leading-relaxed">
                {recommendation.explanationHindi}
              </p>
              <p className="text-xs text-gray-600 border-t border-emerald-200/60 pt-2 italic">
                {recommendation.explanationEnglish}
              </p>
            </div>

            {/* Key Drivers Comparison */}
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
                प्रमुख प्रेरक कारक (Key Financial Drivers):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendation.keyDrivers.map((driver, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                      driver.isPositive
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-red-50/60 border-red-200'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        driver.isPositive ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    />
                    <div>
                      <div className="font-bold text-gray-900 text-xs">{driver.title}</div>
                      <div className="text-xs font-semibold text-gray-700 mt-0.5">{driver.impact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sensitivity Warning Alert */}
            {recommendation.sensitivityAlert && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">संवेदनशीलता विश्लेषण (Sensitivity Threshold):</strong>
                  <span>{recommendation.sensitivityAlert}</span>
                </div>
              </div>
            )}

            {/* Critical Assumptions Checklist */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <span>महत्वपूर्ण पूर्वधारणाएं एवं जोखिम (Critical Assumptions):</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                {recommendation.criticalAssumptions.map((assump, idx) => (
                  <li key={idx}>{assump}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD NEW SELLING OPTION MODAL ==================== */}
      {showAddOptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold">
                {language === 'hi' ? 'नया बिक्री विकल्प या खरीदार जोड़ें' : 'Add New Selling Option'}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddOptionModal(false)}
                className="text-emerald-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewOption} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  मंडी या खरीदार का नाम (Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. मंदसौर मंडी, गाँव का सेठ, या आटा मिल"
                  value={newOption.name}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    प्रस्तावित भाव (₹/क्विंटल)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={newOption.offeredPricePerQuintal}
                    onChange={(e) =>
                      setNewOption({
                        ...newOption,
                        offeredPricePerQuintal: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    खेत से दूरी (किमी)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newOption.distanceKm}
                    onChange={(e) =>
                      setNewOption({
                        ...newOption,
                        distanceKm: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Expenses inputs */}
              <div className="border-t pt-3 space-y-3">
                <span className="font-bold text-gray-900 block">विक्रय खर्च (Expenses):</span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">कुल वाहन भाड़ा (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newOption.expenses.transportCost}
                      onChange={(e) =>
                        setNewOption({
                          ...newOption,
                          expenses: {
                            ...newOption.expenses,
                            transportCost: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">हम्माली/पल्लेदारी (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newOption.expenses.loadingUnloadingCost}
                      onChange={(e) =>
                        setNewOption({
                          ...newOption,
                          expenses: {
                            ...newOption.expenses,
                            loadingUnloadingCost: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-600 mb-1">बारदाना / बोरी खर्च (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newOption.expenses.packagingCost}
                      onChange={(e) =>
                        setNewOption({
                          ...newOption,
                          expenses: {
                            ...newOption.expenses,
                            packagingCost: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">धर्म कांटा व विविध (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newOption.expenses.weighbridgeCost}
                      onChange={(e) =>
                        setNewOption({
                          ...newOption,
                          expenses: {
                            ...newOption.expenses,
                            weighbridgeCost: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">भुगतान की शर्त</label>
                <select
                  value={newOption.paymentTerm}
                  onChange={(e: any) => setNewOption({ ...newOption, paymentTerm: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Immediate Cash">तुरंत नकद (Immediate Cash)</option>
                  <option value="Same Day Transfer">उसी दिन बैंक ट्रांसफर (Same Day RTGS/NEFT)</option>
                  <option value="3-Day Cheque">3 दिन का चेक (3-Day Cheque)</option>
                  <option value="7-14 Days">7-14 दिन का उधारी (Credit)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddOptionModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  जोड़ें व गणना करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetReturnAdvisor;
