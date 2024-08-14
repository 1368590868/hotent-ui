export default function(dataStr, pattern = 'yyyy-MM-dd hh:mm:ss') {
  if (dataStr) {
    if (pattern == 'yyyy-MM-dd hh:mm:ss') {
      pattern = 'YYYY-MM-DD HH:mm:ss'
    }
    return new Date(dataStr).format(pattern)
  } else {
    return ''
  }
}
