const $ = require('jquery')

const CommonScripts = (vue)=> {
  return {
    getValue(script) {
      return this.executeScript(script)
    },
    executeScript(script) {
      let value = ''
      $.ajax({
        type: 'POST', //请求方式
        async: false, // fasle表示同步请求，true表示异步请求
        contentType: 'application/json;charset=UTF-8', //请求的媒体类型
        url: vue.prototype.$requestConfig.flowUrl + '/runtime/script/v1/executeScript', //请求地址
        data: script, //数
        beforeSend: function (XMLHttpRequest) {
          XMLHttpRequest.setRequestHeader(
            'Authorization',
            vue.prototype.$requestConfig.getToken()
          )
        },
        success: function (result) {
          //请求成功
          if (result.state) {
            value = result.value
          } else {
            console.log('执行脚本失败：' + result.message)
          }
        },
        error: function (e) {
          //请求失败，包含具体的错误信息
          console.log(e.status)
          console.log(e.responseText)
        },
      })
      return value
    },
  }
}

CommonScripts.install = (Vue) => {
  Vue.prototype.$CommonScripts = CommonScripts(Vue)
}

export default CommonScripts
