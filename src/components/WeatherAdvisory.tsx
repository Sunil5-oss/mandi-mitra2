import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { INDIAN_STATES_DISTRICTS } from '../data/mandiData';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  CloudRain,
  Sun,
  MapPin,
} from 'lucide-react';

interface WeatherApiResponse {
  district: string;
  retrievedAt: string;
  source: string;
  data: {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      apparent_temperature: number;
      precipitation: number;
      weather_code: number;
      wind_speed_10m: number;
    };
    daily: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max: number[];
      precipitation_sum: number[];
    };
  };
}

// Coordinate benchmarks for key Indian districts
const DISTRICT_COORDINATES: Record<string, { lat: number; lon: number }> = {
  Neemuch: { lat: 24.47, lon: 74.87 },
  Indore: { lat: 22.7196, lon: 75.8577 },
  Karnal: { lat: 29.6857, lon: 76.9905 },
  Ludhiana: { lat: 30.901, lon: 75.8573 },
  Agra: { lat: 27.1767, lon: 78.0081 },
  Kota: { lat: 25.2138, lon: 75.8648 },
  Nashik: { lat: 19.9975, lon: 73.7898 },
  Rajkot: { lat: 22.3039, lon: 70.8022 },
  Gulabbagh: { lat: 25.7771, lon: 87.4753 },
};

