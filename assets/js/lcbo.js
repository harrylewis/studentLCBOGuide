$(function() {
	
	// global app object
	var SLCBOG = (function() {
		// global position variables for geolocation
		var latitude;
		var longitude;
		// global variable to access nearest stores to user
		var selectedStores = [];
		
		// let's find out where you are
		navigator.geolocation.getCurrentPosition(findStores);

		// handle searching for alcohol
		$('#alcoholSearch').submit(function(e) {
			e.preventDefault();
			
			// get the user's current location to find the nearest stores
			var queryResult = $('#searchProduct').val();
			getBeers(selectedStores, queryResult);
			checkDeals(selectedStores);
		});

		function findStores(position) {
			// first we need to set the coordinates of the user
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			console.log(latitude);
			console.log(longitude);

			// now we can find the nearest store within a radius
			var distance = 5000;

			$.ajax({
				url: 'https://lcboapi.com/stores?lat=' + latitude + '&lon=' + longitude + '&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
				method: 'GET',
				dataType: 'jsonp',
				headers: {
					Authorization: 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
					Accept: 'application/vnd.api+json'
				},
				crossDomain: true
			}).then(function(data) {
				// display stores
				// console.log(data);
				for (var i = 0; i < data.result.length; i++) {
					if (!data.result[i].is_dead && data.result[i].distance_in_meters < distance)
						selectedStores.push(data.result[i]);
				}

				for (var i = 0; i < selectedStores.length; i++)
					console.log(selectedStores[i]);
			});
		}

		function getBeers(stores, queryResult) {
			$.ajax({
				url: 'https://lcboapi.com/products?store=' + stores[0].id + '&q=' + queryResult + '&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
				method: 'GET',
				dataType: 'jsonp',
				headers: {
					Authorization: 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
					Accept: 'application/vnd.api+json'
				},
				crossDomain: true
			}).then(function(products) {
				console.log(products);
			});
		}


		function checkDeals(stores) {
			$.ajax({
				url: 'https://lcboapi.com/products?store=' + stores[0].id + '&where=has_limited_time_offer&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
				method: 'GET',
				dataType: 'jsonp',
				headers: {
					Authorization: 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
					Accept: 'application/vnd.api+json'	
				},
				crossDomain: true
			}).then(function(deals) {
				console.log(deals);
			});
		}

	})();

});