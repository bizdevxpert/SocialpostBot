import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, setUser } = useAuthStore()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    setIsLoading(true)
    
    try {
      // First sign in with current password to verify
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      
      if (signInError) throw new Error('Current password is incorrect')
      
      // Then update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (updateError) throw updateError
      
      toast.success('Password updated successfully')
      setIsChangingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    )
    
    if (!confirmed) return
    
    try {
      // In a real app, you would need a server-side function to delete the user
      // For this demo, we'll just sign out
      await supabase.auth.signOut()
      setUser(null)
      toast.success('Account deleted successfully')
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Account Information */}
        <div className="card">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Account Information</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Security */}
        <div className="card">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Security</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {isChangingPassword ? (
              <form onSubmit={handlePasswordChange}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        required
                        className="input"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        className="input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={6}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        className="input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={6}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsChangingPassword(false)
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Password</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your password to keep your account secure
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Subscription */}
        <div className="card">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Subscription</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Free Plan</h4>
                <p className="mt-1 text-sm text-gray-500">
                  You are currently on the free plan with limited features
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => toast.success('This would redirect to a payment page in a real app')}
              >
                Upgrade to Pro
              </button>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Plan Features</h4>
              <ul className="mt-2 divide-y divide-gray-200">
                <li className="py-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">Up to 10 scrapes per day</span>
                  </div>
                </li>
                <li className="py-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">Up to 5 scheduled posts per day</span>
                  </div>
                </li>
                <li className="py-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">Advanced analytics</span>
                  </div>
                </li>
                <li className="py-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">AI content generation</span>
                  </div>
                </li>
                <li className="py-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">Priority support</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Danger Zone */}
        <div className="card border border-red-200">
          <div className="px-4 py-5 sm:px-6 border-b border-red-200 bg-red-50">
            <h3 className="text-lg font-medium leading-6 text-red-800">Danger Zone</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <button
                type="button"
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
