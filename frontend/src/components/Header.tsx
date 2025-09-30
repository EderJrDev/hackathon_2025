import { Mail, Phone, Search } from "lucide-react";

const Header = () => (
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

export default Header;