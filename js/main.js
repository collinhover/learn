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
		"app/ui"
	],
	function ( _s, _ui ) {
		
		// ready
		
		_s.signals.onReady.dispatch();
		
		// resize once on start
		
		_de.$window.on( 'resize', function () { _s.timeTestPerformancePause = 0; } );
		_de.$window.trigger( 'resize' );
		
		// fade preloader
		
		_utils.FadeDOM( {
			element: _de.$preloader,
			easing: 'easeInCubic',
			duration: 1000
		} );
		
	} );

}( requirejs ) );