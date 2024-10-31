import { create } from 'zustand'
import { persist } from 'zustand/middleware' // 如果需要持久化存储

interface ImageState {
  images: string[]
  addImage: (url: string) => void
  removeImage: (url: string) => void
  clearImages: () => void
}

export const useImageStore = create<ImageState>()(
  // 使用 persist 中间件实现持久化存储（可选）
  persist(
    (set) => ({
      images: [],
      
      addImage: (url) => 
        set((state) => ({
          images: [...state.images, url]
        })),
      
      removeImage: (url) => 
        set((state) => ({
          images: state.images.filter((image) => image !== url)
        })),
      
      clearImages: () => 
        set({ images: [] }),
    }),
    {
      name: 'image-storage', // localStorage 的 key
    }
  )
) 