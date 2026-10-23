import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AssuranceProgram, ProductRegistration, CropClaim } from '../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
  Sparkles,
  HelpCircle,
  Building,
  Upload,
} from 'lucide-react';

export const CropAssuranceMarketplace: React.FC = () => {
  const {
    language,
    assurancePrograms,
    registeredProducts,
    registerProduct,
    cropClaims,
    submitCropClaim,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'programs' | 'registered' | 'claims' | 'estimator'>(
    'programs'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProgramModal, setSelectedProgramModal] = useState<AssuranceProgram | null>(null);

  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({
    farmerId: 'farmer-default',
    companyName: 'Bayer CropScience India',
    productName: '',
    productCategory: 'Seeds',
    crop: 'Wheat',
    purchaseDate: new Date().toISOString().split('T')[0],
    quantity: '2 Bags',
    batchNumber: '',
    retailerName: '',
    retailerDistrict: 'Neemuch',
    invoiceNumber: '',
  });

  // Claim Filing Modal State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({
    farmerId: 'farmer-default',
    registeredProductId: '',
    productName: '',
    companyName: '',
    programName: '',
    crop: '',
    damageObservedDate: new Date().toISOString().split('T')[0],
    damageDescription: '',
    affectedAreaAcres: 1.5,
    estimatedLossPercent: 35,
    photos: [] as string[],
  });

  // Estimator State
  const [estimatorSelectedProgId, setEstimatorSelectedProgId] = useState<string>(
    assurancePrograms[0]?.id || ''
  );
  const [estimatorAnswers, setEstimatorAnswers] = useState({
    hasInvoice: true,
    hasEmptyPacketBatch: true,
    observedWithinDeadline: true,
    irrigationFollowed: true,
    extremeNaturalDisaster: false,
  });

  // Filtered Programs
  const filteredPrograms = assurancePrograms.filter((prog) => {
    if (selectedCategory !== 'All' && prog.companyCategory !== selectedCategory) return false;
    if (selectedCrop !== 'All' && !prog.supportedCrops.includes(selectedCrop)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = prog.companyName.toLowerCase().includes(q);
      const matchProg = prog.programName.toLowerCase().includes(q);
      const matchProd = prog.productsCovered.some((p) => p.toLowerCase().includes(q));
      if (!matchComp && !matchProg && !matchProd) return false;
    }
    return true;
  });

  const handleRegisterProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.productName || !regForm.batchNumber) {
      showToast('कृपया उत्पाद का नाम एवं बैच नंबर दर्ज करें');
      return;
    }

    registerProduct(regForm);
    setShowRegModal(false);
    setRegForm({
      farmerId: 'farmer-default',
      companyName: 'Bayer CropScience India',
      productName: '',
      productCategory: 'Seeds',
      crop: 'Wheat',
      purchaseDate: new Date().toISOString().split('T')[0],
      quantity: '2 Bags',
      batchNumber: '',
      retailerName: '',
      retailerDistrict: 'Neemuch',
      invoiceNumber: '',
    });
  };

  const handleFileClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimForm.registeredProductId || !claimForm.damageDescription) {
      showToast('कृपया पंजीकृत उत्पाद चुनें व क्षति का विवरण लिखें');
      return;
    }

    const regProd = registeredProducts.find((p) => p.id === claimForm.registeredProductId);
    const linkedProg = assurancePrograms.find((p) => p.id === regProd?.linkedProgramId);

    submitCropClaim({
      ...claimForm,
      productName: regProd?.productName || 'Unknown',
      companyName: regProd?.companyName || 'Unknown',
      programName: linkedProg?.programName || 'Company Warranty Shield',
      crop: regProd?.crop || 'Crop',
      estimatedCompensation: Math.round(claimForm.affectedAreaAcres * 1200),
    });

    setShowClaimModal(false);
  };

  // Run Estimator Logic
  const activeEstimatorProg = assurancePrograms.find((p) => p.id === estimatorSelectedProgId);
  const getEligibilityVerdict = () => {
    if (!estimatorAnswers.hasInvoice || !estimatorAnswers.hasEmptyPacketBatch) {
      return {
        status: 'Ineligible (Missing Documents)',
        color: 'text-red-700 bg-red-50 border-red-300',
        message: 'अपात्र (दस्तावेज़ अपूर्ण): कंपनी वारंटी हेतु अधिकृत डीलर का बिल एवं बैच नंबर वाला मूल खाली पैकेट अनिवार्य है।',
      };
    }
    if (!estimatorAnswers.observedWithinDeadline) {
      return {
        status: 'Ineligible (Deadline Exceeded)',
        color: 'text-red-700 bg-red-50 border-red-300',
        message: `अपात्र (समय सीमा समाप्त): दावा बुवाई/छिड़काव के ${activeEstimatorProg?.claimDeadlineDays || 7} दिनों के भीतर दर्ज नहीं किया गया।`,
      };
    }
    if (estimatorAnswers.extremeNaturalDisaster) {
      return {
        status: 'Refer to PMFBY',
        color: 'text-purple-700 bg-purple-50 border-purple-300',
        message: 'कंपनी अपवर्जन (Exclusion): अत्यधिक बाढ़ या सूखा कंपनी उत्पाद वारंटी में कवर नहीं होता। कृपया इसके लिए PMFBY पोर्टल (14447) पर प्राकृतिक आपदा दावा दर्ज करें।',
      };
    }
    return {
      status: 'Potentially Eligible',
      color: 'text-emerald-800 bg-emerald-50 border-emerald-300',
      message: 'संभावित रूप से पात्र (Potentially Eligible): आपके द्वारा दी गई जानकारी के अनुसार आपका दावा कंपनी के नियमों के अनुकूल है। भौतिक सत्यापन के बाद बीज प्रतिस्थापन या क्षतिपूर्ति संभव है।',
    };
  };

  const verdict = getEligibilityVerdict();

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
                {language === 'hi'
                  ? 'कंपनी फसल सुरक्षा एवं वारंटी बाज़ार (Crop Assurance Marketplace)'
                  : 'Company Crop Assurance Marketplace'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {language === 'hi'
                  ? 'प्रमाणित बीज अंकुरण गारंटी, कीटनाशक प्रभावशीलता वारंटी, उत्पाद पंजीकरण एवं क्लेम ट्रैकिंग'
                  : 'Verified seed germination replacement policies, pesticide efficacy warranties & transparent claim tracking'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowRegModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>{language === 'hi' ? 'नया उत्पाद रजिस्टर करें' : 'Register Product'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowClaimModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 rounded-xl text-xs font-black transition-colors shadow-xs"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{language === 'hi' ? 'क्षति दावा दर्ज करें' : 'File Claim'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 space-x-2 text-xs font-bold overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('programs')}
          className={`pb-3 px-3 transition-colors flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
            activeTab === 'programs'
              ? 'border-emerald-700 text-emerald-900 font-black'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Building className="w-4 h-4 text-emerald-700" />
          <span>कंपनी वारंटी डायरेक्टरी ({assurancePrograms.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('registered')}
          className={`pb-3 px-3 transition-colors flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
            activeTab === 'registered'
              ? 'border-emerald-700 text-emerald-900 font-black'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>मेरे पंजीकृत उत्पाद ({registeredProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-3 transition-colors flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
            activeTab === 'claims'
              ? 'border-emerald-700 text-emerald-900 font-black'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>क्षति दावे व स्थिति ट्रैक ({cropClaims.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('estimator')}
          className={`pb-3 px-3 transition-colors flex items-center space-x-1.5 border-b-2 whitespace-nowrap ${
            activeTab === 'estimator'
              ? 'border-emerald-700 text-emerald-900 font-black'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>मुआवजा पात्रता कैलकुलेटर (Eligibility Estimator)</span>
        </button>
      </div>

      {/* ==================== TAB 1: PROGRAMS DIRECTORY ==================== */}
      {activeTab === 'programs' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">खोजें</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="कंपनी, उत्पाद या प्रोग्राम खोजें..."
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">श्रेणी (Category)</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">सभी श्रेणियां (All Categories)</option>
                <option value="Seeds">बीज कंपनियां (Seeds)</option>
                <option value="Agrochemicals">कीटनाशक व फफूंदनाशी (Agrochemicals)</option>
                <option value="Insurance">सरकारी व निजी फसल बीमा (Insurance/PMFBY)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">फसल (Crop)</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">सभी फसलें (All Crops)</option>
                <option value="Wheat">गेहूं (Wheat)</option>
                <option value="Paddy">धान (Paddy)</option>
                <option value="Mustard">सरसों (Mustard)</option>
                <option value="Maize">मक्का (Maize)</option>
                <option value="Soyabean">सोयाबीन (Soyabean)</option>
                <option value="Cotton">कपास (Cotton)</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrograms.map((prog) => {
              const isVerified = prog.verificationStatus === 'Verified';
              return (
                <div
                  key={prog.id}
                  className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200">
                          {prog.companyCategory}
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-base mt-1.5 leading-snug">
                          {prog.companyName}
                        </h3>
                        <p className="text-xs font-semibold text-emerald-800">{prog.programName}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isVerified ? 'प्रमाणित नीति ✅' : 'समीक्षाधीन ⏳'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">{prog.summaryHindi}</p>

                    {/* Quick Badges */}
                    <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <strong className="text-gray-900">कवर उत्पाद: </strong>
                        <span>{prog.productsCovered.slice(0, 2).join(', ')}</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">कवर सीमा: </strong>
                        <span className="text-emerald-700 font-semibold">{prog.coverageLimits}</span>
                      </div>
                      <div>
                        <strong className="text-gray-900">दावा समय सीमा: </strong>
                        <span className="text-red-700 font-bold">{prog.claimDeadlineDays} दिनों के भीतर</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedProgramModal(prog)}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center space-x-1"
                    >
                      <span>नियम व पात्रता देखें</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {prog.supportPhone && (
                      <a
                        href={`tel:${prog.supportPhone.split(' ')[0]}`}
                        className="text-[11px] text-gray-500 hover:text-emerald-800 flex items-center space-x-1"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>हेल्पलाइन</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: REGISTERED PRODUCTS ==================== */}
      {activeTab === 'registered' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              अपनी खरीदे गए बीज, खाद और दवाओं के बिल व बैच नंबर सुरक्षित रखें ताकि अंकुरण या प्रभाव न होने पर तुरंत दावा दर्ज किया जा सके।
            </p>
            <button
              type="button"
              onClick={() => setShowRegModal(true)}
              className="px-3.5 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>उत्पाद जोड़ें</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {registeredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                      {prod.productCategory} • {prod.crop}
                    </span>
                    <h3 className="font-extrabold text-gray-900 text-base mt-1">
                      {prod.productName}
                    </h3>
                    <p className="text-xs text-gray-500">{prod.companyName}</p>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    सक्रिय वारंटी 🛡️
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[10px]">बैच नंबर:</span>
                    <strong className="text-gray-900">{prod.batchNumber}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">खरीद दिनांक:</span>
                    <strong className="text-gray-900">{prod.purchaseDate}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">डीलर/दुकानदार:</span>
                    <span className="text-gray-800">{prod.retailerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">बिल / रसीद क्र.:</span>
                    <span className="text-gray-800">{prod.invoiceNumber}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setClaimForm({
                        ...claimForm,
                        registeredProductId: prod.id,
                        crop: prod.crop,
                      });
                      setShowClaimModal(true);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    इस उत्पाद पर दावा दर्ज करें
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: CLAIMS TRACKING ==================== */}
      {activeTab === 'claims' && (
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-emerald-950">
              पंजीकृत फसल क्षति दावे (Filed Crop Damage Claims)
            </h3>

            {cropClaims.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">कोई सक्रिय दावा नहीं है।</p>
            ) : (
              <div className="space-y-4">
                {cropClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-5 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-gray-900 text-sm">
                            {claim.productName} ({claim.crop})
                          </span>
                          <span className="text-xs text-gray-500">
                            • रिफ: <strong>{claim.officialClaimRefNo}</strong>
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                          {claim.companyName} — {claim.programName}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                          {claim.status}
                        </span>
                        <div className="text-[11px] text-gray-500 mt-1">
                          दावा दिनांक: {claim.damageObservedDate}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-200/60">
                      <strong>क्षति का विवरण: </strong>
                      {claim.damageDescription} (प्रभावित रकबा: {claim.affectedAreaAcres} एकड़, अनुमानित क्षति: {claim.estimatedLossPercent}%)
                    </p>

                    {/* Status Stepper History */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide block">
                        दावा प्रक्रिया स्थिति (Audit Trail):
                      </span>
                      <div className="space-y-1.5">
                        {claim.statusHistory.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex items-start space-x-2 text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-gray-200"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-gray-900">
                                {step.status} <span className="text-gray-400 font-normal">({step.date})</span>
                              </div>
                              <p className="text-gray-600 mt-0.5">{step.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 4: ELIGIBILITY ESTIMATOR ==================== */}
      {activeTab === 'estimator' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-emerald-950 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>मुआवजा एवं प्रतिस्थापन पात्रता जांच (Assurance Eligibility Estimator)</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                कंपनी की नीति शर्तों के अनुसार अपनी स्थिति जांचें कि क्या आप बीज प्रतिस्थापन या रिफंड के पात्र हैं।
              </p>
            </div>

            {/* Select program to test */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                कंपनी वारंटी योजना चुनें:
              </label>
              <select
                value={estimatorSelectedProgId}
                onChange={(e) => setEstimatorSelectedProgId(e.target.value)}
                className="w-full sm:w-96 px-3 py-2 border rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500"
              >
                {assurancePrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.companyName} — {p.programName}
                  </option>
                ))}
              </select>
            </div>

            {/* Questions Checklist */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3 text-xs">
              <span className="font-bold text-gray-900 block text-sm">
                पात्रता प्रश्नावली (Eligibility Questionnaire):
              </span>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={estimatorAnswers.hasInvoice}
                  onChange={(e) =>
                    setEstimatorAnswers({ ...estimatorAnswers, hasInvoice: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>क्या आपके पास अधिकृत डीलर का GST कैश मेमो / बिल उपलब्ध है?</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={estimatorAnswers.hasEmptyPacketBatch}
                  onChange={(e) =>
                    setEstimatorAnswers({
                      ...estimatorAnswers,
                      hasEmptyPacketBatch: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>क्या आपके पास मूल खाली पैकेट एवं बारकोड / बैच नंबर टैग सुरक्षित है?</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={estimatorAnswers.observedWithinDeadline}
                  onChange={(e) =>
                    setEstimatorAnswers({
                      ...estimatorAnswers,
                      observedWithinDeadline: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>
                  क्या आपने बुवाई/छिड़काव के निर्धारित समय सीमा (
                  {activeEstimatorProg?.claimDeadlineDays || 12} दिन) के भीतर शिकायत की है?
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={estimatorAnswers.extremeNaturalDisaster}
                  onChange={(e) =>
                    setEstimatorAnswers({
                      ...estimatorAnswers,
                      extremeNaturalDisaster: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-red-700">
                  क्या नुकसान अत्यधिक प्राकृतिक आपदा (जैसे भीषण सूखा या 3 दिन लगातार खेत डूबना) से हुआ है?
                </span>
              </label>
            </div>

            {/* Verdict Result Card */}
            <div className={`p-5 rounded-2xl border ${verdict.color} space-y-2`}>
              <div className="font-black text-sm uppercase tracking-wide">
                परिणाम: {verdict.status}
              </div>
              <p className="text-xs leading-relaxed font-semibold">{verdict.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Program Details Modal */}
      {selectedProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]">
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-300 font-bold uppercase">
                  {selectedProgramModal.companyCategory}
                </span>
                <h2 className="text-base font-bold">{selectedProgramModal.companyName}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProgramModal(null)}
                className="text-emerald-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <strong className="block text-emerald-950 font-bold">
                  {selectedProgramModal.programName}
                </strong>
                <p className="text-emerald-900 mt-1">{selectedProgramModal.description}</p>
              </div>

              <div>
                <span className="font-bold text-gray-800 block mb-1">कवर सीमा (Coverage Limit):</span>
                <p className="text-gray-700 bg-gray-50 p-2.5 rounded-lg border">
                  {selectedProgramModal.coverageLimits}
                </p>
              </div>

              <div>
                <span className="font-bold text-gray-800 block mb-1">आवश्यक दस्तावेज़ (Required Documents):</span>
                <ul className="list-disc list-inside space-y-1 text-gray-600 bg-gray-50 p-2.5 rounded-lg border">
                  {selectedProgramModal.requiredDocuments.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-red-800 block mb-1">अपवर्जन / शर्तें (Exclusions):</span>
                <ul className="list-disc list-inside space-y-1 text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {selectedProgramModal.exclusions.map((exc, idx) => (
                    <li key={idx}>{exc}</li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-gray-500 pt-2 border-t">
                नीति स्रोत: {selectedProgramModal.policySource}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Product Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]">
            <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold">नया उत्पाद पंजीकृत करें (Register Product)</h2>
              <button
                type="button"
                onClick={() => setShowRegModal(false)}
                className="text-emerald-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterProductSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">कंपनी का नाम</label>
                <select
                  value={regForm.companyName}
                  onChange={(e) => setRegForm({ ...regForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Bayer CropScience India">Bayer CropScience India</option>
                  <option value="Syngenta India Ltd">Syngenta India Ltd</option>
                  <option value="Corteva Agriscience">Corteva Agriscience (Pioneer)</option>
                  <option value="UPL Limited">UPL Limited</option>
                  <option value="Mahyco Seeds Ltd">Mahyco Seeds Ltd</option>
                  <option value="Dhanuka Agritech Ltd">Dhanuka Agritech Ltd</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">उत्पाद का नाम</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Arize 6444 Gold"
                    value={regForm.productName}
                    onChange={(e) => setRegForm({ ...regForm, productName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">बैच नंबर (Batch No.)</label>
                  <input
                    type="text"
                    required
                    placeholder="पैकेट पर मुद्रित बैच"
                    value={regForm.batchNumber}
                    onChange={(e) => setRegForm({ ...regForm, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">फसल (Crop)</label>
                  <input
                    type="text"
                    value={regForm.crop}
                    onChange={(e) => setRegForm({ ...regForm, crop: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">खरीद दिनांक</label>
                  <input
                    type="date"
                    value={regForm.purchaseDate}
                    onChange={(e) => setRegForm({ ...regForm, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">डीलर / दुकान का नाम</label>
                  <input
                    type="text"
                    placeholder="किसान सेवा केंद्र"
                    value={regForm.retailerName}
                    onChange={(e) => setRegForm({ ...regForm, retailerName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">बिल / रसीद नंबर</label>
                  <input
                    type="text"
                    placeholder="INV-9821"
                    value={regForm.invoiceNumber}
                    onChange={(e) => setRegForm({ ...regForm, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  पंजीकृत करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]">
            <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold">फसल क्षति दावा दर्ज करें (File Claim)</h2>
              <button
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="text-amber-100 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFileClaimSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  पंजीकृत उत्पाद चुनें (Select Registered Product)
                </label>
                <select
                  required
                  value={claimForm.registeredProductId}
                  onChange={(e) => setClaimForm({ ...claimForm, registeredProductId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">उत्पाद चुनें...</option>
                  {registeredProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productName} ({p.crop} - बैच: {p.batchNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">क्षति देखने की तारीख</label>
                  <input
                    type="date"
                    required
                    value={claimForm.damageObservedDate}
                    onChange={(e) => setClaimForm({ ...claimForm, damageObservedDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">प्रभावित रकबा (एकड़)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={claimForm.affectedAreaAcres}
                    onChange={(e) =>
                      setClaimForm({
                        ...claimForm,
                        affectedAreaAcres: parseFloat(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  क्षति का विस्तृत विवरण (Damage Description)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="उदा. बुवाई के 10 दिन बाद भी केवल 40% अंकुरण हुआ है..."
                  value={claimForm.damageDescription}
                  onChange={(e) => setClaimForm({ ...claimForm, damageDescription: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg text-amber-900 border border-amber-200">
                ⚠️ ध्यान दें: यह दावा मंडी मित्र पोर्टल पर पंजीकृत होगा एवं संबंधित कंपनी के फील्ड प्रतिनिधि को भौतिक सत्यापन हेतु भेजा जाएगा।
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs"
                >
                  दावा सबमिट करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropAssuranceMarketplace;
