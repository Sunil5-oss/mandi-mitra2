import {
  SellingOption,
  CalculatedOptionResult,
  WhatIfScenario,
  WhatIfResultComparison,
  ExplainableRecommendation,
  FertilizerCalculationResult,
} from '../types';

/**
 * Calculates net return for a single selling option
 */
export function calculateSingleOption(
  option: SellingOption,
  quantityQuintals: number
): {
  grossSaleValue: number;
  totalExpenses: number;
  expensePerQuintal: number;
  estimatedNetReturn: number;
  netReturnPerQuintal: number;
  effectiveMarginPercent: number;
} {
  const safeQty = Math.max(0.01, Number(quantityQuintals) || 1);
  const safePrice = Math.max(0, Number(option.offeredPricePerQuintal) || 0);

  const grossSaleValue = safeQty * safePrice;

  // Breakdown expenses
  const exp = option.expenses;
  let transport = Number(exp.transportCost) || 0;
  if (exp.transportType === 'per_quintal') {
    transport = transport * safeQty;
  }

  let commission = Number(exp.commissionFee) || 0;
  if (exp.commissionType === 'percent' && exp.commissionRatePercent) {
    commission = (grossSaleValue * exp.commissionRatePercent) / 100;
  }

  const loading = Number(exp.loadingUnloadingCost) || 0;
  const packaging = Number(exp.packagingCost) || 0;
  const weighbridge = Number(exp.weighbridgeCost) || 0;
  const misc = Number(exp.miscellaneousCost) || 0;
  const deductions = Number(exp.deductions) || 0;
  const storage = Number(exp.storageCost) || 0;

  const totalExpenses = transport + loading + commission + packaging + weighbridge + misc + deductions + storage;
  const estimatedNetReturn = grossSaleValue - totalExpenses;
  const expensePerQuintal = totalExpenses / safeQty;
  const netReturnPerQuintal = estimatedNetReturn / safeQty;
  const effectiveMarginPercent = grossSaleValue > 0 ? (estimatedNetReturn / grossSaleValue) * 100 : 0;

  return {
    grossSaleValue: Math.round(grossSaleValue),
    totalExpenses: Math.round(totalExpenses),
    expensePerQuintal: Math.round(expensePerQuintal * 10) / 10,
    estimatedNetReturn: Math.round(estimatedNetReturn),
    netReturnPerQuintal: Math.round(netReturnPerQuintal * 10) / 10,
    effectiveMarginPercent: Math.round(effectiveMarginPercent * 10) / 10,
  };
}

/**
 * Compares multiple selling options and ranks them by net return
 */
export function compareSellingOptions(
  options: SellingOption[],
  quantityQuintals: number
): CalculatedOptionResult[] {
  if (!options || options.length === 0) return [];

  const safeQty = Math.max(0.01, Number(quantityQuintals) || 1);

  // Calculate results for all options
  const results = options.map((opt) => {
    const calc = calculateSingleOption(opt, safeQty);
    return {
      option: opt,
      quantityQuintals: safeQty,
      ...calc,
      differenceFromBest: 0,
      isBestOption: false,
    };
  });

  // Sort descending by estimated net return
  results.sort((a, b) => b.estimatedNetReturn - a.estimatedNetReturn);

  const bestReturn = results[0]?.estimatedNetReturn ?? 0;

  return results.map((item, idx) => ({
    ...item,
    isBestOption: idx === 0,
    differenceFromBest: Math.round(bestReturn - item.estimatedNetReturn),
  }));
}

/**
 * Generates an Explainable Recommendation from calculated options
 */
