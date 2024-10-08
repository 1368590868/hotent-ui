// 将byte单位的数值转换为合适单位的数值返回
export default function(value) {
  if (null == value || value == '') {
    return '0 Bytes'
  }
  var unitArr = new Array(
    'Bytes',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB',
    'EB',
    'ZB',
    'YB'
  )
  var index = 0
  var srcsize = parseFloat(value)
  index = Math.floor(Math.log(srcsize) / Math.log(1024))
  var size = srcsize / Math.pow(1024, index)
  size = size.toFixed(2) //保留的小数位数
  return size + unitArr[index]
}
