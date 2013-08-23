( function (requirejs ) {
	
	requirejs.config({
		// by default load any module IDs from js/lib
		baseUrl: 'js/lib',
		// exceptions
		paths: {
			app: '../app'
		}
	});
	
	require(
	[
		"jquery",
		"app/shared",
		"app/utilities",
		"app/ui",
		"app/classes",
		"app/presentations"
	],
	function ( $, _s, _utils, _ui ) { "use strict";
		
		var _de = _s.domElements;
		
		// ready
		
		_s.signals.onReady.dispatch();
		
		// resize once on start
		
		_ui.OnWindowResized();
		_de.$window.trigger( 'resize' );
		
		// check support
		
		if ( _s.unsupported ) {
			
			_utils.FadeDOM( {
				element: _de.$nosupport,
				opacity: 1,
				duration: 500
			} );
			
		}
		else {
			
			// disable setup
			
			_utils.FadeDOM( {
				element: _de.$setup,
				duration: 1000
			} );
			
			// enable content
			
			_de.$content.removeClass( 'unscrollable' ).addClass( 'scrollable' );
			
		}
			
	} );

}( requirejs ) );