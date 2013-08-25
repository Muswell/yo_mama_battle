// game initializing script
// set up YM as the global var if it doesn't already exist
var YM = YM || {};

(function () {
	var p = PUBNUB,
		app = 'yo_mama',

		// Grab user data from local storage if it exists
		userString = '{"uuid": "' + p.uuid() + '", "activated": false}',
		//user = JSON.parse(p.db.get(app + '-user') || userString),
		user = JSON.parse(userString),
		
		// ...and initalize with the uuid set so we can keep a persistant user
		p = PUBNUB.init({
			publish_key: 'demo',
			subscribe_key: 'demo', 
			uuid: user.uuid
		}),
		
		game = new YM.Game(),
		playersView = new YM.views.players(game.get("players"));
		
		
		// DOM vars
		login = p.$('username'),
		battleContainer = p.$('active-battle'),
		playersContainer = p.$('players'),
		historyContainer = p.$('history');

	YM.p = p;
	YM.user = user;

	playersContainer.appendChild(playersView.render().el);

	// Save the user info locally
	//p.db.set(app + '-user', JSON.stringify(user));
	//p.db.set(app + '-user', undefined);
	
	// I didn't feel a single input login deserved a full blown view
	if (user.activated) {
		YM.channels.subscribe();
		bindChannelEvents();
		hideLogin();
	} else {
		// Bind username input
		p.bind( 'keyup', login, function (e) {
			var name = login.value;
			if ((e.keyCode || e.charCode) === 13 && name !== '') {
				YM.channels.subscribe();
				

				YM.channels.users.create({
					name: name,
					success: function () {
						user.name = name;
						user.activated = true;
						//p.db.set(app + '-user', JSON.stringify(user));
						bindChannelEvents();
						hideLogin();
						YM.channels.users.publish(user);
					},

					error: function () {
						alert(name + " is already taken.");
						login.value = "";
					}
				});

			}
		});
	}

	// this could easily be a css animation
	function hideLogin() {
		login.style.display = "none";
	}
	
	function bindChannelEvents() {
		p.events.bind('player-join', YM.channels.users.playerParse);
	    p.events.bind('player-parsed', function (player) { 
			game.get("players").add(player); 
		});
		
		p.events.bind('player-leave', function (player) { 
			var players = game.get("players"),
				model = players.where({uuid: player});
			game.get("players").remove(model); 
		});
	}
}());