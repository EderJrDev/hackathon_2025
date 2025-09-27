import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-center items-center space-x-4 mb-4">
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img
            src={viteLogo}
            className="h-24 p-4 filter hover:drop-shadow(0 0 2em #646cffaa)"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img
            src={reactLogo}
            className="h-24 p-4 filter hover:drop-shadow(0 0 2em #61dafbaa)"
            alt="React logo"
          />
        </a>
      </div>
      <h1 className="text-3xl font-bold mb-4">Vite + React</h1>
      <div className="card p-4 bg-gray-100 dark:bg-gray-800 rounded mb-4">
        <button
          onClick={() => setCount((c) => c + 1)}
          className="p-2 bg-unimed-green text-white rounded hover:bg-unimed-green/80"
        >
          count is {count}
        </button>
        <p className="mt-2">
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}
