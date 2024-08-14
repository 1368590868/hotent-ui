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
      class="el-select"
      :class="{ 'has-value': value }"
      style="width: 100%; min-width: 180px"
      @click="showDialog"
    >
      <div
        ref="tagSpans"
        class="user-selector_block"
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
            <span class="el-select__tags-text">{{ item.fullname }}</span>
            <i
              v-if="inputWriteable"
              class="el-tag__close el-icon-close"
              @click="handleRemove(item)"
            ></i>
          </span>
          <template v-if="!selectors.length && value">
            <span
              v-for="(item, index) in value.split(',')"
              :key="index"
              class="el-tag el-tag--info el-tag--small"
              @click.stop
            >
              <span class="el-select__tags-text">{{ item }}</span>
              <i
                v-if="inputWriteable"
                class="el-tag__close el-icon-close"
                @click="handleRemoveText(index)"
              ></i>
            </span>
          </template>
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
            <ht-icon name="user" class="user-icon" />
          </span>
        </span>
      </div>
    </div>
    <ht-field-tail :field-name="inputName" :input-value="value" />
    <user-selector-dialog
      v-if="!isMobile"
      ref="userSelectorDialog"
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
      @contact-group-change="(group) => $emit('contact-group-change', group)"
      @load-org-user="(org) => $emit('load-org-user', org)"
      @load-policy-user="(policy) => $emit('load-policy-user', policy)"
      @load-role-user="(role) => $emit('load-role-user', role)"
    />
    <user-selector-mobile-dialog
      v-else
      ref="userSelectorMobileDialog"
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
  import UserSelectorDialog from './UserSelectorDialog.vue'
  import UserSelectorMobileDialog from './UserSelectorMobileDialog.vue'
  import { setTimeout } from 'timers'
  import { t } from '@/locale'

  export default {
    name: 'HtUserSelector',
    components: {
      HtFieldTail,
      UserSelectorDialog,
      UserSelectorMobileDialog,
    },
    mixins: [inputName, permission, mobileMode],
    props: {
      searchPlaceholder: {
        type: String,
        default() {
          return t('ht.selector.userAndAccount')
        },
      },
      value: String,
      single: {
        type: Boolean,
        default: false,
      },
      config: Object,
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
        default: 'fullname',
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
          return t('ht.selector.userTitle')
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
          : this.config && this.config.hasOwnProperty('account')
          ? 'account'
          : this.selectLabel
      },
    },
    watch: {
      // 当所选择的数据发生变化时，同步到v-model中
      selectors: function(newVal) {
        let ary = [],
          idAry = [],
          fullnameAry = [],
          mobileAry = [],
          emailAry = [],
          postNameAry = [],
          orgNameAry = [],
          accountAry = []

        if (newVal && newVal.constructor === Array && newVal.length > 0) {
          newVal.forEach((m) => {
            ary.push(m.fullname)
            if (m.hasOwnProperty('id')) {
              idAry.push(m.id)
            }
            if (m.hasOwnProperty('fullname')) {
              fullnameAry.push(m.fullname)
            }
            if (m.hasOwnProperty('account')) {
              accountAry.push(m.account)
            }
            if (m.hasOwnProperty('mobile')) {
              mobileAry.push(m.mobile)
            }
            if (m.hasOwnProperty('email')) {
              emailAry.push(m.email)
            }
            if (m.hasOwnProperty('postName')) {
              postNameAry.push(m.postName)
            }
            if (m.hasOwnProperty('orgName')) {
              orgNameAry.push(m.orgName)
            }
          })
        }
        if (this.config) {
          // 配置了id的绑定关系，则回填到指定属性上
          if (this.config.hasOwnProperty('id')) {
            utils.setValueByConfigKey(this, this.config, 'id', idAry.join(','))
          }
          // 配置了fullname的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('fullname')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'fullname',
              fullnameAry.join(',')
            )
          }
          // 配置了account的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('account')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'account',
              accountAry.join(',')
            )
          }
          // 配置了mobile的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('mobile')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'mobile',
              mobileAry.join(',')
            )
          }
          // 配置了email的绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('email')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'email',
              emailAry.join(',')
            )
          }

          // 配置了post绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('postName')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'postName',
              postNameAry.join(',')
            )
          }

          // 配置了org绑定关系，则回填到指定的属性上
          if (this.config.hasOwnProperty('orgName')) {
            utils.setValueByConfigKey(
              this,
              this.config,
              'orgName',
              orgNameAry.join(',')
            )
          }
        } else {
          this.$emit('change', newVal)
        }
        // 通过valueChange事件发布值变更消息
        setTimeout(() => {
          this.$emit('valueChange', ary.join(','), newVal)
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
            accountAry = [],
            fullnameAry = [],
            mobileAry = [],
            postNameAry = [],
            orgNameAry = [],
            emailAry = []
          if (this.config) {
            // 配置了id绑定关系，则获取id的值
            if (this.config.hasOwnProperty('id')) {
              let idVal = utils.getValueByConfigKey(this, this.config, 'id')
              if (idVal) {
                idAry = idVal.split(',').trim()
              }
            }
            // 配置了fullname绑定关系，则获取fullname的值
            if (this.config.hasOwnProperty('fullname')) {
              let fullnameVal = utils.getValueByConfigKey(
                this,
                this.config,
                'fullname'
              )
              if (fullnameVal) {
                fullnameAry = fullnameVal.split(',').trim()
              }
            }

            // 配置了account绑定关系，则获取account的值
            if (this.config.hasOwnProperty('account')) {
              let accountVal = utils.getValueByConfigKey(
                this,
                this.config,
                'account'
              )
              if (accountVal) {
                accountAry = accountVal.split(',').trim()
              }
            }

            // 配置了mobile绑定关系，则获取mobile的值
            if (this.config.hasOwnProperty('mobile')) {
              let mobileVal = utils.getValueByConfigKey(
                this,
                this.config,
                'mobile'
              )
              if (mobileVal) {
                mobileAry = mobileVal.split(',').trim()
              }
            }

            // 配置了post绑定关系，则获取post的值
            if (this.config.hasOwnProperty('postName')) {
              let postVal = utils.getValueByConfigKey(
                this,
                this.config,
                'postName'
              )
              if (postVal) {
                postNameAry = postVal.split(',').trim()
              }
            }

            // 配置了org绑定关系，则获取org的值
            if (this.config.hasOwnProperty('orgName')) {
              let orgVal = utils.getValueByConfigKey(
                this,
                this.config,
                'orgName'
              )
              if (orgVal) {
                orgNameAry = orgVal.split(',').trim()
              }
            }

            // 配置了email绑定关系，则获取email的值
            if (this.config.hasOwnProperty('email')) {
              let emailVal = utils.getValueByConfigKey(
                this,
                this.config,
                'email'
              )
              if (emailVal) {
                emailAry = emailVal.split(',').trim()
              }
            }
          }
          // 将fullname、id、code从逗号分割的字符串解析为json对象格式的数组
          let valAry = this.value.split(',').trim()
          valAry.forEach((m, index) => {
            let item = { fullname: m }
            if (idAry.length > index) {
              item['id'] = idAry[index]
            }
            if (accountAry.length > index) {
              item['account'] = accountAry[index]
            }
            if (fullnameAry.length > index) {
              item['fullname'] = fullnameAry[index]
            }
            if (mobileAry.length > index) {
              item['mobile'] = mobileAry[index]
            }
            if (emailAry.length > index) {
              item['email'] = emailAry[index]
            }
            if (postNameAry.length > index) {
              item['postName'] = postNameAry[index]
            }
            if (orgNameAry.length > index) {
              item['orgName'] = orgNameAry[index]
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
          this.$refs.userSelectorMobileDialog.showDialog()
        } else {
          this.$refs.userSelectorDialog.showDialog()
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
      handleRemoveText(index) {
        if (!this.value) {
          return
        }
        let values = this.value.split(',')
        values.splice(index, 1)
        this.$emit('input', values.join(','))
      },
    },
  }
</script>
<style lang="scss" scoped>
  .user-selector_block {
    width: calc(100% - 25px);
    background: #fff;
    margin-left: 1px;
  }
  .el-select__tags_readonly {
    position: relative;
    top: 50%;
    background: unset !important;
  }

  .el-input__inner[aria-invalid='true'] {
    border-color: #f56c6c;
  }

  .el-input__suffix {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
