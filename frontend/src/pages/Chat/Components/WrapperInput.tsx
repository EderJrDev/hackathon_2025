import { Mic, Paperclip, Square } from "lucide-react";


type WrapperInputProps = {
  textInputRef: React.RefObject<HTMLInputElement | null>;
  setInput: (value: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  loading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleRecording: () => void;
  input: string;
  isRecording: boolean;
  handleSend: () => void;
};

const WrapperInput = ({
  textInputRef,
  setInput,
  handleKeyDown,
  loading,
  fileInputRef,
  handleImageUpload,
  toggleRecording,
  input,
  isRecording,
  handleSend,
}: WrapperInputProps) => {
  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="relative">
        <input
          id="chat-input"
          ref={textInputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "Aguarde..." : "Digite sua mensagem..."}
          disabled={loading}
          className="w-full py-3 pl-4 pr-40 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 transition-shadow"
          autoFocus
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          <label
            className="p-2 text-gray-500 hover:text-green-600 cursor-pointer"
            aria-label="Anexar arquivo"
            title="Anexar arquivo"
          >
            <Paperclip className="h-5 w-5" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={toggleRecording}
            disabled={loading}
            aria-pressed={isRecording}
            aria-label={isRecording ? "Parar gravação" : "Iniciar gravação por voz"}
            title={isRecording ? "Parar gravação" : "Falar"}
            className={`p-2 rounded-full transition-colors ${isRecording
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "text-gray-500 hover:text-green-600"
              }`}
          >
            {isRecording ? (
              <Square className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
            title="Enviar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )

}

export default WrapperInput;