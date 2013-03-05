define( [ 
	"jquery",
	"signals",
	"jquery.easing",
	"mdetect"
],
function ( $, Signal ) {
	
	var _s = {};
	
	/*===================================================
	
	signals
	
	=====================================================*/
	
	_s.signals = {
		onReady: new Signal(),
		onScrolled: new Signal(),
		onResized: new Signal()
	};
	
	/*===================================================
	
	dom elements
	
	=====================================================*/
	
	var _de = _s.domElements = {};
	
	_de.$window = $( window );
	_de.$document = $( document );
	_de.$html = _de.$document.find( "html" );
	_de.$body = _de.$document.find( "body" );
	_de.$main = $( "#main" );
	_de.$content = $( "#content" );
	
	_de.$preloader = $( "#preloader" );
	_de.$nosupport = $( "#nosupport" );
	
	_de.$logo = $( ".logo" );
	_de.$icons = $( 'i' );
	_de.$tabs = $( '.tab-pane' );
	_de.$tabToggles = $( '.tab-toggles' ).find( '[href^="#"]' );
	_de.$buttonsDropdown = $( '[data-toggle="dropdown"]' );
	
	_de.$containerFill = $( ".container-fill" );
	
	_de.$navigation = $( "#navigation" );
	_de.$navigationToggle = _de.$navigation.find( '[data-toggle="collapse"]' );
	
	_de.$overview = $( '#overview' );
	
	_de.$policies = $( '#policies' );
	
	_de.$classes = $( '#classes' );
	_de.$class = $( '#class' );
	_de.$classHeader = $( '#classHeader' );
	_de.$classContent = $( '#classContent' );
	_de.$className = $( '.class-name' );
	_de.$classSummary = $( '.class-summary' );
	_de.$classNav = $( '#classNav' );
	_de.$classNavWrapper = $( '#classNavWrapper' );
	_de.$classNavListMain = $( '#classNavListMain' );
	_de.$classNavListAlt = $( '#classNavListAlt' );
	_de.$classSetup = $( '#classSetup' );
	_de.$classSetupHeader = $( '#classSetupHeader' );
	_de.$classSetupBody = $( '#classSetupBody' );
	_de.$classProjects = $();
	_de.$classProjectsLink = $( '<a href="#classProjects">Projects</a>' );
	_de.$classCalendar = $();
	_de.$classCalendarLink = $( '<a href="#classCalendar">Calendar</a>' );
	_de.$buttonsClasses = $( '.button-class' );
	
	_de.$presentations = $( '#presentations' );
	_de.$presentationsControl = $( '#presentationsControl' );
	_de.$presentationsNav = $( '#presentationsNav' );
	_de.$presentationsRemove = $();
	_de.$presentationWrapper = $( '#presentationWrapper' );
	_de.$presentation = $( '#presentation' );
	_de.$presentationPlaceholder = $( '#presentationPlaceholder' );
	_de.$presentationSetup = $( '#presentationSetup' );
	_de.$presentationSetupInner = $( '#presentationSetupInner' );
	_de.$presentationFullscreenToggle = $( '#presentationFullscreenToggle' );
	_de.$presentationName = $( '.presentation-name' );
	_de.$presentationDescription = $( '.presentation-description' );
	_de.$buttonsPresentations = $( '.button-presentation' );
	
	/*===================================================
	
	cloneable elements
	
	=====================================================*/
	
	var _ce = _s.cloneableElements = {};
	
	_ce.$presentation = _de.$presentation.clone( true );
	_ce.$projectsContainer = $( '<section id="classProjects"><div class="page-header"><h1>Projects <small>public service announcement: get back to work</small></h1></div><div id="projectsEmptyWarning" class="container-center"><div class="separate"><img src="img/alertcircle_rev_64.png" alt="Alert"></div><p>All the projects have run off!</p><p><small>not to worry, they are probably around here somewhere...</small></p></div></section>' );
	_ce.$projectsAccordion = $( '<div id="projectsAccordion" class="accordion"></div>' );
	_ce.$projectResource = $( '<p class="project-resource"><a target="_blank" class="project-resource-link"></a></p>' );
	_ce.$projectRequirement = $( '<div class="requirement-item"><div class="requirement-item-checkbox"></div><span class="requirement-item-text"></span></div>' );
	_ce.$calendar = $( '<section id="classCalendar"><div class="page-header"><h1>Calendar</h1></div></section>' );
	_ce.$calendarEmbed = $( '<iframe src="" class="calendar-embed" frameborder="0" scrolling="no" type="text/html"></iframe>' );
	_ce.$calendarLink = $( '<div class="hero-anchor"><p><small>Calendar not working right?</small></p><a href="" target="_blank" class="btn btn-large btn-primary calendar-link"><i class="icon-calendar icon-white"></i> Open Simple Calendar</a></div>' );
	
	/*===================================================
	
	general
	
	=====================================================*/
	
	_s.throttleTimeShort = _s.timeDeltaExpected * 3;
	_s.throttleTimeMedium = 100;
	_s.throttleTimeLong = 250;
	
	_s.scrollDuration = 2000;
	_s.fadeDuration = 500;
	_s.collapseDuration = 500;
	_s.fadeEasing = 'easeInOutCubic';
	_s.collapseEasing = 'easeInOutCubic';
	
	_s.w = _de.$window.width();
    _s.h = _de.$window.height();
	
	/*===================================================
	
	support
	
	=====================================================*/
	
	_s.mobile = DetectTierIphone() || DetectTierTablet();
	_s.unsupported = _de.$html.hasClass( 'lt-ie8' )
		|| !_de.$html.hasClass( 'fontface' )
		|| !_de.$html.hasClass( 'opacity' )
		|| !Modernizr.mq( '(min-width: 0px)' );
	_s.ie9 = _de.$html.hasClass( 'ie9' );
	_s.supports = {
		pointerEvents: Modernizr.testProp('pointerEvents')
	};
	
	// svg not correctly supported, fallback on png
	
	if ( !Modernizr.svg || !Modernizr.svgclippaths ) {
		
		SVGtoPNG( $( 'img' ) );
		
	}
	
	function SVGtoPNG ( $elements ) {
		
		$elements.each( function () {
			
			var $element = $( this );
			var src = $element.attr( 'src' ) || '';
			var index = src.lastIndexOf( '.svg' );
			
			if ( index !== -1 ) {
				
				$element.attr( 'src', src.slice( 0, index ) + '.png' );
				
			}
		} );
		
	}
	
	return _s;
	
} );