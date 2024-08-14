import utils from '../utils.js'

export default {
  data() {
    return {
      userAgentMobile: false,
    }
  },
  inject: {
    elForm: {
      default: '',
    },
  },
  computed: {
    isMobile: function() {
      return (
        (this.elForm &&
          this.elForm.$parent &&
          this.elForm.$parent.mobileMode) ||
        this.userAgentMobile
      )
    },
  },
  created() {
    this.userAgentMobile = utils.isMobile()
  },
}