export function generateExplainableRecommendation(
  results: CalculatedOptionResult[],
  cropName: string,
  quantityQuintals: number
): ExplainableRecommendation | null {
  if (!results || results.length === 0) return null;

  const winner = results[0];
  const runnerUp = results.length > 1 ? results[1] : undefined;
  const extraEarning = runnerUp ? Math.round(winner.estimatedNetReturn - runnerUp.estimatedNetReturn) : 0;

  const winnerExp = winner.option.expenses;
  const runnerExp = runnerUp?.option.expenses;

  // Key drivers analysis
  const keyDrivers: Array<{ title: string; impact: string; isPositive: boolean }> = [];

  if (runnerUp) {
    const priceDiff = winner.option.offeredPricePerQuintal - runnerUp.option.offeredPricePerQuintal;
    if (priceDiff !== 0) {
      keyDrivers.push({
        title: priceDiff > 0 ? 'उच्च मंडी भाव (Higher Offered Rate)' : 'कम मंडी भाव (Lower Headline Rate)',
        impact: `${priceDiff > 0 ? '+' : ''}₹${priceDiff}/क्विंटल (कुल प्रभाव: ₹${Math.abs(priceDiff * quantityQuintals)})`,
        isPositive: priceDiff > 0,
      });
    }

    const expDiff = winner.totalExpenses - runnerUp.totalExpenses;
    if (expDiff !== 0) {
      keyDrivers.push({
        title: expDiff < 0 ? 'कम कुल खर्च व भाड़ा (Lower Logistics & Fees)' : 'अधिक परिवहन व मंडी शुल्क (Higher Logistics & Fees)',
        impact: `${expDiff < 0 ? 'बचत' : 'अतिरिक्त खर्च'}: ₹${Math.abs(expDiff)}`,
        isPositive: expDiff < 0,
      });
    }
  }

  // Sensitivity insight
  let sensitivityAlert = '';
  if (runnerUp && extraEarning > 0) {
    const transportBreakEvenAddition = Math.round(extraEarning / quantityQuintals);
    sensitivityAlert = `संवेदनशीलता चेतावनी: यदि ${winner.option.name} का परिवहन खर्च ₹${transportBreakEvenAddition}/क्विंटल से अधिक बढ़ता है, तो ${runnerUp.option.name} अधिक लाभदायक हो जाएगा।`;
  } else if (extraEarning === 0 && runnerUp) {
    sensitivityAlert = 'दोनों विकल्पों में शुद्ध आय लगभग समान है। भुगतान की सुरक्षा और तुरंत नकदी को प्राथमिकता दें।';
  }

  const hindiExplanation = runnerUp
    ? `आपके द्वारा दर्ज आंकड़ों के अनुसार, ${winner.option.name} में बेचने पर सबसे अधिक शुद्ध मुनाफा (Net In-hand Return) अनुमानित ₹${winner.estimatedNetReturn.toLocaleString('en-IN')} (₹${winner.netReturnPerQuintal}/क्विंटल) मिलेगा। यह दूसरे सर्वोत्तम विकल्प (${runnerUp.option.name}) से ₹${extraEarning.toLocaleString('en-IN')} अधिक है। ${winner.option.offeredPricePerQuintal >= runnerUp.option.offeredPricePerQuintal ? 'यद्यपि भाव अच्छा है, पर मुख्य कारण परिवहन और आढ़त खर्च के बाद शुद्ध बचत है।' : 'हालांकि इसका हेडलाइन भाव कम दिख सकता है, लेकिन कम भाड़ा व शून्य आढ़त के कारण हाथ में ज्यादा पैसा बच रहा है।'}`
    : `आपके दर्ज आंकड़ों के आधार पर ${winner.option.name} पर कुल शुद्ध आय ₹${winner.estimatedNetReturn.toLocaleString('en-IN')} (₹${winner.netReturnPerQuintal}/क्विंटल) प्राप्त होगी।`;

  const englishExplanation = runnerUp
    ? `Based on your verified numbers, ${winner.option.name} yields the highest estimated net return of ₹${winner.estimatedNetReturn.toLocaleString('en-IN')} (₹${winner.netReturnPerQuintal}/quintal). This delivers ₹${extraEarning.toLocaleString('en-IN')} more net profit than ${runnerUp.option.name} after factoring in all transportation, handling, and commission deductions.`
    : `Estimated net return for ${winner.option.name} is ₹${winner.estimatedNetReturn.toLocaleString('en-IN')} after subtracting entered selling expenses.`;

  return {
    winnerOption: winner.option,
    runnerUpOption: runnerUp?.option,
    cropName,
    quantityQuintals,
    grossSaleValue: winner.grossSaleValue,
    totalExpenses: winner.totalExpenses,
    estimatedNetReturn: winner.estimatedNetReturn,
    netReturnPerQuintal: winner.netReturnPerQuintal,
    extraEarningOverRunnerUp: extraEarning,
    explanationHindi: hindiExplanation,
    explanationEnglish: englishExplanation,
    keyDrivers,
    criticalAssumptions: [
      `सटीक वजन (Weighment) एवं नमी कटौती (Moisture cut) में कोई अघोषित कटौती नहीं होगी।`,
      `भुगतान की शर्त: ${winner.option.paymentTerm}।`,
      `भाड़ा एवं हम्माली की दरें दर्ज मूल्यों के अनुसार स्थिर रहेंगी।`,
    ],
    sensitivityAlert,
  };
}

