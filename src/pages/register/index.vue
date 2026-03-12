<template>
  <view class="container">
    <view class="card" style="margin-top: 120rpx;">
      <view class="logo">
        <text style="font-size: 64rpx; color: #2d5a27;">🌱</text>
        <view style="font-size: 36rpx; font-weight: bold; margin-top: 16rpx;">注册账号</view>
        <view style="font-size: 28rpx; color: #999; margin-top: 8rpx;">创建您的山南记账户</view>
      </view>

      <view style="margin-top: 48rpx;">
        <view class="field-label">手机号 *</view>
        <input class="input-field" v-model="phone" placeholder="请输入手机号" type="number" maxlength="11" style="margin-top: 8rpx;" />
        
        <view class="field-label" style="margin-top: 24rpx;">昵称（可选）</view>
        <input class="input-field" v-model="nickname" placeholder="怎么称呼您" style="margin-top: 8rpx;" />
        
        <view class="field-label" style="margin-top: 24rpx;">密码 *</view>
        <input class="input-field" v-model="password" placeholder="设置登录密码" type="password" style="margin-top: 8rpx;" />
      </view>

      <view v-if="error" style="color: #c0392b; font-size: 28rpx; margin-bottom: 16rpx; margin-top: 24rpx;">
        {{ error }}
      </view>

      <button class="button-primary" style="width: 100%; margin-top: 32rpx; height: 56px; background-color: #2d5a27; color: #fff; border: none; border-radius: 999px; font-size: 18px;" :disabled="loading" @click="handleRegister">
        {{ loading ? '注册中...' : '注册' }}
      </button>

      <view style="text-align: center; margin-top: 32rpx;">
        <text class="text-muted">已有账号？</text>
        <text class="text-primary" style="margin-left: 12rpx; cursor: pointer; color: #2d5a27;" @click="goLogin">去登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { register as apiRegister } from '@/api/auth.js'

export default {
  data() {
    return {
      phone: '',
      nickname: '',
      password: '',
      error: '',
      loading: false
    }
  },
  methods: {
    goLogin() {
      uni.navigateBack()
    },
    async handleRegister() {
      this.error = ''
      if (!this.phone || !this.password) {
        this.error = '请填写手机号和密码'
        return
      }
      if (this.phone.length < 11) {
        this.error = '手机号应为11位'
        return
      }
      if (this.password.length < 6) {
        this.error = '密码至少6位'
        return
      }

      this.loading = true
      uni.showLoading({ title: '注册中...', mask: true })
      try {
        const res = await apiRegister(this.phone, this.password, this.nickname.trim() || undefined)
        uni.hideLoading()
        uni.showToast({ title: '注册成功', icon: 'success' })
        this.loading = false
        setTimeout(() => {
          uni.switchTab({ url: '/pages/home/index' })
        }, 500)
      } catch (e) {
        uni.hideLoading()
        this.error = e.message || '注册失败'
        uni.showToast({ title: this.error, icon: 'none' })
        this.loading = false
      }
    }
  },
  mounted() {
    console.log('注册页面已加载')
  }
}
</script>

<style scoped>
.container { padding: 32px; min-height: 100vh; box-sizing: border-box; }
.card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.button-primary { background-color: #2d5a27; color: #fff; border: none; border-radius: 999px; padding: 24px 48px; font-size: 32rpx; width: 100%; height: 56px; display: flex; align-items: center; justify-content: center; }
.input-field { border: 1px solid #eee; border-radius: 12px; padding: 24px; font-size: 28rpx; background: #fff; width: 100%; box-sizing: border-box; height: 56px; }
.field-label { font-size: 28rpx; color: #333; font-weight: 500; }
.text-primary { color: #2d5a27; font-weight: 500; }
.text-muted { color: #999; }
</style>
