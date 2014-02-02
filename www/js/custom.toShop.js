globalOptions = new Object();

/* Funciones personalizadas de UNO */
function IniciarAplicacion(){
	var a = location.pathname.split("/");

	$.getJSON( "http://admin.unowifi.com/api/getUID/?callback=?", function( data ) {
		main(a[2], data.uid);	
	});

};

$(window).scroll(function(){
	fixHeader();
});


/* Funciones y código principal */
main = function(idClient, uid){
	console.log("function main");
	
	/* Si el tercer argumento es un numero de cliente, busco la info del mismo para mostrar */
	if ( !isNaN(idClient) && idClient > 0 ) {
		$( "#content" ).load( "info.html", function() {
			
			getGenericInfo(idClient);
			getCatalog(idClient);
		});
	}else {
		$( "#content" ).load( "list.html", function() {
			geoMe(uid);
			//y luego que termina geoMe ejecuta un getShops();
		});
	}

}

getCatalog = function(idClient){
	console.log("function getCatalog");

	/* Obtengo y muestro los datos del lugar */
	$.getJSON( "http://admin.unowifi.com/api/getCatalog/" + idClient + "?callback=?", function( data ) {

		if(data.catalog.length > 0){
			var items = [];
			$.each( data.catalog, function( key, val ) {

				$('#articleTemplate').clone().attr('id', "item_" + val.idItem).appendTo('#catalogContainer');

				$( "#item_" + val.idItem + " #title" ).html(val.title);
				$( "#item_" + val.idItem + " #description" ).html(val.description);
				$( "#item_" + val.idItem + " #price" ).html(val.price);
				$( "#item_" + val.idItem + " #circle" ).html(val.cat.substr(0,1).toUpperCase());

				$( "#item_" + val.idItem ).removeClass( "hide" );
			});

			$( "#catalogBtn" ).removeClass( "hide" );
			$( "#catalog" ).removeClass( "hide" );
		}

	});
};

getGenericInfo = function(idClient, uid){
	console.log("function getGenericInfo");

	/* Obtengo y muestro los datos del lugar */
	$.getJSON( "http://admin.unowifi.com/api/getGenericInfo/" + idClient + "/" + uid + "?callback=?", function( data ) {

		$( "#shopTitle" ).html(data.customersOptions.companyName);
		$( "#logo" ).attr("src", "http://admin.unowifi.com/api/getLogo/" + idClient);
		$( "#shopAddress" ).html(data.customersOptions.companyAddress);
		$( "#callto" ).attr("href", "tel:" + data.customersOptions.companyTel);

		$( "#shopDescription" ).html(data.customersOptions.companyDescription);
		$( "#shopNote" ).html(data.customersOptions.companyNote);
		$( "#shopFeature" ).html(data.customersOptions.companyFeature);
		if( data.customersOptions.companySuggestion ){
			$( "#shopSuggestion" ).html(data.customersOptions.companySuggestion);
			$( "#shopSuggestionDiv" ).removeClass("hide");
		}


		if(data.customersOptions.companyIsOpen > 0)
			$("#label_open").removeClass("hide");
		else
			$("#label_close").removeClass("hide");
		
		$( "#shopOpenTime" ).html(data.customersOptions.companyOpentime);

		if(data.userInfo){
			$( "#visitCount" ).html(data.userInfo.visitCount);
			$( "#rankingPosition" ).html(data.userInfo.rankingPosition);
			if(data.userInfo.pointsCount.points > 0 )
				$( "#pointsCount" ).html(data.userInfo.pointsCount.points);
			else
				$( "#pointsCount" ).html("-");

			$( "#userInfo" ).show();
		}

		/* Muestro los enlaces a redes sociales */
		if(data.customersOptions.companyWebsite){
			$("#connectionWebsite").attr("href", data.customersOptions.companyWebsite);
			$("#connectionWebsite").removeClass("hide");

		}
		if(data.customersOptions.companyFacebook){
			$("#connectionFacebook").attr("href", data.customersOptions.companyFacebook);
			$("#connectionFacebook").removeClass("hide");
		}
		if(data.customersOptions.companyTwitter){
			$("#connectionTwitter").attr("href", data.customersOptions.companyTwitter);
			$("#connectionTwitter").removeClass("hide");
		}
		if(data.customersOptions.companyGooglePlus){
			$("#connectionGooglePlus").attr("href", data.customersOptions.companyGooglePlus);
			$("#connectionGooglePlus").removeClass("hide");
		}
		if(data.customersOptions.companyFoursquare){
			$("#connectionFoursquare").attr("href", data.customersOptions.companyFoursquare);
			$("#connectionFoursquare").removeClass("hide");
		}
		


		/* Dibujo el mapa y lo localizo */
		var geo = data.customersOptions.companyLocation.split(',');
		drawMap(geo[0], geo[1], data.customersOptions.companyName);
	});
};

