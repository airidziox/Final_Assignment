import { create } from 'zustand'

const useStore = create((set) => ({
    loggedUser: null,
    posts: [],
    error: null,
    singleUser: [],
    messages: [],
    favoritePosts: [],
    onlineUsers: [],
    updateLoggedUser: (loggedUser) => set({ loggedUser }),
    updateSingleUser: (singleUser) => set({ singleUser }),
    updateOnlineUsers: (onlineUsers) => set({ onlineUsers }),
    updateMessages: (messages) => set({ messages }),
    updateFavoritePosts: (favoritePosts) => set({ favoritePosts }),
    updatePosts: (posts) => set({ posts }),
    updateError: (error) => set({ error }),
}))

export default useStore;