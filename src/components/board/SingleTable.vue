<template>
  <div class="table-container">
    <el-table :data="currentPageData" :show-header="false"  @cell-click="handleRowClick">
    
      <el-table-column prop="content" align="left" >
 
        <template #default="scope">
          <div class="cell-content">
            {{props.title +' ' + scope.row.date }}
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10]" 
        :total="tableData.length"
        layout="prev, pager, next"
        :hide-on-single-page="true"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElTable, ElTableColumn, ElPagination } from 'element-plus';


const props = defineProps({
  tabledata:Array,
  title:String,
  jumpImage: Function,
  imagesuiteIndex:Number
});


// 处理行点击事件，接收索引参数
const handleRowClick = (row, column, event, index) => {  

  props.jumpImage(props.imagesuiteIndex,row.index);
};

const tableData = ref([...props.tabledata]);

// 分页相关参数
const currentPage = ref(1);        // 当前页码
const pageSize = ref(10);          // 每页条数（固定为10）

// 计算当前页需要展示的数据
const currentPageData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return tableData.value.slice(startIndex, endIndex);
});

// 处理每页条数变化（虽然这里固定为10，但保留接口）
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
};
</script>

<style scoped>
.table-container {
  max-width: 800px;
  margin: 0px auto;
  padding: 0px;
  border-radius: 8px;

}

.single-column-table {
  width: 100%;
}

.cell-content {
  height: 45px;
  line-height: 45px;
  border-radius: 4px;
  padding-left:16px;
  background-color: #f5f5f5;
  font-size: 15px;
  color:#000;
  &:hover{
    background-color: #BEE3F833;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

:deep(.el-table .el-table__cell){
    padding:4px 0px;
}

:deep(.el-table__inner-wrapper:before){
    height: 0px;
}

:deep(.el-pager li.is-active){
    color:#012fa6
}
:deep(.el-pager li:hover){
    color:#012fa6
}

:deep(.el-table .cell){
    padding:0px
}

:deep(.el-table td.el-table__cell){
    border-bottom: none;
}

</style>
