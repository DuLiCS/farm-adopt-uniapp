<template>
 <view class="container">
 <view class="bg-decoration">
 <view class="circle circle-1"></view>
 <view class="circle circle-2"></view>
 <view class="circle circle-3"></view>
 </view>

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
 <button class="btn-poster" @click="openPoster">🎋 生成专属海报</button>
 <button class="btn-primary" @click="goDetail">查看我的茶树</button>
 <button class="btn-secondary" @click="goPlaza">继续逛广场</button>
 </view>
 </view>

 <view v-if="showPoster" class="poster-mask" @click.self="showPoster=false">
 <view class="poster-wrap">
 <canvas canvas-id="successPoster" id="successPoster" class="poster-canvas"></canvas>
 <view class="poster-actions">
 <button class="poster-save-btn" @click="savePoster">保存到相册</button>
 <button class="poster-close-btn" @click="showPoster=false">关闭</button>
 </view>
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
 today: '',
 showPoster: false
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
 },
 openPoster() {
 this.showPoster = true
 this.$nextTick(() => { this.drawPoster() })
 },
 drawPoster() {
 const ctx = uni.createCanvasContext('successPoster', this)
 const W = 630, H = 1120
 const grad = ctx.createLinearGradient(0, 0, 0, H)
 grad.addColorStop(0, '#1a3d16')
 grad.addColorStop(1, '#2d5a27')
 ctx.setFillStyle(grad)
 ctx.fillRect(0, 0, W, H)

 ctx.setFillStyle('rgba(255,255,255,0.06)')
 ctx.beginPath()
 ctx.arc(W + 80, -80, 380, 0, Math.PI * 2)
 ctx.fill()

 ctx.setFillStyle('rgba(255,255,255,0.04)')
 ctx.beginPath()
 ctx.arc(-60, H - 80, 280, 0, Math.PI * 2)
 ctx.fill()

 ctx.setTextAlign('center')
 ctx.setFontSize(26)
 ctx.setFillStyle('rgba(255,255,255,0.5)')
 ctx.fillText('我在山南记守候着一棵树', W / 2, 120)

 ctx.setFillStyle('rgba(255,255,255,0.15)')
 ctx.fillRect(W/2 - 80, 145, 160, 1)

 ctx.setFontSize(22)
 ctx.setFillStyle('rgba(255,255,255,0.4)')
 ctx.fillText('秦岭南麓 · 汉中西乡', W / 2, 185)

 ctx.setFontSize(100)
 ctx.setFillStyle('rgba(255,255,255,0.12)')
 ctx.fillText('🍃', W / 2, 480)

 ctx.setFontSize(46)
 ctx.setFillStyle('#ffffff')
 ctx.fillText(this.targetName || '我的茶树', W / 2, 580)

 ctx.setFontSize(26)
 ctx.setFillStyle('rgba(255,255,255,0.6)')
 ctx.fillText('认养编号 #' + this.orderId, W / 2, 645)
 ctx.fillText('守候开始于 ' + this.today, W / 2, 695)

 ctx.setFillStyle('rgba(255,255,255,0.12)')
 ctx.fillRect(80, 750, W - 160, 1)

 ctx.setFontSize(32)
 ctx.setFillStyle('rgba(255,255,255,0.9)')
 ctx.fillText('山南记', W / 2, 820)

 ctx.setFontSize(24)
 ctx.setFillStyle('rgba(255,255,255,0.5)')
 ctx.fillText('shannanji.com', W / 2, 865)

 ctx.setFontSize(20)
 ctx.setFillStyle('rgba(255,255,255,0.3)')
 ctx.fillText('扫码认养同款，守候一棵树', W / 2, 910)

 ctx.draw()
 },
 savePoster() {
 uni.canvasToTempFilePath({
 canvasId: 'successPoster',
 success: (res) => {
 uni.saveImageToPhotosAlbum({
 filePath: res.tempFilePath,
 success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
 fail: () => uni.showToast({ title: '长按图片可保存', icon: 'none' })
 })
 }
 }, this)
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
 position: relative; z-index: 1; display: flex; flex-direction: column;
 align-items: center; padding: 80rpx 60rpx; width: 100%; box-sizing: border-box;
}
.icon-wrap {
 width: 160rpx; height: 160rpx; border-radius: 50%;
 background: rgba(255,255,255,0.15); display: flex; align-items: center;
 justify-content: center; margin-bottom: 48rpx; border: 2rpx solid rgba(255,255,255,0.3);
}
.icon { font-size: 80rpx; }
.title { font-size: 52rpx; font-weight: bold; color: white; margin-bottom: 16rpx; text-align: center; }
.subtitle { font-size: 28rpx; color: rgba(255,255,255,0.75); margin-bottom: 60rpx; text-align: center; }
.info-card {
 background: rgba(255,255,255,0.12); border: 1rpx solid rgba(255,255,255,0.2);
 border-radius: 24rpx; padding: 40rpx; width: 100%; margin-bottom: 48rpx; backdrop-filter: blur(8px);
}
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid rgba(255,255,255,0.1); }
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 26rpx; color: rgba(255,255,255,0.6); }
.info-value { font-size: 26rpx; color: white; font-weight: 500; }
.quote { font-size: 26rpx; color: rgba(255,255,255,0.6); text-align: center; line-height: 1.8; font-style: italic; margin-bottom: 64rpx; }
.btn-group { width: 100%; display: flex; flex-direction: column; gap: 24rpx; }
.btn-poster {
 width: 100%; background: rgba(255,255,255,0.2); color: white;
 border: 1rpx solid rgba(255,255,255,0.4); border-radius: 999rpx;
 padding: 28rpx; font-size: 30rpx;
}
.btn-primary { width: 100%; background: white; color: #2d5a27; border: none; border-radius: 999rpx; padding: 28rpx; font-size: 30rpx; font-weight: bold; }
.btn-secondary { width: 100%; background: rgba(255,255,255,0.15); color: white; border: 1rpx solid rgba(255,255,255,0.3); border-radius: 999rpx; padding: 28rpx; font-size: 30rpx; }
.poster-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 200; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.poster-wrap { display: flex; flex-direction: column; align-items: center; }
.poster-canvas { width: 630rpx; height: 1120rpx; border-radius: 16rpx; }
.poster-actions { margin-top: 32rpx; display: flex; gap: 24rpx; }
.poster-save-btn { background: #2d5a27; color: white; border: none; border-radius: 50rpx; padding: 20rpx 48rpx; font-size: 28rpx; }
.poster-close-btn { background: rgba(255,255,255,0.15); color: white; border: none; border-radius: 50rpx; padding: 20rpx 48rpx; font-size: 28rpx; }
</style>
