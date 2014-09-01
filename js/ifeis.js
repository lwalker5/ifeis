//Bootstrap - Start here!
//Lindsay Walker - iFeis 2014

define(['jquery','backbone','js/router','js/views/header_view'], function($, Backbone, Router, HeaderView) {
	
	var initialize = function() {

		Backbone.View.prototype.event_aggregator = _.extend({}, Backbone.Events);
		Backbone.View.prototype.close = function(){
		  this.$el.empty(); //clear the area
		  this.undelegateEvents();
		  this.event_aggregator.unbind("showForm","addFeis:add"); 
		  this.unbind();
		  if (this.model) { this.model.unbind( 'change', this.render, this ); } //don't want hidden views re-rendering on model change 
		}

		header_view = new HeaderView({ el: $('header.main') }); //get the navigation set up;
		router = new Router(); 

		Backbone.history.start();
	}

	return {
		initialize: initialize
	};
});
