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
    <!-- 校验 -->
    <input
      v-model="value"
      v-validate="inputValidate"
      type="hidden"
      :name="inputName"
    />
    <el-rate
      v-model="inputVal"
      :max="max"
      :allow-half="allowHalf"
      :show-score="showScore || !inputWriteable"
      :text-color="textColor"
      :disabled="!inputWriteable"
      :icon-classes="iconClasses"
      :void-icon-class="iconClass"
      :disabled-void-icon-class="iconClass"
      :colors="activeColors"
    ></el-rate>
    <span v-if="showScore" class="core">{{ $t('ht.common.minute') }}</span>
    <ht-field-tail
      :writeable.sync="inputWriteable"
      :field-name="inputName"
      :input-value="value"
      class="ht-rate-field-tail"
    />
  </div>
</template>
<script>
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'

  export default {
    name: 'HtRate',
    mixins: [permission, inputName, form],
    props: {
      value: [Number, String],
      allowHalf: {
        type: Boolean,
        default: false,
      },
      max: {
        type: Number,
        default: 5,
      },
      defaultValue: {
        type: Number,
        default: 5,
      },
      showScore: {
        type: Boolean,
        default: false,
      },
      textColor: {
        type: String,
        default: '#1F2D3D',
      },
      iconClass: {
        type: String,
        default: 'el-icon-star-off',
      },
      activeColor: {
        type: String,
        default: '#F7BA2A',
      },
    },
    computed: {
      inputVal: {
        get() {
          if (
            this.value !== null &&
            this.value !== undefined &&
            this.value.constructor == String
          ) {
            if (this.value.trim() == '') {
              return 0
            }
            const valueNum = Number(this.value)
            if (isNaN(valueNum)) {
              throw this.$t('ht.rate.tip')
            }
            return valueNum
          }
          return this.value
        },
        set(val) {
          this.$emit('input', val === 0 ? '' : val)
        },
      },
      iconClasses() {
        console.log(this.iconClass, 'iconClass')
        let defaultClass =
          this.iconClass === 'el-icon-star-off'
            ? 'el-icon-star-on'
            : this.iconClass
        return [defaultClass, defaultClass, defaultClass]
      },
      activeColors() {
        return [this.activeColor, this.activeColor, this.activeColor]
      },
    },
    mounted() {
      if (!this.value) {
        this.inputVal = this.defaultValue
      }
    },
  }
</script>
<style lang="scss" scoped>
  .ht-rate-field-tail {
    position: absolute;
    top: 35px;
    width: 100%;
  }
  input[type='hidden'][aria-invalid='true'] + .el-rate {
    outline: 1px solid #f56c6c;
  }
  ::v-deep .el-rate {
    display: inline-block;
    .el-icon-star-on {
      color: #eead3e !important;
    }
  }
  .core {
    display: inline-block;
    font-size: 12px;
    margin-left: 2px;
    vertical-align: middle;
  }
</style>
