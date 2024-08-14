<template>
  <div>
    <van-action-sheet
      v-model="customDialogShowList"
      :cancel-text="sureButtonText"
      class="mobile-van-action min-height-action"
      :class="{ 'disabled-btn': isDisabledConfirmBtn }"
      get-container="body"
      @cancel="handleDialogSure"
      @click-overlay="dialogCancel"
      @opened="afterOpen"
    >
      <template #description>
        <span class="dialog-mobile__title">{{ customDialog.name }}</span>
        <ht-icon
          class="dialog-mobile__close"
          name="close"
          @click="dialogCancel"
        />
      </template>
      <template>
        <div class="search-box">
          <ht-icon
            scale="1.2"
            class="unfold-icon"
            :name="isShowMoreSearch ? 'upFold' : 'downUnfold'"
            @click="isShowMoreSearch = !isShowMoreSearch"
          />
          <div
            v-for="(condition, index) in conditionBind"
            v-show="index === 0 || (index > 0 && isShowMoreSearch)"
            :key="index"
            class="search-item"
          >
            <p>{{ condition.comment }}:</p>
            <div v-if="condition.controllerType == '1'">
              <el-input
                v-model="queryParams[index][condition.field]"
                size="small"
                clearable
                :placeholder="placeholders[index]"
                @change="searchInputChange"
                @keyup.enter.native="hideSearch"
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
                :options="condition.config.options"
              ></ht-select>
              <eip-select-dia
                v-else
                v-model="queryParams[condition.field]"
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
          <div v-show="isShowMoreSearch" class="search-btns">
            <el-button
              style="margin-left: 20px"
              size="small"
              type="primary"
              @click="hideSearch"
            >
              {{ t('ht.common.search') }}
            </el-button>
            <el-button size="small" @click="reset">
              {{ t('ht.common.reset') }}
            </el-button>
          </div>
        </div>

        <!-- <van-search
          v-if="conditionBind && conditionBind.length"
          v-model="searchWord"
          :placeholder="searchPlaceholder"
          clearable
          @search="onRefresh"
          @clear="onRefresh"
        /> -->
      </template>

      <!-- 树形选择 -->
      <van-popover
        v-if="customDialog.style == 2"
        v-model="isSelectTreeShow"
        trigger="click"
        class="custom-dialog-popover"
      >
        <template #reference>
          <div class="mobile-tree-select">
            <span v-if="treeSelectText" class="active-text">
              {{ treeSelectText }}
            </span>
            <span v-else>{{ t('ht.common.select') }}{{ leftTreeTitle }}</span>
            <ht-icon
              v-if="treeSelectText"
              class="dialog-mobile__close"
              name="close"
              @click.stop="clearTreeSelect"
            />
          </div>
        </template>
        <div class="custom-dialog-popover_content">
          <el-tree
            ref="combinationTree"
            :data="combinationTreeData"
            :props="defaultProps"
            :node-key="nodeKey"
            highlight-current
            :check-on-click-node="true"
            @node-click="combiTreeClick"
          ></el-tree>
        </div>
      </van-popover>
      <van-pull-refresh v-model="isDownLoading" @refresh="onRefresh">
        <van-list
          v-model="isPullLoading"
          :finished="finished"
          :finished-text="t('ht.common.noMore')"
          :offset="20"
          :immediate-check="false"
          @load="loadMore"
        >
          <!-- <van-checkbox-group v-model="selectIds"> -->
          <van-cell v-for="(item, index) in dialogData" :key="index" clickable>
            <template #icon>
              <van-checkbox
                :value="indexArray(selectIds, item) > -1"
                :shape="customDialog.selectNum === 1 ? 'round' : 'square'"
                @click="checkboxChange(item)"
              />
            </template>
            <div class="custom-mobile_box">
              <div
                v-for="field in displayfield"
                :key="field.field"
                class="custom-mobile_box_item"
              >
                <label>{{ field.comment }}：</label>
                <div>{{ item[field.field] }}</div>
              </div>
            </div>
          </van-cell>
          <!-- </van-checkbox-group> -->
        </van-list>
      </van-pull-refresh>
    </van-action-sheet>
    <van-action-sheet
      v-model="dialogVisible"
      :cancel-text="sureButtonText"
      class="mobile-van-action"
      get-container="body"
      @cancel="handleSave"
    >
      <template #description>
        <span class="dialog-mobile__title">
          {{ t('ht.customDialog.dynamicIncomingParameterQuery') }}
        </span>
        <ht-icon
          class="dialog-mobile__close"
          name="close"
          @click="dialogVisible = false"
        />
      </template>
      <van-cell-group>
        <div
          v-for="(item, $index) in conditionfieldTree.filter(
            (k) => k.defaultType == '4'
          )"
          :key="$index"
        >
          <van-field
            v-if="item.type != 'date'"
            v-model="item.paramVal"
            :label="item.comment"
            :placeholder="t('ht.common.enter') + item.comment"
          />
          <ht-date
            v-if="item.type == 'date'"
            v-model="item.paramVal"
            style="width: 100%"
            :placeholder="t('ht.common.select') + item.comment"
            format="yyyy-MM-dd"
          ></ht-date>
        </div>
      </van-cell-group>
    </van-action-sheet>
    <van-action-sheet
      v-model="customDialogShowTree"
      :cancel-text="sureButtonText"
      class="mobile-van-action"
      get-container="body"
      @cancel="dialogTreeConfirm"
    >
      <template #description>
        <span class="dialog-mobile__title">{{ customDialog.name }}</span>
        <ht-icon
          class="dialog-mobile__close"
          name="close"
          @click="dialogCancelTree"
        />
      </template>
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
    </van-action-sheet>
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import locale from '@/mixins/locale.js'
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import dialog from './customDialog.js'
  import CustomQuery from '@/services/CustomQuery'
  export default {
    name: 'CustomMobileDialog',
    mixins: [dialog, locale, inputName, permission, form],
    props: {
      custdialog: {
        type: Object,
        default: () => {
          return {}
        },
      },
      subIndex: Number,
      sunIndex: Number,
      subPath: String,
      currentSubData: Array,
    },
    data() {
      return {
        isShowMoreSearch: false,
        treeSelectText: '', // 组合树时选中的查询条件
        isSelectTreeShow: false, // 组合树显示隐藏
        searchWord: '', // 关键字查询
        isPullLoading: false,
        isDownLoading: false,
        selectIds: [], // 选中的index集合
        finished: false,
        dialogVisible: false, //打开树形输入动态参数值的对话框
        pageParam: {}, //树形对话框参数
        conditionfieldTree: [], //树形对话框条件字段
        conditionBind: [], //参数查询字段
        nodeKey: 'ID_', //树形数据父Id
        customDialogShowList: false,
        customDialogShowTree: false,
        selectOrgs: [],
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
        isCurrentChange: false, //是否不执行 orgTableSelection方法
        param: [], //绑定的表单字段
        treeList: [],
        displayField: {},
        queryParams: [],
        placeholders: [],
        // oldselectOrgs: [],
        combinationTreeData: [], // 组合树 数据
        combiTreeDisplayField: [],
        combinationTreeQuerys: [],
        combinationRule: {},
        leftTreeTitle: '',
        fixedParams: {}, // 传过来的固定值
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
      searchPlaceholder() {
        let arr = []
        this.conditionBind.forEach((item) => {
          arr.push(item.comment)
        })
        return arr.length
          ? arr.join(',')
          : `${this.t('ht.common.enter')}${this.t('ht.common.keyword')}`
      },
      sureButtonText() {
        const selectedText =
          this.selectIds.length > 0 ? `(${this.selectIds.length})` : ''
        return `${this.$t('ht.common.confirm')}${selectedText}`
      },
    },
    watch: {
      selectIds(val) {
        if (val && val.length) {
          this.isDisabledConfirmBtn = false
        } else {
          this.isDisabledConfirmBtn = true
        }
      },
    },
    methods: {
      searchInputChange() {
        if (!this.isShowMoreSearch) {
          this.search(true)
        }
      },
      hideSearch() {
        this.isShowMoreSearch = false
        this.search(true)
      },
      // 清空选择树内容
      clearTreeSelect() {
        this.treeSelectText = ''
        this.$refs.combinationTree.setCurrentKey(null)
        this.combinationTreeQuerys.splice(0)
        this.isSelectTreeShow = false
        this.search(true)
      },
      checkboxChange(item) {
        let index = this.indexArray(this.selectIds, item)
        // 如果已选中 就取消选中
        if (index > -1) {
          this.selectIds.splice(index, 1)
          return
        }
        // 未选中且是多选时 直接放入
        if (this.customDialog.selectNum !== 1) {
          this.selectIds.push(item)
          return
        }
        // 未选中单选时
        this.selectIds = [item]
      },
      handleDialogSure() {
        this.dialogConfirm()
      },
      loadMore() {
        if (this.dialogData && this.dialogData.length > 0) {
          this.pagination.page++
        }
        this.search()
      },
      onRefresh() {
        this.search(true)
      },
      showDialog() {
        this.selectIds = []
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
                // bindType 1 表单字段 2固定 3脚本
                if (ele.defaultType == '3' && ele.bindType === 2) {
                  this_.fixedParams[ele.field] = ele.bind || ''
                }
              })
            }

            //判断对话框查询是否有条件
            let userInputList = JSON.parse(customDialog.conditionfield)
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
            if (customDialog.style == 0 || customDialog.style == 2) {
              //列表
              this_.customDialogShow({
                alias: alias,
                customDialog: customDialog,
              })
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
              if (JSON.stringify(param) != '{}') {
                this_.dialogVisible = true
              } else {
                //无动态传入的字段
                this_.customDialogTreeShow(this_.pageParam)
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
          this.search(true)
          this.displayfield = JSON.parse(pageParam.customDialog.displayfield)
          if (this.customDialog.dsType == 'dataSource') {
            for (var i = 0; i < this.displayfield.length; i++) {
              this.displayfield[i].field = this.displayfield[
                i
              ].field.toLowerCase()
            }
          }
        } else if (this.dialogData.length > 1) {
          this.search(true)
        }
        if (this.dialogData.length > 0 && this.displayfield.length == 0) {
          this.search(true)
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
          ctx.pageSize = pageBean.pageBean.pageSize
          ctx.page = pageBean.pageBean.page
          ctx.total = pageBean.pageBean.total
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
          const queryParamMap = this.getSearchValueByKey()

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
      checkList() {
        const { page, pageSize, total } = this.pagination
        if (page > 0 && pageSize > 0 && total > 0) {
          this.finished = page * pageSize >= total
        } else {
          this.finished = true
        }
        this.isDownLoading = false
        this.isPullLoading = false

        // const this_ = this
        // setTimeout(() => {
        //   //列表
        //   if (
        //     this_.checkBoxDataAll != undefined &&
        //     this_.checkBoxDataAll.length > 0
        //   ) {
        //     this_.checkBoxDataAll.forEach((row) => {
        //       let res = this_.indexArray(this_.dialogData, row)
        //       this_.undefineda = res
        //       if (res != -1) {
        //         this_.isCurrentChange = true
        //         this_.toggleRowSelection(res, true)
        //       }
        //     })
        //   }
        // }, 300)
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
      dialogCancel() {
        const this_ = this
        this_.queryParam = ''
        this.setDialogData([])
        this_.customDialogShowList = false
      },
      afterOpen() {
        //打开对话框之后加载树
        this.loadCombinationTree()
      },
      dialogConfirm() {
        this.queryParam = ''
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
        this.selectOrgs = [...this.selectIds]
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
              let sField = s[0][field[k]] === undefined ? '' : s[0][field[k]]
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
              val += decodeURIComponent(item[from]) + ','
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
      // getSelected() {
      //   let arr = []
      //   this.selectIds.forEach((item) => {
      //     debugger
      //     let obj = this.dialogData.find((sub) => {
      //       return sub.id_ === item
      //     })
      //     if (obj) {
      //       arr.push(obj)
      //     }
      //   })

      //   return arr
      // },
      calacInputSuffixHeight() {
        this.$emit('calacInputSuffixHeight')
      },
      removeSelectOrg(item) {
        // 单选时
        if (this.customDialog.selectNum === 1) {
          this.selectIds.splice(item, 1)
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
          if (this.selectIds) {
            this.selectIds.splice(item, 1)
            // this.checkBoxDataAll.splice(item, 1)
          }
        }
        this.syncInputValue()
      },
      //判断数据是否包含某个对象，并返回数据包含对象的下标
      indexArray(array, item) {
        if (array.length == 0) {
          return -1
        }
        for (let i = 0; i < array.length; i++) {
          if (utils.objectEquals(array[i], item)) {
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
            this.t('ht.customDialog.postRequestParamError') +
              this.customDialog.dataParam
          )
        }
      },
      dialogCancelTree() {
        this.setDialogData([])
        this.customDialogShowTree = false
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
        this.treeSelectText = paramObj[this.defaultProps.label]
        this.isSelectTreeShow = false
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
  ::v-deep .custom-dialog-popover {
    width: 100%;
    .mobile-tree-select {
      background: #f6f6f6;
      border-radius: 6px;
      color: #c1c1c1;
      font-size: 14px;
      margin: 10px 20px;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .active-text {
        font-weight: bold;
        color: $base-color-blue;
        flex: 1;
      }
    }
  }
  ::v-deep .custom-dialog-popover_content {
    width: 300px;
    max-height: 300px;
    overflow-y: auto;
  }

  .custom-mobile_box {
    .custom-mobile_box_item {
      display: flex;
      align-items: center;
      > label {
        width: 100px;
        text-align: right;
      }
      > div {
        flex: 1;
      }
    }
  }
  ::v-deep .mobile-van-action {
    &.min-height-action {
      min-height: 50%;
    }
    .dialog-mobile__title {
      font-size: 18px;
      color: #1a1a1a;
    }
    .dialog-mobile__close {
      float: right;
    }
    .van-action-sheet__cancel {
      padding: 5px;
      background: $base-color-blue;
      color: $base-color-white;
    }
    .search-box {
      padding-right: 60px;
      position: relative;
      > .unfold-icon {
        position: absolute;
        right: 20px;
        top: 17px;
      }
      .search-item {
        display: flex;
        align-items: center;
        > p {
          width: 90px;
          font-size: 14px;
          text-align: right;
          margin-right: 10px;
        }
        > div {
          flex: 1;
          overflow: hidden;
        }
      }
      .search-btns {
        text-align: center;
      }
    }
  }
</style>
<style lang="scss">
  .custom-dialog-popover_content {
    width: 300px;
    max-height: 200px;
    padding: 10px 5px;
    overflow-y: auto;
  }
  .disabled-btn {
    .van-action-sheet__cancel {
      pointer-events: none;
      color: #d9d9d9;
    }
  }
</style>
