import { createContext } from "react"

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthContextValue {
  readonly lastEmail: string
  readonly token: string
  readonly user: User | null
  readonly isLoggedIn: boolean
  readonly isLoggingIn: boolean
  readonly isLoggingOut: boolean
  logIn(email: string): Promise<void>
  logOut(): Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  lastEmail: "",
  token: "",
  user: null,
  isLoggedIn: false,
  isLoggingIn: false,
  isLoggingOut: false,
  async logIn(email: string) {},
  async logOut() {},
})

export default AuthContext
