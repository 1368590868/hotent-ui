<template>
  <component
    :is="panelIsFlexLayout ? 'div' : 'el-col'"
    :class="[
      'search-field__container',
      panelIsFlexLayout ? 'search-field__container-flex' : '',
    ]"
    :style="containerStyle"
    :span="colSpanVal"
  >
    <div
      v-if="!hideLabel"
      :style="{ width: finalLabelWidth + 'px' }"
      class="field-label-panel"
      :class="{ 'is-align-right': isAlignRight }"
    >
      <label v-if="label" v-ellipsis :title="label" class="search-field-label">
        {{ label }}
      </label>
    </div>
    <div
      :style="{ width: `calc(100% - ${inputDivJudgeWidth}px)` }"
      class="field-input-panel"
      :class="{ 'unset-width': isAlignRight }"
    >
      <template v-if="!hasDefaultSlot">
        <ht-input
          v-if="type == 'text'"
          v-model="data"
          :placeholder="placeholder"
          :display-style="finalDisplayStyle"
          :prefix-icon="prefixIcon"
          :suffix-icon="suffixIcon"
          @keydown.enter.native="textInputEnter"
        ></ht-input>
        <ht-date
          v-if="type == 'date'"
          v-model="data"
          :value-format="valueFormat"
          :placeholder="placeholder"
          :default-time="defaultTime"
          :display-style="finalDisplayStyle"
        />
        <el-date-picker
          v-if="['datetimerange', 'daterange'].includes(type)"
          v-model="data"
          size="small"
          :type="type"
          :default-time="['00:00:00', '23:59:59']"
          :value-format="valueFormat"
          align="right"
          :unlink-panels="unlinkPanels"
          :range-separator="$t('ht.date.to')"
          :start-placeholder="$t('ht.date.startDate')"
          :end-placeholder="$t('ht.date.endDate')"
          :picker-options="pickerOptions"
        ></el-date-picker>
        <ht-select
          v-if="type == 'select'"
          v-model="data"
          :placeholder="placeholder"
          :options="options"
          :props="props"
          :display-style="finalDisplayStyle"
        ></ht-select>
      </template>
      <slot v-else></slot>
    </div>
  </component>
