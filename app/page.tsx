'use client'

import { useState } from 'react'

export default function Home() {
  const [clicked, setClicked] = useState(false)

  const handleClick = () => {
    setClicked(!clicked)
    console.log('Hello button clicked!')
  }

  return (
    <main className="container">
      <div className="button-container">
        <button
          onClick={handleClick}
          className={`button ${clicked ? 'button-clicked' : 'button-default'}`}
        >
          {clicked ? 'Hello!' : 'Say Hello'}
        </button>
      </div>
    </main>
  )
}