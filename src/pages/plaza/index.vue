<template>
  <view class="container">
    <!-- 顶部（custom nav） -->
    <view class="plaza-header">
      <view class="logo">🌿 山南</view>
      <view class="nav-right">
        <text v-if="!isLoggedIn" class="nav-btn" @click="goLogin">登录</text>
        <text v-else class="user-status" @click="handleLogout">{{ maskedPhone }}</text>
      </view>
    </view>

    <!-- Banner -->
    <view class="hero-banner">
      <image v-if="bannerImage" :src="bannerImage" mode="aspectFill" class="banner-bg-img" />
      <view class="banner-overlay">
        <view class="banner-title">{{ bannerTitle }}</view>
        <view class="banner-sub">{{ bannerSub }}</view>
      </view>
    </view>

    <!-- 传感器实况角标 -->
    <view class="sensor-bar" v-if="sensorData">
      <view class="sensor-bar-item">🌡 {{ sensorData.temperature }}°C</view>
      <view class="sensor-bar-divider">·</view>
      <view class="sensor-bar-item">💧 {{ sensorData.humidity }}%</view>
      <view class="sensor-bar-divider">·</view>
      <view class="sensor-bar-item sensor-bar-time">{{ sensorUpdateText }}</view>
    </view>

    <!-- 今日节气 -->
    <view class="jieqi-card" v-if="jieqiInfo">
      <view v-if="jieqiInfo.type === 'today'" class="jieqi-today">
        <view class="jieqi-today-name">{{ jieqiInfo.name }}</view>
        <view class="jieqi-today-label">今日节气</view>
        <view class="jieqi-copy">{{ jieqiInfo.copy }}</view>
      </view>
      <view v-else class="jieqi-countdown">
        <view class="jieqi-countdown-main">
          <text class="jieqi-label-sm">距</text>
          <text class="jieqi-name-em">{{ jieqiInfo.name }}</text>
          <text class="jieqi-label-sm">还有</text>
          <text class="jieqi-days-em">{{ jieqiInfo.days }}</text>
          <text class="jieqi-label-sm">天</text>
        </view>
        <view class="jieqi-countdown-copy">{{ jieqiInfo.copy }}</view>
      </view>
    </view>

    <!-- 类型筛选 -->
    <view class="filter-bar">
      <view v-for="f in typeFilters" :key="f.value"
        class="filter-tab" :class="{ active: activeFilter === f.value }"
        @click="activeFilter = f.value">{{ f.label }}</view>
    </view>

    <!-- 骨架屏 -->
    <view v-if="loading" class="section">
      <view class="section-title skel-line" style="width:120rpx;height:32rpx;margin-bottom:24rpx;"></view>
      <view class="target-grid">
        <view class="skeleton-card" v-for="i in 4" :key="i">
          <view class="skel skel-img"></view>
          <view style="padding:16rpx;">
            <view class="skel skel-name"></view>
            <view class="skel skel-loc"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 山南对象列表 -->
    <view class="section" v-if="availableTargets.length > 0">
      <view class="section-header">
        <view class="section-title">等待有缘人</view>
      </view>
      <view class="target-grid" v-if="filteredAvailable.length > 0">
        <view class="target-card" v-for="target in filteredAvailable" :key="target.id" @click="goPreview(target.id)">
          <view class="card-img" v-if="target.cover_image" :class="target.type?.toLowerCase()">
            <image :src="getFullImageUrl(target.cover_image)" mode="aspectFill" class="cover-image" lazy-load />
            <view class="card-type-badge">{{ target.type?.toLowerCase() === 'tea' ? '茶树' : '植物' }}</view>
          </view>
          <view v-else class="card-img" :class="target.type?.toLowerCase()">
            <text v-if="target.type?.toLowerCase() === 'tea'" class="emoji">🍃</text>
            <text v-else class="emoji">🌿</text>
            <view class="card-type-badge">{{ target.type?.toLowerCase() === 'tea' ? '茶树' : '植物' }}</view>
          </view>
          <view class="card-body">
            <view class="card-name">{{ target.name }}</view>
            <view class="card-location">{{ target.location_desc }}</view>
            <view class="card-status available">等待认养</view>
            <view class="card-waiting" v-if="waitingDays(target)">已等待 {{ waitingDays(target) }} 天</view>
          </view>
        </view>
      </view>
      <view class="filter-empty" v-else>
        <text>这个分类暂时没有等待认养的对象</text>
      </view>
    </view>

    <view class="section all-adopted" v-else-if="adoptedTargets.length > 0">
      <view class="all-adopted-text">山南每一棵都有人守候了 🌿</view>
      <view class="all-adopted-sub">等待续约或新的对象上架</view>
    </view>

    <view class="section" v-if="!loading && adoptedTargets.length > 0">
      <view class="section-title">已有人在守候</view>
      <view class="target-grid">
        <view class="target-card adopted-card" v-for="target in adoptedTargets" :key="target.id" @click="goPreview(target.id)">
          <view class="card-img" v-if="target.cover_image" :class="target.type?.toLowerCase()">
            <image :src="getFullImageUrl(target.cover_image)" mode="aspectFill" class="cover-image" lazy-load />
            <view class="card-type-badge adopted">{{ target.type?.toLowerCase() === 'tea' ? '茶树' : '植物' }}</view>
          </view>
          <view v-else class="card-img" :class="target.type?.toLowerCase()">
            <text v-if="target.type?.toLowerCase() === 'tea'" class="emoji">🍃</text>
            <text v-else class="emoji">🌿</text>
            <view class="card-type-badge adopted">{{ target.type?.toLowerCase() === 'tea' ? '茶树' : '植物' }}</view>
          </view>
          <view class="card-body">
            <view class="card-name">{{ target.name }}</view>
            <view class="card-location">{{ target.location_desc }}</view>
            <view class="card-status adopted">守候中</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 完全无对象时的空状态 -->
    <view class="plaza-empty" v-if="targetsLoaded && availableTargets.length === 0 && adoptedTargets.length === 0">
      <view class="plaza-empty-icon">🌱</view>
      <view class="plaza-empty-title">山南正在准备新的对象</view>
      <view class="plaza-empty-sub">还没有上架认养的茶树或植物<br>等等，快了</view>
    </view>

    <!-- 农庄日志 -->
    <view class="log-section" v-if="latestLog">
      <view class="log-card">
        <view class="log-header">
          <view class="log-tag">{{ logTypeLabel(latestLog.log_type) }}</view>
          <view class="log-time">{{ formatLogTime(latestLog.updated_at) }}</view>
        </view>
        <view class="log-title" v-if="latestLog.title">{{ latestLog.title }}</view>
        <view class="log-desc">{{ truncateLog(latestLog.description) }}</view>
        <view class="log-more" @click="goLogs">查看更多日志 →</view>
      </view>
    </view>

    <!-- 哲学文案区 -->
    <view class="philosophy-section">
      <view class="philosophy-text">
        山南记不卖茶，<br>我们只是帮你守着那棵树。
      </view>
    </view>
  </view>
