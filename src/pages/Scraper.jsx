import { useState, useEffect } from 'react'
import { useScraperStore } from '../stores/scraperStore'
import { useSchedulerStore } from '../stores/schedulerStore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import axios from 'axios'
import * as cheerio from 'cheerio'

const Scraper = () => {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [scrapedContent, setScrapedContent] = useState(null)
  const [selectedContent, setSelectedContent] = useState({
    title: '',
    content: '',
    images: []
  })
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduledTime, setScheduledTime] = useState('')
  const [platform, setPlatform] = useState('twitter')
  const [postContent, setPostContent] = useState('')
  
  const { savedScrapes, saveScrape, fetchSavedScrapes, deleteScrape } = useScraperStore()
  const { schedulePost } = useSchedulerStore()
  
  useEffect(() => {
    fetchSavedScrapes()
  }, [])
  
  const handleScrape = async (e) => {
    e.preventDefault()
    
    if (!url) {
      toast.error('Please enter a URL')
      return
    }
    
    setIsLoading(true)
    setScrapedContent(null)
    
    try {
      // Client-side scraping using a CORS proxy
      const corsProxy = 'https://corsproxy.io/?'
      const response = await axios.get(`${corsProxy}${encodeURIComponent(url)}`)
      const html = response.data
      const $ = cheerio.load(html)
      
      // Extract title
      const title = $('title').text()
      
      // Extract main content
      let content = ''
      $('p').each((i, el) => {
        const text = $(el).text().trim()
        if (text.length > 50) { // Only include paragraphs with substantial content
          content += text + '\n\n'
        }
      })
      
      // Extract images
      const images = []
      $('img').each((i, el) => {
        const src = $(el).attr('src')
        if (src && src.startsWith('http') && !src.includes('logo') && !src.includes('icon')) {
          images.push(src)
        }
      })
      
      const scrapedData = {
        title,
        content: content.substring(0, 2000), // Limit content length
        images: images.slice(0, 10) // Limit number of images
      }
      
      setScrapedContent(scrapedData)
      setSelectedContent(scrapedData)
      toast.success('Content scraped successfully!')
    } catch (error) {
      console.error('Scraping error:', error)
      toast.error('Failed to scrape content. Please check the URL and try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSave = async () => {
    if (!selectedContent.title && !selectedContent.content) {
      toast.error('No content to save')
      return
    }
    
    try {
      await saveScrape({
        url,
        ...selectedContent
      })
      toast.success('Content saved successfully!')
      setScrapedContent(null)
      setUrl('')
    } catch (error) {
      toast.error('Failed to save content')
    }
  }
  
  const handleSchedule = () => {
    if (!selectedContent.content) {
      toast.error('No content to schedule')
      return
    }
    
    setPostContent(selectedContent.content.substring(0, 280)) // Default to first 280 chars for Twitter
    setShowScheduleModal(true)
  }
  
  const handleSubmitSchedule = async () => {
    if (!postContent) {
      toast.error('Please enter post content')
      return
    }
    
    if (!scheduledTime) {
      toast.error('Please select a scheduled time')
      return
    }
    
    try {
      const mediaUrls = selectedContent.images.length > 0 ? [selectedContent.images[0]] : []
      
      await schedulePost({
        content: postContent,
        platform,
        scheduledTime: new Date(scheduledTime).toISOString(),
        mediaUrls
      })
      
      toast.success('Post scheduled successfully!')
      setShowScheduleModal(false)
    } catch (error) {
      toast.error('Failed to schedule post')
    }
  }
  
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this scrape?')) {
      try {
        await deleteScrape(id)
        toast.success('Scrape deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete scrape')
      }
    }
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Web Scraper</h1>
        <p className="mt-1 text-sm text-gray-500">
          Extract content from websites and save it for later use
        </p>
      </div>
      
      {/* Scrape Form */}
      <div className="card mb-8">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleScrape}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="url" className="sr-only">
                  URL
                </label>
                <input
                  type="url"
                  name="url"
                  id="url"
                  className="input"
                  placeholder="Enter website URL to scrape"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scraping...
                  </span>
                ) : (
                  'Scrape Content'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Scraped Content */}
      {scrapedContent && (
        <div className="card mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Scraped Content</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review and edit the extracted content before saving
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="input"
                    value={selectedContent.title}
                    onChange={(e) => setSelectedContent({...selectedContent, title: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <div className="mt-1">
                  <textarea
                    id="content"
                    name="content"
                    rows={6}
                    className="input"
                    value={selectedContent.content}
                    onChange={(e) => setSelectedContent({...selectedContent, content: e.target.value})}
                  />
                </div>
              </div>
              
              {selectedContent.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images ({selectedContent.images.length})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedContent.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Scraped image ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://via.placeholder.com/150?text=Image+Error'
                          }}
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const updatedImages = [...selectedContent.images]
                            updatedImages.splice(index, 1)
                            setSelectedContent({...selectedContent, images: updatedImages})
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setScrapedContent(null)
                    setUrl('')
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSchedule}
                >
                  Schedule Post
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  Save Content
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Saved Scrapes */}
      <div className="card">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Saved Scrapes</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {savedScrapes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {savedScrapes.map((scrape) => (
                    <tr key={scrape.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {scrape.title || 'Untitled Scrape'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {scrape.url}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(scrape.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          type="button"
                          className="text-primary-600 hover:text-primary-900 mr-4"
                          onClick={() => {
                            setSelectedContent({
                              title: scrape.title,
                              content: scrape.content,
                              images: scrape.images || []
                            })
                            setUrl(scrape.url)
                            setScrapedContent({
                              title: scrape.title,
                              content: scrape.content,
                              images: scrape.images || []
                            })
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(scrape.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No saved scrapes yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Enter a URL above to start scraping content
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowScheduleModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Schedule Post
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
                        Platform
                      </label>
                      <select
                        id="platform"
                        name="platform"
                        className="mt-1 input"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                      >
                        <option value="twitter">Twitter</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="postContent" className="block text-sm font-medium text-gray-700">
                        Post Content
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="postContent"
                          name="postContent"
                          rows={4}
                          className="input"
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          maxLength={platform === 'twitter' ? 280 : 2000}
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {platform === 'twitter' ? `${postContent.length}/280 characters` : `${postContent.length} characters`}
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">
                        Scheduled Time
                      </label>
                      <div className="mt-1">
                        <input
                          type="datetime-local"
                          name="scheduledTime"
                          id="scheduledTime"
                          className="input"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    </div>
                    
                    {selectedContent.images.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attached Image
                        </label>
                        <img
                          src={selectedContent.images[0]}
                          alt="Attached image"
                          className="h-32 w-auto object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://via.placeholder.com/150?text=Image+Error'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                  onClick={handleSubmitSchedule}
                >
                  Schedule
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Scraper
