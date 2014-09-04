//Router - controls the navigation

define(['jquery','handlebars','underscore','backbone','manager',
		'collections','models','views/user_view','views/my_feises_view',
		'views/feis_page_view','views/customize_page_view'],
		function($, Handlebars, _, Backbone, ViewManager, 
				 Collections, Models, UserView, MyFeisesView,
				 FeisPageView, CustomizePageView) {

			Handlebars.registerHelper('feisAge', function(object) {
				var today = new Date(); //Today's date

				var dateArray = object.birthday.split('-');
				var birthday = new Date(dateArray[0],dateArray[1]-1,dateArray[2]); //Dancer birthday

				var birthYear = birthday.getFullYear();
				var feis_age = 'U18';
				if (birthYear <= 1995) {
					feis_age = 'O18'; 
				}
				else {feis_age = 'U' + (today.getFullYear() - birthYear); }
				return new Handlebars.SafeString(feis_age);
			});

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