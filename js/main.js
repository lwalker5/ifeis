requirejs.config({
	'baseUrl': '/ifeis',
	'paths': {
		'jquery':'https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min',
		'underscore':'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min',
		'backbone':'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/0.9.2/backbone-min',
		'handlebars':'js/libs/handlebars-v1.3.0',
		'swiper':'js/idangerous.swiper'
	},
	'shim': {
		'underscore':{
			'exports':'_'
		},
		'backbone': {
			'deps': ['jquery','underscore'],
			'exports':'Backbone'
		},
		'handlebars': {
			'exports': 'Handlebars'
		}
	}
});

require(['js/ifeis'], function(iFeis) {
	iFeis.initialize(); 
})