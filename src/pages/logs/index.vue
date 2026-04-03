<template>
  <view class="container">
    <view v-if="loading && logs.length === 0" class="loading-state">加载中...</view>

    <view v-else-if="logs.length === 0" class="empty-state">
      <view class="empty-icon">🌿</view>
      <view class="empty-text">暂无日志记录</view>
    </view>

    <view v-else>
      <view class="log-item" v-for="log in logs" :key="log.id">
        <view class="log-left">
          <view class="log-dot"></view>
          <view class="log-line" v-if="logs.indexOf(log) < logs.length - 1"></view>
        </view>
        <view class="log-right">
          <view class="log-meta">
            <view class="log-tag" :class="'tag-' + (log.log_type || 'daily').toLowerCase()">{{ logTypeLabel(log.log_type) }}</view>
            <view class="log-time">{{ formatTime(log.updated_at) }}</view>
          </view>
          <view class="log-title" v-if="log.title">{{ log.title }}</view>
          <view class="log-desc">{{ log.description }}</view>
        </view>
      </view>

      <view class="load-more" v-if="hasMore" @click="loadMore">
        <text v-if="loading">加载中...</text>
        <text v-else>加载更多</text>
      </view>
      <view class="no-more" v-else-if="logs.length > 0">已是全部记录</view>
    </view>
  </view>
</template>

<script>
import { SERVER_URL } from '@/config.js'

export default {
  data() {
    return {
      logs: [],
      loading: false,
      page: 1,
      pageSize: 20,
      hasMore: true
    }
  },

  onLoad() {
    this.fetchLogs()
  },

  methods: {
    async fetchLogs(append = false) {
      if (this.loading) return
      this.loading = true
      try {
        const res = await uni.request({
          url: `${SERVER_URL}/api/logs?page=${this.page}&page_size=${this.pageSize}&status=published`,
          method: 'GET'
        })
        const raw = res.data
        let items = []
        if (Array.isArray(raw)) items = raw
        else if (Array.isArray(raw?.data)) items = raw.data
        else if (Array.isArray(raw?.data?.items)) items = raw.data.items
        else if (Array.isArray(raw?.items)) items = raw.items
        if (append) {
          this.logs = this.logs.concat(items)
        } else {
          this.logs = items
        }
        this.hasMore = items.length >= this.pageSize
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    loadMore() {
      this.page++
      this.fetchLogs(true)
    },

    logTypeLabel(type) {
      const map = {
        daily: '日常', DAILY: '日常',
        solar_term: '节气', SOLAR_TERM: '节气',
        harvest: '收获', HARVEST: '收获',
        delivery: '配送', DELIVERY: '配送'
      }
      return map[type] || '日志'
    },

    formatTime(t) {
      if (!t) return ''
      const dt = new Date(t + 'Z')
      return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f0; padding: 32rpx; padding-bottom: 60rpx; }

.loading-state { text-align: center; padding: 120rpx 0; color: #999; font-size: 28rpx; }
.empty-state { text-align: center; padding: 120rpx 0; }
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-text { font-size: 28rpx; color: #999; }

.log-item { display: flex; gap: 0; margin-bottom: 0; }

.log-left {
  display: flex; flex-direction: column; align-items: center;
  width: 32rpx; flex-shrink: 0; padding-top: 8rpx;
}
.log-dot {
  width: 16rpx; height: 16rpx; border-radius: 50%;
  background: #2d5a27; flex-shrink: 0;
}
.log-line { flex: 1; width: 2rpx; background: #e0e8de; margin-top: 8rpx; min-height: 40rpx; }

.log-right { flex: 1; padding: 0 0 40rpx 24rpx; }

.log-meta { display: flex; align-items: center; gap: 16rpx; margin-bottom: 12rpx; }
.log-tag {
  font-size: 20rpx; padding: 4rpx 16rpx; border-radius: 999rpx;
  background: #e8f5e9; color: #2d5a27;
}
.log-tag.tag-solar_term { background: #fff8e1; color: #e6a817; }
.log-tag.tag-harvest { background: #fce4ec; color: #c2185b; }
.log-tag.tag-delivery { background: #e3f2fd; color: #1565c0; }
.log-time { font-size: 22rpx; color: #bbb; }

.log-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 10rpx; line-height: 1.5; }
.log-desc { font-size: 26rpx; color: #666; line-height: 1.8; }

.load-more {
  text-align: center; padding: 40rpx 0; font-size: 28rpx; color: #2d5a27;
}
.no-more { text-align: center; padding: 40rpx 0; font-size: 24rpx; color: #ccc; }
</style>
