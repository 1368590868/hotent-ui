export default {
  inserted: function(el) {
    const currentElement =
      el.getElementsByClassName('el-table__body-wrapper')[0] || el
    const tagNames = ['span', 'input', 'textarea', 'aside']
    if (currentElement) {
      currentElement.onmousedown = function(event) {
        const currentTagNames = event.target.tagName.toLowerCase()
        if (tagNames.includes(currentTagNames)) return
        currentElement.style.cursor = 'grab'
        let gapX = event.clientX
        let startX = el.scrollLeft
        document.onmousemove = function(e) {
          let x = e.clientX - gapX
          currentElement.scrollLeft = startX - x
          return false
        }
        document.onmouseup = function() {
          document.onmousemove = null
          document.onmouseup = null
        }
      }
    }
  },
}
