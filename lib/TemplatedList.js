define([
	"lang",
	"mustache",
	"dojo/Evented",
], function(lang, Mustache, Evented){
	// view
	function List(args){
		lang.mixin(this, args || {});
	}
	List.prototype = new Evented;
	lang.mixin(List.prototype, {
		// defaults for all instances
		template: "<div><ul>{{#people}}<li>{{content}}</li>{{#people}}</ul></div>",
		render: function(viewData){
			console.log("TemplatedList rendering: ", viewData);
			var containerNode = this.domNode, 
				output = Mustache.to_html(
					this.template, 
					lang.createObject({
						listclass: "vertical",
						itemclass: "medium"
					}, viewData)
				);
			
			if(containerNode){
				containerNode.innerHTML = output;
			}
			return containerNode || output;
		},
		domNode: null
	});
	return List;
})