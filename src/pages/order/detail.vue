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
      <view class="target-code">{{ order.target?.code || ('#' + order.target_id) }}</view>
      <view class="adopt-days">秦岭南麓 · 山南第{{ adoptDays }}天</view>
      <view class="tree-mood">
        <text class="tree-mood-icon">🍃</text>
        <text class="tree-mood-text">{{ treeMoodText }}</text>
      </view>

      <!-- 寄语存档 -->
      <view class="dedication-card" v-if="dedication">
        <text class="dedication-quote">"{{ dedication }}"</text>
        <text class="dedication-hint">你说过的话</text>
      </view>

      <view class="today-status" v-if="latestUpdate">
        <view class="label">最新动态</view>
        <view class="content">{{ latestUpdate.description }}</view>
        <view class="update-time">{{ formatDate(latestUpdate.updated_at) }}</view>
      </view>
      <view class="no-update-hint" v-else>
        <text class="no-update-text">农场主还没有发布动态，静待消息</text>
      </view>
    </view>

    <!-- 到期提示 -->
    <view class="expired-notice" v-if="order && isExpired">
      <view class="expired-icon">🍃</view>
      <view class="expired-title">守候已画上句点</view>
      <view class="expired-sub">感谢你这段时间的守候，山南记得你</view>
      <view class="expired-cta" @click="goPlaza">去广场，找一棵等你的树 →</view>
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
            <image v-for="(url, idx) in log.image_urls" :key="idx" :src="url" mode="aspectFill" @click="activeImage = url" />
          </scroll-view>
        </view>
      </view>
    </view>
    <view class="timeline-empty" v-else>
      <view class="timeline-empty-icon">🧑‍🌾</view>
      <view class="timeline-empty-title">农场主正在路上</view>
      <view class="timeline-empty-sub">等待第一条生长记录</view>
    </view>
    <view v-if="updates.length > 0" class="view-all-btn" @click="goUpdates">查看全部记录 →</view>

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

    <!-- 图片全屏查看器 -->
    <view v-if="activeImage" class="img-viewer" @click="activeImage = null">
      <view class="img-viewer-close">✕</view>
      <image :src="activeImage" mode="aspectFit" class="img-viewer-img" @click.stop="" />
    </view>

    <!-- 探望 + 年报入口 -->
    <view class="visit-bar">
      <view class="visit-btn" @click="goVisit" style="flex:1;">
        <text class="visit-icon">📷</text>
        <text class="visit-text">探望我的树</text>
        <text class="visit-sub">查看实时照片与历史时间轴</text>
      </view>
      <view class="report-btn" @click="openReport">
        <text class="report-icon">📋</text>
        <text class="report-label">守候报告</text>
      </view>
    </view>

    <!-- 年度守候报告弹窗 -->
    <view v-if="showReport" class="report-mask" @click.self="showReport=false">
      <view class="report-wrap">
        <view class="report-hint">长按图片保存</view>
        <canvas canvas-id="reportCanvas" id="reportCanvas"
          width="630" height="1120"
          class="report-canvas" style="width:315px;height:560px;"></canvas>
        <view class="report-actions">
          <button class="report-save-btn" @click="saveReport">保存到相册</button>
          <view class="report-close-link" @click="showReport=false">关闭</view>
        </view>
      </view>
    </view>

    <!-- 到期提醒 / 已结束 CTA -->
    <view v-if="order && (order.status === 'expired' || order.status === 'EXPIRED')" class="expire-notice expired-notice">
      <view class="expire-icon">🍃</view>
      <view class="expire-title">这段守候已画上句点</view>
      <view class="expire-sub">感谢你陪伴山南走过这段时光</view>
      <view class="expire-cta" @click="goPlaza">去认养下一棵 →</view>
    </view>
    <view v-else-if="order && daysRemaining !== null && daysRemaining <= 30 && daysRemaining >= 0" class="expire-notice renew-notice">
      <view class="expire-title">守候还剩 {{ daysRemaining }} 天</view>
      <view class="expire-sub">与这棵树的缘分即将进入尾声，考虑续期？</view>
      <view class="expire-cta" @click="goPlaza">续期 / 认养新的一棵 →</view>
    </view>

    <!-- 返回按钮 -->
    <view style="text-align: center; margin: 32rpx 0 60rpx;">
      <text style="color: #999; font-size: 28rpx; cursor: pointer;" @click="goBack">返回列表</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { getMyOrders, getOrderUpdates, getOrderDeliveries } from '@/api/orders.js'
import { SERVER_URL } from '@/config.js'
import { getTreeMood, countJieqiBetween } from '@/utils/treeMood.js'

