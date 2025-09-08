import React from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import { App } from './App'
import { initTheme } from './theme'

initTheme()
createRoot(document.getElementById('root')!).render(<App />)
