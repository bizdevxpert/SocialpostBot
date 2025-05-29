import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import AuthLayout from './layouts/AuthLayout'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Scraper from './pages/Scraper'
import Scheduler from './pages/Scheduler'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { useAuthStore } from './stores/authStore'

function App() {
  const { user, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
      }
      setIsLoading(false)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scraper" element={<Scraper />} />
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Redirect to login if not authenticated */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
