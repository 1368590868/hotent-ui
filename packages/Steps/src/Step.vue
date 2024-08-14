<template>
  <el-row class="step-wrap">
    <div :span="1">
      <span style="font-weight: bold; font-size: 14px">
        {{ pageNum + 1 }}/{{ pageSize }}
      </span>
    </div>
    <div :span="3" class="step-item">
      <el-button
        class="step_change_btn"
        :class="{ hidden: pageNum == 0 }"
        type="success"
        :style="
          'background-color:' +
            backButton.color +
            ';border-color:' +
            backButton.color
        "
        :icon="backButton.icon"
        @click="back"
      >
        {{ backButton.name }}
      </el-button>
      <el-button
        class="step_change_btn"
        :class="{ hidden: pageNum >= pageSize - 1 }"
        type="success"
        :style="
          'background-color:' +
            nextButton.color +
            ';border-color:' +
            nextButton.color
        "
        :icon="nextButton.icon"
        @click="next"
      >
        {{ nextButton.name }}
      </el-button>
    </div>
  </el-row>
</template>
<script>
  import Emitter from '@/mixins/emitter'
  import { t } from '@/locale'

  export default {
    name: 'HtStep',
    componentName: 'HtStep',
    mixins: [Emitter],
    props: {
      pageSize: {
        type: Number,
        require: true,
      },
      backButton: {
        type: Object,
        default: () => {
          return {
            name: t('ht.step.pre'),
            color: '#409eff',
          }
        },
      },
      nextButton: {
        type: Object,
        default: () => {
          return {
            name: t('ht.step.next'),
            color: '#67C23A',
          }
        },
      },
      isVerify: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        pageNum: 0,
      }
    },
    created() {
      this.$on('validateRegion', (result, step) => {
        result && this.doJump(step)
      })
    },
    methods: {
      verifyBeforeJump(step) {
        this.dispatch('HtSteps', 'beforeJump', step)
      },
      doJump(step) {
        this.pageNum += step
        this.dispatch('HtSteps', 'pageAlter', this.pageNum)
        this.$emit('updatePageIndex', this.pageNum)
      },
      back() {
        if (!this.isVerify) {
          this.doJump(-1)
        } else {
          this.verifyBeforeJump(-1)
        }
        this.$root.$emit('collapse-active-names', 'success')
      },
      next() {
        if (!this.isVerify) {
          this.doJump(1)
        } else {
          this.verifyBeforeJump(1)
        }
        this.$root.$emit('collapse-active-names', 'success')
      },
    },
  }
</script>
<style lang="scss" scoped>
  .step_change_btn {
    height: 32px;
    min-width: 80px;
    padding: 0px 8px;
  }
  .step_change_btn.hidden {
    display: none;
  }
  .step-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    .step-item {
      display: flex;
      margin-left: 24px;
      .el-button + .el-button {
        margin-left: 0;
      }
      .el-button {
        margin-right: 10px;
      }
    }
  }
</style>
