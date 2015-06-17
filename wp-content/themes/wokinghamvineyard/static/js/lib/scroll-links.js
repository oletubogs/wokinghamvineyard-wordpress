module.exports = function () {
  $('.js-scroll-link').each(function () {
    $(this).click(function (e) {
      e.preventDefault()
      var href = $(this).attr('href')
        , $target = $(href).parents('section')
        , targetScrollTop = $target.offset().top

      $('html, body').animate({ 'scrollTop': targetScrollTop })

    })
  })
}
