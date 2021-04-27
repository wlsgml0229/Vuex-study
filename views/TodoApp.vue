<template>
  <div class="todo-app">

    <div class="todo-app__actions">
      <!-- FILTERS -->
      <div class="filters">
        <router-link
          to="all"
          tag="button"
        >
          모든 항목 ({{ total }})
        </router-link>
        <router-link
          to="active"
          tag="button"
        >
          해야 할 항목 ({{ activeCount }})
        </router-link>
        <router-link
          to="completed"
          tag="button"
        >
          완료된 항목 ({{ completedCount }})
        </router-link>
      </div>

      <!-- ACTIONS -->
      <div class="actions clearfix">
        <label class="float--left">
          <input
            v-model="allDone"
            type="checkbox"
          />
          <span class="icon"><i class="material-icons">done_all</i></span>
        </label>
        <div class="float--right clearfix">
          <button
            class="btn float--left"
            @click="scrollToTop"
          >
            <i class="material-icons">expand_less</i>
          </button>
          <button
            class="btn float--left"
            @click="scrollToBottom"
          >
            <i class="material-icons">expand_more</i>
          </button>
          <button
            class="btn btn--danger float--left"
            @click="clearCompleted"
          >
            <i class="material-icons">delete_sweep</i>
          </button>
        </div>
      </div>
    </div>

    <!-- 리스트 -->
    <div class="todo-app__list">
      <todo-item
        v-for="todo in filteredTodos"
        :key="todo.id"
        :todo="todo"
      />
    </div>

    <!--할일 생성 -->
    <todo-creator
      class="todo-app__creator"
    />

  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import scrollTo from 'scroll-to'
import TodoCreator from '~/components/TodoCreator'
import TodoItem from '~/components/TodoItem'

export default {
  name: 'TodoApp',
  components: {
    TodoCreator,
    TodoItem
  },
  data () {
    return {

    }
  },
  computed: {
    // Helpers
    // ...mapState (네임스페이스, 가져올데이터문자열로 )
    ...mapState('todoApp', [
      'todos'
    ]),
    ...mapGetters('todoApp', [
      'total',
      'activeCount',
      'completedCount',
      'filteredTodos'
    ]),
    // total () {
    //   return this.$store.gettters.todoApp.total
    // },
    // activeCount () {
    //   return this.$store.gettters.todoApp.activeCount
    // },
    allDone: {
      get () {
        const length = this.todos.length
        // 전체 항목 개수와 완료된 항목 개수가 일치하고 항목 개수가 1개 이상인 경우.
        return length === this.completedCount && length > 0
      },
      set (checked) {
        this.completeAll(checked)
      }
    }
  },
  watch: {
    $route () {
      this.updateFilter(this.$route.params.id)
    }
  },
  created () {
    this.initDB()
    // store 접근 (todoApp에 들어있는 updateTodo 호출)
    // 2번째 인수까지만 전달, 3번째는 전달이 안되고 무시됨
  },
  methods: {
    ...mapMutations('todoApp', [
      'updateFilter'
    ]),
    ...mapActions('todoApp', [
      'initDB',
      'completeAll',
      'clearCompleted'
    ]),
    // updateTodo () {
    //   this.$store.commit('todoApp/updateTodo')
    // },
    // initDB () {
    //   this.$store.dispatch('todoApp/initDB', this.todos)
    // },
    scrollToBottom () {
      scrollTo(0, document.body.scrollHeight) // x, y
    },
    scrollToTop () {
      scrollTo(0, 0)
    }
  }
}
</script>

<style lang="scss">
  @import "scss/style";

  .filters button.router-link-active {
    background: royalblue;
    color: white;
  }
</style>
