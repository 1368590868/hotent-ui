const { Base64 } = require('js-base64')
const notBase64 = /[^A-Z0-9+\/=]/i

/**
 * base64编码
 * @param {*} content 要编码内容
 * @param {*} encoding 编码字符集（默认UTF-8）
 * @returns 编码后的内容
 */
export function encode(content, encoding) {
  return content ? Base64.encode(content, encoding || 'utf-8') : content
}

/**
 * base64解码
 * @param {*} content 要解码内容
 * @param {*} encoding 解码字符集（默认UTF-8）
 * @returns 解码后的内容
 */
export function decode(content, encoding) {
  return content ? Base64.decode(content, encoding || 'utf-8') : content
}

/**
 * 判断字符串是否为base64编码格式
 * @param {*} content
 * @returns
 */
export function isBase64(content) {
  if (!content || content.constructor !== String) {
    return false
  }
  if (content === '' || content.trim() === '') {
    return false
  }
  const len = content.length
  if (!len || len % 4 !== 0 || notBase64.test(content)) {
    return false
  }
  const firstPaddingChar = content.indexOf('=')
  return (
    firstPaddingChar === -1 ||
    firstPaddingChar === len - 1 ||
    (firstPaddingChar === len - 2 && content[len - 1] === '=')
  )
}
