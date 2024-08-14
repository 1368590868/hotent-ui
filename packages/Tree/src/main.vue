<template>
  <div :style="containerStyle">
    <div v-if="supportFilter" class="tree-header flex">
      <slot name="custom-prefix"></slot>
      <el-input
        v-model="filterText"
        :placeholder="t('ht.tree.filterText')"
        clearable
      >
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
      </el-input>
      <div
        :class="
          isIeExplorer
            ? 'tree-button-group is-ie-explorer flex'
            : 'tree-button-group flex'
        "
      >
        <slot name="custom-button"></slot>
        <ht-icon
          class="tree-icon"
          :name="isExpand ? 'simple-collapse' : 'simple-expand'"
          :title="isExpand ? $t('ht.tree.collapse') : $t('ht.tree.expand')"
          scale="1.2"
          @click="handleExpandCollapse"
        />
        <ht-icon
          class="tree-icon refresh"
          name="refresh"
          :pulse="loading"
          scale="1.1"
          :title="$t('ht.tree.refresh')"
          @click="refresh"
        />
      </div>
    </div>
    <el-empty
      v-if="isShowEmpty"
      :image="treeNoDataImg"
      :image-size="imageSize"
    ></el-empty>
    <el-tree
      v-else
      ref="elTree"
      class="el-tree__wrapper"
      :style="elTreeStyle"
      :data="data ? data : treeData"
      :props="props"
      :empty-text="emptyText"
      :default-expand-all="defaultExpandAll"
      :filter-node-method="filterNode"
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
      <slot
        v-if="$scopedSlots['default']"
        slot-scope="{ node, data: subData }"
        :node="node"
        :data="subData"
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
    </el-tree>
  </div>
</template>
<script>
  /* eslint-disable */
  import { setTimeout } from 'timers'
  import Locale from '@/mixins/locale'

  export default {
    name: 'HtTree',
    mixins: [Locale],
    props: {
      data: Array,
      treeData: Array,
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
      showMoreButton: {
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
      filterNodeMethod: Function,
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
        default: 8,
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
        default: true,
      },
      defaultCheckedKeys: {
        type: Array,
        default() {
          return []
        },
      },
      emptyText: String,
      height: {
        type: [String, Number],
        default: 0,
        validator: (val) => {
          if (typeof val == 'number') {
            return val > -1
          } else if (typeof val == 'string') {
            const numVal = Number(val)
            return !isNaN(numVal) && numVal > -1
          } else {
            return false
          }
        },
      },
      treeNoDataImg: {
        type: String,
        default: require('@/assets/table-no-data.png'),
      },
      imageSize: {
        type: Number,
        default: 122,
      },
    },
    data() {
      return {
        filterText: '',
        isExpand: this.defaultExpandAll,
        isIeExplorer: false,
        loading: false,
        defaultProps: {
          children: 'children',
          label: 'label',
        },
      }
    },
    computed: {
      heightNum() {
        return typeof this.height == 'number'
          ? this.height
          : Number(this.height)
      },
      containerStyle() {
        return this.heightNum > 0 ? { height: `${this.heightNum}px` } : {}
      },
      elTreeStyle() {
        let style = { background: this.supportFilter ? '#fafafa' : '' }
        if (this.heightNum > 0) {
          Object.assign(style, {
            height: this.supportFilter ? `calc(100% - 40px)` : '100%',
            overflow: 'auto',
          })
        }
        return style
      },
      isShowEmpty() {
        return (
          this.data &&
          this.data.length < 1 &&
          this.treeData &&
          this.treeData.length < 1
        )
      },
    },
    watch: {
      filterText(val) {
        if (this.lazy) {
          this.$emit('loadALL', val)
        } else {
          this.$refs.elTree.filter(val)
        }
      },
      defaultCheckedKeys(val) {
        this.$refs.elTree.setCheckedKeys(val)
      },
    },
    mounted() {
      if (!!window.ActiveXObject || 'ActiveXObject' in window) {
        this.isIeExplorer = true
      }
    },
    methods: {
      setCurrentKey(key) {
        this.$refs.elTree.setCurrentKey(key)
      },
      filterNode(value, data, node) {
        if (
          this.filterNodeMethod &&
          this.filterNodeMethod.constructor == Function
        ) {
          return this.filterNodeMethod(value, data, node)
        }
        if (!value) return true
        return data[this.props.label].indexOf(value) !== -1
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
      // 树状菜单的全部展开和收起
      handleExpandCollapse() {
        this.isExpand = !this.isExpand
        let elTree = this.$refs.elTree
        this.setNodesExpand(elTree.root.childNodes)
      },
      //设置节点展开收起
      setNodesExpand(nodes) {
        if (nodes && nodes.length > 0) {
          nodes.map((item) => {
            item.expanded = this.isExpand
            if (item.childNodes && item.childNodes.length > 0) {
              this.setNodesExpand(item.childNodes)
            }
          })
        }
      },
      refresh() {
        this.loading = true
        this.$emit('refresh', () => {
          this.loading = false
          this.isExpand = this.defaultExpandAll
        })
        setTimeout(() => {
          this.loading = false
          this.isExpand = this.defaultExpandAll
        }, 5000)
      },
    },
  }
</script>
<style lang="scss" scoped>
  div[aria-invalid='true'] ::v-deep .el-input__inner,
  div[aria-invalid='true'] ::v-deep .el-input__inner:focus {
    border-color: #f56c6c;
  }
  .is-ie-explorer {
    margin-right: 25px;
  }

  div.tree-button-group i {
    cursor: pointer;
    display: inline;
    font-size: 18px;
    font-weight: bold;
    margin-right: 10px;
  }

  div.tree-button-group i:hover {
    color: lightcoral;
  }

  div.tree-header {
    min-height: 30px;
  }

  .tree-button-group {
    margin-left: 10px;
  }

  div.tree-header ::v-deep .el-input__inner {
    border-width: 0;
    padding-right: 0;
  }

  ::v-deep {
    .custom-tree-node {
      width: calc(100% - 40px);
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;
    }

    .custom-tree-node .more-icon {
      visibility: hidden;
      font-weight: bold;
    }

    .custom-tree-node:hover .more-icon {
      visibility: visible;
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
  }
  .tree-icon {
    margin-right: 8px;
    cursor: pointer;
  }

  .el-tree__wrapper {
    @include base-scrollbar;
  }
</style>
