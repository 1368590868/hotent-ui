<template>
  <div v-if="permission !== 'n'" class="amap-page">
    <!-- 铺开时 -->
    <template v-if="showEffect === 'tile'">
      <ht-input
        v-model="inputVal"
        :permission="permission_sub"
        :name="inputName"
        :title="inputVal"
        :display-style="displayStyle"
        :clearable="false"
      >
        <i
          v-if="inputWriteable"
          slot="prefix"
          class="el-input__icon"
          :title="$t('ht.map.title')"
        >
          <ht-icon name="map" />
        </i>
        <i
          v-if="inputWriteable && inputVal"
          slot="suffix"
          :title="$t('ht.map.clearMsg')"
          class="el-input__icon"
          @click="clearPosition"
        >
          <ht-icon name="close" />
        </i>
      </ht-input>
      <div class="amap-page_map_container" :style="mapStyle">
        <div v-if="plugin.length > 0">
          <el-amap-search-box
            class="search-box"
            :search-option="searchOption"
            :on-search-result="onSearchResult"
          ></el-amap-search-box>
          <el-amap
            vid="amap"
            :plugin="plugin"
            :center="mapCenter"
            class="amap-demo"
            :zoom="zoom"
            :resize-enable="resizeEnable"
            :events="events"
          >
            <el-amap-marker
              v-for="(marker, $index) in markers"
              :key="$index"
              :position="marker"
            ></el-amap-marker>
          </el-amap>
        </div>
      </div>
    </template>
    <template v-else>
      <ht-input
        v-model="inputVal"
        :permission="permission_sub"
        :name="inputName"
        :title="inputVal"
        :display-style="displayStyle"
        :clearable="false"
        placeholder="请选择"
        readonly="readonly"
        @click.native="openMapDia"
      >
        <i
          v-if="inputWriteable"
          slot="prefix"
          class="el-input__icon"
          :title="$t('ht.map.title')"
          @click="openMapDia"
        >
          <ht-icon name="map" />
        </i>
        <template slot="append">
          <ht-icon name="gaode" class="amap-page_map" @click="openMapDia" />
        </template>
        <i
          v-if="inputWriteable && inputVal"
          slot="suffix"
          :title="$t('ht.map.clearMsg')"
          class="el-input__icon"
          @click="clearPosition"
        >
          <ht-icon name="close" />
        </i>
      </ht-input>

      <!-- 地图弹框 -->
      <div v-show="mapDiaVisible" class="amap-page_dialog">
        <div class="amap-page_dialog_container">
          <div v-if="plugin.length > 0">
            <el-amap-search-box
              class="search-box"
              :search-option="searchOption"
              :on-search-result="onSearchResult"
            ></el-amap-search-box>
            <el-amap
              vid="amap"
              :plugin="plugin"
              :center="mapCenter"
              class="amap-demo"
              :zoom="zoom"
              :resize-enable="resizeEnable"
              :events="events"
            >
              <el-amap-marker
                v-for="(marker, $index) in markers"
                :key="$index"
                :position="marker"
              ></el-amap-marker>
            </el-amap>
          </div>
        </div>
        <div class="amap-page_dialog_text">
          <div>{{ preAddress }}</div>
          <div v-if="prePosition.length">
            {{ $t('ht.map.longitude') }}：{{ prePosition[0] }}，{{
              $t('ht.map.latitude')
            }}：{{ prePosition[1] }}
          </div>
        </div>
        <div class="amap-page_dialog_footer">
          <el-button type="primary" @click="confirmAddress">
            {{ $t('ht.common.confirm') }}
          </el-button>
          <el-button @click="mapDiaVisible = false">
            {{ $t('ht.common.cancle') }}
          </el-button>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
  import permission from '@/mixins/permission.js'
  import inputName from '@/mixins/inputName.js'
  import form from '@/mixins/form.js'
  import utils from '@/utils.js'

  export default {
    name: 'HtMap',
    mixins: [permission, inputName, form],
    props: {
      value: String,
      appendPosition: {
        type: Boolean,
        default: false,
      },
      locationPath: String,
      showEffect: String, // dialog 弹出 tile 铺开
      widthMap: String,
      heightMap: String,
    },
    data() {
      const self = this
      return {
        mapCenter: [121.59996, 31.197646],
        markers: [],
        address: '',
        zoom: 12,
        resizeEnable: true,
        lng: 0,
        lat: 0,
        loaded: false,
        searchOption: {
          //poi搜索条件  默认全国
          city: this.$t('ht.map.nationwide'),
          citylimit: false, //是否限制城市内搜索
        },
        plugin: [],
        mapDiaVisible: false,
        preAddress: '',
        prePosition: [],
        events: {
          click: self.mapClick,
        },
        geocoder: null,
        position: [],
        addressText: '',
      }
    },
    computed: {
      inputVal() {
        return this.value
      },
      formatAddress() {
        let str = this.addressText
        if (str && this.appendPosition) {
          str += this.$t('ht.map.coordinate') + JSON.stringify(this.position)
        }
        return str
      },
      mapStyle() {
        return {
          width: this.widthMap,
          height: this.heightMap,
        }
      },
    },
    watch: {
      formatAddress: function (newVal) {
        if (newVal === this.value) {
          return
        }
        this.$emit('input', newVal)
        if (!this.appendPosition && this.locationPath) {
          this.updateFormVal(this.position)
        }
      },
    },
    mounted() {
      if (this.showEffect === 'tile') {
        this.initMap()
      }
    },
    methods: {
      onSearchResult(pois) {
        if (pois.length > 0) {
          //获取选择的地址经纬度
          this.updateMarker(pois[0])
          this.updateCurVal(pois[0].address + pois[0].name, [
            pois[0].lng,
            pois[0].lat,
          ])
        }
      },
      initMap() {
        const self = this
        setTimeout(() => {
          self.plugin = [
            'AMap.Autocomplete',
            {
              enableHighAccuracy: true, //是否使用高精度定位，默认:true
              timeout: 10000, //超过10秒后停止定位，默认：5s
              buttonPosition: 'RB', //定位按钮的停靠位置
              // eslint-disable-next-line
              buttonOffset: new AMap.Pixel(5, 10), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
              zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
              markerOptions: {
                //自定义定位点样式，同Marker的Options
                // eslint-disable-next-line
                offset: new AMap.Pixel(-18, -36),
                content:
                  '<img src="https://a.amap.com/jsapi_demos/static/resource/img/user.png" style="width:36px;height:36px"/>',
              },
              showCircle: true, //是否显示定位精度圈
              circleOptions: {
                //定位精度圈的样式
                strokeColor: '#0093FF',
                noSelect: true,
                strokeOpacity: 0.5,
                strokeWeight: 1,
                fillColor: '#02B0FF',
                fillOpacity: 0.25,
              },
              extensions: 'all',
              pName: 'Geolocation',
              events: {
                init(o) {
                  if (!self.value) {
                    // o 是高德地图定位插件实例  获取当前位置
                    o.getCurrentPosition((status, result) => {
                      if (result && result.position) {
                        self.lng = result.position.lng
                        self.lat = result.position.lat
                        self.center = [self.lng, self.lat]
                        self.getAddressByCode(result.position)
                      }
                    })
                  }
                },
              },
            },
            {
              //poi搜索插件
              pName: 'PlaceSearch',
              events: {
                init() {},
              },
            },
          ]
          // eslint-disable-next-line
          self.geocoder = new AMap.Geocoder()
        }, 500)
      },
      openMapDia() {
        if (!this.inputWriteable) {
          return
        }
        if (typeof AMap == 'undefined') {
          this.$message.error(this.$t('ht.map.notMapComponent'))
          return
        }
        this.mapDiaVisible = true
        this.initMap()
      },
      confirmAddress() {
        this.addressText = this.preAddress
        this.position = this.prePosition
        this.mapDiaVisible = false
      },
      mapClick(data) {
        this.updateMarker(data.lnglat)
        this.getAddressByCode(data.lnglat)
      },
      // 更新点
      updateMarker(position) {
        this.mapCenter = [position.lng, position.lat]
        if (
          this.markers.length > 0 &&
          this.markers[0][0] != this.mapCenter[0] &&
          this.markers[0][1] != this.mapCenter[1]
        ) {
          this.markers = [] //清空经纬度
          this.markers.push([position.lng, position.lat])
        } else if (this.markers.length == 0) {
          this.markers.push([position.lng, position.lat])
        }
      },
      getAddressByCode(data) {
        this.geocoder.getAddress([data.lng, data.lat], (status, result) => {
          if (status === 'complete' && result.regeocode) {
            this.updateCurVal(result.regeocode.formattedAddress, [
              data.lng,
              data.lat,
            ])
          }
        })
      },
      updateCurVal(name, position) {
        if (!this.inputWriteable) {
          return
        }
        this.preAddress = name
        this.prePosition = position
        if (this.showEffect === 'tile') {
          this.confirmAddress()
        }
      },
      clearPosition() {
        this.position = []
        this.addressText = ''
      },
      // 更新绑定的字段
      updateFormVal(value) {
        const pInst = utils.getOnlineFormInstance(this)
        utils.setValueByPath(
          pInst,
          this.locationPath,
          value && value.length ? JSON.stringify(value) : ''
        )
      },
    },
  }
