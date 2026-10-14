import { useId } from 'react'
import React, { useState, useEffect, useRef } from 'react'
import { Container } from '@/components/Container'
import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'
import { Button } from './Button'
import { query, orderBy, limit, documentId } from 'firebase/firestore'
import { Dialog } from '@headlessui/react'
import { firebaseConfig } from '@/firebaseconfig'

firebase.initializeApp(firebaseConfig)
const database = firebase.firestore()

function ContributeModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [links, setLinks] = useState([{ url: '', description: '' }])
  const [submitError, setSubmitError] = useState(null)

  const handleAddLink = () => {
    setLinks([...links, { url: '', description: '' }])
  }

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setLinks(newLinks)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    if (!title.trim() || !description.trim()) {
      setSubmitError('Title and description are required')
      return
    }

    if (
      title.trim().toLowerCase() === 'q' ||
      title.trim().toLowerCase() === 'test'
    ) {
      setSubmitError('Please enter a valid, descriptive title')
      return
    }

    const validLinks = links.filter(
      (link) => link.url.trim() && link.description.trim()
    )
    if (validLinks.length === 0) {
      setSubmitError('At least one valid link is required')
      return
    }

    try {
      await onSubmit({
        title,
        description,
        links: validLinks,
        createdate: firebase.firestore.FieldValue.serverTimestamp(),
      })
      setTitle('')
      setDescription('')
      setLinks([{ url: '', description: '' }])
      onClose()
    } catch (error) {
      setSubmitError(error.message)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800">
          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
            Contribute Links
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-4">
                {links.map((link, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Link {index + 1}
                    </label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) =>
                        handleLinkChange(index, 'url', e.target.value)
                      }
                      placeholder="URL"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    />
                    <input
                      type="text"
                      value={link.description}
                      onChange={(e) =>
                        handleLinkChange(index, 'description', e.target.value)
                      }
                      placeholder="Link Description"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-900 dark:text-blue-100"
              >
                Add Another Link
              </button>
              {submitError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              )}
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-800"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export function LinksComponent() {
  const [cseaiml, setCseaiml] = useState([])
  const [otherlinks, setOtherlinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await database
          .collection('otherlinks')
          .orderBy('createdate', 'desc')
          .get()
        console.log(response)
        const data = response.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (item) =>
              item.title &&
              item.title.trim().toLowerCase() !== 'q' &&
              item.title.trim().toLowerCase() !== 'test'
          )
        setOtherlinks(data)
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  return (
    <section className="bg-indigo-50 dark:bg-gray-900">
      <Container>
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-center text-2xl font-medium tracking-tight text-gray-900 dark:text-indigo-50">
            Shared Links
          </h2>
          <p className="mt-2 text-center text-lg text-gray-500 dark:text-white">
            Youtube videos and other website links to related to Respective
            Subjects
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-6 text-sm sm:mt-10 sm:grid-cols-2 md:gap-y-10 lg:max-w-none lg:items-center"
        >
          {otherlinks.map((item) => (
            <li key={item.id} className="relative h-full">
              <div className="flex h-full flex-col rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 dark:shadow-num_d">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-white/80">
                    {item.description}
                  </p>
                </div>
                <div className="flex-grow">
                  {item.links?.map((link, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <p className="line-clamp-2 text-sm dark:text-white/90">
                        {link.description}
                      </p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm font-medium text-blue-800 hover:text-indigo-500 dark:text-blue-600"
                      >
                        {String(link.url).length > 35
                          ? String(link.url).substring(0, 35) + '...'
                          : String(link.url)}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="py-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 rounded-md border-2 border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 shadow-lg shadow-blue-900/10 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-blue-100 dark:text-white"
          >
            Contribute Links
          </button>
        </div>
        <ContributeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            try {
              await database.collection('otherlinks').add(data)
              const response = await database
                .collection('otherlinks')
                .orderBy('createdate', 'desc')
                .get()
              const newData = response.docs
                .map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))
                .filter(
                  (item) =>
                    item.title &&
                    item.title.trim().toLowerCase() !== 'q' &&
                    item.title.trim().toLowerCase() !== 'test'
                )
              setOtherlinks(newData)
            } catch (err) {
              console.error('Error submitting links:', err)
              throw err
            }
          }}
        />
      </Container>
    </section>
  )
}
