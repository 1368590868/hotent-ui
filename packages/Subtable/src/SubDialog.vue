<template>
  <div class="inputs" :style="{ display: 'inline-block', float: 'right' }">
    <el-button
      v-if="isShow || currentInitFillData == 'true'"
      type="text"
      size="mini"
      class="custom-dialog-btn"
      @click="showDialog"
    >
      <i
        style="line-height: 10px"
        :class="
          custdialog.icon
            ? 'el-input__icon ' + custdialog.icon
            : 'el-input__icon icon-department'
        "
        class="custom-dialog-icon"
      ></i>
      {{ custdialog.name }}
    </el-button>

    <el-dialog
      :visible.sync="customDialogShowList"
      :title="customDialog.name"
      :close-on-click-modal="false"
      :before-close="dialogCancel"
      append-to-body
      top="6vh"
      width="60%"
      @opened="afterOpen"
    >
      <el-container :style="style" style="overflow: auto">
        <!-- 组合对话框树 -->
        <el-aside
          v-if="customDialog.style == 2"
          v-show="treeShow"
          style="width: 23%"
        >
          <el-card>
            <div slot="header" class="clearfix">
              <span style="font-size: 16px">{{ leftTreeTitle }}</span>
            </div>
            <el-tree
              ref="combinationTree"
              :data="combinationTreeData"
              :props="defaultProps"
              :node-key="nodeKey"
              highlight-current
              :check-on-click-node="true"
              lazy
              :load="loadTree"
              @node-click="combiTreeClick"
            ></el-tree>
          </el-card>
        </el-aside>
        <el-divider
          v-if="customDialog.style == 2"
          direction="vertical"
        ></el-divider>
        <el-container>
          <el-header v-if="querysShow" class="middle-header">
            <div
              v-for="(condition, index) in conditionBind"
              :key="index"
              class="search-item"
            >
              <p style="font-size: 14px">{{ condition.comment }}:</p>
              <div v-if="condition.controllerType == '1'">
                <el-input
                  v-model="queryParams[index][condition.field]"
                  size="small"
                  style="width: 180px; padding: 10px 0; margin: 0 5px 0 5px"
                  clearable
                  :placeholder="placeholders[index]"
                  prefix-icon="el-icon-search"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </div>
              <div
                v-if="condition.controllerType == '2'"
                style="margin-right: 10px"
              >
                <el-radio
                  v-for="(itemR, $index1) in condition.config.options"
                  :key="$index1"
                  v-model="queryParams[index][condition.field]"
                  :label="itemR.key"
                >
                  {{ itemR.value }}
                </el-radio>
              </div>
              <div
                v-if="condition.controllerType == '3'"
                style="margin-right: 10px"
              >
                <ht-select
                  v-if="condition.config.choiceType == 'static'"
                  v-model="queryParams[index][condition.field]"
                  :placeholder="quickSearch"
                  :options="condition.config.options"
                ></ht-select>
                <ht-select
                  v-else
                  v-model="queryParams[condition.field]"
                  :placeholder="quickSearch"
                  :ganged="{
                    alias: condition.config.customQuery.alias,
                    valueBind: condition.config.customQuery.valueBind,
                    noInit: '',
                    labelBind: condition.config.customQuery.labelBind,
                    gangedBind: '{}',
                    bind: condition.config.bind,
                  }"
                  :multiple="false"
                  :filterable="false"
                  :allow-create="false"
                  :selectlist="[]"
                  :query-params="queryParams"
                />
              </div>
              <div
                v-if="condition.controllerType == '4'"
                style="margin-right: 10px"
              >
                <ht-tag
                  v-model="queryParams[index][condition.field]"
                  :tag-key="condition.config.tag"
                  :placeholder="quickSearch"
                  :filterable="condition.config.filterable"
                  :expand="condition.config.expand"
                />
              </div>
            </div>
            <div
              v-if="conditionBind && conditionBind.length > 0"
              class="btn-wrap"
            >
              <el-button
                style="margin-left: 20px"
                size="small"
                type="primary"
                icon="el-icon-search"
                @click="search(true)"
              >
                {{ $t('ht.common.search') }}
              </el-button>
              <el-button size="small" icon="el-icon-refresh" @click="reset">
                {{ $t('ht.common.reset') }}
              </el-button>
            </div>
          </el-header>
          <el-main style="padding: 0 20 0 20">
            <el-table
              ref="orgTable"
              :data="dialogData"
              stripe
              border
              class="org-table"
              size="medium"
              style="width: 100%"
              max-height="500px"
              @row-click="orgRowClick"
              @selection-change="orgTableSelection"
              @select="onTableSelect"
              @select-all="selectAll"
            >
              <el-table-column
                v-if="customDialog.selectNum != 1"
                type="selection"
                align="center"
                width="45"
                :selectable="selectable"
              ></el-table-column>
              <el-table-column
                v-if="customDialog.selectNum === 1"
                align="center"
                width="50"
              >
                <template slot-scope="scope">
                  <el-radio
                    v-model="undefineda"
                    :label="scope.$index"
                    class="textRadio"
                    @selection-change="orgTableSelection"
                    :disabled="selectable(scope.row)"
                  ></el-radio>
                </template>
              </el-table-column>
              <el-table-column
                type="index"
                width="50"
                align="center"
                :label="$t('ht.common.index')"
              ></el-table-column>
              <el-table-column
                v-for="(field,$index) in displayfield"
                :key="field.field"
                :show-overflow-tooltip="true"
                :prop="field.field"
                :label="field.comment"
                style="width: 100%"
              >
                <template slot-scope="scope">
                  <span v-if="field.formatterType == '1' && field.dateFormat">
                    {{ scope.row[field.field] | dateformat(field.dateFormat) }}
                  </span>
                  <span v-else-if="field.formatterType == '2' && field.formatterData.length">
                    {{ formatDictLabel(scope.row[field.field],$index) }}
                  </span>
                  <span v-else>{{scope.row[field.field]}}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-main>
          <el-footer>
            <el-row
              v-if="customDialog.needPage"
              type="flex"
              justify="end"
              style="padding-top: 15px; justify-content: space-between"
            >
              <el-button
                v-if="customDialog.style == 2"
                :icon="toggleBtn"
                size="mini"
                type="default"
                @click="toggleTree"
              ></el-button>
              <el-pagination
                small
                :current-page="pagination.page"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              ></el-pagination>
            </el-row>
          </el-footer>
        </el-container>
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button size="small" type="primary" @click="dialogConfirm">
          {{ $t('ht.common.confirm') }}
        </el-button>
        <el-button size="small" @click="dialogCancel">
          {{ $t('ht.common.cancle') }}
        </el-button>
      </span>
    </el-dialog>

    <el-dialog
      :visible.sync="customDialogShowTree"
      :title="customDialog.name"
      :close-on-click-modal="false"
      :before-close="dialogCancelTree"
      append-to-body
      top="6vh"
      width="40%"
    >
      <el-container :style="style" style="overflow: auto; min-height: 300px">
        <el-tree
          ref="tree"
          :data="props1"
          :props="defaultProps"
          :node-key="nodeKey"
          highlight-current
          :show-checkbox="customDialog.selectNum === -1"
          :check-on-click-node="true"
          :check-strictly="false"
          lazy
          :load="loadTree"
          style="width: 100%"
          @node-click="treeClick"
          @check-change="getChecked"
        ></el-tree>
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button size="small" type="primary" @click="dialogTreeConfirm">
          {{ $t('ht.common.confirm') }}
        </el-button>
        <el-button size="small" @click="dialogCancelTree">
          {{ $t('ht.common.cancle') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import { Message } from 'element-ui'
  import utils from '@/utils.js'
  import dialog from './dialog.js'
  import _ from 'lodash'

  export default {
    name: 'HtSubDialog',
    mixins: [dialog],
    props: {
      custdialog: {
        type: Object,
        default: () => {
          return {}
        },
      },
      initFillData: String,
      initFillDataType: String,
      relation: String,
      extendProp: {
        type: Object,
        default: () => {
          return {}
        },
      },
      maxRow: Number,
      newInitVersion: String,
      initBackFillData: {
        type: Array,
        default: () => {
          return []
        },
      },
    },
    data() {
      return {
        quickSearch: '', //填写提示
        conditionBind: [], //参数查询字段
        nodeKey: 'ID_', //树形数据父Id
        customDialogShowList: false,
        customDialogShowTree: false,
        style: '', //对话框宽高
        selectOrgs: null,
        config: null,
        displayfield: [], //显示字段
        customDialog: {},
        queryParam: '', //查询条件输入的值
        props1: [],
        showData: [],
        checkBoxDataAll: [], //选中对象的集合
        defaultProps: {
          children: 'children',
          label: 'label',
        },
        propsData: [],
        querysShow: false, //是否显示搜索框
        undefineda: '',
        isCurrentChange: false, //是否不执行 orgTableSelection方法
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
        },
        param: [], //绑定的表单字段
        treeList: [],
        displayField: {},
        queryParams: [],
        placeholders: [],
        oldselectOrgs: [],
        combinationTreeData: [],
        combiTreeDisplayField: [],
        combinationTreeQuerys: [],
        combinationRule: {},
        toggleBtn: 'el-icon-arrow-left',
        treeShow: true,
        transtionWidth: '25%',
        leftTreeTitle: '',
        isShow: true,
        currentInitFillData: 'false',
        fixedParams: {}, // 传过来的固定值
      }
    },
    watch: {
      props1: function() {
        //树形
        if (this.showData != undefined && this.showData.length > 0) {
          const this_ = this
          let data = []
          for (let i = 0; i < this.showData.length; i++) {
            data.push(this.showData[i])
          }
          setTimeout(() => {
            for (let i = 0; i < data.length; i++) {
              this_.$refs.tree.setChecked(data[i], true)
              this_.checkNode(data[i], this_)
            }
          }, 200)
        }
      },
    },
    mounted() {
      if (
        Object.keys(this.extendProp).length == 0 ||
        this.extendProp.initFillData
      ) {
        this.currentInitFillData = this.initFillData
      }
      let requestType = window.location.href.split('?')[0].split('/')
      let isDoneList = window.location.href.split('/')
      if (
        requestType[requestType.length - 1] == 'get' ||
        requestType[requestType.length - 2] == 'get' ||
        isDoneList[isDoneList.length - 1] == 'doneList'
      ) {
        this.isShow = false
      }
      // 此处加一个标识，新版本子表初始化时不走此逻辑
      if (
        this.currentInitFillData == 'true' &&
        this.newInitVersion !== 'true'
      ) {
        this.initTemplateData()
      }
    },
    methods: {
      selectAll(selection) {
        if (this.oldselectOrgs != null && selection.length > 0) {
          for (let x = 0; x < selection.length; x++) {
            if (this.indexArray(this.oldselectOrgs, selection[x]) === -1) {
              this.oldselectOrgs.push(selection[x])
            }
          }
          this.selectOrgs = _.cloneDeep(this.oldselectOrgs)
        } else {
          this.selectOrgs = _.cloneDeep(selection)
        }
      },
      checkNode(data, this_, pnode) {
        if (data.Pid) {
          let node = this_.$refs.tree.getNode(data.Pid)
          node.indeterminate = true
          if (node.data.Pid) {
            this_.$refs.tree.getNode(node.data.Pid).indeterminate = true
            this.checkNode(
              this_.$refs.tree.getNode(node.data.Pid).data,
              this_,
              this_.$refs.tree.getNode(node.data.Pid)
            )
          }
          if (!node.indeterminate) {
            node.indeterminate = true
          }
        } else if (pnode && !pnode.indeterminate) {
          pnode.indeterminate = true
        }
      },
      //回车查询
      searchEnterFun: function(e) {
        var keyCode = window.event ? e.keyCode : e.which
        if (keyCode == 13) {
          this.search()
        }
      },
      handleSizeChange: function(size) {
        this.isCurrentChange = true
        //每页下拉显示数据
        this.pagination.pageSize = size
        this.search()
      },
      handleCurrentChange: function(currentPage) {
        const this_ = this
        if (this.selectOrgs != undefined && this.selectOrgs.length > 0) {
          this.selectOrgs.forEach((row) => {
            let res = this_.indexArray(this_.checkBoxDataAll, row)
            if (res == -1) {
              this_.checkBoxDataAll.push(row)
            }
          })
        }
        this.isCurrentChange = true
        //点击第几页
        this.pagination.page = currentPage
        this.search()
      },
      checkList() {
        const this_ = this
        setTimeout(() => {
          //列表
          if (
            this_.checkBoxDataAll != undefined &&
            this_.checkBoxDataAll.length > 0
          ) {
            this_.checkBoxDataAll.forEach((row) => {
              let res = this_.indexArray(this_.dialogData, row)
              this_.undefineda = res
              if (res != -1) {
                this_.isCurrentChange = true
                this_.toggleRowSelection(res, true)
              }
            })
          }
        }, 300)
      },
      toggleRowSelection(res, val) {
        this.$refs.orgTable.toggleRowSelection(this.dialogData[res], val)
      },
      showDialog() {
        const this_ = this
        this.undefineda = ''
        //第二次点击子表回填对话框 第一次选中的数据不是选中状态
        if (this_.selectOrgs) {
          this_.selectOrgs.splice(0, this_.selectOrgs.length)
          this_.checkBoxDataAll.splice(0, this_.checkBoxDataAll.length)
        }
        var alias = this.custdialog.custDialog.alias
        this.getDialogByAlias(alias).then((customDialog) => {
          if (!customDialog || !customDialog.alias) {
            Message.error(
              this_.$t('ht.customDialog.errorMsg', { alias: alias })
            )
            return
          }
          if (customDialog.style == 1) {
            var displaylist = JSON.parse(customDialog.displayfield)
            this_.nodeKey = displaylist.id
          }
          if (customDialog.needPage && customDialog.requestType === 'POST') {
            let obj = {}
            this.getLastKeyByPath(obj, customDialog.pageKey, 1)
            this.getLastKeyByPath(obj, customDialog.pageSizeKey, 10)
            this.getLastKeyByPath(obj, customDialog.totalKey, true)
            const exp = utils.parseExp(customDialog.dataParam, obj, true)
            if (exp) {
              const params = JSON.parse(exp)
              if (params.pageBean) {
                this.pagination = {
                  ...params.pageBean,
                }
              }
            }
          }
          //对话框按表单字段查询（参数传入的）
          let bindList = this_.custdialog.custDialog.conditions
          this_.param = [] //绑定的表单字段
          if (bindList.length > 0) {
            bindList.forEach((ele) => {
              //绑定表单字段
              if (ele.defaultType == '3' && ele.bind) {
                let obj = {}
                obj.field = ele.field
                obj.bind = ele.bind
                obj.bindType = ele.bindType
                this_.param.push(obj)
              }
            })
          }
          //判断对话框查询是否有条件
          let userInputList = JSON.parse(customDialog.conditionfield)
          this_.quickSearch = '' //填写提示 placeholder
          this_.conditionBind = []
          let queryParams = []
          let placeholders = []
          if (userInputList.length > 0) {
            userInputList.forEach((ele) => {
              var obj = {}
              //条件查询参数（用户输入的） 文本框输入
              if (ele.defaultType == '1') {
                obj[ele.field] = ''
                queryParams.push(obj)
                this_.conditionBind.push(ele)
                placeholders.push(this_.$t('ht.common.enter') + ele.comment)
              }
              if (ele.defaultType == '2' && ele.defaultValue) {
                this_.fixedParams[ele.field] = ele.defaultValue
              }
            })
            this.$set(this, 'queryParams', queryParams)
            this.$set(this, 'placeholders', placeholders)
          }
          //判断是否显示条件查询输入框
          if (this_.quickSearch != '') {
            this_.querysShow = true
          } else {
            this_.querysShow = true
          }
          this_.quickSearch =
            this_.$t('ht.common.enter') +
            this.quickSearch +
            this_.$t('ht.common.search')
          this_.style = 'height:' + customDialog.height + 'px'
          if (window.screen.height && window.screen.height <= 900) {
            this.style = 'height:440px'
          }
          if (customDialog.style == 0 || customDialog.style == 2) {
            //列表
            this_.customDialogShow({ alias: alias, customDialog: customDialog })
          } else if (customDialog.style == 1) {
            //树形
            this_.pageParam = { alias: alias, customDialog: customDialog }
            this_.customDialog = customDialog
            let param = {}
            this_.conditionfieldTree = []
            //判断是否存在条件
            if (customDialog.conditionfield) {
              this_.conditionfieldTree = JSON.parse(customDialog.conditionfield)
              if (this_.conditionfieldTree.length > 0) {
                for (let i = this_.conditionfieldTree.length - 1; i >= 0; i--) {
                  //判断条件字段是否是动态传入（defaultType：4：动态传入，2：固定值 ）
                  if (this_.conditionfieldTree[i].defaultType == '4') {
                    param[this_.conditionfieldTree[i].field] =
                      this_.conditionfieldTree[i].comment
                  }
                }
              }
            }
            //有动态传入的字段
            if (JSON.stringify(param) != '{}') {
              this_.dialogVisible = true
            } else {
              //无动态传入的字段
              this_.customDialogTreeShow(this_.pageParam)
            }
          }
        })
      },
      getLastKeyByPath(obj, path, value) {
        if (!obj || !path || path.constructor != String) {
          return
        }
        if (!/^\w?.*[\w|\]]$/.test(path)) {
          return
        }
        let pathAry = path.split('.')
        if (pathAry.length == 1) {
          obj[path] = value
        } else {
          let length = pathAry.length
          obj[pathAry[length - 1]] = value
        }
      },
      //判断数据是否包含某个对象，并返回数据包含对象的下标
      indexArray(array, item) {
        if (array.length == 0) {
          return -1
        }
        for (let i = 0; i < array.length; i++) {
          if (JSON.stringify(array[i]) == JSON.stringify(item)) {
            return i
          }
        }
        return -1
      },
      //点击列表某一个复选框时触发
      onTableSelect(rows, row) {
        this.isCurrentChange = false
        //判断点击列表数据时复选框是否勾选  selected：true不勾选，false勾选
        let selected =
          this.selectOrgs &&
          this.selectOrgs.length > 0 &&
          this.indexArray(this.selectOrgs, row) !== -1
        if (selected) {
          this.isCurrentChange = true
          let res = this.indexArray(this.selectOrgs, row)
          this.selectOrgs.splice(res, 1)
        }
      },
      //点击列表某一条数据时触发
      orgRowClick(row, column, event) {
        if (this.customDialog.selectNum === 1) {
          event.currentTarget &&
            event.currentTarget.children[0] &&
            event.currentTarget.children[0].children[0] &&
            event.currentTarget.children[0].children[0].children[0] &&
            event.currentTarget.children[0].children[0].children[0].dispatchEvent(
              new Event('click')
            )
          this.selectOrgs = []
          this.selectOrgs.push(row)
          let curIndex = this.indexArray(this.dialogData, row)
          this.undefineda = curIndex
        } else if (this.customDialog.selectNum != 1) {
          this.isCurrentChange = false
          //判断点击列表数据时复选框是否勾选  selected：true不勾选，false勾选
          let selected =
            this.selectOrgs &&
            this.selectOrgs.length > 0 &&
            this.indexArray(this.selectOrgs, row) !== -1
          if (selected) {
            this.isCurrentChange = true
            let res = this.indexArray(this.selectOrgs, row)
            this.selectOrgs.splice(res, 1)
          }
          this.$refs.orgTable.toggleRowSelection(row)
        }
      },
      //列表复选框有改变时触发
      orgTableSelection(selection) {
        //全选的情况特殊处理(为了与原本功能逻辑不冲突,先复制一份旧的选中数据.然后拿到全选事件中去计算)
        this.oldselectOrgs = _.cloneDeep(this.selectOrgs)
        //多选
        if (this.customDialog.selectNum != 1 && !this.isCurrentChange) {
          if (selection && selection.length > 0) {
            if (
              selection.length == 1 &&
              (!this.selectOrgs || this.selectOrgs.length == 0)
            ) {
              this.selectOrgs = selection
            } else if (
              (!this.selectOrgs || this.selectOrgs.length == 0) &&
              selection.length > 1
            ) {
              if (!this.selectOrgs) {
                this.selectOrgs = []
              }
              for (let i = selection.length - 1; i >= 0; i--) {
                this.selectOrgs.push(selection[i])
              }
            } else if (this.isCurrentChange && selection.length >= 10) {
              if (!this.selectOrgs) {
                this.selectOrgs = []
              } else {
                for (let u = this.selectOrgs.length - 1; u >= 0; u--) {
                  let res = this.indexArray(selection, this.selectOrgs[u])
                  if (res != -1) {
                    this.selectOrgs.splice(res, 1)
                  }
                }
              }
              for (let i = 0; i < selection.length; i++) {
                this.selectOrgs.push(selection[i])
              }
            } else {
              for (let i = selection.length - 1; i >= 0; i--) {
                this.selectOrgs.push(selection[i])
                break
              }
            }
          }
        }
      },
      dialogConfirm() {
        if (!this.selectOrgs || this.selectOrgs.length == 0) {
          this.$message.error(this.$t('ht.subTable.errorMsg'))
          return
        }
        this.queryParam = ''
        this.customDialogShowList = false
        this.syncInputValue()
      },
      //重置
      reset() {
        this.queryParams.forEach((paramObj) => {
          for (let key in paramObj) {
            this.queryParams[key] = ''
          }
        })
        //组合树重置
        if (this.$refs.combinationTree) {
          let nodes = this.$refs.combinationTree.store.nodesMap
          for (let key in nodes) {
            nodes[key].expanded = false
          }
        }
        this.combinationTreeQuerys.splice(0)
        this.search(true)
      },
      //查询
      search(resetPagintion) {
        let querys = [] //查询条件
        let queryFilter = {}
        if (JSON.stringify(this.pagination) == '{}') {
          this.pagination = { page: 1, pageSize: 10, showTotal: 'true' }
        }
        let pageBean = { pageBean: this.pagination }
        if (resetPagintion) {
          pageBean.pageBean = { page: 1, pageSize: 10, showTotal: 'true' }
        }
        //用户输入的
        if (this.queryParams.length != 0 && this.queryParams[0] != '') {
          this.conditionBind.forEach((item, index) => {
            if (this.queryParams[index][item.field]) {
              querys.push({
                property: item.field,
                value: this.queryParams[index][item.field],
                group: 'main',
                operation: 'LIKE',
                relation: 'AND',
              })
            }
          })
        }
        //参数传入的查询拼接
        if (this.param) {
          const pInst = utils.getOnlineFormInstance(this)
          this.param.forEach((item) => {
            querys.push({
              property: item.field,
              // value: utils.getValueByPath(pInst, item.bind),
              value:
                item.bindType === 2
                  ? item.bind
                  : utils.getValueByPath(pInst, item.bind),
              group: 'main',
              operation: 'LIKE',
              relation: 'AND',
            })
          })
        }
        //来自组合对话框的
        if (
          this.combinationTreeQuerys &&
          this.combinationTreeQuerys.length != 0
        ) {
          for (let i = 0; i < this.combinationTreeQuerys.length; i++) {
            querys.push(this.combinationTreeQuerys[i])
          }
        }
        // post restful接口，并且配置了post参数。则以post参数作为请求参数
        if (
          this.customDialog.dsType != 'dataSource' &&
          this.customDialog.requestType == 'POST' &&
          this.customDialog.dataParam &&
          this.customDialog.dataParam.constructor == String
        ) {
          let param = this.param
          // 构建上下文数据对象
          let ctx = {}
          //根据路径构建想要的分页属性
          let obj = {}
          this.getLastKeyByPath(
            obj,
            this.customDialog.pageKey,
            pageBean.pageBean.page
          )
          this.getLastKeyByPath(
            obj,
            this.customDialog.pageSizeKey,
            pageBean.pageBean.pageSize
          )
          this.getLastKeyByPath(
            obj,
            this.customDialog.totalKey,
            pageBean.pageBean.total
          )
          querys &&
            querys.length &&
            querys.forEach((element) => {
              ctx[element.property] = element.value
            })
          const queryParamMap = this.getSearchValueByKey()
          queryParamMap.pageSize = pageBean.pageBean.pageSize
          queryParamMap.page = pageBean.pageBean.page
          queryParamMap.total = pageBean.pageBean.total
          // 添加用户id 岗位id 组织id
          try {
            if (this.$requestConfig.getUserId()) {
              ctx.userId = this.$requestConfig.getUserId()
            }
            if (this.$requestConfig.getOrgId()) {
              ctx.orgId = this.$requestConfig.getOrgId()
            }
            if (this.$requestConfig.getPostId()) {
              ctx.postId = this.$requestConfig.getPostId()
            }
          } catch (e) {
            console.log(this.$t('ht.customDialog.getIdError'), e)
          }
          const exp = utils.parseExp(this.customDialog.dataParam, {
            ...ctx,
            ...queryParamMap,
            ...this.fixedParams,
          })
          try {
            param = JSON.parse(exp)
            const dataParam = JSON.parse(this.customDialog.dataParam)
            const queryList =
              dataParam &&
              dataParam.querys &&
              dataParam.querys.map((item) => {
                const bindKey =
                  item.value && item.value.replace('${', '').replace('}', '')
                return {
                  ...item,
                  value: queryParamMap[bindKey] || ctx[bindKey] || '',
                }
              })
            param.querys = queryList
            if (this.customDialog.needPage) {
              param.pageBean = obj
            } else {
              param.pageBean.pageSize = -1
            }

            //构造请求的参数
            let requestParam = {
              pageBean: param,
              queryUrl: this.customDialog.queryUrl,
              requestType: this.customDialog.requestType,
              dsType: this.customDialog.dsType,
              listKey: this.customDialog.listKey,
              pageKey: this.customDialog.pageKey,
              pageSizeKey: this.customDialog.pageSizeKey,
              totalKey: this.customDialog.totalKey,
            }
            this.getListJson(requestParam).then(() => {
              this.checkList()
            })
          } catch (e) {
            this.$message.error(
              `${this.$t('ht.customDialog.postRequestParamError')}${param}`
            )
          }
        } else {
          if (querys.length > 0) {
            queryFilter = { pageBean: pageBean.pageBean, querys }
            this.customDialog.pageBean = queryFilter
            this.getListJson(this.customDialog).then(() => {
              this.checkList()
            })
          } else {
            this.customDialog.pageBean = pageBean
            this.getListJson(this.customDialog).then(() => {
              this.checkList()
            })
          }
        }
      },
      getSearchValueByKey() {
        let queryParamsObj = {}
        if (this.queryParams.length > 0) {
          queryParamsObj = this.conditionBind.reduce((pre, cur, index) => {
            pre[cur.field] = this.queryParams[index][cur.field]
            return pre
          }, {})
        }
        return queryParamsObj
      },
      async doQuery(param) {
        let paramLoadData = []
        const pInst = utils.getOnlineFormInstance(this)
        //获取关联查询绑定的表单参数
        for (let i = 0; i < param.conditionfield.length; i++) {
          if (param.conditionfield[i].fieldPath != '') {
            let bindVal = utils.getValueByPath(
              pInst,
              param.conditionfield[i].fieldPath,
              null
            )
            let obj = { key: param.conditionfield[i].field, value: bindVal }
            paramLoadData.push(obj)
          }
        }

        let queryUrl =
          param.dsType == 'dataSource'
            ? '${form}/form/customQuery/v1/doQuery?alias=' +
              param.alias +
              '&page=1'
            : param.url
        let requestMethod = 'POST'
        //如果关联数据列表查询数据不是数据源则请求方法为restful配置的请求方式
        if (param.dsType != 'dataSource') {
          requestMethod = param.requestType
        }
        //查询数据
        this.$requestConfig
          .request({
            url: queryUrl,
            method: requestMethod,
            data: paramLoadData,
          })
          .then((res) => {
            //判断是否有关联查询数据返回
            if (res.data.rows.length > 0) {
              //获取关联查询返回的表单参数
              for (let io = 0; io < param.resultfield.length; io++) {
                if (param.resultfield[io].fieldPath != '') {
                  let val = ''
                  for (let j = 0; j < res.data.rows.length; j++) {
                    if (res.data.rows[j][param.resultfield[io].field]) {
                      val =
                        val +
                        res.data.rows[j][param.resultfield[io].field] +
                        ','
                    }
                  }
                  val = val.substring(0, val.length - 1)
                  let pathArr = param.resultfield[io].fieldPath.split('.')
                  if (pathArr.length == 3) {
                    //主表
                    utils.setValueByPath(
                      pInst,
                      param.resultfield[io].fieldPath,
                      val,
                      null
                    )
                  } else if (pathArr.length == 4) {
                    //子表
                    let subData = pInst.data[pathArr[1]][pathArr[2]]
                    if (subData.length == 0) {
                      //子表没数据的情况
                      let subTabName = pathArr[2].replace('sub_', '')
                      //得到子表的所有字段
                      let subInitData =
                        pInst.data[pathArr[1]].initData[subTabName] || {}
                      //把数组里面的值为 null 转换为空字符串
                      let str = JSON.stringify(subInitData).replace(
                        /null/g,
                        '""'
                      )
                      let subData = JSON.parse(str)
                      for (var key in subData) {
                        //点添加时判断要新增子表记录中的孙表是否有值
                        if (
                          key.indexOf('sub_') == 0 &&
                          subData[key].length > 0
                        ) {
                          subData[key] = [] //有则清空
                        }
                        //点添加时判断要新增子表记录中的字段是否有值
                        if (subData[key]) {
                          subData[key] = '' //有则清空
                        }
                      }
                      //新增一条数据
                      pInst.data[pathArr[1]][pathArr[2]].push(subData)
                      //对话框关联查询返回的值赋值给绑定的字段
                      utils.setValueByPath(
                        pInst,
                        param.resultfield[io].fieldPath,
                        val,
                        0
                      )
                    } else {
                      //子表有数据的情况
                      for (let p = 0; p < subData.length; p++) {
                        //对话框关联查询返回的值赋值给绑定的字段
                        utils.setValueByPath(
                          pInst,
                          param.resultfield[io].fieldPath,
                          val,
                          p
                        )
                      }
                    }
                  }
                }
              }
            } else {
              //没有返回的值则清空
              //获取关联查询返回的表单参数
              for (let iop = 0; iop < param.resultfield.length; iop++) {
                if (param.resultfield[iop].fieldPath != '') {
                  let pathArr = param.resultfield[iop].fieldPath.split('.')
                  if (pathArr.length == 3) {
                    //主表
                    //赋值给绑定的字段
                    utils.setValueByPath(
                      pInst,
                      param.resultfield[iop].fieldPath,
                      '',
                      null
                    )
                  } else if (pathArr.length == 4) {
                    //子表
                    let subData = pInst.data[pathArr[1]][pathArr[2]]
                    for (let p = 0; p < subData.length; p++) {
                      //对话框关联查询返回的值赋值给绑定的字段
                      utils.setValueByPath(
                        pInst,
                        param.resultfield[iop].fieldPath,
                        '',
                        p
                      )
                    }
                  }
                }
              }
            }
          })
      },
      // 同步选择结果
      syncInputValue() {
        var returnStr = JSON.parse(this.customDialog.resultfield)
        //拿到返回的字段
        var field = new Array([returnStr.length])
        var comment = new Array([returnStr.length])
        var str = []
        var ids = []
        for (var i = 0; i < returnStr.length; i++) {
          field[i] =
            this.customDialog.dsType == 'dataSource'
              ? returnStr[i].field.toLowerCase()
              : returnStr[i].field
          comment[i] =
            this.customDialog.dsType == 'dataSource'
              ? returnStr[i].comment.toLowerCase()
              : returnStr[i].comment
        }
        const this_ = this
        this.selectOrgs.forEach((row) => {
          if (this_.checkBoxDataAll || this_.checkBoxDataAll.length < 1) {
            this_.checkBoxDataAll.push(row)
          } else if (
            JSON.stringify(this_.indexArray).indexOf(JSON.stringify(row)) == -1
          ) {
            this_.checkBoxDataAll.push(row)
          }
        })
        var s = this.selectOrgs

        if (this.customDialog.selectNum === 1) {
          var temp = ''
          for (var ij = 0; ij < comment.length; ij++) {
            let encodeStr = encodeURIComponent(s[0][field[ij]])
            temp += '"' + comment[ij] + '":"' + encodeStr + '",'
          }
          if (temp != '') {
            temp = '{' + temp.substring(0, temp.length - 1) + '}'
          }
          str.push(utils.parseToJson(temp))
          ids.push(s[0].id)
        } else {
          for (var ii = 0; ii < s.length; ii++) {
            var tempp = ''
            for (var j = 0; j < comment.length; j++) {
              let encodeStr = encodeURIComponent(s[ii][field[j]])
              tempp += '"' + comment[j] + '":"' + encodeStr + '",'
            }
            if (tempp != '') {
              tempp = '{' + tempp.substring(0, tempp.length - 1) + '}'
            }
            str.push(utils.parseToJson(tempp))
            ids.push(s[ii].id)
          }
        }
        const returnData = str
        const _this = this
        const formInst = utils.getOnlineFormInstance(this)
        //处理自动回填配置
        this.instId = formInst.$parent.instId
        let custDialog = this.custdialog
        let fillOrg = {}
        if (
          custDialog.orgConfig &&
          custDialog.orgConfig.name &&
          this.fillOrg &&
          this.fillOrg.id
        ) {
          const namePath = custDialog.orgConfig.name.split('.')
          const orgNameField = namePath[namePath.length - 1]
          fillOrg[orgNameField] = this.fillOrg.name
          if (custDialog.orgConfig.id) {
            const idPath = custDialog.orgConfig.id.split('.')
            const orgIdField = idPath[idPath.length - 1]
            fillOrg[orgIdField] = this.fillOrg.id
          }
          if (custDialog.orgConfig.code) {
            const codePath = custDialog.orgConfig.code.split('.')
            const orgCodeField = codePath[codePath.length - 1]
            fillOrg[orgCodeField] = this.fillOrg.code
          }
        }
        if (custDialog.orgConfig && custDialog.orgConfig.instId) {
          const instIdPath = custDialog.orgConfig.instId.split('.')
          const instIdField = instIdPath[instIdPath.length - 1]
          fillOrg[instIdField] = this.instId
        }
        try {
          let returnSize = returnData.length
          //判断是否是一对一子表
          if (_this.relation && _this.relation == 'onetoone') {
            if (returnSize > 1) {
              this_.$message.error(this_.$t('ht.subTable.subTableError'))
              this_.customDialogShowList = true
              return
            }
          }
          returnData.forEach((row) => {
            var targetArray = null
            var subLineData = {}
            this.custdialog.custDialog.mappingConf.forEach((con) => {
              if (con.target[0]) {
                targetArray = con.target[0].split('.')
                var from = ''
                if (_this.customDialog.dsType == 'restful') {
                  from = con.from
                } else {
                  from = con.from.toLowerCase()
                }
                if (row[from] == undefined) {
                  from = from.toUpperCase()
                }
                const value =
                  decodeURIComponent(row[from]) == 'undefined'
                    ? ''
                    : decodeURIComponent(row[from])
                subLineData[targetArray[targetArray.length - 1]] = value
              }
            })
            if (targetArray) {
              let subBo = null
              let sunBo = null
              // 如果目标路径有4段，则说明是孙表回填
              if (targetArray.length == 4) {
                // 获取子表数据的索引
                const { index } = utils.getSubScopeElAndIndex(_this.$el)
                if (index == null) {
                  throw _this.$t('ht.subTable.sunTableBackfillError')
                }
                const _subBo = formInst['data'][targetArray[0]][targetArray[1]]
                // 获取孙表数据对象
                sunBo = _subBo[index][targetArray[2]]
                if (!sunBo) {
                  sunBo = _subBo[index][targetArray[2]] = []
                }
              }
              // 否则 是子表回填
              else {
                subBo = formInst['data'][targetArray[0]][targetArray[1]]
              }
              //判断是否大于子表数据最大行数
              if (this_.maxRow != 0) {
                if (subBo && subBo.length + returnSize > this_.maxRow) {
                  this_.$message.error(
                    this_.$t('ht.subTable.exceededMaximumRows') +
                      '【' +
                      this_.maxRow +
                      '】'
                  )
                  this_.customDialogShowList = true
                  throw new Error('EndIterative')
                } else if (sunBo && sunBo.length + returnSize > this_.maxRow) {
                  this_.$message.error(
                    this_.$t('ht.subTable.sunTableExceededMaximumRows') +
                      '【' +
                      this_.maxRow +
                      '】'
                  )
                  this_.customDialogShowList = true
                  throw new Error('EndIterative')
                }
              }
              if (subBo) {
                //子表中的孙表实体（可能存在多个）
                let sunBos = utils.getSomeAttributeFromParentElement(
                  _this.$el,
                  'sunBos'
                )
                //如果存在孙表实体则手动添加空孙表数组对象
                if (sunBos) {
                  let arrayBo = sunBos.split(',')
                  for (let i = 0; i < arrayBo.length; i++) {
                    let key = 'sub_' + arrayBo[i]
                    let value = new Array()
                    subLineData[key] = value
                  }
                }
              }

              //判断是否是一对一子表
              if (_this.relation && _this.relation == 'onetoone') {
                subBo && subBo.splice(0, subBo.length)
                sunBo && sunBo.splice(0, sunBo.length)
              }
              if (fillOrg && JSON.stringify(fillOrg) != '{}') {
                subLineData = { ...subLineData, ...fillOrg }
              }
              // 回填时默认展开逻辑添加
              subLineData.sub_guid = this.guid()
              _this.$root.$emit('add-new-collapse-item', subLineData.sub_guid)
              subBo && subBo.push(subLineData)
              if (sunBo) {
                sunBo.push(subLineData)
                formInst.data = Object.assign({}, formInst.data)
              }
              returnSize--
            }
          })
        } catch (e) {
          if (e.message != 'EndIterative') throw e
        }
      },
      //取消按钮
      dialogCancel() {
        const this_ = this
        this_.queryParam = ''
        this_.setListJson([]).then(() => {
          this_.customDialogShowList = false
          //判断是否是点击了确认再点击取消的  inputVal没有值则表示直接点击的取消
          if (!this_.inputVal) {
            this_.selectOrgs = []
          } else {
            this_.selectOrgs = [...this_.showData]
            this.checkBoxDataAll = [...this_.selectOrgs]
          }
        })
      },
      dialogTreeConfirm() {
        const this_ = this
        if (this_.propsData.length == 0) {
          this_.$message.error(this_.$t('ht.subTable.errorMsg'))
          return
        }
        this.setListJson([])
        var returnStr = JSON.parse(this.customDialog.resultfield)
        var field = new Array([returnStr.length])
        var comment = new Array([returnStr.length])
        var str = []
        for (var i = 0; i < returnStr.length; i++) {
          field[i] = returnStr[i].field
          comment[i] = returnStr[i].comment
        }
        if (this.customDialog.selectNum === 1) {
          var nodes = this.propsData[0]
          var temp = ''
          for (var ii = 0; ii < comment.length; ii++) {
            temp += '"' + comment[ii] + '":"' + nodes[field[ii]] + '",'
          }
          if (temp != '') {
            temp = '{' + temp.substring(0, temp.length - 1) + '}'
          }
          str.push(utils.parseToJson(temp))
        } else {
          var curNodes = this.propsData
          curNodes.forEach((item, k) => {
            var temp = ''
            for (var i = 0; i < comment.length; i++) {
              temp += '"' + comment[i] + '":"' + curNodes[field[i]] + '",'
              temp += '"' + comment[i] + '":"' + curNodes[k][field[i]] + '",'
            }
            if (temp != '') {
              temp = '{' + temp.substring(0, temp.length - 1) + '}'
            }
            str.push(utils.parseToJson(temp))
          })
        }
        const returnData = str
        const formInst = utils.getOnlineFormInstance(this)
        try {
          let returnSize = returnData.length
          //判断是否是一对一子表
          if (this_.relation && this_.relation == 'onetoone') {
            if (returnSize > 1) {
              this_.$message.error(this_.$t('ht.subTable.subTableError'))
              this_.customDialogShowTree = true
              return
            }
          }
          returnData.forEach((row) => {
            var targetArray = null
            var subLineData = {}
            this.custdialog.custDialog.mappingConf.forEach((con) => {
              if (con.target[0]) {
                targetArray = con.target[0].split('.')
                var from = ''
                if (this_.customDialog.dsType == 'restful') {
                  from = con.from
                } else {
                  from = con.from.toLowerCase()
                }
                if (row[from] == undefined) {
                  from = from.toUpperCase()
                }
                subLineData[
                  targetArray[targetArray.length - 1]
                ] = decodeURIComponent(row[from])
              }
            })
            if (targetArray) {
              var subBo = formInst['data'][targetArray[0]][targetArray[1]]
              //判断是否大于子表数据最大行数
              if (
                this_.maxRow != 0 &&
                subBo.length + returnSize > this_.maxRow
              ) {
                this_.$message.error(
                  this_.$t('ht.subTable.exceededMaximumRows') +
                    '【' +
                    this_.maxRow +
                    '】'
                )
                this_.customDialogShowTree = true
                throw new Error('EndIterative')
              }

              //子表中的孙表实体（可能存在多个）
              let sunBos = utils.getSomeAttributeFromParentElement(
                this_.$el,
                'sunBos'
              )
              //如果存在孙表实体则手动添加空孙表数组对象
              if (sunBos) {
                let arrayBo = sunBos.split(',')
                for (let i = 0; i < arrayBo.length; i++) {
                  let key = 'sub_' + arrayBo[i]
                  let value = new Array()
                  subLineData[key] = value
                }
              }
              //判断是否是一对一子表
              if (this_.relation && this_.relation == 'onetoone') {
                subBo.splice(0, subBo.length)
              }
              subBo.push(subLineData)
              returnSize--
            }
          })
          this.customDialogShowTree = false
        } catch (e) {
          if (e.message != 'EndIterative') throw e
        }
      },
      dialogCancelTree() {
        this.setListJson([])
        this.customDialogShowTree = false
      },
      getChecked(data) {
        if (this.customDialog.selectNum === 1) {
          this.propsData = []
          this.propsData.push(data)
        } else {
          this.propsData = this.$refs.tree.getCheckedNodes()
        }
      },
      treeClick(data) {
        if (this.customDialog.selectNum === 1) {
          this.propsData = []
          this.propsData.push(data)
        }
      },
      clearAllSelectOrgs() {
        this.selectOrgs = null
        this.$refs.orgTable.clearSelection()
      },
      customDialogShow(pageParam) {
        this.customDialogShowList = true
        this.customDialog = pageParam.customDialog
        this.customDialog.queryUrl =
          this.customDialog.dsType == 'dataSource'
            ? '${form}/form/customDialog/v1/getListData?alias=' +
              this.customDialog.alias +
              '&mapParam=' +
              (this.customDialog.mapParam ? this.customDialog.mapParam : '')
            : this.customDialog.url
        if (this.dialogData.length < 1) {
          /*           this.pagination = { page: 1, pageSize: 10, showTotal: 'true' } */
          this.search()
          this.displayfield = JSON.parse(pageParam.customDialog.displayfield)
          if (this.customDialog.dsType == 'dataSource') {
            for (var i = 0; i < this.displayfield.length; i++) {
              this.displayfield[i].field = this.displayfield[
                i
              ].field.toLowerCase()
            }
          }
        } else if (this.dialogData.length > 1) {
          this.search()
        }
        if (this.dialogData.length > 0 && this.displayfield.length == 0) {
          this.search()
          this.displayfield = JSON.parse(pageParam.customDialog.displayfield)
          if (this.customDialog.dsType == 'dataSource') {
            for (var j = 0; j < this.displayfield.length; j++) {
              this.displayfield[j].field = this.displayfield[
                j
              ].field.toLowerCase()
            }
          }
        }
      },
      customDialogTreeShow(pageParam) {
        this.customDialog = pageParam.customDialog
        var customDialog = this.customDialog
        var mapParam = ''
        if (pageParam.param != undefined) {
          mapParam = JSON.stringify(pageParam.param)
          mapParam = mapParam.substring(1, mapParam.length - 1)
        }
        var requestType =
          customDialog.dsType == 'dataSource'
            ? 'GET'
            : customDialog.requestType
            ? customDialog.requestType
            : 'POST'
        var url =
          '${form}/form/customDialog/v1/getTreeData?alias=' +
          pageParam.alias +
          '&mapParam=' +
          mapParam
        var paramsObj = {}
        if (customDialog.dsType != 'dataSource') {
          url = customDialog.url
          var templatePa = customDialog.dataParam
          let ctx = {}
          if (customDialog.conditionfield) {
            var conditions = JSON.parse(customDialog.conditionfield)
            for (var i = 0; i < conditions.length; i++) {
              var con = conditions[i]
              if (requestType == 'POST') {
                if (templatePa) {
                  // templatePa = templatePa.replace(
                  //   new RegExp('\\{' + con.field + '\\}', 'g'),
                  //   con.defaultValue
                  // )
                  ctx[con.field] = con.defaultValue
                } else {
                  paramsObj[con.field] = con.defaultValue
                }
              } else {
                var ljChar = url.indexOf('?') == -1 ? '?' : '&'
                url = url + ljChar + con.field + '=' + con.defaultValue
              }
            }
            // 添加用户id 岗位id 组织id
            try {
              if (this.$requestConfig.getUserId()) {
                ctx.userId = this.$requestConfig.getUserId()
              }
              if (this.$requestConfig.getOrgId()) {
                ctx.orgId = this.$requestConfig.getOrgId()
              }
              if (this.$requestConfig.getPostId()) {
                ctx.postId = this.$requestConfig.getPostId()
              }
            } catch (e) {
              console.log(this.$t('ht.customDialog.getIdError'), e)
            }
            if (templatePa) {
              templatePa = utils.parseExp(templatePa, ctx)
              paramsObj = JSON.parse(templatePa)
            }
          }
        }
        var requestParams = {}
        requestParams.requestType = requestType
        requestParams.url = url
        requestParams.paramsObj = paramsObj
        this.searchTree(requestParams)
        this.customDialogShowTree = true
      },
      //树形查询
      searchTree(requestParams) {
        const this_ = this
        this.getTreeListJson(requestParams).then(function(response) {
          //显示字段配置
          let displayfield = JSON.parse(this_.customDialog.displayfield)
          this_.displayField = displayfield
          //把对话框配置的显示字段显示名称赋值给树形的显示值
          this_.defaultProps.label = displayfield.displayName
          this_.treeList = response
          //得到要加载树的信息
          this_.props1 = this_.toTreeData(
            response,
            displayfield.id,
            displayfield.pid,
            displayfield.displayName,
            displayfield.pvalue ? displayfield.pvalue : 0
          )
        })
      },
      //加载树的信息
      toTreeData(data, id, pid, name, pvalue) {
        // 建立个树形结构,需要定义个最顶层的父节点，pvalue是0
        return this.translateDataToTree(data, pid, id, name, pvalue)
      },
      translateDataToTree(data, pid, id, name, pvalue) {
        //把树数据有子节点的数据全部过滤掉（只留父节点的数据）
        let parents = data.filter(
          (value) =>
            value[id] == value[pid] ||
            value[pid] == null ||
            value[pid] == pvalue
        )
        if (!parents) {
          parents = data.filter(
            (value) =>
              value[pid] !== 'undefined' &&
              value[pid] != null &&
              value[id] != value[pid]
          )
        }
        return parents
      },
      loadTree(node, resolve) {
        if (node) {
          let this_ = this
          let displayField =
            this_.customDialog.style == 2
              ? this_.combiTreeDisplayField
              : this_.displayField
          resolve(
            this.treeList.filter(
              (value) => value[displayField.pid] === node.data[displayField.id]
            )
          )
          if (this.showData && this.showData.length > 0) {
            setTimeout(() => {
              this.showData.forEach((v) => {
                if (v.Pid == node.key) {
                  this_.$refs.tree.setChecked(v, true)
                } else {
                  this_.checkNode(v, this_)
                }
              })
            }, 400)
          }
        }
      },

      afterOpen() {
        //打开对话框之后加载树
        this.loadCombinationTree()
      },
      loadCombinationTree() {
        if (this.customDialog.style != 2) {
          return
        }
        let combinationRule = JSON.parse(this.customDialog.combinationRule)
        this.combinationRule = combinationRule
        let treeAlias = combinationRule.leftTree
        //获取对话框数据
        this.$requestConfig
          .request({
            url: '${form}/form/customDialog/v2/getByAlias?alias=' + treeAlias,
            method: 'get',
          })
          .then((resp) => {
            if (resp && resp.value) {
              let treeDialog = resp.value
              this.leftTreeTitle = treeDialog.name
              let requestType =
                treeDialog.dsType == 'dataSource'
                  ? 'GET'
                  : treeDialog.requestType
                  ? treeDialog.requestType
                  : 'POST'
              let url =
                '${form}/form/customDialog/v1/getTreeData?alias=' +
                treeAlias +
                '&mapParam='
              let paramsObj = {}
              if (treeDialog.dsType != 'dataSource') {
                url = treeDialog.url
                let templatePa = treeDialog.dataParam
                if (treeDialog.conditionfield) {
                  let conditions = JSON.parse(treeDialog.conditionfield)
                  for (let i = 0; i < conditions.length; i++) {
                    let con = conditions[i]
                    if (requestType == 'POST') {
                      if (templatePa) {
                        templatePa = templatePa.replace(
                          new RegExp('\\{' + con.field + '\\}', 'g'),
                          con.defaultValue
                        )
                      } else {
                        paramsObj[con.field] = con.defaultValue
                      }
                    } else {
                      let ljChar = url.indexOf('?') == -1 ? '?' : '&'
                      url = url + ljChar + con.field + '=' + con.defaultValue
                    }
                  }
                  if (templatePa) {
                    paramsObj = JSON.parse(templatePa)
                  }
                }
              }
              let requestParams = {}
              requestParams.requestType = requestType
              requestParams.url = url
              requestParams.paramsObj = paramsObj
              this.getTreeListJson(requestParams).then((resp) => {
                if (treeDialog.displayfield && treeDialog.resultfield) {
                  let displayField = JSON.parse(treeDialog.displayfield)
                  let resultfield = JSON.parse(treeDialog.resultfield)
                  this.defaultProps.label = displayField.displayName
                  this.treeList = resp
                  this.combiTreeDisplayField = displayField
                  this.combinationTreeData = this.toTreeData(
                    resp,
                    displayField.id,
                    displayField.pid,
                    displayField.displayName,
                    displayField.pvalue ? displayField.pvalue : '0',
                    resultfield
                  )
                }
              })
            }
          })
      },
      combiTreeClick(paramObj) {
        //组合对话框点击左树
        //清空旧的
        this.combinationTreeQuerys.splice(0)
        let combinationRule = JSON.parse(this.customDialog.combinationRule)
        if (!combinationRule.rules || combinationRule.rules.length == 0) {
          return
        }
        let rules = combinationRule.rules
        for (let i = 0; i < rules.length; i++) {
          let value = paramObj[rules[i].treeField]
          let property = rules[i].listField
          this.combinationTreeQuerys.push({
            property: property,
            value: value,
            group: 'treeGroup',
            operation: this.getOperation(rules[i].condition),
            relation: 'AND',
          })
        }
        this.search(true)
      },
      //获取运算符号
      getOperation(old) {
        if (!old) {
          return ''
        }
        if (old == 'EQ') {
          return 'EQUAL'
        }
        if (old == 'LK') {
          return 'LIKE'
        }
        if (old == 'LFK') {
          return 'LIKE'
        }
        if (old == 'IN') {
          return 'IN'
        }
      },
      toggleTree() {
        if (this.treeShow) {
          this.treeShow = false
          this.transtionWidth = '0%'
          this.toggleBtn = 'el-icon-arrow-right'
        } else {
          this.treeShow = true
          this.transtionWidth = '25%'
          this.toggleBtn = 'el-icon-arrow-left'
        }
      },
      initTemplateData() {
        let _this = this
        const custdialog = this.custdialog.custDialog
        if (
          !custdialog ||
          !custdialog.mappingConf ||
          custdialog.mappingConf.length < 1
        ) {
          return
        }
        const targetPath = this.getTargetPath(custdialog.mappingConf)
        const paths = targetPath.split('.')
        const formInst = utils.getOnlineFormInstance(this)
        //如果已有数据则不需要再次初始化
        const curData = formInst['data'][paths[0]][paths[1]]
        let initType = this.initFillDataType
        if (
          (!initType || initType == 'empty') &&
          curData.length > 0 &&
          !(curData.length == 1 && JSON.stringify(curData[0]) == '[]')
        ) {
          return
        } else if (initType == 'cover') {
          formInst['data'][paths[0]][paths[1]] = []
        }
        const loading = this.$loading({
          lock: true,
          text: this.$t('ht.subTable.loadingText'),
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })
        let myCustomDialog = null

        this.$requestConfig
          .request({
            url:
              '${form}/form/customDialog/v1/getByAlias?alias=' +
              custdialog.alias,
            method: 'get',
          })
          .then(
            (data) => {
              myCustomDialog = data
              _this.customDialog = data
            },
            () => {
              _this.closeLoading(loading)
              _this.$message({
                message: _this.$t('ht.subTable.getCustomDialogError'),
                type: 'error',
              })
            }
          )
          .then(function() {
            const currentUser = JSON.parse(
              sessionStorage.getItem('currentUser')
            )
            if (
              !_this.custdialog.orgConfig.code &&
              !_this.custdialog.orgConfig.name &&
              !_this.custdialog.orgConfig.id
            ) {
              _this.closeLoading(loading)
              _this.toFillInitData(
                _this,
                myCustomDialog.dsType,
                formInst['data']
              )
            } else if (
              currentUser &&
              localStorage.getItem('curFillOrg_' + currentUser.account)
            ) {
              _this.closeLoading(loading)
              _this.fillOrg = JSON.parse(
                localStorage.getItem('curFillOrg_' + currentUser.account)
              )
              _this.toFillInitData(
                _this,
                myCustomDialog.dsType,
                formInst['data']
              )
            } else {
              _this.$requestConfig
                .request({
                  url: '${uc}/api/org/v1/org/getFillOrg',
                  method: 'get',
                })
                .then(
                  (respdata) => {
                    _this.closeLoading(loading)
                    const rep = respdata
                    if (rep.state) {
                      _this.fillOrg = rep.value
                      localStorage.setItem(
                        'curFillOrg_' + currentUser.account,
                        JSON.stringify(rep.value)
                      )
                      _this.toFillInitData(
                        _this,
                        myCustomDialog.dsType,
                        formInst['data']
                      )
                    } else {
                      _this.$message({
                        message: rep.message,
                        type: 'warning',
                      })
                    }
                  },
                  () => {
                    _this.closeLoading(loading)
                    _this.$message({
                      message: _this.$t('ht.subTable.getCurrentUserError'),
                      type: 'warning',
                    })
                  }
                )
            }
          })
      },
      closeLoading(loading) {
        setTimeout(function() {
          loading.close()
        }, 2000)
      },
      getTargetPath(mappingConf) {
        let target = ''
        if (mappingConf && mappingConf.length > 0) {
          mappingConf.forEach((map) => {
            if (
              map['target'] &&
              map['target'].length == 1 &&
              map['target'][0]
            ) {
              target = map['target'][0]
              return target
            }
          })
        }
        return target
      },
      toFillInitData(_this, dsType, curData) {
        const custdialog = this.custdialog.custDialog
        let params = [] //绑定的表单字段
        if (custdialog.conditions) {
          //对话框按表单字段查询（参数传入的）
          let bindList = custdialog.conditions
          if (bindList.length > 0) {
            bindList.forEach((ele) => {
              //绑定表单字段
              if (ele.defaultType == '3' && ele.bind) {
                let obj = {}
                obj.field = ele.field
                const bindArray = ele.bind.split('.')
                if (bindArray.length == 3) {
                  obj.bind = curData[bindArray[1]][bindArray[2]]
                  params.push(obj)
                }
              }
            })
          }
        }
        let url =
          '${form}/form/customDialog/v1/getListData?alias=' + custdialog.alias
        if (params.length > 0) {
          let paStr = ''
          params.forEach((pa) => {
            if (paStr) {
              paStr += ','
            }
            paStr = paStr + '"' + pa.field + '":"' + pa.bind + '"'
          })
          url = url + '&mapParam=' + paStr
        } else {
          url = url + '&mapParam='
        }
        let method = 'post'
        if (this.customDialog.dsType === 'restful') {
          url = this.customDialog.url
          method = this.customDialog.requestType
        }
        const param = { pageBean: { page: 1, pageSize: 1000, showTotal: true } }
        _this.$requestConfig
          .request({
            url: url,
            method: method,
            data: param,
          })
          .then(
            (respdata) => {
              const response = respdata
              if (this.customDialog.dsType === 'restful') {
                if (response[this.customDialog.listKey]) {
                  const rows = response[this.customDialog.listKey]
                  _this.syncInitTableValue(
                    _this.maxRow > 0 && rows.length > _this.maxRow
                      ? rows.splice(0, _this.maxRow)
                      : rows,
                    dsType
                  )
                } else if (response && response.constructor === Array) {
                  const rows = response
                  _this.syncInitTableValue(
                    _this.maxRow > 0 && rows.length > _this.maxRow
                      ? rows.splice(0, _this.maxRow)
                      : rows,
                    dsType
                  )
                }
              } else {
                if (response.rows) {
                  _this.syncInitTableValue(
                    _this.maxRow > 0 && response.rows.length > _this.maxRow
                      ? response.rows.splice(0, _this.maxRow)
                      : response.rows,
                    dsType
                  )
                }
              }
            },
            () => {
              _this.$message({
                message: _this.$t('ht.subTable.getDefaultDataError'),
                type: 'error',
              })
            }
          )
      },
      syncInitTableValue(s, dsType) {
        let custDialog = this.custdialog
        var returnStr = JSON.parse(this.customDialog.resultfield)
        //拿到返回的字段
        var field = new Array([returnStr.length])
        var comment = new Array([returnStr.length])
        var str = []
        var ids = []
        for (var i = 0; i < returnStr.length; i++) {
          field[i] =
            dsType == 'dataSource'
              ? returnStr[i].field.toLowerCase()
              : returnStr[i].field
          comment[i] =
            dsType == 'dataSource'
              ? returnStr[i].comment.toLowerCase()
              : returnStr[i].comment
        }
        if (this.customDialog.selectNum === 1) {
          var temp = ''
          for (var j = 0; j < comment.length; j++) {
            let va = s[0][field[j]]
            va = typeof va == 'undefined' ? '' : va
            temp += '"' + comment[j] + '":"' + va + '",'
          }
          if (temp != '') {
            temp = '{' + temp.substring(0, temp.length - 1) + '}'
          }
          str.push(utils.parseToJson(temp))
          ids.push(s[0].id)
        } else {
          for (var l = 0; l < s.length; l++) {
            var tempL = ''
            for (var m = 0; m < comment.length; m++) {
              let va = s[l][field[m]]
              va = typeof va == 'undefined' ? '' : va
              tempL += '"' + comment[m] + '":"' + va + '",'
            }
            if (tempL != '') {
              tempL = '{' + tempL.substring(0, tempL.length - 1) + '}'
            }
            str.push(utils.parseToJson(tempL))
            ids.push(s[l].id)
          }
        }
        const formInst = utils.getOnlineFormInstance(this)
        this.instId = formInst.$parent.instId
        //处理填制部门
        let fillOrg = {}
        if (
          custDialog.orgConfig &&
          custDialog.orgConfig.name &&
          this.fillOrg.id
        ) {
          const namePath = custDialog.orgConfig.name.split('.')
          const orgNameField = namePath[namePath.length - 1]
          fillOrg[orgNameField] = this.fillOrg.name
          if (custDialog.orgConfig.id) {
            const idPath = custDialog.orgConfig.id.split('.')
            const orgIdField = idPath[idPath.length - 1]
            fillOrg[orgIdField] = this.fillOrg.id
          }
          if (custDialog.orgConfig.code) {
            const codePath = custDialog.orgConfig.code.split('.')
            const orgCodeField = codePath[codePath.length - 1]
            fillOrg[orgCodeField] = this.fillOrg.code
          }
        }
        if (custDialog.orgConfig.instId) {
          const instIdPath = custDialog.orgConfig.instId.split('.')
          const instIdField = instIdPath[instIdPath.length - 1]
          fillOrg[instIdField] = this.instId
        }
        const returnData = str
        const _this = this

        returnData.forEach((row) => {
          var subLineData = {}
          var targetArray = null
          custDialog.custDialog.mappingConf.forEach((con) => {
            if (con.target[0]) {
              targetArray = con.target[0].split('.')
              var from = ''
              if (_this.customDialog.dsType == 'restful') {
                from = con.from
              } else {
                from = con.from.toLowerCase()
              }
              subLineData[targetArray[targetArray.length - 1]] = row[from]
            }
          })
          if (fillOrg && JSON.stringify(fillOrg) != '{}') {
            subLineData = { ...subLineData, ...fillOrg }
          }
          formInst['data'][targetArray[0]][targetArray[1]].push(subLineData)
        })
      },
      guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
          c
        ) {
          var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        })
      },
      selectable(row){
        // 获取设置的回填验证字段
        let res = this.custdialog.resultField.filter(item=>item.isRepeat).map(item=>item.comment)
        if(res && res.length){
          // 获取当前弹窗要回填验证的字段code
          let innerCode = this.displayfield.filter(item=>res.indexOf(item.comment)!=-1).map(item=>item.field)
          // 获取要回填验证的列表的字段code
          let field = this.custdialog.custDialog.mappingConf.filter(item=>res.indexOf(item.from)!=-1).map(item=>item.target && item.target.join(','))
          let code = []
          field.forEach(item=>{
            code.push(item.split('.')[2])
          })
          if(this.initBackFillData && this.initBackFillData.length){
            let filledData = []
            this.initBackFillData.forEach(item=>{
              let str = ''
              code.forEach(codeitem=>{
                str += item[codeitem]
              })
              filledData.push(str)
            })
            let diffStr = ''
            innerCode.forEach(codeitem=>{
              diffStr += row[codeitem]
            })
            if(filledData.indexOf(diffStr)!=-1){
              if(this.customDialog.selectNum === 1){    //单选
                return true
              }else{
                return false
              }
            }
          }
        }
        if(this.customDialog.selectNum === 1){        //单选
          return false
        }else{
          return true
        }
      },
      formatDictLabel(key,index){
        let data = this.displayfield[index].formatterData
        let value = ''
        if(data && data.length){
          data.forEach(item=>{
            if(item.key_ == key){
              value = item.value_
            }
          })
        }
        return value
      },
    },
  }
