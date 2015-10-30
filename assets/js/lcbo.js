$(function() {
	
	// global app object
	var SLCBOG = (function() {

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

		navigator.geolocation.getCurrentPosition(showPosition);

		function showPosition(position) {
			console.log(position);
			console.log(position.coords.latitude);
			console.log(position.coords.longitude);
			$.ajax({
				url: 'https://lcboapi.com/stores?lat=' + position.coords.latitude + '&lon=' + position.coords.longitude + '&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
				method: 'GET',
				dataType: 'jsonp', 
				headers: {
					Authorization: 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
					Accept : 'application/vnd.api+json'
				},
				crossDomain	: true
			}).then(function(data) {
				console.log(data);
				for (var i = 0; i < data.result.length; i++)
			  		console.log(data.result[i]);
			  	// find beer at a place
			  	$.ajax({
					url: 'https://lcboapi.com/products?store=' + data.result[0].id + '&q=coors+light&access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
					method: 'GET',
					dataType: 'jsonp', 
					headers: {
						Authorization: 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
						Accept : 'application/vnd.api+json'
					},
					crossDomain	: true
				}).then(function(data) {
					console.log(data);
					for (var i = 0; i < data.result.length; i++)
				  		console.log(data.result[i]);
				  	// find beer at a place
				  	
				});
			});
		}

	})();
					
});