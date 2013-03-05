define( [ 
	"jquery",
	"app/shared",
	"google-code-prettify",
	"jquery.throttle-debounce.custom",
	"bootstrap"
],
function ( $, _s, prettify ) { "use strict";
	
	var _de = _s.domElements;
	var _ui = {};
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	// for each main nav link
	
	_de.$navigation.find( 'a[href^="#"]' ).not( _de.$navigationToggle ).each( function () {
		
		var $link = $( this );
		
		if ( $link.attr( 'href' ) !== "#" ) {
			
			$link.on( _s.events.click, function ( e ) {
				
				if ( _s.smallScreen ) {
					console.log( 'click', $link, ' _de.$navigationToggle', _de.$navigationToggle );
					_de.$navigationToggle.click();
					
				}
				
			} );
			
		}
		
	} );
	
	// for each tab toggle
	
	_de.$tabToggles.each( function () {
		
		var $toggle = $( this ),
			$section = $( $toggle.data( 'section' ) );
		
		$toggle.on( _s.events.click, function ( e ) {
			
			if ( _s.tabActiveId !== $toggle.attr( 'href' ) ) {
				
				$toggle.tab('show');
				
			}
			else if ( $section.length > 0 ) {
				
				window.location.hash = '#' + $section.attr( 'id' );
				$section[0].scrollIntoView( true );
				
				e.preventDefault();
				
			}
			
		} )
		.on( 'show', function () {
			
			_s.tabActiveId = $toggle.attr( 'href' );
			
		} )
		.on( 'shown', function () {
			
			_ui.OnWindowResized();
			
			if ( $section.length > 0 ) {
				window.location.hash = '#' + $section.attr( 'id' );
				$section[0].scrollIntoView( true );
			}
			
			if ( _s.tabActiveId === '#presentations' && _de.$presentation.jmpress('initialized') === true ) {
				
				FitPresentation();
				
			}
			
		} );
		
	} );
	
	// for all dropdowns
	
	_de.$buttonsDropdown.parent().each( function () {
		
		var $dropdown = $( this );
		
		$dropdown.find( '.dropdown-menu a' ).each( function () {
			
			var $button = $( this );
			
			$button.on( _s.events.click, function () {
					
					$button.parent().removeClass( 'active' );
					
					$dropdown.removeClass('open');
					
				} )
				.on( 'shown', function () {
					$button.parent().removeClass( 'active' );
				} );
			
		} );
		
	} );
	
	// update pretty print
	
	prettify.prettyPrint();
	
	// resize
	
	_de.$window.on( 'resize', $.debounce( _s.throttleTimeMedium, OnWindowResized ) );
	
	/*===================================================
	
	events
	
	=====================================================*/
    
    function OnWindowResized () {
	   
		_s.w = _de.$window.width();
		_s.h = _de.$window.height();
		
		_s.hNav = _de.$navigation.outerHeight( true );
		
		_s.smallScreen = _de.$navigation.css( 'position' ) !== 'fixed';
		
		// fill container elements to match screen height
		
		_de.$containerFill.css( "height", _s.h );
		
		// align vertical center elements
		
		_de.$containerAlignVerticalAuto.each( function () {
			
			var $element = $( this );
			var $parent = $element.offsetParent();
			
			$element.css( "height", "auto" );
			$element.css( "top", Math.max( ( $parent.height() - $element.height() ) * 0.5, 0 ) );
			
		} );
		
		// signal
		
		_s.signals.onResized.dispatch( _s.w, _s.h );
		
    }
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_ui.OnWindowResized = OnWindowResized;
	
	return _ui;
	
} );