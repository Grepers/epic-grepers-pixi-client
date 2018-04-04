const PIXI = require( 'pixi.js' );

// Maximum speed in pixels per millisecond a ship can reach
//var MAX_SPEED = 5;

// Amount of hits a ship can take before it explodes
var MAX_HEALTH = 100;

// Increase of speed in pixels per millisecond
//const ACCELERATION = 0.01;

// Time that passes between shots
//const FIRE_INTERVAL = 100;

// The length of the turret's barrel. Shooting starts at its end
const BARREL_LENGTH = 27;

// The amount of milliseconds the ship flashes red after its hit
const HIT_HIGHLIGHT_DURATION = 70;

// Different colors for different players
//TODO: Create a random color function
const TINTS = [
	0x00FF00,
	0x66FFAA,
	0x00FFFF,
	0xFF00FF,
	0xFFAAFF,
	0x00FF33,
	0x99FF44,
	0xFFFF00,
	0xFF6600
];

module.exports = class Greper{

	/**
	 * This class represents a single player / spaceship
	 * on the screen. It creates the required display objects,
	 * and contains logic for movement, shooting and hit detection
	 *
	 * @param   {Game} 	 game A reference to the parent game object
	 * @param   {Number} x    Starting position x
	 * @param   {Number} y    Starting position y
	 * @param   {String} name Name of the player this ship belongs to
	 *
	 * @constructor
	 */
	constructor( game, greperData ) {

		// record
		//this._record = global.ds.record.getRecord( 'player/' + name );

		// public properties
		this.name = greperData.name;
		this.tint = this._getTint();

		// private properties
		this._game = game;
    this._id = greperData.id;
		this._isDead = greperData.dead;
		this._timeLastBulletFired = greperData.lastFiredTime;
		this._hitHighlightStart = null;
		this._speed = 0;//calculate with: greperData.vel
		this._health = greperData.health;
    this._MaxHealth = greperData.health;

    this._fireRate = greperData.fireRate;
    this._maxVel = greperData.maxVel;
    this._firing = greperData.firing;

		// text
		this._textStyle = { font : '16px Arial', fill: 'rgb(0,0,0)', align : 'center' };
		this._text = new PIXI.Text( greperData.name + " - " + greperData.health, this._textStyle );
		this._text.anchor.x = 0.5;
		this._text.anchor.y = 0.5;
		this._text.position.x = this._game.renderer.width / 2;
		this._text.position.y = (this._game.renderer.height / 2) + 60;
		this._game.stage.addChild(this._text);

		//Greper siempre en el centro de la pantalla como pivot
		this._container = new PIXI.Container();
		this._positionX = greperData.pos.x;
		this._positionY = greperData.pos.y;
		this._container.position.x = this._game.renderer.width / 2;
		this._container.position.y = this._game.renderer.height / 2;
		//this._container.pivot.x = this._game.renderer.width / 2;
		//this._container.pivot.y = this._game.renderer.height / 2;

		// body
		this._body = PIXI.Sprite.fromImage( '/img/soldier.png' );
		this._body.tint = this.tint;
		this._body.anchor.x = 0.5;
		this._body.anchor.y = 0.5;
    this._body.width = 150;
    this._body.height = 100;
		this._container.addChild( this._body );

		// turret
		/*this._turret = PIXI.Sprite.fromImage( '/img/spaceship-turret.png' );
		this._turret.tint = this.tint;
		this._turret.anchor.x = 0.45;
		this._turret.anchor.y = 0.6;
		this._turret.pivot.x = 1;
		this._turret.pivot.y = 7;
		this._container.addChild( this._turret );*/

		// explosion will be added to stage once spaceship destroyed
		/*this._explosion = new PIXI.extras.MovieClip( global.EXPLOSION_FRAMES.map( PIXI.Texture.fromImage ) );
		this._explosion.anchor.x = 0.5;
		this._explosion.anchor.y = 0.5;
		this._explosion.loop = false;*/

		// add greper to visible stage
		this._game.stage.addChild( this._container );

		console.log("Greper created!");

		// bind to gameloop
		this._game.on( 'update', this._update.bind( this ) );
	}

	/**
	 * Check if the greper was hit by a bullet
	 *
	 * @param   {PIXI.Point} bulletPosition
	 *
	 * @public
	 * @returns {Boolean} wasHit
	 */
	checkHit( bulletPosition ) {
		console.log('check hit in greper');
		return false;
	}

	/**
	 * Returns the color for the player's ship. We want to
	 * give the same player the same colored ship without keeping
	 * state - so we create a hash out of the player's name and get
	 * the color that belongs to its modulo
	 *
	 * @private
	 * @returns {HEX} tint
	 */
	_getTint() {
		var sum = 0, i;

		for( i = 0; i < this.name.length; i++ ) {
			sum += this.name.charCodeAt( i );
		}

		return TINTS[ sum % TINTS.length ];
	}

	/**
	 * Removes all assets that make up the ship and deletes
	 * the associated record
	 *
	 * @private
	 * @returns {void}
	 */
	remove() {
		this._game.stage.removeChild( this._container );
		this._game.stage.removeChild( this._text );
		this._game.stage.removeChild( this._explosion );
		this._record.delete();
	}

	/**
	 * Called once the ship was blown up. Adds the explosion animation
	 *
	 * @private
	 * @returns {void}
	 */
	_onDestroyed() {
		this._isDestroyed = true;
		//this._game.stage.addChild( this._explosion );
		//this._explosion.position.x = this._container.position.x;
		//this._explosion.position.y = this._container.position.y;
		//this._explosion.play();
	}

	/**
	 * This method is called for every ship before every frame
	 * that's rendered
	 *
	 * @param   {Number} msSinceLastFrame milliseconds since last frame was rendered
	 * @param   {Number} currentTime      milliseconds since page was opened
	 *
	 * @private
	 * @returns {void}
	 */
	_update( msSinceLastFrame, currentTime ) {
		if(global._myUpdateEvents.length > 0) {
			var message = global._myUpdateEvents.pop();
			//console.log('Update Greper event: ' + JSON.stringify(message));
			this._firing = message.firing;
			this._positionX = message.pos.x;
			this._positionY = message.pos.y;
			this._health = message.health;
			this._text.text = message.name + " - " + message.health;
			this._maxVel = message.maxVel;
			this._timeLastBulletFired = message.lastFiredTime;
			this.rotation = message.rot;

			if(this._firing) {

			}

			if(message.dead) {
				remove();
			}
		}
	}
}
