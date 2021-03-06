'use strict';

/**
 * @module @10up/Tabs
 *
 * @description
 *
 * An accessible tabs UI component.
 *
 * [Demo]{@link https://10up.github.io/wp-component-library/component/tabs/index.html}
 *
 * @param {string} element Element selector for the tabs container.
 * @param {Object} options Object of optional callbacks.
 */
export default class TenUpTabs {

	/**
	 * Constructor function
	 * @param Object element
	 * @param Object options
	 */
	constructor( element, options = {} ) {

		// KeyCodes
		this.keys = {
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		};

		// Direction when using arrows
		this.direction = {
			37: -1,
			38: -1,
			39: 1,
			40: 1
		};

		// Defaults
		const defaults = {
			// Default orientation is horizontal
			orientation: 'horizontal',
			// Event callbacks
			onCreate: null,
			onTabChange: null,
		};

		if ( ! element || 'string' !== typeof element ) {
			console.error( '10up Tabs: No target supplied. A valid target (tab area) must be used.' ); // eslint-disable-line
			return;
		}

		// Tab Containers
		this.$tabs = document.querySelectorAll( element );

		// Bail out if there are no tabs.
		if ( ! this.$tabs  ) {
			console.error( '10up Tabs: Target not found. A valid target (tab area) must be used.'  ); // eslint-disable-line
			return;
		}

		// Settings
		this.settings = Object.assign( {}, defaults, options );

		for ( const tabArea of this.$tabs ) {
			this.setupTabs( tabArea );
		}

		/**
		 * Called after the tabs are initialized on page load.
		 * @callback onCreate
		 */
		if ( this.settings.onCreate && 'function' === typeof this.settings.onCreate ) {
			this.settings.onCreate.call();
		}
	}

	/**
	 * Initialize a given tab area
	 * Configure tab properties and set ARIA attributes.
	 *
	 * @param   {element} $tabArea The tabArea to scope changes
	 * @returns {void}
	 */
	setupTabs( tabArea ) {

		const tabLinks = tabArea.querySelectorAll( '.tab-list [role="tab"]' );
		const tabList = tabArea.querySelector( '.tab-list' );

		tabList.setAttribute( 'aria-orientation', this.settings.orientation );

		for ( const tabLink of tabLinks ) {
			const tabId = tabLink.getAttribute( 'aria-controls' );
			const tabLinkId = `tab-${ tabId }`;
			const tabContent = document.getElementById( tabId );

			tabLink.setAttribute( 'id', tabLinkId );
			tabLink.setAttribute( 'aria-selected', false );
			tabLink.setAttribute( 'tabindex', -1 );
			tabLink.parentNode.setAttribute( 'role', 'presentation' );

			tabContent.setAttribute( 'aria-labelledby', tabLinkId );
			tabContent.setAttribute( 'aria-hidden', true );

			// Sets the first tab as active.
			this.goToTab( 0, tabArea );

			// Activate the tab on [click]
			tabLink.addEventListener( 'click', ( event ) => {
				event.preventDefault();

				if ( ! event.target.parentNode.classList.contains( 'is-active' ) ) {
					this.goToTab( event, tabArea );
				}
			} );

			// Activate the tab on [space]
			tabLink.addEventListener( 'keyup', ( event ) => {

				if ( 32 === event.which && ! event.target.parentNode.classList.contains( 'is-active' ) ) {
					event.preventDefault();
					this.goToTab( event, tabArea );
				}
			} );

			// Keyboard home, end, up, down key bindings
			tabLink.addEventListener( 'keydown', ( event ) => {
				const key = event.keyCode;
				const newIndex = this.determineNextTab( event, tabArea, tabLinks );

				switch( key ) {
						case this.keys.end:
							event.preventDefault();
							this.goToTab( parseInt( tabLinks.length - 1, 10 ), tabArea, true );
							break;
						case this.keys.home:
							event.preventDefault();
							this.goToTab( 0, tabArea, true );
							break;
						case this.keys.up:
						case this.keys.down:
							if ( 'vertical' === this.settings.orientation ) {
								event.preventDefault();
								this.goToTab( newIndex, tabArea, true );
							}
							break;
				}
			} );

			// Keyboard left, right key bindings
			tabLink.addEventListener( 'keyup', ( event ) => {
				const key = event.keyCode;
				const newIndex = this.determineNextTab( event, tabArea, tabLinks );

				switch( key ) {
						case this.keys.left:
						case this.keys.right:
							if ( 'horizontal' === this.settings.orientation ) {
								this.goToTab( newIndex, tabArea, true );
							}
							break;
				}
			} );
		}
	}

