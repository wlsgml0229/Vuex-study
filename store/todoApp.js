
import lowdb from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'
import _cloneDeep from 'lodash/cloneDeep'
import cryptoRandomString from 'crypto-random-string'
import _find from 'lodash/find'
import _assign from 'lodash/assign'
import _findIndex from 'lodash/findIndex'
import _forEachRight from 'lodash/forEachRight'

export default {
  // 독립적으로 설정하려면 namespaced: true설정
  namespaced: true,
  // Data
  state: () => ({
    db: null,
    todos: [],
    filter: 'all'
  }),
  // computed - 계산해서 사용, state가변경되면 getters도 변경됨
  getters: {
    filteredTodos (state) {
      switch (state) {
        case 'all':
        default:
          // this.todos는 방금 작성한 computed 내의 todos()의 데이터이다.
          return state.todos
        case 'active':
          return state.todos.filter(todo => !todo.done)
        case 'completed':
          return state.todos.filter(todo => todo.done)
      }
    },
    total (state) {
      return state.todos.length
    },
    activeCount (state) {
      return state.todos.filter(todo => !todo.done).length
    },
    completedCount (state, getters) {
      return state.total - getters.activeCount
    }
  },
  // methods
  // 실제 값을 변경할 때( 비동기 X )
  mutations: {
    assignDB (state, db) {
      state.db = db
    },

    assignTodos (state, todos) {
      state.todos = todos
    },
    createDB (state, newTodo) {
      // DB에 저장 (데이터수정이들어가니까 mutations으로 옮김)
      state.db
        .get('todos')
        .push(newTodo)
        .write() // `todos` 배열을 반환합니다.
    },
    updateDB (state, { todo, value }) {
      state.db
        .get('todos')
        .find({ id: todo.id })
        .assign(value)
        .write()
    },
    deleteDB (state, todo) {
      state.db
        .get('todos')
        .remove({ id: todo.id })
        .write()
    },
    deleteTodo (state, index) {
      state.todos.splice(index, 1)
    },
    pushTodo (state, newTodo) {
      state.todos.push(newTodo)
    },
    assignTodo (state, { foundTodo, value }) {
      _assign(foundTodo, value)
    },
    updateTodo (state, { todo, key, value }) {
      todo[key] = value
    },
    updateFilter (state, filter) {
      state.filter = filter
    }
  },
  // methods
  // 일반 로직 ( 비동기 O )
  // state의 실제 값을 변경할 수 없음
  actions: {
    initDB ({ state, commit }) {
      const adapter = new LocalStorage('todo-app') // DB name
      // state.db = low(adapter)
      // commit을통해 mutations접근 (mutations명)
      commit('assignDB', lowdb(adapter))

      const hasTodos = state.db
        .has('todos') // Collection name
        .value()

      // 기존에 저장된 DB가 있는지 확인
      if (hasTodos) {
        // state.todos = _cloneDeep(state.db.getState().todos)
        commit('assignTodos', _cloneDeep(state.db.getState().todos))
      } else {
        // Local DB 초기화
        state.db
          .defaults({
            todos: []
          })
          .write()
      }
    },
    createTodo ({ state, commit }, title) {
      const newTodo = {
        id: cryptoRandomString({ length: 10 }),
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
        done: false
      }
      // crateDB
      commit('createDB', newTodo)

      // Create Client
      commit('pushTodo', newTodo)
    },
    updateTodo (context, { todo, value }) {
      // updateDB
      context.commit('updateDB', { todo, value })
      // Lodash 라이브러리 활용
      const foundTodo = _find(context.state.todos, { id: todo.id })
      context.commit('assignTodo', { foundTodo, value })
    },
    deleteTodo ({ state, commit }, todo) {
      // DeleteDB
      commit('deleteDB', todo)
      // Lodash 라이브러리 활용
      const foundIndex = _findIndex(state.todos, { id: todo.id })
      // Delete
      commit('deleteTodo', foundIndex)
    },
    completeAll ({ state, commit }, checked) {
      const newTodos = state.db
        .get('todos')
        .forEach(todo => {
          commit('updateTodo', {
            todo,
            key: 'done',
            value: checked
          })
        })
        .write() // 수정된 `todos` 배열을 반환합니다.

      commit('assignTodos', _cloneDeep(newTodos))
    },
    // 액션을 호출할때는 dispatch를 통해서 호출할 수 있음
    clearCompleted ({ state, dispatch }) {
      // 배열의 앞에서부터 제거할 경우 배열 순서가 밀리며 문제가 발생!
      // this.todos.forEach(todo => {
      //   if (todo.done) {
      //     this.deleteTodo(todo)
      //   }
      // })

      // 배열의 뒤에서부터 제거.
      // this.todos
      //   .reduce((list, todo, index) => {
      //     if (todo.done) {
      //       list.push(index)
      //     }
      //     return list
      //   }, [])
      //   .reverse()
      //   .forEach(index => {
      //     this.deleteTodo(this.todos[index])
      //   })

      // Lodash 라이브러리 활용
      _forEachRight(state.todos, todo => {
        if (todo.done) {
          dispatch('deleteTodo', todo)
        }
      })
    }
  }
}
