// Non-sensitive flag: the JWT itself lives in an httpOnly cookie, so JS cannot
// read it. This flag only tells the app whether it is worth asking /users/me.
const SESSION_KEY = 'bloggy:hasSession'

export const hasSession = () => localStorage.getItem(SESSION_KEY) === '1'
export const setSession = () => localStorage.setItem(SESSION_KEY, '1')
export const clearSession = () => localStorage.removeItem(SESSION_KEY)
