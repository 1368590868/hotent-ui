import TemplatePreview from './src/TemplatePreview.vue'

import TemplatePreviewFile from './src/TemplatePreviewFile.vue'

import TemplatePreviewImage from './src/TemplatePreviewImage.vue'

TemplatePreview.install = function (Vue) {
  Vue.component(TemplatePreview.name, TemplatePreview)
}

TemplatePreviewFile.install = function (Vue) {
  Vue.component(TemplatePreviewFile.name, TemplatePreviewFile)
}

TemplatePreviewImage.install = function (Vue) {
  Vue.component(TemplatePreviewImage.name, TemplatePreviewImage)
}

export { TemplatePreview, TemplatePreviewFile, TemplatePreviewImage }
