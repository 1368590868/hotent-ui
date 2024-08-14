const regexpTag = '[object RegExp]'

export default function deepClone(value, stack = new WeakMap()) {
  if (!isObject(value)) {
    return value
  }

  let result = Array.isArray(value) ? [] : {}

  // 函数直接返回
  if (typeof value === 'function') {
    return value
  }

  // 处理引用类型的拷贝
  result = initCloneByTag(value, getTag(value))

  // 处理循环引用
  if (stack.has(value)) {
    return stack.get(value)
  }
  stack.set(value, result)

  // 这里没有处理key是Symbol的情况
  // for in 不会枚举Symbol的key
  // 可以通过Object.getOwnPropertySymbols获取所有Symbol的key
  for (let key in value) {
    result[key] = deepClone(value[key], stack)
  }
  return result
}

function isObject(value) {
  const type = typeof value
  return value != null && (type === 'object' || type === 'function')
}

function getTag(value) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  return Object.prototype.toString.call(value)
}

function cloneRegExp(regexp) {
  const result = new regexp.constructor(regexp.source, /\w*$/.exec(regexp))
  result.lastIndex = regexp.lastIndex
  return result
}

function initCloneByTag(object, tag) {
  // 可以在这里处理
  // arrayBuffer, int32array, dataview等情况
  switch (tag) {
    case regexpTag:
      return cloneRegExp(object)

    default:
      return {}
  }
}
