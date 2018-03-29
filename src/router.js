import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Contracts from './views/Contracts.vue'
import AENS from './views/AENS.vue'
import Transfer from './views/Transfer.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/contracts',
      name: 'contracts',
      component: Contracts
    },
    {
      path: '/aens',
      name: 'aens',
      component: AENS
    },
    {
      path: '/transfer',
      name: 'transfer',
      component: Transfer
    }
  ]
})
