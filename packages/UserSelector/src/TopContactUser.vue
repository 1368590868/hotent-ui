<template>
  <div class="contact-user__container">
    <el-scrollbar v-if="contactGroups.length > 0" class="selector-list__scroll">
      <ht-radio
        v-model="currentContactGroup"
        display-style="block"
        option-layout="vertical"
        :props="{ key: 'id', value: 'name' }"
        :options="contactGroups"
      ></ht-radio>
    </el-scrollbar>
    <div v-else class="el-tree__empty-block">
      <span class="el-tree__empty-text">{{ t('el.table.emptyText') }}</span>
    </div>
  </div>
</template>
<script>
  import Locale from '@/mixins/locale'

  export default {
    name: 'TopContactUser',
    mixins: [Locale],
    props: {
      mode: {
        type: String,
      },
    },
    data() {
      return {
        contactGroups: [],
        currentContactGroup: '',
      }
    },
    watch: {
      mode: function(newVal, oldVal) {
        if (newVal !== oldVal && newVal == 'search') {
          this.currentContactGroup = ''
        }
      },
      currentContactGroup: function(newVal, oldVal) {
        if (newVal !== oldVal) {
          this.$emit('contact-group-change', newVal)
        }
      },
    },
    mounted() {
      this.loadContactGroup()
    },
    methods: {
      loadContactGroup() {
        if (this.contactGroups.length == 0) {
          if (this.$requestConfig.getContactGroup) {
            this.$requestConfig
              .getContactGroup({
                pageBean: {
                  page: 1,
                  pageSize: 100,
                  total: 0,
                },
              })
              .then((data) => {
                if (data && data.rows.length > 0) {
                  this.contactGroups = [
                    { id: 'all', name: this.$t('ht.selector.all') },
                  ].concat(data.rows)
                  this.defaultContactGroup = 'all'
                } else {
                  this.data = []
                  this.defaultContactGroup = null
                }
              })
              .catch(() => {
                this.defaultContactGroup = null
              })
          } else {
            this.defaultContactGroup = null
          }
        }
      },
    },
  }
</script>
<style lang="scss" scoped>
  .contact-user__container {
    height: 100%;

    ::v-deep {
      .el-radio-group {
        width: 100%;
      }
      .el-radio-vertical {
        padding: 8px;
        margin-right: 0;

        &:hover {
          background-color: #f8f8f8;
        }

        .el-radio__input {
          display: none;
        }

        .el-radio__label {
          font-size: 14px;
        }
      }
    }
  }
</style>
