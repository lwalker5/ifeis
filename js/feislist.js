if (typeof(IFEIS) == 'undefined') IFEIS = {};

IFEIS.feisList = (function(window, document, $, undefined) {
	
	var f = this;
	var feisData = {};
	var list = $('#feis_list');
	var addFeisButton = $('.add_feis');

	var yearOfFeises = {
		numMonths : 0,
		monthsUsed : [],
		monthsOfFeises : []
	};

	function Month(num) {
		this.num = num,
		this.name = IFEIS.feisList.numToName(num),
		this.namechars = this.name.slice(0,3),
		this.feises = []
	}

	function Feis(fname,day,region) {
		this.fname = name,
		this.day = day,
		this.region = region
	}

	function loadFromDatabase() {
		$.ajax({
			url: 'php/config.php',
			type: 'post',
			dataType: 'json',
			success: function(data) {
				this.feisData = data;
				parseData(data);
			},
			error: function (xhr, desc, err){
				console.log(xhr);
				console.log("Details: " + desc + "\nError: " + err);
			}
		});		
	}

	function parseData(data) {
		for(var x = 12; x >= 1; x--){
			if (data[x])
			{
				var month_num = data[x][0]['month'];
				var month_string = IFEIS.feisList.numToName(month_num);
				var month_chars = month_string.split("");
				data[x][0]['month_name'] = month_string.slice(0,3);
				data[x][0]['month_chars'] = month_chars;
				monthWithFeises = data[x];
				//alert(monthWithFeises[0]['name']);
				var month = new Month(x);
				yearOfFeises.monthsUsed.push(month_num);
				yearOfFeises.numMonths++;
				yearOfFeises.monthsOfFeises[x] = month;

				for (var f = 0; f < monthWithFeises.length; f++) {
					var feis = new Feis(monthWithFeises[f]['name'],
									   monthWithFeises[f]['day'],
									   'MAR');
					month.feises.push(feis);
				}

				var source = $("#feis_template").html();
				var template = Handlebars.compile(source);
				$('#feis_list').prepend(template(monthWithFeises));
				$('#'+data[x][0]['month_name']+'> header').css('height',(data[x].length * 52)+'px');
				$('#'+data[x][0]['month_name']+'> header p').css('padding',(data[x].length * 20)+'px 0');
			}
		}
	}

	function setHandlers() {
		$('header#add_feis_button').on('click', function() {
			$(this).toggleClass('active');
			//$('#add_feis_button p').css('color','#0f0f0f');
			$('#feis_form').slideToggle("slow",function() {
			});	
		});
	}

	return {
		init: function() {
			loadFromDatabase();
			setHandlers();
		},

		removeFeis: function() {
		},

		addFeis: function(name,day,month,year) {
			var month_name = IFEIS.feisList.numToName(month);
			feis = {'name' : name,
					'day' : day,
					'month' : month_name }
			if ($.inArray(month,yearOfFeises) >= 0)
			{
				//alert('old')
			}
			else { //New month
				var source = $("#added_feis_template").html();
				var template = Handlebars.compile(source);
				$('#feis_list').append(template(feis)).fadeIn(1000);
				$('#'+month_name+'> header').css('height',52+'px');
				$('#'+month_name+'> header p').css('padding',20+'px 0');
			}
			//$('#feis_list').empty();
			//loadFromDatabase();
		},
		getYear: function() {
			return yearOfFeises;
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
		}
	}

})(window, document, jQuery)



IFEIS.addFeisMenu = (function(window, document, $, undefined) {
	
	var $doc = $(document);

	function setupDatePicker() {
		var source = $("#date_picker_template").html();
		var template = Handlebars.compile(source);
		data = {'day' : [],
				'month' : [],
				'year' : [] };
		for (var d = 1; d <= 31; d++) {
			data['day'][d-1] = d;
		}
		for (var m = 1; m <=12; m++) {
			//data['month'][m-1] = numToName(m);
			data['month'][m-1] = {"name" : IFEIS.feisList.numToName(m), "num" : m};
			//data['monthNum'][m-1] = m;
		}
		for (var y = 1950; y <=2020; y++) {
			data['year'][y-1950] = y;
		}

		$('#feis_form').append(template(data));		
	}

	return {
		init: function () {
			setupDatePicker();
			var daySwiper = $('#date_picker').swiper({
				mode:'vertical',
				slidesPerView: 3,
				loop: true,
				centeredSlides: true,
				watchActiveIndex: true
			});
			var monthSwiper = $('#month_picker').swiper({
				mode:'vertical',
				slidesPerView: 3,
				loop: true,
				centeredSlides: true,
				watchActiveIndex: true
			});
			var yearSwiper = $('#year_picker').swiper({
				mode:'vertical',
				slidesPerView: 3,
				initialSlide: 64,
				loop: false,
				centeredSlides: true,
				watchActiveIndex: true
			});
			$('#feis_form').submit(function(e){
				var daySlide = daySwiper.activeSlide();
				var dayData = daySlide.data('day');

				var monthSlide = monthSwiper.activeSlide();
				var monthData = monthSlide.data('month');

				var yearSlide = yearSwiper.activeSlide();
				var yearData = yearSlide.data('year');

				$('header#add_feis_button').toggleClass('active');
				$('#feis_form').slideToggle("slow",function() {
				});
				//var postData = $(this).serializeArray();
				//var formURL = $(this).attr("action");
				$.ajax({
					type: "POST",
					url: "php/add-feis.php",
					//dataType: 'json',
					data: {name: $('#feis_name').val(),
						   day: dayData,
						   month: monthData,
						   year: yearData },
					success: function(stuff) {
						IFEIS.feisList.addFeis($('#feis_name').val(),
									   dayData,
									   monthData,
									   yearData);
					}
				});
				e.preventDefault();
				//e.unbind();
			});

			$('#feis_form .cancel').on('click', function() { 
				$('header#add_feis_button').toggleClass('active');
				$('#feis_form').slideToggle("slow",function() {});
			})
		}
	}


})(window, document, jQuery)