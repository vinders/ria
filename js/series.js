/* Seriamax - application de gestion de séries utilisant betaseries
 * Examen cours de RIA 2012 - 2013
 * Auteur : Romain VINDERS, 2384
 * janvier 2013 */

/*jslint regexp: true, vars: true, white: true, browser: true */
/*jshint nonstandard: true, browser: true, boss: true */

/*global jQuery */
( function ( $ ) {
	"use strict";
	
	// GLOBAL VARS
	
	var localList,
		localNumber,
		filterSeen,
		$page,
		apiUrl = 'http://api.betaseries.com',
		apiKey = 'd57266536e0a',
		$container = $( '#container' ),
		$searchIcon = $( '.searchIcon' ),
		$searchZone = $( '#searchZone' ),
		$searchField = $( '#searchZone input' ),
		$searchButton = $( '#searchZone button' ),
		loaderGifUrl = "data:image/gif;base64,R0lGODlhFAAGAPIEAHt7e8/Pzz5hfbjS5////wAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUP8/eHBhY2tldCBiZWdpbj0i72lkOkQ4ODdEQjRGNUVERDExRTI4MEE0QTA3MTZDQTJFMTc4Ij4gPHhtcE1NOkS/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZWFdWVVRTUlFQT05NTEtKSUhHRkVEQ0JBQD8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAIfkEBRQABAAsAAAAABQABgAAAyQ4uhT+7bkhqhgNaBDyDpSFBRvnaaB1nSb5hdVYdi66MJITSQkAIfkEBRQABAAsAAAAAA0ABgAAAxoYujT+AUgQmrhixFkHzpvUfdpEWZi2KM3jJAAh+QQFFAAEACwHAAAADQAGAAADGhi6NP4BSBCauGLEWQfOm9R92kRZmLYozeMkACH5BAUUAAIALA4AAAAGAAYAAAIKjB+gYMu5WkSmAAA7";
	
	
	// GLOBAL METHODS
		
	// -- Initialize from localstorage
	var initialize = function() {
	
		// get and count saved shows
		if( window.localStorage.getItem( 'shows' ) === null ) {
			localList = [];
		} else {
			localList = JSON.parse( window.localStorage.getItem( 'shows' ) );
		}
		getPlanningType();
		localNumber = localList.length;

		// current page procedure
		$page = $( '#container' ).attr( 'class' );
		if( localNumber ) {
			switch($page) {
				case 'dashboard' :	displayDashboard(); 
									break;
				case 'shows' :		displayShows(); 
									break;
				case 'planning' :	createPlanning(); 
									break;
			}
		}else{
			displayNone();
		}
		
	};// - initialize
	
	// -- Get the planning type and listen to changes
	var getPlanningType = function() {
		
		// get localstored setting
		if( window.localStorage.getItem( 'filterSeen' ) === null ) {
			filterSeen = 1;
		} else {
			filterSeen = window.localStorage.getItem( 'filterSeen' );
		}

		// notify about settings and listen to changes
		$( '#filter' + filterSeen ).attr( 'checked', 'checked' );
		$( '#filter' + filterSeen + '+label' ).attr( 'id', 'filterSetting' );
		$( '#prefs input' ).each( function() {
			$( this ).on( 'click', setPlanningType );
		} );
		
	};// - getPlanningType
	
	// -- Set the planning type (all episodes or current episode)
	var setPlanningType = function( e ) {
	
		filterSeen = e.target.getAttribute( 'value' );
		window.localStorage.setItem( 'filterSeen', filterSeen );
		document.getElementById( 'filterSetting' ).removeAttribute( 'id' );
		$( '#filter' + filterSeen + '+label' ).attr( 'id', 'filterSetting' );
		
	};// - setPlanningType
		
	// -- Ajax request
	var ajaxQuery = function( query, callback ){
	
		$.ajax( {
			dataType : "jsonp",
			data : { key : apiKey },
			url : apiUrl + query,
			type : "POST",
			success : function( data ){
				callback.apply( null, [ data ] );
			}
		} );
		
	};// - ajaxQuery
	
	
	// DISPLAY METHODS
		
	// -- Dashboard content (number of shows, suggestion or advices)
	var displayDashboard = function() {
	
		var similarReference;
		
		// adapt notification and suggestion according to the number of saved shows
		if( localNumber === 1) {
			$( '#number' ).append( '<span>1</span> série suivie' );
			similarReference = 0;
		} else {
			$( '#number' ).append( '<span>' + localNumber + '</span> séries suivies' );
			similarReference = Math.round( Math.random() * ( localNumber - 1 ) );
		}
		getSimilar( similarReference );
		
	};// - displayDashboard
	
	// -- Create the planning depending on the settings
	var createPlanning = function() {
		
		var swap = [],
			planningResult,
			monthsNames = [ 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre' ],
			currentTimestamp = new Date(),
			date,
			day,
			month,
			idDate,
			formattedDate;
		
		// get the general planning and filter it by date (settings) and by show (saved shows only)
		$container.append( '<section><p><img id="loader" src="' + loaderGifUrl + '" alt="loader" /> Création du planning...</p></section>' );
		ajaxQuery( '/planning/general.json', function( planning ) {
			planningResult = planning.root.planning;
			for( var i = 0; i < planningResult.length; i++ ) {
				date = new Date( planningResult[i].date * 1000 );
				if( date > currentTimestamp ) {
					for( var j = 0; j < localList.length; j++ ) {
						if( planningResult[i].url === localList[j].url ) {
							
							var reqSeason = parseInt( planningResult[i].season, 10 ),
								localSeason = localList[j].season,
								reqEpisode = parseInt( planningResult[i].episode, 10 ),
								localEpisode = localList[j].episode;
							planningResult[i].tvdb = localList[j].tvdb;
							planningResult[i].banner = localList[j].banner;
							
							switch(filterSeen) {
								case '0' :	if( ( reqSeason === localSeason && reqEpisode === localEpisode ) || ( reqSeason === localSeason && reqEpisode === ( localEpisode + 1 ) ) || ( reqSeason === ( localSeason + 1 ) && localEpisode === localList[j].nbmax && reqEpisode === 1 ) ) {
												swap.push( planningResult[i] );
												++localList[j].episode;
											}
											break;
								case '1' :	if( ( reqSeason === localSeason && reqEpisode >= localEpisode ) || ( reqSeason > localSeason ) ) {
												swap.push( planningResult[i] );
											}
											break;
								case '2' :	swap.push( planningResult[i] );
											break;
							}
							
						}
					}
				}
			}
			
			// add the selected episodes, classified by day
			$container.empty();
			for( var k = 0; k < swap.length; k++ ) {
				date = new Date( swap[k].date * 1000 );
				day = date.getDate();
				month = monthsNames[date.getMonth()];
				idDate = day.toString() + date.getMonth().toString();
				
				if( $( '#' + idDate).length === 0 ) {
					if( idDate === currentTimestamp.getDay().toString() + currentTimestamp.getMonth().toString() ) {
						formattedDate = 'Aujourd\'hui';
					} else {
						formattedDate = day.toString() + ' ' + month.toString();
					}
					$container.append( '<section id="' + idDate + '" class="day"><h2>' + formattedDate + '</h2></section>');
				}
				
				$( '#' + idDate).append( '<div><h3>' + swap[k].show + '</h3><img src="' + swap[k].banner + '" alt="" /><span>Saison <em>' + swap[k].season + '</em>, épisode <em>' + swap[k].episode + '</em></span><p>' + swap[k].title + '</p><p>TV&nbsp;: ' + swap[k].tvdb + '</p></div>' );
			}
			if( swap.length === 0 ) {
				$container.append( '<section><h2>Aucune diffusion</h2><p>Vous pouvez ajuster les épisodes affichés en modifiant vos options sur la page de compte.</p></section>');
			}
		} );
		
	};// - createPlanning
	
	// -- Nothing to display -> explain how it works for beginners
	var displayNone = function() {
	
		$container.append( '<section><h2>Aucune série ajoutée.</h2><p>Ajoutez-en via une recherche, puis définissez votre épisode actuel en cliquant sur la série ajoutée, puis en cliquant sur l\'épisode de votre choix.</p></section>' );
	
	};// - displayNone
	
	// -- Display saved shows
	var displayShows = function() {
		
		var $list;
		$container.append( '<ul id="shows"></ul>' );
		$list = $container.find( 'ul' );
		
		// anti-chronological display of the added shows
		for( var i = localNumber; i > 0 ; i-- ){
			var oShow = localList[i-1];
			$list.append( '<li id="show' + i.toString() + '"><a href="' + oShow.url + '"><h2>' + oShow.title + '</h2><img src="' + oShow.banner + '" alt="" /><span>Saison <em class="season">' + oShow.season + '</em>, épisode <em class="episode">' + oShow.episode + '</em></span></a><button>Effacer</button></li>' );
		}
		
		// event listeners to see more or to remove
		$( '#shows li' ).each( function() {
			$( this ).children( 'a' ).on( 'click', displayEpisodes );
			$( this ).children( 'button' ).on( 'click', removeShow );
		} );
		
	};// - displayShows
	
	// -- Display seasons and episodes for a specific show
	var displayEpisodes = function( e ) {
	
		e.preventDefault();
		var $listItem = $( this ).parent(),
			$id = $( this ).parent().attr( 'id' ),
			$showUrl = $( this ).attr( 'href' ),
			$currentSeason =  $( '#' + $id + ' .season' ),
			$currentEpisode =  $( '#' + $id + ' .episode' );
			
		// test if already loaded and display. If not loaded yet, load first
		if( $( '#' + $id + ' .seasonItem' ).length > 0 ) {
			$( '#' + $id + '>ol' ).toggle();
		} else {
			$listItem.append( '<img id="loader" src="' + loaderGifUrl + '" alt="loader" />' );
			ajaxQuery( '/shows/episodes/' + $showUrl + '.json', function( results ) {
				$listItem.append( '<ol></ol>' );
				$( '#loader' ).remove();
				for( var i = 0; i < results.root.seasons.length; i++ ) {
					var seasonIndicator = '',
						currentId = $id + '-' + i.toString();
					if( ( i + 1 ).toString() === $currentSeason.text() ) {
						seasonIndicator = ' class="currentSeason"';
					}
					$( '#' + $id + '>ol' ).append( '<li id="' + currentId +'" class="seasonItem"><h3' + seasonIndicator + '>Saison ' + results.root.seasons[i].number + '</h3><ol class="episodesList"></ol></li>' );
					for( var j = 0; j < results.root.seasons[i].episodes.length; j++ ) {
						var episodeIndicator = '';
						if( ( i + 1 ).toString() === $currentSeason.text() && ( j + 1 ).toString() === $currentEpisode.text() ) {
							episodeIndicator = ' class="currentEpisode"';
						}
						$( '#' + currentId + ' .episodesList' ).append( '<li id="' + currentId + '-' + j.toString() + '"' + episodeIndicator + '><em>' + ( j + 1 ).toString() + ' -</em> ' + results.root.seasons[i].episodes[j].title + '</li>' );
						document.getElementById( currentId + '-' + j.toString() ).addEventListener( 'click', chooseEpisode, false );
					}
					//display or hide episodes on click
					$( '#' + currentId + ' h3' ).on( 'click', toggleEpisodes );
				}
				$( '.episodesList' ).hide();
			} );
		}
		
	};// - displayEpisodes
	
	var toggleEpisodes = function() {
		$( this ).parent().find( 'ol' ).toggle();
	};// - toggleEpisodes
	
	// -- Get a random show similar to a saved one
	var getSimilar = function( similarReference ) {
	
		var oShow = localList[similarReference],
			firstSimilar,
			alreadySaved = false;
			
		// find a similar show, test if no error and see if not already added
		ajaxQuery( '/shows/similar/' + oShow.url + '.json', function( results ) {
			firstSimilar = results.root.shows[0];
			if( firstSimilar !== undefined ) {
				for( var i = 0; i < localList.length; i++ ) {
					if( firstSimilar.url === localList[i].url ) {
						alreadySaved = true;
					}
					if ( ( i + 1 ) === localList.length && alreadySaved === false ) {
						ajaxQuery( '/shows/display/' + firstSimilar.url + '.json', displayResult );
					}
				}
			}
		} );
		
	};// - getSimilar
	
	// -- Display a search result or a suggestion
	var displayResult = function( showData ) {
	
		var opener,
			closer,
			container;
			
		// adapt for the current page
		if( $page === 'dashboard' ) {
			opener = '<section id="advice"><p class="adviceTitle">Suggestion</p><p>';
			closer = '</p><img src="' + showData.root.show.banner + '" alt="" /></section>';
			container = $container;
		} else {
			opener = '<li>';
			closer = '</li>';
			container = $( '#shows' );
		}
		container.append( opener + '<a class="hidden" href="' + showData.root.show.url + '">' + showData.root.show.banner + '</a><h2>' + showData.root.show.title + '</h2><button class="addShow">Ajouter</button><p>' + showData.root.show.description + '</p><strong class="hidden">' + showData.root.show.seasons[1].length + '</strong><div class="tv">' + showData.root.show.network + '</div>' + closer );
		
		if( $page === 'dashboard' ) {
			$( '#advice button' ).on( 'click', addShow );
		}
		
	};// - displayResult
	
	
	// SHOWS MANAGEMENT METHODS
	
	// -- Add a show to the list
	var addShow = function( e ) {
	
		e.preventDefault();
		
		// get the information
		var $listItem = $( this ).parent(),
			exists = false;
		var $showUrl = $listItem.find( 'a' ).attr( 'href' ),
			$showTitle = $listItem.find( 'h2' ).text(),
			$showBanner = $listItem.find( 'a' ).text(),
			$showMaxEpisodes = $listItem.find( 'strong' ).text(),
			$showTV = $listItem.find( '.tv' ).text();
		
		// check if not already added		
		for( var i = 0; i < localList.length; i++ ) {
			if(localList[i].url === $showUrl) {
				exists = true;
				$container.empty();
				$container.append( '<section><p>Cette série a déjà été ajoutée.</p></section>' );
				return false;
			}
		}		
		
		// add to localstorage and redirect
		if(	exists === false ) {
			var oShow = {
				url : $showUrl,
				title : $showTitle,
				banner : $showBanner,
				season : 1,
				episode : 1,
				nbmax : $showMaxEpisodes,
				tvdb : $showTV
			};
			localList.push( oShow );
			window.localStorage.setItem( 'shows', JSON.stringify( localList ) );
			window.location.href = './series.html';
		}
		
	};// - addShow
	
	// -- Remove a show from the list
	var removeShow = function( e ) {
	
		e.preventDefault();
		var $id = $( this ).parent().attr( 'id' ),
			number = parseInt( $id.substr( 4 ), 10 ) - 1,
			$showItem = $( '#' + $id );
		var $title = $showItem.find( 'h2' ).text();
		
		// confirmation message
		$( 'body' ).append( '<div id="dialog"><div><h2>Confirmer suppression&nbsp:</h2><h3>' + $title + '</h3><button id="dialogConfirm">Supprimer</button><button id="dialogCancel">Annuler</button></div></div>' );
		$( '#dialog' ).hide().fadeIn( 150 );
		
		$( '#dialogConfirm' ).on( 'click', function() {
			
			// remove from the interface, remove from localstorage, reload the page
			--localNumber;
			localList.splice( number, 1 );
			window.localStorage.setItem( 'shows', JSON.stringify( localList ) );
			$( '#dialog' ).fadeOut( '150', function() {	$( this ).remove(); } );
			$showItem.animate( { height : 0, minHeight : 0, maxHeight: 0 }, 200, function() {
				$( this ).remove();
				if( localNumber === 0 ) {
					displayNone();
				}
				window.location.reload( false );
			} );
		} );
		$( '#dialogCancel' ).on( 'click', function() {
			$( '#dialog' ).fadeOut( '150', function() { $( this ).remove(); } );
		} );
		
	};// - removeShow
		
	// -- Sets the current episode for a specific show
	var chooseEpisode = function( e ) {
	
		e.preventDefault();
		
		// get information about the show and selected episode
		var id = e.target.getAttribute( 'id' );
		var idSplit = id.split( '-' );
		var show = idSplit[0],
			season = idSplit[1],
			episode = idSplit[2],
			nbmax = $( this ).parent().find( 'li' ).length,
			$currentSeason =  $( '#' + show + ' .season' ),
			$currentEpisode =  $( '#' + show + ' .episode' ),
			localData;
			
		// update current episode in localstorage, and show it visually
		$( '#' + show + ' .currentSeason' ).removeAttr( 'class' );
		$( '#' + show + ' .currentEpisode' ).removeAttr( 'class' );
		$( this ).parent().parent().find( 'h3' ).attr( 'class', 'currentSeason' );
		$( this ).attr( 'class', 'currentEpisode' );
		$currentSeason.text( ( parseInt( season, 10 ) + 1 ).toString() );
		$currentEpisode.text( ( parseInt( episode, 10 ) + 1 ).toString() );
		localData = localList[parseInt( show.substr( 4 ), 10 ) - 1];
		localData.season = parseInt( season, 10 ) + 1;
		localData.episode = parseInt( episode, 10 ) + 1;
		localData.nbmax = nbmax;
		window.localStorage.setItem( 'shows', JSON.stringify( localList ) );
		
	};// - chooseEpisode
	
	
	// SEARCH METHODS
	
	// -- Display or hide searchZone
	var searchZone = function( e ) {
	
		e.preventDefault();
		$searchZone.toggle();
		
	};// - searchZone
	
	// -- Search the text entered
	var search = function( e ) {
	
		e.preventDefault();
		var query = $searchField.attr( 'value' ),
			$list;
			
		// check the query entered and notify about the search
		if( query !== '' && query.length > 2 ) {
			$container.empty();
			$page = 'search';
			$( '#current' )[0].removeAttribute( 'id' );
			$searchIcon.attr( 'id', 'current' );
			$container.append( '<section><p><img id="loader" src="' + loaderGifUrl + '" alt="loader" /> Recherche en cours...</p></section>' );
			
			// search and return shows with an add button
			ajaxQuery( '/shows/search.json?title=' + query, function( results ) {
				if( results.root.shows.length > 0 ) {
					$container.empty();
					$container.append( '<ul id="shows"></ul>' );
					$list = $( '#shows' );
					for( var i = 0; i < results.root.shows.length && i < 16; i++ ){
					
						//get additional information (description, channel, ...) about each result
						ajaxQuery( '/shows/display/' + results.root.shows[i].url + '.json', displayResult );
					}
					
					// listen to click on item to show more
					$container.on( 'click', 'h2', function() {
						var bannerUrl = $( this ).parent().find( 'a' ).text();
						$( this ).parent().find( 'p' ).toggle();
						if( bannerUrl !== 'undefined' ) {
							if( $( this ).parent().find( 'img' ).length === 0 ) {
								$( this ).parent().append( '<img class="banner" src="' + bannerUrl + '" alt="" />' );
							} else {
								$( this ).parent().find( '.banner' ).toggle();
							}
						}
					} );
					
					// listen to click on add button
					$container.on( 'click', '.addShow', addShow );
				} else {
					$container.empty();
					$container.append( '<section><p>Aucune série trouvée.</p></section>' );
				}
			} );
		} else {
			$searchZone.append( '<span>Veuillez entrer au moins 3 caractères</span>' );
		}
		
	};// - search
	

	// ONLOAD ROUTINES
	$( function() {
		
		// -- Initialize content and page
		initialize();
		
		// -- Event Listeners
		$searchIcon.on( 'click', searchZone );
		$searchButton.on( 'click', search );
		
	} );

}( jQuery ) );