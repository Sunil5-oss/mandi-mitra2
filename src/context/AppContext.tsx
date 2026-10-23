import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FarmerProfile,
  SupportedLanguage,
  MandiPriceRecord,
  SellingOption,
  CalculatedOptionResult,
  NetReturnComparisonData,
  WhatIfScenario,
  CropDoctorReport,
  ProductRegistration,
  CropClaim,
  AssuranceProgram,
} from '../types';
import { INITIAL_MANDI_RECORDS } from '../data/mandiData';
import { ASSURANCE_PROGRAMS, INITIAL_REGISTERED_PRODUCTS, INITIAL_CROP_CLAIMS } from '../data/assuranceData';
import { compareSellingOptions } from '../utils/calculator';

interface AppContextType {
  // Language & Profile
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  farmerProfile: FarmerProfile;
  updateFarmerProfile: (profile: Partial<FarmerProfile>) => void;

  // Active Tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Mandi Records
  mandiRecords: MandiPriceRecord[];
  refreshMandiRecords: () => Promise<void>;
  isMandiRefreshing: boolean;

  // Net Return Comparison
  selectedCrop: string;
  setSelectedCrop: (crop: string) => void;
  cropQuantity: number;
  setCropQuantity: (qty: number) => void;
  sellingOptions: SellingOption[];
  setSellingOptions: React.Dispatch<React.SetStateAction<SellingOption[]>>;
  addSellingOption: (opt: SellingOption) => void;
  updateSellingOption: (id: string, updated: Partial<SellingOption>) => void;
  removeSellingOption: (id: string) => void;
  calculatedResults: CalculatedOptionResult[];

  // What-If Simulation
  whatIfScenario: WhatIfScenario;
  setWhatIfScenario: React.Dispatch<React.SetStateAction<WhatIfScenario>>;
  resetWhatIfScenario: () => void;

  // Saved Comparisons & History
  savedComparisons: NetReturnComparisonData[];
  saveCurrentComparison: (notes?: string) => void;
  deleteSavedComparison: (id: string) => void;

  // Crop Doctor Reports
  cropDoctorReports: CropDoctorReport[];
  saveCropDoctorReport: (report: CropDoctorReport) => void;

