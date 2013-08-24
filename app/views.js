// view.js creates the view functions to display the data
// set up YM as the global var if it doesn't already exist
YM = YM || {};

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
		Judges = Backbone.View.extend({

		}),
		
		// backbone view created with a call to YM.views.judge
		Judge = Backbone.View.extend({

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
		judges: function (collection) {
			return new Judges({collection: collection});
		},
		
		// Creates a view for the an individual judge
		judge: function (collection) {
			return new Judge({model: model});
		},
	}
}());