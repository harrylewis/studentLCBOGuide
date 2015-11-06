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
		// global variable to store results into an array
		var resultArray = [];
		// global variable to store deal results into an array
		var dealArray = [];
		
		// let's find out where you are
		navigator.geolocation.getCurrentPosition(findStores);

		// set up the app
		$('.drink').height(window.innerHeight);

		// handle searching for alcohol
		$('#alcoholSearch').submit(function(e) {
			e.preventDefault();
			// find deals from the current store and a searched value
			scanProducts(currentStore, $('#searchProduct').val());
		});

		// fun input handling
		// $('#searchProduct').keypress(function(e) {
		// 	$(e.currentTarget)
		// 		.removeClass('drink__search__input--typing')
		// 		.addClass('drink__search__input--typing')
		// 		.on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function(e) {
		// 			$(e.currentTarget).removeClass('drink__search__input--typing');
		// 		});
		// })

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

		function scanProducts(closestStore, queryResult) {
			$.ajax({
				url: urlPrefix + '/products?order=limited_time_offer_savings_in_cents.desc&store=' + closestStore.id + '&q=' + queryResult + urlSuffix,
				method: 'GET',
				dataType: 'jsonp',
				crossDomain: true
			}).then(function(products) {
				// clear resultArray
				resultArray = [];

				// pushing our search results into an array
				for (var i = 0; i < products.result.length; i++) {
					// checking if the product is not dead
					if (!products.result[i].is_dead)
						resultArray.push(products.result[i]);
				}

				// print deals on the product search, if any
				printDeals(resultArray);

			});		
		}

		function printDeals(productResult) {
			for (var i = 0; i < productResult.length; i++) {
				if (productResult[i].has_limited_time_offer)
					console.log(productResult[i].name + " " + productResult[i].package + " has a savings of $" + productResult[i].limited_time_offer_savings_in_cents / 100 +
					" and is priced at $" + productResult[i].price_in_cents / 100 + ".");
				else
					console.log(productResult[i].name + " " + productResult[i].package + " is priced at $" + productResult[i].price_in_cents / 100 + ".");					

			}
		}

		function ounceConvert(product) {
			var ounces;
			if (product.hasOwnProperty("primary_category") && product.primary_category == "Spirits") {
				ounces = Math.round(product.volume_in_milliliters / 29);
				// case one - 26 ounces
				if (ounces == 25 || ounces == 27)
					ounces = 26;
				// case two - 40 ounces
				else if (ounces == 39 || ounces == 41)
					ounces = 40;
				// case three - 60 ounces
				else if (ounces == 59 || ounces == 61)
					ounces = 60;
				console.log(ounces);
			}
		}

		function opHours(store, day) {
			var open = 0;
			var close = 0;
			// starts from 0 - Sunday
			switch(day) {
				case 0:
					open 	= store.sunday_open;
					close 	= store.sunday_close;
				break;
				case 1:
					open 	= store.monday_open;
					close 	= store.monday_close;
				break;
				case 2:
					open 	= store.tuesday_open;
					close 	= store.tuesday_close;
				break;
				case 3:
					open 	= store.wednesday_open;
					close 	= store.wednesday_close;
				break;
				case 4:
					open 	= store.thursday_open;
					close 	= store.thursday_close;
				break;
				case 5:
					open 	= store.friday_open;
					close 	= store.friday_close;
				break;
				case 6:
					open 	= store.saturday_open;
					close 	= store.saturday_close;
				break;
			}
			// return parsed open and close hours in 24 hour time
			return { o : { h : open / 60 , m : open % 60 } , c : { h : close / 60 , m : close % 60 } };
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