</template>

<script>
import { getPlazaTargets } from '@/api/plaza.js'
import { SERVER_URL } from '@/config.js'
import { storage } from '@/utils/storage'

const JIEQI = {
  '2026-01-05': '小寒', '2026-01-20': '大寒',
  '2026-02-04': '立春', '2026-02-19': '雨水',
  '2026-03-06': '惊蛰', '2026-03-20': '春分',
  '2026-04-05': '清明', '2026-04-20': '谷雨',
  '2026-05-06': '立夏', '2026-05-21': '小满',
  '2026-06-06': '芒种', '2026-06-21': '夏至',
  '2026-07-07': '小暑', '2026-07-23': '大暑',
  '2026-08-07': '立秋', '2026-08-23': '处暑',
  '2026-09-08': '白露', '2026-09-23': '秋分',
  '2026-10-08': '寒露', '2026-10-23': '霜降',
  '2026-11-07': '立冬', '2026-11-22': '小雪',
  '2026-12-07': '大雪', '2026-12-22': '冬至',
  '2027-01-05': '小寒', '2027-01-20': '大寒',
  '2027-02-03': '立春', '2027-02-18': '雨水',
  '2027-03-06': '惊蛰', '2027-03-21': '春分',
  '2027-04-05': '清明', '2027-04-20': '谷雨',
  '2027-05-06': '立夏', '2027-05-21': '小满',
  '2027-06-06': '芒种', '2027-06-21': '夏至',
  '2027-07-07': '小暑', '2027-07-23': '大暑',
  '2027-08-07': '立秋', '2027-08-23': '处暑',
  '2027-09-08': '白露', '2027-09-23': '秋分',
  '2027-10-08': '寒露', '2027-10-23': '霜降',
  '2027-11-07': '立冬', '2027-11-22': '小雪',
  '2027-12-07': '大雪', '2027-12-22': '冬至',
  '2028-01-06': '小寒', '2028-01-21': '大寒',
  '2028-02-04': '立春', '2028-02-19': '雨水',
  '2028-03-05': '惊蛰', '2028-03-20': '春分',
  '2028-04-04': '清明', '2028-04-19': '谷雨',
  '2028-05-05': '立夏', '2028-05-20': '小满',
  '2028-06-05': '芒种', '2028-06-21': '夏至',
  '2028-07-06': '小暑', '2028-07-22': '大暑',
  '2028-08-07': '立秋', '2028-08-22': '处暑',
  '2028-09-07': '白露', '2028-09-22': '秋分',
  '2028-10-07': '寒露', '2028-10-22': '霜降',
  '2028-11-07': '立冬', '2028-11-21': '小雪',
  '2028-12-06': '大雪', '2028-12-21': '冬至',
}

