import { createContext } from "react"

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthContextValue {
  readonly user: User | null
  readonly isLoggedIn: boolean
  readonly isLoggingIn: boolean
  readonly isLoggingOut: boolean
  logIn(): Promise<void>
  logOut(): Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  isLoggingIn: false,
  isLoggingOut: false,
  async logIn() {},
  async logOut() {},
})

export default AuthContext
