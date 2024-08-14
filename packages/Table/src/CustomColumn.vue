<template>
  <el-dialog
    :visible.sync="visible"
    width="700px"
    custom-class="custom-column__dialog"
    append-to-body
    :before-close="customColumnDialogCancel"
  >
    <template slot="title">
      <ht-h3 inline>{{ $t('ht.table.customColumn') }}</ht-h3>
      <span class="custom-column__desc">
        {{ $t('ht.table.customColumnDesc') }}
      </span>
    </template>
    <draggable
      v-model="currentCustomColumns"
      class="el-select-dropdown__list"
      tag="ul"
      v-bind="dragOptions"
      handle=".custom-column__handle"
      draggable=".draggable_disable"
    >
      <transition-group type="transition" name="flip-list">
        <li
          v-for="(column, index) in currentCustomColumns"
          :key="column.key"
          :class="[
            'el-select-dropdown__item',
            index == currentCustomColumns.length - 1 ? '' : 'draggable',
          ]"
        >
          <div>
            <div class="column-name__head">
              <el-checkbox
                v-model="column.checked"
                :disabled="column.required"
                class="column-checked"
              ></el-checkbox>
            </div>
            <div
              :class="[
                'column-name__container',
                index == currentCustomColumns.length - 1
                  ? ''
                  : 'custom-column__handle',
              ]"
              @click="handleNameClick(column)"
            >
              <div
                class="column-name__progress"
                :style="progressWidth(column.width)"
              >
                <ht-icon name="sort" class="column-name__sort" />
                <span>{{ column.value }}</span>
              </div>
            </div>
            <div class="column-name__tail">
              <span v-if="column.required" class="column-name__required">
                {{ $t('ht.table.required') }}
              </span>
              <span>{{ $t('ht.table.width') }}</span>
              <input v-model="column.width" type="text" />
              <span>px</span>
            </div>
          </div>
        </li>
      </transition-group>
    </draggable>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="customColumnDialogReset">
        {{ $t('ht.table.restoreDefault') }}
      </el-button>
      <el-button type="primary" size="small" @click="customColumnDialogSure">
        {{ $t('ht.common.confirm') }}
      </el-button>
      <el-button size="small" @click="customColumnDialogCancel">
        {{ $t('ht.common.cancle') }}
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
  import utils from '@/utils.js'
  import { encode, decode } from '@/util/base64'
  const draggable = require('vuedraggable')

  export default {
    name: 'CustomColumn',
    components: { draggable },
    props: {
      customColumns: {
        type: Array,
        default: () => {
          return null
        },
      },
      visible: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        customColumnsHashCode: null,
        currentCustomColumns: null,
        storageCustomColumns: null,
      }
    },
    computed: {
      dragOptions() {
        return {
          animation: 0,
          group: 'description',
          disabled: false,
          ghostClass: 'ghost',
        }
      },
      progressWidth() {
        return (width) => {
          return width == 'auto'
            ? { width: '100%' }
            : { width: `${(width / 500) * 100}%` }
        }
      },
    },
    watch: {
      visible: function(newVal) {
        if (newVal) {
          this.initialCurrentCustomColumn()
        } else {
          this.currentCustomColumns = null
          this.storageCustomColumns = null
        }
      },
    },
    mounted() {
      setTimeout(() => {
        this.initialCurrentCustomColumn()
        this.applyCustomColumn()
      }, 10)
    },
    methods: {
      handleNameClick(column) {
        if (!column.required) {
          column.checked = !column.checked
        }
      },
      getCustomColumnsHashCode() {
        if (
          !this.customColumnsHashCode &&
          this.customColumns &&
          this.customColumns.length > 0
        ) {
          const keys = this.customColumns.reduce((m, n) => m.concat(n.key), [])
          // 获取当前自定义列表项的hashCode
          this.customColumnsHashCode = utils.hashCode(keys.join(','))
        }
      },
      // 自定义列表项确定按钮
      customColumnDialogSure() {
        this.applyCustomColumn()
        // 同步选中状态到localStorage中
        if (this.customColumnsHashCode) {
          this.setLocalStorage(
            this.customColumnsHashCode,
            this.currentCustomColumns
          )
        }
        this.$emit('update:visible', false)
      },
      // 自定义列表项取消按钮
      customColumnDialogCancel() {
        this.$emit('update:visible', false)
      },
      // 自定义列恢复默认
      customColumnDialogReset() {
        this.currentCustomColumns.forEach((item) => {
          if (!item.checked) item.checked = !item.checked
        })
      },
      // 初始化自定义列表项
      initialCurrentCustomColumn() {
        // 1.根据当前列构建storage存储hash
        this.getCustomColumnsHashCode()
        // 2.通过hash获取localStorage中的设置
        if (this.customColumnsHashCode) {
          this.currentCustomColumns = this.getLocalStorage(
            this.customColumnsHashCode
          )
        }
        // 3.没有localStorage时，复制一份传入的数据
        if (!this.currentCustomColumns) {
          this.currentCustomColumns = [...this.customColumns]
        }
      },
      // 将自定义列表项应用到当前表格、自定义列表项数组中
      applyCustomColumn() {
        if (
          !this.currentCustomColumns ||
          this.currentCustomColumns.length == 0
        ) {
          return
        }
        this.$emit('apply-custom-column', [this.currentCustomColumns])
      },

      // 从localStorage中获取用于存放自定义列表项的对象
      getObjectFromLocalStorage() {
        if (localStorage) {
          let customColumnSetting = localStorage.getItem('customColumnSetting')
          if (!customColumnSetting) {
            customColumnSetting = '{}'
          }
          /* eslint-disable */
          try {
            customColumnSetting = JSON.parse(customColumnSetting)
          } catch (e) {}
          /* eslint-enable */
          if (!customColumnSetting || typeof customColumnSetting != 'object') {
            customColumnSetting = {}
          }
          return customColumnSetting
        }
        return null
      },
      setLocalStorage(key, value) {
        let customColumnSetting = this.getObjectFromLocalStorage()
        if (customColumnSetting) {
          customColumnSetting[key] = encode(JSON.stringify(value))
          localStorage.setItem(
            'customColumnSetting',
            JSON.stringify(customColumnSetting)
          )
        }
      },
      getLocalStorage(key) {
        let customColumnSetting = this.getObjectFromLocalStorage()
        if (customColumnSetting) {
          const result = customColumnSetting[key]
          if (result) {
            return JSON.parse(decode(result))
          }
        }
        return null
      },
    },
  }
