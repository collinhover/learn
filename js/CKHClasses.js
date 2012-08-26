/*!
 *
 * @author Collin Hover / http://collinhover.com
 *
 */
var CKH = ( function ( _main ) {
	
	var _jmpressDefaults,
        _throttled = {},
        _elements = {},
        _cloneables = {},
        _pathToClasses = 'classes/',
        _pathToPresentations = 'presentations/',
        _currentTab,
		_currentClassURL,
        _currentClassReady,
        _currentPresentationURL,
        _presentationFocusTimeoutID,
        _presentationFullscreenState = false,
        _presentationFullscreenStatePrev = _presentationFullscreenState,
        _mainNavHeight,
        _presentationsPaddingVertical,
        _classTimeMax = 15;
    
    /*===================================================
    
    public
    
    =====================================================*/
    
    _main.classes = {};
    _main.classes.AddClass = AddClass;
    _main.classes.AddProjects = AddProjects;
    _main.classes.AddCalendar = AddCalendar;
    
	/*===================================================
    
	loading
    
    =====================================================*/
	
	$LAB
		.script( [
			"js/jquery-1.7.2.min.js",
			"js/RequestAnimationFrame.js",
			"js/RequestInterval.js",
			"js/RequestTimeout.js",
            "js/prettify.min.js"
		] )
		.wait()
		.script( [
            "js/jmpress.all.min.js",
			"js/bootstrap.min.js",
            "js/jquery.throttle-debounce.custom.min.js",
			"js/jquery.easing-1.3.min.js",
            "js/jquery.imagesloaded.min.js"
		] )
        .wait( Init );
	
	/*===================================================
    
	init
    
    =====================================================*/
	
	function Init () {
		
		$( document ).ready( OnReady );
		
	}
	
	function OnReady () {
        
        var id,
            $initialTabToggle;
        
        // jmpress defaults
        
        _jmpressDefaults = $.jmpress('defaults');
        _jmpressDefaults.hash.use = false;
        _jmpressDefaults.fullscreen = false;
        _jmpressDefaults.notSupportedClass = 'static-presentation';
        // no zoom
        _jmpressDefaults.viewPort.zoomBindMove = false;
        _jmpressDefaults.viewPort.zoomBindWheel = false;
        // max scale of 1, we can scale down to fit steps but not up
        // this ensures css typography size is not exceeded
        _jmpressDefaults.viewPort.maxScale = 1;
        
        // presentation fallback template
       
        $.jmpress("template", "fallback", {
    		children: function ( i, element, all_elements ) {
                
                var $element = $( element ),
                    x = i * $element.outerWidth( true );
                
        		return {
    				//y: 400,
    				x: x,
                    //scale: 0.3,
    				template: "fallback"
    			}
                
    		}
		});
        
        // presentation remove on deinit
        
        $.jmpress( 'afterDeinit', function ( element ) {
            
            var $element = $( element );
            
            // if element is waiting for remove
            
            if ( _elements.$presentationsRemove.is( $element ) ) {
                
                // remove element from list
                
                _elements.$presentationsRemove = _elements.$presentationsRemove.not( $element );
                
                // remove element from display
                
                $element.remove();
                
            }
            
        } );
        
        // throttle functions
        
        _throttled.OnResize = $.throttle( 500, OnResize );
        
		// get ui _elements
		
        _elements.$logo = $( ".logo" );
		_elements.$mainNav = $( "#mainNav" );
        _elements.$mainNavToggle = _elements.$mainNav.find( '[data-toggle="collapse"]' );
		_elements.$overview = $( '#overview' );
		_elements.$policies = $( '#policies' );
		_elements.$classes = $( '#classes' );
		_elements.$class = $( '#class' );
        _elements.$classHeader = $( '#classHeader' );
    	_elements.$classContent = $( '#classContent' );
        _elements.$className = $( '.class-name' );
        _elements.$classSummary = $( '.class-summary' );
        _elements.$classNav = $( '#classNav' );
        _elements.$classNavWrapper = $( '#classNavWrapper' );
        _elements.$classNavListMain = $( '#classNavListMain' );
        _elements.$classNavListAlt = $( '#classNavListAlt' );
		_elements.$classSetup = $( '#classSetup' );
    	_elements.$classSetupHeader = $( '#classSetupHeader' );
    	_elements.$classSetupBody = $( '#classSetupBody' );
        _elements.$classProjects = $();
        _elements.$classProjectsLink = $( '<a href="#classProjects">Projects</a>' );
        _elements.$classCalendar = $();
        _elements.$classCalendarLink = $( '<a href="#classCalendar">Calendar</a>' );
        _elements.$presentations = $( '#presentations' );
        _elements.$presentationsControl = $( '#presentationsControl' );
        _elements.$presentationsNav = $( '#presentationsNav' );
        _elements.$presentationsRemove = $();
        _elements.$presentationWrapper = $( '#presentationWrapper' );
        _elements.$presentation = $( '#presentation' );
        _elements.$presentationPlaceholder = $( '#presentationPlaceholder' );
        _elements.$presentationSetup = $( '#presentationSetup' );
        _elements.$presentationSetupInner = $( '#presentationSetupInner' );
        _elements.$presentationFullscreenToggle = $( '#presentationFullscreenToggle' );
        _elements.$presentationName = $( '.presentation-name' );
        _elements.$presentationDescription = $( '.presentation-description' );
		_elements.$icons = $( 'i' );
        _elements.$tabs = $( '.tab-pane' );
        _elements.$tabToggles = $( '.tab-toggles' ).find( '[href^="#"]' );
        _elements.$buttonsDropdown = $( '[data-toggle="dropdown"]' );
		_elements.$buttonsClasses = $( '.button-class' );
    	_elements.$buttonsPresentations = $( '.button-presentation' );
        
        // create _cloneables
        
        _cloneables.$presentation = _elements.$presentation.clone( true );
        _cloneables.$projectsContainer = $( '<section id="classProjects"><div class="page-header"><h1>Projects <small>public service announcement: get back to work</small></h1></div><div id="projectsEmptyWarning" class="container-center"><div class="separate"><img src="img/alertcircle_rev_64.png" alt="Alert"></div><p>All the projects have run off!</p><p><small>not to worry, they are probably around here somewhere...</small></p></div></section>' );
        _cloneables.$projectsAccordion = $( '<div id="projectsAccordion" class="accordion"></div>' );
        _cloneables.$projectResource = $( '<p class="project-resource"><a target="_blank" class="project-resource-link"></a></p>' );
        _cloneables.$projectRequirement = $( '<div class="requirement-item"><div class="requirement-item-checkbox"></div><span class="requirement-item-text"></span></div>' );
        _cloneables.$calendar = $( '<section id="classCalendar"><div class="page-header"><h1>Calendar</h1></div></section>' );
        _cloneables.$calendarEmbed = $( '<iframe src="" class="calendar-embed" frameborder="0" scrolling="no" type="text/html"></iframe>' );
        _cloneables.$calendarLink = $( '<div class="hero-anchor"><p><small>Calendar not working right?</small></p><a href="" target="_blank" class="btn btn-large btn-primary calendar-link"><i class="icon-calendar icon-white"></i> Open Simple Calendar</a></div>' );
        
        // get properties
        
        _mainNavHeight = _elements.$mainNav.outerHeight( true );
        _presentationsPaddingVertical = parseInt( _elements.$presentations.css( 'padding-top' ) ) + parseInt( _elements.$presentations.css( 'padding-bottom' ) );
        _presentationFullscreenState = _elements.$presentations.hasClass( 'fullscreen' );
        
        // for each main nav link
        
        _elements.$mainNav.find( 'a[href^="#"]' ).not( _elements.$mainNavToggle ).each( function () {
            
            var $link = $( this );
            
            if ( $link.attr( 'href' ) !== "#" ) {
                
                $link.on( Modernizr.touch ? 'touchend' : 'click', function ( e ) {
                    
                    _elements.$mainNavToggle.click();
                    
                } );
                
            }
            
        } );
        
        // for each tab toggle
        
        _elements.$tabToggles.each( function () {
            
            var $toggle = $( this ),
                $section = $( $toggle.data( 'section' ) );
            
            $toggle.on( Modernizr.touch ? 'touchend' : 'click', function ( e ) {
                
                if ( _currentTab !== $toggle.attr( 'href' ) ) {
                    
                    $toggle.tab('show');
                    
                }
                else if ( $section.length > 0 ) {
                    
                    window.location.hash = '#' + $section.attr( 'id' );
                    $section[0].scrollIntoView( true );
                    
                    e.preventDefault();
                    
                }
                
            } )
            .on( 'show', function () {
                
                _currentTab = $toggle.attr( 'href' );
                
            } )
            .on( 'shown', function () {
                
                OnResize();
                
                if ( $section.length > 0 ) {
                    window.location.hash = '#' + $section.attr( 'id' );
                    $section[0].scrollIntoView( true );
                }
                
                if ( _currentTab === '#presentations' && _elements.$presentation.jmpress('initialized') === true ) {
                    
                    FitPresentation();
                    
                }
                
            } );
            
        } );
        
        // for all dropdowns
        
        _elements.$buttonsDropdown.parent().each( function () {
            
            var $dropdown = $( this );
            
            $dropdown.find( '.dropdown-menu a' ).each( function () {
                
                var $button = $( this );
                
                $button.on( Modernizr.touch ? 'touchend' : 'click', function () {
                        
                        $button.parent().removeClass( 'active' );
                        
                        $dropdown.removeClass('open');
                        
                    } )
                    .on( 'shown', function () {
                        $button.parent().removeClass( 'active' );
                    } );
                
            } );
            
        } );
        
        // class nav
        
        _elements.$classNav.affix( { 
            offset: { 
                top: function () {
                    return _elements.$classNavWrapper.offset().top - _mainNavHeight;
                } 
            }
        } );
        
		// for each class button
		
		_elements.$buttonsClasses.each( function () {
			
			var $button = $( this ),
				url;
			
			// get class url
			
			url = $.trim( $button.data( "url" ) ).replace( _pathToClasses, '' );
			
			// listen for activate
			
			$button.on( Modernizr.touch ? 'touchend' : 'click', function () {
                
				if ( typeof url === 'string' && url.length > 0 && url !== _currentClassURL ) {
                    
					// empty current class
					
                    _currentClassReady = false;
                    _elements.$classProjects = $();
                    _elements.$classCalendar= $();
					_elements.$classContent.empty()
                        .addClass( 'hidden' );
                    _elements.$classHeader.addClass( 'hidden' );
					
					// change setup to loading
					
					_elements.$classSetup.removeClass( 'hidden' );
                    _elements.$classSetupHeader.html( "Class loading..." );
                    _elements.$classSetupBody.removeClass( 'alert-danger' ).addClass( 'alert-success' ).html( '<strong>One sec,</strong> looking up that class you selected.' );
					
					// store as current
					
					_currentClassURL = url;
					
					// load
					
					_elements.$classContent.load( _pathToClasses + url, function ( responseText, textStatus ) {
						
						// if error on load
						if ( textStatus === 'error' ) {
							
							// change setup to error
							
                            _elements.$classSetupHeader.html( "Oops!" );
                            _elements.$classSetupBody.removeClass( 'alert-success' ).addClass( 'alert-danger' ).html( '<strong>This is embarrassing! </strong> Looks like that class got lost somewhere... try again or <a href="#overview">let me know</a>.' );
                            
						}
						else {
                            
                            // store current
                            
        					if ( window.localStorage ) {
        						
        						window.localStorage[ '_currentClassURL' ] = _currentClassURL;
        						
        					}
                            
                            // hide setup
    					    
						    _elements.$classSetup.addClass( 'hidden' );
                            
                            // class content
                            
                            _elements.$classHeader.removeClass( 'hidden' );
                            _elements.$classContent.removeClass( 'hidden' );
                            
                            // misc
                            
                            ShowProjects();
                            ShowCalendar();
                            
                            // resize
                            
                            _throttled.OnResize();
                            
                            // ready
                            
                            _currentClassReady = true;
							
						}
						
					} );
					
				}
			
			} );
			
		} );
        
        // add fullscreen presentation callback
        
        //_elements.$presentationFullscreenToggle.on( Modernizr.touch ? 'touchend' : 'click', OnFullscreenToggle );
        
        // for each presentation button
    	
		_elements.$buttonsPresentations.each( function () {
			
			var $button = $( this ),
				url;
            
            // set relative target
            
            $button.attr( 'href', '#presentations' );
			
			// get url
			
			url = $.trim( $button.data( "url" ) ).replace( _pathToPresentations, '' );
			
			// listen for activate
			
			$button.on( Modernizr.touch ? 'touchend' : 'click', function () {
                
				if ( typeof url === 'string' && url.length > 0 ) {// && url !== _currentPresentationURL ) {
                    
                    // empty placeholder
                    
                    _elements.$presentationPlaceholder.empty();
					
					// change setup to loading
					
                    _elements.$presentationSetup.removeClass( 'hidden' ).removeClass( 'alert-danger' ).addClass( 'alert-success' );
                    _elements.$presentationSetupInner.html( '<strong>One sec,</strong> preparing that presentation for you!' );
					
					// store as current
					
					_currentPresentationURL = url;
					
					// load into prep
					
					_elements.$presentationPlaceholder.load( _pathToPresentations + url, function ( responseText, textStatus ) {
						
						// if error on load
						if ( textStatus === 'error' ) {
							
							// change setup to error
							
                            _elements.$presentationSetup.removeClass( 'alert-success' ).addClass( 'alert-danger' );
                            _elements.$presentationSetupInner.html( '<strong>Oops, this is embarrassing!</strong> Looks like that presentation got lost somewhere... try again or let me know.' );

						}
						else {
                            
                            // init presentation
                            
                            InitPresentation();
                            MoveToPresentation();
                            
                            // focus presentation so we can start navigating right away
                            
                            _elements.$presentation.focus(); 
                            
						}
                        
					} );
                    
				}
                
            } );
            
		} );
        
        // update pretty print
        
        prettyPrint();
		
		// listen for resize
		
		$( window ).on( 'resize', _throttled.OnResize );
        
        // wait to setup initial presentation
        
        _elements.$tabToggles.filter( '[href="#presentations"]' ).one( 'shown', InitPresentation );
        
        // get url hash for initial tab
        
        if ( window.location.hash && window.location.hash.length > 0 ) {
            
            $initialTabToggle = _elements.$tabToggles.filter( '[href="' + window.location.hash + '"]' );
            
            // nothing found, search children of tab panes to find hash
            
            if ( $initialTabToggle.length === 0 ) {
                
                id = window.location.hash.replace( '#', '' );
                
                _elements.$tabs.each( function () {
                    
                    var $tab = $( this ),
                        $child;
                    
                    $child = $tab.find( '[id="' + id + '"]' );
                    
                    if ( $child.length > 0 ) {
                        
                        $initialTabToggle = _elements.$tabToggles.filter( '[href="#' + $tab.attr( 'id' ) + '"]' );
                        
                        return false;
                        
                    }
                    
                } );
                
                if ( $initialTabToggle.length > 1 ) {
                    
                    $initialTabToggle = $initialTabToggle.filter( '[data-section="#' + id + '"]' );
                    
                }
                
            }
            
        }
        
        if ( typeof $initialTabToggle === 'undefined' || $initialTabToggle.length === 0 ) {
            
            $initialTabToggle = _elements.$tabToggles.filter( '[href="#overview"]' );
            
        }
        
        // show initial tab
        
        $initialTabToggle.tab( 'show' );
        
	}
    
    /*===================================================
    
    events
    
    =====================================================*/
	
	function OnResize() {
	    
        var windowHeight,
            windowHeightLessMainNav,
            presentationHeight;
        
        if ( _currentTab === '#presentations' ) {
            
            windowHeight = $( window ).innerHeight();
            windowHeightLessMainNav = windowHeight - _mainNavHeight;
            
            // set presentation container min height
            
            if ( $( window ).innerWidth() < 768 ) {
                
                presentationHeight = windowHeight - _elements.$presentationsControl.outerHeight( true ) - _presentationsPaddingVertical;
                
            }
            else if ( _presentationFullscreenState === true ) {
                
                presentationHeight = windowHeightLessMainNav - _elements.$presentationsControl.outerHeight( true );
                
            }
            else {
                
                presentationHeight = windowHeightLessMainNav - _elements.$presentationsControl.outerHeight( true ) - _presentationsPaddingVertical;
                
            }
            
            _elements.$presentation.css( 'min-height', presentationHeight );
            
        }
        
        // class nav
        
        if ( _currentTab === '#classes' ) {
            
            _elements.$classNavWrapper.css( 'height', _elements.$classNav.outerHeight( true ) );
            
        }
        
	}
    
    function OnProjectToggle () {
        
        this.collapse( 'toggle' );
        
    }
	
	function OnRequirementToggle () {
		
		var $requirementItem = $( this ),
			id = $requirementItem.attr( 'id' );
		
		$requirementItem.toggleClass( 'complete' );
		
		if ( window.localStorage ) {
			
			window.localStorage[ id ] = $requirementItem.hasClass( 'complete' );
			
		}
		
	}
    
    function OnFullscreenToggle ( off ) {
        
        // clear focus
        
        if ( typeof _presentationFocusTimeoutID !== 'undefined' ) {
            
            window.clearRequestTimeout( _presentationFocusTimeoutID );
            _presentationFocusTimeoutID = undefined;
            
        }
        
        // remove listeners
        
        $( window ).off( 'keyup', OnKeyReleased );
        
        // toggle fullscreen classes
        
        if ( off !== true || _presentationFullscreenState === true ) {
            
            _elements.$presentationSetupInner.toggleClass( 'container' );
            _elements.$presentations.toggleClass( 'fullscreen' );
            
        }
        
        // handle by fullscreen state
        
        _presentationFullscreenStatePrev = _presentationFullscreenState;
        _presentationFullscreenState = _elements.$presentations.hasClass( 'fullscreen' );
        
        if ( _presentationFullscreenState !== _presentationFullscreenStatePrev ) {
            
            if ( _presentationFullscreenState === true ) {
                
                // listen for esc key
                
                $( window ).on( 'keyup', OnKeyReleased );
                
            }
            
            // Resize
            
            _throttled.OnResize();
            
            // delay focus/move
            
            _presentationFocusTimeoutID = window.requestTimeout( function () {
                
                // move screen to presentation
            
                MoveToPresentation();
                
                // focus presentation
                
                _elements.$presentation.focus();
                
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
    
    classes
    
    =====================================================*/
    
    function AddClass ( parameters ) {
        
        var name,
            navigation;
        
        if ( parameters && typeof parameters.name !== 'undefined' ) {
            
            // properties
            
            name = $.trim( parameters.name );
            
            // handle name and summary
            
            _elements.$className.html( name );
            
            if ( typeof parameters.summary === 'string' ) {
                
                _elements.$classSummary.removeClass( 'hidden' ).html( parameters.summary );
                
            }
            else {
                
                _elements.$classSummary.addClass( 'hidden' );
                
            }
            
            // links
            
            _elements.$classNavListMain.empty();
            _elements.$classNavListAlt.empty();
            
            navigation = parameters.navigation;
            
            if ( navigation.main ) {
                
                $.each( navigation.main, function ( i, element ) {
                    
                    AddClassLink( element, _elements.$classNavListMain );
                    
                } );
                
            }
            
            if ( navigation.alt ) {
                
                $.each( navigation.alt, function ( i, element ) {
                    
                    AddClassLink( element, _elements.$classNavListAlt );
                    
                } );
                
            }
            
            AddClassLink( '<a href="#classes"><h6>' + name + '</h6></a>', _elements.$classNavListAlt );
            
            // misc
            
            AddProjects( parameters.projects );
            AddCalendar( parameters.calendar );
            
            
        }
        
    }
    
    function AddClassLink( link, $list ) {
        
        var $link = $( link ),
            $target;
        
        if ( $list && $list.length > 0 && _elements.$classNav.find( $link ).length === 0 ) {
            
            $link.appendTo( $list ).wrap( $( '<li></li>' ) );
            
        }
        
    }
    
    /*===================================================
    
    projects
    
    =====================================================*/
    
    function AddProjects ( parameters ) {
        
        var i, il,
            $project,
            name,
            id,
            data,
            files,
            $files,
            $file,
            links,
            $links,
            $link,
            requirements,
            $requirements,
    		requirementIds = [],
			requirementIdCounts = {},
            requirementId,
            requirementText,
            $requirement;
        
        // if parameters is list, do recursive add
        
        if ( Object.prototype.toString.call( parameters ) === '[object Array]' ) {
            
            for ( i = 0, il = parameters.length; i < il; i++ ) {
                
                AddProjects( parameters[ i ] );
                
            }
            
        }
        // handle single project
        else if ( parameters && typeof parameters.name !== 'undefined' && typeof parameters.summary !== 'undefined' && typeof parameters.time !== 'undefined' ) {
            
            // properties
            
            name = $.trim( parameters.name );
            id = _currentClassURL + '_Project_' + name;
            
            // init new project
            
            $project = $( '<div class="accordion-group project"><div class="accordion-heading"><a class="accordion-toggle"><h4 class="project-name"></h4></a></div><div class="accordion-body"><div class="accordion-inner"><div class="row"><div class="span3"><div class="hero-anchor"><h6>Summary</h6><p class="project-summary"></p></div><div class="hero-anchor"><h6>What You Can Use</h6><p class="project-usables"></p></div><div class="hero-anchor"><h6>Timeline</h6><p class="project-time"></p><div class="progress progress-success progress-striped"><div id="puzzleActiveScoreBar" class="bar project-timebar" style="width: 0%;"></div></div></div><div class="hero-anchor project-files"><h6>Files</h6></div><div class="hero-anchor project-links"><h6>Links</h6></div></div><div class="span8 project-requirements"><h6>Requirements</h6></div></div></div></div></div>' );
            
            // properties
            
            $project.attr( 'id', id )
            .find( '.project-name')
                .html( name )
            .end().find( '.project-summary' )
                .html( parameters.summary )
            .end().find( '.project-usables' )
                .html( parameters.usables || 'Anything' )
            .end().find( '.project-time' )
                .html( parameters.time + ' / ' + ( parameters.timeMax || _classTimeMax ) + ' weeks' )
            .end().find( '.project-timebar' )
                .css( 'width', ( parameters.time / ( parameters.timeMax || _classTimeMax ) * 100 ) + '%' );
            
            // files
            
            files = parameters.files;
            $files = $project.find( '.project-files' );
            
            if ( files && files.length > 0 ) {
                
                for ( i = 0, il = files.length; i < il; i++ ) {
                    
                    data = files[ i ];
                    $file = _cloneables.$projectResource.clone( true );
                    
                    $file.attr( 'id', $.trim( data.id ) )
                        .find( '.project-resource-link' )
                        .attr( 'href', $.trim( data.url ) )
                        .html( $.trim( data.text ) );
                    
                    $files.append( $file );
                    
                }
                
            }
            else {
                
                $files.addClass( 'hidden' );
                
            }
            
            // links
            
            links = parameters.links;
            $links = $project.find( '.project-links' );
            
            if ( links && links.length > 0 ) {
                
                for ( i = 0, il = links.length; i < il; i++ ) {
                    
                    data = links[ i ];
                    $link = _cloneables.$projectResource.clone( true );
                    
                    $link.attr( 'id', $.trim( data.id ) )
                        .find( '.project-resource-link' )
                        .attr( 'href', $.trim( data.url ) )
                        .html( $.trim( data.text ) );
                    
                    $links.append( $link );
                    
                }
                
            }
            else {
                
                $links.addClass( 'hidden' );
                
            }
            
            // requirements
            
            requirements = parameters.requirements;
            $requirements = $project.find( '.project-requirements' );
            
            if ( requirements && requirements.length > 0 ) {
                
                for ( i = 0, il = requirements.length; i < il; i++ ) {
                    
                    data = requirements[ i ];
                    $requirement = _cloneables.$projectRequirement.clone( true );
                    
                    // properties
                    
                    requirementText = $.trim( data.text );
                    requirementId = id + '_Requirement_' + requirementText;
                    
                    // check if id already in list ( duplicate )
                    
                    if ( requirementIds.indexOf( requirementId ) !== -1 ) {
                    	
                    	// increase count
                    	
                    	requirementIdCounts[ requirementId ]++;
                    	
                    }
                    else {
                    	
                    	// store in list
                    
                    	requirementIds.push( requirementId );
                    	
                    	// init count
                    	
                    	requirementIdCounts[ requirementId ] = 0;
                    	
                    }
                    
                    // add id count to id

    				requirementId += '_' + requirementIdCounts[ requirementId ];
                    
                    // check local storage to see if item already completed
        			
    				if ( window.localStorage ) {
    					
    					$requirement[ window.localStorage[ requirementId ] === 'true' ? 'addClass' : 'removeClass' ]( 'complete' );
    					
    				}
                    
                    // set properties
                    
                    $requirement.attr( 'id', requirementId )
                        .on( Modernizr.touch ? 'touchend' : 'click', OnRequirementToggle )
                        .find( '.requirement-item-text' )
                        .html( requirementText );
                    
                    // store
                    
                    $requirements.append( $requirement );
                    
                }
                
            }
            else {
                
                $requirements.addClass( 'hidden' );
                
            }
            
            // store project
            
            _elements.$classProjects = _elements.$classProjects.add( $project );
            
        }
        
    }
    
    function ShowProjects () {
        
        // init projects container
        
        _elements.$classProjectsContainer = _cloneables.$projectsContainer.clone( true );
        
        // add projects container
        
        _elements.$classContent.append( _elements.$classProjectsContainer );
        
        // init accordion
        
        _elements.$classProjectsAccordion = _cloneables.$projectsAccordion.clone( true );
        
        // add accordion
        
        _elements.$classProjectsContainer.append( _elements.$classProjectsAccordion );
        
        if ( _elements.$classProjects.length > 0 ) {
            
            // hide projects warning
            
            _elements.$classProjectsContainer.find( '#projectsEmptyWarning' ).addClass( 'hidden' );
            
            // for each project
            
            _elements.$classProjects.each( function ( i, element ) {
                
                var $project = $( this ),
                    $projectBody = $project.find( '.accordion-body' );
                
                // add to display
                
                _elements.$classProjectsAccordion.append( $project );
                
                // setup accordion behavior
                
                $projectBody.collapse( {
                        parent: '#projectsAccordion',
                        toggle: false
                    } )
                    .collapse( 'hide' );
                
                $project.find( '.accordion-toggle' )
                    .on( Modernizr.touch ? 'touchend' : 'click', $.proxy( OnProjectToggle, $projectBody ) );
                    
            } );
            
        }
        
        // add link to navigation
        
        AddClassLink( _elements.$classProjectsLink, _elements.$classNavListMain );
        
    }
    
    /*===================================================
    
    calendar
    
    =====================================================*/
    
    function AddCalendar ( parameters ) {
        
        if ( parameters && parameters.embed || parameters.link ) {
            
            // init calendar
            
            _elements.$classCalendar = _cloneables.$calendar.clone( true );
            
            // handle embed
            
            if ( parameters.embed ) {
                
                _cloneables.$calendarEmbed.clone( true )
                    .appendTo( _elements.$classCalendar )
                    .attr( 'src', parameters.embed );
                
            }
            
            // handle link
            
            if ( parameters.link ) {
                
                _cloneables.$calendarLink.clone( true )
                    .appendTo( _elements.$classCalendar )
                    .find( '.calendar-link' )
                        .attr( 'href', parameters.link );
                    
            }
            
        }
        
    }
    
    function ShowCalendar () {
        
        if ( _elements.$classCalendar.length > 0 ) {
            
            // add calendar
            
            _elements.$classContent.append( _elements.$classCalendar );
            
            // add link to navigation
            
            AddClassLink( _elements.$classCalendarLink, _elements.$classNavListMain );
        
        }
        
    }
    
    /*===================================================
    
    presentations
    
    =====================================================*/
    
    function InitPresentation () {
        
        var $presentationPrev,
            $steps;
        
        // handle new steps
        
        $steps = _elements.$presentationPlaceholder.find( '.step' );
        
        if ( $steps.length > 0 ) {
            
            // store current presentation
            
            $presentationPrev = _elements.$presentation;
            
            // add new presentation container
            
            _elements.$presentation = _cloneables.$presentation.clone( true ).insertAfter( _elements.$presentationPlaceholder );
            
            // deinit current presentation and remove when done
            
            if ( $presentationPrev.jmpress( 'initialized' ) ) {
                
                _elements.$presentationsRemove = _elements.$presentationsRemove.add( $presentationPrev );
                
                $presentationPrev.addClass( 'hidden' ).jmpress( 'deinit' );
                
            }
            // remove instantly
            else {
                
                $presentationPrev.remove();
                
            }
            
            // add steps and init presentation
            
            _elements.$presentation.append( $steps ).jmpress();
            
            // ensure canvas has no width or height, else will start misaligned
            
            _elements.$presentation.jmpress( 'canvas' ).width( 0 ).height( 0 );
            
            // update pretty print
            
            prettyPrint();
            
            // resize
            
            OnResize();
            
            // when images loaded
            
            _elements.$presentation.imagesLoaded( function() {
                
                // hide setup
                
                _elements.$presentationSetup.addClass( 'hidden' );
                
                // for each step
                
                $steps.each( function ( i, element ) {
                    
                    var $element = $( element ),
                        stepData = $element.data('stepData');
                    
                    // set viewport
                    
                    stepData.viewPortWidth = $element.outerWidth( true );
                    stepData.viewPortHeight = $element.outerHeight( true );
                    
                } );
                
                // resize
                
                OnResize();
                
                FitPresentation();
                
            });
            
        }
        
    }
    
    function MoveToPresentation () {
        
        _elements.$presentations[0].scrollIntoView( true );
        
    }
    
    function FitPresentation () {
        
        _elements.$presentation.jmpress( 'select', _elements.$presentation.jmpress( 'active' ) );
        
    }
    
    return _main;
		
} )( CKH || {} );