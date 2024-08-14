<template>
  <div class="inputs">
    <div
      style="width: 100%; min-width:180px;"
      class="el-select"
      @click="showDialog"
    >
      <div
        ref="tagSpans"
        style="width: calc(100% - 25px);"
        :class="{
          'el-select__tags_readonly': !inputWriteable,
          'el-select__tags': inputWriteable,
        }"
      >
        <span>
          <span
            v-for="(item, index) in demensions"
            :key="index"
            class="el-tag el-tag--info el-tag--small"
            @click.stop
          >
            <span class="el-select__tags-text">{{ item.name }}</span>
            <i
              v-if="inputWriteable"
              class="el-tag__close el-icon-close"
              @click="handleRemove(item)"
            ></i>
          </span>
        </span>
      </div>
      <div v-if="inputWriteable" class="el-input el-input--suffix">
        <input
          ref="inputEl"
          v-model="value"
          v-validate="inputValidate"
          type="text"
          readonly="readonly"
          :name="inputName"
          autocomplete="off"
          class="el-input__inner"
          :placeholder="placeholder"
          :style="{
            height: inputSuffixHeight + 'px',
            lineHeight: inputSuffixHeight + 'px',
          }"
        />
        <span class="el-input__suffix">
          <span class="el-input__suffix-inner">
            <ht-icon name="users" />
          </span>
        </span>
      </div>
    </div>
    <ht-field-tail
      :writeable.sync="writeable"
      :field-name="inputName"
      :input-value="value"
    />
    <el-dialog
      :title="$t('ht.selector.dimensionTitle')"
      :visible.sync="dialogVisible"
      class="dialog-selector__wrapper"
      top="6vh"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :append-to-body="appendToBody"
    >
      <ht-selector
        ref="selector"
        v-model="demensions"
        :data="data"
        :pagination="pagination"
        :table-columns="tableColumns"
        :select-label="selectLabel"
        :quick-search-props="quickSearchProps"
        :single="single"
        :search-placeholder="searchPlaceholder"
        :primary-field="primaryField"
        @load="load"
        @select="select"
        @row-click="rowClick"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="handleDialogSure">
          {{ $t('ht.common.confirm') }}
        </el-button>
        <el-button size="small" @click="handleDialogCancel">
          {{ $t('ht.common.cancle') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import HtFieldTail from '../../FieldTail/index'
  import HtSelector from '../../Selector/index'
  import { setTimeout } from 'timers'
  import { t } from '@/locale'

  export default {
    name: 'HtDemension',
    components: {
      HtFieldTail,
      HtSelector,
    },
    props: {
      searchPlaceholder: {
        type: String,
        default() {
          return t('ht.selector.nameCode')
        },
      },
      validate: [String, Object],
      value: String,
      name: String,
      selectLabel: String,
      placeholder: {
        type: String,
        default() {
          return t('ht.common.enter')
        },
      },
      permission: {
        type: String,
        default: 'w',
        validator: function(value) {
          return ['b', 'w', 'r', 'n'].indexOf(value) !== -1
        },
      },
      single: {
        type: Boolean,
        default: false,
      },
      config: Object,
      data: {
        type: Array,
        default: () => {
          return []
        },
      },
      tableColumns: {
        type: Array,
        default: () => {
          return []
        },
      },
      pagination: {
        type: Object,
        default: () => {
          return {
            page: 1,
            pageSize: 50,
            total: 0,
          }
        },
      },
      quickSearchProps: {
        type: String,
        required: true,
      },
      appendToBody: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        inputName: null,
        writeable: true,
        inputSuffixHeight: 30,
        demensions: [],
        dialogVisible: false,
      }
    },
    computed: {
      inputWriteable: function() {
        return this.writeable
          ? utils.getWriteable(this.permission)
          : this.writeable
      },
      inputValidate: function() {
        return utils.addRequiredOrNot(this.permission, this.validate, this)
      },
      primaryField: function() {
        return this.config && this.config.hasOwnProperty('id')
          ? 'id'
          : this.config && this.config.hasOwnProperty('code')
          ? 'code'
          : this.selectLabel
      },
    },
    watch: {
      // 当所选择的数据发生变化时，同步到v-model中
      demensions: function(newVal) {
        let ary = [],
          idAry = [],
          demNameAry = [],
          codeAry = []
        if (newVal && newVal.constructor === Array && newVal.length > 0) {
          newVal.forEach((m) => {
            ary.push(m.name)
            if (m.hasOwnProperty('id')) {
              idAry.push(m.id)
            }
            if (m.hasOwnProperty('code')) {
              codeAry.push(m.code)
            }
            if (m.hasOwnProperty('demName')) {
              demNameAry.push(m.demName)
            }
          })
        }
        if (this.config) {
          // 配置了id的绑定关系，则回填到指定属性上
          if (this.config.hasOwnProperty('id')) {
            utils.setValueByConfigKey(this, this.config, 'id', idAry.join(','))
          }
          // 配置了code的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('code')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'code',
              codeAry.join(',')
            )
          }
          // 配置了demName的绑定关系，则回填到指定属性上
          if (this.config.hasOwnProperty('demName')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'demName',
              demNameAry.join(',')
            )
          }
        }
        // 通过valueChange事件发布值变更消息
        this.$emit('valueChange', ary.join(','), newVal)
        setTimeout(() => {
          this.calacInputSuffixHeight()
          if (this.$refs.inputEl) {
            this.$refs.inputEl.focus()
            this.$refs.inputEl.blur()
          }
        }, 10)
      },
      value: function() {
        // 父级传递进来的value发生变更时，需要同步到当前所选数据中
        this.valueInit()
      },
    },
    mounted() {
      // 组件第一次挂载时，同步value到当前所选数据中
      this.valueInit()
    },
    created() {
      this.inputName = this.name ? this.name : utils.getName()
      this.$validator = this.$root.$validator
    },
    methods: {
      // 同步value到当前所选数据中
      valueInit() {
        let tmpAry = []
        if (this.value) {
          let idAry = [],
            demNameAry = [],
            codeAry = []
          if (this.config) {
            // 配置了id绑定关系，则获取id的值
            if (this.config.hasOwnProperty('id')) {
              let idVal = utils.getValueByConfigKey(this, this.config, 'id')
              if (idVal) {
                idAry = idVal.split(',').trim()
              }
            }
            // 配置了code绑定关系，则获取code的值
            if (this.config.hasOwnProperty('code')) {
              let codeVal = utils.getValueByConfigKey(this, this.config, 'code')
              if (codeVal) {
                codeAry = codeVal.split(',').trim()
              }
            }
            // 配置了demName绑定关系，则获取demName的值
            if (this.config.hasOwnProperty('demName')) {
              let demNameVal = utils.getValueByConfigKey(
                this,
                this.config,
                'demName'
              )
              if (demNameVal) {
                demNameAry = demNameVal.split(',').trim()
              }
            }
          }
          // 将name、id、code从逗号分割的字符串解析为json对象格式的数组
          let valAry = this.value.split(',').trim()
          valAry.forEach((m, index) => {
            let item = { name: m }
            if (idAry.length > index) {
              item['id'] = idAry[index]
            }
            if (codeAry.length > index) {
              item['code'] = codeAry[index]
            }
            if (demNameAry.length > index) {
              item['demName'] = demNameAry[index]
            }
            tmpAry.push(item)
          })
        }
        // 对数组做深度对比，如果值不完全相等，则进行赋值操作
        if (!utils.arrayEquals(tmpAry, this.demensions)) {
          this.demensions = tmpAry
        }
      },
      showDialog() {
        if (!this.inputWriteable) {
          return
        }
        this.dialogVisible = true
        setTimeout(() => {
          this.$refs.selector.onShow()
        })
      },
      handleClose(done) {
        this.$refs.selector.onHide()
        done && done()
      },
      handleDialogSure() {
        this.$emit('select-data', this.$refs.selector.getSelectedData())
        this.dialogVisible = false
        this.$refs.selector.onHide(true)
      },
      handleDialogCancel() {
        this.dialogVisible = false
        this.$refs.selector.onHide()
      },
      handleRemove(item) {
        this.demensions.remove(item)
      },
      // 更新当前输入框的高度来适配已选数据的高度
      calacInputSuffixHeight() {
        if (!this.$refs.tagSpans) return
        if (this.$refs.tagSpans.offsetHeight) {
          this.inputSuffixHeight = this.$refs.tagSpans.offsetHeight + 5
        } else {
          this.inputSuffixHeight = 30
        }
      },
      load(param, cb) {
        this.$emit('load', param, cb)
      },
      select(selection, row) {
        this.$emit('select', selection, row)
      },
      rowClick(row, column, event) {
        this.$emit('row-click', row, column, event)
      },
    },
  }
</script>
<style lang="scss" scoped>
  @import '~@/styles/selector.scss';

  .inputs {
    display: block;
  }

  .el-select__tags {
    background: #fff;
    margin-left: 1px;
  }

  .el-select__tags_readonly {
    position: relative;
    top: 50%;
  }

  .el-input__inner[aria-invalid='true'] {
    border-color: #f56c6c;
  }
  .el-input__suffix {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
