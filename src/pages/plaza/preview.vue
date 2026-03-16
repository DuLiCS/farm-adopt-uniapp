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

    <view class="sensor-card">
      <view class="sensor-title">🌿 农庄实况</view>
      <view v-if="sensorData" class="sensor-grid">
        <view class="sensor-item">
          <view class="sensor-value">{{ sensorData.temperature !== null ? sensorData.temperature + '°C' : '--' }}</view>
          <view class="sensor-label">温度</view>
          <view class="sensor-tag" :class="tempTag.cls">{{ tempTag.text }}</view>
        </view>
        <view class="sensor-item">
          <view class="sensor-value">{{ sensorData.humidity !== null ? sensorData.humidity + '%' : '--' }}</view>
          <view class="sensor-label">湿度</view>
          <view class="sensor-tag" :class="humidTag.cls">{{ humidTag.text }}</view>
        </view>
        <view class="sensor-item">
          <view class="sensor-value">{{ sensorData.soil_moisture !== null ? sensorData.soil_moisture + '%' : '--' }}</view>
          <view class="sensor-label">土壤湿度</view>
          <view class="sensor-tag" :class="soilTag.cls">{{ soilTag.text }}</view>
        </view>
      </view>
      <view v-else class="sensor-empty">暂无数据</view>
      <view class="sensor-update" v-if="sensorData">更新于 {{ sensorUpdateText }}</view>
    </view>

    <view class="chart-card">
      <view class="chart-header">
        <view class="chart-title">📈 环境趋势</view>
        <view class="chart-tabs">
          <view class="chart-tab" :class="{ active: chartHours === 24 }" @click="switchChart(24)">24小时</view>
          <view class="chart-tab" :class="{ active: chartHours === 168 }" @click="switchChart(168)">7天</view>
          <view class="chart-tab" :class="{ active: chartHours === 720 }" @click="switchChart(720)">30天</view>
        </view>
      </view>
      <view class="chart-legend">
        <view class="legend-item"><view class="legend-dot temp"></view>温度(°C)</view>
        <view class="legend-item"><view class="legend-dot humi"></view>湿度(%)</view>
      </view>
      <canvas canvas-id="sensorChart" id="sensorChart" class="chart-canvas"></canvas>
      <view v-if="chartLoading" class="chart-loading">加载中...</view>
      <view v-if="!chartLoading && chartEmpty" class="chart-loading">暂无数据</view>
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
        <view class="form-subtitle">寄茶时我们会用到这里的地址</view>

        <view class="form-group">
          <view class="form-label">收货人 <text class="required">*</text></view>
          <input class="form-input" v-model="address.name" placeholder="请输入姓名" />
        </view>

        <view class="form-group">
          <view class="form-label">手机号 <text class="required">*</text></view>
          <input class="form-input" v-model="address.phone" type="number" placeholder="请输入手机号" maxlength="11" />
        </view>

        <view class="form-group">
          <view class="form-label">收货地址 <text class="required">*</text></view>
          <input class="form-input" v-model="address.address" placeholder="省 / 市 / 区 / 街道门牌号" />
        </view>

        <view class="form-group">
          <view class="form-label">备注</view>
          <input class="form-input" v-model="address.note" placeholder="如：放门卫处（可不填）" />
        </view>

        <button class="form-submit-btn" @click="confirmOrder">确认下单</button>
        <button class="form-cancel-btn" @click="showAddressForm=false">取消</button>
      </view>
    </view>

    <view class="cta-bar" v-if="target">
    <view class="poster-icon-btn" @click="openPoster">🖼</view>
      <view class="cta-info">
        <view class="cta-label">认养方式</view>
        <view class="cta-plan-name">{{ selectedPlanName || '请选择套餐' }}</view>
        <view class="cta-price" v-if="selectedPlanPrice">¥{{ selectedPlanPrice }}<text style="font-size: 24rpx; color: #999;">/认养</text></view>
      </view>
      <button :disabled="!canSubmit" :class="!canSubmit ? 'cta-btn-disabled' : 'cta-btn'" @click="submitOrder">{{ submitBtnText }}</button>
    </view>
  </view>

