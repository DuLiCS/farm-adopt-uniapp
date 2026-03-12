<template>
  <view class="container">
    <view class="hero-section" :class="targetType">
      <image v-if="target && target.cover_image" :src="getFullImageUrl(target.cover_image)" mode="aspectFill" class="hero-img" />
      <view v-else class="hero-emoji-wrap">
        <text class="hero-emoji">{{ targetTypeEmoji }}</text>
      </view>
      <view class="hero-overlay">
        <view class="hero-date">{{ todayStr }} · 秦岭南麓</view>
        <view class="hero-title">{{ target && target.name }}</view>
      </view>
    </view>

    <view class="status-card" v-if="target">
      <view class="target-location">{{ target.location_desc }}</view>
      <view v-if="target.description" class="desc-text">{{ target.description }}</view>
    </view>

    <view class="plan-section" v-if="target && target.current_status === 'active'">
      <view class="section-title">选一个方式加入</view>
      <view class="plan-list">
        <view class="plan-card" :class="{ selected: selectedPlanId === plan.id }" v-for="plan in availablePlans" :key="plan.id" @click="selectPlan(plan)">
          <view class="plan-name">{{ plan.name }}</view>
          <view class="plan-desc">{{ plan.desc }}</view>
          <view class="plan-price">¥{{ plan.price }}</view>
          <view v-if="selectedPlanId === plan.id" class="plan-check">✓ 已选择</view>
        </view>
      </view>
    </view>

    <view class="adopted-notice" v-else-if="target">
      <view class="notice-icon">🌿</view>
      <view class="notice-text">这棵树已经有人在守候了</view>
    </view>

    <view v-if="showAddressForm" class="address-mask" @click.self="showAddressForm=false">
      <view class="address-form">
        <view class="form-title">填写收货信息</view>
        <input class="form-input" v-model="address.name" placeholder="收货人姓名 *" />
        <input class="form-input" v-model="address.phone" placeholder="手机号码 *" />
        <input class="form-input" v-model="address.address" placeholder="详细地址（省市区+街道）*" />
        <input class="form-input" v-model="address.note" placeholder="备注（可选）" />
        <button class="form-submit-btn" @click="confirmOrder">确认下单</button>
        <button class="form-cancel-btn" @click="showAddressForm=false">取消</button>
      </view>
    </view>

    <view class="cta-bar" v-if="target">
      <view class="cta-info">
        <view class="cta-label">认养方式</view>
        <view class="cta-plan-name">{{ selectedPlanName || '请选择套餐' }}</view>
        <view class="cta-price" v-if="selectedPlanPrice">¥{{ selectedPlanPrice }}<text style="font-size: 24rpx; color: #999;">/认养</text></view>
      </view>
      <button :disabled="!canSubmit" :class="!canSubmit ? 'cta-btn-disabled' : 'cta-btn'" @click="submitOrder">{{ submitBtnText }}</button>
    </view>
  </view>
</template>

<script>
import { getPlazaTargetDetail } from '@/api/plaza.js'
import { PLANS } from '@/config.js'

