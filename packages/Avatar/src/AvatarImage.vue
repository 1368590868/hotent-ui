<template>
  <div
    class="vue-avatar--wrapper"
    :style="[style, customStyle]"
    aria-hidden="true"
  >
    <img v-if="isImage" style="display: none" :src="src" @error="onImgError" />
    <span v-show="!isImage">{{ userInitial }}</span>
  </div>
</template>

<script>
  const getInitials = (username) => {
    let parts = username.split(/[ -]/)
    let initials = ''

    for (var i = 0; i < parts.length; i++) {
      initials += parts[i].charAt(0)
    }

    if (initials.length > 3 && initials.search(/[A-Z]/) !== -1) {
      initials = initials.replace(/[a-z]+/g, '')
    }
    // 包括中文且没有空格
    if (parts.length == 1 && /^[\u4e00-\u9fa5]+.*$/.test(username)) {
      initials =
        username.length > 1 ? username.substr(0, 2) : username.substr(0, 1)
    } else {
      initials = initials.substr(0, 3).toUpperCase()
    }

    return initials
  }

  export default {
    name: 'HtAvatarImage',
    props: {
      username: {
        type: String,
      },
      initials: {
        type: String,
      },
      backgroundColor: {
        type: String,
      },
      color: {
        type: String,
      },
      customStyle: {
        type: Object,
      },
      inline: {
        type: Boolean,
      },
      size: {
        type: Number,
        default: 50,
      },
      src: {
        type: String,
      },
      rounded: {
        type: Boolean,
        default: true,
      },
      lighten: {
        type: Number,
        default: 80,
      },
      parser: {
        type: Function,
        default: getInitials,
        validator: (parser) => typeof parser('John', getInitials) === 'string',
      },
    },

    data() {
      return {
        backgroundColors: [
          '#F44336',
          '#FF4081',
          '#9C27B0',
          '#673AB7',
          '#3F51B5',
          '#2196F3',
          '#03A9F4',
          '#00BCD4',
          '#009688',
          '#4CAF50',
          '#8BC34A',
          '#CDDC39',
          '#FFC107',
          '#FF9800',
          '#FF5722',
          '#795548',
          '#9E9E9E',
          '#607D8B',
        ],
        imgError: false,
      }
    },
    computed: {
      background() {
        if (!this.isImage) {
          return (
            this.backgroundColor ||
            this.randomBackgroundColor(
              this.username.length,
              this.backgroundColors
            )
          )
        }
        return null
      },

      fontColor() {
        if (!this.isImage) {
          return this.color || this.lightenColor(this.background, this.lighten)
        }
        return null
      },

      isImage() {
        return !this.imgError && Boolean(this.src)
      },

      style() {
        const style = {
          display: this.inline ? 'inline-flex' : 'flex',
          width: `${this.size}px`,
          height: `${this.size}px`,
          borderRadius: this.rounded ? '50%' : 0,
          lineHeight: `${this.size + Math.floor(this.size / 20)}px`,
          fontWeight: 'bold',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          userSelect: 'none',
        }

        const imgBackgroundAndFontStyle = {
          background: `transparent url('${this.src}') no-repeat scroll 0% 0% / ${this.size}px ${this.size}px content-box border-box`,
        }

        const initialBackgroundAndFontStyle = {
          backgroundColor: this.background,
          font: `${Math.floor(this.size / 2.5)}px/${
            this.size
          }px Helvetica, Arial, sans-serif`,
          color: this.fontColor,
        }

        const backgroundAndFontStyle = this.isImage
          ? imgBackgroundAndFontStyle
          : initialBackgroundAndFontStyle

        Object.assign(style, backgroundAndFontStyle)

        return style
      },

      userInitial() {
        if (!this.isImage) {
          const initials =
            this.initials || this.parser(this.username, getInitials)
          return initials
        }
        return ''
      },
    },

    mounted() {
      if (!this.isImage) {
        this.$emit('avatar-initials', this.username, this.userInitial)
      }
    },

    methods: {
      initial: getInitials,

      onImgError() {
        this.imgError = true
      },

      randomBackgroundColor(seed, colors) {
        return colors[seed % colors.length]
      },

      lightenColor(hex, amt) {
        var usePound = false

        if (hex[0] === '#') {
          hex = hex.slice(1)
          usePound = true
        }

        var num = parseInt(hex, 16)
        var r = (num >> 16) + amt

        if (r > 255) r = 255
        else if (r < 0) r = 0

        var b = ((num >> 8) & 0x00ff) + amt

        if (b > 255) b = 255
        else if (b < 0) b = 0

        var g = (num & 0x0000ff) + amt

        if (g > 255) g = 255
        else if (g < 0) g = 0

        return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
      },
    },
  }
</script>
