<template>
  <view class="container">
    <text style="font-size: 64rpx; color: red; font-weight: bold;">✅ UniApp 测试页面 ✅</text>
    <view style="margin-top: 40rpx; font-size: 32rpx;">当前时间：{{ new Date().toLocaleString() }}</view>
    <view style="margin-top: 40rpx; font-size: 32rpx;">Vue 已加载，页面正常显示</view>
    <button style="margin-top: 80rpx;" @click="testClick">点击测试</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello UniApp!'
    }
  },
  mounted() {
    console.log('Test page mounted')
    console.log('uni object:', typeof uni)
  },
  methods: {
    testClick() {
      uni.showToast({
        title: '按钮点击正常',
        icon: 'success'
      })
    }
  }
}
</script>

<style scoped>
.container {
  padding: 100rpx;
  background-color: #f0f8ff;
  min-height: 100vh;
}
</style>