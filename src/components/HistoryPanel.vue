<script setup>
import { computed, ref } from 'vue'
import { toDisplayExpression } from '../utils/formatExpression'

const props = defineProps({
  items: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  size: { type: Number, default: 10 },
  loading: { type: Boolean, default: false },
  keyword: { type: String, default: '' }
})

const emit = defineEmits(['search', 'change-page', 'remove', 'clear-all', 'refresh'])

const localKeyword = ref(props.keyword)

const pages = computed(() => Math.max(Math.ceil(props.total / props.size), 1))

function emitSearch() {
  emit('search', localKeyword.value.trim())
}

function onClearAll() {
  if (window.confirm('确定清空全部计算历史吗？该操作会删除数据库中的全部记录。')) {
    emit('clear-all')
  }
}

function onRemove(item) {
  if (window.confirm(`确定删除记录 #${item.id}（${item.expression}）吗？`)) {
    emit('remove', item)
  }
}
</script>

<template>
  <section class="card">
    <h2 class="card-title">
      <span>计算历史</span>
      <span style="font-size: 12px; color: var(--muted)">共 {{ total }} 条</span>
    </h2>

    <div class="history-toolbar">
      <input
        v-model="localKeyword"
        class="input"
        type="text"
        @keyup.enter="emitSearch"
      />
      <button class="btn" type="button" @click="emitSearch">搜索</button>
      <button class="btn" type="button" @click="$emit('refresh')">刷新</button>
      <button class="btn btn-danger" type="button" :disabled="!total" @click="onClearAll">
        清空
      </button>
    </div>

    <div v-if="loading" class="empty-state">加载中…</div>
    <div v-else-if="!items.length" class="empty-state">暂无历史记录</div>
    <ul v-else class="history-list">
      <li v-for="item in items" :key="item.id" class="history-item">
        <span class="history-id">#{{ item.id }}</span>
        <div class="history-body">
          <div class="history-expression">{{ toDisplayExpression(item.expression) }}</div>
          <div class="history-result">= {{ item.result }}</div>
        </div>
        <span class="history-time">{{ item.createdAt }}</span>
        <button class="history-delete" type="button" @click="onRemove(item)">删除</button>
      </li>
    </ul>

    <div class="pagination">
      <button
        class="btn"
        type="button"
        :disabled="page <= 1"
        @click="$emit('change-page', page - 1)"
      >
        上一页
      </button>
      <span>第 {{ page }} / {{ pages }} 页</span>
      <button
        class="btn"
        type="button"
        :disabled="page >= pages"
        @click="$emit('change-page', page + 1)"
      >
        下一页
      </button>
    </div>
  </section>
</template>
