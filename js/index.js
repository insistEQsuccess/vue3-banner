const { createApp, reactive, ref, onMounted, watch } = Vue;

const app = Vue.createApp({
  setup () {
    // const baseUrl = 'https://api-tczx-client.aicoders.cn/client-scrm'
    const baseUrl = 'https://test-tczx-gateway-client.tctm.life/client-scrm'
    const baseUrlCode="https://mdmtest.kidcodenews.com"; //开发时使用本地接口，在上线时只需要修改此处接口为线上地址即可
    // const baseUrlCode="https://test-tczx-admin.tctm.life"; //开发时使用本地接口，在上线时只需要修改此处接口为线上地址即可
    var viewHeight = 0
    const activeBtn = ref(0)
    function lazyFn () {
      // const imgs = document.querySelectorAll('img[lazy-dom]')
      // const io = new IntersectionObserver((entries) => {
      //   entries.forEach(item => {
      //     let oImg = item.target
      //     if (item.intersectionRatio > 0 && item.intersectionRatio <= 1) {
      //       console.log(oImg.getAttribute('data-src'));
      //       oImg.setAttribute('src', oImg.getAttribute('data-src'))
      //       io.unobserve(oImg);
      //     } 
      //   })
      // })
      // Array.from(imgs).forEach((it) => {
      //   console.log(it.getAttribute('data-src'))
      //   io.observe(it)
      // })
      const lazyloadImg = document.querySelectorAll('img[lazy-dom]')
      lazyloadImg.forEach(item  => {
        let rect = item.getBoundingClientRect()//获取每一个img元素的宽高以及距离视口顶部的距离
        if(rect.top <= viewHeight && rect.top > -rect.height){
          item.src = item.dataset.src
          item.removeAttribute('data-src')
          item.removeAttribute('lazy-dom')  
        }  
      })
    }
    const swipObj = ref()
    const swipperBtn = reactive(['button1', 'button2', 'button3'])
    onMounted(() => {
      viewHeight = document.documentElement.clientHeight  //可视区域的高度
      lazyFn()
      document.addEventListener('scroll',lazyFn)
      swipObj.value = initSwiper({
        selector: '.swipper-box',
        len: 3,
        auto: true,
        callback: function () {
          activeBtn.value = arguments[0] - 1
        }
      })
    })
    function initSwiper (param) {
      const {
        selector,
        len,
        auto = false,
        delay = 3000,
        dots = null,
        leftBtn = null,
        rightBtn = null,
        callback = () => {}
      } = param
      if (!selector) throw new Error('请传入selector')
      if (!len) throw new Error('请传入len')
      let index = 1
      const container = document.querySelector(selector)
      const width = container.getBoundingClientRect().width
      const box =  container.children[0]
      function setTransition () {
        box.style.transition = '.2s ease-in-out'
      }
      function removeTransition () {
        box.style.transition = ''
      }
      function setTranslateX (s) {
        box.style.transform = `translateX(${-s}%)`
      }
      let startAuto = false
      let autoTimer = null
      function stopLoop () {
        startAuto = false
        clearInterval(autoTimer)
      }
      function startLoop () {
        if (startAuto) return
        if (!auto) return
        startAuto = true
        autoTimer = setInterval(() => {
          setTransition()
          index++
          setTranslateX(index * 10)
        }, delay)
      }
      startLoop()
      let isTransitionend = true
      if (leftBtn) {
        document.querySelector(leftBtn).addEventListener('click', () => {
          if (!isTransitionend) return
          stopLoop()
          isTransitionend = false
          index--
          setTransition()
          setTranslateX(index * 10)
        })
      }
      if (rightBtn) {
        document.querySelector(rightBtn).addEventListener('click', () => {
          if (!isTransitionend) return
          stopLoop()
          isTransitionend = false
          index++
          setTransition()
          setTranslateX(index * 10)
        })
      }
      let startX = 0
      let moveX = 0
      box.addEventListener('transitionend', (e) => {
        removeTransition()
        if (index <= 0) {
          index = len
        }
        if (index >= len + 1) {
          index = 1
        }
        setTranslateX(index * 10)
        if (dots) {
          document.querySelector(dots + ' .active').className = 'dot'
          document.querySelector(dots).children[index - 1].className = 'dot active'
        }
        isTransitionend = true
        callback(index)
        startLoop()
      })
      box.addEventListener('touchstart', (e) => {
        stopLoop()
        startX = e.touches[0].clientX
        removeTransition(e)
      })
      box.addEventListener('touchmove', (e) => {
        moveX = startX - e.touches[0].clientX
        const x = 10 * moveX / width
        setTranslateX(index * 10 + x)
      })
      box.addEventListener('touchend', (e) => {
        if (Math.abs(moveX) > width / 3) {
          if (moveX > 0) {
            index++
          } else if (moveX <= 0 ) {
            index--
          }
        }
        moveX = 0
        setTransition()
        setTranslateX(index * 10)
        startLoop()
      })
      return {
        setActiveIndex: function (num) {
          if (num > len || num < 1) return
          index = num
          stopLoop()
          setTransition()
          setTranslateX(num * 10)
        }
      }
    }
    function handleActive (index) {
      activeBtn.value = index
      swipObj.value.setActiveIndex(index + 1)
    }
    return {
      activeBtn,
      swipperBtn,
      handleActive
    }
  }
})
app.mount('#app')