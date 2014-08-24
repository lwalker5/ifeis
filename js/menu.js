if (typeof(IFEIS) == 'undefined') IFEIS = {};

IFEIS.menu = (function(window, document, $, undefined) {

	function setupHandlers() {
		$('#menu_button').on('click', function () {
			$('nav').toggleClass('active');
		})
	}

	return {
		init: function() {
			setupHandlers();
		}
	}
	
})(window, document, jQuery)