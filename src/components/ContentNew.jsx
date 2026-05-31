import { useId } from 'react'
import React, { useState, useEffect, useRef } from 'react'
import { Container } from '@/components/Container'
import { ButtonLink } from '@/components/Button'

export function ContentNew(props) {
  const drive = props.drive
  const links = props.links
  const sem = props.sem

  return (
    <section>
      <Container>
        <div className="mx-auto max-w-5xl sm:text-center">
          {links.curriculum ? (
            <div className="mt-10 flex items-center justify-center">
              <ButtonLink
                href={links.curriculum}
                className="hover:shadowpress rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 p-2"
              >
                {links.curriculumText || 'CSE (AI & ML) Curriculum'}
              </ButtonLink>
            </div>
          ) : null}
          {links.syllabus ? (
            <div className="flex justify-center">
              <ButtonLink
                target="_blank"
                href={links.syllabus}
                className="hover:shadowpress mt-6 w-auto rounded-lg bg-blue-50 py-2 shadow-lg dark:text-white dark:hover:text-blue-200"
              >
                Syllabus for CIE
              </ButtonLink>
            </div>
          ) : null}
          <div className="flex flex-col items-center justify-center gap-3 py-5 md:flex-row">
            {/* <ButtonLink
              href="/syllabus"
              className="mt-5 w-auto rounded-lg py-2 hover:bg-blue-900"
            >
              Updated Syllabus
            </ButtonLink> */}
            <ButtonLink
              href="noterepbot"
              className="mt-5 w-auto rounded-lg from-cyan-400 to-blue-500 py-1 after:bg-blue-700 dark:after:bg-gradient-to-r"
            >
              AI Bot 🤖
            </ButtonLink>
          </div>
          <div className="flex justify-center pt-2">
            <div className="group relative">
              <a
                href="/minisis"
                className="relative inline-block cursor-pointer rounded-xl bg-gray-800 p-px font-semibold leading-6 text-white shadow-2xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                <span className="relative z-10 block rounded-xl bg-gray-950 px-6 py-3">
                  <div className="relative z-10 flex items-center space-x-2">
                    <span className="transition-all duration-500 group-hover:translate-x-1">
                      Check Mini SIS
                    </span>
                    <svg
                      className="h-6 w-6 transition-transform duration-500 group-hover:translate-x-1"
                      data-slot="icon"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                        fillRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </span>
              </a>
            </div>
          </div>
        </div>
        <ul
          role="list"
          className={`mx-auto mt-8 grid gap-6 text-sm sm:mt-10 md:gap-y-10 lg:items-center ${
            drive.length === 1
              ? 'grid-cols-1 max-w-md'
              : drive.length === 2
              ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none'
          }`}
        >
          {drive
            .sort((a, b) => {
              if (a.archive === true && b.archive !== true) return 1;
              if (a.archive !== true && b.archive === true) return -1;
              return 0;
            })
            .map((item, index) => (
            <li
              key={index}
              className="rounded-xl bg-gradient-to-r from-green-300 via-blue-300 to-purple-600 p-0.5 shadow-lg transition hover:shadow-sm dark:shadow-5xl"
            >
              <div className="rounded-[10px] bg-white p-5 dark:bg-slate-900 sm:p-6">
                <h3 className="text-center text-base font-semibold uppercase text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-center text-base text-gray-700 dark:text-slate-400">
                  {item.description}
                </p>
                <div className="flex justify-center gap-3">
                  <a href={item.link} target="_blank">
                    <button className="mt-2 rounded-lg border bg-transparent px-4 py-2 font-semibold text-blue-700 shadow-lg shadow-blue-900/10 hover:border-transparent hover:bg-blue-900 hover:text-white dark:border-gray-500 dark:text-slate-100 dark:shadow-num_d0 hover:dark:text-white">
                      View
                    </button>
                  </a>
                  {item.otherlink && (
                    <a href={item.otherlink} target="_blank">
                      <button className="mt-2 rounded-lg border bg-transparent px-4 py-2 font-semibold text-blue-700 shadow-lg shadow-blue-900/10 hover:border-transparent hover:bg-blue-900 hover:text-white dark:border-gray-500 dark:text-slate-100 dark:shadow-num_d0">
                        Other links
                      </button>
                    </a>
                  )}
                  {item.classroom && (
                    <a href={item.classroom} target="_blank">
                      <button className="mt-2 rounded-lg border bg-transparent px-4 py-2 font-semibold text-blue-700 shadow-lg shadow-blue-900/10 hover:border-transparent hover:bg-blue-900 hover:text-white dark:border-gray-500 dark:text-slate-100 dark:shadow-num_d0">
                        Classroom Link
                      </button>
                    </a>
                  )}
                  {item.github && (
                    <a href={item.github} target="_blank">
                      <button className="mt-2 rounded-lg border bg-transparent px-4 py-2 font-semibold text-blue-700 shadow-lg shadow-blue-900/10 hover:border-transparent hover:bg-blue-900 hover:text-white dark:border-gray-500 dark:text-slate-100 dark:shadow-num_d0">
                        Github Repo
                      </button>
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap justify-center">
                  {item.other && (
                    <a href={item.github} target="_blank">
                      <button className="mt-2 rounded-lg border bg-transparent px-4 py-2 font-semibold text-blue-700 shadow-lg shadow-blue-900/10 hover:border-transparent hover:bg-blue-900 hover:text-white dark:border-gray-500 dark:text-slate-100 dark:shadow-num_d0">
                        New Repo
                      </button>
                    </a>
                  )}
                </div>
                {item.tag && (
                  <div className="mt-4 flex flex-wrap justify-center gap-1">
                    <span className="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600 dark:bg-purple-900 dark:text-indigo-50">
                      {item.tag}
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
