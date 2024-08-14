<template>
  <el-collapse-item :title="title" :name="name" :disabled="disabled">
    <slot slot="title" name="title"></slot>
    <slot></slot>
  </el-collapse-item>
</template>
<script>
  export default {
    name: 'HtCollapseItem',
    props: {
      title: String,
      name: {
        type: [String, Number],
        default() {
          return this._uid
        },
      },
      disabled: Boolean,
    },
  }
</script>
