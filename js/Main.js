( function () {
	
	var jmpressDefaults,
        elements = {},
        pathToClasses = 'classes/',
        pathToPresentations = 'presentations/',
        localStorageURLCurrentClass,
		urlCurrentClass,
        urlCurrentPresentation,
        presentationRemoveID,
        mainNavHeight,
        presentationPadding,
        presentationsPaddingVertical;
	
	/*===================================================
    
	loading
    
    =====================================================*/
	
	$LAB
		.script( [
			"js/jquery-1.7.2.min.js",
			"js/RequestAnimationFrame.js",
			"js/RequestInterval.js",
			"js/RequestTimeout.js"
		] )
		.wait()
		.script( [
            "js/jmpress.all.min.js",
			"js/bootstrap.min.js",
            "js/jquery.throttle-debounce.custom.min.js",
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
        
        // jmpress defaults
        
        jmpressDefaults = $.jmpress('defaults');
        jmpressDefaults.hash.use = false;
        jmpressDefaults.fullscreen = false;
        jmpressDefaults.notSupportedClass = 'static-presentation';
        //jmpressDefaults.viewPort.width = true;
        //jmpressDefaults.viewPort.height = true;
        
        // presentation fallback template
       
        $.jmpress("template", "fallback", {
    		children: function ( i, current_child, children ) {
                //console.log( 'template fallback', i, current_child );
        		return {
    				//y: 400,
    				x: -300 + i * 300,
                    //scale: 0.3,
    				template: "fallback"
    			}
    		}
		});
        
        // presentation remove on deinit
        
        $.jmpress( 'afterDeinit', function ( element ) {
            
            var $element = $( element );
            
            // if element is waiting for remove
            
            if ( elements.$presentationsRemove.is( $element ) ) {
                
                // remove element from list
                
                elements.$presentationsRemove = elements.$presentationsRemove.not( $element );
                
                // remove element from display
                
                $element.remove();
                
            }
            
        } );
        
		// get ui elements
		
		elements.$mainNav = $( "#mainNav" );
		elements.$overview = $( '#overview' );
		elements.$policies = $( '#policies' );
		elements.$classes = $( '#classes' );
		elements.$class = $( '#class' );
		elements.$classSetup = $( '#classSetup' );
    	elements.$classSetupHeader = $( '#classSetupHeader' );
    	elements.$classSetupBody = $( '#classSetupBody' );
        elements.$presentations = $( '#presentations' );
        elements.$presentationsHeader = $( '#presentationsHeader' );
        elements.$presentationsNav = $( '#presentationsNav' );
        elements.$presentationsRemove = $();
        elements.$presentation = $( '#presentation' );
        elements.$presentationClone = elements.$presentation.clone( true );
        elements.$presentationPlaceholder = elements.$presentation.clone().attr( 'id', 'presentationPlaceholder' ).insertBefore( elements.$presentation ).addClass( 'hidden' );
        elements.$presentationSetup = $( '#presentationSetup' );
        elements.$presentationFullscreen = $( '#presentationFullscreen' );
        elements.$presentationFullscreenPlaceholder = elements.$presentationFullscreen.clone().attr( 'id', 'presentationFullscreenPlaceholder' ).insertBefore( elements.$presentationFullscreen ).addClass( 'hidden' );
        elements.$presentationName = $( '.presentation-name' );
        elements.$presentationDescription = $( '.presentation-description' );
		elements.$icons = $( 'i' );
		elements.$buttonsClasses = $( '.button-class' );
    	elements.$buttonsPresentations = $( '.button-presentation' );
        
        // get properties
        
        mainNavHeight = elements.$mainNav.outerHeight( true );
        presentationPadding = parseInt( elements.$presentation.css( 'padding' ) );
        presentationsPaddingVertical = parseInt( elements.$presentations.css( 'padding-top' ) ) + parseInt( elements.$presentations.css( 'padding-bottom' ) );
		
		// if has current class url in local storage
		
		if ( window.localStorage && window.localStorage[ 'urlCurrentClass' ] ) {
			
			localStorageURLCurrentClass = window.localStorage[ 'urlCurrentClass' ];
			
		}
		/*
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
		*/
		// for each class button
		
		elements.$buttonsClasses.each( function () {
			
			var $button = $( this ),
				url;
            
            // set relative target
            
            $button.attr( 'href', '#classes' );
			
			// get class url
			
			url = $.trim( $button.data( "url" ) ).replace( pathToClasses, '' );
			
			// listen for activate
			
			$button.on( Modernizr.touch ? 'touchend' : 'mouseup', function () {
				
				if ( typeof url === 'string' && url.length > 0 && url !== urlCurrentClass ) {
					
                    // stop sticky class nav
                    
                    $( "#classNav" ).sticky( 'stop' );
                    
					// empty current class
					
					elements.$class.empty();
					
					// change setup to loading
					
					elements.$classSetup.removeClass( 'hidden' );
                    elements.$classSetupHeader.html( "Class loading..." );
                    elements.$classSetupBody.removeClass( 'alert-danger' ).addClass( 'alert-success' ).html( '<strong>One sec,</strong> looking up that class you selected.' );
					
					// store as current
					
					urlCurrentClass = url;
					
					// load
					
					elements.$class.load( pathToClasses + url, function ( responseText, textStatus ) {
						
						// if error on load
						if ( textStatus === 'error' ) {
							
							// change setup to error
							
                            elements.$classSetupHeader.html( "Oops!" );
                            elements.$classSetupBody.removeClass( 'alert-success' ).addClass( 'alert-danger' ).html( '<strong>This is embarrassing! </strong> Looks like that class got lost somewhere... try again or <a href="#overview">let me know</a>.' );
                            
						}
						else {
                            
                            // store current
                            
        					if ( window.localStorage ) {
        						
        						window.localStorage[ 'urlCurrentClass' ] = urlCurrentClass;
        						
        					}
                            
                            // hide setup
    					    
						    elements.$classSetup.addClass( 'hidden' );
							
							// sticky class nav
							
							$( "#classNav" ).sticky( { 
                                topSpacing: mainNavHeight,
                                maxScroll: function () { return elements.$class.outerHeight( true ) - mainNavHeight; },
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
										id = urlCurrentClass + '_' + projectName + '_' + 'RequirementItem' + '_' + requirementItemText;
									
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
                            
                            // resize
                            
                            on_resize();
							
						}
						
					} );
					
				}
			
			} );
			
			// if this class url is same as one in local storage
			
			if ( typeof localStorageURLCurrentClass !== 'undefined' && url === localStorageURLCurrentClass ) {
				
				$classButtonToTrigger = $button;
				
			}
			
		} );
        
        // add fullscreen presentation callback
        
        elements.$presentationFullscreen.on( Modernizr.touch ? 'touchend' : 'mouseup', on_fullscreen_toggle );
        
        // for each presentation button
    	
		elements.$buttonsPresentations.each( function () {
			
			var $button = $( this ),
				url;
            
            // set relative target
            
            $button.attr( 'href', '#presentations' );
			
			// get url
			
			url = $.trim( $button.data( "url" ) ).replace( pathToPresentations, '' );
			
			// listen for activate
			
			$button.on( Modernizr.touch ? 'touchend' : 'mouseup', function () {
				
				if ( typeof url === 'string' && url.length > 0 ) {// && url !== urlCurrentPresentation ) {
                    
                    // toggle fullscreen off
                    
                    on_fullscreen_toggle( true );
                    
                    // empty placeholder
                    
                    elements.$presentationPlaceholder.empty();
                    
                    // hide current presentation
                    
                    elements.$presentation.addClass( 'hidden' );
                    
                    // deinit current presentation and remove when done
                    
                    if ( elements.$presentation.jmpress( 'initialized' ) ) {
                        
                        elements.$presentationsRemove = elements.$presentationsRemove.add( elements.$presentation );
                        
                        elements.$presentation.jmpress( 'deinit' );
                        
                    }
                    // remove instantly
                    else {
                        
                        elements.$presentation.remove();
                        
                    }
                    
                    // add new presentation container
                    
                    elements.$presentation = elements.$presentationClone.clone( true ).insertAfter( elements.$presentationPlaceholder );
                    
                    // hide fullscreen
                    
                    elements.$presentationFullscreen.addClass( 'hidden' );
					
					// change setup to loading
					
                    elements.$presentationSetup.removeClass( 'hidden' ).removeClass( 'alert-danger' ).addClass( 'alert-success' ).html( '<strong>One sec,</strong> looking up that presentation you selected.' );
					
					// store as current
					
					urlCurrentPresentation = url;
					
					// load into prep
					
					elements.$presentationPlaceholder.load( pathToPresentations + url, function ( responseText, textStatus ) {
						
						// if error on load
						if ( textStatus === 'error' ) {
							
							// change setup to error
							
                            elements.$presentationSetup.removeClass( 'alert-success' ).addClass( 'alert-danger' ).html( '<strong>Oops, this is embarrassing!</strong> Looks like that presentation got lost somewhere... try again or <a href="#overview">let me know</a>.' );

						}
						else {
                            
                            // hide setup
    					    
						    elements.$presentationSetup.addClass( 'hidden' );
                            
                            // setup fullscreen
                            
                            elements.$presentationFullscreen.removeClass( 'hidden' );
                            
                            // add presentation
                            
                            elements.$presentationPlaceholder.find( '.step' ).appendTo( elements.$presentation );
                            
                            // init presentation
                            
                            elements.$presentation.jmpress();
                            
                            // focus presentation so we can start navigating right away
                            
                            elements.$presentation.focus();
                            
                            // resize
                            
                            on_resize();
                            
						}
                        
					} );
                    
				}
                
            } );
            
		} );
		
		// listen for resize
		
		$( window ).on( 'resize', $.throttle( 250, on_resize ) );
		
		// resize once
		
		on_resize();
		
		// if has class button to trigger
		
		if ( typeof $classButtonToTrigger !== 'undefined' && $classButtonToTrigger.length > 0 ) {
			
			$classButtonToTrigger.trigger( Modernizr.touch ? 'touchend' : 'mouseup' );
			
		}
		
	}
	
	function on_resize() {
		
        var windowHeight = $( window ).innerHeight(),
            windowHeightLessMainNav = windowHeight - mainNavHeight;
        
		// set min height
		
        elements.$presentations.css( 'min-height', windowHeightLessMainNav );
        
        // set presentation container height based on screen width
        
        if ( $( window ).innerWidth() < 768 ) {
            
            elements.$presentation.css( 'min-height', windowHeight - presentationsPaddingVertical - presentationPadding * 2 );
		
        }
        else {
            
            elements.$presentation.css( 'min-height', windowHeightLessMainNav - elements.$presentationsHeader.outerHeight( true ) - presentationsPaddingVertical - presentationPadding * 2 );
            
        }
        
	}
	
	function on_requirement_toggle () {
		
		var $requirementItem = $( this ),
			id = $requirementItem.attr( 'id' );
		
		$requirementItem.toggleClass( 'complete' );
		
		if ( window.localStorage ) {
			
			window.localStorage[ id ] = $requirementItem.hasClass( 'complete' );
			
		}
		
	}
    
    function on_fullscreen_toggle ( off ) {
        
        // toggle fullscreen classes
        
        if ( off !== true || elements.$presentationFullscreen.hasClass( 'fullscreen' ) ) {
            
            elements.$presentation.toggleClass( 'fullscreen' );
            elements.$presentationFullscreen.toggleClass( 'fullscreen btn' );
            $( 'html' ).toggleClass( 'fullscreen' );
            
        }
        
        // listen for esc key
        
        $( window ).off( 'keyup', on_key_released );
        
        if ( elements.$presentationFullscreen.hasClass( 'fullscreen' ) ) {
            
            $( window ).on( 'keyup', on_key_released );
            
            // add to body
            
            elements.$presentation.appendTo( 'body' );
            elements.$presentationFullscreen.appendTo( 'body' );
            
        }
        else {
            
            // add to original containers after placeholders
            
            elements.$presentationPlaceholder.after( elements.$presentation );
            elements.$presentationFullscreenPlaceholder.after( elements.$presentationFullscreen );
            
        }
        
        // focus presentation
        
        elements.$presentation.focus();
        
    }
    
    function on_key_released ( e ) {
        
        var keyCode = ( ( e.which || e.key || e.keyCode ) + '' ).toLowerCase();
        
        // by key
        
        if ( keyCode === '27' ) {
            
            on_fullscreen_toggle();
            
        }
        
    }
		
} )();