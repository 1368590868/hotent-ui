<template>
  <div class="inputs">
    <el-tooltip
      :placement="tooltipplacement || defualtTooltipplacement"
      :disabled="
        inputWriteable && errors && !errors.has('custom-form.' + inputName)
      "
    >
      <div v-if="errors && errors.first" slot="content">
        {{ errors.first('custom-form.' + inputName) }}
      </div>
      <div
        v-if="inputWriteable"
        style="width: 100%"
        class="el-select"
        :class="{ 'has-value': value }"
      >
        <div
          ref="tagSpans"
          class="el-select__tags"
          :style="{ width: 'calc(100% - 10px - ' + inputSuffixWidth + 'px)' }"
          @click="showEditInput"
        >
          <span class="tag-wrap">
            <span
              v-for="(item, index) in inputVal"
              :key="item.value"
              class="el-tag el-tag--info el-tag--small"
              @click="showEditInput"
            >
              <span class="el-select__tags-text">{{ item.value }}</span>
              <i
                class="el-tag__close el-icon-close"
                @click.stop="removeSelectOrg(index)"
              ></i>
            </span>
          </span>
        </div>
        <div class="el-input el-input--suffix">
          <input
            v-model="inputVal"
            v-validate="inputValidate"
            type="text"
            readonly="readonly"
            :name="inputName"
            autocomplete="off"
            class="el-input__inner"
            :placeholder="placeholder"
            :style="{ height: inputSuffixHeight + 'px' }"
            @click="showEditInput"
          />
          <!-- 允许手动输入时 -->
          <el-input
            v-if="isAllowCustom && isEditInputShow"
            ref="editInputRef"
            v-model="customValue"
            clearable
            class="edit-input"
            size="mini"
            :style="{
              right: inputSuffixWidth - 1 + 'px',
              width: 'auto!important',
              height: inputSuffixHeight - 4 + 'px',
            }"
            @blur="editInputBlur"
          ></el-input>
          <span ref="inputSuffix" class="el-input__suffix" @click="showDialog">
            <span
              class="el-input__suffix-inner"
              :class="{ 'has-clear-all': value }"
            >
              <i
                class="el-icon-circle-close clear-icon"
                @click.stop="clear"
              ></i>
              <el-button
                slot="append"
                type="info"
                size="mini"
                style="margin:0 !important"
              >
                <i
                  :class="
                    custdialog.icon
                      ? 'el-input__icon ' + custdialog.icon
                      : 'el-input__icon icon-duihuakuang'
                  "
                  :style="{
                    fontSize: '17px',
                    lineHeight: inputSuffixHeight + 'px',
                  }"
                ></i>
                {{ custdialog.name }}
              </el-button>
            </span>
          </span>
        </div>
      </div>
    </el-tooltip>
    <span v-if="!inputWriteable">
      <span
        v-for="item in inputVal"
        :key="item.value"
        class="el-tag el-tag--info el-tag--small"
        style="margin-right: 8px"
        @click.stop
      >
        <span class="el-select__tags-text">{{ item.value }}</span>
      </span>
    </span>
    <custom-mobile-dialog
      v-if="isMobile"
      ref="customMobileDialogRef"
      :model-name="modelName"
      :custdialog="custdialog"
      :sub-index="subIndex"
      :sun-index="sunIndex"
      :sub-path="subPath"
      :current-sub-data="currentSubData"
      @calacInputSuffixHeight="calacInputSuffixHeight"
      @updateInput="updateInput"
    ></custom-mobile-dialog>
    <custom-dialog
      v-else
      ref="customDialogRef"
      v-model="value"
      :model-name="modelName"
      :custdialog="custdialog"
      :sub-index="subIndex"
      :sun-index="sunIndex"
      :sub-path="subPath"
      :current-sub-data="currentSubData"
      :is-read-only="!inputWriteable"
      @calacInputSuffixHeight="calacInputSuffixHeight"
      @updateInput="updateInput"
    ></custom-dialog>
    <span style="display: none">
      <slot name="labeldesc">{{ inputName }}</slot>
    </span>
    <ht-field-tail :field-name="inputName" :input-value="value" />
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import locale from '@/mixins/locale.js'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import dialog from './customDialog.js'
  import _ from 'lodash'
  import mobileMode from '@/mixins/mobileMode.js'
  import CustomDialog from './customDialog.vue'
  import CustomMobileDialog from './customMobileDialog.vue'
  import HtFieldTail from '../../FieldTail/index'
  export default {
    name: 'HtCustomDialog',
    components: { CustomDialog, CustomMobileDialog, HtFieldTail },
    mixins: [dialog, locale, inputName, permission, form, mobileMode],
    props: {
      value: String,
      single: {
        type: Boolean,
        default: false,
      },
      custdialog: Object,
      tooltipplacement: Object,
      subIndex: Number,
      sunIndex: Number,
      subPath: String,
      currentSubData: Array,
    },
    data() {
      return {
        isEditInputShow: false,
        customValue: '',
        defualtTooltipplacement: 'bottom',
        dialogVisible: false, //打开树形输入动态参数值的对话框
        pageParam: {}, //树形对话框参数
        conditionfieldTree: [], //树形对话框条件字段
        data: {
          qxdd: {},
        },
        inputSuffixWidth: 60,
        quickSearch: '', //填写提示
        conditionBind: [], //参数查询字段
        nodeKey: 'ID_', //树形数据父Id
        customDialogShowList: false,
        customDialogShowTree: false,
        selectOrgProps: {
          label: 'name',
        },
        style: '', //对话框宽高
        selectOrgs: [],
        inputSuffixHeight: 33,
        customDialog: {},
        isCurrentChange: false, //是否不执行 orgTableSelection方法
        param: [], //绑定的表单字段
        treeList: [],
        writeable: true,
      }
    },
    computed: {
      inputVal: function() {
        if (!this.value || this.value == '||[]') {
          return null
        } else {
          let nameAry = this.value.split(',')
          if (this.value.indexOf('||') > 0) {
            nameAry = this.value.split('||')[0].split(',')
          }
          let result = []
          nameAry.forEach((m) => {
            let n = { value: m }
            result.push(n)
          })
          return result
        }
      },
      isAllowCustom() {
        return this.custdialog && this.custdialog.allowInput
      },
    },
    mounted() {
      setTimeout(() => {
        const { subScopeEl } = utils.getSubScopeElAndIndex(this.$el)

        if (subScopeEl) {
          if (
            subScopeEl.getAttribute('row_readonly') == 'true' ||
            subScopeEl.getAttribute('row_readonly') === true
          ) {
            this.writeable = false
          } else {
            const className = Array.prototype.find.call(
              subScopeEl.classList,
              (item) => item.startsWith('row_readonly__')
            )
            if (className && className == 'row_readonly__true') {
              this.writeable = false
            }
          }
        }
        //获取对话框按钮名称宽度
        this.calacInputSuffixWidth()
      }, 50)
    },
    methods: {
      editInputBlur() {
        this.$emit('input', this.customValue)
        this.isEditInputShow = false
      },
      showEditInput() {
        if (!this.isAllowCustom) {
          this.showDialog()
          return
        }
        this.customValue = this.value
        this.isEditInputShow = true
        this.$nextTick(() => {
          this.$refs.editInputRef.focus()
        })
      },
      showDialog() {
        if (!this.inputWriteable) {
          return
        }
        if (this.isMobile) {
          this.$refs.customMobileDialogRef.showDialog()
        } else {
          this.$refs.customDialogRef.showDialog()
        }
      },
      removeSelectOrg(item) {
        this.inputVal.splice(item, 1)
        let value = ''
        this.inputVal.forEach((val) => {
          value += val.value + ','
        })
        if (value.length > 0) {
          value = value.substring(0, value.length - 1)
        } else {
          this.clear()
        }
        this.$emit('input', value)
        this.calacInputSuffixHeight()
        if (this.isMobile) {
          this.$refs.customMobileDialogRef.removeSelectOrg(item)
        } else {
          this.$refs.customDialogRef.removeSelectOrg(item)
        }
      },
      clear() {
        this.$emit('input', '')
        this.$refs.customDialogRef.clearAll()
        this.calacInputSuffixHeight()
      },
      calacInputSuffixHeight() {
        setTimeout(() => {
          if (!this.$refs.tagSpans) return
          if (this.$refs.tagSpans.offsetHeight) {
            this.inputSuffixHeight = this.$refs.tagSpans.offsetHeight + 5
          } else {
            this.inputSuffixHeight = 30
          }
          // 触发验证
          this.$validator.validate()
        }, 0)
        this.calacInputSuffixWidth()
      },
      calacInputSuffixWidth() {
        if (this.$refs.inputSuffix) {
          this.inputSuffixWidth = this.$refs.inputSuffix.offsetWidth + 1
        }
      },
      updateInput(data) {
        this.$emit('input', data)
      },
    },
  }
