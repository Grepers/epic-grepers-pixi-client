const PIXI = require( 'pixi.js' );
//const SpaceShip = require( './spaceship' );
//const BulletManager = require( './bullet-manager' );
const MessageManager = require( './message-manager' );
const EventEmitter = require( 'events' ).EventEmitter;

/**
 * This class represents the game as a whole. It is responsible for
 * the creation of the stage, setting up the game loop
 * and adding and removing players
 */
module.exports = class Game extends EventEmitter{

	/**
	 * Creates the game
	 *
	 * @param   {DOMelement} element the container the game will live in
	 *
	 * @constructor
	 */
	constructor(element) {

		// Initialise the EventEmitter
		super();
		this._element = element;

		// Keep a reference to the spaceships we'll create
		this.grepers = [];

		// Pixi creates a nested Hierarchie of DisplayObjects and Containers. The stage is just the outermost container
		this.stage = new PIXI.Container();

		// We want a renderer with a transparent background - ideally a WebGL one
		this.renderer = PIXI.autoDetectRenderer( window.innerWidth, window.innerHeight, {transparent: true}, false );

		// append the canvas created by the renderer to our DOM element
		this._element.appendChild( this.renderer.view );

		// Frames are distributed unevenly - let's keep track of how much time has passed since the last one
		this._lastFrameTime = 0;

		// A class that places and recycles bullets - primed with 200 shot
		this.messageManager = new MessageManager(200, this);

		// Add a listener to notify of players coming online
		//global.ds.event.listen( 'status/.*', this._playerOnlineStatusChanged.bind( this ) );

		// On the next frame, the show begins
		requestAnimationFrame( this._tick.bind( this ) );

		console.log("Client Started!!!");
	}

	/**
	 * Called on every frame. Notifies subscribers, updates
	 * the time and renders the frame
	 *
	 * @param   {Number} currentTime Milliseconds since page was loaded
	 *
	 * @private
	 * @returns {void}
	 */
	_tick( currentTime ) {

		// notify objects of the impeding update. This gives ships time to reposition
		// themselves, bullets to move etc.
		this.emit( 'update', currentTime - this._lastFrameTime, currentTime );

		// store the time
		this._lastFrameTime = currentTime;

		// render the next frame
		this.renderer.render( this.stage );

		// and schedule the next tick
		requestAnimationFrame( this._tick.bind( this ) );
	}
}
