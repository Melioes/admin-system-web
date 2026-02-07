<template>
  <div class="pagination-container">
    <el-pagination
      :current-page="pageNum"
      :page-size="pageSize"
      :page-sizes="[5, 10, 20, 50]"
      :layout="layout"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
// 💡 改动 2：props 接收依然保持不变
const props = defineProps({
  total: { required: true, type: Number },
  pageNum: { default: 1, type: Number },
  pageSize: { default: 10, type: Number },
  layout: { default: 'total, sizes, prev, pager, next, jumper', type: String }
})

const emit = defineEmits(['update:pageNum', 'update:pageSize', 'pagination'])

const handleSizeChange = (val) => {
  // 💡 改动 3：通过 emit 通知父组件修改 queryParams.pageSize
  emit('update:pageSize', val)
  emit('pagination') 
}

const handleCurrentChange = (val) => {
  // 💡 改动 4：通过 emit 通知父组件修改 queryParams.pageNum
  emit('update:pageNum', val)
  emit('pagination') 
}
</script>