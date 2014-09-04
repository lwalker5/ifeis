//Main iFeis header that includes nav view
//This is the first view rendered and it stays the whole time

define(['jquery','handlebars','underscore','backbone'], function($, Handlebars, _, Backbone) {
	
	var HeaderView = Backbone.View.extend({ 
		events: {
			'click #menu_button': 'toggleNav'
		},
		initialize: function() {
			_.bindAll(this, 'render','toggleNav');
			this.event_aggregator.bind("nav:toggle", this.toggleNav);
			var nav_view = new NavView();
		},
		toggleNav: function() {
			this.$el.next().slideToggle("fast",function() {});
		}
	});

	var NavView = Backbone.View.extend({
		el: 'nav',
		events: {
			'click a' : 'onClick'
		},
		onClick: function(event) {
			this.event_aggregator.trigger("nav:toggle");
			$(event.currentTarget).parent().addClass("selected");
			var sibs = $(event.currentTarget).parent().siblings().toggleClass("selected",false);
		}
	});
	return HeaderView;
});