define([
    "mxui/widget/_WidgetBase", "mxui/dom", "dojo/dom-class", "dojo/dom-construct",
    "dojo/_base/declare"
], function(_WidgetBase, mxuiDom, dojoClass, dojoConstruct, declare) {
    "use strict";

    return declare("GeoLocationForPhoneGap.widget.GeoLocationForPhoneGap", _WidgetBase, {

        buttonLabel: "",
        showButton: true,
        triggerOnStartup: false,
        onFailureDescription: "",
        latAttr: 0.0,
        longAttr: 0.0,
        onchangemf: "",

        _result: null,
        _button: null,
        _hasStarted: false,
        _obj: null,

        // Externally executed mendix function to create widget.
        startup: function() {
            if (this._hasStarted)
                return;

            this._hasStarted = true;

            // Setup widget
            this._setupWX();

            // Create childnodes
            this._createChildnodes();

            // Setup events
            this._setupEvents();

            if(this.triggerOnStartup){
                this._fetchGEOPosition();
            }

        },

        update: function(obj, callback) {
            this._obj = obj;

            if (callback) callback();
        },

        // Setup
        _setupWX: function() {
            // Set class for domNode
            dojoClass.add(this.domNode, "wx-geolocation-container");

            // Empty domnode of this and appand new input
            dojoConstruct.empty(this.domNode);
        },

        _createChildnodes: function() {
            // Placeholder container
            if (this.showButton){
                this._button = mxuiDom.create("div", {
                    "class": "wx-mxwxgeolocation-button btn btn-primary"
                });
                if (this.buttonClass)
                    dojoClass.add(this._button, this.buttonClass);

                this._button.textContent = this.buttonLabel || "GEO Location";

                // Add to wxnode
                this.domNode.appendChild(this._button);
            }
        },

        // Internal event setup.
        _setupEvents: function() {
            if(this.showButton){   
            this.connect(this._button, "click", function(evt) {
                console.log("GEO Location start getting location.");
                this._fetchGEOPosition();
            });
         }
        },

        _fetchGEOPosition: function(){
            navigator.geolocation.getCurrentPosition(
                    this._geolocationSuccess.bind(this),
                    this._geolocationFailure.bind(this), {
                        timeout: 10000,
                        enableHighAccuracy: true
                    });
        },

        _geolocationSuccess: function(position) {
            if (this._result){
                this.domNode.removeChild(this.domNode.lastChild);
            }

            this._obj.set(this.latAttr, position.coords.latitude);
            this._obj.set(this.longAttr, position.coords.longitude);
            this._executeMicroflow();
        },

        _geolocationFailure: function(error) {
            console.log("GEO Location failure!");
            console.log(error.message);

            if (this._result) {
                this._result.textContent = this.onFailureDescription;
            } else {
                this._result = mxuiDom.create("div");
                this._result.textContent = this.onFailureDescription;
                this.domNode.appendChild(this._result);
            }
        },

        _executeMicroflow: function() {
            if (this.onchangemf && this._obj) {
                mx.data.action({
                    params: {
                        actionname: this.onchangemf,
                        applyto: "selection",
                        guids: [ this._obj.getGuid() ]
                    },
                    error: function() {},
                });
            }
        }
    });
});

// Compatibility with older mendix versions.
require([ "GeoLocationForPhoneGap/widget/GeoLocationForPhoneGap" ], function() {});
