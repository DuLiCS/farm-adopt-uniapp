<template>
 <view class="container">

 <view class="profile-header">
 <view class="profile-bg"></view>
 <view class="profile-info">
 <view class="avatar">🌿</view>
 <view class="user-detail">
 <view class="user-phone">{{ maskedPhone }}</view>
 <view class="user-stats">已守候 {{ orders.length }} 份山南</view>
 <view class="user-greeting">{{ greeting }}</view>
 </view>
 </view>
 </view>

 <view v-if="loading" class="order-list">
 <view class="jieqi-bar" style="background:#f0f0f0;">
   <view class="skel" style="width:180rpx;height:26rpx;border-radius:6rpx;"></view>
 </view>
 <view class="skeleton-order" v-for="i in 2" :key="i">
   <view class="skel skel-cover-rect"></view>
   <view style="flex:1;padding:24rpx;display:flex;flex-direction:column;gap:16rpx;">
     <view class="skel" style="height:30rpx;width:60%;"></view>
     <view class="skel" style="height:22rpx;width:40%;"></view>
     <view class="skel" style="height:16rpx;width:80%;border-radius:999rpx;"></view>
     <view class="skel" style="height:20rpx;width:50%;"></view>
   </view>
 </view>
 </view>

 <view v-else-if="orders.length === 0" class="empty-state">
 <view class="empty-icon">🍃</view>
 <view class="empty-title">还没有认养记录</view>
 <view class="empty-sub">这里有一棵茶树，正在等待有缘人</view>
 <button class="btn-primary" @click="goPlaza">去山南广场看看</button>
 </view>

 <view v-else class="order-list">

   <!-- 节气横幅（仅当日节气且未关闭时展示） -->
   <view v-if="nextJieqi && nextJieqi.isToday && !jieqiDismissed" class="jieqi-banner">
     <view class="jieqi-banner-watermark">{{ nextJieqi.name }}</view>
     <view class="jieqi-banner-inner">
       <view class="jieqi-banner-left">
         <view class="jieqi-banner-tag">今日节气</view>
         <view class="jieqi-banner-name">{{ nextJieqi.name }}</view>
         <view class="jieqi-banner-copy">{{ jieqiFarmCopy }}</view>
       </view>
       <view class="jieqi-banner-close" @click.stop="dismissJieqi">✕</view>
     </view>
   </view>

   <!-- 普通节气提示条 -->
   <view class="jieqi-bar" v-else-if="nextJieqi">
     <text class="jieqi-bar-icon">🌿</text>
     <text v-if="nextJieqi.isToday" class="jieqi-bar-text">今日 <text class="jieqi-bar-name">{{ nextJieqi.name }}</text></text>
     <text v-else class="jieqi-bar-text">距 <text class="jieqi-bar-name">{{ nextJieqi.name }}</text> 还有 <text class="jieqi-bar-days">{{ nextJieqi.days }}</text> 天</text>
   </view>

   <!-- 今日山南·树的心情 -->
   <view class="tree-mood-bar">
     <text class="tree-mood-leaf">🍃</text>
     <text class="tree-mood-text">{{ treeMoodText }}</text>
   </view>

 <view class="section-title">我的守候</view>
 <view class="order-card" v-for="(order, idx) in orders" :key="order.id" @click="goDetail(order.id)">
 <view class="card-cover">
 <image v-if="order.target && order.target.cover_image"
 :src="getImageUrl(order.target.cover_image)"
 mode="aspectFill" class="cover-img" lazy-load />
 <view v-else class="cover-placeholder">
 <text class="cover-emoji">{{ order.target && order.target.type === 'tea' ? '🍃' : '🌿' }}</text>
 </view>
 <view class="status-badge" :class="order.status">{{ statusText(order.status) }}</view>
 </view>
 <view class="card-body">
 <view class="card-name-row">
 <view class="card-name">{{ order.target && order.target.name || `我的第${idx+1}份山南` }}</view>
 <view class="share-btn" @click.stop="openSharePoster(order)">分享</view>
 </view>
 <view class="card-plan">{{ planTypeText(order.plan_type) }}</view>
 <view class="progress-wrap">
 <view class="progress-bar">
 <view class="progress-fill" :style="{ width: progressPercent(order) + '%' }" :class="{ 'is-expired': order.status === 'expired' || order.status === 'EXPIRED' }"></view>
 </view>
 <view class="progress-text">第{{ adoptDays(order) }}天 / 共{{ totalDays(order) }}天</view>
 </view>
 <view class="card-expire">到期：{{ formatDate(order.expire_date) }}</view>
 <view v-if="milestoneInfo(order)" class="milestone-badge" :class="milestoneInfo(order).type">
   <text v-if="milestoneInfo(order).type === 'hit'">{{ milestoneInfo(order).icon }} {{ milestoneInfo(order).label }}！</text>
   <text v-else>还有 {{ milestoneInfo(order).remaining }} 天{{ milestoneInfo(order).label }}</text>
 </view>
 <view v-if="latestUpdates[order.id]" class="card-latest-update">
   <text class="update-dot">🌿</text>
   <text class="update-ago">{{ updateAgo(latestUpdates[order.id]) }}</text>
   <text class="update-desc">{{ latestUpdates[order.id].description }}</text>
 </view>
 </view>
 </view>
 </view>

 <view class="settings-section">
 <view class="settings-item" @click="handleLogout">
 <text>退出登录</text>
 <text class="arrow">›</text>
 </view>
 </view>

 <view v-if="showPoster" class="poster-mask" @click.self="showPoster=false">
 <view class="poster-wrap">
   <view class="poster-hint">长按图片保存 · 或点击下方按钮</view>
   <canvas canvas-id="homePoster" id="homePoster" class="poster-canvas" style="width:560rpx;height:996rpx;"></canvas>
   <view class="poster-actions">
     <button class="poster-save-btn" @click="savePoster">保存到相册</button>
     <view class="poster-close-link" @click="showPoster=false">关闭</view>
   </view>
 </view>
 </view>

 </view>
