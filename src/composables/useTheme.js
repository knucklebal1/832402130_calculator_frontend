import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'calculator-theme'

/**
 * 主题切换（加分项）。
 *
 * 注意：这里缓存的只是"界面偏好"，不是计算历史。
 * 计算历史必须完全来自后端数据库，不能依赖 localStorage。
 */
const theme = ref(localStorage.getItem(STORAGE_KEY) || 'light')

watchEffect(() => {
  document.documentElement.dataset.theme = theme.value
  localStorage.setItem(STORAGE_KEY, theme.value)
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggleTheme }
}
