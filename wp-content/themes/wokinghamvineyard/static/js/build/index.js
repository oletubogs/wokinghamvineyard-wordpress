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
require('./lib/church-map')(app)
require('./lib/connect-group-map')(app)
require('./lib/vendor/lightbox')

},{"./lib/app":9,"./lib/church-map":10,"./lib/connect-group-map":11,"./lib/header-dropdown":12,"./lib/scroll-links":13,"./lib/vendor/lightbox":14}],9:[function(require,module,exports){
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
    , $buttonShowDirections = $('.js-button-show-directions')
    , $buttonCloseDirections = $('.js-button-close-directions')
    , $formDirections = $('.js-map-directions')
    , $mapInfo = $('.js-map-info')
    , $address = $('.js-map-address')
    , directionsOpen = false
    , routeBounds
    , mapOpenClass = 'map-info-container--directions-open'

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
        , icon: '/wp-content/themes/wokinghamvineyard/static/images/content/map-marker.png'
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

    if (directionsOpen) {
      churchMap.fitBounds(routeBounds)
      churchMap.setCenter(routeBounds.getCenter())
    } else if (app.isMobile) {
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

  $buttonShowDirections.on('click', function () {
    $buttonShowDirections.fadeOut()
    $mapInfo.fadeOut(function () {
      $formDirections.fadeIn()
      $address.focus()
    })
  })

  $buttonCloseDirections.on('click', function () {
    directionsDisplay.setMap(null)
    directionsOpen = false
    $mapInfoBox.removeClass(mapOpenClass)
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
        $mapInfoBox.addClass(mapOpenClass)
        directionsOpen = true
        routeBounds = response.routes[0].bounds
        directionsDisplay.setMap(churchMap)
        directionsDisplay.setDirections(response)
      }
    })
  })


}

},{}],11:[function(require,module,exports){
/* global google */

module.exports = function (app) {
  var $mapEl = $('.js-connect-group-map')

  if ($mapEl.length === 0) return

  var cgMap
    , marker
    , centerLatLng = new google.maps.LatLng($mapEl.data('lat'), $mapEl.data('lng'))

  function initMap() {
    var mapOptions =
        { zoom: 13
        , center: centerLatLng
        }
    cgMap = new google.maps.Map($mapEl[0], mapOptions )

    // Add church marker
    setTimeout(function () {
      updateMapCenter()
      marker = new google.maps.Marker(
        { position: centerLatLng
        , map: cgMap
        , title: 'Wokingham Vineyard'
        , icon: '/wp-content/themes/wokinghamvineyard/static/images/content/map-marker.png'
        , animation: google.maps.Animation.DROP
        }
      )
    }, 200)

    google.maps.event.addDomListener(cgMap, 'load', updateMapCenter)
    google.maps.event.addDomListener(window, 'resize', updateMapCenter)
  }
  google.maps.event.addDomListener( window, 'load', initMap )


  function updateMapCenter () {
    var center = centerLatLng
    cgMap.panTo(center)
  }

}

},{}],12:[function(require,module,exports){
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

},{"break":1}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9ub2RlX21vZHVsZXMvYnJlYWsvYnJlYWsuanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9ub2RlX21vZHVsZXMvYnJlYWsvYnJlYWtwb2ludC5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icmVhay9tYXRjaC1tZWRpYS1wb2x5ZmlsbC5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icmVhay9tYXRjaC1tZWRpYS5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icmVhay9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwiL1VzZXJzL25pY2twL0Ryb3Bib3gvQ2h1cmNoL0RpZ2l0YWwvV2Vic2l0ZS9hcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9uaWNrcC9Ecm9wYm94L0NodXJjaC9EaWdpdGFsL1dlYnNpdGUvYXBwL3NvdXJjZS9zdGF0aWMvanMvaW5kZXguanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9zb3VyY2Uvc3RhdGljL2pzL2xpYi9hcHAuanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9zb3VyY2Uvc3RhdGljL2pzL2xpYi9jaHVyY2gtbWFwLmpzIiwiL1VzZXJzL25pY2twL0Ryb3Bib3gvQ2h1cmNoL0RpZ2l0YWwvV2Vic2l0ZS9hcHAvc291cmNlL3N0YXRpYy9qcy9saWIvY29ubmVjdC1ncm91cC1tYXAuanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9zb3VyY2Uvc3RhdGljL2pzL2xpYi9oZWFkZXItZHJvcGRvd24uanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9zb3VyY2Uvc3RhdGljL2pzL2xpYi9zY3JvbGwtbGlua3MuanMiLCIvVXNlcnMvbmlja3AvRHJvcGJveC9DaHVyY2gvRGlnaXRhbC9XZWJzaXRlL2FwcC9zb3VyY2Uvc3RhdGljL2pzL2xpYi92ZW5kb3IvbGlnaHRib3guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUJyZWFrcG9pbnRNYW5hZ2VyXG5tb2R1bGUuZXhwb3J0cy5CcmVha3BvaW50TWFuYWdlciA9IEJyZWFrcG9pbnRNYW5hZ2VyXG5cbi8qXG4gKiBNYWluIHVzZSBjYXNlOiBpbnN0YW50aWF0ZSBhbmQgc3RhcnRcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQnJlYWtwb2ludE1hbmFnZXIoKSB7XG4gIHZhciBibSA9IG5ldyBCcmVha3BvaW50TWFuYWdlcigpXG4gIGJtLnN0YXJ0KClcbiAgcmV0dXJuIGJtXG59XG5cbnZhciBCcmVha3BvaW50ID0gcmVxdWlyZSgnLi9icmVha3BvaW50JylcbiAgLCBFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyXG4gICwgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpXG4gICwgbWF0Y2ggPSByZXF1aXJlKCcuL21hdGNoLW1lZGlhJylcblxuZnVuY3Rpb24gQnJlYWtwb2ludE1hbmFnZXIoKSB7XG4gIC8vIENhbGwgRW1pdHRlciBjb25zdHJ1Y3RvclxuICBFbWl0dGVyLmNhbGwodGhpcylcbiAgLy8gU3RvcmUgYSBsaXN0IG9mIGJyZWFrcG9pbnRzIHRvIHdhdGNoXG4gIHRoaXMuYnJlYWtwb2ludHMgPSBbXVxufVxuXG4vLyBCYWNrd2FyZHMgY29tcGF0aWJsZSBpbmhlcml0YW5jZSAoaW5jbHVkZXMgRVMzIGVudnMpXG5pbmhlcml0cyhCcmVha3BvaW50TWFuYWdlciwgRW1pdHRlcilcblxuLypcbiAqIEFkZCBhIGJyZWFrcG9pbnRcbiAqL1xuQnJlYWtwb2ludE1hbmFnZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChuYW1lLCBtZWRpYSkge1xuICAvLyBPbmx5IHJ1biBvbiBicm93c2VycyB0aGF0IHN1cHBvcnQgbWVkaWEgcXVlcmllc1xuICBpZiAoIW1hdGNoKCdvbmx5IGFsbCcpKSByZXR1cm5cbiAgdmFyIGJyZWFrcG9pbnQgPSBuZXcgQnJlYWtwb2ludChuYW1lLCBtZWRpYSlcbiAgdGhpcy5icmVha3BvaW50cy5wdXNoKGJyZWFrcG9pbnQpXG4gIHByb2Nlc3MubmV4dFRpY2sodGhpcy5jaGVja1NpbmdsZS5iaW5kKHRoaXMsIGJyZWFrcG9pbnQpKVxufVxuXG4vKlxuICogUnVuIGEgZnVuY3Rpb24gaWYgbWVkaWEgcXVlcmllcyBhcmUgbm90IHN1cHBvcnRlZFxuICovXG5CcmVha3BvaW50TWFuYWdlci5wcm90b3R5cGUuZmFsbGJhY2sgPSBmdW5jdGlvbiAoZm4pIHtcbiAgLy8gT25seSBydW4gb24gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1lZGlhIHF1ZXJpZXNcbiAgaWYgKG1hdGNoKCdvbmx5IGFsbCcpKSByZXR1cm5cbiAgZm4oKVxufVxuXG4vKlxuICogU3RhcnQgbGlzdGVuaW5nIHRvIHdpbmRvdyNyZXNpemUgYW5kIGZpcmluZyBldmVudHNcbiAqL1xuQnJlYWtwb2ludE1hbmFnZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAvLyBPbmx5IGFkZCB0aGUgbGlzdGVuZXIgaWYgbWF0Y2hNZWRpYSBpcyBzdXBwb3J0ZWRcbiAgaWYgKCFtYXRjaCgnb25seSBhbGwnKSkgcmV0dXJuXG4gIHRoaXMuX2JvdW5kQ2hlY2sgPSB0aGlzLmNoZWNrLmJpbmQodGhpcylcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2JvdW5kQ2hlY2spXG4gIHRoaXMuY2hlY2soKVxufVxuXG4vKlxuICogU3RvcCBsaXN0ZW5pbmcgdG8gd2luZG93I3Jlc2l6ZVxuICovXG5CcmVha3BvaW50TWFuYWdlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2JvdW5kQ2hlY2spIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9ib3VuZENoZWNrKVxufVxuXG4vKlxuICogQ2hlY2sgZWFjaCBicmVha3BvaW50XG4gKi9cbkJyZWFrcG9pbnRNYW5hZ2VyLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5icmVha3BvaW50cy5mb3JFYWNoKHRoaXMuY2hlY2tTaW5nbGUuYmluZCh0aGlzKSlcbn1cblxuLypcbiAqIENoZWNrIGEgc2luZ2xlIGJyZWFrcG9pbnRcbiAqL1xuQnJlYWtwb2ludE1hbmFnZXIucHJvdG90eXBlLmNoZWNrU2luZ2xlID0gZnVuY3Rpb24gKGJyZWFrcG9pbnQpIHtcbiAgc3dpdGNoIChicmVha3BvaW50LmNoZWNrKCkpIHtcbiAgY2FzZSB0cnVlOlxuICAgIHJldHVybiB0aGlzLmVtaXQoJ2VudGVyOicgKyBicmVha3BvaW50Lm5hbWUpXG4gIGNhc2UgZmFsc2U6XG4gICAgcmV0dXJuIHRoaXMuZW1pdCgnZXhpdDonICsgYnJlYWtwb2ludC5uYW1lKVxuICBjYXNlIG51bGw6XG4gICAgcmV0dXJuXG4gIH1cbn1cblxuLypcbiAqIE92ZXJyaWRlIHRoZSBldmVudCBlbWl0dGVyJ3Mgb24oKSBmdW5jdGlvbiB0byB0YWtlIGEgM3JkIGFyZ3VtZW50XG4gKiAtIGEgZmxhZyBhcyB0byB3aGV0aGVyIHRoZSBwcm92aWRlZCBmbiBzaG91bGQgYmUgcnVuIGlmIG1lZGlhIHF1ZXJpZXNcbiAqIGFyZSBub3QgYXZhaWxhYmxlLlxuICovXG5CcmVha3BvaW50TWFuYWdlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAoZXZlbnQsIGZuLCBpc0ZhbGxiYWNrKSB7XG4gIEVtaXR0ZXIucHJvdG90eXBlLm9uLmNhbGwodGhpcywgZXZlbnQsIGZuKVxuICBpZiAoaXNGYWxsYmFjaykgdGhpcy5mYWxsYmFjayhmbilcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJGV2FBU0hcIikpIiwibW9kdWxlLmV4cG9ydHMgPSBCcmVha3BvaW50XG5cbnZhciBtYXRjaCA9IHJlcXVpcmUoJy4vbWF0Y2gtbWVkaWEnKVxuXG4vKlxuICogQ29uc3RydWN0IGEgQnJlYWtwb2ludCwgZ2l2ZW4gYSBuYW1lXG4gKiBhbmQgYSBtZWRpYSBxdWVyeS5cbiAqL1xuZnVuY3Rpb24gQnJlYWtwb2ludChuYW1lLCBtZWRpYSkge1xuICB0aGlzLm5hbWUgPSBuYW1lXG4gIHRoaXMubWVkaWEgPSBtZWRpYVxuICB0aGlzLm1hdGNoZXMgPSBudWxsXG59XG5cbi8qXG4gKiBDaGVjayBpZiB0aGUgYnJlYWtwb2ludCBoYXMgYmVlbiBlbnRlcmVkLCBleGl0ZWQgb3IgbmVpdGhlclxuICogUmV0dXJuIHZhbHVlczogdHJ1ZT1lbnRlcmVkLCBmYWxzZT1leGl0ZWQsIG51bGw9bmVpdGhlclxuICovXG5CcmVha3BvaW50LnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uICgpIHtcblxuICAvLyBUaGlzIGlzIHRoZSBmaXJzdCBjaGVja1xuICBpZiAodGhpcy5tYXRjaGVzID09PSBudWxsKSB7XG4gICAgdGhpcy5tYXRjaGVzID0gbWF0Y2godGhpcy5tZWRpYSlcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVzXG4gIH1cblxuICAvLyBGb3IgYWxsIHN1YnNlcXVlbnQgY2hlY2tzIHRoaXMubWF0Y2hlcyB3aWxsIGJlIHNldCB0byB0cnVlXG4gIC8vIG9yIGZhbHNlLCBhbmQgd2lsbCBvbmx5IHJldHVybiBhIGJvb2xlYW4gaWYgYSBjaGFuZ2UgaGFwcGVuc1xuXG4gIGlmIChtYXRjaCh0aGlzLm1lZGlhKSAmJiAhdGhpcy5tYXRjaGVzKSB7XG4gICAgdGhpcy5tYXRjaGVzID0gdHJ1ZVxuICAgIHJldHVybiB0aGlzLm1hdGNoZXNcbiAgfVxuXG4gIGlmICghbWF0Y2godGhpcy5tZWRpYSkgJiYgdGhpcy5tYXRjaGVzKSB7XG4gICAgdGhpcy5tYXRjaGVzID0gZmFsc2VcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVzXG4gIH1cblxuICByZXR1cm4gbnVsbFxuXG59XG4iLCIvKiEgbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLiBBdXRob3JzICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLCBQYXVsIElyaXNoLCBOaWNob2xhcyBaYWthcywgRGF2aWQgS25pZ2h0LiBEdWFsIE1JVC9CU0QgbGljZW5zZSAqL1xuXG53aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XG4gICAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAgIC8vIEZvciB0aG9zZSB0aGF0IGRvbid0IHN1cHBvcnQgbWF0Y2hNZWRpdW1cbiAgICBpZiAoIXN0eWxlTWVkaWEpIHtcbiAgICAgICAgdmFyIHN0eWxlICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICAgICAgICAgIHNjcmlwdCAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdLFxuICAgICAgICAgICAgaW5mbyAgICAgICAgPSBudWxsO1xuXG4gICAgICAgIHN0eWxlLnR5cGUgID0gJ3RleHQvY3NzJztcbiAgICAgICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgICAgIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuICAgICAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICBpbmZvID0gKCdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cpICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICAgICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgICAgICAgIG1hdGNoTWVkaXVtOiBmdW5jdGlvbihtZWRpYSkge1xuICAgICAgICAgICAgICAgIHZhciB0ZXh0ID0gJ0BtZWRpYSAnICsgbWVkaWEgKyAneyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH0nO1xuXG4gICAgICAgICAgICAgICAgLy8gJ3N0eWxlLnN0eWxlU2hlZXQnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3N0eWxlLnRleHRDb250ZW50JyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICAgICAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVGVzdCBpZiBtZWRpYSBxdWVyeSBpcyB0cnVlIG9yIGZhbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZm8ud2lkdGggPT09ICcxcHgnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbihtZWRpYSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWF0Y2hlczogc3R5bGVNZWRpYS5tYXRjaE1lZGl1bShtZWRpYSB8fCAnYWxsJyksXG4gICAgICAgICAgICBtZWRpYTogbWVkaWEgfHwgJ2FsbCdcbiAgICAgICAgfTtcbiAgICB9O1xufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gbWF0Y2hcblxucmVxdWlyZSgnLi9tYXRjaC1tZWRpYS1wb2x5ZmlsbCcpXG5cbnZhciBicm93c2VyTWF0Y2hNZWRpYSA9IHdpbmRvdy5tYXRjaE1lZGlhIHx8IHdpbmRvdy5tc01hdGNoTWVkaWFcblxuLypcbiAqIFNpbXBsaWZpY2F0aW9uIG9mIHRoZSB3aW5kb3cubWF0Y2hNZWRpYSBmdW5jdGlvblxuICogdG8gc2ltcGx5IHRha2UgYSBtZWRpYSBxdWVyeSBhbmQgcmV0dXJuIGEgYm9vbGVhbi5cbiAqL1xuZnVuY3Rpb24gbWF0Y2gobXEpIHtcbiAgaWYgKCFicm93c2VyTWF0Y2hNZWRpYSkgcmV0dXJuIGZhbHNlXG4gIHZhciByZXN1bHQgPSBicm93c2VyTWF0Y2hNZWRpYShtcSlcbiAgcmV0dXJuICEhcmVzdWx0ICYmICEhcmVzdWx0Lm1hdGNoZXNcbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJ2YXIgYXBwID0gcmVxdWlyZSgnLi9saWIvYXBwJykoKVxuXG5yZXF1aXJlKCcuL2xpYi9oZWFkZXItZHJvcGRvd24nKShhcHApXG5yZXF1aXJlKCcuL2xpYi9zY3JvbGwtbGlua3MnKShhcHApXG5yZXF1aXJlKCcuL2xpYi9jaHVyY2gtbWFwJykoYXBwKVxucmVxdWlyZSgnLi9saWIvY29ubmVjdC1ncm91cC1tYXAnKShhcHApXG5yZXF1aXJlKCcuL2xpYi92ZW5kb3IvbGlnaHRib3gnKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGFwcCA9XG4gICAgeyAkd2luZG93OiAkKHdpbmRvdylcbiAgICAsICRodG1sOiAkKCdodG1sJylcbiAgICAsICRtYWluQ29udGVudDogJCgnLmpzLW1haW4tY29udGVudCcpXG4gICAgLCAkcGFnZVdyYXBwZXI6ICQoJy5qcy1wYWdlLXdyYXBwZXInKVxuICAgICwgcGFnZTogJCgnYm9keScpWzBdLmNsYXNzTmFtZVxuICAgICwgaGVhZGVyOlxuICAgICAgeyAkZWw6ICQoJy5qcy1tYWluLWhlYWRlcicpXG4gICAgICAsIG91dGVySGVpZ2h0OiAkKCcuanMtbWFpbi1oZWFkZXInKS5vdXRlckhlaWdodCgpXG4gICAgICB9XG4gICAgfVxuXG4gIGFwcC53aW5kb3cgPVxuICAgIHsgc2Nyb2xsVG9wOiBhcHAuJHdpbmRvdy5zY3JvbGxUb3AoKVxuICAgICwgaGVpZ2h0OiBhcHAuJHdpbmRvdy5oZWlnaHQoKVxuICAgICwgd2lkdGg6IGFwcC4kd2luZG93LndpZHRoKClcbiAgICB9XG5cbiAgYXBwLmlzTW9iaWxlID0gKGFwcC53aW5kb3cud2lkdGggPCA3MDApXG5cbiAgYXBwLiR3aW5kb3cub24oJ3Njcm9sbCcsIGZ1bmN0aW9uICgpIHtcbiAgICBhcHAud2luZG93LnNjcm9sbFRvcCA9ICQodGhpcykuc2Nyb2xsVG9wKClcbiAgfSlcblxuICBhcHAuJHdpbmRvdy5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgIGFwcC53aW5kb3cuaGVpZ2h0ID0gJCh0aGlzKS5oZWlnaHQoKVxuICAgIGFwcC53aW5kb3cud2lkdGggPSAkKHRoaXMpLndpZHRoKClcbiAgICBhcHAuaGVhZGVyLm91dGVySGVpZ2h0ID0gYXBwLmhlYWRlci4kZWwub3V0ZXJIZWlnaHQoKVxuICAgIGFwcC5pc01vYmlsZSA9IChhcHAud2luZG93LndpZHRoIDwgNzAwKVxuICB9KVxuXG4gIHJldHVybiBhcHBcbn1cbiIsIi8qIGdsb2JhbCBnb29nbGUgKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXBwKSB7XG4gIHZhciAkbWFwRWwgPSAkKCcuanMtY2h1cmNoLW1hcCcpXG5cbiAgaWYgKCRtYXBFbC5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIHZhciBkaXJlY3Rpb25zRGlzcGxheVxuICAgICwgZGlyZWN0aW9uc1NlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1NlcnZpY2UoKVxuICAgICwgY2h1cmNoTWFwXG4gICAgLCBjaHVyY2hNYXJrZXJcbiAgICAsICRtYXBJbmZvQm94ID0gJCgnLmpzLW1hcC1pbmZvLWNvbnRhaW5lcicpXG4gICAgLCB3b2tpbmdoYW1WaW5leWFyZCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoNTEuMzYzMjY1LCAtMC43OTQwODQpXG4gICAgLCAkYnV0dG9uU2hvd0RpcmVjdGlvbnMgPSAkKCcuanMtYnV0dG9uLXNob3ctZGlyZWN0aW9ucycpXG4gICAgLCAkYnV0dG9uQ2xvc2VEaXJlY3Rpb25zID0gJCgnLmpzLWJ1dHRvbi1jbG9zZS1kaXJlY3Rpb25zJylcbiAgICAsICRmb3JtRGlyZWN0aW9ucyA9ICQoJy5qcy1tYXAtZGlyZWN0aW9ucycpXG4gICAgLCAkbWFwSW5mbyA9ICQoJy5qcy1tYXAtaW5mbycpXG4gICAgLCAkYWRkcmVzcyA9ICQoJy5qcy1tYXAtYWRkcmVzcycpXG4gICAgLCBkaXJlY3Rpb25zT3BlbiA9IGZhbHNlXG4gICAgLCByb3V0ZUJvdW5kc1xuICAgICwgbWFwT3BlbkNsYXNzID0gJ21hcC1pbmZvLWNvbnRhaW5lci0tZGlyZWN0aW9ucy1vcGVuJ1xuXG4gIGZ1bmN0aW9uIGluaXRNYXAoKSB7XG4gICAgdmFyIG1hcE9wdGlvbnMgPVxuICAgICAgICB7IHpvb206IDExXG4gICAgICAgICwgY2VudGVyOiB3b2tpbmdoYW1WaW5leWFyZFxuICAgICAgICB9XG4gICAgY2h1cmNoTWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCgkbWFwRWxbMF0sIG1hcE9wdGlvbnMgKVxuXG4gICAgLy8gQWRkIGNodXJjaCBtYXJrZXJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHVwZGF0ZU1hcENlbnRlcigpXG4gICAgICBjaHVyY2hNYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKFxuICAgICAgICB7IHBvc2l0aW9uOiB3b2tpbmdoYW1WaW5leWFyZFxuICAgICAgICAsIG1hcDogY2h1cmNoTWFwXG4gICAgICAgICwgdGl0bGU6ICdXb2tpbmdoYW0gVmluZXlhcmQnXG4gICAgICAgICwgaWNvbjogJy93cC1jb250ZW50L3RoZW1lcy93b2tpbmdoYW12aW5leWFyZC9zdGF0aWMvaW1hZ2VzL2NvbnRlbnQvbWFwLW1hcmtlci5wbmcnXG4gICAgICAgICwgYW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUFxuICAgICAgICB9XG4gICAgICApXG4gICAgfSwgMjAwKVxuXG4gICAgLy8gUmVhZHkgZGlyZWN0aW9ucyBBUElcbiAgICBkaXJlY3Rpb25zRGlzcGxheSA9IG5ldyBnb29nbGUubWFwcy5EaXJlY3Rpb25zUmVuZGVyZXIoKVxuICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldE1hcChjaHVyY2hNYXApXG5cbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcihjaHVyY2hNYXAsICdsb2FkJywgdXBkYXRlTWFwQ2VudGVyKVxuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHdpbmRvdywgJ3Jlc2l6ZScsIHVwZGF0ZU1hcENlbnRlcilcbiAgfVxuICBnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lciggd2luZG93LCAnbG9hZCcsIGluaXRNYXAgKVxuXG5cbiAgZnVuY3Rpb24gdXBkYXRlTWFwQ2VudGVyICgpIHtcbiAgICB2YXIgY2VudGVyID0gZ2V0TWFwQ2VudGVyKClcbiAgICBjaHVyY2hNYXAucGFuVG8oY2VudGVyKVxuICB9XG5cblxuICBmdW5jdGlvbiBnZXRNYXBDZW50ZXIoKSB7XG5cbiAgICBpZiAoZGlyZWN0aW9uc09wZW4pIHtcbiAgICAgIGNodXJjaE1hcC5maXRCb3VuZHMocm91dGVCb3VuZHMpXG4gICAgICBjaHVyY2hNYXAuc2V0Q2VudGVyKHJvdXRlQm91bmRzLmdldENlbnRlcigpKVxuICAgIH0gZWxzZSBpZiAoYXBwLmlzTW9iaWxlKSB7XG4gICAgICByZXR1cm4gd29raW5naGFtVmluZXlhcmRcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGluZm9Cb3hXaWR0aCA9ICRtYXBJbmZvQm94Lm91dGVyV2lkdGgoKVxuICAgICAgICAsIGNlbnRlcmluZ1dpZHRoID0gJG1hcEluZm9Cb3gucGFyZW50KCkud2lkdGgoKVxuICAgICAgICAsIGNlbnRlcmluZ01pZCA9IGNlbnRlcmluZ1dpZHRoIC8gMlxuICAgICAgICAsIG9mZnNldFggPSAtKGNlbnRlcmluZ01pZCAtICgoY2VudGVyaW5nV2lkdGggLSBpbmZvQm94V2lkdGgpIC8gMikpXG5cbiAgICAgIHZhciBwb2ludFggPSBvZmZzZXRYIC8gTWF0aC5wb3coMiwgY2h1cmNoTWFwLmdldFpvb20oKSlcbiAgICAgICAgLCBjdXJyUG9pbnQgPSBjaHVyY2hNYXAuZ2V0UHJvamVjdGlvbigpLmZyb21MYXRMbmdUb1BvaW50KHdva2luZ2hhbVZpbmV5YXJkKVxuICAgICAgICAsIG5ld1BvaW50ID0gbmV3IGdvb2dsZS5tYXBzLlBvaW50KHBvaW50WCwgMClcblxuICAgICAgcmV0dXJuIGNodXJjaE1hcC5nZXRQcm9qZWN0aW9uKCkuZnJvbVBvaW50VG9MYXRMbmcoXG4gICAgICAgIG5ldyBnb29nbGUubWFwcy5Qb2ludChjdXJyUG9pbnQueCAtIG5ld1BvaW50LngsIGN1cnJQb2ludC55ICsgbmV3UG9pbnQueSlcbiAgICAgIClcbiAgICB9XG4gICB9XG5cbiAgJGJ1dHRvblNob3dEaXJlY3Rpb25zLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAkYnV0dG9uU2hvd0RpcmVjdGlvbnMuZmFkZU91dCgpXG4gICAgJG1hcEluZm8uZmFkZU91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkZm9ybURpcmVjdGlvbnMuZmFkZUluKClcbiAgICAgICRhZGRyZXNzLmZvY3VzKClcbiAgICB9KVxuICB9KVxuXG4gICRidXR0b25DbG9zZURpcmVjdGlvbnMub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldE1hcChudWxsKVxuICAgIGRpcmVjdGlvbnNPcGVuID0gZmFsc2VcbiAgICAkbWFwSW5mb0JveC5yZW1vdmVDbGFzcyhtYXBPcGVuQ2xhc3MpXG4gICAgdXBkYXRlTWFwQ2VudGVyKClcbiAgICAkZm9ybURpcmVjdGlvbnMuZmFkZU91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkbWFwSW5mby5mYWRlSW4oKVxuICAgICAgJGJ1dHRvblNob3dEaXJlY3Rpb25zLmZhZGVJbigpXG4gICAgfSlcbiAgfSlcblxuICAkZm9ybURpcmVjdGlvbnMub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICB2YXIgc3RhcnQgPSAkYWRkcmVzcy52YWwoKVxuICAgICAgLCBlbmQgPSAnV29raW5naGFtIFZpbmV5YXJkLCBVSydcbiAgICAgICwgcmVxdWVzdCA9XG4gICAgICAgIHsgb3JpZ2luOiBzdGFydFxuICAgICAgICAsIGRlc3RpbmF0aW9uOiBlbmRcbiAgICAgICAgLCB0cmF2ZWxNb2RlOiBnb29nbGUubWFwcy5UcmF2ZWxNb2RlLkRSSVZJTkdcbiAgICAgICAgfVxuXG4gICAgLy8gR2V0IGRpcmVjdGlvbnMgZnJvbSBnb29nbGVcbiAgICBkaXJlY3Rpb25zU2VydmljZS5yb3V0ZShyZXF1ZXN0LCBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzKSB7XG4gICAgICBpZiAoc3RhdHVzID09PSBnb29nbGUubWFwcy5EaXJlY3Rpb25zU3RhdHVzLk9LKSB7XG4gICAgICAgICRtYXBJbmZvQm94LmFkZENsYXNzKG1hcE9wZW5DbGFzcylcbiAgICAgICAgZGlyZWN0aW9uc09wZW4gPSB0cnVlXG4gICAgICAgIHJvdXRlQm91bmRzID0gcmVzcG9uc2Uucm91dGVzWzBdLmJvdW5kc1xuICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXRNYXAoY2h1cmNoTWFwKVxuICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXREaXJlY3Rpb25zKHJlc3BvbnNlKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cblxufVxuIiwiLyogZ2xvYmFsIGdvb2dsZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcHApIHtcbiAgdmFyICRtYXBFbCA9ICQoJy5qcy1jb25uZWN0LWdyb3VwLW1hcCcpXG5cbiAgaWYgKCRtYXBFbC5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIHZhciBjZ01hcFxuICAgICwgbWFya2VyXG4gICAgLCBjZW50ZXJMYXRMbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKCRtYXBFbC5kYXRhKCdsYXQnKSwgJG1hcEVsLmRhdGEoJ2xuZycpKVxuXG4gIGZ1bmN0aW9uIGluaXRNYXAoKSB7XG4gICAgdmFyIG1hcE9wdGlvbnMgPVxuICAgICAgICB7IHpvb206IDEzXG4gICAgICAgICwgY2VudGVyOiBjZW50ZXJMYXRMbmdcbiAgICAgICAgfVxuICAgIGNnTWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcCgkbWFwRWxbMF0sIG1hcE9wdGlvbnMgKVxuXG4gICAgLy8gQWRkIGNodXJjaCBtYXJrZXJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIHVwZGF0ZU1hcENlbnRlcigpXG4gICAgICBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKFxuICAgICAgICB7IHBvc2l0aW9uOiBjZW50ZXJMYXRMbmdcbiAgICAgICAgLCBtYXA6IGNnTWFwXG4gICAgICAgICwgdGl0bGU6ICdXb2tpbmdoYW0gVmluZXlhcmQnXG4gICAgICAgICwgaWNvbjogJy93cC1jb250ZW50L3RoZW1lcy93b2tpbmdoYW12aW5leWFyZC9zdGF0aWMvaW1hZ2VzL2NvbnRlbnQvbWFwLW1hcmtlci5wbmcnXG4gICAgICAgICwgYW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUFxuICAgICAgICB9XG4gICAgICApXG4gICAgfSwgMjAwKVxuXG4gICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkRG9tTGlzdGVuZXIoY2dNYXAsICdsb2FkJywgdXBkYXRlTWFwQ2VudGVyKVxuICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHdpbmRvdywgJ3Jlc2l6ZScsIHVwZGF0ZU1hcENlbnRlcilcbiAgfVxuICBnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lciggd2luZG93LCAnbG9hZCcsIGluaXRNYXAgKVxuXG5cbiAgZnVuY3Rpb24gdXBkYXRlTWFwQ2VudGVyICgpIHtcbiAgICB2YXIgY2VudGVyID0gY2VudGVyTGF0TG5nXG4gICAgY2dNYXAucGFuVG8oY2VudGVyKVxuICB9XG5cbn1cbiIsInZhciBicmVha3BvaW50TWFuYWdlciA9IHJlcXVpcmUoJ2JyZWFrJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXBwKSB7XG5cblxuICAvKlxuICAgKlxuICAgKiBWQVJJQUJMRVNcbiAgICpcbiAgICovXG4gIHZhciAkZHJvcGRvd25Ub2dnbGVzID0gJCgnW2RhdGEtZHJvcGRvd24tdGFyZ2V0IT1cIlwiXVtkYXRhLWRyb3Bkb3duLXRhcmdldF0nKVxuICAgICwgdG9nZ2xlQWN0aXZlQ2xhc3MgPSAnbWFpbi1uYXZfX2l0ZW0tLWRyb3Bkb3duLW9wZW4nXG4gICAgLCBkcm9wZG93bk9wZW4gPSBmYWxzZVxuICAgICwgJGN1cnJlbnRCdXR0b24gPSAnJ1xuICAgICwgJGN1cnJlbnREcm9wZG93biA9ICcnXG4gICAgLCBjdXJyZW50RHJvcGRvd25UYXJnZXQgPSAnJ1xuICAgICwgJGN1cnJlbnRPZmZzZXRJdGVtID0gJydcblxuXG4gIC8qXG4gICAqXG4gICAqIFRPR0dMRSBMT09QXG4gICAqXG4gICAqL1xuICAkZHJvcGRvd25Ub2dnbGVzLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgdmFyICRidXR0b24gPSAkKGVsKVxuICAgICAgLCBkYXRhVGFyZ2V0ID0gJGJ1dHRvbi5kYXRhKCdkcm9wZG93blRhcmdldCcpXG4gICAgICAsICRkcm9wZG93biA9ICQoJ1tkYXRhLWRyb3Bkb3duPVwiJyArIGRhdGFUYXJnZXQgKyAnXCJdJylcbiAgICAvLyBUb2dnbGUgZXZlbnRcbiAgICAkYnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGlmICgkY3VycmVudERyb3Bkb3duID09PSAkZHJvcGRvd24pIHtcbiAgICAgICAgY2xvc2VEcm9wZG93bigpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcGVuRHJvcGRvd24oJGJ1dHRvbiwgJGRyb3Bkb3duLCBkYXRhVGFyZ2V0KVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cblxuICAvKlxuICAgKlxuICAgKiBCUkVBS1BPSU5UU1xuICAgKlxuICAgKi9cbiAgdmFyIGJtID0gYnJlYWtwb2ludE1hbmFnZXIoKVxuICBibS5hZGQoJ3RhYmxldCcsICcobWluLXdpZHRoOiA3MDBweCknKVxuICBibS5hZGQoJ2Rlc2t0b3AnLCAnKG1pbi13aWR0aDogMTA1MHB4KScpXG4gIC8vIFJlc2l6ZSBldmVudHNcbiAgYm0ub24oJ2VudGVyOnRhYmxldCcsIHVwZGF0ZUNzc1Byb3BzKVxuICBibS5vbignZXhpdDp0YWJsZXQnLCB1cGRhdGVDc3NQcm9wcylcbiAgYm0ub24oJ2VudGVyOmRlc2t0b3AnLCB1cGRhdGVDc3NQcm9wcylcbiAgYm0ub24oJ2V4aXQ6ZGVza3RvcCcsIHVwZGF0ZUNzc1Byb3BzKVxuXG5cbiAgLypcbiAgICpcbiAgICogT1BFTiBEUk9QRE9XTlxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gb3BlbkRyb3Bkb3duKCRidXR0b24sICRkcm9wZG93biwgdGFyZ2V0KSB7XG4gICAgLy8gQ2xvc2Ugb3BlbiBkcm9wZG93biBmaXJzdFxuICAgIGlmICgkY3VycmVudERyb3Bkb3duLmxlbmd0aCAhPT0gMCkgY2xvc2VEcm9wZG93bigpXG5cbiAgICAvLyBJbnRlcm5hbCB2YXJpYWJsZXNcbiAgICBkcm9wZG93bk9wZW4gPSB0cnVlXG4gICAgJGN1cnJlbnREcm9wZG93biA9ICRkcm9wZG93blxuICAgIGN1cnJlbnREcm9wZG93blRhcmdldCA9IHRhcmdldFxuICAgICRjdXJyZW50QnV0dG9uID0gJGJ1dHRvblxuXG4gICAgLy8gU2V0IENTUyBwcm9wZXJ0aWVzXG4gICAgdXBkYXRlQ3NzUHJvcHMoKVxuXG4gICAgLy8gVG9nZ2xlIGFjdGl2ZSBjbGFzc1xuICAgICRjdXJyZW50QnV0dG9uLmFkZENsYXNzKHRvZ2dsZUFjdGl2ZUNsYXNzKVxuICAgIG9wZW5OYXYoKVxuICB9XG5cblxuICAvKlxuICAgKlxuICAgKiBDTE9TRSBEUk9QRE9XTlxuICAgKlxuICAgKi9cbiAgZnVuY3Rpb24gY2xvc2VEcm9wZG93bigpIHtcbiAgICBkcm9wZG93bk9wZW4gPSBmYWxzZVxuICAgIC8vIFJlbW92ZSBDU1MgZnJvbSBvcGVuIGRyb3Bkb3duXG4gICAgdW5zZXREcm9wZG93bkNzc1Byb3BzKClcbiAgICAvLyBUb2dnbGUgY2xhc3Nlc1xuICAgICRjdXJyZW50QnV0dG9uLnJlbW92ZUNsYXNzKHRvZ2dsZUFjdGl2ZUNsYXNzKVxuICAgIC8vIEludGVybmFsIHZhcmlhYmxlc1xuICAgICRjdXJyZW50RHJvcGRvd24gPSAnJ1xuICAgIGlmICghYXBwLmlzTW9iaWxlKSBjbG9zZU5hdigpXG4gIH1cblxuXG4gIC8qXG4gICAqXG4gICAqIFVQREFURSBEUk9QRE9XTiBDU1NcbiAgICpcbiAgICovXG4gIGZ1bmN0aW9uIHVwZGF0ZUNzc1Byb3BzKCkge1xuICAgIC8vIFN0b3AgYnJlYWtwb2ludHMgZmlyaW5nIHdoZW4gZHJvcGRvd24gaXMgY2xvc2VkXG4gICAgaWYgKCFkcm9wZG93bk9wZW4pIHJldHVyblxuXG4gICAgLy8gUmVtb3ZlIENTU1xuICAgIGlmICgkY3VycmVudE9mZnNldEl0ZW0ubGVuZ3RoICE9PSAwKSB1bnNldERyb3Bkb3duQ3NzUHJvcHMoKVxuXG4gICAgLy8gU2V0IGRlc2t0b3Agb2Zmc2V0IGl0ZW0gdG8gYmUgPGhlYWRlcj5cbiAgICAkY3VycmVudE9mZnNldEl0ZW0gPSAoIWFwcC5pc01vYmlsZSkgPyBhcHAuaGVhZGVyLiRlbCA6ICRjdXJyZW50QnV0dG9uXG5cbiAgICAvLyBEZWFjdGl2YXRlIG1vYmlsZSBzZWFyY2ggZHJvcGRvd25cbiAgICB2YXIgaXNTZWFyY2ggPSAoY3VycmVudERyb3Bkb3duVGFyZ2V0ID09PSAnc2VhcmNoJylcbiAgICBpZiAoaXNTZWFyY2ggJiYgYXBwLmlzTW9iaWxlKSByZXR1cm5cblxuICAgIC8vIEdldCBwb3NpdGlvbiBwcm9wZXJ0aWVzIGJlZm9yZSBDU1NcbiAgICB2YXIgb2Zmc2V0SXRlbVRvcCA9ICRjdXJyZW50T2Zmc2V0SXRlbS5vZmZzZXQoKS50b3BcbiAgICAgICwgb2Zmc2V0SXRlbUhlaWdodCA9ICRjdXJyZW50T2Zmc2V0SXRlbS5vdXRlckhlaWdodCgpXG5cbiAgICAvLyBTZXQgQ1NTIG1hcmdpbi1ib3R0b20gZm9yIGNvbnRlbnRcbiAgICAkY3VycmVudE9mZnNldEl0ZW0uY3NzKHsgJ21hcmdpbkJvdHRvbScgOiAkY3VycmVudERyb3Bkb3duLm91dGVySGVpZ2h0KCkgfSlcblxuICAgIC8vIFNldCBDU1MgdG9wIGZvciBkcm9wZG93blxuICAgIC8vIFRhYmxldC9EZXNrdG9wIG9mZnNldCBzaG91bGQgc2l0IGF0IGJvdHRvbSBvZiBoZWFkZXJcbiAgICAkY3VycmVudERyb3Bkb3duLmNzcyh7ICd0b3AnIDogKG9mZnNldEl0ZW1Ub3AgKyBvZmZzZXRJdGVtSGVpZ2h0KSwgJ2JvdHRvbScgOiAnYXV0bycgfSlcblxuICB9XG5cblxuICAvKlxuICAgKlxuICAgKiBSRU1PVkUgRFJPUERPV04gQ1NTXG4gICAqXG4gICAqL1xuICBmdW5jdGlvbiB1bnNldERyb3Bkb3duQ3NzUHJvcHMoKSB7XG4gICAgaWYgKCFhcHAuaXNNb2JpbGUpIGFwcC5oZWFkZXIuJGVsLmNzcyh7ICdtYXJnaW5Cb3R0b20nOiAnMCcgfSlcbiAgICAkY3VycmVudE9mZnNldEl0ZW0uY3NzKHsgJ21hcmdpbkJvdHRvbSc6ICcwJyB9KVxuICAgICRjdXJyZW50RHJvcGRvd24uY3NzKHsgJ3RvcCcgOiAnYXV0bycsICdib3R0b20nIDogJzEwMCUnIH0pXG4gIH1cblxuXG4gIC8qXG4gICAqXG4gICAqIE1PQklMRSBOQVZJR0FUSU9OXG4gICAqXG4gICAqL1xuICB2YXIgJG5hdlRvZ2dsZSA9ICQoJy5qcy1tb2JpbGUtbmF2LXRvZ2dsZScpXG4gICAgLCAkbmF2ID0gJCgnLmpzLW1haW4tbmF2JylcbiAgICAsIGFjdGl2ZUNsYXNzID0gJ21haW4tbmF2X19pdGVtcy0tb3BlbidcbiAgICAsIG5hdk9wZW5cblxuICAkbmF2VG9nZ2xlLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAobmF2T3BlbikgY2xvc2VOYXYoKVxuICAgIGVsc2Ugb3Blbk5hdigpXG4gIH0pXG5cbiAgZnVuY3Rpb24gb3Blbk5hdigpIHtcbiAgICBuYXZPcGVuID0gdHJ1ZVxuICAgICRuYXYuYWRkQ2xhc3MoYWN0aXZlQ2xhc3MpXG4gIH1cblxuICBmdW5jdGlvbiBjbG9zZU5hdigpIHtcbiAgICBuYXZPcGVuID0gZmFsc2VcbiAgICAkbmF2LnJlbW92ZUNsYXNzKGFjdGl2ZUNsYXNzKVxuICAgIGlmIChhcHAuaXNNb2JpbGUpIGNsb3NlRHJvcGRvd24oKVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgJCgnLmpzLXNjcm9sbC1saW5rJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgJCh0aGlzKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB2YXIgaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpXG4gICAgICAgICwgJHRhcmdldCA9ICQoaHJlZikucGFyZW50cygnc2VjdGlvbicpXG4gICAgICAgICwgdGFyZ2V0U2Nyb2xsVG9wID0gJHRhcmdldC5vZmZzZXQoKS50b3BcblxuICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyAnc2Nyb2xsVG9wJzogdGFyZ2V0U2Nyb2xsVG9wIH0pXG5cbiAgICB9KVxuICB9KVxufVxuIiwiLyoqXG4gKiBMaWdodGJveCB2Mi43LjFcbiAqIGJ5IExva2VzaCBEaGFrYXIgLSBodHRwOi8vbG9rZXNoZGhha2FyLmNvbS9wcm9qZWN0cy9saWdodGJveDIvXG4gKlxuICogQGxpY2Vuc2UgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMi41L1xuICogLSBGcmVlIGZvciB1c2UgaW4gYm90aCBwZXJzb25hbCBhbmQgY29tbWVyY2lhbCBwcm9qZWN0c1xuICogLSBBdHRyaWJ1dGlvbiByZXF1aXJlcyBsZWF2aW5nIGF1dGhvciBuYW1lLCBhdXRob3IgbGluaywgYW5kIHRoZSBsaWNlbnNlIGluZm8gaW50YWN0XG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAvLyBVc2UgbG9jYWwgYWxpYXNcbiAgdmFyICQgPSBqUXVlcnk7XG5cbiAgdmFyIExpZ2h0Ym94T3B0aW9ucyA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBMaWdodGJveE9wdGlvbnMoKSB7XG4gICAgICB0aGlzLmZhZGVEdXJhdGlvbiAgICAgICAgICAgICAgICA9IDUwMDtcbiAgICAgIHRoaXMuZml0SW1hZ2VzSW5WaWV3cG9ydCAgICAgICAgID0gdHJ1ZTtcbiAgICAgIHRoaXMucmVzaXplRHVyYXRpb24gICAgICAgICAgICAgID0gNzAwO1xuICAgICAgdGhpcy5wb3NpdGlvbkZyb21Ub3AgICAgICAgICAgICAgPSA1MDtcbiAgICAgIHRoaXMuc2hvd0ltYWdlTnVtYmVyTGFiZWwgICAgICAgID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWx3YXlzU2hvd05hdk9uVG91Y2hEZXZpY2VzID0gZmFsc2U7XG4gICAgICB0aGlzLndyYXBBcm91bmQgICAgICAgICAgICAgICAgICA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSB0byBsb2NhbGl6ZSB0byBub24tZW5nbGlzaCBsYW5ndWFnZVxuICAgIExpZ2h0Ym94T3B0aW9ucy5wcm90b3R5cGUuYWxidW1MYWJlbCA9IGZ1bmN0aW9uKGN1ckltYWdlTnVtLCBhbGJ1bVNpemUpIHtcbiAgICAgIHJldHVybiBcIkltYWdlIFwiICsgY3VySW1hZ2VOdW0gKyBcIiBvZiBcIiArIGFsYnVtU2l6ZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIExpZ2h0Ym94T3B0aW9ucztcbiAgfSkoKTtcblxuXG4gIHZhciBMaWdodGJveCA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBMaWdodGJveChvcHRpb25zKSB7XG4gICAgICB0aGlzLm9wdGlvbnMgICAgICAgICAgID0gb3B0aW9ucztcbiAgICAgIHRoaXMuYWxidW0gICAgICAgICAgICAgPSBbXTtcbiAgICAgIHRoaXMuY3VycmVudEltYWdlSW5kZXggPSB2b2lkIDA7XG4gICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBMaWdodGJveC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5lbmFibGUoKTtcbiAgICAgIHRoaXMuYnVpbGQoKTtcbiAgICB9O1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGFuY2hvcnMgYW5kIGFyZWFtYXBzIGxvb2tpbmcgZm9yIGVpdGhlciBkYXRhLWxpZ2h0Ym94IGF0dHJpYnV0ZXMgb3IgcmVsIGF0dHJpYnV0ZXNcbiAgICAvLyB0aGF0IGNvbnRhaW4gJ2xpZ2h0Ym94Jy4gV2hlbiB0aGVzZSBhcmUgY2xpY2tlZCwgc3RhcnQgbGlnaHRib3guXG4gICAgTGlnaHRib3gucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsICdhW3JlbF49bGlnaHRib3hdLCBhcmVhW3JlbF49bGlnaHRib3hdLCBhW2RhdGEtbGlnaHRib3hdLCBhcmVhW2RhdGEtbGlnaHRib3hdJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgc2VsZi5zdGFydCgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIEJ1aWxkIGh0bWwgZm9yIHRoZSBsaWdodGJveCBhbmQgdGhlIG92ZXJsYXkuXG4gICAgLy8gQXR0YWNoIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBuZXcgRE9NIGVsZW1lbnRzLiBjbGljayBjbGljayBjbGlja1xuICAgIExpZ2h0Ym94LnByb3RvdHlwZS5idWlsZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgJChcIjxkaXYgaWQ9J2xpZ2h0Ym94T3ZlcmxheScgY2xhc3M9J2xpZ2h0Ym94T3ZlcmxheSc+PC9kaXY+PGRpdiBpZD0nbGlnaHRib3gnIGNsYXNzPSdsaWdodGJveCc+PGRpdiBjbGFzcz0nbGItb3V0ZXJDb250YWluZXInPjxkaXYgY2xhc3M9J2xiLWNvbnRhaW5lcic+PGltZyBjbGFzcz0nbGItaW1hZ2UnIHNyYz0nJyAvPjxkaXYgY2xhc3M9J2xiLW5hdic+PGEgY2xhc3M9J2xiLXByZXYnIGhyZWY9JycgPjwvYT48YSBjbGFzcz0nbGItbmV4dCcgaHJlZj0nJyA+PC9hPjwvZGl2PjxkaXYgY2xhc3M9J2xiLWxvYWRlcic+PGEgY2xhc3M9J2xiLWNhbmNlbCc+PC9hPjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9J2xiLWRhdGFDb250YWluZXInPjxkaXYgY2xhc3M9J2xiLWRhdGEnPjxkaXYgY2xhc3M9J2xiLWRldGFpbHMnPjxzcGFuIGNsYXNzPSdsYi1jYXB0aW9uJz48L3NwYW4+PHNwYW4gY2xhc3M9J2xiLW51bWJlcic+PC9zcGFuPjwvZGl2PjxkaXYgY2xhc3M9J2xiLWNsb3NlQ29udGFpbmVyJz48YSBjbGFzcz0nbGItY2xvc2UnPjwvYT48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj5cIikuYXBwZW5kVG8oJCgnYm9keScpKTtcblxuICAgICAgLy8gQ2FjaGUgalF1ZXJ5IG9iamVjdHNcbiAgICAgIHRoaXMuJGxpZ2h0Ym94ICAgICAgID0gJCgnI2xpZ2h0Ym94Jyk7XG4gICAgICB0aGlzLiRvdmVybGF5ICAgICAgICA9ICQoJyNsaWdodGJveE92ZXJsYXknKTtcbiAgICAgIHRoaXMuJG91dGVyQ29udGFpbmVyID0gdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLW91dGVyQ29udGFpbmVyJyk7XG4gICAgICB0aGlzLiRjb250YWluZXIgICAgICA9IHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1jb250YWluZXInKTtcblxuICAgICAgLy8gU3RvcmUgY3NzIHZhbHVlcyBmb3IgZnV0dXJlIGxvb2t1cFxuICAgICAgdGhpcy5jb250YWluZXJUb3BQYWRkaW5nID0gcGFyc2VJbnQodGhpcy4kY29udGFpbmVyLmNzcygncGFkZGluZy10b3AnKSwgMTApO1xuICAgICAgdGhpcy5jb250YWluZXJSaWdodFBhZGRpbmcgPSBwYXJzZUludCh0aGlzLiRjb250YWluZXIuY3NzKCdwYWRkaW5nLXJpZ2h0JyksIDEwKTtcbiAgICAgIHRoaXMuY29udGFpbmVyQm90dG9tUGFkZGluZyA9IHBhcnNlSW50KHRoaXMuJGNvbnRhaW5lci5jc3MoJ3BhZGRpbmctYm90dG9tJyksIDEwKTtcbiAgICAgIHRoaXMuY29udGFpbmVyTGVmdFBhZGRpbmcgPSBwYXJzZUludCh0aGlzLiRjb250YWluZXIuY3NzKCdwYWRkaW5nLWxlZnQnKSwgMTApO1xuXG4gICAgICAvLyBBdHRhY2ggZXZlbnQgaGFuZGxlcnMgdG8gdGhlIG5ld2x5IG1pbnRlZCBET00gZWxlbWVudHNcbiAgICAgIHRoaXMuJG92ZXJsYXkuaGlkZSgpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmVuZCgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy4kbGlnaHRib3guaGlkZSgpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICgkKGV2ZW50LnRhcmdldCkuYXR0cignaWQnKSA9PT0gJ2xpZ2h0Ym94Jykge1xuICAgICAgICAgIHNlbGYuZW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuJG91dGVyQ29udGFpbmVyLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICgkKGV2ZW50LnRhcmdldCkuYXR0cignaWQnKSA9PT0gJ2xpZ2h0Ym94Jykge1xuICAgICAgICAgIHNlbGYuZW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1wcmV2Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzZWxmLmN1cnJlbnRJbWFnZUluZGV4ID09PSAwKSB7XG4gICAgICAgICAgc2VsZi5jaGFuZ2VJbWFnZShzZWxmLmFsYnVtLmxlbmd0aCAtIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuY2hhbmdlSW1hZ2Uoc2VsZi5jdXJyZW50SW1hZ2VJbmRleCAtIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLiRsaWdodGJveC5maW5kKCcubGItbmV4dCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc2VsZi5jdXJyZW50SW1hZ2VJbmRleCA9PT0gc2VsZi5hbGJ1bS5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgc2VsZi5jaGFuZ2VJbWFnZSgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLmNoYW5nZUltYWdlKHNlbGYuY3VycmVudEltYWdlSW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLWxvYWRlciwgLmxiLWNsb3NlJykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlbGYuZW5kKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBTaG93IG92ZXJsYXkgYW5kIGxpZ2h0Ym94LiBJZiB0aGUgaW1hZ2UgaXMgcGFydCBvZiBhIHNldCwgYWRkIHNpYmxpbmdzIHRvIGFsYnVtIGFycmF5LlxuICAgIExpZ2h0Ym94LnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCRsaW5rKSB7XG4gICAgICB2YXIgc2VsZiAgICA9IHRoaXM7XG4gICAgICB2YXIgJHdpbmRvdyA9ICQod2luZG93KTtcblxuICAgICAgJHdpbmRvdy5vbigncmVzaXplJywgJC5wcm94eSh0aGlzLnNpemVPdmVybGF5LCB0aGlzKSk7XG5cbiAgICAgICQoJ3NlbGVjdCwgb2JqZWN0LCBlbWJlZCcpLmNzcyh7XG4gICAgICAgIHZpc2liaWxpdHk6IFwiaGlkZGVuXCJcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNpemVPdmVybGF5KCk7XG5cbiAgICAgIHRoaXMuYWxidW0gPSBbXTtcbiAgICAgIHZhciBpbWFnZU51bWJlciA9IDA7XG5cbiAgICAgIGZ1bmN0aW9uIGFkZFRvQWxidW0oJGxpbmspIHtcbiAgICAgICAgc2VsZi5hbGJ1bS5wdXNoKHtcbiAgICAgICAgICBsaW5rOiAkbGluay5hdHRyKCdocmVmJyksXG4gICAgICAgICAgdGl0bGU6ICRsaW5rLmF0dHIoJ2RhdGEtdGl0bGUnKSB8fCAkbGluay5hdHRyKCd0aXRsZScpXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBTdXBwb3J0IGJvdGggZGF0YS1saWdodGJveCBhdHRyaWJ1dGUgYW5kIHJlbCBhdHRyaWJ1dGUgaW1wbGVtZW50YXRpb25zXG4gICAgICB2YXIgZGF0YUxpZ2h0Ym94VmFsdWUgPSAkbGluay5hdHRyKCdkYXRhLWxpZ2h0Ym94Jyk7XG4gICAgICB2YXIgJGxpbmtzO1xuXG4gICAgICBpZiAoZGF0YUxpZ2h0Ym94VmFsdWUpIHtcbiAgICAgICAgJGxpbmtzID0gJCgkbGluay5wcm9wKFwidGFnTmFtZVwiKSArICdbZGF0YS1saWdodGJveD1cIicgKyBkYXRhTGlnaHRib3hWYWx1ZSArICdcIl0nKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkbGlua3MubGVuZ3RoOyBpID0gKytpKSB7XG4gICAgICAgICAgYWRkVG9BbGJ1bSgkKCRsaW5rc1tpXSkpO1xuICAgICAgICAgIGlmICgkbGlua3NbaV0gPT09ICRsaW5rWzBdKSB7XG4gICAgICAgICAgICBpbWFnZU51bWJlciA9IGk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoJGxpbmsuYXR0cigncmVsJykgPT09ICdsaWdodGJveCcpIHtcbiAgICAgICAgICAvLyBJZiBpbWFnZSBpcyBub3QgcGFydCBvZiBhIHNldFxuICAgICAgICAgIGFkZFRvQWxidW0oJGxpbmspO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIGltYWdlIGlzIHBhcnQgb2YgYSBzZXRcbiAgICAgICAgICAkbGlua3MgPSAkKCRsaW5rLnByb3AoXCJ0YWdOYW1lXCIpICsgJ1tyZWw9XCInICsgJGxpbmsuYXR0cigncmVsJykgKyAnXCJdJyk7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAkbGlua3MubGVuZ3RoOyBqID0gKytqKSB7XG4gICAgICAgICAgICBhZGRUb0FsYnVtKCQoJGxpbmtzW2pdKSk7XG4gICAgICAgICAgICBpZiAoJGxpbmtzW2pdID09PSAkbGlua1swXSkge1xuICAgICAgICAgICAgICBpbWFnZU51bWJlciA9IGo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFBvc2l0aW9uIExpZ2h0Ym94XG4gICAgICB2YXIgdG9wICA9ICR3aW5kb3cuc2Nyb2xsVG9wKCkgKyB0aGlzLm9wdGlvbnMucG9zaXRpb25Gcm9tVG9wO1xuICAgICAgdmFyIGxlZnQgPSAkd2luZG93LnNjcm9sbExlZnQoKTtcbiAgICAgIHRoaXMuJGxpZ2h0Ym94LmNzcyh7XG4gICAgICAgIHRvcDogdG9wICsgJ3B4JyxcbiAgICAgICAgbGVmdDogbGVmdCArICdweCdcbiAgICAgIH0pLmZhZGVJbih0aGlzLm9wdGlvbnMuZmFkZUR1cmF0aW9uKTtcblxuICAgICAgdGhpcy5jaGFuZ2VJbWFnZShpbWFnZU51bWJlcik7XG4gICAgfTtcblxuICAgIC8vIEhpZGUgbW9zdCBVSSBlbGVtZW50cyBpbiBwcmVwYXJhdGlvbiBmb3IgdGhlIGFuaW1hdGVkIHJlc2l6aW5nIG9mIHRoZSBsaWdodGJveC5cbiAgICBMaWdodGJveC5wcm90b3R5cGUuY2hhbmdlSW1hZ2UgPSBmdW5jdGlvbihpbWFnZU51bWJlcikge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLmRpc2FibGVLZXlib2FyZE5hdigpO1xuICAgICAgdmFyICRpbWFnZSA9IHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1pbWFnZScpO1xuXG4gICAgICB0aGlzLiRvdmVybGF5LmZhZGVJbih0aGlzLm9wdGlvbnMuZmFkZUR1cmF0aW9uKTtcblxuICAgICAgJCgnLmxiLWxvYWRlcicpLmZhZGVJbignc2xvdycpO1xuICAgICAgdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLWltYWdlLCAubGItbmF2LCAubGItcHJldiwgLmxiLW5leHQsIC5sYi1kYXRhQ29udGFpbmVyLCAubGItbnVtYmVycywgLmxiLWNhcHRpb24nKS5oaWRlKCk7XG5cbiAgICAgIHRoaXMuJG91dGVyQ29udGFpbmVyLmFkZENsYXNzKCdhbmltYXRpbmcnKTtcblxuICAgICAgLy8gV2hlbiBpbWFnZSB0byBzaG93IGlzIHByZWxvYWRlZCwgd2Ugc2VuZCB0aGUgd2lkdGggYW5kIGhlaWdodCB0byBzaXplQ29udGFpbmVyKClcbiAgICAgIHZhciBwcmVsb2FkZXIgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIHByZWxvYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRwcmVsb2FkZXIsIGltYWdlSGVpZ2h0LCBpbWFnZVdpZHRoLCBtYXhJbWFnZUhlaWdodCwgbWF4SW1hZ2VXaWR0aCwgd2luZG93SGVpZ2h0LCB3aW5kb3dXaWR0aDtcbiAgICAgICAgJGltYWdlLmF0dHIoJ3NyYycsIHNlbGYuYWxidW1baW1hZ2VOdW1iZXJdLmxpbmspO1xuXG4gICAgICAgICRwcmVsb2FkZXIgPSAkKHByZWxvYWRlcik7XG5cbiAgICAgICAgJGltYWdlLndpZHRoKHByZWxvYWRlci53aWR0aCk7XG4gICAgICAgICRpbWFnZS5oZWlnaHQocHJlbG9hZGVyLmhlaWdodCk7XG5cbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5maXRJbWFnZXNJblZpZXdwb3J0KSB7XG4gICAgICAgICAgLy8gRml0IGltYWdlIGluc2lkZSB0aGUgdmlld3BvcnQuXG4gICAgICAgICAgLy8gVGFrZSBpbnRvIGFjY291bnQgdGhlIGJvcmRlciBhcm91bmQgdGhlIGltYWdlIGFuZCBhbiBhZGRpdGlvbmFsIDEwcHggZ3V0dGVyIG9uIGVhY2ggc2lkZS5cblxuICAgICAgICAgIHdpbmRvd1dpZHRoICAgID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgICAgICAgd2luZG93SGVpZ2h0ICAgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgICAgICAgbWF4SW1hZ2VXaWR0aCAgPSB3aW5kb3dXaWR0aCAtIHNlbGYuY29udGFpbmVyTGVmdFBhZGRpbmcgLSBzZWxmLmNvbnRhaW5lclJpZ2h0UGFkZGluZyAtIDIwO1xuICAgICAgICAgIG1heEltYWdlSGVpZ2h0ID0gd2luZG93SGVpZ2h0IC0gc2VsZi5jb250YWluZXJUb3BQYWRkaW5nIC0gc2VsZi5jb250YWluZXJCb3R0b21QYWRkaW5nIC0gMTIwO1xuXG4gICAgICAgICAgLy8gSXMgdGhlcmUgYSBmaXR0aW5nIGlzc3VlP1xuICAgICAgICAgIGlmICgocHJlbG9hZGVyLndpZHRoID4gbWF4SW1hZ2VXaWR0aCkgfHwgKHByZWxvYWRlci5oZWlnaHQgPiBtYXhJbWFnZUhlaWdodCkpIHtcbiAgICAgICAgICAgIGlmICgocHJlbG9hZGVyLndpZHRoIC8gbWF4SW1hZ2VXaWR0aCkgPiAocHJlbG9hZGVyLmhlaWdodCAvIG1heEltYWdlSGVpZ2h0KSkge1xuICAgICAgICAgICAgICBpbWFnZVdpZHRoICA9IG1heEltYWdlV2lkdGg7XG4gICAgICAgICAgICAgIGltYWdlSGVpZ2h0ID0gcGFyc2VJbnQocHJlbG9hZGVyLmhlaWdodCAvIChwcmVsb2FkZXIud2lkdGggLyBpbWFnZVdpZHRoKSwgMTApO1xuICAgICAgICAgICAgICAkaW1hZ2Uud2lkdGgoaW1hZ2VXaWR0aCk7XG4gICAgICAgICAgICAgICRpbWFnZS5oZWlnaHQoaW1hZ2VIZWlnaHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaW1hZ2VIZWlnaHQgPSBtYXhJbWFnZUhlaWdodDtcbiAgICAgICAgICAgICAgaW1hZ2VXaWR0aCA9IHBhcnNlSW50KHByZWxvYWRlci53aWR0aCAvIChwcmVsb2FkZXIuaGVpZ2h0IC8gaW1hZ2VIZWlnaHQpLCAxMCk7XG4gICAgICAgICAgICAgICRpbWFnZS53aWR0aChpbWFnZVdpZHRoKTtcbiAgICAgICAgICAgICAgJGltYWdlLmhlaWdodChpbWFnZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNlbGYuc2l6ZUNvbnRhaW5lcigkaW1hZ2Uud2lkdGgoKSwgJGltYWdlLmhlaWdodCgpKTtcbiAgICAgIH07XG5cbiAgICAgIHByZWxvYWRlci5zcmMgICAgICAgICAgPSB0aGlzLmFsYnVtW2ltYWdlTnVtYmVyXS5saW5rO1xuICAgICAgdGhpcy5jdXJyZW50SW1hZ2VJbmRleCA9IGltYWdlTnVtYmVyO1xuICAgIH07XG5cbiAgICAvLyBTdHJldGNoIG92ZXJsYXkgdG8gZml0IHRoZSB2aWV3cG9ydFxuICAgIExpZ2h0Ym94LnByb3RvdHlwZS5zaXplT3ZlcmxheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy4kb3ZlcmxheVxuICAgICAgICAud2lkdGgoJCh3aW5kb3cpLndpZHRoKCkpXG4gICAgICAgIC5oZWlnaHQoJChkb2N1bWVudCkuaGVpZ2h0KCkpO1xuICAgIH07XG5cbiAgICAvLyBBbmltYXRlIHRoZSBzaXplIG9mIHRoZSBsaWdodGJveCB0byBmaXQgdGhlIGltYWdlIHdlIGFyZSBzaG93aW5nXG4gICAgTGlnaHRib3gucHJvdG90eXBlLnNpemVDb250YWluZXIgPSBmdW5jdGlvbihpbWFnZVdpZHRoLCBpbWFnZUhlaWdodCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB2YXIgb2xkV2lkdGggID0gdGhpcy4kb3V0ZXJDb250YWluZXIub3V0ZXJXaWR0aCgpO1xuICAgICAgdmFyIG9sZEhlaWdodCA9IHRoaXMuJG91dGVyQ29udGFpbmVyLm91dGVySGVpZ2h0KCk7XG4gICAgICB2YXIgbmV3V2lkdGggID0gaW1hZ2VXaWR0aCArIHRoaXMuY29udGFpbmVyTGVmdFBhZGRpbmcgKyB0aGlzLmNvbnRhaW5lclJpZ2h0UGFkZGluZztcbiAgICAgIHZhciBuZXdIZWlnaHQgPSBpbWFnZUhlaWdodCArIHRoaXMuY29udGFpbmVyVG9wUGFkZGluZyArIHRoaXMuY29udGFpbmVyQm90dG9tUGFkZGluZztcblxuICAgICAgZnVuY3Rpb24gcG9zdFJlc2l6ZSgpIHtcbiAgICAgICAgc2VsZi4kbGlnaHRib3guZmluZCgnLmxiLWRhdGFDb250YWluZXInKS53aWR0aChuZXdXaWR0aCk7XG4gICAgICAgIHNlbGYuJGxpZ2h0Ym94LmZpbmQoJy5sYi1wcmV2TGluaycpLmhlaWdodChuZXdIZWlnaHQpO1xuICAgICAgICBzZWxmLiRsaWdodGJveC5maW5kKCcubGItbmV4dExpbmsnKS5oZWlnaHQobmV3SGVpZ2h0KTtcbiAgICAgICAgc2VsZi5zaG93SW1hZ2UoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9sZFdpZHRoICE9PSBuZXdXaWR0aCB8fCBvbGRIZWlnaHQgIT09IG5ld0hlaWdodCkge1xuICAgICAgICB0aGlzLiRvdXRlckNvbnRhaW5lci5hbmltYXRlKHtcbiAgICAgICAgICB3aWR0aDogbmV3V2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBuZXdIZWlnaHRcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zLnJlc2l6ZUR1cmF0aW9uLCAnc3dpbmcnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBwb3N0UmVzaXplKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9zdFJlc2l6ZSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBEaXNwbGF5IHRoZSBpbWFnZSBhbmQgaXQncyBkZXRhaWxzIGFuZCBiZWdpbiBwcmVsb2FkIG5laWdoYm9yaW5nIGltYWdlcy5cbiAgICBMaWdodGJveC5wcm90b3R5cGUuc2hvd0ltYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLiRsaWdodGJveC5maW5kKCcubGItbG9hZGVyJykuaGlkZSgpO1xuICAgICAgdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLWltYWdlJykuZmFkZUluKCdzbG93Jyk7XG5cbiAgICAgIHRoaXMudXBkYXRlTmF2KCk7XG4gICAgICB0aGlzLnVwZGF0ZURldGFpbHMoKTtcbiAgICAgIHRoaXMucHJlbG9hZE5laWdoYm9yaW5nSW1hZ2VzKCk7XG4gICAgICB0aGlzLmVuYWJsZUtleWJvYXJkTmF2KCk7XG4gICAgfTtcblxuICAgIC8vIERpc3BsYXkgcHJldmlvdXMgYW5kIG5leHQgbmF2aWdhdGlvbiBpZiBhcHByb3ByaWF0ZS5cbiAgICBMaWdodGJveC5wcm90b3R5cGUudXBkYXRlTmF2ID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIGJyb3dzZXIgc3VwcG9ydHMgdG91Y2ggZXZlbnRzLiBJZiBzbywgd2UgdGFrZSB0aGUgY29uc2VydmF0aXZlIGFwcHJvYWNoXG4gICAgICAvLyBhbmQgYXNzdW1lIHRoYXQgbW91c2UgaG92ZXIgZXZlbnRzIGFyZSBub3Qgc3VwcG9ydGVkIGFuZCBhbHdheXMgc2hvdyBwcmV2L25leHQgbmF2aWdhdGlvblxuICAgICAgLy8gYXJyb3dzIGluIGltYWdlIHNldHMuXG4gICAgICB2YXIgYWx3YXlzU2hvd05hdiA9IGZhbHNlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJUb3VjaEV2ZW50XCIpO1xuICAgICAgICBhbHdheXNTaG93TmF2ID0gKHRoaXMub3B0aW9ucy5hbHdheXNTaG93TmF2T25Ub3VjaERldmljZXMpPyB0cnVlOiBmYWxzZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1uYXYnKS5zaG93KCk7XG5cbiAgICAgIGlmICh0aGlzLmFsYnVtLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy53cmFwQXJvdW5kKSB7XG4gICAgICAgICAgaWYgKGFsd2F5c1Nob3dOYXYpIHtcbiAgICAgICAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1wcmV2LCAubGItbmV4dCcpLmNzcygnb3BhY2l0eScsICcxJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1wcmV2LCAubGItbmV4dCcpLnNob3coKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SW1hZ2VJbmRleCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1wcmV2Jykuc2hvdygpO1xuICAgICAgICAgICAgaWYgKGFsd2F5c1Nob3dOYXYpIHtcbiAgICAgICAgICAgICAgdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLXByZXYnKS5jc3MoJ29wYWNpdHknLCAnMScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SW1hZ2VJbmRleCA8IHRoaXMuYWxidW0ubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLW5leHQnKS5zaG93KCk7XG4gICAgICAgICAgICBpZiAoYWx3YXlzU2hvd05hdikge1xuICAgICAgICAgICAgICB0aGlzLiRsaWdodGJveC5maW5kKCcubGItbmV4dCcpLmNzcygnb3BhY2l0eScsICcxJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIERpc3BsYXkgY2FwdGlvbiwgaW1hZ2UgbnVtYmVyLCBhbmQgY2xvc2luZyBidXR0b24uXG4gICAgTGlnaHRib3gucHJvdG90eXBlLnVwZGF0ZURldGFpbHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gRW5hYmxlIGFuY2hvciBjbGlja3MgaW4gdGhlIGluamVjdGVkIGNhcHRpb24gaHRtbC5cbiAgICAgIC8vIFRoYW5rcyBOYXRlIFdyaWdodCBmb3IgdGhlIGZpeC4gQGh0dHBzOi8vZ2l0aHViLmNvbS9OYXRlV3JcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5hbGJ1bVt0aGlzLmN1cnJlbnRJbWFnZUluZGV4XS50aXRsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5hbGJ1bVt0aGlzLmN1cnJlbnRJbWFnZUluZGV4XS50aXRsZSAhPT0gXCJcIikge1xuICAgICAgICB0aGlzLiRsaWdodGJveC5maW5kKCcubGItY2FwdGlvbicpXG4gICAgICAgICAgLmh0bWwodGhpcy5hbGJ1bVt0aGlzLmN1cnJlbnRJbWFnZUluZGV4XS50aXRsZSlcbiAgICAgICAgICAuZmFkZUluKCdmYXN0JylcbiAgICAgICAgICAuZmluZCgnYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSAkKHRoaXMpLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuYWxidW0ubGVuZ3RoID4gMSAmJiB0aGlzLm9wdGlvbnMuc2hvd0ltYWdlTnVtYmVyTGFiZWwpIHtcbiAgICAgICAgdGhpcy4kbGlnaHRib3guZmluZCgnLmxiLW51bWJlcicpLnRleHQodGhpcy5vcHRpb25zLmFsYnVtTGFiZWwodGhpcy5jdXJyZW50SW1hZ2VJbmRleCArIDEsIHRoaXMuYWxidW0ubGVuZ3RoKSkuZmFkZUluKCdmYXN0Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiRsaWdodGJveC5maW5kKCcubGItbnVtYmVyJykuaGlkZSgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRvdXRlckNvbnRhaW5lci5yZW1vdmVDbGFzcygnYW5pbWF0aW5nJyk7XG5cbiAgICAgIHRoaXMuJGxpZ2h0Ym94LmZpbmQoJy5sYi1kYXRhQ29udGFpbmVyJykuZmFkZUluKHRoaXMub3B0aW9ucy5yZXNpemVEdXJhdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzZWxmLnNpemVPdmVybGF5KCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gUHJlbG9hZCBwcmV2aW91cyBhbmQgbmV4dCBpbWFnZXMgaW4gc2V0LlxuICAgIExpZ2h0Ym94LnByb3RvdHlwZS5wcmVsb2FkTmVpZ2hib3JpbmdJbWFnZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmFsYnVtLmxlbmd0aCA+IHRoaXMuY3VycmVudEltYWdlSW5kZXggKyAxKSB7XG4gICAgICAgIHZhciBwcmVsb2FkTmV4dCA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBwcmVsb2FkTmV4dC5zcmMgPSB0aGlzLmFsYnVtW3RoaXMuY3VycmVudEltYWdlSW5kZXggKyAxXS5saW5rO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY3VycmVudEltYWdlSW5kZXggPiAwKSB7XG4gICAgICAgIHZhciBwcmVsb2FkUHJldiA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBwcmVsb2FkUHJldi5zcmMgPSB0aGlzLmFsYnVtW3RoaXMuY3VycmVudEltYWdlSW5kZXggLSAxXS5saW5rO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBMaWdodGJveC5wcm90b3R5cGUuZW5hYmxlS2V5Ym9hcmROYXYgPSBmdW5jdGlvbigpIHtcbiAgICAgICQoZG9jdW1lbnQpLm9uKCdrZXl1cC5rZXlib2FyZCcsICQucHJveHkodGhpcy5rZXlib2FyZEFjdGlvbiwgdGhpcykpO1xuICAgIH07XG5cbiAgICBMaWdodGJveC5wcm90b3R5cGUuZGlzYWJsZUtleWJvYXJkTmF2ID0gZnVuY3Rpb24oKSB7XG4gICAgICAkKGRvY3VtZW50KS5vZmYoJy5rZXlib2FyZCcpO1xuICAgIH07XG5cbiAgICBMaWdodGJveC5wcm90b3R5cGUua2V5Ym9hcmRBY3Rpb24gPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIEtFWUNPREVfRVNDICAgICAgICA9IDI3O1xuICAgICAgdmFyIEtFWUNPREVfTEVGVEFSUk9XICA9IDM3O1xuICAgICAgdmFyIEtFWUNPREVfUklHSFRBUlJPVyA9IDM5O1xuXG4gICAgICB2YXIga2V5Y29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgICB2YXIga2V5ICAgICA9IFN0cmluZy5mcm9tQ2hhckNvZGUoa2V5Y29kZSkudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChrZXljb2RlID09PSBLRVlDT0RFX0VTQyB8fCBrZXkubWF0Y2goL3h8b3xjLykpIHtcbiAgICAgICAgdGhpcy5lbmQoKTtcbiAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAncCcgfHwga2V5Y29kZSA9PT0gS0VZQ09ERV9MRUZUQVJST1cpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEltYWdlSW5kZXggIT09IDApIHtcbiAgICAgICAgICB0aGlzLmNoYW5nZUltYWdlKHRoaXMuY3VycmVudEltYWdlSW5kZXggLSAxKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCAmJiB0aGlzLmFsYnVtLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB0aGlzLmNoYW5nZUltYWdlKHRoaXMuYWxidW0ubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbicgfHwga2V5Y29kZSA9PT0gS0VZQ09ERV9SSUdIVEFSUk9XKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbWFnZUluZGV4ICE9PSB0aGlzLmFsYnVtLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLmNoYW5nZUltYWdlKHRoaXMuY3VycmVudEltYWdlSW5kZXggKyAxKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCAmJiB0aGlzLmFsYnVtLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB0aGlzLmNoYW5nZUltYWdlKDApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIENsb3NpbmcgdGltZS4gOi0oXG4gICAgTGlnaHRib3gucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kaXNhYmxlS2V5Ym9hcmROYXYoKTtcbiAgICAgICQod2luZG93KS5vZmYoXCJyZXNpemVcIiwgdGhpcy5zaXplT3ZlcmxheSk7XG4gICAgICB0aGlzLiRsaWdodGJveC5mYWRlT3V0KHRoaXMub3B0aW9ucy5mYWRlRHVyYXRpb24pO1xuICAgICAgdGhpcy4kb3ZlcmxheS5mYWRlT3V0KHRoaXMub3B0aW9ucy5mYWRlRHVyYXRpb24pO1xuICAgICAgJCgnc2VsZWN0LCBvYmplY3QsIGVtYmVkJykuY3NzKHtcbiAgICAgICAgdmlzaWJpbGl0eTogXCJ2aXNpYmxlXCJcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4gTGlnaHRib3g7XG5cbiAgfSkoKTtcblxuICAkKGZ1bmN0aW9uKCkge1xuICAgIHZhciBvcHRpb25zICA9IG5ldyBMaWdodGJveE9wdGlvbnMoKTtcbiAgICB2YXIgbGlnaHRib3ggPSBuZXcgTGlnaHRib3gob3B0aW9ucyk7XG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuIl19
