/**
 * 统一 storage key 常量与辅助函数
 * 所有对 uni.getStorageSync / setStorageSync 的调用都应通过这里，
 * 避免魔法字符串散落各处导致拼写错误或 key 冲突。
 */

export const KEYS = {
  TOKEN: 'token',
  PHONE: 'phone',
  /** 每天一个 key，当天关闭节气横幅后不再展示 */
  jieqiDismissed: (date) => `jieqi_dismissed_${date}`,
  /** 本地暂存认养寄语，key 与订单 ID 绑定 */
  dedication: (orderId) => `dedication_${orderId}`,
}

export const storage = {
  getToken: () => uni.getStorageSync(KEYS.TOKEN) || '',
  setToken: (v) => uni.setStorageSync(KEYS.TOKEN, v),
  removeToken: () => uni.removeStorageSync(KEYS.TOKEN),

  getPhone: () => uni.getStorageSync(KEYS.PHONE) || '',
  setPhone: (v) => uni.setStorageSync(KEYS.PHONE, v),
  removePhone: () => uni.removeStorageSync(KEYS.PHONE),

  getJieqiDismissed: (date) => !!uni.getStorageSync(KEYS.jieqiDismissed(date)),
  setJieqiDismissed: (date) => uni.setStorageSync(KEYS.jieqiDismissed(date), true),

  getDedication: (orderId) => uni.getStorageSync(KEYS.dedication(orderId)) || '',
  setDedication: (orderId, text) => uni.setStorageSync(KEYS.dedication(orderId), text),
}
