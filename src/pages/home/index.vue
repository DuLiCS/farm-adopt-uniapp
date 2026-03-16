<template>
 <view class="container">

 <!-- 顶部用户信息 -->
 <view class="profile-header">
 <view class="profile-bg"></view>
 <view class="profile-info">
 <view class="avatar">🌿</view>
 <view class="user-detail">
 <view class="user-phone">{{ maskedPhone }}</view>
 <view class="user-stats">已守候 {{ orders.length }} 份山南</view>
 </view>
 </view>
 </view>

 <!-- 加载中 -->
 <view v-if="loading" class="empty-state">加载中...</view>

 <!-- 空状态 -->
 <view v-else-if="orders.length === 0" class="empty-state">
 <view class="empty-icon">🍃</view>
 <view class="empty-title">还没有认养记录</view>
 <view class="empty-sub">去广场找一棵属于你的茶树</view>
 <button class="btn-primary" @click="goPlaza">去广场</button>
 </view>

 <!-- 认养列表 -->
 <view v-else class="order-list">
 <view class="section-title">我的守候</view>
 <view class="order-card" v-for="(order, idx) in orders" :key="order.id" @click="goDetail(order.id)">
 <!-- 封面图 -->
 <view class="card-cover">
 <image v-if="order.target && order.target.cover_image"
 :src="getImageUrl(order.target.cover_image)"
 mode="aspectFill" class="cover-img" lazy-load />
 <view v-else class="cover-placeholder">
 <text class="cover-emoji">{{ order.target && order.target.type === 'tea' ? '🍃' : '🌿' }}</text>
 </view>
 <view class="status-badge" :class="order.status">{{ statusText(order.status) }}</view>
 </view>

 <!-- 卡片信息 -->
 <view class="card-body">
 <view class="card-name">{{ order.target && order.target.name || `我的第${idx+1}份山南` }}</view>
 <view class="card-plan">{{ planTypeText(order.plan_type) }}</view>

 <!-- 进度条 -->
 <view class="progress-wrap">
 <view class="progress-bar">
 <view class="progress-fill" :style="{ width: progressPercent(order) + '%' }"></view>
 </view>
 <view class="progress-text">第{{ adoptDays(order) }}天 / 共{{ totalDays(order) }}天</view>
 </view>

 <view class="card-expire">到期：{{ formatDate(order.expire_date) }}</view>
 </view>
 </view>
 </view>

 <!-- 底部设置 -->
 <view class="settings-section">
 <view class="settings-item" @click="handleLogout">
 <text>退出登录</text>
 <text class="arrow">›</text>
 </view>
 </view>

 </view>
</template>

<script>
import { getMyOrders } from '@/api/orders.js'
import { SERVER_URL } from '@/config.js'

export default {
 data() {
 return {
 orders: [],
 loading: false,
 phone: ''
 }
 },

 computed: {
 maskedPhone() {
 if (!this.phone) return '未登录'
 return this.phone.substring(0, 3) + '****' + this.phone.substring(7)
 }
 },

 onLoad() {
 const token = uni.getStorageSync('token')
 if (!token) {
 uni.redirectTo({ url: '/pages/plaza/index' })
 return
 }
 this.phone = uni.getStorageSync('phone') || ''
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
 try {
 const data = await getMyOrders()
 this.orders = data || []
 } catch (e) {
 uni.showToast({ title: '加载失败', icon: 'none' })
 this.orders = []
 } finally {
 this.loading = false
 }
 },

 getImageUrl(path) {
 if (!path) return ''
 if (path.startsWith('http')) return path
 return SERVER_URL + path
 },

 goDetail(id) {
 uni.navigateTo({ url: `/pages/order/detail?order_id=${id}` })
 },

 goPlaza() {
 uni.switchTab({ url: '/pages/plaza/index' })
 },

 handleLogout() {
 uni.showModal({
 title: '退出登录',
 content: '确认退出？',
 success: (res) => {
 if (res.confirm) {
 uni.clearStorageSync()
 uni.switchTab({ url: '/pages/plaza/index' })
 }
 }
 })
 },

 statusText(s) {
 const map = { active: '守候中', ACTIVE: '守候中', expired: '已结束', cancelled: '已取消' }
 return map[s] || s
 },

 planTypeText(p) {
 const map = {
 season: '季度套餐', SEASON: '季度套餐',
 annual: '年度套餐', ANNUAL: '年度套餐',
 trial: '体验套餐', TRIAL: '体验套餐',
 tea_basic: '基础档', tea_standard: '标准档',
 plant_basic: '植物季度'
 }
 return map[p] || p
 },

 adoptDays(order) {
 if (!order.start_date) return 0
 const start = new Date(order.start_date)
 const today = new Date()
 return Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)))
 },

 totalDays(order) {
 if (!order.start_date || !order.expire_date) return 0
 const start = new Date(order.start_date)
 const end = new Date(order.expire_date)
 return Math.floor((end - start) / (1000 * 60 * 60 * 24))
 },

 progressPercent(order) {
 const total = this.totalDays(order)
 if (total === 0) return 0
 const done = this.adoptDays(order)
 return Math.min(100, Math.round((done / total) * 100))
 },

 formatDate(val) {
 if (!val) return ''
 return val.substring(0, 10)
 }
 }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f0; padding-bottom: 60rpx; }

