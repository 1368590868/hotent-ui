import TableColumn from './src/main.vue'

TableColumn.install = function(Vue) {
  Vue.component(TableColumn.name, TableColumn)
}

export default TableColumn
