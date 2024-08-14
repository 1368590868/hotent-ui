import styles from '@/styles/index.scss'

export default (level) => {
  const headerComponent = {
    name: `HtH${level}`,
    props: {
      type: {
        type: String,
        default: 'primary',
        validator(val) {
          return (
            val === 'info' ||
            val === 'success' ||
            val === 'warning' ||
            val === 'danger' ||
            val === 'primary'
          )
        },
      },
      textGap: {
        type: String,
        default: '16px',
      },
      scene: {
        type: Boolean,
        default: false,
      },
      barWidth: {
        type: String,
        default: '4px',
      },
      inline: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      typeColor() {
        return this.type == 'info'
          ? styles.info_color
          : this.type == 'success'
          ? styles.success_color
          : this.type == 'warning'
          ? styles.warning_color
          : this.type == 'danger'
          ? styles.danger_color
          : styles.primary_color
      },
    },
    render(h) {
      let style = {
        '--header-padding-left': this.textGap,
        '--bar-color': this.typeColor,
        '--bezier': 'cubic-bezier(0.4, 0, 0.2, 1)',
        '--bar-width': this.barWidth,
        display: this.inline ? 'inline' : 'block',
        color: this.scene ? this.typeColor : 'trsparent',
      }
      this.inline && (style.display = 'inline')
      this.scene && (style.color = this.typeColor)
      return h(
        `h${level}`,
        {
          class: ['ht-typography__header'],
          style,
        },
        this.$slots.default
      )
    },
  }
  return headerComponent
}
