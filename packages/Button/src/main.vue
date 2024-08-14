<!--
 * @Author: liangjy liangjy@jee-soft.cn
 * @Date: 2023-06-20 09:37:03
 * @LastEditors: liangjy liangjy@jee-soft.cn
 * @LastEditTime: 2023-09-26 16:48:03
 * @FilePath: \hotent-ui\packages\Button\src\main.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div
    v-if="permission !== 'n'"
    v-express
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
  >
    <ht-input
      v-if="isShowInput"
      v-model="inputVal"
      :size="inputSize"
      :placeholder="placeholder"
      type="text"
      :permission="permission_sub"
    >
      <template v-if="inputWriteable" slot="append">
        <el-button
          btn="btn"
          :size="inputSize"
          type="primary"
          :icon="icon"
          @click="customEvilJS"
        >
          {{ btnName }}
        </el-button>
      </template>
    </ht-input>
    <el-button
      v-else
      :disabled="!inputWriteable"
      btn="btn"
      :size="inputSize"
      type="primary"
      :icon="icon"
      @click="customEvilJS"
    >
      {{ btnName }}
    </el-button>
  </div>
</template>
<script>
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import script from '@/mixins/script.js'

  export default {
    name: 'HtButton',
    mixins: [permission, inputName, form, script],
    props: {
      value: [String, Number],
      icon: String,
      btnName: String,
      isShowInput: Boolean,
    },
    computed: {
      inputVal: {
        get() {
          return this.value
        },
        set(val) {
          this.$emit('input', val)
        },
      },
    },
    methods: {
      customEvilJS() {
        const result = this.evilJS()

        if (result != null && result != undefined) {
          this.inputVal = result
        }
      },
    },
  }
</script>
<style lang="scss" scoped>
  div[aria-invalid='true'] ::v-deep .el-input__inner,
  div[aria-invalid='true'] ::v-deep .el-input__inner:focus {
    border-color: #f56c6c;
  }
  .button-row {
    margin: 5px 10px;
    float: right;
  }
  ::v-deep .el-input-group__append {
    padding: 0;
    .el-button {
      margin-right: 0 !important;
    }
  }
</style>