</script>
<style lang="scss" scoped>
  .edit-input {
    position: absolute;
    left: 1px;
    border: none;
    top: 50%;
    transform: translateY(-50%);
    z-index: 50;
    display: flex;
    align-items: center;
    ::v-deep .el-input__inner {
      height: 100%;
      border: none;
    }
  }
  ::v-deep {
    .el-button--mini {
      padding: 0px 15px;
      font-size: 12px;
      border-radius: 3px;
      height: 100%;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    .el-button--info {
      background-color: #f5f7fa;
      border-color: #e4e7ed;
      color: #c0c4cc;
    }
    .el-input__suffix {
      position: absolute;
      height: 100%;
      right: 0px !important;
      top: 0;
      text-align: center;
      color: #c0c4cc;
      -webkit-transition: all 0.3s;
      transition: all 0.3s;
      pointer-events: none;
      z-index: 100;
      .has-clear-all {
        display: flex;
        align-items: center;
      }
    }
    .el-dialog__body {
      padding: 0;
      height: calc(100% - 120px);
      overflow-y: auto;
    }
    @media (max-width: 1280px) {
      .el-dialog {
        width: 96% !important;
        margin-top: 2vh !important;
      }
    }
    .el-dialog__wrapper {
      overflow: unset !important;
      &::-webkit-scrollbar {
        width: 0;
        background-color: transparent;
      }
    }

    .el-dialog {
      height: 90%;
      min-height: 400px;
    }
    @media (max-height: 960px) {
      .el-dialog__body .el-container {
        height: 100% !important;
      }
    }
    .el-divider--vertical {
      height: 100%;
    }
  }
  .el-input__inner[aria-invalid='true'] {
    border-color: #f56c6c;
  }
  .has-value {
    .el-select__tags {
      margin-right: 10px;
    }
  }
  .el-select__tags {
    background: #fff;
    margin-left: 1px;
  }

  .left-aside {
    border-right: 1px solid #eee;
    padding: 10px;
  }

  .org-tree {
    height: 440px;
    margin-top: 10px;
  }

  .middle-header {
    height: unset !important;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .search-item {
      display: flex;
      // width: 33.33%;
      margin-right: 12px;
      align-items: center;
    }
    .btn-wrap {
      line-height: 50px;
    }
  }

  .org-table {
    width: 100%;
  }

  .right-aside {
    border-left: 1px solid #eee;
  }

  .select-aside {
    border-left: 1px solid #eee;
  }

  .select-header {
    border-bottom: 1px solid #eee;
    height: 52px !important;
  }

  .select-header > span {
    padding: 10px 0;
    line-height: 53px;
  }
  .select-tree-div {
    height: calc(100% - 60px);
    overflow-y: auto;
    min-height: unset;
  }

  >>> .el-card__header {
    padding: 10px;
  }

  >>> .el-card__body {
    padding: 10px;
  }

  .org-find-card >>> .el-card__header {
    background: #f5f7fa;
  }

  >>> .el-main {
    padding: 0 20px !important;
  }

  .button-group {
    width: 70px;
    height: 170px;
    margin: 0px auto;
    position: relative;
    top: 50%;
    -webkit-transform: translateY(-50%);
    -moz-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    -o-transform: translateY(-50%);
    transform: translateY(-50%);
  }

  .button-group > button {
    display: block;
    margin: 8px 0;
  }
  >>> .el-input__suffix-inner {
    .el-button {
      span {
        display: flex;
        align-items: center;
      }
    }
  }
</style>
