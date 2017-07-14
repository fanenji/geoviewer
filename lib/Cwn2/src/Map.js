/**
 *
 *
 * Class: CWN2.Map
 *
 * Oggetto mappa - Eredita da OpenLayers.Map
 *
 */

CWN2.Map = OpenLayers.Class(OpenLayers.Map, {


    /**
     * Property: mapOptions
     * {Object} Opzioni mappa - Oggetto configuration.application.mapOptions
     */
    mapOptions: null,

    // Nome del base layer
    baseLayerName: null,

    // layer manager
    layerManager: null,

    // feature manager
    featureManager: null,

    previousExtent: null,

    // livello massimo di zoom ammesso per la mappa
    maxZoomLevel: null,

    appId: null,

    /*
     * Constructor: CWN2.Map
     *
     * Parameters:

     */
    initialize: function() {
        /*global CWN2:false, window:false, OpenLayers:false */
        "use strict";
        CWN2.Util.log("CWN2.Map");

        var mapOptions = CWN2.app.configuration.application.mapOptions;

        this.mapOptions = {};
        this.mapOptions.projection = mapOptions.projection;
        this.mapOptions.displayProjection = (mapOptions.displayProjection) ? new OpenLayers.Projection(mapOptions.displayProjection) : new OpenLayers.Projection(this.mapOptions.projection);
        this.mapOptions.units = mapOptions.units || "m";
        this.mapOptions.maxScale = mapOptions.maxScale;

        //ATTENZIONE non impostare minScale: problemi a layer TMS MapProxy
        this.resolutions = this.calculateResolutions(null, this.mapOptions.maxScale, this.mapOptions.units);

        // imposto extent
        this.setExtent(mapOptions);

        // azzero i controlli della mappa OL - altrimenti fa vedere il controllo PanZoom sempre
        this.mapOptions.controls = [];

        OpenLayers.Map.prototype.initialize.apply(this, [this.mapOptions]);

        this.load();

    },

    setExtent: function(configMapOptions) {

        /*global CWN2:false, window:false, OpenLayers:false */
        "use strict";

        this.mapOptions.maxExtent = OpenLayers.Bounds.fromString("-20037508, -20037508, 20037508, 20037508.34");

        if (configMapOptions.restrictedExtent) {
            this.mapOptions.restrictedExtent = new OpenLayers.Bounds.fromString(configMapOptions.restrictedExtent);
        }

        this.setMapOptionsInitialExtent(configMapOptions);

    },

    setMapOptionsInitialExtent: function(configMapOptions) {
        // Se definito in QueryString lo imposto altrimenti se definito in config lo imposto
        if (CWN2.Util.getUrlParam("initialExtent")) {
            this.mapOptions.initialExtent = this.calculateInitialExtent(this.getInitialExtentFromUrlParam());
        } else if (configMapOptions.initialExtent) {
            this.mapOptions.initialExtent = this.calculateInitialExtent(configMapOptions.initialExtent);
        }
    },

    // deve essere impostato nella forma proj,x1,y1,x2,y2
    // esempio initialExtent=EPSG:3857,955508,5496093,1065424,5576964
    getInitialExtentFromUrlParam: function() {
        var initialExtentParam = CWN2.Util.getUrlParam("initialExtent").split(",");
        var fromPrj = initialExtentParam.splice(0, 1)[0];
        var boundsStr = initialExtentParam.join(",");
        if (this.mapOptions.projection !== fromPrj) {
            boundsStr = CWN2.Util.transformStrBounds(fromPrj, this.mapOptions.projection, boundsStr);
        }
        return boundsStr;
    },

    calculateInitialExtent: function(boundsStr) {
        var bound = new OpenLayers.Bounds.fromString(boundsStr);

        if (this.restrictedExtent && !this.restrictedExtent.containsBounds(bound)) {
            var exception = {
                name: "BadInitialExtent",
                message: "CWN2.Map: initialExtent deve essere compreso in restrictedExtent",
                level: 0
            };
            CWN2.Util.handleException(exception);
            return this.maxExtent;
        } else {
            return bound;
        }

    },

    load: function() {
        var mapOptions = CWN2.app.configuration.application.mapOptions;

        this.layerManager = new CWN2.LayerManager();
        this.layerManager.map = this;

        // Carico il layer base fisso
        this.loadLayer({
                type: 'base_layer',
                maxScale: mapOptions.maxScale,
                units: this.units
            }
        );

        // Carico i baseLayers
        this.loadLayers(this.layerManager.getBaseLayersConfig());

        // Carico i layers
        this.loadLayers(this.layerManager.getLayersConfig());

        // Metto i base Layer in basso
        this.setBaseLayerIndex();

        // Inizializzo i controlli per la mappa OL
        this.initControls(mapOptions);

        this.events.register("moveend", null, function() {
            if (this.restrictedExtent && this.zoom < this.getZoomForExtent(this.restrictedExtent)) {
                this.zoomToExtent(this.restrictedExtent);
            }
            if (this.maxZoomLevel && this.zoom > this.maxZoomLevel) {
                this.zoomTo(this.maxZoomLevel);
            }
            this.layerManager.updateInRange();

        });
        this.events.register("zoomend", null, function() {
            // distruggo eventuali popup
            if (this.popups && this.popups.length > 0) {
                for (var i = 0; i < this.popups.length; i++) {
                    var popup = this.popups[i];
                    popup.feature.popup = null;
                    popup.destroy();
                }
            }
        });

        // Disabilito perchè non funziona con OSM, non usa la cache GWC e la combo delle scale è incompatibile
        //this.setFractionalZoom();
    },


    /**
     *
     * Function: setFractionalZoom
     *
     * Imposta fractionalZoom della mappa a true se non ci sono layer google
     *
     */
    setFractionalZoom: function() {
        CWN2.Util.log("CWN2.Map.setFractionalZoom");

        var isNotFractionalLayer = false;

        Ext.each(this.layerManager.getBaseLayersConfig(), function(layer) {
            if (layer.type.indexOf("google_") !== -1 || layer.type.indexOf("TMS") !== -1) {
                isNotFractionalLayer = true;
                return false;
            }
        });
        Ext.each(this.layerManager.getLayersConfig(), function(layer) {
            if (layer.type.indexOf("google_") !== -1 || layer.type.indexOf("TMS") !== -1) {
                isNotFractionalLayer = true;
                return false;
            }
        });
        if (!isNotFractionalLayer) {
            this.fractionalZoom = true;
        }
    },

    /**
     *
     * Function: setBaseLayerIndex
     *
     * Imposta gli indici dei base layer
     *
     *
     */

    setBaseLayerIndex: function() {
        CWN2.Util.log("CWN2.Map.setBaseLayerIndex");
        var baseLayers = this.layerManager.getBaseLayersConfig();
        for (var i = 0; i < baseLayers.length; i++) {
            this.setLayerIndex(this.getLayerByName(baseLayers[i].name), 0)
        }
    },

    /**
     *
     * Function: loadLayers
     *
     * Aggiunge un array di livelli alla mappa
     *
     *
     * Parameters:
     * layersconfig - {Array} Array di oggetti configurazione dei layer
     *
     */

    loadLayers: function(layersConfig) {
        CWN2.Util.log("CWN2.Map.loadLayers");

        // aggiungo i layers alla mappa OL
        if (layersConfig) {
            for (var i = 0; i < layersConfig.length; i++) {
                this.loadLayer(layersConfig[i]);
            }
        }

    },

    /**
     *
     * Function: loadLayer
     *
     * Aggiunge un livello alla mappa
     *
     * Parameters:
     * layerConfig - {Object} Oggetto configurazione del layer
     *
     */

    loadLayer: function(layerConfig) {
        CWN2.Util.log("CWN2.Map.loadLayer");

        var layer;

        // creo il layer OL e lo aggiungo alla mappa
        try {
            layer = CWN2.LayerFactory.create(layerConfig, this);
        }
        catch (exception) {
            CWN2.Util.handleException(exception);
        }

        if (layer) {
            this.addLayer(layer);
            if (layerConfig.order || layerConfig.order === 0) {
                this.setLayerIndex(layer, layerConfig.order)
            }
            // Imposto la visibilità del layer
            layer.setVisibility(layerConfig.visible);
            // Se il layer è vettoriale registro l'evento loadend
            // Quando il layer è caricato imposto l'attributo loadend a true;
            // Serve per gestire l'hilite delle features all'avvio della applicazione
            if (layer.CLASS_NAME === "OpenLayers.Layer.Vector") {
                layer.loadend = false;
                layer.events.on({
                    "loadend": function() {
                        layer.loadend = true;
                    },
                    scope: layer
                });
            }
            return layer;
        }
    },

    /**
     *
     * Function: initControls
     *
     * Inizializza i controlli OpenLayers della mappa.
     *
     */

    initControls: function(configMapOptions) {
        // inizializzo i controlli per la selezione delle feature dei livelli vettoriali
        this.featureManager = new CWN2.FeatureManager(this);

        // carico i controlli opzionali definiti in configurazione
        this.loadControls(configMapOptions.olControls);

        // Carico i controlli base
        // Se impostato noBaseControls a true non carica i controlli di base (mappa bloccata)
        if (!this.mapOptions.noBaseControls) {
            this.loadControls(CWN2.Globals.MAP_BASE_CONTROL_CONFIG);
        }

        if (configMapOptions.disableScrollWheel) {
            var navControls = this.getControlsByClass("OpenLayers.Control.Navigation");
            for (var i = 0; i < navControls.length; ++i) {
                navControls[i].disableZoomWheel();
            }
        }

    },

    /**
     *
     * Function: loadControls
     *
     * Carica i controlli OL sulla mappa.
     *
     * Parameters:
     * controlsConfig - {Array} cArray oggetti configurazione dei controlli
     *
     */
    loadControls: function(controls) {
        CWN2.Util.log("CWN2.Map.loadControls");

        // aggiungo i controlli alla mappa OL
        if (controls) {
            for (var i = 0; i < controls.length; i++) {
                this.loadControl(controls[i]);
            }
        }
    },

    /**
     *
     * Function: loadControl
     *
     * Carica un controllo OL sulla mappa.
     *
     * Parameters:
     * controlConfig - {Object} Oggetto di configurazione del controllo
     *
     */
    loadControl: function(controlConfig) {
        CWN2.Util.log("CWN2.Map.loadControl");
        var olControl;
        // creo il controllo OL e lo aggiungo alla mappa
        try {
            olControl = new CWN2.Control[controlConfig.name](controlConfig.options);
        } catch (ex) {
            try {
                olControl = new OpenLayers.Control[controlConfig.name](controlConfig.options);
            } catch (ex) {
                CWN2.Util.handleException({
                    name: "BadOLControl",
                    message: "CWN2.Map.createControl: " + controlConfig.name + " non implementato",
                    level: 0
                });
                return null;
            }
            this.addControl(olControl);
            return olControl;
        }
    },

    /**
     * Function: getLayerByName
     *
     * Ritorna il layer OL con un certo nome
     *
     * Parameters:
     * name - {String} Name of the layer
     *
     * Returns:
     * layer - {OpenLayers.Layer}
     *
     */
    getLayerByName: function(name) {
        var layers = this.getLayersByName(name);
        if (layers.length > 0) {
            return layers[0];
        } else {
            return null;
        }
    },

    /**
     * Function: removeLayerByName
     *
     * Rimuove un layer dalla mappa
     *
     * Parameters:
     * name - {string} Name of the layer
     *
     */
    removeLayerByName: function(name) {
        var layer = this.getLayerByName(name);
        if (layer) {
            this.removeLayer(layer);
        }
    },

    /**
     * Function: zoomToStringExtent
     *
     * Effettua lo zoom su un bound, eventualmente converte il bound nel sistema di coordinate della mappa
     *
     * Parameters:
     * boundsString - {string} Bound in formato "x1,y1,x2,y2"
     * epsgCode - {string} Codice EPSG in formato "EPSG:XXXX"
     *
     */
    zoomToStringExtent: function(boundsString, epsgCode) {
        var boundStr = boundsString;

        if ((epsgCode) && (this.projection !== epsgCode)) {
            boundStr = CWN2.Util.transformStrBounds(epsgCode, this.projection, boundsString);
        }
        var bounds = new OpenLayers.Bounds.fromString(boundStr);

        this.zoomToExtent(bounds);
    },

    /**
     * Function: zoomToInitialExtent
     *
     * Effettua lo zoom sull'initialExtent
     *
     */
    zoomToInitialExtent: function() {
        // devo richiamare due volte altrimenti non fa zoom ???
        if (this.initialExtent) {
            this.zoomToExtent(this.initialExtent);
            this.zoomToExtent(this.initialExtent);
        }

    },

    /**
     * Function: zoomToFeatures
     *
     * Effettua uno zoom sulle feature
     *
     * Parameters:
     * features - {Array} Array di features openlayer
     * zoomLevel - {Number} Livello di zoom.
     *
     */
    zoomToFeatures: function(features, zoomLevel) {
        var numFeatures,
            i,
            bounds;

        if (features && features.length) {
            numFeatures = features.length;
        }

        if (numFeatures) {
            bounds = features[0].geometry.getBounds().clone();
            for (i = 1; i < numFeatures; i++) {
                bounds.extend(features[i].geometry.getBounds());
            }

            this.zoomToExtent(bounds, false);

            // se zoomlevel è negativo faccio zoom all'indietro
            if (zoomLevel && zoomLevel < 0) {
                this.zoomTo(this.zoom + zoomLevel)
            } else {
                if (zoomLevel && this.zoom > zoomLevel) {
                    this.zoomTo(zoomLevel);
                }
            }
        }
    },

    /**
     * Function: zoomToLonlat
     *
     * Effettua uno zoom su un punto ad un determinato zoomLevel
     *
     * Parameters:
     * xy - {lonlat} oggetto lonlat openlayer
     * zoom - {Number} Livello di zoom.
     *
     */
    zoomToLonlat: function(lonlat, zoom, epsg) {
        var lonlat2 = Ext.clone(lonlat);
        if (epsg && epsg !== this.projection) {
            lonlat2.transform(new OpenLayers.Projection(epsg), new OpenLayers.Projection(this.projection));
        }
        this.setCenter(lonlat2, zoom);
    },

    /**
     *
     * Function: isPointInMaxExtent
     *
     * Controlla se un punto ricade nel maxExtent della mappa
     *
     * Parameters:
     * lat - {number} Latitudine / Coordinata Y
     * lon - {number} Longitudine / Coordinata X
     * epsg - {string} Codice epsg
     *
     * Returns:
     * {boolean} true/false
     *
     */
    isPointInMaxExtent: function(lat, lon, epsg) {
        if (!this.restrictedExtent) {
            return true;
        }

        var pointEpsg = epsg || "EPSG:4326";

        var point = new OpenLayers.LonLat(lon, lat);
        if (this.projection !== pointEpsg) {
            point.transform(
                new OpenLayers.Projection(pointEpsg),
                this.getProjectionObject()
            );
        }

        return this.restrictedExtent.containsLonLat(point)
    },

    /**
     *
     * Function: setBaseLayerOnMap
     *
     * Imposta il layer base su una mappa (metodo statico)
     *
     * Parameters:
     * name - {String} Nome del layer
     *
     */
    setBaseLayerOnMap: function(name) {
        var me = this;
        this.baseLayerName = name;
        Ext.each(this.layerManager.getBaseLayersConfig(), function(layerConfig, index) {
            me.layerManager.setLayerVisible(layerConfig.name, layerConfig.name === name);
        });
    },

    calculateResolutions: function(minScale, maxScale, units) {
        var resolutions = CWN2.Globals.BASE_RESOLUTIONS;
        if (maxScale) {
            var maxResolution = OpenLayers.Util.getResolutionFromScale(maxScale, units || "m");
            resolutions = resolutions.slice(0, getResolutionIndex(maxResolution));
        }
        if (minScale) {
            var minResolution = OpenLayers.Util.getResolutionFromScale(minScale, units || "m");
            resolutions = resolutions.slice(getResolutionIndex(minResolution), resolutions.length);
        }
        return resolutions;

        function getResolutionIndex(resolution) {
            var ind;
            Ext.each(CWN2.Globals.BASE_RESOLUTIONS, function(res, index) {
                if (res < resolution) {
                    ind = index;
                    return false;
                }
            });
            return ind;
        }
    },

    CLASS_NAME: "CWN2.Map"
});




