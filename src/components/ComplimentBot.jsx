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

function EmojiRating({ onRate, complimentId }) {
  const [currentVal, setCurrentVal] = useState(4)
  const emojis = [
    { id: 'blushing', label: 'blushing', emoji: '😊', value: 1 }, // Flattered but shy
    {
      id: 'pleasantlySurprised',
      label: 'pleasantly surprised',
      emoji: '😲',
      value: 2,
    }, // Didn't see it coming
    { id: 'warmFuzzies', label: 'warm fuzzies', emoji: '🥰', value: 3 }, // Feeling all warm inside
    { id: 'grateful', label: 'grateful', emoji: '🙏', value: 4 }, // Appreciative
    { id: 'confident', label: 'confident', emoji: '😎', value: 5 }, // Compliment boosted confidence
    { id: 'ecstatic', label: 'ecstatic', emoji: '🤩', value: 6 }, // On cloud nine
    { id: 'royalty', label: 'absolute royalty', emoji: '👑', value: 7 }, // Crowned by the compliment
  ]

  const handleRating = (value) => {
    setCurrentVal(value)
    onRate(value, complimentId)
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

const ComplimentAI = ({ studentData, onComplimentGenerated }) => {
  const [compliment, setCompliment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiCompliments, setAiCompliments] = useState([])

  useEffect(() => {
    const storedCompliments = localStorage.getItem('aiCompliments')
    if (storedCompliments) {
      try {
        setAiCompliments(JSON.parse(storedCompliments))
        setCompliment(JSON.parse(storedCompliments)[0].message)
      } catch (e) {
        console.error('Error parsing aiCompliments from localStorage', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('aiCompliments', JSON.stringify(aiCompliments))
  }, [aiCompliments])

  const updateAiComplimentsInFirebase = async (
    usn,
    complimentResponse,
    rating,
    complimentId
  ) => {
    try {
      console.log(usn, complimentResponse, rating, complimentId)
      if (
        !usn ||
        !complimentResponse ||
        rating === undefined ||
        !complimentId
      ) {
        throw new Error(
          'Invalid input data. Ensure usn, roastResponse, rating, and roastId are provided.'
        )
      }
      const userRef = doc(db, 'studentAnalytics', usn)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const aiCompliments = userDoc.data().aiCompliments || []
        const existingComplimentIndex = aiCompliments.findIndex(
          (compliment) => compliment.compliment_id === complimentId
        )

        if (existingComplimentIndex !== -1) {
          // Update existing compliment rating
          aiCompliments[existingComplimentIndex].ratings = rating
          await updateDoc(userRef, { aicompliments: aiCompliments })
        } else {
          // Add new roast if not found
          const timestamp = Timestamp.now()
          const complimentEntry = {
            compliment_id: complimentId,
            response: complimentResponse,
            timestamp,
            ratings: rating,
          }
          await updateDoc(userRef, {
            aicompliments: arrayUnion(complimentEntry),
          })
        }
      } else {
        const timestamp = new Date()
        const complimentEntry = {
          compliment_id: complimentId,
          response: complimentResponse,
          timestamp,
          ratings: rating,
        }
        await setDoc(userRef, { aicompliments: [complimentEntry] })
      }
    } catch (err) {
      console.error('Error updating AI roasts in Firebase:', err)
    }
  }

  function extractData(jsonData) {
    let result = ''
    result += `Name: ${jsonData.name.toLowerCase()}\n`
    result += `CGPA: ${jsonData.cgpa}\n`
    const cgpaList = [...jsonData.academicHistory.semesters]
      .sort((a, b) => b.sgpa - a.sgpa) // Sort semesters by SGPA in descending order
      .slice(0, 3) // Take the top 2 CGPAs
    result += 'Semester SGPAs:\n---\n'
    cgpaList.forEach((semesterData, index) => {
      result += `  Top ${index + 1}: SGPA = ${
        semesterData.sgpa
      } (${semesterData.semester.trim()})\n---\n`
    })

    result += '\nCourse Details:\n'
    jsonData.courses.forEach((course) => {
      result += `  ${course.CourseName}\n`
      result += `    Internal Score: ${course.InternalScore}/50,\n`
    })

    return result
  }

  const handleCompliment = async () => {
    if (!studentData) {
      setError('Student data is missing.')
      return
    }

    setIsLoading(true)
    setError('')
    setCompliment('')
    const stringData = extractData(studentData)
    // console.log('Student Data:', stringData)
    const prompt = `Compliment this student in a witty and humorous manner based on the following details:

    My Details:
    ---
    ${stringData}
    ---
    Give a compliment that is playful and nice. Focus on Cources and SGPAs which has extream scores like lows and highs.`

    const endpoint = '/api/chat'
    const body = JSON.stringify({
      messages: [
        {
          role: 'system',
          content:
            'You are a compliment master. You are a witty and humorous AI that generates very creative compliments. You are a comedic AI specializing in praising.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
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
      setCompliment(message)

      if (message) {
        const timestamp = new Date().toISOString()
        setCompliment(message)
        const complimentId = uuidv4()

        const complimentResponse = {
          message,
          timestamp,
          ratings: null,
          compliment_id: complimentId,
        }
        setAiCompliments((prev) => [...prev, complimentResponse])

        const usnFromStudentData =
          studentData['usn'] || localStorage.getItem('usn')
        if (usnFromStudentData) {
          await updateAiComplimentsInFirebase(
            usnFromStudentData,
            message,
            null,
            complimentId
          )
        }
      } else {
        setError('Error generating compliment')
      }
    } catch (err) {
      setError(err.message || 'Error generating compliment')
    } finally {
      setIsLoading(false)
      if (onComplimentGenerated) {
        onComplimentGenerated()
      }
    }
  }

  const handleRating = async (rating) => {
    if (aiCompliments.length > 0) {
      const latestCompliment = aiCompliments[aiCompliments.length - 1]
      console.log('Latest Roast:', latestCompliment)
      const usn = studentData.usn || 'default_usn'
      const complimentAcknowledgments = {
        1: 'Aww, blushing already? Too cute. 😊',
        2: 'Didn’t see that coming, huh? Surprise compliments are the best! 😲',
        3: 'Feeling the warm fuzzies yet? You deserve it! 🥰',
        4: 'Gratitude looks good on you. 🙏',
        5: 'Confidence unlocked. You’re glowing! 😎',
        6: 'Living your best life now, aren’t you? 🤩',
        7: 'Bow down, we’re in the presence of royalty. 👑',
      }

      if (
        latestCompliment &&
        latestCompliment.message &&
        latestCompliment.compliment_id
      ) {
        await updateAiComplimentsInFirebase(
          usn,
          latestCompliment.message,
          rating,
          latestCompliment.compliment_id
        )
        toast.success(complimentAcknowledgments[rating])
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
      {compliment && (
        <div className="mt-4 flex justify-start">
          <div className="lg:text-md rounded-md bg-slate-100 p-2 text-sm text-gray-700 dark:bg-slate-700 dark:text-indigo-100">
            <AIResponse text={compliment} />
            <EmojiRating onRate={handleRating} />
          </div>
        </div>
      )}
      <button
        onClick={handleCompliment}
        className="mt-4 flex items-center justify-center rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        disabled={isLoading}
      >
        {isLoading ? <LoadingNew /> : <SendBtn className="mr-2 h-5 w-5" />}{' '}
        Generate Compliment
      </button>
      {error && <p className="mt-2 text-red-400">{error}</p>}
    </div>
  )
}

export default ComplimentAI