const order = ref(null)
const updates = ref([])
const deliveries = ref([])
const orderId = ref(null)
const activeImage = ref(null)
const dedication = ref('')
const showReport = ref(false)

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

const daysRemaining = computed(() => {
  if (!order.value || !order.value.expire_date) return null
  const expire = new Date(order.value.expire_date)
  const today = new Date()
  return Math.ceil((expire - today) / (1000 * 60 * 60 * 24))
})

const latestUpdate = computed(() => {
  return updates.value[0] || null
})

const isExpired = computed(() => daysRemaining.value !== null && daysRemaining.value <= 0)

const treeMoodText = computed(() => {
  const now = new Date()
  return getTreeMood(now.getHours(), now.getMonth() + 1)
})

const jieqiCount = computed(() => {
  if (!order.value?.start_date) return 0
  return countJieqiBetween(order.value.start_date)
})

const deliveredCount = computed(() => {
  return deliveries.value.filter(d =>
    d.status === 'delivered' || d.status === 'DELIVERED'
  ).length
})

const heroImage = computed(() => {
  // 优先使用最新更新的第一张图
  if (updates.value.length > 0 && updates.value[0].image_urls?.length > 0) {
    const url = updates.value[0].image_urls[0]
    if (url.startsWith('http')) return url
    return SERVER_URL + url
  }
  // 其次用认养对象的cover_image
  if (order.value?.target?.cover_image) {
    const cover = order.value.target.cover_image
    if (cover.startsWith('http')) return cover
    return SERVER_URL + cover
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
  const map = {
    season: '茶树认养·季度版', annual: '茶树认养·年度版', trial: '茶树认养·体验版',
    tea_basic: '茶树认养·基础档', tea_standard: '茶树认养·标准档', plant_basic: '植物认养·季度版'
  }
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

const goPlaza = () => {
  uni.switchTab({ url: '/pages/plaza/index' })
}

const goVisit = () => {
  uni.navigateTo({ url: '/pages/camera/index' })
}

const goUpdates = () => {
  uni.navigateTo({ url: '/pages/order/updates?order_id=' + orderId.value })
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  orderId.value = currentPage.options?.order_id
  if (orderId.value) {
    loadData()
    // 读取本地存储的寄语（兼容后端未存的情况）
    const local = uni.getStorageSync('dedication_' + orderId.value) || ''
    dedication.value = local
  }
})

const openReport = () => {
  showReport.value = true
  setTimeout(drawReport, 100)
}

const drawReport = () => {
  nextTick(() => {
    const o = order.value
    if (!o) return
    const ctx = uni.createCanvasContext('reportCanvas')
    const W = 630, H = 1120

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#0a1e0c')
    grad.addColorStop(0.5, '#0f2812')
    grad.addColorStop(1, '#071208')
    ctx.setFillStyle(grad)
    ctx.fillRect(0, 0, W, H)

    // Subtle texture lines
    ctx.setStrokeStyle('rgba(255,255,255,0.03)')
    ctx.setLineWidth(1)
    for (let i = 0; i < H; i += 24) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke()
    }

    // Top year badge
    ctx.setTextAlign('center')
    ctx.setFontSize(20)
    ctx.setFillStyle('rgba(212,169,106,0.55)')
    const now = new Date()
    ctx.fillText(`${now.getFullYear()}  ·  守 候 报 告`, W / 2, 72)

    // Thin gold rule
    ctx.setStrokeStyle('rgba(212,169,106,0.2)')
    ctx.setLineWidth(0.5)
    ctx.beginPath(); ctx.moveTo(80, 90); ctx.lineTo(W - 80, 90); ctx.stroke()

    // Tree name
    const name = o.target?.name || '我的守候'
    ctx.setFontSize(42)
    ctx.setFillStyle('#ffffff')
    ctx.fillText(name, W / 2, 158)

    // Location
    ctx.setFontSize(20)
    ctx.setFillStyle('rgba(255,255,255,0.3)')
    ctx.fillText('秦岭南麓 · 汉中西乡 · 海拔800m', W / 2, 192)

    // ── Main hero stat ──
    const days = adoptDays.value
    ctx.setFontSize(16)
    ctx.setFillStyle('rgba(255,255,255,0.35)')
    ctx.fillText('与这棵树', W / 2, 282)
    ctx.setFontSize(108)
    ctx.setFillStyle('#ffffff')
    ctx.fillText(String(days), W / 2, 390)
    ctx.setFontSize(36)
    ctx.setFillStyle('rgba(255,255,255,0.6)')
    ctx.fillText('天', W / 2, 432)
    ctx.setFontSize(16)
    ctx.setFillStyle('rgba(255,255,255,0.35)')
    ctx.fillText('相处的日子', W / 2, 462)

    // ── 4-column stats ──
    const stats = [
      { num: jieqiCount.value,       label: '个节气' },
      { num: updates.value.length,   label: '条动态' },
      { num: deliveredCount.value,   label: '包已寄' },
      { num: Math.max(0, daysRemaining.value || 0), label: '天守候' },
    ]
    const colW = W / 4
    const statsY = 540

    // stats background pill
    ctx.setFillStyle('rgba(255,255,255,0.05)')
    ctx.beginPath()
    ctx.roundRect(40, statsY - 20, W - 80, 110, 16)
    ctx.fill()

    stats.forEach((s, i) => {
      const cx = colW * i + colW / 2
      ctx.setFontSize(46)
      ctx.setFillStyle('#ffffff')
      ctx.fillText(String(s.num), cx, statsY + 54)
      ctx.setFontSize(18)
      ctx.setFillStyle('rgba(255,255,255,0.4)')
      ctx.fillText(s.label, cx, statsY + 80)
      if (i > 0) {
        ctx.setStrokeStyle('rgba(255,255,255,0.1)')
        ctx.setLineWidth(1)
        ctx.beginPath(); ctx.moveTo(cx - colW / 2, statsY + 4); ctx.lineTo(cx - colW / 2, statsY + 92); ctx.stroke()
      }
    })

    // ── Mood quote ──
    ctx.setStrokeStyle('rgba(212,169,106,0.15)')
    ctx.setLineWidth(0.5)
    ctx.beginPath(); ctx.moveTo(80, 690); ctx.lineTo(W - 80, 690); ctx.stroke()

    ctx.setFontSize(22)
    ctx.setFillStyle('rgba(255,255,255,0.5)')
    // Word-wrap the mood text (~24 chars per line)
    const mood = treeMoodText.value
    const lines = []
    const maxW = 460
    let cur = ''
    for (const ch of mood) {
      cur += ch
      if (ctx.measureText(cur).width > maxW) { lines.push(cur.slice(0, -1)); cur = ch }
    }
    if (cur) lines.push(cur)
    lines.forEach((l, i) => ctx.fillText(l, W / 2, 730 + i * 36))

    // ── Dedication ──
    if (dedication.value) {
      const dedY = 730 + lines.length * 36 + 40
      ctx.setFontSize(20)
      ctx.setFillStyle('rgba(212,169,106,0.7)')
      ctx.fillText(`"${dedication.value}"`, W / 2, dedY)
    }

    // ── Footer ──
    ctx.setStrokeStyle('rgba(212,169,106,0.2)')
    ctx.setLineWidth(0.5)
    ctx.beginPath(); ctx.moveTo(80, H - 90); ctx.lineTo(W - 80, H - 90); ctx.stroke()
    ctx.setFontSize(22)
    ctx.setFillStyle('rgba(212,169,106,0.6)')
    ctx.fillText('山 南 记', W / 2, H - 62)
    ctx.setFontSize(17)
    ctx.setFillStyle('rgba(255,255,255,0.2)')
    ctx.fillText('shannanji.com', W / 2, H - 40)

    ctx.draw()
  })
}

const saveReport = () => {
  uni.canvasToTempFilePath({
    canvasId: 'reportCanvas',
    success: (res) => {
      uni.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
        fail: () => uni.showToast({ title: '保存失败，请长按图片保存', icon: 'none' })
      })
    }
  })
}

