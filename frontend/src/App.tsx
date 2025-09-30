import React, { useState, FC } from 'react';
import Chat from './pages/Chat/Chat';
import { Maximize, Minimize, X } from 'lucide-react';
import Header from './components/Header';
import Navigation from './components/Nativagion';
import HeroSection from './components/HeroSection';
import InsuranceBanner from './components/InsuranceBanner';
import QuickAccess from './components/QuickAccess';
import CookieConsent from './components/CookieConsent';
import Footer from './components/Footer';
import FloatingWidgets from './components/FloatingWidgets';

const App: FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMaximized, setIsChatMaximized] = useState(false);

  return (
    <div className="bg-gray-50 font-sans">
      <Header />
      <Navigation />
      <main>
        <HeroSection />
        <InsuranceBanner />
        <QuickAccess />
      </main>
      <Footer />
      <CookieConsent />
      <FloatingWidgets onChatOpen={() => setIsChatOpen(true)} />
      {isChatOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-end">
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              isChatMaximized ? 'opacity-30' : 'opacity-0'
            }`}
            aria-hidden
          />
          <div
            className={`pointer-events-auto flex flex-col border border-gray-200 bg-white shadow-2xl overflow-hidden transition-all duration-300 ease-in-out transform-gpu ${
              isChatMaximized
                ? 'rounded-2xl w-[calc(100%-2rem)] h-[calc(100%-2rem)] md:w-[calc(100%-4rem)] md:h-[calc(100%-4rem)] m-4 md:m-8'
                : 'rounded-xl w-[calc(100%-2.5rem)] md:w-96 h-[70%] mr-5 mb-5 md:mr-8 md:mb-8'
            }`}
            style={{ willChange: 'width, height, margin, border-radius' } as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-3 p-3 md:p-4 bg-green-600 text-white flex-shrink-0">
              <h2 className="text-base md:text-lg font-bold">Atendente Virtual</h2>
              <div className="flex items-center gap-2">
                <button
                  aria-label={isChatMaximized ? 'Restaurar tamanho' : 'Maximizar'}
                  title={isChatMaximized ? 'Restaurar' : 'Maximizar'}
                  className="p-1.5 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                  onClick={() => setIsChatMaximized((v) => !v)}
                >
                  {isChatMaximized ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
                <button
                  aria-label="Fechar"
                  title="Fechar"
                  className="p-1.5 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                  onClick={() => {
                    setIsChatOpen(false);
                    setIsChatMaximized(false);
                  }}
                >
                 <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <Chat />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
