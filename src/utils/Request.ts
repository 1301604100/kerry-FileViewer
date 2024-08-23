import axios from 'axios';

const Request = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

/**
 * 请求拦截器
 * 功能：配置请求头
 */
Request.interceptors.request.use(
  (config) => {
    const token = '222';
    config.headers.authorization = 'Bearer ' + token;
    return config;
  },
  (error) => {
    console.error('网络错误，请稍后重试');
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 * 功能：处理异常
 */
Request.interceptors.response.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default Request;
