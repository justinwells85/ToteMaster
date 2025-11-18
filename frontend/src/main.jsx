import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Disable StrictMode in development to prevent double-rendering effects
// that cause connection pool exhaustion and 20s delays
const isDevelopment = import.meta.env.DEV

createRoot(document.getElementById('root')).render(
  isDevelopment ? <App /> : (
    <StrictMode>
      <App />
    </StrictMode>
  ),
)
