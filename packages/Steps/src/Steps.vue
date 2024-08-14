<template>
  <div class="steps__container">
    <el-steps
      :class="{ 'el-steps__hidden': hiddenBar }"
      :active="active"
      finish-status="success"
      align-center
    >
      <el-step
        v-for="(col, colIndex) in columns"
        :key="colIndex"
        :title="col.name"
      ></el-step>
    </el-steps>
    <slot></slot>
  </div>
</template>
<script>
  import Emitter from '@/mixins/emitter'
  import regionValidator from '@/mixins/regionValidator.js'

  export default {
    name: 'HtSteps',
    componentName: 'HtSteps',
    mixins: [Emitter, regionValidator],
    props: {
      columns: Array,
      hiddenBar: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        active: 0,
      }
    },
    computed: {
      hasColumns: function() {
        return this.columns.length > 0
      },
    },
    created() {
      const this_ = this
      //监听分页组件分页数量改变事件.
      this.$on('pageAlter', (content) => {
        this_.active = content
        this.broadcast('HtStepLayout', 'pageAlter', content)
      })
      // 在分页发生跳转前的事件
      this.$on('beforeJump', (step) => {
        // 做局部表单校验
        this.validateRegion('.step-layout__container.active').then((errors) => {
          // 校验结果发送给Step组件
          this.broadcast('HtStep', 'validateRegion', [errors.length == 0, step])
        })
      })
    },
  }
</script>
<style lang="scss" scoped>
  .el-steps__hidden {
    display: none !important;
  }
</style>
