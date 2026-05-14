import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'FacilityQrMatcher',
    component: () => import('@/views/FacilityQrMatcher.vue')
  },
  {
    path: '/saved-mappings',
    name: 'FacilityQrSavedMappings',
    component: () => import('@/views/FacilityQrSavedMappings.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes,
  scrollBehavior: () => ({ x: 0, y: 0 })
})

export default router
