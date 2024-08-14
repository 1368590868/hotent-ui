<template>
  <el-steps
    v-if="permission != 'n'"
    :active="inputVal"
    :direction="direction"
    align-center
    finish-status="success"
  >
    <el-step
      v-for="item in stepList"
      :key="item.title"
      :title="item.title"
      :description="item.description"
    ></el-step>
  </el-steps>
</template>
<script>
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'

  export default {
    name: 'HtMilepost',
    mixins: [permission, inputName, form],
    props: {
      value: [Number, String],
      direction: {
        type: String,
      },
      content: String,
    },
    computed: {
      inputVal: function() {
        if (this.value === null || this.value === undefined) {
          return 1
        }
        const valNum = Number(this.value)
        return isNaN(valNum) ? 1 : valNum
      },
      stepList() {
        return JSON.parse(this.content)
      },
    },
  }
</script>
