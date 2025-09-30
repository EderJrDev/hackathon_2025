import { Facebook, Instagram, Linkedin, MapPin, Phone, Youtube } from "lucide-react";

const Footer = () => (
    <footer className="bg-white border-t pt-16">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-sm text-gray-600">
                <div><h3 className="font-bold text-gray-800 mb-4">A Unimed Franca</h3><ul className="space-y-2"><li className="hover:text-green-600"><a href="#">Conheça a Unimed Franca</a></li><li className="hover:text-green-600"><a href="#">Espaço Viver Bem</a></li><li className="hover:text-green-600"><a href="#">Fisioterapia</a></li><li className="hover:text-green-600"><a href="#">Laboratórios</a></li><li className="hover:text-green-600"><a href="#">São Joaquim Hospital e Maternidade</a></li><li className="hover:text-green-600"><a href="#">SOS Unimed</a></li></ul></div>
                <div><h3 className="font-bold text-gray-800 mb-4">Para você Cliente</h3><ul className="space-y-2"><li className="hover:text-green-600"><a href="#">Dúvidas Frequentes</a></li><li className="hover:text-green-600"><a href="#">Manual Portal do Beneficiário</a></li><li className="hover:text-green-600"><a href="#">Portal do Beneficiário</a></li><li className="hover:text-green-600"><a href="#">Como utilizar seu plano</a></li><li className="hover:text-green-600"><a href="#">Ouvidoria</a></li><li className="hover:text-green-600"><a href="#">Portal do Cliente Empresarial</a></li><li className="hover:text-green-600"><a href="#">Contatos da Unimed</a></li></ul></div>
                <div><h3 className="font-bold text-gray-800 mb-4">Faça seu Plano</h3><ul className="space-y-2"><li className="hover:text-green-600"><a href="#">Planos de Saúde</a></li><li className="hover:text-green-600"><a href="#">Plano Odontológico</a></li><li className="hover:text-green-600"><a href="#">DSO - Medicina do Trabalho</a></li></ul></div>
                <div><h3 className="font-bold text-gray-800 mb-4">Portais</h3><ul className="space-y-2"><li className="hover:text-green-600"><a href="#">Portal do Colaborador</a></li><li className="hover:text-green-600"><a href="#">Fique por Dentro</a></li><li className="hover:text-green-600"><a href="#">Plataforma EaD</a></li><li className="hover:text-green-600"><a href="#">Canal de Denúncias</a></li><li className="hover:text-green-600"><a href="#">Portal do Cooperado</a></li><li className="hover:text-green-600"><a href="#">Portal do Prestador</a></li><li className="hover:text-green-600"><a href="#">Portal do Titular de Dados</a></li></ul></div>
                <div><h3 className="font-bold text-gray-800 mb-4">ANS</h3><ul className="space-y-2"><li className="hover:text-green-600"><a href="#">Reajuste Familiar/Individual (RN565)</a></li><li className="hover:text-green-600"><a href="#">Reajuste Contratos Coletivos (RN565)</a></li><li className="hover:text-green-600"><a href="#">Portal do Beneficiário (RN509)</a></li><li className="hover:text-green-600"><a href="#">Portabilidade (RN438)</a></li><li className="hover:text-green-600"><a href="#">IDSS</a></li><li className="hover:text-green-600"><a href="#">Pesquisa de Satisfação</a></li><li className="hover:text-green-600"><a href="#">Portal ANS</a></li></ul></div>
            </div>

            <div className="border-t my-12"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                <div className="text-sm text-gray-600 space-y-4">
                    <div className="flex gap-4"><MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" /><div><p className="font-bold">Unimed Franca</p><p>Rua General Carneiro, 1595 - Centro - Franca/SP</p><p>CEP: 14400-500</p><p>Horário de atendimento: Seg. a Sex. das 8h às 17h</p></div></div>
                    <div className="flex gap-4"><Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" /><div><p className="font-bold">SOS Unimed e Unimed Orienta:</p><p className="font-bold">0800 940 1977</p></div></div>
                </div>
                <div className="text-sm text-gray-600 space-y-4">
                     <div className="flex gap-4"><Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" /><div><p className="font-bold">Whatsapp</p><p className="font-bold">(16) 99322-2340</p></div></div>
                    <div className="flex gap-4"><Phone className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" /><div><p className="font-bold">SAC e Venda de planos:</p><p className="font-bold">0800 940 1177</p></div></div>
                </div>
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
                    <img src="https://placehold.co/100x40?text=Logo1" alt="Somos Coop" />
                    <img src="https://placehold.co/150x40?text=Logo2" alt="ANS" />
                </div>
                <p className="text-xs text-gray-500 text-center md:text-right">Copyright 2001 - 2025 Unimed do Brasil - Todos os direitos reservados</p>
            </div>
        </div>
    </footer>
);

export default Footer;
