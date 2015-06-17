var WebFontConfig =
  { google: { families: [ 'Lato:300,400,700,900:latin', 'Merriweather::latin' ] }
  , timeout: 2000
  };

(function() {
  var wf = document.createElement('script')
  wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
            '://ajax.googleapis.com/ajax/libs/webfont/1.5.6/webfont.js'
  wf.type = 'text/javascript'
  wf.async = 'true'
  var s = document.getElementsByTagName('script')[0]
  s.parentNode.insertBefore(wf, s)
})()

setTimeout(function () {
  if (!window.webfont) $('html').addClass('wf-inactive')
}, 3000)
