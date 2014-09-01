define(['underscore','backbone'], function(_, Backbone) {

	var Photo = Backbone.Model.extend({
		url: "php/add-photo.php",
		defaults: {
			pathName: 'path'
		}
	});

	var User = Backbone.Model.extend({
		defaults: { 
			name: 'Lindsay',
			birthday: '1990-10-04',
			region: 'Mid-Atlantic',
			level: 'Open Championship',
			firsts: '0',
			seconds: '1',
			thirds: '0',
			placements: '1'
		}
	});

	var Feis = Backbone.Model.extend({
		defaults: {
			name: 'Inishfree',
			month: 1,
			day: '1',
			year: '2014',
			region: 'MAR',
			place: null,
			competitors: null,
			placementbool: null
		}
	});

	return {
		'Photo': Photo,
		'User': User,
		'Feis': Feis
	}
});