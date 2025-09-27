import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'

interface Message {
  sender: 'user' | 'bot'
  text: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [...prev, { sender: 'user', text }])
    setInput('')
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Esta é uma resposta simulada.' },
      ])
    }, 500)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center">
          <h1 className="text-4xl font-bold">Como a Unimed pode te ajudar hoje?</h1>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.sender === 'user' ? 'flex justify-end' : 'flex justify-start'
              }
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg break-words ` +
                  (m.sender === 'user'
                    ? 'bg-unimed-green text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100')}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
      <div className="p-4">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="w-full p-4 pl-12 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-unimed-green"
          />
          <button
            onClick={sendMessage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-unimed-green text-white rounded-full hover:bg-unimed-green/80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
