import { Bot } from "lucide-react";

const Loader = () => (
  <div className="flex items-end gap-3 justify-start">
    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
      <Bot className="w-5 h-5 text-white" />
    </div>
    <div className="p-3 rounded-2xl bg-white rounded-bl-lg border border-gray-200">
      <div className="flex items-center justify-center gap-1.5">
        <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 bg-green-500 rounded-full animate-bounce"></span>
      </div>
    </div>
  </div>
);

export default Loader;