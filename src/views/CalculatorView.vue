<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import DisplayPanel from '../components/DisplayPanel.vue'
import HistoryPanel from '../components/HistoryPanel.vue'
import Keypad from '../components/Keypad.vue'
import ScientificPanel from '../components/ScientificPanel.vue'
import StatsCard from '../components/StatsCard.vue'
import { calculate, clearHistory, deleteHistory, fetchHistory, fetchStats } from '../api/calculator'
import { useTheme } from '../composables/useTheme'
import { ATOMIC_INPUT_TOKENS, toDisplayExpression } from '../utils/formatExpression'

const { theme, toggleTheme } = useTheme()

/* ---------------- 计算区状态 ---------------- */

const expression = ref('')
const result = ref('')
const errorMessage = ref('')
const loading = ref(false)

/** 三角函数角度单位：DEG（角度制，默认）或 RAD（弧度制） */
const angleMode = ref('DEG')

/**
 * 上一次计算是否刚刚完成。
 *
 * <p>按下 = 之后表达式和结果都留在界面上，方便用户核对；
 * 等他真正开始输入下一道题时，再把这两者一起清掉。
 */
const justCalculated = ref(false)

/** 界面上展示的数学写法，例如把 sqrt(2) 显示成 √(2)、abs(-7) 显示成 |-7| */
const displayExpression = computed(() => toDisplayExpression(expression.value))

/* ---------------- 历史区状态 ---------------- */

const history = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const keyword = ref('')
const historyLoading = ref(false)
const stats = ref(null)

/* ---------------- 表达式输入 ---------------- */

/** 拼接按键内容。前端只做字符串处理，不做任何计算。 */
function appendToken(token) {
  // 上一道题的结果还留在屏幕上，此时用户开始输入下一次运算，
  // 才把表达式和结果一起清掉，从空开始。
  if (justCalculated.value) {
    expression.value = ''
    result.value = ''
    justCalculated.value = false
  }
  expression.value += token
  errorMessage.value = ''
}

/** 退格属于"修改当前显示的式子"，保留表达式，只清掉上一次的结果。 */
function backspace() {
  justCalculated.value = false
  // 一次删掉一整个按钮插入的内容（sqrt(、abs(、sin(、pi…），
  // 而不是逐个字符删——否则中途会露出 sqrt、abs 这类内部代码写法
  const atomicToken = ATOMIC_INPUT_TOKENS.find((token) => expression.value.endsWith(token))
  expression.value = atomicToken
    ? expression.value.slice(0, -atomicToken.length)
    : expression.value.slice(0, -1)
  result.value = ''
  errorMessage.value = ''
}

function clearExpression() {
  justCalculated.value = false
  expression.value = ''
  result.value = ''
  errorMessage.value = ''
}

/**
 * 减号键：既做减法，也承担原来 ± 的正负号功能。
 *
 * <p>判断依据是当前位置"能不能直接写一个负数"：
 * 表达式开头、运算符之后、左括号之后，减号就是正负号；
 * 数字、右括号、百分号之后，减号是普通的减法运算符。
 *
 * <p>在正负号位置再按一次，可以取消刚写下的负号，等价于原来 ± 的来回切换。
 */
