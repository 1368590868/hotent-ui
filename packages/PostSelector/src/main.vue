<template>
  <div
    v-if="permission !== 'n'"
    :class="[
      'inputs',
      formInputsDisplay == 'block'
        ? 'ht-form-inputs__block'
        : 'ht-form-inputs__inline',
    ]"
  >
    <div
      style="width: 100%; min-width:180px;"
      class="el-select"
      :class="{ 'has-value': selectors.length > 0 }"
      @click="showDialog"
    >
      <div
        ref="tagSpans"
        style="width: calc(100% - 25px);"
        :class="{
          'el-select__tags_readonly': !inputWriteable,
          'el-select__tags': inputWriteable,
        }"
      >
        <span class="tag-wrap">
          <span
            v-for="(item, index) in selectors"
            :key="index"
            class="el-tag el-tag--info el-tag--small"
            @click.stop
          >
            <span class="el-select__tags-text">{{ item.name }}</span>
            <i
              v-if="inputWriteable"
              class="el-tag__close el-icon-close"
              @click="handleRemove(item)"
            ></i>
          </span>
        </span>
      </div>
      <div v-if="inputWriteable" class="el-input el-input--suffix">
        <input
          ref="inputEl"
          v-model="value"
          v-validate="inputValidate"
          type="text"
          readonly="readonly"
          :name="inputName"
          autocomplete="off"
          class="el-input__inner"
          :placeholder="placeholder"
          :style="{
            height: inputSuffixHeight + 'px',
            lineHeight: inputSuffixHeight + 'px',
          }"
        />
        <span class="el-input__suffix">
          <span class="el-input__suffix-inner">
            <i class="el-icon-circle-close clear-icon" @click.stop="clear"></i>
            <ht-icon name="users" class="user-icon" />
          </span>
        </span>
      </div>
    </div>
    <ht-field-tail :field-name="inputName" :input-value="value" />
    <post-selector-dialog
      v-if="!isMobile"
      ref="postSelectorDialog"
      v-model="selectors"
      :title="title"
      :append-to-body="appendToBody"
      :data="data"
      :pagination="pagination"
      :select-label="selectLabel"
      :quick-search-props="quickSearchProps"
      :single="single"
      :search-placeholder="searchPlaceholder"
      :primary-field="primaryField"
      :mode="mode"
      @filter-type-change="(type) => $emit('filter-type-change', type)"
      @search="(word) => $emit('search', word)"
      @reset="() => $emit('reset')"
      @row-click="(row) => $emit('row-click', row)"
      @select-data="(data) => $emit('select-data', data)"
      @page-change="(page) => $emit('page-change', page)"
      @size-change="(size) => $emit('size-change', size)"
      @load-org-post="(org) => $emit('load-org-post', org)"
      @load-policy-post="(policy) => $emit('load-policy-post', policy)"
    />
    <post-selector-mobile-dialog
      v-else
      ref="postSelectorMobileDialog"
      v-model="selectors"
      :title="title"
      :append-to-body="appendToBody"
      :data="data"
      :pagination="pagination"
      :select-label="selectLabel"
      :single="single"
      :search-placeholder="searchPlaceholder"
      :primary-field="primaryField"
      @search="(word) => $emit('search', word)"
      @reset="() => $emit('reset')"
      @row-click="(row) => $emit('row-click', row)"
      @select-data="(data) => $emit('select-data', data)"
      @page-change="(page) => $emit('page-change', page)"
    />
  </div>
