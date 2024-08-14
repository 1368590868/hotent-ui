/**
 * 通过Object创建链接地址
 * @param {Object} content
 * @returns
 */
export function createObjectURL(content) {
  if (
    window.navigator.userAgent.indexOf('Chrome') >= 1 ||
    window.navigator.userAgent.indexOf('Safari') >= 1
  ) {
    return window.webkitURL.createObjectURL(content)
  } else {
    return window.URL.createObjectURL(content)
  }
}
