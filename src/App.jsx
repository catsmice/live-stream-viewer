import { useState } from 'react'
import LiveStreamViewer from './components/LiveStreamViewer'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">YouTube Live Stream Viewer</h1>
          <p className="text-gray-300 text-sm">Scroll to discover trending live streams</p>
        </div>
      </header>
      
      <main>
        <LiveStreamViewer />
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        <p>Built with React + Vite</p>
      </footer>
    </div>
  )
}

export default App
