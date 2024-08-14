<template>
  <div
    class="step-layout__container"
    :class="{ active: pageIndex === showIndex }"
  >
    <slot></slot>
  </div>
</template>
<script>
  export default {
    name: 'HtStepLayout',
    componentName: 'HtStepLayout',
    props: { pageIndex: { type: Number, require: true } },
    data() {
      return {
        showIndex: 0,
      }
    },
    created() {
      const this_ = this
      //监听分页组件分页数量改变事件.
      this.$on('pageAlter', (content) => {
        this_.showIndex = content
      })
    },
  }
</script>
<style lang="scss" scoped>
  .step-layout__container {
    display: none;
  }
  .step-layout__container.active {
    display: block;
  }
</style>
