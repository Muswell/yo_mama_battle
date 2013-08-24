// game initializing script
// set up YM as the global var if it doesn't already exist
var YM = YM || {};

(function () {
	var p = PUBNUB,
		channel = 'yo_mama',

		// Grab user data from local storage if it exists
		userString = '{"uuid": "' + p.uuid() + '", "activated": false}',
		user = JSON.parse(p.db.get(channel + '-user') || userString),
		users = [],
		
		// ...and initalize with the uuid set so we can keep a persistant user
		p = PUBNUB.init({
			publish_key: 'demo',
			subscribe_key: 'demo', 
			uuid: user.uuid
		}),
		
		// Hey PubNub team, the following I'm coding with a slight feeling of ignorance.
		// I have a feeling this isn't the optimum way to accomplish what I want.
		// If you can shed some light on it, I'd appreciate it.
		// I've opted to use multiple channels to chunk out the data I need to publish and to avoid
		// using a large history where it's unnecessary.
		// Is there a way to store shared variables through the api?
		mainChannel = 'yo-mama',
		userChannel = 'yo-mama-users',
		
		// DOM vars
		login = p.$('username');

	// Save the user info locally
	p.db.set(channel + '-user', JSON.stringify(user));
	
	// I didn't feel a single input login deserved a full blown view
	if (user.activated) {
		hideLogin();
		YM.channels.main.subscribe();
	} else {
		// Bind username input
		p.bind( 'keyup', login, function (e) {
			var name = login.value;
			if ((e.keyCode || e.charCode) === 13 && name !== '') {
				YM.channels.main.subscribe();
				/*YM.channels.user.checkName({
					name: name,
					success: function () {
						console.log("success");
					},

					error: function () {
						console.log("error");
					}
				});*/
			}
		});
	}

	// this could easily be a css animation
	function hideLogin() {
		login.style.display = "none";
	}

	YM.p = p;
	YM.user = user;
}());