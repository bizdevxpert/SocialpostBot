import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useScraperStore = create((set, get) => ({
  scrapedData: [],
  savedScrapes: [],
  isLoading: false,
  error: null,
  
  fetchSavedScrapes: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('scrapes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      set({ savedScrapes: data || [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  saveScrape: async (scrapeData) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('scrapes')
        .insert([{
          url: scrapeData.url,
          title: scrapeData.title,
          content: scrapeData.content,
          images: scrapeData.images,
        }])
        .select()
      
      if (error) throw error
      
      const updatedScrapes = [data[0], ...get().savedScrapes]
      set({ 
        savedScrapes: updatedScrapes,
        isLoading: false 
      })
      return data[0]
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },
  
  deleteScrape: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase
        .from('scrapes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set({ 
        savedScrapes: get().savedScrapes.filter(scrape => scrape.id !== id),
        isLoading: false 
      })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  setScrapedData: (data) => set({ scrapedData: data }),
  clearScrapedData: () => set({ scrapedData: [] }),
}))
