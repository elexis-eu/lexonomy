var docSpec={
	onchange: function(jsSurrogate){
		//console.log(jsSurrogate.parent());
	},
	elements: {

		"newUser": {
			collapsible: false,
			attributes: {
				"email": {
					asker: Xonomy.askString,
					askerParameter: {},
				},
				"password": {
					asker: Xonomy.askString,
					askerParameter: {},
				},
			},
		},
		"user": {
			collapsible: false,
			attributes: {
				"password": {
					asker: Xonomy.askString,
					askerParameter: {},
					menu: [{
						caption: "Remove",
						action: Xonomy.deleteAttribute,
					}],
				},
			},
			menu: [{
				caption: "Add @password",
				action: Xonomy.newAttribute,
				actionParameter: {name: "password", value: ""},
				hideIf: function(jsMe){ return jsMe.hasAttribute("password"); },
			}],
		},
	},
	unknownElement: {
		isReadOnly: true,
		oneliner: true,
		hasText: false,
		collapsible: false,
		menu: [{caption: "Delete", action: Xonomy.deleteElement}],
	},
	unknownAttribute: {
		isReadOnly: true,
		menu: [{caption: "Delete", action: Xonomy.deleteAttribute}],
	},

};
