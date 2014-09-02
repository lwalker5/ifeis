//Router - controls the navigation

define(['jquery','handlebars','underscore','backbone','js/manager',
		'js/collections','js/models','js/views/user_view','js/views/my_feises_view',
		'js/views/feis_page_view','js/views/customize_page_view'],
		function($, Handlebars, _, Backbone, ViewManager,
				 Collections, Models, UserView, MyFeisesView,
				 FeisPageView, CustomizePageView) {

			var Router = Backbone.Router.extend({
				routes: {
					'profile' : 'profileRoute',
					'my_feises' : 'feisListRoute',
					'feises/:id' : 'feisPageRoute',
					'settings' : 'settingsRoute',
					'customize' : 'customizeRoute'
				},
				initialize: function() {
					this.dancer = new Models['User']({id: 1});
					this.feises = new Collections['Feises']([],{dancerid: 1});
					//this.dancer.fetch();
					this.feises.fetch({data:{ dancerid : this.feises.dancerid }});
					_.bindAll(this, 'feisPageRoute');
					this.Manager = new ViewManager();
				},
				profileRoute: function() {
					var userView = new UserView({ id: 'profile', model: this.dancer });
					this.Manager.show(userView);
				},
				feisListRoute: function() { 
					var myfeisesview = new MyFeisesView({ id: 'feises', collection: this.feises });
					this.Manager.show(myfeisesview);
				},
				feisPageRoute: function(id) {
					var feispageView = new FeisPageView({model: this.feises.get(id), collection: this.feises, id: 'feis-page', dancer: this.dancer });
					this.Manager.show(feispageView);
				},
				customizeRoute: function() {
					var customView = new CustomizePageView({model: this.dancer});
					this.Manager.show(customView);
				}
			});

			return Router;
		});