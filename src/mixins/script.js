import utils from '@/utils.js'
import { decode } from '@/util/base64.js'
import req from '@/util/request.js'
import { Message, Loading } from 'element-ui'
import { i18n } from '@/locale/index.js'

export default {
  props: {
    script: String,
  },

  methods: {
    evilJS() {
      let _me = this
      if (this.script) {
        let htCustomScript = decode(this.script)
        const formVm = utils.getOnlineFormInstance(_me)
        const $ = require('jquery')
        const evil = function() {
          const Fn = Function(
            'req',
            'data',
            'i18n',
            'Message',
            'Loading',
            'formVm',
            '_this',
            '$',
            htCustomScript
          )
          return Fn(req, formVm.data, i18n, Message, Loading, formVm, _me, $)
        }
        return evil()
      }
    },
  },
}
