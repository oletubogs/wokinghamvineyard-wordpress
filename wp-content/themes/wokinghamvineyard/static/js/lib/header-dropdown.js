var breakpointManager = require('break')

module.exports = function (app) {


  /*
   *
   * VARIABLES
   *
   */
  var $dropdownToggles = $('[data-dropdown-target!=""][data-dropdown-target]')
    , toggleActiveClass = 'main-nav__item--dropdown-open'
    , dropdownOpen = false
    , $currentButton = ''
    , $currentDropdown = ''
    , currentDropdownTarget = ''
    , $currentOffsetItem = ''


  /*
   *
   * TOGGLE LOOP
   *
   */
  $dropdownToggles.each(function (i, el) {
    var $button = $(el)
      , dataTarget = $button.data('dropdownTarget')
      , $dropdown = $('[data-dropdown="' + dataTarget + '"]')
    // Toggle event
    $button.on('click', function (e) {
      e.preventDefault()
      if ($currentDropdown === $dropdown) {
        closeDropdown()
      } else {
        openDropdown($button, $dropdown, dataTarget)
      }
    })
  })


  /*
   *
   * BREAKPOINTS
   *
   */
  var bm = breakpointManager()
  bm.add('tablet', '(min-width: 700px)')
  bm.add('desktop', '(min-width: 1050px)')
  // Resize events
  bm.on('enter:tablet', updateCssProps)
  bm.on('exit:tablet', updateCssProps)
  bm.on('enter:desktop', updateCssProps)
  bm.on('exit:desktop', updateCssProps)


  /*
   *
   * OPEN DROPDOWN
   *
   */
  function openDropdown($button, $dropdown, target) {
    // Close open dropdown first
    if ($currentDropdown.length !== 0) closeDropdown()

    // Internal variables
    dropdownOpen = true
    $currentDropdown = $dropdown
    currentDropdownTarget = target
    $currentButton = $button

    // Set CSS properties
    updateCssProps()

    // Toggle active class
    $currentButton.addClass(toggleActiveClass)
    openNav()
  }


  /*
   *
   * CLOSE DROPDOWN
   *
   */
  function closeDropdown() {
    dropdownOpen = false
    // Remove CSS from open dropdown
    unsetDropdownCssProps()
    // Toggle classes
    $currentButton.removeClass(toggleActiveClass)
    // Internal variables
    $currentDropdown = ''
    if (!app.isMobile) closeNav()
  }


  /*
   *
   * UPDATE DROPDOWN CSS
   *
   */
  function updateCssProps() {
    // Stop breakpoints firing when dropdown is closed
    if (!dropdownOpen) return

    // Remove CSS
    if ($currentOffsetItem.length !== 0) unsetDropdownCssProps()

    // Set desktop offset item to be <header>
    $currentOffsetItem = (!app.isMobile) ? app.header.$el : $currentButton

    // Deactivate mobile search dropdown
    var isSearch = (currentDropdownTarget === 'search')
    if (isSearch && app.isMobile) return

    // Get position properties before CSS
    var offsetItemTop = $currentOffsetItem.offset().top
      , offsetItemHeight = $currentOffsetItem.outerHeight()

    // Set CSS margin-bottom for content
    $currentOffsetItem.css({ 'marginBottom' : $currentDropdown.outerHeight() })

    // Set CSS top for dropdown
    // Tablet/Desktop offset should sit at bottom of header
    $currentDropdown.css({ 'top' : (offsetItemTop + offsetItemHeight), 'bottom' : 'auto' })

  }


  /*
   *
   * REMOVE DROPDOWN CSS
   *
   */
  function unsetDropdownCssProps() {
    if (!app.isMobile) app.header.$el.css({ 'marginBottom': '0' })
    $currentOffsetItem.css({ 'marginBottom': '0' })
    $currentDropdown.css({ 'top' : 'auto', 'bottom' : '100%' })
  }


  /*
   *
   * MOBILE NAVIGATION
   *
   */
  var $navToggle = $('.js-mobile-nav-toggle')
    , $nav = $('.js-main-nav')
    , activeClass = 'main-nav__items--open'
    , navOpen

  $navToggle.on('click', function () {
    if (navOpen) closeNav()
    else openNav()
  })

  function openNav() {
    navOpen = true
    $nav.addClass(activeClass)
  }

  function closeNav() {
    navOpen = false
    $nav.removeClass(activeClass)
    if (app.isMobile) closeDropdown()
  }
}
