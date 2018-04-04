$(function() {
	var GREPERSERVER_URL = 'localhost:8090';
	var name;
	var recordName;
	var moveArea;
	var shootArea;
	var connectionIndicator;
	var ds;
	var isFullScreen = false;

	// Join the game, either initially or after
	// the player's ship was destroyed and they hit
	// play again
	function joinGame() {
		name = $( 'input#name' ).val();
		recordName = 'player/' + name;

		var record = {
			firing: false,
			rot: 0
		};

		record.vel = {
			x:0,
			y:0
		};

		console.log("Record: " + JSON.stringify(record));
		cs.send(JSON.stringify(record));

		moveArea.setRecord(record);
		shootArea.setRecord(record);

		$('.overlay').removeClass('game-over').fadeOut(500);
	}

	// Called once the client loads
	function startApp() {

		// Create both directional pads
		moveArea = new Pad('move');
		shootArea = new Pad('shoot');

		moveArea.setWS(global.ws);
		shootArea.setWS(global.ws);

		// Store the connection status indicator element
		connectionIndicator = $('.connection-indicator');

		// Bind resize
		function setSize() {
			moveArea.setSize();
			shootArea.setSize();
			connectionIndicator.height( connectionIndicator.width() + 5 );
		}

		// Set the initial size and bind to resize events
		$(window).resize(setSize);
		setSize();

		// Once the user has entered their name, join the game
		$('#enter-name').submit( function( event ) {
			event.preventDefault();
			joinGame();
		});
	}

	// Bind the fullscreen toggle button. The fullscreen API is still
	// relatively new and non-standardized, so it takes a bit more work to use it
	$('.fullscreen-toggle').on('click touch', function(){
		var el,fn;

		if(isFullScreen) {
			el = document;
			fn = el.exitFullscreen || el.mozCancelFullScreen || el.webkitExitFullscreen;
		} else {
			el = document.documentElement;
			fn = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
		}
		isFullScreen = !isFullScreen;
		fn.call(el);
	});

	var cs = new WebSocket('ws://' + GREPERSERVER_URL + '/client');
	cs.OPEN;

	cs.onopen = function () {
		console.log('Connected!!');
		$('.connection-indicator').removeClass('red yellow green').addClass('green');
		startApp();
	}

	cs.onerror = function (error) {
		console.log('Error:' + error);
		$('.connection-indicator').removeClass('red yellow green').addClass('yellow');
	}

	cs.onclose = function () {
		console.log('Connection Close!');
		$('.connection-indicator').removeClass('red yellow green').addClass('red');
	}

	cs.onmessage = function (event) {
		//console.log('message:' + event.data);
		var message = JSON.parse(event.data);
		switch(message.eventType){
			case "DESTROYED":
			console.log('CREATED recibido');
				// Show the gameover screen
				$('.overlay').addClass('game-over').fadeIn(300);
				// Bind play again button
				$('#game-over button').one('touch click', joinGame);
				// Unsubscribe from the satus event (the same happens if the
				// client goes offline
				//ds.event.unsubscribe('status/' + name );
				break;
			case "UPDATED":

				break;
			default:
		}
	}

});
