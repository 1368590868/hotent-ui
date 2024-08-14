import Vue from 'vue'
import PreviewComponent from '../Preview/src/main.vue'

const PreviewerConstructor = Vue.extend(PreviewComponent)
const previewId = 'previewEle'
let instance,
  options = {}

const initInstance = () => {
  const ele = document.createElement('div')
  ele.id = previewId

  instance = new PreviewerConstructor({
    el: ele,
    propsData: options,
  })
}

const preview = (file) => {
  if (!instance) {
    initInstance()
  }
  instance.dialogVisible = false
  instance.mode = null
  instance.src = null
  instance.loading = false
  instance.tempTitle = null
  instance.errorMessage = null

  if (!document.querySelector(`#${previewId}`)) {
    document.body.appendChild(instance.$el)
  }

  if (options.before) {
    instance.preview(options.before(file), file.name)
  } else {
    throw `There must have 'before' fn when use Preview Plugin.`
  }
}

const Preview = {}

Preview.install = function(Vue, opts) {
  Vue.component('HtPreview', PreviewComponent)
  Object.assign(options, opts || {})
  Vue.prototype.$preview = preview
}

export default Preview
