$(function() {
	
	// global app object
	var SLCBOG = (function() {
		// global position variables for geolocation
		var latitude;
		var longitude;

		// let's find out where you are
		navigator.geolocation.getCurrentPosition(setCoordinates);

		// handle searching for alcohol
		$('#alcoholSearch').submit(function(e) {
			e.preventDefault();
			// get the user's current location to find the nearest stores
			getNearestStores(latitude, longitude, $('#searchProduct').val());
		});

		// pull data from the LCBO object
		// $.ajax({
		// 	url: 'https://lcboapi.com/stores?lat=76.5000&lon=44.2333&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
		// 	method: 'GET',
		// 	dataType: 'jsonp', 
		// 	headers: {
		// 		Authorization: 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
		// 		Accept : 'application/vnd.api+json'
		// 	},
		// 	crossDomain	: true
		// }).then(function(data) {
		// 	console.log(data);
		// 	for (var i = 0; i < data.result.length; i++)
		//   		console.log(data.result[i].name);
		// });

		//navigator.geolocation.getCurrentPosition(getNearestStores);

		// function showPosition(position) {
		// 	console.log(position);
		// 	console.log(position.coords.latitude);
		// 	console.log(position.coords.longitude);
		// 	$.ajax({
		// 		url: 'https://lcboapi.com/stores?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&page=5&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
		// 		method: 'GET',
		// 		dataType: 'jsonp', 
		// 		headers: {
		// 			Authorization: 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
		// 			Accept : 'application/vnd.api+json'
		// 		},
		// 		crossDomain	: true
		// 	}).then(function(data) {
		// 		console.log(data);
		// 		console.log(data.result.length);
		// 		for (var i = 0; i < data.result.length; i++)
		// 	  		console.log(data.result[i]);
		// 	  	console.log(data.result.length);
		// 	  	// find some deals
		// 	  	$.ajax({
		// 			url: 'https://lcboapi.com/products?store=' + data.result[0].id + '&q=vodka&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
		// 			method: 'GET',
		// 			dataType: 'jsonp', 
		// 			headers: {
		// 				Authorization: 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
		// 				Accept : 'application/vnd.api+json'
		// 			},
		// 			crossDomain	: true
		// 		}).then(function(data) {
		// 			//console.log(data);
		// 			for (var i = 0; i < data.result.length; i++)
		// 		  		console.log(data.result[i]);
		// 		  	console.log(data.result.length);
		// 		  	// find beer at a place
				  	
		// 		});
		// 	});
		// }

		function getNearestStores(latitude, longitude, queryResult) {
			var selectedStores = [];
			var distance = 5000;

			$.ajax({
				url: 'https://lcboapi.com/stores?lat=' + latitude + '&lon=' + longitude + '&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
				method: 'GET',
				dataType: 'jsonp',
				headers: {
					Authorization: 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
					Accept : 'application/vnd.api+json'
				},
				crossDomain : true
			}).then(function(data) {
				// display stores
				// console.log(data);
				for (var i = 0; i < data.result.length; i++) {
					if (!data.result[i].is_dead && data.result[i].distance_in_meters < distance)
						selectedStores.push(data.result[i]);
				}

				for (var i = 0; i < selectedStores.length; i++)
					console.log(selectedStores[i]);

				getBeers(selectedStores, queryResult);
			});
		}

		function getBeers(stores, queryResult) {
			$.ajax({
				url: 'https://lcboapi.com/products?store=' + stores[0].id + '&q=' + queryResult + '&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
				method: 'GET',
				dataType: 'jsonp',
				headers: {
					Authorization: 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
					Accept : 'application/vnd.api+json'
				},
				crossDomain : true
			}).then(function(products) {
				console.log(products)
			});
		}

		function setCoordinates(position) {
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			console.log(latitude);
			console.log(longitude);
		}

	})();
					
});