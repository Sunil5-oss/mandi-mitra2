import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import HomeDashboard from './components/HomeDashboard';
import LiveMandiPrices from './components/LiveMandiPrices';
import NetReturnAdvisor from './components/NetReturnAdvisor';
import AIChatAssistant from './components/AIChatAssistant';
import AICropDoctor from './components/AICropDoctor';
import WeatherAdvisory from './components/WeatherAdvisory';
import SoilFertilizerCalculator from './components/SoilFertilizerCalculator';
import CropAssuranceMarketplace from './components/CropAssuranceMarketplace';
import SavedHistory from './components/SavedHistory';
import { PhoneCall, Heart, ShieldCheck, ExternalLink } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, toastMessage, language } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-950 text-white px-4 py-3 rounded-xl shadow-2xl border border-amber-400 flex items-center space-x-2 animate-bounce text-xs font-bold">
          <span>🌾</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar weatherTemp={29} weatherDistrict="Neemuch" />

      {/* Main View Router */}
      <main className="flex-1 pb-12">
        {activeTab === 'dashboard' && <HomeDashboard />}
        {activeTab === 'mandi-prices' && <LiveMandiPrices />}
        {activeTab === 'net-return' && <NetReturnAdvisor />}
        {activeTab === 'ai-chat' && <AIChatAssistant />}
        {activeTab === 'crop-doctor' && <AICropDoctor />}
        {activeTab === 'weather' && <WeatherAdvisory />}
        {activeTab === 'fertilizer' && <SoilFertilizerCalculator />}
        {activeTab === 'assurance' && <CropAssuranceMarketplace />}
        {activeTab === 'history' && <SavedHistory />}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200 border-t border-emerald-900 mt-auto text-xs py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-white font-extrabold text-base">
              <span>🌾 MANDI MITRA AI</span>
            </div>
            <p className="text-emerald-300 text-[11px] leading-relaxed">
              {language === 'hi'
                ? 'भारतीय किसानों को सही मंडी, सटीक शुद्ध मुनाफा, पारदर्शी कृषि वारंटी एवं आधुनिक AI पैथोलॉजी समाधान प्रदान करने वाला संपूर्ण कृषि मंच।'
                : 'Smart agriculture platform empowering Indian farmers with real net in-hand returns, live APMC benchmark prices, verified crop assurance warranties, and multimodal plant pathology.'}
            </p>
          </div>

          <div>
            <span className="font-bold text-white block uppercase tracking-wider text-[11px] mb-2">
              राष्ट्रीय किसान हेल्पलाइन (Helplines)
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center space-x-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>किसान कॉल सेंटर (KCC): <strong>1800-180-1551</strong> (टोल-फ्री)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>प्रधानमंत्री फसल बीमा (PMFBY): <strong>14447</strong></span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>e-NAM राष्ट्रीय कृषि बाज़ार: <strong>1800-270-0224</strong></span>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-white block uppercase tracking-wider text-[11px] mb-2">
              प्रमाणित डेटा स्रोत (Authoritative Sources)
            </span>
            <ul className="space-y-1 text-[11px] text-emerald-300">
              <li>• Agmarknet / DMI (कृषि एवं किसान कल्याण मंत्रालय)</li>
              <li>• भारतीय कृषि अनुसंधान परिषद (ICAR) मानक</li>
              <li>• Open-Meteo वैश्विक कृषि मौसम पूर्वानुमान</li>
              <li>• कंपनी उत्पाद वारंटी विवरणी (Bayer, Syngenta, Corteva, UPL)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-white block uppercase tracking-wider text-[11px]">
              पारदर्शिता एवं अस्वीकरण (Disclaimer)
            </span>
            <p className="text-[10px] text-emerald-400 leading-relaxed">
              मंडी मित्र पर प्रदर्शित कीमतें एवं गणनाएं वास्तविक दर्ज आंकड़ों पर आधारित अनुमान हैं। अंतिम लेन-देन स्थानीय मंडी बोली व तौल पर निर्भर करता है।
            </p>
            <div className="text-[10px] text-emerald-300 pt-2 border-t border-emerald-900">
              © 2026 Mandi Mitra AI • Built for Indian Farmers
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
