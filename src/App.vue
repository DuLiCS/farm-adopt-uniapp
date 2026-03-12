<script>
export default {
  onLaunch: function() {
    console.log('App Launch - UniApp started')
    console.log('uni object:', typeof uni)
    console.log('Vue version:', window.Vue ? window.Vue.version : 'not available')
    
    // 全局启动路由判断
    const token = uni.getStorageSync('token')
    // 使用 reLaunch 确保栈清空，避免返回
    if (!token) {
      uni.reLaunch({ url: '/pages/plaza/index' })
    } else {
      uni.reLaunch({ url: '/pages/home/index' })
    }
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  mounted() {
    console.log('App mounted - Vue component mounted')
  }
}
</script>

<template>
  <view id="app">
    <router-view />
  </view>
</template>

<style>
page {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #333;
}

:root {
  --primary-color: #2d5a27;
  --primary-light: #4a7c43;
  --primary-dark: #1e3d1a;
}

/* 全局强制覆盖输入框和按钮 */
page input,
page view input,
page .uni-input-input,
page .uni-input {
  height: 48px !important;
  min-height: 48px !important;
  line-height: 24px !important;
  padding: 12px 16px !important;
  font-size: 16px !important;
  border: 1px solid #eee !important;
  border-radius: 12px !important;
  background: #fff !important;
  box-sizing: border-box !important;
  pointer-events: auto !important;
  -webkit-user-select: auto !important;
  user-select: auto !important;
}

page button,
page .uni-button {
  height: 56px !important;
  min-height: 56px !important;
  line-height: 24px !important;
  font-size: 16px !important;
  border-radius: 999px !important;
  padding: 16px 32px !important;
  background-color: var(--primary-color) !important;
  color: #fff !important;
  border: none !important;
}
</style>
