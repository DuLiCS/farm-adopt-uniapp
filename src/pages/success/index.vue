<template>
 <view class="container">
 <!-- 背景装饰 -->
 <view class="bg-decoration">
 <view class="circle circle-1"></view>
 <view class="circle circle-2"></view>
 <view class="circle circle-3"></view>
 </view>

 <!-- 主体内容 -->
 <view class="content">
 <view class="icon-wrap">
 <text class="icon">🌿</text>
 </view>

 <view class="title">守候开始了</view>
 <view class="subtitle">从今天起，这棵树有了它的主人</view>

 <view class="info-card" v-if="targetName">
 <view class="info-row">
 <text class="info-label">认养对象</text>
 <text class="info-value">{{ targetName }}</text>
 </view>
 <view class="info-row">
 <text class="info-label">开始日期</text>
 <text class="info-value">{{ today }}</text>
 </view>
 <view class="info-row">
 <text class="info-label">认养编号</text>
 <text class="info-value">#{{ orderId }}</text>
 </view>
 </view>

 <view class="quote">
 山南记不卖茶，<br/>我们只是帮你守着那棵树。
 </view>

 <view class="btn-group">
 <button class="btn-primary" @click="goDetail">查看我的茶树</button>
 <button class="btn-secondary" @click="goPlaza">继续逛广场</button>
 </view>
 </view>
 </view>
</template>

<script>
export default {
 data() {
 return {
 orderId: null,
 targetName: '',
 today: ''
 }
 },

 onLoad(options) {
 this.orderId = options.order_id || ''
 this.targetName = decodeURIComponent(options.target_name || '')
 const now = new Date()
 this.today = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日'
 },

 methods: {
 goDetail() {
 uni.redirectTo({ url: '/pages/order/detail?order_id=' + this.orderId })
 },
 goPlaza() {
 uni.switchTab({ url: '/pages/plaza/index' })
 }
 }
}
</script>

<style scoped>
.container {
 min-height: 100vh;
 background: linear-gradient(160deg, #1a3d16 0%, #2d5a27 50%, #4a7c3f 100%);
 display: flex;
 align-items: center;
 justify-content: center;
 position: relative;
 overflow: hidden;
}

.bg-decoration { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
.circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.05); }
.circle-1 { width: 600rpx; height: 600rpx; top: -200rpx; right: -200rpx; }
.circle-2 { width: 400rpx; height: 400rpx; bottom: -100rpx; left: -100rpx; }
.circle-3 { width: 200rpx; height: 200rpx; top: 40%; left: 10%; }

.content {
 position: relative;
 z-index: 1;
 display: flex;
 flex-direction: column;
 align-items: center;
 padding: 80rpx 60rpx;
 width: 100%;
 box-sizing: border-box;
}

.icon-wrap {
 width: 160rpx;
 height: 160rpx;
 border-radius: 50%;
 background: rgba(255,255,255,0.15);
 display: flex;
 align-items: center;
 justify-content: center;
 margin-bottom: 48rpx;
 border: 2rpx solid rgba(255,255,255,0.3);
}
.icon { font-size: 80rpx; }

.title {
 font-size: 52rpx;
 font-weight: bold;
 color: white;
 margin-bottom: 16rpx;
 text-align: center;
}
.subtitle {
 font-size: 28rpx;
 color: rgba(255,255,255,0.75);
 margin-bottom: 60rpx;
 text-align: center;
}

.info-card {
 background: rgba(255,255,255,0.12);
 border: 1rpx solid rgba(255,255,255,0.2);
 border-radius: 24rpx;
 padding: 40rpx;
 width: 100%;
 margin-bottom: 48rpx;
 backdrop-filter: blur(8px);
}
.info-row {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 16rpx 0;
 border-bottom: 1rpx solid rgba(255,255,255,0.1);
}
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 26rpx; color: rgba(255,255,255,0.6); }
.info-value { font-size: 26rpx; color: white; font-weight: 500; }

.quote {
 font-size: 26rpx;
 color: rgba(255,255,255,0.6);
 text-align: center;
 line-height: 1.8;
 font-style: italic;
 margin-bottom: 64rpx;
}

