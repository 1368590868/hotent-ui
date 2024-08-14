export default function(el, binding) {
  binding.arg && (el.style.width = binding.arg + 'px')
  el.style.whiteSpace = 'nowrap'
  el.style.overflow = 'hidden'
  el.style.textOverflow = 'ellipsis'
}