/**
 * Calculates What-If simulation results compared to baseline
 */
export function calculateWhatIf(
  baseOption: SellingOption,
  quantityQuintals: number,
  scenario: WhatIfScenario
): WhatIfResultComparison {
  const safeQty = Math.max(0.01, Number(quantityQuintals) || 1);
  const baseline = calculateSingleOption(baseOption, safeQty);

  // 1. Calculate simulated transport
  let simTransport = baseOption.expenses.transportCost;
  if (scenario.transportAdjustment.type === 'amount') {
    simTransport = Math.max(0, simTransport + scenario.transportAdjustment.value);
  } else {
    simTransport = Math.max(0, simTransport * (1 + scenario.transportAdjustment.value / 100));
  }

  // 2. Calculate simulated price
  let simPrice = baseOption.offeredPricePerQuintal;
  if (scenario.priceAdjustment.type === 'per_quintal') {
    simPrice = Math.max(0, simPrice + scenario.priceAdjustment.value);
  } else {
    simPrice = Math.max(0, simPrice * (1 + scenario.priceAdjustment.value / 100));
  }

  // 3. Handle Wait scenario if enabled
  let storageTotalCost = 0;
  let effectiveSimQty = safeQty;
  let weightLossImpact = 0;

  if (scenario.waitScenario.enabled) {
    const ws = scenario.waitScenario;
    if (ws.expectedFuturePrice > 0) {
      simPrice = ws.expectedFuturePrice;
    }

    // Storage cost = rate * qty * (days / 30)
    const months = Math.max(0.1, ws.storageDays / 30);
    storageTotalCost = ws.storageRatePerQuintalPerMonth * safeQty * months + (ws.pestRiskInsuranceCost || 0);

    // Moisture / handling weight loss
    if (ws.estimatedMoistureLossPercent > 0) {
      const lostQuintals = (safeQty * ws.estimatedMoistureLossPercent) / 100;
      effectiveSimQty = Math.max(0.01, safeQty - lostQuintals);
      weightLossImpact = Math.round(lostQuintals * simPrice);
    }
  }

  // Gross sale value in simulation
  const simGross = effectiveSimQty * simPrice;

  // Other expenses recalculated
  let simCommission = baseOption.expenses.commissionFee;
  if (baseOption.expenses.commissionType === 'percent' && baseOption.expenses.commissionRatePercent) {
    simCommission = (simGross * baseOption.expenses.commissionRatePercent) / 100;
  }

  const totalSimExpenses =
    simTransport +
    baseOption.expenses.loadingUnloadingCost +
    simCommission +
    baseOption.expenses.packagingCost +
    baseOption.expenses.weighbridgeCost +
    baseOption.expenses.miscellaneousCost +
    storageTotalCost;

  const simulatedNetReturn = Math.round(simGross - totalSimExpenses);
  const netDifference = simulatedNetReturn - baseline.estimatedNetReturn;
  const simulatedNetPerQtl = Math.round((simulatedNetReturn / safeQty) * 10) / 10;
  const differencePerQtl = Math.round((netDifference / safeQty) * 10) / 10;

  let verdict: 'WAIT_FAVORABLE' | 'SELL_NOW_FAVORABLE' | 'NEUTRAL' = 'NEUTRAL';
  let sensitivityInsight = '';

  if (scenario.waitScenario.enabled) {
    if (netDifference > 500) {
      verdict = 'WAIT_FAVORABLE';
      sensitivityInsight = `भंडारण खर्च (₹${Math.round(storageTotalCost)}) और वजन में कमी (₹${Math.round(weightLossImpact)}) घटाने के बाद भी रुककर बेचने में ₹${Math.abs(netDifference).toLocaleString('en-IN')} का शुद्ध लाभ संभव है।`;
    } else if (netDifference < -500) {
      verdict = 'SELL_NOW_FAVORABLE';
      sensitivityInsight = `रुकना नुकसानदेह साबित हो सकता है! भंडारण शुल्क और वजन क्षरण के कारण अभी बेचने की तुलना में ₹${Math.abs(netDifference).toLocaleString('en-IN')} कम मिलेंगे। तुरंत बेचना सुरक्षित है।`;
    } else {
      verdict = 'NEUTRAL';
      sensitivityInsight = 'भविष्य के भाव और अभी के भाव में खर्च काटकर अंतर बहुत कम है। बाजार जोखिम को देखते हुए तत्काल विक्रय अधिक सुरक्षित हो सकता है।';
    }
  } else {
    if (netDifference > 0) {
      sensitivityInsight = `संशोधित परिस्थितियों में आपका शुद्ध लाभ ₹${netDifference.toLocaleString('en-IN')} (₹${differencePerQtl}/क्विंटल) बढ़ जाता है।`;
    } else if (netDifference < 0) {
      sensitivityInsight = `बढ़े हुए खर्च या घटे भाव के कारण शुद्ध लाभ ₹${Math.abs(netDifference).toLocaleString('en-IN')} कम हो जाता है।`;
    } else {
      sensitivityInsight = 'मूल एवं सिम्युलेटेड शुद्ध लाभ में कोई परिवर्तन नहीं है।';
    }
  }

  return {
    baselineNetReturn: baseline.estimatedNetReturn,
    simulatedNetReturn,
    netDifference,
    baselineNetPerQtl: baseline.netReturnPerQuintal,
    simulatedNetPerQtl,
    differencePerQtl,
    storageTotalCost: Math.round(storageTotalCost),
    weightLossImpact: Math.round(weightLossImpact),
    verdict,
    sensitivityInsight,
  };
}