</template>
<script>
  /* eslint-disable */
  import emitter from '@/mixins/emitter.js'
  import { t } from '@/locale'

  export default {
    name: 'HtTableSearchField',
    componentName: 'HtTableSearchField',
    mixins: [emitter],
    props: {
      value: [String, Number, Boolean, Object, Array],
      defaultTime: {
        type: String,
        default: '00:00:00',
      },
      unlinkPanels: {
        type: Boolean,
        default: true,
      },
      isAlignRight: {
        type: Boolean,
        default: false,
      },
      span: {
        type: Number,
        default: 0,
      },
      prop: {
        type: String,
        required: true,
      },
      props: {
        type: Object,
        default: null,
      },
      operation: {
        type: String,
        default: 'LIKE',
        validator: (value) =>
          [
            'EQUAL',
            'EQUAL_IGNORE_CASE',
            'LESS',
            'GREAT',
            'LESS_EQUAL',
            'GREAT_EQUAL',
            'NOT_EQUAL',
            'LIKE',
            'LEFT_LIKE',
            'RIGHT_LIKE',
            'IS_NULL',
            'NOTNULL',
            'IN',
            'BETWEEN',
          ].indexOf(value) != -1,
      },
      relation: {
        type: String,
        default: 'AND',
        validator: (value) => ['AND', 'OR'].indexOf(value) != -1,
      },
      label: String,
      type: {
        type: String,
        default: 'text',
        validator: (value) =>
          ['text', 'date', 'daterange', 'datetimerange', 'select'].indexOf(
            value
          ) != -1,
      },
      options: Array,
      placeholder: {
        type: String,
        default() {
          return `${t('ht.common.enter')}${this.label}`
        },
      },
      valueFormat: {
        type: String,
        default: 'yyyy-MM-dd HH:mm:ss',
      },
      hideLabel: {
        type: Boolean,
        default: false,
      },
      labelWidth: {
        type: Number,
        default: 0,
      },
      width: {
        type: Number,
        default: 0,
      },
      prefixIcon: String,
      suffixIcon: String,
      displayStyle: String,
      enterToSearch: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        data: null,
        colspan: 8,
        panelDisplayStyle: null,
        panelLabelWidth: 70,
        panelIsFlexLayout: false, //面板是否流式布局
        pickerOptions: {
          shortcuts: [
            {
              text: this.$t('ht.date.lastWeek'),
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                picker.$emit('pick', [start, end])
              },
            },
            {
              text: this.$t('ht.date.lastMonth'),
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                picker.$emit('pick', [start, end])
              },
            },
            {
              text: this.$t('ht.date.lastThreeMonths'),
              onClick(picker) {
                const end = new Date()
                const start = new Date()
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
                picker.$emit('pick', [start, end])
              },
            },
          ],
        },
      }
    },
    computed: {
      hasDefaultSlot() {
        return this.$slots.default && this.$slots.default.length > 0
      },
      colSpanVal() {
        return this.span > 0 ? this.span : this.colspan
      },
      finalLabelWidth() {
        return this.labelWidth > 0 ? this.labelWidth : this.panelLabelWidth
      },
      inputDivJudgeWidth() {
        return this.hideLabel
          ? 0
          : this.finalLabelWidth + (this.panelIsFlexLayout ? 0 : 30)
      },
      containerStyle() {
        return this.width > 0 ? { width: `${this.width}px` } : ''
      },
      finalDisplayStyle() {
        const partDisplayStyle =
          this.span == 0
            ? this.displayStyle
            : this.displayStyle
            ? this.displayStyle
            : 'block'
        return partDisplayStyle || this.panelDisplayStyle
      },
    },
    watch: {
      data: function(newVal) {
        this.handleInputChange(newVal)
      },
      value: function(newVal) {
        this.handleInputChange(newVal)
      },
    },
    created() {
      this.$on('input-reset', () => {
        this.data = null
      })
      this.$on('panel-props', (m, n, o, d) => {
        this.panelLabelWidth = m
        this.colspan = n
        this.panelIsFlexLayout = o
        this.panelDisplayStyle = d
      })
    },
    mounted() {
      // 挂载完成后，将本实例注册到高级搜索面板对应的搜索条件列表中
      this.dispatch('HtTableSearchPanel', 'field-loaded', [this])
    },
    methods: {
      handleInputChange(inputVal) {
        this.dispatch('HtTableSearchPanel', 'input-change', [
          {
            value: inputVal,
            operation: this.operation,
            relation: this.relation,
          },
          this.prop,
        ])
      },
      textInputEnter() {
        this.enterToSearch &&
          this.dispatch('HtTableSearchPanel', 'search', [this])
      },
    },
  }
</script>
<style lang="scss" scoped>
  .search-field__container {
    margin-bottom: 15px;
    height: 32px;
  }

  .search-field__container-flex {
    margin-right: 10px;
    float: left;
  }

  .field-label-panel,
  .field-input-panel {
    display: inline-block;
  }
  .is-align-right {
    text-align: right;
    width: unset !important;
  }
  .unset-width {
    width: unset !important;
    max-width: unset !important;
    margin-right: 20px;
  }
  .field-input-panel {
    max-width: 500px;
  }

  .field-input-panel > .inputs {
    display: block;
  }

  .field-input-panel > .inputs ::v-deep .el-input__inner {
    border-radius: 0;
  }

  .search-field-label {
    display: inline-block;
    max-width: calc(100% - 10px);
    line-height: 100%;

    &::after {
      content: ':';
    }
  }
  ::v-deep .el-date-editor.el-input {
    width: 100%;
  }
  ::v-deep {
    .el-date-editor--daterange,
    .el-date-editor--datetimerange {
      width: 100% !important;
    }
  }
</style>
