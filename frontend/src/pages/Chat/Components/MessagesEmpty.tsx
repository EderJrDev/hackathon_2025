import { Bot } from "lucide-react";

interface MessagesEmptyProps {
  handleSuggestionClick: (chip: string) => void;
}

const suggestionChips = [
  "Agendar consulta",
  "2ª via do boleto",
  "Autorizar de exames",
];

const MessagesEmpty = ({ handleSuggestionClick }: MessagesEmptyProps) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="bg-green-100 p-4 rounded-full mb-4">
      <Bot className="w-12 h-12 text-green-700" />
    </div>
    <h1 className="text-xl font-bold text-gray-800">
      Olá! Sou a Ana, sua assistente virtual.
    </h1>
    <p className="text-gray-600 mt-1">Como posso te ajudar hoje?</p>
    <div className="flex flex-wrap justify-center gap-2 mt-6">
      {suggestionChips.map((chip) => (
        <button
          key={chip}
          onClick={() => handleSuggestionClick(chip)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-green-700 hover:bg-green-50 transition-colors"
        >
          {chip}
        </button>
      ))}
    </div>
  </div>
);

export default MessagesEmpty;