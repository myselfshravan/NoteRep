import Head from 'next/head'
import { Container } from '@/components/Container'
import { Transition } from '@headlessui/react'
import { Switch } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { HeaderMod } from '@/components/HeaderMod'
import { Hero } from '@/components/Hero'
import { Content } from '@/components/Content'
import { Author } from '@/components/Author'
import chevronup from '@/images/chevronup.svg'
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp'
import { SecondaryFeatures } from '@/components/SecondaryFeatures'
import { Timetable } from '@/components/Timetable'
import { Calendar } from '@/components/Calendar'
import { GCalendar } from '@/components/GoogleCalendar'
import { Counter } from '@/components/Calendar'
import { Button } from '@/components/Button'
import { ContentNew } from '@/components/ContentNew'

const links = {
  curriculum: '/syllabus_ci8',
  curriculumText: 'CSE (AI&ML) Curriculum',
}

const cseaimlsem8 = [
  {
    title: 'Yoga',
    description: 'NCME (YO83)',
    link: 'https://drive.google.com/drive/folders/1HYVGUS_9ZBWtzjThSOtMWDCafHnJJQdW?usp=sharing',
  },
  {
    title: 'Physical Education',
    description: 'NCME (PE83)',
    link: 'https://drive.google.com/drive/folders/1Wjz9CjriFC4aGq37EUvKuY6sWP63daf1?usp=sharing',
  },
]

export default function Home() {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        setShowButton(true)
      } else {
        setShowButton(false)
      }
    })
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.theme = 'light'
    localStorage.theme = 'dark'
    localStorage.removeItem('theme')
  }, [])

  const [isShowing, setIsShowing] = useState(false)
  const [enabled, setEnabled] = useState(true)

  const examDate = new Date('2021-12-17T00:00:00')
  const today = new Date()
  const diff = examDate.getTime() - today.getTime()
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  const [counter, setCounter] = useState(seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((counter) => counter - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Head>
        <title>CSE (AI & ML) 8th Sem Notes</title>
        <meta
          name="description"
          content="NoteRep - Links to CSE(AI & ML) and Cyber Security Notes for 8th Semester"
        />
        <meta name="theme-color" content="black-translucent" />
        <meta
          name="google-site-verification"
          content="9l6jBCdCjl0ZW1Q6RrsllF3h9y5WdO-_rNvO1BKgH9s"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="noterep, notes, notes sharing, notes msrit, noterep.vercel.app, cse aiml notes, cse cy notes, cse notes, msrit notes, msrit cse notes, msrit cse aiml notes, msrit"
        />
        <meta name="author" content="Shravan Revanna" />
      </Head>
      <div className="bg-indigo-50 dark:bg-cost5 dark:text-white">
        <Header />
        <Container>
          <h2 className="pb-5 pt-8 text-center text-lg font-semibold tracking-tight text-gray-900 dark:text-white md:text-xl">
            8th Sem Notes Links for CSE(AI & ML)
          </h2>
          <div className="flex flex-row items-center justify-center gap-2 py-3 lg:p-5">
            <Switch
              checked={enabled}
              onChange={setEnabled}
              className={`${
                enabled ? 'bg-blue-600' : 'bg-white dark:bg-gray-500'
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span
                className={`${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-gray-200 transition dark:bg-white`}
              />
            </Switch>
            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-50">
              {enabled ? 'Hide Calendar' : 'Show Calendar'}
            </p>
          </div>
          <div
            style={{
              opacity: enabled ? 1 : 0,
              transition: 'opacity 150ms ease-in-out',
              height: enabled ? 'auto' : '0',
              overflow: 'hidden',
            }}
          >
            <GCalendar url="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FKolkata&bgcolor=%23ffffff&title=CSE(AI%26ML)%20Sem%208&mode=MONTH&showTz=0&showPrint=0&showTabs=0&showCalendars=0&src=7c29d7105d36a8aade5606de286abaa0d08d58f6061bb60f7473f149efb020d2%40group.calendar.google.com&color=%23039BE5" />
          </div>
        </Container>
        <ContentNew drive={cseaimlsem8} sem="8th" links={links} />
        <Author />
      </div>
      <Footer />
      {showButton && (
        <button onClick={scrollToTop} className="back-to-top">
          <ArrowCircleUpIcon
            sx={{
              fontSize: '40px',
              width: 40,
              height: 40,
              padding: 0.7,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #002a8f, #00b5f5)',
            }}
          />
        </button>
      )}
    </>
  )
}
