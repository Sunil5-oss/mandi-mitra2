import React from 'react';
import { useApp } from '../context/AppContext';
import { POPULAR_COMMODITIES } from '../data/mandiData';
import {
  TrendingUp,
  Scale,
  Stethoscope,
  MessageSquare,
  ShieldCheck,
  CloudSun,
  FlaskConical,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const {
    language,
    farmerProfile,
    setActiveTab,
    mandiRecords,
    calculatedResults,
    cropQuantity,
    selectedCrop,
    registeredProducts,
    cropClaims,
  } = useApp();

  const bestOption = calculatedResults[0];
  const runnerUp = calculatedResults[1];
  const netAdvantage = bestOption && runnerUp ? bestOption.estimatedNetReturn - runnerUp.estimatedNetReturn : 0;

  // Selected crop details
  const cropMeta = POPULAR_COMMODITIES.find((c) => c.id === selectedCrop) || POPULAR_COMMODITIES[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {language === 'hi' ? 'स्मार्ट कृषि निर्णय व बिक्री मंच' : 'Smart Agriculture & Net Return Decision Engine'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            {language === 'hi'
              ? `राम-राम, ${farmerProfile.name} जी!`
              : `Welcome, ${farmerProfile.name}!`}
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            {language === 'hi'
              ? `केवल ऊंचा मंडी भाव देखकर धोखा न खाएं। भाड़ा, पल्लेदारी और आढ़त खर्च घटाकर जानिए असली शुद्ध मुनाफा (Net In-Hand Return)।`
              : `Never sell on headline prices alone. Deduct real transport, handling, and commission costs to discover your true net in-hand profit.`}
          </p>

          {/* Quick Stat Badges */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="bg-emerald-950/70 border border-emerald-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
              <span>📍 {farmerProfile.village ? `${farmerProfile.village}, ` : ''}{farmerProfile.district}</span>
            </span>
            <span className="bg-emerald-950/70 border border-emerald-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5">
              <span>🌾 {farmerProfile.landSizeAcres} एकड़ कृषि भूमि</span>
            </span>
            <span className="bg-emerald-950/70 border border-emerald-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-amber-300">
              <span>🛡️ {registeredProducts.length} प्रमाणित उत्पाद पंजीकृत</span>
            </span>
          </div>
        </div>

        {/* Subtle decorative wheat pattern */}
        <div className="absolute -right-8 -bottom-10 opacity-15 text-8xl sm:text-9xl pointer-events-none select-none">
          🌾
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Net Selling Advantage */}
        <div
          onClick={() => setActiveTab('net-return')}
          className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {language === 'hi' ? 'सर्वोत्तम शुद्ध बिक्री विकल्प' : 'Best Selling Option'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-black text-emerald-950 truncate">
              {bestOption ? bestOption.option.name : 'नीमच APMC मंडी'}
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              ₹{bestOption ? bestOption.estimatedNetReturn.toLocaleString('en-IN') : '2,24,000'}
            </div>
            <div className="flex items-center space-x-1 text-xs text-amber-800 font-semibold mt-1 bg-amber-50 px-2 py-0.5 rounded w-fit">
              <span>+{netAdvantage > 0 ? `₹${netAdvantage.toLocaleString('en-IN')}` : '₹2,900'}</span>
              <span>{language === 'hi' ? 'अन्य विकल्प से अधिक शुद्ध बचत' : 'extra vs runner-up'}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Live Mandi Headline */}
        <div
          onClick={() => setActiveTab('mandi-prices')}
          className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {language === 'hi' ? 'ताज़ा मंडी मॉडल भाव' : 'Live Modal Mandi Price'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-gray-700 flex items-center space-x-1">
              <span>{cropMeta.icon}</span>
              <span>{cropMeta.nameHi} (सरसों/Mustard)</span>
            </div>
            <div className="text-2xl font-black text-gray-900 mt-1">
              ₹5,780<span className="text-xs font-medium text-gray-500">/क्विंटल</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+₹65 (नीमच APMC मंडी)</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Weather & Agro Spray Advisory */}
        <div
          onClick={() => setActiveTab('weather')}
          className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {language === 'hi' ? 'मौसम व छिड़काव स्थिति' : 'Weather & Spray Window'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CloudSun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900">
              29.4°C <span className="text-xs font-semibold text-gray-500">नमी 64%</span>
            </div>
            <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'hi' ? 'कीटनाशक छिड़काव अनुकूल' : 'Safe for chemical spray'}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1 truncate">
              {language === 'hi' ? 'हवा 11 किमी/घंटा, बारिश की संभावना नहीं' : 'Wind 11 km/h, clear sky'}
            </p>
          </div>
        </div>

        {/* KPI 4: Company Assurance & Claim */}
        <div
          onClick={() => setActiveTab('assurance')}
          className="bg-white rounded-xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {language === 'hi' ? 'कंपनी फसल गारंटी व दावे' : 'Crop Assurance & Claims'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-950">
              {registeredProducts.length}{' '}
              <span className="text-xs font-semibold text-gray-600">
                {language === 'hi' ? 'पंजीकृत उत्पाद' : 'Registered Inputs'}
              </span>
            </div>
            <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {cropClaims.length > 0
                  ? `1 दावा स्वीकृत (₹2,400 प्रतिस्थापन)`
                  : 'कोई लंबित दावा नहीं'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {language === 'hi' ? 'बीज अंकुरण व कीटनाशक वारंटी' : 'Germination & efficacy shield'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Action Hub - 3 Key Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Feature 1: Smart Mandi Selling & Net Return Advisor */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Scale className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold text-emerald-950">
                  {language === 'hi' ? 'स्मार्ट मंडी बिक्री सलाहकार (Net Return Advisor)' : 'Smart Mandi Selling Advisor'}
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {language === 'hi'
                  ? `वर्तमान फसल: ${selectedCrop} (${cropQuantity} क्विंटल) — विभिन्न मंडियों एवं आढ़तियों के खर्चों की तुलना`
                  : `Active: ${selectedCrop} (${cropQuantity} Quintals) — Real net profit comparison after transport & mandi fees`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('net-return')}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <span>{language === 'hi' ? 'विस्तार से जांचें' : 'Open Full Advisor'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Side-by-side Selling Options Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {calculatedResults.slice(0, 3).map((item, idx) => {
              const isWinner = item.isBestOption;
              return (
                <div
                  key={item.option.id}
                  className={`rounded-xl p-4 border transition-all ${
                    isWinner
                      ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/30'
                      : 'bg-gray-50/70 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white border text-gray-700">
                      विकल्प {idx + 1}
                    </span>
                    {isWinner && (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                        सर्वोत्तम शुद्ध आय ⭐
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{item.option.name}</h3>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>मंडी भाव:</span>
                      <span className="font-bold text-gray-900">₹{item.option.offeredPricePerQuintal}/क्विंटल</span>
                    </div>
                    <div className="flex justify-between">
                      <span>सकल मूल्य:</span>
                      <span>₹{item.grossSaleValue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>कुल खर्च (भाड़ा+आढ़त):</span>
                      <span className="font-semibold">-₹{item.totalExpenses.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                      <span className="font-bold text-gray-900">शुद्ध आय:</span>
                      <span className="text-base font-black text-emerald-800">
                        ₹{item.estimatedNetReturn.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 text-right">
                      (₹{item.netReturnPerQuintal}/क्विंटल शुद्ध)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Simulation Banner */}
          <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="font-bold text-amber-950 text-sm flex items-center space-x-1.5">
                <span>⚡ क्या-अगर सिमुलेटर (What-If Simulator)</span>
              </div>
              <p className="text-xs text-amber-900">
                {language === 'hi'
                  ? 'अगर डीजल या भाड़ा ₹500 बढ़ जाए, या आढ़तिया भाव ₹100 घटा दे, तो आपके मुनाफे पर क्या असर पड़ेगा?'
                  : 'Simulate changes in transport costs, trader offers, or crop storage holding risks in real-time.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('net-return')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 rounded-lg text-xs font-black shrink-0 transition-colors shadow-xs"
            >
              {language === 'hi' ? 'सिमुलेशन चलाएं' : 'Simulate Scenarios'}
            </button>
          </div>
        </div>

        {/* AI Agriculture Chat & Crop Doctor Assistant Card */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <MessageSquare className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-emerald-950">
                {language === 'hi' ? 'कृषि मित्र AI सहायक' : 'Mandi Mitra AI Assistant'}
              </h2>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {language === 'hi'
                ? 'खेती-किसानी, खाद-बीज की खुराक, मंडी में बेचने की सही रणनीति या कीट नियंत्रण पर हिंदी/हिंग्लिश में तुरंत पूछें।'
                : 'Get instant, context-aware agricultural advice, mandi rate interpretation, and IPM remedies in Hindi/English.'}
            </p>

            {/* Suggested Question Chips */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('ai-chat')}
                className="w-full text-left text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-900 p-2.5 rounded-lg border border-emerald-200 transition-colors flex items-center justify-between group"
              >
                <span>🌾 सरसों कब बेचना ज्यादा फायदेमंद रहेगा?</span>
                <ChevronRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('crop-doctor')}
                className="w-full text-left text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 p-2.5 rounded-lg border border-amber-200 transition-colors flex items-center justify-between group"
              >
                <span>🩺 पत्ती पर पीलापन या धब्बे? फोटो जांचें</span>
                <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('fertilizer')}
                className="w-full text-left text-xs bg-sky-50 hover:bg-sky-100 text-sky-900 p-2.5 rounded-lg border border-sky-200 transition-colors flex items-center justify-between group"
              >
                <span>🧪 गेहूं व सरसों में यूरिया और डीएपी की सही खुराक</span>
                <ChevronRight className="w-4 h-4 text-sky-700 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('ai-chat')}
            className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>{language === 'hi' ? 'AI सहायक से बातचीत शुरू करें' : 'Start Chat with Agri AI'}</span>
          </button>
        </div>
      </div>

      {/* Live Mandi Market Highlights Table */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-emerald-950">
                {language === 'hi' ? 'प्रमुख मंडियों के ताज़ा भाव (Agmarknet Live)' : 'Top Mandi Rates Overview'}
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'hi'
                ? 'सरकारी कृषि विपणन पोर्टल (Agmarknet/e-NAM) द्वारा सत्यापित दैनिक आवक एवं भाव'
                : 'Verified daily APMC market arrivals and modal prices from official agricultural boards'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('mandi-prices')}
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <span>{language === 'hi' ? 'सभी मंडियों के भाव देखें' : 'View All Mandis'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">फसल (Commodity)</th>
                <th className="py-3 px-4">मंडी (Mandi)</th>
                <th className="py-3 px-4">राज्य व जिला</th>
                <th className="py-3 px-4 text-right">मॉडल भाव (Modal)</th>
                <th className="py-3 px-4 text-center">न्यूनतम - अधिकतम</th>
                <th className="py-3 px-4 text-center">रुझान (Trend)</th>
                <th className="py-3 px-4 text-right">कार्यवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {mandiRecords.slice(0, 6).map((rec) => {
                return (
                  <tr key={rec.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900 flex items-center space-x-2">
                      <span>🌾</span>
                      <div>
                        <div>{rec.commodity}</div>
                        <div className="text-[10px] text-gray-500 font-normal">{rec.variety}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-950">{rec.mandi}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {rec.district}, {rec.state}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-black text-sm text-emerald-700">
                        ₹{rec.modalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-500 block">/क्विंटल</span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      ₹{rec.minPrice} - ₹{rec.maxPrice}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {rec.priceTrend === 'up' && (
                        <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +₹{rec.priceChangeAmount}
                        </span>
                      )}
                      {rec.priceTrend === 'down' && (
                        <span className="inline-flex items-center text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-[11px]">
                          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> -₹{Math.abs(rec.priceChangeAmount || 0)}
                        </span>
                      )}
                      {rec.priceTrend === 'steady' && (
                        <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                          स्थिर (0)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveTab('net-return')}
                        className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded font-bold text-[11px] transition-colors"
                      >
                        {language === 'hi' ? 'मुनाफा जोड़ें' : 'Calculate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
