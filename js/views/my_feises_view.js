//All the views that render on the 'My Feises' page
//Only need to return MyFeisesView

define(['jquery', 'underscore', 'backbone', 'handlebars', 'swiper', 'collections', 'models',  'views/form_view'],
	function($, _, Backbone, Handlebars, swiper, Collections, Models, FormView) {

	Handlebars.registerHelper('href', function(object) {
	  return new Handlebars.SafeString( 
	    "#/feises/" + object + ""
		);
	});

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
		return new Handlebars.SafeString(suffix);
	});

	//The main view accessed by navigating to 'my feises'
	var MyFeisesView = Backbone.View.extend({
		el: '#main',
		className: 'content',
		events: {
			'click #add_feis_button': 'showMenu'
		},
		initialize: function() {
			_.bindAll(this, 'render','addList','close');
		},
		render: function() {
			var template = Handlebars.compile($('#feises_view').html());
			this.$el.html(template);

			this.formView = new FormView({el: $('#feis_form'), type: 'add-feis'});
			this.addList();
			this.imgToSvg();
		},
		addList: function() {
			this.listView = new FeisListView({collection: this.collection});
			this.$el.find('.feises_list').append(this.listView.render().el);
			this.listView.populateList(); //add the feises already in the collection
			$('#feises_list').css('height',window.innerHeight - 148 + 'px');
		},
		showMenu: function() {
			this.event_aggregator.trigger("showForm");
		},
		imgToSvg: function() { //Convert so css styling (colors changes) can be used for svgs 
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
		},
		close: function() {
			this.formView.close();
			this.listView.close();
			this.$el.empty();
			//this.remove();
			this.unbind();
			this.undelegateEvents();
		  	this.event_aggregator.unbind('showForm',this.toggleMenu);

		}
	})

	var FeisListView = Backbone.View.extend({
		tagName: 'ol',
		id: 'feis_list',
		initialize: function() {
			_.bindAll(this, 'render', 'addFeis', 'addMonth', 'fetchFeis', 'displayFeis', 'close');
			this.event_aggregator.bind("addFeis:add", this.addFeis);
			this.collection.bind('add', this.displayFeis);
			this.months = new Array(13);
			this.idArray = [];
			for (var i = 0; i < this.months.length; i++) {
				this.months[i] = 0;
			}
		},
		render: function() {
			/*_(this.collection.models).each(function(feis){ 
	            //this.appendFeis(feis);
	          }, this);*/
			return this;		
		},

		addMonth: function(monthToAdd, month) { 
			var monthView = new MonthView( {id : month, name: month}),
				prevMonth, //so far we don't know which month view it needs to succeed
				monthsFeisCount = this.months, //ex: [0,1,0,2,3] 
				monthCounter = monthToAdd - 1; //starting the check with the month before

			if (monthToAdd == 1) { $('#feis_list:first-child').prepend(monthView.render().el); } //If January is added, simply prepend

			else {
				while (monthCounter > 0) { //finds the closest month prior to month being added
					if (monthsFeisCount[monthCounter] > 0) { //if a feis exists in the month (ie the view is rendered)
						prevMonth = this.numToName(monthCounter).slice(0,3); //first three letters for header
						monthCounter = -1;
					}
					monthCounter--;
				}

				if (prevMonth != undefined) { 
					this.$el.find('#' + prevMonth).after(monthView.render().el);
				}
				else { this.$el.append(monthView.render().el); } // no months are rendered yet so just add this one
			}
		},

		numToName: function(num) {
			var months= { 1: 'January',
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
						  12: 'December' };
			return months[num];
		},

		addFeis: function(feisInfo) { 
			var feis; //new feis model		
			feisInfo.dancerid = this.collection.dancerid;
			feisInfo.id = this.collection.length + 1;
			feisInfo.photos = new Collections['Photos']();
			feisInfo.marks = new Collections['Photos']();
			feis = new Models['Feis'](feisInfo);
			this.collection.add(feis);
			//feis.save(null, { success: this.fetchFeis });
		},

		fetchFeis: function() {
			this.collection.fetch({add:true, data:{ dancerid : this.collection.dancerid }});
		},

		populateList: function() {
			var i = 0;
			_(this.collection.models).each(function(feis){ 
		        this.displayFeis(feis,false);
		        if (!feis.has("photos")) { 
		        	feis.set({"photos": new Collections['Photos']});
		        }
		  		if (!feis.has("marks")) { 
		        	feis.set({"marks": new Collections['Photos']});
		        }      
		        i++;
		    }, this);
		},

		displayFeis: function(feis, animate) {
			var monthNum = feis.get('month'),
				monthName = this.numToName(monthNum).slice(0,3),
				feisCountPerMonth = this.months,
				feisView = new FeisView({model: feis, collection: this.collection}),

				extendMonthLabel = function() {
					if (animate) { //Only want to animate the add if new
						$('#' + monthName + ' > header').css({ transition: 'height 1s'});
						$('#' + monthName + ' > header .rotate').css({ transition: 'padding 1s'}); 
					}
					$('#' + monthName + ' > header').css('height',(feisCountPerMonth[monthNum] * 52)+'px');
					$('#' + monthName + ' > header .rotate').css('padding',(feisCountPerMonth[monthNum] * 21)+'px 0');
				},
				insertFeisView = function() {
					var dayToAdd = parseInt(feis.get('day')),
						needToAdd = true,
						feisesInMonth = $('#' + monthName + ' ol').children(),
						i = 0; //counter

					//algorithm to figure out where feis should be placed in month
					if (feisesInMonth.length >= 1) {
						while(needToAdd) {
							var day = parseInt($(feisesInMonth[i]).find('h4').text());
							if (dayToAdd < day) { 
								$(feisView.render().el).insertBefore($(feisesInMonth[i])); 
								needToAdd = false; 
							}
							else if (dayToAdd > day && i == feisesInMonth.length-1) { 
								$(feisView.render().el).insertAfter($(feisesInMonth[i])); 
								needToAdd = false; 
							}
							else { i++; }
						}
					}

					else { $('#' + monthName + ' ol').append(feisView.render().el); }
				},
				showFeisView = function() {
					if (animate) { $(feisView.render().el).show('1000ms'); }
					else { $(feisView.render().el).show(); }
				};

			//if this is the first feis added for this month, simply add it, otherwise need to widen the side label
			feisCountPerMonth[monthNum] += 1;
			(feisCountPerMonth[monthNum] == 1) ? this.addMonth(monthNum,monthName) : extendMonthLabel();

			insertFeisView();
			showFeisView();
		},
		close: function() {
			this.$el.empty();
			this.collection.unbind("add", this.displayFeis);
			this.unbind();
			this.remove();
			this.event_aggregator.unbind('addFeis:add', this.addFeis);
		}
	});

	var MonthView = Backbone.View.extend({
		tagName: 'li',
		className: 'month',
		initialize: function(options) {
			this.options = options || {};
			this.render();
			_.bindAll(this, 'render');
		},
		render: function() {
			var data = {'month': this.options.name},
				template = Handlebars.compile($('#month_temp').html()),
				result = template(data);

			this.$el.html(result);
			return this;
		}
	});

	var FeisView = Backbone.View.extend({ 
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

	return MyFeisesView; //The entire page, no need to access smaller month and feis outside of this
})