export function extract(url) {
  const reg = new RegExp(/^(http.*?\/\/.*?)\/.*$/)
  return reg.test(url) ? reg.exec(url)[1] : ''
}