/**
 * Fertilizer recommendations based on ICAR agronomic principles
 */
export const CROP_NPK_BENCHMARKS: Record<
  string,
  {
    nKgPerAcre: number;
    pKgPerAcre: number;
    kKgPerAcre: number;
    targetYield: number;
    splitStages: Array<{ stage: string; timing: string; fertilizers: string[]; precaution: string }>;
  }
> = {
  Wheat: {
    nKgPerAcre: 48,
    pKgPerAcre: 24,
    kKgPerAcre: 16,
    targetYield: 22,
    splitStages: [
      {
        stage: 'Basal (बुवाई के समय)',
        timing: 'At the time of sowing',
        fertilizers: ['DAP: 1 Bag (50 kg)', 'MOP (Potash): 25-30 kg', 'Urea: 15 kg'],
        precaution: 'बीज के साथ सीधे संपर्क से बचाएं, 3-4 सेमी नीचे डालें।',
      },
      {
        stage: 'First Top Dressing (प्रथम सिंचाई / CRI अवस्था)',
        timing: '21-25 days after sowing with 1st irrigation',
        fertilizers: ['Urea: 1 Bag (45 kg)', 'Zinc Sulphate (33%): 4-5 kg'],
        precaution: 'यूरिया का छिड़काव दोपहर बाद करें जब पत्तियों पर ओस न हो।',
      },
      {
        stage: 'Second Top Dressing (कल्ले फूटने की अवस्था / Tillering)',
        timing: '40-45 days after sowing with 2nd irrigation',
        fertilizers: ['Urea: 1 Bag (45 kg)'],
        precaution: 'सिंचाई के तुरंत बाद या हल्की नमी में डालें।',
      },
    ],
  },
  Paddy: {
    nKgPerAcre: 50,
    pKgPerAcre: 24,
    kKgPerAcre: 20,
    targetYield: 26,
    splitStages: [
      {
        stage: 'Basal (रोपाई से पूर्व)',
        timing: 'Final puddling before transplanting',
        fertilizers: ['DAP: 50 kg (1 Bag)', 'MOP: 35 kg', 'Zinc Sulphate: 8 kg'],
        precaution: 'खेत में पानी कम करके कीचड़ में अच्छी तरह मिलाएं।',
      },
      {
        stage: 'Tillering (कल्ले निकलने पर)',
        timing: '20-25 days after transplanting',
        fertilizers: ['Urea: 1 Bag (45 kg)'],
        precaution: 'पानी का ठहराव 2-3 सेमी रखें।',
      },
      {
        stage: 'Panicle Initiation (गभोट अवस्था)',
        timing: '45-50 days after transplanting',
        fertilizers: ['Urea: 35 kg'],
        precaution: 'फूल आने से पहले यूरिया का प्रयोग बंद कर दें।',
      },
    ],
  },
  Mustard: {
    nKgPerAcre: 32,
    pKgPerAcre: 16,
    kKgPerAcre: 12,
    targetYield: 10,
    splitStages: [
      {
        stage: 'Basal (बुवाई पर)',
        timing: 'Sowing time',
        fertilizers: ['Single Super Phosphate (SSP): 100 kg (2 Bags) OR DAP: 35 kg', 'Bentonite Sulphur: 10 kg', 'Urea: 25 kg'],
        precaution: 'सरसों में सल्फर तेल की मात्रा 2-3% बढ़ाता है।',
      },
      {
        stage: 'Top Dressing (प्रथम सिंचाई)',
        timing: '25-30 days after sowing',
        fertilizers: ['Urea: 1 Bag (45 kg)'],
        precaution: 'सिंचाई के बाद पैर टिकने पर बखेरें।',
      },
    ],
  },
  Maize: {
    nKgPerAcre: 48,
    pKgPerAcre: 24,
    kKgPerAcre: 16,
    targetYield: 28,
    splitStages: [
      {
        stage: 'Basal (बुवाई)',
        timing: 'At sowing',
        fertilizers: ['DAP: 50 kg', 'MOP: 25 kg', 'Zinc Sulphate: 5 kg'],
        precaution: 'पंक्तियों में खाद डालें।',
      },
      {
        stage: 'Knee-high (घुटने की ऊंचाई)',
        timing: '25-30 days',
        fertilizers: ['Urea: 45 kg (1 Bag)'],
        precaution: 'मिट्टी चढ़ाने के साथ मिलाएं।',
      },
      {
        stage: 'Tasseling (नरमंजरी निकलने से पूर्व)',
        timing: '45-50 days',
        fertilizers: ['Urea: 40 kg'],
        precaution: 'नमी सुनिश्चित करें।',
      },
    ],
  },
};