.profile-header { position: relative; height: 240rpx; overflow: hidden; }
.profile-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(160deg, #2d5a27 0%, #4a7c3f 60%, #5a8f4a 100%); }
.profile-info { position: relative; z-index: 1; display: flex; align-items: center; padding: 60rpx 40rpx 40rpx; gap: 24rpx; }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 48rpx; border: 2rpx solid rgba(255,255,255,0.4); }
.user-detail { color: white; }
.user-phone { font-size: 32rpx; font-weight: bold; margin-bottom: 8rpx; }
.user-stats { font-size: 24rpx; opacity: 0.8; }

.empty-state { text-align: center; padding: 120rpx 40rpx; }
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
.empty-sub { font-size: 28rpx; color: #999; margin-bottom: 48rpx; }
.btn-primary { background: #2d5a27; color: white; border: none; border-radius: 999rpx; padding: 24rpx 80rpx; font-size: 30rpx; }

.order-list { padding: 32rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #2d5a27; margin-bottom: 24rpx; }

.order-card { background: white; border-radius: 20rpx; overflow: hidden; margin-bottom: 24rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); display: flex; }
.card-cover { width: 180rpx; flex-shrink: 0; position: relative; }
.cover-img { width: 180rpx; height: 100%; min-height: 180rpx; }
.cover-placeholder { width: 180rpx; min-height: 180rpx; background: #e8f5e9; display: flex; align-items: center; justify-content: center; }
.cover-emoji { font-size: 60rpx; }
.status-badge { position: absolute; top: 12rpx; left: 12rpx; font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 999rpx; }
.status-badge.active, .status-badge.ACTIVE { background: #2d5a27; color: white; }
.status-badge.expired { background: rgba(0,0,0,0.4); color: white; }

.card-body { flex: 1; padding: 24rpx; display: flex; flex-direction: column; justify-content: space-between; }
.card-name { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.card-plan { font-size: 24rpx; color: #999; margin-bottom: 16rpx; }

.progress-wrap { margin-bottom: 16rpx; }
.progress-bar { height: 8rpx; background: #f0f0f0; border-radius: 999rpx; overflow: hidden; margin-bottom: 8rpx; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #2d5a27, #5a8f4a); border-radius: 999rpx; transition: width 0.3s; }
.progress-text { font-size: 22rpx; color: #999; }

.card-expire { font-size: 22rpx; color: #bbb; }

.settings-section { margin: 32rpx; background: white; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.settings-item { display: flex; justify-content: space-between; align-items: center; padding: 32rpx; font-size: 28rpx; color: #666; border-bottom: 1rpx solid #f5f5f5; }
.settings-item:last-child { border-bottom: none; }
.arrow { font-size: 32rpx; color: #ccc; }
</style> drawPoster() {
  const order = this.posterOrder
  if (!order) return
  this.$nextTick(() => {
   const el = document.querySelector('#homePoster canvas.uni-canvas-canvas') || document.querySelector('#homePoster canvas.uni-canvas-canvas') || document.getElementById('homePoster')
   if (!el) return
   const W = Math.min(window.innerWidth, 630)
   const H = Math.round(W * 16 / 9)
   el.width = W
   el.height = H
   const c = el.getContext('2d')
   const g = c.createLinearGradient(0, 0, W, H)
   g.addColorStop(0, '#1a3d16')
   g.addColorStop(0.6, '#2d5a27')
   g.addColorStop(1, '#3d6b32')
   c.fillStyle = g
   c.fillRect(0, 0, W, H)
   c.fillStyle = 'rgba(255,255,255,0.04)'
   c.beginPath(); c.arc(W*0.85, H*0.1, W*0.5, 0, Math.PI*2); c.fill()
   c.fillStyle = 'rgba(255,255,255,0.03)'
   c.beginPath(); c.arc(W*0.1, H*0.9, W*0.4, 0, Math.PI*2); c.fill()
   c.textAlign = 'center'; c.textBaseline = 'middle'
   c.font = Math.round(W*0.032) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.4)'
   c.fillText('— 山南记 · 认养证书 —', W/2, H*0.12)
   c.font = Math.round(W*0.13) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.85)'
   c.fillText('🍃', W/2, H*0.3)
   c.font = 'bold ' + Math.round(W*0.07) + 'px sans-serif'
   c.fillStyle = '#fff'
   c.fillText((order.target && order.target.name) || '我的茶树', W/2, H*0.46)
   c.font = Math.round(W*0.037) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.55)'
   c.fillText('我在山南记守候着这棵树', W/2, H*0.55)
   c.fillStyle = 'rgba(255,255,255,0.15)'
   c.fillRect(W*0.25, H*0.61, W*0.5, 1)
   c.font = Math.round(W*0.033) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.5)'
   c.fillText('秦岭南麓 · 陕西汉中西乡', W/2, H*0.67)
   c.fillText('守候开始于 ' + (order.start_date||'').substring(0,10), W/2, H*0.74)
   c.fillStyle = 'rgba(255,255,255,0.1)'
   c.fillRect(W*0.1, H*0.82, W*0.8, 1)
   c.font = 'bold ' + Math.round(W*0.05) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.85)'
   c.fillText('山南记', W/2, H*0.88)
   c.font = Math.round(W*0.034) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.4)'
   c.fillText('shannanji.com', W/2, H*0.94)
  })
 },
 savePoster() {
  const el = document.querySelector('#homePoster canvas.uni-canvas-canvas') || document.querySelector('#homePoster canvas.uni-canvas-canvas') || document.getElementById('homePoster')
  if (!el) return
  const url = el.toDataURL('image/png')
  const a = document.createElement('a')
  a.download = '山南记认养证书.png'
  a.href = url; a.click()
 },late>
 <view class="container">

 <!-- 顶部用户信息 -->
 <view class="profile-header">
 <view class="profile-bg"></view>
 <view class="profile-info">
 <view class="avatar">🌿</view>
 <view class="user-detail">
 <view class="user-phone">{{ maskedPhone }}</view>
 <view class="user-stats">已守候 {{ orders.length }} 份山南</view>
 </view>
 </view>
 </view>

 <!-- 加载中 -->
 <view v-if="loading" class="empty-state">加载中...</view>

 <!-- 空状态 -->
 <view v-else-if="orders.length === 0" class="empty-state">
 <view class="empty-icon">🍃</view>
 <view class="empty-title">还没有认养记录</view>
 <view class="empty-sub">去广场找一棵属于你的茶树</view>
 <button class="btn-primary" @click="goPlaza">去广场</button>
 </view>

 <!-- 认养列表 -->
 <view v-else class="order-list">
 <view class="section-title">我的守候</view>
 <view class="order-card" v-for="(order, idx) in orders" :key="order.id" @click="goDetail(order.id)">
 <!-- 封面图 -->
 <view class="card-cover">
 <image v-if="order.target && order.target.cover_image"
 :src="getImageUrl(order.target.cover_image)"
 mode="aspectFill" class="cover-img" lazy-load />
 <view v-else class="cover-placeholder">
 <text class="cover-emoji">{{ order.target && order.target.type === 'tea' ? '🍃' : '🌿' }}</text>
 </view>
 <view class="status-badge" :class="order.status">{{ statusText(order.status) }}</view>
 </view>

 <!-- 卡片信息 -->
 <view class="card-body">
 <view class="card-name">{{ order.target && order.target.name || `我的第${idx+1}份山南` }}</view>
 <view class="card-plan">{{ planTypeText(order.plan_type) }}</view>

 <!-- 进度条 -->
 <view class="progress-wrap">
 <view class="progress-bar">
 <view class="progress-fill" :style="{ width: progressPercent(order) + '%' }"></view>
 </view>
 <view class="progress-text">第{{ adoptDays(order) }}天 / 共{{ totalDays(order) }}天</view>
 </view>

 <view class="card-expire">到期：{{ formatDate(order.expire_date) }}</view>
 </view>
 </view>
 </view>

 <!-- 底部设置 -->
 <view class="settings-section">
 <view class="settings-item" @click="handleLogout">
 <text>退出登录</text>
 <text class="arrow">›</text>
 </view>
 </view>

 </view>
</template>

<script>
import { getMyOrders } from '@/api/orders.js'
import { SERVER_URL } from '@/config.js'

export default {
 data() {
 return {
 orders: [],
 loading: false,
 phone: ''
 }
 },

 computed: {
 maskedPhone() {
 if (!this.phone) return '未登录'
 return this.phone.substring(0, 3) + '****' + this.phone.substring(7)
 }
 },

 onLoad() {
 const token = uni.getStorageSync('token')
 if (!token) {
 uni.redirectTo({ url: '/pages/plaza/index' })
 return
 }
 this.phone = uni.getStorageSync('phone') || ''
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
 try {
 const data = await getMyOrders()
 this.orders = data || []
 } catch (e) {
 uni.showToast({ title: '加载失败', icon: 'none' })
 this.orders = []
 } finally {
 this.loading = false
 }
 },

 getImageUrl(path) {
 if (!path) return ''
 if (path.startsWith('http')) return path
 return SERVER_URL + path
 },

 goDetail(id) {
 uni.navigateTo({ url: `/pages/order/detail?order_id=${id}` })
 },

 goPlaza() {
 uni.switchTab({ url: '/pages/plaza/index' })
 },

 handleLogout() {
 uni.showModal({
 title: '退出登录',
 content: '确认退出？',
 success: (res) => {
 if (res.confirm) {
 uni.clearStorageSync()
 uni.switchTab({ url: '/pages/plaza/index' })
 }
 }
 })
 },

 statusText(s) {
 const map = { active: '守候中', ACTIVE: '守候中', expired: '已结束', cancelled: '已取消' }
 return map[s] || s
 },

 planTypeText(p) {
 const map = {
 season: '季度套餐', SEASON: '季度套餐',
 annual: '年度套餐', ANNUAL: '年度套餐',
 trial: '体验套餐', TRIAL: '体验套餐',
 tea_basic: '基础档', tea_standard: '标准档',
 plant_basic: '植物季度'
 }
 return map[p] || p
 },

 adoptDays(order) {
 if (!order.start_date) return 0
 const start = new Date(order.start_date)
 const today = new Date()
 return Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)))
 },

 totalDays(order) {
 if (!order.start_date || !order.expire_date) return 0
 const start = new Date(order.start_date)
 const end = new Date(order.expire_date)
 return Math.floor((end - start) / (1000 * 60 * 60 * 24))
 },

 progressPercent(order) {
 const total = this.totalDays(order)
 if (total === 0) return 0
 const done = this.adoptDays(order)
 return Math.min(100, Math.round((done / total) * 100))
 },

 formatDate(val) {
 if (!val) return ''
 return val.substring(0, 10)
 }
 }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f0; padding-bottom: 60rpx; }

.profile-header { position: relative; height: 240rpx; overflow: hidden; }
.profile-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(160deg, #2d5a27 0%, #4a7c3f 60%, #5a8f4a 100%); }
.profile-info { position: relative; z-index: 1; display: flex; align-items: center; padding: 60rpx 40rpx 40rpx; gap: 24rpx; }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 48rpx; border: 2rpx solid rgba(255,255,255,0.4); }
.user-detail { color: white; }
.user-phone { font-size: 32rpx; font-weight: bold; margin-bottom: 8rpx; }
.user-stats { font-size: 24rpx; opacity: 0.8; }

.empty-state { text-align: center; padding: 120rpx 40rpx; }
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
.empty-sub { font-size: 28rpx; color: #999; margin-bottom: 48rpx; }
.btn-primary { background: #2d5a27; color: white; border: none; border-radius: 999rpx; padding: 24rpx 80rpx; font-size: 30rpx; }

.order-list { padding: 32rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #2d5a27; margin-bottom: 24rpx; }

.order-card { background: white; border-radius: 20rpx; overflow: hidden; margin-bottom: 24rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); display: flex; }
.card-cover { width: 180rpx; flex-shrink: 0; position: relative; }
.cover-img { width: 180rpx; height: 100%; min-height: 180rpx; }
.cover-placeholder { width: 180rpx; min-height: 180rpx; background: #e8f5e9; display: flex; align-items: center; justify-content: center; }
.cover-emoji { font-size: 60rpx; }
.status-badge { position: absolute; top: 12rpx; left: 12rpx; font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 999rpx; }
.status-badge.active, .status-badge.ACTIVE { background: #2d5a27; color: white; }
.status-badge.expired { background: rgba(0,0,0,0.4); color: white; }

.card-body { flex: 1; padding: 24rpx; display: flex; flex-direction: column; justify-content: space-between; }
.card-name { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.card-plan { font-size: 24rpx; color: #999; margin-bottom: 16rpx; }

.progress-wrap { margin-bottom: 16rpx; }
.progress-bar { height: 8rpx; background: #f0f0f0; border-radius: 999rpx; overflow: hidden; margin-bottom: 8rpx; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #2d5a27, #5a8f4a); border-radius: 999rpx; transition: width 0.3s; }
.progress-text { font-size: 22rpx; color: #999; }

.card-expire { font-size: 22rpx; color: #bbb; }

.settings-section { margin: 32rpx; background: white; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.settings-item { display: flex; justify-content: space-between; align-items: center; padding: 32rpx; font-size: 28rpx; color: #666; border-bottom: 1rpx solid #f5f5f5; }
.settings-item:last-child { border-bottom: none; }
.arrow { font-size: 32rpx; color: #ccc; }
</style>
