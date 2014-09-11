//Customize Page View where color and background can be changed

define(['jquery', 'handlebars', 'underscore', 'backbone'], function($, Handlebars, _, Backbone) {

	var CustomizePageView = Backbone.View.extend({
		el: '#main',
		events : {  
			'click #apply-customize': 'oK',
			'click .sequin': 'switchBling'
		},
		initialize: function() {
			_.bindAll(this,'render','initSwipers','switchBling','oK','close');
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
		},
		close: function() {
		  	this.$el.empty();
		  	this.undelegateEvents();
			//this.remove();
			this.unbind();
			if (this.model) { this.model.unbind("change", this.render, this); }
		}
	});
	
	return CustomizePageView;
});