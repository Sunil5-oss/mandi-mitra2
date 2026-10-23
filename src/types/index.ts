export type SupportedLanguage = 'hi' | 'en' | 'hinglish';

export interface FarmerProfile {
  id: string;
  name: string;
  phone?: string;
  language: SupportedLanguage;
  state: string;
  district: string;
  village?: string;
  landSizeAcres: number;
  primaryCrops: string[];
  preferredMandis: string[];
}

export interface MandiPriceRecord {
  id: string;
  state: string;
  district: string;
  mandi: string;
  commodity: string;
  variety?: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string; // e.g. "₹/Quintal"
  arrivalQuantityQuintals?: number;
  priceTrend?: 'up' | 'down' | 'steady';
  priceChangeAmount?: number;
  source: string;
  isCached?: boolean;
  retrievedAt: string;
}

export interface SellingExpenseBreakdown {
  transportCost: number; // Transport to market
  transportType?: 'per_trip' | 'per_quintal';
  distanceKm?: number;
  loadingUnloadingCost: number; // Hamali / Palledari
  commissionFee: number; // Aarti commission or APMC cess
  commissionType?: 'percent' | 'fixed';
  commissionRatePercent?: number;
  packagingCost: number; // Bags / Bardana
  weighbridgeCost: number; // Dharam Kanta
  miscellaneousCost: number; // Toll, cleaning, union cess
  storageCost?: number; // In case of holding
  deductions?: number; // Quality / moisture cut
}

export interface SellingOption {
  id: string;
  name: string; // e.g., "Mandi Neemuch APMC", "Local Village Trader", "Direct Flour Mill"
  buyerType: 'apmc_mandi' | 'local_trader' | 'corporate_buyer' | 'fpo_procurement';
  offeredPricePerQuintal: number;
  distanceKm: number;
  expenses: SellingExpenseBreakdown;
  paymentTerm: 'Immediate Cash' | 'Same Day Transfer' | '3-Day Cheque' | '7-14 Days';
  riskFactor?: 'Low' | 'Moderate' | 'High';
  notes?: string;
}

export interface CalculatedOptionResult {
  option: SellingOption;
  quantityQuintals: number;
  grossSaleValue: number;
  totalExpenses: number;
  expensePerQuintal: number;
  estimatedNetReturn: number;
  netReturnPerQuintal: number;
  differenceFromBest: number;
  isBestOption: boolean;
  effectiveMarginPercent: number;
}

export interface NetReturnComparisonData {
  id: string;
  date: string;
  cropName: string;
  quantityQuintals: number;
  options: CalculatedOptionResult[];
  recommendedOptionId: string;
  totalVariance: number;
  notes?: string;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  baselineComparisonId?: string;
  transportAdjustment: {
    type: 'amount' | 'percent';
    value: number; // e.g. +500 or +10%
  };
  priceAdjustment: {
    type: 'per_quintal' | 'percent';
    value: number; // e.g. +100 or -150
  };
  waitScenario: {
    enabled: boolean;
    storageDays: number;
    storageRatePerQuintalPerMonth: number;
    expectedFuturePrice: number;
    estimatedMoistureLossPercent: number;
    pestRiskInsuranceCost: number;
  };
  notes?: string;
}

export interface WhatIfResultComparison {
  baselineNetReturn: number;
  simulatedNetReturn: number;
  netDifference: number;
  baselineNetPerQtl: number;
  simulatedNetPerQtl: number;
  differencePerQtl: number;
  storageTotalCost: number;
  weightLossImpact: number;
  verdict: 'WAIT_FAVORABLE' | 'SELL_NOW_FAVORABLE' | 'NEUTRAL';
  sensitivityInsight: string;
}

export interface ExplainableRecommendation {
  winnerOption: SellingOption;
  runnerUpOption?: SellingOption;
  cropName: string;
  quantityQuintals: number;
  grossSaleValue: number;
  totalExpenses: number;
  estimatedNetReturn: number;
  netReturnPerQuintal: number;
  extraEarningOverRunnerUp: number;
  explanationHindi: string;
  explanationEnglish: string;
  keyDrivers: Array<{
    title: string;
    impact: string;
    isPositive: boolean;
  }>;
  criticalAssumptions: string[];
  sensitivityAlert: string;
}

