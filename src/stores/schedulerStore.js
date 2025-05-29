import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useSchedulerStore = create((set, get) => ({
  scheduledPosts: [],
  isLoading: false,
  error: null,
  
  fetchScheduledPosts: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .order('scheduled_time', { ascending: true })
      
      if (error) throw error
      set({ scheduledPosts: data || [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  schedulePost: async (postData) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert([{
          content: postData.content,
          platform: postData.platform,
          scheduled_time: postData.scheduledTime,
          media_urls: postData.mediaUrls || [],
          status: 'pending'
        }])
        .select()
      
      if (error) throw error
      
      const updatedPosts = [...get().scheduledPosts, data[0]]
        .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
      
      set({ 
        scheduledPosts: updatedPosts,
        isLoading: false 
      })
      return data[0]
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },
  
  updatePostStatus: async (id, status) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update({ status })
        .eq('id', id)
        .select()
      
      if (error) throw error
      
      set({ 
        scheduledPosts: get().scheduledPosts.map(post => 
          post.id === id ? { ...post, status } : post
        ),
        isLoading: false 
      })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  deleteScheduledPost: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set({ 
        scheduledPosts: get().scheduledPosts.filter(post => post.id !== id),
        isLoading: false 
      })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
}))
