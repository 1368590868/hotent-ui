<template>
  <div>
    <el-dialog
      v-if="dialogVisible"
      :title="$t('ht.templateImportResult.title')"
      :visible.sync="dialogVisible"
      width="70%"
    >
      <span>
        <el-tabs
          v-model="activeName"
          type="card"
          tab-position="top"
          @tab-click="handleTabClick"
        >
          <el-tab-pane
            v-for="item in data"
            :key="item.entName"
            :label="`${item.desc}(${item.entName})`"
            :name="item.entName"
          >
            <el-table
              :data="(item.pageList && item.pageList.rows) || item.rows"
              border
              stripe
              height="500px"
            >
              <el-table-column type="index" align="center"></el-table-column>
              <el-table-column
                :label="$t('ht.templateImportResult.mainKey')"
                align="center"
              >
                <template slot-scope="scope">
                  <span>
                    {{ scope.row.dataNode[entMap[item.entName].pkKey] }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('ht.templateImportResult.foreignKey')"
                align="center"
              >
                <template slot-scope="scope">
                  <span>
                    {{ scope.row.dataNode[entMap[item.entName].fk] }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('ht.templateImportResult.validOrNot')"
                align="center"
              >
                <template slot-scope="scope">
                  <el-tag v-if="!scope.row.state" type="danger">
                    {{ $t('ht.templateImportResult.no') }}
                  </el-tag>
                  <el-tag v-if="scope.row.state" type="success">
                    {{ $t('ht.templateImportResult.yes') }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('ht.templateImportResult.errorInfo')"
                prop="cause"
                align="center"
              ></el-table-column>
              <el-table-column
                :label="$t('ht.templateImportResult.duplicateOrNot')"
                align="center"
              >
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.repeat" type="danger">
                    {{ $t('ht.templateImportResult.yes') }}
                  </el-tag>
                  <el-tag v-else type="success">
                    {{ $t('ht.templateImportResult.no') }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                v-for="column in attributeMap[item.entName] || []"
                :key="column.id"
                :label="column.desc"
                align="center"
              >
                <template slot-scope="scope">
                  <span>
                    {{ scope.row.dataNode[column.name] }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              :current-page="pageBean.page"
              :page-sizes="[20, 40, 60, 80, 100, 200, 300, 400]"
              :page-size="pageBean.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pageBean.total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            ></el-pagination>
          </el-tab-pane>
        </el-tabs>
      </span>
      <span slot="footer">
        <el-button @click="dialogVisible = false">
          {{ $t('ht.common.cancle') }}
        </el-button>
        <el-button type="primary" @click="processImportResult">
          {{ $t('ht.templateImportResult.import') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'TemplateImportResult',
    props: {
      templateInfo: {
        type: Object,
        default: () => {
          return {}
        },
      },
    },
    data() {
      return {
        cacheKey: '',
        dialogVisible: false,
        activeName: '',
        data: [],
        entMap: {},
        attributeMap: {},
        mapLoaded: false,
        pageBean: {
          page: 1,
          pageSize: 20,
          total: 0,
        },
        currentIndex: 0,
      }
    },
    methods: {
      handleSizeChange(pageSize) {
        this.pageBean.pageSize = pageSize
        this.loadData(true)
      },
      handleCurrentChange(page) {
        this.pageBean.page = page
        this.loadData(true)
      },
      showDialog(cacheKey) {
        this.cacheKey = cacheKey
        this.currentIndex = 0
        this.loadData()
        //this.dialogVisible = true
      },
      handleTabClick(tab) {
        this.currentIndex = Number(tab.index)
        this.pageBean = {
          page: 1,
          pageSize: 20,
        }
        this.loadData(true)
      },
      loadData(isSizeOrPageChange = false) {
        const this_ = this
        this.$requestConfig
          .getTemplateImportResult(this_.cacheKey, this.pageBean)
          .then((resp) => {
            if (!resp || !resp.length) {
              this_.$message.error(
                this_.$t('ht.templateImportResult.importFail')
              )
            } else {
              this_.data = resp
              if (resp[this.currentIndex] && resp[this.currentIndex].pageList) {
                const { page, pageSize, total } = resp[
                  this.currentIndex
                ].pageList
                this.pageBean = {
                  page,
                  pageSize,
                  total,
                }
              }
              if (resp.length && !isSizeOrPageChange) {
                this.activeName = resp[0].entName
              }
              let entAttributeMap = {}
              let entMap = {}
              if (!this_.mapLoaded) {
                this.$requestConfig
                  .getBoDefinition(this_.templateInfo.boDefAlias)
                  .then((boJson) => {
                    let fn_ = function(obj) {
                      entMap[obj.name] = obj
                      if (obj.attributeList && obj.attributeList.length) {
                        entAttributeMap[obj.name] = obj.attributeList
                      }
                      if (obj.childEnts && obj.childEnts.length) {
                        obj.childEnts.forEach(fn_)
                      }
                    }
                    fn_(boJson.boEnt)
                    this_.attributeMap = entAttributeMap
                    this_.entMap = entMap
                    this_.mapLoaded = true
                    this_.dialogVisible = true
                  })
              } else {
                this_.dialogVisible = true
              }
            }
          })
      },
      processImportResult() {
        const loading = this.$loading({
          text: this.$t('ht.templateImportResult.loadingText'),
        })
        this.$requestConfig
          .saveImportResult(this.cacheKey, this.templateInfo.alias)
          .then((result) => {
            if (result.state) {
              this.$message.success(result.message)
              this.dialogVisible = false
              loading.close()
              this.$emit('after-save')
            }
          })
          .catch(() => {
            loading.close()
          })
      },
    },
  }
</script>

<style lang="scss" scoped></style>
