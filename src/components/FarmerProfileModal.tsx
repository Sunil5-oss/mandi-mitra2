import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INDIAN_STATES_DISTRICTS, POPULAR_COMMODITIES } from '../data/mandiData';
import { X, Save, User, MapPin, Wheat, Phone, Shield } from 'lucide-react';

interface FarmerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FarmerProfileModal: React.FC<FarmerProfileModalProps> = ({ isOpen, onClose }) => {
  const { farmerProfile, updateFarmerProfile, language } = useApp();

  const [formData, setFormData] = useState({
    name: farmerProfile.name,
    phone: farmerProfile.phone || '',
    state: farmerProfile.state,
    district: farmerProfile.district,
    village: farmerProfile.village || '',
    landSizeAcres: farmerProfile.landSizeAcres,
    primaryCrops: [...farmerProfile.primaryCrops],
  });

  if (!isOpen) return null;

  const availableDistricts = INDIAN_STATES_DISTRICTS[formData.state] || [formData.district];

  const handleStateChange = (newState: string) => {
    const districts = INDIAN_STATES_DISTRICTS[newState] || [];
    setFormData({
      ...formData,
      state: newState,
      district: districts[0] || '',
    });
  };

  const toggleCrop = (cropId: string) => {
    if (formData.primaryCrops.includes(cropId)) {
      setFormData({
        ...formData,
        primaryCrops: formData.primaryCrops.filter((c) => c !== cropId),
      });
    } else {
      setFormData({
        ...formData,
        primaryCrops: [...formData.primaryCrops, cropId],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFarmerProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg font-bold">
              {language === 'hi' ? 'किसान प्रोफाइल एवं खेत विवरण' : 'Farmer Profile & Farm Details'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
              {language === 'hi' ? 'किसान का पूरा नाम' : 'Farmer Full Name'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                {language === 'hi' ? 'मोबाइल नंबर (वैकल्पिक)' : 'Mobile Number'}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="98765-XXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                {language === 'hi' ? 'कुल कृषि भूमि (एकड़ में)' : 'Total Land (Acres)'}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="500"
                required
                value={formData.landSizeAcres}
                onChange={(e) => setFormData({ ...formData, landSizeAcres: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                {language === 'hi' ? 'राज्य (State)' : 'State'}
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm bg-white"
              >
                {Object.keys(INDIAN_STATES_DISTRICTS).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
                {language === 'hi' ? 'जिला (District)' : 'District'}
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm bg-white"
              >
                {availableDistricts.map((dst) => (
                  <option key={dst} value={dst}>
                    {dst}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
              {language === 'hi' ? 'गाँव / तहसील' : 'Village / Tehsil'}
            </label>
            <input
              type="text"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder={language === 'hi' ? 'उदा. जावद, मनासा' : 'e.g. Javad'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-950 uppercase tracking-wider mb-1">
              {language === 'hi' ? 'मुख्य फसलें (Primary Crops)' : 'Primary Crops'}
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_COMMODITIES.map((c) => {
                const isChecked = formData.primaryCrops.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCrop(c.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1 ${
                      isChecked
                        ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{language === 'hi' ? c.nameHi : c.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start space-x-2">
            <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              {language === 'hi'
                ? 'आपकी व्यक्तिगत जानकारी केवल आपके उपकरण पर सुरक्षित रखी जाती है और इसका उपयोग मंडी व फसल परामर्श को सटीक बनाने के लिए होता है।'
                : 'Your profile data is stored securely on your device to personalize Mandi market insights and weather warnings.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-bold shadow flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'hi' ? 'सुरक्षित करें' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerProfileModal;