<!-- 海报弹窗 -->
<view v-if="showPoster" class="poster-mask" @click.self="showPoster=false">
 <view class="poster-wrap">
 <canvas canvas-id="posterCanvas" id="posterCanvas" class="poster-canvas"></canvas>
 <view class="poster-actions">
 <button class="poster-save-btn" @click="savePoster">保存到相册</button>
 <button class="poster-close-btn" @click="showPoster=false">关闭</button>
 </view>
 </view>
</view>

</template>

<script>
import { getPlazaTargetDetail } from '@/api/plaza.js'
import UCharts from '@/static/u-charts.min.js'
import { PLANS } from '@/config.js'

export default {
  data() {return {
      target: null,
      updates: [],
      targetId: null,
      selectedPlanId: null,
      loading: false,
      showAddressForm: false,
      address: { name: '', phone: '', address: '', note: '',
      showPoster: false
    },
      sensorData: null,
      chartHours: 24,
      chartLoading: false,
      chartEmpty: false
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
    },
    tempTag() {
      const v = this.sensorData && this.sensorData.temperature
      if (v === null || v === undefined) return { text: '--', cls: '' }
      if (v < 10) return { text: '偏冷', cls: 'tag-blue' }
      if (v <= 25) return { text: '适宜', cls: 'tag-green' }
      return { text: '偏热', cls: 'tag-orange' }
    },
    humidTag() {
      const v = this.sensorData && this.sensorData.humidity
      if (v === null || v === undefined) return { text: '--', cls: '' }
      if (v < 40) return { text: '偏干', cls: 'tag-orange' }
      if (v <= 70) return { text: '适中', cls: 'tag-green' }
      return { text: '偏湿', cls: 'tag-blue' }
    },
    soilTag() {
      const v = this.sensorData && this.sensorData.soil_moisture
      if (v === null || v === undefined) return { text: '--', cls: '' }
      if (v < 30) return { text: '偏干', cls: 'tag-orange' }
      if (v <= 60) return { text: '适中', cls: 'tag-green' }
      return { text: '偏湿', cls: 'tag-blue' }
    },
    sensorUpdateText() {
      if (!this.sensorData || !this.sensorData.recorded_at) return ''
      const now = new Date()
      const recorded = new Date(this.sensorData.recorded_at + 'Z')
      const diffMin = Math.floor((now - recorded) / 60000)
      if (diffMin < 1) return '刚刚'
      if (diffMin < 60) return diffMin + '分钟前'
      const diffHour = Math.floor(diffMin / 60)
      if (diffHour < 24) return diffHour + '小时前'
      return Math.floor(diffHour / 24) + '天前'
    }
  },

  onLoad(options) {
    this.targetId = Number(options.target_id)
    this.loadDetail()
    this.loadSensorData()
    this.loadChartData()
  },

  methods: {

    openPoster() {
      if (!this.target) return
      this.showPoster = true
      this.$nextTick(() => {
        this.drawPoster()
      })
    },

    drawPoster() {
      const ctx = uni.createCanvasContext('posterCanvas', this)
      const W = 630
      const H = 1120

      // 背景渐变
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, '#1a3d16')
      grad.addColorStop(1, '#2d5a27')
      ctx.setFillStyle(grad)
      ctx.fillRect(0, 0, W, H)

      // 封面图
      const imgUrl = this.target.cover_image ? this.getFullImageUrl(this.target.cover_image) : ''
      const drawContent = () => {
        // 标题区
        ctx.setFillStyle('rgba(255,255,255,0.12)')
        ctx.fillRect(0, 380, W, 2)

        // 品牌名
        ctx.setFillStyle('#ffffff')
        ctx.setFontSize(42)
        ctx.setTextAlign('center')
        ctx.fillText('山南记', W / 2, 460)

        // 认养对象名
        ctx.setFontSize(32)
        ctx.setFillStyle('rgba(255,255,255,0.9)')
        ctx.fillText(this.target.name || '', W / 2, 520)

        // slogan
        ctx.setFontSize(24)
        ctx.setFillStyle('rgba(255,255,255,0.6)')
        ctx.fillText('一棵树，一段时光', W / 2, 580)

        // 分割线
        ctx.setFillStyle('rgba(255,255,255,0.15)')
        ctx.fillRect(W/2 - 60, 610, 120, 1)

        // 位置
        ctx.setFontSize(22)
        ctx.setFillStyle('rgba(255,255,255,0.5)')
        ctx.fillText('陕西 · 汉中 · 秦岭南麓', W / 2, 650)

        // 日期
        ctx.fillText(this.todayStr, W / 2, 690)

        // 底部网址
        ctx.setFontSize(26)
        ctx.setFillStyle('rgba(255,255,255,0.8)')
        ctx.fillText('shannanji.com', W / 2, 1050)

        ctx.setFontSize(20)
        ctx.setFillStyle('rgba(255,255,255,0.4)')
        ctx.fillText('扫码认养同款', W / 2, 1085)

        ctx.draw()
      }

      if (imgUrl) {
        ctx.drawImage(imgUrl, 0, 60, W, 320)
        // 图片上方渐变遮罩
        const maskGrad = ctx.createLinearGradient(0, 300, 0, 390)
        maskGrad.addColorStop(0, 'rgba(29,61,22,0)')
        maskGrad.addColorStop(1, 'rgba(29,61,22,1)')
        ctx.setFillStyle(maskGrad)
        ctx.fillRect(0, 300, W, 90)
        drawContent()
      } else {
        // 无图时用 emoji 占位
        ctx.setFontSize(80)
        ctx.setTextAlign('center')
        ctx.fillText('🍃', W / 2, 230)
        drawContent()
      }
    },

    savePoster() {
      uni.canvasToTempFilePath({
        canvasId: 'posterCanvas',
        success: (res) => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              uni.showToast({ title: '已保存到相册', icon: 'success' })
            },
            fail: () => {
              uni.showToast({ title: '保存失败，请长按图片保存', icon: 'none' })
            }
          })
        },
        fail: () => {
          uni.showToast({ title: '生成失败', icon: 'none' })
        }
      }, this)
    },

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

    switchChart(hours) {
      this.chartHours = hours
      this.loadChartData()
    },

    async loadChartData() {
      this.chartLoading = true
      this.chartEmpty = false
      try {
        const res = await uni.request({
          url: 'http://47.102.138.74/api/sensor/history?device_id=esp32-farm-01&hours=' + this.chartHours,
          method: 'GET'
        })
        const data = res.data && res.data.data ? res.data.data : []
        if (data.length === 0) {
          this.chartEmpty = true
          this.chartLoading = false
          return
        }
        let labels, temps, humis

        if (this.chartHours <= 24) {
          // 24h：按小时聚合，最多24个点
          const buckets = {}
          data.forEach(d => {
            const dt = new Date(d.recorded_at + 'Z')
            const key = dt.getHours().toString().padStart(2,'0') + 'h'
            if (!buckets[key]) buckets[key] = { temps: [], humis: [] }
            if (d.temperature !== null) buckets[key].temps.push(d.temperature)
            if (d.humidity !== null) buckets[key].humis.push(d.humidity)
          })
          labels = Object.keys(buckets)
          temps = labels.map(k => buckets[k].temps.length ? parseFloat((buckets[k].temps.reduce((a,b)=>a+b,0)/buckets[k].temps.length).toFixed(1)) : null)
          humis = labels.map(k => buckets[k].humis.length ? parseFloat((buckets[k].humis.reduce((a,b)=>a+b,0)/buckets[k].humis.length).toFixed(1)) : null)

        } else if (this.chartHours <= 168) {
          // 7天：按小时聚合
          const buckets = {}
          data.forEach(d => {
            const dt = new Date(d.recorded_at + 'Z')
            const key = (dt.getMonth()+1) + '/' + dt.getDate() + ' ' + dt.getHours().toString().padStart(2,'0') + 'h'
            if (!buckets[key]) buckets[key] = { temps: [], humis: [] }
            if (d.temperature !== null) buckets[key].temps.push(d.temperature)
            if (d.humidity !== null) buckets[key].humis.push(d.humidity)
          })
          labels = Object.keys(buckets)
          temps = labels.map(k => buckets[k].temps.length ? parseFloat((buckets[k].temps.reduce((a,b)=>a+b,0)/buckets[k].temps.length).toFixed(1)) : null)
          humis = labels.map(k => buckets[k].humis.length ? parseFloat((buckets[k].humis.reduce((a,b)=>a+b,0)/buckets[k].humis.length).toFixed(1)) : null)

        } else {
          // 30天：按天聚合
          const buckets = {}
          data.forEach(d => {
            const dt = new Date(d.recorded_at + 'Z')
            const key = (dt.getMonth()+1) + '/' + dt.getDate()
            if (!buckets[key]) buckets[key] = { temps: [], humis: [] }
            if (d.temperature !== null) buckets[key].temps.push(d.temperature)
            if (d.humidity !== null) buckets[key].humis.push(d.humidity)
          })
          labels = Object.keys(buckets)
          temps = labels.map(k => buckets[k].temps.length ? parseFloat((buckets[k].temps.reduce((a,b)=>a+b,0)/buckets[k].temps.length).toFixed(1)) : null)
          humis = labels.map(k => buckets[k].humis.length ? parseFloat((buckets[k].humis.reduce((a,b)=>a+b,0)/buckets[k].humis.length).toFixed(1)) : null)
        }
        this.chartLoading = false
        this.$nextTick(() => {
          const ctx = uni.createCanvasContext('sensorChart', this)
          new UCharts({
            type: 'line',
            context: ctx,
            width: uni.upx2px(690),
            height: uni.upx2px(400),
            categories: labels,
            series: [
              {
                name: '温度',
                data: temps,
                color: '#2d5a27',
                filled: true,
                fillOpacity: 0.15
              },
              {
                name: '湿度',
                data: humis,
                color: '#5b9bd5',
                filled: true,
                fillOpacity: 0.1
              }
            ],
            xAxis: { disableGrid: true, fontSize: 9 },
            yAxis: { fontSize: 10, gridColor: '#f0f0f0' },
            legend: { show: false },
            background: '#ffffff',
            padding: [20, 20, 20, 20],
            dataLabel: false,
            animation: true
          })
        })
      } catch(e) {
        this.chartLoading = false
        this.chartEmpty = true
      }
    },

    selectPlan(plan) {
      this.selectedPlanId = plan.id
    },

    async loadSensorData() {
      try {
        const res = await uni.request({
          url: 'http://47.102.138.74/api/sensor/latest?device_id=esp32-farm-01',
          method: 'GET'
        })
        if (res.data && res.data.temperature !== undefined) {
          this.sensorData = res.data
        }
      } catch (e) {
        // 静默失败
      }
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
          const targetName = encodeURIComponent(this.target && this.target.name || '')
 uni.redirectTo({ url: '/pages/success/index?order_id=' + res.data.id + '&target_name=' + targetName })
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
.address-form { background: white; width: 100%; border-radius: 24rpx 24rpx 0 0; padding: 40rpx; padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); max-height: 85vh; overflow-y: auto; }
.form-title { font-size: 32rpx; font-weight: bold; color: #333; text-align: center; }
.form-subtitle { font-size: 24rpx; color: #aaa; text-align: center; margin-top: 8rpx; margin-bottom: 32rpx; }
.form-group { margin-bottom: 24rpx; }
.form-label { font-size: 26rpx; color: #555; margin-bottom: 10rpx; }
.required { color: #e74c3c; }
.form-input { width: 100%; border: 1rpx solid #e0e0e0; border-radius: 12rpx; padding: 22rpx 24rpx; font-size: 28rpx; box-sizing: border-box; background: #fafafa; }
.form-submit-btn { width: 100%; background: #2d5a27; color: white; border: none; border-radius: 50rpx; padding: 24rpx; font-size: 30rpx; margin-top: 24rpx; }
.form-cancel-btn { width: 100%; background: none; color: #999; border: none; font-size: 28rpx; margin-top: 12rpx; padding: 16rpx; }
.cta-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 24rpx 30rpx; background: white; box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.08); padding-bottom: calc(24rpx + env(safe-area-inset-bottom)); }
.cta-info { flex: 1; }
.cta-label { font-size: 24rpx; color: #999; }
.cta-plan-name { font-size: 28rpx; font-weight: bold; color: #333; margin-top: 4rpx; }
.cta-price { font-size: 32rpx; font-weight: bold; color: #2d5a27; margin-top: 8rpx; }
.cta-btn { background: #2d5a27; color: white; border: none; border-radius: 50rpx; padding: 20rpx 48rpx; font-size: 30rpx; }
.cta-btn-disabled { background: #ccc; color: #999; }

.sensor-card { margin: 24rpx 30rpx; background: white; border-radius: 24rpx; padding: 36rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.sensor-title { font-size: 28rpx; font-weight: 600; color: #2d5a27; margin-bottom: 28rpx; }
.sensor-grid { display: flex; justify-content: space-between; }
.sensor-item { flex: 1; text-align: center; }
.sensor-value { font-size: 36rpx; font-weight: bold; color: #333; }
.sensor-label { font-size: 22rpx; color: #999; margin-top: 6rpx; }
.sensor-tag { display: inline-block; margin-top: 10rpx; font-size: 20rpx; padding: 4rpx 14rpx; border-radius: 999rpx; }
.tag-green { background: #e8f5e2; color: #2d5a27; }
.tag-orange { background: #fff3e0; color: #e67e22; }
.tag-blue { background: #e3f2fd; color: #1976d2; }
.sensor-empty { text-align: center; color: #ccc; font-size: 26rpx; padding: 20rpx 0; }
.sensor-update { font-size: 22rpx; color: #bbb; text-align: right; margin-top: 20rpx; }

.chart-card { margin: 24rpx 30rpx; background: white; border-radius: 24rpx; padding: 36rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.chart-title { font-size: 28rpx; font-weight: 600; color: #2d5a27; }
.chart-tabs { display: flex; gap: 12rpx; }
.chart-tab { font-size: 22rpx; color: #999; padding: 8rpx 20rpx; border-radius: 999rpx; background: #f5f5f0; }
.chart-tab.active { background: #2d5a27; color: white; }
.chart-legend { display: flex; gap: 24rpx; margin-bottom: 16rpx; }
.legend-item { display: flex; align-items: center; gap: 8rpx; font-size: 22rpx; color: #666; }
.legend-dot { width: 16rpx; height: 16rpx; border-radius: 50%; }
.legend-dot.temp { background: #2d5a27; }
.legend-dot.humi { background: #5b9bd5; }
.chart-canvas { width: 690rpx; height: 400rpx; }
.chart-loading { text-align: center; color: #ccc; font-size: 26rpx; padding: 60rpx 0; }

.poster-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.poster-wrap { display: flex; flex-direction: column; align-items: center; }
.poster-canvas { width: 630rpx; height: 1120rpx; border-radius: 16rpx; overflow: hidden; }
.poster-actions { margin-top: 32rpx; display: flex; gap: 24rpx; }
.poster-save-btn { background: #2d5a27; color: white; border: none; border-radius: 50rpx; padding: 20rpx 48rpx; font-size: 28rpx; }
.poster-close-btn { background: rgba(255,255,255,0.15); color: white; border: none; border-radius: 50rpx; padding: 20rpx 48rpx; font-size: 28rpx; }
.poster-icon-btn { font-size: 40rpx; padding: 8rpx 16rpx; margin-right: 16rpx; }

</style>
