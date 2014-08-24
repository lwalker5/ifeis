(function($){

Handlebars.registerHelper('href', function(object) {
  return new Handlebars.SafeString(
    "#/feises/" + object + ""
  );
});

Handlebars.registerHelper('fullDate', function(object) {
  return new Handlebars.SafeString(
    "" + object.month + "/" + object.day + "/" + object.year.slice(2,4) + ""
  );
});

Handlebars.registerHelper('NoHyphen', function(object) {
	var newObject = object.replace("-"," ");
	return new Handlebars.SafeString(newObject);
})

Handlebars.registerHelper('feisAge', function(object) {
	var today = new Date(); //Today's date

	var dateFormat = object.birthday.replace('-',',');
	var birthday = new Date(dateFormat); //Dancer birthday

	var birthYear = birthday.getFullYear();
	var feis_age = 'U18';
	if (birthYear <= 1995) {
		feis_age = 'O18'; 
	}
	else {feis_age = 'U' + (today.getFullYear() - birthYear); }
	return new Handlebars.SafeString(feis_age);
})

Handlebars.registerHelper('placeSuffix', function(object) {
	var suffix = "";
	if (object.place) {
		switch (object.place.slice(-1)) {
			case '1' : 
				suffix = 'st';
				break;
			case '2' :
				suffix = 'nd';
				break;
			case '3' :
				suffix = 'rd';
				break;
			default :
				suffix = 'th';
				break;
		}
	}
	else { suffix = ""; }
	return new Handlebars.SafeString(suffix);
});

Handlebars.registerHelper('placeMod', function(object) {
	if (object.place == null) {
		return new Handlebars.SafeString("-");
	}
	else { return object.place; }
});

Handlebars.registerHelper('competitorsMod', function(object) {
	if (object.competitors == null) {
		return new Handlebars.SafeString("-");
	}
	else { return object.competitors; }
});

Photo = Backbone.Model.extend({
	url: "php/add-photo.php",
	defaults: {
		pathName: 'path'
	}
});

Photos = Backbone.Collection.extend({
	model: Photo,
	url: "php/add-photo.php"
});

FeisPageView = Backbone.View.extend({
	el: '#main',
	events: {
		'click #photo-button': 'openPhotoMenu',
		'click #photo-click' : 'addPhoto',
		'click #marks-button': 'openMarksMenu',
		'click #marks-click': 'addPhoto',
		'click #edit-result': 'editResult',
		'click #cancel-edit': 'toggleEdit',
		'click #submit-edit': 'oK'
	},
	initialize: function() {
		_.bindAll(this,'render','getPhotos','getMarks','openPhotoMenu','openMarksMenu','updatePhotosSwiper','updateMarksSwiper',
									 'addPhoto','updateSwiper','initResultSwipers','editResult', 'oK', 'updateResult' );
    if (this.model) {
        this.model.on('change', this.updateResult, this);
    }
    this.feis_info = this.model.toJSON(); //Feis info

    var index = this.collection.indexOf(this.model);

    var next_feis_model;
    if (index < this.collection.length-1) {next_feis_model = this.collection.at(index+1); }
    else { next_feis_model = this.collection.at(0); }
    this.feis_info.next_feis_id = next_feis_model.get('id'); 

    var prev_feis_model;
    if (index > 0) { prev_feis_model = this.collection.at(index-1); }
    else { prev_feis_model = this.collection.at(this.collection.length -1); }
    this.feis_info.prev_feis_id = prev_feis_model.get('id');

		this.swipers = [];
		this.photos = new Photos();
		this.getPhotos(); //populate photos collection
		this.marks = new Photos();
		this.getMarks(); //populate marks collection
	},
	getPhotos: function() { this.photos.fetch({ data: { id : this.feis_info.id, type: 'photo' }, success: this.updatePhotosSwiper }); },
	getMarks: function() { this.marks.fetch({ data: { id: this.feis_info.id, type: 'marks' }, success: this.updateMarksSwiper }); },
	render: function() {
		var template = Handlebars.compile($('#feis_page_temp').html());
		this.html = template(this.feis_info);
		this.$el.append(this.html);
		this.initResultSwipers(); //needs to be after DOM setup
	},
	openPhotoMenu: function(e) { //If add new photo is clicked
		$("#photo-upload").off("change");
		$('#photo-upload').click(); //activate hidden choose file
		$('#photo-upload').on('change', function() {
			$('#photo-click').click(); //submit form once file is chosen
		});
	},
	openMarksMenu: function(e) {
		$("#marks-upload").off("change");
		$('#marks-upload').click();
		$('#marks-upload').on('change', function() {
			$('#marks-click').click();
		});
	},
	addPhoto: function(e) {

		var id_of_button = e.currentTarget.id; 
		var type = id_of_button.slice(0,- 6); //gives us 'marks' or 'photo'

		var image_prefix = (type=="photo") ? this.photos.length+1 : ("_Marks" + (this.marks.length+1));
		
		if ($("#photo-upload")[0].files.length > 0 || $('#marks-upload')[0].files.length > 0) { //make sure there's a file to be uploaded
			
			var formData = new FormData();
			var image, fcn;

			if (type=="photo") {
				image = $('#photo-upload')[0].files[0]; 
				fcn = this.getPhotos;
			}
			else if (type=="marks") { 
				image = $('#marks-upload')[0].files[0]; 
				fcn = this.getMarks;
			}
			var path = $('#marks-upload')[0].value;
			var dotIndex = image['name'].indexOf(".")
			var ext = image['name'].substr(dotIndex);

			formData.append('image',image);
			var feis_name_no_spaces = this.feis_info.name.replace(" ","_");
			formData.append('feis_name',feis_name_no_spaces);
			formData.append('feis_id',this.feis_info.id);
			formData.append('image_prefix',image_prefix);
			formData.append('type',type);

			//var photo = new Photo({id: (this.photos.length + this.marks.length + 1), name : feis_name_no_spaces+image_prefix+ext });
			//this.photos.add(photo);

			$.ajax({
	        	url: 'php/add-photo.php',
	        	type: 'post',
	        	data: formData,
	        	processData: false,
	        	contentType: false,
	        	success: fcn
	    });	
	  }
	},
	updateMarksSwiper: function() { 
		if (this.marks.length > 0) {
			$("#marks-viewer-wrapper").removeClass('hidden');
			this.updateSwiper('marks'); 
		}
	}, //success fcns weren't taking arguments
	updatePhotosSwiper: function() { 
		if (this.photos.length > 0) {
			$("#photos-viewer-wrapper").removeClass('hidden');
			this.updateSwiper('photos'); 
		}
	},
	updateSwiper: function(type) {
		var photoList = (type == "photos") ? this.photos : this.marks;
		var swiperId = (type == "photos") ? '#photo_viewer' : '#marks_viewer';

		if (this.swipers[type]) { //if a swiper already exists, simply add the newest photo to the fron
			var slide_string = '<img src="img/feis_photos/'+photoList.toJSON()[(photoList.length-1)]['name'] +'"/>';
			var newSlide = this.swipers[type].createSlide(slide_string,'photo swiper-slide');
			newSlide.prepend();
		}
		else { //otherwise create the swiper and add all the photos
			this.swipers[type] = $(swiperId).swiper({
				mode: 'horizontal',
				slidesPerView: 2
			});
			for (var l = 0; l < photoList.length; l++) {
				var slide_string = '<img src="img/feis_photos/'+photoList.toJSON()[l]['name'] +'"/>';
				var newSlide = this.swipers[type].createSlide(slide_string,'photo swiper-slide');
				newSlide.prepend();
			}
		}
	},
	editResult: function() {
		this.toggleEdit();
	},
	updateResult: function() {
		this.context = this.model.toJSON();
		$('.accent_numbers').html( this.context.place + ' of ' + this.context.competitors);
	},
	toggleEdit: function() {
		$('#results_form').slideToggle("slow",function() {});
	},
	initResultSwipers: function() {
		var place = $('#place_picker');
		var total = $('#competitors_picker')
		for (var p = 1; p < 150; p++) {
			$('#place_picker .swiper-wrapper').append('<div class="swiper-slide" data-place="'+p+'"><h1>'+p+'</h1></div>');
			$('#competitors_picker .swiper-wrapper').append('<div class="swiper-slide" data-total="'+p+'"><h1 class="right">'+p+'</h1></div>');
		}

		initPlace = (this.feis_info.place) ? (this.feis_info.place - 1) : 0 ;
		initComp = (this.feis_info.competitors) ? (this.feis_info.competitors - 1) : 1 ;

		this.swipers['placeSwiper'] = place.swiper({
			mode:'vertical',
			slidesPerView: 3,
			initialSlide: initPlace,
			centeredSlides: true,
			watchActiveIndex: true
		});
		this.swipers['competitorSwiper'] = total.swiper({
			mode:'vertical',
			slidesPerView: 3,
			initialSlide: initComp,
			centeredSlides: true,
			watchActiveIndex: true
		});
	},
	oK: function() {
		event.preventDefault();
		var formData = {};
		var prev_place = this.model.toJSON().place;
		var prev_placement_bool = this.model.toJSON().placementbool; //aka was it a placement
		var placeInput = this.swipers['placeSwiper'].activeSlide().data('place');
		var compInput = this.swipers['competitorSwiper'].activeSlide().data('total');
		var placement_cutoff = Math.ceil(compInput/2); //top half (+1 if odd) is a placement

		var resultcode = [0,0,0,0];
		var new_placement_bool = (placeInput <= placement_cutoff) ? 1 : 0; //1 for placing, 0 for not
		if (prev_placement_bool >= 0) { //if a previous place existed (ie not '-')
			if (new_placement_bool == prev_placement_bool) { resultcode[0] = 0; } //no change
			else if (new_placement_bool > prev_placement_bool) { resultcode[0] = 1;} //adding a placement
			else if (new_placement_bool < prev_placement_bool) {resultcode[0] = -1; } //removing a placement
		}
		else {resultcode[0] = new_placement_bool ;} //no previous placement so either add or do nothing

		for (var p = 1; p <= 3; p++) { //test for first, second, third
			if (prev_place == p) { //if prev place was top three
				if (placeInput == p) { resultcode[p] = 0; } //if place remains the same
				else { resultcode[p] = -1; } //if changed, remove one
			}
			else if (placeInput == p) { resultcode[p] = 1; } //new top three result
		}

		this.model.save({place: placeInput,
										 competitors: compInput,
										 placementbool: new_placement_bool,
										 resultcode: resultcode,
										 dancerid: this.collection.dancerid }, 
						{success: function () { } 
		});
		this.toggleEdit();
	}
});

SettingsPageView = Backbone.View.extend({
	el: '#main',
	events : {
		'click #apply-settings': 'oK'
	},
	initialize: function() {
		_.bindAll(this,'render','oK');
		//this.swipers = [];
	},
	render: function() {
		var template = Handlebars.compile($('#settings_view_template').html());
		this.$el.html(template);
		var formView = new FormView({el: $('#settings_form'), type: 'settings'});
		//this.initSwipers();
	},
	oK: function() {
		//var chosen_color = this.swipers['colorSwiper'].activeSlide().data('color');
		//$('body').removeClass().addClass(chosen_color);
	}
})

CustomizePageView = Backbone.View.extend({
	el: '#main',
	events : { 
		'click #apply-customize': 'oK',
		'click .sequin': 'switchBling'
	},
	initialize: function() {
		_.bindAll(this,'render','initSwipers','switchBling','oK');
		this.swipers = [];
		this.data = {'color':['light-pink','pink','red','orange','green','teal','blue','indigo','purple','fuschia'] };
		this.chosen_sequin = $('body').data('sequin');
	},
	colorToRGB: function(name) {
		var rgb;
		switch (name) {
			case 'light-pink' : rgb = "rgb(249,60,162)"; break;
			case 'pink' : rgb = "rgb(227,4,109)"; break;
			case 'red' : rgb = "rgb(179,0,0)"; break;
			case 'orange' : rgb = "rgb(233,54,0)"; break;
			case 'green' : rgb = "rgb(33,145,54)"; break;
			case 'teal' : rgb = "rgb(3,139,169)"; break;
			case 'blue' : rgb = "rgb(4,45,212)"; break;
			case 'indigo' : rgb = "rgb(38,4,212)"; break;
			case 'purple' : rgb = "rgb(82,4,212)"; break;
			case 'fuschia' : rgb = "rgb(152,0,179)"; break;
			default : rgb = "rgb(179,0,0)";
		}
		return rgb;
	},
	initSwipers: function() {
		var color_picker = $('#color-picker');
		var curr_color = $('body').data('color');
		var curr_index = $.inArray(curr_color,this.data['color']);
		/*for (var c = 0; c < colors.length; c++) {
			$('#color_picker .swiper-wrapper').append('<li class="swiper-slide" data-color="'+c+'"></li>');
		}*/
		var list = $('#color-picker li div');
		for (var l = 0; l < list.length; l++) {
			var color_name = $(list[l]).parent().data('color');
			var color_rgb = this.colorToRGB(color_name);
			$(list[l]).css('background-color', color_rgb);
		}

		this.swipers['colorSwiper'] = color_picker.swiper({
			mode:'vertical',
			slidesPerView: 3,
			initialSlide: curr_index,
			centeredSlides: true,
			watchActiveIndex: true
		});

		//var slides = $('#color-picker li').css('background-color',)
	},
	switchBling: function(e) {
		var sequins = $('.sequins').children();
		$('.sequins li').each(function(){
			$(this).removeClass('active');
		})
		this.chosen_sequin = e.currentTarget.dataset.color;
		$(e.currentTarget).addClass('active');
		$('body').data('sequin',this.chosen_sequin);
	},
	render: function() {
		var template = Handlebars.compile($('#customize_view_template').html());
		this.$el.html(template(this.data));
		$('#'+this.chosen_sequin).addClass('active');
		this.initSwipers();
	},
	oK: function() {
		var data = [];
		data['color'] = this.swipers['colorSwiper'].activeSlide().data('color');
		$('body').removeClass().addClass(data['color']);
		$('body').data('color',data['color']); 

		data['background'] = this.chosen_sequin;
		$('body').addClass(data['background']);

		data['page'] = 'customize';
		data['id'] = this.model.id;
		this.model.save(data, {success: function() {} });
	}
})

User = Backbone.Model.extend({
	url: "php/edit-dancer.php",
	defaults: { 
		name: 'Lindsay',
		birthday: '1990-10-04',
		region: 'Mid-Atlantic',
		level: 'Open Championship'
	}
});

UserView = Backbone.View.extend({
	el: '#main',
	events: {
		'click #edit_info_button' : 'showForm'
	},
	initialize: function() {
		_.bindAll(this, 'render','editDancer','showForm');
		this.event_aggregator.bind("editDancer", this.editDancer);
		if (this.model) {
            this.model.on('change', this.render, this);
        }
    this.model.fetch({success: this.render });
		//this.render();
	},
	editDancer: function(formData) {
		formData['id'] = this.model.id;
		formData['page'] = 'profile';
		this.model.save(formData, { success: function () { } });
	},
	render: function() {
		//this.model.fetch({success: this.showForm});
		var template = Handlebars.compile($('#user_template').html());
		var context = this.model.toJSON();
		this.$el.html(template(context));
		var formView = new FormView({el: $('#edit_info_form'), type: 'settings', model: this.model});
	},
	showForm: function() {
		this.event_aggregator.trigger("showForm");
	}
});

Feis = Backbone.Model.extend({
	url: "php/add-feis.php",
	defaults: {
		name: 'Inishfree',
		month: 1,
		day: '1',
		year: '2014',
		region: 'MAR',
		place: null,
		competitors: null,
		placementbool: null
	}
});

Feises = Backbone.Collection.extend({
	initialize: function(models,options){
		this.dancerid = options.dancerid;
	},
	model: Feis,
	url: "php/config.php"
});

FormView = Backbone.View.extend({
	events: {
		'click .cancel': 'toggleMenu',
		'click .submit': 'oK',
		'click #save-user-info': 'saveDancerInfo'
	},
	initialize: function(options) {
		this.options = options;
		_.bindAll(this, 'render','toggleMenu','initSwipers','resetSwipers');

		this.swipers = [];
		this.d = this.dataHelper();
		this.event_aggregator.bind("showForm", this.toggleMenu);
		this.render();
		this.initSwipers();
		if (this.model) { this.model.on('change', this.render, this); }
		},
	initSwipers: function() {
		var initData, bday;
		if (this.model) {
			initData = this.model.toJSON();
			var birthday = initData.birthday;
			var temp = birthday.replace("-",",");
			var bday = new Date(temp); 
		}
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

		this.swipers['regionSwiper'].addCallback('SlideChangeStart', function(swiper){
  			var region = swiper.activeSlide().data('region');
  			region = region.replace('-', ' ');
  			$('#region-name').html(region);
		});        
      
	},
	toggleMenu: function() {
		this.$el.prev().toggleClass('active');
		this.$el.slideToggle("slow",function() {});
		//$('#feis_name').focus();
	},
	resetSwipers: function(){
		$('#form_name').val('');
		var swipers = ['daySwiper','monthSwiper','regionSwiper'];
		for (var i = 0; i < swipers.length; i++) {
			this.swipers[swipers[i]].swipeTo(0,1000,false);
		}
		var today = new Date()
		var curr_year = today.getFullYear(); 
		var year_index = curr_year - 1950;
		this.swipers['yearSwiper'].swipeTo(year_index,1000,false);
	},
	oK: function(event) {
		event.preventDefault();
		//console.log('ok');
		this.toggleMenu();
		var formData = {};
		formData['day'] = this.swipers['daySwiper'].activeSlide().data('day');
		formData['month'] = this.swipers['monthSwiper'].activeSlide().data('month');
		formData['year'] = this.swipers['yearSwiper'].activeSlide().data('year');
		formData['name'] = $('#form_name').val();
		formData['region'] = $('#region-name').html();

		this.resetSwipers();
		this.event_aggregator.trigger("addFeis:add",formData);
		//return false;
	},
	saveDancerInfo: function(event) {
		event.preventDefault();
		this.toggleMenu();
		var formData = {}; 
		formData['name'] = $('#form_name').val();
		var day = this.swipers['daySwiper'].activeSlide().data('day');
		var month = this.swipers['monthSwiper'].activeSlide().data('month');
		var year = this.swipers['yearSwiper'].activeSlide().data('year');
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
		if (this.model) { data['name'] = this.model.toJSON().name; }
		if (this.options.type == 'settings') { data['settings'] = true; };
		return data;
	},
	render: function() {
		var template = Handlebars.compile($('#form_template_alt').html());
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
	className: 'hide',
	initialize: function() {
		this.render();
		_.bindAll(this, 'render');
	},
	render: function() {
		var template = Handlebars.compile($('#feis_temp').html());
		var context = this.model.toJSON();
		var html = template(context);
		this.$el.html(html);
		return this;
	}
});

MyFeisesView = Backbone.View.extend({
	el: '#main',
	className: 'content',
	events: {
		'click #add_feis_button': 'showMenu'
	},
	initialize: function() {
		_.bindAll(this, 'render','preRender','addList');
		//this.preRender();
		//this.render();
	},
	preRender: function() {
	},
	render: function() {
		var template = Handlebars.compile($('#feises_view').html());
		//this.$el.empty();
		this.$el.html(template);
		var formView = new FormView({el: $('#feis_form'), type: 'add-feis'});
		//this.$el.find('#feis_form').html(formView.render().el);
		this.addList();
		this.imgToSvg();
		//return this;
	},
	addList: function() {
		this.listView = new FeisListView({collection: this.collection});
		this.$el.find('.feises_list').append(this.listView.render().el);
		this.listView.populateList();
		$('#feises_list').css('height',window.innerHeight - 148 + 'px');
	},
	showMenu: function() {
		this.event_aggregator.trigger("showForm");
	},
	imgToSvg: function() {
		$('#region-picker img.svg').each(function(){
	    var $img = $(this);
	    var imgID = $img.attr('id');
	    var imgClass = $img.attr('class');
	    var imgURL = $img.attr('src');

	    $.get(imgURL, function(data) {
	        // Get the SVG tag, ignore the rest
	        var $svg = $(data).find('svg');

	        // Add replaced image's ID to the new SVG
	        if(typeof imgID !== 'undefined') {
	            $svg = $svg.attr('id', imgID);
	        }
	        // Add replaced image's classes to the new SVG
	        if(typeof imgClass !== 'undefined') {
	            $svg = $svg.attr('class', imgClass+' replaced-svg');
	        }

	        // Remove any invalid XML tags as per http://validator.w3.org
	        $svg = $svg.removeAttr('xmlns:a');

	        // Replace image with new SVG
	        $img.replaceWith($svg);

	    }, 'xml');

		});
	}
})

FeisListView = Backbone.View.extend({
	tagName: 'ol',
	id: 'feis_list',
	initialize: function() {
		_.bindAll(this, 'render','addFeis','addMonth','fetchFeis','appendFeis');
		this.event_aggregator.bind("addFeis:add", this.addFeis);
		this.collection.bind('add', this.appendFeis);
		this.months = new Array(13);
		this.idArray = [];
		for (var i = 0; i < this.months.length; i++) {
			this.months[i] = 0;
		}
	},
	render: function() {
		_(this.collection.models).each(function(feis){ 
            //this.appendFeis(feis);
          }, this);
		return this;		
	},

	addMonth: function(monthNum, month) {
		var monthView = new MonthView( {id : month, name: month});
		var prevMonth = 'empty';
		var i = monthNum - 1;
		if (monthNum == 1) { $('#feis_list:first-child').prepend(monthView.render().el); }

		else {
			while (i > 0) { //finds the closest month prior to month being added
				if (this.months[i] > 0) {
					prevMonth = numToName(i).slice(0,3);
					i = -1;
				}
				i--;
			}

			if (prevMonth != 'empty') {
				this.$el.find('#' + prevMonth).after(monthView.render().el);
			}
			else { this.$el.append(monthView.render().el); }
		}
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

	addFeis: function(feisInfo) {
		//console.log('adding feis');
		var dancerid = this.collection.dancerid;
		feisInfo.dancerid = this.collection.dancerid;
		var feis = new Feis(feisInfo);
		feis.save(null,{success: this.fetchFeis});
		//this.collection.add(feis);
	},

	fetchFeis: function() {
		this.collection.fetch({add:true, data:{ dancerid : this.collection.dancerid }});
	},

	populateList: function() {
		var i = 0;
		_(this.collection.models).each(function(feis){ 
				//this.collection.idArray[i] = feis.get('id');
        this.appendFeis(feis,false);
        i++;
    }, this);
	},

	appendFeis: function(feis, newFeis) {
		var m = feis.get('month');
		var month = this.numToName(m).slice(0,3);
		var feisView = new FeisView({model: feis, collection: this.collection});
		//var tag = '#'+month+' ol';

		/*if ($.inArray(month,this.months) == -1) { //new month
			this.months.push(month);
			this.addMonth(month);
		}*/

		if (this.months[m] == 0) {
			this.months[m] = 1;
			this.addMonth(m,month);
		}

		else {
			this.months[m] += 1;
			if (newFeis) {
				$('#' + month + ' > header').css({ transition: 'height 1s'});
				$('#' + month + ' > header .rotate').css({ transition: 'padding 1s'}); 
			}
			$('#' + month + ' > header').css('height',(this.months[m] * 52)+'px');
			$('#' + month + ' > header .rotate').css('padding',(this.months[m] * 21)+'px 0');
			
			/*if (newFeis) {
				$('#' + month + ' > header .rotate').css({ transition: 'padding 1s'}); 
			}
			$('#' + month + ' > header .rotate').css('padding',(this.months[m] * 21)+'px 0');*/
		}

		var day_to_add = parseInt(feis.get('day'));
		var need_to_add = true;
		var feises_in_month = $('#' + month + ' ol').children();
		if (feises_in_month.length >= 1) {
			var i = 0;
			while(need_to_add) {
				var day = parseInt($(feises_in_month[i]).find('h4').text());
				//console.log(day_to_add + ' : ' + day);
				console.log($(feisView.render().el))
				if (day_to_add < day) { console.log('less'); $(feisView.render().el).insertBefore($(feises_in_month[i])); need_to_add = false; }
				else if (day_to_add > day && i == feises_in_month.length-1) { console.log('more'); $(feisView.render().el).insertAfter($(feises_in_month[i])); need_to_add = false; }
				else { console.log('unsure'); i++; }
			}
		}

		else { $('#' + month + ' ol').append(feisView.render().el); }


		if (!newFeis) { $(feisView.render().el).show(); } //just show it normally
		else { $(feisView.render().el).show('1000ms'); } //'fancy' adding animation
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
		//this.$el.next().toggleClass('active');
		this.$el.next().slideToggle("fast",function() {});
	}
});

NavView = Backbone.View.extend({
	el: 'nav',
	events: {
		'click a' : 'onClick'
	},
	onClick: function(event) {
		this.event_aggregator.trigger("nav:toggle");
		$(event.currentTarget).parent().addClass("selected");
		var sibs = $(event.currentTarget).parent().siblings().toggleClass("selected",false);
		//Backbone.history.navigate('/', true);
		//router.navigate('/');
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
				//this.main_view = new MyFeisesView({ id: 'feises' });
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
		'feises/:id' : 'feisPageRoute',
		'settings' : 'settingsRoute',
		'customize' : 'customizeRoute'
	},
	initialize: function() {
		this.dancer = new User({id: 1});
		this.feises = new Feises([],{dancerid: 1});
		this.dancer.fetch();
		console.log(this.dancer);
		//this.dancer.save();
		this.feises.fetch({data:{ dancerid : this.feises.dancerid }});
		 //{ this.photos.fetch({ data: { id : this.feis_info.id, type: 'photo' }, success: this.updatePhotosSwiper }); },
		_.bindAll(this, 'feisPageRoute');
		/*this.feises.on('change', this.feises.fetch({
		}), this);*/

		//this.feises.fetch();
	},
	profileRoute: function() {
		//this.dancer.fetch({});
		var userView = new UserView({ id: 'profile', model: this.dancer });
		Manager.show(userView);
	},
	feisListRoute: function() {
		var myfeisesview = new MyFeisesView({ id: 'feises', collection: this.feises });
		Manager.show(myfeisesview);
	},
	feisPageRoute: function(id) {
		var feispageView = new FeisPageView({model: this.feises.get(id), collection: this.feises, id: 'feis-page' });
		Manager.show(feispageView);
		//feispageView.render();
	},
	settingsRoute: function() {
		var settingsView = new SettingsPageView();
		Manager.show(settingsView);
	},
	customizeRoute: function() {
		var customView = new CustomizePageView({model: this.dancer});
		Manager.show(customView);
	}
});

Backbone.View.prototype.event_aggregator = _.extend({}, Backbone.Events);
Backbone.View.prototype.close = function(){
  this.$el.empty();
  this.undelegateEvents();
  this.event_aggregator.unbind("showForm","addFeis:add");
  this.unbind();
  if (this.model) { this.model.unbind( 'change', this.render, this ); }
}

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

var imgToSvg = function() {
	$('img.svg').each(function(){
    var $img = $(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
    var imgURL = $img.attr('src');

    $.get(imgURL, function(data) {
        // Get the SVG tag, ignore the rest
        var $svg = $(data).find('svg');

        // Add replaced image's ID to the new SVG
        if(typeof imgID !== 'undefined') {
            $svg = $svg.attr('id', imgID);
        }
        // Add replaced image's classes to the new SVG
        if(typeof imgClass !== 'undefined') {
            $svg = $svg.attr('class', imgClass+' replaced-svg');
        }

        // Remove any invalid XML tags as per http://validator.w3.org
        $svg = $svg.removeAttr('xmlns:a');

        // Replace image with new SVG
        $img.replaceWith($svg);

    }, 'xml');

	});
}

header_view = new HeaderView({ el: $('header.main') });
router = new Router();
//imgToSvg();
Backbone.history.start();

})(jQuery);

Manager = function (Backbone, $){
	var currentView;
	var region = {};

	var closeView = function(view) {
		if (view && view.close) {
			view.close();
		}
	};

	var openView = function (view) {
		view.render();
		/*$('img.svg').each(function(){
	    var $img = $(this);
	    var imgID = $img.attr('id');
	    var imgClass = $img.attr('class');
	    var imgURL = $img.attr('src');

	    $.get(imgURL, function(data) {
	        // Get the SVG tag, ignore the rest
	        var $svg = $(data).find('svg');

	        // Add replaced image's ID to the new SVG
	        if(typeof imgID !== 'undefined') {
	            $svg = $svg.attr('id', imgID);
	        }
	        // Add replaced image's classes to the new SVG
	        if(typeof imgClass !== 'undefined') {
	            $svg = $svg.attr('class', imgClass+' replaced-svg');
	        }

	        // Remove any invalid XML tags as per http://validator.w3.org
	        $svg = $svg.removeAttr('xmlns:a');

	        // Replace image with new SVG
	        $img.replaceWith($svg);

	    }, 'xml');

		});*/
	};

	region.show = function(view) {
		//console.log(currentView);
		/*if (currentView) {
			if (currentView.id == 'feis-page' && currentView.id == 'feis-page') {
				console.log('yay');
			}
			else { closeView(currentView); }
		}*/
		closeView(currentView);
		currentView = view;
		openView(currentView);
	}
	return region;
}(Backbone, jQuery);