.btn-group { width: 100%; display: flex; flex-direction: column; gap: 24rpx; }
.btn-primary {
 width: 100%;
 background: white;
 color: #2d5a27;
 border: none;
 border-radius: 999rpx;
 padding: 28rpx;
 font-size: 30rpx;
 font-weight: bold;
}
.btn-secondary {
 width: 100%;
 background: rgba(255,255,255,0.15);
 color: white;
 border: 1rpx solid rgba(255,255,255,0.3);
 border-radius: 999rpx;
 padding: 28rpx;
 font-size: 30rpx;
}
</style> drawPoster() {
  this.$nextTick(() => {
   const el = document.querySelector('#successPoster canvas.uni-canvas-canvas') || document.querySelector('#successPoster canvas.uni-canvas-canvas') || document.getElementById('successPoster')
   if (!el) return
   const W = Math.min(window.innerWidth, 630)
   const H = Math.round(W * 16 / 9)
   el.width = W
   el.height = H
   const c = el.getContext('2d')
   const g = c.createLinearGradient(0, 0, W, H)
   g.addColorStop(0, '#1a3d16')
   g.addColorStop(0.6, '#2d5a27')
   g.addColorStop(1, '#3d6b32')
   c.fillStyle = g
   c.fillRect(0, 0, W, H)
   c.fillStyle = 'rgba(255,255,255,0.04)'
   c.beginPath(); c.arc(W*0.85, H*0.1, W*0.5, 0, Math.PI*2); c.fill()
   c.fillStyle = 'rgba(255,255,255,0.03)'
   c.beginPath(); c.arc(W*0.1, H*0.9, W*0.4, 0, Math.PI*2); c.fill()
   c.textAlign = 'center'; c.textBaseline = 'middle'
   c.font = Math.round(W*0.032) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.4)'
   c.fillText('— 山南记 · 认养证书 —', W/2, H*0.12)
   c.font = Math.round(W*0.13) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.85)'
   c.fillText('🍃', W/2, H*0.3)
   c.font = 'bold ' + Math.round(W*0.07) + 'px sans-serif'
   c.fillStyle = '#fff'
   c.fillText(this.targetName || '我的茶树', W/2, H*0.46)
   c.font = Math.round(W*0.037) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.55)'
   c.fillText('我在山南记守候着这棵树', W/2, H*0.55)
   c.fillStyle = 'rgba(255,255,255,0.15)'
   c.fillRect(W*0.25, H*0.61, W*0.5, 1)
   c.font = Math.round(W*0.033) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.5)'
   c.fillText('秦岭南麓 · 陕西汉中西乡', W/2, H*0.67)
   c.fillText('守候开始于 ' + this.today, W/2, H*0.74)
   c.fillStyle = 'rgba(255,255,255,0.1)'
   c.fillRect(W*0.1, H*0.82, W*0.8, 1)
   c.font = 'bold ' + Math.round(W*0.05) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.85)'
   c.fillText('山南记', W/2, H*0.88)
   c.font = Math.round(W*0.034) + 'px sans-serif'
   c.fillStyle = 'rgba(255,255,255,0.4)'
   c.fillText('shannanji.com', W/2, H*0.94)
  })
 },
 savePoster() {
  const el = document.querySelector('#successPoster canvas.uni-canvas-canvas') || document.querySelector('#successPoster canvas.uni-canvas-canvas') || document.getElementById('successPoster')
  if (!el) return
  const url = el.toDataURL('image/png')
  const a = document.createElement('a')
  a.download = '山南记认养证书.png'
  a.href = url; a.click()
 },late>
 <view class="container">
 <!-- 背景装饰 -->
 <view class="bg-decoration">
 <view class="circle circle-1"></view>
 <view class="circle circle-2"></view>
 <view class="circle circle-3"></view>
 </view>

 <!-- 主体内容 -->
 <view class="content">
 <view class="icon-wrap">
 <text class="icon">🌿</text>
 </view>

 <view class="title">守候开始了</view>
 <view class="subtitle">从今天起，这棵树有了它的主人</view>

 <view class="info-card" v-if="targetName">
 <view class="info-row">
 <text class="info-label">认养对象</text>
 <text class="info-value">{{ targetName }}</text>
 </view>
 <view class="info-row">
 <text class="info-label">开始日期</text>
 <text class="info-value">{{ today }}</text>
 </view>
 <view class="info-row">
 <text class="info-label">认养编号</text>
 <text class="info-value">#{{ orderId }}</text>
 </view>
 </view>

 <view class="quote">
 山南记不卖茶，<br/>我们只是帮你守着那棵树。
 </view>

 <view class="btn-group">
 <button class="btn-primary" @click="goDetail">查看我的茶树</button>
 <button class="btn-secondary" @click="goPlaza">继续逛广场</button>
 </view>
 </view>
 </view>
