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
