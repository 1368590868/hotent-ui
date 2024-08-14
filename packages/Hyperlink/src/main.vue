<template>
  <a v-if="permission != 'n'" class="site-a" :href='targetAddress' :target='target' >{{title}}</a>
</template>
<script>
import permission from '@/mixins/permission.js'

export default {
  name: 'HtHyperlink',
  mixins: [permission],
  props: {
    desc: String,
    address: String,
    target: String,
    login:{
      type: Boolean,
      default: true,
      require: false
    },
    formData:{
      type: Object,
      require: false
    }
  },
  data(){
    return{
      targetAddress:'',
      data:{},
      loginToken:'',
      title:''
    }
  },
  created() {
  },
  watch:{
    address:{
      handler(val){
        this.targetAddress = val
      }
    },
    formData:{
      handler(val){
        this.data = val
        if (this.loginToken === ''){
          this.loginToken = this.$requestConfig.getToken().replace("Bearer ", "");
        }
        this.change();
      },
      immediate: true,
      deep: true,
    },
  },
  methods :{
    change(){
      let url = ''
      let temp = this.address.replaceAll("{{","'+this.").replaceAll("}}","+'")
      let add = eval("'" + temp + "'")
      if (this.login){
        if (add.indexOf('?') !== -1){
          url = add + '&token='+this.loginToken
        }else {
          url = add + '?token='+this.loginToken
        }
      }
      this.targetAddress = url
      if (this.desc.indexOf("{{") !== -1){
        this.title = eval(this.desc.replaceAll('{{', '{{this.'))
      }else {
        this.title = this.desc
      }
    }
  }

}
</script>

<style>
.site-a {
  color: #5b9dff;
  font-size: 12px;
  text-decoration: none;
}
</style>
