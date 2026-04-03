import { BASE_URL } from './config'

const TOKEN_KEY = 'token'

function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

function setToken(token) {
  uni.setStorageSync(TOKEN_KEY, token)
}

function removeToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const method = options.method || 'GET'
    const token = getToken()

    const header = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    const data = method === 'GET' ? undefined : (options.body || {})

    uni.request({
      url: BASE_URL + url,
      method,
      header,
      data,
      success: (res) => {
        if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.removeStorageSync('phone')
          const pages = getCurrentPages()
          const currentRoute = pages.length ? pages[pages.length - 1].route : ''
          if (!currentRoute.includes('login')) {
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/login/index' })
            }, 1500)
          }
          reject({ message: '登录已过期' })
        } else if (res.statusCode >= 400) {
          reject(res.data || '请求失败')
        } else {
          resolve(res.data)
        }
      },
      fail: (err) => {
        reject(err || '网络错误')
      }
    })
  })
}

export { request }

export const api = {
  register(data) {
    return request('/auth/register', {
      method: 'POST',
      body: data
    })
  },
  login(data) {
    // x-www-form-urlencoded 格式
    const formData = {}
    formData.username = data.username
    formData.password = data.password
    return request('/auth/login', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
  getMyOrders() {
    return request('/orders/me', { method: 'GET' })
  },
  getOrderDeliveries(orderId) {
    return request(`/orders/${orderId}/deliveries`, { method: 'GET' })
  },
  getOrderUpdates(orderId) {
    return request(`/orders/${orderId}/updates`, { method: 'GET' })
  }
}

export { setToken, removeToken }
