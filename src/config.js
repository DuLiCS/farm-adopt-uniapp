// 全局配置，所有常量统一在这里管理
export const SERVER_URL = 'https://shannanji.com'
export const DEVICE_ID = 'esp32-farm-01'
export const BASE_URL = 'https://shannanji.com'
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
    type: 'tea',
    details: [
      '🍃 春季明前干茶 200g 寄送到家',
      '📅 全年24节气农庄动态更新',
      '📜 专属电子山南认养证书',
      '📷 认养期间专属探望视角',
      '⏱ 认养周期：一年'
    ]
  },
  {
    id: 'tea_standard',
    name: '茶树认养 · 标准档',
    price: 999,
    desc: '明前100g+谷雨200g分两次寄送 · 全年节气更新 · 年末手写信',
    type: 'tea',
    details: [
      '🍃 明前干茶 100g + 谷雨干茶 200g 分两次寄送',
      '📅 全年24节气农庄动态更新',
      '📜 专属电子山南认养证书',
      '📷 认养期间专属探望视角',
      '✉️ 年末来自农庄的手写信一封',
      '⏱ 认养周期：一年'
    ]
  },
  {
    id: 'plant_basic',
    name: '植物认养 · 薄荷/迷迭香',
    price: 149,
    desc: '90天周期 · 收获后寄送干制香草 · 生长过程全程记录',
    type: 'plant',
    details: [
      '🌿 收获后干制香草寄送到家',
      '📷 生长过程全程影像记录',
      '📜 专属电子山南认养证书',
      '⏱ 认养周期：90天'
    ]
  }
]
