<template>
  <view class="container">
    <view v-if="loading" style="text-align: center; margin-top: 120px; color: #999;">
      加载中...
    </view>

    <view v-else>
      <view v-if="updates.length === 0" style="text-align: center; margin-top: 120px; color: #999;">
        暂无更新记录
      </view>

      <view v-else>
        <view style="padding-left: 24rpx;" v-for="(u, idx) in updates" :key="u.id">
          <!-- 时间线节点 -->
          <view style="position: relative;">
            <!-- 圆点 -->
            <view :style="{
              position: 'absolute',
              left: '-24rpx',
              top: '8rpx',
              width: '16rpx',
              height: '16rpx',
              borderRadius: '50%',
              backgroundColor: '#2d5a27'
            }"></view>
            <!-- 竖线（除最后一项） -->
            <view v-if="idx < updates.length - 1" :style="{
              position: 'absolute',
              left: '-16rpx',
              top: '24rpx',
              width: '2px',
              height: 'calc(100% + 0px)',
              backgroundColor: '#eee'
            }"></view>

            <view class="card" style="margin-left: 24rpx; margin-bottom: 24rpx;">
              <view style="font-size: 28rpx; margin-bottom: 8rpx;">
                {{ u.description }}
              </view>
              <view v-if="u.image_urls && u.image_urls.length" style="display: flex; flex-wrap: wrap; margin-top: 12rpx;">
                <image v-for="(img, i) in u.image_urls" :key="i" :src="img" alt="" style="width: 200rpx; height: 200rpx; border-radius: 8rpx; margin-right: 12rpx; margin-bottom: 12rpx;" />
              </view>
              <view style="font-size: 24rpx; color: #999; margin-top: 12rpx;">
                {{ formatDate(u.updated_at) }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderUpdates } from '@/api/orders.js'

export default {
  data() {
    return {
      updates: [],
      loading: false,
      orderId: null
    }
  },
  onLoad(options) {
    this.orderId = Number(options.order_id)
    this.fetchUpdates()
  },
  methods: {
    async fetchUpdates() {
      this.loading = true
      uni.showLoading({ title: '加载中...', mask: true })
      try {
        const data = await getOrderUpdates(this.orderId)
        this.updates = data || []
        uni.hideLoading()
      } catch (e) {
        uni.hideLoading()
        console.error(e)
        uni.showToast({ title: '加载失败，请重试', icon: 'none' })
        this.updates = []
      } finally {
        this.loading = false
      }
    },
    formatDate(val) {
      if (!val) return ''
      return val.replace('T', ' ').substring(0, 19)
    }
  },
  mounted() {
    console.log('订单更新页面已加载')
  }
}
</script>

<style scoped>
.container { padding: 32px; min-height: 100vh; box-sizing: border-box; }
.card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
</style>