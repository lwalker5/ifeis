if (typeof(IFEIS) == 'undefined') IFEIS = {};

IFEIS.user = (function(window, document, $, undefined) {

	function cacheElements () {
		this.$profile = $('#profile');
		this.$checkbox = this.$profile.find('.box');
	}

	function bindEvents () {
		this.$checkbox.on('click',function() {$(this).toggleClass('checked');} );
	}

	function setupHandlers() {
		$('.box').on('click', function () {
			$(this).toggleClass('checked');
		});
	}

	return {
		init: function() {
			bindEvents();
		}
	}
	
})(window, document, jQuery)