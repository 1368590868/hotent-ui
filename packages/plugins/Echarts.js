import * as echarts from 'echarts/lib/echarts.js'
import ecStat from 'echarts-stat'
import 'echarts/lib/chart/bar'
import 'echarts/lib/chart/line'
import 'echarts/lib/chart/pie'
import 'echarts/lib/chart/scatter'
import 'echarts/lib/chart/radar'
import 'echarts/lib/chart/lines'
import 'echarts/lib/chart/graph'
import 'echarts/lib/chart/gauge'
import 'echarts/lib/chart/funnel'
import 'echarts/lib/chart/themeRiver'

import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/markPoint'
import 'echarts/lib/component/markLine'
import 'echarts/lib/component/markArea'
import 'echarts/lib/component/timeline'
import 'echarts/lib/component/toolbox'

const Echarts = {}

Echarts.install = function(Vue) {
  Vue.prototype.$echarts = echarts
  Vue.prototype.$ecStat = ecStat
}

export default Echarts