  // Assurance & Claims
  assurancePrograms: AssuranceProgram[];
  registeredProducts: ProductRegistration[];
  registerProduct: (prod: Omit<ProductRegistration, 'id' | 'registeredAt'>) => void;
  cropClaims: CropClaim[];
  submitCropClaim: (claim: Omit<CropClaim, 'id' | 'status' | 'statusHistory' | 'submittedAt' | 'updatedAt'>) => void;
  updateClaimStatus: (claimId: string, status: CropClaim['status'], note: string) => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const DEFAULT_PROFILE: FarmerProfile = {
  id: 'farmer-default',
  name: 'रामकुमार वर्मा (Ramkumar)',
  phone: '98765-43210',
  language: 'hi',
  state: 'Madhya Pradesh',
  district: 'Neemuch',
  village: 'जावद (Javad)',
  landSizeAcres: 6.5,
  primaryCrops: ['Mustard', 'Soyabean', 'Wheat', 'Maize'],
  preferredMandis: ['Neemuch APMC Mandi', 'Indore Choithram APMC', 'Kota Bhamashah Mandi'],
};

const DEFAULT_SELLING_OPTIONS: SellingOption[] = [
  {
    id: 'opt-1',
    name: 'नीमच कृषि उपज मंडी (Neemuch APMC)',
    buyerType: 'apmc_mandi',
    offeredPricePerQuintal: 5780,
    distanceKm: 32,
    expenses: {
      transportCost: 3200,
      transportType: 'per_trip',
      distanceKm: 32,
      loadingUnloadingCost: 650, // Hamali/Palledari
      commissionFee: 0, // Mandi tax paid by buyer in MP, ₹0 for farmer
      commissionType: 'fixed',
      packagingCost: 450, // 40 bags @ ~₹11
      weighbridgeCost: 100, // Dharam Kanta
      miscellaneousCost: 200, // Toll, mandi gate cess
      storageCost: 0,
      deductions: 0,
    },
    paymentTerm: 'Same Day Transfer',
    riskFactor: 'Low',
    notes: 'खुली नीलामी (Open Auction). ई-पेमेंट सीधे बैंक खाते में शाम तक।',
  },
  {
    id: 'opt-2',
    name: 'गाँव का स्थानीय आढ़तिया / व्यापारी (Local Village Trader)',
    buyerType: 'local_trader',
    offeredPricePerQuintal: 5550,
    distanceKm: 2,
    expenses: {
      transportCost: 500, // Minimal tractor trolley
      transportType: 'per_trip',
      distanceKm: 2,
      loadingUnloadingCost: 300,
      commissionFee: 0,
      commissionType: 'fixed',
      packagingCost: 0, // Trader brings his own bags
      weighbridgeCost: 50,
      miscellaneousCost: 0,
      storageCost: 0,
      deductions: 0,
    },
    paymentTerm: 'Immediate Cash',
    riskFactor: 'Low',
    notes: 'खेत पर तुरंत नकद भुगतान। कोई बड़ा भाड़ा या पल्लेदारी नहीं।',
  },
  {
    id: 'opt-3',
    name: 'कोटा भामाशाह मंडी (Kota APMC)',
    buyerType: 'apmc_mandi',
    offeredPricePerQuintal: 5890,
    distanceKm: 145,
    expenses: {
      transportCost: 9500, // Long distance truck
      transportType: 'per_trip',
      distanceKm: 145,
      loadingUnloadingCost: 900,
      commissionFee: 0,
      commissionType: 'fixed',
      packagingCost: 500,
      weighbridgeCost: 150,
      miscellaneousCost: 650, // State border toll & driver food
      storageCost: 0,
      deductions: 0,
    },
    paymentTerm: '3-Day Cheque',
    riskFactor: 'Moderate',
    notes: 'भाव ₹110 ज्यादा है, पर 145 किमी दूर जाने का भारी भाड़ा और टोल।',
  },
];

const DEFAULT_WHAT_IF: WhatIfScenario = {
  id: 'whatif-default',
  name: 'Default What-If Scenario',
  transportAdjustment: {
    type: 'amount',
    value: 0,
  },
  priceAdjustment: {
    type: 'per_quintal',
    value: 0,
  },
  waitScenario: {
    enabled: false,
    storageDays: 30,
    storageRatePerQuintalPerMonth: 35,
    expectedFuturePrice: 6100,
    estimatedMoistureLossPercent: 1.5,
    pestRiskInsuranceCost: 150,
  },
  notes: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language & Farmer Profile
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('mm_lang');
    return (saved as SupportedLanguage) || 'hi';
  });

  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>(() => {
    const saved = localStorage.getItem('mm_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  // 2. Active View Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 3. Mandi Bhav records
  const [mandiRecords, setMandiRecords] = useState<MandiPriceRecord[]>(INITIAL_MANDI_RECORDS);
  const [isMandiRefreshing, setIsMandiRefreshing] = useState(false);

  // 4. Net Return Comparison
  const [selectedCrop, setSelectedCrop] = useState<string>('Mustard');
  const [cropQuantity, setCropQuantity] = useState<number>(40); // 40 Quintals
  const [sellingOptions, setSellingOptions] = useState<SellingOption[]>(() => {
    const saved = localStorage.getItem('mm_selling_opts');
    return saved ? JSON.parse(saved) : DEFAULT_SELLING_OPTIONS;
  });

  // 5. What-If Scenario
  const [whatIfScenario, setWhatIfScenario] = useState<WhatIfScenario>(DEFAULT_WHAT_IF);

  // 6. Saved comparisons
  const [savedComparisons, setSavedComparisons] = useState<NetReturnComparisonData[]>(() => {
    const saved = localStorage.getItem('mm_saved_comparisons');
    return saved ? JSON.parse(saved) : [];
  });

  // 7. Crop doctor reports
  const [cropDoctorReports, setCropDoctorReports] = useState<CropDoctorReport[]>(() => {
    const saved = localStorage.getItem('mm_doctor_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // 8. Assurance Marketplace & Claims
  const [assurancePrograms] = useState<AssuranceProgram[]>(ASSURANCE_PROGRAMS);
  const [registeredProducts, setRegisteredProducts] = useState<ProductRegistration[]>(() => {
    const saved = localStorage.getItem('mm_reg_products');
    return saved ? JSON.parse(saved) : INITIAL_REGISTERED_PRODUCTS;
  });
  const [cropClaims, setCropClaims] = useState<CropClaim[]>(() => {
    const saved = localStorage.getItem('mm_claims');
    return saved ? JSON.parse(saved) : INITIAL_CROP_CLAIMS;
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('mm_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('mm_profile', JSON.stringify(farmerProfile));
  }, [farmerProfile]);

  useEffect(() => {
    localStorage.setItem('mm_selling_opts', JSON.stringify(sellingOptions));
  }, [sellingOptions]);

  useEffect(() => {
    localStorage.setItem('mm_saved_comparisons', JSON.stringify(savedComparisons));
  }, [savedComparisons]);

  useEffect(() => {
    localStorage.setItem('mm_doctor_reports', JSON.stringify(cropDoctorReports));
  }, [cropDoctorReports]);

  useEffect(() => {
    localStorage.setItem('mm_reg_products', JSON.stringify(registeredProducts));
  }, [registeredProducts]);

  useEffect(() => {
    localStorage.setItem('mm_claims', JSON.stringify(cropClaims));
  }, [cropClaims]);

  const updateFarmerProfile = (updated: Partial<FarmerProfile>) => {
    setFarmerProfile((prev) => ({ ...prev, ...updated }));
    showToast(language === 'hi' ? 'किसान प्रोफाइल सफलतापूर्वक अपडेट की गई!' : 'Farmer profile updated successfully!');
  };

  const refreshMandiRecords = async () => {
    setIsMandiRefreshing(true);
    try {
      // Simulate network roundtrip to Agmarknet gateway
      await new Promise((r) => setTimeout(r, 600));
      // Re-stamp retrieval time
      const fresh = mandiRecords.map((r) => ({
        ...r,
        retrievedAt: new Date().toISOString(),
        isCached: false,
      }));
      setMandiRecords(fresh);
      showToast(language === 'hi' ? 'ताज़ा मंडी भाव सफलतापूर्वक लोड हुए!' : 'Live Mandi Bhav refreshed successfully!');
    } catch (err) {
      showToast(language === 'hi' ? 'मंडी भाव रिफ्रेश विफल हुआ' : 'Failed to refresh Mandi Bhav');
    } finally {
      setIsMandiRefreshing(false);
    }
  };

  const addSellingOption = (opt: SellingOption) => {
    setSellingOptions((prev) => [...prev, opt]);
    showToast(language === 'hi' ? 'नया बिक्री विकल्प जोड़ा गया' : 'New selling option added');
  };

  const updateSellingOption = (id: string, updated: Partial<SellingOption>) => {
    setSellingOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, ...updated } : opt))
    );
  };

  const removeSellingOption = (id: string) => {
    setSellingOptions((prev) => prev.filter((opt) => opt.id !== id));
    showToast(language === 'hi' ? 'विकल्प हटा दिया गया' : 'Option removed');
  };

  const resetWhatIfScenario = () => {
    setWhatIfScenario(DEFAULT_WHAT_IF);
    showToast(language === 'hi' ? 'सिमुलेशन रीसेट कर दिया गया' : 'Simulation reset to baseline');
  };

  // Calculated options
  const calculatedResults = compareSellingOptions(sellingOptions, cropQuantity);

  const saveCurrentComparison = (notes?: string) => {
    if (calculatedResults.length === 0) return;
    const best = calculatedResults[0];
    const newRecord: NetReturnComparisonData = {
      id: `comp-${Date.now()}`,
      date: new Date().toISOString(),
      cropName: selectedCrop,
      quantityQuintals: cropQuantity,
      options: calculatedResults,
      recommendedOptionId: best.option.id,
      totalVariance: calculatedResults.length > 1 ? best.differenceFromBest : 0,
      notes,
    };
    setSavedComparisons((prev) => [newRecord, ...prev]);
    showToast(language === 'hi' ? 'बिक्री तुलना इतिहास में सुरक्षित कर ली गई!' : 'Selling comparison saved to history!');
  };

  const deleteSavedComparison = (id: string) => {
    setSavedComparisons((prev) => prev.filter((c) => c.id !== id));
    showToast(language === 'hi' ? 'तुलना रिकॉर्ड हटा दिया गया' : 'Comparison deleted');
  };

  const saveCropDoctorReport = (report: CropDoctorReport) => {
    setCropDoctorReports((prev) => [report, ...prev]);
    showToast(language === 'hi' ? 'फसल डॉक्टर रिपोर्ट सुरक्षित की गई!' : 'Crop Doctor report saved!');
  };

  const registerProduct = (prod: Omit<ProductRegistration, 'id' | 'registeredAt'>) => {
    const newProd: ProductRegistration = {
      ...prod,
      id: `reg-${Date.now()}`,
      registeredAt: new Date().toISOString(),
    };
    setRegisteredProducts((prev) => [newProd, ...prev]);
    showToast(language === 'hi' ? 'उत्पाद वारंटी पंजीकरण सफल!' : 'Product warranty registered successfully!');
  };

  const submitCropClaim = (claimData: Omit<CropClaim, 'id' | 'status' | 'statusHistory' | 'submittedAt' | 'updatedAt'>) => {
    const newClaim: CropClaim = {
      ...claimData,
      id: `claim-${Date.now()}`,
      status: 'Submitted',
      officialClaimRefNo: `MM-CLM-${Date.now().toString().slice(-6)}`,
      statusHistory: [
        {
          status: 'Submitted',
          date: new Date().toISOString().split('T')[0],
          note: 'दावा मंडी मित्र पोर्टल पर पंजीकृत किया गया एवं कंपनी हेल्पडेस्क को अग्रेषित किया गया।',
        },
      ],
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCropClaims((prev) => [newClaim, ...prev]);
    showToast(language === 'hi' ? 'फसल क्षति दावा सफलतापूर्वक दर्ज किया गया!' : 'Crop claim filed successfully!');
  };

  const updateClaimStatus = (claimId: string, status: CropClaim['status'], note: string) => {
    setCropClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          const hist = [...c.statusHistory, { status, date: new Date().toISOString().split('T')[0], note }];
          return { ...c, status, statusHistory: hist, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );
    showToast(`Claim status updated to ${status}`);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        farmerProfile,
        updateFarmerProfile,
        activeTab,
        setActiveTab,
        mandiRecords,
        refreshMandiRecords,
        isMandiRefreshing,
        selectedCrop,
        setSelectedCrop,
        cropQuantity,
        setCropQuantity,
        sellingOptions,
        setSellingOptions,
        addSellingOption,
        updateSellingOption,
        removeSellingOption,
        calculatedResults,
        whatIfScenario,
        setWhatIfScenario,
        resetWhatIfScenario,
        savedComparisons,
        saveCurrentComparison,
        deleteSavedComparison,
        cropDoctorReports,
        saveCropDoctorReport,
        assurancePrograms,
        registeredProducts,
        registerProduct,
        cropClaims,
        submitCropClaim,
        updateClaimStatus,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
