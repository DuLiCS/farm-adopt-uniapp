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
      <view class="target-meta-row">
        <view class="target-code-badge" v-if="target.code"># {{ target.code }}</view>
        <view class="target-type-badge">{{ targetTypeLabel }}</view>
      </view>
      <view class="target-location">📍 {{ target.location_desc }}</view>
      <view v-if="target.description" class="desc-wrap">
        <view class="desc-text" :class="{ collapsed: !descExpanded }">{{ target.description }}</view>
        <view v-if="target.description.length > 60" class="desc-toggle" @click="descExpanded = !descExpanded">
          {{ descExpanded ? '收起 ∧' : '展开查看完整档案 ∨' }}
        </view>
      </view>
    </view>

    <view class="sensor-card">
      <view class="sensor-header">
        <view class="sensor-title">农庄实况</view>
        <view class="sensor-live" v-if="sensorData">
          <view class="live-dot"></view>
          <text class="live-text">{{ sensorUpdateText }}</text>
        </view>
      </view>
      <view v-if="sensorData" class="sensor-grid">
        <view class="sensor-item">
          <view class="sensor-icon">🌡</view>
          <view class="sensor-value-row">
            <text class="sensor-value">{{ sensorData.temperature !== null ? sensorData.temperature : '--' }}</text>
            <text class="sensor-unit">°C</text>
          </view>
          <view class="sensor-label">温度</view>
          <view class="sensor-bar-wrap">
            <view class="sensor-bar-fill" :class="tempTag.cls" :style="{ width: tempPercent + '%' }"></view>
          </view>
          <view class="sensor-tag" :class="tempTag.cls">{{ tempTag.text }}</view>
        </view>
        <view class="sensor-sep"></view>
        <view class="sensor-item">
          <view class="sensor-icon">💧</view>
          <view class="sensor-value-row">
            <text class="sensor-value">{{ sensorData.humidity !== null ? sensorData.humidity : '--' }}</text>
            <text class="sensor-unit">%</text>
          </view>
          <view class="sensor-label">湿度</view>
          <view class="sensor-bar-wrap">
            <view class="sensor-bar-fill" :class="humidTag.cls" :style="{ width: humidPercent + '%' }"></view>
          </view>
          <view class="sensor-tag" :class="humidTag.cls">{{ humidTag.text }}</view>
        </view>
        <view class="sensor-sep"></view>
        <view class="sensor-item">
          <view class="sensor-icon">🌱</view>
          <view class="sensor-value-row">
            <text class="sensor-value">{{ sensorData.soil_moisture !== null ? sensorData.soil_moisture : '--' }}</text>
            <text class="sensor-unit">%</text>
          </view>
          <view class="sensor-label">土壤湿度</view>
          <view class="sensor-bar-wrap">
            <view class="sensor-bar-fill" :class="soilTag.cls" :style="{ width: soilPercent + '%' }"></view>
          </view>
          <view class="sensor-tag" :class="soilTag.cls">{{ soilTag.text }}</view>
        </view>
      </view>
      <view v-else class="sensor-empty">暂无传感器数据</view>
    </view>

    <view class="chart-card">
      <view class="chart-header">
        <view class="chart-title-wrap">
          <view class="chart-title-accent"></view>
          <view class="chart-title">环境趋势</view>
        </view>
        <view class="chart-tabs">
          <view class="chart-tab" :class="{ active: chartHours === 24 }" @click="switchChart(24)">24h</view>
          <view class="chart-tab" :class="{ active: chartHours === 168 }" @click="switchChart(168)">7天</view>
          <view class="chart-tab" :class="{ active: chartHours === 720 }" @click="switchChart(720)">30天</view>
        </view>
      </view>
      <view class="chart-legend">
        <view class="legend-item"><view class="legend-line temp"></view><text>温度 °C</text></view>
        <view class="legend-item"><view class="legend-line humi"></view><text>湿度 %</text></view>
      </view>
      <canvas canvas-id="sensorChart" id="sensorChart" class="chart-canvas"></canvas>
      <view v-if="chartLoading" class="chart-loading">加载中...</view>
      <view v-if="!chartLoading && chartEmpty" class="chart-loading">暂无历史数据</view>
    </view>

    <view class="plan-section" v-if="target && target.current_status === 'active'">
      <view class="section-title">选一个方式加入</view>
      <view class="plan-list">
        <view class="plan-card" :class="{ selected: selectedPlanId === plan.id }" v-for="plan in availablePlans" :key="plan.id" @click="selectPlan(plan)">
          <view v-if="isRecommended(plan)" class="plan-recommend-badge">最受欢迎</view>
          <view class="plan-name">{{ plan.name }}</view>
          <view class="plan-desc">{{ plan.description }}</view>
          <view class="plan-price">¥{{ (plan.price / 100).toFixed(0) }}</view>
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

        <!-- 拖拽把手 -->
        <view class="form-handle"></view>

        <!-- 订单摘要 -->
        <view class="form-order-summary" v-if="target">
          <view class="summary-tree">
            <text class="summary-emoji">🌿</text>
            <view class="summary-info">
              <text class="summary-name">{{ target.name }}</text>
              <text class="summary-plan">{{ selectedPlanName }}</text>
            </view>
          </view>
          <view class="summary-price" v-if="selectedPlanPriceDisplay">
            <text class="summary-price-num">¥{{ selectedPlanPriceDisplay }}</text>
          </view>
        </view>

        <!-- 寄语 -->
        <view class="dedication-wrap">
          <view class="dedication-label">写一句给你的树 <text class="optional-tag">选填</text></view>
          <input class="dedication-input" v-model="address.dedication"
            placeholder="它会记得你说过的话…" maxlength="40" />
          <text class="dedication-count">{{ (address.dedication||'').length }}/40</text>
        </view>

        <!-- 表单标题 -->
        <view class="form-header">
          <view class="form-title">收货信息</view>
          <view class="form-subtitle">寄茶时用到，仅此一用</view>
        </view>

        <!-- 输入框组 -->
        <view class="form-fields">
          <view class="form-row">
            <view class="form-field">
              <text class="field-label">收货人</text>
              <input class="field-input" v-model="address.name" placeholder="姓名" />
            </view>
            <view class="form-field">
              <text class="field-label">手机号</text>
              <input class="field-input" v-model="address.phone" type="number" placeholder="11位手机号" maxlength="11" />
            </view>
          </view>
          <view class="form-field full">
            <text class="field-label">收货地址</text>
            <input class="field-input" v-model="address.address" placeholder="省 / 市 / 区 / 街道门牌号" />
          </view>
          <view class="form-field full">
            <text class="field-label optional">备注 <text class="optional-tag">选填</text></text>
            <input class="field-input" v-model="address.note" placeholder="如：放门卫处" />
          </view>
        </view>

        <!-- 提交 -->
        <button class="form-submit-btn" @click="confirmOrder">🌱 开始守候</button>
        <view class="form-footer-note">认养后即可开始你的守候 · 资料仅用于寄送</view>
        <text class="form-cancel-btn" @click="showAddressForm=false">再想想</text>

      </view>
    </view>

    <view class="cta-bar" v-if="target">
      <view class="cta-info">
        <view class="cta-label">认养方式</view>
        <view class="cta-plan-name">{{ selectedPlanName || '请选择套餐' }}</view>
        <view class="cta-price" v-if="selectedPlanPriceDisplay">¥{{ selectedPlanPriceDisplay }}<text style="font-size: 24rpx; color: #999;">/认养</text></view>
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
import { SERVER_URL } from '@/config.js'

