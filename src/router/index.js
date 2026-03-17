import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/shadow-download' },
  {
    path: '/shadow-download',
    name: 'ShadowDownload',
    component: () => import('@/views/shadow-zone/shadow-download/ShadowDownload.vue')
  },
  {
    path: '/shadow-routine-check',
    name: 'ShadowRoutineCheck',
    component: () => import('@/views/shadow-zone/shadow-routine-check/ShadowRoutineCheck.vue')
  },
  {
    path: '/shadow-performance-check',
    name: 'ShadowPerformanceCheck',
    component: () => import('@/views/shadow-zone/shadow-performance-check/ShadowPerformanceCheck.vue')
  },
  {
    path: '/shadow-performance-verification',
    name: 'ShadowPerformanceVerification',
    component: () =>
      import('@/views/shadow-zone/shadow-performance-verification/ShadowPerformanceVerification.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes,
  scrollBehavior: () => ({ x: 0, y: 0 })
})

export default router
