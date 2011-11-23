require([
	// the modules we want to use
	'jquery',
	'lang',
	'TemplatedList', 
	'dojo/_base/Deferred',
	'Store',
	'text!resources/people.tmpl'
], 
function($, lang, List, Deferred, Store, template){
	// main is our controller
	//  it assembles the views/models/presenters needed to represent this state

	// the main app components:
	// * module loader - currently using require.js
	// * DOM library for querying/manipulating - currently using jquery
	// * data store, which does
	// 		sort-by some attribute
	// 		add whole records
	// 		edit records
	// 		add/edit individual attributes
	// * event emmitter/register - use/port Node's EventEmitter?
	// * event/touch/gesture - use/port Dojo's on and gesture modules?
	// * templating/dom creation - currently using Mustache.js
	
	// * lightweight lists/tree widget(s) - use dojo List?
	
	
	var byId = function(id){
		return document.getElementById(id);
	};
	
	var mixin = lang.mixin,
		createObject = lang.createObject; 
		

	var peopleStore = new Store({
		idProperty: "name",
		data: './data/people.json',
		itemsProperty: 'people'
	});

	var usersStore = new Store({
		idProperty: "username",
		data: './data/users.json'
	});

	function Service(args){
		lang.mixin(this, args || {});
		if(!this.store){
			throw "No store provided to Service ctor";
		}
	}
	Service.prototype.search = function(queryArgs){
		queryArgs = queryArgs || {};

		// TODO: raise unload/transition event
		// service & store might be one abstraction too many?

		// store wants query args and query options
		// like { type: foo}, { count: 5, start: 0}

		var store = this.store, 
			options = {}, 
			range = queryArgs.range;
		if(range){
			options = { 
				start: range[0],
				count: range[1]-range[0]
			};
			delete queryArgs.range;
		};
		console.log("prepared query, options: ", queryArgs, options);
		var res = store.query(queryArgs, options);
		return res;
	};

	function Presenter(args){
		lang.mixin(this, args || {});
	};
	lang.mixin(Presenter.prototype, {
		doSearch: function(term){
			console.log("doSearch", term);
			var self = this;
			queryArgs = {
				range: [0,5]
			};
			term && (queryArgs.name = term);
			
			Deferred.when(this.service.search(queryArgs), function(people){
				console.log("search returned people: ", people);
				var viewData = self.viewMapping(people)
				// TODO: raise load/endtransition event
				// TODO: implement partial updates
				self.view.render(viewData);
			}, function(){
				self.handleError(err);
			});
		},
		handleError: function(err){
			this.view.render({
				people: false
			})
		},
	});
	
	var userPresenter = new Presenter({
		view: new List({ template: template }),
		service: new Service({
			store: usersStore
		}),
		viewMapping: function(people){
			// prepare the context data (view-model) for the view 

			// Assume ES5's Array iteractors and Object methods
			// we'll polyfill if back-compat required
			people = people.map(function(data){
				console.log("user data: ", data);
				var akaNames = ['irc','skype','twitter'];
				var person = createObject(data, {
					"id": data.username,
					"avatar": './resources/anon.jpg',
					"notes": "Zip:" +data.address.zipcode,
					"aliases": [
						{ name: "email", value: data.email }, 
						{ name: "web", value: data.website }, 
						{ name: "phone", value: data.phone }
					]
				});
				return person;
			}, this);
			var viewData = {
				people: people
			};
			console.log("viewMapping has: ", viewData);
			return viewData;
		}
	});
	
	var peoplePresenter = new Presenter({
		view: new List({ 
			template: template, 
			listclass: "horizontal",
			itemclass: "small"
		}),
		service: new Service({
			store: peopleStore
		}),
		viewMapping: function(people){
			// prepare the context data (view-model) for the view 

			// Assume ES5's Array iteractors and Object methods
			// we'll polyfill if back-compat required
			people = people.map(function(data){
				var akaNames = ['irc','skype','twitter'];
				var person = createObject(data, {
					"id": data[peopleStore.idProperty],
					"avatar": data.avatar ? data.avatar : './resources/anon.jpg',
					"notes": data.notes || "",
					"aliases": Object.keys(data)
						.filter(function(key){
							return akaNames.indexOf(key) > -1;
						})
						.map(function(key){
							return {name:key,value:data[key]};
						})
				});
				return person;
			}, this);
			var viewData = {
				people: people
			};
			console.log("viewMapping has: ", viewData);
			return viewData;
		}
	});

	console.log("ready, init-ing");
	peoplePresenter.view.domNode = byId("peoplePanel");
	peoplePresenter.doSearch();
	
	userPresenter.view.domNode = byId("usersPanel");
	userPresenter.doSearch();
});