</script>
<style lang="scss" scoped>
  ::v-deep {
    .custom-column__dialog {
      .el-dialog__header {
        .custom-column__desc {
          margin-left: 10px;
          color: $base-color-gray;
        }
        .el-dialog__headerbtn {
          top: 16px;
        }
      }

      .el-dialog__body {
        @include base-scrollbar;

        padding: 10px 20px;
        max-height: 800px;
        overflow-y: auto;

        .el-select-dropdown__item {
          padding: 0;
          cursor: default;
          box-sizing: border-box;
          border: 1px solid #ddd;
        }

        .el-select-dropdown__item ~ .el-select-dropdown__item {
          border-top-width: 0;
        }

        .column-name__head {
          display: inline-block;
          padding: 0 12px;
          box-sizing: border-box;
          border: 1px solid #ddd;
          border-left-width: 0;
          border-top-width: 0;
          border-bottom-width: 0;
        }

        .column-name__container {
          width: 400px;
          display: inline-block;
          cursor: pointer;
          position: relative;

          .column-name__progress {
            width: 30%;
            box-sizing: border-box;
            background: #f1f1f1;
            max-width: 400px;
            border-right: 1px solid #ddd;
          }

          .column-name__sort {
            visibility: hidden;
            margin: 0 5px;
            cursor: move;
          }

          span {
            color: #777;
            font-size: 13px;
            font-weight: bold;
          }

          &.custom-column__handle:hover .column-name__sort {
            // visibility: inherit;
          }
        }

        .column-name__tail {
          display: flex;
          float: right;
          align-items: center;
          justify-content: flex-end;
          input,
          span {
            margin-right: 5px;
            font-size: 13px;
            color: $base-color-gray;
          }

          .column-name__required {
            margin-right: 40px;
          }

          input {
            width: 50px;
            height: 16px;
            border: 1px solid transparent;
            border-radius: 2px;
          }

          input:focus {
            outline: none;
            border-color: $base-color-blue;
            box-shadow: 0 0 5px $base-color-blue;
          }
        }
      }
    }
  }
</style>