export interface ChatMessage {
  id: string;
  sender: 'farmer' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
  calculationAttachment?: {
    crop: string;
    quantity: number;
    bestOption: string;
    netReturn: number;
  };
}

export interface CropDoctorReport {
  id: string;
  timestamp: string;
  cropName: string;
  symptomsReported: string;
  imagePreviewUrl?: string;
  diseaseName: string;
  scientificName: string;
  confidencePercent: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  identifiedCrop: string;
  symptomsObserved: string[];
  probableCauses: string[];
  immediateRemedies: string[];
  chemicalTreatment: string[];
  preventionTips: string[];
  expertConsultationNote: string;
}

export interface SoilTestRecord {
  id: string;
  date: string;
  soilType: string;
  pH: number;
  nitrogenKgPerHa: number;
  phosphorusKgPerHa: number;
  potassiumKgPerHa: number;
  organicCarbonPercent: number;
  zincPpm?: number;
}

export interface FertilizerCalculationResult {
  crop: string;
  area: number;
  areaUnit: 'acre' | 'bigha' | 'hectare';
  targetYieldQuintalsPerAcre: number;
  ureaKg: number;
  ureaBags: number; // 45kg bags
  dapKg: number;
  dapBags: number; // 50kg bags
  mopKg: number;
  mopBags: number; // 50kg bags
  zincSulphateKg: number;
  totalEstimatedCost: number;
  splitSchedule: Array<{
    stage: string;
    timing: string;
    fertilizers: string[];
    precaution: string;
  }>;
}

export type AssuranceVerificationStatus =
  | 'Verified'
  | 'Pending Verification'
  | 'Unverified'
  | 'Expired'
  | 'Disputed';

export type AssuranceType =
  | 'Seed Germination Warranty'
  | 'Product Refund Policy'
  | 'Efficacy & Yield Guarantee'
  | 'Crop Loss Compensation'
  | 'Pradhan Mantri Fasal Bima (PMFBY)'
  | 'Input Replacement Program';

export interface AssuranceProgram {
  id: string;
  companyName: string;
  companyCategory: 'Seeds' | 'Agrochemicals' | 'Fertilizers' | 'Insurance' | 'Agritech';
  programName: string;
  assuranceType: AssuranceType;
  officialWebsite: string;
  supportPhone?: string;
  productsCovered: string[];
  supportedCrops: string[];
  applicableRegions: string[];
  policySource: string;
  verificationStatus: AssuranceVerificationStatus;
  lastVerificationDate: string;
  coverageLimits: string;
  exclusions: string[];
  requiredDocuments: string[];
  claimDeadlineDays: number; // e.g. Within 7 days of emergence failure
  compensationFormula: string;
  policyValidity: string;
  description: string;
  summaryHindi: string;
}

export interface ProductRegistration {
  id: string;
  farmerId: string;
  companyName: string;
  productName: string;
  productCategory: string;
  crop: string;
  purchaseDate: string;
  quantity: string;
  batchNumber: string;
  retailerName: string;
  retailerDistrict: string;
  invoiceNumber: string;
  invoicePhotoUrl?: string;
  linkedProgramId?: string;
  registeredAt: string;
}

export interface CropClaim {
  id: string;
  farmerId: string;
  registeredProductId: string;
  productName: string;
  companyName: string;
  programName: string;
  crop: string;
  damageObservedDate: string;
  damageDescription: string;
  affectedAreaAcres: number;
  estimatedLossPercent: number;
  photos: string[];
  status:
    | 'Draft'
    | 'Submitted'
    | 'Under Review'
    | 'Additional Information Required'
    | 'Inspection Pending'
    | 'Approved'
    | 'Rejected'
    | 'Paid'
    | 'Closed';
  statusHistory: Array<{
    status: string;
    date: string;
    note: string;
  }>;
  officialClaimRefNo?: string;
  estimatedCompensation?: number;
  approvedCompensation?: number;
  rejectionReason?: string;
  submittedAt: string;
  updatedAt: string;
}
