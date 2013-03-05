/*!
 *
 * @author Collin Hover / http://collinhover.com
 *
 */
var CKH = ( function ( _main ) {
	
	var _jmpressDefaults,
        _de = {},
        _ce = {},
        _pathToClasses = 'classes/',
        _pathToPresentations = 'presentations/',
        _s.tabActiveId,
		_currentClassURL,
        _currentClassReady,
        _currentPresentationURL,
        _presentationFocusTimeoutID,
        _presentationFullscreenState = false,
        _presentationFullscreenStatePrev = _presentationFullscreenState,
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
            
            if ( _de.$presentationsRemove.is( $element ) ) {
                
                // remove element from list
                
                _de.$presentationsRemove = _de.$presentationsRemove.not( $element );
                
                // remove element from display
                
                $element.remove();
                
            }
            
        } );
		
        // get properties
        
        _presentationsPaddingVertical = parseInt( _de.$presentations.css( 'padding-top' ) ) + parseInt( _de.$presentations.css( 'padding-bottom' ) );
        _presentationFullscreenState = _de.$presentations.hasClass( 'fullscreen' );
        
        // for each main nav link
        
        _de.$navigation.find( 'a[href^="#"]' ).not( _de.$navigationToggle ).each( function () {
            
            var $link = $( this );
            
            if ( $link.attr( 'href' ) !== "#" ) {
                
                $link.on( Modernizr.touch ? 'touchend' : 'click', function ( e ) {
                    
                    _de.$navigationToggle.click();
                    
                } );
                
            }
            
        } );
        
        // for each tab toggle
        
        _de.$tabToggles.each( function () {
            
            var $toggle = $( this ),
                $section = $( $toggle.data( 'section' ) );
            
            $toggle.on( Modernizr.touch ? 'touchend' : 'click', function ( e ) {
                
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
        
        _de.$classNav.affix( { 
            offset: { 
                top: function () {
                    return _de.$classNavWrapper.offset().top - _s.hNav;
                } 
            }
        } );
        
		// for each class button
		
		_de.$buttonsClasses.each( function () {
			
			var $button = $( this ),
				url;
			
			// get class url
			
			url = $.trim( $button.data( "url" ) ).replace( _pathToClasses, '' );
			
			// listen for activate
			
			$button.on( Modernizr.touch ? 'touchend' : 'click', function () {
                
				if ( typeof url === 'string' && url.length > 0 && url !== _currentClassURL ) {
                    
					// empty current class
					
                    _currentClassReady = false;
                    _de.$classProjects = $();
                    _de.$classCalendar= $();
					_de.$classContent.empty().removeClass( 'hidden' );
                    _de.$classHeader.removeClass( 'hidden' );
					
					// change setup to loading
					
					_de.$classPreloader.removeClass( 'hidden' );
                    _de.$classPreloaderHeader.html( "Class loading..." );
                    _de.$classPreloaderBody.removeClass( 'alert-danger' ).addClass( 'alert-success' ).html( '<strong>One sec,</strong> looking up that class you selected.' );
					
					// store as current
					
					_currentClassURL = url;
					
					// load
					
					_de.$classContent.load( _pathToClasses + url, function ( responseText, textStatus ) {
						
						// if error on load
						if ( textStatus === 'error' ) {
							
							// change setup to error
							
                            _de.$classPreloaderHeader.html( "Oops!" );
                            _de.$classPreloaderBody.removeClass( 'alert-success' ).addClass( 'alert-danger' ).html( '<strong>This is embarrassing! </strong> Looks like that class got lost somewhere... try again or <a href="#overview">let me know</a>.' );
                            
						}
						else {
                            
                            // store current
                            
        					if ( window.localStorage ) {
        						
        						window.localStorage[ '_currentClassURL' ] = _currentClassURL;
        						
        					}
                            
                            // hide setup
    					    
						    _de.$classPreloader.addClass( 'hidden' );
                            
                            // misc
                            
                            ShowProjects();
                            ShowCalendar();
                            
                            // resize
                            
                            _ui.OnWindowResized();
                            
                            // ready
                            
                            _currentClassReady = true;
							
						}
						
					} );
					
				}
			
			} );
			
		} );
        
        // add fullscreen presentation callback
        
        //_de.$presentationFullscreenToggle.on( Modernizr.touch ? 'touchend' : 'click', OnFullscreenToggle );
        
        // for each presentation button
    	
		_de.$buttonsPresentations.each( function () {
			
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
                    
                    _de.$presentationPlaceholder.empty();
					
					// change setup to loading
					
                    _de.$presentationPreloader.removeClass( 'hidden' ).removeClass( 'alert-danger' ).addClass( 'alert-success' );
                    _de.$presentationPreloaderInner.html( '<strong>One sec,</strong> preparing that presentation for you!' );
					
					// store as current
					
					_currentPresentationURL = url;
					
					// load into prep
					
					_de.$presentationPlaceholder.load( _pathToPresentations + url, function ( responseText, textStatus ) {
						
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
                            
						}
                        
					} );
                    
				}
                
            } );
            
		} );
        
        // update pretty print
        
        prettyPrint();
		
		// listen for resize
		
		$( window ).on( 'resize', _ui.OnWindowResized );
        
        // wait to setup initial presentation
        
        _de.$tabToggles.filter( '[href="#presentations"]' ).one( 'shown', InitPresentation );
        
        // get url hash for initial tab
        
        if ( window.location.hash && window.location.hash.length > 0 ) {
            
            $initialTabToggle = _de.$tabToggles.filter( '[href="' + window.location.hash + '"]' );
            
            // nothing found, search children of tab panes to find hash
            
            if ( $initialTabToggle.length === 0 ) {
                
                id = window.location.hash.replace( '#', '' );
                
                _de.$tabs.each( function () {
                    
                    var $tab = $( this ),
                        $child;
                    
                    $child = $tab.find( '[id="' + id + '"]' );
                    
                    if ( $child.length > 0 ) {
                        
                        $initialTabToggle = _de.$tabToggles.filter( '[href="#' + $tab.attr( 'id' ) + '"]' );
                        
                        return false;
                        
                    }
                    
                } );
                
                if ( $initialTabToggle.length > 1 ) {
                    
                    $initialTabToggle = $initialTabToggle.filter( '[data-section="#' + id + '"]' );
                    
                }
                
            }
            
        }
        
        if ( typeof $initialTabToggle === 'undefined' || $initialTabToggle.length === 0 ) {
            
            $initialTabToggle = _de.$tabToggles.filter( '[href="#overview"]' );
            
        }
        
        // hide setup
        
        _de.$preloader.removeClass( 'in' );
        
        // show page
        
        _de.$content.addClass( 'in' );
        
        // show initial tab
        
        $initialTabToggle.tab( 'show' );
        
	}
    
    /*===================================================
    
    events
    
    =====================================================*/
    
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
            
            _de.$presentationPreloaderInner.toggleClass( 'container' );
            _de.$presentations.toggleClass( 'fullscreen' );
            
        }
        
        // handle by fullscreen state
        
        _presentationFullscreenStatePrev = _presentationFullscreenState;
        _presentationFullscreenState = _de.$presentations.hasClass( 'fullscreen' );
        
        if ( _presentationFullscreenState !== _presentationFullscreenStatePrev ) {
            
            if ( _presentationFullscreenState === true ) {
                
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
    
    classes
    
    =====================================================*/
    
    function AddClass ( parameters ) {
        
        var name,
            navigation;
        
        if ( parameters && typeof parameters.name !== 'undefined' ) {
            
            // properties
            
            name = $.trim( parameters.name );
            
            // handle name and summary
            
            _de.$className.html( name );
            
            if ( typeof parameters.summary === 'string' ) {
                
                _de.$classSummary.removeClass( 'hidden' ).html( parameters.summary );
                
            }
            else {
                
                _de.$classSummary.addClass( 'hidden' );
                
            }
            
            // links
            
            _de.$classNavListMain.empty();
            _de.$classNavListAlt.empty();
            
            navigation = parameters.navigation;
            
            if ( navigation.main ) {
                
                $.each( navigation.main, function ( i, element ) {
                    
                    AddClassLink( element, _de.$classNavListMain );
                    
                } );
                
            }
            
            if ( navigation.alt ) {
                
                $.each( navigation.alt, function ( i, element ) {
                    
                    AddClassLink( element, _de.$classNavListAlt );
                    
                } );
                
            }
            
            AddClassLink( '<a href="#classes"><h6>' + name + '</h6></a>', _de.$classNavListAlt );
            
            // misc
            
            AddProjects( parameters.projects );
            AddCalendar( parameters.calendar );
            
            
        }
        
    }
    
    function AddClassLink( link, $list ) {
        
        var $link = $( link ),
            $target;
        
        if ( $list && $list.length > 0 && _de.$classNav.find( $link ).length === 0 ) {
            
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
                    $file = _ce.$projectResource.clone( true );
                    
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
                    $link = _ce.$projectResource.clone( true );
                    
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
                    $requirement = _ce.$projectRequirement.clone( true );
                    
                    // properties
                    
                    requirementText = $.trim( data.text );
					if ( data.designer === true ) {
						$requirement.addClass( 'designer' );
					}
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
            
            _de.$classProjects = _de.$classProjects.add( $project );
            
        }
        
    }
    
    function ShowProjects () {
        
        // init projects container
        
        _de.$classProjectsContainer = _ce.$projectsContainer.clone( true );
        
        // add projects container
        
        _de.$classContent.append( _de.$classProjectsContainer );
        
        // init accordion
        
        _de.$classProjectsAccordion = _ce.$projectsAccordion.clone( true );
        
        // add accordion
        
        _de.$classProjectsContainer.append( _de.$classProjectsAccordion );
        
        if ( _de.$classProjects.length > 0 ) {
            
            // hide projects warning
            
            _de.$classProjectsContainer.find( '#projectsEmptyWarning' ).addClass( 'hidden' );
            
            // for each project
            
            _de.$classProjects.each( function ( i, element ) {
                
                var $project = $( this ),
                    $projectBody = $project.find( '.accordion-body' );
                
                // add to display
                
                _de.$classProjectsAccordion.append( $project );
                
                // setup accordion behavior
                
                $projectBody.addClass( 'collapse' );
                
                $project.find( '.accordion-toggle' )
                    .on( Modernizr.touch ? 'touchend' : 'click', $.proxy( OnProjectToggle, $projectBody ) );
                    
            } );
            
        }
        
        // add link to navigation
        
        AddClassLink( _de.$classProjectsLink, _de.$classNavListMain );
        
    }
    
    /*===================================================
    
    calendar
    
    =====================================================*/
    
    function AddCalendar ( parameters ) {
        
        if ( parameters && parameters.embed || parameters.link ) {
            
            // init calendar
            
            _de.$classCalendar = _ce.$calendar.clone( true );
            
            // handle embed
            
            if ( parameters.embed ) {
                
                _ce.$calendarEmbed.clone( true )
                    .appendTo( _de.$classCalendar )
                    .attr( 'src', parameters.embed );
                
            }
            
            // handle link
            
            if ( parameters.link ) {
                
                _ce.$calendarLink.clone( true )
                    .appendTo( _de.$classCalendar )
                    .find( '.calendar-link' )
                        .attr( 'href', parameters.link );
                    
            }
            
        }
        
    }
    
    function ShowCalendar () {
        
        if ( _de.$classCalendar.length > 0 ) {
            
            // add calendar
            
            _de.$classContent.append( _de.$classCalendar );
            
            // add link to navigation
            
            AddClassLink( _de.$classCalendarLink, _de.$classNavListMain );
        
        }
        
    }
    
    /*===================================================
    
    presentations
    
    =====================================================*/
    
    function InitPresentation () {
        
        var $presentationPrev,
            $steps;
        
        // handle new steps
        
        $steps = _de.$presentationPlaceholder.find( '.step' );
        
        if ( $steps.length > 0 ) {
            
            // store current presentation
            
            $presentationPrev = _de.$presentation;
            
            // add new presentation container
            
            _de.$presentation = _ce.$presentation.clone( true ).insertAfter( _de.$presentationPlaceholder );
            
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
            
            _de.$presentation.append( $steps ).jmpress();
            
            // ensure canvas has no width or height, else will start misaligned
            
            _de.$presentation.jmpress( 'canvas' ).width( 0 ).height( 0 );
            
            // update pretty print
            
            prettyPrint();
            
            // resize
            
            _ui.OnWindowResized();
            
            // when images loaded
            
            _de.$presentation.imagesLoaded( function() {
                
                // hide setup
                
                _de.$presentationPreloader.addClass( 'hidden' );
                
                // for each step
                
                $steps.each( function ( i, element ) {
                    
                    var $element = $( element ),
                        stepData = $element.data('stepData');
                    
                    // set viewport
                    
                    stepData.viewPortWidth = $element.outerWidth( true );
                    stepData.viewPortHeight = $element.outerHeight( true );
                    
                } );
                
                // resize
                
                _ui.OnWindowResized();
                
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
    
    return _main;
		
} )( CKH || {} );