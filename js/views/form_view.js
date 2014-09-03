//Form View - used for 'Add Feis' (on my feises) and 'Edit Info' (on profile) forms

define(['jquery','handlebars','underscore','swiper', 'backbone'],function($, Handlebars, _, swiper, Backbone) {

	Handlebars.registerHelper('NoHyphen', function(object) {
		var newObject = object.replace("-"," ");
		return new Handlebars.SafeString(newObject); 
	});

	var FormView = Backbone.View.extend({
		events: {
			'click .cancel': 'toggleMenu',
			'click .submit': 'oK',
			'click #save-user-info': 'saveDancerInfo'
		},
		initialize: function(options) {
			this.options = options;
			_.bindAll(this, 'render','toggleMenu','initSwipers','resetSwipers','close');

			this.swipers = [];
			this.d = this.dataHelper();
			this.event_aggregator.bind("showForm", this.toggleMenu);
			this.render();
			console.log("form model:");
			console.log(this.model);
			if (this.model) { console.log('it here'); this.model.on('change', this.render, this); }
			},
		initSwipers: function() {
			var initData, bday;
			if (this.model) {
				initData = this.model.toJSON();
				var birthday = initData.birthday;
				var tmp = birthday.split('-');
				var bday = new Date(tmp[0],tmp[1]-1,tmp[2]); 
			}
			//initial slide numbers
			initLevel = (this.model) ?  $.inArray(initData.level,this.d.level) : 0;
			initRegion = (this.model) ? $.inArray(initData.region,this.d.region) : 0;
			initYear = (this.model) ?  $.inArray(bday.getFullYear(),this.d.year) : 64;
			initMonth = (this.model) ?  bday.getMonth() : 0;
			initDay = (this.model) ?  $.inArray(bday.getDay(),this.d.day) : 0;

			this.swipers['daySwiper'] = $('#date_picker').swiper({
				mode:'vertical',
				slidesPerView: 3,
				initialSlide: initDay,
				loop: true,
				centeredSlides: true,
				watchActiveIndex: true
			});
			this.swipers['monthSwiper'] = $('#month_picker').swiper({
				mode:'vertical',
				slidesPerView: 3,
				initialSlide: initMonth,
				loop: true,
				centeredSlides: true,
				watchActiveIndex: true
			});
			this.swipers['yearSwiper'] = $('#year_picker').swiper({
				mode:'vertical',
				slidesPerView: 3,
				initialSlide: initYear,
				loop: false,
				centeredSlides: true,
				watchActiveIndex: true
			});
			this.swipers['regionSwiper'] = $('#region-picker').swiper({
				mode:'horizontal',
				slidesPerView: 1,
				initialSlide: initRegion,
				loop: true,
				centeredSlides: true,
				watchActiveIndex: true
			});
			if (this.options.type == "settings") {
				this.swipers['levelSwiper'] = $('#level_picker').swiper({
					mode:'horizontal',
					slidesPerView: 1,
					initialSlide: initLevel,
					loop: true,
					centeredSlides: true,
					watchActiveIndex: true
				});
			}
			//update the region name in the label above the map swiper
			console.log(this.swipers);
			this.swipers['regionSwiper'].addCallback('SlideChangeStart', function(ss){
				console.log(ss);
	  			var region = ss.activeSlide().data('region');
	  			region = region.replace('-', ' ');
	  			$('#region-name').html(region);
			});        
	      
		},
		toggleMenu: function() {
			this.$el.prev().toggleClass('active');
			this.$el.slideToggle("slow",function() {});
		},
		resetSwipers: function(){
			var today = new Date(),
				currYear = today.getFullYear(),
				yearIndex = currYear - 1950,
				swipers = ['daySwiper','monthSwiper','regionSwiper'];
			$('#form_name').val(''); //empty the text input
			for (var i = 0; i < swipers.length; i++) {
				this.swipers[swipers[i]].swipeTo(0,1000,false); 
			}

			this.swipers['yearSwiper'].swipeTo(yearIndex,1000,false);
		},
		oK: function(event) {
			console.log('ok on form');
			var formData = {};

			event.preventDefault();
			this.toggleMenu();
			formData.day = this.swipers['daySwiper'].activeSlide().data('day');
			formData.month = this.swipers['monthSwiper'].activeSlide().data('month');
			formData.year = this.swipers['yearSwiper'].activeSlide().data('year');
			formData.name = $('#form_name').val();
			formData.region = $('#region-name').html();

			this.resetSwipers();
			this.event_aggregator.trigger("addFeis:add",formData);
		},
		saveDancerInfo: function(event) {
			var formData = {},
				day = this.swipers['daySwiper'].activeSlide().data('day'),
				month = this.swipers['monthSwiper'].activeSlide().data('month'),
				year = this.swipers['yearSwiper'].activeSlide().data('year');

			event.preventDefault();
			this.toggleMenu();

			formData['name'] = $('#form_name').val();
			formData['birthday'] = year + '-' + month + '-' + day;
			formData['region'] = this.swipers['regionSwiper'].activeSlide().data('region');
			formData['level'] = this.swipers['levelSwiper'].activeSlide().data('level');
			this.event_aggregator.trigger("editDancer",formData);
		},
		dataHelper: function() {
			var data = {'day' : [],
					'month' : [],
					'year' : [],
					'region' : [] };

			for (var d = 1; d <= 31; d++) {
				data['day'][d-1] = d;
			}
			for (var m = 1; m <=12; m++) {
				data['month'][m-1] = {"name" : numToName(m),"num" : m};
			}
			for (var y = 1950; y <=2020; y++) {
				data['year'][y-1950] = y;
			}
			data['region'] = ['Mid-Atlantic',
							  'New-England',
							  'Mid-America',
							  'Southern',
							  'Western',
							  'Eastern-Canada',
							  'Western-Canada'];
			data['level'] = ['Beginner',
							 'Advanced-Beginner',
							 'Novice',
							 'Prizewinner',
							 'Prelim-Championship',
							 'Open-Championship'];
			if (this.model) { data['name'] = this.model.get('name'); }
			if (this.options.type == 'settings') { data['settings'] = true; };
			return data;
		},
		render: function() {
			console.log('rendering form');
			this.d = this.dataHelper();
			var template = Handlebars.compile($('#form_template_alt').html()),
				result = template(this.d);
			this.$el.html(result);
			this.initSwipers();
		},
		close: function() {
			console.log('closing form');
			console.log(this);
		  	this.$el.empty();
		  	this.undelegateEvents();
			//this.remove();
			this.unbind();
			if (this.model) { console.log('unnnnn'); this.model.unbind("change", this.render, this); }
		}

	});

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
	};
	return FormView;
})
