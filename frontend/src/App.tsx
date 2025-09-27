import React, { useState, FC } from 'react';
import logoUnimed from '../src/assets/logo-unimed.png';

// --- Ícones estilo Lucide ---
// Para manter tudo em um único arquivo, os ícones são definidos como componentes SVG aqui.

const Phone: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const Mail: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
);

const Search: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const MapPin: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ChevronDown: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const CheckCircle: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const Info: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const Bot: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
);

const Eye: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
);

const Accessibility: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><path d="M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" /><path d="M12 12h.01" /><path d="m16.5 12-.5.5" /><path d="m16.5 12 .5.5" /><path d="m16.5 12 .5-.5" /><path d="m16.5 12-.5-.5" /><path d="m7.5 12-.5.5" /><path d="m7.5 12 .5.5" /><path d="m7.5 12 .5-.5" /><path d="m7.5 12-.5-.5" /><path d="m12 7.5-.5.5" /><path d="m12 7.5 .5.5" /><path d="m12 7.5 .5-.5" /><path d="m12 7.5-.5-.5" />
    </svg>
);

// --- Componentes da Página ---

const HeaderTop = () => (
  <div className="bg-white text-gray-600 text-sm py-2">
    <div className="container mx-auto px-4 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-600" />
            <span>SAC: <strong>0800 940 1177</strong></span>
        </div>
        <div className="hidden md:flex items-center gap-2">
            <Mail className="w-4 h-4 text-green-600"/>
            <span>Canais de atendimento</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Faça sua busca aqui" 
            className="bg-gray-100 rounded-full py-2 pl-4 pr-10 w-40 md:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition-colors">
          Login
        </button>
      </div>
    </div>
  </div>
);

const Navigation = () => (
  <nav className="bg-white border-t border-b border-gray-200">
    <div className="container mx-auto px-4 flex justify-between items-center">
      <div className="flex items-center">
        <a href="#" className="mr-6">
         <img src={logoUnimed} alt="" />
        </a>
        <div className="hidden lg:flex items-center gap-8 text-gray-700 font-medium">
          <a href="#" className="hover:text-green-600">A Unimed Franca</a>
          <a href="#" className="hover:text-green-600">Para Você</a>
          <a href="#" className="hover:text-green-600">Portais</a>
          <a href="#" className="hover:text-green-600">Faça seu Plano</a>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
        <a href="#" className="flex items-center gap-2 text-green-700">
          <MapPin className="w-5 h-5" />
          ENCONTRE UM MÉDICO
        </a>
        <a href="#" className="flex items-center gap-1 text-gray-700">
          ACESSO RÁPIDO
          <ChevronDown className="w-5 h-5" />
        </a>
      </div>
    </div>
  </nav>
);

const HeroSection = () => (
  <section className="relative bg-green-700 text-white overflow-hidden">
    {/* Fundo com gradiente e ondas */}
    <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800 z-0"></div>
    <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
    <div className="absolute -top-20 -right-20 w-96 h-96 bg-lime-400/20 rounded-full blur-3xl"></div>
    
    <div className="absolute bottom-0 left-0 w-full z-10">
      <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1440 120V0C1200 40 960 60 720 60S240 40 0 0v120h1440z" fill="#f9fafb"/>
      </svg>
    </div>

    <div className="container mx-auto px-4 py-20 lg:py-28 relative z-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex items-center justify-center lg:justify-start">
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl shadow-2xl">
                <span className="text-6xl md:text-8xl font-extrabold text-green-700 tracking-tighter">VC</span>
                <span className="text-6xl md:text-8xl font-extrabold text-gray-500 tracking-tighter">+</span>
                <span className="text-6xl md:text-8xl font-extrabold text-green-500 tracking-tighter">DIGITAL</span>
            </div>
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold">PS Online | 24h</h1>
          <p className="mt-4 text-xl md:text-2xl font-light max-w-lg">
            No conforto da sua casa, com segurança, quando você precisar.
          </p>
          <ul className="mt-8 space-y-4">
            <li className="flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-lime-300 flex-shrink-0" />
              <span className="text-lg">Agendamento fácil e seguro</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-lime-300 flex-shrink-0" />
              <span className="text-lg">Sem cobrança de guia</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-lime-300 flex-shrink-0" />
              <span className="text-lg">24h por dia, 7 dias por semana</span>
            </li>
          </ul>
          <div className="mt-12">
            <button className="bg-white text-green-700 text-xl font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-transform">
              CLIQUE E AGENDE!
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-16 space-x-2">
          <div className="w-8 h-1.5 bg-white rounded-full"></div>
          <div className="w-8 h-1.5 bg-white/50 rounded-full"></div>
          <div className="w-8 h-1.5 bg-white/50 rounded-full"></div>
      </div>
    </div>
  </section>
);

const InsuranceBanner = () => (
    <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden md:flex">
                <div className="p-8 md:w-1/2 bg-blue-900 text-white flex flex-col justify-center">
                    <h2 className="text-3xl font-bold">A Seguros Unimed</h2>
                    <p className="mt-2 text-xl text-blue-200">soma proteção ao cuidado que você já conhece.</p>
                    <ul className="mt-6 space-y-2 text-sm">
                        <li>- Faça sua cotação online</li>
                        <li>- Contrate com praticidade e segurança</li>
                        <li>- Tenha proteção para todo o seu bem-estar</li>
                    </ul>
                </div>
                <div className="md:w-1/2">
                    <img 
                        src="https://placehold.co/800x500/E0E0E0/333?text=Imagem+Família+Sorrindo" 
                        alt="Família sorrindo" 
                        className="w-full h-full object-cover" 
                    />
                </div>
            </div>
        </div>
    </div>
);


const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Info className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            Usamos os cookies e dados de navegação visando proporcionar uma melhor experiência durante o uso do site. Ao continuar, você concorda com nossa{' '}
            <a href="#" className="text-blue-600 font-semibold underline">Política de Privacidade</a>.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button 
            onClick={() => setIsVisible(false)}
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
          >
            Aceitar
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors"
          >
            Rejeitar
          </button>
        </div>
      </div>
    </div>
  );
};

const FloatingWidgets = () => (
    <>
        <div className="fixed top-1/2 -translate-y-1/2 right-0 flex flex-col gap-1 z-40">
            <button className="bg-blue-800 p-3 text-white rounded-l-md hover:bg-blue-900">
                <Accessibility className="w-6 h-6" />
            </button>
            <button className="bg-blue-800 p-3 text-white rounded-l-md hover:bg-blue-900">
                <Eye className="w-6 h-6" />
            </button>
        </div>
        <div className="fixed bottom-6 right-6 z-40">
            <button className="bg-green-500 p-4 text-white rounded-full shadow-lg hover:bg-green-600 transform hover:scale-110 transition-transform">
                <Bot className="w-8 h-8"/>
            </button>
        </div>
    </>
);


// --- Componente Principal da Página ---
const App: FC = () => {
  return (
    <div className="bg-gray-50 font-sans">
      <HeaderTop />
      <Navigation />
      <main>
        <HeroSection />
        <InsuranceBanner />
        {/* Outras seções da página podem ser adicionadas aqui */}
      </main>
      <CookieConsent />
      <FloatingWidgets />
    </div>
  );
};

export default App;
