define( [
	'jquery',
	'underscore'
], function ( $, _ ) {
	'use strict';

	// Taken from http://www.briangrinstead.com/blog/console-log-helper-function
	// Full version of `log` that:
	//  * Prevents errors on console methods when no console present.
	//  * Exposes a global 'log' function that preserves line numbering and formatting.
	(function () {
		var method;
		var noop = function () { };
		var methods = [
			'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
			'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
			'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
			'timeStamp', 'trace', 'warn'
		];
		var length = methods.length;
		var console = (window.console = window.console || {});

		while ( length-- ) {
			method = methods[length];

			// Only stub undefined methods.
			if ( !console[method] ) {
				console[method] = noop;
			}
		}

		if ( Function.prototype.bind ) {
			window.log = Function.prototype.bind.call( console.log, console );
		}
		else {
			window.log = function () {
				Function.prototype.apply.call( console.log, console, arguments );
			};
		}
	})();

	return {

		/**
		 * Add a style to the document's header.
		 * @param cssContent (String)
		 */
		addStyleToHeader: function ( cssContent ) {
			$( "<style>" ).html( cssContent ).appendTo( "head" );
		},

		/**
		 * Add as style link to the document's header
		 * @param linkUrl Url to the CSS file
		 * @param id If an id is passed, the function will check if this style link has already been added or not.
		 * If yes, it will not be added again.
		 */
		addStyleLinkToHeader: function ( linkUrl, id ) {
			if ( id && !_.isEmpty( id ) ) {
				if ( !$( '#id' ).length ) {
					var $styleLink = $( document.createElement( 'link' ) );
					$styleLink.attr( 'rel', 'stylesheet' );
					$styleLink.attr( 'type', 'text/css' );
					$styleLink.attr( 'href', linkUrl );
					if ( id && !_.isEmpty( id ) ) {
						$styleLink.attr( 'id', id );
					}
					$( 'head' ).append( $styleLink );
				}
			}
		}

	};

} );
