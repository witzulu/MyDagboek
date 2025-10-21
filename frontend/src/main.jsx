import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ProjectProvider from './components/ProjectContext'
import { ThemeProvider } from './components/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
