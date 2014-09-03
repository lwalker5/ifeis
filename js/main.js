requirejs.config({
	'baseUrl': '/ifeis',
	'paths': {
		'jquery':'js/libs/jquery-1.11.1.min',
		'underscore':'js/libs/underscore-min',
		'backbone':'js/libs/backbone-min',
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