</template>
<script>
  import utils from '@/utils.js'
  import inputName from '@/mixins/inputName.js'
  import permission from '@/mixins/permission.js'
  import mobileMode from '@/mixins/mobileMode.js'
  import HtFieldTail from '../../FieldTail/index'
  import { setTimeout } from 'timers'
  import PostSelectorDialog from './PostSelectorDialog.vue'
  import PostSelectorMobileDialog from './PostSelectorMobileDialog.vue'
  import { t } from '@/locale'
  export default {
    name: 'HtPostSelector',
    components: {
      HtFieldTail,
      PostSelectorDialog,
      PostSelectorMobileDialog,
    },
    mixins: [inputName, permission, mobileMode],
    props: {
      searchPlaceholder: {
        type: String,
        default() {
          return t('ht.selector.orgDefaultPlaceholder')
        },
      },
      value: {
        type: String,
        default: '',
      },
      single: {
        type: Boolean,
        default: false,
      },
      config: {
        type: Object,
        default: null,
      },
      data: {
        type: Array,
        default: () => {
          return []
        },
      },
      pagination: {
        type: Object,
        default: () => {
          return {
            page: 1,
            pageSize: 50,
            total: 0,
          }
        },
      },
      selectLabel: {
        type: String,
        default: 'jobName',
      },
      quickSearchProps: {
        type: String,
        required: true,
      },
      appendToBody: {
        type: Boolean,
        default: false,
      },
      formInputsDisplay: {
        type: String,
        default: 'inline',
      },
      title: {
        type: String,
        default() {
          return t('ht.selector.postTitle')
        },
      },
      mode: {
        type: String,
      },
    },
    data() {
      return {
        inputSuffixHeight: 30,
        selectors: [],
      }
    },
    computed: {
      primaryField: function() {
        return this.config && this.config.hasOwnProperty('id')
          ? 'id'
          : this.config && this.config.hasOwnProperty('code')
          ? 'code'
          : this.selectLabel
      },
    },
    watch: {
      // 当所选择的数据发生变化时，同步到v-model中
      selectors: function(newVal) {
        let ary = [],
          idAry = [],
          codeAry = [],
          nameAry = []
        if (newVal && newVal.constructor === Array && newVal.length > 0) {
          newVal.forEach((m) => {
            ary.push(m.name)
            if (m.hasOwnProperty('id')) {
              idAry.push(m.id)
            }
            if (m.hasOwnProperty('code')) {
              codeAry.push(m.code)
            }
            if (m.hasOwnProperty('name')) {
              nameAry.push(m.name)
            }
          })
        }
        if (this.config) {
          // 配置了id的绑定关系，则回填到指定属性上
          if (this.config.hasOwnProperty('id')) {
            utils.setValueByConfigKey(this, this.config, 'id', idAry.join(','))
          }
          // 配置了code的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('code')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'code',
              codeAry.join(',')
            )
          }
          // 配置了name的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('name')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'name',
              nameAry.join(',')
            )
          }
        } else {
          this.$emit('change', newVal)
        }
        // 通过valueChange事件发布值变更消息
        this.$emit('valueChange', ary.join(','), newVal)
        setTimeout(() => {
          if (newVal.length > 0) {
            this.calacInputSuffixHeight()
          } else {
            this.inputSuffixHeight = 30
          }
          if (this.$refs.inputEl) {
            this.$refs.inputEl.focus()
            this.$refs.inputEl.blur()
          }
        }, 10)
      },
      value: function() {
        // 父级传递进来的value发生变更时，需要同步到当前所选数据中
        this.valueInit()
      },
    },
    mounted() {
      // 组件第一次挂载时，同步value到当前所选数据中
      this.valueInit()
    },
    methods: {
      // 同步value到当前所选数据中
      valueInit() {
        let tmpAry = []
        if (this.value) {
          let idAry = [],
            codeAry = [],
            nameAry = []
          if (this.config) {
            // 配置了id绑定关系，则获取id的值
            if (this.config.hasOwnProperty('id')) {
              let idVal = utils.getValueByConfigKey(this, this.config, 'id')
              if (idVal) {
                idAry = idVal.split(',').trim()
              }
            }
            // 配置了name绑定关系，则获取name的值
            if (this.config.hasOwnProperty('name')) {
              let nameVal = utils.getValueByConfigKey(this, this.config, 'name')
              if (nameVal) {
                nameAry = nameVal.split(',').trim()
              }
            }

            // 配置了code绑定关系，则获取code的值
            if (this.config.hasOwnProperty('code')) {
              let codeVal = utils.getValueByConfigKey(this, this.config, 'code')
              if (codeVal) {
                codeAry = codeVal.split(',').trim()
              }
            }
          }
          // 将name、id、code从逗号分割的字符串解析为json对象格式的数组
          let valAry = this.value.split(',').trim()
          valAry.forEach((m, index) => {
            let item = { name: m }
            if (idAry.length > index) {
              item['id'] = idAry[index]
            }
            if (nameAry.length > index) {
              item['name'] = nameAry[index]
            }
            if (codeAry.length > index) {
              item['code'] = codeAry[index]
            }
            tmpAry.push(item)
          })
        }
        // 对数组做深度对比，如果值不完全相等，则进行赋值操作
        if (!utils.arrayEquals(tmpAry, this.selectors)) {
          this.selectors = tmpAry
        }
      },
      showDialog() {
        if (!this.inputWriteable) {
          return
        }
        if (this.isMobile) {
          this.$refs.postSelectorMobileDialog.showDialog()
        } else {
          this.$refs.postSelectorDialog.showDialog()
        }
      },
      handleRemove(item) {
        this.selectors.remove(item)
      },
      clear() {
        this.selectors = []
        this.inputSuffixHeight = 30
      },
      // 更新当前输入框的高度来适配已选数据的高度
      calacInputSuffixHeight() {
        if (!this.$refs.tagSpans) return
        if (this.$refs.tagSpans.offsetHeight) {
          this.inputSuffixHeight = this.$refs.tagSpans.offsetHeight + 5
        } else {
          this.inputSuffixHeight = 30
        }
      },
    },
  }
</script>
<style lang="scss" scoped>
  .el-select__tags {
    background: #fff;
    margin-left: 1px;
  }

  .el-select__tags_readonly {
    position: relative;
    top: 50%;
  }

  .el-input__inner[aria-invalid='true'] {
    border-color: #f56c6c;
  }
  ::v-deep .el-main {
    padding-top: 0;
    padding-bottom: 0;
  }
  .el-input__suffix {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
