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

        if(window.isphone) {
            console.log("deviceready");
            document.addEventListener("deviceready", this.onDeviceReady, false);
        } else {
            app.onDeviceReady();
        }
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        console.log("function onDeviceReady");

        $.getJSON( "http://admin.unowifi.com/api/getUID/?callback=?", function( data ) {
            app.geoMe(data.uid);
            app.getShops(data.uid);
        });

        window.MacAddress.getMacAddress(
            function(macAddress) {
                console.log(macAddress);
                globalOptions.macAddress = macAddress;
            },function(fail) {console.log(fail);}
        );
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

    geoMe: function(uid) {
        console.log("function geoMe");

        $('#map').height( $(window).height() - $('#map').offset().top );

        /* Centro el mapa en Montevideo */
        map = L.map('map', {
          center: [-34.90,-56.1624],
          zoom: 13,
          touchZoom: true,
          scrollWheelZoom: true,
          attributionControl: false
        });

        /* Dibujo el mapa... */
        //L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
        L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
            key: 'b34dc08e5d814c01b618f58dde4c7303',
            styleId: 121193
        }).addTo(map);

        /* Localizo al usuario en el mapa */
        var lc = L.control.locate({
            position: 'topright',  // set the location of the control
            drawCircle: true,  // controls whether a circle is drawn that shows the uncertainty about the location
            follow: true,  // follow the location if `watch` and `setView` are set to true in locateOptions
            stopFollowingOnDrag: true, // stop following when the map is dragged if `follow` is set to true (deprecated, see below)
            circleStyle: {},  // change the style of the circle around the user's location
            markerStyle: {},
            followCircleStyle: {},  // set difference for the style of the circle around the user's location while following
            followMarkerStyle: {},
            circlePadding: [0, 0], // padding around accuracy circle, value is passed to setBounds
            metric: true,  // use metric or imperial units
            onLocationError: function(err) {alert(err.message)},  // define an error callback function
            onLocationOutsideMapBounds:  function(context) { // called when outside map boundaries
                    alert(context.options.strings.outsideMapBoundsMsg);
            },
            setView: true, // automatically sets the map view to the user's location
            strings: {
                title: "Mostrar donde estoy",  // title of the locat control
                popup: "Estas a un máximo de {distance} metros de este punto",  // text to appear if user clicks on circle
                outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
            },
            locateOptions: {
                maxZoom: 13, 
                enableHighAccuracy: true}  // define location options e.g enableHighAccuracy: true
        }).addTo(map);

        /* Localizo por defecto al usuario */
        lc.locate();

    },

    getShops: function(uid) {
        console.log("function getShops");

        /* Obtengo y muestro los datos del lugar */
        $.getJSON( "http://admin.unowifi.com/api_catalog/getAllPoints/100/?callback=?", function( data ) {

            if(data.marks.length > 0){
                var items = [];
                $.each( data.marks, function( key, val ) {
/*
                'idLocal' 'localName' 'localAddress' 'localTel' 'localDescription' 'localLocation'
*/
                    if( val.localLocation != false ){
                        var geo = val.localLocation.split(','); // Posicion del destino
                        //var distancia = getDistanceFromLatLonInKm(geo[0],geo[1],globalOptions.nowLat,globalOptions.nowLon);

                        var popupContent = "<strong>" + val.localName + "</strong><br />";
                        popupContent = popupContent + val.localAddress + "<br>";
                        popupContent = popupContent + "<a href='#'>Ver detalles</a><br />";
                        popupContent = popupContent + "<button onclick=\"window.plugins.socialsharing.share('Message, subject, image and link', 'The subject', 'https://www.google.nl/images/srpr/logo4w.png', 'http://unowifi.com')\">message, subject, image and link</button>";

                        L.marker([geo[0],geo[1]]).addTo(map)
                            .bindPopup(popupContent);

                    }

                });

            }

        });
    }

};


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