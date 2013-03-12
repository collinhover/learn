define( [ 
	"jquery",
	"app/shared",
	"app/ui",
	"google-code-prettify",
	"bootstrap",
	"jmpress.custom",
	"jquery.imagesloaded"
],
function ( $, _s, _ui, prettify ) { "use strict";
	
	var _de = _s.domElements;
	var _ce = _s.cloneableElements;
	var _pres = {};
	var _$presentationSteps;
	var _presentationFocusTimeoutID;
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	// jmpress defaults
	
	var jmpressDefaults = $.jmpress('defaults');
	
	jmpressDefaults.hash.use = false;
	jmpressDefaults.fullscreen = false;
	jmpressDefaults.notSupportedClass = 'static-presentation';
	// no zoom
	jmpressDefaults.viewPort.zoomBindMove = false;
	jmpressDefaults.viewPort.zoomBindWheel = false;
	// max scale of 1, we can scale down to fit steps but not up
	// this ensures css typography size is not exceeded
	jmpressDefaults.viewPort.maxScale = 1;
	
	// presentation fallback template
   
	( function () {
		
		var totalWidth;
		
		$.jmpress("template", "fallback", {
			children: function ( i, element, all_elements ) {
				
				if ( i === 0 ) {
					
					totalWidth = 0;
					
				}
				
				var $element = $( element ),
					x = totalWidth;
				
				totalWidth += Math.max( _de.$presentation.outerWidth( true ), $element.outerWidth( true ) );
				
				return {
					x: x,
					template: "fallback"
				}
				
			}
		});
	} )();
	
	// presentation remove on deinit
	
	$.jmpress( 'afterDeinit', function ( element ) {
		
		var $element = $( element );
		
		// if element is waiting for remove
		
		if ( _de.$presentationsRemove.is( $element ) ) {
			
			// remove element from list
			
			_de.$presentationsRemove = _de.$presentationsRemove.not( $element );
			
			// remove element from display
			
			$element.remove();
			
		}
		
	} );
	
	// get properties
	
	_s.presentationFullscreenState = _de.$presentations.hasClass( 'fullscreen' );
	
	// add fullscreen presentation callback
	
	//_de.$presentationFullscreenToggle.on( _s.events.click, OnFullscreenToggle );
	
	// for each presentation button
	
	_de.$buttonsPresentations.each( function () {
		
		var $button = $( this ),
			url;
		
		// set relative target
		
		$button.attr( 'href', '#presentations' );
		
		// get url
		
		url = $.trim( $button.data( "url" ) ).replace( _s.pathToPresentations, '' );
		
		// listen for activate
		
		$button.on( _s.events.click, function () {
			
			if ( typeof url === 'string' && url.length > 0 ) {// && url !== _s.presentationActiveURL ) {
				
				// empty placeholder
						
				_s.presentationActiveReady = false;
				
				_de.$presentationPlaceholder.empty();
				
				// change setup to loading
				
				_de.$presentationPreloader.removeClass( 'hidden' ).removeClass( 'alert-danger' ).addClass( 'alert-success' );
				_de.$presentationPreloaderInner.html( '<strong>One sec,</strong> preparing that presentation for you!' );
				
				// store as current
				
				_s.presentationActiveURL = url;
				
				// load into prep
				
				_de.$presentationPlaceholder.load( _s.pathToPresentations + url, function ( responseText, textStatus ) {
					
					// if error on load
					if ( textStatus === 'error' ) {
						
						// change setup to error
						
						_de.$presentationPreloader.removeClass( 'alert-success' ).addClass( 'alert-danger' );
						_de.$presentationPreloaderInner.html( '<strong>Oops, this is embarrassing!</strong> Looks like that presentation got lost somewhere... try again or let me know.' );

					}
					else {
						
						// init presentation
						
						InitPresentation();
						MoveToPresentation();
						
						// focus presentation so we can start navigating right away
						
						_de.$presentation.focus(); 
						
						// ready
						
						_s.presentationActiveReady = true;
						
					}
					
				} );
				
			}
			
		} );
		
	} );
	 
	// wait to setup initial presentation
	
	_de.$tabToggles.filter( '[href="#presentations"]' ).one( 'shown', InitPresentation );
	
	_s.signals.onResizeStarted.add( OnResizeStart );
	_s.signals.onResized.add( OnResize );
	
    /*===================================================
    
    events
    
    =====================================================*/
    
    function OnFullscreenToggle ( off ) {
        
        // clear focus
        
        if ( typeof _presentationFocusTimeoutID !== 'undefined' ) {
            
            window.clearRequestTimeout( _presentationFocusTimeoutID );
            _presentationFocusTimeoutID = undefined;
            
        }
        
        // remove listeners
        
        $( window ).off( 'keyup', OnKeyReleased );
        
        // toggle fullscreen classes
        
        if ( off !== true || _s.presentationFullscreenState === true ) {
            
            _de.$presentationPreloaderInner.toggleClass( 'container' );
            _de.$presentations.toggleClass( 'fullscreen' );
            
        }
        
        // handle by fullscreen state
        
        _s.presentationFullscreenStateLast = _s.presentationFullscreenState;
        _s.presentationFullscreenState = _de.$presentations.hasClass( 'fullscreen' );
        
        if ( _s.presentationFullscreenState !== _s.presentationFullscreenStateLast ) {
            
            if ( _s.presentationFullscreenState === true ) {
                
                // listen for esc key
                
                $( window ).on( 'keyup', OnKeyReleased );
                
            }
            
            // Resize
            
            _ui.OnWindowResized();
            
            // delay focus/move
            
            _presentationFocusTimeoutID = window.requestTimeout( function () {
                
                // move screen to presentation
            
                MoveToPresentation();
                
                // focus presentation
                
                _de.$presentation.focus();
                
            }, 200 );
            
        }
        
    }
    
    function OnKeyReleased ( e ) {
        
        var keyCode = ( ( e.which || e.key || e.keyCode ) + '' ).toLowerCase();
        
        // by key
        
        // escape
        if ( keyCode === '27' ) {
            
            OnFullscreenToggle();
            
        }
        
    }
	
    /*===================================================
    
    init
    
    =====================================================*/
    
    function InitPresentation () {
        
        // handle new steps
        
        _$presentationSteps = _de.$presentationPlaceholder.find( '.step' );
        
        if ( _$presentationSteps.length > 0 ) {
            
            // store current presentation
            
            var $presentationPrev = _de.$presentation;
            
            // add new presentation container
            
            _de.$presentation = _ce.$presentation.clone( true ).insertAfter( _de.$presentationPlaceholder );
			
			// set presentation options
			// TODO: check if data is being set correctly
			
			var $presentationOptions = _de.$presentationPlaceholder.find( '#presentationOptions' );
			_de.$presentation
				.addClass( $presentationOptions.attr( 'class' ) )
				.data( $presentationOptions.data() );
            
            // deinit current presentation and remove when done
            
            if ( $presentationPrev.jmpress( 'initialized' ) ) {
                
                _de.$presentationsRemove = _de.$presentationsRemove.add( $presentationPrev );
                
                $presentationPrev.addClass( 'hidden' ).jmpress( 'deinit' );
                
            }
            // remove instantly
            else {
                
                $presentationPrev.remove();
                
            }
            
            // add steps and init presentation
            
            _de.$presentation.append( _$presentationSteps ).jmpress();
            
            // ensure canvas has no width or height, else will start misaligned
            
            _de.$presentation.jmpress( 'canvas' ).width( 0 ).height( 0 );
            
            // update pretty print
            
            prettify.prettyPrint();
            
            // resize
            
            _ui.OnWindowResized( true );
            
            // when images loaded
            
            _de.$presentation.imagesLoaded( function() {
                
                // hide setup
               
				if ( _s.presentationActiveURL !== '' ) {
					
					_de.$presentationPreloader.addClass( 'hidden' );
					
				}
                
                // for each step
                
                _$presentationSteps.each( function ( i, element ) {
                    
                    var $element = $( element ),
                        stepData = $element.data('stepData');
                    
                    // set viewport
                    
                    stepData.viewPortWidth = $element.outerWidth( true );
                    stepData.viewPortHeight = $element.outerHeight( true );
                    
                } );
                
                // resize
                
                _ui.OnWindowResized( false, true );
                
                FitPresentation();
                
            });
            
        }
        
    }
    
    function MoveToPresentation () {
        
        _de.$presentations[0].scrollIntoView( true );
        
    }
    
    function FitPresentation () {
        
        _de.$presentation.jmpress( 'select', _de.$presentation.jmpress( 'active' ) );
        
    }
	
    /*===================================================
    
    resize
    
    =====================================================*/
	
	function OnResizeStart () {
		
        if ( _s.tabActiveId === '#presentations' ) {
			
            // set presentation container min height
            
            if ( _s.smallScreen ) {
                
                _s.hPresentation = _s.h;
                
				 _de.$presentation.css( 'margin-top', 0 );
				 
            }
			else {
				
				_s.hPresentation = ( _s.h - _s.hNav ) - _de.$presentationsControl.outerHeight( true );
				
				 _de.$presentation.css( 'margin-top', _s.hNav );
				
			}
			
            _de.$presentation.css( 'min-height', _s.hPresentation );
			
			// set default viewport dimensions
			
			_s.wPresentation = _s.w;
			
            jmpressDefaults.viewPort.width = _s.wPresentation;
			jmpressDefaults.viewPort.height = _s.hPresentation;
            
        }
		
	}
	
	function OnResize () {
		
        if ( _s.tabActiveId === '#presentations' ) {
			
			if ( _$presentationSteps ) {
				
				_de.$presentation.jmpress( 'refresh', _$presentationSteps );
				
				FitPresentation();
				
			}
			
		}
	}
	
	return _pres;
	
} );