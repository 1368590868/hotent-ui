import loadingComponent from './index.vue'

const loadingConfig = {}
loadingConfig.install = (Vue) => {
  const LoadingConstructor = Vue.extend(loadingComponent)
  let toastDom, el
  function showLoading(title='', color='', duration = 2000) {
    if (!el && !toastDom) {
      el = document.createElement('div');
      toastDom = new LoadingConstructor({
        el,
        data() {
          return {
            isShow: true, // 是否显示
            title, // 文本内容
            color
          };
        }
      });
      // 添加节点
      document.body.appendChild(toastDom.$el);
    } else {
      toastDom.isShow = true;
    }
  }
  
  function cancelLoading() {
    if (toastDom) {
      toastDom.isShow = false;
    }
  }
  Vue.prototype.$showLoading = showLoading
  Vue.prototype.$cancelLoading = cancelLoading
}

export default loadingConfig

