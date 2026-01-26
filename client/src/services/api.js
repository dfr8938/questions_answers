import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true // Добавляем для работы с cookies
})


// Добавляем перехватчик запросов для установки токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


// Перехватчик для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message || error)
    return Promise.reject(error)
  }
)


export default api