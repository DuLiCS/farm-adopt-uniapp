<template>
  <view class="container">
    <!-- 顶部 -->
    <view class="plaza-header">
      <view class="logo">🌿 山南广场</view>
      <view class="nav-right">
        <text v-if="!isLoggedIn" @click="goLogin">登录</text>
        <text v-else class="user-status" @click="handleLogout">已登录</text>
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

    <!-- 山南对象列表 -->
    <view class="section">
      <view class="section-title">还没有主人</view>
      <view class="target-grid">
        <view class="target-card" v-for="target in availableTargets" :key="target.id" @click="goPreview(target.id)">
          <view class="card-img" v-if="target.cover_image" :class="target.type?.toLowerCase()">
            <image :src="getFullImageUrl(target.cover_image)" mode="aspectFill" class="cover-image" lazy-load />
          </view>
          <view v-else class="card-img" :class="target.type?.toLowerCase()">
            <text v-if="target.type?.toLowerCase() === 'tea'" class="emoji">🍃</text>
            <text v-else class="emoji">🌿</text>
          </view>
          <view class="card-body">
            <view class="card-name">{{ target.name }}</view>
            <view class="card-location">{{ target.location_desc }}</view>
            <view class="card-status available">等待认养</view>
          </view>
        </view>
      </view>
    </view>

    <view class="section" v-if="adoptedTargets.length > 0">
      <view class="section-title">已有人在守候</view>
      <view class="target-grid">
        <view class="target-card" v-for="target in adoptedTargets" :key="target.id" @click="goPreview(target.id)">
          <view class="card-img" v-if="target.cover_image" :class="target.type?.toLowerCase()">
            <image :src="getFullImageUrl(target.cover_image)" mode="aspectFill" class="cover-image" lazy-load />
          </view>
          <view v-else class="card-img" :class="target.type?.toLowerCase()">
            <text v-if="target.type?.toLowerCase() === 'tea'" class="emoji">🍃</text>
            <text v-else class="emoji">🌿</text>
          </view>
          <view class="card-body">
            <view class="card-name">{{ target.name }}</view>
            <view class="card-location">{{ target.location_desc }}</view>
            <view class="card-status adopted">已加入</view>
          </view>
        </view>
      </view>
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

export default {
  data() {
    return {
      bannerImage: '',
      bannerTitle: '一棵茶树，一年的来往',
      bannerSub: '汉中·西乡，海拔800米，春茶将出',
      bannerImage: '',
      bannerTitle: '一棵茶树，一年的来往',
      bannerSub: '汉中·西乡，海拔800米，春茶将出',
      availableTargets: [],
      adoptedTargets: [],
      isLoggedIn: false,
      sensorData: null,
      latestLog: null
    }
  },

  onShow() {
    const token = uni.getStorageSync('token')
    this.isLoggedIn = !!token
    this.loadTargets()
  },

  onLoad() {
    this.loadSettings()
    this.loadSettings()
    this.loadTargets()
    this.loadSensorData()
    this.loadLatestLog()
  },

  computed: {
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
      try {
        const targets = await getPlazaTargets()
        if (!Array.isArray(targets)) {
          console.warn('getPlazaTargets 返回非数组:', targets)
          this.availableTargets = []
          this.adoptedTargets = []
          return
        }
        this.availableTargets = targets.filter(t => t.current_status === 'active')
        this.adoptedTargets = targets.filter(t => t.current_status && t.current_status !== 'active')
      } catch (e) {
        console.error('加载失败:', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
        this.availableTargets = []
        this.adoptedTargets = []
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
  padding: 24rpx 32rpx; background: #2d5a27; color: white;
}
.logo { font-size: 32rpx; font-weight: bold; }
.nav-right text { font-size: 28rpx; cursor: pointer; }
.user-status { color: rgba(255,255,255,0.8); }

.banner-bg-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
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

.section { padding: 40rpx 0; }
.section-title {
  font-size: 17px; font-weight: 600; color: #2d5a27;
  margin-bottom: 24rpx; padding: 24rpx 30rpx 12rpx;
}

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
.log-card { background: white; border-radius: 16rpx; padding: 32rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06); }
.log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.log-tag { font-size: 22rpx; color: white; background: #2d5a27; padding: 4rpx 16rpx; border-radius: 999rpx; }
.log-time { font-size: 22rpx; color: #bbb; }
.log-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 12rpx; }
.log-desc { font-size: 26rpx; color: #666; line-height: 1.7; margin-bottom: 20rpx; }
.log-more { font-size: 24rpx; color: #2d5a27; text-align: right; }
</style>
