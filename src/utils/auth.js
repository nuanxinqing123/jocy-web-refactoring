const isLogin = () => {
    return localStorage.getItem('token')
}
const getToken = () => {
    return localStorage.getItem('token')
}
const setToken = (token) => {
    localStorage.setItem('token', token)
}
const clearToken = () => {
    localStorage.removeItem('token')
}
export { isLogin, getToken, setToken, clearToken }