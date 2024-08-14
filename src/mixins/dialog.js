export default {
  data() {
    return {
      isDisabled: true,
    }
  },
  methods: {
    handleCurrentSelect(data) {
      if (data.length > 0) {
        this.isDisabled = false
      } else {
        this.isDisabled = true
      }
    },
  },
}