getShops = function(uid){
	console.log("function getShops");

	/* Obtengo y muestro los datos del lugar */
	$.getJSON( "http://admin.unowifi.com/api/getAllShops/15/" + uid + "?callback=?", function( data ) {

		if(data.shops.length > 0){
			var items = [];
			$.each( data.shops, function( key, val ) {
				$('#articleTemplate').clone().attr('id', "item_" + val.idClient).appendTo('#info');
				$( "#item_" + val.idClient + " #logo" ).attr("src", "http://admin.unowifi.com/api/getLogo/" + val.idClient);
				$( "#item_" + val.idClient + " #title" ).html(val.companyName);
				$( "#item_" + val.idClient + " #description" ).html(val.companyDescription);
				$( "#item_" + val.idClient + " #address" ).html(val.companyAddress);
				$( "#item_" + val.idClient + " #link").attr("href", "/customer/" + val.idClient);
				$( "#item_" + val.idClient + " #callto").attr("href", "tel:" + val.companyTel);

				if(val.companyIsOpen > 0)
					$( "#item_" + val.idClient + " #userData #label_open").removeClass("hide");
				else
					$( "#item_" + val.idClient + " #userData #label_close").removeClass("hide");

				if(val.userInfo){
					// $( "#item_" + val.idClient + " #userData #visits" ).html(val.userInfo.visitCount);
					$( "#item_" + val.idClient + " #userData #points" ).html(val.userInfo.pointsCount.points);
					$( "#item_" + val.idClient + " #userData" ).removeClass( "hide" );

					if(!isNaN(val.userInfo.pointsCount.points))
						$( "#item_" + val.idClient + " #userData #label_points" ).hide();

				}

				if( !isNaN(globalOptions.nowLat) && val.companyLocation != false){
					var geo = val.companyLocation.split(','); /* Posicion del destino */
					var distancia = getDistanceFromLatLonInKm(geo[0],geo[1],globalOptions.nowLat,globalOptions.nowLon);
					// $( "#item_" + val.idClient + " #distance").html( "(" + (Math.round(distancia * 100)/100).toFixed(2) + " km)");
					$( "#item_" + val.idClient).attr("data-sort", Math.round(distancia * 100).toFixed(0));

				//}else{
					// $( "#item_" + val.idClient + " #distance").hide();
				}

				$( "#item_" + val.idClient ).click(function(){ 
					/* Cuando hago click en el div, lleva al detalle */
					$(location).attr('href', "/customer/" + val.idClient);
				});

			});

		    var sortedDivs = $("#info").find(".order").toArray().sort(sorter);
		    $.each(sortedDivs, function (index, value) {
		        $("#info").append(value);
		    });

		    $.each( data.shops, function( key, val ) {
				$( "#item_" + val.idClient ).removeClass( "hide" );
		    });
		}

	});
};

geoMe = function(uid){
	console.log("function geoMe");

	GMaps.geolocate({
	  success: function(position) {
	  	globalOptions.nowLat = position.coords.latitude;
		globalOptions.nowLon = position.coords.longitude;

		drawMap(position.coords.latitude, position.coords.longitude, "Estas aquí");
	  },
	  error: function(error) {
	    $('#navbar').height(0);
	    $("#navbar").hide();
	    fixHeader();
	    $('body').css( "padding-top", "7px");
	  },
	  always: function(){
	  	getShops(uid);
	  }
	});

}

fixHeader = function(){
	return false;
	/*
	var nuevaAltura = $('.affix').height();

	if( nuevaAltura > 1 )
		var nuevaAltura = nuevaAltura + 7;
	else
		var nuevaAltura = 0;

    var styles = {
      "padding-top": nuevaAltura + "px",
      "margin-top": "-" + nuevaAltura + "px"
    };
	
	$('body').css( "padding-top", nuevaAltura + "px");
    $("#info").css( styles );
    $("#catalog").css( styles );
    */
};

function drawMap(latitude, longitude, message){
		gmap_markers = new GMaps({
			el: '#gmap_marker',
			lat: latitude,
			lng: longitude,
			mapTypeControl: false,
			scaleControl: false,
			streetViewControl: false,
			scrollwheel: false,
			draggable: false,
			panControl: false,
			zoom: 16
		});
		gmap_markers.addMarker({
			lat: latitude,
			lng: longitude,
			title: message
		});
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