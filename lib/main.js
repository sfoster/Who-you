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
	
	// TODO: create a Store class and abstract out the storage querying and iteration
	// of the store data to expose a simple consistent interface, something like:
	// 	var Store = function(){};
	// 	extend(Store, {
	// 		length: 0, 
	// 		getItem: function(){},
	// 		setItem: function(){},
	// 		// get,put,add,remove,query,transaction,getChildren,getMetaData,
	// 		removeItem: function(),
	// 		clear
	// 	});
	window.lang = lang;
	
	var byId = function(id){
		return document.getElementById(id);
	};
	
	var mixin = lang.mixin,
		createObject = lang.createObject; 
		
	// load data then populate the store
	// This is temporary, the transport and details of data retrieval/storage 
	// should be tucked away behind the store
	var peopleStore = new Store({
		idProperty: "name",
		data: './data/people.json'
	});


	// main is our controller
	//  it assembles the views/models/presenters needed to represent this state

	var peopleListView = new List({ template: template });
	var peopleSearchService = {
		search: function(queryArgs){
			// TODO: raise unload/transition event
			// service & store might be one abstraction too many?
			var res = peopleStore.query(queryArgs || {});
			return res;
		}
	};
	
	var peoplePresenter = {
		view: peopleListView,
		service: peopleSearchService,
		doSearch: function(){
			var self = this;
			Deferred.when(this.service.search(), function(people){
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
	};

	var errorHandler = function(err){
		console.warn("ugh, error:", err);
	}

	setTimeout(function(){
		peoplePresenter.view.domNode = byId("profileList");
		peoplePresenter.doSearch();
	}, 1500);
});