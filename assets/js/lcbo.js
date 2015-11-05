$(function() {
	
	// global app object
	var SLCBOG = (function() {
		// API URL prefix and suffix
		var urlPrefix = 'https://lcboapi.com/';
		var urlSuffix = '&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk';
		// coords for geolocation
		var latitude;
		var longitude;
		// global variable to access nearest stores to user
		var filteredStores = [];
		var currentStore;
		// global variable to store products into an array
		var productArray = [];
		
		// let's find out where you are
		navigator.geolocation.getCurrentPosition(findStores);

		// handle searching for alcohol
		$('#alcoholSearch').submit(function(e) {
			e.preventDefault();
			// find deals from the current store and a searched value
			checkDeals(currentStore, $('#searchProduct').val());
		});

		function findStores(position) {
			// set the coordinates
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			// a 5000m radius (as the crow flies) for filtering stores
			var maxRadius = 5000;
			// GET stores
			$.ajax({
				url: urlPrefix + 'stores?order=distance_in_meters.asc&lat=' + latitude + '&lon=' + longitude + urlSuffix,
				method: 'GET',
				dataType: 'jsonp',
				crossDomain: true
			}).then(function(data) {
				// filter through stores
				for (var i = 0; i < data.result.length; i++) {
					if (!data.result[i].is_dead && data.result[i].distance_in_meters < maxRadius)
						filteredStores.push(data.result[i]);
				}
				// set current store
				currentStore = filteredStores[0];
				// success
				console.log("The stores have been found");
			});
		}

		function changeCurrentStore() {

		}


		function checkDeals(closestStore, queryResult) {
			$.ajax({
				url: 'https://lcboapi.com/products?store=' + closestStore.id + '&q=' + queryResult + '&where=has_limited_time_offer&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
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

				checkDealDate(bestProduct[0].limited_time_offer_ends_on);
			});
		}

		function ounceConvert(product) {
			if (product.primary_category == "Spirits") {
				console.log(Math.round(product.volume_in_milliliters / 29));
			}
		}

		function checkDealDate(date) {
			// get expiration date and current date
			modifiedDate = date.split('-');
			var dealDate = new Date(modifiedDate[0], modifiedDate[1] - 1, modifiedDate[2]);
			var today = new Date();
			// calculating difference
			dealDate = dealDate.getTime();
			today = today.getTime();
			var difference = dealDate - today;
			// more than a day
			if (difference >= 86400000) {
				var daysRemaining = ((((difference) / 1000) / 60) / 60) / 24;
				console.log("You have " + daysRemaining + " days remaining for this sale.");
			}
			// less than a day
			else if (difference < 86400000) {
				var hoursRemaining = (((difference) / 1000) / 60) / 60;
				console.log("You have " + hoursRemaining + " hours remaining for this sale.");
			}
		}
		
	})();

});