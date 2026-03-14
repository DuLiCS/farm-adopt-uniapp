<template>
  <view class="container">
    <!-- 段一：全屏头图 -->
    <view class="hero-section">
      <image v-if="heroImage" class="hero-bg" :src="heroImage" mode="aspectFill" />
      <view v-else class="hero-bg-default"></view>
      <!-- 渐变遮罩 -->
      <view class="hero-gradient"></view>
      <!-- 悬浮标题 -->
      <view class="hero-overlay">
        <view class="hero-date">{{ todayStr }} · {{ weatherHint }}</view>
        <view class="hero-title">你的{{ targetTypeLabel }} 🌿</view>
      </view>
      <!-- 毛玻璃信息卡 -->
      <view class="hero-glass-card" v-if="order">
        <view class="glass-item">
          <view class="glass-label">认养对象</view>
          <view class="glass-value">{{ order.target?.name || '#' + order.target_id }}</view>
        </view>
        <view class="glass-divider"></view>
        <view class="glass-item">
          <view class="glass-label">第</view>
          <view class="glass-value">{{ adoptDays }}<text class="glass-unit">天</text></view>
        </view>
        <view class="glass-divider"></view>
        <view class="glass-item">
          <view class="glass-label">到期</view>
          <view class="glass-value">{{ order.expire_date ? order.expire_date.substring(5) : '--' }}</view>
        </view>
      </view>
    </view>

    <!-- 段二：状态卡片 -->
    <view class="status-card" v-if="order">
      <view class="target-code">#{{ order.target_id || order.target?.code || '-' }}</view>
      <view class="adopt-days">秦岭南麓 · 山南第{{ adoptDays }}天</view>
      <view class="today-status" v-if="latestUpdate">
        <view class="label">今日状态</view>
        <view class="content">{{ latestUpdate.description }}</view>
        <view class="update-time">{{ formatDate(latestUpdate.updated_at) }}</view>
      </view>
    </view>

    <!-- 段三：时间轴 -->
    <view class="timeline" v-if="updates.length > 0">
      <view class="section-title">生长记录</view>
      <view class="timeline-item" v-for="log in updates" :key="log.id">
        <view class="timeline-dot">{{ logTypeEmoji(log.log_type) }}</view>
        <view class="timeline-content">
          <view class="timeline-date">{{ formatDate(log.updated_at) }}</view>
          <view class="timeline-desc">{{ log.description }}</view>
          <scroll-view v-if="log.image_urls?.length" scroll-x class="image-row">
            <image v-for="(url, idx) in log.image_urls" :key="idx" :src="url" mode="aspectFill" />
          </scroll-view>
        </view>
      </view>
    </view>
    <view class="timeline-empty" v-else>
      还没有更新记录，请等待农场主的第一次记录
    </view>

    <!-- 段四：权益状态 -->
    <view class="rights-section" v-if="order">
      <view class="section-title">我的权益</view>
      <view class="rights-item">
        <text>套餐</text>
        <text>{{ planLabel }}</text>
      </view>
      <view class="rights-item">
        <text>到期</text>
        <text>{{ order.expire_date }}</text>
      </view>
      <view class="rights-item" v-for="delivery in deliveries" :key="delivery.id">
        <text>{{ delivery.content_desc }}</text>
        <text class="status-badge" :class="delivery.status">{{ deliveryStatusLabel(delivery.status) }}</text>
      </view>
    </view>

    <!-- 返回按钮 -->
    <view style="text-align: center; margin: 32rpx 0;">
      <text style="color: #999; font-size: 28rpx; cursor: pointer;" @click="goBack">返回列表</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMyOrders, getOrderUpdates, getOrderDeliveries } from '@/api/orders.js'

const order = ref(null)
const updates = ref([])
const deliveries = ref([])
const orderId = ref(null)