const loadData = async () => {
  uni.showLoading({ title: '加载中...', mask: true })
  try {
    // 加载订单列表，然后查找当前订单
    const orders = await getMyOrders()
    order.value = orders.find(o => o.id === Number(orderId.value))
    // 优先使用后端返回的寄语，fallback 本地存储
    if (order.value?.dedication) dedication.value = order.value.dedication
    // 加载更新和配送
    updates.value = await getOrderUpdates(orderId.value)
    deliveries.value = await getOrderDeliveries(orderId.value)
  } catch (e) {
    console.error(e)
    uni.showToast({ title: '信号不太好，稍后再试', icon: 'none' })
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
  font-size: 28rpx;
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
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
  margin-bottom: 20rpx;
}
.tree-mood {
  display: flex; align-items: flex-start; gap: 10rpx;
  background: #f5f9f5; border-radius: 12rpx;
  padding: 18rpx 20rpx; margin-bottom: 28rpx;
}
.tree-mood-icon { font-size: 26rpx; flex-shrink: 0; }
.tree-mood-text {
  font-size: 26rpx; color: #5a8a52;
  line-height: 1.7; font-style: italic;
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
  padding: 80rpx 40rpx;
  display: flex; flex-direction: column; align-items: center; gap: 16rpx;
}
.view-all-btn {
  text-align: right;
  font-size: 26rpx;
  color: #2d5a27;
  padding: 0 30rpx 40rpx;
  cursor: pointer;
}
.timeline-empty-icon { font-size: 72rpx; }
.timeline-empty-title { font-size: 30rpx; color: #666; font-weight: 500; }
.timeline-empty-sub { font-size: 24rpx; color: #bbb; }

.no-update-hint { margin-top: 24rpx; }
.no-update-text { font-size: 24rpx; color: #bbb; font-style: italic; }

.expired-notice {
  margin: 32rpx 30rpx 0;
  background: #fff;
  border-radius: 20rpx;
  padding: 48rpx 40rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}
.expired-icon { font-size: 72rpx; margin-bottom: 20rpx; }
.expired-title { font-size: 34rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
.expired-sub { font-size: 26rpx; color: #999; line-height: 1.6; margin-bottom: 32rpx; }
.expired-cta { font-size: 26rpx; color: #2d5a27; }

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
.img-viewer {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.95); z-index: 300;
  display: flex; align-items: center; justify-content: center;
}
.img-viewer-close {
  position: absolute; top: 60rpx; right: 40rpx;
  font-size: 40rpx; color: rgba(255,255,255,0.7); padding: 20rpx;
}
.img-viewer-img { width: 100vw; height: 75vw; }

/* 寄语卡片 */
.dedication-card {
  background: linear-gradient(135deg, #fffdf5 0%, #fff9ee 100%);
  border: 1.5rpx solid rgba(212,169,106,0.25);
  border-radius: 16rpx; padding: 24rpx 28rpx;
  margin-bottom: 28rpx;
}
.dedication-quote {
  display: block; font-size: 28rpx; color: #8a6520;
  font-style: italic; line-height: 1.7;
}
.dedication-hint {
  display: block; font-size: 20rpx; color: #caa050;
  margin-top: 8rpx; text-align: right;
}
/* 探望 + 年报 */
.visit-bar {
  margin: 32rpx 30rpx 0;
  display: flex; gap: 16rpx; align-items: stretch;
}
.visit-btn {
  background: linear-gradient(135deg, #1a3d16 0%, #2d5a27 100%);
  border-radius: 20rpx;
  padding: 36rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  box-shadow: 0 4rpx 20rpx rgba(45,90,39,0.3);
}
.visit-icon { font-size: 48rpx; }
.visit-text { font-size: 32rpx; font-weight: bold; color: white; }
.visit-sub { font-size: 22rpx; color: rgba(255,255,255,0.6); }
.report-btn {
  background: #f5f9f5; border: 1.5rpx solid #d0e8cc;
  border-radius: 20rpx; padding: 28rpx 20rpx;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10rpx;
  width: 120rpx; flex-shrink: 0; cursor: pointer;
}
.report-icon { font-size: 40rpx; }
.report-label { font-size: 22rpx; color: #2d5a27; font-weight: 600; }
/* 年报弹窗 */
.report-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85); z-index: 200;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.report-wrap { display: flex; flex-direction: column; align-items: center; gap: 24rpx; }
.report-hint { font-size: 24rpx; color: rgba(255,255,255,0.5); }
.report-canvas {
  border-radius: 16rpx;
  box-shadow: 0 0 0 2rpx rgba(212,169,106,0.4), 0 20rpx 60rpx rgba(0,0,0,0.5);
}
.report-actions { display: flex; flex-direction: column; align-items: center; gap: 16rpx; width: 560rpx; }
.report-save-btn {
  width: 100%; background: linear-gradient(135deg, #2d5a27, #3d7a35);
  color: white; border: none; border-radius: 999rpx;
  padding: 24rpx; font-size: 30rpx;
}
.report-close-link { font-size: 26rpx; color: rgba(255,255,255,0.4); padding: 8rpx; }

.expire-notice {
  margin: 32rpx 30rpx; border-radius: 20rpx; padding: 40rpx 36rpx; text-align: center;
}
.expired-notice {
  background: #f5f5f0; border: 1rpx solid #e8e8e0;
}
.renew-notice {
  background: linear-gradient(135deg, #fff8e1, #fff3cd);
  border: 1rpx solid #f0d080;
}
.expire-icon { font-size: 48rpx; margin-bottom: 16rpx; }
.expire-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 10rpx; }
.expire-sub { font-size: 24rpx; color: #888; margin-bottom: 24rpx; }
.expire-cta { font-size: 26rpx; color: #2d5a27; font-weight: 500; }
</style>
