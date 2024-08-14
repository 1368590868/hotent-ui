import utils from '@/utils.js'
import CustomQuery from '@/services/CustomQuery'

export default {
  props: {
    ganged: Object,
    props: {
      type: Object,
      default: function() {
        return {
          key: 'key',
          value: 'value',
        }
      },
    },
  },
  data() {
    return {
      _preParamsVal: null,
      isChangePage: false,
    }
  },
  computed: {
    propKey: function() {
      if (this.props && this.props.key) {
        return this.props.key
      }
      return 'key'
    },
    propValue: function() {
      if (this.props && this.props.value) {
        return this.props.value
      }
      return 'value'
    },
  },
  methods: {
    /**
     * 执行关联查询
     * @param {Object} params 构建好的关联查询条件，传null时会采用默认方法构建查询参数
     * @param {Boolean} morph  是否按照valueBind/labelBind重新组织返回的options
     * @returns Promise  resolve(options)、reject(error)
     */
    doCustomQuery: function(params, morph, config) {
      if (!this.ganged || !this.ganged.alias) {
        return new Promise((resolve) => resolve(null))
      }
      const paramsVal = params || this._prepareLoadParams(this.ganged.bind)
      // 查询参数不变时不触发关联查询
      if (utils.objectEquals(this._preParamsVal, paramsVal)) {
        return new Promise((resolve) => resolve(null))
      }
      // 记录上一次关联查询的参数
      this._preParamsVal = paramsVal
      if (!config) {
        let tempConfig = {
          page: 1,
        }
        config = tempConfig
      }
      paramsVal.page = config.page || 1
      return new Promise((resolve, reject) => {
        CustomQuery.load(this.ganged.alias, paramsVal, config)
          .then((data) => {
            this.ganged.needPage = data ? data.needPage : 0
            const resData =
              data && data.listKey
                ? utils.getValueByPath(data, data.listKey)
                : data && data.rows
            if (config.page) {
              const { paginationConfig } = data
              this.pageBean = {
                page: this.isChangePage
                  ? config.page
                  : data[paginationConfig.pageKey],
                pageSize: data[paginationConfig.pageSizeKey],
                total: data[paginationConfig.totalKey],
              }
            }
            if (!morph) {
              // 直接返回原始数据
              resolve(config.page ? resData : data)
            } else {
              // 按照回填值来构建选项
              const options = []
              const currentData = config.page ? resData : data
              currentData.forEach((m) => {
                const opt = {}
                if (this.ganged.valueBind) {
                  opt[this.propKey] = m[this.ganged.valueBind]
                }
                if (this.ganged.labelBind) {
                  opt[this.propValue] = m[this.ganged.labelBind]
                }
                options.push(opt)
              })
              // 指定了值绑定关系时，按照值对数组进行去重处理。
              if (this.ganged.valueBind) {
                resolve(options.unique(this.propKey))
              } else {
                resolve(options)
              }
            }
          })
          .catch((error) => {
            CustomQuery._throwException(error)
            reject(error)
          })
      })
    },
    // 准备查询参数
    _prepareLoadParams: function(condition) {
      let params = {}
      if (condition && !utils.isEmpty(condition)) {
        // 获取当前控件是否在子表某行中
        let { index } = utils.getSubScopeElAndIndex(this.$el)

        const pInst = utils.getOnlineFormInstance(this)
        Object.keys(condition).forEach((k) => {
          const bindSet = condition[k]
          let val = null
          // 参数绑定是对象
          if (bindSet.constructor == Object) {
            const bindSetKey = bindSet['key']
            const defaultVal = bindSet['default']
            const groovyScript = bindSet['groovyScript']
            if (bindSetKey) {
              val =
                index == null
                  ? utils.getValueByPath(pInst, bindSetKey)
                  : utils.getValueByPath(pInst, bindSetKey, index)
            }
            if (val == null || val == undefined) {
              val = defaultVal
            }
            if ((val == null || val == undefined) && groovyScript) {
              val = '{"groovyScript":"' + groovyScript + '"}'
            }
          }
          // 参数绑定是字符串
          else if (bindSet.constructor == String) {
            val =
              index == null
                ? utils.getValueByPath(pInst, bindSet)
                : utils.getValueByPath(pInst, bindSet, index)
          }
          if (!utils.isEmpty(val)) {
            params[k] = val
          }
        })
      }
      return params
    },
  },
}
