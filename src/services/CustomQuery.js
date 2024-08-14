import Vue from 'vue'
import utils from '../utils.js'
import { Message } from 'element-ui'

const CustomQuery = {
  /**
   * 通过别名获取关联查询定义
   */
  get: (alias) => {
    return new Promise((resolve, reject) => {
      if (!alias) {
        reject('alias can not be null.')
      }
      Vue.prototype.$requestConfig
        .getCustomQuery(alias)
        .then((response) => resolve(response))
        .catch((error) => reject(error))
    })
  },
  /**
   * 传入关联查询别名和查询参数，返回查询到的数据
   */
  load: (alias, params, config) => {
    return new Promise((resolve, reject) => {
      CustomQuery.get(alias).then(
        (query) => {
          // 执行关联查询
          CustomQuery._doQuery(
            { ...query, config },
            params,
            config && config.page ? 'pagination' : '1',
            (data) => {
              let newData = null
              if (config && config.page) {
                newData = {
                  listKey: query.listKey,
                  paginationConfig: {
                    pageKey: query.pageKey,
                    pageSizeKey: query.pageSizeKey,
                    totalKey: query.totalKey,
                  },
                  needPage: query.needPage,
                }
                if (data.constructor === Array) {
                  newData = {
                    [query.listKey ? query.listKey : 'rows']: data,
                    ...newData,
                  }
                } else {
                  newData = {
                    ...data,
                    ...newData,
                  }
                }
              } else {
                newData = data
              }
              resolve(newData)
            }
          )
        },
        () => {
          reject()
        }
      )
    })
  },
  _throwException: (msg) => {
    Message.error(msg)
    throw msg
  },
  // 处理POST请求时的参数
  _handlePostData: (query, queryParams) => {
    if (!query.dataParam || query.dataParam.constructor != String) {
      return queryParams
    }
    // 构建上下文数据对象
    let ctx = {}
    queryParams &&
      queryParams.forEach((element) => {
        ctx[element.key] = element.value
      })
    const exp = utils.parseExp(query.dataParam, ctx)
    try {
      return JSON.parse(exp)
    } catch (e) {
      CustomQuery._throwException(
        `POST参数不是有效的JSON格式${query.dataParam}`
      )
    }
  },
  // 处理GET请求的URL（GET请求的查询参数追加到URL后面）
  _handleGetUrl: (url, queryParams) => {
    if (!url) {
      CustomQuery._throwException('Restful类型的url地址为空')
    }
    let urlParamsAry = []
    queryParams &&
      queryParams.forEach((q) => {
        urlParamsAry.push(`${q.key}=${q.value}`)
      })
    const linkWord = url.indexOf('?') == -1 ? '?' : '&'
    return `${url}${linkWord}${urlParamsAry.join('&')}`
  },
  _doQuery: (query, params, type, cb) => {
    params = params || {}
    // 复制一份关联查询对象
    query = { ...query }
    // 关联数据始终查询第一页
    const page = params.page || 1
    // 关联数据查询参数
    let queryParams = []

    if (query.conditionfield) {
      try {
        const conditionFields = JSON.parse(query.conditionfield)
        // 构建查询参数
        if (
          conditionFields &&
          conditionFields.constructor == Array &&
          conditionFields.length > 0
        ) {
          conditionFields.forEach((c) => {
            // 默认按照固定值构建查询参数
            let obj = {
              key: c.field,
              value: c.defaultValue || '',
            }
            // 参数传入时获取传入的params中的同名参数值
            if (c.defaultType == '1') {
              if (params.hasOwnProperty(c.field)) {
                obj.value = params[c.field] || ''
                if (query.config && query.config.page !== 1) {
                  query.config.page = 1
                }
              }
            }
            queryParams.push(obj)
          })
        }
      } catch (e) {
        CustomQuery._throwException(`条件字段的JSON格式错误：${e}`)
      }
    }
    if (query.dsType != 'dataSource') {
      // POST请求，则处理queryParams参数
      if (query.requestType == 'POST') {
        queryParams = CustomQuery._handlePostData(query, queryParams)
      }
      // GET请求，则处理url地址
      else if (query.requestType == 'GET') {
        query.url = CustomQuery._handleGetUrl(query.url, queryParams)
      }
    }
    // 构建查询地址
    const queryUrl =
      query.dsType == 'dataSource'
        ? '${form}/form/customQuery/v1/doQuery?alias=' +
          query.alias +
          '&page=' +
          page
        : query.url
    let requestMethod = 'POST'
    //如果关联数据列表查询数据不是数据源则请求方法为restful配置的请求方式
    if (query.dsType != 'dataSource') {
      requestMethod = query.requestType
    }
    //查询数据
    if (
      query.dsType != 'dataSource' &&
      query.config &&
      query.config.isChangePage
    ) {
      queryParams.pageBean.page = query.config.page
    }
    Vue.prototype.$requestConfig
      .request(
        {
          url: queryUrl,
          method: requestMethod,
          data: queryParams,
          headers: query.header,
        },
        query.dsType
      )
      .then(
        (response) => {
          //自定义对话框因为要显示分页信息，并且显示字段的key是小写，故此处直接返回，由自定义对话框组件本身处理数据
          if (type == '1') {
            //如果数据来源是数据源
            if (query.dsType == 'dataSource') {
              cb(response.rows)
            } else {
              // 如果数据来源是REST接口
              const data = CustomQuery._handleResponse(response, query.listKey)
              cb(data)
            }
          } else if (type === 'pagination') {
            //如果数据来源是数据源
            if (query.dsType == 'dataSource') {
              cb(response)
            } else {
              // 如果数据来源是REST接口
              const data = CustomQuery._handleResponse(
                response,
                query.listKey,
                type
              )
              cb(data)
            }
          }
        },
        () => {
          cb([])
        }
      )
  },
  _handleResponse: (data, rowsKey, type) => {
    if (!data) {
      Message.error('返回的数据为空')
      return []
    }
    if (data.constructor == String) {
      try {
        data = JSON.parse(data)
      } catch (e) {
        CustomQuery._throwException(`将返回值解析为JSON对象时出错了：${e}`)
      }
    }

    if (data.constructor == Object) {
      // 如果没有指定提取key，则将返回值包装为列表
      if (!rowsKey) {
        return type ? data : [data]
      }
      try {
        return type ? data : utils.getValueByPath(data, rowsKey)
      } catch (e) {
        CustomQuery._throwException(`从返回的数据中提取数组时出错了：${e}`)
      }
    } else if (data.constructor == Array) {
      // 已经是数组类型时，不再通过rowsKey提取
      return data
    } else {
      CustomQuery._throwException(`返回的数据无法解析:${data}`)
    }
  },
}

export default CustomQuery
