<template>
  <div class="organization-container">
    <div class="demension__container">
      <ht-select
        v-model="currentDemension"
        size="small"
        :clearable="false"
        :options="demensions"
        display-style="block"
        :props="{ key: 'id', value: 'demName' }"
      />
    </div>
    <el-scrollbar class="organization-list__scroll">
      <ht-tree
        ref="tree"
        lazy
        display-style="block"
        :load="loadOrgTree"
        :data="orgs"
        :default-expand-all="false"
        :highlight-current="true"
        :props="{
          children: 'children',
          label: 'name',
          isLeaf: 'leaf',
        }"
        node-key="id"
        class="org-tree"
        accordion
        @node-click="(org) => $emit('load-org-post', org)"
      />
    </el-scrollbar>
  </div>
</template>
<script>
  import utils from '@/utils.js'

  export default {
    name: 'Organization',
    props: {
      mode: {
        type: String,
      },
    },
    data() {
      return {
        demensions: [],
        currentDemension: '',
        orgs: [],
      }
    },
    watch: {
      mode: function(newVal, oldVal) {
        if (newVal !== oldVal && newVal == 'search') {
          this.$refs.tree.setCurrentKey(null)
        }
      },
      currentDemension: function(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.changeDemension(newVal)
        }
      },
    },
    mounted() {
      this.loadDemensions()
    },
    methods: {
      // 加载维度数据
      loadDemensions() {
        if (!this.demensions || this.demensions.length == 0) {
          this.$requestConfig.getAllDemensions().then((data) => {
            this.demensions = data
            data.forEach((element) => {
              if (element.isDefault == 1) {
                this.currentDemension = element.id
              }
            })
            if (!this.currentDemension) {
              this.currentDemension = data[0].id
            }
          })
        }
      },
      // 维度改变 重新获取组织
      changeDemension(currentDemensionId) {
        this.$requestConfig
          .getOrgTree({
            demId: currentDemensionId
              ? currentDemensionId
              : this.currentDemension,
          })
          .then((data) => {
            this.orgs = utils.tile2nest(data)
          })
      },
      // 加载组织数据
      loadOrgTree(node, resolve) {
        if (node && node.data && node.data.isParent) {
          if (node.data.children) {
            resolve(node.data.children)
          } else {
            this.$requestConfig
              .getOrgTree({
                demId: node.data.demId,
                parentId: node.data.id,
              })
              .then((data) => {
                resolve(data)
              })
          }
        } else {
          resolve([])
        }
      },
    },
  }
</script>
<style lang="scss" scoped>
  .organization-container {
    height: 100%;

    .demension__container {
      padding: 0 10px;
    }

    .organization-list__scroll {
      margin-top: 10px;
      height: calc(100% - 50px);
    }
  }
</style>
