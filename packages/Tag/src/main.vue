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
    <el-select
      v-if="inputWriteable"
      ref="fuzzySearch"
      v-model="inputVal"
      v-validate="inputValidate"
      style="width: 100%"
      :size="inputSize"
      :filterable="filterable"
      :remote="filterable"
      :remote-method="remoteMethod"
      :multiple="multiple"
      clearable
      :name="inputName"
      @focus="focusSelectValue"
      @visible-change="visibleChange"
    >
      <div v-loading="loading">
        <el-option
          v-for="item in options"
          :key="item.id"
          :label="item.name"
          :value="item.name"
        ></el-option>
      </div>

      <div class="text-center">
        <a class="text-normal">
          <el-pagination
            layout="prev, pager, next"
            :page-size="pagination.pageSize"
            :pager-count="5"
            :current-page="pagination.page"
            :total="pagination.total"
            @current-change="currentChange"
          ></el-pagination>
        </a>
      </div>
      <div class="ht-tag__append">
        <el-button
          v-if="creatingTag"
          size="small"
          type="primary"
          plain
          style="width: 100%"
          @click="add"
        >
          {{ $t('ht.common.add') }}
        </el-button>
      </div>
      <template v-if="creatingTag" slot="empty">
        <el-button
          v-if="creatingTag"
          size="small"
          type="primary"
          style="width: 100%"
          plain
          @click="add"
        >
          {{ $t('ht.common.add') }}
        </el-button>
      </template>
    </el-select>
    <ht-field-tail
      :field-name="inputName"
      :readonly="!inputWriteable"
      :input-value="inputVal"
      :tag-format-value="tagValue"
    />
  </div>
</template>

<script>
  import permission from '@/mixins/permission.js'
  import linkage from '@/mixins/linkage.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'

  export default {
    name: 'HtTag',
    mixins: [permission, inputName, linkage, form],
    props: {
      value: String,
      filterable: {
        type: Boolean,
        default: false,
      },
      expand: {
        type: Boolean,
        default: false,
      },
      tagKey: String,
      multiple: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        options: [],
        pagination: {
          pageSize: 5,
          page: 1,
          total: 0,
        },
        loading: false,
        currentQuery: '',
        isExistTag: true,
      }
    },
    computed: {
      inputVal: {
        set(value) {
          if (value && this.multiple) {
            this.$emit('input', value.join(','))
          } else {
            this.$emit('input', value)
          }
        },
        get() {
          if (this.value && this.multiple) {
            return this.value.split(',')
          }
          return this.value
        },
      },
      tagValue() {
        return this.inputVal && this.inputVal.constructor == Array
          ? this.inputVal
          : this.inputVal && this.inputVal.constructor == String
          ? [this.inputVal]
          : []
      },
      creatingTag() {
        return this.expand && this.currentQuery !== '' && !this.isExistTag
      },
    },
    watch: {
      currentQuery: {
        handler(newVal) {
          if (this.options) {
            this.isExistTag = this.options.some((item) => item.name == newVal)
          } else {
            this.isExistTag = false
          }
        },
      },
    },
    mounted() {
      this.search()
    },
    methods: {
      focusSelectValue() {
        if (this.$refs.fuzzySearch.$refs.input) {
          this.$refs.fuzzySearch.$refs.input.blur = () => {
            this.currentQuery = ''
            this.search()
          }
        }
      },
      visibleChange(flag) {
        //单选时输入框关闭时重新搜索内容
        if (!flag && !this.multiple) {
          this.currentQuery = ''
          this.search()
        }
      },
      remoteMethod(query) {
        this.currentQuery = query
        let param = {
          pageBean: this.pagination,
          querys: [
            {
              property: 'type_key_',
              value: this.tagKey,
              group: 'query',
              operation: 'EQUAL',
              relation: 'AND',
            },
          ],
        }
        if (query) {
          param.querys.push({
            property: 'name_',
            value: query,
            group: 'query',
            operation: 'LIKE',
            relation: 'AND',
          })
        }
        this.loading = true
        this.$requestConfig
          .getTagList(param)
          .then((data) => {
            this.options = data.rows
            this.isExistTag = this.options.some(
              (item) => item.name == this.currentQuery
            )
            this.pagination = {
              pageSize: data.pageSize,
              page: data.page,
              total: data.total,
            }
          })
          .finally(() => {
            this.loading = false
          })
      },
      currentChange(page) {
        this.pagination.page = page
        this.remoteMethod(this.currentQuery)
      },
      add() {
        let param = {
          name: this.currentQuery,
          typeKey: this.tagKey,
        }
        this.$requestConfig
          .saveTag(param)
          .then((data) => {
            if (data.state) {
              this.$message({ type: 'success', message: '添加成功' })
              this.remoteMethod(this.currentQuery)
            } else {
              this.$message({ type: 'error', message: '添加失败' })
            }
          })
          .catch(() => {
            // this.$message({ type: 'error', message: '添加失败' })
          })
      },
      search() {
        let param = {
          pageBean: this.pagination,
          querys: [
            {
              property: 'type_key_',
              value: this.tagKey,
              group: 'query',
              operation: 'EQUAL',
              relation: 'AND',
            },
          ],
        }
        this.$requestConfig.getTagList(param).then((data) => {
          this.options = data.rows
          this.pagination = {
            pageSize: data.pageSize,
            page: data.page,
            total: data.total,
          }
        })
      },
    },
  }
</script>

<style lang="scss" scoped>
  .text-center {
    position: sticky;
    background: #fff;
    height: 30px;
    top: 0;
    z-index: 1;
    text-align: center;
  }
  div[aria-invalid='true'] {
    ::v-deep {
      .el-input__inner,
      .el-input__inner:focus {
        border-color: #f56c6c;
      }
    }
  }
  .ht-tag__append {
    text-align: center;
    padding: 5px 0;
  }
  .ht-tag__empty {
    background: #f5f7fa;
    text-align: center;
    margin: 5px 0;
    padding: 8px 0;
    cursor: pointer;
  }
</style>
