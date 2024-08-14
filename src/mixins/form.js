export default {
  componentGroup: 'HtFormInputs',
  props: {
    displayStyle: String,
  },
  data() {
    return {
      curInputsDisplay: '',
      currentShowMode: 'text',
    }
  },
  computed: {
    formInputsDisplay: function() {
      return this.displayStyle
        ? this.displayStyle
        : this.curInputsDisplay
        ? this.curInputsDisplay
        : ''
    },
    isDisabled() {
      return (
        this.disabled ||
        (this.currentShowMode === 'input' && !this.inputWriteable)
      )
    },
  },
  created() {
    this.$on('formExtend:update', (formExtend) => {
      this.curInputsDisplay = formExtend.inputsDisplay
      this.currentShowMode = formExtend.roInputDisplayMode || 'text'
    })
  },
}