export default {
  data() {return {
      target: null,
      updates: [],
      targetId: null,
      selectedPlanId: null,
      plans: [],
      descExpanded: false,
      loading: false,
      showAddressForm: false,
      showPoster: false,
      address: { name: '', phone: '', address: '', note: '', dedication: '' },
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
    targetTypeLabel() {
      const map = { tea: '茶树认养', herb: '植物认养', hydroponic: '植物认养', plant: '植物认养' }
      return map[this.targetType] || '认养对象'
    },
    availablePlans() {
      if (!this.target || !this.plans.length) return []
      const type = (this.target.type || '').toLowerCase()
      if (type === 'tea') return this.plans.filter(p => p.category === 'tea')
      if (type === 'hydroponic' || type === 'herb' || type === 'plant') return this.plans.filter(p => p.category === 'plant')
      return []
    },
    selectedPlan() {
      if (!this.selectedPlanId) return null
      return this.availablePlans.find(p => p.plan_key === this.selectedPlanId) || null
    },
    selectedPlanName() { return this.selectedPlan ? this.selectedPlan.name : '' },
    selectedPlanPrice() { return this.selectedPlan ? this.selectedPlan.price : null },
    selectedPlanPriceDisplay() { return this.selectedPlanPrice ? (this.selectedPlanPrice / 100).toFixed(0) : null },
    canSubmit() {
      return this.target && this.target.current_status === 'active' && !!this.selectedPlanId
    },
    submitBtnText() {
      if (!this.target) return '加载中'
      if (this.target.current_status !== 'active') return '已有人在守候'
      if (!this.selectedPlanId) return '先选一个方式'
      return '开始守候这棵树'
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
    },
    tempPercent() {
      const v = this.sensorData && this.sensorData.temperature
      if (v === null || v === undefined) return 0
      return Math.min(100, Math.max(0, Math.round(v / 40 * 100)))
    },
    humidPercent() {
      const v = this.sensorData && this.sensorData.humidity
      if (v === null || v === undefined) return 0
      return Math.min(100, Math.max(0, Math.round(v)))
    },
    soilPercent() {
      const v = this.sensorData && this.sensorData.soil_moisture
      if (v === null || v === undefined) return 0
      return Math.min(100, Math.max(0, Math.round(v)))
    }
  },

  onLoad(options) {
    this.targetId = Number(options.target_id)
    this.loadDetail()
    this.loadSensorData()
    this.loadChartData()
    this.fetchPlans()
  },

  methods: {

    async fetchPlans() {
      try {
        const res = await uni.request({ url: `${SERVER_URL}/api/plans`, method: 'GET' })
        this.plans = res.data || []
      } catch (e) {}
    },

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
      return SERVER_URL + path
    },

    async loadDetail() {
      uni.showLoading({ title: '加载中...', mask: true })
      try {
        const data = await getPlazaTargetDetail(this.targetId)
        this.target = data.target
        this.updates = data.updates.slice(0, 3)
      } catch (e) {
        uni.showToast({ title: '信号不太好，稍后再试', icon: 'none' })
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
          url: SERVER_URL + '/api/sensor/history?device_id=esp32-farm-01&hours=' + this.chartHours,
          method: 'GET'
        })
        const raw = res.data && res.data.data ? res.data.data : []
        if (raw.length === 0) {
          this.chartEmpty = true
          this.chartLoading = false
          return
        }

        // 通用聚合辅助
        const avg = arr => arr.length
          ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1))
          : null

        let labels, temps, humis

        if (this.chartHours <= 24) {
          // ── 24h：按小时聚合（最多24点），刻度每6小时显示一次
          const buckets = {}
          raw.forEach(d => {
            const dt = new Date(d.recorded_at + 'Z')
            const h = dt.getHours()
            const key = h.toString().padStart(2, '0')
            if (!buckets[key]) buckets[key] = { temps: [], humis: [] }
            if (d.temperature !== null) buckets[key].temps.push(d.temperature)
            if (d.humidity !== null) buckets[key].humis.push(d.humidity)
          })
          const sorted = Object.keys(buckets).sort()
          labels = sorted.map(k => parseInt(k) % 6 === 0 ? k + ':00' : '')
          temps  = sorted.map(k => avg(buckets[k].temps))
          humis  = sorted.map(k => avg(buckets[k].humis))

        } else if (this.chartHours <= 168) {
          // ── 7天：按日聚合（7点，不再按小时 → 告别168点密集图）
          const buckets = {}
          raw.forEach(d => {
            const dt = new Date(d.recorded_at + 'Z')
            const dateKey = dt.toISOString().substring(0, 10)           // 排序用
            const label   = (dt.getMonth() + 1) + '/' + dt.getDate()   // 显示用
            if (!buckets[dateKey]) buckets[dateKey] = { temps: [], humis: [], label }
            if (d.temperature !== null) buckets[dateKey].temps.push(d.temperature)
            if (d.humidity !== null) buckets[dateKey].humis.push(d.humidity)
          })
          const sorted = Object.keys(buckets).sort()
          labels = sorted.map(k => buckets[k].label)
          temps  = sorted.map(k => avg(buckets[k].temps))
          humis  = sorted.map(k => avg(buckets[k].humis))

        } else {
          // ── 30天：按日聚合，刻度每5天显示一次
          const buckets = {}
          raw.forEach(d => {
            const dt = new Date(d.recorded_at + 'Z')
            const dateKey = dt.toISOString().substring(0, 10)
            const label   = (dt.getMonth() + 1) + '/' + dt.getDate()
            if (!buckets[dateKey]) buckets[dateKey] = { temps: [], humis: [], label }
            if (d.temperature !== null) buckets[dateKey].temps.push(d.temperature)
            if (d.humidity !== null) buckets[dateKey].humis.push(d.humidity)
          })
          const sorted = Object.keys(buckets).sort()
          labels = sorted.map((k, i) =>
            (i % 5 === 0 || i === sorted.length - 1) ? buckets[k].label : ''
          )
          temps = sorted.map(k => avg(buckets[k].temps))
          humis = sorted.map(k => avg(buckets[k].humis))
        }

        // 计算两条线的共同 Y 轴范围，确保两线都可见
        const allVals = [...temps, ...humis].filter(v => v !== null)
        const yMin = allVals.length ? Math.floor(Math.min(...allVals)) - 4 : 0
        const yMax = allVals.length ? Math.ceil(Math.max(...allVals))  + 4 : 100

        this.chartLoading = false
        this.$nextTick(() => {
          const ctx = uni.createCanvasContext('sensorChart', this)
          new UCharts({
            type: 'line',
            context: ctx,
            width: uni.upx2px(618),
            height: uni.upx2px(420),
            categories: labels,
            series: [
              {
                name: '温度',
                data: temps,
                color: '#2d5a27',
                filled: true,
                fillOpacity: 0.12,
                lineWidth: 2
              },
              {
                name: '湿度',
                data: humis,
                color: '#5b9bd5',
                filled: true,
                fillOpacity: 0.08,
                lineWidth: 2
              }
            ],
            xAxis: { disableGrid: true, fontSize: 9 },
            yAxis: { min: yMin, max: yMax, fontSize: 10, gridColor: '#f5f5f5', splitNumber: 4 },
            legend: { show: false },
            background: '#ffffff',
            padding: [16, 16, 16, 16],
            dataLabel: false,
            dataPointShape: false,
            animation: true
          })
        })
      } catch(e) {
        this.chartLoading = false
        this.chartEmpty = true
      }
    },

    selectPlan(plan) {
      this.selectedPlanId = plan.plan_key
    },
    isRecommended(plan) {
      return plan.plan_key === 'tea_standard' || plan.plan_key === 'plant_basic'
    },

    async loadSensorData() {
      try {
        const res = await uni.request({
          url: SERVER_URL + '/api/sensor/latest?device_id=esp32-farm-01',
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
          url: SERVER_URL + '/api/orders/',
          method: 'POST',
          header: { 'Authorization': 'Bearer ' + (uni.getStorageSync('token') || '') },
          data: {
            target_id: this.target.id,
            plan_type: this.selectedPlanId,
            price: this.selectedPlanPrice,
            receiver_name: this.address.name,
            receiver_phone: this.address.phone,
            receiver_address: this.address.address,
            receiver_note: this.address.note,
            dedication: this.address.dedication || ''
          }
        })
        uni.hideLoading()
        if (res.data && res.data.id) {
          this.showAddressForm = false
          // 本地存寄语，用 orderId 作 key（兼容后端不存的情况）
          if (this.address.dedication) {
            uni.setStorageSync('dedication_' + res.data.id, this.address.dedication)
          }
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
.target-meta-row { display: flex; gap: 12rpx; margin-bottom: 16rpx; }
.target-code-badge { font-size: 22rpx; color: #999; background: #f5f5f0; padding: 4rpx 16rpx; border-radius: 999rpx; }
.target-type-badge { font-size: 22rpx; color: #2d5a27; background: #e8f5e9; padding: 4rpx 16rpx; border-radius: 999rpx; }
.target-location { font-size: 28rpx; color: #666; }
.desc-wrap { margin-top: 16rpx; }
.desc-text { font-size: 26rpx; color: #888; line-height: 1.8; }
.desc-text.collapsed { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.desc-toggle { font-size: 24rpx; color: #2d5a27; margin-top: 10rpx; }
.plan-section { margin: 40rpx 30rpx; }
.section-title { font-size: 17px; font-weight: 600; color: #2d5a27; margin-bottom: 24rpx; }
.plan-list { display: flex; flex-direction: column; gap: 24rpx; }
.plan-card { background: white; border-radius: 16rpx; padding: 32rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); position: relative; border: 2rpx solid transparent; }
.plan-card.selected { border-color: #2d5a27; background: #f6f9f4; }
.plan-name { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 8rpx; }
.plan-desc { font-size: 26rpx; color: #666; line-height: 1.5; margin-bottom: 16rpx; }
.plan-price { font-size: 36rpx; font-weight: bold; color: #2d5a27; }
.plan-check { position: absolute; top: 20rpx; right: 20rpx; background: #2d5a27; color: white; padding: 6rpx 16rpx; border-radius: 999rpx; font-size: 22rpx; }
.plan-recommend-badge {
  position: absolute; top: 0; right: 24rpx;
  background: linear-gradient(135deg, #e8a020, #c47d10);
  color: white; font-size: 20rpx; padding: 6rpx 16rpx;
  border-radius: 0 0 12rpx 12rpx; font-weight: 500;
}
.adopted-notice { margin: 80rpx 30rpx; text-align: center; padding: 60rpx; background: white; border-radius: 16rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.notice-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.notice-text { font-size: 28rpx; color: #666; }
/* ── 收货信息弹窗 ── */
.address-mask {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45); z-index: 100;
  display: flex; align-items: flex-end;
}
.address-form {
  background: #fff; width: 100%;
  border-radius: 32rpx 32rpx 0 0;
  padding: 0 0 calc(32rpx + env(safe-area-inset-bottom));
  max-height: 90vh; overflow-y: auto;
}
/* 拖拽把手 */
.form-handle {
  width: 64rpx; height: 8rpx; border-radius: 999rpx;
  background: #e0e0e0; margin: 16rpx auto 0;
}
/* 订单摘要 */
.form-order-summary {
  display: flex; align-items: center; justify-content: space-between;
  margin: 24rpx 32rpx 0;
  background: linear-gradient(135deg, #f0f7ee 0%, #e8f5e5 100%);
  border-radius: 20rpx; padding: 24rpx 28rpx;
  border: 1rpx solid rgba(45,90,39,0.12);
}
.summary-tree { display: flex; align-items: center; gap: 16rpx; flex: 1; min-width: 0; }
.summary-emoji { font-size: 40rpx; flex-shrink: 0; }
.summary-info { display: flex; flex-direction: column; gap: 4rpx; min-width: 0; }
.summary-name { font-size: 28rpx; font-weight: 700; color: #1a3d16; }
.summary-plan { font-size: 22rpx; color: #5a8a52; }
.summary-price { flex-shrink: 0; text-align: right; }
.summary-price-num { font-size: 36rpx; font-weight: bold; color: #2d5a27; }
/* 寄语 */
.dedication-wrap {
  margin: 24rpx 32rpx 0;
  background: linear-gradient(135deg, #fff9ee 0%, #fffdf5 100%);
  border: 1.5rpx solid rgba(212,169,106,0.3);
  border-radius: 20rpx; padding: 20rpx 24rpx;
}
.dedication-label {
  font-size: 22rpx; font-weight: 600; color: #b89050;
  margin-bottom: 10rpx; display: flex; align-items: center; gap: 10rpx;
}
.dedication-input {
  width: 100%; box-sizing: border-box;
  font-size: 28rpx; color: #444;
  background: transparent; border: none;
  padding: 0; line-height: 1.6;
  font-style: italic;
}
.dedication-count {
  display: block; text-align: right;
  font-size: 20rpx; color: #ccc; margin-top: 8rpx;
}
/* 表单标题 */
.form-header { padding: 28rpx 32rpx 4rpx; }
.form-title { font-size: 30rpx; font-weight: 700; color: #222; }
.form-subtitle { font-size: 22rpx; color: #bbb; margin-top: 4rpx; }
/* 字段组 */
.form-fields { padding: 20rpx 32rpx 0; }
.form-row { display: flex; gap: 16rpx; margin-bottom: 0; }
.form-row .form-field { flex: 1; }
.form-field { margin-bottom: 20rpx; }
.form-field.full { width: 100%; }
.field-label {
  font-size: 22rpx; font-weight: 600; color: #888;
  text-transform: uppercase; letter-spacing: 0.5px;
  margin-bottom: 8rpx; display: block;
}
.optional { color: #aaa; font-weight: 400; }
.optional-tag {
  font-size: 20rpx; color: #bbb;
  background: #f5f5f5; padding: 2rpx 10rpx;
  border-radius: 999rpx; margin-left: 6rpx;
}
.field-input {
  width: 100%; box-sizing: border-box;
  background: #f7f9f7;
  border: 1.5rpx solid #e8ede8;
  border-radius: 16rpx;
  padding: 22rpx 20rpx;
  font-size: 28rpx; color: #222;
  transition: border-color 0.2s;
}
.field-input:focus { border-color: #2d5a27; background: #f0f7ee; }
/* 提交按钮 */
.form-submit-btn {
  display: block; width: calc(100% - 64rpx);
  margin: 24rpx 32rpx 0;
  background: linear-gradient(135deg, #2d5a27 0%, #3d7a35 100%);
  color: white; border: none;
  border-radius: 999rpx;
  padding: 28rpx; font-size: 30rpx; font-weight: 600;
  box-shadow: 0 6rpx 20rpx rgba(45,90,39,0.3);
}
.form-submit-btn:active { opacity: 0.9; transform: scale(0.99); }
.form-footer-note {
  text-align: center; font-size: 22rpx; color: #ccc;
  margin-top: 16rpx; padding: 0 32rpx;
}
.form-cancel-btn {
  display: block; text-align: center;
  color: #bbb; font-size: 26rpx;
  padding: 20rpx; margin-top: 4rpx;
  cursor: pointer;
}
.cta-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 24rpx 30rpx; background: white; box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.08); padding-bottom: calc(24rpx + env(safe-area-inset-bottom)); }
.cta-info { flex: 1; }
.cta-label { font-size: 24rpx; color: #999; }
.cta-plan-name { font-size: 28rpx; font-weight: bold; color: #333; margin-top: 4rpx; }
.cta-price { font-size: 32rpx; font-weight: bold; color: #2d5a27; margin-top: 8rpx; }
.cta-btn { background: #2d5a27; color: white; border: none; border-radius: 50rpx; padding: 20rpx 48rpx; font-size: 30rpx; }
.cta-btn-disabled { background: #ccc; color: #999; }

/* ── 农庄实况 ── */
.sensor-card { margin: 24rpx 30rpx; background: white; border-radius: 24rpx; padding: 36rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); }
.sensor-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32rpx; }
.sensor-title { font-size: 30rpx; font-weight: 600; color: #222; }
.sensor-live { display: flex; align-items: center; gap: 8rpx; }
.live-dot {
  width: 12rpx; height: 12rpx; border-radius: 50%; background: #2d5a27;
  box-shadow: 0 0 0 4rpx rgba(45,90,39,0.2);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4rpx rgba(45,90,39,0.2); }
  50% { box-shadow: 0 0 0 8rpx rgba(45,90,39,0.08); }
}
.live-text { font-size: 22rpx; color: #aaa; }

.sensor-grid { display: flex; align-items: stretch; }
.sensor-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0; }
.sensor-sep { width: 1rpx; background: #f0f0f0; margin: 0 4rpx; align-self: stretch; }

.sensor-icon { font-size: 36rpx; margin-bottom: 12rpx; }
.sensor-value-row { display: flex; align-items: baseline; gap: 2rpx; }
.sensor-value { font-size: 40rpx; font-weight: 700; color: #1a1a1a; line-height: 1; }
.sensor-unit { font-size: 20rpx; color: #999; }
.sensor-label { font-size: 20rpx; color: #bbb; margin-top: 6rpx; margin-bottom: 14rpx; }

.sensor-bar-wrap {
  width: 80%; height: 6rpx; background: #f0f0f0; border-radius: 999rpx;
  overflow: hidden; margin-bottom: 12rpx;
}
.sensor-bar-fill {
  height: 100%; border-radius: 999rpx; transition: width 0.6s ease;
}
.sensor-bar-fill.tag-green { background: linear-gradient(90deg, #5a8f4a, #2d5a27); }
.sensor-bar-fill.tag-orange { background: linear-gradient(90deg, #f0a030, #e67e22); }
.sensor-bar-fill.tag-blue { background: linear-gradient(90deg, #5b9bd5, #1976d2); }

.sensor-tag { display: inline-block; font-size: 19rpx; padding: 4rpx 14rpx; border-radius: 999rpx; }
.tag-green { background: #e8f5e2; color: #2d5a27; }
.tag-orange { background: #fff3e0; color: #e67e22; }
.tag-blue { background: #e3f2fd; color: #1976d2; }
.sensor-empty { text-align: center; color: #ccc; font-size: 26rpx; padding: 20rpx 0; }

/* ── 环境趋势 ── */
.chart-card { margin: 24rpx 30rpx; background: white; border-radius: 24rpx; padding: 36rpx; box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06); overflow: hidden; }
.chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.chart-title-wrap { display: flex; align-items: center; gap: 12rpx; }
.chart-title-accent { width: 6rpx; height: 30rpx; background: #2d5a27; border-radius: 999rpx; }
.chart-title { font-size: 30rpx; font-weight: 600; color: #222; }
.chart-tabs { display: flex; gap: 8rpx; }
.chart-tab { font-size: 21rpx; color: #999; padding: 8rpx 18rpx; border-radius: 999rpx; background: #f5f5f0; }
.chart-tab.active { background: #2d5a27; color: white; }
.chart-legend { display: flex; gap: 28rpx; margin-bottom: 20rpx; padding-left: 4rpx; }
.legend-item { display: flex; align-items: center; gap: 10rpx; font-size: 22rpx; color: #888; }
.legend-line { width: 32rpx; height: 4rpx; border-radius: 2rpx; }
.legend-line.temp { background: #2d5a27; }
.legend-line.humi { background: #5b9bd5; }
.chart-canvas { width: 618rpx; height: 420rpx; display: block; }
.chart-loading { text-align: center; color: #ccc; font-size: 26rpx; padding: 60rpx 0; }

.poster-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.poster-wrap { display: flex; flex-direction: column; align-items: center; }
.poster-canvas { width: 630rpx; height: 1120rpx; border-radius: 16rpx; overflow: hidden; }
.poster-actions { margin-top: 32rpx; display: flex; gap: 24rpx; }
.poster-save-btn { background: #2d5a27; color: white; border: none; border-radius: 50rpx; padding: 20rpx 48rpx; font-size: 28rpx; }
.poster-close-btn { background: rgba(255,255,255,0.15); color: white; border: none; border-radius: 50rpx; padding: 20rpx 48rpx; font-size: 28rpx; }

</style>
