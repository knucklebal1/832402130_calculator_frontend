import axios from 'axios'

/**
 * 统一的 axios 实例。
 *
 * baseURL 来自环境变量：开发环境为 /api（由 vite 代理转发到后端 8080），
 * 生产环境同样为 /api（由 Nginx 反向代理），因此前后端始终同源。
 */
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 响应拦截器：
 * - 成功时直接返回响应体数据，调用方无需再写 .data
 * - 失败时统一抛出 { success, code, message } 结构，方便界面直接展示 message
 */
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const body = error.response?.data
    const message =
      body && typeof body === 'object' && body.message
        ? body.message
        : '无法连接后端服务，请确认后端已启动'

    return Promise.reject({
      success: false,
      code: (body && body.code) || 'NETWORK_ERROR',
      message
    })
  }
)

export default http
