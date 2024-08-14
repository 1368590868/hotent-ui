<template>
  <div v-if="permission != 'n'" class="fullWidth">
    <ht-template-preview
      :template-key="templateKey"
      single="true"
      :is-data-view="true"
      :data-view="dataView"
    ></ht-template-preview>
  </div>
</template>
<script>
  import permission from '@/mixins/permission.js'
  export default {
    name: 'HtDataView',
    mixins: [permission],
    props: {
      templateKey: {
        type: String,
        required: true,
      },
      options: {
        type: String,
        required: false,
      },
      isDataView: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        dataView: {},
      }
    },
    mounted() {
      //数据视图
      if (this.options) {
        this.dataView = JSON.parse(this.options)
      }
    },
    created() {},
    methods: {},
  }
</script>

<style scoped>
  .fullWidth {
    width: 100%;
  }
</style>
