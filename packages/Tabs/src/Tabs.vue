<template>
  <div>
    <el-tabs
      ref="tabs"
      v-model="val"
      :tab-position="tabPosition"
      :before-leave="beforeLeaveTab"
      :type="type"
      :active-name="activeName"
      :closable="closable"
      :addable="addable"
      :editable="editable"
      :stretch="stretch"
      @tab-click="tabClickHandle"
      @tab-remove="tabRemoveHandle"
      @tab-add="tabAddHandle"
      @edit="tabEditHandle"
    >
      <slot></slot>
    </el-tabs>
  </div>
</template>

<script>
  import regionValidator from '@/mixins/regionValidator.js'

  export default {
    name: 'HtTabs',
    mixins: [regionValidator],
    props: {
      tabsValue: String,
      type: String,
      activeName: String,
      beforeLeave: Function,
      closable: {
        type: Boolean,
        default: false,
      },
      addable: {
        type: Boolean,
        default: false,
      },
      editable: {
        type: Boolean,
        default: false,
      },
      tabPosition: {
        type: String,
        default: 'top',
      },
      stretch: {
        type: Boolean,
        default: false,
      },
      isVerify: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        val: this.tabsValue,
      }
    },
    mounted() {
      let me_ = this
      this.$refs.tabs.$watch('panes', function() {
        me_.val = me_.getShowPanes(me_.val)
      })
    },
    methods: {
      beforeLeaveTab(activeName, oldActiveName) {
        // 切换tab时是否校验
        if (this.isVerify) {
          return new Promise((resolve, reject) => {
            // 应用侧绑定了前置处理方法
            if (this.beforeLeave) {
              const result = this.beforeLeave(activeName, oldActiveName)
              // 应用侧的前置处理方法返回了拒绝切换的结果时 直接 驳回切换操作
              if (result && result.constructor == Promise) {
                result.catch(() => reject())
              } else if (
                result != null &&
                result != undefined &&
                result === false
              ) {
                reject()
              }
            }
            // 执行校验逻辑
            this.validateRegion('.el-tab-pane:not([aria-hidden])').then(
              (errorItems) => {
                if (errorItems.length > 0) {
                  reject()
                } else {
                  resolve()
                }
              }
            )
          })
        } else {
          // 不校验时直接 应用侧的结果 或 直接返回true
          return this.beforeLeave
            ? this.beforeLeave(activeName, oldActiveName)
            : true
        }
      },
      getShowPanes(key) {
        let panes = this.$refs.tabs.panes
        let name = ''
        let flag = false
        for (let i = 0; i < panes.length; i++) {
          if (panes[i].name == key) {
            flag = true
          }
          if (panes[i].$attrs.isShow && !name) {
            name = panes[i].name
          }
        }
        if (flag) {
          return key
        } else {
          return name
        }
      },
      tabClickHandle(tab) {
        this.$emit('tab-click', tab)
      },
      tabRemoveHandle(tabName) {
        this.$emit('tab-remove', tabName)
      },
      tabAddHandle() {
        this.$emit('tab-add')
      },
      tabEditHandle(targetName, action) {
        this.$emit('edit', targetName, action)
      },
    },
  }
</script>
