import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  History,
  Trash2,
  Calendar,
  Scale,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Printer,
  ChevronRight,
} from 'lucide-react';

export const SavedHistory: React.FC = () => {
  const {
    language,
    savedComparisons,
    deleteSavedComparison,
    cropDoctorReports,
    registeredProducts,
    cropClaims,
    setActiveTab,
    setSelectedCrop,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'comparisons' | 'doctor' | 'claims'>(
    'all'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
                {language === 'hi' ? 'किसान निर्णय एवं गतिविधि इतिहास (Farmer History)' : 'Farmer History & Saved Records'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {language === 'hi'
                  ? 'आपके द्वारा सुरक्षित की गई मंडी बिक्री तुलनाएं, फसल डॉक्टर रिपोर्ट एवं दर्ज दावे'
                  : 'Your archived selling comparisons, crop disease reports, and assurance claim records'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-emerald-800 text-white font-bold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            सभी (All)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('comparisons')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'comparisons'
                ? 'bg-emerald-800 text-white font-bold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            बिक्री तुलना ({savedComparisons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('doctor')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'doctor'
                ? 'bg-emerald-800 text-white font-bold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            फसल डॉक्टर ({cropDoctorReports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('claims')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'claims'
                ? 'bg-emerald-800 text-white font-bold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            दावे ({cropClaims.length})
          </button>
        </div>
      </div>

      {/* Comparisons Section */}
      {(activeFilter === 'all' || activeFilter === 'comparisons') && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-gray-900">
              सुरक्षित मंडी बिक्री तुलनाएं ({savedComparisons.length})
            </h2>
          </div>

          {savedComparisons.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border text-center text-xs text-gray-500">
              कोई सुरक्षित बिक्री तुलना उपलब्ध नहीं है। शुद्ध मुनाफा कैलकुलेटर में &quot;तुलना सुरक्षित करें&quot; पर क्लिक करें।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedComparisons.map((item) => {
                const winner = item.options[0];
                return (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                          {item.cropName} • {item.quantityQuintals} क्विंटल
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-base mt-1.5">
                          विजेता: {winner?.option.name}
                        </h3>
                        <span className="text-xs text-gray-400">
                          दिनांक: {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteSavedComparison(item.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs flex justify-between items-baseline">
                      <span className="font-semibold text-emerald-950">सर्वोत्तम शुद्ध आय:</span>
                      <span className="text-base font-black text-emerald-800">
                        ₹{winner?.estimatedNetReturn.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600">
                      कुल {item.options.length} विक्रय विकल्पों की तुलना की गई।
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Crop Doctor Reports Section */}
      {(activeFilter === 'all' || activeFilter === 'doctor') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-gray-900">
              फसल डॉक्टर रोग निदान इतिहास ({cropDoctorReports.length})
            </h2>
          </div>

          {cropDoctorReports.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border text-center text-xs text-gray-500">
              कोई रोग रिपोर्ट सुरक्षित नहीं है।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cropDoctorReports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                        {rep.cropName} • विश्वास {rep.confidencePercent}%
                      </span>
                      <h3 className="font-extrabold text-gray-900 text-base mt-1.5">
                        {rep.diseaseName}
                      </h3>
                      <p className="text-xs text-gray-400">
                        जांच दिनांक: {new Date(rep.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border space-y-1">
                    <strong className="text-gray-900 block">अनुशंसित प्राथमिक उपचार:</strong>
                    <p>{rep.immediateRemedies[0] || 'पौधे को अलग करें'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedHistory;
