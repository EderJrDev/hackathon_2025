import React, { useState, useEffect, FC } from 'react';
import Chat from './pages/Chat';
import { Maximize, Minimize, X } from 'lucide-react';
// import '../src/assets/Hero-1.jpg'

const Phone: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);
const Mail: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
);
const Search: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const MapPin: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const ChevronDown: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"></polyline></svg>
);
const CheckCircle: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const Info: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);
const Bot: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
);
const Eye: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const Accessibility: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" /><path d="M12 12h.01" /><path d="m16.5 12-.5.5" /><path d="m16.5 12 .5.5" /><path d="m16.5 12 .5-.5" /><path d="m16.5 12-.5-.5" /><path d="m7.5 12-.5.5" /><path d="m7.5 12 .5.5" /><path d="m7.5 12 .5-.5" /><path d="m7.5 12-.5-.5" /><path d="m12 7.5-.5.5" /><path d="m12 7.5 .5.5" /><path d="m12 7.5 .5-.5" /><path d="m12 7.5-.5-.5" /></svg>
);
// Novos ícones para Acesso Rápido e Footer
const Barcode: FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>);
const CreditCard: FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>);
const Bell: FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>);
const ClipboardCheck: FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>);
const Users: FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const MessageSquareText: FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/></svg>);
const Facebook: FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
const Instagram: FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>);
const Youtube: FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 6 7.5 4 12 4s9.5 2 9.5 3 0 10 0 10c0 1-4.5 3-9.5 3s-9.5-2-9.5-3z"/><polygon points="9.5,12 15.5,8.5 15.5,15.5"/></svg>);
const Linkedin: FC<{ className?: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>);


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
          <input type="text" placeholder="Faça sua busca aqui" className="bg-gray-100 rounded-full py-2 pl-4 pr-10 w-40 md:w-64 focus:outline-none focus:ring-2 focus:ring-green-500"/>
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button className="bg-green-600 text-white font-bold py-2 px-6 rounded-full hover:bg-green-700 transition-colors">Login</button>
      </div>
    </div>
  </div>
);

const Navigation = () => (
  <nav className="bg-white border-t border-b border-gray-200">
    <div className="container mx-auto px-4 flex justify-between items-center h-20">
      <div className="flex items-center">
        <a href="#" className="mr-6">
          {/* Substitua o span abaixo pela sua tag de imagem:
            <img src={logoUnimed} alt="Unimed Franca" className="h-10" />
           */}
           <div className="flex items-baseline">
             <span className="text-3xl font-bold text-green-700">Unimed</span>
             <span className="text-base font-light text-blue-600 ml-1">Franca</span>
           </div>
        </a>
        <div className="hidden lg:flex items-center gap-8 text-gray-700 font-medium">
          <a href="#" className="hover:text-green-600">A Unimed Franca</a>
          <a href="#" className="hover:text-green-600">Para Você</a>
          <a href="#" className="hover:text-green-600">Portais</a>
          <a href="#" className="hover:text-green-600">Faça seu Plano</a>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
        <a href="#" className="flex items-center gap-2 text-green-700"><MapPin className="w-5 h-5" /> ENCONTRE UM MÉDICO</a>
        <a href="#" className="flex items-center gap-1 text-gray-700">ACESSO RÁPIDO <ChevronDown className="w-5 h-5" /></a>
      </div>
    </div>
  </nav>
);

const HeroSection = () => {
  const slides = ['../src/assets/Hero-1.jpg', '../src/assets/Hero-2.jpg', '../src/assets/Hero-3.jpg'];
  const [index, setIndex] = useState(0);

  // Auto play com loop infinito
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="relative text-white overflow-hidden">
      {/* Trilho do carrossel */}
      <div className="relative h-[520px] md:h-[640px]">
        <div
          className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          style={{ width: `${slides.length * 100}%`, transform: `translateX(-${index * (100 / slides.length)}%)` }}
        >
          {slides.map((src, i) => (
            <div key={src} className="relative w-full h-full flex-shrink-0 flex items-center justify-center">
              <img
              src={src}
              alt={`Slide ${i + 1}`}
              className="max-w-full max-h-full object-contain"
              style={{ position: 'relative', inset: 'unset', width: 'auto', height: 'auto' }}
              />
            </div>
          ))}
        </div>
    </div>

      {/* Indicadores (sincronizados com o slide) */}
      <div className="relative z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mt-6 space-x-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={[
                  'h-1.5 rounded-full transition-all duration-300',
                  index === i ? 'w-10 bg-white' : 'w-8 bg-white/50'
                ].join(' ')}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const InsuranceBanner = () => (
    <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4"><div className="bg-white rounded-lg shadow-md overflow-hidden md:flex"><div className="p-8 md:w-1/2 bg-blue-900 text-white flex flex-col justify-center"><h2 className="text-3xl font-bold">A Seguros Unimed</h2><p className="mt-2 text-xl text-blue-200">soma proteção ao cuidado que você já conhece.</p><ul className="mt-6 space-y-2 text-sm"><li>- Faça sua cotação online</li><li>- Contrate com praticidade e segurança</li><li>- Tenha proteção para todo o seu bem-estar</li></ul></div><div className="md:w-1/2"><img src="https://placehold.co/800x500/E0E0E0/333?text=Imagem+Família+Sorrindo" alt="Família sorrindo" className="w-full h-full object-cover" /></div></div></div>
    </div>
);

