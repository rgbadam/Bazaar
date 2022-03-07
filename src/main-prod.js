import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './assets/css/global.css'
import axios from 'axios'
//第三方库，表格
import TreeTable from 'vue-table-with-tree-grid'
// 第三方库，编辑器
import VueQuillEditor from 'vue-quill-editor'
// 第三方库，进度条
import NProgress from 'nprogress'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// request拦截器
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')

  return config
})
// response拦截器
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)

// 过滤器
Vue.filter('dataFormat', function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  // 一位数的话前面加0
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
