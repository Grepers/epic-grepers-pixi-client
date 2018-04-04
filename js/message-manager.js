const PIXI = require( 'pixi.js' );
const Greper = require( './greper' );

module.exports = class MessageManager {
  constructor(initialBullets, game) {
    this._game = game;
		game.on('update', this._update.bind(this));
    this._activeBullets = [];
    this._passiveBullets = [];
    global._myUpdateEvents = [];
    global._myID = "";
    global._myGreper;
    this._actors = [];
    this._texture = PIXI.Texture.fromImage( '/img/bullet.png' );
		for(var i = 0; i < initialBullets; i++) {
			this._createBullet();
		}
	}

  _createBullet() {
		var bullet = new PIXI.Sprite( this._texture );
    bullet.id = '';
		bullet.position.x = -50;
		bullet.position.y = -50;
    //bullet.vel.x = 0;
    //bullet.vel.y = 0;
		bullet.anchor.x = 0.5;
		bullet.anchor.y = 0.5;
		bullet.rotation = 0;
		this._passiveBullets.push(bullet);
		this._game.stage.addChild(bullet);
  }

  addBullet(id, position, velocity, rotation, greper) {
		/*if( this._passiveBullets.length === 0 ) {
			this._createBullet();
		}

		var bullet = this._passiveBullets.pop();
    bullet.id = id;
		bullet.tint = greper.tint;
		bullet.position.x = position.x;
		bullet.position.y = position.y;
    bullet.vel.x = velocity.x;
    bullet.vel.y = velocity.y;
		bullet.rotation = alpha;
		bullet.source = greper;
		this._activeBullets.push(bullet);*/
	}

  _update() {
		var i, s, bullet;

    if(global.pendingMessages.length > 0){
      var message = global.pendingMessages.pop();
      //console.log('Mensaje recibido: ' + JSON.stringify(message));
      switch(message.eventType){
        case "CREATED":
        console.log('CREATED recibido');
          //setup

          break;
        case "UPDATED":
          //update messages
          for(var index in message.actors){
            switch(message.actors[index].type) {
              case "Greper":
                if(message.actors[index].id === global._myID ) {
                  global._myUpdateEvents.push(message.actors[index]);
                } else {
                  //if greper doesn't exists create it otherwise update it
                }
                break;
              case "Wall":
                //create wall from texture
                break;
              case "Bullet":
                  //console.log('Bullet: ' + JSON.stringify(message.actors[index]));
                  var bul = message.actors[index];
                  this.addBullet(bul.id, bul.pos, bul.vel, bul.rot, global._myGreper);
                  break;
              default:

            }
          }
          break;
        case "STATUS":
          //create greper
          console.log('CREATE Greper recibido!');
          for(var index in message.actors){
            if(message.actors[index].type === "Greper"){
              global._myID = message.actors[index].id;
              this.addGreper(message.actors[index]);
            }
          }
          break;
        case "DESTROYED":
          console.log('DESTROYED recibido: ' + JSON.stringify(message));
          break;
        default:
          console.log("Unknown status type: " + message["type"])
      }
    }

    //Update Bullets
    /*for( i = 0; i < this._activeBullets.length; i++ ) {
			bullet = this._activeBullets[ i ];
			bullet.position.x += Math.sin( bullet.rotation ) * SPEED;
			bullet.position.y -= Math.cos( bullet.rotation ) * SPEED;

			if(
				bullet.position.x < 0 ||
				bullet.position.x > this._game.renderer.width ||
				bullet.position.y < 0 ||
				bullet.position.y > this._game.renderer.height
			) {
				// Bullet has left the stage, time to recycle it
				this._recycleBullet( bullet, i );
			} else {
				// Bullet is still on stage, let's perform hit detection
				for( s = 0; s < this._game.grepers.length; s++ ) {
					if( this._game.grepers[ s ] === bullet.source ) {
						continue;
					}
					if(this._game.spaceShips[s].checkHit(bullet.position)) {
						this._recycleBullet(bullet, i);
						continue;
					}
				}
			}
		}*/
	}

  addGreper(greper) {
    global._myGreper = new Greper(this._game, greper);
		this._game.grepers.push(global._myGreper);
	}

}
