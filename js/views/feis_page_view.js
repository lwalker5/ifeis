//FeisPageView + Helpers
//Page that shows when a feis is clicked on from main list. Results, Marks, Photos sections

define(['jquery','handlebars','underscore','backbone','swiper','collections','models','views/form_view'],
	function($, Handlebars, _, Backbone, swiper, Collections, Models, FormView) {

	Handlebars.registerHelper('fullDate', function(object) {
	  return new Handlebars.SafeString(
	    "" + object.month + "/" + object.day + "/" + object.year.slice(2,4) + ""
	  );
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

	var FeisPageView = Backbone.View.extend({
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
		initialize: function(options) {
		this.options = options;
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
		this.photos = this.model.get('photos');//populate photos collection
		this.marks = this.model.get('marks');
		},
		getPhotos: function() { this.photos.fetch({ data: { id : this.feis_info.id, type: 'photo' }, success: this.updatePhotosSwiper }); },
		getMarks: function() { this.marks.fetch({ data: { id: this.feis_info.id, type: 'marks' }, success: this.updateMarksSwiper }); },
		render: function() {
			var template = Handlebars.compile($('#feis_page_temp').html());
			this.html = template(this.feis_info);
			this.$el.append(this.html);
			this.initResultSwipers(); //needs to be after DOM setup
			this.updatePhotosSwiper(); 
			this.updateMarksSwiper();
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
					fcn = this.updatePhotosSwiper;
				}
				else if (type=="marks") { 
					image = $('#marks-upload')[0].files[0]; 
					fcn = this.updateMarksSwiper;
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

				if (type=="photo") {
					var photo = new Models['Photo']({id: (this.photos.length + 1), 'name' : feis_name_no_spaces+image_prefix+ext });
					this.photos.add(photo);
					this.model.set({'photos': this.model.get('photos').add(photo)});
				}

				else if (type == "marks") {
					var marks_photo = new Models['Photo']({id: (this.marks.length + 1), 'name' : feis_name_no_spaces+image_prefix+ext });
					this.marks.add(marks_photo);
					this.model.set({'marks': this.model.get('marks').add(marks_photo)});					
				}

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
		oK: function(event) {
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

			var dancer = this.options.dancer;
			var placements = parseInt(dancer.get('placements')) + resultcode[0],
				firsts = parseInt(dancer.get('firsts')) + resultcode[1],
				seconds = parseInt(dancer.get('seconds')) + resultcode[2],
				thirds = parseInt(dancer.get('thirds')) + resultcode[3];

			this.options.dancer.set({'placements': placements, 'firsts': firsts, 'seconds': seconds, 'thirds': thirds});
	
			this.model.set({'place': placeInput, 'competitors': compInput, 'resultcode': resultcode, "placementbool": new_placement_bool});
			/*this.model.save({place: placeInput,
											 competitors: compInput,
											 placementbool: new_placement_bool,
											 resultcode: resultcode,
											 dancerid: this.collection.dancerid }, 
							{success: function () { } 
			});*/
			this.toggleEdit();
		}
	});
	return FeisPageView;
});