</template>

<script>
export default {
 data() {
 return {
 orderId: null,
 targetName: '',
 today: ''
 }
 },

 onLoad(options) {
 this.orderId = options.order_id || ''
 this.targetName = decodeURIComponent(options.target_name || '')
 const now = new Date()
 this.today = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日'
 },

 methods: {
 goDetail() {
 uni.redirectTo({ url: '/pages/order/detail?order_id=' + this.orderId })
 },
 goPlaza() {
 uni.switchTab({ url: '/pages/plaza/index' })
 }
 }
}
</script>

<style scoped>
.container {
 min-height: 100vh;
 background: linear-gradient(160deg, #1a3d16 0%, #2d5a27 50%, #4a7c3f 100%);
 display: flex;
 align-items: center;
 justify-content: center;
 position: relative;
 overflow: hidden;
}

.bg-decoration { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
.circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.05); }
.circle-1 { width: 600rpx; height: 600rpx; top: -200rpx; right: -200rpx; }
.circle-2 { width: 400rpx; height: 400rpx; bottom: -100rpx; left: -100rpx; }
.circle-3 { width: 200rpx; height: 200rpx; top: 40%; left: 10%; }

.content {
 position: relative;
 z-index: 1;
 display: flex;
 flex-direction: column;
 align-items: center;
 padding: 80rpx 60rpx;
 width: 100%;
 box-sizing: border-box;
}

.icon-wrap {
 width: 160rpx;
 height: 160rpx;
 border-radius: 50%;
 background: rgba(255,255,255,0.15);
 display: flex;
 align-items: center;
 justify-content: center;
 margin-bottom: 48rpx;
 border: 2rpx solid rgba(255,255,255,0.3);
}
.icon { font-size: 80rpx; }

.title {
 font-size: 52rpx;
 font-weight: bold;
 color: white;
 margin-bottom: 16rpx;
 text-align: center;
}
.subtitle {
 font-size: 28rpx;
 color: rgba(255,255,255,0.75);
 margin-bottom: 60rpx;
 text-align: center;
}

.info-card {
 background: rgba(255,255,255,0.12);
 border: 1rpx solid rgba(255,255,255,0.2);
 border-radius: 24rpx;
 padding: 40rpx;
 width: 100%;
 margin-bottom: 48rpx;
 backdrop-filter: blur(8px);
}
.info-row {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 16rpx 0;
 border-bottom: 1rpx solid rgba(255,255,255,0.1);
}
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 26rpx; color: rgba(255,255,255,0.6); }
.info-value { font-size: 26rpx; color: white; font-weight: 500; }

.quote {
 font-size: 26rpx;
 color: rgba(255,255,255,0.6);
 text-align: center;
 line-height: 1.8;
 font-style: italic;
 margin-bottom: 64rpx;
}

.btn-group { width: 100%; display: flex; flex-direction: column; gap: 24rpx; }
.btn-primary {
 width: 100%;
 background: white;
 color: #2d5a27;
 border: none;
 border-radius: 999rpx;
 padding: 28rpx;
 font-size: 30rpx;
 font-weight: bold;
}
.btn-secondary {
 width: 100%;
 background: rgba(255,255,255,0.15);
 color: white;
 border: 1rpx solid rgba(255,255,255,0.3);
 border-radius: 999rpx;
 padding: 28rpx;
 font-size: 30rpx;
}
</style>