// 计算属性
const todayStr = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`
})

const weatherHint = computed(() => '晴转多云')  // TODO: 可接入天气API

const targetTypeLabel = computed(() => {
  if (!order.value || !order.value.plan_type) return '认养对象'
  const type = order.value.plan_type
  const map = { season: '季度茶园', annual: '年度茶园', trial: '体验茶园' }
  return map[type] || '认养对象'
})

const adoptDays = computed(() => {
  if (!order.value || !order.value.start_date) return 0
  const start = new Date(order.value.start_date)
  const today = new Date()
  return Math.floor((today - start) / (1000 * 60 * 60 * 24))
})

const latestUpdate = computed(() => {
  return updates.value[0] || null
})

const heroImage = computed(() => {
  // 优先使用最新更新的第一张图
  if (updates.value.length > 0 && updates.value[0].image_urls?.length > 0) {
    const url = updates.value[0].image_urls[0]
    if (url.startsWith('http')) return url
    return 'http://47.102.138.74' + url
  }
  // 其次用认养对象的cover_image
  if (order.value?.target?.cover_image) {
    const cover = order.value.target.cover_image
    if (cover.startsWith('http')) return cover
    return 'http://47.102.138.74' + cover
  }
  // 最后用默认绿色背景（返回空，让 hero-section 显示默认背景）
  return ''
})

const logTypeEmoji = (type) => {
  const map = { daily: '🌿', solar_term: '🌱', harvest: '🍃', delivery: '📦' }
  return map[type] || '🌿'
}

const planLabel = computed(() => {
  if (!order.value) return ''
  const map = { season: '茶树认养·季度版', annual: '茶树认养·年度版', trial: '茶树认养·体验版' }
  return map[order.value.plan_type] || order.value.plan_type || ''
})

const deliveryStatusLabel = (status) => {
  const map = { pending: '待发货', sent: '已发货', delivered: '已送达' }
  return map[status] || status
}

const formatDate = (val) => {
  if (!val) return ''
  return val.replace('T', ' ').substring(0, 19)
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  // 从页面参数获取 order_id
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  orderId.value = currentPage.options?.order_id
  if (orderId.value) {
    loadData()
  }
})

const loadData = async () => {
  uni.showLoading({ title: '加载中...', mask: true })
  try {
    // 加载订单列表，然后查找当前订单
    const orders = await getMyOrders()
    order.value = orders.find(o => o.id === Number(orderId.value))
    // 加载更新和配送
    updates.value = await getOrderUpdates(orderId.value)
    deliveries.value = await getOrderDeliveries(orderId.value)
  } catch (e) {
    console.error(e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style scoped>
.container {
  padding: 0;
  min-height: 100vh;
  background: #f5f5f0;
}

/* 头图区 */
.hero-section {
  position: relative;
  height: 56vh;
  width: 100%;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
}
.hero-bg-default {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #2d5a27 0%, #4a7c3f 60%, #5a8f4a 100%);
}
.hero-gradient {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.75) 100%);
  z-index: 1;
}
.hero-overlay {
  position: absolute;
  top: 80rpx;
  left: 0;
  right: 0;
  padding: 0 40rpx;
  color: white;
  z-index: 2;
}
.hero-title {
  font-size: 52rpx;
  font-weight: bold;
  margin-top: 8rpx;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.hero-date {
  font-size: 26rpx;
  opacity: 0.85;
}
.hero-glass-card {
  position: absolute;
  bottom: 40rpx;
  left: 30rpx;
  right: 30rpx;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1rpx solid rgba(255,255,255,0.3);
  border-radius: 24rpx;
  padding: 28rpx 36rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
}
.glass-item {
  flex: 1;
  text-align: center;
}
.glass-label {
  font-size: 22rpx;
  color: rgba(255,255,255,0.75);
  margin-bottom: 6rpx;
}
.glass-value {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.glass-unit {
  font-size: 22rpx;
  font-weight: normal;
  margin-left: 2rpx;
}
.glass-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(255,255,255,0.3);
}

/* 状态卡片 */
.status-card {
  margin: -40rpx 30rpx 0;
  background: white;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
}
.target-code {
  font-size: 32rpx;
  font-weight: bold;
  color: #2d5a27;
}
.adopt-days {
  color: #2d5a27;
  font-size: 28rpx;
  margin-top: 12rpx;
  margin-bottom: 30rpx;
}
.today-status {
  background: #f5f9f5;
  border-left: 6rpx solid #2d5a27;
  padding: 24rpx;
  border-radius: 0 12rpx 12rpx 0;
}
.today-status .label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}
.today-status .content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}
.today-status .update-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

/* 时间轴 */
.timeline {
  padding: 40rpx 30rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}
.timeline-item {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}
.timeline-dot {
  font-size: 36rpx;
  flex-shrink: 0;
}
.timeline-content {
  flex: 1;
}
.timeline-date {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}
.timeline-desc {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12rpx;
}
.image-row {
  height: 200rpx;
  white-space: nowrap;
}
.image-row image {
  width: 280rpx;
  height: 200rpx;
  border-radius: 12rpx;
  margin-right: 16rpx;
  display: inline-block;
}
.timeline-empty {
  text-align: center;
  color: #999;
  padding: 80rpx 0;
}

/* 权益 */
.rights-section {
  padding: 0 30rpx 80rpx;
}
.rights-item {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  font-size: 28rpx;
}
.rights-item text:first-child {
  color: #666;
}
.rights-item text:last-child {
  color: #333;
  font-weight: 500;
}
.status-badge {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}
.status-badge.DELIVERED {
  color: #2d5a27;
  background: #e8f5e9;
}
.status-badge.PENDING {
  color: #999;
  background: #f0f0f0;
}
.status-badge.SENT {
  color: #f0a500;
  background: #fff8e1;
}

.hero-bg-default {
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #2d5a27 0%, #4a7c3f 60%, #5a8f4a 100%);
}
</style>
