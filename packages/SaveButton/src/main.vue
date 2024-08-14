<template>
  <el-button
    :type="type"
    :loading="loading"
    :disabled="disabled"
    :icon="icon"
    @click="preSubmitData"
  >
    <slot></slot>
  </el-button>
</template>

<script>
  export default {
    name: 'HtSaveButton',
    props: {
      isSubmit: {
        type: Boolean,
        default: true,
      },
      type: {
        type: String,
        default: 'primary',
      },
      scopeName: {
        type: String,
        required: true,
      },
      loading: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      icon: String,
    },
    data() {
      return {}
    },
    mounted() {
      this.$validator = this.$root.$validator
    },
    methods: {
      preSubmitData() {
        this.$validator.validateAll(this.scopeName).then((result) => {
          if (result) {
            this.submitData()
          } else {
            let arr = this.$validator.errors.items.filter(
              (item) => item.scope == this.scopeName
            )
            let errorLength = arr.length
            this.$message({
              showClose: true,
              message: this.$t('ht.savaButton.errorMsg', {
                errorLength: errorLength,
              }),
              type: 'warning',
            })
          }
        })
      },
      async submitData() {
        // 表单数据 model  是否提交  true 提交 false 不提交
        await this.$emit('before-save-data')

        if (this.isSubmit) {
          this.$emit('request-save-data')
        }
      },
    },
  }
</script>
