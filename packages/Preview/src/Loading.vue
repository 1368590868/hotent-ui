<template>
  <div class="loading__container">
    <div class="loading__container-div">
      <!-- 6 -->
      <div v-if="type == '6'" class="loader">
        <svg
          id="Layer_1"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="24px"
          height="30px"
          viewBox="0 0 24 30"
          style="enable-background:new 0 0 50 50;"
          xml:space="preserve"
        >
          <rect x="0" y="13" width="4" height="5" :fill="color">
            <animate
              attributeName="height"
              attributeType="XML"
              values="5;21;5"
              begin="0s"
              dur="0.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              attributeType="XML"
              values="13; 5; 13"
              begin="0s"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="10" y="13" width="4" height="5" :fill="color">
            <animate
              attributeName="height"
              attributeType="XML"
              values="5;21;5"
              begin="0.15s"
              dur="0.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              attributeType="XML"
              values="13; 5; 13"
              begin="0.15s"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="20" y="13" width="4" height="5" :fill="color">
            <animate
              attributeName="height"
              attributeType="XML"
              values="5;21;5"
              begin="0.3s"
              dur="0.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              attributeType="XML"
              values="13; 5; 13"
              begin="0.3s"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </rect>
        </svg>
      </div>
      <span :style="fontColor">{{ tip }}</span>
    </div>
  </div>
</template>
<script>
  import { t } from 'hotent-ui/src/locale'
  export default {
    name: 'Loading',
    props: {
      type: {
        type: String,
        default: '6',
      },
      color: {
        type: String,
        default: '#ff6700',
      },
      tip: {
        type: String,
        default() {
          return t('ht.preview.defaultLoadingTip')
        },
      },
    },
    computed: {
      fontColor: function() {
        return { color: this.color }
      },
    },
  }
</script>
<style lang="scss" scoped>
  .loading__container {
    height: 100%;
    width: 100%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    justify-content: center;

    .loading__container-div {
      display: inline-block;
    }

    .loader {
      text-align: center;
      margin-right: 1rem;
      display: inline-block;
      vertical-align: middle;
    }
  }
</style>
