import SubPagination from '../services/SubPagination.js'

export default {
  data() {
    return {
      fillOrg: {},
      fillOrgConfMap: {},
      transitionIndex: -1,
      left_image: '',
      right_image: '',
    }
  },
  computed: {
    // 子表前端分页过滤器
    pagingSubData() {
      const me = this
      return function(datapath) {
        // 通过子表数据路径获取分页数据
        return SubPagination.pagingByPath(datapath, me)
      }
    },
    // 获取子表分页 offset
    getPageOffset() {
      return (datapath) => {
        return SubPagination.getPageOffset(datapath, this)
      }
    },
  },
  mounted() {
    // 如果当前表单的element为Comment说明表单加载失败了。
    if (this.$el && this.$el.constructor == Comment) {
      this.$emit('load-fail')
      return
    }
    this.$validator = this.$root.$validator
    if (this.permission.table) {
      for (let subTableName in this.permission.table) {
        if (this.permission.table[subTableName].required) {
          this.addSubTableByName(subTableName)
        }
      }
    }
    this.$emit('load-success', true)
    if (this.isPrint) {
      this.printDetail()
    }
  },
  methods: {
    getExpandArr(data, type) {
      if (type === 'expand' && data) {
        let arr = []
        data.forEach((item) => {
          arr.push(item.sub_guid)
        })
        return arr
      }
      return data && data.length ? [data[0].sub_guid] : []
    },
    printDetail() {
      window.print()
      if (this.isPrint) {
        this.$router.go(-1)
      }
      setTimeout(function() {
        location.reload()
      }, 200)
    },
    //子表上移
    up(index, data) {
      if (index === 0) {
        this.$message({
          message: this.$t('ht.subTable.upWarning'),
          type: 'warning',
        })
      } else {
        let temp = data[index - 1]
        this.$set(data, index - 1, data[index])
        this.$set(data, index, temp)
      }
    },
    //子表下移
    down(index, data) {
      if (index === data.length - 1) {
        this.$message({
          message: this.$t('ht.subTable.downWarning'),
          type: 'warning',
        })
      } else {
        this.isTransition = true
        let i = data[index + 1]
        this.$set(data, index + 1, data[index])
        this.$set(data, index, i)
      }
    },
    //子表复制数据
    copy(obj, item, subPath) {
      let newOne = JSON.parse(JSON.stringify(item))
      //把id置空以免走的修改方法
      if (newOne.id_) {
        delete newOne.id_
      }
      if (newOne.sub_row_readonly) {
        delete newOne.sub_row_readonly
      }
      //有孙表时，删除孙表id_
      for (let key in newOne) {
        if (key.startsWith('sub_') && Array.isArray(newOne[key])) {
          if (newOne[key].length) {
            newOne[key].forEach((it) => {
              it.id_ && delete it.id_
            })
          }
        }
      }
      if (subPath) {
        const watchMap = this.watchMap
        // 判断当前是否有绑定流水号的字段
        if (watchMap) {
          const bindIdentityModelNameList = watchMap.get(
            'bindIdentityModelNameList'
          )
          if (
            bindIdentityModelNameList &&
            bindIdentityModelNameList.length > 0
          ) {
            bindIdentityModelNameList.forEach((bim) => {
              if (bim.startsWith(subPath)) {
                // 如果有则删除复制数据中原来的流水号值
                delete newOne[bim.replace(`${subPath}.`, '')]
              }
            })
          }
        }
      }
      newOne.sub_guid = this.guid()
      this.$root.$emit('add-new-collapse-item', newOne.sub_guid)
      obj.push(newOne)
      this.$forceUpdate()
    },
    //子表默认值回填
    addSubTab(subTabPath) {
      let pathArr = subTabPath.split('.')
      if (pathArr.length < 3) {
        this.$message({
          message: this.$t('ht.subTable.subTablePathError'),
          type: 'warning',
        })
      } else {
        let subTabName = pathArr[2].replace('sub_', '')
        let subInitData = this.data[pathArr[1]].initData[subTabName] || {}
        //判断当前子表是否存有回显值
        if (
          this.$parent.subBackfill &&
          this.$parent.subBackfill.has(subTabPath)
        ) {
          subInitData = this.$parent.subBackfill.get(subTabPath)
        }
        //把数组里面的值为 null 转换为空字符串
        let str = JSON.stringify(subInitData).replace(/null/g, '""')
        let subData = JSON.parse(str)
        const subDataArr = this.data[pathArr[1]][pathArr[2]]
        //子表添加后的长度，因为在nextTick中，子表已经添加完毕。
        const nextIndex = subDataArr.length
        for (var key in subData) {
          //点添加时判断要新增子表记录中的孙表是否有值
          if (key.indexOf('sub_') == 0) {
            if (subData[key].length > 0) {
              subData[key] = [] //有则清空
            }
            const sunTabName = key.replace('sub_', '')
            if (
              this.permission.table[sunTabName] &&
              (this.permission.table[sunTabName].required == true ||
                this.permission.table[sunTabName].required == 'true')
            ) {
              this.$nextTick(() => {
                this.addSunTab(`${subTabPath}.${key}`, nextIndex)
              })
            }
          }
        }
        let fillObj = this.toFillOrg(pathArr[1] + '.' + pathArr[2], subData)
        fillObj.sub_guid = this.guid()
        this.$root.$emit('add-new-collapse-item', fillObj.sub_guid)
        subDataArr.push(fillObj)
      }
    },
    //子表添加头部样式
    handleCellStyle({ column }) {
      let ColBgColor
      if (column.className) {
        ColBgColor = column.className.split('__')[1]
      }
      return ColBgColor ? { background: ColBgColor } : {}
    },
    //子表表头颜色
    handleRowStyle(color) {
      return { '--headerBgColor': color ? color : '#f4f4f4' }
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
    //孙表默认值回填
    addSunTab(subTabPath, index) {
      let pathArr = subTabPath.split('.')
      if (pathArr.length < 4) {
        this.$message({
          message: this.$t('ht.subTable.sunTablePathError'),
          type: 'warning',
        })
      } else {
        const subTablePath = pathArr.filter((item, index) => index !== 3)
        const subIndex = this.getPageOffset(subTablePath.join('.')) + index
        let subTabName = pathArr[2].replace('sub_', '')
        let sunTabName = pathArr[3].replace('sub_', '')
        let subTable = this.data[pathArr[1]][pathArr[2]][subIndex]
        if (!subTable.hasOwnProperty(pathArr[3])) {
          this.$set(subTable, pathArr[3], new Array())
        }
        let subInitData =
          this.data[pathArr[1]].initData[subTabName].initData[sunTabName] || {}
        //判断当前孙表是否存有回显值
        if (
          this.$parent.subBackfill &&
          this.$parent.subBackfill.has(subTabPath)
        ) {
          //this.data[pathArr[1]][pathArr[2]].push(this.$parent.subBackfill.get(subTabPath));
          subInitData = this.$parent.subBackfill.get(subTabPath)
        }
        //把数组里面的值为 null 转换为空字符串
        let str = JSON.stringify(subInitData).replace(/null/g, '""')
        if (!this.data[pathArr[1]][pathArr[2]][subIndex][pathArr[3]]) {
          let key = [pathArr[3]]
          let value = new Array()
          this.data[pathArr[1]][pathArr[2]][subIndex][key] = value
        }
        let sunBodata = JSON.parse(str)
        sunBodata.sub_guid = this.guid()
        this.data[pathArr[1]][pathArr[2]][subIndex][pathArr[3]].push(sunBodata)
        this.$root.$emit('add-new-collapse-item', sunBodata.sub_guid)
        this.$forceUpdate() //迫使 Vue 实例重新渲染
      }
    },

    addSubTableByName(subTableName) {
      for (let boAlias in this.data) {
        let subInitData = JSON.parse(
          JSON.stringify(this.data[boAlias].initData[subTableName] || {})
        )
        if (
          this.data[boAlias]['sub_' + subTableName] &&
          this.data[boAlias]['sub_' + subTableName].length < 1
        ) {
          this.data[boAlias]['sub_' + subTableName].push(
            JSON.parse(JSON.stringify(subInitData))
          )
          // 孙表必填 默认添加一条
          if (this.permission.table) {
            for (let tableName in this.permission.table) {
              if (this.permission.table[tableName].required) {
                if (
                  this.data[boAlias]['sub_' + subTableName][0].hasOwnProperty(
                    'sub_' + tableName
                  ) &&
                  this.data[boAlias]['sub_' + subTableName][0][
                    'sub_' + tableName
                  ] &&
                  this.data[boAlias]['sub_' + subTableName][0][
                    'sub_' + tableName
                  ].length < 1
                ) {
                  this.data[boAlias]['sub_' + subTableName][0][
                    'sub_' + tableName
                  ].push(
                    JSON.parse(JSON.stringify(subInitData.initData[tableName]))
                  )
                } else if (
                  this.data[boAlias]['sub_' + subTableName][0].hasOwnProperty(
                    'sub_' + tableName
                  ) &&
                  !this.data[boAlias]['sub_' + subTableName][0][
                    'sub_' + tableName
                  ]
                ) {
                  this.data[boAlias]['sub_' + subTableName][0][
                    'sub_' + tableName
                  ] = []
                  this.data[boAlias]['sub_' + subTableName][0][
                    'sub_' + tableName
                  ].push(subInitData.initData[tableName])
                }
              }
            }
          }
        }
      }
    },
    deleteRow(subTablePath, item) {
      let pathArr = subTablePath.split('.')
      if (pathArr.length < 2) {
        this.$message({
          message: this.$t('ht.subTable.subTablePathError'),
          type: 'warning',
        })
      } else {
        let subTabName = pathArr[1].replace('sub_', '')
        if (
          this.data[pathArr[0]][pathArr[1]].length == 1 &&
          (this.permission.table[subTabName].required == true ||
            this.permission.table[subTabName].required == 'true')
        ) {
          this.$message({
            message: this.$t('ht.global.subTableRequired'),
            type: 'warning',
          })
          return
        }
        this.data[pathArr[0]][pathArr[1]].remove(item)
      }
    },
    deleteSunRow(subTablePath, item, subIndex) {
      let pathArr = subTablePath.split('.')
      if (pathArr.length < 3) {
        this.$message({
          message: this.$t('ht.subTable.sunTablePathError'),
          type: 'warning',
        })
      } else {
        let subTabName = pathArr[1].replace('sub_', '')
        let sunTabName = pathArr[2].replace('sub_', '')
        if (
          this.data[pathArr[0]][pathArr[1]][subIndex][pathArr[2]].length == 1 &&
          (this.permission.table[sunTabName].required == true ||
            this.permission.table[subTabName].required == 'true')
        ) {
          this.$message({
            message: this.$t('ht.global.sunTableRequired'),
            type: 'warning',
          })
          return
        }
        this.data[pathArr[0]][pathArr[1]][subIndex][pathArr[2]].remove(item)
        this.data = Object.assign({}, this.data)
      }
    },
    clearAllMessageBox(data) {
      this.$confirm(
        this.$t('ht.subTable.clearAllTip'),
        this.$t('ht.common.tips'),
        {
          confirmButtonText: this.$t('ht.common.confirm'),
          cancelButtonText: this.$t('ht.common.cancle'),
          type: 'warning',
        }
      )
        .then(() => {
          this.clearAll(data)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('ht.subTable.cancelOperate'),
          })
        })
    },
    clearAll(args) {
      const { subTablePath, isHot, index } = args
      let pathArr
      if (!subTablePath) {
        pathArr = args.split('.')
      } else {
        pathArr = subTablePath.split('.')
      }

      if (pathArr.length < 2) {
        this.$message({
          message: this.$t('ht.subTable.subTablePathError'),
          type: 'warning',
        })
        //孙表
      } else if ((index || index === 0) && pathArr.length == 3) {
        const sunTabName = pathArr[2].replace('sub_', '')
        if (
          this.permission.table[sunTabName].required == true ||
          this.permission.table[sunTabName] == 'true'
        ) {
          this.$message.warning(this.$t('ht.subTable.deleteSunTableTip'))
          return
        }
        const _subPath = `data.${pathArr[0]}.${pathArr[1]}`
        const subIndex = this.getPageOffset(_subPath) + index
        const ary = this.data[pathArr[0]][pathArr[1]][subIndex][pathArr[2]]
        if (ary instanceof Array) {
          ary.splice(0, ary.length)
        }
      } else {
        const subTabName = pathArr[1].replace('sub_', '')
        if (
          this.data[pathArr[0]][pathArr[1]].length == 1 &&
          (this.permission.table[subTabName].required == true ||
            this.permission.table[subTabName].required == 'true')
        ) {
          this.$message({
            message: this.$t('ht.subTable.deleteSubTableTip'),
            type: 'warning',
          })
          return
        }
        const ary = this.data[pathArr[0]][pathArr[1]]
        if (ary instanceof Array) {
          ary.splice(0, ary.length)
        }
        if (isHot) {
          const hotTableRef = 'hottable.' + subTablePath
          this.$refs[hotTableRef].fillbackHotTableData(null)
        }
      }
    },
    toFillOrg(path, row) {
      const fillOrgConf = this.fillOrgConfMap[path]
      let fillObj = {}
      if (fillOrgConf && this.fillOrg) {
        if (fillOrgConf.name) {
          const namePath = fillOrgConf.name.split('.')
          fillObj[namePath[namePath.length - 1]] = this.fillOrg.name
        }
        if (fillOrgConf.id) {
          const idPath = fillOrgConf.id.split('.')
          fillObj[idPath[idPath.length - 1]] = this.fillOrg.id
        }
        if (fillOrgConf.code) {
          const codePath = fillOrgConf.code.split('.')
          fillObj[codePath[codePath.length - 1]] = this.fillOrg.code
        }
        if (fillOrgConf.instId) {
          const instIdPath = fillOrgConf.instId.split('.')
          fillObj[instIdPath[instIdPath.length - 1]] = this.$parent.$parent
            .instId
            ? this.$parent.$parent.instId
            : ''
        }
        return { ...row, ...fillObj }
      }
      return row
    },
    initFill(path, conf) {
      //收集自动回填信息
      if (path && conf) {
        try {
          const confJson = this.fillOrgConfMap[path]
            ? this.fillOrgConfMap[path]
            : JSON.parse(conf)
          if (
            confJson.id ||
            confJson.code ||
            confJson.name ||
            confJson.instId
          ) {
            this.fillOrgConfMap[path] = confJson
            this.initFirstFill(path, confJson)
          }
        } catch (error) {
          error
        }
      }
    },
    initFirstFill(path, conf) {
      //处理第一行的回填
      const paths = path.split('.')
      if (
        this.data[paths[0]][paths[1]] &&
        this.data[paths[0]][paths[1]].length == 1 &&
        this.fillOrg.id
      ) {
        if (conf.id) {
          const idPath = conf.id.split('.')
          if (!this.data[paths[0]][paths[1]][0][idPath[2]]) {
            this.data[paths[0]][paths[1]][0][idPath[2]] = this.fillOrg.id
            if (conf.code) {
              const codePath = conf.code.split('.')
              if (!this.data[paths[0]][paths[1]][0][codePath[2]]) {
                this.data[paths[0]][paths[1]][0][
                  codePath[2]
                ] = this.fillOrg.code
              }
            }
            if (conf.name) {
              const namePath = conf.name.split('.')
              if (!this.data[paths[0]][paths[1]][0][namePath[2]]) {
                this.data[paths[0]][paths[1]][0][
                  namePath[2]
                ] = this.fillOrg.name
              }
            }
          }
        }
        if (conf.instId) {
          const instIdPath = conf.instId.split('.')
          if (!this.data[paths[0]][paths[1]][0][instIdPath[2]]) {
            this.data[paths[0]][paths[1]][0][instIdPath[2]] = this.$parent
              .$parent.instId
              ? this.$parent.$parent.instId
              : ''
          }
        }
      }
    },
    isShowAddButton(path, maxRow, subIndex) {
      if (maxRow === 0) return false
      let pathArr = path.split('.')
      if (subIndex >= 0) {
        if (pathArr.length < 4) {
          this.$message({
            message: this.$t('ht.subTable.subTablePathError'),
            type: 'warning',
          })
        } else {
          let data =
            this.data[pathArr[1]][pathArr[2]][subIndex][pathArr[3]] || []
          return data.length >= maxRow
        }
      } else {
        if (pathArr.length < 3) {
          this.$message({
            message: this.$t('ht.subTable.subTablePathError'),
            type: 'warning',
          })
        } else {
          let data = this.data[pathArr[1]][pathArr[2]] || []
          return data.length >= maxRow
        }
      }
      return false
    },
  },
}
