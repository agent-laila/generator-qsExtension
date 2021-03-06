/*global module,define, require, console, process*/
/*jshint
 camelcase: false
 */
(function () {
	'use strict';
	var util = require( 'util' );
	var path = require( 'path' );
	var fs = require( 'fs' );
	var yeoman = require( 'yeoman-generator' );
	var chalk = require( 'chalk' );
	var _ = require( 'underscore' );
	var moment = require( 'moment' );
	var utils = require( './utils' );
	var promptDef = require( './prompts' );
	var qlikloc = require( 'qlikloc' );

	function noop () {}

	var qsExtension = yeoman.generators.Base.extend( {

		// yo qsextension --grunt
		constructor: function () {
			yeoman.generators.Base.apply( this, arguments );
			this.pkg = require( "../package.json" );

			if ( this.options['grunt'] ) {
				this.mode = 'grunt';
			} else {
				this.mode = 'default';
			}

		},

		init: {},

		askFor: function () {

			if ( this.mode === 'default' ) {
				var done = this.async();
				this.log( chalk.magenta( 'You\'re using qsextension generator.' ) );

				this.prompt( promptDef, function ( props ) {

					this.prompts = {};

					this.prompts.advancedMode = props.advancedMode;
					this.prompts.extensionName = props.extensionName;
					this.prompts.extensionNameSafe = props.extensionName.replace( /\s/g, "" );
					this.prompts.extensionType = props.extensionType;
					this.prompts.extensionNamespace = _.isEmpty( props.extensionNamespace ) ? '' : props.extensionNamespace + '-';
					this.prompts.extensionDescription = props.extensionDescription;
					this.prompts.authorName = props.authorName;
					this.prompts.lessSupport = props.lessSupport;
					this.prompts.license = props.license || 'mit';

					var d = new Date();
					this.prompts.publishingYear = d.getFullYear();
					this.prompts.creationDate = moment( d ).format( 'YYYY-MM-DD' );

					this.prompts.licenceGenerated = utils.getLicense( this.prompts );

					// Debug
					// this.log( 'prompts', this.prompts );

					done();

				}.bind( this ) );
			} else {

				// do nothing right now ...
				noop();

			}
		},

		/**
		 * Retrieve the local extension folder
		 *
		 * @example
		 * e.g. %USERPROFILE%\My Documents\Qlik\Sense\Extensions\
		 */
		getLocalExtensionDir: function () {

			this.log( 'getLocalExtensionDir' );

			var done = this.async();
			var that = this;

			qlikloc.getExtensionPath()
				.then( function ( result ) {
					that.prompts.localExtensionDir = result;
				} )
				.catch( function ( err ) {
					that.prompts.localExtensionDir = 'PUT PATH TO EXTENSION ROOT FOLDER HERE';
					console.error( 'Could  not retrieve the local extension path', err );
				} )
				.done( function () {
					done();
				} );
		},

		writing: function () {

			switch ( this.mode ) {
				case 'default':
					this._root();
					this._dirs();
					this._src();
					this._srcLib();
					this._styles();
					this._grunt();
					this._saveConfig();
					break;
				case 'grunt':
					// not implemented, yet
					var existingConfig = this.config.getAll();
					if ( !_.isEmpty( existingConfig ) ) {
						this.prompts = existingConfig;
						this._grunt();
					} else {
						this.log.error( chalk.red( 'Grunt update not possible, cannot load existing configuration!' ) + ' .yo-rc.json is missing.' );
					}
					break;
				default:
					break;
			}

		},

		end: function () {

			if ( !this.options['skip-install'] ) {

				// for future changes check if grunt based deployment is existing
				if ( fs.existsSync( path.join( process.cwd() + '/grunt' ) ) ) {

					var npmdir = process.cwd() + '/grunt';
					process.chdir( npmdir );

					this.installDependencies( {
						bower: false,
						npm: true,
						skipMessage: true
					} );

				}
			}

		},

		_root: function () {

			// root
			this.copy( 'gitattributes.txt', '.gitattributes' );
			this.copy( 'gitignore.txt', '.gitignore' );
			this.template( 'readme.md', 'README.md' );
			this.template( 'license.md', 'LICENSE.md' );
			this.template( 'changelog.yml', 'CHANGELOG.yml' );

		},

		_dirs: function () {

			// Build Dir
			this.mkdir( 'build' );
			this.mkdir( 'dist' );

		},

		_src: function () {

			// src dir
			this.mkdir( 'src' );
			this.copy( '.jshintrc', 'src/.jshintrc' );
			this.template( 'extension.js', 'src/' + this.prompts.extensionNamespace.toLowerCase() + this.prompts.extensionNameSafe.toLowerCase() + '.js' );
			this.template( 'extension.qext', 'src/' + this.prompts.extensionNamespace.toLowerCase() + this.prompts.extensionNameSafe.toLowerCase() + '.qext' );
			this.copy( 'extension.png', 'src/' + this.prompts.extensionNameSafe.toLowerCase() + '.png' );
			this.template( 'extension-properties.js', 'src/properties.js' );
			this.template( 'extension-initialproperties.js', 'src/initialproperties.js' );

		},

		_srcLib: function () {

			// src/lib
			this.mkdir( 'src/lib' );
			this.mkdir( 'src/lib/css' );
			this.mkdir( 'src/lib/js' );
			this.mkdir( 'src/lib/external' );
			this.mkdir( 'src/lib/images' );
			this.mkdir( 'src/lib/fonts' );
			this.mkdir( 'src/lib/icons' );
			this.mkdir( 'src/lib/data' );
			this.mkdir( 'src/lib/partials' );

			// src/lib/content
			this.copy( 'lib/js/extensionUtils.js', 'src/lib/js/extensionUtils.js' );

		},

		_grunt: function () {

			// Grunt
			this.mkdir( 'grunt' );
			this.copy( 'grunt/.jshintrc-dev', 'grunt/.jshintrc-dev' );
			this.copy( 'grunt/.jshintrc-release', 'grunt/.jshintrc-release' );
			this.template( 'grunt/grunt-config.yml', 'grunt/grunt-config.yml' );
			this.copy( 'grunt/_package.json', 'grunt/package.json' );
			this.copy( 'grunt/Gruntfile.projectconfig.js', 'grunt/Gruntfile.projectconfig.js' );
			this.copy( 'grunt/Gruntfile.clean.js', 'grunt/Gruntfile.clean.js' );
			this.copy( 'grunt/Gruntfile.cleanempty.js', 'grunt/Gruntfile.cleanempty.js' );
			this.copy( 'grunt/Gruntfile.compress.js', 'grunt/Gruntfile.compress.js' );
			this.copy( 'grunt/Gruntfile.copy.js', 'grunt/Gruntfile.copy.js' );

			// Gruntfile.Less will be added in the createStyles task
			this.template( 'grunt/Gruntfile.js', 'grunt/Gruntfile.js' );
			this.copy( 'grunt/Gruntfile.jshint.js', 'grunt/Gruntfile.jshint.js' );
			this.copy( 'grunt/Gruntfile.replace.js', 'grunt/Gruntfile.replace.js' );
			this.copy( 'grunt/Gruntfile.uglify.js', 'grunt/Gruntfile.uglify.js' );
			this.copy( 'grunt/gruntReplacements.yml', 'grunt/gruntReplacements.yml' );
			this.copy( 'grunt/gruntReplacements_dev.yml', 'grunt/gruntReplacements_dev.yml' );
			this.copy( 'grunt/gruntReplacements_release.yml', 'grunt/gruntReplacements_release.yml' );

		},

		_styles: function () {

			if ( this.prompts.lessSupport === true ) {
				this.mkdir( 'src/lib/less' );
				this.template( '_root.less', 'src/lib/less/_root.less' );
				this.template( 'styles.less', 'src/lib/less/styles.less' );
				this.template( 'variables.less', 'src/lib/less/variables.less' );
				this.template( 'style_Less.css', 'src/lib/css/style.css' );
				this.copy( 'grunt/Gruntfile.less.js', 'grunt/Gruntfile.less.js' );

			} else {
				this.template( 'style_noLess.css', 'src/lib/css/style.css' );
			}
		},

		_saveConfig: function () {
			this.config.set( this.prompts );
			this.config.save();
		}
	} );

	module.exports = qsExtension;
}());
