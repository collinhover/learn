define( [ 
	"jquery",
	"app/shared",
	"jquery.throttle-debounce.custom",
	"bootstrap"
],
function ( $, _s ) {
	
	var _de = _s.domElements;
	var _ui = {};
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	// resize
	
	_de.$window.on( 'resize', $.debounce( _s.throttleTimeMedium, OnWindowResized ) );
	
	/*===================================================
	
	events
	
	=====================================================*/
    
    function OnWindowResized () {
	   
		_s.w = _de.$window.width();
		_s.h = _de.$window.height();
		
		_s.hNav = _de.$navigation.outerHeight( true );
		
		// fill container elements to match screen height
		
		_de.$containerFill.css( "height", _s.h );
		
		// signal
		
		_s.signals.onResized.dispatch( _s.w, _s.h );
		
		// TODO: place following in response to onResized signal
		
        if ( _s.tabActiveId === '#presentations' ) {
			
			var presentationHeight;
            
            // set presentation container min height
            
            if ( $( window ).innerWidth() < 768 ) {
                
                presentationHeight = _s.h - _de.$presentationsControl.outerHeight( true ) - _presentationsPaddingVertical;
                
            }
            else if ( _presentationFullscreenState === true ) {
                
                presentationHeight = ( _s.h - _s.hNav ) - _de.$presentationsControl.outerHeight( true );
                
            }
            else {
                
                presentationHeight = ( _s.h - _s.hNav ) - _de.$presentationsControl.outerHeight( true ) - _presentationsPaddingVertical;
                
            }
            
            _de.$presentation.css( 'min-height', presentationHeight );
            
        }
        
        if ( _s.tabActiveId === '#classes' ) {
            
            _de.$classNavWrapper.css( 'height', _de.$classNav.outerHeight( true ) );
            
        }
		
    }
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	_ui.OnWindowResized = OnWindowResized;
	
	return _ui;
	
} );