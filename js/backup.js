(function($){

Handlebars.registerHelper('href', function(object) {
  return new Handlebars.SafeString(
    "#/feises/" + object + ""
  );
});

FeisPageView = Backbone.View.extend({
	el: '#main',
	initialize: function() {
		_.bindAll(this,'render');
		this.render();
	},
	render: function() {
		var template = Handlebars.compile($('#feis_page_temp').html());
		this.$el.html(template);
	}
});

User = Backbone.Model.extend({
	defaults: {
		name: 'Lindsay',
		level: 'Open',
		firsts: '0',
		seconds: '2',
		thirds: '3'
	}
});

UserView = Backbone.View.extend({
	el: '#main',
	initialize: function() {
		_.bindAll(this, 'render');
		this.render();
	},
	render: function() {
		var template = Handlebars.compile($('#user_template').html());
		//this.$el.empty();
		this.$el.html(template);
		//return this;
	}
});

Feis = Backbone.Model.extend({
	url: "php/get-feis.php",
	defaults: {
		id: 1,
		name: 'Inishfree',
		month: 1,
		day: '1',
		year: '2014',
		region: 'Mid Atlantic Region',
	}
});

Feises = Backbone.Collection.extend({
	model: Feis,
	url: "php/config.php"
});

FormView = Backbone.View.extend({
	events: {
		'click .cancel': 'toggleMenu',
		'click .submit': 'oK'
	},
	initialize: function() {
		_.bindAll(this, 'render','toggleMenu','initSwipers');
		this.swipers = []
		this.d = this.dataHelper();
		this.event_aggregator.bind("addFeis:showMenu", this.toggleMenu);
		this.render();
		this.initSwipers();
	},
	initSwipers: function() {
		this.swipers['daySwiper'] = $('#date_picker').swiper({
			mode:'vertical',
			slidesPerView: 3,
			loop: true,
			centeredSlides: true,
			watchActiveIndex: true
		});
		this.swipers['monthSwiper'] = $('#month_picker').swiper({
			mode:'vertical',
			slidesPerView: 3,
			loop: true,
			centeredSlides: true,
			watchActiveIndex: true
		});
		this.swipers['yearSwiper'] = $('#year_picker').swiper({
			mode:'vertical',
			slidesPerView: 3,
			initialSlide: 64,
			loop: false,
			centeredSlides: true,
			watchActiveIndex: true
		});
	},
	toggleMenu: function() {
		this.$el.prev().toggleClass('active');
		this.$el.slideToggle("slow",function() {});
	},
	oK: function(event) {
		event.preventDefault();
		this.toggleMenu();

		var formData = {};
		formData['day'] = this.swipers['daySwiper'].activeSlide().data('day');
		formData['month'] = this.swipers['monthSwiper'].activeSlide().data('month');
		formData['year'] = this.swipers['yearSwiper'].activeSlide().data('year');
		formData['name'] = $('#feis_name').val();
		this.event_aggregator.trigger("addFeis:add",formData);
		//return false;
	},
	dataHelper: function() {
		var data = {'day' : [],
				'month' : [],
				'year' : [] };
		for (var d = 1; d <= 31; d++) {
			data['day'][d-1] = d;
		}
		for (var m = 1; m <=12; m++) {
			data['month'][m-1] = {"name" : numToName(m),"num" : m};
		}
		for (var y = 1950; y <=2020; y++) {
			data['year'][y-1950] = y;
		}
		//console.log(data);
		return data;
	},
	render: function() {
		var template = Handlebars.compile($('#form_template').html());
		var result = template(this.d);
		this.$el.html(result);
		//return this;
	}

});

MonthView = Backbone.View.extend({
	tagName: 'li',
	className: 'month',
	initialize: function(options) {
		this.options = options || {};
		this.render();
		_.bindAll(this, 'render');
	},
	render: function() {
		var data = {'month': this.options.name};
		//var data = 'bah';
		var template = Handlebars.compile($('#month_temp').html());
		var result = template(data);
		this.$el.html(result);
		return this;
	}
});

FeisView = Backbone.View.extend({
	tagName: 'li',
	initialize: function() {
		this.render();
		_.bindAll(this, 'render');
	},
	render: function() {
		var template = Handlebars.compile($('#feis_temp').html());
		var context = this.model.toJSON();
		//console.log(this.model.toJSON());
		//console.log(context);
		var html = template(context);
		this.$el.html(html);
		return this;
	}
});

MyFeisesView = Backbone.View.extend({
	el: $('#main'),
	className: 'content',
	events: {
		'click #add_feis_button': 'showMenu'
	},
	initialize: function() {
		_.bindAll(this, 'render','preRender','addList');
		this.preRender();
		this.render();
	},
	preRender: function() {
		var template = Handlebars.compile($('#feises_view').html());
		this.$el.append(template);
		var formView = new FormView({el: $('#feis_form')});
	},
	render: function() {
		//this.$el.find('#feis_form').html(formView.render().el);
		this.addList();
		return this;
	},
	addList: function() {
		var listView = new FeisListView();
		this.$el.find('.feises_list').append(listView.render().el);
	},
	showMenu: function() {
		this.event_aggregator.trigger("addFeis:showMenu");
	}
})

FeisListView = Backbone.View.extend({
	tagName: 'ol',
	id: 'feis_list',
	initialize: function() {
		_.bindAll(this, 'render','addFeis','appendFeis');

		this.collection = new Feises();
		this.event_aggregator.bind("addFeis:add", this.addFeis);

		this.collection.fetch({
			success: this.render
		});
		this.collection.bind('add', this.appendFeis);
		this.months = [];
	},
	render: function() {
		_(this.collection.models).each(function(feis){ 
            this.appendFeis(feis);
          }, this);
		return this;		
	},

	addMonth: function(month) {
		var monthView = new MonthView( {id : month, name: month});
		this.$el.append(monthView.render().el);
	},

	numToName: function(num) {
		var months={1: 'January',
					2: 'February',
					3: 'March',
					4: 'April',
					5: 'May',
					6: 'June',
					7: 'July',
					8: 'August',
					9: 'September',
					10: 'October',
					11: 'November',
					12: 'December'};
		return months[num];
	},

	addFeis: function(stuff) {
		this.counter++;
		var feis = new Feis(stuff);
		feis.save();
		this.collection.add(feis);
	},

	appendFeis: function(feis) {
		var m = feis.get('month');
		var month = this.numToName(m).slice(0,3);
		if ($.inArray(month,this.months) == -1)
		{
			this.months.push(month);
			this.addMonth(month);
		}
		var feisView = new FeisView({model: feis});
		var tag = '#'+month+' ol';
		this.$el.find('#' + month + ' ol').append(feisView.render().el);
	}
});

HeaderView = Backbone.View.extend({
	events: {
		'click #menu_button': 'toggleNav'
	},
	initialize: function() {
		_.bindAll(this, 'render','toggleNav');
		this.event_aggregator.bind("nav:toggle", this.toggleNav);
		var nav_view = new NavView();
	},
	toggleNav: function() {
		this.$el.next().toggleClass('active');
	}
});

NavView = Backbone.View.extend({
	el: 'nav',
	events: {
		'click a' : 'onClick'
	},
	onClick: function(event) {
		$(event.currentTarget).parent().toggleClass("selected");
		var sibs = $(event.currentTarget).parent().siblings().toggleClass("selected",false);
		this.event_aggregator.trigger("nav:toggle");
		//Backbone.history.navigate('/', true);
		router.navigate('/');
	}
});

MainView = Backbone.View.extend({
	el: '#main',
	initialize: function(options) {
		this.options = options || {};
		_.bindAll(this, 'render'); 
		this.$el.empty();
		switch (this.options.section) {
			case 'profile' : 
				this.main_view = new UserView({ id: 'profile' });
				//this.render();
				break;
			case 'my_feises' :
				this.main_view = new MyFeisesView({ id: 'feises' });
				//this.render();
				break;
			default: 
		}
	},
	render: function() {
		//this.$el.html(this.main_view.render().el);
	}

});

Router = Backbone.Router.extend({
	routes: {
		'profile' : 'profileRoute',
		'my_feises' : 'feisListRoute',
		'feises/:id' : 'feisPageRoute'
	},
	profileRoute: function() {
		var main_view = new MainView({section: 'profile'});
	},
	feisListRoute: function() {
		var main_view = new MainView({section: 'my_feises'});
	},
	feisPageRoute: function(id) {
		console.log(id);
		var main_view = new FeisPageView();
	}
});

Backbone.View.prototype.event_aggregator = _.extend({}, Backbone.Events);
var numToName = function(num) {
	var months={1: 'January',
				2: 'February',
				3: 'March',
				4: 'April',
				5: 'May',
				6: 'June',
				7: 'July',
				8: 'August',
				9: 'September',
				10: 'October',
				11: 'November',
				12: 'December'};
	return months[num];
}

main_view = new MainView({ section: 'none'});
header_view = new HeaderView({ el: $('header.main') });
router = new Router();
Backbone.history.start();

})(jQuery);