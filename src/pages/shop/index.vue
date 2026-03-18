<template>
  <view class="container">
    <view style="text-align: center; margin: 48rpx 0 32rpx;">
      <view style="font-size: 36rpx; font-weight: bold; color: #2d5a27;">认养方式</view>
      <view style="font-size: 28rpx; color: #999; margin-top: 8rpx;">选一种方式，和这块土地保持联系</view>
    </view>

    <view v-if="loading" style="text-align:center; padding: 60rpx; color: #999;">加载中...</view>

    <template v-else>
      <!-- 茶树认养分组 -->
      <view class="section-group" v-if="teaPlans.length">
        <view class="group-title">茶树认养</view>
        <view class="card" v-for="plan in teaPlans" :key="plan.id" style="margin-bottom: 24rpx;" @click="showDetail(plan)">
          <view style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx;">
            <view style="font-size: 30rpx; font-weight: bold;">{{ plan.name }}</view>
            <view style="font-size: 32rpx; color: #2d5a27; font-weight: bold;">¥{{ formatPrice(plan.price) }}</view>
          </view>
          <view style="font-size: 26rpx; color: #666; margin-bottom: 20rpx;">{{ plan.description }}</view>
          <view class="benefits">
            <text class="benefit-tag" v-for="(tag, i) in plan.benefits" :key="i">{{ tag }}</text>
          </view>
          <view style="text-align: right; margin-top: 16rpx;">
            <text style="font-size: 24rpx; color: #2d5a27;">查看详情 ›</text>
          </view>
        </view>
      </view>

      <!-- 植物认养分组 -->
      <view class="section-group" v-if="plantPlans.length">
        <view class="group-title">植物认养</view>
        <view class="card" v-for="plan in plantPlans" :key="plan.id" style="margin-bottom: 24rpx;" @click="showDetail(plan)">
          <view style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx;">
            <view style="font-size: 30rpx; font-weight: bold;">{{ plan.name }}</view>
            <view style="font-size: 32rpx; color: #2d5a27; font-weight: bold;">¥{{ formatPrice(plan.price) }}</view>
          </view>
          <view style="font-size: 26rpx; color: #666; margin-bottom: 20rpx;">{{ plan.description }}</view>
          <view class="benefits">
            <text class="benefit-tag" v-for="(tag, i) in plan.benefits" :key="i">{{ tag }}</text>
          </view>
          <view style="text-align: right; margin-top: 16rpx;">
            <text style="font-size: 24rpx; color: #2d5a27;">查看详情 ›</text>
          </view>
        </view>
      </view>

      <!-- 其他分组 -->
      <view class="section-group" v-if="otherPlans.length">
        <view class="group-title">其他认养</view>
        <view class="card" v-for="plan in otherPlans" :key="plan.id" style="margin-bottom: 24rpx;" @click="showDetail(plan)">
          <view style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx;">
            <view style="font-size: 30rpx; font-weight: bold;">{{ plan.name }}</view>
            <view style="font-size: 32rpx; color: #2d5a27; font-weight: bold;">¥{{ formatPrice(plan.price) }}</view>
          </view>
          <view style="font-size: 26rpx; color: #666; margin-bottom: 20rpx;">{{ plan.description }}</view>
          <view class="benefits">
            <text class="benefit-tag" v-for="(tag, i) in plan.benefits" :key="i">{{ tag }}</text>
          </view>
          <view style="text-align: right; margin-top: 16rpx;">
            <text style="font-size: 24rpx; color: #2d5a27;">查看详情 ›</text>
          </view>
        </view>
      </view>
    </template>

    <view style="padding: 0 32rpx; margin-top: 60rpx;">
      <button class="cta-outline" @click="goPlaza">去看看有哪些还没有主人</button>
    </view>

    <!-- 套餐详情弹窗 -->
    <view v-if="selectedPlan" class="overlay" @click.self="closeDetail">
      <view class="drawer">
        <view class="drawer-header">
          <view style="font-size: 32rpx; font-weight: bold; color: #2d5a27;">{{ selectedPlan.name }}</view>
          <view style="font-size: 36rpx; font-weight: bold; color: #2d5a27; margin-top: 8rpx;">¥{{ formatPrice(selectedPlan.price) }}</view>
          <view style="font-size: 26rpx; color: #999; margin-top: 8rpx;">{{ selectedPlan.description }}</view>
        </view>
        <view class="drawer-divider"></view>
        <view class="drawer-body">
          <view style="font-size: 28rpx; color: #333; font-weight: 600; margin-bottom: 20rpx;">套餐包含</view>
          <view class="rich-text" v-html="selectedPlan.details"></view>
        </view>
        <view class="drawer-footer">
          <button class="btn-adopt" @click="goPlaza">去选一棵认养</button>
          <view style="text-align: center; margin-top: 20rpx;" @click="closeDetail">
            <text style="font-size: 26rpx; color: #999;">关闭</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { SERVER_URL } from '@/config.js'
export default {
  data() {
    return {
      plans: [],
      loading: true,
      selectedPlan: null
    }
  },
  computed: {
    teaPlans() { return this.plans.filter(p => p.category === 'tea') },
    plantPlans() { return this.plans.filter(p => p.category === 'plant') },
    otherPlans() { return this.plans.filter(p => p.category !== 'tea' && p.category !== 'plant') }
  },
  onShow() {
    this.fetchPlans()
  },
  methods: {
    async fetchPlans() {
      this.loading = true
      try {
        const res = await uni.request({ url: `${SERVER_URL}/api/plans`, method: 'GET' })
        this.plans = res.data || []
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    formatPrice(price) {
      return (price / 100).toFixed(0)
    },
    showDetail(plan) {
      this.selectedPlan = plan
    },
    closeDetail() {
      this.selectedPlan = null
    },
    goPlaza() {
      this.selectedPlan = null
      uni.switchTab({ url: '/pages/plaza/index' })
    }
  }
}
</script>

<style scoped>
.container { padding: 32rpx; min-height: 100vh; box-sizing: border-box; background: #f5f5f0; }
.section-group { margin-bottom: 60rpx; }
.group-title {
  font-size: 17px; font-weight: 600; color: #2d5a27;
  margin-bottom: 24rpx; padding-bottom: 12rpx;
  border-bottom: 2rpx solid #e8e8e8;
}
.card { background: #fff; border-radius: 16rpx; padding: 32rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.card:active { background: #f9fdf9; }
.benefits { display: flex; gap: 16rpx; flex-wrap: wrap; }
.benefit-tag { background: #f0f9f0; color: #2d5a27; padding: 8rpx 16rpx; border-radius: 999rpx; font-size: 24rpx; }
.cta-outline {
  background-color: #fff; color: #2d5a27; border: 2rpx solid #2d5a27;
  border-radius: 999rpx; padding: 24rpx; font-size: 32rpx; width: 100%;
}
.cta-outline:active { background-color: #f5f5f0; }
.overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45); z-index: 999;
  display: flex; align-items: flex-end;
}
.drawer {
  background: #fff; width: 100%; border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 40rpx 60rpx; max-height: 80vh; overflow-y: auto;
}
.drawer-header { margin-bottom: 24rpx; }
.drawer-divider { height: 2rpx; background: #f0f0f0; margin-bottom: 32rpx; }
.drawer-body { margin-bottom: 40rpx; }
.rich-text { font-size: 28rpx; color: #444; line-height: 1.8; }
.drawer-footer {}
.btn-adopt {
  background: #2d5a27; color: #fff; border-radius: 999rpx;
  padding: 28rpx; font-size: 32rpx; width: 100%; border: none;
}
.btn-adopt:active { background: #234820; }
</style>
