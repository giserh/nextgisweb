//
// Copyright (c) 2010-2012, Peter Jekel
// All rights reserved.
//
//	The Checkbox Tree (cbtree), also known as the 'Dijit Tree with Multi State Checkboxes'
//	is released under to following three licenses:
//
//	1 - BSD 2-Clause							 (http://thejekels.com/cbtree/LICENSE)
//	2 - The "New" BSD License			 (http://trac.dojotoolkit.org/browser/dojo/trunk/LICENSE#L13)
//	3 - The Academic Free License	 (http://trac.dojotoolkit.org/browser/dojo/trunk/LICENSE#L43)
//
//	In case of doubt, the BSD 2-Clause license takes precedence.
//
define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/event",
	"dojo/_base/lang", 
	"dojo/DeferredList",
	"dojo/dom-construct",
	"dojo/text!./templates/cbtreeNode.html",
	"dijit/_Container",
	"dijit/registry",
	"dijit/Tree",
	"./CheckBox",
	"./models/_dndSelector",  // Fixed dijit tree issue...
	"require"
], function (array, declare, event, lang, DeferredList, domConstruct, NodeTemplate, 
							_Container, registry, Tree, CheckBox, _dndSelector, require) {

	// module:
	//		cbtree/Tree
	// note:
	//		This implementation is compatible with dojo 1.8

	var TreeNode = declare([Tree._TreeNode], {
		// templateString: String
		//		Specifies the HTML template to be used.
		templateString: NodeTemplate,

		moduleName: "cbTree/_TreeNode",
		
		// _checkBox: [private] widget 
		//		Checkbox or custome widget instance.
		_checkBox: null,

		// _toggle: [private] Boolean
		//		Indicates if the checkbox widget supports the toggle function.
		_toggle: true,
		
		// _widget: [private] Object
		//		Specifies the widget to be instanciated for the tree node. The default
		//		is the cbtree CheckBox widget.
		_widget: null,
		
		constructor: function (args){
			// summary:
			//		If a custom widget is specified, it is used instead of the default
			//		cbtree checkbox. Any optional arguments are appended to the default
			//		widget argument list.

			var checkBoxWidget = { type: CheckBox, target: 'INPUT', mixin: null, postCreate: null };
			var widgetArgs		 = { multiState: null, checked: undefined, value: 'on' };
			var customWidget	 = args.widget;

			if (customWidget) {
				lang.mixin( widgetArgs, customWidget.args );
				lang.mixin(checkBoxWidget, customWidget);
			}
			checkBoxWidget.args = widgetArgs;
			
			// Test if the widget supports the toggle() method.
			this._toggle = lang.isFunction (checkBoxWidget.type.prototype.toggle);
			this._widget = checkBoxWidget;
		},

		_createCheckBox: function (/*Boolean*/ multiState) {
			// summary:
			//		Create a checkbox on the TreeNode if a checkbox style is specified.
			// description:
			//		Create a checkbox on the tree node. A checkbox is only created if
			//		the data item has a valid 'checked' attribute OR the model has the
			//		'checkboxAll' attribute enabled.
			//
			// multiState:
			//			Indicate of multi state checkboxes are to be used (true/false).
			// tags:
			//		private

			var itemState = this.tree.model.getItemState(this.item);
			var checked   = itemState.checked;
			var enabled   = itemState.enabled;
			var widget	  = this._widget;
			var args		  = widget.args;
			
			if (checked !== undefined) {
				// Initialize the default checkbox/widget attributes.
				args.multiState = multiState;
				args.checked		= checked;
				args.value			= this.label;

				if (lang.isFunction(widget.mixin)) {
					lang.hitch(this, widget.mixin)(args);
				}

				this._checkBox = new widget.type( args );
				if (this._checkBox) {
					if (lang.isFunction(this._widget.postCreate)) {
						lang.hitch(this._checkBox, this._widget.postCreate)(this);
					}
					domConstruct.place(this._checkBox.domNode, this.checkBoxNode, 'replace');
				}
			}
			if (this._checkBox) {
				if (this.isExpandable) {
          if (this.tree.branchReadOnly || !enabled) {
            this._checkBox.set("readOnly", true);
          }
				} else {
          if (this.tree.leafReadOnly || !enabled) {
            this._checkBox.set("readOnly", true);
          }
				}
			}
		},

		_getCheckedAttr: function () {
			// summary:
			//		Get the current checkbox state. This method provides the hook for
			//		get("checked").
			// tags:
			//		private
			
			if (this._checkBox) {
				return this.tree.model.getChecked(this.item);
			}
		},

		_set_checked_Attr: function (newState) {
			// summary:
			//		Set a new state for the tree node checkbox. This method handles the
			//		internal '_checked_' events generated by the model in which case we
			//		only need to update the checkbox.
			//	newState:
			//		The checked state: 'mixed', true or false.
			// tags:
			//		private
			if (this._checkBox) {
				this._checkBox.set("checked", newState);
			}
		},
		
		_setCheckedAttr: function (/*String|Boolean*/ newState) {
			// summary:
			//		Set a new state for the tree node checkbox. This method implements
			//		the set("checked", newState). These requests are recieved from the
			//		API and therefore we need to inform the model.
			//	newState:
			//		The checked state: 'mixed', true or false.
			// tags:
			//		private

			if (this._checkBox) {
				return this.tree.model.setChecked(this.item, newState);
			}
		},

		_getEnabledAttr: function () {
			// summary:
			//		Get the current 'enabled' state of the item associated with this
			//		tree node. This method provides the hook for get("enabled").
			// tag:
			//		Private
			return this.tree.model.getEnabled(this.item);
		},
		
		_set_enabled_Attr: function (enabled) {
			// summary:
			//		Set the 'Read Only' property of the checkbox. This method handles
			//		the internal '_enabled_' event generated by the model after the
			//		store update.
			//	enabled:
			//		The new enabled state.
			// tags:
			//		private
      this._checkBox.set("readOnly", !enabled);
		},

		_setEnabledAttr: function (/*Boolean*/ newState) {
			// summary:
			//		Set the new 'enabled' state of the item associated with this tree
			//		node. This method provides the hook for set("enabled", newState).
			// newState:
			//		Boolean, true or false.
			// tag:
			//		Private.
			return this.tree.model.setEnabled(this.item, newState);
		},
		
		_toggleCheckBox: function (){
			// summary:
			//		Toggle the current checkbox checked attribute and update the model
			//		accordingly. Typically called when the spacebar is pressed. 
			//		If a custom widget does not support toggle() we will just mimic it.
			// tags:
			//		private

			var newState, oldState;
			if (this._checkBox) {
				if (this._toggle) {
					newState = this._checkBox.toggle();
				} else {
					oldState = this._checkBox.get("checked");
					newState = (oldState == "mixed" ? true : !oldState);
				}
				this.tree.model.setChecked(this.item, newState);
			}
			return newState;
		},
		
		destroy: function () {
			// summary:
			//		Destroy the checkbox of the tree node widget.
			//
			if (this._checkbox) {
				this._checkbox.destroy();
				delete this._checkbox;
			}
			this.inherited(arguments);
		},

		postCreate: function () {
			// summary:
			//		Handle the creation of the checkbox and node specific icons after
			//		the tree node has been instanciated.
			// description:
			//		Handle the creation of the checkbox after the tree node has been
			//		instanciated. If the item has a custom icon specified, overwrite
			//		the current icon.
			//
			var tree	= this.tree,
					itemIcon = null,
					nodeIcon;

			if (tree.checkBoxes === true) {
				this._createCheckBox(tree._multiState);
			}
			// If Tree styling is loaded and the model has its iconAttr set go see if
			// there is a custom icon amongst the item attributes.
			if (tree._hasStyling && tree._iconAttr) {
				var itemIcon = tree.get("icon", this.item);
				if (itemIcon) {
					this.set("_icon_",itemIcon);
				}
			}
			// Just in case one is available, set the tooltip.
			this.set("tooltip", this.title);
			this.inherited(arguments);
		},

		setChildItems: function(/* Object[] */ items){
			// summary:
			//		Sets the child items of this node, removing/adding nodes
			//		from current children to match specified items[] array.
			//		Also, if this.persist == true, expands any children that were previously
			//		opened.
			// returns:
			//		Deferred object that fires after all previously opened children
			//		have been expanded again (or fires instantly if there are no such children).

			var tree = this.tree,
				model = tree.model,
				defs = [];	// list of deferreds that need to fire before I am complete

			// Orphan all my existing children.
			// If items contains some of the same items as before then we will reattach them.
			// Don't call this.removeChild() because that will collapse the tree etc.
			var oldChildren = this.getChildren();
			array.forEach(oldChildren, function(child){
				_Container.prototype.removeChild.call(this, child);
			}, this);

			// All the old children of this TreeNode are subject for destruction if
			//		1) they aren't listed in the new children array (items)
			//		2) they aren't immediately adopted by another node (DnD)
			this.defer(function(){
				array.forEach(oldChildren, function(node){
					if(!node._destroyed && !node.getParent()){
						// If node is in selection then remove it.
						tree.dndController.removeTreeNode(node);

						// Deregister mapping from item id --> this node
						var id = model.getIdentity(node.item),
							ary = tree._itemNodesMap[id];
						if(ary.length == 1){
							delete tree._itemNodesMap[id];
						}else{
							var index = array.indexOf(ary, node);
							if(index != -1){
								ary.splice(index, 1);
							}
						}
						// And finally we can destroy the node
						node.destroyRecursive();
					}
				});
			});

			this.state = "LOADED";

			if(items && items.length > 0){
				this.isExpandable = true;
				// Create _TreeNode widget for each specified tree node, unless one already
				// exists and isn't being used (presumably it's from a DnD move and was recently
				// released
				array.forEach(items, function(item){	// MARKER: REUSE NODE
					var id = model.getIdentity(item),
						existingNodes = tree._itemNodesMap[id],
						node;
					if(existingNodes){
						for(var i=0;i<existingNodes.length;i++){
							// FIX 1 - Don't re-used destroyed nodes, instead clean them up.
							if (!existingNodes[i] || existingNodes[i]._beingDestroyed) {
								existingNodes.splice(i,1);
								if (existingNodes.length == 0) {
									delete tree._itemNodesMap[id];
								}
							} else {
								if(!existingNodes[i].getParent()) {
									node = existingNodes[i];
									node.set('indent', this.indent+1);
									break;
								}
							}
						}
					}
					if(!node){
						node = this.tree._createTreeNode({
							item: item,
							tree: tree,
							isExpandable: model.mayHaveChildren(item),
							label: tree.getLabel(item),
							tooltip: tree.getTooltip(item),
							ownerDocument: tree.ownerDocument,
							dir: tree.dir,
							lang: tree.lang,
							textDir: tree.textDir,
							indent: this.indent + 1
						});
						if(existingNodes){
							existingNodes.push(node);
						}else{
							tree._itemNodesMap[id] = [node];
						}
					}
					this.addChild(node);

					// If node was previously opened then open it again now (this may trigger
					// more data store accesses, recursively)
					if(this.tree.autoExpand || this.tree._state(node)){
						defs.push(tree._expandNode(node));
					}
				}, this);

				// note that updateLayout() needs to be called on each child after
				// _all_ the children exist
				array.forEach(this.getChildren(), function(child){
					child._updateLayout();
				});
			}else{
				// FIX 2 - If no children, delete _expandNodeDeferred if any...
				tree._collapseNode(this);
				this.isExpandable=false;
			}

			if(this._setExpando){
				// change expando to/from dot or + icon, as appropriate
				this._setExpando(false);
			}

			// Set leaf icon or folder icon, as appropriate
			this._updateItemClasses(this.item);

			// On initial tree show, make the selected TreeNode as either the root node of the tree,
			// or the first child, if the root node is hidden
			if(this == tree.rootNode){
				var fc = this.tree.showRoot ? this : this.getChildren()[0];
				if(fc){
					fc.setFocusable(true);
					tree.lastFocused = fc;
				}else{
					// fallback: no nodes in tree so focus on Tree <div> itself
					tree.domNode.setAttribute("tabIndex", "0");
				}
			}

			var def =  new DeferredList(defs);
			this.tree._startPaint(def);		// to reset TreeNode widths after an item is added/removed from the Tree
			return def;		// dojo/_base/Deferred
		}

	});	/* end declare() _TreeNode*/

	return declare([Tree], {

		//==============================
		// Parameters to constructor

		// branchIcons: Boolean
		//		Determines if the FolderOpen/FolderClosed icon or their custom equivalent
		//		is displayed.
		branchIcons: true,

		// branchReadOnly: Boolean
		//		Determines if branch checkboxes are read only. If true, the user must
		//		check/uncheck every child checkbox individually. 
		branchReadOnly: false,
		
		// checkBoxes: String
		//		If true it enables the creation of checkboxes, If a tree node actually
		//		gets a checkbox depends on the configuration of the model. If false no
		//		 checkboxes will be created regardless of the model configuration.
		checkBoxes: true,

		// leafReadOnly: Boolean
		//		Determines if leaf checkboxes are read only. If true, the user can only
		//		check/uncheck branch checkboxes and thus overwriting the per store item
		//		'enabled' features for any store item associated with a tree leaf.
		leafReadOnly: false,
		
		// nodeIcons: Boolean
		//		Determines if the Leaf icon, or its custom equivalent, is displayed.
		nodeIcons: true,

		// FIX: 3 - Force tree to use the modified _dndSelector (see ./models/_dndSelector)
		dndController: _dndSelector,

		// End Parameters to constructor
		//==============================

		moduleName: "cbTree/Tree",

		// _multiState: [private] Boolean
		//		Determines if the checked state needs to be maintained as multi state or
		//		or as a dual state. ({"mixed",true,false} vs {true,false}). Its value is
		//		fetched from the tree model.
		_multiState: true,
		
		// _checkedAttr: [private] String
		//		Attribute name associated with the checkbox checked state of a data item.
		//		The value is retrieved from the models 'checkedAttr' property and added
		//		to the list of model events.
		_checkedAttr: "",
		
		// _customWidget: [private]
		//		A custom widget to be used instead of the cbtree CheckBox widget. Any 
		//		custom widget MUST have a 'checked' property and provide support for 
		//		both the get() and set() methods.
		_customWidget: null,

		// _eventAttrMap: [private] String[]
		//		List of additional events (attribute names) the onItemChange() method
		//		will act upon besides the _checkedAttr property value.	 Any internal
		//		events are pre- and suffixed with an underscore like '_styling_'
		_eventAttrMap: null,

		// _dojoRequired [private] Object
		//		Specifies the minimum and maximum dojo version required to run this
		//		implementation of the cbtree.
		//
		//			vers-required	::= '{' (min-version | max-version | min-version ',' max-version) '}'
		//			min-version		::= version
		//			max-version		::= version
		//			version				::= '{' "major" ':' number ',' "minor" ':' number '}'
		//
		_dojoRequired: { min: {major:1, minor:8}, max: {major:1, minor:9}},

		_assertVersion: function () {
			// summary:
			//		Test if we're running the correct dojo version.
			// tag:
			//		Private
			if (dojo.version) {
				var dojoVer = (dojo.version.major * 10) + dojo.version.minor,
						dojoMax = 999,
						dojoMin = 0;
						
				if (this._dojoRequired) {
					if (this._dojoRequired.min !== undefined) {
						dojoMin = (this._dojoRequired.min.major * 10) + this._dojoRequired.min.minor;
					}
					if (this._dojoRequired.max !== undefined) {
						dojoMax = (this._dojoRequired.max.major * 10) + this._dojoRequired.max.minor;
					}
					if (dojoVer < dojoMin || dojoVer > dojoMax) { 
						throw new Error(this.moduleName+"::_assertVersion(): invalid dojo version.");
					}
				}
			} else {
				throw new Error(this.moduleNmae+"::_assertVersion(): unable to determine dojo version.");
			}
		},
		
		_createTreeNode: function (args) {
			// summary:
			//		Create a new cbtreeTreeNode instance.
			// description:
			//		Create a new cbtreeTreeNode instance.
			// tags:
			//		private

			args["widget"] = this._customWidget;		/* Mixin the custom widget */
			if (this._hasStyling && this._icon) {
				args["icon"] = this._icon;
			}
			return new TreeNode(args);
		},

		_onCheckBoxClick: function (/*TreeNode*/ nodeWidget, /*Boolean|String*/ newState, /*Event*/ evt) {
			// summary:
			//		Translates checkbox click events into commands for the controller
			//		to process.
			// description:
			//		the _onCheckBoxClick function is called whenever a mouse 'click'
			//		on a checkbox is detected. Because the click was on the checkbox
			//		we are not dealing with any node expansion or collapsing here.
			// tags:
			//		private

			var item = nodeWidget.item;
				
			this._publish("checkbox", { item: item, node: nodeWidget, state: newState, evt: evt});
			// Generate events incase any listeners are tuned in...
			this.onCheckBoxClick(item, nodeWidget, evt);
			this.onClick(nodeWidget.item, nodeWidget, evt);
			this.focusNode(nodeWidget);
			event.stop(evt);
		},

		_onClick: function(/*TreeNode*/ nodeWidget, /*Event*/ evt){
			// summary:
			//		Handler for onclick event on a tree node
			// description:
			//		If the click event occured on a checkbox, get the new checkbox checked
			//		state, update the model and generate the checkbox click related events
			//		otherwise pass the event on to the tree as a regular click event.
			// evt:
			//		Event object.
			// tags:
			//		private extension
			var checkedWidget = nodeWidget._widget;

			if (evt.target.nodeName == checkedWidget.target) {
				var newState = nodeWidget._checkBox.get("checked");				
				this.model.setChecked(nodeWidget.item, newState);
				this._onCheckBoxClick(nodeWidget, newState, evt);
			} else {
				this.inherited(arguments);
			}
		},
		
		_onItemChange: function (/*data.Item*/ item, /*String*/ attr, /*AnyType*/ value){
			// summary:
			//		Processes notification of a change to an data item's scalar values and
			//		internally generated events which effect the presentation of an item.
			// description:
			//		Processes notification of a change to a data item's scalar values like
			//		label or checkbox state.	In addition, it also handles internal events
			//		that effect the presentation of an item (see TreeStyling.js)
			//		The model, or internal, attribute name is mapped to a tree node property,
			//		only if a mapping is available is the event passed on to the appropriate
			//		tree node otherwise the event is considered of no impact to the tree
			//		presentation.
			// item:
			//		A valid data item
			// attr:
			//		Attribute/event name
			// value:
			//		New value of the item attribute
			// tags:
			//		private extension
 
			var nodeProp = this._eventAttrMap[attr];
			if (nodeProp) {
				var identity = this.model.getIdentity(item),
						nodes		= this._itemNodesMap[identity],
						request	= {};

				if (nodes){
					if (nodeProp.value) {
						if (lang.isFunction(nodeProp.value)) {
							request[nodeProp.attribute] = lang.hitch(this, nodeProp.value)(item, nodeProp.attribute, value);
						} else {
							request[nodeProp.attribute] = nodeProp.value;
						}
					} else {
						request[nodeProp.attribute] = value;
					}
					array.forEach(nodes, function (node){
							node.set(request);
						}, this);
				}
			}
		},

		_onKeyPress: function (/*Event*/ evt){
			// summary:
			//		Toggle the checkbox state when the user pressed the spacebar.
			// description:
			//		Toggle the checkbox state when the user pressed the spacebar.
			//		The spacebar is only processed if the widget that has focus is
			//		a tree node and has a checkbox.
			// tags:
			//		private extension

			if (!evt.altKey) {
				var treeNode = registry.getEnclosingWidget(evt.target);
				if (lang.isString(evt.charOrCode) && (evt.charOrCode == ' ')) {
					treeNode._toggleCheckBox();
				}
			}
			this.inherited(arguments);	/* Pass it on to the parent tree... */
		},

		_onLabelChange: function (/*String*/ oldValue, /*String*/ newValue) {
			// summary:
			//		Handler called when the model changed its label attribute property.
			//		Map the new label attribute to "label"
			// tags:
			//		private

			this.mapEventToAttr(oldValue, newValue, "label");
		},
		
		_setWidgetAttr: function (/*String|Function|Object*/ widget) {
			// summary:
			//		Set the custom widget. This method is the hook for set("widget",widget).
			// description:
			//		Set the custom widget. A valid widget MUST have a 'checked' property
			//		AND methods get() and set() otherwise the widget is rejected and an
			//		error is thrown. If valid, the widget is used instead of the default
			//		cbtree checkbox.
			// widget: 
			//		An String, object or function. In case of an object, the object can
			//		have the following properties:
			//			type			:	Function | String, the widget constructor or a module Id string
			//			args			:	Object, arguments passed to the constructor (optional)
			//			target		:	String, mouse click target nodename (optional)
			//			mixin		 :	Function, called prior to widget instantiation.
			//			postCreate: Function, called after widget instantiation
			// tag:
			//		experimental
			var customWidget = widget,
					property = "checked",
					message,
					proto;

			if (lang.isString(widget)) {
				return this._setWidgetAttr({ type: widget });
			}

			if (lang.isObject(widget) && widget.hasOwnProperty("type")) {
				customWidget = widget.type;
				if (lang.isFunction (customWidget)) {
					proto = customWidget.prototype;
					if (proto && typeof proto[property] !== "undefined"){
						// See if the widget has a getter and setter methods...
						if (lang.isFunction (proto.get) && lang.isFunction (proto.set)) {
							this._customWidget = widget;
							return;
						} else {
							message = "Widget does not support get() and/or set()";
						}
					} else {
						message = "widget MUST have a 'checked' property";
					}
				}else{
					// Test for module id string to support declarative definition of tree
					if (lang.isString(customWidget) && ~customWidget.indexOf('/')) {
						var self = this;
							require([customWidget], function(newWidget) {
								widget.type = newWidget;
								self._setWidgetAttr( widget );
							});
							return;
					}
					message = "argument is not a valid module id";
				}
			} else {
				message = "Object is missing required 'type' property";
			}
			throw new Error(this.moduleName+"::_setWidgetAttr(): " + message);
		},

		create: function() {
			this._assertVersion();
			this.inherited(arguments);
		},
		
		destroy: function() {
			this.model = null;
			this.inherited(arguments);
		},
		
		getIconStyle:function (/*data.item*/ item, /*Boolean*/ opened) {
			// summary:
			//		Return the DOM style for the node Icon. 
			// item:
			//		A valid data item
			// opened:
			//		Indicates if the tree node is expanded.
			// tags:
			//		extension
			var isExpandable = this.model.mayHaveChildren(item);
			var style = this.inherited(arguments) || {};

			if (isExpandable) {
				if (!this.branchIcons) {
					style["display"] = "none";
				}
			} else {
				if (!this.nodeIcons) {
					style["display"] = "none";
				}
			}
			return style;
		},

		mixinEvent: function (/*data.Item*/ item, /*String*/ event, /*AnyType*/ value) {
			// summary:
			//		Mixin a user generated event into the tree event stream. This method
			//		allows users to inject events as if they came from the model.
			// item:
			//		A valid data item
			// event:
			//		Event/attribute name. An entry in the event mapping table must be present.
			//		(see mapEventToAttr())
			// value:
			//		Value to be assigned to the mapped _TreeNode attribute.
			// tag:
			//		public
			
			if (this.model.isItem(item) && this._eventAttrMap[event]) {
				this._onItemChange(item, event, value);
				this.onEvent(item, event, value);
			}
		},

		onCheckBoxClick: function (/*data.item*/ item, /*treeNode*/ treeNode, /*Event*/ evt) {
			// summary:
			//		Callback when a checkbox on a tree node is clicked.
			// tags:
			//		callback
		},
		
		onEvent: function (/*===== item, event, value =====*/) {
			// summary:
			//		Callback when an event was succesfully mixed in.
			// item:
			//		A valid data item
			// event:
			//		Event/attribute name.
			// value:
			//		Value assigned to the mapped _TreeNode attribute.
			// tags:
			//		callback
		},

		postMixInProperties: function(){
			this._eventAttrMap = {};		/* Create event mapping object */

			this.inherited(arguments);
		},

		postCreate: function () {
			// summary:
			//		Handle any specifics related to the tree and model after the
			//		instanciation of the Tree. 
			// description:
			//		Whenever checkboxes are requested Validate if we have a model
			//		capable of updating item attributes.
			var model = this.model;

			if (this.model) {
				if (this.checkBoxes === true) {
					if (!this._modelOk()) {
						throw new Error(this.moduleName+"::postCreate(): model does not support getChecked() and/or setChecked().");
					}
					this._multiState	= model.multiState;
					this._checkedAttr = model.checkedAttr;

					// Add item attributes and other attributes of interest to the mapping
					// table. Checkbox checked events from the model are mapped to the 
					// internal '_checked_' event so a Tree node is able to distinguesh
					// between events coming from the model and those coming from the API
					// like set("checked",true)
					
					this.mapEventToAttr(null,(this._checkedAttr || "checked"), "_checked_");
					model.validateData();
				}
				// Monitor any changes to the models label attribute and add the current
				// 'label' and 'enabled' attribute to the mapping table.
				this.connect(model, "onLabelChange", "_onLabelChange");

				this.mapEventToAttr(null, model.get("enabledAttr"), "_enabled_");
				this.mapEventToAttr(null, model.get("labelAttr"), "label");

				this.inherited(arguments);
			} 
			else // The CheckBox Tree requires a model.
			{
				throw new Error(this.moduleName+"::postCreate(): no model was specified.");
			}
		},
		
		// =======================================================================
		// Misc helper functions/methods

		mapEventToAttr: function (/*String*/ oldAttr, /*String*/ attr, /*String*/ nodeAttr, /*anything?*/ value) {
			// summary:
			//		Add an event mapping to the mapping table.
			//description:
			//		Any event, triggered by the model or some other extension, can be
			//		mapped to a _TreeNode attribute resulting a 'set' request for the
			//		associated _TreeNode attribute.
			// oldAttr:
			//		Original attribute name. If present in the mapping table it is deleted
			//		and replace with 'attr'.
			// attr:
			//		Attribute/event name that needs mapping.
			// nodeAttr:
			//		Name of a _TreeNode attribute to which 'attr' is mapped.
			// value:
			//		If specified the value to be assigned to the _TreeNode attribute. If
			//		value is a function the function is called as: 
			//
			//			function(item, nodeAttr, newValue)
			//
			//		and the result returned is assigned to the _TreeNode attribute.
			
			if (lang.isString(attr) && lang.isString(nodeAttr)) {
				if (attr.length && nodeAttr.length) {
					if (oldAttr) {
						delete this._eventAttrMap[oldAttr];
					}
					this._eventAttrMap[attr] = {attribute: nodeAttr, value: value};
				}
			}
		},

		_modelOk: function () {
			// summary:
			//		Test if the model has the minimum required feature set, that is,
			//		model.getChecked() and model.setChecked().
			// tags:
			//		private

			if ((this.model.getChecked && lang.isFunction( this.model.getChecked )) &&
					(this.model.setChecked && lang.isFunction( this.model.setChecked ))) {
				return true;
			}
			return false;
		}
				
	});	/* end declare() Tree */

});	/* end define() */