</script>
<style lang="scss" scoped>
  ::v-deep .el-button--mini {
    padding: 0px 15px;
    font-size: 12px;
    border-radius: 3px;
    height: 100%;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  ::v-deep .el-button--info {
    background-color: #f5f7fa;
    border-color: #e4e7ed;
    color: #c0c4cc;
  }
  ::v-deep .el-input__suffix {
    position: absolute;
    height: 100%;
    right: 0px !important;
    top: 0;
    text-align: center;
    color: #c0c4cc;
    -webkit-transition: all 0.3s;
    transition: all 0.3s;
    pointer-events: none;
  }
  .el-input__inner[aria-invalid='true'] {
    border-color: #f56c6c;
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
  ::v-deep .el-dialog__body {
    padding: 0;
    overflow-y: auto;
    max-height: 650px;
  }

  ::v-deep .el-card__header {
    padding: 10px;
  }

  ::v-deep .el-card__body {
    padding: 10px;
  }

  .org-find-card ::v-deep .el-card__header {
    background: #f5f7fa;
  }

  ::v-deep .el-main {
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
  @media (max-width: 1280px) {
    ::v-deep .el-dialog {
      width: 96% !important;
      margin-top: 2vh !important;
    }
  }
  ::v-deep.el-dialog__wrapper {
    overflow: unset !important;
    &::-webkit-scrollbar {
      width: 0;
      background-color: transparent;
    }
  }

  ::v-deep .el-dialog {
    min-height: 400px;
  }
  @media (max-height: 960px) {
    ::v-deep .el-dialog__body .el-container {
      height: 100% !important;
    }
    ::v-deep .el-dialog__body {
      max-height: 500px;
    }
  }
  ::v-deep .el-divider--vertical {
    height: 100%;
  }
  .textRadio {
    ::v-deep .el-radio__label {
      display: none;
    }
  }
</style>