const JIEQI_COPY = {
  '小寒': '山南天寒，茶树在雪下悄悄积蓄力量',
  '大寒': '一年最冷的时候，也是等待最有意义的时候',
  '立春': '春意萌动，茶芽已在枝头悄悄探头',
  '雨水': '春雨润土，茶园从沉睡中缓缓苏醒',
  '惊蛰': '一声春雷，万物从冬眠中被轻轻唤醒',
  '春分': '昼夜均等，茶树迎来最平衡的生长时节',
  '清明': '明前茶贵如金，最好的春茶正在等你',
  '谷雨': '雨润百谷，春茶进入最后的采摘窗口',
  '立夏': '绿意渐浓，茶园进入夏日守候',
  '小满': '枝繁叶茂，茶树在初夏中静静生长',
  '芒种': '收获与播种并行，农庄最忙碌的节气',
  '夏至': '最长的白天，山南茶树全力进行光合',
  '小暑': '暑气渐盛，茶树在高温中默默沉淀内质',
  '大暑': '一年最热，茶树以沉默对抗酷暑',
  '立秋': '暑去秋来，茶叶开始新一轮积累',
  '处暑': '暑气消散，秋茶悄然萌发',
  '白露': '露珠晶莹，秋茶带着清晨的气息',
  '秋分': '平分秋色，丰收与感谢的时节',
  '寒露': '秋意渐深，茶树准备进入休眠',
  '霜降': '初霜将至，茶树最后一次深呼吸',
  '立冬': '冬季开始，茶树进入一年的休养',
  '小雪': '山南初雪，茶园银装素裹',
  '大雪': '大雪封山，茶树在雪下做着春天的梦',
  '冬至': '最短的白天，也是新一轮轮回的起点',
}