function appendMinus() {
  if (justCalculated.value) {
    expression.value = ''
    result.value = ''
    justCalculated.value = false
  }

  const current = expression.value
  const isSignAtEnd =
    current.endsWith('-') &&
    (current.length === 1 || /[+\-*/(]$/.test(current.slice(0, -1)))

  expression.value = isSignAtEnd ? current.slice(0, -1) : `${current}-`
  errorMessage.value = ''
}

/* ---------------- 与后端交互 ---------------- */

/** 提交计算：把表达式发给后端，结果完全以后端返回为准。 */
async function submit() {
  const expr = expression.value.trim()
  if (!expr || loading.value) {
    if (!expr) {
      errorMessage.value = '请先输入表达式'
    }
    return
  }

  // 刚算完且表达式没有改动，重复按 = 直接忽略，避免产生重复的历史记录
  if (justCalculated.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const data = await calculate(expr, angleMode.value)
    result.value = data.result
    // 计算成功后表达式和结果都保留在屏幕上，等用户开始下一次输入时再一起清掉
    justCalculated.value = true
    // 计算成功后重新从后端拉取历史，保证展示的是数据库的最新状态
    await Promise.all([loadHistory(1), loadStats()])
  } catch (error) {
    result.value = ''
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

/** 角度制 / 弧度制切换。 */
function toggleAngleMode() {
  angleMode.value = angleMode.value === 'DEG' ? 'RAD' : 'DEG'
}

async function loadHistory(targetPage = page.value) {
  historyLoading.value = true
  try {
    const data = await fetchHistory({ page: targetPage, size: size.value, keyword: keyword.value })
    history.value = data.list
    total.value = data.total
    page.value = data.page
    errorMessage.value = ''
  } catch (error) {
    history.value = []
    errorMessage.value = error.message
  } finally {
    historyLoading.value = false
  }
}

async function loadStats() {
  try {
    stats.value = await fetchStats()
  } catch {
    // 统计属于加分项，失败时不打断主流程
    stats.value = null
  }
}

function handleSearch(value) {
  keyword.value = value
  loadHistory(1)
}

async function handleRemove(item) {
  try {
    await deleteHistory(item.id)
    // 删除后按后端最新状态重新查询；当前页删空时自动回到上一页
    const lastItemOnPage = history.value.length === 1
    const targetPage = lastItemOnPage && page.value > 1 ? page.value - 1 : page.value
    await loadHistory(targetPage)
    await loadStats()
  } catch (error) {
    errorMessage.value = error.message
  }
}

async function handleClearAll() {
  try {
    await clearHistory()
    await loadHistory(1)
    await loadStats()
  } catch (error) {
    errorMessage.value = error.message
  }
}

/* ---------------- 按键与键盘快捷键 ---------------- */

function handleKey(key) {
  switch (key) {
    case 'AC':
      clearExpression()
      break
    case 'BACK':
      backspace()
      break
    case '-':
      appendMinus()
      break
    case '=':
      submit()
      break
    default:
      appendToken(key)
  }
}

/** 键盘上可以直接输入的字符（减号单独走 appendMinus，所以不在这里） */
const INPUT_SYMBOL = /^[0-9+*/().%]$/

function onKeydown(event) {
  const tag = event.target?.tagName
  // 在搜索框里输入时不触发计算器快捷键
  if (tag === 'INPUT' || tag === 'TEXTAREA') {
    return
  }

  const key = event.key
  if (key === '-') {
    appendMinus()
    event.preventDefault()
  } else if (INPUT_SYMBOL.test(key)) {
    appendToken(key)
    event.preventDefault()
  } else if (key === 'Enter' || key === '=') {
    submit()
    event.preventDefault()
  } else if (key === 'Backspace') {
    backspace()
    event.preventDefault()
  } else if (key === 'Escape' || key === 'Delete') {
    clearExpression()
    event.preventDefault()
  }
}

onMounted(() => {
  loadHistory(1)
  loadStats()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div>
        <h1 class="app-title">前后端分离计算器</h1>
        <p class="app-subtitle">
          表达式校验、解析与计算全部由 Spring Boot 后端完成，计算历史持久化在 MySQL
        </p>
      </div>
      <button class="theme-toggle" type="button" @click="toggleTheme">
        {{ theme === 'light' ? '🌙 深色' : '☀️ 浅色' }}
      </button>
    </header>

    <div class="main-grid">
      <section class="card">
        <h2 class="card-title">计算</h2>

        <DisplayPanel
          :expression="displayExpression"
          :result="result"
          :error-message="errorMessage"
          :loading="loading"
        />

        <ScientificPanel
          :angle-mode="angleMode"
          :disabled="loading"
          @key="handleKey"
          @toggle-angle="toggleAngleMode"
        />

        <Keypad :disabled="loading" @key="handleKey" />
      </section>

      <div class="sidebar-stack">
        <StatsCard :stats="stats" />
        <HistoryPanel
          :items="history"
          :total="total"
          :page="page"
          :size="size"
          :loading="historyLoading"
          :keyword="keyword"
          @search="handleSearch"
          @change-page="loadHistory"
          @remove="handleRemove"
          @clear-all="handleClearAll"
          @refresh="loadHistory()"
        />
      </div>
    </div>
  </div>
</template>
