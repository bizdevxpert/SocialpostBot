import { useState, useEffect } from 'react'
import { useSchedulerStore } from '../stores/schedulerStore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const Scheduler = () => {
  const [content, setContent] = useState('')
  const [platform, setPlatform] = useState('twitter')
  const [scheduledTime, setScheduledTime] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [filter, setFilter] = useState('all')
  
  const { 
    scheduledPosts, 
    fetchScheduledPosts, 
    schedulePost, 
    updatePostStatus, 
    deleteScheduledPost,
    isLoading,
    error
  } = useSchedulerStore()
  
  useEffect(() => {
    fetchScheduledPosts()
  }, [])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content) {
      toast.error('Please enter post content')
      return
    }
    
    if (!scheduledTime) {
      toast.error('Please select a scheduled time')
      return
    }
    
    try {
      const mediaUrls = mediaUrl ? [mediaUrl] : []
      
      await schedulePost({
        content,
        platform,
        scheduledTime: new Date(scheduledTime).toISOString(),
        mediaUrls
      })
      
      toast.success('Post scheduled successfully!')
      setContent('')
      setMediaUrl('')
      // Keep the platform and time for convenience when scheduling multiple posts
    } catch (error) {
      toast.error('Failed to schedule post')
    }
  }
  
  const handleStatusUpdate = async (id, status) => {
    try {
      await updatePostStatus(id, status)
      toast.success(`Post marked as ${status}`)
    } catch (error) {
      toast.error('Failed to update post status')
    }
  }
  
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this scheduled post?')) {
      try {
        await deleteScheduledPost(id)
        toast.success('Post deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete post')
      }
    }
  }
  
  const filteredPosts = scheduledPosts.filter(post => {
    if (filter === 'all') return true
    return post.status === filter
  })
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Post Scheduler</h1>
        <p className="mt-1 text-sm text-gray-500">
          Schedule posts for your social media platforms
        </p>
      </div>
      
      {/* Schedule Form */}
      <div className="card mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Post</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
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
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Post Content
                </label>
                <div className="mt-1">
                  <textarea
                    id="content"
                    name="content"
                    rows={4}
                    className="input"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={platform === 'twitter' ? 280 : 2000}
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {platform === 'twitter' ? `${content.length}/280 characters` : `${content.length} characters`}
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
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700">
                  Media URL (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="mediaUrl"
                    id="mediaUrl"
                    className="input"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              {mediaUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <img
                    src={mediaUrl}
                    alt="Media preview"
                    className="h-32 w-auto object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://via.placeholder.com/150?text=Image+Error'
                    }}
                  />
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Scheduling...' : 'Schedule Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Scheduled Posts */}
      <div className="card">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Scheduled Posts</h3>
            <div>
              <select
                id="filter"
                name="filter"
                className="input py-1 px-2 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Posts</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading scheduled posts</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.platform === 'twitter' ? 'bg-blue-100 text-blue-800' :
                          post.platform === 'facebook' ? 'bg-indigo-100 text-indigo-800' :
                          post.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                          post.platform === 'linkedin' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {post.content}
                        </div>
                        {post.media_urls && post.media_urls.length > 0 && (
                          <div className="mt-1">
                            <img
                              src={post.media_urls[0]}
                              alt="Media"
                              className="h-10 w-10 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(post.scheduled_time), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          post.status === 'completed' ? 'bg-green-100 text-green-800' :
                          post.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {post.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="text-green-600 hover:text-green-900 mr-4"
                              onClick={() => handleStatusUpdate(post.id, 'completed')}
                            >
                              Mark Complete
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-900 mr-4"
                              onClick={() => handleStatusUpdate(post.id, 'failed')}
                            >
                              Mark Failed
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(post.id)}
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
              <p className="text-sm text-gray-500">No scheduled posts found</p>
              {filter !== 'all' && (
                <p className="text-sm text-gray-500 mt-1">
                  Try changing the filter or create a new post
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Scheduler
