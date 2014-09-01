//Photos and Feises collections

define(['underscore','backbone','js/models'], function(_, Backbone, Models) {

	var Photos = Backbone.Collection.extend({
		model: Models['Photo'],
		url: "php/add-photo.php"
	});

	var Feises = Backbone.Collection.extend({
		initialize: function(models,options){
			this.dancerid = options.dancerid;
		},
		model: Models['Feis'],
		url: "json/feises.json"
	});

	return {
		'Photos': Photos,
		'Feises': Feises
	}
});