import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import './index.css'
import Chat from './pages/Chat'
import logo from './assets/logo.png'

function App() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  return (
    <div className="h-screen flex flex-col text-gray-900 dark:text-gray-100">
      <nav className="bg-unimed-green p-4 flex items-center justify-between text-white">
        <img src={logo} alt="Logo" className="h-12 w-auto" />
        <button
          onClick={() => setDark(!dark)}
          className="p-2 text-white bg-white/20 rounded-full hover:bg-white/30 transition"
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
