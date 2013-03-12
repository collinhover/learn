define( [ 
	"jquery",
	"app/shared",
	"app/ui",
	"bootstrap"
],
function ( $, _s, _ui ) { "use strict";
	
	var _de = _s.domElements;
	var _ce = _s.cloneableElements;
	var _cls = {};
	
	/*===================================================
	
	init
	
	=====================================================*/
	
	_de.$classNav.affix( {
		container: _de.$content,
		offset: {
			top: function () {
				return _de.$classNavWrapper.offset().top - _s.hNav;
			}
		}
	});
	
	// for each class button
	
	_de.$buttonsClasses.each( function () {
		
		var $button = $( this ),
			url;
		
		// get class url
		
		url = $.trim( $button.data( "url" ) ).replace( _s.pathToClasses, '' );
		
		// listen for activate
		
		$button.on( _s.events.click, function () {
			
			if ( typeof url === 'string' && url.length > 0 && url !== _s.classActiveURL ) {
				
				// empty current class
				
				_s.classActiveReady = false;
				_de.$classProjects = $();
				_de.$classCalendar= $();
				_de.$classContent.empty().removeClass( 'hidden' );
				_de.$classHeader.removeClass( 'hidden' );
				
				// change setup to loading
				
				_de.$classPreloader.removeClass( 'hidden' );
				_de.$classPreloaderHeader.html( "Class loading..." );
				_de.$classPreloaderBody.removeClass( 'alert-danger' ).addClass( 'alert-success' ).html( '<strong>One sec,</strong> looking up that class you selected.' );
				
				// store as current
				
				_s.classActiveURL = url;
				
				// load
				
				_de.$classContent.load( _s.pathToClasses + url, function ( responseText, textStatus ) {
					
					// if error on load
					if ( textStatus === 'error' ) {
						
						// change setup to error
						
						_de.$classPreloaderHeader.html( "Oops!" );
						_de.$classPreloaderBody.removeClass( 'alert-success' ).addClass( 'alert-danger' ).html( '<strong>This is embarrassing! </strong> Looks like that class got lost somewhere... try again or <a href="#overview">let me know</a>.' );
						
					}
					else {
						
						// store current
						
						if ( window.localStorage ) {
							
							window.localStorage[ '_s.classActiveURL' ] = _s.classActiveURL;
							
						}
						
						// hide setup
						
						_de.$classPreloader.addClass( 'hidden' );
						
						// add
						// TODO: make not global
						
						AddClass( _ckhClassParameters );
						
						// show
						
						ShowProjects();
						ShowCalendar();
						
						// ui
						
						_ui.SuppressInPageLinks();
						_ui.OnWindowResized( false, true );
						
						// ready
						
						_s.classActiveReady = true;
						
					}
					
				} );
				
			}
		
		} );
		
	} );
	
	_s.signals.onResizeStarted.add( OnResize );
	
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
	
	
    /*===================================================
    
    class
    
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
            id = _s.classActiveURL + '_Project_' + name;
            
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
                .html( parameters.time + ' / ' + ( parameters.timeMax || _s.classTimeMax ) + ' weeks' )
            .end().find( '.project-timebar' )
                .css( 'width', ( parameters.time / ( parameters.timeMax || _s.classTimeMax ) * 100 ) + '%' );
            
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
                        .on( _s.events.click, OnRequirementToggle )
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
                    .on( _s.events.click, $.proxy( OnProjectToggle, $projectBody ) );
                    
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
    
    resize
    
    =====================================================*/
	
	function OnResize () {
		
        if ( _s.tabActiveId === '#classes' ) {
            
            _de.$classNavWrapper.css( 'height', _de.$classNav.outerHeight( true ) );
            
        }
		
	}
	
	return _cls;
	
} );