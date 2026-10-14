import React, { use } from 'react'
import { useEffect, useState, useRef } from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import { firebaseConfig } from '@/firebaseconfig'
import {
  getFirestore,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import showdown from 'showdown'
import LoadingNew from './LoadingNew'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
} else {
  firebase.app()
}

const db = getFirestore()

function SendBtn(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-6"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
      />
    </svg>
  )
}

function AIResponse({ text }) {
  const converter = new showdown.Converter()
  let htmlContent = converter.makeHtml(text)
  htmlContent = htmlContent.replace(
    /<(\w+)(\s+[^>]*)? id="[^"]*"([^>]*)>/g,
    '<$1$2$3>'
  )
  htmlContent = htmlContent.replace(
    /<(\w+)(\s+[^>]*)? id='[^']*'([^>]*)>/g,
    '<$1$2$3>'
  )
  htmlContent = htmlContent.replace(
    /<h1>/g,
    '<h1 class="text-sm md:text-md font-bold mt-10">'
  )
  htmlContent = htmlContent.replace(
    /<h2>/g,
    '<h2 class="text-sm md:text-md font-bold mt-10">'
  )
  htmlContent = htmlContent.replace(
    /<h3>/g,
    '<h3 class="text-sm md:text-md font-bold mt-10">'
  )
  htmlContent = htmlContent.replace(
    /<p>/g,
    '<p class="my-2 text-sm md:text-md">'
  )
  htmlContent = htmlContent.replace(
    /<strong>/g,
    '<strong class="font-bold mt-10">'
  )
  htmlContent = htmlContent.replace(
    /<ul>/g,
    '<ul class="list-disc pl-5 space-y-2 mb-4">'
  )
  htmlContent = htmlContent.replace(
    /<ol>/g,
    '<ol class="list-disc pl-5 space-y-2">'
  )
  htmlContent = htmlContent.replace(/<li>/g, '<li class="text-sm md:text-md">')
  htmlContent = htmlContent.replace(
    /<hr \/>/g,
    '<hr class="my-8 border-t border-gray-300"/>'
  )
  htmlContent = htmlContent.replace(
    /<pre>/g,
    '<pre class="p-4 bg-gray-100 rounded-lg overflow-x-auto font-mono text-sm leading-normal">'
  )
  htmlContent = htmlContent.replace(/<code>/g, '<code class="language-python">')
  const urlRegex = /(\bhttps?:\/\/[^\s<]+[^\s`!()\[\]{};:'".,<>?«»""''])/g
  htmlContent = htmlContent.replace(urlRegex, (url) => {
    let displayUrl = url.replace(/^https?:\/\/(www\.)?/, '')
    displayUrl = displayUrl.replace(/\/$/, '')
    return `<a href="${url}" target="_blank" class="text-blue-400 underline">${displayUrl}</a>`
  })

  return (
    <div className="text-left">
      <div className="" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  )
}

function EmojiRating({ onRate, roastId }) {
  const [currentVal, setCurrentVal] = useState(4)
  const emojis = [
    { id: 'offended', label: 'offended', emoji: '🤬', value: 1 }, // Personally attacked
    {
      id: 'veryDissatisfied',
      label: 'very dissatisfied',
      emoji: '😡',
      value: 2,
    }, // Annoyed
    { id: 'dissatisfied', label: 'dissatisfied', emoji: '😒', value: 3 }, // Unamused
    { id: 'neutral', label: 'neutral', emoji: '😐', value: 4 }, // Meh
    { id: 'satisfied', label: 'satisfied', emoji: '😆', value: 5 }, // Laughing but not wrecked
    { id: 'verySatisfied', label: 'very satisfied', emoji: '😂', value: 6 }, // Fully enjoying the roast
    { id: 'obliterated', label: 'absolutely roasted', emoji: '💀', value: 7 }, // Roast was fatal
  ]

  const handleRating = (value) => {
    setCurrentVal(value)
    onRate(value, roastId)
  }

  return (
    <div className="flex items-center gap-1 p-4">
      {emojis.map(({ id, label, emoji, value }) => (
        <label
          key={id}
          htmlFor={id}
          className="transition focus-within:scale-125 hover:scale-125"
        >
          <span className="sr-only">{label}</span>
          <input
            type="radio"
            id={id}
            name="rating"
            value={value}
            className="sr-only"
            checked={currentVal === value}
            onChange={() => handleRating(value)}
          />
          <span
            className={`text-2xl ${
              currentVal >= value ? 'grayscale-0' : 'grayscale'
            }`}
          >
            {emoji}
          </span>
        </label>
      ))}
    </div>
  )
}

const RoastAI = ({ studentData, onRoastGenerated }) => {
  const [roast, setRoast] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiRoasts, setAiRoasts] = useState([])

  useEffect(() => {
    const storedRoasts = localStorage.getItem('aiRoasts')
    if (storedRoasts) {
      try {
        setAiRoasts(JSON.parse(storedRoasts))
        setRoast(JSON.parse(storedRoasts)[0].message)
      } catch (e) {
        console.error('Error parsing aiRoasts from localStorage', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('aiRoasts', JSON.stringify(aiRoasts))
  }, [aiRoasts])

  const updateAiRoastsInFirebase = async (
    usn,
    roastResponse,
    rating,
    roastId
  ) => {
    try {
      console.error(usn, roastResponse, rating, roastId)
      if (!usn || !roastResponse || rating === undefined || !roastId) {
        throw new Error(
          'Invalid input data. Ensure usn, roastResponse, rating, and roastId are provided.'
        )
      }
      const userRef = doc(db, 'studentAnalytics', usn)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const aiRoasts = userDoc.data().airoasts || []
        const existingRoastIndex = aiRoasts.findIndex(
          (roast) => roast.roast_id === roastId
        )

        if (existingRoastIndex !== -1) {
          // Update existing roast rating
          aiRoasts[existingRoastIndex].ratings = rating
          await updateDoc(userRef, { airoasts: aiRoasts })
        } else {
          // Add new roast if not found
          const timestamp = Timestamp.now()
          const roastEntry = {
            roast_id: roastId,
            response: roastResponse,
            timestamp,
            ratings: rating,
          }
          await updateDoc(userRef, { airoasts: arrayUnion(roastEntry) })
        }
      } else {
        const timestamp = new Date()
        const roastEntry = {
          roast_id: roastId,
          response: roastResponse,
          timestamp,
          ratings: rating,
        }
        await setDoc(userRef, { airoasts: [roastEntry] })
      }
    } catch (err) {
      console.error('Error updating AI roasts in Firebase:', err)
    }
  }

  function extractData(jsonData) {
    let result = ''
    result += `Name: ${jsonData.name.toLowerCase()}\n`
    result += `CGPA: ${jsonData.cgpa}\n`
    result += 'Semester SGPAs:\n---\n'
    const { semesters } = jsonData.academicHistory
    let semCount = 1
    semesters.forEach((semesterData) => {
      const { semester, sgpa } = semesterData
      const semesterName = semester.trim()
      if (semesterName.toLowerCase().includes('supplementary')) {
        result += `  Supplementary Semester: SGPA = ${sgpa} in (${semesterName})\n`
      } else {
        result += `  Sem ${semCount}: SGPA = ${sgpa} during (${semesterName})\n --- \n`
        semCount += 1
      }
    })

    result += '\nCourse Details:\n'
    jsonData.courses.forEach((course) => {
      result += `  ${course.CourseName}\n`
      result += `    Internal Score: ${course.InternalScore}/50, Attendance: ${course.attendance}%\n`
    })

    return result
  }

  const handleRoast = async () => {
    if (!studentData) {
      setError('Student data is missing.')
      return
    }

    setIsLoading(true)
    setError('')
    setRoast('')
    const stringData = extractData(studentData)
    // console.log('Student Data:', stringData)
    const prompt = `Roast this student in a witty and humorous manner based on the following details:

    My Details:
    ---
    ${stringData}
    ---
    Give a roast that is playful and extreamly sarcastic. Focus on Cources and SGPAs which has extream scores like lows and highs.`

    const endpoint = '/api/chat'
    const body = JSON.stringify({
      messages: [
        {
          role: 'system',
          content:
            'You are a roast master. You are a witty and humorous AI that generates very creative roasts. You are a comedic AI specializing in roasts.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    })
    const headers = {
      'Content-Type': 'application/json',
    }

    try {
      const response = await fetch(endpoint, { method: 'POST', headers, body })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate roast')
      }
      const data = await response.json()
      const message = data.choices[0].message.content
      setRoast(message)

      if (message) {
        const timestamp = new Date().toISOString()
        setRoast(message)
        const roastId = uuidv4()

        const roastResponse = {
          message,
          timestamp,
          ratings: null,
          roast_id: roastId,
        }
        setAiRoasts((prev) => [...prev, roastResponse])

        const usnFromStudentData =
          studentData['usn'] || localStorage.getItem('usn')
        if (usnFromStudentData) {
          await updateAiRoastsInFirebase(
            usnFromStudentData,
            message,
            null,
            roastId
          )
        }
      } else {
        setError('Error generating roast')
      }
    } catch (err) {
      setError(err.message || 'Error generating roast')
    } finally {
      setIsLoading(false)
      if (onRoastGenerated) {
        onRoastGenerated()
      }
    }
  }

  const handleRating = async (rating) => {
    if (aiRoasts.length > 0) {
      const latestRoast = aiRoasts[aiRoasts.length - 1]
      console.log('Latest Roast:', latestRoast)
      const usn = studentData.usn || 'default_usn'
      const roastAcknowledgments = {
        1: 'Oof, too spicy? We’ll tone it down... or not. 😈',
        2: 'Okay, okay—maybe that one hit too hard. 🫣',
        3: 'Mid roast? I’ll have a word with the AI. 🤖',
        4: 'Balanced. Like all things should be. ⚖️',
        5: 'Now we’re cookin’! 🔥',
        6: 'Peak comedy. AI’s on a roll. 🚀',
        7: 'We just witnessed a digital homicide. RIP you. 🪦',
      }

      if (latestRoast && latestRoast.message && latestRoast.roast_id) {
        await updateAiRoastsInFirebase(
          usn,
          latestRoast.message,
          rating,
          latestRoast.roast_id
        )
        toast.success(roastAcknowledgments[rating])
      } else {
        setError('Error: try generating a new roast to rate')
        toast.error('Error: try generating a new roast to rate')
      }
    } else {
      setError('Error: No roasts available to rate')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {roast && (
        <div className="mt-4 flex justify-start">
          <div className="lg:text-md rounded-md bg-slate-100 p-2 text-sm text-gray-700 dark:bg-slate-700 dark:text-indigo-100">
            <AIResponse text={roast} />
            <EmojiRating onRate={handleRating} />
          </div>
        </div>
      )}
      <button
        onClick={handleRoast}
        className="mt-4 flex items-center justify-center rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        disabled={isLoading}
      >
        {isLoading ? <LoadingNew /> : <SendBtn className="mr-2 h-5 w-5" />}{' '}
        Generate Roast
      </button>
      {error && <p className="mt-2 text-red-400">{error}</p>}
    </div>
  )
}

export default RoastAI
