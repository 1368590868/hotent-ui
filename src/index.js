import '@/directive/index'
import '@/filter/index'
import loadingIndex from '@/plugins/loading/index.js'
import validate from '@/validate'
import CommonScripts from '@/services/commonScripts.js'
import HtInput from '../packages/Input/index'
import HtCheckbox from '../packages/Checkbox/index'
import HtTable from '../packages/Table/index'
import HtTableColumn from '../packages/TableColumn/index'
import HtTableSearchPanel from '../packages/TableSearchPanel/index'
import HtTableSearchField from '../packages/TableSearchField/index'
import HtRadio from '../packages/Radio/index'
import HtDate from '../packages/Date/index'
import HtTimeSelect from '../packages/TimeSelect/index'
import HtTimePicker from '../packages/TimePicker/index'
import HtSelect from '../packages/Select/index'
import HtFile from '../packages/File/index'
import HtDemension from '../packages/Demension/index'
import HtTree from '../packages/Tree/index'
import HtAddQueryStrategy from '../packages/AddQueryStrategy/index'
import HtSidebarDialog from '../packages/SidebarDialog/index'
import Selector from '../packages/Selector/index'
import HtRoleSelector from '../packages/RoleSelector/index'
import HtUserSelector from '../packages/UserSelector/index'
import HtOrgSelector from '../packages/OrgSelector/index'
import HtJobSelector from '../packages/JobSelector/index'
import HtPostSelector from '../packages/PostSelector/index'
import HtDimensionSelector from '../packages/DimensionSelector/index'
import HtUserDialog from '../packages/UserDialog/index'
import HtDialog from '../packages/Dialog/index'
import HtCustomDialog from '../packages/CustomDialog/index'
import HtOrgPostDialog from '../packages/OrgPostDialog/index'
import HtTreeDialog from '../packages/TreeDialog/index'
import HtTreeListDialog from '../packages/TreeListDialog/index'
import HtFormItem from '../packages/FormItem/index'
import HtSaveButton from '../packages/SaveButton/index'
import HtDuration from '../packages/Duration/index'
import HtFieldTail from '../packages/FieldTail/index'
import HtFileUpload from '../packages/FileUpload/index'
import HtIcon from '../packages/Icon/index'
import HtEditor from '../packages/Editor/index'
import HtPicture from '../packages/picture/index'
import HtExplain from '../packages/Explain/index'
import HtAvatarImage from '../packages/Avatar/index'
import {
  HtH1,
  HtH2,
  HtH3,
  HtH4,
  HtH5,
  HtH6,
} from '../packages/Typography/index'
import '../packages/Icon/src/icons'
import locale from '@/locale'
import { version } from '../package.json'

/** eip-control */
import HtCollapse from '../packages/Collapse/index'
import HtCollapseItem from '../packages/CollapseItem/index'
import HtStep from '../packages/Step/index'
import HtSteps from '../packages/Steps/index'
import HtStepLayout from '../packages/StepLayout/index'
import HtDivider from '../packages/Divider/index'
import HtTabs from '../packages/Tabs/index'
import HtAutocomplete from '../packages/Autocomplete/index'
import HtCascader from '../packages/Cascader/index'
import HtDatePicker from '../packages/DatePicker/index'
import HtDictionary from '../packages/Dictionary/index'
import HtReadonlyInput from '../packages/ReadonlyInput/index'
import HtOnlineForm from '../packages/OnlineForm/index'
import HtUserSelectorInput from '../packages/UserSelectorInput/index'
import HtOrgSelectorInput from '../packages/OrgSelectorInput/index'
import HtRoleSelectorInput from '../packages/RoleSelectorInput/index'
import HtPostSelectorInput from '../packages/PostSelectorInput/index'
import HtJobSelectorInput from '../packages/JobSelectorInput/index'
import HtDimensionSelectorInput from '../packages/DimensionSelectorInput/index'
import HtSwitch from '../packages/Switch/index'
import HtTag from '../packages/Tag/index'
import HtSelectTree from '../packages/SelectTree/index'
import HtButton from '../packages/Button/index'
import HtImage from '../packages/Image/index'
import HtHyperlink from '../packages/Hyperlink/index'
import HtChart from '../packages/Chart/index'
import HtMap from '../packages/Map/index'
import HtQrcode from '../packages/Qrcode/index'
import HtDataView from '../packages/DataView/index'
import HtRelevantFlow from '../packages/RelevantFlow/index'
import HtMilepost from '../packages/Milepost/index'
import HtText from '../packages/Text/index'
import HtRate from '../packages/Rate/index'
import HtSlider from '../packages/Slider/index'
import HtTemplateForm from '../packages/TemplateForm/index'
import HtTemplateBatchUpdateDialog from '../packages/TemplateBatchUpdate/index'
import HtTemplateFormDialog from '../packages/TemplateFormDialog/index'
import HtTemplateIframeDialog from '../packages/TemplateIframeDialog/index'
import FlowChart from '../packages/FlowChart/index'
import ProcessRecord from '../packages/ProcessRecord/index'
import TemplateImportResult from '../packages/TemplateImportResult/index'
import TemplateTaskCirculate from '../packages/TemplateTaskCirculate/index'
import HtHistoricalApproval from '../packages/HistoricalApproval/index'
import HtIframe from '../packages/Iframe/index'
import HtPostDialog from '../packages/PostDialog/index'
import HtJobDialog from '../packages/JobDialog/index'
import HtRoleDialog from '../packages/RoleDialog/index'
import HtCustomComponent from '../packages/CustomComponent/index'
import HtUrlParameter from '../packages/UrlParameter/index'

