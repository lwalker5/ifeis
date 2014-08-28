//Helper to open and close views
//Found this online

define(['jquery', 'backbone'], function($, Backbone) {

	var Manager = function (Backbone, $){
		var currentView;
		var region = {};

		var closeView = function(view) {
			if (view && view.close) {
				view.close();
			}
		};

		var openView = function (view) {
			view.render();
		};

		region.show = function(view) {
			closeView(currentView);
			currentView = view;
			openView(currentView);
		}
		return region;
	}

	return Manager;
});