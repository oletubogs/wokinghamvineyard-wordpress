(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
module.exports = createBreakpointManager
module.exports.BreakpointManager = BreakpointManager

/*
 * Main use case: instantiate and start
 */
function createBreakpointManager() {
  var bm = new BreakpointManager()
  bm.start()
  return bm
}

var Breakpoint = require('./breakpoint')
  , Emitter = require('events').EventEmitter
  , inherits = require('inherits')
  , match = require('./match-media')

function BreakpointManager() {
  // Call Emitter constructor
  Emitter.call(this)
  // Store a list of breakpoints to watch
  this.breakpoints = []
}

// Backwards compatible inheritance (includes ES3 envs)
inherits(BreakpointManager, Emitter)

/*
 * Add a breakpoint
 */
BreakpointManager.prototype.add = function (name, media) {
  // Only run on browsers that support media queries
  if (!match('only all')) return
  var breakpoint = new Breakpoint(name, media)
  this.breakpoints.push(breakpoint)
  process.nextTick(this.checkSingle.bind(this, breakpoint))
}

/*
 * Run a function if media queries are not supported
 */
BreakpointManager.prototype.fallback = function (fn) {
  // Only run on browsers that support media queries
  if (match('only all')) return
  fn()
}

/*
 * Start listening to window#resize and firing events
 */
BreakpointManager.prototype.start = function () {
  // Only add the listener if matchMedia is supported
  if (!match('only all')) return
  this._boundCheck = this.check.bind(this)
  window.addEventListener('resize', this._boundCheck)
  this.check()
}

/*
 * Stop listening to window#resize
 */
BreakpointManager.prototype.stop = function () {
  if (this._boundCheck) window.removeEventListener('resize', this._boundCheck)
}

/*
 * Check each breakpoint
 */
BreakpointManager.prototype.check = function () {
  this.breakpoints.forEach(this.checkSingle.bind(this))
}

/*
 * Check a single breakpoint
 */
BreakpointManager.prototype.checkSingle = function (breakpoint) {
  switch (breakpoint.check()) {
  case true:
    return this.emit('enter:' + breakpoint.name)
  case false:
    return this.emit('exit:' + breakpoint.name)
  case null:
    return
  }
}

/*
 * Override the event emitter's on() function to take a 3rd argument
 * - a flag as to whether the provided fn should be run if media queries
 * are not available.
 */
BreakpointManager.prototype.on = function (event, fn, isFallback) {
  Emitter.prototype.on.call(this, event, fn)
  if (isFallback) this.fallback(fn)
}

}).call(this,require("FWaASH"))
},{"./breakpoint":2,"./match-media":4,"FWaASH":7,"events":6,"inherits":5}],2:[function(require,module,exports){
module.exports = Breakpoint

var match = require('./match-media')

/*
 * Construct a Breakpoint, given a name
 * and a media query.
 */
function Breakpoint(name, media) {
  this.name = name
  this.media = media
  this.matches = null
}

/*
 * Check if the breakpoint has been entered, exited or neither
 * Return values: true=entered, false=exited, null=neither
 */
Breakpoint.prototype.check = function () {

  // This is the first check
  if (this.matches === null) {
    this.matches = match(this.media)
    return this.matches
  }

  // For all subsequent checks this.matches will be set to true
  // or false, and will only return a boolean if a change happens

  if (match(this.media) && !this.matches) {
    this.matches = true
    return this.matches
  }

  if (!match(this.media) && this.matches) {
    this.matches = false
    return this.matches
  }

  return null

}

},{"./match-media":4}],3:[function(require,module,exports){
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

window.matchMedia || (window.matchMedia = function() {
    "use strict";

    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = (window.styleMedia || window.media);

    // For those that don't support matchMedium
    if (!styleMedia) {
        var style       = document.createElement('style'),
            script      = document.getElementsByTagName('script')[0],
            info        = null;

        style.type  = 'text/css';
        style.id    = 'matchmediajs-test';

        script.parentNode.insertBefore(style, script);

        // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
        info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

        styleMedia = {
            matchMedium: function(media) {
                var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                if (style.styleSheet) {
                    style.styleSheet.cssText = text;
                } else {
                    style.textContent = text;
                }

                // Test if media query is true or false
                return info.width === '1px';
            }
        };
    }

    return function(media) {
        return {
            matches: styleMedia.matchMedium(media || 'all'),
            media: media || 'all'
        };
    };
}());

},{}],4:[function(require,module,exports){
module.exports = match

require('./match-media-polyfill')

var browserMatchMedia = window.matchMedia || window.msMatchMedia

/*
 * Simplification of the window.matchMedia function
 * to simply take a media query and return a boolean.
 */
function match(mq) {
  if (!browserMatchMedia) return false
  var result = browserMatchMedia(mq)
  return !!result && !!result.matches
}

},{"./match-media-polyfill":3}],5:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],7:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],8:[function(require,module,exports){
var app = require('./lib/app')()

require('./lib/header-dropdown')(app)
require('./lib/scroll-links')(app)
require('./lib/maps')(app)
require('./lib/vendor/lightbox')

},{"./lib/app":9,"./lib/header-dropdown":10,"./lib/maps":11,"./lib/scroll-links":12,"./lib/vendor/lightbox":13}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"break":1}],11:[function(require,module,exports){
/* global google */

module.exports = function (app) {
  var $mapEl = $('.js-church-map')

  if ($mapEl.length === 0) return

  var directionsDisplay
    , directionsService = new google.maps.DirectionsService()
    , churchMap
    , churchMarker
    , $mapInfoBox = $('.js-map-info-container')
    , wokinghamVineyard = new google.maps.LatLng(51.363265, -0.794084)

  function initMap() {
    var mapOptions =
        { zoom: 11
        , center: wokinghamVineyard
        }
    churchMap = new google.maps.Map($mapEl[0], mapOptions )

    // Add church marker
    setTimeout(function () {
      updateMapCenter()
      churchMarker = new google.maps.Marker(
        { position: wokinghamVineyard
        , map: churchMap
        , title: 'Wokingham Vineyard'
        , icon: '/static/images/content/map-marker.png'
        , animation: google.maps.Animation.DROP
        }
      )
    }, 200)

    // Ready directions API
    directionsDisplay = new google.maps.DirectionsRenderer()
    directionsDisplay.setMap(churchMap)

    google.maps.event.addDomListener(churchMap, 'load', updateMapCenter)
    google.maps.event.addDomListener(window, 'resize', updateMapCenter)
  }
  google.maps.event.addDomListener( window, 'load', initMap )


  function updateMapCenter () {
    var center = getMapCenter()
    churchMap.panTo(center)
  }


  function getMapCenter() {

    if (app.isMobile) {
      return wokinghamVineyard
    } else {
      var infoBoxWidth = $mapInfoBox.outerWidth()
        , centeringWidth = $mapInfoBox.parent().width()
        , centeringMid = centeringWidth / 2
        , offsetX = -(centeringMid - ((centeringWidth - infoBoxWidth) / 2))

      var pointX = offsetX / Math.pow(2, churchMap.getZoom())
        , currPoint = churchMap.getProjection().fromLatLngToPoint(wokinghamVineyard)
        , newPoint = new google.maps.Point(pointX, 0)

      return churchMap.getProjection().fromPointToLatLng(
        new google.maps.Point(currPoint.x - newPoint.x, currPoint.y + newPoint.y)
      )
    }
   }



  // Directions
  var $buttonShowDirections = $('.js-button-show-directions')
    , $buttonCloseDirections = $('.js-button-close-directions')
    , $formDirections = $('.js-map-directions')
    , $mapInfo = $('.js-map-info')
    , $address = $('.js-map-address')

  $buttonShowDirections.on('click', function () {
    $buttonShowDirections.fadeOut()
    $mapInfo.fadeOut(function () {
      $formDirections.fadeIn()
      $address.focus()
    })
  })

  $buttonCloseDirections.on('click', function () {
    directionsDisplay.setMap(null)
    updateMapCenter()
    $formDirections.fadeOut(function () {
      $mapInfo.fadeIn()
      $buttonShowDirections.fadeIn()
    })
  })

  $formDirections.on('submit', function (e) {
    e.preventDefault()

    var start = $address.val()
      , end = 'Wokingham Vineyard, UK'
      , request =
        { origin: start
        , destination: end
        , travelMode: google.maps.TravelMode.DRIVING
        }

    // Get directions from google
    directionsService.route(request, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setMap(churchMap)
        directionsDisplay.setDirections(response)
      }
    })
  })


}

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
/**
 * Lightbox v2.7.1
 * by Lokesh Dhakar - http://lokeshdhakar.com/projects/lightbox2/
 *
 * @license http://creativecommons.org/licenses/by/2.5/
 * - Free for use in both personal and commercial projects
 * - Attribution requires leaving author name, author link, and the license info intact
 */