export function calculateFertilizerNeeds(
  crop: string,
  acres: number,
  soilTest?: { pH?: number; nLevel?: 'Low' | 'Medium' | 'High'; pLevel?: 'Low' | 'Medium' | 'High'; kLevel?: 'Low' | 'Medium' | 'High' }
): FertilizerCalculationResult {
  const benchmark = CROP_NPK_BENCHMARKS[crop] || CROP_NPK_BENCHMARKS['Wheat'];
  const safeAcres = Math.max(0.1, acres || 1);

  // Modifiers based on soil fertility test
  let nFactor = 1.0;
  let pFactor = 1.0;
  let kFactor = 1.0;

  if (soilTest?.nLevel === 'Low') nFactor = 1.25;
  if (soilTest?.nLevel === 'High') nFactor = 0.75;
  if (soilTest?.pLevel === 'Low') pFactor = 1.25;
  if (soilTest?.pLevel === 'High') pFactor = 0.75;
  if (soilTest?.kLevel === 'Low') kFactor = 1.25;
  if (soilTest?.kLevel === 'High') kFactor = 0.75;

  const totalN = benchmark.nKgPerAcre * safeAcres * nFactor;
  const totalP = benchmark.pKgPerAcre * safeAcres * pFactor;
  const totalK = benchmark.kKgPerAcre * safeAcres * kFactor;

  // DAP gives 18% N and 46% P2O5
  const dapKg = Math.round((totalP / 0.46) * 10) / 10;
  const nFromDAP = dapKg * 0.18;

  // Remaining N supplied by Urea (46% N)
  const remN = Math.max(0, totalN - nFromDAP);
  const ureaKg = Math.round((remN / 0.46) * 10) / 10;

  // MOP gives 60% K2O
  const mopKg = Math.round((totalK / 0.60) * 10) / 10;

  const zincSulphateKg = Math.round(5 * safeAcres);

  // Bags (Urea 45kg, DAP 50kg, MOP 50kg)
  const ureaBags = Math.round((ureaKg / 45) * 10) / 10;
  const dapBags = Math.round((dapKg / 50) * 10) / 10;
  const mopBags = Math.round((mopKg / 50) * 10) / 10;

  // Estimated subsidized government prices (Urea ~₹266.5, DAP ~₹1350, MOP ~₹1700)
  const estCost = Math.round(ureaBags * 267 + dapBags * 1350 + mopBags * 1700 + zincSulphateKg * 55);

  return {
    crop,
    area: safeAcres,
    areaUnit: 'acre',
    targetYieldQuintalsPerAcre: benchmark.targetYield,
    ureaKg,
    ureaBags,
    dapKg,
    dapBags,
    mopKg,
    mopBags,
    zincSulphateKg,
    totalEstimatedCost: estCost,
    splitSchedule: benchmark.splitStages,
  };
}
