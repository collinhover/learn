( function () {
	
	var elements = {},
		classURLLocalStorage,
		classURLCurrent;
	
	/*===================================================
    
	loading
    
    =====================================================*/
	
	$LAB
		.script( [
			"js/jquery-1.7.2.min.js",
            "js/impress.min.js",
			"js/RequestAnimationFrame.js",
			"js/requestInterval.js",
			"js/requestTimeout.js"
		] )
		.wait()
		.script( [
			"js/bootstrap.min.js",
            "js/jquery.throttle-debounce.min.js",
			"js/jquery.easing-1.3.min.js"
		] )
        .wait()
        .script( [
    		"js/jquery.sticky.custom.js"
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
		elements.$classSetup = $( '#classSetup' );
    	elements.$classSetupHeader = $( '#classSetupHeader' );
    	elements.$classSetupBody = $( '#classSetupBody' );
        elements.$presentations = $( '#presentations' );
        elements.$presentation = $( '#presentation' );
        elements.$presentationSetup = $( '#presentationSetup' );
		elements.$icons = $( 'i' );
		elements.$buttonsClasses = $( '.button-class' );
    	elements.$buttonsPresentations = $( '.button-presentation' );
		
		// if has current class url in local storage
		
		if ( window.localStorage && window.localStorage[ 'classURLCurrent' ] ) {
			
			classURLLocalStorage = window.localStorage[ 'classURLCurrent' ];
			
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
		
		// for each class button
		
		elements.$buttonsClasses.each( function () {
			
			var $classButton = $( this ),
				classURL;
            
            // set relative target
            
            $classButton.attr( 'href', '#classes' );
			
			// get class url
			
			classURL = $.trim( $classButton.data( "class" ) );
			
			// listen for activate
			
			$classButton.on( Modernizr.touch ? 'touchend' : 'mouseup', function () {
				
				if ( typeof classURL === 'string' && classURL.length > 0 && classURL !== classURLCurrent ) {
					
                    // stop sticky class nav
                    
                    $( "#navbarClass" ).sticky( 'stop' );
                    
					// empty current class
					
					elements.$class.empty();
					
					// change setup to loading
					
					elements.$classSetup.removeClass( 'hidden' );
                    elements.$classSetupHeader.html( "Class loading..." );
                    elements.$classSetupBody.removeClass( 'alert-danger' ).addClass( 'alert-success' ).html( '<strong>One sec,</strong> looking up that class you selected.' );
					
					// store as current
					
					classURLCurrent = classURL;
					
					// load
					
					elements.$class.load( 'classes/' + classURL + '.html', function ( responseText, textStatus ) {
						
						// if error on load
						if ( textStatus === 'error' ) {
							
							// change setup to error
							
                            elements.$classSetupHeader.html( "Oops!" );
                            elements.$classSetupBody.removeClass( 'alert-success' ).addClass( 'alert-danger' ).html( '<strong>This is embarrassing! </strong> Looks like that class got lost somewhere... try again or <a href="#overview">let me know</a>.' );
                            
						}
						else {
                            
                            // store current
                            
        					if ( window.localStorage ) {
        						
        						window.localStorage[ 'classURLCurrent' ] = classURLCurrent;
        						
        					}
                            
                            // hide setup
    					    
						    elements.$classSetup.addClass( 'hidden' );
							
							// sticky class nav
							
							$( "#navbarClass" ).sticky( { 
                                topSpacing: function () { return elements.$navbarMain.outerHeight( true ); },
                                maxScroll: function () { return elements.$class.outerHeight( true ) - elements.$navbarMain.outerHeight( true ); },
                                maxScrollStart: function () { return elements.$class.offset().top; }
                            } );
							
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
										id = classURLCurrent + '_' + projectName + '_' + 'RequirementItem' + '_' + requirementItemText;
									
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
			
			// if this class url is same as one in local storage
			
			if ( typeof classURLLocalStorage !== 'undefined' && classURL === classURLLocalStorage ) {
				
				$classButtonToTrigger = $classButton;
				
			}
			
		} );
        
        // for each presentation button
    	
		elements.$buttonsPresentations.each( function () {
			
			var $presentationButton = $( this ),
				presentationURL;
            
            // set relative target
            
            $presentationButton.attr( 'href', '#presentations' );
            
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
		
        var windowHeight = $( window ).innerHeight();
        
		// set min height
		
		elements.$classes.css( 'min-height', windowHeight );
        elements.$presentations.css( 'min-height', windowHeight );
		
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