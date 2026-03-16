// 全局配置，所有常量统一在这里管理
export const SERVER_URL = 'http://47.102.138.74'
export const DEVICE_ID = 'esp32-farm-01'

export const BASE_URL = ''

export const ADMIN_CONFIG = {
  username: 'admin',
  password: 'farm2026'
}

export const PLANS = [
  {
    id: 'tea_basic',
    name: '茶树认养 · 基础档',
    price: 599,
    desc: '春季寄送干茶200g · 全年24节气更新 · 电子山南证书',
    type: 'tea'
  },
  {
    id: 'tea_standard',
    name: '茶树认养 · 标准档',
    price: 999,
    desc: '明前100g+谷雨200g分两次寄送 · 全年节气更新 · 年末手写信',
    type: 'tea'
  },
  {
    id: 'plant_basic',
    name: '植物认养 · 薄荷/迷迭香',
    price: 149,
    desc: '90天周期 · 收获后寄送干制香草 · 生长过程全程记录',
    type: 'plant'
  }
]