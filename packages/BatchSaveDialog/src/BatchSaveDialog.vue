<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :before-close="handleClose"
    :close-on-click-modal="false"
    :append-to-body="true"
    top="6vh"
    class="manage-dialog__wrap"
  >
    <batch-save-dialog-show-detail
      v-if="dialogVisible"
      ref="customDialogShowDetail"
      :alias="alias"
      :custom-dialog="customDialog"
      @orgRowClick="orgRowClick"
    />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSave">确 定</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { Message } from "element-ui";
import BatchSaveDialogShowDetail from "./BatchSaveDialogShowDetail.vue";
const { Base64 } = require('js-base64')

export default {
  name: 'HtBatchSaveDialog',
  components: { BatchSaveDialogShowDetail },
  props: {
    custdialog: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      customDialogPostParam: [], //为REST接口且请求类型是POST，条件字段是固定值的参数
      customDialogGetUrl: "", //为REST接口且请求类型是GET，条件字段是固定值的请求地址
      selectionRadio: [], //ht-table列表单选选择的数据
      textRadio: "", //ht-table列表数据的单选按钮
      selectable: true, //表示ht-table列表第一列是否显示复选框
      isShowSearch: false, //是否显示高级搜索
      nopagination: false, //是否隐藏分页组件，false：显示，true：隐藏
      dialogVisible: false, //是否显示对话框
      tableData: [], //ht-table列表数据
      pageResult: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      //自定义对话框的配置
      customDialog: {},
      //自定义对话框的别名
      alias: "",
      settingData:{},
      viewRow:{},
      title:"批量新增"
    }
  },
  methods: {
    //显示对话框
    showDialog(param) {
      if (!this.alias){
        Message.error("请先配置对话框");
        return
      }
      this.viewRow = param
      this.customDialogPostParam = []; //清空为REST接口且请求类型是POST，条件字段是固定值的参数
      this.customDialogGetUrl = ""; //清空为REST接口且请求类型是GET，条件字段是固定值的请求地址
      this.selectionRadio = []; //清空ht-table列表单选选择的数据
      this.textRadio = ""; //清空ht-table列表数据单选按钮的选中状态
      this.isShowSearch = false; //不显示高级搜索

      let url = '${form}/form/customDialog/v1/getByAlias?alias=' + this.alias
      this.$requestConfig.request({
        url: url,
        method: 'get'
      }).then((customDialog) => {
        //格式化对话框的显示字段、返回字段、条件字段、排序字段
        customDialog.displayfield = JSON.parse(customDialog.displayfield)
        for (let i = 0; i < customDialog.displayfield.length; i++) {
          customDialog.displayfield[i].field = customDialog.displayfield[i].field.toLowerCase()
        }
        customDialog.resultfield = JSON.parse(customDialog.resultfield)
        customDialog.sortfield = JSON.parse(customDialog.sortfield)
        customDialog.conditionfield = JSON.parse(customDialog.conditionfield)
        this.customDialog = customDialog
        setTimeout(() => {
          this.dialogVisible = true;
        })
      })
    },
    //点击列表某一条数据时触发
    orgRowClick(row) {
      this.selectionRadio = [row];
    },
    //确定对话框
    handleSave() {
      let elTable = this.$refs.customDialogShowDetail.$refs.htTable;
      if (elTable && elTable.$refs.htTable) {
        elTable = elTable.$refs.htTable;
      }
      //多选
      if (
        elTable &&
        elTable.selection &&
        elTable.selection.length == 0 &&
        this.customDialog.selectNum === -1
      ) {
        Message.error("请至少选择一条数据");
        return;
      }
      //单选
      if (this.selectionRadio == 0 && this.customDialog.selectNum === 1) {
        Message.error("请至少选择一条数据");
        return;
      }
      if (this.customDialog.selectNum === 1) {
        this.viewRow['data'] = this.selectionRadio;
      } else {
        this.viewRow['data'] = elTable.selection;
      }
      this.$requestConfig
        .saveBatchSave(this.viewRow)
        .then((res) => {
          if (res.state) {
            this.$message({
              type: 'success',
              message: res.message,
            })
            this.$emit('onConfirm')
          }
          this.dialogVisible = false;
        })
    },
    //关闭对话框
    handleClose() {
      this.dialogVisible = false;
    }
  },
  watch:{
    custdialog: {
      handler(val) {
        if (val) {
          this.settingData = JSON.parse(Base64.decode(val))
        }
        if (this.settingData.custDialog.alias) {
          this.alias = this.settingData.custDialog.alias
        }
      },
      immediate: true,
      deep: true,
    },
  }
};
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0px;
}
</style>
