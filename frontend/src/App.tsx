import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import './index.css'
import Chat from './pages/Chat'

function App() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <nav className="bg-unimed-green p-4 flex items-center justify-end text-white">
        <button
          onClick={() => setDark(!dark)}
          className="p-2 text-white text-unimed-green rounded"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>
      <div className="flex-1">
        <Chat />
      </div>
    </div>
  )
}

export default App
