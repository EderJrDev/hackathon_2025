import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';
import {
  Paperclip,
  Mic,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Share2,
  Copy,
  MoreHorizontal,
  Sparkles,
} from 'lucide-react';

import { startChat, sendMessage } from '../lib/chatApi';

type Sender = 'user' | 'bot';

interface UiMessage {
  sender: Sender;
  text?: string;
  imageUrl?: string;
}

export default function Chat() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // inicia sessão ao montar
  useEffect(() => {
    (async () => {
      try {
        const res = await startChat();
        setSessionId(res.sessionId);
        setMessages([{ sender: 'bot', text: res.firstMessage.content }]);
      } catch (err) {
        console.error(err);
        setMessages([{ sender: 'bot', text: 'Falha ao iniciar o chat.' }]);
      }
    })();
  }, []);

  async function handleSend() {
    if (!sessionId || !input.trim() || loading) return;
    const text = input.trim();

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await sendMessage(sessionId, text);
      setMessages(prev => [...prev, { sender: 'bot', text: res.reply || '...' }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Erro ao responder.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setMessages(prev => [...prev, { sender: 'user', imageUrl }]);
      // (se quiser enviar a imagem ao backend depois, a gente adapta aqui)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* área de mensagens */}
      <div className="flex-1 overflow-auto p-4 md:px-96">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center h-full">
            <h1 className="text-4xl font-bold">Como podemos te ajudar hoje?</h1>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {m.text && (
                    <div
                      className={`w-full max-w-[95%] p-3 rounded-lg break-words ${
                        m.sender === 'user'
                          ? 'bg-green-500 text-white rounded-br-none'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  )}

                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt="Uploaded"
                      className="max-w-[90%] rounded-lg mt-2"
                    />
                  )}

                  {m.sender === 'bot' && (
                    <div className="flex space-x-2 mt-2">
                      <ThumbsUp className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer" />
                      <ThumbsDown className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer" />
                      <RefreshCw className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer" />
                      <Share2 className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer" />
                      <Copy className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer" />
                      <MoreHorizontal className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer" />
                      <Sparkles className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* input */}
      <div className="p-4 md:px-96">
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-2">
            <label className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
              <Paperclip className="h-6 w-6" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={loading ? 'Aguarde...' : 'Digite sua mensagem...'}
              disabled={loading || !sessionId}
              className="w-full p-2 bg-transparent focus:outline-none text-gray-900 dark:text-white disabled:opacity-60"
            />

            <button
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              type="button"
              title="Falar (não implementado)"
            >
              <Mic className="h-6 w-6" />
            </button>

            <button
              onClick={handleSend}
              disabled={loading || !sessionId || !input.trim()}
              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-green-300"
              title="Enviar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
