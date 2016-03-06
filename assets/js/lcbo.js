$(function() {
	'use strict';

	// global app object
	var SLCBOG = function() {
		// API URL prefix and suffix
		var urlPrefix = 'https://lcboapi.com/';
		var urlSuffix = '&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk';
		// global firebase reference
		var ref;
		// coords for geolocation
		var latitude = 0;
		var longitude = 0;
		// global variable to access nearest stores to user
		var filteredStores = [];
		var currentStore;
		// global variable to store results into an array
		var resultArray = [];
		// how weird are things getting tonight?
		var litLevel;
		var litParameter;
		// some funny names
		var nameArray = ["Anita Gibbs", "Angelo Barker", "Alfonze Carpenter", "Emilio Foster",
						 "Jody Santos", "Karl Jones", "Edna Sharp", "Miguel O'Brien",
						 "Gertrude Thornton", "Muriel Wells", "Angelina Welch", "Tammy James",
						 "Gregory Stokes", "Valerie Guzman", "Beth Franklin", "Pedro Sparks"];
		
		// let's listen for other people
		var drinksRef = new Firebase("https://liquorcabinet.firebaseIO.com/drinks");
		// appending the results
		drinksRef.limitToLast(1).on("child_added", function(snap) {
			console.log(snap.val().drinkName);
			findCity(snap.val().latitude, snap.val().longitude);
			displayRealTime(snap.val().drinkName, findCity(snap.val().latitude, snap.val().longitude), nameArray[Math.floor(Math.random() * myArray.length)]);
		});

		// let's find out where you are
		navigator.geolocation.getCurrentPosition(findStores);

		// handle searching for alcohol
		$('#alcoholSearch').submit(function(e) {
			e.preventDefault();
			// find deals from the current store and a searched value
			scanProducts(currentStore, $('#searchProduct').val());
			var drinksRef = ref.child("drinks");
			drinksRef.push().set({
				drinkName: $('#searchProduct').val(),
				latitude: latitude,
				longitude: longitude
			});
		});

		function findStores(position) {
			// set the coordinates
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			// set our Firebase reference
			ref = new Firebase("https://liquorcabinet.firebaseIO.com");
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
				$('.loc:nth-of-type(1)').children('.loc__id').children('.loc__name').text(filteredStores[0].name);
				$('.loc:nth-of-type(2)').children('.loc__id').children('.loc__name').text(filteredStores[1].name);
				$('.loc:nth-of-type(3)').children('.loc__id').children('.loc__name').text(filteredStores[2].name);
				// let's find out when our stores close
				getStoreStatus(filteredStores[0]);
				getStoreStatus(filteredStores[1]);
				getStoreStatus(filteredStores[2]);
				$('.loc:nth-of-type(1)').children('.loc__id').children('.loc__hours').text(getStoreStatus(filteredStores[0]));
				$('.loc:nth-of-type(2)').children('.loc__id').children('.loc__hours').text(getStoreStatus(filteredStores[1]));
				$('.loc:nth-of-type(3)').children('.loc__id').children('.loc__hours').text(getStoreStatus(filteredStores[2]));

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

		function findCity(latitude, longitude) {
			var geocoder = new google.maps.Geocoder;
			var location;
			var latlng = { lat: latitude, lng: longitude };
			geocoder.geocode({'location': latlng}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[1]) {
						location = results[1].formatted_address.split(",")[1];
						location = location.replace(/\s/g, "");
						console.log(location);
					}
					else {
						location = "Outer Space";
						console.log(location);
					}
				}
			});
		}

		function displayRealTime(drink, city, name) {
			
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
			if (litLevel == "fully lit")
				litParameter = 'order=alcohol_content.desc';

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
				productSplit = product.package.split("x")[1] + "s";
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

		function getStoreStatus(store) {
			var date = new Date();
			var dayNumber = date.getDay();
			var difference;
			var units = "hours";
			var storeStatus;

			var storeTime = opHours(store, dayNumber);

			if (date.getHours() > storeTime.o.h && date.getHours() < storeTime.c.h) {
				// the store is open
				difference = Math.abs(storeTime.c.h - date.getHours());
				if (difference == 1) {
					difference = 60 - date.getMinutes();
					units = "minutes";
				}
				storeStatus = "Closes";
			}
			else if (date.getHours() < storeTime.o.h) {
				// the store is closed (morning)
				difference = Math.abs(storeTime.o.h- date.getHours());
				if (difference == 1) {
					difference = 60 - date.getMinutes();
					units = "minutes";
				}
				storeStatus = "Opens";
			}
			else if (date.getHours() > storeTime.c.h) {
				// the store is closed (night)
				if (dayNumber == 6)
					dayNumber = 0;
				else
					dayNumber++;
				storeTime = opHours(store, dayNumber);
				difference = (24 - date.getHours()) + storeTime.o.h;
				if (difference == 1) {
					difference = 60 - date.getMinutes();
					units = "minutes";
				}
				storeStatus = "Opens";
			}
			return (storeStatus + " in " + difference + " " + units);
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