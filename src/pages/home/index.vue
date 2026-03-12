<template>
  <view class="container">
    <view v-if="loading" style="text-align: center; margin-top: 120px; color: #999;">
      加载中...
    </view>

    <view v-else>
      <view v-if="orders.length === 0" style="text-align: center; margin-top: 120px; color: #999;">
        <view style="font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 16rpx;">还没有认养记录</view>
        <view style="font-size: 28rpx; margin-bottom: 40rpx;">去广场看看，找一棵属于你的茶树</view>
        <button class="btn-primary" @click="goPlaza">去广场</button>
      </view>

      <view v-else>
        <view class="card" v-for="(order, idx) in orders" :key="order.id" @click="goDetail(order.id)" style="cursor: pointer;">
          <view style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx;">
            <view style="font-size: 32rpx; font-weight: bold;">
              {{ order.target_name || `我的第${idx+1}份山南` }}
            </view>
            <view :style="statusStyle(order.status)" style="font-size: 24rpx; padding: 8rpx 16rpx; border-radius: 999rpx;">
              {{ statusText(order.status) }}
            </view>
          </view>

          <view style="font-size: 28rpx; color: #666; margin-bottom: 8rpx;">
            认养方式：{{ planTypeText(order.plan_type) }}
          </view>
          <view style="font-size: 28rpx; color: #666; margin-bottom: 8rpx;">
            陪伴周期：{{ formatDate(order.start_date) }} 至 {{ formatDate(order.expire_date) }}
          </view>
          <view style="font-size: 28rpx; color: #666; margin-bottom: 8rpx;">
            已付：¥{{ order.price }}
          </view>
          <view style="font-size: 24rpx; color: #999; margin-top: 12rpx;">
            加入时间：{{ formatDate(order.created_at) }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMyOrders } from '@/api/orders.js'

export default {
  data() {
    return {
      orders: [],
      loading: false
    }
  },
  onLoad() {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.redirectTo({ url: '/pages/plaza/index' })
      return
    }
    this.loadOrders()
  },
  onShow() {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.redirectTo({ url: '/pages/plaza/index' })
      return
    }
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      this.loading = true
      uni.showLoading({ title: '加载中...', mask: true })
      try {
        const data = await getMyOrders()
        this.orders = (data || []).map(order => ({
          ...order,
          target_name: order.target_name || null
        }))
        uni.hideLoading()
      } catch (e) {
        uni.hideLoading()
        console.error('加载订单失败:', e)
        uni.showToast({ title: '加载失败，请重试', icon: 'none' })
        this.orders = []
      } finally {
        this.loading = false
      }
    },
    goDetail(id) {
      uni.navigateTo({ url: `/pages/order/detail?order_id=${id}` })
    },
    goPlaza() {
      uni.switchTab({ url: '/pages/plaza/index' })
    },
    statusText(s) {
      const map = { active: '生效中', expired: '已过期', cancelled: '已取消' }
      return map[s] || s
    },
    statusStyle(s) {
      const base = { borderRadius: '999rpx', padding: '8rpx 16rpx', fontSize: '24rpx' }
      if (s === 'active') return { ...base, backgroundColor: '#e8f5e9', color: '#2d5a27' }
      if (s === 'expired') return { ...base, backgroundColor: '#f0f0f0', color: '#999' }
      return { ...base, backgroundColor: '#fdeaea', color: '#c0392b' }
    },
    planTypeText(p) {
      const map = { season: '季度套餐', annual: '年度套餐', trial: '体验套餐' }
      return map[p] || p
    },
    formatDate(val) {
      if (!val) return ''
      if (typeof val === 'string') return val.replace('T', ' ').substring(0, 19)
      return val
    }
  }
}
</script>

<style scoped>
.container { padding: 32px; min-height: 100vh; box-sizing: border-box; }
.card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.btn-primary {
  background-color: #2d5a27; color: #fff; border: none;
  border-radius: 999rpx; padding: 24rpx 80rpx; font-size: 32rpx; width: 100%;
}
.btn-primary:active { opacity: 0.8; }
</style>
