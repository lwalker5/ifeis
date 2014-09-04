requirejs.config({
	'paths': {
		'jquery':'libs/jquery-1.11.1.min',
		'underscore':'libs/underscore-min',
		'backbone':'libs/backbone-min',
		'handlebars':'libs/handlebars-v1.3.0',
		'swiper':'idangerous.swiper'
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

require(['ifeis'], function(iFeis) {
	iFeis.initialize(); 
})