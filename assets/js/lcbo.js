$(function() {
	'use strict';

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
		// how weird are things getting tonight?
		var litLevel;
		// let's search for some fun stuff
		var litParameter;
		
		// let's find out where you are
		navigator.geolocation.getCurrentPosition(findStores);

		// handle searching for alcohol
		$('#alcoholSearch').submit(function(e) {
			e.preventDefault();
			// find deals from the current store and a searched value
			scanProducts(currentStore, $('#searchProduct').val());
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
				console.log("We found some stores!");

				// now we can initialize our map
				// var map = new google.maps.Map(document.getElementById('map'), {
    //       			zoom: 15,
    //       			center: {lat: latitude, lng: longitude},
    //       		});

    //       		var userMarker = new google.maps.Marker({
    //       			position: {lat: latitude, lng: longitude},
    //       			map: map,
    //       			title: 'User Location'
    //       		});

    //       		var storeMarker = new google.maps.Marker({
    //       			position: {lat: currentStore.latitude, lng: currentStore.longitude},
    //       			map: map,
    //       			title: 'Store Location'
    //       		});
			});
		}

		function changeCurrentStore() {
			
		}

		function scanProducts(closestStore, queryResult) {
			// split queryResult into an array
			queryResult = queryResult.split(" ");
			// how lit are we getting tonight?
			litLevel = $('#turntLevel').val();
			if (litLevel == "tipsy")
				litParameter = 'sort=limited_time_offer_savings_in_cents.desc,total_package_units.desc';
			if (litLevel == "fully lit") {
				litParameter = 'order=alcohol_content.desc';
				console.log("Hello");
			}

			// get all of the products
			$.ajax({
				url: urlPrefix + '/products?' + litParameter + '&store=' + closestStore.id + '&q=' + queryResult[0] + urlSuffix,
				method: 'GET',
				dataType: 'jsonp',
				crossDomain: true
			}).then(function(products) {
				// clear previous results
				resultArray = [];
				// filter and create new product objects to display on page
				for (var i = 0; i < products.result.length; i++) {
					if (!products.result[i].is_dead) {
						resultArray.push({
							name : products.result[i].name,
							content: (products.result[i].alcohol_content / 100) + '%',
							price : parseFloat(Math.round(products.result[i].price_in_cents) / 100).toFixed(2),
							package : parsePackage(products.result[i]),
							units : products.result[i].total_package_units,
							packageType : products.result[i].package_unit_type,
							savings : (products.result[i].limited_time_offer_savings_in_cents) / 100,
							saleEnd : timeRemainingForDeal(closestStore, products.result[i]),
							category : products.result[i].primary_category,
							volume : ounceConvert(products.result[i]),
							description : products.result[i].serving_suggestion,
							productUpdate : products.result[i].updated_at
						});
					}
				}
				// display the results in our console
				console.log(resultArray);

				var template = $('#drinkTemplate').html();
				var html = Mustache.to_html(template, {resultArray : resultArray});
				$('.drinks').html(html);
			});
	
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

		function parsePackage(product) {
			var productSplit;
			if (product.total_package_units > 1) {
				productSplit = product.package.split("x")[1] + "S";
				console.log(productSplit);
				return productSplit;
			}
			return product.package;
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

		function timeRemainingForDeal(store, product) {
			// check if there is a deal
			if (product.has_limited_time_offer) {
				// get expiration date and current date
				var parsedDate = product.limited_time_offer_ends_on.split('-');
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
		}
		
	}();

});