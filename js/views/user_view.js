//UserView aka Profile
//Stats and user info, edit user info form (birthday, region, level, etc.)

define(['jquery','handlebars','underscore','backbone','views/form_view'], 
	function($, Handlebars, _, Backbone, FormView) {

	var ProfileView = Backbone.View.extend({
		initialize: function() {
			_.bindAll(this, 'render');
			if (this.model) {
	            this.model.on('change', this.render, this);
	        }
			this.render();
		},
		render: function() {
			var template = Handlebars.compile($('#profile_template').html()),
			result = template(this.model.toJSON());
			this.$el.html(result);
		}
	});

	var UserView = Backbone.View.extend({
		el: '#main',
		events: {
			'click #edit_info_button' : 'showForm'
		},
		initialize: function() {
			_.bindAll(this, 'render','editDancer','showForm','close');
			this.event_aggregator.bind("editDancer", this.editDancer);
	    	//this.model.fetch({success: this.render });
		},
		editDancer: function(formData) {
			formData['id'] = this.model.id;
			formData['page'] = 'profile';
			this.model.set({'name': formData.name, 'birthday': formData.birthday, 'region': formData.region, 'level': formData.level })
			//this.model.save(formData, { success: function () { } });
		},
		render: function() {
			var template = Handlebars.compile($('#user_template').html());
			var context = this.model.toJSON();
			this.$el.html(template);
			this.profileView = new ProfileView({el: $('#profile'), model: this.model});
			this.formView = new FormView({el: $('#edit_info_form'), type: 'settings', model: this.model});
		},
		showForm: function() {
			this.event_aggregator.trigger("showForm");
		},
		close: function() {
			this.profileView.close();
			this.formView.close();
			this.$el.empty();
		  	this.undelegateEvents();
		  	this.unbind();
		}
	});

	return UserView;
});