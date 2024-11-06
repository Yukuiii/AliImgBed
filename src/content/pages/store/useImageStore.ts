import { create } from 'zustand'

interface ImageState {
  images: string[]
  addImage: (url: string) => void
  removeImage: (url: string) => void
  clearImages: () => void
  initImages: (images: string[]) => void
}

export const useImageStore = create<ImageState>()((set) => ({
  images: [],
  
  initImages: (images) => 
    set({ images }),
    
  addImage: (url) => {
    set((state) => {
      const newImages = [...state.images, url];
      // 同步到 chrome.storage
      chrome.storage.local.set({ images: newImages });
      return { images: newImages };
    });
  },
  
  removeImage: (url) => 
    set((state) => {
      const newImages = state.images.filter((image) => image !== url);
      // 同步到 chrome.storage
      chrome.storage.local.set({ images: newImages });
      return { images: newImages };
    }),
  
  clearImages: () => {
    // 清空 chrome.storage
    chrome.storage.local.set({ images: [] });
    set({ images: [] });
  },
}));

// 初始化时从 chrome.storage 加载数据
chrome.storage.local.get(['images'], (result) => {
  if (result.images) {
    useImageStore.getState().initImages(result.images);
  }
}); 