	/**
	 * Finds the next tab when using keyboard arrows, home or end keys
	 *
	 * @param   {Object}  $event      The tab click event object
	 * @param   {element} $tabArea    The tabArea to scope changes.
	 * @param   {element} $tabLinks   The tab items
	 * @returns {Integer}
	 */
	determineNextTab( event, tabArea, tabLinks ) {
		const key = event.keyCode;

		const currentTab = tabArea.querySelector( '.tab-list li.is-active [role="tab"]' );
		const currentIndex = [].indexOf.call( tabLinks, currentTab );
		const desiredIndex = parseInt( currentIndex + this.direction[key], 10 );

		// Loop: if the desiredIndex is >= to the number of tabs, activate first tab, if it's < 0, activate last tab
		const newIndex = desiredIndex >= tabLinks.length ? 0 : 0 > desiredIndex ? parseInt( tabLinks.length - 1, 10 ) : desiredIndex;

		return newIndex;
	}

	/**
	 * Changes the active tab when clicked.
	 * Adds CSS classes and toggle ARIA attributes.

	 * @param   {Object|Integer}  $tab      The tab click event object, or the desired tab index
	 * @param   {element}         $tabArea  The tabArea to scope changes.
	 * @param   {bool}            $setFocus If we need to set focus to the tab or not
	 * @returns {void}
	 */
	goToTab( tab, tabArea, setFocus = false ) {

		const type = typeof tab;
		const isEvent = 'function' === type || 'object' === type && !!tab;

		const tabItems = tabArea.querySelectorAll( '.tab-list li [role="tab"]' );
		const oldTab = tabArea.querySelector( '.tab-list li.is-active [role="tab"]' );

		if ( oldTab ) {
			// Change state of previously selected tab.
			const oldTabId = oldTab.getAttribute( 'aria-controls' );
			const oldTabContent = document.getElementById( oldTabId );

			oldTab.setAttribute( 'aria-selected', 'false' );
			oldTab.setAttribute( 'tabindex', -1 );
			oldTab.parentNode.classList.remove( 'is-active' );

			oldTabContent.setAttribute( 'aria-hidden', 'true' );
			oldTabContent.classList.remove( 'is-active' );
			oldTabContent.removeAttribute( 'tabindex' );
		}


		// Change state of newly selected tab.
		const newTab = isEvent ? tab.target : tabItems[tab];

		if ( newTab ) {
			const newTabId = newTab.getAttribute( 'aria-controls' );
			const newTabContent = document.getElementById( newTabId );

			newTab.setAttribute( 'aria-selected', 'true' );
			newTab.removeAttribute( 'tabindex' );
			newTab.parentNode.classList.add( 'is-active' );

			if ( setFocus ) {
				// Set focus to the tab
				newTab.focus();
			}

			// Show newly selected content.
			newTabContent.setAttribute( 'aria-hidden', 'false' );
			newTabContent.classList.add( 'is-active' );
			// Make tab focusable
			newTabContent.setAttribute( 'tabindex', 0 );

			/**
			 * Called after a tab has been changed.
			 * @callback onTabChange
			*/
			if ( this.settings.onTabChange && 'function' === typeof this.settings.onTabChange ) {
				this.settings.onTabChange.call();
			}
		}
	}
}
