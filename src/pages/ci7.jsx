import Head from 'next/head'
import { Container } from '@/components/Container'
import { Transition } from '@headlessui/react'
import { Switch } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { HeaderMod } from '@/components/HeaderMod'
import { ContentNew } from '@/components/ContentNew'
import { Author } from '@/components/Author'
import chevronup from '@/images/chevronup.svg'
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp'
import { Timetable } from '@/components/Timetable'
import { Calendar } from '@/components/Calendar'
import { Counter } from '@/components/Calendar'
import { GCalendar } from '@/components/GoogleCalendar'
import { Button } from '@/components/Button'

const subjects7 = [
  {
    Day: 'Monday',
    subject: [
      'Information Retrieval',
      'Computer Vision',
      'Multicore',
      'GenAI',
      '-',
      'OE',
      '-',
      '-',
    ],
  },
  {
    Day: 'Tuesday',
    subject: [
      'Computer Vision Tut',
      'Computer Vision Tut',
      'Information Retrieval',
      'Multicore',
      '-',
      'OE',
      'GenAI',
      'GenAI',
    ],
  },
  {
    Day: 'Wednesday',
    subject: [
      'Multicore Lab',
      'Multicore Lab',
      'Information Retrieval',
      'Computer Vision',
      '-',
      'OE',
      'Industry-',
      '-Interaction',
    ],
  },
  {
    Day: 'Thursday',
    subject: ['-', 'GenAI', 'GenAI', 'GenAI', '-', '-', '-', '-'],
  },
  {
    Day: 'Friday',
    subject: [
      'Multicore',
      'Containerization Lab',
      'Containerization Lab',
      'Proctor Meet',
      '-',
      '-',
      '-',
      '-',
    ],
  },
  {
    Day: 'Saturday',
    subject: ['Industry Interaction', '-', '-', '-', '-', '-', '-', '-'],
  },
]

const links = {
  syllabus1:
    'https://docs.google.com/document/d/e/2PACX-1vTCMSPuhx-RN0tfdVnXrZnjkMucAeYoFwhfEBqiXh3L-Sa-7UX6vMe7GfgAjRLUSrLyJVpWxXSKJsit/pub',
  syllabus2:
    'https://docs.google.com/document/d/e/2PACX-1vRFRazfWll_UKmcqEqiLNioIn65WV8lIFmkwOEVjShDxPO4xFMZPOmB3tUN8A0NyDSeHab92K7FYuVC/pub',
  timetable:
    'https://drive.google.com/drive/folders/1HcJSkqZ7xgWW2cymK8EtS5X_7MI5v84F?usp=share_link',
  curriculum: 'syllabus',
}

const cseaimlsem6 = [
  {
    title: 'Management and Entrepreneurship',
    description: '(3:0:0) AL61',
    link: 'https://drive.google.com/drive/folders/1t6z-wFeMHvXU42J1ebVe0K6xq4qUAv0b?usp=drive_link',
    otherlink: '/links',
    tag: '',
  },
  {
    title: 'Introduction to Deep Learning',
    description: '(3:0:0) CI62',
    link: 'https://drive.google.com/drive/folders/1MVuBOvFXH2FzOAeYxTz94oPoN3tPybFY?usp=drive_link',
    otherlink: '/links',
    tag: '',
  },
  {
    title: 'Principal of Cryptography',
    description: '(3:0:0) CIE632',
    link: 'https://drive.google.com/drive/folders/140cUzgqzz9NIpqiI10_OkEVxT-WhGO_u?usp=drive_link',
    otherlink: '/links',
    tag: '',
  },
  {
    title: 'Cloud Computing',
    description: '(3:0:0) CIE641',
    link: 'https://drive.google.com/drive/folders/1CCAxPgoL_-zvfoN2JQc-Zclr9CNdWKHO?usp=drive_link',
    classroom: 'https://classroom.google.com/c/NjU5MDMzMTI1MzMy',
    tag: '',
  },
  {
    title: 'Deep Learning Lab',
    description: '(0:0:1) CIL65',
    link: 'https://github.com/githubhosting/DeepLearning-Lab',
    classroom: 'https://classroom.google.com/c/NjY4NDQ0NzkzMjYx',
    tag: '',
  },
  {
    title: 'Big Data Lab',
    description: '(0:0:1) CIL66',
    link: '#',
    github: 'https://github.com/githubhosting/BigData-Lab',
    extra: 'This is github repository',
    tag: '',
  },
]

const cseaimlsem7 = [
  {
    title: 'Multicore Architecture and Programming',
    description: '(3:0:1) CI71',
    link: 'https://drive.google.com/drive/folders/1Q-zuu-J90wQuzY6Sbcp3Ltqxa1IurCdK?usp=sharing',
    otherlink: '/links',
    tag: '',
  },
  {
    title: 'Computer Vision',
    description: '(2:1:0) CI72',
    link: 'https://drive.google.com/drive/folders/1PrOvTgemJMjau5ZscGexgB3JJr0-7A2Y?usp=sharing',
    otherlink: '/links',
    tag: '',
  },
  {
    title: 'Information Retrieval',
    description: '(3:0:0) CIE731',
    link: 'https://drive.google.com/drive/folders/1UVY0zGayzSeiPB6mY7aZOJlnNmZeOsEb?usp=sharing',
    otherlink: '/links',
    tag: 'archived',
    archive: true,
  },
  {
    title: '4 Full Stack Development',
    description: '(3:0:0) CIE733',
    link: 'https://drive.google.com/drive/folders/1IdqLJffstiIB4PyMpdzgkG-LghuWb8fM?usp=drive_link',
    otherlink: '/links',
    tag: '',
  },
  {
    title: 'MULTICORE ARCHITECTURE and PROGRAMMING Lab',
    description: '(0:0:1) CIL73',
    link: 'https://drive.google.com/drive/folders/10lOY-DJ7WfXh7zETRoLv9kkFRooaDmIs?usp=drive_link',
    github: '',
  },
  {
    title: 'Containerization Lab',
    description: '(0:0:1) CIL74',
    link: 'https://drive.google.com/drive/folders/1XeWhwFc96ik8bViUdaz0GssGZ1pFf9Yd?usp=sharing',
    github: 'https://github.com/githubhosting/Docker_Lab',
  },
  {
    title: 'Skill Lab: Generative AI',
    description: '(0:0:1) CIL75',
    link: 'https://drive.google.com/drive/folders/1Wi83kXCKzW3EaXSIv3-fLKwX7uDZSCRV?usp=sharing',
    github: 'https://github.com/githubhosting/GenAI_Lab',
    tag: '',
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
        <title>NoteRep | CSE (AI ML & CY) Notes</title>
        <meta
          name="description"
          content="NoteRep - Links to CSE(AI & ML) and Cyber Security Notes for 6th Semester"
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
            7th Sem Notes Links for CSE(AI & ML)
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
            {/* <Counter /> */}
            {/* <Calendar /> */}
            <GCalendar url="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FKolkata&bgcolor=%23ffffff&title=CSE(AI%26ML)%20Sem%207&mode=MONTH&showTz=0&showPrint=0&showTabs=0&showCalendars=0&src=7c29d7105d36a8aade5606de286abaa0d08d58f6061bb60f7473f149efb020d2%40group.calendar.google.com&color=%23039BE5" />
          </div>
        </Container>
        {/* <Timetable subjects={subjects7} /> */}
        <ContentNew drive={cseaimlsem7} sem="7th" links={links} />
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
