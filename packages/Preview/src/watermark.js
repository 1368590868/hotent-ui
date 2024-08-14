export default function watermark(teleport, options = {}) {
  //默认设置
  const defaultOptions = {
    text: () => 'watermark',
    watermark_x: 20, //水印起始位置x轴坐标
    watermark_y: 80, //水印起始位置Y轴坐标
    watermark_rows: 0, //水印行数
    watermark_cols: 0, //水印列数
    watermark_x_space: 50, //水印x轴间隔
    watermark_y_space: 50, //水印y轴间隔
    watermark_color: '#ccc', //水印字体颜色
    watermark_alpha: 0.4, //水印透明度
    watermark_fontsize: '14px', //水印字体大小
    watermark_font: '微软雅黑', //水印字体
    watermark_width: 166, //水印宽度
    watermark_height: 100, //水印长度
    watermark_angle: 20, //水印倾斜度数
  }
  const settings = Object.assign(defaultOptions, options)
  const container = document.querySelector(teleport)
  const containerWidth = container.clientWidth
  const offsetLeft = container.offsetLeft
  settings.watermark_x = offsetLeft
  if (arguments.length === 1 && typeof arguments[0] === 'object') {
    const src = arguments[0] || {}
    for (const key in src) {
      if (src[key] && settings[key] && src[key] === settings[key]) continue
      else if (src[key]) settings[key] = src[key]
    }
  }
  const oTemp = document.createDocumentFragment()
  //获取页面最大宽度
  let page_width = containerWidth
  //获取页面最大高度
  let page_height = Math.max(
    document.body.scrollHeight,
    document.body.clientHeight
  ) //+ 450;
  page_height = Math.max(page_height, window.innerHeight - 30)
  //如果将水印列数设置为0，或水印列数设置过大，超过页面最大宽度，则重新计算水印列数和水印x轴间隔
  if (
    settings.watermark_cols == 0 ||
    parseInt(
      settings.watermark_x +
        settings.watermark_width * settings.watermark_cols +
        settings.watermark_x_space * (settings.watermark_cols - 1)
    ) > page_width
  ) {
    settings.watermark_cols = parseInt(
      (page_width - settings.watermark_x + settings.watermark_x_space) /
        (settings.watermark_width + settings.watermark_x_space)
    )
    settings.watermark_x_space = parseInt(
      (page_width -
        settings.watermark_x -
        settings.watermark_width * settings.watermark_cols) /
        (settings.watermark_cols - 1)
    )
  }
  //如果将水印行数设置为0，或水印行数设置过大，超过页面最大长度，则重新计算水印行数和水印y轴间隔
  if (
    settings.watermark_rows == 0 ||
    parseInt(
      settings.watermark_y +
        settings.watermark_height * settings.watermark_rows +
        settings.watermark_y_space * (settings.watermark_rows - 1)
    ) > page_height
  ) {
    settings.watermark_rows = parseInt(
      (settings.watermark_y_space + page_height - settings.watermark_y) /
        (settings.watermark_height + settings.watermark_y_space)
    )
    settings.watermark_y_space = parseInt(
      (page_height -
        settings.watermark_y -
        settings.watermark_height * settings.watermark_rows) /
        (settings.watermark_rows - 1)
    )
  }
  let x
  let y
  for (var i = 0; i < settings.watermark_rows; i++) {
    y =
      settings.watermark_y +
      (settings.watermark_y_space + settings.watermark_height) * i
    for (var j = 0; j < settings.watermark_cols; j++) {
      x =
        settings.watermark_x +
        (settings.watermark_width + settings.watermark_x_space) * j
      const mask_div = document.createElement('div')
      mask_div.id = 'mask_div' + i + j
      mask_div.className = 'mask_div'
      mask_div.appendChild(document.createTextNode(settings.text()))
      //设置水印div倾斜显示
      mask_div.style.webkitTransform =
        'rotate(-' + settings.watermark_angle + 'deg)'
      mask_div.style.MozTransform =
        'rotate(-' + settings.watermark_angle + 'deg)'
      mask_div.style.msTransform =
        'rotate(-' + settings.watermark_angle + 'deg)'
      mask_div.style.OTransform = 'rotate(-' + settings.watermark_angle + 'deg)'
      mask_div.style.transform = 'rotate(-' + settings.watermark_angle + 'deg)'
      mask_div.style.visibility = ''
      mask_div.style.position = 'absolute'
      mask_div.style.left = x + 'px'
      mask_div.style.top = y + 'px'
      mask_div.style.overflow = 'hidden'
      mask_div.style.zIndex = '9999'
      //让水印不遮挡页面的点击事件
      mask_div.style.pointerEvents = 'none'
      mask_div.style.opacity = settings.watermark_alpha
      mask_div.style.fontSize = settings.watermark_fontsize
      mask_div.style.fontFamily = settings.watermark_font
      mask_div.style.fontWeight = 'bold'
      mask_div.style.color = settings.watermark_color
      mask_div.style.textAlign = 'center'
      mask_div.style.width = settings.watermark_width + 'px'
      mask_div.style.height = settings.watermark_height + 'px'
      mask_div.style.display = 'block'
      oTemp.appendChild(mask_div)
    }
  }
  container.appendChild(oTemp)
}
