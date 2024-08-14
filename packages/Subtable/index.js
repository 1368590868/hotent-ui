import SubDialog from './src/SubDialog.vue'
import SubtableBackfill from './src/SubtableBackfill.vue'
import SubPagination from './src/SubPagination.vue'
import SubExportDialog from './src/SubExportDialog.vue'
import SubImportDialog from './src/SubImportDialog.vue'

SubDialog.install = function(Vue) {
  Vue.component(SubDialog.name, SubDialog)
}

SubtableBackfill.install = function(Vue) {
  Vue.component(SubtableBackfill.name, SubtableBackfill)
}

SubPagination.install = function(Vue) {
  Vue.component(SubPagination.name, SubPagination)
}

SubExportDialog.install = function(Vue) {
  Vue.component(SubExportDialog.name, SubExportDialog)
}

SubImportDialog.install = function(Vue) {
  Vue.component(SubImportDialog.name, SubImportDialog)
}

export {
  SubDialog,
  SubtableBackfill,
  SubPagination,
  SubExportDialog,
  SubImportDialog,
}
