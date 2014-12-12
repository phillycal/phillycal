// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

function initialize() {

  var searchMarkers = [];
  var activeMarker = null;
  var addedMarkers = [];

  var map = new google.maps.Map(document.getElementById('map-canvas'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  var defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-33.8902, 151.1759),
      new google.maps.LatLng(-33.8474, 151.2631));
  map.fitBounds(defaultBounds);

  // Create the search box and link it to the UI element.
  var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var searchBox = new google.maps.places.SearchBox(
    /** @type {HTMLInputElement} */(input));

  var editorWin = new google.maps.InfoWindow({
    content: $('#editor-win-tpl')[0].innerHTML
  });

  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
    for (var i = 0, marker; marker = searchMarkers[i]; i++) {
      marker.setMap(null);
      google.maps.event.clearListeners(marker, 'click');
    }

    // For each place, get the icon, place name, and location.
    searchMarkers = [];
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {

      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        title: place.name,
        position: place.geometry.location
      });

      google.maps.event.addListener(marker, 'click', function() {
        activateMarker(new google.maps.Marker({
          title: this.getTitle(),
          position: this.getPosition()
        }));
      });

      searchMarkers.push(marker);

      bounds.extend(place.geometry.location);
    }

    map.fitBounds(bounds);
  });

  // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.
  google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
  });

  // add/remove a/the selected marker when map is clicked
  google.maps.event.addListener(map, 'click', function(event) {
    activateMarker(new google.maps.Marker({
      title: '',
      position: event.latLng
    }));
  });

  var activateMarker = function(marker) {
    if (activeMarker != null) {
      if (addedMarkers.indexOf(activeMarker) < 0) {
        activeMarker.setMap(null);
      } else {
        updateMarker();
      }
      activeMarker = null;

      hideEditor();
    } else {
      activeMarker = marker;

      activeMarker.exAttrs = activeMarker.exAttrs || {};
      activeMarker.exAttrs.period = activeMarker.exAttrs.period || ['am', 'pm', 'eve'];
      activeMarker.exAttrs.hours = activeMarker.exAttrs.hours || 2.0;

      activeMarker.setMap(map);

      popupEditor();
    }
  };

  google.maps.event.addListener(editorWin, 'domready', function(){
    $.each(activeMarker.exAttrs.period, function(i, p){
      $('#input-check-'+p).attr('checked', true);
    });    
    $('#hours-input').val(activeMarker.exAttrs.hours);
    $('#name-input').val(activeMarker.getTitle());

    if (addedMarkers.indexOf(activeMarker) < 0) {
      $('#btn-add-remove').text('Add').off('click').on('click', function(event){
        addMarker();
      });
    } else {
      $('#btn-add-remove').text('Remove').off('click').on('click', function(event){
        removeMarker();
      });
    }
  });

  google.maps.event.addListener(editorWin, 'closeclick', function(){
    if (addedMarkers.indexOf(activeMarker) < 0) {
      activeMarker.setMap(null);
    } else {
      updateMarker();
    }
    activeMarker = null;
  });

  var hideEditor = function() {
    editorWin.close();
  };

  var popupEditor = function() {
    editorWin.open(map, activeMarker);
  };

  var updateMarker = function() {
    var marker = activeMarker;
    var period = [];
    $('.period-check:checked').each(function(){
      period.push($(this).val());
    });
    marker.exAttrs.period = period;
    marker.exAttrs.hours = parseFloat($('#hours-input').val());
    marker.setTitle($('#name-input').val());
  };

  var addMarker = function() {
    updateMarker();

    var marker = activeMarker;
    activeMarker = null;
    
    if (addedMarkers.indexOf(marker) < 0) {
      addedMarkers.push(marker);
      google.maps.event.addListener(marker, 'click', function(){
        activateMarker(this);
      });
    }

    hideEditor();
  };

  var removeMarker = function() {
    var marker = activeMarker;
    activeMarker = null;
    hideEditor();

    var i = addedMarkers.indexOf(marker);
    if (i >= 0) {
      addedMarkers.splice(i, 1);
    }
    marker.setMap(null);
  };

  var btnUpload = $('#btn-upload');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(btnUpload[0]);

  btnUpload.on('click', function(){
    postData();
  });

  var simplifyMarkers = function(markers) {
    return $.map(markers, function(marker){
      return {
        'position': marker.getPosition().toString(),
        'name': marker.getTitle(),
        'period': marker.exAttrs.period,
        'hours': marker.exAttrs.hours
      }
    });
  }

  var postData = function() {
    $.ajax({
      type: 'POST',
      url: '/data/new',
      contentType: 'application/json',
      data: JSON.stringify({
        markers: simplifyMarkers(addedMarkers)
      }),
      success: function(data, status, xhr){
        alert(data);
      },
      error: function(xhr, error, exception){
        alert(error);
      }
    });
  };
}

google.maps.event.addDomListener(window, 'load', initialize);