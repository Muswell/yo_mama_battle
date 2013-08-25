// channels.js creates channel modules to track different data in the game
// set up YM as the global var if it doesn't already exist
var YM = YM || {};

// YM.channels is a module that contains the publishing and subscribing different pubnub channels
YM.channels = (function () {
	// Watch who's here
	var main = (function () {
		var channel = "yo-mama",
			subscribed = false,
			uuids = [],
			serverUuid;
		
		// The only messages pushed to this channel list a uuid which will be tagged as server uuid
		function getServerUuid(callback) {
			YM.p.history({
		        count    : 1,
		        channel  : channel,
		        callback : function (message) { 
					serverUuid = message[0].length === 1 ? message[0][0] : undefined;
					callback();
				}
		    });
		}
		
		// take the first uuid in the list or the current user if empty and tag that uuid as the server user
		function tagServer() {
			YM.p.publish({
				channel: channel,
				message: uuids[0] || YM.user.uuid
			});
		}
		
		// login 
		function subscribe () {
			getServerUuid(function () {
				YM.p.subscribe({
					channel  : channel,
					connect  : connect,
					callback : callback,
					presence : presence
				});
			});
		}
		
		function connect() {
			subscribed = true
			YM.p.here_now({
	            channel: channel,
	            callback: presence
	        });
		}
		
		function callback(message) {
			serverUuid = message;
		}

		function presence (details) {
			if (details.hasOwnProperty("uuids")) {
				uuids = details.uuids;
				YM.p.events.fire("here-and-now", uuids);
				
				YM.p.each(details.uuids, function(uuid) {
		            YM.p.events.fire( 'player-join', uuid);
		        } );
				if ((serverUuid === undefined && uuids.length === 0) || !(_.any(uuids, function (uuid) { return uuid === serverUuid ;}))) {
					tagServer();
				}
				return
			}

			if (details.action === "join") {
				join(details.uuid);
			}

			if (details.action === "leave") {
				leave(details.uuid);
			}
		}
		
		function join (uuid) {
			YM.p.events.fire("player-join", uuid);
			if (!_.any(uuids, function (id) { return uuid === id; })) {
				uuids.push(uuid);
			}
		}
		
		function leave(uuid) {
			YM.p.events.fire("player-leave", uuid);
			uuids.splice(_.indexOf(uuids, uuid), 1);
			// tag a new server user if the previous one left
			// unfortunately this is published by all clients. Can't think of a work around for that
			// so far using the same uuid from each client so not critical to avoid.
			if (uuid === serverUuid) {
				tagServer();
			}
		}

		return {
			subscribe: subscribe,
			server: function () {
				return serverUuid;
			},

			uuids: function () {
				return uuids;
			}
		};
	}()),
	
	// The users channel is used to link uuids with names and to validate new user names.
	users = (function () {
		var channel = "yo-mama-users",
			subscribed = false,
			players = [],
			history = [];
		
		function subscribe () {
			YM.p.subscribe({
				channel  : channel,
				callback : callback
			});
		}
		
		function publish (user) {
			YM.p.publish({
				channel : channel,
	            message : {
	                uuid: user.uuid,
	                name: user.name
	            }
			});
		}
		
		function callback (message) {
			players.push(message);
			YM.p.events.fire( 'player-added', message);
		}
		
		function loadPlayers(callback) {
			// 20 should be more than enough
			YM.p.history({
				count    : 20,
		        channel  : channel,
				callback: function (message) {
					var active = YM.channels.main.uuids(),
						users = message[0],
						user,
						i,
						j;

					function isActive(uuid) {
						return _.any(active, function (id) {
							return uuid === id;
						});
					}
					
					for (i = 0, j = users.length; i < j; i += 1) {
						user = users[i];
						if (isActive(user.uuid)) {
							players.push(user);
						}
					}

					history = users;
					YM.p.events.fire('history-updated', history);
					callback();
				}
			});
		}
		
		function playerParse(uuid) {
			loadPlayers(function () {
				var model = _.find(players, function (obj) {
					return obj.uuid === uuid;
				}) || { uuid: uuid, name: "unkown"};
				YM.p.events.fire('player-parsed', model);
			});
		}
		
		function create(args) {
			
			function inUse(name) {
				return _.any(history, function (player) { return player.name === name; })
			}
			loadPlayers(function () {
				if (inUse(args.name)) {
					args.error();
					return
				}
				args.success();
			});
		}
		
		return {
			// check wether a chosen name is in use
			create: create,
			subscribe: subscribe,
			publish: publish,
			loadPlayers: loadPlayers,
			players: function () {
				return players;
			},
			playerParse: playerParse
		};
	}()),

	// The battle channel is used to link uuids with Battle models.
	batle = (function () {
		var channel = "yo-mama-battle-1",
			active,
			history = [];
		
		// Finds the most recent publish to the battle channel
		function getCurrentBattle(callback) {
			YM.p.history({
		        count    : 1,
		        channel  : channel,
		        callback : function (message) { 
					active = message[0].length === 1 ? message[0][0] : undefined;
					callback();
				}
		    });
		}
		
		// creates a new battle uuid and publishes it if this user is marked as the server user.
		function setActive() {
			console.log("setActive");
		}
		
		// Checks if there is a currently active battle and if all participants are still here
		function checkActive() {
			var here;
			if (active === undefined) {
				return false;
			}
			
			function playerHere(player) {
				return _.any(here, function (uuid) {
					return player === uuid;
				});
			}
			
			// make sure a challenger hasn't left
			if (active.player1 !== '' && active.player2 !== '') {
				here = main.uuids();
				
				if (!playerHere(active.player1) || !playerHere(active.player2)) {
					return false;
				}
			}
			return true;
		}
		
		// the subscribe function checks the history of the channel and determines if a new battle model is needed.
		// it also does a pubnub subscribe to the battle feed.
		function subscribe() {
			getCurrentBattle(function () {
				if(!checkActive()) {
					setActive();
					/*YM.p.subscribe({
						channel  : channel,
						callback : callback
					});*/
				}
			});
		}
		return {
			subscribe: subscribe,
			
		}
	}());
	
	return {
		// Main channel mostly just watches for presence events.
		// It also tags a 'server' user to manage model creation events only happen once.
		main: main,
		
		// The users channel is used to link uuids with names and to validate new user names.
		users: users,
		
		// This channel is used to create new battle models
		battle: battle,

		subscribe: function () {
			main.subscribe();
			users.subscribe();
		}
	};
}());