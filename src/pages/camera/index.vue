<template>
  <view class="container">

    <!-- 实时预览区 -->
    <view class="live-section">
      <view class="live-header">
        <view class="live-dot"></view>
        <text class="live-label">农庄实况</text>
        <text class="live-time">{{ liveTime }}</text>
      </view>
      <image
        class="live-img"
        :src="liveUrl"
        mode="aspectFill"
        @error="onLiveError"
      />
      <view v-if="liveError" class="live-error">
        <text>📷 实时画面暂不可用</text>
      </view>
    </view>

    <!-- 时间轴照片 -->
    <view class="timeline-section">
      <view class="section-title">历史照片</view>

      <view v-if="loading" class="loading-tip">加载中...</view>
      <view v-else-if="dates.length === 0" class="empty-tip">暂无照片记录</view>

      <view v-else>
        <view class="date-group" v-for="group in dates" :key="group.date">
          <view class="date-label">{{ group.date }}</view>
          <scroll-view scroll-x class="photo-row">
            <view class="photo-item" v-for="photo in group.photos" :key="photo.filename"
              @click="openPhoto(photo)">
              <image :src="serverUrl + photo.url" mode="aspectFill" class="photo-thumb" lazy-load />
              <text class="photo-time">{{ photo.time.substring(0, 5) }}</text>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <!-- 全屏查看 -->
    <view v-if="activePhoto" class="viewer-mask" @click="activePhoto=null">
      <image :src="serverUrl + activePhoto.url" mode="aspectFit" class="viewer-img" />
      <view class="viewer-info">
        <text class="viewer-datetime">{{ activePhoto.datetime }}</text>
        <button class="viewer-save-btn" @click.stop="savePhoto">保存照片</button>
      </view>
    </view>

  </view>
</template>

<script>
import { SERVER_URL } from '@/config.js'

export default {
  data() {
    return {
      serverUrl: SERVER_URL,
      dates: [],
      loading: true,
      activePhoto: null,
      liveError: false,
      liveUrl: SERVER_URL + '/static/photos/live.jpg?t=' + Date.now(),
      liveTime: ''
    }
  },

  onLoad() {
    this.loadPhotos()
    this.updateLiveTime()
    this.liveTimer = setInterval(() => {
      this.updateLiveTime()
    }, 60000)
  },

  onUnload() {
    if (this.liveTimer) clearInterval(this.liveTimer)
  },

  methods: {
    async loadPhotos() {
      this.loading = true
      try {
        const res = await uni.request({
          url: SERVER_URL + '/api/photos',
          method: 'GET'
        })
        if (res.data && res.data.dates) {
          this.dates = res.data.dates
        }
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    openPhoto(photo) {
      this.activePhoto = photo
    },

    onLiveError() {
      this.liveError = true
    },

    updateLiveTime() {
      const now = new Date()
      this.liveTime = now.getHours().toString().padStart(2, '0') + ':' +
        now.getMinutes().toString().padStart(2, '0') + ' 更新'
    },

    savePhoto() {
      if (!this.activePhoto) return
      uni.downloadFile({
        url: this.serverUrl + this.activePhoto.url,
        success: (res) => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => uni.showToast({ title: '已保存', icon: 'success' }),
            fail: () => uni.showToast({ title: '保存失败', icon: 'none' })
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f0; padding-bottom: 60rpx; }

.live-section { position: relative; background: #1a3d16; }
.live-header { display: flex; align-items: center; padding: 24rpx 30rpx 16rpx; gap: 12rpx; }
.live-dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: #ff4444; animation: pulse 1.5s infinite; }
.live-label { font-size: 26rpx; color: white; font-weight: bold; }
.live-time { font-size: 22rpx; color: rgba(255,255,255,0.5); margin-left: auto; }
.live-img { width: 100%; height: 420rpx; display: block; }
.live-error { height: 420rpx; display: flex; align-items: center; justify-content: center; }
.live-error text { font-size: 28rpx; color: rgba(255,255,255,0.4); }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.timeline-section { padding: 32rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #2d5a27; margin-bottom: 24rpx; }
.loading-tip, .empty-tip { text-align: center; color: #999; font-size: 28rpx; padding: 60rpx 0; }

.date-group { margin-bottom: 32rpx; }
.date-label { font-size: 24rpx; color: #999; margin-bottom: 16rpx; }

.photo-row { white-space: nowrap; }
.photo-item { display: inline-block; margin-right: 16rpx; text-align: center; }
.photo-thumb { width: 200rpx; height: 150rpx; border-radius: 12rpx; background: #e0e0e0; display: block; }
.photo-time { font-size: 20rpx; color: #999; margin-top: 8rpx; display: block; }

.viewer-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.viewer-img { width: 100vw; height: 75vw; }
.viewer-info { margin-top: 32rpx; display: flex; flex-direction: column; align-items: center; gap: 24rpx; }
.viewer-datetime { font-size: 26rpx; color: rgba(255,255,255,0.6); }
.viewer-save-btn { background: #2d5a27; color: white; border: none; border-radius: 50rpx; padding: 16rpx 48rpx; font-size: 28rpx; }
</style>
