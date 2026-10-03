import http from './http'

/**
 * 计算接口：把表达式交给后端计算，结果由后端返回。
 * 前端不做任何算术运算。
 *
 * @param expression 待计算的表达式
 * @param angleMode  三角函数角度单位，"DEG"（角度）或 "RAD"（弧度）
 */
export function calculate(expression, angleMode = 'DEG') {
  return http.post('/calculate', { expression, angleMode })
}

/** 分页查询历史记录（数据来自后端数据库）。 */
export function fetchHistory({ page = 1, size = 10, keyword = '' } = {}) {
  return http.get('/history', { params: { page, size, keyword } })
}

/** 删除指定 id 的历史记录。 */
export function deleteHistory(id) {
  return http.delete(`/history/${id}`)
}

/** 清空全部历史记录（加分项）。 */
export function clearHistory() {
  return http.delete('/history')
}

/** 计算统计信息（加分项）。 */
export function fetchStats() {
  return http.get('/history/stats')
}
