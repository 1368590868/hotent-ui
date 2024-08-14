<template>
  <div  v-if="permission !== 'n'" >
    {{value}}
    <!-- <el-input
    v-if="isShowSwitch"
    v-model="value"
    :disabled="true">
  </el-input> -->
  <!-- <ht-field-tail
      :field-name="inputName"
      :readonly="!inputWriteable"
      input-value
      :tag-format-value="tagValue"
    ></ht-field-tail> -->
  </div>
</template>
<script>
import mobileMode from '@/mixins/mobileMode.js'
import permission from '@/mixins/permission.js'
import inputName from '@/mixins/inputName.js'
import form from '@/mixins/form.js'
export default {
  mixins: [mobileMode,permission, inputName, form],
  name: 'HtUrlParameter',
  componentName: 'HtUrlParameter',
  props: {
    value: [String, Number, Boolean],
    bindKey:[String],
  },
  data() {
    return {
      
    }
  },
  mounted() {
   
  },
  created() {
    if(this.bindKey){
    let v=this.getUrlMap();
    if(v!=undefined && v!=this.value){
      this.$emit('input',v)
    }
   }
  },
  methods: {
   getUrlMap(){
    let url = window.location.search;
      let urlParams = new Object();
      // 判断是否有问号
      if (url.indexOf("?") != -1) {
        let str = url.substr(1);
        let strs = str.split("&");
        for (let i = 0; i < strs.length; i++) {
          // 每一项等号左边为属性，等号右边为属性的值，值需要使用 decodeURI() 函数对通过 escape() 或 url 编码过的字符串进行解码。
          urlParams[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
        }
      }
      // 自己定义修改需要获取url中哪个参数
      return urlParams[this.bindKey];
  },
}
}
</script>
<style lang="scss" scoped>
</style>
