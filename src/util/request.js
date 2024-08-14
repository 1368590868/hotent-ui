const axios = require('axios')

export default function request(url, data = {}, option = {}) {
  const requestData = {
    url: url,
    data: data,
    method: option.method || 'GET',
    params: option.params || {},
    onUploadProgress: option.onUploadProgress || null,
    headers: option.headers || '',
    responseType: option.responseType || 'json',
  }
  return axios(requestData)
}