import {
  GlobalValidate as HtGlobalValidate,
  GlobalQuery as HtGlobalQuery,
} from '../packages/Global/index'
import {
  SubDialog as HtSubDialog,
  SubtableBackfill as HtSubtableBackfill,
  SubPagination as HtSubPagination,
  SubExportDialog as HtSubExportDialog,
  SubImportDialog as HtSubImportDialog,
} from '../packages/Subtable/index'

import {
  TemplatePreview as HtTemplatePreview,
  TemplatePreviewFile as HtTemplatePreviewFile,
  TemplatePreviewImage as HtTemplatePreviewImage,
} from '../packages/TemplatePreview/index'

import HtQuerySqlPreview from '../packages/QuerySqlPreview/index'
import HtBatchSaveDialog from '../packages/BatchSaveDialog/index'

const HotentUi = {
  HtUrlParameter,
  HtCustomComponent,
  HtIframe,
  HtHistoricalApproval,
  version,
  HtInput,
  HtCheckbox,
  HtRadio,
  HtDate,
  HtTimeSelect,
  HtTimePicker,
  HtTable,
  HtTableColumn,
  HtTableSearchPanel,
  HtTableSearchField,
  HtSelect,
  HtFile,
  HtDemension,
  HtTree,
  HtAddQueryStrategy,
  HtSidebarDialog,
  Selector,
  HtRoleSelector,
  HtUserSelector,
  HtOrgSelector,
  HtJobSelector,
  HtPostSelector,
  HtDimensionSelector,
  HtFormItem,
  HtSaveButton,
  HtUserDialog,
  HtDialog,
  HtCustomDialog,
  HtTreeDialog,
  HtTreeListDialog,
  HtOrgPostDialog,
  HtDuration,
  HtFieldTail,
  HtFileUpload,
  HtIcon,
  HtEditor,
  HtAvatarImage,
  HtH1,
  HtH2,
  HtH3,
  HtH4,
  HtH5,
  HtH6,
  HtCollapse,
  HtCollapseItem,
  HtStep,
  HtSteps,
  HtStepLayout,
  HtDivider,
  HtTabs,
  HtAutocomplete,
  HtCascader,
  HtDatePicker,
  HtDictionary,
  HtReadonlyInput,
  HtOnlineForm,
  HtUserSelectorInput,
  HtOrgSelectorInput,
  HtRoleSelectorInput,
  HtPostSelectorInput,
  HtJobSelectorInput,
  HtDimensionSelectorInput,
  HtSwitch,
  HtTag,
  HtSelectTree,
  HtButton,
  HtImage,
  HtChart,
  HtMap,
  HtQrcode,
  HtDataView,
  HtTemplatePreview,
  HtTemplatePreviewFile,
  HtTemplatePreviewImage,
  HtRelevantFlow,
  HtMilepost,
  HtText,
  HtRate,
  HtSlider,
  HtTemplateForm,
  HtTemplateBatchUpdateDialog,
  HtGlobalValidate,
  HtGlobalQuery,
  HtSubDialog,
  HtSubtableBackfill,
  HtSubPagination,
  HtSubExportDialog,
  HtSubImportDialog,
  HtQuerySqlPreview,
  HtTemplateFormDialog,
  HtTemplateIframeDialog,
  HtPicture,
  FlowChart,
  ProcessRecord,
  HtExplain,
  TemplateImportResult,
  TemplateTaskCirculate,
  HtPostDialog,
  HtJobDialog,
  HtRoleDialog,
  HtHyperlink,
  HtBatchSaveDialog,
}

HotentUi.install = (Vue, opts = {}) => {
  if (!opts.smallScreenDialog) {
    opts.smallScreenDialog = false
  }
  if (!opts.paginationBackground) {
    opts.paginationBackground = false
  }
  if (!opts.readonlyInput) {
    opts.readonlyInput = false
  }
  if (!opts.hideTip) {
    opts.hideTip = false
  }
  if (!opts.requestConfig) {
    opts.requestConfig = {}
  }
  if (!opts.allPaginationJustify) {
    opts.allPaginationJustify = ''
  }
  Vue.prototype.$smallScreenDialog = opts.smallScreenDialog
  Vue.prototype.$paginationBackground = opts.paginationBackground
  Vue.prototype.$readonlyInput = opts.readonlyInput
  Vue.prototype.$hideTip = opts.hideTip
  Vue.prototype.$requestConfig = opts.requestConfig
  Vue.prototype.$allPaginationJustify = opts.allPaginationJustify
  Vue.prototype.$HOTENT = {
    size: opts.size || 'small',
  }
  // 图片压缩配置
  Vue.prototype.$imageCompressConfig = opts.imageCompressConfig
  locale.use(opts.locale)
  locale.i18n(opts.i18n)
  Vue.use(validate)
  Vue.use(CommonScripts)

  Vue.use(loadingIndex)

  Object.keys(HotentUi).forEach((name) => {
    const component = HotentUi[name]
    component && component.name && Vue.component(component.name, component)
  })

  Vue.component('ht-vnode', {
    functional: true,
    render: (h, ctx) => {
      // 复制父组件的属性到子组件中
      let assembly = {
        ...ctx.props.vnode.componentOptions.propsData,
        ...ctx.props,
      }
      delete assembly['vnode']
      ctx.props.vnode.componentOptions.propsData = assembly
      ctx.props.vnode.componentOptions.listeners = ctx.listeners
      return ctx.props.vnode
    },
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  HotentUi.install(window.Vue)
}

export default HotentUi
