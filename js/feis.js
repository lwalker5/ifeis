if (typeof(IFEIS) == 'undefined') IFEIS = {};



$(function() {
	IFEIS.feisList.init();
	IFEIS.menu.init();
	IFEIS.user.init();
	IFEIS.addFeisMenu.init();
});


//iFEIS.start = (function(window, document, $, undefined) { 

/*	function setup() {
		alert('stuff');
		$('header#add_feis_button').on('click', function() {
			$('#feis_form').slideToggle("slow",function() {
			});	
		});

		setupDatePicker();
		swipers = ['.date_picker','.month_picker','.year_picker'];
		/*var index;
		for (index = 0; index < swipers.length; index++) {
			makeSwiper(index);
		}
		var daySwiper = $('#date_picker').swiper({
			mode:'vertical',
			slidesPerView: 3,
			loop: true,
			centeredSlides: true
		});
		var monthSwiper = $('#month_picker').swiper({
			mode:'vertical',
			slidesPerView: 3,
			loop: true,
			centeredSlides: true
		});
		var yearSwiper = $('#year_picker').swiper({
			mode:'vertical',
			slidesPerView: 3,
			loop: false,
			centeredSlides: true
		});
		//var day = $('')

		$('#feis_form').submit(function(e){
			var daySlide = daySwiper.activeSlide();
			var dayData = daySlide.data('day');

			var monthSlide = monthSwiper.activeSlide();
			var monthData = monthSlide.data('month');

			var yearSlide = yearSwiper.activeSlide();
			var yearData = yearSlide.data('year');

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
					$('#feis_form').slideToggle("slow",function() {});
					loadFromDatabase();	
				}
			});
			e.preventDefault();
			//e.unbind();
		});
		//$('#feis_form').unbind();
		//$('#feis_form').submit();
	}

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
			data['month'][m-1] = {"name" : numToName(m), "num" : m};
			//data['monthNum'][m-1] = m;
		}
		for (var y = 1950; y <=2020; y++) {
			data['year'][y-1950] = y;
		}

		$('#feis_form').append(template(data));
	
	}

	function submitForm() {
		alert('submitted');
		data = "stuff";

		//document.feisform.dateday.value = ;
	}

	function loadFeises(month_num,month_data) {
		for (var i = 1; i < 12; i++) //for each month
		{
			loadFromDatabase(i);
		}
	}

	function loadFromDatabase(m) {
		//(function(mm){
			$.ajax({
				url: 'php/config.php',
				type: 'post',
				dataType: 'json',
				success: function(data) {
					parseData(data);
				},
				error: function (xhr, desc, err){
					console.log(xhr);
					console.log("Details: " + desc + "\nError: " + err);
				}
			});
		//})(m);
	}

	function numToName(num) {
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

	function parseData(data) {
		//$('#feis_list').empty();
		for(var x = 12; x >= 1; x--){
			if (data[x])
			{
				var month_num = data[x][0]['month'];
				var month_string = numToName(month_num);
				var month_chars = month_string.split("");
				data[x][0]['month_name'] = month_string.slice(0,3);
				data[x][0]['month_chars'] = month_chars;
				useme = data[x];

				var source = $("#feis_template").html();
				var template = Handlebars.compile(source);
				$('#feis_list').prepend(template(useme));
				$('#'+data[x][0]['month_name']+'> header').css('height',(data[x].length * 52)+'px');
			}
		}

		var i = 0; 
	}
//})(window, document, jQuery);*/