import { Barcode, Bell, ClipboardCheck, CreditCard, MessageSquareText, Users } from "lucide-react";

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

export default QuickAccess;