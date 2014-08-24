(function($){
	UserView = Backbone.View.extend({
		initialize: function() {
			this.render();
		},
		render: function() {
			var template = Handlebars.compile($('#user_template').html());
			this.$el.html(template);
		},

		events: function() {

		},

		addFeis: function() {

		}
	});

	var user_view = new UserView({ el: $("#profile") });
})(jQuery);

User = Backbone.Model.extend({
	defaults: {
		name: 'Lindsay',
		level: 'Open',
		firsts: '0',
		seconds: '2',
		thirds: '3'
	}
});

var user = new.User({name: 'Lindsay Walker', level: 'Open Championship', firsts: '0', seconds: '2', thirds: '3'})