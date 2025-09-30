import { ChevronDown, MapPin } from "lucide-react";
import logoUnimed from '../assets/logo-unimed.png';

const Navigation = () => (
  <nav className="bg-white border-t border-b border-gray-200">
    <div className="container mx-auto px-4 flex justify-between items-center h-20">
      <div className="flex items-center">
        <a href="#" className="mr-6">
            <img src={logoUnimed} alt="Unimed Franca" className="h-10" />
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

export default Navigation;