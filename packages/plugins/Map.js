import VueAMap from 'vue-amap'

const Map = {}
const options = {
  // 高德的key
  key: '845904b5dea05ff8b0e09e97cc01066b',
  // 插件集合
  plugin: [
    'AMap.Autocomplete',
    'AMap.PlaceSearch',
    'AMap.OverView',
    'AMap.MapType',
    'AMap.PolyEditor',
    'AMap.CircleEditor',
    'AMap.Geolocation',
    'AMap.PlaceSearch',
    'AMap.Geocoder',
  ],
  // 默认高德 sdk 版本为 1.4.4
  v: '1.4.4',
}

Map.install = function(Vue, opts) {
  Object.assign(options, opts || {})
  Vue.use(VueAMap)
  VueAMap.initAMapApiLoader(options)
}

export default Map
