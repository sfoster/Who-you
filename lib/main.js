require([
	// the modules we want to use
	'jquery',
	'lang',
	'TemplatedList', 
	'dojo/_base/Deferred',
	'dojo/Evented',
	'Store',
	'text!resources/people.tmpl'
], 
function($, lang, List, Deferred, Evented, Store, template){
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

	function Behavior(args){
		return this.constructor.apply(this, arguments);
	}
	Behavior.prototype = new Evented;
	lang.mixin(Behavior.prototype, {
		constructor: function(args){
			this.attached = [];
			lang.mixin(this, args || {});
		},
		attachTo: function(widget){
			this.attached.push(widget);
			this.emit("attach", {
				target: widget
			});
		},
		detachFrom: function(widget){
			var idx = this.attached.indexOf(widget);
			if(idx > -1){
				this.attached.splice(idx, 1);
			}
			this.emit("detach", {
				target: widget
			});
		}
	});

	function Clickable(view){
		$(view.domNode).on("click.clickable", "li", function(domEvent){
			var liNode = domEvent.currentTarget, 
				evt = {
					type: "itemclick",
					id: liNode.getAttribute("data-itemid")
				};
			console.log("li onclick, emitting event: ", evt);
			view.emit(evt.type, evt);
		});
		return view;
	}
	
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
	Presenter.prototype = new Evented;
	lang.mixin(Presenter.prototype, {
		init: function(){
			var self = this, 
				view = this.view; 
			console.log("init presenter");
			view.on("itemclick", function(evt){
				console.log("caught item click on: ", evt);
				self.removeItem(evt.id);
			}); 
		},
		removeItem: function(itemId){
			var self = this, 
				viewData = self._currentViewData || {},
				items =  viewData.people || [], 
				idProperty = this.service.store.idProperty, 
				matchedId = false;
		
			// TODO: do this in/on the store and propagate the change to the view
			for(var i=0; i<items.length; i++){
				if(itemId == items[i][idProperty]){
					matchedId = true;
					break;
				}
			}
			if(matchedId){
				console.log("removing item: ", items[i]);
				items.splice(i, 1);
			}
			this._currentViewData = viewData;
			
			this.view.render(viewData);
		},
		doSearch: function(term){
			console.log("doSearch", term);
			var self = this;
			queryArgs = {
				range: [0,5]
			};
			term && (queryArgs.name = term);
			
			Deferred.when(this.service.search(queryArgs), function(people){
				// console.log("search returned people: ", people);
				var viewData = self.viewMapping(people)
				// TODO: raise load/endtransition event
				// TODO: implement partial updates
				self.view.render(viewData);
				self._currentViewData = viewData;
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
			var idProperty = this.service.store.idProperty; 
			people = people.map(function(data){
				var akaNames = ['irc','skype','twitter'];
				var person = createObject(data, {
					"id": data[idProperty],
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
	peoplePresenter.init();
	
	userPresenter.view.domNode = byId("usersPanel");
	userPresenter.doSearch();
	userPresenter.init();
	
	Clickable(peoplePresenter.view);
});