</script>
<style lang="scss">
  .el-vue-search-box-container .search-tips {
    position: absolute;
    top: 100%;
    height: 280px;
    border: 0 !important;
    background: #fff;
    overflow: auto;
  }
  .amap-page {
    width: 100%;
    .amap-page_map {
      cursor: pointer;
    }
    .amap-page_content {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 10px;
      margin-bottom: 5px;
      .amap-page_text {
        line-height: 20px;
      }
    }
    .amap-page_btn {
      width: 100%;
    }
    .amap-page_dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      background: #fff;
      z-index: 2021;
      .amap-page_dialog_container {
        width: 100%;
        flex: 1;
        position: relative;
        > div {
          height: 100%;
          width: 100%;
        }
        .search-box {
          position: absolute !important;
          width: 90%;
          top: 10px;
          left: 5%;
        }
      }
      .amap-page_dialog_text {
        padding: 10px;
        font-size: 14px;
        color: #606266;
        margin-top: 5px;
        line-height: 20px;
      }
      .amap-page_dialog_footer {
        text-align: center;
        padding: 20px;
        border-top: 1px solid #ddd;
      }
    }
    .amap-page_map_container {
      position: relative;
      > div {
        width: 100%;
        height: 100%;
        .search-box {
          position: absolute;
          top: 10px;
          right: 10px;
        }
      }
      .amap-logo,
      .amap-copyright {
        z-index: 9;
      }
      .amap-geolocation-con {
        z-index: 9 !important;
      }
    }
  }
  .el-input__inner {
    cursor: pointer;
  }
</style>
