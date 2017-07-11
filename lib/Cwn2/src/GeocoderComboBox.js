/**
 *
 *
 * Class:CWN2.GoogleGeocoderCombo
 * Combo ExtJS per il geocoding google. Estende Ext.form.ComboBox
 *

 *
 */

Ext.define('CWN2.GeocoderComboBox', {

    extend: 'GeoExt.form.field.GeocoderComboBox',
    alias: 'widget.cwn2-geocoder-combobox',

    /**
     *
     * Constructor: CWN2.GoogleGeocoderCombo
     *
     * Crea una combo per il geocoding con Google.
     *
     * Parameters:
     * config - {Object} Oggetto configurazione della combo.
     *  - id - {String} Id della combo
     *  - fieldLabel - {String} Label della combo
     *  - width - {Integer} Ampiezza della combo
     *  - listeners - {Object} Oggetto contentente i listener associati alla combo
     *
     *
     */
    constructor: function(config) {
        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false , console:false  , opera:false  */
        "use strict";

        // To restrict the search to a bounding box, uncomment the following
        // line and change the viewboxlbrt parameter to a left,bottom,right,top
        // bounds in EPSG:4326:
        //url: "http://nominatim.openstreetmap.org/search?format=json&viewboxlbrt=15,47,17,49",

        // service "google" o "nominatim"
        var service = config.service;

        if (service === "google") {
            this.url = CWN2.Globals.GOOGLE_GEOCODE_PROXY;
            this.queryParam = "address";

            this.store = Ext.create("Ext.data.Store", {
                root: "results",
                fields: [
                    {name: "name", convert: function(v, rec) {
                        if (rec.raw.results && rec.raw.results[0]) {
                            return rec.raw.results[0].formatted_address;
                        } else {
                            return null;
                        }
                    }},
                    {name: "lonlat", convert: function(v, rec) {
                        if (rec.raw.results && rec.raw.results[0]) {
                            var latLng = rec.raw.results[0].geometry.location;
                            return [latLng.lng, latLng.lat];
                        } else {
                            return null;
                        }
                    }},
                    {name: "bounds", convert: function(v, rec) {
                        if (rec.raw.results && rec.raw.results[0]) {
                            var ne = rec.raw.results[0].geometry.viewport.northeast,
                                sw = rec.raw.results[0].geometry.viewport.southwest;
                            return [sw.lng, sw.lat, ne.lng, ne.lat];
                        } else {
                            return null;
                        }
                    }}
                ],
                proxy: Ext.create("Ext.data.proxy.JsonP", {
                    url: this.url,
                    type: 'JsonP',
                    callbackKey: "callback"
                })
            });
        }

        this.minChars = 4;

        config.emptyText = "Ricerca indirizzo...";

        if (config.hilite !== false) {
            var locationLayer = new OpenLayers.Layer.Vector("Location", {
                styleMap: new OpenLayers.Style({
                    externalGraphic: (config.configOptions && config.configOptions.externalGraphics) ? config.configOptions.externalGraphics : "http://geoportale.regione.liguria.it/geoviewer/stili/default/icons/marker_blue.png",
                    graphicYOffset: (config.configOptions && config.configOptions.graphicYOffset) ? config.configOptions.graphicYOffset : -27,
                    graphicHeight: (config.configOptions && config.configOptions.graphicHeight) ? config.configOptions.graphicHeight : 27,
                    graphicWidth: (config.configOptions && config.configOptions.graphicWidth) ? config.configOptions.graphicWidth : 17,
                    graphicTitle: "${name}"
                })
            });
            if (config.map) {
                config.map.addLayer(locationLayer);
            }
            this.layer = locationLayer;
        }

        // call parent constructor
        this.superclass.constructor.call(this, config);

        this.on({
            beforeselect: this.beforeSelect,
            scope: this
        });

    },

    // sulla beforeselect rimuovo eventuale feature già presente
    beforeSelect: function() {
        if (this.layer) {
            this.layer.destroyFeatures();
        }
    },

    // gestione fuori mappa
    handleSelect: function(combo, rec) {
        if (this.map.restrictedExtent) {
            var value = this.getValue();
            var lonlat;
            if (value.length === 4) {
                lonlat = OpenLayers.Bounds.fromArray(value).getCenterLonLat();
            } else {
                lonlat = OpenLayers.LonLat.fromArray(value);
            }
            if (!this.map.isPointInMaxExtent(lonlat.lat, lonlat.lon)) {
                Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Il punto è fuori dai limiti geografici della mappa"));
                return;
            }
        }
        this.superclass.handleSelect.call(this, combo, rec);
    },

    // sovrascrivo setMap
    setMap: function(map) {
        if (map instanceof GeoExt.panel.Map) {
            map = map.map;
        }
        this.map = map;
    }

});
