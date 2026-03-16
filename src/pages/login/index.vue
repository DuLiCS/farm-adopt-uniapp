<template>
  <view class="container">
    <view class="card" style="margin-top: 120px;">
      <view class="logo">
        <text style="font-size: 64rpx; color: #2d5a27;">🌱</text>
        <view style="font-size: 36rpx; font-weight: bold; margin-top: 16rpx;">山南记 - 登录</view>
      </view>

      <view style="margin-top: 48px;">
        <input class="input-field" v-model="phone" placeholder="请输入手机号" type="number" maxlength="11" style="height: 48px; font-size: 16px;" />
        <input class="input-field" v-model="password" placeholder="请输入密码" type="password" style="height: 48px; font-size: 16px;" />
      </view>

      <view v-if="error" style="color: #c0392b; font-size: 28rpx; margin-bottom: 16rpx;">
        {{ error }}
      </view>

      <button class="button-primary" style="width: 100%; margin-top: 32rpx;" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <view style="text-align: center; margin-top: 24rpx;">
        <text class="text-muted">还没有账号？</text>
        <text class="text-primary" style="margin-left: 12rpx; cursor: pointer;" @click="goRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script>
import { login } from '@/api/auth.js'

export default {
  data() {
    return {
      phone: '',
      password: '',
      error: '',
      loading: false
    }
  },
  methods: {
    goRegister() {
      uni.navigateTo({ url: '/pages/register/index' })
    },
    async handleLogin() {
      this.error = ''
      if (!this.phone || !this.password) {
        this.error = '请填写手机号和密码'
        return
      }

      this.loading = true
      uni.showLoading({ title: '登录中...', mask: true })
      try {
        const res = await login(this.phone, this.password)
        uni.setStorageSync('token', res.access_token)
 uni.setStorageSync('phone', this.phone)
        uni.hideLoading()
        uni.showToast({ title: '登录成功', icon: 'success' })
        // 跳转到首页（tabBar页面）
        setTimeout(() => {
          uni.switchTab({ url: '/pages/home/index' })
        }, 500)
      } catch (e) {
        uni.hideLoading()
        this.error = e.message || '登录失败'
        uni.showToast({ title: this.error, icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    console.log('登录页面已加载')
  }
}
</script>

<style scoped>
.container { padding: 32px; min-height: 100vh; box-sizing: border-box; }
.card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.button-primary { background-color: #2d5a27; color: #fff; border: none; border-radius: 999px; padding: 16px 32px; font-size: 16px; width: 100%; cursor: pointer; height: 56px; }
.input-field { border: 1px solid #eee; border-radius: 12px; padding: 16px; font-size: 16px; margin-bottom: 24px; background: #fff; width: 100%; box-sizing: border-box; height: 48px; }
.text-primary { color: #2d5a27; cursor: pointer; }
.text-muted { color: #999; }
</style>