// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import login from './components/FreeLogin/freelogin.js';
import router from './router'
import wxAppRouter from './common/wxAppRouter';
YmtApi.openMiniAppConfig && YmtApi.openMiniAppConfig(wxAppRouter)

Vue.config.productionTip = false

const bus = new Vue()
function spaRedirect() {
  var match = window.location.search.match(/page=(.*)/)
  var encodedPath = match && match.length > 1 && match[1]

  if (encodedPath) {
    try {
      var realPath = decodeURIComponent(encodedPath)
      window.history && window.history.replaceState(null, '', realPath)
      YmtApi.wxReadyCallback.push(() => {
        bus.$emit('spaRedirectComplete', 1)
      })
      YmtApi.isWechatReady = false;
      YmtApi && YmtApi.initWechat();
    } catch (err) {
    }
  }
}

/* eslint-disable no-new */
spaRedirect()
Vue.use(login);
Vue.use({
  install(){
    Vue.prototype.$bus = bus
  }
})
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
