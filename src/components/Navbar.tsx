import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sprout,
  TrendingUp,
  Scale,
  MessageSquare,
  Stethoscope,
  CloudSun,
  ShieldCheck,
  History,
  User,
  FlaskConical,
  Menu,
  X,
  Languages,
} from 'lucide-react';
import FarmerProfileModal from './FarmerProfileModal';

interface NavbarProps {
  weatherTemp?: number;
  weatherDistrict?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ weatherTemp = 29, weatherDistrict = 'Neemuch' }) => {
  const { language, setLanguage, activeTab, setActiveTab, farmerProfile } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', labelHi: 'होम', labelEn: 'Dashboard', icon: Sprout },
    { id: 'mandi-prices', labelHi: 'लाइव मंडी भाव', labelEn: 'Mandi Bhav', icon: TrendingUp },
    { id: 'net-return', labelHi: 'शुद्ध मुनाफा कैलकुलेटर', labelEn: 'Net Return', icon: Scale },
    { id: 'ai-chat', labelHi: 'कृषि मित्र AI', labelEn: 'Agri AI Chat', icon: MessageSquare },
    { id: 'crop-doctor', labelHi: 'फसल डॉक्टर', labelEn: 'Crop Doctor', icon: Stethoscope },
    { id: 'weather', labelHi: 'मौसम सलाह', labelEn: 'Weather', icon: CloudSun },
    { id: 'fertilizer', labelHi: 'खाद कैलकुलेटर', labelEn: 'Fertilizer', icon: FlaskConical },
    { id: 'assurance', labelHi: 'कंपनी गारंटी', labelEn: 'Crop Assurance', icon: ShieldCheck },
    { id: 'history', labelHi: 'इतिहास', labelEn: 'History', icon: History },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Tagline */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-emerald-950 font-bold text-xl shadow-inner group-hover:scale-105 transition-transform">
                🌾
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-black tracking-tight text-white">MANDI MITRA</span>
                  <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400 text-emerald-950">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200 hidden sm:block">
                  {language === 'hi' ? 'सही मंडी • सही भाव • अधिकतम शुद्ध मुनाफा' : 'Smart Selling & Crop Advisory Platform'}
                </p>
              </div>
            </div>

            {/* Weather & Location Ticker */}
            <div className="hidden lg:flex items-center space-x-2 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800/80 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-medium">
                📍 {farmerProfile.district || weatherDistrict}, {farmerProfile.state || 'MP'}
              </span>
              <span className="text-emerald-400">•</span>
              <span className="text-amber-300 font-semibold">{weatherTemp}°C ☀️</span>
              <span className="text-emerald-200">छिड़काव अनुकूल</span>
            </div>

            {/* Language & Profile Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Language Switcher */}
              <div className="flex items-center bg-emerald-950/80 rounded-lg p-0.5 border border-emerald-700/60 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    language === 'hi'
                      ? 'bg-amber-400 text-emerald-950 font-bold shadow'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    language === 'en'
                      ? 'bg-amber-400 text-emerald-950 font-bold shadow'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>

              {/* Farmer Profile Button */}
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg border border-emerald-600/70 text-xs font-medium transition-colors shadow-sm"
                title="किसान प्रोफाइल व सेटिंग्स"
              >
                <User className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline max-w-[110px] truncate">{farmerProfile.name}</span>
              </button>

              {/* Mobile menu trigger */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-emerald-800 text-white hover:bg-emerald-700 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 overflow-x-auto py-2 border-t border-emerald-800/80 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-400 text-emerald-950 shadow-md transform scale-[1.02]'
                      : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-950' : 'text-amber-300'}`} />
                  <span>{language === 'hi' ? item.labelHi : item.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-emerald-950 border-t border-emerald-800 px-4 pt-2 pb-4 space-y-1">
            <div className="py-2 px-2 text-xs text-amber-300 font-semibold border-b border-emerald-800/60 mb-2">
              📍 {farmerProfile.district}, {farmerProfile.state} | {weatherTemp}°C ☀️
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-amber-400 text-emerald-950 font-bold'
                      : 'text-emerald-100 hover:bg-emerald-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-950' : 'text-amber-400'}`} />
                  <span>{language === 'hi' ? item.labelHi : item.labelEn}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Farmer Profile Modal */}
      {isProfileOpen && <FarmerProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
    </>
  );
};

export default Navbar;
