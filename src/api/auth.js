import { request } from '@/request.js'

export function login(phone, password) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${phone}&password=${password}`
  })
}

export function register(phone, password, nickname) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, password, nickname })
  })
}