(function() {
  // Use local alias
  var $ = jQuery;

  var LightboxOptions = (function() {
    function LightboxOptions() {
      this.fadeDuration                = 500;
      this.fitImagesInViewport         = true;
      this.resizeDuration              = 700;
      this.positionFromTop             = 50;
      this.showImageNumberLabel        = true;
      this.alwaysShowNavOnTouchDevices = false;
      this.wrapAround                  = false;
    }

    // Change to localize to non-english language
    LightboxOptions.prototype.albumLabel = function(curImageNum, albumSize) {
      return "Image " + curImageNum + " of " + albumSize;
    };

    return LightboxOptions;
  })();


  var Lightbox = (function() {
    function Lightbox(options) {
      this.options           = options;
      this.album             = [];
      this.currentImageIndex = void 0;
      this.init();
    }

    Lightbox.prototype.init = function() {
      this.enable();
      this.build();
    };

    // Loop through anchors and areamaps looking for either data-lightbox attributes or rel attributes
    // that contain 'lightbox'. When these are clicked, start lightbox.
    Lightbox.prototype.enable = function() {
      var self = this;
      $('body').on('click', 'a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]', function(event) {
        self.start($(event.currentTarget));
        return false;
      });
    };

    // Build html for the lightbox and the overlay.
    // Attach event handlers to the new DOM elements. click click click
    Lightbox.prototype.build = function() {
      var self = this;
      $("<div id='lightboxOverlay' class='lightboxOverlay'></div><div id='lightbox' class='lightbox'><div class='lb-outerContainer'><div class='lb-container'><img class='lb-image' src='' /><div class='lb-nav'><a class='lb-prev' href='' ></a><a class='lb-next' href='' ></a></div><div class='lb-loader'><a class='lb-cancel'></a></div></div></div><div class='lb-dataContainer'><div class='lb-data'><div class='lb-details'><span class='lb-caption'></span><span class='lb-number'></span></div><div class='lb-closeContainer'><a class='lb-close'></a></div></div></div></div>").appendTo($('body'));

      // Cache jQuery objects
      this.$lightbox       = $('#lightbox');
      this.$overlay        = $('#lightboxOverlay');
      this.$outerContainer = this.$lightbox.find('.lb-outerContainer');
      this.$container      = this.$lightbox.find('.lb-container');

      // Store css values for future lookup
      this.containerTopPadding = parseInt(this.$container.css('padding-top'), 10);
      this.containerRightPadding = parseInt(this.$container.css('padding-right'), 10);
      this.containerBottomPadding = parseInt(this.$container.css('padding-bottom'), 10);
      this.containerLeftPadding = parseInt(this.$container.css('padding-left'), 10);

      // Attach event handlers to the newly minted DOM elements
      this.$overlay.hide().on('click', function() {
        self.end();
        return false;
      });

      this.$lightbox.hide().on('click', function(event) {
        if ($(event.target).attr('id') === 'lightbox') {
          self.end();
        }
        return false;
      });

      this.$outerContainer.on('click', function(event) {
        if ($(event.target).attr('id') === 'lightbox') {
          self.end();
        }
        return false;
      });

      this.$lightbox.find('.lb-prev').on('click', function() {
        if (self.currentImageIndex === 0) {
          self.changeImage(self.album.length - 1);
        } else {
          self.changeImage(self.currentImageIndex - 1);
        }
        return false;
      });

      this.$lightbox.find('.lb-next').on('click', function() {
        if (self.currentImageIndex === self.album.length - 1) {
          self.changeImage(0);
        } else {
          self.changeImage(self.currentImageIndex + 1);
        }
        return false;
      });

      this.$lightbox.find('.lb-loader, .lb-close').on('click', function() {
        self.end();
        return false;
      });
    };

    // Show overlay and lightbox. If the image is part of a set, add siblings to album array.
    Lightbox.prototype.start = function($link) {
      var self    = this;
      var $window = $(window);

      $window.on('resize', $.proxy(this.sizeOverlay, this));

      $('select, object, embed').css({
        visibility: "hidden"
      });

      this.sizeOverlay();

      this.album = [];
      var imageNumber = 0;

      function addToAlbum($link) {
        self.album.push({
          link: $link.attr('href'),
          title: $link.attr('data-title') || $link.attr('title')
        });
      }

      // Support both data-lightbox attribute and rel attribute implementations
      var dataLightboxValue = $link.attr('data-lightbox');
      var $links;

      if (dataLightboxValue) {
        $links = $($link.prop("tagName") + '[data-lightbox="' + dataLightboxValue + '"]');
        for (var i = 0; i < $links.length; i = ++i) {
          addToAlbum($($links[i]));
          if ($links[i] === $link[0]) {
            imageNumber = i;
          }
        }
      } else {
        if ($link.attr('rel') === 'lightbox') {
          // If image is not part of a set
          addToAlbum($link);
        } else {
          // If image is part of a set
          $links = $($link.prop("tagName") + '[rel="' + $link.attr('rel') + '"]');
          for (var j = 0; j < $links.length; j = ++j) {
            addToAlbum($($links[j]));
            if ($links[j] === $link[0]) {
              imageNumber = j;
            }
          }
        }
      }

      // Position Lightbox
      var top  = $window.scrollTop() + this.options.positionFromTop;
      var left = $window.scrollLeft();
      this.$lightbox.css({
        top: top + 'px',
        left: left + 'px'
      }).fadeIn(this.options.fadeDuration);

      this.changeImage(imageNumber);
    };

    // Hide most UI elements in preparation for the animated resizing of the lightbox.
    Lightbox.prototype.changeImage = function(imageNumber) {
      var self = this;

      this.disableKeyboardNav();
      var $image = this.$lightbox.find('.lb-image');

      this.$overlay.fadeIn(this.options.fadeDuration);

      $('.lb-loader').fadeIn('slow');
      this.$lightbox.find('.lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption').hide();

      this.$outerContainer.addClass('animating');

      // When image to show is preloaded, we send the width and height to sizeContainer()
      var preloader = new Image();
      preloader.onload = function() {
        var $preloader, imageHeight, imageWidth, maxImageHeight, maxImageWidth, windowHeight, windowWidth;
        $image.attr('src', self.album[imageNumber].link);

        $preloader = $(preloader);

        $image.width(preloader.width);
        $image.height(preloader.height);

        if (self.options.fitImagesInViewport) {
          // Fit image inside the viewport.
          // Take into account the border around the image and an additional 10px gutter on each side.

          windowWidth    = $(window).width();
          windowHeight   = $(window).height();
          maxImageWidth  = windowWidth - self.containerLeftPadding - self.containerRightPadding - 20;
          maxImageHeight = windowHeight - self.containerTopPadding - self.containerBottomPadding - 120;

          // Is there a fitting issue?
          if ((preloader.width > maxImageWidth) || (preloader.height > maxImageHeight)) {
            if ((preloader.width / maxImageWidth) > (preloader.height / maxImageHeight)) {
              imageWidth  = maxImageWidth;
              imageHeight = parseInt(preloader.height / (preloader.width / imageWidth), 10);
              $image.width(imageWidth);
              $image.height(imageHeight);
            } else {
              imageHeight = maxImageHeight;
              imageWidth = parseInt(preloader.width / (preloader.height / imageHeight), 10);
              $image.width(imageWidth);
              $image.height(imageHeight);
            }
          }
        }
        self.sizeContainer($image.width(), $image.height());
      };

      preloader.src          = this.album[imageNumber].link;
      this.currentImageIndex = imageNumber;
    };

    // Stretch overlay to fit the viewport
    Lightbox.prototype.sizeOverlay = function() {
      this.$overlay
        .width($(window).width())
        .height($(document).height());
    };

    // Animate the size of the lightbox to fit the image we are showing
    Lightbox.prototype.sizeContainer = function(imageWidth, imageHeight) {
      var self = this;

      var oldWidth  = this.$outerContainer.outerWidth();
      var oldHeight = this.$outerContainer.outerHeight();
      var newWidth  = imageWidth + this.containerLeftPadding + this.containerRightPadding;
      var newHeight = imageHeight + this.containerTopPadding + this.containerBottomPadding;

      function postResize() {
        self.$lightbox.find('.lb-dataContainer').width(newWidth);
        self.$lightbox.find('.lb-prevLink').height(newHeight);
        self.$lightbox.find('.lb-nextLink').height(newHeight);
        self.showImage();
      }

      if (oldWidth !== newWidth || oldHeight !== newHeight) {
        this.$outerContainer.animate({
          width: newWidth,
          height: newHeight
        }, this.options.resizeDuration, 'swing', function() {
          postResize();
        });
      } else {
        postResize();
      }
    };

    // Display the image and it's details and begin preload neighboring images.
    Lightbox.prototype.showImage = function() {
      this.$lightbox.find('.lb-loader').hide();
      this.$lightbox.find('.lb-image').fadeIn('slow');

      this.updateNav();
      this.updateDetails();
      this.preloadNeighboringImages();
      this.enableKeyboardNav();
    };

    // Display previous and next navigation if appropriate.
    Lightbox.prototype.updateNav = function() {
      // Check to see if the browser supports touch events. If so, we take the conservative approach
      // and assume that mouse hover events are not supported and always show prev/next navigation
      // arrows in image sets.
      var alwaysShowNav = false;
      try {
        document.createEvent("TouchEvent");
        alwaysShowNav = (this.options.alwaysShowNavOnTouchDevices)? true: false;
      } catch (e) {}

      this.$lightbox.find('.lb-nav').show();

      if (this.album.length > 1) {
        if (this.options.wrapAround) {
          if (alwaysShowNav) {
            this.$lightbox.find('.lb-prev, .lb-next').css('opacity', '1');
          }
          this.$lightbox.find('.lb-prev, .lb-next').show();
        } else {
          if (this.currentImageIndex > 0) {
            this.$lightbox.find('.lb-prev').show();
            if (alwaysShowNav) {
              this.$lightbox.find('.lb-prev').css('opacity', '1');
            }
          }
          if (this.currentImageIndex < this.album.length - 1) {
            this.$lightbox.find('.lb-next').show();
            if (alwaysShowNav) {
              this.$lightbox.find('.lb-next').css('opacity', '1');
            }
          }
        }
      }
    };

    // Display caption, image number, and closing button.
    Lightbox.prototype.updateDetails = function() {
      var self = this;

      // Enable anchor clicks in the injected caption html.
      // Thanks Nate Wright for the fix. @https://github.com/NateWr
      if (typeof this.album[this.currentImageIndex].title !== 'undefined' && this.album[this.currentImageIndex].title !== "") {
        this.$lightbox.find('.lb-caption')
          .html(this.album[this.currentImageIndex].title)
          .fadeIn('fast')
          .find('a').on('click', function(event){
            location.href = $(this).attr('href');
          });
      }

      if (this.album.length > 1 && this.options.showImageNumberLabel) {
        this.$lightbox.find('.lb-number').text(this.options.albumLabel(this.currentImageIndex + 1, this.album.length)).fadeIn('fast');
      } else {
        this.$lightbox.find('.lb-number').hide();
      }

      this.$outerContainer.removeClass('animating');

      this.$lightbox.find('.lb-dataContainer').fadeIn(this.options.resizeDuration, function() {
        return self.sizeOverlay();
      });
    };

    // Preload previous and next images in set.
    Lightbox.prototype.preloadNeighboringImages = function() {
      if (this.album.length > this.currentImageIndex + 1) {
        var preloadNext = new Image();
        preloadNext.src = this.album[this.currentImageIndex + 1].link;
      }
      if (this.currentImageIndex > 0) {
        var preloadPrev = new Image();
        preloadPrev.src = this.album[this.currentImageIndex - 1].link;
      }
    };

    Lightbox.prototype.enableKeyboardNav = function() {
      $(document).on('keyup.keyboard', $.proxy(this.keyboardAction, this));
    };

    Lightbox.prototype.disableKeyboardNav = function() {
      $(document).off('.keyboard');
    };

    Lightbox.prototype.keyboardAction = function(event) {
      var KEYCODE_ESC        = 27;
      var KEYCODE_LEFTARROW  = 37;
      var KEYCODE_RIGHTARROW = 39;

      var keycode = event.keyCode;
      var key     = String.fromCharCode(keycode).toLowerCase();
      if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
        this.end();
      } else if (key === 'p' || keycode === KEYCODE_LEFTARROW) {
        if (this.currentImageIndex !== 0) {
          this.changeImage(this.currentImageIndex - 1);
        } else if (this.options.wrapAround && this.album.length > 1) {
          this.changeImage(this.album.length - 1);
        }
      } else if (key === 'n' || keycode === KEYCODE_RIGHTARROW) {
        if (this.currentImageIndex !== this.album.length - 1) {
          this.changeImage(this.currentImageIndex + 1);
        } else if (this.options.wrapAround && this.album.length > 1) {
          this.changeImage(0);
        }
      }
    };

    // Closing time. :-(
    Lightbox.prototype.end = function() {
      this.disableKeyboardNav();
      $(window).off("resize", this.sizeOverlay);
      this.$lightbox.fadeOut(this.options.fadeDuration);
      this.$overlay.fadeOut(this.options.fadeDuration);
      $('select, object, embed').css({
        visibility: "visible"
      });
    };

    return Lightbox;

  })();

  $(function() {
    var options  = new LightboxOptions();
    var lightbox = new Lightbox(options);
  });

}).call(this);

},{}]},{},[8])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9ub2RlX21vZHVsZXMvYnJlYWsvYnJlYWsuanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9ub2RlX21vZHVsZXMvYnJlYWsvYnJlYWtwb2ludC5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icmVhay9tYXRjaC1tZWRpYS1wb2x5ZmlsbC5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icmVhay9tYXRjaC1tZWRpYS5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icmVhay9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwiL1VzZXJzL25pY2twL0Ryb3Bib3gvQ2h1cmNoL0RpZ2l0YWwvV2Vic2l0ZS9hcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL3NvdXJjZS9zdGF0aWMvanMvaW5kZXguanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9zb3VyY2Uvc3RhdGljL2pzL2xpYi9hcHAuanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9zb3VyY2Uvc3RhdGljL2pzL2xpYi9oZWFkZXItZHJvcGRvd24uanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9zb3VyY2Uvc3RhdGljL2pzL2xpYi9tYXBzLmpzIiwiL1VzZXJzL25pY2twL0Ryb3Bib3gvQ2h1cmNoL0RpZ2l0YWwvV2Vic2l0ZS9hcHAvc291cmNlL3N0YXRpYy9qcy9saWIvc2Nyb2xsLWxpbmtzLmpzIiwiL1VzZXJzL25pY2twL0Ryb3Bib3gvQ2h1cmNoL0RpZ2l0YWwvV2Vic2l0ZS9hcHAvc291cmNlL3N0YXRpYy9qcy9saWIvdmVuZG9yL2xpZ2h0Ym94LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUJyZWFrcG9pbnRNYW5hZ2VyXG5tb2R1bGUuZXhwb3J0cy5CcmVha3BvaW50TWFuYWdlciA9IEJyZWFrcG9pbnRNYW5hZ2VyXG5cbi8qXG4gKiBNYWluIHVzZSBjYXNlOiBpbnN0YW50aWF0ZSBhbmQgc3RhcnRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQnJlYWtwb2ludE1hbmFnZXIoKSB7XG4gIHZhciBibSA9IG5ldyBCcmVha3BvaW50TWFuYWdlcigpXG4gIGJtLnN0YXJ0KClcbiAgcmV0dXJuIGJtXG59XG5cbnZhciBCcmVha3BvaW50ID0gcmVxdWlyZSgnLi9icmVha3BvaW50JylcbiAgLCBFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG4gICwgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG4gICwgbWF0Y2ggPSByZXF1aXJlKCcuL21hdGNoLW1lZGlhJylcblxuZnVuY3Rpb24gQnJlYWtwb2ludE1hbmFnZXIoKSB7XG4gIC8vIENhbGwgRW1pdHRlciBjb25zdHJ1Y3RvclxuICBFbWl0dGVyLmNhbGwodGhpcylcbiAgLy8gU3RvcmUgYSBsaXN0IG9mIGJyZWFrcG9pbnRzIHRvIHdhdGNoXG4gIHRoaXMuYnJlYWtwb2ludHMgPSBbXVxufVxuXG4vLyBCYWNrd2FyZHMgY29tcGF0aWJsZSBpbmhlcml0YW5jZSAoaW5jbHVkZXMgRVMzIGVudnMpXG5pbmhlcml0cyhCcmVha3BvaW50TWFuYWdlciwgRW1pdHRlcilcblxuLypcbiAqIEFkZCBhIGJyZWFrcG9pbnRcbiAqL1xuQnJlYWtwb2ludE1hbmFnZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChuYW1lLCBtZWRpYSkge1xuICAvLyBPbmx5IHJ1biBvbiBicm93c2VycyB0aGF0IHN1cHBvcnQgbWVkaWEgcXVlcmllc1xuICBpZiAoIW1hdGNoKCdvbmx5IGFsbCcpKSByZXR1cm5cbiAgdmFyIGJyZWFrcG9pbnQgPSBuZXcgQnJlYWtwb2ludChuYW1lLCBtZWRpYSlcbiAgdGhpcy5icmVha3BvaW50cy5wdXNoKGJyZWFrcG9pbnQpXG4gIHByb2Nlc3MubmV4dFRpY2sodGhpcy5jaGVja1NpbmdsZS5iaW5kKHRoaXMsIGJyZWFrcG9pbnQpKVxufVxuXG4vKlxuICogUnVuIGEgZnVuY3Rpb24gaWYgbWVkaWEgcXVlcmllcyBhcmUgbm90IHN1cHBvcnRlZFxuICovXG5CcmVha3BvaW50TWFuYWdlci5wcm90b3R5cGUuZmFsbGJhY2sgPSBmdW5jdGlvbiAoZm4pIHtcbiAgLy8gT25seSBydW4gb24gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1lZGlhIHF1ZXJpZXNcbiAgaWYgKG1hdGNoKCdvbmx5IGFsbCcpKSByZXR1cm5cbiAgZm4oKVxufVxuXG4vKlxuICogU3RhcnQgbGlzdGVuaW5nIHRvIHdpbmRvdyNyZXNpemUgYW5kIGZpcmluZyBldmVudHNcbiAqL1xuQnJlYWtwb2ludE1hbmFnZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAvLyBPbmx5IGFkZCB0aGUgbGlzdGVuZXIgaWYgbWF0Y2hNZWRpYSBpcyBzdXBwb3J0ZWRcbiAgaWYgKCFtYXRjaCgnb25seSBhbGwnKSkgcmV0dXJuXG4gIHRoaXMuX2JvdW5kQ2hlY2sgPSB0aGlzLmNoZWNrLmJpbmQodGhpcylcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2JvdW5kQ2hlY2spXG4gIHRoaXMuY2hlY2soKVxufVxuXG4vKlxuICogU3RvcCBsaXN0ZW5pbmcgdG8gd2luZG93I3Jlc2l6ZVxuICovXG5CcmVha3BvaW50TWFuYWdlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2JvdW5kQ2hlY2spIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9ib3VuZENoZWNrKVxufVxuXG4vKlxuICogQ2hlY2sgZWFjaCBicmVha3BvaW50XG4gKi9cbkJyZWFrcG9pbnRNYW5hZ2VyLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5icmVha3BvaW50cy5mb3JFYWNoKHRoaXMuY2hlY2tTaW5nbGUuYmluZCh0aGlzKSlcbn1cblxuLypcbiAqIENoZWNrIGEgc2luZ2xlIGJyZWFrcG9pbnRcbiAqL1xuQnJlYWtwb2ludE1hbmFnZXIucHJvdG90eXBlLmNoZWNrU2luZ2xlID0gZnVuY3Rpb24gKGJyZWFrcG9pbnQpIHtcbiAgc3dpdGNoIChicmVha3BvaW50LmNoZWNrKCkpIHtcbiAgY2FzZSB0cnVlOlxuICAgIHJldHVybiB0aGlzLmVtaXQoJ2VudGVyOicgKyBicmVha3BvaW50Lm5hbWUpXG4gIGNhc2UgZmFsc2U6XG4gICAgcmV0dXJuIHRoaXMuZW1pdCgnZXhpdDonICsgYnJlYWtwb2ludC5uYW1lKVxuICBjYXNlIG51bGw6XG4gICAgcmV0dXJuXG4gIH1cbn1cblxuLypcbiAqIE92ZXJyaWRlIHRoZSBldmVudCBlbWl0dGVyJ3Mgb24oKSBmdW5jdGlvbiB0byB0YWtlIGEgM3JkIGFyZ3VtZW50XG4gKiAtIGEgZmxhZyBhcyB0byB3aGV0aGVyIHRoZSBwcm92aWRlZCBmbiBzaG91bGQgYmUgcnVuIGlmIG1lZGlhIHF1ZXJpZXNcbiAqIGFyZSBub3QgYXZhaWxhYmxlLlxuICovXG5CcmVha3BvaW50TWFuYWdlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGZuLCBpc0ZhbGxiYWNrKSB7XG4gIEVtaXR0ZXIucHJvdG90eXBlLm9uLmNhbGwodGhpcywgZXZlbnQsIGZuKVxuICBpZiAoaXNGYWxsYmFjaykgdGhpcy5mYWxsYmFjayhmbilcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJGV2FBU0hcIikpIiwibW9kdWxlLmV4cG9ydHMgPSBCcmVha3BvaW50XG5cbnZhciBtYXRjaCA9IHJlcXVpcmUoJy4vbWF0Y2gtbWVkaWEnKVxuXG4vKlxuICogQ29uc3RydWN0IGEgQnJlYWtwb2ludCwgZ2l2ZW4gYSBuYW1lXG4gKiBhbmQgYSBtZWRpYSBxdWVyeS5cbiAqL1xuZnVuY3Rpb24gQnJlYWtwb2ludChuYW1lLCBtZWRpYSkge1xuICB0aGlzLm5hbWUgPSBuYW1lXG4gIHRoaXMubWVkaWEgPSBtZWRpYVxuICB0aGlzLm1hdGNoZXMgPSBudWxsXG59XG5cbi8qXG4gKiBDaGVjayBpZiB0aGUgYnJlYWtwb2ludCBoYXMgYmVlbiBlbnRlcmVkLCBleGl0ZWQgb3IgbmVpdGhlclxuICogUmV0dXJuIHZhbHVlczogdHJ1ZT1lbnRlcmVkLCBmYWxzZT1leGl0ZWQsIG51bGw9bmVpdGhlclxuICovXG5CcmVha3BvaW50LnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uICgpIHtcblxuICAvLyBUaGlzIGlzIHRoZSBmaXJzdCBjaGVja1xuICBpZiAodGhpcy5tYXRjaGVzID09PSBudWxsKSB7XG4gICAgdGhpcy5tYXRjaGVzID0gbWF0Y2godGhpcy5tZWRpYSlcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVzXG4gIH1cblxuICAvLyBGb3IgYWxsIHN1YnNlcXVlbnQgY2hlY2tzIHRoaXMubWF0Y2hlcyB3aWxsIGJlIHNldCB0byB0cnVlXG4gIC8vIG9yIGZhbHNlLCBhbmQgd2lsbCBvbmx5IHJldHVybiBhIGJvb2xlYW4gaWYgYSBjaGFuZ2UgaGFwcGVuc1xuXG4gIGlmIChtYXRjaCh0aGlzLm1lZGlhKSAmJiAhdGhpcy5tYXRjaGVzKSB7XG4gICAgdGhpcy5tYXRjaGVzID0gdHJ1ZVxuICAgIHJldHVybiB0aGlzLm1hdGNoZXNcbiAgfVxuXG4gIGlmICghbWF0Y2godGhpcy5tZWRpYSkgJiYgdGhpcy5tYXRjaGVzKSB7XG4gICAgdGhpcy5tYXRjaGVzID0gZmFsc2VcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVzXG4gIH1cblxuICByZXR1cm4gbnVsbFxuXG59XG4iLCIvKiEgbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLiBBdXRob3JzICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLCBQYXVsIElyaXNoLCBOaWNob2xhcyBaYWthcywgRGF2aWQgS25pZ2h0LiBEdWFsIE1JVC9CU0QgbGljZW5zZSAqL1xuXG53aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XG4gICAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAgIC8vIEZvciB0aG9zZSB0aGF0IGRvbid0IHN1cHBvcnQgbWF0Y2hNZWRpdW1cbiAgICBpZiAoIXN0eWxlTWVkaWEpIHtcbiAgICAgICAgdmFyIHN0eWxlICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICAgICAgICAgIHNjcmlwdCAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdLFxuICAgICAgICAgICAgaW5mbyAgICAgICAgPSBudWxsO1xuXG4gICAgICAgIHN0eWxlLnR5cGUgID0gJ3RleHQvY3NzJztcbiAgICAgICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgICAgIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuICAgICAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICBpbmZvID0gKCdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cpICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICAgICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgICAgICAgIG1hdGNoTWVkaXVtOiBmdW5jdGlvbihtZWRpYSkge1xuICAgICAgICAgICAgICAgIHZhciB0ZXh0ID0gJ0BtZWRpYSAnICsgbWVkaWEgKyAneyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH0nO1xuXG4gICAgICAgICAgICAgICAgLy8gJ3N0eWxlLnN0eWxlU2hlZXQnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3N0eWxlLnRleHRDb250ZW50JyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICAgICAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVGVzdCBpZiBtZWRpYSBxdWVyeSBpcyB0cnVlIG9yIGZhbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZm8ud2lkdGggPT09ICcxcHgnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbihtZWRpYSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWF0Y2hlczogc3R5bGVNZWRpYS5tYXRjaE1lZGl1bShtZWRpYSB8fCAnYWxsJyksXG4gICAgICAgICAgICBtZWRpYTogbWVkaWEgfHwgJ2FsbCdcbiAgICAgICAgfTtcbiAgICB9O1xufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gbWF0Y2hcblxucmVxdWlyZSgnLi9tYXRjaC1tZWRpYS1wb2x5ZmlsbCcpXG5cbnZhciBicm93c2VyTWF0Y2hNZWRpYSA9IHdpbmRvdy5tYXRjaE1lZGlhIHx8IHdpbmRvdy5tc01hdGNoTWVkaWFcblxuLypcbiAqIFNpbXBsaWZpY2F0aW9uIG9mIHRoZSB3aW5kb3cubWF0Y2hNZWRpYSBmdW5jdGlvblxuICogdG8gc2ltcGx5IHRha2UgYSBtZWRpYSBxdWVyeSBhbmQgcmV0dXJuIGEgYm9vbGVhbi5cbiAqL1xuZnVuY3Rpb24gbWF0Y2gobXEpIHtcbiAgaWYgKCFicm93c2VyTWF0Y2hNZWRpYSkgcmV0dXJuIGZhbHNlXG4gIHZhciByZXN1bHQgPSBicm93c2VyTWF0Y2hNZWRpYShtcSlcbiAgcmV0dXJuICEhcmVzdWx0ICYmICEhcmVzdWx0Lm1hdGNoZXNcbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJ2YXIgYXBwID0gcmVxdWlyZSgnLi9saWIvYXBwJykoKVxuXG5yZXF1aXJlKCcuL2xpYi9oZWFkZXItZHJvcGRvd24nKShhcHApXG5yZXF1aXJlKCcuL2xpYi9zY3JvbGwtbGlua3MnKShhcHApXG5yZXF1aXJlKCcuL2xpYi9tYXBzJykoYXBwKVxucmVxdWlyZSgnLi9saWIvdmVuZG9yL2xpZ2h0Ym94JylcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciBhcHAgPVxuICAgIHsgJHdpbmRvdzogJCh3aW5kb3cpXG4gICAgLCAkaHRtbDogJCgnaHRtbCcpXG4gICAgLCAkbWFpbkNvbnRlbnQ6ICQoJy5qcy1tYWluLWNvbnRlbnQnKVxuICAgICwgJHBhZ2VXcmFwcGVyOiAkKCcuanMtcGFnZS13cmFwcGVyJylcbiAgICAsIHBhZ2U6ICQoJ2JvZHknKVswXS5jbGFzc05hbWVcbiAgICAsIGhlYWRlcjpcbiAgICAgIHsgJGVsOiAkKCcuanMtbWFpbi1oZWFkZXInKVxuICAgICAgLCBvdXRlckhlaWdodDogJCgnLmpzLW1haW4taGVhZGVyJykub3V0ZXJIZWlnaHQoKVxuICAgICAgfVxuICAgIH1cblxuICBhcHAud2luZG93ID1cbiAgICB7IHNjcm9sbFRvcDogYXBwLiR3aW5kb3cuc2Nyb2xsVG9wKClcbiAgICAsIGhlaWdodDogYXBwLiR3aW5kb3cuaGVpZ2h0KClcbiAgICAsIHdpZHRoOiBhcHAuJHdpbmRvdy53aWR0aCgpXG4gICAgfVxuXG4gIGFwcC5pc01vYmlsZSA9IChhcHAud2luZG93LndpZHRoIDwgNzAwKVxuXG4gIGFwcC4kd2luZG93Lm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgYXBwLndpbmRvdy5zY3JvbGxUb3AgPSAkKHRoaXMpLnNjcm9sbFRvcCgpXG4gIH0pXG5cbiAgYXBwLiR3aW5kb3cub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBhcHAud2luZG93LmhlaWdodCA9ICQodGhpcykuaGVpZ2h0KClcbiAgICBhcHAud2luZG93LndpZHRoID0gJCh0aGlzKS53aWR0aCgpXG4gICAgYXBwLmhlYWRlci5vdXRlckhlaWdodCA9IGFwcC5oZWFkZXIuJGVsLm91dGVySGVpZ2h0KClcbiAgICBhcHAuaXNNb2JpbGUgPSAoYXBwLndpbmRvdy53aWR0aCA8IDcwMClcbiAgfSlcblxuICByZXR1cm4gYXBwXG59XG4iLCJ2YXIgYnJlYWtwb2ludE1hbmFnZXIgPSByZXF1aXJlKCdicmVhaycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFwcCkge1xuXG5cbiAgLypcbiAgICpcbiAgICogVkFSSUFCTEVTXG4gICAqXG4gICAqL1xuICB2YXIgJGRyb3Bkb3duVG9nZ2xlcyA9ICQoJ1tkYXRhLWRyb3Bkb3duLXRhcmdldCE9XCJcIl1bZGF0YS1kcm9wZG93bi10YXJnZXRdJylcbiAgICAsIHRvZ2dsZUFjdGl2ZUNsYXNzID0gJ21haW4tbmF2X19pdGVtLS1kcm9wZG93bi1vcGVuJ1xuICAgICwgZHJvcGRvd25PcGVuID0gZmFsc2VcbiAgICAsICRjdXJyZW50QnV0dG9uID0gJydcbiAgICAsICRjdXJyZW50RHJvcGRvd24gPSAnJ1xuICAgICwgY3VycmVudERyb3Bkb3duVGFyZ2V0ID0gJydcbiAgICAsICRjdXJyZW50T2Zmc2V0SXRlbSA9ICcnXG5cblxuICAvKlxuICAgKlxuICAgKiBUT0dHTEUgTE9PUFxuICAgKlxuICAgKi9cbiAgJGRyb3Bkb3duVG9nZ2xlcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgIHZhciAkYnV0dG9uID0gJChlbClcbiAgICAgICwgZGF0YVRhcmdldCA9ICRidXR0b24uZGF0YSgnZHJvcGRvd25UYXJnZXQnKVxuICAgICAgLCAkZHJvcGRvd24gPSAkKCdbZGF0YS1kcm9wZG93bj1cIicgKyBkYXRhVGFyZ2V0ICsgJ1wiXScpXG4gICAgLy8gVG9nZ2xlIGV2ZW50XG4gICAgJGJ1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBpZiAoJGN1cnJlbnREcm9wZG93biA9PT0gJGRyb3Bkb3duKSB7XG4gICAgICAgIGNsb3NlRHJvcGRvd24oKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3BlbkRyb3Bkb3duKCRidXR0b24sICRkcm9wZG93biwgZGF0YVRhcmdldClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuXG5cbiAgLypcbiAgICpcbiAgICogQlJFQUtQT0lOVFNcbiAgICpcbiAgICovXG4gIHZhciBibSA9IGJyZWFrcG9pbnRNYW5hZ2VyKClcbiAgYm0uYWRkKCd0YWJsZXQnLCAnKG1pbi13aWR0aDogNzAwcHgpJylcbiAgYm0uYWRkKCdkZXNrdG9wJywgJyhtaW4td2lkdGg6IDEwNTBweCknKVxuICAvLyBSZXNpemUgZXZlbnRzXG4gIGJtLm9uKCdlbnRlcjp0YWJsZXQnLCB1cGRhdGVDc3NQcm9wcylcbiAgYm0ub24oJ2V4aXQ6dGFibGV0JywgdXBkYXRlQ3NzUHJvcHMpXG4gIGJtLm9uKCdlbnRlcjpkZXNrdG9wJywgdXBkYXRlQ3NzUHJvcHMpXG4gIGJtLm9uKCdleGl0OmRlc2t0b3AnLCB1cGRhdGVDc3NQcm9wcylcblxuXG4gIC8qXG4gICAqXG4gICAqIE9QRU4gRFJPUERPV05cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIG9wZW5Ecm9wZG93bigkYnV0dG9uLCAkZHJvcGRvd24sIHRhcmdldCkge1xuICAgIC8vIENsb3NlIG9wZW4gZHJvcGRvd24gZmlyc3RcbiAgICBpZiAoJGN1cnJlbnREcm9wZG93bi5sZW5ndGggIT09IDApIGNsb3NlRHJvcGRvd24oKVxuXG4gICAgLy8gSW50ZXJuYWwgdmFyaWFibGVzXG4gICAgZHJvcGRvd25PcGVuID0gdHJ1ZVxuICAgICRjdXJyZW50RHJvcGRvd24gPSAkZHJvcGRvd25cbiAgICBjdXJyZW50RHJvcGRvd25UYXJnZXQgPSB0YXJnZXRcbiAgICAkY3VycmVudEJ1dHRvbiA9ICRidXR0b25cblxuICAgIC8vIFNldCBDU1MgcHJvcGVydGllc1xuICAgIHVwZGF0ZUNzc1Byb3BzKClcblxuICAgIC8vIFRvZ2dsZSBhY3RpdmUgY2xhc3NcbiAgICAkY3VycmVudEJ1dHRvbi5hZGRDbGFzcyh0b2dnbGVBY3RpdmVDbGFzcylcbiAgICBvcGVuTmF2KClcbiAgfVxuXG5cbiAgLypcbiAgICpcbiAgICogQ0xPU0UgRFJPUERPV05cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGNsb3NlRHJvcGRvd24oKSB7XG4gICAgZHJvcGRvd25PcGVuID0gZmFsc2VcbiAgICAvLyBSZW1vdmUgQ1NTIGZyb20gb3BlbiBkcm9wZG93blxuICAgIHVuc2V0RHJvcGRvd25Dc3NQcm9wcygpXG4gICAgLy8gVG9nZ2xlIGNsYXNzZXNcbiAgICAkY3VycmVudEJ1dHRvbi5yZW1vdmVDbGFzcyh0b2dnbGVBY3RpdmVDbGFzcylcbiAgICAvLyBJbnRlcm5hbCB2YXJpYWJsZXNcbiAgICAkY3VycmVudERyb3Bkb3duID0gJydcbiAgICBpZiAoIWFwcC5pc01vYmlsZSkgY2xvc2VOYXYoKVxuICB9XG5cblxuICAvKlxuICAgKlxuICAgKiBVUERBVEUgRFJPUERPV04gQ1NTXG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiB1cGRhdGVDc3NQcm9wcygpIHtcbiAgICAvLyBTdG9wIGJyZWFrcG9pbnRzIGZpcmluZyB3aGVuIGRyb3Bkb3duIGlzIGNsb3NlZFxuICAgIGlmICghZHJvcGRvd25PcGVuKSByZXR1cm5cblxuICAgIC8vIFJlbW92ZSBDU1NcbiAgICBpZiAoJGN1cnJlbnRPZmZzZXRJdGVtLmxlbmd0aCAhPT0gMCkgdW5zZXREcm9wZG93bkNzc1Byb3BzKClcblxuICAgIC8vIFNldCBkZXNrdG9wIG9mZnNldCBpdGVtIHRvIGJlIDxoZWFkZXI+XG4gICAgJGN1cnJlbnRPZmZzZXRJdGVtID0gKCFhcHAuaXNNb2JpbGUpID8gYXBwLmhlYWRlci4kZWwgOiAkY3VycmVudEJ1dHRvblxuXG4gICAgLy8gRGVhY3RpdmF0ZSBtb2JpbGUgc2VhcmNoIGRyb3Bkb3duXG4gICAgdmFyIGlzU2VhcmNoID0gKGN1cnJlbnREcm9wZG93blRhcmdldCA9PT0gJ3NlYXJjaCcpXG4gICAgaWYgKGlzU2VhcmNoICYmIGFwcC5pc01vYmlsZSkgcmV0dXJuXG5cbiAgICAvLyBHZXQgcG9zaXRpb24gcHJvcGVydGllcyBiZWZvcmUgQ1NTXG4gICAgdmFyIG9mZnNldEl0ZW1Ub3AgPSAkY3VycmVudE9mZnNldEl0ZW0ub2Zmc2V0KCkudG9wXG4gICAgICAsIG9mZnNldEl0ZW1IZWlnaHQgPSAkY3VycmVudE9mZnNldEl0ZW0ub3V0ZXJIZWlnaHQoKVxuXG4gICAgLy8gU2V0IENTUyBtYXJnaW4tYm90dG9tIGZvciBjb250ZW50XG4gICAgJGN1cnJlbnRPZmZzZXRJdGVtLmNzcyh7ICdtYXJnaW5Cb3R0b20nIDogJGN1cnJlbnREcm9wZG93bi5vdXRlckhlaWdodCgpIH0pXG5cbiAgICAvLyBTZXQgQ1NTIHRvcCBmb3IgZHJvcGRvd25cbiAgICAvLyBUYWJsZXQvRGVza3RvcCBvZmZzZXQgc2hvdWxkIHNpdCBhdCBib3R0b20gb2YgaGVhZGVyXG4gICAgJGN1cnJlbnREcm9wZG93bi5jc3MoeyAndG9wJyA6IChvZmZzZXRJdGVtVG9wICsgb2Zmc2V0SXRlbUhlaWdodCksICdib3R0b20nIDogJ2F1dG8nIH0pXG5cbiAgfVxuXG5cbiAgLypcbiAgICpcbiAgICogUkVNT1ZFIERST1BET1dOIENTU1xuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gdW5zZXREcm9wZG93bkNzc1Byb3BzKCkge1xuICAgIGlmICghYXBwLmlzTW9iaWxlKSBhcHAuaGVhZGVyLiRlbC5jc3MoeyAnbWFyZ2luQm90dG9tJzogJzAnIH0pXG4gICAgJGN1cnJlbnRPZmZzZXRJdGVtLmNzcyh7ICdtYXJnaW5Cb3R0b20nOiAnMCcgfSlcbiAgICAkY3VycmVudERyb3Bkb3duLmNzcyh7ICd0b3AnIDogJ2F1dG8nLCAnYm90dG9tJyA6ICcxMDAlJyB9KVxuICB9XG5cblxuICAvKlxuICAgKlxuICAgKiBNT0JJTEUgTkFWSUdBVElPTlxuICAgKlxuICAgKi9cbiAgdmFyICRuYXZUb2dnbGUgPSAkKCcuanMtbW9iaWxlLW5hdi10b2dnbGUnKVxuICAgICwgJG5hdiA9ICQoJy5qcy1tYWluLW5hdicpXG4gICAgLCBhY3RpdmVDbGFzcyA9ICdtYWluLW5hdl9faXRlbXMtLW9wZW4nXG4gICAgLCBuYXZPcGVuXG5cbiAgJG5hdlRvZ2dsZS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG5hdk9wZW4pIGNsb3NlTmF2KClcbiAgICBlbHNlIG9wZW5OYXYoKVxuICB9KVxuXG4gIGZ1bmN0aW9uIG9wZW5OYXYoKSB7XG4gICAgbmF2T3BlbiA9IHRydWVcbiAgICAkbmF2LmFkZENsYXNzKGFjdGl2ZUNsYXNzKVxuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VOYXYoKSB7XG4gICAgbmF2T3BlbiA9IGZhbHNlXG4gICAgJG5hdi5yZW1vdmVDbGFzcyhhY3RpdmVDbGFzcylcbiAgICBpZiAoYXBwLmlzTW9iaWxlKSBjbG9zZURyb3Bkb3duKClcbiAgfVxufVxuIiwiLyogZ2xvYmFsIGdvb2dsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcHApIHtcbiAgdmFyICRtYXBFbCA9ICQoJy5qcy1jaHVyY2gtbWFwJylcblxuICBpZiAoJG1hcEVsLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgdmFyIGRpcmVjdGlvbnNEaXNwbGF5XG4gICAgLCBkaXJlY3Rpb25zU2VydmljZSA9IG5ldyBnb29nbGUubWFwcy5EaXJlY3Rpb25zU2VydmljZSgpXG4gICAgLCBjaHVyY2hNYXBcbiAgICAsIGNodXJjaE1hcmtlclxuICAgICwgJG1hcEluZm9Cb3ggPSAkKCcuanMtbWFwLWluZm8tY29udGFpbmVyJylcbiAgICAsIHdva2luZ2hhbVZpbmV5YXJkID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyg1MS4zNjMyNjUsIC0wLjc5NDA4NClcblxuICBmdW5jdGlvbiBpbml0TWFwKCkge1xuICAgIHZhciBtYXBPcHRpb25zID1cbiAgICAgICAgeyB6b29tOiAxMVxuICAgICAgICAsIGNlbnRlcjogd29raW5naGFtVmluZXlhcmRcbiAgICAgICAgfVxuICAgIGNodXJjaE1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoJG1hcEVsWzBdLCBtYXBPcHRpb25zIClcblxuICAgIC8vIEFkZCBjaHVyY2ggbWFya2VyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICB1cGRhdGVNYXBDZW50ZXIoKVxuICAgICAgY2h1cmNoTWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcihcbiAgICAgICAgeyBwb3NpdGlvbjogd29raW5naGFtVmluZXlhcmRcbiAgICAgICAgLCBtYXA6IGNodXJjaE1hcFxuICAgICAgICAsIHRpdGxlOiAnV29raW5naGFtIFZpbmV5YXJkJ1xuICAgICAgICAsIGljb246ICcvc3RhdGljL2ltYWdlcy9jb250ZW50L21hcC1tYXJrZXIucG5nJ1xuICAgICAgICAsIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1BcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0sIDIwMClcblxuICAgIC8vIFJlYWR5IGRpcmVjdGlvbnMgQVBJXG4gICAgZGlyZWN0aW9uc0Rpc3BsYXkgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1JlbmRlcmVyKClcbiAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXRNYXAoY2h1cmNoTWFwKVxuXG4gICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIoY2h1cmNoTWFwLCAnbG9hZCcsIHVwZGF0ZU1hcENlbnRlcilcbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcih3aW5kb3csICdyZXNpemUnLCB1cGRhdGVNYXBDZW50ZXIpXG4gIH1cbiAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIoIHdpbmRvdywgJ2xvYWQnLCBpbml0TWFwIClcblxuXG4gIGZ1bmN0aW9uIHVwZGF0ZU1hcENlbnRlciAoKSB7XG4gICAgdmFyIGNlbnRlciA9IGdldE1hcENlbnRlcigpXG4gICAgY2h1cmNoTWFwLnBhblRvKGNlbnRlcilcbiAgfVxuXG5cbiAgZnVuY3Rpb24gZ2V0TWFwQ2VudGVyKCkge1xuXG4gICAgaWYgKGFwcC5pc01vYmlsZSkge1xuICAgICAgcmV0dXJuIHdva2luZ2hhbVZpbmV5YXJkXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBpbmZvQm94V2lkdGggPSAkbWFwSW5mb0JveC5vdXRlcldpZHRoKClcbiAgICAgICAgLCBjZW50ZXJpbmdXaWR0aCA9ICRtYXBJbmZvQm94LnBhcmVudCgpLndpZHRoKClcbiAgICAgICAgLCBjZW50ZXJpbmdNaWQgPSBjZW50ZXJpbmdXaWR0aCAvIDJcbiAgICAgICAgLCBvZmZzZXRYID0gLShjZW50ZXJpbmdNaWQgLSAoKGNlbnRlcmluZ1dpZHRoIC0gaW5mb0JveFdpZHRoKSAvIDIpKVxuXG4gICAgICB2YXIgcG9pbnRYID0gb2Zmc2V0WCAvIE1hdGgucG93KDIsIGNodXJjaE1hcC5nZXRab29tKCkpXG4gICAgICAgICwgY3VyclBvaW50ID0gY2h1cmNoTWFwLmdldFByb2plY3Rpb24oKS5mcm9tTGF0TG5nVG9Qb2ludCh3b2tpbmdoYW1WaW5leWFyZClcbiAgICAgICAgLCBuZXdQb2ludCA9IG5ldyBnb29nbGUubWFwcy5Qb2ludChwb2ludFgsIDApXG5cbiAgICAgIHJldHVybiBjaHVyY2hNYXAuZ2V0UHJvamVjdGlvbigpLmZyb21Qb2ludFRvTGF0TG5nKFxuICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoY3VyclBvaW50LnggLSBuZXdQb2ludC54LCBjdXJyUG9pbnQueSArIG5ld1BvaW50LnkpXG4gICAgICApXG4gICAgfVxuICAgfVxuXG5cblxuICAvLyBEaXJlY3Rpb25zXG4gIHZhciAkYnV0dG9uU2hvd0RpcmVjdGlvbnMgPSAkKCcuanMtYnV0dG9uLXNob3ctZGlyZWN0aW9ucycpXG4gICAgLCAkYnV0dG9uQ2xvc2VEaXJlY3Rpb25zID0gJCgnLmpzLWJ1dHRvbi1jbG9zZS1kaXJlY3Rpb25zJylcbiAgICAsICRmb3JtRGlyZWN0aW9ucyA9ICQoJy5qcy1tYXAtZGlyZWN0aW9ucycpXG4gICAgLCAkbWFwSW5mbyA9ICQoJy5qcy1tYXAtaW5mbycpXG4gICAgLCAkYWRkcmVzcyA9ICQoJy5qcy1tYXAtYWRkcmVzcycpXG5cbiAgJGJ1dHRvblNob3dEaXJlY3Rpb25zLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAkYnV0dG9uU2hvd0RpcmVjdGlvbnMuZmFkZU91dCgpXG4gICAgJG1hcEluZm8uZmFkZU91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkZm9ybURpcmVjdGlvbnMuZmFkZUluKClcbiAgICAgICRhZGRyZXNzLmZvY3VzKClcbiAgICB9KVxuICB9KVxuXG4gICRidXR0b25DbG9zZURpcmVjdGlvbnMub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldE1hcChudWxsKVxuICAgIHVwZGF0ZU1hcENlbnRlcigpXG4gICAgJGZvcm1EaXJlY3Rpb25zLmZhZGVPdXQoZnVuY3Rpb24gKCkge1xuICAgICAgJG1hcEluZm8uZmFkZUluKClcbiAgICAgICRidXR0b25TaG93RGlyZWN0aW9ucy5mYWRlSW4oKVxuICAgIH0pXG4gIH0pXG5cbiAgJGZvcm1EaXJlY3Rpb25zLm9uKCdzdWJtaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgdmFyIHN0YXJ0ID0gJGFkZHJlc3MudmFsKClcbiAgICAgICwgZW5kID0gJ1dva2luZ2hhbSBWaW5leWFyZCwgVUsnXG4gICAgICAsIHJlcXVlc3QgPVxuICAgICAgICB7IG9yaWdpbjogc3RhcnRcbiAgICAgICAgLCBkZXN0aW5hdGlvbjogZW5kXG4gICAgICAgICwgdHJhdmVsTW9kZTogZ29vZ2xlLm1hcHMuVHJhdmVsTW9kZS5EUklWSU5HXG4gICAgICAgIH1cblxuICAgIC8vIEdldCBkaXJlY3Rpb25zIGZyb20gZ29vZ2xlXG4gICAgZGlyZWN0aW9uc1NlcnZpY2Uucm91dGUocmVxdWVzdCwgZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cykge1xuICAgICAgaWYgKHN0YXR1cyA9PT0gZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1N0YXR1cy5PSykge1xuICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXRNYXAoY2h1cmNoTWFwKVxuICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXREaXJlY3Rpb25zKHJlc3BvbnNlKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cblxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICQoJy5qcy1zY3JvbGwtbGluaycpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKVxuICAgICAgICAsICR0YXJnZXQgPSAkKGhyZWYpLnBhcmVudHMoJ3NlY3Rpb24nKVxuICAgICAgICAsIHRhcmdldFNjcm9sbFRvcCA9ICR0YXJnZXQub2Zmc2V0KCkudG9wXG5cbiAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgJ3Njcm9sbFRvcCc6IHRhcmdldFNjcm9sbFRvcCB9KVxuXG4gICAgfSlcbiAgfSlcbn1cbiIsIi8qKlxuICogTGlnaHRib3ggdjIuNy4xXG4gKiBieSBMb2tlc2ggRGhha2FyIC0gaHR0cDovL2xva2VzaGRoYWthci5jb20vcHJvamVjdHMvbGlnaHRib3gyL1xuICpcbiAqIEBsaWNlbnNlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzIuNS9cbiAqIC0gRnJlZSBmb3IgdXNlIGluIGJvdGggcGVyc29uYWwgYW5kIGNvbW1lcmNpYWwgcHJvamVjdHNcbiAqIC0gQXR0cmlidXRpb24gcmVxdWlyZXMgbGVhdmluZyBhdXRob3IgbmFtZSwgYXV0aG9yIGxpbmssIGFuZCB0aGUgbGljZW5zZSBpbmZvIGludGFjdFxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgLy8gVXNlIGxvY2FsIGFsaWFzXG4gIHZhciAkID0galF1ZXJ5O1xuXG4gIHZhciBMaWdodGJveE9wdGlvbnMgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gTGlnaHRib3hPcHRpb25zKCkge1xuICAgICAgdGhpcy5mYWRlRHVyYXRpb24gICAgICAgICAgICAgICAgPSA1MDA7XG4gICAgICB0aGlzLmZpdEltYWdlc0luVmlld3BvcnQgICAgICAgICA9IHRydWU7XG4gICAgICB0aGlzLnJlc2l6ZUR1cmF0aW9uICAgICAgICAgICAgICA9IDcwMDtcbiAgICAgIHRoaXMucG9zaXRpb25Gcm9tVG9wICAgICAgICAgICAgID0gNTA7XG4gICAgICB0aGlzLnNob3dJbWFnZU51bWJlckxhYmVsICAgICAgICA9IHRydWU7XG4gICAgICB0aGlzLmFsd2F5c1Nob3dOYXZPblRvdWNoRGV2aWNlcyA9IGZhbHNlO1xuICAgICAgdGhpcy53cmFwQXJvdW5kICAgICAgICAgICAgICAgICAgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgdG8gbG9jYWxpemUgdG8gbm9uLWVuZ2xpc2ggbGFuZ3VhZ2VcbiAgICBMaWdodGJveE9wdGlvbnMucHJvdG90eXBlLmFsYnVtTGFiZWwgPSBmdW5jdGlvbihjdXJJbWFnZU51bSwgYWxidW1TaXplKSB7XG4gICAgICByZXR1cm4gXCJJbWFnZSBcIiArIGN1ckltYWdlTnVtICsgXCIgb2YgXCIgKyBhbGJ1bVNpemU7XG4gICAgfTtcblxuICAgIHJldHVybiBMaWdodGJveE9wdGlvbnM7XG4gIH0pKCk7XG5cblxuICB2YXIgTGlnaHRib3ggPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gTGlnaHRib3gob3B0aW9ucykge1xuICAgICAgdGhpcy5vcHRpb25zICAgICAgICAgICA9IG9wdGlvbnM7XG4gICAgICB0aGlzLmFsYnVtICAgICAgICAgICAgID0gW107XG4gICAgICB0aGlzLmN1cnJlbnRJbWFnZUluZGV4ID0gdm9pZCAwO1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgTGlnaHRib3gucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZW5hYmxlKCk7XG4gICAgICB0aGlzLmJ1aWxkKCk7XG4gICAgfTtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBhbmNob3JzIGFuZCBhcmVhbWFwcyBsb29raW5nIGZvciBlaXRoZXIgZGF0YS1saWdodGJveCBhdHRyaWJ1dGVzIG9yIHJlbCBhdHRyaWJ1dGVzXG4gICAgLy8gdGhhdCBjb250YWluICdsaWdodGJveCcuIFdoZW4gdGhlc2UgYXJlIGNsaWNrZWQsIHN0YXJ0IGxpZ2h0Ym94LlxuICAgIExpZ2h0Ym94LnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnYVtyZWxePWxpZ2h0Ym94XSwgYXJlYVtyZWxePWxpZ2h0Ym94XSwgYVtkYXRhLWxpZ2h0Ym94XSwgYXJlYVtkYXRhLWxpZ2h0Ym94XScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHNlbGYuc3RhcnQoJChldmVudC5jdXJyZW50VGFyZ2V0KSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBCdWlsZCBodG1sIGZvciB0aGUgbGlnaHRib3ggYW5kIHRoZSBvdmVybGF5LlxuICAgIC8vIEF0dGFjaCBldmVudCBoYW5kbGVycyB0byB0aGUgbmV3IERPTSBlbGVtZW50cy4gY2xpY2sgY2xpY2sgY2xpY2tcbiAgICBMaWdodGJveC5wcm90b3R5cGUuYnVpbGQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICQoXCI8ZGl2IGlkPSdsaWdodGJveE92ZXJsYXknIGNsYXNzPSdsaWdodGJveE92ZXJsYXknPjwvZGl2PjxkaXYgaWQ9J2xpZ2h0Ym94JyBjbGFzcz0nbGlnaHRib3gnPjxkaXYgY2xhc3M9J2xiLW91dGVyQ29udGFpbmVyJz48ZGl2IGNsYXNzPSdsYi1jb250YWluZXInPjxpbWcgY2xhc3M9J2xiLWltYWdlJyBzcmM9JycgLz48ZGl2IGNsYXNzPSdsYi1uYXYnPjxhIGNsYXNzPSdsYi1wcmV2JyBocmVmPScnID48L2E+PGEgY2xhc3M9J2xiLW5leHQnIGhyZWY9JycgPjwvYT48L2Rpdj48ZGl2IGNsYXNzPSdsYi1sb2FkZXInPjxhIGNsYXNzPSdsYi1jYW5jZWwnPjwvYT48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPSdsYi1kYXRhQ29udGFpbmVyJz48ZGl2IGNsYXNzPSdsYi1kYXRhJz48ZGl2IGNsYXNzPSdsYi1kZXRhaWxzJz48c3BhbiBjbGFzcz0nbGItY2FwdGlvbic+PC9zcGFuPjxzcGFuIGNsYXNzPSdsYi1udW1iZXInPjwvc3Bhbj48L2Rpdj48ZGl2IGNsYXNzPSdsYi1jbG9zZUNvbnRhaW5lcic+PGEgY2xhc3M9J2xiLWNsb3NlJz48L2E+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+XCIpLmFwcGVuZFRvKCQoJ2JvZHknKSk7XG5cbiAgICAgIC8vIENhY2hlIGpRdWVyeSBvYmplY3RzXG4gICAgICB0aGlzLiRsaWdodGJveCAgICAgICA9ICQoJyNsaWdodGJveCcpO1xuICAgICAgdGhpcy4kb3ZlcmxheSAgICAgICAgPSAkKCcjbGlnaHRib3hPdmVybGF5Jyk7XG4gICAgICB0aGlzLiRvdXRlckNvbnRhaW5lciA9IHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1vdXRlckNvbnRhaW5lcicpO1xuICAgICAgdGhpcy4kY29udGFpbmVyICAgICAgPSB0aGlzLiRsaWdodGJveC5maW5kKCcubGItY29udGFpbmVyJyk7XG5cbiAgICAgIC8vIFN0b3JlIGNzcyB2YWx1ZXMgZm9yIGZ1dHVyZSBsb29rdXBcbiAgICAgIHRoaXMuY29udGFpbmVyVG9wUGFkZGluZyA9IHBhcnNlSW50KHRoaXMuJGNvbnRhaW5lci5jc3MoJ3BhZGRpbmctdG9wJyksIDEwKTtcbiAgICAgIHRoaXMuY29udGFpbmVyUmlnaHRQYWRkaW5nID0gcGFyc2VJbnQodGhpcy4kY29udGFpbmVyLmNzcygncGFkZGluZy1yaWdodCcpLCAxMCk7XG4gICAgICB0aGlzLmNvbnRhaW5lckJvdHRvbVBhZGRpbmcgPSBwYXJzZUludCh0aGlzLiRjb250YWluZXIuY3NzKCdwYWRkaW5nLWJvdHRvbScpLCAxMCk7XG4gICAgICB0aGlzLmNvbnRhaW5lckxlZnRQYWRkaW5nID0gcGFyc2VJbnQodGhpcy4kY29udGFpbmVyLmNzcygncGFkZGluZy1sZWZ0JyksIDEwKTtcblxuICAgICAgLy8gQXR0YWNoIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBuZXdseSBtaW50ZWQgRE9NIGVsZW1lbnRzXG4gICAgICB0aGlzLiRvdmVybGF5LmhpZGUoKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2VsZi5lbmQoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuJGxpZ2h0Ym94LmhpZGUoKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoJChldmVudC50YXJnZXQpLmF0dHIoJ2lkJykgPT09ICdsaWdodGJveCcpIHtcbiAgICAgICAgICBzZWxmLmVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLiRvdXRlckNvbnRhaW5lci5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoJChldmVudC50YXJnZXQpLmF0dHIoJ2lkJykgPT09ICdsaWdodGJveCcpIHtcbiAgICAgICAgICBzZWxmLmVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLiRsaWdodGJveC5maW5kKCcubGItcHJldicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc2VsZi5jdXJyZW50SW1hZ2VJbmRleCA9PT0gMCkge1xuICAgICAgICAgIHNlbGYuY2hhbmdlSW1hZ2Uoc2VsZi5hbGJ1bS5sZW5ndGggLSAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLmNoYW5nZUltYWdlKHNlbGYuY3VycmVudEltYWdlSW5kZXggLSAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLW5leHQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNlbGYuY3VycmVudEltYWdlSW5kZXggPT09IHNlbGYuYWxidW0ubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHNlbGYuY2hhbmdlSW1hZ2UoMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5jaGFuZ2VJbWFnZShzZWxmLmN1cnJlbnRJbWFnZUluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1sb2FkZXIsIC5sYi1jbG9zZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmVuZCgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gU2hvdyBvdmVybGF5IGFuZCBsaWdodGJveC4gSWYgdGhlIGltYWdlIGlzIHBhcnQgb2YgYSBzZXQsIGFkZCBzaWJsaW5ncyB0byBhbGJ1bSBhcnJheS5cbiAgICBMaWdodGJveC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigkbGluaykge1xuICAgICAgdmFyIHNlbGYgICAgPSB0aGlzO1xuICAgICAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG5cbiAgICAgICR3aW5kb3cub24oJ3Jlc2l6ZScsICQucHJveHkodGhpcy5zaXplT3ZlcmxheSwgdGhpcykpO1xuXG4gICAgICAkKCdzZWxlY3QsIG9iamVjdCwgZW1iZWQnKS5jc3Moe1xuICAgICAgICB2aXNpYmlsaXR5OiBcImhpZGRlblwiXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zaXplT3ZlcmxheSgpO1xuXG4gICAgICB0aGlzLmFsYnVtID0gW107XG4gICAgICB2YXIgaW1hZ2VOdW1iZXIgPSAwO1xuXG4gICAgICBmdW5jdGlvbiBhZGRUb0FsYnVtKCRsaW5rKSB7XG4gICAgICAgIHNlbGYuYWxidW0ucHVzaCh7XG4gICAgICAgICAgbGluazogJGxpbmsuYXR0cignaHJlZicpLFxuICAgICAgICAgIHRpdGxlOiAkbGluay5hdHRyKCdkYXRhLXRpdGxlJykgfHwgJGxpbmsuYXR0cigndGl0bGUnKVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gU3VwcG9ydCBib3RoIGRhdGEtbGlnaHRib3ggYXR0cmlidXRlIGFuZCByZWwgYXR0cmlidXRlIGltcGxlbWVudGF0aW9uc1xuICAgICAgdmFyIGRhdGFMaWdodGJveFZhbHVlID0gJGxpbmsuYXR0cignZGF0YS1saWdodGJveCcpO1xuICAgICAgdmFyICRsaW5rcztcblxuICAgICAgaWYgKGRhdGFMaWdodGJveFZhbHVlKSB7XG4gICAgICAgICRsaW5rcyA9ICQoJGxpbmsucHJvcChcInRhZ05hbWVcIikgKyAnW2RhdGEtbGlnaHRib3g9XCInICsgZGF0YUxpZ2h0Ym94VmFsdWUgKyAnXCJdJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJGxpbmtzLmxlbmd0aDsgaSA9ICsraSkge1xuICAgICAgICAgIGFkZFRvQWxidW0oJCgkbGlua3NbaV0pKTtcbiAgICAgICAgICBpZiAoJGxpbmtzW2ldID09PSAkbGlua1swXSkge1xuICAgICAgICAgICAgaW1hZ2VOdW1iZXIgPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCRsaW5rLmF0dHIoJ3JlbCcpID09PSAnbGlnaHRib3gnKSB7XG4gICAgICAgICAgLy8gSWYgaW1hZ2UgaXMgbm90IHBhcnQgb2YgYSBzZXRcbiAgICAgICAgICBhZGRUb0FsYnVtKCRsaW5rKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBpbWFnZSBpcyBwYXJ0IG9mIGEgc2V0XG4gICAgICAgICAgJGxpbmtzID0gJCgkbGluay5wcm9wKFwidGFnTmFtZVwiKSArICdbcmVsPVwiJyArICRsaW5rLmF0dHIoJ3JlbCcpICsgJ1wiXScpO1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgJGxpbmtzLmxlbmd0aDsgaiA9ICsraikge1xuICAgICAgICAgICAgYWRkVG9BbGJ1bSgkKCRsaW5rc1tqXSkpO1xuICAgICAgICAgICAgaWYgKCRsaW5rc1tqXSA9PT0gJGxpbmtbMF0pIHtcbiAgICAgICAgICAgICAgaW1hZ2VOdW1iZXIgPSBqO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBQb3NpdGlvbiBMaWdodGJveFxuICAgICAgdmFyIHRvcCAgPSAkd2luZG93LnNjcm9sbFRvcCgpICsgdGhpcy5vcHRpb25zLnBvc2l0aW9uRnJvbVRvcDtcbiAgICAgIHZhciBsZWZ0ID0gJHdpbmRvdy5zY3JvbGxMZWZ0KCk7XG4gICAgICB0aGlzLiRsaWdodGJveC5jc3Moe1xuICAgICAgICB0b3A6IHRvcCArICdweCcsXG4gICAgICAgIGxlZnQ6IGxlZnQgKyAncHgnXG4gICAgICB9KS5mYWRlSW4odGhpcy5vcHRpb25zLmZhZGVEdXJhdGlvbik7XG5cbiAgICAgIHRoaXMuY2hhbmdlSW1hZ2UoaW1hZ2VOdW1iZXIpO1xuICAgIH07XG5cbiAgICAvLyBIaWRlIG1vc3QgVUkgZWxlbWVudHMgaW4gcHJlcGFyYXRpb24gZm9yIHRoZSBhbmltYXRlZCByZXNpemluZyBvZiB0aGUgbGlnaHRib3guXG4gICAgTGlnaHRib3gucHJvdG90eXBlLmNoYW5nZUltYWdlID0gZnVuY3Rpb24oaW1hZ2VOdW1iZXIpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdGhpcy5kaXNhYmxlS2V5Ym9hcmROYXYoKTtcbiAgICAgIHZhciAkaW1hZ2UgPSB0aGlzLiRsaWdodGJveC5maW5kKCcubGItaW1hZ2UnKTtcblxuICAgICAgdGhpcy4kb3ZlcmxheS5mYWRlSW4odGhpcy5vcHRpb25zLmZhZGVEdXJhdGlvbik7XG5cbiAgICAgICQoJy5sYi1sb2FkZXInKS5mYWRlSW4oJ3Nsb3cnKTtcbiAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1pbWFnZSwgLmxiLW5hdiwgLmxiLXByZXYsIC5sYi1uZXh0LCAubGItZGF0YUNvbnRhaW5lciwgLmxiLW51bWJlcnMsIC5sYi1jYXB0aW9uJykuaGlkZSgpO1xuXG4gICAgICB0aGlzLiRvdXRlckNvbnRhaW5lci5hZGRDbGFzcygnYW5pbWF0aW5nJyk7XG5cbiAgICAgIC8vIFdoZW4gaW1hZ2UgdG8gc2hvdyBpcyBwcmVsb2FkZWQsIHdlIHNlbmQgdGhlIHdpZHRoIGFuZCBoZWlnaHQgdG8gc2l6ZUNvbnRhaW5lcigpXG4gICAgICB2YXIgcHJlbG9hZGVyID0gbmV3IEltYWdlKCk7XG4gICAgICBwcmVsb2FkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkcHJlbG9hZGVyLCBpbWFnZUhlaWdodCwgaW1hZ2VXaWR0aCwgbWF4SW1hZ2VIZWlnaHQsIG1heEltYWdlV2lkdGgsIHdpbmRvd0hlaWdodCwgd2luZG93V2lkdGg7XG4gICAgICAgICRpbWFnZS5hdHRyKCdzcmMnLCBzZWxmLmFsYnVtW2ltYWdlTnVtYmVyXS5saW5rKTtcblxuICAgICAgICAkcHJlbG9hZGVyID0gJChwcmVsb2FkZXIpO1xuXG4gICAgICAgICRpbWFnZS53aWR0aChwcmVsb2FkZXIud2lkdGgpO1xuICAgICAgICAkaW1hZ2UuaGVpZ2h0KHByZWxvYWRlci5oZWlnaHQpO1xuXG4gICAgICAgIGlmIChzZWxmLm9wdGlvbnMuZml0SW1hZ2VzSW5WaWV3cG9ydCkge1xuICAgICAgICAgIC8vIEZpdCBpbWFnZSBpbnNpZGUgdGhlIHZpZXdwb3J0LlxuICAgICAgICAgIC8vIFRha2UgaW50byBhY2NvdW50IHRoZSBib3JkZXIgYXJvdW5kIHRoZSBpbWFnZSBhbmQgYW4gYWRkaXRpb25hbCAxMHB4IGd1dHRlciBvbiBlYWNoIHNpZGUuXG5cbiAgICAgICAgICB3aW5kb3dXaWR0aCAgICA9ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICAgIHdpbmRvd0hlaWdodCAgID0gJCh3aW5kb3cpLmhlaWdodCgpO1xuICAgICAgICAgIG1heEltYWdlV2lkdGggID0gd2luZG93V2lkdGggLSBzZWxmLmNvbnRhaW5lckxlZnRQYWRkaW5nIC0gc2VsZi5jb250YWluZXJSaWdodFBhZGRpbmcgLSAyMDtcbiAgICAgICAgICBtYXhJbWFnZUhlaWdodCA9IHdpbmRvd0hlaWdodCAtIHNlbGYuY29udGFpbmVyVG9wUGFkZGluZyAtIHNlbGYuY29udGFpbmVyQm90dG9tUGFkZGluZyAtIDEyMDtcblxuICAgICAgICAgIC8vIElzIHRoZXJlIGEgZml0dGluZyBpc3N1ZT9cbiAgICAgICAgICBpZiAoKHByZWxvYWRlci53aWR0aCA+IG1heEltYWdlV2lkdGgpIHx8IChwcmVsb2FkZXIuaGVpZ2h0ID4gbWF4SW1hZ2VIZWlnaHQpKSB7XG4gICAgICAgICAgICBpZiAoKHByZWxvYWRlci53aWR0aCAvIG1heEltYWdlV2lkdGgpID4gKHByZWxvYWRlci5oZWlnaHQgLyBtYXhJbWFnZUhlaWdodCkpIHtcbiAgICAgICAgICAgICAgaW1hZ2VXaWR0aCAgPSBtYXhJbWFnZVdpZHRoO1xuICAgICAgICAgICAgICBpbWFnZUhlaWdodCA9IHBhcnNlSW50KHByZWxvYWRlci5oZWlnaHQgLyAocHJlbG9hZGVyLndpZHRoIC8gaW1hZ2VXaWR0aCksIDEwKTtcbiAgICAgICAgICAgICAgJGltYWdlLndpZHRoKGltYWdlV2lkdGgpO1xuICAgICAgICAgICAgICAkaW1hZ2UuaGVpZ2h0KGltYWdlSGVpZ2h0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGltYWdlSGVpZ2h0ID0gbWF4SW1hZ2VIZWlnaHQ7XG4gICAgICAgICAgICAgIGltYWdlV2lkdGggPSBwYXJzZUludChwcmVsb2FkZXIud2lkdGggLyAocHJlbG9hZGVyLmhlaWdodCAvIGltYWdlSGVpZ2h0KSwgMTApO1xuICAgICAgICAgICAgICAkaW1hZ2Uud2lkdGgoaW1hZ2VXaWR0aCk7XG4gICAgICAgICAgICAgICRpbWFnZS5oZWlnaHQoaW1hZ2VIZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzZWxmLnNpemVDb250YWluZXIoJGltYWdlLndpZHRoKCksICRpbWFnZS5oZWlnaHQoKSk7XG4gICAgICB9O1xuXG4gICAgICBwcmVsb2FkZXIuc3JjICAgICAgICAgID0gdGhpcy5hbGJ1bVtpbWFnZU51bWJlcl0ubGluaztcbiAgICAgIHRoaXMuY3VycmVudEltYWdlSW5kZXggPSBpbWFnZU51bWJlcjtcbiAgICB9O1xuXG4gICAgLy8gU3RyZXRjaCBvdmVybGF5IHRvIGZpdCB0aGUgdmlld3BvcnRcbiAgICBMaWdodGJveC5wcm90b3R5cGUuc2l6ZU92ZXJsYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXlcbiAgICAgICAgLndpZHRoKCQod2luZG93KS53aWR0aCgpKVxuICAgICAgICAuaGVpZ2h0KCQoZG9jdW1lbnQpLmhlaWdodCgpKTtcbiAgICB9O1xuXG4gICAgLy8gQW5pbWF0ZSB0aGUgc2l6ZSBvZiB0aGUgbGlnaHRib3ggdG8gZml0IHRoZSBpbWFnZSB3ZSBhcmUgc2hvd2luZ1xuICAgIExpZ2h0Ym94LnByb3RvdHlwZS5zaXplQ29udGFpbmVyID0gZnVuY3Rpb24oaW1hZ2VXaWR0aCwgaW1hZ2VIZWlnaHQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgdmFyIG9sZFdpZHRoICA9IHRoaXMuJG91dGVyQ29udGFpbmVyLm91dGVyV2lkdGgoKTtcbiAgICAgIHZhciBvbGRIZWlnaHQgPSB0aGlzLiRvdXRlckNvbnRhaW5lci5vdXRlckhlaWdodCgpO1xuICAgICAgdmFyIG5ld1dpZHRoICA9IGltYWdlV2lkdGggKyB0aGlzLmNvbnRhaW5lckxlZnRQYWRkaW5nICsgdGhpcy5jb250YWluZXJSaWdodFBhZGRpbmc7XG4gICAgICB2YXIgbmV3SGVpZ2h0ID0gaW1hZ2VIZWlnaHQgKyB0aGlzLmNvbnRhaW5lclRvcFBhZGRpbmcgKyB0aGlzLmNvbnRhaW5lckJvdHRvbVBhZGRpbmc7XG5cbiAgICAgIGZ1bmN0aW9uIHBvc3RSZXNpemUoKSB7XG4gICAgICAgIHNlbGYuJGxpZ2h0Ym94LmZpbmQoJy5sYi1kYXRhQ29udGFpbmVyJykud2lkdGgobmV3V2lkdGgpO1xuICAgICAgICBzZWxmLiRsaWdodGJveC5maW5kKCcubGItcHJldkxpbmsnKS5oZWlnaHQobmV3SGVpZ2h0KTtcbiAgICAgICAgc2VsZi4kbGlnaHRib3guZmluZCgnLmxiLW5leHRMaW5rJykuaGVpZ2h0KG5ld0hlaWdodCk7XG4gICAgICAgIHNlbGYuc2hvd0ltYWdlKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvbGRXaWR0aCAhPT0gbmV3V2lkdGggfHwgb2xkSGVpZ2h0ICE9PSBuZXdIZWlnaHQpIHtcbiAgICAgICAgdGhpcy4kb3V0ZXJDb250YWluZXIuYW5pbWF0ZSh7XG4gICAgICAgICAgd2lkdGg6IG5ld1dpZHRoLFxuICAgICAgICAgIGhlaWdodDogbmV3SGVpZ2h0XG4gICAgICAgIH0sIHRoaXMub3B0aW9ucy5yZXNpemVEdXJhdGlvbiwgJ3N3aW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcG9zdFJlc2l6ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvc3RSZXNpemUoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRGlzcGxheSB0aGUgaW1hZ2UgYW5kIGl0J3MgZGV0YWlscyBhbmQgYmVnaW4gcHJlbG9hZCBuZWlnaGJvcmluZyBpbWFnZXMuXG4gICAgTGlnaHRib3gucHJvdG90eXBlLnNob3dJbWFnZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLWxvYWRlcicpLmhpZGUoKTtcbiAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1pbWFnZScpLmZhZGVJbignc2xvdycpO1xuXG4gICAgICB0aGlzLnVwZGF0ZU5hdigpO1xuICAgICAgdGhpcy51cGRhdGVEZXRhaWxzKCk7XG4gICAgICB0aGlzLnByZWxvYWROZWlnaGJvcmluZ0ltYWdlcygpO1xuICAgICAgdGhpcy5lbmFibGVLZXlib2FyZE5hdigpO1xuICAgIH07XG5cbiAgICAvLyBEaXNwbGF5IHByZXZpb3VzIGFuZCBuZXh0IG5hdmlnYXRpb24gaWYgYXBwcm9wcmlhdGUuXG4gICAgTGlnaHRib3gucHJvdG90eXBlLnVwZGF0ZU5hdiA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBicm93c2VyIHN1cHBvcnRzIHRvdWNoIGV2ZW50cy4gSWYgc28sIHdlIHRha2UgdGhlIGNvbnNlcnZhdGl2ZSBhcHByb2FjaFxuICAgICAgLy8gYW5kIGFzc3VtZSB0aGF0IG1vdXNlIGhvdmVyIGV2ZW50cyBhcmUgbm90IHN1cHBvcnRlZCBhbmQgYWx3YXlzIHNob3cgcHJldi9uZXh0IG5hdmlnYXRpb25cbiAgICAgIC8vIGFycm93cyBpbiBpbWFnZSBzZXRzLlxuICAgICAgdmFyIGFsd2F5c1Nob3dOYXYgPSBmYWxzZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiVG91Y2hFdmVudFwiKTtcbiAgICAgICAgYWx3YXlzU2hvd05hdiA9ICh0aGlzLm9wdGlvbnMuYWx3YXlzU2hvd05hdk9uVG91Y2hEZXZpY2VzKT8gdHJ1ZTogZmFsc2U7XG4gICAgICB9IGNhdGNoIChlKSB7fVxuXG4gICAgICB0aGlzLiRsaWdodGJveC5maW5kKCcubGItbmF2Jykuc2hvdygpO1xuXG4gICAgICBpZiAodGhpcy5hbGJ1bS5sZW5ndGggPiAxKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCkge1xuICAgICAgICAgIGlmIChhbHdheXNTaG93TmF2KSB7XG4gICAgICAgICAgICB0aGlzLiRsaWdodGJveC5maW5kKCcubGItcHJldiwgLmxiLW5leHQnKS5jc3MoJ29wYWNpdHknLCAnMScpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLiRsaWdodGJveC5maW5kKCcubGItcHJldiwgLmxiLW5leHQnKS5zaG93KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuY3VycmVudEltYWdlSW5kZXggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLiRsaWdodGJveC5maW5kKCcubGItcHJldicpLnNob3coKTtcbiAgICAgICAgICAgIGlmIChhbHdheXNTaG93TmF2KSB7XG4gICAgICAgICAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1wcmV2JykuY3NzKCdvcGFjaXR5JywgJzEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuY3VycmVudEltYWdlSW5kZXggPCB0aGlzLmFsYnVtLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1uZXh0Jykuc2hvdygpO1xuICAgICAgICAgICAgaWYgKGFsd2F5c1Nob3dOYXYpIHtcbiAgICAgICAgICAgICAgdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLW5leHQnKS5jc3MoJ29wYWNpdHknLCAnMScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBEaXNwbGF5IGNhcHRpb24sIGltYWdlIG51bWJlciwgYW5kIGNsb3NpbmcgYnV0dG9uLlxuICAgIExpZ2h0Ym94LnByb3RvdHlwZS51cGRhdGVEZXRhaWxzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIEVuYWJsZSBhbmNob3IgY2xpY2tzIGluIHRoZSBpbmplY3RlZCBjYXB0aW9uIGh0bWwuXG4gICAgICAvLyBUaGFua3MgTmF0ZSBXcmlnaHQgZm9yIHRoZSBmaXguIEBodHRwczovL2dpdGh1Yi5jb20vTmF0ZVdyXG4gICAgICBpZiAodHlwZW9mIHRoaXMuYWxidW1bdGhpcy5jdXJyZW50SW1hZ2VJbmRleF0udGl0bGUgIT09ICd1bmRlZmluZWQnICYmIHRoaXMuYWxidW1bdGhpcy5jdXJyZW50SW1hZ2VJbmRleF0udGl0bGUgIT09IFwiXCIpIHtcbiAgICAgICAgdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLWNhcHRpb24nKVxuICAgICAgICAgIC5odG1sKHRoaXMuYWxidW1bdGhpcy5jdXJyZW50SW1hZ2VJbmRleF0udGl0bGUpXG4gICAgICAgICAgLmZhZGVJbignZmFzdCcpXG4gICAgICAgICAgLmZpbmQoJ2EnKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmFsYnVtLmxlbmd0aCA+IDEgJiYgdGhpcy5vcHRpb25zLnNob3dJbWFnZU51bWJlckxhYmVsKSB7XG4gICAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1udW1iZXInKS50ZXh0KHRoaXMub3B0aW9ucy5hbGJ1bUxhYmVsKHRoaXMuY3VycmVudEltYWdlSW5kZXggKyAxLCB0aGlzLmFsYnVtLmxlbmd0aCkpLmZhZGVJbignZmFzdCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLW51bWJlcicpLmhpZGUoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy4kb3V0ZXJDb250YWluZXIucmVtb3ZlQ2xhc3MoJ2FuaW1hdGluZycpO1xuXG4gICAgICB0aGlzLiRsaWdodGJveC5maW5kKCcubGItZGF0YUNvbnRhaW5lcicpLmZhZGVJbih0aGlzLm9wdGlvbnMucmVzaXplRHVyYXRpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2VsZi5zaXplT3ZlcmxheSgpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIFByZWxvYWQgcHJldmlvdXMgYW5kIG5leHQgaW1hZ2VzIGluIHNldC5cbiAgICBMaWdodGJveC5wcm90b3R5cGUucHJlbG9hZE5laWdoYm9yaW5nSW1hZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5hbGJ1bS5sZW5ndGggPiB0aGlzLmN1cnJlbnRJbWFnZUluZGV4ICsgMSkge1xuICAgICAgICB2YXIgcHJlbG9hZE5leHQgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgcHJlbG9hZE5leHQuc3JjID0gdGhpcy5hbGJ1bVt0aGlzLmN1cnJlbnRJbWFnZUluZGV4ICsgMV0ubGluaztcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmN1cnJlbnRJbWFnZUluZGV4ID4gMCkge1xuICAgICAgICB2YXIgcHJlbG9hZFByZXYgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgcHJlbG9hZFByZXYuc3JjID0gdGhpcy5hbGJ1bVt0aGlzLmN1cnJlbnRJbWFnZUluZGV4IC0gMV0ubGluaztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTGlnaHRib3gucHJvdG90eXBlLmVuYWJsZUtleWJvYXJkTmF2ID0gZnVuY3Rpb24oKSB7XG4gICAgICAkKGRvY3VtZW50KS5vbigna2V5dXAua2V5Ym9hcmQnLCAkLnByb3h5KHRoaXMua2V5Ym9hcmRBY3Rpb24sIHRoaXMpKTtcbiAgICB9O1xuXG4gICAgTGlnaHRib3gucHJvdG90eXBlLmRpc2FibGVLZXlib2FyZE5hdiA9IGZ1bmN0aW9uKCkge1xuICAgICAgJChkb2N1bWVudCkub2ZmKCcua2V5Ym9hcmQnKTtcbiAgICB9O1xuXG4gICAgTGlnaHRib3gucHJvdG90eXBlLmtleWJvYXJkQWN0aW9uID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHZhciBLRVlDT0RFX0VTQyAgICAgICAgPSAyNztcbiAgICAgIHZhciBLRVlDT0RFX0xFRlRBUlJPVyAgPSAzNztcbiAgICAgIHZhciBLRVlDT0RFX1JJR0hUQVJST1cgPSAzOTtcblxuICAgICAgdmFyIGtleWNvZGUgPSBldmVudC5rZXlDb2RlO1xuICAgICAgdmFyIGtleSAgICAgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGtleWNvZGUpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoa2V5Y29kZSA9PT0gS0VZQ09ERV9FU0MgfHwga2V5Lm1hdGNoKC94fG98Yy8pKSB7XG4gICAgICAgIHRoaXMuZW5kKCk7XG4gICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3AnIHx8IGtleWNvZGUgPT09IEtFWUNPREVfTEVGVEFSUk9XKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbWFnZUluZGV4ICE9PSAwKSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VJbWFnZSh0aGlzLmN1cnJlbnRJbWFnZUluZGV4IC0gMSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLndyYXBBcm91bmQgJiYgdGhpcy5hbGJ1bS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VJbWFnZSh0aGlzLmFsYnVtLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ24nIHx8IGtleWNvZGUgPT09IEtFWUNPREVfUklHSFRBUlJPVykge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50SW1hZ2VJbmRleCAhPT0gdGhpcy5hbGJ1bS5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VJbWFnZSh0aGlzLmN1cnJlbnRJbWFnZUluZGV4ICsgMSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLndyYXBBcm91bmQgJiYgdGhpcy5hbGJ1bS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VJbWFnZSgwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDbG9zaW5nIHRpbWUuIDotKFxuICAgIExpZ2h0Ym94LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZGlzYWJsZUtleWJvYXJkTmF2KCk7XG4gICAgICAkKHdpbmRvdykub2ZmKFwicmVzaXplXCIsIHRoaXMuc2l6ZU92ZXJsYXkpO1xuICAgICAgdGhpcy4kbGlnaHRib3guZmFkZU91dCh0aGlzLm9wdGlvbnMuZmFkZUR1cmF0aW9uKTtcbiAgICAgIHRoaXMuJG92ZXJsYXkuZmFkZU91dCh0aGlzLm9wdGlvbnMuZmFkZUR1cmF0aW9uKTtcbiAgICAgICQoJ3NlbGVjdCwgb2JqZWN0LCBlbWJlZCcpLmNzcyh7XG4gICAgICAgIHZpc2liaWxpdHk6IFwidmlzaWJsZVwiXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIExpZ2h0Ym94O1xuXG4gIH0pKCk7XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgb3B0aW9ucyAgPSBuZXcgTGlnaHRib3hPcHRpb25zKCk7XG4gICAgdmFyIGxpZ2h0Ym94ID0gbmV3IExpZ2h0Ym94KG9wdGlvbnMpO1xuICB9KTtcblxufSkuY2FsbCh0aGlzKTtcbiJdfQ==