export const WeatherAdvisory: React.FC = () => {
  const { language, farmerProfile } = useApp();

  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    farmerProfile.district || 'Neemuch'
  );
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWeather = async (district: string) => {
    setLoading(true);
    try {
      const coords = DISTRICT_COORDINATES[district] || { lat: 24.47, lon: 74.87 };
      const res = await fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}&district=${district}`);
      const json = await res.json();
      setWeatherData(json);
    } catch (err) {
      console.error('Failed to fetch weather:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedDistrict);
  }, [selectedDistrict]);

  const current = weatherData?.data?.current;
  const daily = weatherData?.data?.daily;

  // Agricultural Logic computations
  const isSpraySafe =
    current && current.wind_speed_10m <= 15 && (daily?.precipitation_probability_max?.[0] || 0) < 25;

  const isFungalDiseaseRiskHigh = current && current.relative_humidity_2m >= 80;

  const isHeatStress = current && current.temperature_2m >= 35;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header and District Selector */}
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-sky-100 text-sky-800 rounded-xl">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
                {language === 'hi' ? 'मौसम एवं कृषि चेतावनी (Weather & Agro-Advisory)' : 'Weather & Farming Alerts'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {language === 'hi'
                  ? 'Open-Meteo वास्तविक समय मौसम मॉडल एवं कृषि वैज्ञानिक छिड़काव-सिंचाई सलाह'
                  : 'Real-time meteorological forecast & precision crop spraying guidelines'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2 border rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {Object.keys(DISTRICT_COORDINATES).map((d) => (
                <option key={d} value={d}>
                  {d} ({language === 'hi' ? 'जिला' : 'District'})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => fetchWeather(selectedDistrict)}
            disabled={loading}
            className="p-2 border rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {current && daily ? (
        <>
          {/* Current Weather Highlights Banner */}
          <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-sky-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-emerald-700 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Primary Temp */}
            <div className="space-y-1">
              <span className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">
                📍 {weatherData.district} वर्तमान मौसम
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-300">
                {current.temperature_2m}°C
              </div>
              <div className="text-xs text-emerald-100">
                महसूस हो रहा: {current.apparent_temperature}°C
              </div>
            </div>

            {/* Humidity */}
            <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-700/60 flex items-center space-x-3">
              <div className="p-3 bg-sky-500/20 text-sky-300 rounded-xl">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-200 uppercase font-bold block">
                  हवा में नमी (Humidity)
                </span>
                <div className="text-2xl font-black text-white">{current.relative_humidity_2m}%</div>
                <div className="text-[11px] text-emerald-300">
                  {current.relative_humidity_2m > 75 ? 'उच्च नमी' : 'सामान्य'}
                </div>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-700/60 flex items-center space-x-3">
              <div className="p-3 bg-teal-500/20 text-teal-300 rounded-xl">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-200 uppercase font-bold block">
                  हवा की गति (Wind)
                </span>
                <div className="text-2xl font-black text-white">{current.wind_speed_10m} km/h</div>
                <div className="text-[11px] text-emerald-300">
                  {current.wind_speed_10m < 15 ? 'छिड़काव हेतु शांत' : 'तेज हवा'}
                </div>
              </div>
            </div>

            {/* Rain Probability */}
            <div className="bg-emerald-950/60 p-4 rounded-xl border border-emerald-700/60 flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 text-blue-300 rounded-xl">
                <CloudRain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-200 uppercase font-bold block">
                  बारिश की संभावना (Rain)
                </span>
                <div className="text-2xl font-black text-white">
                  {daily.precipitation_probability_max[0]}%
                </div>
                <div className="text-[11px] text-emerald-300">
                  कुल वर्षा: {daily.precipitation_sum[0]} मिमी
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Agro-Advisories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Advisory 1: Chemical Spray Advisory */}
            <div
              className={`rounded-2xl p-5 border shadow-xs space-y-3 ${
                isSpraySafe ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {isSpraySafe ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <h3 className="font-extrabold text-sm text-gray-900">
                  {isSpraySafe
                    ? 'कीटनाशक व खाद छिड़काव: अनुकूल ✅'
                    : 'कीटनाशक छिड़काव: स्थगित करें ⚠️'}
                </h3>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                {isSpraySafe
                  ? `हवा की गति (${current.wind_speed_10m} किमी/घंटा) शांत है तथा बारिश की आशंका नगण्य है। फफूंदनाशी एवं टॉनिक का छिड़काव सुरक्षित रूप से किया जा सकता है।`
                  : `तेज हवा अथवा बारिश की संभावना के कारण दवा बहने का खतरा है। छिड़काव रोकें।`}
              </p>
            </div>

            {/* Advisory 2: Irrigation Advisory */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs space-y-3">
              <div className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-sm text-gray-900">
                  सिंचाई परामर्श (Irrigation Advisory)
                </h3>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                {daily.precipitation_probability_max[0] < 20
                  ? `आगामी 3 दिनों में वर्षा की संभावना नहीं है। गेहूं व सरसों में आवश्यकतानुसार हल्की सिंचाई कर सकते हैं।`
                  : `आगामी 48 घंटों में हल्की वर्षा के संकेत हैं। खेतों में जलभराव से बचें और भारी सिंचाई टालें।`}
              </p>
            </div>

            {/* Advisory 3: Disease & Pest Risk Index */}
            <div
              className={`rounded-2xl p-5 border shadow-xs space-y-3 ${
                isFungalDiseaseRiskHigh ? 'bg-amber-50 border-amber-300' : 'bg-white border-emerald-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ShieldAlert
                  className={`w-5 h-5 ${isFungalDiseaseRiskHigh ? 'text-amber-700' : 'text-emerald-700'}`}
                />
                <h3 className="font-extrabold text-sm text-gray-900">
                  रोग व कीट चेतावनी (Pest & Fungal Alert)
                </h3>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                {isFungalDiseaseRiskHigh
                  ? `हवा में 80% से अधिक नमी फफूंद (झुलसा व रतुआ) के फैलाव के अनुकूल है। पत्तियों के निचले हिस्से की नियमित निगरानी करें।`
                  : `मौसम सामान्य है। माहू (चेपा) या कीट के प्रकोप के लिए खेत का नियमित निरीक्षण जारी रखें।`}
              </p>
            </div>
          </div>

          {/* 7-Day Forecast Cards */}
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>आगामी 7 दिनों का मौसम पूर्वानुमान (7-Day Forecast)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {daily.time.map((dayStr, idx) => {
                const dateObj = new Date(dayStr);
                const dayName = dateObj.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                  weekday: 'short',
                });
                const maxT = daily.temperature_2m_max[idx];
                const minT = daily.temperature_2m_min[idx];
                const rainProb = daily.precipitation_probability_max[idx];

                return (
                  <div
                    key={dayStr}
                    className="bg-gray-50 p-3 rounded-xl border border-gray-200/70 text-center space-y-1.5"
                  >
                    <span className="text-xs font-bold text-gray-700 block">{dayName}</span>
                    <span className="text-[10px] text-gray-400 block">{dayStr.slice(5)}</span>
                    <Sun className="w-5 h-5 text-amber-500 mx-auto my-1" />
                    <div className="text-xs font-black text-gray-900">
                      {maxT}° / <span className="text-gray-500 font-normal">{minT}°</span>
                    </div>
                    <div className="text-[10px] text-sky-700 font-semibold bg-sky-50 rounded py-0.5">
                      💧 {rainProb}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">मौसम डेटा लोड हो रहा है...</p>
        </div>
      )}
    </div>
  );
};

export default WeatherAdvisory;
