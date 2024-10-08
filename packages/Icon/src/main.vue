<script>
  let icons = {}

  function warn(msg, vm) {
    if (!vm) {
      /* eslint-disable no-console */
      console.error(msg)
      /* eslint-enable no-console */
      return
    }
    vm.constructor.super.util.warn(msg, vm)
  }

  export default {
    name: 'HtIcon',
    props: {
      name: {
        type: String,
        default: '',
        validator(val) {
          if (val && !(val in icons)) {
            warn(
              `Invalid prop: prop "name" is referring to an unregistered icon "${val}".\n` +
                `Please make sure you have imported this icon before using it.`,
              this
            )
            return false
          }
          return true
        },
      },
      title: {
        type: String,
        default: '',
      },
      scale: {
        type: [Number, String],
        default: 1,
      },
      spin: {
        type: Boolean,
        default: false,
      },
      inverse: {
        type: Boolean,
        default: false,
      },
      pulse: {
        type: Boolean,
        default: false,
      },
      flip: {
        validator(val) {
          return (
            val === 'horizontal' ||
            val === 'vertical' ||
            val === 'both' ||
            val === ''
          )
        },
        default: '',
      },
      rotate: {
        type: [Number, String],
        default: 0,
      },
      label: {
        type: String,
        default: '',
      },
      tabindex: {
        type: [Number, String],
        default: '',
      },
    },
    data() {
      return {
        x: false,
        y: false,
        childrenWidth: 0,
        childrenHeight: 0,
        outerScale: 1,
      }
    },
    computed: {
      normalizedScale() {
        let scale = this.scale
        scale = typeof scale === 'undefined' ? 1 : Number(scale)
        if (isNaN(scale) || scale <= 0) {
          warn(`Invalid prop: prop "scale" should be a number over 0.`, this)
          return this.outerScale
        }
        return scale * this.outerScale
      },
      rotateDegree() {
        let rotate = this.rotate
        rotate = typeof rotate === 'undefined' ? 0 : Number(rotate)
        if (isNaN(rotate)) {
          warn(`Invalid prop: prop "rotate" should be a number.`, this)
          return 0
        }
        return rotate
      },
      klass() {
        let classes = {
          'fa-icon': true,
          'fa-spin': this.spin,
          'fa-flip-horizontal': this.flip === 'horizontal',
          'fa-flip-vertical': this.flip === 'vertical',
          'fa-flip-both': this.flip === 'both',
          'fa-inverse': this.inverse,
          'fa-pulse': this.pulse,
        }

        if (this.classes) {
          Object.keys(this.classes).forEach((c) => {
            if (this.classes[c]) {
              classes[c] = true
            }
          })
        }

        return classes
      },
      icon() {
        if (this.name) {
          return icons[this.name]
        }
        return null
      },
      box() {
        if (this.icon) {
          return `0 0 ${this.icon.width} ${this.icon.height}`
        }
        return `0 0 ${this.width} ${this.height}`
      },
      ratio() {
        if (!this.icon) {
          return 1
        }
        let { width, height } = this.icon
        return Math.max(width, height) / 16
      },
      // 长宽比
      aspectRatio() {
        if (!this.icon) {
          return 1
        }
        let { width, height } = this.icon
        return width / height
      },
      // 宽度是否需要修正
      amendWidth() {
        return this.aspectRatio < 1
      },
      // 高度是否需要修正
      amendHeight() {
        return this.aspectRatio > 1
      },
      width() {
        return (
          this.childrenWidth ||
          (this.icon &&
            (this.icon.width /
              (this.amendWidth ? this.aspectRatio : 1) /
              this.ratio) *
              this.normalizedScale) ||
          0
        )
      },
      height() {
        return (
          this.childrenHeight ||
          (this.icon &&
            ((this.icon.height * (this.amendHeight ? this.aspectRatio : 1)) /
              this.ratio) *
              this.normalizedScale) ||
          0
        )
      },
      style() {
        if (this.normalizedScale === 1 && this.rotateDegree === 0) {
          return false
        }
        const styleObj = {}
        if (this.normalizedScale !== 1) {
          styleObj.fontSize = this.normalizedScale + 'em'
        }
        if (this.rotateDegree !== 0) {
          styleObj.transform = `rotate(${this.rotateDegree}deg)`
        }
        return styleObj
      },
      raw() {
        // generate unique id for each icon's SVG element with ID
        if (!this.icon || !this.icon.raw) {
          return null
        }
        let raw = this.icon.raw
        let ids = {}
        raw = raw.replace(
          /\s(?:xml:)?id=(["']?)([^"')\s]+)\1/g,
          (match, quote, id) => {
            let uniqueId = getId('vat-')
            ids[id] = uniqueId
            return ` id="${uniqueId}"`
          }
        )
        raw = raw.replace(
          /#(?:([^'")\s]+)|xpointer\(id\((['"]?)([^')]+)\2\)\))/g,
          (match, rawId, _, pointerId) => {
            let id = rawId || pointerId
            if (!id || !ids[id]) {
              return match
            }

            return `#${ids[id]}`
          }
        )

        return raw
      },
      focusable() {
        let { tabindex } = this
        if (tabindex == null) {
          return 'false'
        }
        let index =
          typeof tabindex === 'string' ? parseInt(tabindex, 10) : tabindex
        if (index >= 0) {
          return null
        }
        return 'false'
      },
    },
    mounted() {
      this.updateStack()
    },
    updated() {
      this.updateStack()
    },
    methods: {
      updateStack() {
        if (!this.name && this.name !== null && this.$children.length === 0) {
          warn(`Invalid prop: prop "name" is required.`, this)
          return
        }

        if (this.icon) {
          return
        }

        let width = 0
        let height = 0
        this.$children.forEach((child) => {
          child.outerScale = this.normalizedScale

          width = Math.max(width, child.width)
          height = Math.max(height, child.height)
        })
        this.childrenWidth = width
        this.childrenHeight = height
        this.$children.forEach((child) => {
          child.x = (width - child.width) / 2
          child.y = (height - child.height) / 2
        })
      },
    },
    render(h) {
      if (this.name === null) {
        return h()
      }

      let options = {
        class: this.klass,
        style: this.style,
        attrs: {
          role: this.$attrs.role || (this.label || this.title ? 'img' : null),
          'aria-label': this.label || null,
          'aria-hidden': !(this.label || this.title),
          tabindex: this.tabindex,
          x: this.x,
          y: this.y,
          width: this.width,
          height: this.height,
          viewBox: this.box,
          focusable: this.focusable,
        },
        on: this.$listeners,
      }

      if (this.raw) {
        let html = `<g>${this.raw}</g>`

        if (this.title) {
          html = `<title>${escapeHTML(this.title)}</title>${html}`
        }

        options.domProps = { innerHTML: html }
      }

      let content = this.title ? [h('title', this.title)] : []

      return h(
        'svg',
        options,
        this.raw
          ? null
          : content.concat([
              h(
                'g',
                this.$slots.default ||
                  (this.icon
                    ? [
                        ...this.icon.paths.map((path, i) =>
                          h('path', {
                            attrs: path,
                            key: `path-${i}`,
                          })
                        ),
                        ...this.icon.polygons.map((polygon, i) =>
                          h('polygon', {
                            attrs: polygon,
                            key: `polygon-${i}`,
                          })
                        ),
                      ]
                    : [])
              ),
            ])
      )
    },
    register(data) {
      for (let name in data) {
        let icon = data[name]
        let { paths = [], d, polygons = [], points } = icon

        if (d) {
          paths.push({ d })
        }

        if (points) {
          polygons.push({ points })
        }

        icons[name] = assign({}, icon, {
          paths,
          polygons,
        })
      }
    },
    icons,
  }

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key)
  }

  function assign(obj, ...sources) {
    sources.forEach((source) => {
      for (let key in source) {
        if (hasOwn(source, key)) {
          obj[key] = source[key]
        }
      }
    })

    return obj
  }

  let count = 0
  function getId(prefix = '') {
    return prefix + count++
  }

  const ESCAPE_MAP = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '&': '&amp;',
  }

  function escapeHTML(html) {
    return html.replace(/[<>"&]/g, (c) => ESCAPE_MAP[c] || c)
  }
</script>

<style>
  .fa-icon {
    display: inline-block;
    fill: currentColor;
    overflow: hidden;
    vertical-align: -0.3em;
  }

  .fa-icon > g {
    transform-origin: 50% 50%;
  }

  .fa-flip-horizontal {
    transform: scale(-1, 1);
  }

  .fa-flip-vertical {
    transform: scale(1, -1);
  }

  .fa-flip-both {
    transform: scale(-1, -1);
  }

  .fa-spin > g {
    animation: fa-spin 1s 0s infinite linear;
  }

  .fa-pulse > g {
    animation: fa-spin 1s infinite steps(8);
  }

  .fa-inverse {
    color: #fff;
  }

  @keyframes fa-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