// --- NOVA SEÇÃO DE ACESSO RÁPIDO ---
const QuickAccess = () => {
    const accessItems = [
        { icon: Barcode, label: "Segunda via de Boletos" },
        { icon: CreditCard, label: "Segunda via de Cartão" },
        { icon: Bell, label: "App Unimed SP Clientes" },
        { icon: ClipboardCheck, label: "Realize seu agendamento" },
        { icon: Users, label: "Atualizações Cadastrais" },
        { icon: MessageSquareText, label: "Resoluções da ANS" },
    ];

    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-green-700 mb-12">Acesso Rápido</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
                    {accessItems.map((item, index) => (
                        <a href="#" key={index} className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <item.icon className="w-12 h-12 text-green-600 mb-4" />
                            <span className="text-gray-700 font-medium text-center">{item.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Info className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-gray-700">Usamos os cookies e dados de navegação visando proporcionar uma melhor experiência durante o uso do site. Ao continuar, você concorda com nossa{' '}<a href="#" className="text-blue-600 font-semibold underline">Política de Privacidade</a>.</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setIsVisible(false)} className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 transition-colors">Aceitar</button>
          <button onClick={() => setIsVisible(false)} className="bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">Rejeitar</button>
        </div>
      </div>
    </div>
  );
};

// --- NOVO FOOTER ---
const Footer = () => (
    <footer className="bg-white border-t pt-16">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-sm text-gray-600">
                {/* Link Columns */}
                <div><h3 className="font-bold text-gray-800 mb-4">A Unimed Franca</h3><ul className="space-y-2"><li className="hover:text-green-600"><a href="#">Conheça a Unimed Franca</a></li><li className="hover:text-green-600"><a href="#">Espaço Viver Bem</a></li><li className="hover:text-green-600"><a href="#">Fisioterapia</a></li><li className="hover:text-green-600"><a href="#">Laboratórios</a></li><li className="hover:text-green-600"><a href="#">São Joaquim Hospital e Maternidade</a></li><li className="hover:text-green-600"><a href="#">SOS Unimed</a></li></ul></div>
                <div><h3 className="font-bold text-gray-800 mb-4">Para você Cliente</h3><ul className="space-y-2"><li className="hover:text-green-600"><a href="#">Dúvidas Frequentes</a></li><li className="hover:text-green-600"><a href="#">Manual Portal do Beneficiário</a></li><li className="hover:text-green-600"><a href="#">Portal do Beneficiário</a></li><li className="hover:text-green-600"><a href="#">Como utilizar seu plano</a></li><li className="hover:text-green-600"><a href="#">Ouvidoria</a></li><li className="hover:text-green-600"><a href="#">Portal do Cliente Empresarial</a></li><li className="hover:text-green-600"><a href="#">Contatos da Unimed</a></li></ul></div>
                <div><h3 className="font-bold text-gray-800 mb-4">Faça seu Plano</h3><ul className="space-y-2"><li className="hover:text-green-600"><a href="#">Planos de Saúde</a></li><li className="hover:text-green-600"><a href="#">Plano Odontológico</a></li><li className="hover:text-green-600"><a href="#">DSO - Medicina do Trabalho</a></li></ul></div>
                <div><h3 className="font-bold text-gray-800 mb-4">Portais</h3><ul className="space-y-2"><li className="hover:text-green-600"><a href="#">Portal do Colaborador</a></li><li className="hover:text-green-600"><a href="#">Fique por Dentro</a></li><li className="hover:text-green-600"><a href="#">Plataforma EaD</a></li><li className="hover:text-green-600"><a href="#">Canal de Denúncias</a></li><li className="hover:text-green-600"><a href="#">Portal do Cooperado</a></li><li className="hover:text-green-600"><a href="#">Portal do Prestador</a></li><li className="hover:text-green-600"><a href="#">Portal do Titular de Dados</a></li></ul></div>
                <div><h3 className="font-bold text-gray-800 mb-4">ANS</h3><ul className="space-y-2"><li className="hover:text-green-600"><a href="#">Reajuste Familiar/Individual (RN565)</a></li><li className="hover:text-green-600"><a href="#">Reajuste Contratos Coletivos (RN565)</a></li><li className="hover:text-green-600"><a href="#">Portal do Beneficiário (RN509)</a></li><li className="hover:text-green-600"><a href="#">Portabilidade (RN438)</a></li><li className="hover:text-green-600"><a href="#">IDSS</a></li><li className="hover:text-green-600"><a href="#">Pesquisa de Satisfação</a></li><li className="hover:text-green-600"><a href="#">Portal ANS</a></li></ul></div>
            </div>

            <div className="border-t my-12"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                {/* Contact Info */}
                <div className="text-sm text-gray-600 space-y-4">
                    <div className="flex gap-4"><MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" /><div><p className="font-bold">Unimed Franca</p><p>Rua General Carneiro, 1595 - Centro - Franca/SP</p><p>CEP: 14400-500</p><p>Horário de atendimento: Seg. a Sex. das 8h às 17h</p></div></div>
                    <div className="flex gap-4"><Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" /><div><p className="font-bold">SOS Unimed e Unimed Orienta:</p><p className="font-bold">0800 940 1977</p></div></div>
                </div>
                {/* Whatsapp and Sales */}
                <div className="text-sm text-gray-600 space-y-4">
                     <div className="flex gap-4"><Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" /><div><p className="font-bold">Whatsapp</p><p className="font-bold">(16) 99322-2340</p></div></div>
                    <div className="flex gap-4"><Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" /><div><p className="font-bold">SAC e Venda de planos:</p><p className="font-bold">0800 940 1177</p></div></div>
                </div>
                {/* Social and Apps */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-4">Siga nossas redes sociais:</h3>
                    <div className="flex gap-4 mb-6">
                        <a href="#" className="p-2 border rounded-full hover:bg-gray-100"><Facebook className="w-5 h-5 text-gray-700"/></a>
                        <a href="#" className="p-2 border rounded-full hover:bg-gray-100"><Instagram className="w-5 h-5 text-gray-700"/></a>
                        <a href="#" className="p-2 border rounded-full hover:bg-gray-100"><Youtube className="w-5 h-5 text-gray-700"/></a>
                        <a href="#" className="p-2 border rounded-full hover:bg-gray-100"><Linkedin className="w-5 h-5 text-gray-700"/></a>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-4">Baixe nosso aplicativo</h3>
                    <div className="flex gap-4">
                        <a href="#"><img src="https://placehold.co/135x40?text=Google+Play" alt="Google Play" /></a>
                        <a href="#"><img src="https://placehold.co/120x40?text=App+Store" alt="App Store" /></a>
                    </div>
                </div>
            </div>

            <div className="border-t py-6 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    {/* Logos placeholder */}
                    <img src="https://placehold.co/100x40?text=Logo1" alt="Somos Coop" />
                    <img src="https://placehold.co/150x40?text=Logo2" alt="ANS" />
                </div>
                <p className="text-xs text-gray-500 text-center md:text-right">Copyright 2001 - 2025 Unimed do Brasil - Todos os direitos reservados</p>
            </div>
        </div>
    </footer>
);

const FloatingWidgets = ({ onChatOpen }: { onChatOpen: () => void }) => (
    <>
        <div className="fixed top-1/2 -translate-y-1/2 right-0 flex flex-col gap-1 z-40">
            <button className="bg-blue-800 p-3 text-white rounded-l-md hover:bg-blue-900"><Accessibility className="w-6 h-6" /></button>
            <button className="bg-blue-800 p-3 text-white rounded-l-md hover:bg-blue-900"><Eye className="w-6 h-6" /></button>
        </div>
        <div className="fixed bottom-6 right-6 z-40">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-green-300 opacity-75 animate-ping"></div>
            <button onClick={onChatOpen} className="relative bg-green-500 p-4 text-white rounded-full shadow-lg hover:bg-green-600 transform hover:scale-110 transition-transform">
                <Bot className="w-8 h-8"/>
            </button>
          </div>
        </div>
    </>
);

const App: FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMaximized, setIsChatMaximized] = useState(false);

  return (
    <div className="bg-gray-50 font-sans">
      <HeaderTop />
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
          {/* Overlay suave quando maximizado (apenas visual, sem bloquear cliques) */}
          <div
            className={[
              'absolute inset-0 bg-black transition-opacity duration-300',
              isChatMaximized ? 'opacity-30' : 'opacity-0'
            ].join(' ')}
            aria-hidden
          />

          {/* Painel do chat */}
          <div
            className={[
              'pointer-events-auto flex flex-col border border-gray-200 bg-white shadow-2xl overflow-hidden',
              'transition-all duration-300 ease-in-out transform-gpu',
              // Raio varia suavemente para dar sensação de fluidez
              isChatMaximized ? 'rounded-2xl' : 'rounded-xl',
              // Tamanhos e margens numéricas para permitir animação suave
              isChatMaximized
                ? 'w-[calc(100%-2rem)] h-[calc(100%-2rem)] md:w-[calc(100%-4rem)] md:h-[calc(100%-4rem)] m-4 md:m-8'
                : 'w-[calc(100%-2.5rem)] md:w-96 h-[70%] mr-5 mb-5 md:mr-8 md:mb-8'
            ].join(' ')}
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
                  className="text-white hover:text-gray-200 text-2xl font-bold leading-none"
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

