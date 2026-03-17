<template>
  <view class="container">

    <view class="latest-section" v-if="latestPhoto">
      <image class="latest-img" :src="serverUrl + latestPhoto.url" mode="aspectFill"/>
      <view class="latest-overlay">
        <view class="latest-badge">📷 最新照片</view>
        <view class="latest-time">{{ latestPhoto.datetime }}</view>
      </view>
    </view>
    <view class="latest-empty" v-else>
      <text class="empty-icon">📷</text>
      <text class="empty-text">暂无照片，白天每小时自动拍摄</text>
    </view>

    <view class="timeline-section">
      <view class="section-title">时光记录</view>
      <view v-if="loading" class="tip">加载中...</view>
      <view v-else-if="processedDates.length === 0" class="tip">暂无照片记录</view>
      <view v-else>
        <view class="date-group" v-for="group in processedDates" :key="group.date">

          <view class="date-header" @click="toggleDay(group.date)">
            <view class="date-left">
              <text class="date-label">{{ group.date }}</text>
              <text v-if="group.jieqi" class="jieqi-tag">{{ group.jieqi }}</text>
            </view>
            <view class="date-right">
              <text class="photo-count">{{ group.photos.length }}张</text>
              <text class="expand-arrow">{{ expandedDays[group.date] ? "∧" : "∨" }}</text>
            </view>
          </view>

          <view v-if="!expandedDays[group.date]">
            <scroll-view scroll-x class="photo-row">
              <view
                class="photo-item"
                v-for="photo in group.keyFrames"
                :key="photo.filename"
                @click="openPhoto(photo)"
              >
                <image :src="serverUrl + photo.url" mode="aspectFill" class="photo-thumb" lazy-load/>
                <text class="photo-time">{{ photo.slotLabel }}</text>
              </view>
            </scroll-view>
          </view>

          <view v-else>
            <scroll-view scroll-x class="photo-row">
              <view
                class="photo-item"
                v-for="photo in group.photos"
                :key="photo.filename"
                @click="openPhoto(photo)"
              >
                <image :src="serverUrl + photo.url" mode="aspectFill" class="photo-thumb" lazy-load/>
                <text class="photo-time">{{ photo.time.substring(0, 5) }}</text>
              </view>
            </scroll-view>
          </view>

        </view>
      </view>
    </view>

    <view v-if="activePhoto" class="viewer-mask" @click="activePhoto=null">
      <view class="viewer-close">✕</view>
      <image :src="serverUrl + activePhoto.url" mode="aspectFit" class="viewer-img" @click.stop=""/>
      <view class="viewer-info" @click.stop="">
        <text class="viewer-datetime">{{ activePhoto.datetime }}</text>
        <button class="viewer-save-btn" @click.stop="savePhoto">保存照片</button>
      </view>
    </view>

  </view>
</template>

<script>
import { SERVER_URL } from '@/config.js'

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
}

const SLOTS = [
  { label: '黎明', start: 5, end: 7 },
  { label: '上午', start: 8, end: 11 },
  { label: '正午', start: 12, end: 14 },
  { label: '下午', start: 15, end: 17 },
  { label: '黄昏', start: 18, end: 21 },
  { label: '夜间', start: 22, end: 4 },
]

function getHour(timeStr) {
  return parseInt((timeStr || '00:00:00').split(':')[0])
}

function pickKeyFrames(photos) {
  const frames = []
  SLOTS.forEach(slot => {
    let candidates
    if (slot.start < slot.end) {
      candidates = photos.filter(p => {
        const h = getHour(p.time)
        return h >= slot.start && h <= slot.end
      })
    } else {
      candidates = photos.filter(p => {
        const h = getHour(p.time)
        return h >= slot.start || h <= slot.end
      })
    }
    if (candidates.length === 0) return
    let pick = candidates[0]
    if (slot.label === '正午') {
      pick = candidates.reduce((a, b) =>
        Math.abs(getHour(a.time) - 12) <= Math.abs(getHour(b.time) - 12) ? a : b
      )
    } else if (slot.label === '黄昏' || slot.label === '夜间') {
      pick = candidates[candidates.length - 1]
    }
    frames.push({ ...pick, slotLabel: slot.label })
  })
  return frames
}

