import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './index.css'
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-sm">
        
        <h1 className="font-display text-4xl text-foreground mb-2">
          Welcome back
        </h1>
        <p className="text-muted-foreground mb-8">
          Pick up right where you left off.
        </p>

        <label className="block text-sm font-medium text-foreground mb-2">
          EMAIL
        </label>
        <input
          type="email"
          placeholder="tu@correo.com"
          className="w-full bg-input border border-border rounded-lg px-4 py-3 mb-6 focus:outline-none focus:border-primary"
        />

        <label className="block text-sm font-medium text-foreground mb-2">
          PASSWORD
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className="w-full bg-input border border-border rounded-lg px-4 py-3 mb-6 focus:outline-none focus:border-primary"
        />

        <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary-hover transition">
          Log in →
        </button>

      </div>
    </div>
  )
}

export default App