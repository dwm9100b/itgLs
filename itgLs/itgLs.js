﻿// ============================================================================================
// ============================================================================================
// itgLs.js
//
// Library that enhances development with LightSwitch 2013 HTML Projects
// This will be a full rewrite of an earlier version and a consolidation from a number
// of other itg projects
//
// Dependencies:  Yep, lo-dash.js
//
// Licensing? Nope, free to use and modify as you see fit
// Bugs? Maybe
// Liability? Nope, use at your own risk, fix what doesnt work
// 
// http://blog.ofAnITGuy.com
// 
// Last updated: 5-6-2014 @ 11:00a
// ============================================================================================
// ============================================================================================

// Does our namespace exist
window.itgLs = window.itgLs || {};

(function () {

	window.itgLs.button = {

		// *****************************************************************************************************
		// *****************************************************************************************************
		// Change the icon of a button
		//		element, currentIconClass, newIconClass
		// *****************************************************************************************************
		// *****************************************************************************************************
		changeIcon: (function (element, currentIconClass, newIconClass) {

			/// <summary>Change the icon of a button</summary>
			/// <param name="element" type="object">The element that displays our icon</param>
			/// <param name="currentIconClass" type="string">Class name of the current icon</param>
			/// <param name="newIconClass" type="string">Class name of the new icon</param>

			$(element).find(".ui-icon")
				.removeClass(currentIconClass)
				.addClass(newIconClass);

		}),


		// ==========================================================================================
		// Quick little function to convert a standard button to Iconic button
		// Added here for this targeted example, is typically part of the itgLs library
		// ==========================================================================================
		renderAsIcon: function (element, contentItem, icon, noText) {

			/// <summary>Render a standard button as an icon button</summary>
			/// <param name="element" type="object">The button element to convert</param>
			/// <param name="contentItem" type="object">contentItem of the standard button</param>
			/// <param name="icon" type="string">Class name of the icon<br/>
			/// ok, cancel, discard, decline, save, logout, back, search, camera, trash, add, remove,<br/>
			/// video, tag, gear, contacts, edit, question, refreesh, list, folder, move, text, attachment,<br/>
			/// warning, star, addfavorite, filter, sort, addpicture, document, download, calendar, dropdown<br/>		
			/// </param>
			/// <param name="noText" type="boolean">Optional<br/>
			/// Show button text or not, defaults to false
			/// </param>

			// Create our html items for our button
			var $div = $('<div class="id-element msls-large-icon ui-btn ui-shadow ui-mini ui-btn-icon-top ui-btn-up-a" data-theme="a" style="box-shadow: none;"></div>');
			var $innerButton = $('<span class="ui-btn-inner"></span>');
			var $textSpan = $('<span class="ui-btn-text">' + contentItem.displayName + '</span>');
			var $iconSpan = $('<span class="ui-icon ui-icon-msls-' + icon + ' ui-icon-shadow">&nbsp;</span>');

			// Default noText to false (show text)
			noText = noText || false;

			if (noText == true) {

				// Add all of our items under the big div
				$div.append($innerButton.append($iconSpan));

			} else {

				// Add all of our items under the big div
				$div.append($innerButton.append($textSpan).append($iconSpan));

				// Bind to the displayName so the text can be dynamically changed
				contentItem.dataBind('displayName', function (newValue) {
					$textSpan.text(newValue);
				});

			}

			// Add our new button to the element
			$(element).html($div);

			// Removing the msls-leaf will drop the big padding typically used
			$(element).closest('.msls-leaf').removeClass('msls-leaf');

		}
	};

	window.itgLs.list = {

		// ============================================================================================
		// Functionality to enhance a ListView/TileView/TableView for multiple selects
		// ============================================================================================
		//
		// Enhancing a list controls ItemTap, allowing for selection of multiple items 
		// Very efficient vs using the dataBind method as the number of calls are greatly reduced
		// Selection is list specific, allowing for multiple lists on the same screen to have
		// enhanced selection capability.
		// Also allows for toggling selection of an item by tapping/clicking on a selected item
		//
		// Requirments:  Screen contentItem must be either a TileList or List
		//
		// Parameters:
		//		contentItem - screen.contentItem of the list
		//		totalSelectionsAllowed - total number of item selections allowed
		//							Can be null or undefined for unlimited selections
		//							Can also be set on the contentItem directly
		//
		// Example:
		//
		//		Following would allow for unlimited selections
		//		var dogsList = screen.contentItem("Dogs")
		//		enhancedListItemTap(dogsList)
		//
		//		Following will only allow 3 items to be selected
		//		var catsList = screen.contentItem("Cats")
		//		enhancedListItemTap(catsList, 3)
		//		
		//
		// ============================================================================================
		// Note that I have started to go down the path of using native JavaScript functions
		// vs jQuery whenever possible.  The native functions are much faster with little loss in
		// functionality.  
		// ============================================================================================


		// ============================================================================================
		// Meat of the functionality, pass the list contentItem and number of selections that are allowed
		// ============================================================================================
		itemTap: function (contentItem, totalSelectionsAllowed) {

			/// <summary>Enhance a list/table item tap to allow multi-item selection</summary>
			/// <param name="contentItem" type="object">Screen contentItem of the list/table control</param>
			/// <param name="totalSelectionsAllowed" type="integer">Optional<br />
			/// Maximum number of items that can be selected<br />
			/// Defaults to unlimited<br/>
			/// null or undefined will allow for unlimited selections.
			/// </param>

			if (contentItem != null && contentItem._view != null && contentItem._view._container != null) {

				var controlId = contentItem.model.view.id;

				var controlClass = controlId === ":Table" ? ".msls-table" : ".msls-listview";
				var itgSelectedClass = "itg-selected-item";
				var itgSelector = controlId === ":Table" ? "tbody tr.itg-selected-item" : "ul li.itg-selected-item";
				var lsSelector = controlId === ":Table" ? "tbody tr.ui-btn-active" : "ul li.ui-btn-active";

				// Make sure we have a default allowed count, which is single
				if (contentItem.totalSelectionsAllowed === undefined)
					contentItem.totalSelectionsAllowed = totalSelectionsAllowed || null;

				// Get the listview container... allowing independent lists on the same screen
				var listView = contentItem._view._container[0].querySelector(controlClass);

				// Get the currently tapped item, in this listview only
				var item = listView.querySelector(lsSelector);

				// Not likely, but make sure there is an item
				if (item) {

					// If number of selects is multiple, then go!
					if (contentItem.totalSelectionsAllowed === null || contentItem.totalSelectionsAllowed > 1) {

						// If the selected item already was selected, unselect (nullify) the item
						if (item.classList.contains(itgSelectedClass)) {
							contentItem.screen[contentItem.name].selectedItem = null;
							item.classList.remove(itgSelectedClass);
							item.classList.remove('ui-focus');

							// If the tapped item does not have our custom class showing selected, add it
						} else {

							// Get the current count of selected items
							var selectedCount = 0;
							if (contentItem.totalSelectionsAllowed !== null)
								selectedCount = listView.querySelectorAll(itgSelector).length;

							// If less than the total allowed add the class
							if (contentItem.totalSelectionsAllowed === null || selectedCount < contentItem.totalSelectionsAllowed) {
								item.classList.add(itgSelectedClass);

								// Already hit the limit, unselect this item
							} else {
								contentItem.screen[contentItem.name].selectedItem = null;
								item.classList.remove('ui-focus');
							}
						}

						// Only 1 selection is allowed
					} else {

						// If the selected item already was selected, unselect (nullify) the item
						if (item.classList.contains(itgSelectedClass)) {
							contentItem.screen[contentItem.name].selectedItem = null;
							item.classList.remove(itgSelectedClass);
							item.classList.remove('ui-focus');

							// Not selected already, so remove any previous selection, and add to this one
						} else {
							var prevItem = listView.querySelector(itgSelector);
							if (prevItem !== null)
								prevItem.classList.remove(itgSelectedClass)

							item.classList.add(itgSelectedClass);
						}
					}
				}
			}

		},


		// ============================================================================================
		// Helper function to return an array holding the entities of all the selected items
		// ============================================================================================
		selected: function (contentItem) {

			/// <summary>Get all the selected items from a list/table</summary>
			/// <param name="contentItem" type="object">Screen contentItem of the the list/table</param>
			/// <returns type="array">An array of data entities</returns>

			// Array to hold the data
			var _data = [];

			if (contentItem != null && contentItem._view !== null && contentItem._view._container !== null) {

				var controlId = contentItem.model.view.id;
				var itgSelector = controlId === ":Table" ? "tbody tr.itg-selected-item" : "ul li.itg-selected-item";

				// Get all the items that have our custom class signifying selection
				var selected = contentItem._view._container[0].querySelectorAll(itgSelector);

				// Go get the entity data for each selected item, add to the data array
				_.forEach(selected, function (item) {

					// For efficiency, we'll use jquery to get our entity data out of the element
					var entity = $.data(item, "__entity");
					if (entity !== undefined) {
						_data.push(entity);
					}

				});
			}

			// Return our data array
			return _data;

		},


		// ============================================================================================
		// Helper function to unselect all selected items in the list
		// ============================================================================================
		unselectAll: function (contentItem) {

			/// <summary>Unselect all items in a list/table</summary>
			/// <param name="contentItem" type="object">Screen contentItem of the the list/table</param>

			if (contentItem != null && contentItem._view !== null && contentItem._view._container !== null) {

				var controlId = contentItem.model.view.id;
				var itgSelectedClass = "itg-selected-item";
				var itgSelector = controlId === ":Table" ? "tbody tr.itg-selected-item" : "ul li.itg-selected-item";

				// Get all the items that have our selected class
				var allItems = contentItem._view._container[0].querySelectorAll(itgSelector);

				// Loop over them all and remove our class
				_.forEach(allItems, function (item) {
					if (item.classList.contains(itgSelectedClass))
						item.classList.remove(itgSelectedClass);
					if (item.classList.contains('ui-focus'))
						item.classList.remove('ui-focus');
				});

				// Nullify the selected item property
				contentItem.screen[contentItem.name].selectedItem = null;
			}
		},


		// ============================================================================================
		// Helper function to select all items in the list
		// ============================================================================================
		selectAll: function (contentItem) {

			/// <summary>Select all items in a list/table if unlimited selections are allowed</summary>
			/// <param name="contentItem" type="object">Screen contentItem of the the list/table</param>

			if (contentItem != null && contentItem._view !== null && contentItem._view._container !== null) {

				if (contentItem.totalSelectionsAllowed === undefined || contentItem.totalSelectionsAllowed === null) {

					var itgSelectedClass = "itg-selected-item";

					// What is the control type... which drives how the items are created
					var selector = contentItem.model.view.id === ":Table"
						? "tbody tr"
						: "ul li";

					// Get the listview container... then query for all our selected items
					var allItems = contentItem._view._container[0].querySelectorAll(selector);

					// Add our selected class to all the items
					_.forEach(allItems, function (item) {

						// If the item has not already been selected, add the class
						if (!item.classList.contains(itgSelectedClass))
							item.classList.add(itgSelectedClass);
					});
				}

			}
		},


		// ============================================================================================
		// Helper function to get a count of the selected items in a list
		// ============================================================================================
		selectedCount: function (contentItem) {

			/// <summary>Get a count of how many items have been selected</summary>
			/// <param name="contentItem" type="object">Screen contentItem of the the list/table</param>
			/// <returns type="integer">Count of the selected items</param>

			var _count = 0;

			if (contentItem != null && contentItem._view !== null && contentItem._view._container !== null) {

				var controlId = contentItem.model.view.id;
				var itgSelector = controlId === ":Table" ? "tbody tr.itg-selected-item" : "ul li.itg-selected-item";

				// Get the listview container... allowing independent lists on the same screen
				_count = contentItem._view._container[0].querySelectorAll(itgSelector).length;

			}

			return _count;

		}

		// ============================================================================================
		// End of:  Functionality to enhance a ListView/TileView/TableView for multiple selects
		// ============================================================================================


	};


// ============================================================================================
// itgLsCheckbox.js
// Convert a boolean to a checkbox control
// Control in the designer should be changed to a Custom Control
// Based on the work of the following folks, many thanks go out to them:
//		http://jewellambert.com/using-jquery-mobile-radio-buttons-in-lightswitch/
//		http://blogs.msdn.com/b/lightswitch/archive/2013/07/15/extending-screens-for-multi-select-in-the-lightswitch-html-client-mike-droney.aspx
//
//
// options = { 
//		text: Text you want to display to the right of the checkbox
//		textCssClass: CSS Class you want to have the text displayed as
//		cssClass: Parent CSS Class you want for the checkbox
//		onChange: UDF that the system will use when the control is clicked, changed
//			parameters: isChecked (true/false), eventObject
//	}
//
// For most of folks, using the contentItem.dataBind is a better way of working with
// value changes based on the checkbox vs the onChange.  Use the onChange when you are
// working with a Screen Property and want to update dissimilar data field.  But then again
// you can still use the contentItem.dataBind.  So the onChange may go away.
//
// ============================================================================================
// There can be a lot more error checking, but this is free... so figure it out! :)
// ============================================================================================


	itgLs.checkbox = {

		// ============================================================================================
		// Render/initialize a LS Custom Control to be a checkbox
		// ============================================================================================
		render: function (element, contentItem, options) {

			/// <summary>Render a custom control as a checkbox</summary>
			/// <param name="element" type="object">Element of the custom control</param>
			/// <param name="contentItem" type="object">Screen contentItem of the custom control</param>
			/// <param name="options" type="object">Optional<br/>
			/// Options that can be set for the checkbox:<br/>
			///  {<br/>text: Text you want to display to the right of the checkbox<br/>
			/// textCssClass: CSS class you want to have the text displayed as<br/>
			/// cssClass: Parent CSS class you want for the checkbox<br/>
			/// onChange: UDF for when the control is clicked<br/>}<br/><br/>
			/// UDF gets passed 2 parameters: isChecked and the eventObect
			///</param>


			// Make a spot for our data
			contentItem.itgLs = contentItem.itgLs || {};
			contentItem.itgLs.checkbox = contentItem.itgLs.checkbox || {};

			// Shortcut to our data in the contentItem
			var ckBox = contentItem.itgLs.checkbox;

			// Stuff the passed options into our contentItem properties
			options = options || {};
			ckBox.cssClass = options.cssClass || "itgLs-checkbox";
			ckBox.checkedCssClassForText = options.checkedCssClassForText;
			ckBox.uncheckedCssClassForText = options.uncheckedCssClassForText;
			ckBox.text = options.text;

			// Make sure we have a default change handler, we pass a boolean for checked/unchecked
			ckBox.onChange = options.onChange || function (isChecked) {
				contentItem.value = isChecked;
			};

			// Create a unique ID for our control, we don't consistently know the pageId until later, so we can't use that
			ckBox.controlId = contentItem.screen.details._modelId + "-" + contentItem.name;

			// We use the following to create our accompaning label/text, if any
			// 1. text property in passed options takes priority, pass an empty string for no label
			// 2. if no text property, look at the description field of the contentItem
			// 3. if no description text, use displayName, only if label position is None
			if (ckBox.text === undefined) {
				if (contentItem.description == undefined) {
					ckBox.text = contentItem.properties.attachedLabelPosition == "None" ? contentItem.displayName : "";
				} else {
					ckBox.text = contentItem.description;
				}
			}

			// Make sure we're all trimmed up
			ckBox.text = ckBox.text.trim();

			// Create the HTML for the Wrapper, Input and Label controls
			var $container = $('<div class="msls-clear msls-vauto">');
			var $checkBoxInput = $('<input type="checkbox" id="' + ckBox.controlId + '" />');
			var $label = $('<label for="' + ckBox.controlId + '">' + ckBox.text + '</label>');

			// Add our checkbox and label to the container, then the container to the element
			$checkBoxInput.appendTo($container);
			$label.appendTo($container);
			$container.appendTo(element);

			// Add the passed cssClass to the parent, else we use the default
			if (ckBox.cssClass) $(element).addClass(ckBox.cssClass);

			// if there is no text to display, tell the parent, make sure there is a space for the label, for sizing
			if (ckBox.text == "") {
				$label[0].innerHTML = "&nbsp;";
				$(element).addClass("noLabelCheckbox");
			}

			// Make sure our events don't bubble up
			$checkBoxInput.on('click', function (eventObj) {
				eventObj.stopPropagation();
			});
			$label.on('click', function (eventObj) {
				eventObj.stopPropagation();
			});

			// Add the UDF to the change event of the checkbox, passed values: checked or not, event obj
			$checkBoxInput.change(function (eventObj) {
				ckBox.onChange($checkBoxInput[0].checked, eventObj);
			});

			// Now lets add the container to our contentItem for the ability to reference later
			ckBox.container = $container;


			// ============================================================================================
			// Make sure our styles get applied before the page is shown
			// ============================================================================================
			$(document).one('pagebeforeshow', function () {
				itgLs.checkbox.updateTextCssClasses(contentItem);
			});


			// ============================================================================================
			// Lets do a dataBind so the UI gets updated if underlying value changes
			// ============================================================================================
			contentItem.dataBind("value", function (isChecked) {

				// Stuff our HTML input control with the new value
				$checkBoxInput[0].checked = isChecked;

				// Make sure the control has been rendered, then refresh the UI
				if (contentItem._view.isRendered) {
					$checkBoxInput.checkboxradio("refresh");
					itgLs.checkbox.updateTextCssClasses(contentItem);
				}

			});

		},


		// ============================================================================================
		// Helper function to update the classes of our label/text
		// ============================================================================================
		updateTextCssClasses: function (contentItem) {

			/// <summary>Change/Update the CSS class for the checkbox text</summary>
			/// <param name="contentItem" type="object">Screen contentItem of the custom control</param>

			// Shortcut to our data in the contentItem
			var ckBox = contentItem.itgLs.checkbox;

			// Do we have our text element, if not go find it, once
			if (ckBox.btnTextElement == undefined)
				ckBox.btnTextElement = $(ckBox.container).parent().find(".ui-btn-text");

			// Update the text css as defined previously
			if (contentItem.value) {
				$(ckBox.btnTextElement).removeClass(ckBox.uncheckedCssClassForText);
				$(ckBox.btnTextElement).addClass(ckBox.checkedCssClassForText);
			} else {
				$(ckBox.btnTextElement).removeClass(ckBox.checkedCssClassForText);
				$(ckBox.btnTextElement).addClass(ckBox.uncheckedCssClassForText);
			}

		},


		// ============================================================================================
		// Helper function to change the text of the control, optional css classes to add/remove
		// ============================================================================================
		setText: function (contentItem, text, classToAdd, classToRemove) {

			/// <summary>Change the text and CSS Class of the checkbox</summary>
			/// <param name="contentItem" type="object">Screen contentItem of the custom control</param>
			/// <param name="text" type="string">Text you want to display</param>
			/// <param name="classToAdd" type="string">Optional<br/>
			/// CSS class to add for the text</param>
			/// <param name="classToRemove" type="string">Optional<br/>
			/// CSS class to remove from the text</param>


			// Shortcut to our data
			var ckBox = contentItem.itgLs.checkbox;

			// Do we have our text element, if not go find it, once
			if (ckBox.btnTextElement == undefined)
				ckBox.btnTextElement = $(ckBox.container).parent().find(".ui-btn-text");

			if (ckBox.btnTextElement.length > 0) {
				ckBox.btnTextElement[0].innerHTML = text;

				if (classToRemove)
					$(ckBox.btnTextElement).removeClass(classToRemove);

				if (classToAdd)
					$(ckBox.btnTextElement).addClass(classToAdd);
			}
		},


		// ============================================================================================
		// Helper function to add a css class for the text of the control
		// ============================================================================================
		addCssClassForText: function (contentItem, cssClass) {

			/// <summary>Add a CSS class for the text</summary>
			/// <param name="contentItem" type="object">Screen contentItem of the custom control</param>
			/// <param name="cssClass" type="string">CSS class name</param>


			// Shortcut to our data
			var ckBox = contentItem.itgLs.checkbox;

			// Do we have our text element, if not go find it, once
			if (ckBox.btnTextElement == undefined)
				ckBox.btnTextElement = $(ckBox.container).parent().find(".ui-btn-text");

			if (ckBox.btnTextElement.length > 0)
				$(ckBox.btnTextElement).addClass(cssClass);

		},


		// ============================================================================================
		// Helper function to remove a css class for the text of the control
		// ============================================================================================
		removeCssClassForText: function (contentItem, cssClass) {

			/// <summary>Remove a CSS class from the text</summary>
			/// <param name="contentItem" type="object">Screen contentItem of the custom control</param>
			/// <param name="cssClass" type="string">CSS class name</param>

			// Shortcut to our data
			var ckBox = contentItem.itgLs.checkbox;

			// Do we have our text element, if not go find it, once
			if (ckBox.btnTextElement == undefined)
				ckBox.btnTextElement = $(ckBox.container).parent().find(".ui-btn-text");

			if (ckBox.btnTextElement.length > 0)
				$(ckBox.btnTextElement).removeClass(cssClass);

		},


		// ============================================================================================
		// Helper function to initialize a checkbox elements styles, we have to wait for all to be rendered
		// ============================================================================================
		initializeCss: function (element, css) {

			/// <summary>Initializes the checkbox styles</summary>
			/// <param name="element" type="object">Element of the checkbox custom control</param>
			/// <param name="css" type="string">CSS values (not classes) to be applied</param>


			$(document).one('pagebeforeshow', function () {
				$("div", element).css(css);
			});

		}


	};


	itgLs.layout = {

		renderHeader: function (element, contentItem, cssClass) {

			/// <summary>Render a header for a layout control</summary
			/// <param name="element" type="object">Element of the layout control</param>
			/// <param name="contentItem" type="object">Screen contentItem of the layout control</param>
			/// <param name="cssClass" type="string">Optional<br/>
			/// CSS Class for the header text<br/>
			/// Defaults to msls-control-header
			/// </param>

			cssClass = cssClass || "msls-control-header";

			var showLabel = contentItem.properties.attachedLabelPosition;

			if (showLabel !== "Hidden" && showLabel !== "None") 
				$(element).prepend($("<div style='margin-left: 10px;' class='" + cssClass + "'>" + contentItem.displayName  +"</div>"));
		}

	};


}());

