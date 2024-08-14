<template>
  <div>
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
                <eip-select-dia
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
                ></eip-select-dia>
              </div>
              <div
                v-if="condition.controllerType == '4'"
                style="margin-right: 10px"
              >
                <eip-tag
                  v-model="queryParams[index][condition.field]"
                  :tag-key="condition.config.tag"
                  :placeholder="quickSearch"
                  :filterable="condition.config.filterable"
                  :expand="condition.config.expand"
                ></eip-tag>
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
                {{ t('ht.common.search') }}
              </el-button>
              <el-button size="small" icon="el-icon-refresh" @click="reset">
                {{ t('ht.common.reset') }}
              </el-button>
            </div>
          </el-header>
          <el-main class="custom-dialog_main">
            <el-table
              ref="orgTable"
              :data="dialogData"
              stripe
              border
              class="org-table"
              size="medium"
              style="width: 100%"
              row-key="custom_dialog_rowId"
              @row-click="orgRowClick"
              @selection-change="orgTableSelection"
              @select="onTableSelect"
              @select-all="selectAll"
            >
              <el-table-column
                v-if="customDialog.selectNum != 1"
                type="selection"
                align="center"
                reserve-selection
                width="55"
              ></el-table-column>
              <el-table-column
                v-if="customDialog.selectNum === 1"
                align="center"
                width="55"
              >
                <template slot-scope="scope">
                  <el-radio
                    v-model="tableRadioVal"
                    :label="scope.$index"
                    class="textRadio"
                    @selection-change="orgTableSelection"
                  >
                    &nbsp;
                  </el-radio>
                </template>
              </el-table-column>
              <el-table-column
                type="index"
                width="50"
                align="center"
                :label="t('ht.common.index')"
              ></el-table-column>
              <el-table-column
                v-for="field in displayfield"
                :key="field.field"
                :show-overflow-tooltip="true"
                :prop="field.field"
                :label="field.comment"
                style="width: 100%"
              ></el-table-column>
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
        <el-button
          size="small"
          type="primary"
          :disabled="isDisabledConfirmBtn"
          @click="dialogConfirm"
        >
          {{ t('ht.common.confirm') }}
        </el-button>
        <el-button size="small" @click="dialogCancel">
          {{ t('ht.common.cancle') }}
        </el-button>
      </span>
    </el-dialog>
    <!-- 树形对话框 -->
    <el-dialog
      :title="t('ht.customDialog.title')"
      width="500px"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      top="6vh"
    >
      <!-- 动态传入参数查询树 -->
      <table
        class="form-table"
        style="margin-left: 20px; width: 90%"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody v-for="(item, $index) in conditionfieldTree" :key="$index">
          <tr v-if="item.defaultType == '4'">
            <th width="130px">{{ item.comment }}:</th>
            <td>
              <ht-input
                v-if="item.type != 'date'"
                v-model="item.paramVal"
                type="text"
                style="width: 100%"
                :placeholder="t('ht.common.enter') + item.comment"
                autocomplete="off"
              ></ht-input>
              <ht-date
                v-if="item.type == 'date'"
                v-model="item.paramVal"
                style="width: 100%"
                :placeholder="t('ht.common.enter') + item.comment"
                format="yyyy-MM-dd"
              ></ht-date>
            </td>
          </tr>
        </tbody>
      </table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSave">
          {{ t('ht.common.confirm') }}
        </el-button>
        <el-button @click="handleClose">{{ t('ht.common.cancle') }}</el-button>
      </div>
    </el-dialog>
    <!-- 树形弹框 -->
    <el-dialog
      :visible.sync="customDialogShowTree"
      :title="customDialog.name"
      :close-on-click-modal="false"
      :before-close="dialogCancelTree"
      append-to-body
      top="6vh"
      width="500px"
    >
      <el-container :style="style" style="overflow: auto">
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
          :default-expanded-keys="defaultExpandedKeys"
          style="width: 100%"
          @node-click="treeClick"
          @check-change="getChecked"
        ></el-tree>
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button size="small" type="primary" @click="dialogTreeConfirm">
          {{ t('ht.common.confirm') }}
        </el-button>
        <el-button size="small" @click="dialogCancelTree">
          {{ t('ht.common.cancle') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import $ from 'jquery'
  import utils from '@/utils.js'
  import locale from '@/mixins/locale.js'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import dialog from './customDialog.js'
  import CustomQuery from '@/services/CustomQuery'
  export default {
    name: 'CustomDialog',
    mixins: [dialog, locale, inputName, permission, form],
    props: {
      custdialog: {
        type: Object,
        default: () => {
          return {}
        },
      },
      value: String,
      subIndex: Number,
      sunIndex: Number,
      subPath: String,
      currentSubData: Array,
      isReadOnly: {
        type: Boolean,
        default: false,
      },
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
        inputSuffixWidth: 0,
        placeholderBo: '',
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
        config: null,
        updating: false,
        displayfield: [], //显示字段
        customDialog: {},
        queryParam: '', //查询条件输入的值
        props1: [],
        showData: [],
        checkBoxDataAll: [], //选中对象的集合
        defaultProps: {
          children: 'children',
          label: 'label',
          isLeaf: 'isLeaf',
        },
        propsData: [],
        querysShow: false, //是否显示搜索框
        tableRadioVal: '',
        isCurrentChange: false, //是否不执行 orgTableSelection方法
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
        writeable: true,
        fixedParams: {}, // 传过来的固定值
        executeScriptResult: null,
        isDisabledConfirmBtn: true,
      }
    },
    computed: {
      //默认展开的节点的 key 的数组
      defaultExpandedKeys: function() {
        if (
          this.props1 &&
          this.props1.length > 0 &&
          this.props1[0][this.nodeKey]
        ) {
          return [this.props1[0][this.nodeKey]]
        }
        return []
      },
    },
    watch: {
      dialogData: {
        handler(val) {
          if (this.value && val.length > 0) {
            const currentBindInfo = this.custdialog.custDialog.mappingConf.find(
              (it) => this.modelName === `data.${it['target'][0]}`
            )
            const from = currentBindInfo && currentBindInfo.from.toLowerCase()
            let returnStr = JSON.parse(this.customDialog.resultfield)
            let currentObj = returnStr.find((item) => {
              return item.comment.toLowerCase() === from
            })
            const fromKey = currentObj ? currentObj.field : ''
            // if (fromKey) {
            //   this.selectOrgs = val.filter((item) => {
            //     return this.value.split(',').includes(item[fromKey])
            //   })
            // }
          }
        },
        immediate: true,
        deep: true,
      },
      selectOrgs(val) {
        if (val && val.length) {
          this.isDisabledConfirmBtn = false
        } else {
          this.isDisabledConfirmBtn = true
        }
      },
    },
    mounted() {
      this.$nextTick(() => {
        if (this.value && !this.isReadOnly) {
          this.showDialog(true)
        }
      })
    },
    methods: {
      showDialog(isMounted = false) {
        this.selectOrgs = []
        const this_ = this
        this.fixedParams = {}
        var alias = this.custdialog.custDialog.alias
        this.$requestConfig
          .getCustomDialogByAlias(alias)
          .then((customDialog) => {
            if (!customDialog || !customDialog.alias) {
              this.$message.error(this.t('ht.customDialog.errorMsg', { alias }))
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
                if (
                  ele.bind &&
                  (ele.defaultType == '3' ||
                    ele.bind.startsWith('data.searchForm'))
                ) {
                  let obj = {}
                  obj.field = ele.field
                  obj.bind = ele.bind
                  obj.bindType = ele.bindType
                  this_.param.push(obj)
                }
                //取值对象为脚本时获取value
                if (ele.bindType === 3) {
                  this_.$requestConfig.executeScript(ele.bind).then((res) => {
                    this_.executeScriptResult = res && res.value
                  })
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
                //条件查询参数（用户输入的） 文本框输入 defaultType 1 用户输入 2固定值 3参数传入 5脚本
                if (ele.defaultType == '1') {
                  obj[ele.field] = ''
                  queryParams.push(obj)
                  // queryParams[ele.field] = "";
                  this_.conditionBind.push(ele)
                  placeholders.push(this.t('ht.common.enter') + ele.comment)
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
              this.t('ht.common.enter') +
              this.quickSearch +
              this.t('ht.common.search')
            this_.style = 'height:' + customDialog.height + 'px'
            if (window.screen.height && window.screen.height <= 900) {
              this.style = 'height:440px'
            }
            if (customDialog.style == 0 || customDialog.style == 2) {
              //列表
              setTimeout(() => {
                this_.customDialogShow(
                  {
                    alias: alias,
                    customDialog: customDialog,
                  },
                  isMounted
                )
              }, 100)
            } else if (customDialog.style == 1) {
              //树形
              this_.pageParam = { alias: alias, customDialog: customDialog }
              this_.customDialog = customDialog
              let param = {}
              this_.conditionfieldTree = []
              //判断是否存在条件
              if (customDialog.conditionfield) {
                this_.conditionfieldTree = JSON.parse(
                  customDialog.conditionfield
                )
                if (this_.conditionfieldTree.length > 0) {
                  for (
                    let i = this_.conditionfieldTree.length - 1;
                    i >= 0;
                    i--
                  ) {
                    //判断条件字段是否是动态传入（defaultType：4：动态传入，2：固定值 ）
                    if (this_.conditionfieldTree[i].defaultType == '4') {
                      param[this_.conditionfieldTree[i].field] =
                        this_.conditionfieldTree[i].comment
                    }
                  }
                }
              }
              //有动态传入的字段
              if (!isMounted) {
                if (JSON.stringify(param) != '{}') {
                  this_.dialogVisible = true
                } else {
                  //无动态传入的字段
                  this_.customDialogTreeShow(this_.pageParam)
                }
              }
            }
          })
      },
      treeClick(data) {
        // 单选
        if (this.customDialog.selectNum === 1) {
          this.propsData = []
          this.propsData.push(data)
        }
      },
      getChecked() {
        // 多选
        if (this.customDialog.selectNum === -1) {
          this.propsData = this.$refs.tree.getCheckedNodes()
        }
      },
      customDialogShow(pageParam, isMounted = false) {
        if (!isMounted) {
          this.customDialogShowList = true
        }
        this.customDialog = pageParam.customDialog
        this.customDialog.queryUrl =
          this.customDialog.dsType == 'dataSource'
            ? '${form}/form/customDialog/v1/getListData?alias=' +
              this.customDialog.alias +
              '&mapParam=' +
              (this.customDialog.mapParam ? this.customDialog.mapParam : '')
            : this.customDialog.url
        if (this.dialogData.length < 1) {
          this.search()
          this.displayfield = JSON.parse(pageParam.customDialog.displayfield)
          if (this.customDialog.dsType == 'dataSource') {
            for (var i = 0; i < this.displayfield.length; i++) {
              this.displayfield[i].field = this.displayfield[
                i
              ].field.toLowerCase()
            }
          }
        } else if (this.dialogData.length >= 1) {
          this.search()
        }
        if (this.dialogData.length > 0 && this.displayfield.length == 0) {
          this.search()
          this.displayfield = JSON.parse(pageParam.customDialog.displayfield)
          if (this.customDialog.dsType == 'dataSource') {
            for (var j = 0; i < this.displayfield.length; j++) {
              this.displayfield[j].field = this.displayfield[
                j
              ].field.toLowerCase()
            }
          }
        }
      },
      customDialogTreeShow(pageParam) {
        var customDialog = this.customDialog
        let mapParamObj = {} //数据来源是数据源，且有动态参数传入时调用
        let mapParam = ''
        let defaultPValue = '' //父ID值
        if (this.conditionfieldTree.length > 0) {
          for (let i = 0; i < this.conditionfieldTree.length; i++) {
            if (this.conditionfieldTree[i].defaultType == '4') {
              //动态传入
              //得到输入的条件字段值
              let val = this.conditionfieldTree[i].paramVal
              if (!val) {
                continue
              }
              //得到条件字段KEY
              let key = this.conditionfieldTree[i].field
              mapParamObj[key] = val
            } else if (this.conditionfieldTree[i].defaultType == '2') {
              //固定值
              //得到输入的条件字段值
              let val = this.conditionfieldTree[i].defaultValue
              if (!val) {
                continue
              }
              //得到条件字段KEY
              let key = this.conditionfieldTree[i].field
              mapParamObj[key] = val
            }
          }
          if (this.param) {
            const pInst = utils.getOnlineFormInstance(this)
            this.param.forEach((item) => {
              let val = utils.getValueByPath(pInst, item.bind)
              val && (mapParamObj[item.field] = val)
            })
          }
          if (JSON.stringify(mapParamObj) != '{}') {
            //获取对话框配置的父ID字段
            let pid = JSON.parse(this.customDialog.displayfield).pid
            for (let m in mapParamObj) {
              if (pid == m) {
                defaultPValue = mapParamObj[m]
                break
              }
            }
            mapParam = JSON.stringify(mapParamObj)
            mapParam = mapParam.substring(1, mapParam.length - 1)
          }
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
                  //   new RegExp('\\${' + con.field + '\\}', 'g'),
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
            console.log(this.t('ht.customDialog.getIdError'), e)
          }
          if (templatePa) {
            templatePa = utils.parseExp(templatePa, ctx)
            paramsObj = JSON.parse(templatePa)
          }
        }
        var requestParams = {}
        requestParams.requestType = requestType
        requestParams.url = url
        requestParams.paramsObj = paramsObj
        this.searchTree(requestParams, defaultPValue)
        this.customDialogShowTree = true
      },
      //树形查询
      searchTree(requestParams, defaultPValue) {
        const this_ = this
        let query = this.$requestConfig.request({
          url: requestParams.url,
          method: requestParams.requestType == 'POST' ? 'post' : 'get',
          data: requestParams.paramsObj,
        })
        query.then(function(response) {
          //显示字段配置
          let displayfield = JSON.parse(this_.customDialog.displayfield)
          this_.displayField = displayfield
          //把对话框配置的显示字段显示名称赋值给树形的显示值
          this_.defaultProps.label = displayfield.displayName
          this_.treeList = response
          //得到要加载树的信息
          if (defaultPValue) {
            displayfield.pvalue = defaultPValue
          }
          this_.props1 = this_.toTreeData(
            response,
            displayfield.id,
            displayfield.pid,
            displayfield.displayName,
            displayfield.pvalue ? displayfield.pvalue : 0
          )
        })
      },
      dialogTreeConfirm() {
        this.calacInputSuffixHeight()
        let thisIndex = null //当前数据所在下标
        let parentIndex = null //父节点所在下标
        if (this.$parent.$el) {
          thisIndex = utils.getSomeAttributeFromParentElement(
            this.$el,
            'data-index'
          )
          if (!thisIndex) {
            thisIndex = utils.getSubScopeElAndIndex(this.$parent.$el).index
          }
          parentIndex = utils.getSomeAttributeFromParentElement(
            this.$parent.$parent.$el,
            'data-index'
          )
        }
        this.setDialogData([])
        var returnStr = JSON.parse(this.customDialog.resultfield)
        var field = new Array([returnStr.length])
        var comment = new Array([returnStr.length])
        var str = []
        for (var i = 0; i < returnStr.length; i++) {
          field[i] = returnStr[i].field
          comment[i] = returnStr[i].comment
        }
        var nodes = this.propsData
        if (this.customDialog.selectNum === 1) {
          nodes = this.propsData[0]
          var temp = ''
          for (var j = 0; j < comment.length; j++) {
            temp += '"' + comment[j] + '":"' + nodes[field[j]] + '",'
          }
          if (temp != '') {
            temp = '{' + temp.substring(0, temp.length - 1) + '}'
          }
          str.push(utils.parseToJson(temp))
        } else {
          nodes.forEach((item, k) => {
            var temp = ''
            for (var i = 0; i < comment.length; i++) {
              temp += '"' + comment[i] + '":"' + nodes[field[i]] + '",'
              temp += '"' + comment[i] + '":"' + nodes[k][field[i]] + '",'
            }
            if (temp != '') {
              temp = '{' + temp.substring(0, temp.length - 1) + '}'
            }
            str.push(utils.parseToJson(temp))
          })
        }
        const pInst = utils.getOnlineFormInstance(this)
        this.selectOrgs = this.convertComment2Field(str, field)
        this.custdialog.custDialog.mappingConf.forEach((con) => {
          var val = ''
          str.forEach((item) => {
            val += item[con.from] + ','
          })
          if (this.modelName == 'data.' + con['target'][0]) {
            utils.setValueByPath(
              pInst,
              'data.' + con['target'][0],
              val.substring(0, val.length - 1),
              thisIndex
            )
          } else if (this.modelName == 'searchForm.' + con['target'][0]) {
            utils.setValueByPath(
              pInst,
              'searchForm.' + con['target'][0],
              val.substring(0, val.length - 1),
              thisIndex
            )
          } else {
            let configAttr = con['target'][0].split('.')
            let path = con['target'][0]
            if (configAttr.length == 4 && parentIndex >= 0) {
              //孙表数据赋值
              path =
                configAttr[0] +
                '.' +
                configAttr[1] +
                '[' +
                parentIndex +
                '].' +
                configAttr[2] +
                '.' +
                configAttr[3]
            }
            const _val = val.substring(0, val.length - 1)
            if (path) {
              if (this.modelName && this.modelName.endsWith(path)) {
                // this.$emit('input', _val)
                this.$emit('updateInput', _val)
              }
              utils.setValueByPath(
                pInst,
                `${pInst.data ? 'data.' : 'model.'}${path}`,
                _val,
                thisIndex
              )
            }
          }
        })
        //回显的值
        this.showData = this.propsData ? [...this.propsData] : ''
        this.customDialogShowTree = false
      },
      // 将以comment为key的数组改造为以field为key的数组
      convertComment2Field(ary, fields) {
        const result = []
        if (!ary || ary.length == 0) {
          return result
        }
        ary.forEach((s) => {
          const r = {}
          Object.entries(s).forEach((kv, index) => {
            const f = fields[index]
            if (f) {
              r[f] = kv[1]
            }
          })
          result.push(r)
        })
        return result
      },
      dialogCancelTree() {
        this.setDialogData([])
        this.customDialogShowTree = false
      },
      //查询
      search(resetPagintion) {
        let querys = [] //查询条件
        let queryFilter = {}
        if (JSON.stringify(this.pagination) == '{}') {
          this.pagination = { page: 1, pageSize: 10, showTotal: true }
        }
        let pageBean = { pageBean: this.pagination }
        if (resetPagintion) {
          pageBean.pageBean = { page: 1, pageSize: 10, showTotal: true }
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
          this.param.forEach((item) => {
            querys.push({
              property: item.field,
              value:
                item.bindType === 2
                  ? item.bind
                  : item.bindType === 3
                  ? this.executeScriptResult
                  : this.getCurrentValue(item.bind),
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
            if (this.$requestConfig.getUserId) {
              ctx.userId = this.$requestConfig.getUserId()
            }
            if (this.$requestConfig.getOrgId) {
              ctx.orgId = this.$requestConfig.getOrgId()
            }
            if (this.$requestConfig.getPostId) {
              ctx.postId = this.$requestConfig.getPostId()
            }
          } catch (e) {
            console.log(this.t('ht.customDialog.getIdError'), e)
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
              if (param.pageBean) {
                param.pageBean.pageSize = -1
              }
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
            this.getDialoglistJson(requestParam).then(() => {
              this.checkList()
            })
          } catch (e) {
            this.$message.error(
              `${this.t('ht.customDialog.postRequestParamError')}${param}`
            )
          }
        } else {
          if (querys.length > 0) {
            queryFilter = this.handlePostData({
              pageBean: pageBean.pageBean,
              querys,
            })
            this.customDialog.pageBean = queryFilter
            this.getDialoglistJson(this.customDialog).then(() => {
              this.checkList()
            })
          } else {
            this.customDialog.pageBean = pageBean
            this.getDialoglistJson(this.customDialog).then(() => {
              this.checkList()
            })
          }
        }
        this.tableRadioVal = ''
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
      //重置
      reset() {
        this.queryParams.forEach((paramObj, index) => {
          for (let key in paramObj) {
            this.queryParams[index][key] = ''
          }
        })
        //组合树重置
        let nodes = {}
        if (this.$refs.combinationTree) {
          nodes = this.$refs.combinationTree.store.nodesMap
        }
        for (let key in nodes) {
          nodes[key].expanded = false
        }
        this.combinationTreeQuerys.splice(0)
        this.search(true)
      },
      getCurrentValue(bind) {
        let value = null
        const pInst = utils.getOnlineFormInstance(this)
        const bindPath = bind.replace(`${this.subPath}.`, '')
        if (this.sunIndex || this.sunIndex === 0) {
          value = utils.getValueByPath(
            this.currentSubData[this.subIndex],
            bindPath,
            this.sunIndex || this.sunIndex === 0 ? this.sunIndex : null
          )
        } else {
          value = utils.getValueByPath(
            pInst,
            bind,
            this.subIndex || this.subIndex === 0 ? this.subIndex : null
          )
        }
        return value
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
              // this_.tableRadioVal = res
              if (res != -1) {
                this_.isCurrentChange = true
                // this_.toggleRowSelection(res, true)
              }
            })
          }
        }, 300)
      },
      toggleRowSelection(res, val) {
        // this.$refs.orgTable.toggleRowSelection(this.dialogData[res], val)
      },
      //点击列表某一条数据时触发
      orgRowClick(row, column, event) {
        if (this.customDialog.selectNum === 1) {
          $(event.currentTarget.children[0].children[0].children[0]).trigger(
            'click'
          )
          this.selectOrgs = []
          this.selectOrgs.push(row)
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
        if (!data.Pid) {
          //不清楚是不是有地方数据返回是Pid，这里做个判断
          data.Pid = data.pid
        }
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
          this.pagination.page = 1
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
      dialogCancel() {
        const this_ = this
        this_.queryParam = ''
        this.setDialogData([])
        this_.customDialogShowList = false
        //判断是否是点击了确认再点击取消的  inputVal没有值则表示直接点击的取消
        if (!this_.inputVal) {
          this_.selectOrgs = []
        } else {
          this_.selectOrgs = this_.showData ? [...this_.showData] : ''
          this.checkBoxDataAll = [...this_.selectOrgs]
        }
      },
      afterOpen() {
        //打开对话框之后加载树
        this.loadCombinationTree()
      },
      dialogConfirm() {
        this.queryParam = ''
        this.$refs.orgTable.clearSelection()
        this.customDialogShowList = false
        this.calacInputSuffixHeight()
        this.syncInputValue()
      },
      // 同步选择结果
      syncInputValue() {
        let thisIndex = null //当前数据所在下标
        let parentIndex = null //父节点所在下标
        if (this.$parent.$el) {
          thisIndex = utils.getSubScopeElAndIndex(this.$parent.$el).index
          let subScopeEl = utils.getParentElementByClassNamePrefix(
            this.$parent.$parent.$el,
            'data-index'
          )
          if (subScopeEl) {
            const className = Array.prototype.find.call(
              subScopeEl.classList,
              (item) => item.startsWith('data-index__')
            )
            if (className) {
              parentIndex = className.split('__')[1]
            }
          }
          if (null == parentIndex) {
            subScopeEl = utils.getParentElementByAttribute(
              this.$parent.$parent.$el,
              'data-index'
            )
            if (subScopeEl && subScopeEl.attributes['data-index']) {
              parentIndex = subScopeEl.attributes['data-index'].value
            }
          }
        }
        var returnStr = JSON.parse(this.customDialog.resultfield)
        //拿到返回的字段
        var field = new Array([returnStr.length])
        var comment = new Array([returnStr.length])
        var str = []
        for (var i = 0; i < returnStr.length; i++) {
          field[i] = returnStr[i].field.toLowerCase()
          comment[i] = returnStr[i].comment.toLowerCase()
        }
        var s = this.selectOrgs
        if (this.selectOrgs) {
          this.showData = [...this.selectOrgs]
          this.checkBoxDataAll = [...this.selectOrgs]
        } else {
          this.showData = []
          this.checkBoxDataAll = []
        }
        if (this.customDialog.selectNum === 1) {
          s = this.selectOrgs
        }
        if (this.customDialog.selectNum === 1) {
          var temp = ''
          // 当 s 存在或 s 的长度不为0时
          if (s && s.length) {
            for (var k = 0; k < comment.length; k++) {
              let sField = !utils.isEmpty(s[0][field[k]]) ? s[0][field[k]] : ''
              let encodeStr = encodeURIComponent(sField)
              temp += '"' + comment[k] + '":"' + encodeStr + '",'
            }
          }
          if (temp != '') {
            temp = '{' + temp.substring(0, temp.length - 1) + '}'
          }
          str.push(utils.parseToJson(temp))
        } else {
          if (s && s.length > 0) {
            for (var m = 0; m < s.length; m++) {
              var temp1 = ''
              for (var j = 0; j < comment.length; j++) {
                const _m = s[m]
                const _n = field[j]
                const _ov = _m[_n] //原始值
                const _uv = _m[_n.toUpperCase()] //field转大写后取到的值
                const _lv = _m[_n.toLowerCase()] //field转小写后取到的值
                const _fv =
                  _ov == null || _ov == undefined
                    ? _uv == null || _uv == undefined
                      ? _lv
                      : _uv
                    : _ov
                const encodeStr = encodeURIComponent(_fv)
                temp1 += '"' + comment[j] + '":"' + encodeStr + '",'
              }
              if (temp1 != '') {
                temp1 = '{' + temp1.substring(0, temp1.length - 1) + '}'
              }
              str.push(utils.parseToJson(temp1))
            }
          }
        }
        const pInst = utils.getOnlineFormInstance(this)
        this.custdialog.custDialog.mappingConf.forEach((con) => {
          var val = ''
          var from = con.from.toLowerCase()
          str.forEach((item) => {
            if (item) {
              val +=
                decodeURIComponent(item[from]) == 'undefined'
                  ? ''
                  : decodeURIComponent(item[from]) + ','
            }
          })
          if (this.modelName == 'data.' + con['target'][0]) {
            val = val.substring(0, val.length - 1)
            utils.setValueByPath(
              pInst,
              'data.' + con['target'][0],
              val,
              thisIndex
            )
          } else if (
            this.modelName &&
            this.modelName.startsWith('searchForm.')
          ) {
            let prePath = pInst['searchForm'] ? '' : 'data.'
            utils.setValueByPath(
              pInst,
              prePath + 'searchForm.' + con['target'][0],
              val.substring(0, val.length - 1),
              thisIndex
            )
          } else {
            let configAttr = con['target'][0].split('.')
            let path = con['target'][0]
            if (configAttr.length == 4 && parentIndex >= 0) {
              //孙表数据赋值
              path =
                configAttr[0] +
                '.' +
                configAttr[1] +
                '[' +
                parentIndex +
                '].' +
                configAttr[2] +
                '.' +
                configAttr[3]
            }
            const _val = val.substring(0, val.length - 1)
            if (path) {
              if (this.modelName && this.modelName.endsWith(path)) {
                // this.$emit('input', _val)
                this.$emit('updateInput', _val)
              }
              utils.setValueByPath(
                pInst,
                `${pInst.data ? 'data.' : 'model.'}${path}`,
                _val,
                thisIndex
              )
            }
          }
        })
        //判断对话框是否绑定了关联查询
        let custQueryJson = this.custdialog.custDialog.custQueryJson
        if (custQueryJson.length > 0) {
          for (let i = 0; i < custQueryJson.length; i++) {
            if (custQueryJson[i].conditionfield.length > 0) {
              this.doQuery(custQueryJson[i])
            } else {
              console.error(
                '[' +
                  custQueryJson[i].comment +
                  ']' +
                  this.t('ht.customDialog.relationSearchNotBindField')
              )
            }
          }
        }
      },
      calacInputSuffixHeight() {
        this.$emit('calacInputSuffixHeight')
      },
      removeSelectOrg(item) {
        if (this.customDialog.selectNum === 1) {
          this.selectOrgs.splice(item, 1)
          this.showData.splice(item, 1)
        } else {
          //树形
          if (this.propsData.length > 0) {
            this.propsData.splice(item, 1)
          }
          if (this.showData.length > 0) {
            this.showData.splice(item, 1)
          }
          //列表
          if (this.selectOrgs != null) {
            this.selectOrgs.splice(item, 1)
            this.checkBoxDataAll.splice(item, 1)
          }
        }
        this.syncInputValue()
      },
      clearAll() {
        this.checkBoxDataAll = []
        this.selectOrgs = []
        this.showData = []
        this.propsData = []
        this.syncInputValue()
        this.setDialogData([])
        this.$refs.orgTable.clearSelection()
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
      // 处理POST请求时的参数
      handlePostData(queryFilter) {
        if (
          !this.customDialog.dataParam ||
          this.customDialog.dataParam.constructor != String
        ) {
          return queryFilter
        }
        // 构建上下文数据对象
        let ctx = {}
        queryFilter &&
          queryFilter.querys.forEach((element) => {
            ctx[element.property] = element.value
          })
        const exp = utils.parseExp(this.customDialog.dataParam, ctx)
        try {
          return JSON.parse(exp)
        } catch (e) {
          CustomQuery._throwException(
            `${this.t('ht.customDialog.postRequestParamError')}:` +
              this.customDialog.dataParam
          )
        }
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
                if (!v.Pid) {
                  //不清楚是不是有地方数据返回是Pid,这里做个判断
                  v.Pid = v.pid
                }
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
      //加载树的信息
      toTreeData(data, id, pid, name, pvalue) {
        // 建立个树形结构,需要定义个最顶层的父节点，pvalue是0
        return this.translateDataToTree(data, pid, id, name, pvalue)
      },
      translateDataToTree(data, pid, id) {
        //把树数据有子节点的数据全部过滤掉（只留父节点的数据）
        let tile2nest = utils.tile2nest(data, id, pid)
        return tile2nest || []
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
      loadCombinationTree() {
        if (this.customDialog.style != 2) {
          return
        }
        let combinationRule = JSON.parse(this.customDialog.combinationRule)
        this.combinationRule = combinationRule
        let treeAlias = combinationRule.leftTree
        //获取对话框数据
        this.$requestConfig.getCustomDialogByAlias(treeAlias).then((resp) => {
          let treeDialog = resp
          this.leftTreeTitle = treeDialog.name
          let requestType =
            treeDialog.dsType == 'dataSource'
              ? 'get'
              : treeDialog.requestType
              ? treeDialog.requestType
              : 'post'
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

          this.$requestConfig
            .request({
              url: requestParams.url,
              method: 'get',
            })
            .then((resp) => {
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
        })
      },
      //打开树形动态参数输入值的对话框
      handleSave() {
        this.customDialogTreeShow(this.pageParam)
        this.dialogVisible = false
      },
      //关闭树形动态参数输入值的对话框
      handleClose() {
        this.dialogVisible = false
      },
    },
  }
</script>
<style lang="scss" scoped>
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
  .custom-dialog_main {
    min-height: 350px;
  }
</style>
