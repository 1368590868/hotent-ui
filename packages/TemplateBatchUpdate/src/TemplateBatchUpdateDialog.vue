<template>
  <el-dialog
    v-if="dialogFormVisible"
    :title="title"
    :visible.sync="dialogFormVisible"
    :close-on-click-modal="false"
    width="30%"
    destroy-on-close
  >
    <el-form
      v-form
      data-vv-scope="custom-form"
      label-width="100px"
      style="width:100%;"
      name="online-form"
      :model="updateData"
    >
      <el-form-item
        v-for="(item, index) in listForm"
        :key="index"
        :label="item.desc"
      >
        <template v-if="item.outType == 'input'">
          <ht-input
            v-model="updateData[item.name]"
            style="width: 95%"
            :validate="{ required: item.isRequired }"
          ></ht-input>
        </template>
        <template v-if="item.outType == 'number'">
          <ht-input
            v-model="updateData[item.name]"
            style="width: 95%"
            type="number"
            :validate="{ required: item.isRequired }"
          ></ht-input>
        </template>
        <template v-if="item.outType == 'data'">
          <ht-date
            v-model="updateData[item.name]"
            style="width: 95%"
            :validate="{ required: item.isRequired }"
          ></ht-date>
        </template>
        <template v-if="item.outType == 'select'">
          <ht-select
            v-model="updateData[item.name]"
            :validate="{ required: item.isRequired }"
            model-name="updateData[item.name]"
            placeholder=""
            :ganged="item.ganged"
            :multiple="false"
            :filterable="false"
            :allow-create="false"
            permission="w"
            :selectlist="item.selectData"
            style="width: 95%"
          >
            <span slot="labeldesc">
              {{ $t('ht.templateBatchUpdateDialog.string') }}
            </span>
          </ht-select>
        </template>
        <template v-if="item.outType == 'dialog'">
          <ht-custom-dialog
            v-model="updateData[item.name]"
            :validate="{ required: item.isRequired }"
            :model-name="`updateData.${item.name}`"
            :custdialog="item.custdialog"
            permission="w"
            style="width: 95%"
          ></ht-custom-dialog>
        </template>
        <template v-else-if="item.outType == 'user'">
          <ht-user-selector-input
            v-model="updateData[item.name]"
            style="width: 95%"
            :validate="{ required: item.isRequired }"
            :select-current="item.selectCurrent"
            :single="item.single"
            :append-to-body="true"
            :config="item.bindConfig"
          />
        </template>
        <template v-else-if="item.outType == 'org'">
          <ht-org-selector-input
            v-model="updateData[item.name]"
            :select-current="item.selectCurrent"
            :single="item.single"
            :append-to-body="true"
            :config="item.bindConfig"
          />
        </template>
        <template v-else-if="item.outType == 'post'">
          <ht-post-selector-input
            v-model="updateData[item.name]"
            :append-to-body="true"
            :config="item.bindConfig"
          />
        </template>
        <template v-else-if="item.outType == 'role'">
          <ht-role-selector-input
            v-model="updateData[item.name]"
            :append-to-body="true"
            :config="item.bindConfig"
          />
        </template>
        <template v-else-if="item.outType == 'job'">
          <ht-job-selector-input
            v-model="updateData[item.name]"
            :append-to-body="true"
            :config="item.bindConfig"
          />
        </template>
        <template v-else-if="item.outType == 'dem'">
          <ht-dimension-selector-input
            v-model="updateData[item.name]"
            :append-to-body="true"
            :config="item.bindConfig"
          />
        </template>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">
        {{ $t('ht.common.cancle') }}
      </el-button>
      <el-button type="primary" @click="onConfirm">
        {{ $t('ht.common.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
  import utils from '@/utils.js'
  export default {
    name: 'HtTemplateBatchUpdateDialog',
    data() {
      return {
        dialogFormVisible: false,
        listForm: [],
        updateData: {},
        title: '',
        data: {},
      }
    },
    mounted() {},
    methods: {
      onConfirm() {
        const me_ = this
        utils
          .validateForm(this, 'custom-form')
          .then(() => {
            let confirmData = JSON.parse(JSON.stringify(me_.updateData))
            Object.keys(me_.data).forEach((key) => {
              if (!confirmData.hasOwnProperty(key)) {
                confirmData[key] = me_.data[key]
              }
            })
            me_.dialogFormVisible = false
            me_.$emit('onConfirm', confirmData)
          })
          .catch(() => {
            me_.$message.error(me_.$t('ht.templateBatchUpdateDialog.errorMsg'))
          })
      },
      closeDialog() {
        this.dialogFormVisible = false
      },
      showDialog(title, data) {
        Object.assign(this.$data, this.$options.data())
        this.dialogFormVisible = true
        this.listForm = data
        this.title = title
      },
    },
  }
</script>

<style scoped></style>