export default {
  data() {
    return {
      loading: false,
      bannerImage: '',
      bannerTitle: '一棵茶树，一年的来往',
      bannerSub: '汉中·西乡，海拔800米，春茶将出',
      availableTargets: [],
      adoptedTargets: [],
      isLoggedIn: false,
      phone: '',
      targetsLoaded: false,
      sensorData: null,
      latestLog: null,
      activeFilter: 'all',
      typeFilters: [
        { label: '全部', value: 'all' },
        { label: '🍃 茶树', value: 'tea' },
        { label: '🌿 植物', value: 'plant' },
      ]
    }
  },

  onShow() {
    this.isLoggedIn = !!storage.getToken()
    this.phone = storage.getPhone()
    this.loadTargets()
  },

  onLoad() {
    this.loadSettings()
    this.loadSensorData()
    this.loadLatestLog()
  },

  onPullDownRefresh() {
    Promise.all([
      this.loadTargets(),
      this.loadSensorData(),
      this.loadLatestLog()
    ]).finally(() => uni.stopPullDownRefresh())
  },

  computed: {
    filteredAvailable() {
      if (this.activeFilter === 'all') return this.availableTargets
      return this.availableTargets.filter(t => {
        const type = (t.type || '').toLowerCase()
        if (this.activeFilter === 'tea') return type === 'tea'
        return type !== 'tea'
      })
    },
    jieqiInfo() {
      const now = new Date()
      const pad = n => String(n).padStart(2, '0')
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
      if (JIEQI[todayStr]) {
        const name = JIEQI[todayStr]
        return { type: 'today', name, copy: JIEQI_COPY[name] || '' }
      }
      const next = Object.keys(JIEQI).sort().find(d => d > todayStr)
      if (!next) return null
      const diffDays = Math.ceil((new Date(next) - now) / 86400000)
      const name = JIEQI[next]
      return { type: 'countdown', name, days: diffDays, copy: JIEQI_COPY[name] || '' }
    },
    maskedPhone() {
      if (!this.phone || this.phone.length < 8) return ''
      return '···' + this.phone.slice(-4)
    },
    sensorUpdateText() {
      if (!this.sensorData || !this.sensorData.recorded_at) return ''
      const now = new Date()
      const recorded = new Date(this.sensorData.recorded_at + 'Z')
      const diffMin = Math.floor((now - recorded) / 60000)
      if (diffMin < 1) return '刚刚更新'
      if (diffMin < 60) return diffMin + '分钟前更新'
      const diffHour = Math.floor(diffMin / 60)
      if (diffHour < 24) return diffHour + '小时前更新'
      return Math.floor(diffHour / 24) + '天前更新'
    }
  },

  methods: {
    async loadLatestLog() {
      try {
        const res = await uni.request({
          url: SERVER_URL + '/api/logs/latest',
          method: 'GET'
        })
        if (res.data && res.data.data) {
          this.latestLog = res.data.data
        }
      } catch (e) {}
    },

    goLogs() {
      uni.navigateTo({ url: '/pages/logs/index' })
    },

    logTypeLabel(type) {
      const map = { daily: '日常', DAILY: '日常', solar_term: '节气', SOLAR_TERM: '节气', harvest: '收获', HARVEST: '收获', delivery: '配送', DELIVERY: '配送' }
      return map[type] || '日志'
    },

    truncateLog(str) {
      if (!str) return ''
      return str.length > 80 ? str.substring(0, 80) + '...' : str
    },

    formatLogTime(t) {
      if (!t) return ''
      const dt = new Date(t + 'Z')
      return (dt.getMonth()+1) + '月' + dt.getDate() + '日'
    },

    async loadSensorData() {
      try {
        const res = await uni.request({
          url: SERVER_URL + '/api/sensor/latest?device_id=esp32-farm-01',
          method: 'GET'
        })
        if (res.data && res.data.temperature !== undefined) {
          this.sensorData = res.data
        }
      } catch (e) {}
    },

    async loadTargets() {
      this.loading = true
      try {
        const targets = await getPlazaTargets()
        if (!Array.isArray(targets)) {
          console.warn('getPlazaTargets 返回非数组:', targets)
          this.availableTargets = []
          this.adoptedTargets = []
          this.targetsLoaded = true
          return
        }
        this.availableTargets = targets.filter(t => t.current_status === 'active')
        this.adoptedTargets = targets.filter(t => t.current_status && t.current_status !== 'active')
        this.targetsLoaded = true
      } catch (e) {
        console.error('加载失败:', e)
        uni.showToast({ title: '信号不太好，稍后再试', icon: 'none' })
        this.availableTargets = []
        this.adoptedTargets = []
      } finally {
        this.loading = false
        this.targetsLoaded = true
      }
    },

    async loadSettings() {
      try {
        const res = await uni.request({ url: SERVER_URL + '/api/settings', method: 'GET' })
        if (res.data) {
          if (res.data.banner_image) this.bannerImage = SERVER_URL + res.data.banner_image
          if (res.data.banner_title) this.bannerTitle = res.data.banner_title
          if (res.data.banner_sub) this.bannerSub = res.data.banner_sub
        }
      } catch (e) {}
    },
    getFullImageUrl(path) {
      if (!path) return ''
      // 如果是完整URL直接返回，否则拼接服务器地址
      if (path.startsWith('http')) return path
      return SERVER_URL + path
    },

    goPreview(targetId) {
      uni.navigateTo({ url: `/pages/plaza/preview?target_id=${targetId}` })
    },

    goLogin() {
      uni.navigateTo({ url: '/pages/login/index' })
    },

    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确认退出？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync()
            this.isLoggedIn = false
            uni.showToast({ title: '已退出', icon: 'success' })
          }
        }
      })
    },

    typeLabel(type) {
      const map = { tea: '茶树认养', hydroponic: '无土栽培' }
      const key = type ? type.toLowerCase() : type
      return map[key] || type
    },

    waitingDays(target) {
      if (!target.created_at) return null
      const created = new Date(target.created_at)
      const now = new Date()
      const days = Math.max(0, Math.floor((now - created) / 86400000))
      return days > 0 ? days : null
    },

    defaultImage(type) {
      const key = type ? type.toLowerCase() : type
      if (key === 'tea') return '../../assets/images/tea-card.jpg'
      if (key === 'hydroponic') return '../../assets/images/hydroponic-card.jpg'
      return '../../assets/images/tea-card.jpg'
    }
  }
}
</script>

