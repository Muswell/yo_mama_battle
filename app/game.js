// game.js creates the model and collection functions to contain the game data
// set up YM as the global var if it doesn't already exist
YM = YM || {};

// YM.Game creates a game model with Backbone
YM.Game = Backbone.Model.extend({});

// YM.Player creates a player model with Backbone
YM.Player = Backbone.Model.extend({});

// YM.Players creates a collection of YM.Player models with Backbone
YM.Players = Backbone.Collection.extend({});

// YM.Player creates a player model with Backbone
YM.Battle = Backbone.Model.extend({});

// YM.Players creates a collection of YM.Battle models with Backbone
YM.Battles = Backbone.Collection.extend({});

// YM.Player creates a battle round model with Backbone
YM.Round = Backbone.Model.extend({});

// YM.Players creates a collection of YM.Battle Round models with Backbone
YM.Round = Backbone.Collection.extend({});