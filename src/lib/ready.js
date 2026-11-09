import { createContext, useContext } from 'react'

// true once the loader has gone and the room is ready to be seen
export const ReadyContext = createContext(false)
export const useReady = () => useContext(ReadyContext)
