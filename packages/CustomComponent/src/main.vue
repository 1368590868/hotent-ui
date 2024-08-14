<template>
  <div>
    <template v-if="loadOver">
      <component
        :is="componentName"
        :ref="vueObj.alias"
        :data="data"
        :permission="permission"
        :vueObj="vueObj"
        :component="component"
      ></component>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'HtCustomComponent',
  componentName: 'HtCustomComponent',
  props: ['data', 'permission', 'ccAlias'],
  data() {
    return {
      loadOver: false,
      vueObj: {},
      component: {},
      componentName: '',
    }
  },
  methods: {
    init() {
      //解析jscode;
      this.component = {}
      if (this.vueObj.jsCode) {
        let jsCode = Base64.decode(this.vueObj.jsCode, 'utf-8')
        let parseJsCode = function () {
          return eval('(function(){return {' + jsCode + '} })()')
        }
        this.component = parseJsCode()
      }

      this.component.props = ['data', 'permission', 'vueObj', 'component']
      if (this.vueObj.template) {
        this.component.template = Base64.decode(this.vueObj.template, 'utf-8')
      } else {
        this.component.template = '<div></div>'
      }
      if (this.vueObj.dataCode) {
        let dataCodeStr = Base64.decode(this.vueObj.dataCode)
        let parseDataCode = function () {
          return eval('(function(){return ' + dataCodeStr + ' })()')
        }
        let data = parseDataCode()
        this.component.data = function () {
          return data
        }
      }

      this.componentName = this.ccAlias + '-component'
      //加载动态组件
      Vue.component(this.componentName, this.component)
      //加载完成后显示
      this.loadOver = true
    },
  },
  mounted() {
    // this.init();
  },
  created() {
    //根据自定义组件id查询组件对象
    // this.$http
    //   .get('${form}/formCustomComponent/v1/getByAlias?alias=' + this.ccAlias)
    //   .then((resp) => {
    //     this.vueObj = resp.data
    //     this.init()
    //   })

    this.$requestConfig
      .getFormCustomComponentByAlias(this.ccAlias)
      .then((resp) => {
        this.vueObj = resp
        this.init()
      })
  },
}
</script>
