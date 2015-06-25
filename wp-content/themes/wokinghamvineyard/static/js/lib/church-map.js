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
