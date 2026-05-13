import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import { firebaseConfig } from '@/firebaseconfig'
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore'
import { getOrCreateUserId } from '@/utils/user'

if (typeof window !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

let _db = null
const getDb = () => {
  if (typeof window === 'undefined') return null
  if (!_db) _db = getFirestore()
  return _db
}

let _analyticsPromise = null
const getAnalyticsInstance = () => {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (_analyticsPromise) return _analyticsPromise
  _analyticsPromise = (async () => {
    try {
      const { isSupported, getAnalytics } = await import('firebase/analytics')
      const supported = await isSupported()
      if (!supported) return null
      return getAnalytics()
    } catch {
      return null
    }
  })()
  return _analyticsPromise
}

export const redactDob = (url) => {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    if (u.searchParams.has('dob')) u.searchParams.set('dob', 'REDACTED')
    return u.toString()
  } catch {
    return url.replace(/dob=[^&]*/i, 'dob=REDACTED')
  }
}

export const categorizeError = ({ error, response }) => {
  if (response) {
    if (response.status >= 500) return 'http_5xx'
    if (response.status >= 400) return 'http_4xx'
  }
  if (error) {
    const msg = (error.message || '').toLowerCase()
    if (msg.includes('failed to fetch') || msg.includes('network') || error.name === 'TypeError') {
      return 'network_error'
    }
    if (msg.includes('timeout') || msg.includes('aborted') || error.name === 'AbortError') {
      return 'timeout'
    }
    if (msg.includes('json') || error.name === 'SyntaxError') return 'parse_error'
  }
  return 'unknown'
}

const bucketDuration = (ms) => {
  if (ms < 500) return '<500'
  if (ms < 1500) return '500-1500'
  if (ms < 5000) return '1500-5000'
  return '>5000'
}

export const logApiEvent = async ({
  type,
  endpointName,
  url,
  status = null,
  durationMs,
  errorMessage = null,
  errorCategory = null,
  responseBodyPreview = null,
  usn = null,
  semesterEndpoint = null,
}) => {
  try {
    const db = getDb()
    if (!db) return
    const safeUrl = url ? redactDob(url) : null
    await addDoc(collection(db, 'apiErrors'), {
      type,
      endpointName,
      url: safeUrl,
      status,
      errorCategory,
      errorMessage,
      responseBodyPreview: responseBodyPreview ? String(responseBodyPreview).slice(0, 500) : null,
      durationMs: Math.round(durationMs),
      usn,
      semesterEndpoint,
      deviceId: getOrCreateUserId(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      pageUrl: typeof window !== 'undefined' ? window.location.href : null,
      createdAt: serverTimestamp(),
    })
  } catch (e) {
    console.error('apiObservability: Firestore write failed', e)
  }
}

export const logAnalyticsEvent = async (eventName, params = {}) => {
  try {
    const analytics = await getAnalyticsInstance()
    if (!analytics) return
    const { logEvent } = await import('firebase/analytics')
    logEvent(analytics, eventName, params)
  } catch (e) {
    console.error('apiObservability: Analytics logEvent failed', e)
  }
}

export const reportApiError = ({
  endpointName,
  url,
  response,
  error,
  durationMs,
  usn,
  semesterEndpoint,
  responseBodyPreview,
}) => {
  const status = response ? response.status : null
  const errorCategory = categorizeError({ error, response })
  const errorMessage = error ? error.message : response ? `HTTP ${response.status}` : 'unknown'

  logApiEvent({
    type: 'error',
    endpointName,
    url,
    status,
    durationMs,
    errorMessage,
    errorCategory,
    responseBodyPreview,
    usn,
    semesterEndpoint,
  })

  logAnalyticsEvent('sis_api_error', {
    status: status ?? 0,
    endpoint_name: endpointName,
    error_category: errorCategory,
    semester_endpoint: semesterEndpoint ?? 'none',
  })
}

export const reportApiSuccess = ({
  endpointName,
  url,
  status,
  durationMs,
  usn,
  semesterEndpoint,
}) => {
  logApiEvent({
    type: 'success',
    endpointName,
    url,
    status,
    durationMs,
    usn,
    semesterEndpoint,
  })

  logAnalyticsEvent('sis_api_success', {
    endpoint_name: endpointName,
    semester_endpoint: semesterEndpoint ?? 'none',
    duration_ms_bucket: bucketDuration(durationMs),
  })
}
