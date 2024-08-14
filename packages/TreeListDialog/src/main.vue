<template>
  <div class="inputs">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      class="dialog-selector__wrapper"
      top="6vh"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :append-to-body="appendToBody"
      :destroy-on-close="destroyOnClose"
    >
      <el-container class="container">
        <el-aside width="210px" class="left-aside">
          <el-card class="box-card org-find-card" shadow="never">
            <ht-tree
              ref="tree"
              :lazy="lazy"
              :load="loadOrgTree"
              :data="treeData"
              :default-expand-all="false"
              :highlight-current="true"
              :props="props"
              :node-key="nodeKey"
              :default-expanded-keys="defaultExpandedKeys"
              accordion
              @node-click="handleNodeClick"
            ></ht-tree>
          </el-card>
        </el-aside>
        <el-container>
          <el-main>
            <ht-selector
              ref="selector"
              v-model="selectors"
              :data="data"
              :pagination="pagination"
              :table-columns="tableColumns"
              :select-label="selectLabel"
              :quick-search-props="quickSearchProps"
              :single="single"
              :search-placeholder="searchPlaceholder"
              @load="load"
              @reset="reset"
            />
          </el-main>
        </el-container>
      </el-container>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="handleDialogSure">
          {{ $t('ht.common.confirm') }}
        </el-button>
        <el-button size="small" @click="handleDialogCancel">
          {{ $t('ht.common.cancle') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import HtSelector from '../../Selector/index'
  import { setTimeout } from 'timers'
  import { t } from '@/locale'

  export default {
    name: 'HtTreeListDialog',
    components: {
      HtSelector,
    },
    props: {
      dialogTitle: {
        type: String,
        default() {
          return t('ht.selector.dialog')
        },
      },
      props: {
        type: Object,
        default() {
          return { children: 'children', label: 'name', isLeaf: 'leaf' }
        },
      },
      treeData: {
        type: Array,
        default: () => {
          return []
        },
      },
      loadOrgTree: {
        type: Function,
      },
      value: String,
      single: {
        type: Boolean,
        default: false,
      },
      lazy: {
        type: Boolean,
        default: false,
      },
      data: {
        type: Array,
        default: () => {
          return []
        },
      },
      tableColumns: {
        type: Array,
        default: () => {
          return []
        },
      },
      pagination: {
        type: Object,
        default: () => {
          return {
            page: 1,
            pageSize: 50,
            total: 0,
          }
        },
      },
      selectLabel: {
        type: String,
        default: 'name',
      },
      appendToBody: {
        type: Boolean,
        default: false,
      },
      defaultDemension: {
        type: [String, Number],
        default: '',
      },
      quickSearchProps: {
        type: [String, Array],
        required: true,
      },
      nodeKey: {
        type: String,
        default: 'id',
      },
      defaultExpandedKeys: {
        type: Array,
        default() {
          return []
        },
      },
      searchPlaceholder: {
        type: String,
        default: '',
      },
      destroyOnClose: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        inputName: null,
        selectors: [],
        dialogVisible: false,
      }
    },
    methods: {
      // 同步value到当前所选数据中
      showDialog(selectors) {
        this.dialogVisible = true
        if (!selectors) {
          selectors = []
        }
        setTimeout(() => {
          this.$refs.selector.onShow(selectors)
        })
      },
      handleClose(done) {
        this.$refs.selector.onHide()
        done && done()
      },
      handleDialogSure() {
        this.dialogVisible = false
        this.$refs.selector.onHide(true)
        this.$emit('onConfirm', this.selectors)
      },
      handleDialogCancel() {
        this.dialogVisible = false
        this.$refs.selector.onHide()
      },
      handleRemove(item) {
        this.selectors.remove(item)
      },
      load(param, cb) {
        this.$emit('load', param, cb)
      },
      handleNodeClick(data) {
        this.$emit('loadListData', data)
      },
      reset() {
        this.$emit('reset')
      },
    },
  }
</script>
<style lang="scss" scoped>
  @import '~@/styles/selector.scss';
  .inputs {
    display: block;
  }

  .el-select__tags {
    background: #fff;
    margin-left: 1px;
  }

  .el-select__tags_readonly {
    position: relative;
    top: 50%;
  }

  .el-input__inner[aria-invalid='true'] {
    border-color: #f56c6c;
  }
</style>
