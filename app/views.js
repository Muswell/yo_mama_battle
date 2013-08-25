// view.js creates the view functions to display the data
// set up YM as the global var if it doesn't already exist
var YM = YM || {};

// YM.views contains methods that will create backbone views for a model
YM.views = (function () {
	// backbone view created with a call to YM.views.battle
	var Battle = Backbone.View.extend({
		
		}),
		
		// backbone view created with a call to YM.views.activeBattle
		ActiveBattle = Backbone.View.extend({

		}),
		
		// backbone view created with a call to YM.views.round
		Round = Backbone.View.extend({

		}),
		
		// backbone view created with a call to YM.views.activeRound
		ActiveRound = Backbone.View.extend({

		}),
		
		// backbone view created with a call to YM.views.judges
		Players = Backbone.View.extend({
			tagName: "div",
			className: "players",
			template: _.template(PUBNUB.$('players-tpl').innerHTML),
			
			initialize: function () {
				_.bindAll(this, 'render', 'addPlayer');
				this.collection.on('add remove', this.render);
			},

			render: function () {
				this.$el.html(this.template({players: this.collection.length}));
				this.collection.each(this.addPlayer);
				return this;
			},
			
			addPlayer: function (model) {
				var player = YM.views.player(model);
				this.$el.find("#players-list").append(player.render().el);
			}
			
		}),
		
		// backbone view created with a call to YM.views.judge
		Player = Backbone.View.extend({
			tagName: "div",
			className: "player",
			template: _.template(PUBNUB.$('player-tpl').innerHTML),
			
			initialize: function () {
				_.bindAll(this, 'render');
				this.model.on('change', this.render);
			},

			render: function () {
				this.$el.html(this.template(this.model.toJSON()));
				console.log("attemp player render", this.$el.html());
				return this;
			}
		});
	
	
	return {
		// Creates a view for a battle past
		battle: function (model) {
			return new Battle({model: model});
		},
		
		// Creates a view for the currently active battle
		activeBattle: function (model) {
			return new ActiveBattle({model: model});
		},
		
		// Creates a view for a round past
		round: function (model) {
			return new Round({model: model});
		},
		
		// Creates a view for the currently active round
		activeRound: function (model) {
			return new ActiveRound({model: model});
		},
		
		// Creates a view for the judges (channel subscribers not part of the current battle)
		players: function (collection) {
			return new Players({collection: collection});
		},
		
		// Creates a view for the an individual judge
		player: function (model) {
			return new Player({model: model});
		},
	}
}());