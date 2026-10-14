import React, { use } from 'react'
import { useEffect, useState, useRef } from 'react'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import { firebaseConfig } from '@/firebaseconfig'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import showdown from 'showdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getOrCreateUserId } from '@/utils/user'

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
} else {
  firebase.app()
}

function AIResponse({ text, response }) {
  const responsetime = response.usage.total_time.toFixed(2)
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
    '<h1 class="text-xl md:text-3xl font-bold mt-10">'
  )
  htmlContent = htmlContent.replace(
    /<h2>/g,
    '<h2 class="text-lg md:text-2xl font-bold mt-10">'
  )
  htmlContent = htmlContent.replace(
    /<h3>/g,
    '<h3 class="text-base md:text-xl font-bold mt-10">'
  )
  // Add classes to <p> tags
  htmlContent = htmlContent.replace(
    /<p>/g,
    '<p class="my-4 text-sm md:text-lg">'
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
  htmlContent = htmlContent.replace(/<li>/g, '<li class="text-sm md:text-lg">')
  htmlContent = htmlContent.replace(
    /<hr \/>/g,
    '<hr class="my-8 border-t border-gray-300"/>'
  )
  // Add classes to <pre> tags
  htmlContent = htmlContent.replace(
    /<pre>/g,
    '<pre class="p-4 bg-gray-100 rounded-lg overflow-x-auto font-mono text-sm leading-normal">'
  )
  htmlContent = htmlContent.replace(/<code>/g, '<code class="language-python">')

  // Identify the urls
  const urlRegex = /(\bhttps?:\/\/[^\s<]+[^\s`!()\[\]{};:'".,<>?«»“”‘’])/g
  htmlContent = htmlContent.replace(urlRegex, (url) => {
    const displayUrl = url
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/$/, '')
    return `<a href="${url}" class="text-blue-500 underline">${displayUrl}</a>`
  })

  htmlContent = htmlContent.replace(/\.com/g, '')

  return (
    <div className="w-full">
      <div className="mx-auto rounded-lg text-left">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
          Response time: {responsetime} seconds
        </p>
      </div>
    </div>
  )
}

function LLMUIResponse({ text, responsetime }) {
  return (
    <div className="text-left">
      <div className="">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-xl font-bold md:text-xl" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-md md:text-md font-bold" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-sm font-bold md:text-sm" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="md:text-md my-2 text-sm" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-bold" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="mb-4 list-disc space-y-1 pl-5" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-disc space-y-1 pl-5" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="md:text-md text-sm" {...props} />
            ),
            hr: ({ node, ...props }) => (
              <hr className="my-8 border-t border-gray-300" {...props} />
            ),
            pre: ({ node, ...props }) => (
              <pre
                className="overflow-x-auto rounded-lg bg-gray-100 p-4 font-mono text-sm leading-normal"
                {...props}
              />
            ),
            code: ({ node, inline, ...props }) =>
              inline ? (
                <code {...props} />
              ) : (
                <code className="language-python" {...props} />
              ),
            a: ({ node, ...props }) => (
              <a
                className="text-blue-400 underline"
                target="_blank"
                {...props}
              />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-hidden rounded-md border border-gray-300 dark:border-gray-700">
                <table
                  className="min-w-full table-auto text-sm"
                  {...props}
                />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th
                className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                className="border border-gray-200 px-3 py-1.5 text-gray-800 dark:border-gray-700 dark:text-gray-100"
                {...props}
              />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:border-gray-600 dark:text-gray-400"
                {...props}
              />
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
      {responsetime && (
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
          Response time: {responsetime} seconds
        </p>
      )}
    </div>
  )
}

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

function LoadingBtn(props) {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C8.477 0 4 4.477 4 12z"
      ></path>
    </svg>
  )
}

export function Bot({ moodstatus }) {
  const [isLoading, setIsLoading] = useState(false)
  const [userQuery, setUserQuery] = useState('')
  const [apiResponse, setApiResponse] = useState('')
  const [completeresponse, setCompleteResponse] = useState('')
  const [user, setUser] = useState(null)
  const [studentData, setStudentData] = useState({ name: 'Student' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chathistory, setChatHistory] = useState([])
  const [prompts, setPrompts] = useState([])
  const [systemprompts, setSystemPrompts] = useState([])
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chathistory])

  useEffect(() => {
    let userId = localStorage.getItem('userId')
    let chatHistory = localStorage.getItem('chatHistory')
    let studentData = localStorage.getItem('studentData')
    if (studentData) {
      setStudentData(JSON.parse(studentData))
    }
    console.log('Chat History:', JSON.parse(chatHistory))
    if (chatHistory) {
      setChatHistory(JSON.parse(chatHistory))
    }
    console.log('User ID:', userId)
    if (!userId) {
      userId = getOrCreateUserId()
      localStorage.setItem('userId', userId)
    }
    setUser(userId)
  }, [])

  useEffect(() => {
    const requests = parseInt(localStorage.getItem('promptRequests') || '0', 10)
    console.log('Requests:', requests)
    if (requests >= 5) {
      toast.success(
        'You have made ' + requests + ' requests to the AI Bot. Keep going!',
        {
          position: 'top-center',
          autoClose: 2000,
        }
      )
    }
  }, [])

  const handleInputChange = (event) => {
    setUserQuery(event.target.value)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && userQuery.trim()) {
      makeApiCall()
    }
  }

  const saveChatHistory = async (userQuery, apiResponse, responseTime) => {
    const db = firebase.firestore()
    const userDoc = db.collection('chathistory').doc(user)
    const timestamp = firebase.firestore.Timestamp.now()
    const responsetime = responseTime
    const chatEntry = {
      query: userQuery,
      response: apiResponse,
      responsetime: responsetime,
    }
    try {
      let localStorageChatHistory =
        JSON.parse(localStorage.getItem('chatHistory')) || []
      localStorageChatHistory.push(chatEntry)
      localStorage.setItem(
        'chatHistory',
        JSON.stringify(localStorageChatHistory)
      )
      const totalRequests = parseInt(
        localStorage.getItem('promptRequests') || '0',
        10
      )
      await userDoc.set(
        {
          queries: firebase.firestore.FieldValue.arrayUnion({
            query: userQuery,
            response: apiResponse,
            timestamp: timestamp,
          }),
          latestRequestTime: timestamp,
          totalRequests: totalRequests,
        },
        { merge: true }
      )
    } catch (error) {
      console.error('Firebase error:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = firebase.firestore()
        const [promptResponse, systemPromptResponse] = await Promise.all([
          db.collection('prompt').get(),
          db.collection('systemprompt').get(),
        ])

        const promptsData = promptResponse.docs.map((doc) => doc.data())
        const systemPromptsData = systemPromptResponse.docs.map((doc) =>
          doc.data()
        )

        setPrompts(promptsData)
        setSystemPrompts(systemPromptsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const makeApiCall = async () => {
    if (!userQuery.trim()) return
    setIsLoading(true)

    const activePrompts = prompts.filter((prompt) => prompt.status)
    // console.log('Active Prompts:', activePrompts)

    // Get the last two entries from chat history
    const lastTwoEntries = chathistory.slice(-2).map((entry) => ({
      role: 'user',
      content: entry.query,
    }))

    // Append the assistant responses corresponding to those entries
    const pastResponses = chathistory.slice(-2).map((entry) => ({
      role: 'assistant',
      content: entry.response,
    }))

    let fullSystemPrompt = systemprompts
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .filter((prompt) => prompt.status === true)
      .map((prompt) => prompt.content)
      .join(' ')

    const moodprompt = 'You are a witty bot and your answers will be humorous. '
    if (moodstatus) {
      fullSystemPrompt =
        moodprompt + fullSystemPrompt + ' Note: Fun Mood Enabled.'
    }
    // console.log(fullSystemPrompt)

    const requests = parseInt(localStorage.getItem('promptRequests') || '0', 10)
    localStorage.setItem('promptRequests', (requests + 1).toString())

    const newChatEntry = {
      query: userQuery,
      response: '.....',
      responsetime: '0.15',
    }
    setChatHistory([...chathistory, newChatEntry])

    const endpoint = '/api/chat'
    const body = JSON.stringify({
      messages: [
        {
          role: 'system',
          content: fullSystemPrompt,
        },
        {
          role: 'user',
          content: 'Who are you? Can you tell me about yourself?',
        },
        {
          role: 'assistant',
          content:
            "Hey there! I'm NoteRep AI Chatbot, brought to life by Shravan. He's the genius behind NoteRep, the awesome website where I hang out. Thanks to his technical wizardry and creativity, I'm here to assist with your queries. Shravan's done a stellar job making NoteRep the go-to place for students. Working with him has been a blast, and I'm constantly getting better because of his support. So, big shoutout to Shravan for making all this possible!",
        },
        // this is only active prompt context
        ...activePrompts
          .map((prompt) => [
            { role: 'user', content: prompt.user },
            { role: 'assistant', content: prompt.assistant },
          ])
          .flat(),
        { role: 'user', content: 'Hey! What is NoteRep?' },
        {
          role: 'assistant',
          content:
            'Welcome to NoteRep (https://noterep.vercel.app), developed by Shravan, An Open-Source Notes Sharing Platform. NoteRep centralizes all class notes, PPTs, and study materials to simplify and enhance your learning experience. Need help or looking for specific materials? Just ask or explore this NoteRep website!',
        },
        // this is users past context
        ...pastResponses.flatMap((entry, index) => [
          lastTwoEntries[index],
          entry,
        ]),
        { role: 'user', content: userQuery },
      ],
      temperature: 0.7,
    })
    const headers = {
      'Content-Type': 'application/json',
    }
    let json_body = JSON.parse(body)
    // console.log('Request:', json_body)

    try {
      const response = await fetch(endpoint, { method: 'POST', headers, body })
      const data = await response.json()
      setCompleteResponse(data)
      const message = data.choices[0].message.content
      const responseTime = data.usage.total_time.toFixed(2)
      setApiResponse(message)
      setChatHistory((prevHistory) =>
        prevHistory.map((item, idx) =>
          idx === prevHistory.length - 1
            ? { ...item, response: message, responsetime: responseTime }
            : item
        )
      )
      // toast.success(`Response time: ${data.usage.total_time.toFixed(2)}`, {
      //   position: 'top-center',
      //   autoClose: 2000,
      //   hideProgressBar: true,
      //   theme: 'dark',
      // })
      saveChatHistory(userQuery, message, responseTime)
    } catch (error) {
      console.error('Error:', error)
      setApiResponse('Error fetching response')
      saveChatHistory(userQuery, 'Error fetching response')
      setChatHistory((prevHistory) =>
        prevHistory.map((item, idx) =>
          idx === prevHistory.length - 1
            ? { ...item, response: 'Error fetching response', responsetime: 0 }
            : item
        )
      )
    } finally {
      setIsLoading(false)
      setUserQuery('')
    }
  }

  return (
    <>
      <ToastContainer />
      <section className="relative flex-1 bg-indigo-50 px-2 py-1 dark:bg-gray-900">
        <div className="container mx-auto flex max-w-lg flex-col rounded-lg bg-white shadow-lg dark:bg-slate-950 sm:p-2 md:max-w-xl lg:max-w-3xl">
          <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 h-[calc(100vh-350px)] min-h-[400px] overflow-y-auto overflow-x-hidden px-4 py-2">
            {chathistory.length > 0 && (
              <ul className="space-y-6">
                {chathistory.slice(-3).map((chat, index) => (
                  <li key={index} className="flex flex-col">
                    <div className="mb-3 flex justify-end">
                      <p className="max-w-[80%] rounded-2xl rounded-tr-sm bg-blue-500 px-4 py-2 text-sm text-white shadow-sm dark:bg-blue-600 md:text-base">
                        {chat.query}
                      </p>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm text-gray-800 shadow-sm dark:bg-gray-800 dark:text-gray-200 md:text-base">
                        <LLMUIResponse
                          text={chat.response}
                          responsetime={chat.responsetime}
                        />
                      </div>
                    </div>
                  </li>
                ))}
                <div ref={chatEndRef} />
              </ul>
            )}
          </div>
          {/* {apiResponse && (
            <div className="mt-2 rounded bg-gray-100 p-3 text-center text-sm text-gray-700 dark:bg-gray-700 dark:text-indigo-200 lg:text-lg">
              <AIResponse text={apiResponse} response={completeresponse} />
            </div>
          )} */}
          <div className="flex items-center gap-3 border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-slate-950">
            <input
              type="text"
              value={userQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
            <button
              onClick={makeApiCall}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700"
              disabled={isLoading || !userQuery.trim()}
            >
              {isLoading ? <LoadingBtn /> : <SendBtn />}
            </button>
          </div>
          <div className="bg-white py-1 text-center text-gray-600 dark:bg-slate-950 dark:text-gray-400">
            <p className="text-xs italic">
              Note: This AI Bot can't directly fetch notes just yet but stay
              tuned! The future might surprise us.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
