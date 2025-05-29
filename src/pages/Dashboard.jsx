import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useScraperStore } from '../stores/scraperStore'
import { useSchedulerStore } from '../stores/schedulerStore'
import { format } from 'date-fns'
import { 
  DocumentDuplicateIcon, 
  CalendarIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { savedScrapes, fetchSavedScrapes } = useScraperStore()
  const { scheduledPosts, fetchScheduledPosts } = useSchedulerStore()
  const [stats, setStats] = useState({
    totalScrapes: 0,
    totalScheduled: 0,
    pendingPosts: 0,
    completedPosts: 0
  })

  useEffect(() => {
    fetchSavedScrapes()
    fetchScheduledPosts()
  }, [])

  useEffect(() => {
    setStats({
      totalScrapes: savedScrapes.length,
      totalScheduled: scheduledPosts.length,
      pendingPosts: scheduledPosts.filter(post => post.status === 'pending').length,
      completedPosts: scheduledPosts.filter(post => post.status === 'completed').length
    })
  }, [savedScrapes, scheduledPosts])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your scraping and scheduling activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentDuplicateIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Scrapes</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalScrapes}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/scraper" className="font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Scheduled Posts</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalScheduled}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/scheduler" className="font-medium text-primary-600 hover:text-primary-500">
                View all
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Posts</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.pendingPosts}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/scheduler" className="font-medium text-primary-600 hover:text-primary-500">
                View pending
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Posts</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.completedPosts}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/scheduler" className="font-medium text-primary-600 hover:text-primary-500">
                View completed
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Scrapes */}
        <div className="card">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Scrapes</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {savedScrapes.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {savedScrapes.slice(0, 5).map((scrape) => (
                  <li key={scrape.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {scrape.title || 'Untitled Scrape'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {scrape.url}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(scrape.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No scrapes yet</p>
                <Link to="/scraper" className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                  Create your first scrape
                </Link>
              </div>
            )}
          </div>
          {savedScrapes.length > 5 && (
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <Link to="/scraper" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all scrapes
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Posts */}
        <div className="card">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Posts</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {scheduledPosts.filter(post => post.status === 'pending').length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {scheduledPosts
                  .filter(post => post.status === 'pending')
                  .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
                  .slice(0, 5)
                  .map((post) => (
                    <li key={post.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.platform === 'twitter' ? 'bg-blue-100 text-blue-800' :
                            post.platform === 'facebook' ? 'bg-indigo-100 text-indigo-800' :
                            post.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                            post.platform === 'linkedin' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            {post.content.length > 60 ? post.content.substring(0, 60) + '...' : post.content}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(post.scheduled_time), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No upcoming posts</p>
                <Link to="/scheduler" className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
                  Schedule a post
                </Link>
              </div>
            )}
          </div>
          {scheduledPosts.filter(post => post.status === 'pending').length > 5 && (
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <Link to="/scheduler" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all scheduled posts
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
