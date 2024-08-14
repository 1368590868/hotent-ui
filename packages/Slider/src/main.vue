<template>
  <div
    v-if="permission != 'n'"
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
      isMobile ? 'mobile-slider__wrap' : '',
    ]"
  >
    <template v-if="isMobile">
      <span v-if="isPreview" class="tip">
        {{ $t('ht.slider.tip') }}
      </span>
      <van-slider
        v-else
        v-model="inputVal"
        :max="max"
        :min="min"
        :step="step"
        :inactive-color="inactiveColor"
        :active-color="activeColor"
        :disabled="!inputWriteable"
      >
        <template #button>
          <div class="custom-button">{{ inputVal }}</div>
        </template>
      </van-slider>
    </template>

    <el-slider
      v-else
      v-model="inputVal"
      :max="max"
      :min="min"
      :step="step"
      :show-input="showInput"
      :disabled="!inputWriteable"
    ></el-slider>

    <!-- 校验 -->
    <input
      v-model="value"
      v-validate="inputValidate"
      type="hidden"
      :name="inputName"
    />
  </div>
</template>
<script>
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import mobileMode from '@/mixins/mobileMode.js'

  export default {
    name: 'HtSlider',
    mixins: [permission, inputName, form, mobileMode],
    props: {
      value: [Number, String],
      max: {
        type: Number,
        default: 100,
      },
      min: {
        type: [String, Number],
        default: 0,
      },
      defaultValue: {
        type: Number,
        default: 50,
      },
      step: {
        type: Number,
        default: 1,
      },
      showInput: {
        type: Boolean,
        default: false,
      },
      activeColor: {
        type: String,
        default: '#409EFF',
      },
      inactiveColor: {
        type: String,
        default: '#e5e5e5',
      },
      isPreview: {
        type: Boolean,
        default: false,
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
              throw this.$t('ht.slider.errorMsg')
            }
            return valueNum
          }
          return this.value
        },
        set(val) {
          this.$emit('input', val)
        },
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
  .mobile-slider__wrap {
    .tip {
      font-size: 12px;
    }
  }
  .custom-button {
    width: 26px;
    color: #fff;
    font-size: 10px;
    line-height: 18px;
    text-align: center;
    background-color: #409eff;
    border-radius: 100px;
  }
</style>
