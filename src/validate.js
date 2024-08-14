// import Vue from 'vue'
import utils from '@/utils.js'
import VeeValidate, { Validator } from 'vee-validate'
import dict from '@/locale/validate/dict.js'
import { decode, isBase64 } from '@/util/base64'
import { t } from '@/locale'

const validate = {}

validate.install = (Vue) => {
  Vue.use(VeeValidate, {
    fieldsBagName: 'inputs',
    events: 'change|blur',
  })

  Validator.localize(dict)

  //比较类型。1，小于:datelessthan。2，小于等于:daterangeend。3，大于:datemorethan。4，大于等于:daterangestart
  const getDatevalAndCompare = function(selfValue, targetValue, compareType) {
    let targetDate = targetValue
    if (!targetDate) {
      return true
    }

    let selfDate = ''
    if (selfValue && selfValue.constructor == String) {
      selfDate = selfValue
    } else if (selfValue && typeof selfValue == 'object') {
      selfDate = selfValue.value
    }
    let result = false
    if (compareType == 1) {
      result = utils.dateIsBefore(selfDate, targetDate)
    } else if (compareType == 2) {
      result = utils.dateIsBefore(selfDate, targetDate, true)
    } else if (compareType == 3) {
      result = utils.dateIsBefore(targetDate, selfDate)
    } else if (compareType == 4) {
      result = utils.dateIsBefore(targetDate, selfDate, true)
    }
    return result
  }

  const datelessthan = {
    validate: (value, [otherValue]) => {
      return getDatevalAndCompare(value, otherValue, 1)
    },
  }

  const daterangeend = {
    validate: (value, [otherValue]) => {
      return getDatevalAndCompare(value, otherValue, 2)
    },
  }

  const datemorethan = {
    validate: (value, [otherValue]) => {
      return getDatevalAndCompare(value, otherValue, 3)
    },
  }
  const daterangestart = {
    validate: (value, [otherValue]) => {
      return getDatevalAndCompare(value, otherValue, 4)
    },
  }

  const regexTest = (reg, value) => {
    if (reg) {
      if (reg.constructor == String) {
        let _reg = reg
        if (isBase64(reg)) {
          let _value = decode(reg)
          _reg = eval('(' + _value + ')').regex.exp
        }
        if (_reg[_reg.length - 1] === '/') {
          _reg = _reg.slice(0, _reg.length - 1)
        }
        if (_reg[0] === '/') {
          _reg = _reg.slice(1, _reg.length)
        }
        return new RegExp(_reg).test(value)
      } else if (reg.constructor == RegExp) {
        return reg.test(value)
      }
      return true
    }
    return true
  }

  Validator.extend('isBefore', datelessthan)
  Validator.extend('isAfter', datemorethan)
  Validator.extend('isEnd', daterangeend)
  Validator.extend('isStart', daterangestart)
  // 日期校验
  Validator.extend('date', {
    validate: (value) => {
      if (!value) {
        return true
      } else {
        let dateVal = ''
        if (value.constructor == String) {
          dateVal = value
        } else if (typeof value == 'object') {
          dateVal = value.value
          if (
            !dateVal ||
            value.constructor == Date ||
            (dateVal && dateVal.constructor == Date)
          ) {
            return true
          }
        }
        var re = /^([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8])))/g.test(
          dateVal.trim()
        )
        return re
      }
    },
  })
  // 重载veeValidate自带的确认相同验证规则，通过domName来查找关联字段。
  Validator.extend('confirmed', {
    validate: (value, [args]) => {
      if (!value) {
        return true
      }
      return value == args
    },
  })

  // 重载veeValidate自带的正则表达式校验规则，支持通过字符串传入正则表达式，并支持传入验证不通过的提示信息。
  Validator.extend('regex', {
    validate: (value, args) => {
      if (!args) return true
      if (args.constructor == Array) {
        return regexTest(args[0], value)
      }
      if (args.constructor == Object) {
        const exp = args['exp']
        return regexTest(exp, value)
      }
      return true
    },
  })
  Validator.extend('numeric', {
    validate: (value) => {
      if (!value) {
        return true
      } else {
        return /(^-?[1-9]([0-9]*)$|^-?[0-9]$)/.test(value)
      }
    },
  })
  // 异步校验规则
  Validator.extend('method', {
    validate: (value, args) => {
      if (!args) return true
      if (args.constructor == Array) {
        if (args[0] && typeof args[0] == 'function') {
          return args[0](value, args)
        }
      }
      if (args.constructor == Object) {
        if (args['callback'] && typeof args['callback'] == 'function') {
          return args['callback'](value, args)
        }
      }
      return true
    },
  })
  // 手机号校验
  Validator.extend('mobile', {
    validate: (value) => {
      if (!value) {
        return true
      } else {
        return /(^1\d{10}$)/.test(value)
      }
    },
  })
  // 自定义js校验frontJSValidate
  Validator.extend('frontJSValidate', {
    validate: (value, args) => {
      return new Promise((resolve) => {
        let jsScript = args[0]
        jsScript = decode(jsScript)
        let formElementAry = document.getElementsByName('online-form')
        let dataViewElementAry = document.getElementsByName('data-view')
        let data = {}
        let paramName = 'data'
        if (formElementAry && formElementAry.length == 1) {
          //PC表单
          let frmInst = formElementAry[0].__vue__
          data = JSON.parse(JSON.stringify(frmInst.data))
          paramName = 'data'
        } else if (dataViewElementAry && dataViewElementAry.length == 1) {
          //表单列表
          let dataViewInst = dataViewElementAry[0].__vue__.$children[0]
          data = JSON.parse(JSON.stringify(dataViewInst.searchForm))
          paramName = 'searchForm'
        }
        if (value && value._isVue) {
          value = value.value
        }
        function evil() {
          let Fn = Function('value', paramName, jsScript) //一个变量指向Function，防止有些前端编译工具报错
          let result = Fn(value, data)
          return result
        }
        try {
          let result = evil()
          if (result === undefined || result === null) {
            result = true
          }
          resolve(result)
        } catch (err) {
          resolve({ valid: false, data: { message: t('ht.validate.jsError') } })
        }
      })
    },
  })
  // 后端校验 backendValidate
  Validator.extend('backendValidate', {
    validate: (value, args) => {
      let url = args[0]
      let submitFormData = args.submitFormData || false
      return new Promise((resolve) => {
        Vue.prototype.$requestConfig
          .backendValidate({
            url: url,
            param: value,
            submitFormData: submitFormData,
          })
          .then((res) => {
            resolve(res && res.valid)
          })
      })
    },
  })
  // 身份证号校验
  Validator.extend('id_card', {
    validate: (value) => {
      if (!value) {
        return true
      } else {
        return /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(
          value
        )
      }
    },
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  validate.install(window.Vue)
}

export default validate
