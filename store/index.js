import Vue from 'vue'
import Vuex from 'vuex'

import todoApp from './todoApp'
Vue.use(Vuex)

export default new Vuex.Store({
  // 배포할때는 성능이슈 때문에 false로 해야함
  // 개발에서는 true
  strict: process.env.NODE_ENV !== 'production',

  modules: {
    // 독립적인 모듈로 작동
    todoApp
  }
})
