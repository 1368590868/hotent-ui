import utils from '@/utils.js'

export default {
  data() {
    return {
      currentFormInstance: null,
    }
  },
  watch: {
    currentFormInstance: function(newVal, oldVal) {
      if (!oldVal && newVal && newVal.$on) {
        newVal.$off('updateData', this.handleUpdateData)
        newVal.$on('updateData', this.handleUpdateData)
      }
    },
  },
  mounted() {
    if (this.currentFormInstance == null) {
      this.currentFormInstance = utils.getOnlineFormInstance(this)
    }
  },
  beforeDestroy() {
    this.currentFormInstance &&
      this.currentFormInstance.$off &&
      this.currentFormInstance.$off('updateData', this.handleUpdateData)
  },
  methods: {
    handleUpdateData() {
      this.$emit('formDataUpdate')
    },
  },
}
