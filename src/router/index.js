import { createRouter, createWebHistory } from 'vue-router'
import CalculatorView from '../views/CalculatorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/calculate' },
    {
      path: '/calculate',
      name: 'calculate',
      component: CalculatorView,
    },
  ],
})

export default router
