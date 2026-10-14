// Server-side proxy for Groq chat completions.
// Keeps the API key out of the client bundle and owns model selection, so a
// Groq model retirement is fixed by changing GROQ_MODELS on Vercel, not code.

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'

// Tried in order; the next one is used if a model errors or returns nothing.
const DEFAULT_MODELS = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b']

const MAX_MESSAGES = 60
const MAX_TOTAL_CHARS = 60000
const ALLOWED_ROLES = new Set(['system', 'user', 'assistant'])

function getModels() {
  const fromEnv = (process.env.GROQ_MODELS || '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)
  return fromEnv.length ? fromEnv : DEFAULT_MODELS
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'messages must be a non-empty array'
  }
  if (messages.length > MAX_MESSAGES) return 'too many messages'
  let totalChars = 0
  for (const m of messages) {
    if (!m || !ALLOWED_ROLES.has(m.role) || typeof m.content !== 'string') {
      return 'invalid message'
    }
    totalChars += m.content.length
  }
  if (totalChars > MAX_TOTAL_CHARS) return 'messages too long'
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API
  if (!apiKey) {
    console.error('[api/chat] Groq API key is not configured')
    return res.status(500).json({ error: 'Chat is not configured' })
  }

  const { messages, temperature } = req.body || {}
  const invalid = validateMessages(messages)
  if (invalid) return res.status(400).json({ error: invalid })

  const temp =
    typeof temperature === 'number' ? Math.min(Math.max(temperature, 0), 2) : 0.7

  let lastError = 'Failed to generate response'
  for (const model of getModels()) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: temp,
          // gpt-oss models reason before answering; keep that short so the
          // token budget goes to the visible reply.
          reasoning_effort: 'low',
          max_completion_tokens: 2048,
        }),
      })
      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content
      if (response.ok && content) return res.status(200).json(data)

      lastError = data?.error?.message || `Empty response from ${model}`
      console.error(`[api/chat] ${model} failed (${response.status}): ${lastError}`)
    } catch (err) {
      lastError = err.message
      console.error(`[api/chat] ${model} request error: ${lastError}`)
    }
  }

  return res.status(502).json({ error: lastError })
}