export default {
  data() {
    return {
      target: null,
      updates: [],
      targetId: null,
      selectedPlanId: null,
      loading: false,
      showAddressForm: false,
      address: { name: '', phone: '', address: '', note: '' }
    }
  },

  computed: {
    todayStr() {
      const now = new Date()
      return now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日'
    },
    targetType() {
      if (!this.target) return ''
      return (this.target.type || '').toLowerCase()
    },
    targetTypeEmoji() {
      return this.targetType === 'tea' ? '🍃' : '🌿'
    },
    availablePlans() {
      if (!this.target) return []
      const type = (this.target.type || '').toLowerCase()
      if (type === 'tea') return PLANS.filter(p => p.type === 'tea')
      if (type === 'hydroponic') return PLANS.filter(p => p.type === 'plant')
      return []
    },
    selectedPlan() {
      if (!this.selectedPlanId) return null
      return this.availablePlans.find(p => p.id === this.selectedPlanId) || null
    },
    selectedPlanName() { return this.selectedPlan ? this.selectedPlan.name : '' },
    selectedPlanPrice() { return this.selectedPlan ? this.selectedPlan.price : null },
    canSubmit() {
      return this.target && this.target.current_status === 'active' && !!this.selectedPlanId
    },
    submitBtnText() {
      if (!this.target) return '加载中'
      if (this.target.current_status !== 'active') return '已被认养'
      if (!this.selectedPlanId) return '选好了再来'
      return '加入山南记'
    }
  },

  onLoad(options) {
    this.targetId = Number(options.target_id)
    this.loadDetail()
  },

  methods: {
    getFullImageUrl(path) {
      if (!path) return ''
      if (path.startsWith('http')) return path
      return 'http://47.102.138.74' + path
    },

    async loadDetail() {
      uni.showLoading({ title: '加载中...', mask: true })
      try {
        const data = await getPlazaTargetDetail(this.targetId)
        this.target = data.target
        this.updates = data.updates.slice(0, 3)
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    selectPlan(plan) {
      this.selectedPlanId = plan.id
    },

    submitOrder() {
      if (!this.canSubmit) return
      const token = uni.getStorageSync('token') || ''
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => { uni.navigateTo({ url: '/pages/login/index' }) }, 1500)
        return
      }
      this.showAddressForm = true
    },

    async confirmOrder() {
      if (!this.address.name || !this.address.phone || !this.address.address) {
        uni.showToast({ title: '请填写完整收货信息', icon: 'none' })
        return
      }
      if (this.loading) return
      this.loading = true
      try {
        uni.showLoading({ title: '创建订单中...' })
        const res = await uni.request({
          url: '/orders/',
          method: 'POST',
          header: { 'Authorization': 'Bearer ' + (uni.getStorageSync('token') || '') },
          data: {
            target_id: this.target.id,
            plan_type: this.selectedPlanId,
            price: this.selectedPlanPrice,
            receiver_name: this.address.name,
            receiver_phone: this.address.phone,
            receiver_address: this.address.address,
            receiver_note: this.address.note
          }
        })
        uni.hideLoading()
        if (res.data && res.data.id) {
          this.showAddressForm = false
          uni.redirectTo({ url: '/pages/order/detail?id=' + res.data.id })
        } else {
          throw new Error((res.data && res.data.detail) || '创建订单失败')
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: (error && error.message) || '网络错误，请重试', icon: 'none', duration: 2000 })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.container { padding: 0; min-height: 100vh; background: #f5f5f0; padding-bottom: 140rpx; }
.hero-section {
  position: relative; min-height: 300rpx; padding: 80rpx 40rpx 40rpx;
  display: flex; align-items: flex-end; justify-content: center;
  overflow: hidden; background-color: #2d5a27;
}
.hero-section.tea { background: linear-gradient(160deg, #2d5a27 0%, #4a7c3f 60%, #5a8f4a 100%); }
.hero-section.hydroponic { background: linear-gradient(160deg, #2d5a27 0%, #4a7c3f 60%, #5a8f4a 100%); }
.hero-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; }
.hero-emoji-wrap { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.hero-emoji { font-size: 60px; opacity: 0.3; }
.hero-overlay { position: relative; z-index: 2; width: 100%; color: white; text-align: center; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.hero-title { font-size: 22px; font-weight: bold; margin-top: 8rpx; }
.hero-date { font-size: 14px; opacity: 0.8; margin-bottom: 8rpx; }
.status-card { margin: -40rpx 30rpx 0; background: white; border-radius: 24rpx; padding: 40rpx; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08); }
.target-location { font-size: 28rpx; color: #666; }
.desc-text { margin-top: 12rpx; font-size: 26rpx; color: #888; line-height: 1.6; }
.plan-section { margin: 40rpx 30rpx; }
.section-title { font-size: 17px; font-weight: 600; color: #2d5a27; margin-bottom: 24rpx; }
.plan-list { display: flex; flex-direction: column; gap: 24rpx; }
.plan-card { background: white; border-radius: 16rpx; padding: 32rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); position: relative; border: 2rpx solid transparent; }
.plan-card.selected { border-color: #2d5a27; background: #f6f9f4; }
.plan-name { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.plan-desc { font-size: 26rpx; color: #666; line-height: 1.5; margin-bottom: 16rpx; }
.plan-price { font-size: 36rpx; font-weight: bold; color: #2d5a27; }
.plan-check { position: absolute; top: 20rpx; right: 20rpx; background: #2d5a27; color: white; padding: 6rpx 16rpx; border-radius: 999rpx; font-size: 22rpx; }
.adopted-notice { margin: 80rpx 30rpx; text-align: center; padding: 60rpx; background: white; border-radius: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.notice-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.notice-text { font-size: 28rpx; color: #666; }
.address-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: flex-end; }
.address-form { background: white; width: 100%; border-radius: 24rpx 24rpx 0 0; padding: 40rpx; padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); }
.form-title { font-size: 32rpx; font-weight: bold; color: #333; margin-bottom: 32rpx; text-align: center; }
.form-input { width: 100%; border: 1px solid #e0e0e0; border-radius: 12rpx; padding: 24rpx; margin-bottom: 20rpx; font-size: 28rpx; box-sizing: border-box; }
.form-submit-btn { width: 100%; background: #2d5a27; color: white; border: none; border-radius: 50rpx; padding: 24rpx; font-size: 30rpx; margin-top: 16rpx; }
.form-cancel-btn { width: 100%; background: none; color: #999; border: none; font-size: 28rpx; margin-top: 16rpx; padding: 16rpx; }
.cta-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 24rpx 30rpx; background: white; box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.08); padding-bottom: calc(24rpx + env(safe-area-inset-bottom)); }
.cta-info { flex: 1; }
.cta-label { font-size: 24rpx; color: #999; }
.cta-plan-name { font-size: 28rpx; font-weight: bold; color: #333; margin-top: 4rpx; }
.cta-price { font-size: 32rpx; font-weight: bold; color: #2d5a27; margin-top: 8rpx; }
.cta-btn { background: #2d5a27; color: white; border: none; border-radius: 50rpx; padding: 20rpx 48rpx; font-size: 30rpx; }
.cta-btn-disabled { background: #ccc; color: #999; }
</style>
