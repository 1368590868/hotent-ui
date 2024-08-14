import { decode, isBase64 } from '@/util/base64'
const dict = {
  'zh-CN': {
    messages: {
      alpha: () => '只能是字母',
      alpha_dash: () => '只能是字母数字横线下划线',
      alpha_num: () => '只能是字母数字',
      alpha_spaces: () => '只能是字母空格',
      between: (field, args) => {
        return `必须是大于等于${args[0]}且小于等于${args[1]}的数字`
      },
      confirmed: () => '两次输入的值必须相同',
      digits: (field, args) => {
        return `必须是${args[0]}位的数字`
      },
      email: () => '不是有效的邮箱地址',
      is: (field, args) => {
        return `内容必须是${args[0]}`
      },
      max: (field, args) => {
        return `文本长度不能超过${args[0]}`
      },
      max_value: (field, args) => {
        return `数值不能大于${args[0]}`
      },
      min: (field, args) => {
        return `文本长度至少需要${args[0]}`
      },
      min_value: (field, args) => {
        return `数值不能小于${args[0]}`
      },
      numeric: () => '请输入整数',
      regex: (field, args) => {
        let msg = '校验失败'
        if (args && args.constructor == Array) {
          let _reg = args
          if (isBase64(_reg[0])) {
            let _value = decode(_reg)
            msg = eval('(' + _value + ')').regex.message
          } else {
            msg = args[1] ? args[1] : msg
          }
        }
        if (args && args.constructor == Object) {
          msg = args['message'] ? args['message'] : msg
        }
        return msg
      },
      method: (field, args) => {
        return args && args['message'] ? args['message'] : '校验失败'
      },
      required: () => '必填',
      isBefore: (field, args) => {
        return '日期必须小于' + args
      },
      isAfter: (field, args) => {
        return '日期必须大于' + args
      },
      isEnd: (field, args) => {
        return '日期必须小于或等于' + args
      },
      isStart: (field, args) => {
        return '日期必须大于或等于' + args
      },
      mobile: () => {
        return '请输入正确的手机号码'
      },
      frontJSValidate: (field, args, data) => {
        if (data && data.message) {
          return data.message
        }
        return '前端js校验失败'
      },
      decimal: () => {
        return '只能输入数字'
      },
      backendValidate: (field, args, data) => {
        let msg = '后端验证失败'
        if (args && args.constructor == Array) {
          msg = args[1] ? args[1] : msg
        }
        if (args && args.constructor == Object) {
          msg = args['message'] ? args['message'] : msg
        }
        return msg
      },
      id_card: () => {
        return '请输入正确的身份证号'
      },
      url: () => {
        return '请输入正确的URL'
      },
    },
    names: {
      expression: '常用语',
    },
  },
  'zh-TW': {
    messages: {
      alpha: () => '只能是字母',
      alpha_dash: () => '只能是字母數位橫線底線',
      alpha_num: () => '只能是字母數位',
      alpha_spaces: () => '只能是字母空格',
      between: (field, args) => {
        return `必須是大於等於${args[0]}且小於等於${args[1]}的數位`
      },
      confirmed: () => '兩次輸入的值必須相同',
      digits: (field, args) => {
        return `必須是${args[0]}比特的數位`
      },
      email: () => '不是有效的郵箱地址',
      is: (field, args) => {
        return `內容必須是${args[0]}`
      },
      max: (field, args) => {
        return `文字長度不能超過${args[0]}`
      },
      max_value: (field, args) => {
        return `數值不能大於${args[0]}`
      },
      min: (field, args) => {
        return `文字長度至少需要${args[0]}`
      },
      min_value: (field, args) => {
        return `數值不能小於${args[0]}`
      },
      numeric: () => '請輸入整數',
      regex: (field, args) => {
        let msg = '校驗失敗'
        if (args && args.constructor == Array) {
          msg = args[1] ? args[1] : msg
        }
        if (args && args.constructor == Object) {
          msg = args['message'] ? args['message'] : msg
        }
        return msg
      },
      method: (field, args) => {
        return args && args['message'] ? args['message'] : '校驗失敗'
      },
      required: () => '必填',
      isBefore: (field, args) => {
        return '日期必須小於' + args
      },
      isAfter: (field, args) => {
        return '日期必須大於' + args
      },
      isEnd: (field, args) => {
        return '日期必須小於或等於' + args
      },
      isStart: (field, args) => {
        return '日期必須大於或等於' + args
      },
      mobile: () => {
        return '請輸入正確的手機號碼'
      },
      frontJSValidate: (field, args, data) => {
        if (data && data.message) {
          return data.message
        }
        return '前端js校驗失敗'
      },
      decimal: () => {
        return '只能輸入數字'
      },
      backendValidate: (field, args, data) => {
        let msg = '後端驗證失敗'
        if (args && args.constructor == Array) {
          msg = args[1] ? args[1] : msg
        }
        if (args && args.constructor == Object) {
          msg = args['message'] ? args['message'] : msg
        }
        return msg
      },
      id_card: () => {
        return '請輸入正確的身份證號'
      },
      url: () => {
        return '請輸入正確的URL'
      },
    },
    names: {
      expression: '常用語',
    },
  },
  'en-US': {
    messages: {
      alpha: () => 'Must be letters',
      alpha_dash: () => 'Must be alphanumeric underscores',
      alpha_num: () => 'Must be alphanumeric',
      alpha_spaces: () => 'Must be letter spaces',
      between: (field, args) => {
        return `Must greater than or equal to ${args[0]} and less than or equal to ${args[1]}`
      },
      confirmed: () => 'The values entered twice must be the same',
      digits: (field, args) => {
        return `Must be a ${args[0]} digit`
      },
      email: () => 'Not a valid email address',
      is: (field, args) => {
        return `Content must be ${args[0]}`
      },
      max: (field, args) => {
        return `Text length cannot exceed ${args[0]}`
      },
      max_value: (field, args) => {
        return `The value cannot be greater than ${args[0]}`
      },
      min: (field, args) => {
        return `Text length needs to be at least ${args[0]}`
      },
      min_value: (field, args) => {
        return `The value cannot be less than ${args[0]}`
      },
      numeric: () => 'Please key in numbers',
      regex: (field, args) => {
        let msg = 'Verification failed'
        if (args && args.constructor == Array) {
          msg = args[1] ? args[1] : msg
        }
        if (args && args.constructor == Object) {
          msg = args['message'] ? args['message'] : msg
        }
        return msg
      },
      method: (field, args) => {
        return args && args['message'] ? args['message'] : 'Verification failed'
      },
      required: () => 'Required',
      isBefore: (field, args) => {
        return 'Must be less than ' + args
      },
      isAfter: (field, args) => {
        return 'Must be greater than ' + args
      },
      isEnd: (field, args) => {
        return 'Must be less than or equal to ' + args
      },
      isStart: (field, args) => {
        return 'Must be greater than or equal to ' + args
      },
      mobile: () => {
        return 'Please enter the correct phone number'
      },
      frontJSValidate: (field, args, data) => {
        if (data && data.message) {
          return data.message
        }
        return 'Front end JS verification failed'
      },
      decimal: () => {
        return 'Can only enter numbers'
      },
      backendValidate: (field, args, data) => {
        let msg = 'Backend validation failed'
        if (args && args.constructor == Array) {
          msg = args[1] ? args[1] : msg
        }
        if (args && args.constructor == Object) {
          msg = args['message'] ? args['message'] : msg
        }
        return msg
      },
      id_card: () => {
        return 'Please enter the correct ID number'
      },
      url: () => {
        return 'Please enter the correct URL'
      },
    },
    names: {
      expression: 'Common words',
    },
  },
}

export default dict
