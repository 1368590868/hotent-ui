<template>
  <div
    v-if="permission !== 'n'"
    v-express
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
      company ? 'has-company-box' : '',
    ]"
  >
    <el-input
      v-if="isShowInput"
      ref="inputEle"
      v-model="inputVal"
      v-validate="inputValidate"
      :type="type"
      :size="inputSize"
      :style="inputWidth"
      :name="inputName"
      :placeholder="placeholder"
      :clearable="clearable"
      :show-password="showPassword"
      :disabled="isDisabled"
      :readonly="readonly"
      :rows="rowsVal"
      :cols="colsVal"
      :min="min"
      :max="max"
      :autosize="autosize"
      :resize="resize"
      :tabindex="tabindex"
      :prefix-icon="prefixIcon"
      :suffix-icon="suffixIcon"
      :minlength="minlength"
      :maxlength="maxlength"
      :show-word-limit="showWordLimit"
      @blur="handleBlur"
      @focus="handleFocus"
      @change="handleChange"
      @input="handleInput"
      @clear="handleClear"
    >
      <slot slot="prefix" name="prefix"></slot>
      <slot slot="suffix" name="suffix"></slot>
      <slot slot="prepend" name="prepend"></slot>
      <slot slot="append" name="append"></slot>
    </el-input>
    <template v-if="inputWriteable && type == 'number'">
      <el-input-number
        v-if="isNumber"
        ref="inputEle"
        v-model="inputVal"
        v-validate="inputValidate"
        :type="type"
        :controls-position="controlsPosition"
        :size="inputSize"
        :style="inputWidth"
        :name="inputName"
        :placeholder="placeholder"
        :clearable="clearable"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :step-strictly="stepStrictly"
        :precision="precision"
        @blur="handleNumberBlur"
        @focus="handleFocus"
        @change="handleChange"
      ></el-input-number>
      <el-input
        v-else
        ref="exhibit"
        v-model="exhibitText"
        class="exhibit"
        type="text"
        :controls-position="controlsPosition"
        :size="inputSize"
        :style="inputWidth"
        :name="inputName"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :step-strictly="stepStrictly"
        :precision="precision"
        @focus="exhibitFocus"
      ></el-input>
      <span v-if="company">{{ company }}</span>
    </template>
    <ht-field-tail
      v-if="isShowText"
      :field-name="inputName"
      :readonly="!inputWriteable"
      :input-value="readOnlyInputVal"
      :company="company"
      :precision="precision"
      :type="type"
      :filter-currency="filtercurrency"
      :filterthousand-bit="filterthousandBit"
    >
      <slot slot="prefix" name="prefix"></slot>
      <slot slot="suffix" name="suffix"></slot>
      <slot slot="prepend" name="prepend"></slot>
      <slot slot="append" name="append"></slot>
    </ht-field-tail>
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import FormMath from '@/math.js'
  import HtFieldTail from '../../FieldTail/index'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import _ from 'lodash'

  export default {
    name: 'HtInput',
    components: {
      HtFieldTail,
    },
    mixins: [permission, inputName, form],
    props: {
      value: [String, Number],
      controlsPosition: {
        type: String,
        default: 'right',
      },
      width: [String, Number],
      clearable: {
        type: Boolean,
        default: true,
      },
      showPassword: {
        type: Boolean,
        default: false,
      },
      mathExp: String,
      type: {
        type: String,
        default: 'text',
      },
      ctrlType: {
        type: String,
        default: '',
      },
      dateCalcExp: Object,
      readonly: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      min: Number,
      max: Number,
      step: {
        type: Number,
        default: 1,
      },
      stepStrictly: {
        type: Boolean,
        default: false,
      },
      precision: Number,
      cols: {
        type: Number,
        default: 60,
      },
      rows: {
        type: Number,
        default: 2,
      },
      autosize: {
        type: [Boolean, Object],
        default: false,
      },
      prefixIcon: String,
      suffixIcon: String,
      tabindex: String,
      minlength: {
        type: Number,
      },
      maxlength: {
        type: Number,
      },
      showWordLimit: {
        type: Boolean,
        default: false,
      },
      format: {
        type: Function,
      },
      formatWhenReadonly: {
        type: Boolean,
        default: true,
      },
      filterthousandBit: {
        type: Boolean,
        default: false,
      },
      filtercurrency: {
        type: Boolean,
        default: false,
      },
      configAttributes: Object,
      company: String,
      resize: {
        type: String,
      },
    },
    data() {
      return {
        unwatchAry: [],
        morphing: false,
        tempInputVal: null,
        isFocus: false,
        exhibitText: '',
        isNumber: true,
        numberPreBlur: false,
      }
    },
    computed: {
      inputVal: {
        get() {
          // input为number时 输入框获取焦点时 自动清空输入框默认内容 简化用户操作
          if (this.isFocus && this.type === 'number' && this.value === 0) {
            return undefined
          }
          if (this.morphing && this.tempInputVal !== null) {
            return this.tempInputVal
          }
          if (utils.isEmpty(this.value)) {
            return ''
          }
          return this.value
        },
        set(val) {
          if (this.isFocus && this.type === 'number' && val === undefined) {
            this.$emit('input', 0)
            return
          }
          // 格式化显示时不更新到value属性上
          !this.morphing && this.$emit('input', val)
        },
      },
      colsVal: function () {
        return this.type == 'textarea' ? this.cols : null
      },
      rowsVal: function () {
        return this.type == 'textarea' ? this.rows : null
      },
      inputWidth: function () {
        return this.width
          ? typeof this.width == 'string'
            ? { width: this.width }
            : { width: `${this.width}px` }
          : null
      },
      isShowText() {
        return !this.inputWriteable
          ? this.type === 'number'
            ? this.permission_sub !== 'n'
            : this.permission_sub !== 'n' && this.currentShowMode !== 'input'
          : true
      },
      isShowInput() {
        return (
          (this.inputWriteable || this.currentShowMode === 'input') &&
          this.type !== 'number'
        )
      },
      readOnlyInputVal() {
        return this.filterthousandBit || this.filtercurrency
          ? this.exhibitText
          : this.inputVal
      },
    },
    watch: {
      value: function () {
        if (this.morphing && this.tempInputVal !== null) {
          this.enterMorph()
        }
      },
      inputWriteable: function (newVal, oldVal) {
        if (newVal != oldVal) {
          if (!newVal) {
            // 只读时是否保持格式化显示
            this.formatWhenReadonly ? this.enterMorph() : this.exitMorph()
          } else {
            this.enterMorph()
          }
        }
      },
    },

    mounted() {
      const _me = this
      const exp = this.mathExp
      const formVm = utils.getOnlineFormInstance(_me)
      // 初始化流水号配置
      this.initIdentity(_me, formVm)
      // 数学运算表达式
      if (exp) {
        let elAttr = this.$vnode.data.model.expression
        if (this.modelExpression) {
          elAttr = this.modelExpression
        }
        const fields = FormMath.parseFuncexpField(exp)
        formVm.$on(elAttr, function (args) {
          if (args.hasOwnProperty('index')) {
            const { subScopeEl, index } = utils.getSubScopeElAndIndex(_me.$el)
            if (subScopeEl != null && index === null) {
              throw '要计算子表行数据的输入框不在包含data-subname属性的元素中.'
            }
            if (index == args.index) {
              _me.$emit('input', args.result)
            }
          } else {
            _me.$emit('input', args.result)
          }
        })

        fields.forEach((ele) => {
          if (formVm.watchMap.has(ele)) {
            let ary = formVm.watchMap.get(ele)
            ary.push({ target: elAttr, exp })
            formVm.watchMap.set(ele, ary.unique('target'))
          } else {
            formVm.watchMap.set(ele, [{ target: elAttr, exp }])
          }
        })
      }
      // 日期计算表达式
      if (this.dateCalcExp) {
        // 计算日期间隔
        let handleDateCalc = function (startVal, endVal) {
          _me.$emit(
            'input',
            utils.dateCalc(startVal, endVal, _me.dateCalcExp.diffType)
          )
        }
        // 获取是否在子表中每一行进行日期计算
        const { subScopeEl, index } = utils.getSubScopeElAndIndex(_me.$el)
        if (subScopeEl) {
          const startScope = utils.getSubInputScopeByModelExpression(
            subScopeEl,
            this.dateCalcExp.start
          )
          const endScope = utils.getSubInputScopeByModelExpression(
            subScopeEl,
            this.dateCalcExp.end
          )
          // 对于子表中某行的日期计算，需要找到日期控件对应的vm实例
          startScope.$watch(
            'inputVal',
            function (newVal, oldVal) {
              if (newVal !== oldVal) {
                handleDateCalc(startScope.value, endScope.value)
              }
            },
            { immediate: false }
          )
          endScope.$watch(
            'inputVal',
            function (newVal, oldVal) {
              if (newVal !== oldVal) {
                handleDateCalc(startScope.value, endScope.value)
              }
            },
            { immediate: false }
          )
        } else {
          let cb = function (newVal, oldVal) {
            if (newVal !== oldVal) {
              let startVal = utils.getValueByPath(
                formVm,
                _me.dateCalcExp.start,
                index
              )
              let endVal = utils.getValueByPath(
                formVm,
                _me.dateCalcExp.end,
                index
              )
              handleDateCalc(startVal, endVal)
            }
          }
          // 主表中的日期计算，在表单上通过v-model的表达式来监控值变更
          formVm.$watch(this.dateCalcExp.start, cb, { immediate: true })
          formVm.$watch(this.dateCalcExp.end, cb, { immediate: true })
        }
      }
      this.enterMorph()
      // 数字类型且配置了千分位或人民币大写
      if (
        this.type == 'number' &&
        (this.filtercurrency || this.filterthousandBit)
      ) {
        window.addEventListener('click', this.clickOther)
      }
    },
    beforeDestroy() {
      if (
        this.type == 'number' &&
        (this.filtercurrency || this.filterthousandBit)
      ) {
        window.removeEventListener('click', this.clickOther)
      }
      let that = this
      let watcher =
        that._watchers && that._watchers.find((m) => m.expression == 'inputVal')
      if (watcher && watcher.cb) {
        // 单行文本销毁时，触发一次change事件，更新计算公式
        watcher.cb('0', that.inputVal, true)
      }
    },
    destroyed() {
      this.unwatchAry &&
        this.unwatchAry.forEach((unwatch) => {
          unwatch.call()
        })
    },
    methods: {
      handleNumberBlur(event) {
        if (
          this.type == 'number' &&
          (this.filtercurrency || this.filterthousandBit)
        ) {
          this.numberPreBlur = true
          return
        }
        this.handleBlur(event)
      },
      clickOther(event) {
        setTimeout(() => {
          if (!this.numberPreBlur) {
            return
          }
          // 当外部点击事件触发时判断当前是否在点击el-input-number控件，是则不继续触发blur事件，否则才触发blur事件
          const path =
            event.path || (event.composedPath && event.composedPath())
          const result = path.some((p) => {
            return p.className && p.className.indexOf('el-input-number') > -1
          })
          if (!result) {
            this.handleBlur(event)
            this.numberPreBlur = false
          }
        }, 10)
      },
      exhibitFocus() {
        this.isNumber = true
        this.$nextTick(() => {
          this.$refs.inputEle.focus()
        })
      },
      handleBlur(event) {
        this.isFocus = false
        this.enterMorph()
        this.$emit('blur', event)
      },
      handleFocus(event) {
        this.isFocus = true
        this.exitMorph()
        this.$emit('focus', event)
      },
      handleChange(val) {
        this.$emit('change', val)
      },
      handleInput(val) {
        this.$emit('input', val)
      },
      handleClear() {
        this.$emit('clear')
      },
      // 进入格式显示模式
      enterMorph() {
        // 只在text类型时格式化
        // 货币和数字时也格式化
        const ctrlTypeList = ['currency', 'number']
        if (
          this.morphing ||
          (this.type != 'text' &&
            this.ctrlType !== 'currency' &&
            this.ctrlType !== 'number')
        ) {
          return
        }
        // 优先处理设定了format方法的情况
        if (this.format) {
          const result = this.format(this.value)
          if (result && result.constructor == Promise) {
            result.then((resp) => {
              this.morphing = true
              this.tempInputVal = resp
            })
          } else if (result != null && result != undefined) {
            this.morphing = true
            this.tempInputVal = result
          }
        }
        // 其次人民币大写
        else if (this.filtercurrency) {
          this.morphing = true
          if (ctrlTypeList.includes(this.ctrlType)) {
            if (utils.isEmpty(this.value) && this.min) {
              this.$emit('input', this.min)
            }
            this.$nextTick(() => {
              this.exhibitText = FormMath.convertCurrency(this.value)
              this.isNumber = false
            })
          } else {
            this.tempInputVal = FormMath.convertCurrency(this.value)
          }
        }
        // 最后千分位
        else if (this.filterthousandBit) {
          this.morphing = true
          if (ctrlTypeList.includes(this.ctrlType)) {
            if (utils.isEmpty(this.value) && this.min) {
              this.$emit('input', this.min)
            }
            this.$nextTick(() => {
              this.exhibitText = utils.thousandBit(this.value)
              this.isNumber = false
            })
          } else {
            this.tempInputVal = utils.thousandBit(this.value)
          }
        }
      },
      // 退出格式化显示模式
      exitMorph() {
        this.morphing = false
        this.tempInputVal = null
      },
      // 如果当前输入框绑定了流水号，则将modelName记录到form的watchMap中，用于在复制数据时将流水号置空以便产生新的流水号。
      recordBindIdentityInWatchMap(pInst) {
        if (!pInst || !pInst.watchMap || !this.modelName) {
          return
        }
        let bindIdentityModelNameList = pInst.watchMap.get(
          'bindIdentityModelNameList'
        )
        if (
          bindIdentityModelNameList == null ||
          bindIdentityModelNameList == undefined
        ) {
          bindIdentityModelNameList = []
        }
        bindIdentityModelNameList.push(this.modelName)
        bindIdentityModelNameList = bindIdentityModelNameList.unique()
        pInst.watchMap.set(
          'bindIdentityModelNameList',
          bindIdentityModelNameList
        )
      },
      initIdentity(_me, pInst) {
        //检查流水号
        if (this.configAttributes) {
          this.isEdit = !this.configAttributes.isInputEdit
          //判断是否绑定流水号
          if (this.configAttributes.bindIdentityAlias) {
            this.recordBindIdentityInWatchMap(pInst)
            this.isEdit = false
            if (this.value) return
            var alias = this.configAttributes.bindIdentityAlias
            this.$requestConfig.getNextIdByAlias(alias).then((res) => {
              if (res.state) {
                this.$emit('input', res.value)
                if (res.value) {
                  var match = /(\{(.*)\}).*$/.exec(res.value)
                  //判断流水号中是否表达式如{kjbt.csfjsc}
                  if (match) {
                    this.$emit('input', res.value.replace(match[1], ''))
                    // data 数据所在的 VueComponent
                    const runtimePInst =
                      utils.getRuntimeTemplateOnlineForm(this)
                    if (runtimePInst && match[2]) {
                      runtimePInst.$watch(
                        `data.${match[2]}`,
                        (newVal, oldVal) => {
                          if (newVal != oldVal) {
                            if (this.modelName === `data.${match[2]}`) {
                              this.$message.error(
                                this.$t('ht.input.serialNumberErrorMsg')
                              )
                            } else {
                              this.$emit(
                                'input',
                                res.value.replace(match[1], newVal)
                              )
                            }
                          }
                        },
                        { immediate: true }
                      )
                    }
                  }
                }
              } else {
                this.$message.error(res.message)
              }
            })
          }
          _me.$watch('inputVal', function () {
            pInst.$watch(
              'identityMap',
              function (newVal, oldVal) {
                if (newVal && newVal !== oldVal) {
                  for (const key in newVal) {
                    if (_me.modelName == key) {
                      let item = newVal[key]
                      utils.setValueByPath(
                        pInst,
                        item.key,
                        item.value.replace(item.expression, _me.value)
                      )
                    }
                  }
                }
              },
              { immediate: true }
            )
          })
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

  div[aria-invalid='true'] ::v-deep .el-textarea__inner,
  div[aria-invalid='true'] ::v-deep .el-textarea__inner:focus {
    border-color: #f56c6c;
  }
  .inputs {
    ::v-deep {
      .el-input-number {
        width: calc(100% - 30px);
      }
    }
  }
  .exhibit {
    width: calc(100% - 30px);
  }
</style>
