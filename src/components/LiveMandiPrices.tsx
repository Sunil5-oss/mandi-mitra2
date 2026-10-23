import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { INDIAN_STATES_DISTRICTS, POPULAR_COMMODITIES } from '../data/mandiData';
import { MandiPriceRecord } from '../types';
import {
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Building2,
  MapPin,
  CheckCircle,
  AlertCircle,
  Scale,
  Calendar,
} from 'lucide-react';

export const LiveMandiPrices: React.FC = () => {
  const {
    language,
    mandiRecords,
    refreshMandiRecords,
    isMandiRefreshing,
    setActiveTab,
    setSelectedCrop,
    addSellingOption,
  } = useApp();

  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'modal_desc' | 'modal_asc' | 'recent'>('modal_desc');

  // Compute available districts for chosen state
  const availableDistricts = useMemo(() => {
    if (selectedState === 'All') {
      const allD = new Set<string>();
      Object.values(INDIAN_STATES_DISTRICTS).forEach((list) => list.forEach((d) => allD.add(d)));
      return Array.from(allD);
    }
    return INDIAN_STATES_DISTRICTS[selectedState] || [];
  }, [selectedState]);

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    return mandiRecords
      .filter((rec) => {
        if (selectedState !== 'All' && rec.state !== selectedState) return false;
        if (selectedDistrict !== 'All' && rec.district !== selectedDistrict) return false;
        if (selectedCommodity !== 'All' && rec.commodity !== selectedCommodity) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMandi = rec.mandi.toLowerCase().includes(q);
          const matchCrop = rec.commodity.toLowerCase().includes(q);
          const matchVariety = (rec.variety || '').toLowerCase().includes(q);
          const matchDist = rec.district.toLowerCase().includes(q);
          if (!matchMandi && !matchCrop && !matchVariety && !matchDist) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'modal_desc') return b.modalPrice - a.modalPrice;
        if (sortBy === 'modal_asc') return a.modalPrice - b.modalPrice;
        return new Date(b.retrievedAt).getTime() - new Date(a.retrievedAt).getTime();
      });
  }, [mandiRecords, selectedState, selectedDistrict, selectedCommodity, searchQuery, sortBy]);

  // Handle importing a mandi price directly into Net Return Calculator
  const handleUseInCalculator = (rec: MandiPriceRecord) => {
    setSelectedCrop(rec.commodity);
    addSellingOption({
      id: `opt-${Date.now()}`,
      name: `${rec.mandi} (${rec.commodity})`,
      buyerType: 'apmc_mandi',
      offeredPricePerQuintal: rec.modalPrice,
      distanceKm: 25,
      expenses: {
        transportCost: 2400,
        transportType: 'per_trip',
        distanceKm: 25,
        loadingUnloadingCost: 600,
        commissionFee: 0,
        commissionType: 'fixed',
        packagingCost: 400,
        weighbridgeCost: 100,
        miscellaneousCost: 150,
      },
      paymentTerm: 'Same Day Transfer',
      notes: `आयातित भाव: ${rec.mandi} मॉडल रेट ₹${rec.modalPrice}/क्विंटल।`,
    });
    setActiveTab('net-return');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header and Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
                {language === 'hi' ? 'दैनिक लाइव मंडी भाव (Live Mandi Bhav)' : 'Live Mandi Prices & Arrivals'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {language === 'hi'
                  ? 'भारत सरकार के Agmarknet एवं राज्य कृषि विपणन बोर्डों से संकलित प्रमाणित न्यूनतम, अधिकतम व मॉडल भाव'
                  : 'Official modal, minimum & maximum prices directly from Agmarknet and State APMC Boards'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={refreshMandiRecords}
            disabled={isMandiRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isMandiRefreshing ? 'animate-spin' : ''}`} />
            <span>
              {isMandiRefreshing
                ? language === 'hi'
                  ? 'लोड हो रहा है...'
                  : 'Fetching...'
                : language === 'hi'
                ? 'भाव रिफ्रेश करें'
                : 'Refresh Rates'}
            </span>
          </button>
        </div>
      </div>

      {/* Commodity Quick Selector Pills */}
      <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          {language === 'hi' ? 'प्रमुख फसल चुनें (Quick Commodity Filter)' : 'Filter by Crop:'}
        </label>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCommodity('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCommodity === 'All'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {language === 'hi' ? 'सभी फसलें (All Crops)' : 'All Crops'}
          </button>
          {POPULAR_COMMODITIES.map((c) => {
            const isSelected = selectedCommodity === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCommodity(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-emerald-950 font-bold shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/50'
                }`}
              >
                <span>{c.icon}</span>
                <span>{language === 'hi' ? c.nameHi : c.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filter Bar (State, District, Search & Sort) */}
      <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {language === 'hi' ? 'खोजें (मंडी या किस्म)' : 'Search Mandi or Variety'}
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'उदा. नीमच, बासमती, लोकवन...' : 'e.g. Neemuch, Lokwan...'}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* State Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {language === 'hi' ? 'राज्य (State)' : 'State'}
          </label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict('All');
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            <option value="All">{language === 'hi' ? 'सभी राज्य (All States)' : 'All States'}</option>
            {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {language === 'hi' ? 'जिला (District)' : 'District'}
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            <option value="All">{language === 'hi' ? 'सभी जिले (All Districts)' : 'All Districts'}</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            {language === 'hi' ? 'क्रमबद्ध करें (Sort By)' : 'Sort By'}
          </label>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            <option value="modal_desc">
              {language === 'hi' ? 'मॉडल भाव (उच्च से निम्न)' : 'Modal Price (Highest First)'}
            </option>
            <option value="modal_asc">
              {language === 'hi' ? 'मॉडल भाव (निम्न से उच्च)' : 'Modal Price (Lowest First)'}
            </option>
            <option value="recent">
              {language === 'hi' ? 'हाल में अपडेट (Latest Time)' : 'Recently Updated'}
            </option>
          </select>
        </div>
      </div>

      {/* Record Counter & Data Source Transparency Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 px-1 gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-800">{filteredRecords.length}</span>
          <span>{language === 'hi' ? 'मंडी रिकॉर्ड उपलब्ध' : 'Mandi records found'}</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1 text-emerald-700 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>डेटा स्रोत: Agmarknet / e-NAM (कृषि विपणन एवं निरीक्षण निदेशालय)</span>
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">
            {language === 'hi' ? 'कोई मंडी रिकॉर्ड नहीं मिला' : 'No Mandi Records Found'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {language === 'hi'
              ? 'आपके द्वारा चुने गए राज्य या जिले में आज इस फसल की आवक दर्ज नहीं हुई है। फ़िल्टर रीसेट करें या अन्य मंडी खोजें।'
              : 'No records reported for the selected filter combination. Reset your filters to view active market arrivals.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedState('All');
              setSelectedDistrict('All');
              setSelectedCommodity('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold"
          >
            {language === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((rec) => {
            const timeAgo = new Date(rec.retrievedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <div
                key={rec.id}
                className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar: Commodity & Status Tag */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                        {rec.commodity}
                      </span>
                      <h3 className="font-extrabold text-gray-900 text-base mt-1.5 flex items-center space-x-1">
                        <span>{rec.mandi}</span>
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>
                          {rec.district}, {rec.state}
                        </span>
                      </div>
                    </div>

                    {/* Fresh / Cached Badge */}
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.isCached
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rec.isCached ? 'कैश डेटा' : 'लाइव अपडेट'}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1 flex items-center justify-end space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Variety Tag if exists */}
                  {rec.variety && (
                    <div className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md mt-2 border border-gray-100">
                      <span className="font-medium text-gray-500">किस्म (Variety): </span>
                      <span className="font-semibold text-gray-800">{rec.variety}</span>
                    </div>
                  )}

                  {/* Pricing Box */}
                  <div className="mt-4 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                          {language === 'hi' ? 'मॉडल भाव (Modal)' : 'Modal Price'}
                        </span>
                        <div className="text-2xl font-black text-emerald-900">
                          ₹{rec.modalPrice.toLocaleString('en-IN')}
                          <span className="text-xs font-medium text-gray-600">/क्विंटल</span>
                        </div>
                      </div>

                      {/* Price Trend */}
                      <div>
                        {rec.priceTrend === 'up' && (
                          <div className="flex items-center space-x-0.5 text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded-md shadow-2xs border border-emerald-300">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+₹{rec.priceChangeAmount}</span>
                          </div>
                        )}
                        {rec.priceTrend === 'down' && (
                          <div className="flex items-center space-x-0.5 text-xs font-bold text-red-600 bg-white px-2 py-1 rounded-md shadow-2xs border border-red-300">
                            <ArrowDownRight className="w-4 h-4" />
                            <span>-₹{Math.abs(rec.priceChangeAmount || 0)}</span>
                          </div>
                        )}
                        {rec.priceTrend === 'steady' && (
                          <div className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md shadow-2xs border border-gray-200">
                            भाव स्थिर
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Min & Max Price Bar */}
                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-gray-700">
                      <span>
                        न्यूनतम: <strong className="text-gray-900">₹{rec.minPrice}</strong>
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>
                        अधिकतम: <strong className="text-gray-900">₹{rec.maxPrice}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Arrival Volume & Reporting Date */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>दिनांक: {rec.arrivalDate}</span>
                    </span>
                    {rec.arrivalQuantityQuintals && (
                      <span className="font-semibold text-emerald-900">
                        आवक: {rec.arrivalQuantityQuintals.toLocaleString('en-IN')} क्विंटल
                      </span>
                    )}
                  </div>
                </div>

                {/* Calculate Net Return Button */}
                <button
                  type="button"
                  onClick={() => handleUseInCalculator(rec)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <Scale className="w-4 h-4 text-amber-300" />
                  <span>
                    {language === 'hi' ? 'इस मंडी का शुद्ध मुनाफा जांचें' : 'Compare Net In-Hand Return'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LiveMandiPrices;