</template>

<script>
import { getMyOrders, getOrderUpdates } from '@/api/orders.js'
import { SERVER_URL } from '@/config.js'
import { getTreeMood, JIEQI_FARM_COPY } from '@/utils/treeMood.js'

const JIEQI = {
  '2026-01-05':'小寒','2026-01-20':'大寒','2026-02-04':'立春','2026-02-19':'雨水',
  '2026-03-06':'惊蛰','2026-03-20':'春分','2026-04-05':'清明','2026-04-20':'谷雨',
  '2026-05-06':'立夏','2026-05-21':'小满','2026-06-06':'芒种','2026-06-21':'夏至',
  '2026-07-07':'小暑','2026-07-23':'大暑','2026-08-07':'立秋','2026-08-23':'处暑',
  '2026-09-08':'白露','2026-09-23':'秋分','2026-10-08':'寒露','2026-10-23':'霜降',
  '2026-11-07':'立冬','2026-11-22':'小雪','2026-12-07':'大雪','2026-12-22':'冬至',
  '2027-01-05':'小寒','2027-01-20':'大寒','2027-02-03':'立春','2027-02-18':'雨水',
  '2027-03-06':'惊蛰','2027-03-21':'春分','2027-04-05':'清明','2027-04-20':'谷雨',
  '2027-05-06':'立夏','2027-05-21':'小满','2027-06-06':'芒种','2027-06-21':'夏至',
  '2027-07-07':'小暑','2027-07-23':'大暑','2027-08-07':'立秋','2027-08-23':'处暑',
  '2027-09-08':'白露','2027-09-23':'秋分','2027-10-08':'寒露','2027-10-23':'霜降',
  '2027-11-07':'立冬','2027-11-22':'小雪','2027-12-07':'大雪','2027-12-22':'冬至',
  '2028-01-06':'小寒','2028-01-21':'大寒','2028-02-04':'立春','2028-02-19':'雨水',
  '2028-03-05':'惊蛰','2028-03-20':'春分','2028-04-04':'清明','2028-04-19':'谷雨',
  '2028-05-05':'立夏','2028-05-20':'小满','2028-06-05':'芒种','2028-06-21':'夏至',
  '2028-07-06':'小暑','2028-07-22':'大暑','2028-08-07':'立秋','2028-08-22':'处暑',
  '2028-09-07':'白露','2028-09-22':'秋分','2028-10-07':'寒露','2028-10-22':'霜降',
  '2028-11-07':'立冬','2028-11-21':'小雪','2028-12-06':'大雪','2028-12-21':'冬至',
}

