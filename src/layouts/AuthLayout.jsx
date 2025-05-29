import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const AuthLayout = () => {
  const { user } = useAuthStore()
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/src/assets/logo.svg"
          alt="ScrapePoster"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ScrapePoster
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Web Scraping & Social Media Scheduler
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
