$(function() {
	
	// global app object
	var SLCBOG = (function() {

		// pull data from the LCBO object
		$.ajax({
			url: 'https://lcboapi.com/products?access_key=MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk',
			method: 'GET',
			dataType: 'json',
			headers: { 'Authorization': 'MDo5ODdkZTJlNC03OGVmLTExZTUtYmFiNC0wM2FkNTRkMjcwOWM6U1pJczR0N2E0VTh0eUFWSVB4ZXFKeGdNblA4V3ZYd041YURk' },
			crossDomain	: true
		}).then(function(data) {
			for (var i = 0; i < data.result.length; i++)
		  		console.log(data.result[i]);
		});

	});
					
});