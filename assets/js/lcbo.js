$(function() {

	// global app object
	var SLCBOG = function() {
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
		// ajax object
		// function ajaxObj = {
		// 	url: urlPrefix + '/products?order=limited_time_offer_savings_in_cents.desc&store=' + closestStore.id + '&q=' + queryResult[0] + urlSuffix,
		// 	method: 'GET',
		// 	dataType: 'jsonp',
		// 	crossDomain: true
		// }
		
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
			// loading finished
			$('.drink__logo').removeClass('drink__logo--animate');
			$('.drink').removeClass('drink--flex');
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
			// split queryResult into an array
			queryResult = queryResult.split(" ");
			// get all of the products
			$.ajax({
				url: urlPrefix + '/products?order=limited_time_offer_savings_in_cents.desc&store=' + closestStore.id + '&q=' + queryResult[0] + urlSuffix,
				method: 'GET',
				dataType: 'jsonp',
				crossDomain: true
			}).then(function(products) {
				var d = timeRemainingForDeal(closestStore, products.result[0].limited_time_offer_ends_on);
				console.log(d);
				// clear previous results
				resultArray = [];
				// filter and create new product objects to display on page
				for (var i = 0; i < products.result.length; i++) {
					if (!products.result[i].is_dead)
						resultArray.push({
							name : products.result[i].name,
							price : (products.result[i].price_in_cents) / 100,
							package : products.result[i].package,
							packageType : products.result[i].package_unit_type,
							savings : (products.result[i].limited_time_offer_savings_in_cents) / 100,
							saleEnd : products.result[i].limited_time_offer_ends_on,
							category : products.result[i].primary_category,
							volume : ounceConvert(products.result[i]),
							description : products.result[i].serving_suggestion,
							productUpdate : products.result[i].updated_at
						});
				}

				console.log(resultArray)

				// print deals on the product search if any exist
				printDeals(resultArray);

			});

		}

		function printDeals(productResult) {
			// for (var i = 0; i < productResult.length; i++) {
			// 	if (productResult[i].has_limited_time_offer)
			// 		console.log(productResult[i].name + " " + productResult[i].package + " has a savings of $" + productResult[i].limited_time_offer_savings_in_cents / 100 +
			// 		" and is priced at $" + productResult[i].price_in_cents / 100 + ".");
			// 	else
			// 		console.log(productResult[i].name + " " + productResult[i].package + " is priced at $" + productResult[i].price_in_cents / 100 + ".");				
			// }
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
				return ounces;
			}
			else
				return product.volume_in_milliliters;
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

		function timeRemainingForDeal(store, date) {
			// get expiration date and current date
			parsedDate = date.split('-');
			// create date based on when deal ends and modify time to closing time
			var dealDate = new Date(parsedDate[0], parsedDate[1] - 1, parsedDate[2]);
				dealDate.setHours(opHours(store, dealDate.getDay()).c.h);
				dealDate.setMinutes(opHours(store, dealDate.getDay()).c.m);
				dealDate = dealDate.getTime();
			var today = new Date();
				today = today.getTime();
			// get the difference in milliseconds
			var difference = dealDate - today;

			// more than a day
			if (difference >= 86400000)
				// convert for number of days
				return parseInt(((((difference) / 1000) / 60) / 60) / 24) + ' days';
			// less than a day
			else if (difference < 86400000)
				// convert for number of hours
				return parseInt((((difference) / 1000) / 60) / 60) + ' hours';
		}
		
	}();

});