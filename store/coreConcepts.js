export default {
  namespaced: true,
  state: () => ({
    a: 123,
    b: []
  }),
  getters: {
    someGetter1 (state, getters) {
      return state.a + 1
    },
    someGetter2 (state, getters) {
      return state.a + getters.someGetter1
    }
  },
  mutations: {
    // (state, mutations이 실행될때 전달받은 값 주로 payload라고 많이 쓴다)
    someMutations (state, payload) {
      state.a = 789
      state.b.push(payload)
    }
  },
  actions: {
    // actions는 조금 다른게 context가 들어오는데 {state, getters, commit, dispaatch} 가 들어있음
    someAction (context, payload) {
      // state.a = 789 // Error
      // state.b.push(payload) // Error
      context.commit('someMutations', payload)
    },
    someActions2 (context, payload) {
      context.commit('someMutations')
      context.dispatch('someActions1', payload)
    }
  }
}
