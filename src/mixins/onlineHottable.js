export default {
  watch: {
    hotTableFillback: function(newVal) {
      if (newVal) {
        let newValArray = newVal.split('_timestamp_')
        let boPathArray = newValArray[0].split('.')
        let hotTableRef = 'hottable.' + boPathArray[0] + '.' + boPathArray[1]
        let subBo = this.data[boPathArray[0]][boPathArray[1]]
        this.$refs.onlineForm.$refs[hotTableRef].fillbackHotTableData(subBo)
      }
    },
  },
  mounted() {
    this.isFormItemBorder()
    //初始化handsontable数据
    if (this.data) {
      const formId = this.formId
      let _this = this
      if (!formId) {
        this.toInitTemolateData(this.initFillData)
      } else {
        const loading = this.$loading({
          lock: true,
          text: _this.$t('ht.onlineHottable.loadingText'),
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })
        this.$requestConfig.getFormById(formId).then(
          (resp) => {
            if (resp.data) {
              const formData = resp.data.data
              for (const key in formData) {
                if (formData.hasOwnProperty(key)) {
                  if (!_this.data[key]) {
                    _this.data[key] = formData[key]
                  }
                }
              }
              loading.close()
              _this.toInitTemolateData(this.initFillData)
            } else {
              loading.close()
              _this.toInitTemolateData(this.initFillData)
            }
          },
          () => {
            loading.close()
            _this.toInitTemolateData(this.initFillData)
          }
        )
      }
    }
  },
  methods: {
    // 有边框时
    isFormItemBorder() {
      const cols = document.querySelectorAll('.el-row--flex .el-col-12')
      const colItems = Array.from(cols)
      if (colItems.length) {
        for (let i = 0; i < colItems.length; i++) {
          let item = colItems[i]
          if (
            item.style.borderStyle &&
            item.children &&
            item.children.length > 0
          ) {
            item.parentNode.style.marginBottom = '20px'
            Array.from(item.children).forEach((child) => {
              child.style.margin = '24px 24px 22px 24px'
            })
          } else {
            item.style.marginRight = '24px'
          }
        }
      }
    },
    toInitTemolateData(initFillData) {
      if (!this.data) {
        return
      }
      const formData = this.data
      let refs = this.$refs
      for (const def in formData) {
        if (formData.hasOwnProperty(def)) {
          const boDef = formData[def]
          for (const bo in boDef) {
            if (boDef.hasOwnProperty(bo) && bo.indexOf('sub_') == 0) {
              const ref = 'hottable.' + def + '.' + bo
              if (refs[ref]) {
                try {
                  refs[ref].fillbackHotTableData(
                    formData[def][bo],
                    this.permission
                  )
                  if (initFillData) {
                    refs[ref].initTemplateData()
                  }
                } catch (error) {
                  error
                }
              }
            }
          }
        }
      }
    },
    addInitTemplateData(subTablePath) {
      const hotTableRef = 'hottable.' + subTablePath
      this.$refs[hotTableRef].toAddInitTemplateData()
    },
    mergeCellRefresh(subTablePath) {
      const hotTableRef = 'hottable.' + subTablePath
      this.$refs[hotTableRef].mergeCellRefresh()
    },
    execCellMathExp(subTablePath) {
      const hotTableRef = 'hottable.' + subTablePath
      this.$refs[hotTableRef].execCellMathExp()
    },
    execCrossMapping(subTablePath) {
      const hotTableRef = 'hottable.' + subTablePath
      this.$refs[hotTableRef].execCrossMapping()
    },
    getHotTableData(subTablePath) {
      const hotTableRef = 'hottable.' + subTablePath
      this.$refs[hotTableRef].getHotTableData()
    },
  },
}