<style scoped>
.container { padding: 0; min-height: 100vh; background: #f5f5f0; }

.plaza-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12rpx 32rpx 16rpx;
  padding-top: calc(12rpx + var(--status-bar-height, 0px));
  background: #2d5a27; color: white;
}
.logo { font-size: 30rpx; font-weight: 700; letter-spacing: 0.5px; }
.nav-btn { font-size: 26rpx; background: rgba(255,255,255,0.18); padding: 8rpx 24rpx; border-radius: 999rpx; }
.nav-right text { font-size: 26rpx; cursor: pointer; }
.user-status { font-size: 24rpx; color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.12); padding: 6rpx 20rpx; border-radius: 999rpx; }

.banner-bg-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; display: block; }
.hero-banner { position: relative; overflow: hidden;
  background: linear-gradient(160deg, #2d5a27 0%, #4a7c3f 60%, #5a8f4a 100%);
  min-height: 320rpx;
  padding: 80rpx 40rpx 40rpx;
}
.banner-overlay { position: relative; z-index: 1;
  display: flex; flex-direction: column; justify-content: flex-end; height: 100%;
  color: white;
}
.banner-title { font-size: 22px; font-weight: bold; line-height: 1.4; }
.banner-sub { font-size: 14px; opacity: 0.85; margin-top: 12rpx; }

.section { padding: 20rpx 0 40rpx; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 30rpx 16rpx; }
.section-title {
  font-size: 17px; font-weight: 600; color: #2d5a27;
}
.filter-tabs { display: flex; gap: 12rpx; }
.filter-tab {
  font-size: 22rpx; color: #999; padding: 8rpx 18rpx;
  border-radius: 999rpx; background: #f0f0ec;
  transition: background 0.2s, color 0.2s;
}
.filter-tab.active { background: #2d5a27; color: white; }
.filter-empty { text-align: center; color: #bbb; font-size: 26rpx; padding: 60rpx 0; }

.target-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 24rpx; padding: 0 32rpx;
}

.target-card {
  background: #fff; border-radius: 16rpx; overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); display: flex; flex-direction: column;
}
.card-img {
  width: 100%; height: 160rpx; display: flex; align-items: center; justify-content: center;
  background: #e8f5e9; position: relative;
}
.card-img.tea, .card-img.hydroponic { background: #e8f5e9; }
.card-img .emoji { font-size: 60px; }
.card-img .cover-image {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  object-fit: cover;
}
.card-body { padding: 16rpx; flex: 1; display: flex; flex-direction: column; }
.card-name { font-size: 28rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.card-location { font-size: 24rpx; color: #999; margin-bottom: 12rpx; }
.card-status {
  font-size: 22rpx; padding: 6rpx 12rpx; border-radius: 8rpx; margin-top: auto; align-self: flex-start;
}
.card-status.available { background: #e8f5e9; color: #2d5a27; }
.card-status.adopted { background: #f5f5f5; color: #999; }
.card-waiting { font-size: 20rpx; color: #e8a020; margin-top: 8rpx; }
.adopted-card .card-img { filter: saturate(0.6); }

.card-type-badge {
  position: absolute; top: 12rpx; right: 12rpx;
  font-size: 18rpx; color: white;
  background: rgba(0,0,0,0.38);
  backdrop-filter: blur(4px);
  padding: 4rpx 12rpx; border-radius: 999rpx;
  font-weight: 500; letter-spacing: 0.5px;
}
.card-type-badge.adopted {
  background: rgba(0,0,0,0.25);
}
.plaza-empty { padding: 80rpx 40rpx; text-align: center; }
.plaza-empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.plaza-empty-title { font-size: 32rpx; font-weight: 500; color: #444; margin-bottom: 12rpx; }
.plaza-empty-sub { font-size: 26rpx; color: #aaa; line-height: 1.8; }
.all-adopted { padding: 48rpx 32rpx 24rpx; text-align: center; }
.all-adopted-text { font-size: 30rpx; color: #2d5a27; font-weight: 500; }
.all-adopted-sub { font-size: 24rpx; color: #aaa; margin-top: 10rpx; }

.philosophy-section {
  padding: 60rpx 32rpx; text-align: center; background: #fff; margin-top: 40rpx;
}
.philosophy-text {
  font-size: 28rpx; color: #666; line-height: 1.8; font-style: italic;
}

.sensor-bar {
  display: flex; align-items: center;
  background: rgba(45,90,39,0.08);
  padding: 16rpx 32rpx;
  gap: 12rpx;
}
.sensor-bar-item { font-size: 24rpx; color: #2d5a27; }
.sensor-bar-divider { font-size: 24rpx; color: #aaa; }
.sensor-bar-time { color: #999; margin-left: auto; }

.log-section { padding: 0 32rpx 40rpx; }

.jieqi-card { margin: 24rpx 32rpx 0; border-radius: 20rpx; overflow: hidden; }
.jieqi-today {
  background: linear-gradient(135deg, #2d5a27 0%, #4a7c3f 100%);
  padding: 32rpx 36rpx; display: flex; flex-direction: column; gap: 8rpx;
}
.jieqi-today-name { font-size: 52rpx; font-weight: bold; color: white; line-height: 1; }
.jieqi-today-label { font-size: 22rpx; color: rgba(255,255,255,0.6); }
.jieqi-copy { font-size: 26rpx; color: rgba(255,255,255,0.85); margin-top: 8rpx; line-height: 1.6; }
.jieqi-countdown {
  background: #f6faf5; border: 1rpx solid #d4e8d0;
  padding: 28rpx 36rpx;
}
.jieqi-countdown-main {
  display: flex; align-items: baseline; gap: 6rpx; flex-wrap: nowrap;
  margin-bottom: 10rpx;
}
.jieqi-label-sm { font-size: 24rpx; color: #888; }
.jieqi-name-em { font-size: 32rpx; font-weight: 700; color: #2d5a27; }
.jieqi-days-em { font-size: 44rpx; font-weight: 800; color: #2d5a27; line-height: 1; }
.jieqi-countdown-copy { font-size: 23rpx; color: #999; line-height: 1.6; }
.log-card { background: white; border-radius: 16rpx; padding: 32rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.log-tag { font-size: 22rpx; color: white; background: #2d5a27; padding: 4rpx 16rpx; border-radius: 999rpx; }
.log-time { font-size: 22rpx; color: #bbb; }
.log-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
.log-desc { font-size: 26rpx; color: #666; line-height: 1.7; margin-bottom: 20rpx; }
.log-more { font-size: 24rpx; color: #2d5a27; text-align: right; }

/* 筛选栏 */
.filter-bar { display: flex; gap: 16rpx; padding: 24rpx 32rpx 0; }
.filter-tab { font-size: 24rpx; padding: 10rpx 24rpx; border-radius: 999rpx; background: #f0f0eb; color: #666; transition: all 0.15s; }
.filter-tab.active { background: #2d5a27; color: white; }

/* 骨架屏 */
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.skel { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8rpx; }
.skeleton-card { background: white; border-radius: 16rpx; overflow: hidden; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.skel-img { width: 100%; height: 160rpx; border-radius: 0; }
.skel-name { height: 28rpx; margin-bottom: 12rpx; }
.skel-loc { height: 22rpx; width: 60%; }
.skel-line { display: block; }
</style>
