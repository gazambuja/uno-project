globalOptions = new Object();
map = false;

var app = {
    // Application Constructor
    initialize: function() {
        console.log("initialize...");
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {

        // are we running in native app or in browser?
        window.isphone = false;
        if(document.URL.indexOf("http://") === -1 
            && document.URL.indexOf("https://") === -1) {
            window.isphone = true;
        }

        // PARA PRUEBAS:
        window.isphone = false;

        if(window.isphone) {
            console.log("deviceready");
            document.addEventListener("deviceready", this.onDeviceReady, false);
        } else {
            app.onDeviceReady();
        }

        google.maps.event.addDomListener(window, 'load', app.geoMe());
        google.maps.event.addListenerOnce(map, 'idle', function(){
            $("#map").css({ opacity: 1, zoom: 1 });
            $('#map').addClass('animated bounceInDown');
            $("#loadingDiv").hide();
            app.getShops();
        });
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        console.log("function onDeviceReady");

/*
        $.getJSON( "http://admin.unowifi.com/api/getUID/?callback=?", function( data ) {
            google.maps.event.addDomListener(window, 'load', app.geoMe(data.uid));
            google.maps.event.addListenerOnce(map, 'idle', function(){
                $("#map").css({ opacity: 1, zoom: 1 });
                $('#map').addClass('animated bounceInDown');
                $("#loadingDiv").hide();
        });
*/
        $('body').height( $(window).height() );
        $('#infoWindow').height( $(window).height() - $('#top').height() );

/*      OBTENGO LA DIRECCION MAC */
        if(window.MacAddress){
            window.MacAddress.getMacAddress(
                function(macAddress) {
                    console.log(macAddress);
                    globalOptions.macAddress = macAddress;
                },function(fail) {console.log(fail);}
            );
        }
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) { // I didn't really use this, yet I left it in here as it's in the demo
        var parentElement = document.getElementById(id);
        if(parentElement && typeof(parentElement.type) != "undefined"){
            var listeningElement = parentElement.querySelector('.listening');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');
        }

        console.log('Received Event: ' + id);
    },

    geoMe: function() {
        console.log("function geoMe");

        /* Centro el mapa en Montevideo */
        var mapOptions = {
          center: new google.maps.LatLng(-34.90,-56.1624),
          zoom: 13,
          disableDefaultUI: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map"), mapOptions);

        // Try HTML5 geolocation
        if(navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                                             position.coords.longitude);

            var marker = new google.maps.Marker({
                position: pos,
                map: map,
                icon: {
                    path: fontawesome.markers.LOCATION_ARROW,
                    scale: 0.5,
                    strokeWeight: 0.2,
                    strokeColor: 'black',
                    strokeOpacity: 1,
                    fillColor: '#1d9ce5',
                    fillOpacity: 0.9,
                },
                title: 'Estas aquí!'
            });

            map.setCenter(pos);
          }, function() {
            console.log("No hay servicio de geolocation");
          });
        }

        $('#map').height( $(window).height() - $('#map').offset().top );
    },

    getShops: function() {
        console.log("function getShops");

        /* Obtengo y muestro los datos del lugar */
        $.getJSON( "http://admin.unowifi.com/api_catalog/getAllPoints/100/?callback=?", function( data ) {

            if(data.marks.length > 0){
                var items = [];
                $.each( data.marks, function( key, val ) {
                    if( val.localLocation != false ){
                        var geo = val.localLocation.split(','); // Posicion del destino

                        var markerPoint = new google.maps.Marker({
                            position: new google.maps.LatLng(geo[0],geo[1]),
                            map: map,
                            title: val.localName
                        });

                        google.maps.event.addListener(markerPoint, 'click', function() {
                            showInfo(val);
                            map.panTo( new google.maps.LatLng(geo[0],geo[1]) );
                        });
                    }
                });
                $("#pointsFound").html(data.marks.length);
            }
        });
    }
};


function showInfo(point){
    var content =       "<h2 class='promoTitle clearfix'><img src='http://admin.unowifi.com/api_catalog/getLogo/cards/"+point.idCard+"' class='pull-left img_card'>" + point.promoFeature + "</h2>";
    content = content + "<h4>Detalles de la promoción</h4>" ;
    content = content + "<p>" + point.promoDescription + "</p>" ;
    content = content + "<h4>Conozca más sobre " + point.localName + "</h4>" ;
    content = content + "<p>" + point.localDescription + "</p>";

    $("#local_logo").attr("src", "http://admin.unowifi.com/api_catalog/getLogo/locales/" + point.idLocal);
    $("#infoWindowTitle").html(point.localName + "<br><small>" + point.localAddress + " | <a href='tel:"+point.localTel+"'>" + point.localTel + "</a></small>");

    $("#infoWindowDetails").html(content);
    //$('#infoWindow').modal({backdrop:false});
    $('#infoWindow').modal();
}

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    var redMarker = L.AwesomeMarkers.icon({
      icon: 'dot-circle-o', 
      prefix: 'fa', 
      markerColor: 'red', 
      iconColor: 'white'
    });

    L.marker(e.latlng, {icon: redMarker}).addTo(map)
        .bindPopup("Estás aquí").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function sorter(a, b) {
    return a.getAttribute('data-sort') - b.getAttribute('data-sort');
};



/* Capturo eventos */
$('#infoWindow').on('hidden.bs.modal', function () {
    $("body").height( $(window).height() );
    $('#map').height( $(window).height() - $('#map').offset().top );
});

$(window).resize(function() {
    $("body").height( $(window).height() );
    $('#map').height( $(window).height() - $('#map').offset().top );
});