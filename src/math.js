import utils from '@/utils.js'

var FormMath = {}

FormMath.toNumber = function(x) {
  if (x === null || x === undefined || x === '') return ''
  if (typeof x == 'string') {
    x = x.replace(/,/g, '')
  }
  var match = x.toString().match(/([$|￥])\d+\.?\d*/)
  if (match) {
    x = x.replace(match[1], '')
  }
  return Number(x)
}

/**
 * 返回x的绝对值
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.abs = function(x) {
  return Math.abs(x)
}

/**
 * 把x四舍五入为最接近的整数
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.round = function(x) {
  return Math.round(x)
}

/**
 * 对x进行上舍入，返回等于或者大于x,并且与x最接近的整数
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.ceil = function(x) {
  return Math.ceil(x)
}

/**
 * 对x进行下舍入，返回小于或者等于x，并且与x最接近的整数
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.floor = function(x) {
  return Math.floor(x)
}

/**
 * 返回集合ary中最大的数
 * @param  {[type]} ary [description]
 * @return {[type]}     [description]
 */
FormMath.max = function(ary) {
  var tmp,
    x = 0,
    size = ary.length
  for (var i = 0; i < size; i++) {
    x = FormMath.toNumber(ary[i])
    if (isNaN(x) || x === '') continue
    if (tmp === undefined) {
      tmp = x
    } else {
      if (x > tmp) tmp = x
    }
  }
  tmp = FormMath.toNumber(tmp)
  return tmp
}

/**
 * 返回集合ary中最小的数
 * @param  {[type]} ary [description]
 * @return {[type]}     [description]
 */
FormMath.min = function(ary) {
  var tmp,
    x = 0,
    size = ary.length
  for (var i = 0; i < size; i++) {
    x = FormMath.toNumber(ary[i])
    if (isNaN(x) || x === '') continue
    if (tmp === undefined) {
      tmp = x
    } else {
      if (x < tmp) tmp = x
    }
  }
  tmp = FormMath.toNumber(tmp)
  return tmp
}

/**
 * 返回x的平方根
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.sqrt = function(x) {
  return Math.sqrt(x)
}

/**
 * 获取ary的平均值
 * @param  {[type]} ary [description]
 * @return {[type]}     [description]
 */
FormMath.average = function(ary) {
  var tmp,
    x = 0,
    size = ary.length
  for (var i = 0; i < size; i++) {
    x = FormMath.toNumber(ary[i])
    if (isNaN(x) || x === '') continue
    if (tmp === undefined) {
      tmp = x
    } else {
      tmp += x
    }
  }
  tmp = FormMath.toNumber(tmp / size)
  return tmp
}

/**
 * 求ary的和
 * @param  {[type]} ary [description]
 * @return {[type]}     [description]
 */
FormMath.sum = function(ary) {
  var tmp,
    x = 0,
    size = ary.length
  for (var i = 0; i < size; i++) {
    x = FormMath.toNumber(ary[i])
    if (isNaN(x) || x === '') continue
    if (tmp === undefined) {
      tmp = x
    } else {
      tmp += x
    }
  }
  tmp = FormMath.toNumber(tmp)
  return tmp
}

/**
 * 返回保留小数点后b位的x的四舍五入值
 * @param  {[type]} x [description]
 * @param  {[type]} b [description]
 * @return {[type]}   [description]
 */
FormMath.tofixed = function(x, b) {
  var tmp = FormMath.toNumber(x)
  b = FormMath.toNumber(b)
  if (isNaN(tmp) || tmp === '' || isNaN(b)) return x
  return tmp.toFixed(b)
}

/**
 * 将数字转换为人民币大写
 * @param  {[type]} x [description]
 * @return {[type]}   [description]
 */
FormMath.convertCurrency = function(x) {
  var tmp = FormMath.toNumber(x)
  if (isNaN(tmp)) return x
  //TODO 转换为人民币大写
  return utils.convertCurrency(tmp)
}

// 解析表达式中的字段
FormMath.parseFuncexpField = (statFun) => {
  var myregexp = /[{|[].*?\((.*?)\)[}|\]]/g
  var match = myregexp.exec(statFun)
  var arrs = []
  while (match != null) {
    var str = match[1]
    var has = false
    for (var i = 0, v; (v = arrs[i++]); ) {
      if (v == str) has = true
    }
    if (!has) arrs.push(str)
    match = myregexp.exec(statFun)
  }
  return arrs
}

// 计算子表中的行运算
FormMath.calcSubExpValue = function(exp, scope, prefix, index) {
  if (!exp || !scope || !prefix) return 0
  var reg = /\{.*?\((.*?)\)\}/g
  exp = exp.replace(reg, function() {
    var name = arguments[1],
      value = 0
    if (name.split('.').length != 2) {
      throw `子表运算中${name}必须为xxx.xxx格式的表达式`
    }
    var val = utils.getValueByPath(
      scope,
      `${prefix}[${index}].${name.split('.')[1]}`
    )
    val = FormMath.toNumber(val)
    if (!isNaN(val) && '' != val) value = val
    return value
  })
  if (exp.substring(0, 16) != 'FormMath.tofixed') {
    return FormMath.isValue(FormMath.tofixed(eval(`(${exp})`), 0))
  }
  return FormMath.isValue(eval(`(${exp})`))
}

// 计算表达式中的值
FormMath.calcExpValue = function(exp, scope) {
  if (!exp) return 0
  var reg = /([\[|\{]).*?\((.*?)\)[\}|\]]/g // eslint-disable-line
  exp = exp.replace(reg, function() {
    var symbol = arguments[1],
      name = arguments[2],
      value = 0
    if (scope) {
      //子表统计计算情况，多行数据
      if (symbol == '[') {
        var valArray = []
        var subMsg = name.split('.')
        if (subMsg.length < 1) {
          throw `子表统计的表达式${name}错误`
        }
        const subMsgSize = subMsg.length
        var fieldName = subMsg[subMsgSize - 1]
        var subTableNameAry = subMsg.filter((s, i) => i < subMsgSize - 1)
        var subTableSrc = subTableNameAry.join('.')
        var rows = utils.getValueByPath(scope, subTableSrc)
        if (rows && rows.length > 0) {
          for (var i = 0, row; (row = rows[i++]); ) {
            valArray.push(row[fieldName])
          }
        }
        value = `[${valArray.join(',')}`
      } else {
        var val = utils.getValueByPath(scope, name)
        val = FormMath.toNumber(val)
        if (!isNaN(val) && '' != val) value = val
      }
    }
    if (!value) {
      value = 0
    }
    return value
  })
  if (exp.substring(0, 16) != 'FormMath.tofixed') {
    return FormMath.isValue(FormMath.tofixed(eval(`(${exp})`), 0))
  }
  return FormMath.isValue(eval(`(${exp})`))
}

FormMath.isValue = function(value) {
  if (!value) {
    return ''
  } else if (value == 'Infinity') {
    return ''
  } else {
    return value
  }
}

export default FormMath
