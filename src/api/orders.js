import { request } from '@/request.js'

export const getMyOrders = () => request('/orders/me')
export const getOrderUpdates = (id) => request(`/orders/${id}/updates`)
export const getOrderDeliveries = (id) => request(`/orders/${id}/deliveries`)
