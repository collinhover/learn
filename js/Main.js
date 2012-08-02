( function () {
	
	var elements = {},
		classNameLocalStorage,
		classNameCurrent;
	
	/*===================================================
    
	loading
    
    =====================================================*/
	
	$LAB
		.script( [
			"js/jquery-1.7.2.min.js",
			"js/RequestAnimationFrame.js",
			"js/requestInterval.js",
			"js/requestTimeout.js"
		] )
		.wait()
		.script( [
			"js/bootstrap.min.js",
			"js/jquery.easing-1.3.min.js",
			"js/jquery.sticky.custom.js"
		] )
		.wait()
		.script( [
			"js/bootstrap-scroll-modal.custom.js"
		] )
		.wait( init );
	
	/*===================================================
    
	init
    
    =====================================================*/
	
	function init () {
		
		$( document ).ready( on_ready );
		
	}
	
	function on_ready () {
		
		var $classButtonToTrigger;
	
		// get ui elements
		
		elements.$navbarMain = $( "#navbarMain" );
		elements.$overview = $( '#overview' );
		elements.$policies = $( '#policies' );
		elements.$classes = $( '#classes' );
		elements.$class = $( '#class' );
		elements.$classWarning = $( '#classWarning' );
		elements.$classError = $( '#classError' );
		elements.$classLoading = $( '#classLoading' );
		elements.$icons = $( 'i' );
		elements.$buttonsClasses = $( '.button-class' );
		
		// if has current class name in local storage
		
		if ( window.localStorage && window.localStorage[ 'classNameCurrent' ] ) {
			
			classNameLocalStorage = window.localStorage[ 'classNameCurrent' ];
			
		}
		
		// add hover to all icons
		
		elements.$icons.each( function () {
			var icon = $( this );
			
			icon.parents( 'a:last' )
				.on( Modernizr.touch ? 'touchstart' : 'mouseenter', function () {
					icon.addClass( 'icon-white' );
				} )
				.on( Modernizr.touch ? 'touchend touchcancel' : 'mouseleave', function () {
					icon.removeClass( 'icon-white' );
				} );
			
		} );
		
		// show class warning
		
		elements.$classWarning.removeClass( 'hidden' );
		
		// add content load to each class button
		
		elements.$buttonsClasses.each( function () {
			
			var $classButton = $( this ),
				className;
			
			// get class name
			
			className = $.trim( $classButton.data( "class" ) );
			
			// listen for activate
			
			$classButton.on( Modernizr.touch ? 'touchend' : 'mouseup', function () {
				
				if ( typeof className === 'string' && className.length > 0 && className !== classNameCurrent ) {
					
					// hide warning
					
					elements.$classWarning.addClass( 'hidden' );
					
					// hide error
					
					elements.$classError.addClass( 'hidden' );
					
					// empty current class
					
					elements.$class.empty();
					
					// show loading
					
					elements.$classLoading.removeClass( 'hidden' );
					
					// store as current
					
					classNameCurrent = className;
					
					if ( window.localStorage ) {
						
						window.localStorage[ 'classNameCurrent' ] = classNameCurrent;
						
					}
					
					// load
					
					elements.$class.load( 'classes/' + className + '.html', function ( responseText, textStatus ) {
						
						// hide loading
						
						elements.$classLoading.addClass( 'hidden' );
						
						// if error on load
						if ( textStatus === 'error' ) {
							
							// show error
							
							elements.$classError.removeClass( 'hidden' );
						
						}
						else {
							
							// sticky class nav
							
							$( "#navbarClass" ).sticky();
							
							// for each project
							
							$( '#classProjects' ).find( '.class-project' ).each( function () {
								
								var $project = $( this ),
									projectName = $.trim( $project.find( '.class-project-name' ).text() ),
									$requirementItems = $project.find( ".requirement-item" ),
									requirementItemIds = [],
									requirementItemIdCounts = {};
								
								// init all requirements
								
								$requirementItems.each( function ( i ) {
									
									var $requirementItem = $( this ),
										requirementItemText = $.trim( $requirementItem.text() ),
										id = classNameCurrent + '_' + projectName + '_' + 'RequirementItem' + '_' + requirementItemText;
									
									// check if id already in list ( duplicate )
									
									if ( requirementItemIds.indexOf( id ) !== -1 ) {
										
										// increase count
										
										requirementItemIdCounts[ id ]++;
										
									}
									else {
										
										// store in list
									
										requirementItemIds.push( id );
										
										// init count
										
										requirementItemIdCounts[ id ] = 0;
										
									}
									
									// add id count to id
									
									id += '_' + requirementItemIdCounts[ id ];
									
									// set id by count
									
									$requirementItem.attr( 'id', id );
									
									// set toggle
									
									$requirementItem.on( Modernizr.touch ? 'touchend' : 'mouseup', on_requirement_toggle );
									
									// check local storage to see if item already completed
									
									if ( window.localStorage ) {
										
										$requirementItem[ window.localStorage[ id ] === 'true' ? 'addClass' : 'removeClass' ]( 'complete' );
										
									}
									
								} );
								
							} );
							
						}
						
					} );
					
				}
			
			} );
			
			// if this class name is same as one in local storage
			
			if ( typeof classNameLocalStorage !== 'undefined' && className === classNameLocalStorage ) {
				
				$classButtonToTrigger = $classButton;
				
			}
			
		} );
		
		// listen for resize
		
		$( window ).on( 'resize', on_resize );
		
		// resize once
		
		on_resize();
		
		// if has class button to trigger
		
		if ( typeof $classButtonToTrigger !== 'undefined' && $classButtonToTrigger.length > 0 ) {
			
			$classButtonToTrigger.trigger( Modernizr.touch ? 'touchend' : 'mouseup' );
			
		}
		
	}
	
	function on_resize() {
		
		// set classes min height
		
		elements.$classes.css( 'min-height', $( window ).innerHeight() );
		
	}
	
	function on_requirement_toggle () {
		
		var $requirementItem = $( this ),
			id = $requirementItem.attr( 'id' );
		
		$requirementItem.toggleClass( 'complete' );
		
		if ( window.localStorage ) {
			
			window.localStorage[ id ] = $requirementItem.hasClass( 'complete' );
			
		}
		
	}
		
} )();