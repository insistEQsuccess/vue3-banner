const appHeight = document.documentElement.clientHeight
function scrollFn () {
  const imgs = document.querySelectorAll('img[lazy-dom]')
  Array.from(imgs).forEach((it) => {
    const ret = it.getBoundingClientRect()
    // console.log(it.getAttribute('data-src'), ret.top, ret.top >= 0, ret.top <= appHeight + 10)
    if (ret.top >= 0 && ret.top <= appHeight + 10 ) {
      it.setAttribute('src', it.getAttribute('data-src'))
    }
  })
}
scrollFn()
function debance (fn, delay) {
  let pre = Date.now()
  let now = Date.now()
  let timer = null
  return function () {
    now = Date.now()
    clearTimeout(timer)
    if (now - pre >= delay) {
      pre = now
      fn()      
    } else {
      timer = setTimeout(() => {
        fn()
      }, 100)
    }
  }
}
window.onscroll = debance(scrollFn, 500)