export default {
  data() {
    return {
      serverUrl: SERVER_URL,
      dates: [],
      loading: true,
      activePhoto: null,
      expandedDays: {}
    }
  },

  computed: {
    latestPhoto() {
      if (this.dates.length === 0) return null
      const firstGroup = this.dates[0]
      if (!firstGroup.photos || firstGroup.photos.length === 0) return null
      return firstGroup.photos[0]
    },
    processedDates() {
      return this.dates.map(group => ({
        ...group,
        jieqi: JIEQI[group.date] || null,
        keyFrames: pickKeyFrames(group.photos)
      }))
    }
  },

  onLoad() {
    this.loadPhotos()
  },

  methods: {
    async loadPhotos() {
      this.loading = true
      try {
        const res = await uni.request({ url: SERVER_URL + '/api/photos', method: 'GET' })
        if (res.data && res.data.dates) {
          this.dates = res.data.dates
        }
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    toggleDay(date) {
      this.expandedDays = { ...this.expandedDays, [date]: !this.expandedDays[date] }
    },
    openPhoto(photo) {
      this.activePhoto = photo
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
        },
        fail: () => uni.showToast({ title: '下载失败', icon: 'none' })
      })
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f0; padding-bottom: 60rpx; }
.latest-section { position: relative; height: 480rpx; overflow: hidden; background: #1a3d16; }
.latest-img { width: 100%; height: 100%; }
.latest-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 24rpx 30rpx; background: linear-gradient(transparent, rgba(0,0,0,0.6)); }
.latest-badge { font-size: 22rpx; color: rgba(255,255,255,0.8); margin-bottom: 8rpx; }
.latest-time { font-size: 26rpx; color: white; font-weight: 500; }
.latest-empty { height: 300rpx; background: #1a3d16; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16rpx; }
.empty-icon { font-size: 64rpx; }
.empty-text { font-size: 26rpx; color: rgba(255,255,255,0.5); }
.timeline-section { padding: 32rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #2d5a27; margin-bottom: 24rpx; }
.tip { text-align: center; color: #999; font-size: 28rpx; padding: 60rpx 0; }
.date-group { margin-bottom: 36rpx; }
.date-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; padding: 16rpx 0; cursor: pointer; }
.date-left { display: flex; align-items: center; gap: 12rpx; }
.date-label { font-size: 26rpx; color: #666; }
.jieqi-tag { font-size: 20rpx; color: #2d5a27; background: rgba(45,90,39,0.1); padding: 4rpx 12rpx; border-radius: 999rpx; }
.date-right { display: flex; align-items: center; gap: 12rpx; }
.photo-count { font-size: 22rpx; color: #bbb; }
.expand-arrow { font-size: 22rpx; color: #bbb; }
.photo-row { white-space: nowrap; }
.photo-item { display: inline-flex; flex-direction: column; align-items: center; margin-right: 16rpx; }
.photo-thumb { width: 200rpx; height: 150rpx; border-radius: 12rpx; background: #e0e0e0; }
.photo-time { font-size: 20rpx; color: #999; margin-top: 8rpx; }
.viewer-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 200; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.viewer-close { position: absolute; top: 60rpx; right: 40rpx; font-size: 40rpx; color: rgba(255,255,255,0.7); padding: 20rpx; }
.viewer-img { width: 100vw; height: 75vw; }
.viewer-info { margin-top: 40rpx; display: flex; flex-direction: column; align-items: center; gap: 24rpx; }
.viewer-datetime { font-size: 26rpx; color: rgba(255,255,255,0.6); }
.viewer-save-btn { background: #2d5a27; color: white; border: none; border-radius: 50rpx; padding: 18rpx 56rpx; font-size: 28rpx; }
</style>
