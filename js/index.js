const Game = require( './game' );
const loader = require( './loader' );


// Entry to the app. Loads all assets and creates the game
loader.load('localhost:8090', () => {
	new Game(document.body);
});