export default {
 data() {
 return {
 orders: [],
 loading: false,
 phone: '',
 showPoster: false,
 posterOrder: null,
 latestUpdates: {},
 jieqiDismissed: false
 }
 },

 computed: {
 maskedPhone() {
 if (!this.phone) return '未登录'
 return this.phone.substring(0, 3) + '****' + this.phone.substring(7)
 },
 nextJieqi() {
 const now = new Date()
 const pad = n => String(n).padStart(2, '0')
 const todayStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`
 const next = Object.keys(JIEQI).sort().find(d => d >= todayStr)
 if (!next) return null
 const days = Math.ceil((new Date(next) - now) / 86400000)
 return { name: JIEQI[next], days, isToday: days === 0 }
 },
 greeting() {
 const h = new Date().getHours()
 if (h >= 5 && h < 9) return '早安，山南的茶正在醒来'
 if (h >= 9 && h < 12) return '上午好，秦岭南麓晴天'
 if (h >= 12 && h < 14) return '午好，正是茶树休憩时'
 if (h >= 14 && h < 18) return '下午好，山南一切安好'
 if (h >= 18 && h < 21) return '傍晚了，今日的守候结束了'
 return '夜深了，感谢你守候山南'
 },
 treeMoodText() {
   const now = new Date()
   return getTreeMood(now.getHours(), now.getMonth() + 1)
 },
 jieqiFarmCopy() {
   if (!this.nextJieqi || !this.nextJieqi.isToday) return ''
   return JIEQI_FARM_COPY[this.nextJieqi.name] || ''
 }
 },

 onLoad() {
 const token = uni.getStorageSync('token')
 if (!token) { uni.redirectTo({ url: '/pages/plaza/index' }); return }
 this.phone = uni.getStorageSync('phone') || ''
 },

 onShow() {
 const token = uni.getStorageSync('token')
 if (!token) { uni.redirectTo({ url: '/pages/plaza/index' }); return }
 this.loadOrders()
 // 恢复节气横幅关闭状态（每天重置）
 const today = new Date().toISOString().substring(0, 10)
 this.jieqiDismissed = !!uni.getStorageSync('jieqi_dismissed_' + today)
 },

 onPullDownRefresh() {
 this.loadOrders().finally(() => uni.stopPullDownRefresh())
 },

 methods: {
 async loadOrders() {
 this.loading = true
 try {
 const data = await getMyOrders()
 this.orders = data || []
 this.loadLatestUpdates(this.orders)
 } catch (e) {
 uni.showToast({ title: '信号不太好，稍后再试', icon: 'none' })
 this.orders = []
 } finally {
 this.loading = false
 }
 },
 async loadLatestUpdates(orders) {
 if (!orders.length) return
 const results = await Promise.all(
   orders.map(o =>
     getOrderUpdates(o.id)
       .then(data => ({ id: o.id, update: (data || [])[0] || null }))
       .catch(() => ({ id: o.id, update: null }))
   )
 )
 const map = {}
 results.forEach(r => { map[r.id] = r.update })
 this.latestUpdates = map
 },
 updateAgo(update) {
 if (!update || !update.updated_at) return ''
 const diff = Math.floor((new Date() - new Date(update.updated_at + 'Z')) / 86400000)
 if (diff === 0) return '今天'
 if (diff === 1) return '昨天'
 return diff + '天前'
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
 dismissJieqi() {
   const today = new Date().toISOString().substring(0, 10)
   uni.setStorageSync('jieqi_dismissed_' + today, true)
   this.jieqiDismissed = true
 },
 handleLogout() {
 uni.showModal({
 title: '退出登录',
 content: '确认退出？',
 success: (res) => {
 if (res.confirm) { uni.clearStorageSync(); uni.switchTab({ url: '/pages/plaza/index' }) }
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
 return Math.min(100, Math.round((this.adoptDays(order) / total) * 100))
 },
 milestoneInfo(order) {
   const days = this.adoptDays(order)
   const milestones = [
     { days: 30, label: '守候满月', icon: '🌕' },
     { days: 100, label: '守候百日', icon: '💯' },
     { days: 365, label: '守候一周年', icon: '🎋' },
   ]
   const hit = milestones.find(m => m.days === days)
   if (hit) return { type: 'hit', ...hit }
   const next = milestones.find(m => m.days > days && m.days - days <= 10)
   if (next) return { type: 'upcoming', ...next, remaining: next.days - days }
   return null
 },
 formatDate(val) {
 if (!val) return ''
 return val.substring(0, 10)
 },
 openSharePoster(order) {
 this.posterOrder = order
 this.showPoster = true
 this.$nextTick(() => { this.drawPoster() })
 },
 drawPoster() {
 const order = this.posterOrder
 if (!order) return
 const W = 630, H = 1120
 const ctx = uni.createCanvasContext('homePoster', this)

 // --- Background ---
 const bg = ctx.createLinearGradient(0, 0, 0, H)
 bg.addColorStop(0, '#0c1f0e')
 bg.addColorStop(0.45, '#17340f')
 bg.addColorStop(1, '#091408')
 ctx.setFillStyle(bg)
 ctx.fillRect(0, 0, W, H)

 // Soft green glow top-right
 const glow = ctx.createLinearGradient(W * 0.4, 0, W, H * 0.35)
 glow.addColorStop(0, 'rgba(74,124,63,0.22)')
 glow.addColorStop(1, 'rgba(74,124,63,0)')
 ctx.setFillStyle(glow)
 ctx.fillRect(0, 0, W, H * 0.5)

 // --- Outer border frame (gold) ---
 ctx.setStrokeStyle('rgba(212,169,106,0.45)')
 ctx.setLineWidth(1)
 ctx.strokeRect(28, 28, W - 56, H - 56)
 ctx.setStrokeStyle('rgba(212,169,106,0.15)')
 ctx.setLineWidth(0.5)
 ctx.strokeRect(38, 38, W - 76, H - 76)

 // --- Corner ornaments ---
 const cs = 36, cg = 28
 ctx.setStrokeStyle('rgba(212,169,106,0.8)')
 ctx.setLineWidth(1.5)
 // top-left
 ctx.beginPath(); ctx.moveTo(cg, cg + cs); ctx.lineTo(cg, cg); ctx.lineTo(cg + cs, cg); ctx.stroke()
 // top-right
 ctx.beginPath(); ctx.moveTo(W - cg - cs, cg); ctx.lineTo(W - cg, cg); ctx.lineTo(W - cg, cg + cs); ctx.stroke()
 // bottom-left
 ctx.beginPath(); ctx.moveTo(cg, H - cg - cs); ctx.lineTo(cg, H - cg); ctx.lineTo(cg + cs, H - cg); ctx.stroke()
 // bottom-right
 ctx.beginPath(); ctx.moveTo(W - cg - cs, H - cg); ctx.lineTo(W - cg, H - cg); ctx.lineTo(W - cg, H - cg - cs); ctx.stroke()

 // --- Header: brand ---
 ctx.setTextAlign('center')
 ctx.setFontSize(17)
 ctx.setFillStyle('rgba(212,169,106,0.75)')
 ctx.fillText('S H A N N A N J I', W / 2, 90)
 ctx.setFontSize(13)
 ctx.setFillStyle('rgba(255,255,255,0.3)')
 ctx.fillText('ADOPTION  CERTIFICATE', W / 2, 116)

 // Thin rule with diamond
 ctx.setStrokeStyle('rgba(212,169,106,0.25)')
 ctx.setLineWidth(0.5)
 ctx.beginPath(); ctx.moveTo(72, 136); ctx.lineTo(W / 2 - 18, 136); ctx.stroke()
 ctx.beginPath(); ctx.moveTo(W / 2 + 18, 136); ctx.lineTo(W - 72, 136); ctx.stroke()
 ctx.setFillStyle('rgba(212,169,106,0.65)')
 ctx.beginPath()
 ctx.moveTo(W / 2, 129); ctx.lineTo(W / 2 + 7, 136)
 ctx.lineTo(W / 2, 143); ctx.lineTo(W / 2 - 7, 136)
 ctx.closePath(); ctx.fill()

 // --- Hero: emoji + name ---
 ctx.setFontSize(108)
 ctx.fillText('🍃', W / 2, 310)

 const name = (order.target && order.target.name) || '我的茶树'
 ctx.setFontSize(48)
 ctx.setFillStyle('#ffffff')
 ctx.fillText(name, W / 2, 402)

 // Plan type badge (outlined pill)
 const planText = this.planTypeText(order.plan_type) || ''
 if (planText) {
   const bw = planText.length * 22 + 56
   const bx = W / 2 - bw / 2
   const by = 420
   ctx.setStrokeStyle('rgba(212,169,106,0.45)')
   ctx.setLineWidth(1)
   ctx.strokeRect(bx, by, bw, 44)
   ctx.setFontSize(21)
   ctx.setFillStyle('rgba(212,169,106,0.85)')
   ctx.fillText(planText, W / 2, by + 30)
 }

 // Location tag
 ctx.setFontSize(22)
 ctx.setFillStyle('rgba(255,255,255,0.4)')
 ctx.fillText('秦岭南麓 · 汉中西乡 · 海拔800m', W / 2, 508)

 // Divider
 ctx.setStrokeStyle('rgba(255,255,255,0.08)')
 ctx.setLineWidth(1)
 ctx.beginPath(); ctx.moveTo(72, 534); ctx.lineTo(W - 72, 534); ctx.stroke()

 // --- Stats: three columns ---
 const days = this.adoptDays(order)
 const startStr = (order.start_date || '').substring(0, 10)
 const expireStr = (order.expire_date || '').substring(0, 10)
 const c1 = W / 2 - 168, c2 = W / 2, c3 = W / 2 + 168

 // Vertical separators
 ctx.setStrokeStyle('rgba(255,255,255,0.1)')
 ctx.setLineWidth(1)
 ctx.beginPath(); ctx.moveTo(W / 2 - 84, 558); ctx.lineTo(W / 2 - 84, 660); ctx.stroke()
 ctx.beginPath(); ctx.moveTo(W / 2 + 84, 558); ctx.lineTo(W / 2 + 84, 660); ctx.stroke()

 // Column 1: days
 ctx.setFontSize(58)
 ctx.setFillStyle('#ffffff')
 ctx.fillText(String(days), c1, 632)
 ctx.setFontSize(19)
 ctx.setFillStyle('rgba(255,255,255,0.35)')
 ctx.fillText('守候天数', c1, 660)

 // Column 2: start
 ctx.setFontSize(19)
 ctx.setFillStyle('rgba(255,255,255,0.3)')
 ctx.fillText(startStr.substring(0, 4), c2, 582)
 ctx.setFontSize(28)
 ctx.setFillStyle('#ffffff')
 ctx.fillText(startStr.substring(5), c2, 618)
 ctx.setFontSize(19)
 ctx.setFillStyle('rgba(255,255,255,0.35)')
 ctx.fillText('认养开始', c2, 650)

 // Column 3: expire
 ctx.setFontSize(19)
 ctx.setFillStyle('rgba(255,255,255,0.3)')
 ctx.fillText(expireStr.substring(0, 4), c3, 582)
 ctx.setFontSize(28)
 ctx.setFillStyle('#ffffff')
 ctx.fillText(expireStr.substring(5), c3, 618)
 ctx.setFontSize(19)
 ctx.setFillStyle('rgba(255,255,255,0.35)')
 ctx.fillText('守候到期', c3, 650)

 // Divider
 ctx.setStrokeStyle('rgba(255,255,255,0.08)')
 ctx.setLineWidth(1)
 ctx.beginPath(); ctx.moveTo(72, 684); ctx.lineTo(W - 72, 684); ctx.stroke()

 // --- Quote ---
 ctx.setFontSize(27)
 ctx.setFillStyle('rgba(255,255,255,0.5)')
 ctx.fillText('山南记不卖茶，', W / 2, 752)
 ctx.fillText('我们只是帮你守着那棵树。', W / 2, 792)

 // --- Bottom brand area ---
 // Gold rule
 ctx.setStrokeStyle('rgba(212,169,106,0.25)')
 ctx.setLineWidth(0.5)
 ctx.beginPath(); ctx.moveTo(72, 862); ctx.lineTo(W - 72, 862); ctx.stroke()

 ctx.setFontSize(42)
 ctx.setFillStyle('rgba(212,169,106,0.9)')
 ctx.fillText('山南记', W / 2, 936)

 ctx.setFontSize(17)
 ctx.setFillStyle('rgba(255,255,255,0.28)')
 ctx.fillText('shannanji.com', W / 2, 970)

 ctx.setFontSize(18)
 ctx.setFillStyle('rgba(255,255,255,0.18)')
 ctx.fillText('这里有一棵树，等待有缘人', W / 2, 1042)

 ctx.draw()
 },
 savePoster() {
 uni.canvasToTempFilePath({
   canvasId: 'homePoster',
   success: (res) => {
     uni.saveImageToPhotosAlbum({
       filePath: res.tempFilePath,
       success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
       fail: () => uni.showToast({ title: '请长按图片保存', icon: 'none' })
     })
   },
   fail: () => uni.showToast({ title: '生成失败', icon: 'none' })
 }, this)
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
.loading-state { text-align: center; padding: 120rpx 40rpx; }
.loading-icon { font-size: 64rpx; margin-bottom: 20rpx; opacity: 0.5; }
.loading-text { font-size: 28rpx; color: #aaa; }
.empty-state { text-align: center; padding: 120rpx 40rpx; }
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
.empty-sub { font-size: 28rpx; color: #999; margin-bottom: 48rpx; }
.btn-primary { background: #2d5a27; color: white; border: none; border-radius: 999rpx; padding: 24rpx 80rpx; font-size: 30rpx; }
.order-list { padding: 32rpx; }
/* ── 节气横幅 ── */
.jieqi-banner {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #1a3d16 0%, #2d5a27 60%, #3d7a35 100%);
  border-radius: 20rpx; margin-bottom: 24rpx;
  padding: 32rpx 28rpx;
}
.jieqi-banner-watermark {
  position: absolute; right: -8rpx; top: 50%;
  transform: translateY(-50%);
  font-size: 160rpx; font-weight: 900;
  color: rgba(255,255,255,0.06);
  line-height: 1; pointer-events: none;
  letter-spacing: -4rpx;
}
.jieqi-banner-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 20rpx;
}
.jieqi-banner-left { flex: 1; }
.jieqi-banner-tag {
  font-size: 20rpx; color: rgba(255,255,255,0.6);
  letter-spacing: 2rpx; margin-bottom: 8rpx;
}
.jieqi-banner-name {
  font-size: 44rpx; font-weight: 800; color: white;
  margin-bottom: 10rpx; letter-spacing: 4rpx;
}
.jieqi-banner-copy {
  font-size: 24rpx; color: rgba(255,255,255,0.75);
  line-height: 1.6;
}
.jieqi-banner-close {
  font-size: 32rpx; color: rgba(255,255,255,0.4);
  padding: 8rpx; flex-shrink: 0;
}
/* ── 普通节气条 ── */
.jieqi-bar {
 display: flex; align-items: center; gap: 12rpx;
 background: #f0f9f0; border-radius: 12rpx;
 padding: 20rpx 24rpx; margin-bottom: 24rpx;
}
.jieqi-bar-icon { font-size: 28rpx; }
.jieqi-bar-text { font-size: 26rpx; color: #666; }
.jieqi-bar-name { color: #2d5a27; font-weight: bold; }
.jieqi-bar-days { color: #2d5a27; font-weight: bold; font-size: 30rpx; }
/* ── 树的今日心情 ── */
.tree-mood-bar {
  display: flex; align-items: flex-start; gap: 12rpx;
  padding: 0 4rpx 28rpx;
}
.tree-mood-leaf { font-size: 26rpx; flex-shrink: 0; margin-top: 2rpx; }
.tree-mood-text {
  font-size: 26rpx; color: #888;
  line-height: 1.7; font-style: italic;
}
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
.card-name-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; }
.card-name { font-size: 30rpx; font-weight: bold; color: #333; }
.share-btn { font-size: 22rpx; color: #2d5a27; border: 1rpx solid #2d5a27; border-radius: 999rpx; padding: 4rpx 20rpx; flex-shrink: 0; }
.card-plan { font-size: 24rpx; color: #999; margin-bottom: 16rpx; }
.progress-wrap { margin-bottom: 16rpx; }
.progress-bar { height: 8rpx; background: #f0f0f0; border-radius: 999rpx; overflow: hidden; margin-bottom: 8rpx; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #2d5a27, #5a8f4a); border-radius: 999rpx; transition: width 0.3s; }
.progress-fill.is-expired { background: linear-gradient(90deg, #bbb, #ccc); }
.user-greeting { font-size: 22rpx; opacity: 0.65; margin-top: 4rpx; }
.progress-text { font-size: 22rpx; color: #999; }
.card-expire { font-size: 22rpx; color: #bbb; }
.milestone-badge { margin-top: 10rpx; padding: 6rpx 16rpx; border-radius: 8rpx; font-size: 22rpx; display: inline-block; }
.milestone-badge.hit { background: linear-gradient(135deg, #fff8e1, #fff3cd); color: #c47d10; font-weight: 500; }
.milestone-badge.upcoming { background: #f0f9f0; color: #2d5a27; }
.card-latest-update {
 display: flex; align-items: flex-start; gap: 8rpx;
 margin-top: 14rpx; padding-top: 14rpx;
 border-top: 1rpx solid #f5f5f5;
}
.update-dot { font-size: 20rpx; flex-shrink: 0; margin-top: 2rpx; }
.update-ago { font-size: 20rpx; color: #2d5a27; flex-shrink: 0; white-space: nowrap; }
.update-desc { font-size: 20rpx; color: #999; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.settings-section { margin: 32rpx; background: white; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.settings-item { display: flex; justify-content: space-between; align-items: center; padding: 32rpx; font-size: 28rpx; color: #666; }
.arrow { font-size: 32rpx; color: #ccc; }
.poster-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.92); z-index: 200;
  display: flex; align-items: center; justify-content: center; flex-direction: column;
}
.poster-wrap { display: flex; flex-direction: column; align-items: center; padding: 0 40rpx; }
.poster-hint { font-size: 22rpx; color: rgba(255,255,255,0.35); margin-bottom: 20rpx; letter-spacing: 0.5px; }
.poster-canvas {
  width: 560rpx; height: 996rpx;
  border-radius: 8rpx;
  box-shadow: 0 24rpx 80rpx rgba(0,0,0,0.6), 0 0 0 1rpx rgba(212,169,106,0.2);
}
.poster-actions { margin-top: 36rpx; display: flex; flex-direction: column; align-items: center; gap: 24rpx; width: 100%; }
.poster-save-btn {
  background: linear-gradient(135deg, #2d5a27, #4a7c3f);
  color: white; border: none; border-radius: 999rpx;
  padding: 24rpx 0; font-size: 30rpx; width: 480rpx;
  box-shadow: 0 8rpx 24rpx rgba(45,90,39,0.4);
}
.poster-close-link { font-size: 26rpx; color: rgba(255,255,255,0.35); padding: 8rpx 40rpx; }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.skel { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
.skeleton-order { background: white; border-radius: 20rpx; overflow: hidden; margin-bottom: 24rpx; display: flex; height: 180rpx; }
.skel-cover-rect { width: 180rpx; height: 180rpx; flex-shrink: 0; }
</style>
