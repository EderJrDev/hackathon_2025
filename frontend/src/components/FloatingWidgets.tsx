import { Accessibility, Bot, Eye } from "lucide-react";

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

export default FloatingWidgets;