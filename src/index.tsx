import React from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import { initTheme } from './theme'

import { App } from './App'

initTheme()
createRoot(document.getElementById('root')!).render(<App />)
