module.exports = function () {

  var app =
    { $window: $(window)
    , $html: $('html')
    , $mainContent: $('.js-main-content')
    , $pageWrapper: $('.js-page-wrapper')
    , page: $('body')[0].className
    , header:
      { $el: $('.js-main-header')
      , outerHeight: $('.js-main-header').outerHeight()
      }
    }

  app.window =
    { scrollTop: app.$window.scrollTop()
    , height: app.$window.height()
    , width: app.$window.width()
    }

  app.isMobile = (app.window.width < 700)

  app.$window.on('scroll', function () {
    app.window.scrollTop = $(this).scrollTop()
  })

  app.$window.on('resize', function () {
    app.window.height = $(this).height()
    app.window.width = $(this).width()
    app.header.outerHeight = app.header.$el.outerHeight()
    app.isMobile = (app.window.width < 700)
  })

  return app
}
