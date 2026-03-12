import { request } from '@/request.js'

// 获取所有认养对象（公开）
export function getPlazaTargets() {
  return request('/plaza/targets', { method: 'GET' })
}

// 获取单个认养对象详情（公开，带最新更新）
export function getPlazaTargetDetail(targetId) {
  return request(`/plaza/targets/${targetId}`, { method: 'GET' })
}
