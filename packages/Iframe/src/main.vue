<template>
  <div :name="iframeNmae + 'Div'">
    <iframe
      id="iframeControl"
      v-if="isReday"
      :src="endSrc"
      :height="endHeight"
      :width="width"
      :style="iframeStyle"
      :name="iframeNmae"
      :frameborder="frameborder"
    ></iframe>
  </div>
</template>
<script>
import { decode } from '@/util/base64'
import mobileMode from '@/mixins/mobileMode.js'
export default {
  mixins: [mobileMode],
  name: 'HtIframe',
  componentName: 'HtIframe',
  props: {
    src: {
      type: String,
      default: '',
    },
    height: { type: String, default: '500px' },
    width: { type: String, default: '100%' },
    iframeStyle: { type: String, default: '' },
    iframeNmae: { type: String, default: 'iframeControl' },
    frameborder: { type: String, default: '1' },
    data: {
      type: Object,
      default: () => {
        return []
      },
    },
    permission: {
      type: Object,
      default: () => {
        return {}
      },
    },
    instId: { type: String, default: '' },
    isBusinessForm: { type: Boolean, default: false },
    urlParameter: {
      type: [Array, Object],
      default: () => {
        return {}
      },
    },
    returnParameter: {
      type: [Array, Object],
      default: () => {
        return {}
      },
    },
    iframeType: {
      type: String, // static dynamic
      default: 'static',
    },
    iframeSrcJs: String, // 动态url base64格式
  },
  data() {
    return {
      endHeight:{},
      extSysMap: {},
      subPageData: {},
      endSrc: '',
      isReday: false,
    }
  },
  async mounted() {
    this.endHeight=this.height;
    let _this = this
   
    if (this.iframeType == 'dynamic') {
      await this.getDynamicSrc()
    } else {
       //拼接url参数
       if (!this.src) {
        this.$message.error('当前URL表单地址未填写。')
        return
      }
      this.endSrc = this.src
    }
    if (this.isBusinessForm) {
      if (
        this.urlParameter &&
        this.urlParameter instanceof Array &&
        this.urlParameter.length > 0
      ) {
        this.disposeUrl()
      }
    }
    //父子页面事件监听器
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type && e.data.iframeNmae == this.iframeNmae) {
        if (e.data.type == 'getParentPageData') {
          _this.getParentPageDataMsg()
        } else if (e.data.type == 'getSubPageData') {
          _this.getSubPageData(e.data.data)
        } else if (e.data.type == 'addHeight') {
          _this.addHeight(e.data.height)
        }
      }
    })
    this.isReday = true
  },
  created() {},
  methods: {
    async getDynamicSrc() {
      if (!this.iframeSrcJs) {
        return
      }
      let _this = this
      let data = this.data
      let currentUserDetail = await this.$requestConfig.getCurrentUser()
      let userId = this.$requestConfig.getUserId()
      let account = this.$requestConfig.getAccount()
      let token = this.$requestConfig.getToken()
      let extSys = await this.getExtSys()
      extSys = this.extSysMap
      // let extSys = this.extSysMap
     let isMobile = this.isMobile


      const preScript = `const scriptFunction = function(_this,data,currentUserDetail,userId,account,token,extSys,isMobile){
        ${decode(this.iframeSrcJs)}
      };`
      this.endSrc = eval(
        `${preScript} scriptFunction(_this,data,currentUserDetail,userId,account,token,extSys,isMobile);`
      )
    },
    getExtSys() {
      return this.$requestConfig.getExtSys({}).then((data) => {
        if (data && data.rows) {
          data.rows.forEach((element) => {
            this.extSysMap[element.sysCode] = element.rootAddress
            return this.extSysMap
          })
        }
      })
    },
    addHeight(height) {
      this.endHeight = height
    },
    async disposeUrl() {
      let currentUserDetail = await this.$requestConfig.getCurrentUser()

      let vStr = ''
      for (let x = 0; x < this.urlParameter.length; x++) {
        let parma = this.urlParameter[x]
        if (parma.type == 1) {
          vStr = vStr + `&${parma.key}=${this.getFromData(parma.value)}`
        } else if (parma.type == 2) {
          vStr = vStr + `&${parma.key}=${parma.value}`
        } else if (parma.type == 3 && parma.value) {
          let _this = this
          const preScript = `const scriptFunction = function(_this){
            ${Base64.decode(parma.value)}
          };`
          const result = eval(`${preScript} scriptFunction(_this);`)
          if (result) {
            vStr = vStr + `&${parma.key}=${result}`
          }
        } else if (parma.type == 4) {
          let res = ''
          if (parma.value == 1) {
            res = currentUserDetail.fullname
          } else if (parma.value == 2) {
            res = currentUserDetail.userId
          } else if (parma.value == 3) {
            res = currentUserDetail.account
          } else if (parma.value == 4) {
            res = this.$requestConfig.getToken()
          } else if (parma.value == 5) {
            //得到任务id
            res = this.$route.query.taskId
          } else if (parma.value == 6) {
            res = this.instId
          }
          vStr = vStr + `&${parma.key}=${res}`
        }
      }
      if (this.endSrc.includes('?')) {
        this.endSrc = this.endSrc + vStr
      } else {
        this.endSrc = this.endSrc + vStr.replace('&', '?')
      }
    },
    getFromData(path) {
      let pathAry = path.split('.')
      let v = this.data
      for (let x = 0; x < pathAry.length; x++) {
        v = v[pathAry[x]]
      }
      return v
    },
    getSubPageData(subPageData) {
      this.subPageData = subPageData
      console.log(subPageData)
    },
    getParentPageDataMsg() {
      const frm = this.getIframeDom()
      frm.contentWindow.postMessage(
        {
          type: 'getParentPageData',
          instId: this.instId,
          data: this.data,
          permission: this.permission,
        },
        '*'
      )
    },
    getIframeDom() {
      const frmControl = document.querySelectorAll(
        `[name='${this.iframeNmae}']`
      )
      if (!frmControl || !frmControl[0]) {
        this.$message.error('当前URL表单加载不正确。')
        return
      }
      return frmControl[0]
    },
    //流程系统获取业务系统的表单数据
    getSubPageData() {},
  },
}
</script>
<style lang="scss" scoped>
</style>
