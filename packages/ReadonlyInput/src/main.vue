<template>
  <div
    v-if="permission != 'n'"
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
  >
    <el-input
      v-show="roInputDisplayMode == 'input'"
      v-model="inputVal"
      :type="type"
      :size="inputSize"
      :name="inputName"
      :autosize="{ minRows: 1, maxRows: 4 }"
      :style="styles"
      readonly
    ></el-input>
    <el-input
      v-show="roInputDisplayMode == 'text'"
      v-model="inputVal"
      :type="type"
      :size="inputSize"
      :name="inputName"
      :autosize="{ minRows: 1, maxRows: 4 }"
      :style="styles"
      readonly
      v-html="inputVal"
    ></el-input>
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import script from '@/mixins/script.js'
  import permission from '@/mixins/permission.js'

  export default {
    name: 'HtReadonlyInput',
    mixins: [inputName, permission, form, script],
    props: {
      value: [String, Number],
      type: {
        type: String,
        default: 'text',
        validator(val) {
          return ['text', 'textarea'].includes(val)
        },
      },
      styles: {
        type: Object,
      },
    },
    data() {
      return {
        roInputDisplayMode: 'input',
      }
    },
    computed: {
      inputVal: {
        get() {
          if (utils.isEmpty(this.value)) {
            return ''
          }
          return this.value
        },
        set(val) {
          this.$emit('input', val)
        },
      },
    },
    created() {
      this.roInputDisplayMode = 'input'
      this.$on('formExtend:update', (formExtend) => {
        this.roInputDisplayMode = formExtend.roInputDisplayMode || 'input'
      })
    },
    mounted() {
      if (this.value != null && this.value != undefined) {
        this.inputVal = this.value
      }
      const result = this.evilJS()

      if (result != null && result != undefined) {
        this.inputVal = result
      }
    },
  }
</script>
