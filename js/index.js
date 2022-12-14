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
    const swipperBtn = reactive(['Scratch', 'Python', 'NOI'])
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
    const showToast = ref(false)
    const toastType = ref('success')
    const toastTxt = ref('')
    const handleToast = (txt, type = 'success', delay = 3000) => {
      toastType.value = type
      toastTxt.value = txt
      showToast.value = true
      setTimeout(() => {
        showToast.value = false
      }, delay)
    }
    const showResult = ref(false)
    const showFromModal = ref(false)
    const showPicker = ref(false)
    const pickerOptions = reactive([])
    const formInline = reactive({
      equip: '',
      identify: '',
      phone: '',
      code: '',
      agree: false
    })
    let selectKey = 'equip'
    function onConfirmPicker (val) {
      formInline[selectKey] = val
      showPicker.value = false
    }
    function onClickEquip () {
      selectKey = 'equip'
      showPicker.value = true
      pickerOptions.length = 0
      pickerOptions.push(...['台式机', '笔记本', '没有'])
    }
    function onClickIden () {
      selectKey = 'identify'
      showPicker.value = true
      pickerOptions.length = 0
      pickerOptions.push(...['家长', '学生'])
    }
    let codeNum = 60
    let codeTimer = null
    const codeTxt = ref('获取验证码')
    async function getPhoneCode () {
      if (!formInline.phone) return
      if (codeNum < 60) return
      codeTimer = setInterval(() => {
        if(codeNum <= 0) {
          codeNum = 60
          codeTxt.value = `获取验证码`
          clearInterval(codeTimer)
          return
        }
        codeNum--
        codeTxt.value = `倒计时${codeNum}秒`
      }, 1000)
      const fd = new FormData()
      fd.append('mobile', formInline.phone)
      axios.post(
        baseUrlCode + '/payquickunderline/openapi/getPhoneCode',
        fd,
        { headers: { 'content-type': 'pplication/x-www-form-urlencoded' } }
      ).then(({data: res}) => {
        handleToast(res.msg || res.data, res.status === 1 ? 'success' : 'error')
      })
    }
    function onPhoneInput () {
      if(!formInline.equip){
        formInline.phone = ''
        handleToast('请先选择设备类型', 'warning')
      }else if (!formInline.identify){
        formInline.phone = ''
        handleToast('请先选择您的身份', 'warning')
      }else if (formInline.equip === '没有') {
        formInline.phone = ''
        handleToast('没有设备不能领取哦', 'warning')
      }else if (!formInline.agree) {
        formInline.phone = ''
        handleToast('请先勾选授权协议', 'warning')
      }
    }
    const showLoading = ref(false)
    const showTimeout = ref(false)
    const showSuccess = ref(false)
    const showFail = ref(false)
    const showMessage = ref(false)
    const resultMsg = ref('')
    async function onFormSubmit () {
      if (!formInline.phone) {
        return handleToast('请填写手机号', 'warning')
      }
      if (!/\d/g.test(formInline.code)) {
        return handleToast('请填写验证码', 'warning')
      }
      showLoading.value = true;
      showResult.value = true;
      showFromModal.value = false;
      showTimeout.value = false;
      const param = {
        telphone: formInline.phone,
        regType: 'EXP2021',
        sourceUrl: window.location.href,
        rsTag: '1',
        studentName: `请选择您的设备类型：${formInline.equip},${formInline.identify}`
      }
      const data = await axios.post(
        baseUrl + '/c/business/v1/information',
        param,
        { headers: { 'content-type': 'application/json' } }
      )
      const res = data.data
      if (!res) return
      if (res.code == 10011) {
        showLoading.value = false;
        resultMsg.value = '服务异常，请稍后重试。'
        showMessage.value = true
      } else if (res.code == 0) {
        showLoading.value = false;
        resultMsg.value = res.data.status == 1 ? '报名成功' : res.data.status == 2 ? '报名成功' : '您的手机号已领取过此课程，无法重复领取';
        showMessage.value = true
      } else {
        showLoading.value = false;
        resultMsg.value = '网络异常，请稍后再试';
        showMessage.value = true
      }
    }
    let againTimes = 1
    let loadingTimer = null
    // 每5秒请求一次
    watch(
      () => showLoading.value,
      (to) => {
				if (to) {
					loadingTimer = setTimeout(() => {
						showLoading.value = false;
						if (againTimes >= 3) {
							againTimes = 1
							return showSuccess.value = true
						}
            againTimes++
						showTimeout.value = true;
					}, 5000)
				} else {
					clearTimeout(loadingTimer)
				}
			}
    )
    return {
      resultMsg,
      showMessage,
      showSuccess,
      showFail,
      showLoading,
      showTimeout,
      activeBtn,
      swipperBtn,
      handleActive,
      formInline,
      pickerOptions,
      showPicker,
      onConfirmPicker,
      onClickEquip,
      onClickIden,
      codeTxt,
      getPhoneCode,
      onFormSubmit,
      showFromModal,
      showResult,
      showToast,
      toastType,
      toastTxt,
      onPhoneInput,
    }
  }
})
app.mount('#app')