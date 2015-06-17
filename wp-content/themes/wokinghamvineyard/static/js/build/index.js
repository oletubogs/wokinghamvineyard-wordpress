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

},{"./lib/app":9,"./lib/header-dropdown":10,"./lib/maps":11,"./lib/scroll-links":12}],9:[function(require,module,exports){
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

},{}]},{},[8])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9ub2RlX21vZHVsZXMvYnJlYWsvYnJlYWsuanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9ub2RlX21vZHVsZXMvYnJlYWsvYnJlYWtwb2ludC5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icmVhay9tYXRjaC1tZWRpYS1wb2x5ZmlsbC5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icmVhay9tYXRjaC1tZWRpYS5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icmVhay9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwiL1VzZXJzL25pY2twL0Ryb3Bib3gvQ2h1cmNoL0RpZ2l0YWwvV2Vic2l0ZS9hcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL3NvdXJjZS9zdGF0aWMvanMvaW5kZXguanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9zb3VyY2Uvc3RhdGljL2pzL2xpYi9hcHAuanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9zb3VyY2Uvc3RhdGljL2pzL2xpYi9oZWFkZXItZHJvcGRvd24uanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9zb3VyY2Uvc3RhdGljL2pzL2xpYi9tYXBzLmpzIiwiL1VzZXJzL25pY2twL0Ryb3Bib3gvQ2h1cmNoL0RpZ2l0YWwvV2Vic2l0ZS9hcHAvc291cmNlL3N0YXRpYy9qcy9saWIvc2Nyb2xsLWxpbmtzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVCcmVha3BvaW50TWFuYWdlclxubW9kdWxlLmV4cG9ydHMuQnJlYWtwb2ludE1hbmFnZXIgPSBCcmVha3BvaW50TWFuYWdlclxuXG4vKlxuICogTWFpbiB1c2UgY2FzZTogaW5zdGFudGlhdGUgYW5kIHN0YXJ0XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJyZWFrcG9pbnRNYW5hZ2VyKCkge1xuICB2YXIgYm0gPSBuZXcgQnJlYWtwb2ludE1hbmFnZXIoKVxuICBibS5zdGFydCgpXG4gIHJldHVybiBibVxufVxuXG52YXIgQnJlYWtwb2ludCA9IHJlcXVpcmUoJy4vYnJlYWtwb2ludCcpXG4gICwgRW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlclxuICAsIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKVxuICAsIG1hdGNoID0gcmVxdWlyZSgnLi9tYXRjaC1tZWRpYScpXG5cbmZ1bmN0aW9uIEJyZWFrcG9pbnRNYW5hZ2VyKCkge1xuICAvLyBDYWxsIEVtaXR0ZXIgY29uc3RydWN0b3JcbiAgRW1pdHRlci5jYWxsKHRoaXMpXG4gIC8vIFN0b3JlIGEgbGlzdCBvZiBicmVha3BvaW50cyB0byB3YXRjaFxuICB0aGlzLmJyZWFrcG9pbnRzID0gW11cbn1cblxuLy8gQmFja3dhcmRzIGNvbXBhdGlibGUgaW5oZXJpdGFuY2UgKGluY2x1ZGVzIEVTMyBlbnZzKVxuaW5oZXJpdHMoQnJlYWtwb2ludE1hbmFnZXIsIEVtaXR0ZXIpXG5cbi8qXG4gKiBBZGQgYSBicmVha3BvaW50XG4gKi9cbkJyZWFrcG9pbnRNYW5hZ2VyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAobmFtZSwgbWVkaWEpIHtcbiAgLy8gT25seSBydW4gb24gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1lZGlhIHF1ZXJpZXNcbiAgaWYgKCFtYXRjaCgnb25seSBhbGwnKSkgcmV0dXJuXG4gIHZhciBicmVha3BvaW50ID0gbmV3IEJyZWFrcG9pbnQobmFtZSwgbWVkaWEpXG4gIHRoaXMuYnJlYWtwb2ludHMucHVzaChicmVha3BvaW50KVxuICBwcm9jZXNzLm5leHRUaWNrKHRoaXMuY2hlY2tTaW5nbGUuYmluZCh0aGlzLCBicmVha3BvaW50KSlcbn1cblxuLypcbiAqIFJ1biBhIGZ1bmN0aW9uIGlmIG1lZGlhIHF1ZXJpZXMgYXJlIG5vdCBzdXBwb3J0ZWRcbiAqL1xuQnJlYWtwb2ludE1hbmFnZXIucHJvdG90eXBlLmZhbGxiYWNrID0gZnVuY3Rpb24gKGZuKSB7XG4gIC8vIE9ubHkgcnVuIG9uIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtZWRpYSBxdWVyaWVzXG4gIGlmIChtYXRjaCgnb25seSBhbGwnKSkgcmV0dXJuXG4gIGZuKClcbn1cblxuLypcbiAqIFN0YXJ0IGxpc3RlbmluZyB0byB3aW5kb3cjcmVzaXplIGFuZCBmaXJpbmcgZXZlbnRzXG4gKi9cbkJyZWFrcG9pbnRNYW5hZ2VyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gT25seSBhZGQgdGhlIGxpc3RlbmVyIGlmIG1hdGNoTWVkaWEgaXMgc3VwcG9ydGVkXG4gIGlmICghbWF0Y2goJ29ubHkgYWxsJykpIHJldHVyblxuICB0aGlzLl9ib3VuZENoZWNrID0gdGhpcy5jaGVjay5iaW5kKHRoaXMpXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9ib3VuZENoZWNrKVxuICB0aGlzLmNoZWNrKClcbn1cblxuLypcbiAqIFN0b3AgbGlzdGVuaW5nIHRvIHdpbmRvdyNyZXNpemVcbiAqL1xuQnJlYWtwb2ludE1hbmFnZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLl9ib3VuZENoZWNrKSB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fYm91bmRDaGVjaylcbn1cblxuLypcbiAqIENoZWNrIGVhY2ggYnJlYWtwb2ludFxuICovXG5CcmVha3BvaW50TWFuYWdlci5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuYnJlYWtwb2ludHMuZm9yRWFjaCh0aGlzLmNoZWNrU2luZ2xlLmJpbmQodGhpcykpXG59XG5cbi8qXG4gKiBDaGVjayBhIHNpbmdsZSBicmVha3BvaW50XG4gKi9cbkJyZWFrcG9pbnRNYW5hZ2VyLnByb3RvdHlwZS5jaGVja1NpbmdsZSA9IGZ1bmN0aW9uIChicmVha3BvaW50KSB7XG4gIHN3aXRjaCAoYnJlYWtwb2ludC5jaGVjaygpKSB7XG4gIGNhc2UgdHJ1ZTpcbiAgICByZXR1cm4gdGhpcy5lbWl0KCdlbnRlcjonICsgYnJlYWtwb2ludC5uYW1lKVxuICBjYXNlIGZhbHNlOlxuICAgIHJldHVybiB0aGlzLmVtaXQoJ2V4aXQ6JyArIGJyZWFrcG9pbnQubmFtZSlcbiAgY2FzZSBudWxsOlxuICAgIHJldHVyblxuICB9XG59XG5cbi8qXG4gKiBPdmVycmlkZSB0aGUgZXZlbnQgZW1pdHRlcidzIG9uKCkgZnVuY3Rpb24gdG8gdGFrZSBhIDNyZCBhcmd1bWVudFxuICogLSBhIGZsYWcgYXMgdG8gd2hldGhlciB0aGUgcHJvdmlkZWQgZm4gc2hvdWxkIGJlIHJ1biBpZiBtZWRpYSBxdWVyaWVzXG4gKiBhcmUgbm90IGF2YWlsYWJsZS5cbiAqL1xuQnJlYWtwb2ludE1hbmFnZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gKGV2ZW50LCBmbiwgaXNGYWxsYmFjaykge1xuICBFbWl0dGVyLnByb3RvdHlwZS5vbi5jYWxsKHRoaXMsIGV2ZW50LCBmbilcbiAgaWYgKGlzRmFsbGJhY2spIHRoaXMuZmFsbGJhY2soZm4pXG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiRldhQVNIXCIpKSIsIm1vZHVsZS5leHBvcnRzID0gQnJlYWtwb2ludFxuXG52YXIgbWF0Y2ggPSByZXF1aXJlKCcuL21hdGNoLW1lZGlhJylcblxuLypcbiAqIENvbnN0cnVjdCBhIEJyZWFrcG9pbnQsIGdpdmVuIGEgbmFtZVxuICogYW5kIGEgbWVkaWEgcXVlcnkuXG4gKi9cbmZ1bmN0aW9uIEJyZWFrcG9pbnQobmFtZSwgbWVkaWEpIHtcbiAgdGhpcy5uYW1lID0gbmFtZVxuICB0aGlzLm1lZGlhID0gbWVkaWFcbiAgdGhpcy5tYXRjaGVzID0gbnVsbFxufVxuXG4vKlxuICogQ2hlY2sgaWYgdGhlIGJyZWFrcG9pbnQgaGFzIGJlZW4gZW50ZXJlZCwgZXhpdGVkIG9yIG5laXRoZXJcbiAqIFJldHVybiB2YWx1ZXM6IHRydWU9ZW50ZXJlZCwgZmFsc2U9ZXhpdGVkLCBudWxsPW5laXRoZXJcbiAqL1xuQnJlYWtwb2ludC5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbiAoKSB7XG5cbiAgLy8gVGhpcyBpcyB0aGUgZmlyc3QgY2hlY2tcbiAgaWYgKHRoaXMubWF0Y2hlcyA9PT0gbnVsbCkge1xuICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoKHRoaXMubWVkaWEpXG4gICAgcmV0dXJuIHRoaXMubWF0Y2hlc1xuICB9XG5cbiAgLy8gRm9yIGFsbCBzdWJzZXF1ZW50IGNoZWNrcyB0aGlzLm1hdGNoZXMgd2lsbCBiZSBzZXQgdG8gdHJ1ZVxuICAvLyBvciBmYWxzZSwgYW5kIHdpbGwgb25seSByZXR1cm4gYSBib29sZWFuIGlmIGEgY2hhbmdlIGhhcHBlbnNcblxuICBpZiAobWF0Y2godGhpcy5tZWRpYSkgJiYgIXRoaXMubWF0Y2hlcykge1xuICAgIHRoaXMubWF0Y2hlcyA9IHRydWVcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVzXG4gIH1cblxuICBpZiAoIW1hdGNoKHRoaXMubWVkaWEpICYmIHRoaXMubWF0Y2hlcykge1xuICAgIHRoaXMubWF0Y2hlcyA9IGZhbHNlXG4gICAgcmV0dXJuIHRoaXMubWF0Y2hlc1xuICB9XG5cbiAgcmV0dXJuIG51bGxcblxufVxuIiwiLyohIG1hdGNoTWVkaWEoKSBwb2x5ZmlsbCAtIFRlc3QgYSBDU1MgbWVkaWEgdHlwZS9xdWVyeSBpbiBKUy4gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2UgKi9cblxud2luZG93Lm1hdGNoTWVkaWEgfHwgKHdpbmRvdy5tYXRjaE1lZGlhID0gZnVuY3Rpb24oKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1hdGNoTWVkaXVtIGFwaSBzdWNoIGFzIElFIDkgYW5kIHdlYmtpdFxuICAgIHZhciBzdHlsZU1lZGlhID0gKHdpbmRvdy5zdHlsZU1lZGlhIHx8IHdpbmRvdy5tZWRpYSk7XG5cbiAgICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gICAgaWYgKCFzdHlsZU1lZGlhKSB7XG4gICAgICAgIHZhciBzdHlsZSAgICAgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgICAgICAgICBzY3JpcHQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICAgICAgICAgIGluZm8gICAgICAgID0gbnVsbDtcblxuICAgICAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgICAgIHN0eWxlLmlkICAgID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgICAgICBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAgICAgLy8gJ3N0eWxlLmN1cnJlbnRTdHlsZScgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnd2luZG93LmdldENvbXB1dGVkU3R5bGUnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgaW5mbyA9ICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG4gICAgICAgIHN0eWxlTWVkaWEgPSB7XG4gICAgICAgICAgICBtYXRjaE1lZGl1bTogZnVuY3Rpb24obWVkaWEpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGV4dCA9ICdAbWVkaWEgJyArIG1lZGlhICsgJ3sgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9JztcblxuICAgICAgICAgICAgICAgIC8vICdzdHlsZS5zdHlsZVNoZWV0JyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICdzdHlsZS50ZXh0Q29udGVudCcgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICAgICAgICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRleHQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBpbmZvLndpZHRoID09PSAnMXB4JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24obWVkaWEpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgICAgIH07XG4gICAgfTtcbn0oKSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IG1hdGNoXG5cbnJlcXVpcmUoJy4vbWF0Y2gtbWVkaWEtcG9seWZpbGwnKVxuXG52YXIgYnJvd3Nlck1hdGNoTWVkaWEgPSB3aW5kb3cubWF0Y2hNZWRpYSB8fCB3aW5kb3cubXNNYXRjaE1lZGlhXG5cbi8qXG4gKiBTaW1wbGlmaWNhdGlvbiBvZiB0aGUgd2luZG93Lm1hdGNoTWVkaWEgZnVuY3Rpb25cbiAqIHRvIHNpbXBseSB0YWtlIGEgbWVkaWEgcXVlcnkgYW5kIHJldHVybiBhIGJvb2xlYW4uXG4gKi9cbmZ1bmN0aW9uIG1hdGNoKG1xKSB7XG4gIGlmICghYnJvd3Nlck1hdGNoTWVkaWEpIHJldHVybiBmYWxzZVxuICB2YXIgcmVzdWx0ID0gYnJvd3Nlck1hdGNoTWVkaWEobXEpXG4gIHJldHVybiAhIXJlc3VsdCAmJiAhIXJlc3VsdC5tYXRjaGVzXG59XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwidmFyIGFwcCA9IHJlcXVpcmUoJy4vbGliL2FwcCcpKClcblxucmVxdWlyZSgnLi9saWIvaGVhZGVyLWRyb3Bkb3duJykoYXBwKVxucmVxdWlyZSgnLi9saWIvc2Nyb2xsLWxpbmtzJykoYXBwKVxucmVxdWlyZSgnLi9saWIvbWFwcycpKGFwcClcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciBhcHAgPVxuICAgIHsgJHdpbmRvdzogJCh3aW5kb3cpXG4gICAgLCAkaHRtbDogJCgnaHRtbCcpXG4gICAgLCAkbWFpbkNvbnRlbnQ6ICQoJy5qcy1tYWluLWNvbnRlbnQnKVxuICAgICwgJHBhZ2VXcmFwcGVyOiAkKCcuanMtcGFnZS13cmFwcGVyJylcbiAgICAsIHBhZ2U6ICQoJ2JvZHknKVswXS5jbGFzc05hbWVcbiAgICAsIGhlYWRlcjpcbiAgICAgIHsgJGVsOiAkKCcuanMtbWFpbi1oZWFkZXInKVxuICAgICAgLCBvdXRlckhlaWdodDogJCgnLmpzLW1haW4taGVhZGVyJykub3V0ZXJIZWlnaHQoKVxuICAgICAgfVxuICAgIH1cblxuICBhcHAud2luZG93ID1cbiAgICB7IHNjcm9sbFRvcDogYXBwLiR3aW5kb3cuc2Nyb2xsVG9wKClcbiAgICAsIGhlaWdodDogYXBwLiR3aW5kb3cuaGVpZ2h0KClcbiAgICAsIHdpZHRoOiBhcHAuJHdpbmRvdy53aWR0aCgpXG4gICAgfVxuXG4gIGFwcC5pc01vYmlsZSA9IChhcHAud2luZG93LndpZHRoIDwgNzAwKVxuXG4gIGFwcC4kd2luZG93Lm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgYXBwLndpbmRvdy5zY3JvbGxUb3AgPSAkKHRoaXMpLnNjcm9sbFRvcCgpXG4gIH0pXG5cbiAgYXBwLiR3aW5kb3cub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBhcHAud2luZG93LmhlaWdodCA9ICQodGhpcykuaGVpZ2h0KClcbiAgICBhcHAud2luZG93LndpZHRoID0gJCh0aGlzKS53aWR0aCgpXG4gICAgYXBwLmhlYWRlci5vdXRlckhlaWdodCA9IGFwcC5oZWFkZXIuJGVsLm91dGVySGVpZ2h0KClcbiAgICBhcHAuaXNNb2JpbGUgPSAoYXBwLndpbmRvdy53aWR0aCA8IDcwMClcbiAgfSlcblxuICByZXR1cm4gYXBwXG59XG4iLCJ2YXIgYnJlYWtwb2ludE1hbmFnZXIgPSByZXF1aXJlKCdicmVhaycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFwcCkge1xuXG5cbiAgLypcbiAgICpcbiAgICogVkFSSUFCTEVTXG4gICAqXG4gICAqL1xuICB2YXIgJGRyb3Bkb3duVG9nZ2xlcyA9ICQoJ1tkYXRhLWRyb3Bkb3duLXRhcmdldCE9XCJcIl1bZGF0YS1kcm9wZG93bi10YXJnZXRdJylcbiAgICAsIHRvZ2dsZUFjdGl2ZUNsYXNzID0gJ21haW4tbmF2X19pdGVtLS1kcm9wZG93bi1vcGVuJ1xuICAgICwgZHJvcGRvd25PcGVuID0gZmFsc2VcbiAgICAsICRjdXJyZW50QnV0dG9uID0gJydcbiAgICAsICRjdXJyZW50RHJvcGRvd24gPSAnJ1xuICAgICwgY3VycmVudERyb3Bkb3duVGFyZ2V0ID0gJydcbiAgICAsICRjdXJyZW50T2Zmc2V0SXRlbSA9ICcnXG5cblxuICAvKlxuICAgKlxuICAgKiBUT0dHTEUgTE9PUFxuICAgKlxuICAgKi9cbiAgJGRyb3Bkb3duVG9nZ2xlcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgIHZhciAkYnV0dG9uID0gJChlbClcbiAgICAgICwgZGF0YVRhcmdldCA9ICRidXR0b24uZGF0YSgnZHJvcGRvd25UYXJnZXQnKVxuICAgICAgLCAkZHJvcGRvd24gPSAkKCdbZGF0YS1kcm9wZG93bj1cIicgKyBkYXRhVGFyZ2V0ICsgJ1wiXScpXG4gICAgLy8gVG9nZ2xlIGV2ZW50XG4gICAgJGJ1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBpZiAoJGN1cnJlbnREcm9wZG93biA9PT0gJGRyb3Bkb3duKSB7XG4gICAgICAgIGNsb3NlRHJvcGRvd24oKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3BlbkRyb3Bkb3duKCRidXR0b24sICRkcm9wZG93biwgZGF0YVRhcmdldClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuXG5cbiAgLypcbiAgICpcbiAgICogQlJFQUtQT0lOVFNcbiAgICpcbiAgICovXG4gIHZhciBibSA9IGJyZWFrcG9pbnRNYW5hZ2VyKClcbiAgYm0uYWRkKCd0YWJsZXQnLCAnKG1pbi13aWR0aDogNzAwcHgpJylcbiAgYm0uYWRkKCdkZXNrdG9wJywgJyhtaW4td2lkdGg6IDEwNTBweCknKVxuICAvLyBSZXNpemUgZXZlbnRzXG4gIGJtLm9uKCdlbnRlcjp0YWJsZXQnLCB1cGRhdGVDc3NQcm9wcylcbiAgYm0ub24oJ2V4aXQ6dGFibGV0JywgdXBkYXRlQ3NzUHJvcHMpXG4gIGJtLm9uKCdlbnRlcjpkZXNrdG9wJywgdXBkYXRlQ3NzUHJvcHMpXG4gIGJtLm9uKCdleGl0OmRlc2t0b3AnLCB1cGRhdGVDc3NQcm9wcylcblxuXG4gIC8qXG4gICAqXG4gICAqIE9QRU4gRFJPUERPV05cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIG9wZW5Ecm9wZG93bigkYnV0dG9uLCAkZHJvcGRvd24sIHRhcmdldCkge1xuICAgIC8vIENsb3NlIG9wZW4gZHJvcGRvd24gZmlyc3RcbiAgICBpZiAoJGN1cnJlbnREcm9wZG93bi5sZW5ndGggIT09IDApIGNsb3NlRHJvcGRvd24oKVxuXG4gICAgLy8gSW50ZXJuYWwgdmFyaWFibGVzXG4gICAgZHJvcGRvd25PcGVuID0gdHJ1ZVxuICAgICRjdXJyZW50RHJvcGRvd24gPSAkZHJvcGRvd25cbiAgICBjdXJyZW50RHJvcGRvd25UYXJnZXQgPSB0YXJnZXRcbiAgICAkY3VycmVudEJ1dHRvbiA9ICRidXR0b25cblxuICAgIC8vIFNldCBDU1MgcHJvcGVydGllc1xuICAgIHVwZGF0ZUNzc1Byb3BzKClcblxuICAgIC8vIFRvZ2dsZSBhY3RpdmUgY2xhc3NcbiAgICAkY3VycmVudEJ1dHRvbi5hZGRDbGFzcyh0b2dnbGVBY3RpdmVDbGFzcylcbiAgICBvcGVuTmF2KClcbiAgfVxuXG5cbiAgLypcbiAgICpcbiAgICogQ0xPU0UgRFJPUERPV05cbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIGNsb3NlRHJvcGRvd24oKSB7XG4gICAgZHJvcGRvd25PcGVuID0gZmFsc2VcbiAgICAvLyBSZW1vdmUgQ1NTIGZyb20gb3BlbiBkcm9wZG93blxuICAgIHVuc2V0RHJvcGRvd25Dc3NQcm9wcygpXG4gICAgLy8gVG9nZ2xlIGNsYXNzZXNcbiAgICAkY3VycmVudEJ1dHRvbi5yZW1vdmVDbGFzcyh0b2dnbGVBY3RpdmVDbGFzcylcbiAgICAvLyBJbnRlcm5hbCB2YXJpYWJsZXNcbiAgICAkY3VycmVudERyb3Bkb3duID0gJydcbiAgICBpZiAoIWFwcC5pc01vYmlsZSkgY2xvc2VOYXYoKVxuICB9XG5cblxuICAvKlxuICAgKlxuICAgKiBVUERBVEUgRFJPUERPV04gQ1NTXG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiB1cGRhdGVDc3NQcm9wcygpIHtcbiAgICAvLyBTdG9wIGJyZWFrcG9pbnRzIGZpcmluZyB3aGVuIGRyb3Bkb3duIGlzIGNsb3NlZFxuICAgIGlmICghZHJvcGRvd25PcGVuKSByZXR1cm5cblxuICAgIC8vIFJlbW92ZSBDU1NcbiAgICBpZiAoJGN1cnJlbnRPZmZzZXRJdGVtLmxlbmd0aCAhPT0gMCkgdW5zZXREcm9wZG93bkNzc1Byb3BzKClcblxuICAgIC8vIFNldCBkZXNrdG9wIG9mZnNldCBpdGVtIHRvIGJlIDxoZWFkZXI+XG4gICAgJGN1cnJlbnRPZmZzZXRJdGVtID0gKCFhcHAuaXNNb2JpbGUpID8gYXBwLmhlYWRlci4kZWwgOiAkY3VycmVudEJ1dHRvblxuXG4gICAgLy8gRGVhY3RpdmF0ZSBtb2JpbGUgc2VhcmNoIGRyb3Bkb3duXG4gICAgdmFyIGlzU2VhcmNoID0gKGN1cnJlbnREcm9wZG93blRhcmdldCA9PT0gJ3NlYXJjaCcpXG4gICAgaWYgKGlzU2VhcmNoICYmIGFwcC5pc01vYmlsZSkgcmV0dXJuXG5cbiAgICAvLyBHZXQgcG9zaXRpb24gcHJvcGVydGllcyBiZWZvcmUgQ1NTXG4gICAgdmFyIG9mZnNldEl0ZW1Ub3AgPSAkY3VycmVudE9mZnNldEl0ZW0ub2Zmc2V0KCkudG9wXG4gICAgICAsIG9mZnNldEl0ZW1IZWlnaHQgPSAkY3VycmVudE9mZnNldEl0ZW0ub3V0ZXJIZWlnaHQoKVxuXG4gICAgLy8gU2V0IENTUyBtYXJnaW4tYm90dG9tIGZvciBjb250ZW50XG4gICAgJGN1cnJlbnRPZmZzZXRJdGVtLmNzcyh7ICdtYXJnaW5Cb3R0b20nIDogJGN1cnJlbnREcm9wZG93bi5vdXRlckhlaWdodCgpIH0pXG5cbiAgICAvLyBTZXQgQ1NTIHRvcCBmb3IgZHJvcGRvd25cbiAgICAvLyBUYWJsZXQvRGVza3RvcCBvZmZzZXQgc2hvdWxkIHNpdCBhdCBib3R0b20gb2YgaGVhZGVyXG4gICAgJGN1cnJlbnREcm9wZG93bi5jc3MoeyAndG9wJyA6IChvZmZzZXRJdGVtVG9wICsgb2Zmc2V0SXRlbUhlaWdodCksICdib3R0b20nIDogJ2F1dG8nIH0pXG5cbiAgfVxuXG5cbiAgLypcbiAgICpcbiAgICogUkVNT1ZFIERST1BET1dOIENTU1xuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gdW5zZXREcm9wZG93bkNzc1Byb3BzKCkge1xuICAgIGlmICghYXBwLmlzTW9iaWxlKSBhcHAuaGVhZGVyLiRlbC5jc3MoeyAnbWFyZ2luQm90dG9tJzogJzAnIH0pXG4gICAgJGN1cnJlbnRPZmZzZXRJdGVtLmNzcyh7ICdtYXJnaW5Cb3R0b20nOiAnMCcgfSlcbiAgICAkY3VycmVudERyb3Bkb3duLmNzcyh7ICd0b3AnIDogJ2F1dG8nLCAnYm90dG9tJyA6ICcxMDAlJyB9KVxuICB9XG5cblxuICAvKlxuICAgKlxuICAgKiBNT0JJTEUgTkFWSUdBVElPTlxuICAgKlxuICAgKi9cbiAgdmFyICRuYXZUb2dnbGUgPSAkKCcuanMtbW9iaWxlLW5hdi10b2dnbGUnKVxuICAgICwgJG5hdiA9ICQoJy5qcy1tYWluLW5hdicpXG4gICAgLCBhY3RpdmVDbGFzcyA9ICdtYWluLW5hdl9faXRlbXMtLW9wZW4nXG4gICAgLCBuYXZPcGVuXG5cbiAgJG5hdlRvZ2dsZS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG5hdk9wZW4pIGNsb3NlTmF2KClcbiAgICBlbHNlIG9wZW5OYXYoKVxuICB9KVxuXG4gIGZ1bmN0aW9uIG9wZW5OYXYoKSB7XG4gICAgbmF2T3BlbiA9IHRydWVcbiAgICAkbmF2LmFkZENsYXNzKGFjdGl2ZUNsYXNzKVxuICB9XG5cbiAgZnVuY3Rpb24gY2xvc2VOYXYoKSB7XG4gICAgbmF2T3BlbiA9IGZhbHNlXG4gICAgJG5hdi5yZW1vdmVDbGFzcyhhY3RpdmVDbGFzcylcbiAgICBpZiAoYXBwLmlzTW9iaWxlKSBjbG9zZURyb3Bkb3duKClcbiAgfVxufVxuIiwiLyogZ2xvYmFsIGdvb2dsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcHApIHtcbiAgdmFyICRtYXBFbCA9ICQoJy5qcy1jaHVyY2gtbWFwJylcblxuICBpZiAoJG1hcEVsLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgdmFyIGRpcmVjdGlvbnNEaXNwbGF5XG4gICAgLCBkaXJlY3Rpb25zU2VydmljZSA9IG5ldyBnb29nbGUubWFwcy5EaXJlY3Rpb25zU2VydmljZSgpXG4gICAgLCBjaHVyY2hNYXBcbiAgICAsIGNodXJjaE1hcmtlclxuICAgICwgJG1hcEluZm9Cb3ggPSAkKCcuanMtbWFwLWluZm8tY29udGFpbmVyJylcbiAgICAsIHdva2luZ2hhbVZpbmV5YXJkID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyg1MS4zNjMyNjUsIC0wLjc5NDA4NClcblxuICBmdW5jdGlvbiBpbml0TWFwKCkge1xuICAgIHZhciBtYXBPcHRpb25zID1cbiAgICAgICAgeyB6b29tOiAxMVxuICAgICAgICAsIGNlbnRlcjogd29raW5naGFtVmluZXlhcmRcbiAgICAgICAgfVxuICAgIGNodXJjaE1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoJG1hcEVsWzBdLCBtYXBPcHRpb25zIClcblxuICAgIC8vIEFkZCBjaHVyY2ggbWFya2VyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICB1cGRhdGVNYXBDZW50ZXIoKVxuICAgICAgY2h1cmNoTWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcihcbiAgICAgICAgeyBwb3NpdGlvbjogd29raW5naGFtVmluZXlhcmRcbiAgICAgICAgLCBtYXA6IGNodXJjaE1hcFxuICAgICAgICAsIHRpdGxlOiAnV29raW5naGFtIFZpbmV5YXJkJ1xuICAgICAgICAsIGljb246ICcvc3RhdGljL2ltYWdlcy9jb250ZW50L21hcC1tYXJrZXIucG5nJ1xuICAgICAgICAsIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1BcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0sIDIwMClcblxuICAgIC8vIFJlYWR5IGRpcmVjdGlvbnMgQVBJXG4gICAgZGlyZWN0aW9uc0Rpc3BsYXkgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1JlbmRlcmVyKClcbiAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXRNYXAoY2h1cmNoTWFwKVxuXG4gICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIoY2h1cmNoTWFwLCAnbG9hZCcsIHVwZGF0ZU1hcENlbnRlcilcbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcih3aW5kb3csICdyZXNpemUnLCB1cGRhdGVNYXBDZW50ZXIpXG4gIH1cbiAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIoIHdpbmRvdywgJ2xvYWQnLCBpbml0TWFwIClcblxuXG4gIGZ1bmN0aW9uIHVwZGF0ZU1hcENlbnRlciAoKSB7XG4gICAgdmFyIGNlbnRlciA9IGdldE1hcENlbnRlcigpXG4gICAgY2h1cmNoTWFwLnBhblRvKGNlbnRlcilcbiAgfVxuXG5cbiAgZnVuY3Rpb24gZ2V0TWFwQ2VudGVyKCkge1xuXG4gICAgaWYgKGFwcC5pc01vYmlsZSkge1xuICAgICAgcmV0dXJuIHdva2luZ2hhbVZpbmV5YXJkXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBpbmZvQm94V2lkdGggPSAkbWFwSW5mb0JveC5vdXRlcldpZHRoKClcbiAgICAgICAgLCBjZW50ZXJpbmdXaWR0aCA9ICRtYXBJbmZvQm94LnBhcmVudCgpLndpZHRoKClcbiAgICAgICAgLCBjZW50ZXJpbmdNaWQgPSBjZW50ZXJpbmdXaWR0aCAvIDJcbiAgICAgICAgLCBvZmZzZXRYID0gLShjZW50ZXJpbmdNaWQgLSAoKGNlbnRlcmluZ1dpZHRoIC0gaW5mb0JveFdpZHRoKSAvIDIpKVxuXG4gICAgICB2YXIgcG9pbnRYID0gb2Zmc2V0WCAvIE1hdGgucG93KDIsIGNodXJjaE1hcC5nZXRab29tKCkpXG4gICAgICAgICwgY3VyclBvaW50ID0gY2h1cmNoTWFwLmdldFByb2plY3Rpb24oKS5mcm9tTGF0TG5nVG9Qb2ludCh3b2tpbmdoYW1WaW5leWFyZClcbiAgICAgICAgLCBuZXdQb2ludCA9IG5ldyBnb29nbGUubWFwcy5Qb2ludChwb2ludFgsIDApXG5cbiAgICAgIHJldHVybiBjaHVyY2hNYXAuZ2V0UHJvamVjdGlvbigpLmZyb21Qb2ludFRvTGF0TG5nKFxuICAgICAgICBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoY3VyclBvaW50LnggLSBuZXdQb2ludC54LCBjdXJyUG9pbnQueSArIG5ld1BvaW50LnkpXG4gICAgICApXG4gICAgfVxuICAgfVxuXG5cblxuICAvLyBEaXJlY3Rpb25zXG4gIHZhciAkYnV0dG9uU2hvd0RpcmVjdGlvbnMgPSAkKCcuanMtYnV0dG9uLXNob3ctZGlyZWN0aW9ucycpXG4gICAgLCAkYnV0dG9uQ2xvc2VEaXJlY3Rpb25zID0gJCgnLmpzLWJ1dHRvbi1jbG9zZS1kaXJlY3Rpb25zJylcbiAgICAsICRmb3JtRGlyZWN0aW9ucyA9ICQoJy5qcy1tYXAtZGlyZWN0aW9ucycpXG4gICAgLCAkbWFwSW5mbyA9ICQoJy5qcy1tYXAtaW5mbycpXG4gICAgLCAkYWRkcmVzcyA9ICQoJy5qcy1tYXAtYWRkcmVzcycpXG5cbiAgJGJ1dHRvblNob3dEaXJlY3Rpb25zLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAkYnV0dG9uU2hvd0RpcmVjdGlvbnMuZmFkZU91dCgpXG4gICAgJG1hcEluZm8uZmFkZU91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkZm9ybURpcmVjdGlvbnMuZmFkZUluKClcbiAgICAgICRhZGRyZXNzLmZvY3VzKClcbiAgICB9KVxuICB9KVxuXG4gICRidXR0b25DbG9zZURpcmVjdGlvbnMub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldE1hcChudWxsKVxuICAgIHVwZGF0ZU1hcENlbnRlcigpXG4gICAgJGZvcm1EaXJlY3Rpb25zLmZhZGVPdXQoZnVuY3Rpb24gKCkge1xuICAgICAgJG1hcEluZm8uZmFkZUluKClcbiAgICAgICRidXR0b25TaG93RGlyZWN0aW9ucy5mYWRlSW4oKVxuICAgIH0pXG4gIH0pXG5cbiAgJGZvcm1EaXJlY3Rpb25zLm9uKCdzdWJtaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuXG4gICAgdmFyIHN0YXJ0ID0gJGFkZHJlc3MudmFsKClcbiAgICAgICwgZW5kID0gJ1dva2luZ2hhbSBWaW5leWFyZCwgVUsnXG4gICAgICAsIHJlcXVlc3QgPVxuICAgICAgICB7IG9yaWdpbjogc3RhcnRcbiAgICAgICAgLCBkZXN0aW5hdGlvbjogZW5kXG4gICAgICAgICwgdHJhdmVsTW9kZTogZ29vZ2xlLm1hcHMuVHJhdmVsTW9kZS5EUklWSU5HXG4gICAgICAgIH1cblxuICAgIC8vIEdldCBkaXJlY3Rpb25zIGZyb20gZ29vZ2xlXG4gICAgZGlyZWN0aW9uc1NlcnZpY2Uucm91dGUocmVxdWVzdCwgZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cykge1xuICAgICAgaWYgKHN0YXR1cyA9PT0gZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1N0YXR1cy5PSykge1xuICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXRNYXAoY2h1cmNoTWFwKVxuICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXREaXJlY3Rpb25zKHJlc3BvbnNlKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cblxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICQoJy5qcy1zY3JvbGwtbGluaycpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICQodGhpcykuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgdmFyIGhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKVxuICAgICAgICAsICR0YXJnZXQgPSAkKGhyZWYpLnBhcmVudHMoJ3NlY3Rpb24nKVxuICAgICAgICAsIHRhcmdldFNjcm9sbFRvcCA9ICR0YXJnZXQub2Zmc2V0KCkudG9wXG5cbiAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgJ3Njcm9sbFRvcCc6IHRhcmdldFNjcm9sbFRvcCB9KVxuXG4gICAgfSlcbiAgfSlcbn1cbiJdfQ==
