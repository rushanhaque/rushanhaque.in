import { createContext, useContext } from 'react'

export const AppContext = createContext({ ready: false })
export const useApp = () => useContext(AppContext)
