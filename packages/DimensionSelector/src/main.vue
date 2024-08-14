<template>
  <div
    v-if="permission !== 'n'"
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
  >
    <div
      style="width: 100%; min-width:180px;"
      class="el-select"
      :class="{ 'has-value': demensions.length > 0 }"
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
        <span class="tag-wrap">
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
            <i class="el-icon-circle-close clear-icon" @click.stop="clear"></i>
            <ht-icon name="users" class="user-icon" />
          </span>
        </span>
      </div>
    </div>
    <ht-field-tail :field-name="inputName" :input-value="value" />
    <el-dialog
      :title="t('ht.selector.dimensionTitle')"
      :visible.sync="dialogVisible"
      class="dialog-selector__wrapper"
      :class="{ 'mobile-dialog': isMobile }"
      top="6vh"
      :before-close="handleClose"
      :close-on-click-modal="false"
      :append-to-body="appendToBody"
    >
      <div class="dialog-selector__body">
        <el-input
          v-model="searchWord"
          size="small"
          clearable
          :placeholder="searchPlaceholder"
          @clear="reset"
          @keyup.enter.native="search"
        >
          <i
            slot="prefix"
            :title="t('ht.common.search')"
            class="el-input__icon el-icon-search"
            @click="search"
          />
        </el-input>
        <ht-list-selector
          ref="selector"
          v-model="demensions"
          class="post-selector"
          :title="t('ht.selector.dimensionList')"
          :data="data"
          :pagination="pagination"
          :select-label="selectLabel"
          :quick-search-props="quickSearchProps"
          :single="single"
          :search-placeholder="searchPlaceholder"
          :primary-field="primaryField"
          :mode="mode"
          @reset="reset"
          @row-click="(row) => $emit('row-click', row)"
          @page-change="(page) => $emit('page-change', page)"
          @size-change="(size) => $emit('size-change', size)"
        >
          <template #detail="{ item }">
            <ht-icon
              name="demension"
              class="follow-theme-color"
              style="margin-left:15px;width:36px;height:36px;"
            />
            <div class="selector-item__detail">
              <div class="selector-detail__name">
                <label>{{ item[selectLabel] }}</label>
                <span>({{ item['code'] }})</span>
              </div>
            </div>
          </template>
          <template #selected="{ select }">
            <ht-icon
              name="demension"
              class="follow-theme-color"
              style="margin-left:15px;width:36px;height:36px;"
            />
            <p
              class="selector-selected__label"
              :title="
                `${select[selectLabel]}${
                  select['code'] ? `(${select['code']})` : ''
                }`
              "
            >
              {{
                `${select[selectLabel]}${
                  select['code'] ? `(${select['code']})` : ''
                }`
              }}
            </p>
          </template>
        </ht-list-selector>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="handleDialogSure">
          {{ t('ht.common.confirm') }}
        </el-button>
        <el-button size="small" @click="handleDialogCancel">
          {{ t('ht.common.cancle') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import inputName from '@/mixins/inputName.js'
  import permission from '@/mixins/permission.js'
  import form from '@/mixins/form.js'
  import mobileMode from '@/mixins/mobileMode.js'
  import HtFieldTail from '../../FieldTail/index'
  import HtListSelector from '../../ListSelector/index'
  import Locale from '@/mixins/locale'
  import { setTimeout } from 'timers'
  import { t } from '@/locale'

  export default {
    name: 'HtDimensionSelector',
    components: {
      HtFieldTail,
      HtListSelector,
    },
    mixins: [inputName, permission, form, mobileMode, Locale],
    props: {
      searchPlaceholder: {
        type: String,
        default() {
          return t('ht.selector.nameCode')
        },
      },
      value: String,
      selectLabel: String,
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
      mode: {
        type: String,
      },
    },
    data() {
      return {
        inputSuffixHeight: 30,
        demensions: [],
        dialogVisible: false,
        searchWord: null,
        loading: false,
      }
    },
    computed: {
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
          if (newVal.length > 0) {
            this.calacInputSuffixHeight()
          } else {
            this.inputSuffixHeight = 30
          }
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
    methods: {
      search() {
        if (this.loading) {
          return
        }
        this.$emit('search', this.searchWord)
      },
      reset() {
        this.$emit('reset')
        this.searchWord = null
      },
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
      clear() {
        this.demensions = []
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
  .dialog-selector__wrapper {
    ::v-deep {
      .el-dialog__header {
        span {
          font-weight: bold;
          color: #222;
        }
      }

      .el-dialog__body {
        padding: 0 20px;
      }

      .el-dialog__footer {
        text-align: center;
      }
    }
    .dialog-selector__body {
      .el-icon-search {
        cursor: pointer;
      }
    }

    .post-selector {
      margin-top: 10px;
    }

    .selector-range__card {
      ::v-deep {
        .el-card__body {
          height: 530px;

          .el-tabs {
            height: 100%;

            .el-tabs__content {
              height: calc(100% - 63px);

              .el-tab-pane {
                height: 100%;
              }
            }
          }
        }
        .el-tabs__nav-wrap {
          background-color: #fcfcfc;
          padding-left: 8px;
        }
        .el-tabs__item {
          padding: 0 10px;
          height: 48px;
          line-height: 48px;
        }
      }
    }
    .selector-item__detail {
      display: flex;
      flex-direction: column;
      margin-left: 10px;

      .selector-detail__name {
        max-width: 220px;

        label {
          color: #111;
          font-size: 14px;
        }
        span {
          margin-left: 10px;
          color: #777;
        }
      }

      .selector-detail__desc {
        margin-top: 5px;

        span {
          display: inline-block;
          font-size: 12px;
          color: #777;
          max-width: 94px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        span + span {
          margin-left: 10px;
        }
      }
    }
    .selector-selected__label {
      margin-left: 10px;
      width: 109px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
