import { Info } from "lucide-react";
import { useState } from "react";

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

export default CookieConsent;