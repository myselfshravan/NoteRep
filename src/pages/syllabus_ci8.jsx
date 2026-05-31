import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Footer } from '@/components/Footer'
import { HeaderMod } from '@/components/HeaderMod'
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp'
import { Container } from '@/components/Container'
import { ButtonLink } from '@/components/Button1'

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

  return (
    <>
      <Head>
        <title>Syllabus for CSE (AI & ML) 8th Sem</title>
        <meta
          name="description"
          content="NoteRep - 8th Sem Syllabus Copy for CSE (AI & ML) Non-Credit Mandatory Course (NCME)"
        />
      </Head>
      <HeaderMod />
      <main>
        <section
          id="Syllabus"
          aria-labelledby="introduction-title"
          className="bg-indigo-50 pb-0 pt-5 dark:bg-cost5 sm:pb-0 md:pt-8 lg:pt-5"
        >
          <Container>
            <h1 className="text-center font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              8th Sem Syllabus for CSE (AI & ML)
            </h1>
            <div className="flex justify-center pt-10">
              <ButtonLink
                href="/documents/8th_SEM_Syllabus_NCME.pdf"
                rel="noreferrer"
                target="_blank"
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                Click here to Download
              </ButtonLink>
            </div>
            <div className="flex justify-center">
              <iframe
                src="/documents/8th_SEM_Syllabus_NCME.pdf"
                height="1024"
                frameBorder="0"
                marginHeight="0"
                marginWidth="0"
                className="mt-10 w-full max-w-3xl rounded-md lg:rounded-xl"
              ></iframe>
            </div>
          </Container>
        </section>
      </main>
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
