$(function() {
	
	// global app object
	var SLCBOG = (function() {
		// global position variables for geolocation
		var latitude;
		var longitude;
		// global variable to access nearest stores to user
		var selectedStores = [];
		// global variable to store products into an array
		var productArray = [];
		
		// let's find out where you are
		navigator.geolocation.getCurrentPosition(findStores);

		// handle searching for alcohol
		$('#alcoholSearch').submit(function(e) {
			e.preventDefault();
			
			// get the user's current location to find the nearest stores
			var queryResult = $('#searchProduct').val();
			getBeers(selectedStores, queryResult);
			checkDeals(selectedStores, queryResult);
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


		function checkDeals(stores, queryResult) {
			$.ajax({
				url: 'https://lcboapi.com/products?store=' + stores[0].id + '&q=' + queryResult + '&where=has_limited_time_offer&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
				method: 'GET',
				dataType: 'jsonp',
				headers: {
					Authorization: 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
					Accept: 'application/vnd.api+json'	
				},
				crossDomain: true
			}).then(function(deals) {
				var bestDealPrice = 0;
				var bestProduct = [];
				productArray = [];
				// pushing our search results into an array
				for (var i = 0; i < deals.result.length; i++) {
					if (!deals.result[i].is_dead && deals.result[i].has_limited_time_offer)
						productArray.push(deals.result[i]);
				}
				
				// parsing through data to find the largest savings
				for (var i = 0; i < productArray.length; i++) {
					if (productArray[i].limited_time_offer_savings_in_cents >= bestDealPrice) {
						bestProduct.push(productArray[i]);
					}
				}

				// displays alcohol with the best savings
				for (var i = 0; i < bestProduct.length; i++) {
					console.log(bestProduct[i].name + " " + bestProduct[i].package + " has a savings of $" + bestProduct[i].limited_time_offer_savings_in_cents / 100 + " and is priced at $" + bestProduct[i].price_in_cents / 100);
				}

				ounceConvert(bestProduct[0]);
				console.log(bestProduct);

			});
		}

		function ounceConvert(product) {
			var ounceVolume;

			if (product.primary_category == "Spirits") {
				ounceVolume = product.volume_in_milliliters / 29.6;
				console.log(ounceVolume);
			}
		}

	})();

});