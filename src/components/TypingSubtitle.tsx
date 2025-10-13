'use client'

import { useState, useEffect } from 'react'

const lines = [
  "Upload a photo or select your ingredients and find your next meal.",
  "Discover nutritional information and cooking tips for healthier meals.",
  "Save your favorite recipes and build your personal cookbook.",
  "Get personalized recipe suggestions based on your taste preferences and saved recipes."
]

export default function TypingSubtitle() {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const currentLine = lines[currentLineIndex]
    const words = currentLine.split(' ')
    let wordIndex = 0
    setDisplayedText('')
    setIsTyping(true)

    const typeInterval = setInterval(() => {
      if (wordIndex < words.length) {
        const newText = words.slice(0, wordIndex + 1).join(' ')
        setDisplayedText(newText)
        wordIndex++
      } else {
        clearInterval(typeInterval)
        setIsTyping(false)
        // Wait before moving to next line
        setTimeout(() => {
          setCurrentLineIndex(prev => (prev + 1) % lines.length)
        }, 3000) // 3 seconds pause
      }
    }, 300) // Slower typing speed: 300ms per word

    return () => clearInterval(typeInterval)
  }, [currentLineIndex])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500) // Blink every 500ms

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
       Have ingredients but no ideas? <span className="inline-block min-w-0">{displayedText}</span>
       {showCursor && <span className="animate-blink">|</span>}
     </p>
  )
}
