<template>
  <view class="container">
    <view class="bg-deco">
      <view class="deco-circle deco-1"></view>
      <view class="deco-circle deco-2"></view>
    </view>

    <view class="brand">
      <text class="brand-icon">🌿</text>
      <view class="brand-name">山南记</view>
      <view class="brand-sub">一棵茶树，一年的来往</view>
    </view>

    <view class="form-card">
      <view class="form-title">欢迎回来</view>

      <view class="input-wrap">
        <input class="input-field" v-model="phone" placeholder="手机号" type="number" maxlength="11" />
      </view>
      <view class="input-wrap">
        <input class="input-field" v-model="password" placeholder="密码" type="password" />
      </view>

      <view v-if="error" class="error-text">{{ error }}</view>

      <button class="btn-submit" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <view class="switch-row">
        <text class="switch-muted">还没有账号？</text>
        <text class="switch-link" @click="goRegister">立即注册</text>
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
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(160deg, #1a3d16 0%, #2d5a27 50%, #4a7c3f 100%);
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60rpx 48rpx;
  box-sizing: border-box; position: relative; overflow: hidden;
}
.bg-deco { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
.deco-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.05); }
.deco-1 { width: 600rpx; height: 600rpx; top: -200rpx; right: -200rpx; }
.deco-2 { width: 400rpx; height: 400rpx; bottom: -120rpx; left: -120rpx; }

.brand { text-align: center; margin-bottom: 64rpx; position: relative; z-index: 1; }
.brand-icon { font-size: 80rpx; }
.brand-name { font-size: 52rpx; font-weight: bold; color: white; margin-top: 16rpx; }
.brand-sub { font-size: 26rpx; color: rgba(255,255,255,0.6); margin-top: 12rpx; }

.form-card {
  width: 100%; background: rgba(255,255,255,0.12);
  border: 1rpx solid rgba(255,255,255,0.2);
  border-radius: 32rpx; padding: 48rpx 40rpx;
  backdrop-filter: blur(12px); position: relative; z-index: 1;
}
.form-title { font-size: 36rpx; font-weight: bold; color: white; margin-bottom: 40rpx; }

.input-wrap { margin-bottom: 24rpx; }
.input-field {
  width: 100%; box-sizing: border-box;
  background: rgba(255,255,255,0.15);
  border: 1rpx solid rgba(255,255,255,0.25);
  border-radius: 16rpx; padding: 28rpx 32rpx;
  font-size: 30rpx; color: white; height: 96rpx;
}
.input-field::placeholder { color: rgba(255,255,255,0.45); }

.error-text { font-size: 24rpx; color: #ffb3b3; margin-bottom: 16rpx; }

.btn-submit {
  width: 100%; background: white; color: #2d5a27;
  border: none; border-radius: 999rpx;
  padding: 0; height: 96rpx; font-size: 32rpx; font-weight: bold;
  margin-top: 16rpx;
}
.btn-submit[disabled] { background: rgba(255,255,255,0.4); color: rgba(255,255,255,0.6); }

.switch-row { text-align: center; margin-top: 36rpx; }
.switch-muted { font-size: 26rpx; color: rgba(255,255,255,0.5); }
.switch-link { font-size: 26rpx; color: white; font-weight: 500; margin-left: 8rpx; }
</style>