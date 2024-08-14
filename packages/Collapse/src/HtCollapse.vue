<template>
  <el-collapse
    ref="collapse"
    :accordion="accordion"
    :value="openDefaultArr"
    @change="handleChange"
  >
    <slot></slot>
  </el-collapse>
</template>
<script>
  import regionValidator from '@/mixins/regionValidator.js'

  export default {
    name: 'HtCollapse',
    mixins: [regionValidator],
    props: {
      accordion: {
        type: Boolean,
        default: false,
      },
      openDefault: {
        type: Array,
        default: () => {
          return []
        },
      },
      isVerify: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        openDefaultArr: this.openDefault,
        preActiveNames: [],
      }
    },
    watch: {
      openDefaultArr: {
        handler(val) {
          this.$root.$emit('collapse-active-names', val)
        },
        deep: true,
      },
    },
    created() {
      this.$root.$on('add-new-collapse-item', (result) => {
        if (result && !this.openDefaultArr.includes(result)) {
          this.openDefaultArr.push(result)
        }
      })
    },
    mounted() {
      this.preActiveNames = [].concat(this.openDefaultArr)
    },
    methods: {
      handleChange(activeNames) {
        // 收起来时才去判断是否校验
        if (activeNames.length < this.preActiveNames.length) {
          if (this.isVerify) {
            this.validateRegion('.el-collapse-item.is-active').then(
              (errorItems) => {
                if (errorItems.length > 0) {
                  // 还原将要折叠的面板
                  this.openDefaultArr = [].concat(this.preActiveNames)
                } else {
                  // 更新当前打开的面板名称数组
                  this.preActiveNames = [].concat(activeNames)
                  this.openDefaultArr = [].concat(activeNames)
                  this.$emit('change', activeNames)
                }
              }
            )
            return
          }
          this.openDefaultArr = [].concat(activeNames)
        }
        this.preActiveNames = [].concat(activeNames)
        this.openDefaultArr = [].concat(activeNames)
        this.$emit('change', activeNames)
      },
    },
  }
</script>
