import Vue from 'vue'
import Router from 'vue-router'
import GiftIndex from '@/components/GiftIndex'
utils.imgLazyLoader.init({
  offset: 400
});
Vue.use(Router)
export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/gift/',
      name: 'GiftIndex',
      component: GiftIndex,
    }
  ]
})