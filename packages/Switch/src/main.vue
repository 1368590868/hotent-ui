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
    <el-switch
      v-if="isShowSwitch"
      v-model="inputVal"
      v-validate="inputValidate"
      :name="inputName"
      :width="width"
      :active-color="activeColor"
      :inactive-color="inactiveColor"
      :active-value="activeValue"
      :inactive-value="inactiveValue"
      :active-text="activeText"
      :inactive-text="inactiveText"
      :disabled="isDisabled"
      @change="(val) => $emit('change', val)"
    ></el-switch>
    <ht-field-tail
      v-if="isShowText"
      :field-name="inputName"
      :readonly="!inputWriteable"
      input-value
      :tag-format-value="tagValue"
    ></ht-field-tail>
  </div>
</template>
<script>
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'

  export default {
    name: 'HtSwitch',
    mixins: [permission, inputName, form],
    props: {
      value: [String, Number, Boolean],
      disabled: Boolean,
      width: Number,
      activeValue: {
        type: [String, Number, Boolean],
        default: true,
      },
      inactiveValue: {
        type: [String, Number, Boolean],
        default: false,
      },
      activeText: String,
      inactiveText: String,
      activeColor: String,
      inactiveColor: String,
    },
    computed: {
      inputVal: {
        get() {
          return this.value
        },
        set(val) {
          if (val || [0, false].includes(val)) {
            this.$emit('input', val)
          }
        },
      },
      tagValue() {
        const tagVal =
          this.value == this.activeValue
            ? this.activeText
              ? this.activeText
              : this.value
            : this.inactiveText
            ? this.inactiveText
            : this.value

        return [tagVal]
      },
      isShowText() {
        return this.permission !== 'n' && this.currentShowMode !== 'input'
      },
      isShowSwitch() {
        return this.inputWriteable || this.currentShowMode === 'input'
      },
    },
  }
</script>
