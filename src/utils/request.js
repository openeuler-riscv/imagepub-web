import axios from "axios";

const service = axios.create({
  baseURL: "",
  timeout: 300 * 1000,
  headers: {
    "Content-Type": "application/json"
  }
});

// 请求拦截
service.interceptors.request.use(config => {
  config.headers = config.headers || {};
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = token;
  }
  return config;
});
// 响应拦截
service.interceptors.response.use(
  res => {
    // console.log(res.data);
    if (res.status >= 200 && res.status < 300) {
      return res;
    }
  },
  err => {
    if (err.response.status) {
      switch (err.response.status) {
        case 400:
          err.message = "错误请求";
          break;
        case 401:
          err.message = "未授权，请重新登录";
          break;
        case 403:
          err.message = "拒绝访问";
          break;
        case 404:
          err.message = "请求错误,未找到该资源!!!!";
          alert(err.message);
          break;
        case 405:
          err.message = "请求方法未允许";
          break;
        case 408:
          err.message = "请求超时";
          break;
        case 500:
          err.message = "服务器端出错";
          break;
        case 501:
          err.message = "网络未实现";
          break;
        case 502:
          err.message = "网络错误";
          break;
        case 503:
          err.message = "服务不可用";
          break;
        case 504:
          err.message = "网络超时";
          break;
        case 505:
          err.message = "http版本不支持该请求";
          break;
        default:
          err.message = `连接错误${err.response.status}`;
      }
    }

    return Promise.reject(err);
  }
);

export default {
  get(url, params) {
    return service.get(url, {
      params: params
    });
  }
};
