<template>
  <div
    ref="inputs"
    :class="[
      'inputs',
      'ht-duration',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
  >
    <ht-input
      v-model="data.day"
      type="number"
      :min="0"
      :size="size"
      style="width:90px"
      :validate="validate"
      :disabled="disabled"
      @change="change"
    ></ht-input>
    {{ $t('ht.common.day') }}
    <ht-select
      v-model="data.hour"
      :size="size"
      style="width:65px"
      :validate="validate"
      :options="hours"
      :disabled="disabled"
      @change="change"
    ></ht-select>
    {{ $t('ht.common.hour') }}
    <ht-select
      v-model="data.minute"
      :size="size"
      style="width:65px"
      :validate="validate"
      :options="minutes"
      :disabled="disabled"
      @change="change"
    ></ht-select>
    {{ $t('ht.common.minute') }}
    <ht-select
      v-if="type == 'second'"
      v-model="data.second"
      :size="size"
      style="width:65px"
      :validate="validate"
      :options="minutes"
      :disabled="disabled"
      @change="change"
    ></ht-select>
    {{ type == 'second' ? $t('ht.common.second') : '' }}
  </div>
</template>

<script>
  import form from '@/mixins/form.js'

  export default {
    name: 'HtDuration',
    mixins: [form],
    props: {
      value: {
        type: [String, Number],
      },
      name: {
        type: String,
      },
      size: {
        type: String,
        default: 'small',
      },
      validate: {
        type: [String, Object],
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        default: 'minute',
        validator: function(value) {
          return ['minute', 'second'].indexOf(value) !== -1
        },
      },
    },
    data() {
      return {
        hours: [],
        minutes: [],
        data: {
          day: 0,
          hour: 0,
          minute: 0,
          second: 0,
        },
      }
    },
    watch: {
      value: function(newVal, oldVal) {
        if (newVal && newVal != oldVal) {
          this.initData()
        }
        if (!newVal) {
          this.data = {
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
          }
        }
      },
    },
    mounted() {
      for (let i = 0; i <= 23; i++) {
        this.hours.push({ key: i, value: i + '' })
      }
      for (let i = 0; i <= 59; i++) {
        this.minutes.push({ key: i, value: i + '' })
      }
      this.initData()
    },
    methods: {
      initData() {
        if (this.value && this.type == 'second') {
          //天数计算
          this.data.day = parseInt(this.value / (24 * 3600))
          //小时计算
          this.data.hour = parseInt((this.value % (24 * 3600)) / 3600)
          //分钟计算
          this.data.minute = parseInt((this.value % 3600) / 60)
          //秒计算
          this.data.second = this.value % 60
        }
        if (this.value && this.type == 'minute') {
          //天数计算
          this.data.day = parseInt(this.value / 60 / 24)
          //小时计算
          this.data.hour = parseInt((this.value / 60) % 24)
          //分钟计算
          this.data.minute = parseInt(this.value % 60)
        }
      },
      change() {
        let second = 0
        if (this.data.second) {
          second += this.data.second
        }

        if (this.data.minute) {
          second += this.data.minute * 60
        }
        if (this.data.hour) {
          second += this.data.hour * 60 * 60
        }
        if (this.data.day) {
          second += this.data.day * 24 * 60 * 60
        }
        if (this.type == 'minute') {
          second = second / 60
        }
        this.$emit('input', second)
      },
    },
  }
</script>
<style lang="scss" scoped>
  .inputs.ht-form-inputs__inline {
    width: auto;
  }
  .ht-duration.inputs.ht-form-inputs__inline {
    ::v-deep {
      .el-input-number {
        width: 100%;
      }
    }
  }
</style>
