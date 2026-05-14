import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { installModalAlert } from './utils/modalAlert'
import { applySavedThemeMode } from './utils/themeMode'
import { fixWebViewTextZoom } from './utils/native'

Vue.config.productionTip = false
installModalAlert()
applySavedThemeMode()
fixWebViewTextZoom()

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
