<template>
  <el-dialog
    :title="t('ht.addQueryStrategy.title')"
    :visible.sync="dialogVisible"
    width="60%"
    :before-close="handleClose"
  >
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item :label="t('ht.addQueryStrategy.strategyName')">
        <el-input
          v-model="form.strategyName"
          v-validate="'required'"
          size="mini"
        ></el-input>
      </el-form-item>

      <el-form-item :label="t('ht.addQueryStrategy.searchQuery')">
        <el-row v-for="(item, index) in form.querys" :key="index">
          <el-col :span="6">
            <el-select
              v-model="item.field"
              size="mini"
              clearable
              :placeholder="t('ht.common.select')"
              @change="changeField(item)"
            >
              <el-option
                v-for="(option, subIndex) in fieldOptions"
                :key="subIndex"
                :label="option.label"
                :value="option"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="item.operation"
              size="mini"
              clearable
              :placeholder="t('ht.common.select')"
              :disabled="
                item.field &&
                  item.field.options &&
                  item.field.options.length > 0
              "
            >
              <el-option
                v-for="(queryOP, subIndex) in queryOPs"
                :key="subIndex"
                :label="queryOP.label"
                :value="queryOP.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="9">
            <el-select
              v-if="
                item.field &&
                  item.field.options &&
                  item.field.options.length > 0
              "
              v-model="item.value"
              size="mini"
              clearable
              :placeholder="t('ht.common.select')"
            >
              <el-option
                v-for="(value, subIndex) in item.field.options"
                :key="subIndex"
                :label="value"
                :value="value"
              ></el-option>
            </el-select>

            <el-input
              v-else
              v-model="item.value"
              size="mini"
              placeholder="2019-10-21 - 2019-11-19"
            ></el-input>
          </el-col>
          <el-col :span="3">
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              circle
              @click="removeQuerys(item)"
            ></el-button>
          </el-col>
        </el-row>
        <el-link type="primary" :underline="false" @click="addQuerys">
          <i class="el-icon-plus"></i>
          {{ t('ht.addQueryStrategy.addSearchQuery') }}
        </el-link>
      </el-form-item>

      <el-form-item :label="t('ht.addQueryStrategy.isDefault')">
        <el-switch v-model="form.isDefault" size="mini"></el-switch>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="handleCancle">
        {{ t('ht.common.cancle') }}
      </el-button>
      <el-button size="mini" type="primary" @click="save">
        {{ t('ht.common.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
  import locale from '@/mixins/locale.js'
  export default {
    name: 'HtAddQueryStrategy',
    mixins: [locale],
    props: {
      fieldOptions: Array,
      dialogVisible: {
        type: Boolean,
        default: false,
      },
      tableCode: String,
    },

    data() {
      return {
        form: {
          querys: [{}],
          tableCode: this.tableCode,
        },
        queryOPs: [
          {
            label: this.t('ht.common.equal'),
            value: 'EQ',
          },
          {
            label: this.t('ht.addQueryStrategy.equalIgnoreCase'),
            value: 'EIC',
          },
          {
            label: this.t('ht.common.lessThan'),
            value: 'LT',
          },
          {
            label: this.t('ht.common.greaterThan'),
            value: 'GT',
          },
          {
            label: `${this.t('ht.common.lessThan')}${this.t(
              'ht.common.equal'
            )}`,
            value: 'LE',
          },
          {
            label: `${this.t('ht.common.greaterThan')}${this.t(
              'ht.common.equal'
            )}`,
            value: 'GE',
          },
          {
            label: this.t('ht.common.notEqual'),
            value: 'NE',
          },
          {
            label: this.t('ht.common.like'),
            value: 'LK',
          },
          {
            label: `${this.t('ht.common.left')}${this.t('ht.common.like')}`,
            value: 'LFK',
          },
          {
            label: `${this.t('ht.common.right')}${this.t('ht.common.like')}`,
            value: 'RHK',
          },
          {
            label: this.t('ht.common.isNull'),
            value: 'ISNULL',
          },
          {
            label: this.t('ht.common.notNull'),
            value: 'NOTNULL',
          },
          {
            label: this.t('ht.common.between'),
            value: 'BETWEEN',
          },
          {
            label: this.t('ht.common.in'),
            value: 'IN',
          },
        ],
      }
    },

    methods: {
      onSubmit: function() {},
      handleClose(done) {
        this.$confirm(
          `${this.t('ht.common.confirm')}${this.t('ht.common.close')}？`
        )
          .then(() => {
            done()
            this.$emit('queryStrategyCancle')
          })
          .catch(() => {})
      },
      handleCancle() {
        this.$emit('queryStrategyCancle')
      },
      save() {
        this.$validator.validateAll().then((validate) => {
          if (validate) {
            this.$emit('queryStrategySave', this.form)
          } else {
            this.$message.error(this.t('ht.addQueryStrategy.errorMsg'))
          }
        })
      },
      addQuerys() {
        this.form.querys.push({})
      },
      removeQuerys(item) {
        this.form.querys.remove(item)
      },
      changeField(item) {
        if (item.field.options && item.field.options.length > 0) {
          item.operation = 'EQ'
        }
        item.property = item.field.value
      },
    },
  }
</script>
<style lang="scss" scoped>
  div[aria-invalid='true'] ::v-deep .el-input__inner,
  div[aria-invalid='true'] ::v-deep .el-input__inner:focus {
    border-color: #f56c6c;
  }
  .el-row {
    margin-bottom: 10px;
  }
  .el-col {
    padding-left: 10px;
  }
</style>
