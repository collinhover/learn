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
				
				$section[0].scrollIntoView( true );
				
			}
			
			return false;
			
		} )
		.on( 'show', function () {
			
			_s.tabActiveId = $toggle.attr( 'href' );
			
		} )
		.on( 'shown', function () {
			
			_ui.OnWindowResized();
			
			if ( $section.length > 0 ) {
				
				$section[0].scrollIntoView( true );
				
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
	
	SuppressInPageLinks();
	
	// update pretty print
	
	prettify.prettyPrint();
	
	// resize
	
	_de.$window.on( 'resize', $.debounce( _s.throttleTimeMedium, OnWindowResized ) );
	
	/*===================================================
	
	utility
	
	=====================================================*/
	
	function SuppressInPageLinks () {
		
		// TODO: integrate history state management
		
		var $inPageLinks = $( 'a[href^="#"]' ).not( _de.$inPageLinks );
		
		// suppress hash in location of every link
		
		$inPageLinks.each( function () {
			
			var $link = $( this );
			var $location = $link.attr( 'href' ) !== "#" ? $( $link.attr( 'href' ) ) : $();
			
			$link.on( _s.events.click, function ( e ) {
				
				if ( $location.length > 0 ) {
					
					$location[ 0 ].scrollIntoView( true );
					
				}
				
				e.preventDefault();
				
			} );
			
		} );
		
		_de.$inPageLinks = _de.$inPageLinks.add( $inPageLinks );
		
	}
	
	/*===================================================
	
	events
	
	=====================================================*/
    
    function OnWindowResized ( skipDynamic, refreshDynamic ) {
		
		if ( skipDynamic instanceof $.Event ) {
			
			skipDynamic = arguments[ 1 ];
			refreshDynamic = arguments[ 2 ];
			
		}
	   
		_s.w = _de.$window.width();
		_s.h = _de.$window.height();
		
		_s.hNav = _de.$navigation.outerHeight( true );
		
		_s.smallScreen = _de.$navigation.css( 'position' ) !== 'fixed';
		
		// resize start
		
		_s.signals.onResizeStarted.dispatch( _s.w, _s.h );
		
		// refresh dynamic
		
		if ( !skipDynamic ) {
			
			if ( refreshDynamic ) {
				
				_de.refreshDynamic();
				
			}
			
			// fill dynamic
			
			_de.$fillDynamic.each( function () {
				
				var $element = $( this );
				var $parent;
				var $parentOffset = $element.offsetParent();
				var w, h, eW, eH, pW, pH, rW, rH;
				var offsetLeft, offsetTop;
				var fillHorizontal = $element.hasClass( "fill-dynamic-horizontal" );
				var fillVertical = $element.hasClass( "fill-dynamic-vertical" );
				var fillBoth = !fillHorizontal && !fillVertical;
				
				if ( $element.hasClass( "fill-dynamic-parent" ) ) {
					
					var parentSelector = $element.attr( "data-fill-parent" );
					
					if ( parentSelector ) {
						
						$parent = $element.closest( parentSelector );
						
					}
					
					if ( !$parent || $parent.length === 0 ) {
						
						$parent = $parentOffset;
						
					}
					
				}
				else {
					
					$parent = _de.$window;
					
					$element.css( {
						"max-width": "none",
						"max-height": "none"
					} );
					
				}
				
				if ( $parent.is( _de.$page ) ) {
					
					pW = _s.w;
					pH = _s.h;
					
				}
				else {
					
					pW = $parent.width();
					pH = $parent.height();
					
				}
				
				// exact fill
				
				if ( $element.hasClass( "fill-dynamic-exact" ) ) {
					
					w = pW;
					h = pH;
					
				}
				// default to cover fill
				else {
					
					eW = $element.width();
					eH = $element.height();
					
					if ( eW === 0 && eH === 0 ) {
						
						w = pW;
						h = pH;
						
					}
					else if ( eH === 0 ) {
						
						w = pW;
						h = 'auto';
						
					}
					else if ( eW === 0 ) {
						
						w = 'auto';
						h = pH;
						
					}
					else {
						
						rW = pW / eW;
						rH = pH / eH;
						
						if ( rW === 1 && rH === 1 ) {
							
							return;
							
						}
						else if ( rW > rH ) {
							
							w = eW * rW;
							h = eH * rW;
							
						}
						else {
							
							w = eW * rH;
							h = eH * rH;
							
						}
						
					}
					
				}
				
				// position
				
				if ( fillHorizontal || fillBoth ) {
					
					$element.css( 'width', w );
					
				}
				
				if ( fillVertical || fillBoth ) {
					
					$element.css( 'height', h );
					
				}
				
			} );
			
			// align dynamic
			
			_de.$alignDynamic.each( function () {
				
				var $element = $( this );
				var $parent = $element.offsetParent();
				var parentIsPage = $parent.is( _de.$page );
				var alignHorizontal = $element.hasClass( "align-dynamic-horizontal" );
				var alignVertical = $element.hasClass( "align-dynamic-vertical" );
				
				// default to align both if neither present
				
				var alignBoth = !alignHorizontal && !alignVertical;
				
				if ( alignHorizontal || alignBoth ) {
					
					$element.css( "left", ( ( parentIsPage ? _s.w : $parent.outerWidth( true ) ) - $element.outerWidth( true ) ) * 0.5 );
					
				}
				
				if ( alignVertical || alignBoth ) {
					
					$element.css( "top", ( ( parentIsPage ? _s.h : $parent.outerHeight( true ) ) - $element.outerHeight( true ) ) * 0.5 );
					
				}
				
			} );
			
		}
		
		// resize complete
		
		_s.signals.onResized.dispatch( _s.w, _s.h );
		
    }
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_ui.SuppressInPageLinks = SuppressInPageLinks;
	_ui.OnWindowResized = OnWindowResized;
	
	return _ui;
	
} );