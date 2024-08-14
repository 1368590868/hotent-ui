<template>
  <el-dialog
    :title="dialogTitle"
    :append-to-body="appendToBody"
    :close-on-click-modal="false"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :destroy-on-close="destroyOnClose"
  >
    <el-scrollbar style="height:100%">
      <ht-tree
        ref="htTree"
        :tree-data="data"
        :props="props"
        :empty-text="emptyText"
        :filter-node-method="filterNodeMethod"
        :support-filter="supportFilter"
        :show-more-button="showMoreButton"
        :default-expand-all="defaultExpandAll"
        :load="load"
        :lazy="lazy"
        :show-checkbox="showCheckbox"
        :accordion="accordion"
        :node-key="nodeKey"
        :default-expanded-keys="defaultExpandedKeys"
        :highlight-current="highlightCurrent"
        :render-after-expand="renderAfterExpand"
        :render-content="renderContent"
        :check-on-click-node="checkOnClickNode"
        :auto-expand-parent="autoExpandParent"
        :check-strictly="checkStrictly"
        :current-node-key="currentNodeKey"
        :indent="indent"
        :icon-class="iconClass"
        :draggable="draggable"
        :allow-drag="allowDrag"
        :allow-drop="allowDrop"
        :expand-on-click-node="expandOnClickNode"
        :default-checked-keys="defaultCheckedKeys"
        @node-click="handleNodeClick"
        @node-contextmenu="nodeContextmenu"
        @check-change="checkChange"
        @check="check"
        @current-change="currentChange"
        @node-expand="nodeExpand"
        @node-collapse="nodeCollapse"
        @node-drag-start="nodeDragStart"
        @node-drag-enter="nodeDragEnter"
        @node-drag-leave="nodeDragLeave"
        @node-drag-over="nodeDragOver"
        @node-drag-end="nodeDragEnd"
        @node-drop="nodeDrop"
      >
        <!-- 作用域插槽：插槽prop -->
        <slot
          v-if="$scopedSlots['default']"
          slot-scope="{ node, data }"
          :node="node"
          :data="data"
        ></slot>
        <template v-else slot-scope="{ node }">
          <span
            class="el-tree-node__label show-ellipsis"
            :class="{ 'full-width': !showMoreButton }"
            :title="node.label"
          >
            {{ node.label }}
          </span>
        </template>
      </ht-tree>
    </el-scrollbar>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onConfirm">
        {{ $t('ht.common.confirm') }}
      </el-button>
      <el-button @click="handleClose">{{ $t('ht.common.cancle') }}</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import HtTree from '../../Tree/index'
  import { t } from '@/locale'

  export default {
    name: 'HtTreeDialog',
    components: {
      HtTree,
    },
    props: {
      dialogTitle: {
        type: String,
        default() {
          return t('ht.common.select')
        },
      },
      appendToBody: {
        type: Boolean,
        default: false,
      },
      showMoreButton: {
        type: Boolean,
        default: false,
      },
      emptyText: String,
      filterNodeMethod: Function,
      data: Array,
      load: {
        type: Function,
      },
      lazy: {
        type: Boolean,
        default: false,
      },
      accordion: {
        type: Boolean,
        default: false,
      },
      showCheckbox: {
        type: Boolean,
        default: false,
      },
      defaultExpandAll: {
        type: Boolean,
        default: false,
      },
      props: {
        type: Object,
        default: function() {
          return {
            children: 'children',
            label: 'label',
          }
        },
      },
      supportFilter: {
        type: Boolean,
        default: false,
      },
      iconClass: {
        type: String,
      },
      nodeKey: {
        type: String,
      },
      defaultExpandedKeys: {
        type: Array,
      },
      highlightCurrent: {
        type: Boolean,
        default: false,
      },
      renderAfterExpand: {
        type: Boolean,
        default: true,
      },
      renderContent: {
        type: Function,
      },
      checkOnClickNode: {
        type: Boolean,
        default: false,
      },
      autoExpandParent: {
        type: Boolean,
        default: true,
      },
      checkStrictly: {
        type: Boolean,
        default: false,
      },
      currentNodeKey: {
        type: [String, Number],
      },
      indent: {
        type: Number,
        default: 16,
      },
      draggable: {
        type: Boolean,
        default: false,
      },
      allowDrag: {
        type: Function,
      },
      allowDrop: {
        type: Function,
      },
      expandOnClickNode: {
        type: Boolean,
        default: false,
      },
      defaultCheckedKeys: {
        type: Array,
        default() {
          return []
        },
      },
      // showCheck 为true时 是否只返回叶子节点
      leafOnly: {
        type: Boolean,
        default: false,
      },
      // showCheck 为true时 是否只返回包含半选中的叶子节点
      includeHalfChecked: {
        type: Boolean,
        default: false,
      },
      destroyOnClose: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        dialogVisible: false,
        selectedNode: null,
      }
    },
    methods: {
      showDialog() {
        this.dialogVisible = true
      },
      handleClose() {
        this.dialogVisible = false
      },
      onConfirm() {
        let resultNodes = null
        if (this.$refs.htTree.showCheckbox) {
          resultNodes = this.$refs.htTree.$refs.elTree.getCheckedNodes(
            this.leafOnly,
            this.includeHalfChecked
          )
          if (!resultNodes || resultNodes.length <= 0) {
            this.$message.error(this.$t('ht.common.select'))
            return
          }
        } else {
          resultNodes = this.$refs.htTree.$refs.elTree.getCurrentNode()
        }
        if (!resultNodes) {
          this.$message.error(this.$t('ht.common.select'))
          return
        }
        this.dialogVisible = false
        this.$emit('onConfirm', resultNodes)
      },
      handleNodeClick(data, node, nodeComponent) {
        this.$emit('node-click', data, node, nodeComponent)
      },
      nodeContextmenu(event, data, node, nodeComponent) {
        this.$emit('node-contextmenu', event, data, node, nodeComponent)
      },
      checkChange(data, isChecked, hasChildChecked) {
        this.$emit('check-change', data, isChecked, hasChildChecked)
      },
      check(data, checkedObj) {
        this.$emit('check', data, checkedObj)
      },
      currentChange(data, node) {
        this.$emit('current-change', data, node)
      },
      nodeExpand(data, node, nodeComponent) {
        this.$emit('node-expand', data, node, nodeComponent)
      },
      nodeCollapse(data, node, nodeComponent) {
        this.$emit('node-collapse', data, node, nodeComponent)
      },
      nodeDragStart(node, event) {
        this.$emit('node-drag-start', node, event)
      },
      nodeDragEnter(dragNode, enterNode, event) {
        this.$emit('node-drag-enter', dragNode, enterNode, event)
      },
      nodeDragLeave(dragNode, enterNode, event) {
        this.$emit('node-drag-leave', dragNode, enterNode, event)
      },
      nodeDragOver(dragNode, enterNode, event) {
        this.$emit('node-drag-over', dragNode, enterNode, event)
      },
      nodeDragEnd(dragNode, endNode, position, event) {
        this.$emit('node-drag-end', dragNode, endNode, position, event)
      },
      nodeDrop(dragNode, endNode, position, event) {
        this.$emit('node-drop', dragNode, endNode, position, event)
      },
    },
  }
</script>

<style lang="scss" scoped>
  ::v-deep {
    .el-dialog {
      width: 300px;
      height: 500px;
    }
    .el-dialog__header {
      border-bottom: 1px solid darkgrey;
    }
    .el-dialog__body {
      padding: 0px;
      height: 380px;
    }
    .el-dialog__footer {
      position: absolute;
      text-align: center;
      bottom: 0px;
      left: 0px;
      right: 0px;
    }
    span.full-width {
      width: 100%;
    }
    .show-ellipsis {
      display: block;
      width: calc(100% - 25px);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .el-tree {
      width: 300px;
    }
    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }
</style>
