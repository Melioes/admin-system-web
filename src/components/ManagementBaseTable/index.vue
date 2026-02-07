<template>
  <div class="base-table">
    <el-table :data="tableData" v-loading="loading" border stripe v-bind="$attrs">
      <template v-for="col in columns" :key="col.prop">
        <el-table-column v-if="col.slot" v-bind="col">
          <template #default="scope">
            <slot :name="col.slot" :row="scope.row"></slot>
          </template>
        </el-table-column>

        <el-table-column v-else v-bind="col" />
      </template>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  columns: Array,      // 列配置
  api: Function,       // 获取数据的 API 函数
  params: Object       // 查询参数（可选）
})

const tableData = ref([])
const loading = ref(false)

// 自动加载数据的方法
const loadData = async () => {
  if (!props.api) return
  loading.value = true
  try {
    const res = await props.api(props.params)
    tableData.value = res.data || []
  } finally {
    loading.value = false
  }
}

// 暴露给父组件，方便父组件在“添加成功”后刷新表格
defineExpose({ refresh: loadData })

onMounted(loadData)
</script>