Ext.define('CWN2.button.RoutePlanner', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-routeplanner',

    constructor: function(config) {
        this.config = config;

        var btnOptions = config.options,
            id = "routeplanner";

        this.superclass.constructor.call(this, {
            tooltip: CWN2.I18n.get("Calcolo Percorsi"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 20,
            pressed: false,
            id: id
        });

    }
});

Ext.define('CWN2.button.RoutePlanner.Store', {
    extend: 'Ext.data.Store',
    fields: [
        {name: "id"},
        {name: "instructions"},
        {name: "distance"},
        {name: "duration"}
    ]
});

Ext.define('CWN2.button.RoutePlanner.OutputPanel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cwn2-routeplanner-outputpanel',
    title: "",
    viewConfig: {
        forceFit: true
    },
    split: true,
    hideHeaders: true,
    autoScroll: true,
    width: 220,
    region: "center",
    visible: false,
    frame: true,
    store: Ext.create('CWN2.button.RoutePlanner.Store'),
    columns: [
        {
            id: "instructions",
            dataIndex: "instructions",
            renderer: function(legend, metaData, record) {
                if (record.data.instructions) {
                    return "<div style='white-space:normal'>" + record.data.instructions + " </div>";
                }
                return null;
            },
            width: 250
        },
        {
            id: "distance",
            dataIndex: "distance",
            renderer: function(legend, metaData, record) {
                if (record.data.distance) {
                    return "<div>" + record.data.distance + " </div>";
                }
                return null;
            },
            width: 40
        },
        {
            id: "duration",
            dataIndex: "duration",
            renderer: function(legend, metaData, record) {
                if (record.data.duration) {
                    return "<div>" + record.data.duration + " </div>";
                }
                return null;
            },
            width: 30
        }
    ],
    tbar: [
        new Ext.form.field.Text(
            {
                id: "cwn2-routeplanner-output-panel-title",
                width: 270,
                readOnly: true
            }
        ),
        "->",
        {
            text: "Zoom",
            action: "routeplanner-zoom"
        }
    ]
});

Ext.define('CWN2.button.RoutePlanner.ModeComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.cwn2-routeplanner-modecombo',
    store: [
        ["DRIVING", CWN2.I18n.get("In auto")],
        ["WALKING", CWN2.I18n.get("A piedi")]
    ],
    autoSelect: true,
    fieldLabel: CWN2.I18n.get("Mezzo"),
    width: 160,
    labelWidth: 35,
    displayField: "descrizione",
    valueField: "codice",
    typeAhead: true,
    mode: "local",
    forceSelection: true,
    triggerAction: "all",
    value: "DRIVING",
    selectOnFocus: true
});

Ext.define('CWN2.button.RoutePlanner.InputPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.cwn2-routeplanner-inputpanel',
    title: "",
    method: "GET",
    defaults: {
        labelWidth: 15,
        labelPad: 10
    },
    bodyStyle: "padding:5px 5px 0",
    region: "north",
    height: 130,

    constructor: function() {

        this.items = [
            {
                xtype: "container",
                border: false,
                layout: "column",
                anchor: "100%",
                labelWidth: 15,
                items: [
                    {
                        xtype: "cwn2-geocoder-combobox",
                        id: "cwn2-routeplanner-start-combo",
                        width: 300,
                        fieldLabel: "A",
                        labelWidth: 35,
                        map: CWN2.app.map,
                        service: "google"

                    },
                    {
                        xtype: "component",
                        width: 5,
                        html: "&nbsp;"
                    },
                    {
                        xtype: 'button',
                        action: 'routeplanner-start',
                        layout: "form",
                        iconCls: "routeplanner-map",
                        tooltip: CWN2.I18n.get("Seleziona punto di partenza sulla mappa"),
                        enableToggle: true,
                        toggleGroup: "mapInteractToggleGroup"
                    }
                ]
            },
            {
                xtype: "container",
                border: false,
                layout: "column",
                anchor: "100%",
                items: [
                    {
                        xtype: "cwn2-geocoder-combobox",
                        id: "cwn2-routeplanner-end-combo",
                        width: 300,
                        fieldLabel: "B",
                        labelWidth: 35,
                        map: CWN2.app.map,
                        service: "google"

                    },
                    {
                        xtype: "component",
                        width: 5,
                        html: "&nbsp;"
                    },
                    {
                        xtype: 'button',
                        action: 'routeplanner-end',
                        layout: "form",
                        iconCls: "routeplanner-map",
                        tooltip: CWN2.I18n.get("Seleziona punto di arrivo sulla mappa"),
                        enableToggle: true,
                        toggleGroup: "mapInteractToggleGroup"
                    }
                ]
            },
            {
                xtype: "container",
                border: false,
                layout: "column",
                anchor: "100%",
                items: [
                    {
                        xtype: 'cwn2-routeplanner-modecombo'
                    }
                    ,
                    {
                        xtype: "component",
                        width: 145,
                        html: "&nbsp;"
                    }
                ]
            }
        ];

        this.buttons = [
            {
                text: CWN2.I18n.get("Calcola"),
                action: "routeplanner-submit"
            },
            {
                text: CWN2.I18n.get("Reset"),
                action: "routeplanner-reset"
            }
        ];

        this.superclass.constructor.call(this);

    }
});

Ext.define('CWN2.button.RoutePlanner.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-routeplanner-win',
    title: CWN2.I18n.get("Calcolo Percorsi"),
    frame: true,
    width: 370,
    height: 160,
    resizable: false,
    layout: "border",
    closeAction: "hide",
    items: [
        {
            xtype: 'cwn2-routeplanner-inputpanel'                    },
        {
            xtype: 'cwn2-routeplanner-outputpanel'
        }
    ]
});

// CONTROLLER
Ext.define('CWN2.controller.button.routeplanner', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.RoutePlanner',
        'CWN2.button.RoutePlanner.Window',
        'CWN2.button.RoutePlanner.InputPanel',
        'CWN2.button.RoutePlanner.OutputPanel'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-routeplanner'
        },
        {
            ref: 'win',
            selector: 'cwn2-routeplanner-win'
        },
        {
            ref: 'inputPanel',
            selector: 'cwn2-routeplanner-inputpanel'
        },
        {
            ref: 'outputPanel',
            selector: 'cwn2-routeplanner-outputpanel'
        },
        {
            ref: 'outputPanelTitle',
            selector: "#cwn2-routeplanner-output-panel-title"
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.routeplanner: init');

        this.control({
            'cwn2-button-routeplanner': {
                click: this.onClick
            },
            'cwn2-routeplanner-inputpanel': {
                render: this.onRenderInputPanel
            },
            '#cwn2-routeplanner-start-combo': {
                select: this.onStartComboSelect
            },
            '#cwn2-routeplanner-end-combo': {
                select: this.onEndComboSelect
            },
            'cwn2-routeplanner-modecombo': {
                select: this.onModeComboSelect
            },
            'button[action=routeplanner-start]': {
                click: this.onStartButtonClick
            },
            'button[action=routeplanner-end]': {
                click: this.onEndButtonClick
            },
            'button[action=routeplanner-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=routeplanner-reset]': {
                click: this.onResetButtonClick
            },
            'button[action=routeplanner-zoom]': {
                click: this.onZoomButtonClick
            },
            'cwn2-routeplanner-outputpanel': {
                select: this.onOutputPanelSelect,
                itemmouseenter: this.onItemMouseEnter,
                itemmouseleave: this.onItemMouseLeave
            }
        });

        this.initRouteMngr();

    },

    onItemMouseEnter: function(elem, record) {
        this.hiliteStep(record, false);
    },

    onItemMouseLeave: function(elem, record) {
        this.hiliteStep(record, true);
    },

    hiliteStep: function hiliteStep(record, unSelect) {
        var id = record.data.id;

        var layer = CWN2.app.map.getLayerByName("routingLayer");
        var foundFeatures = layer.getFeaturesByAttribute("id", id);
        if (foundFeatures.length > 0) {
            var feature = foundFeatures[0];

            // imposto lo stile
            if (unSelect) {
                if (feature.isSelected()) {
                    feature.renderStyle = "select";
                } else {
                    feature.renderStyle = "default";
                }
            } else {
                feature.renderStyle = "hover";
            }
            layer.drawFeature(feature, feature.renderStyle);
            // disegno la popup
            this.showStepPopup(feature);
        }
    },

    onRenderInputPanel: function() {
        var me = this;
        me.clickMapCtrl = new CWN2.Control.GetMapCoordinatesOnClick(function(mapCoord, displayCoord, wgs84Coord, options) {
            var decimalPlaces = 6;
            if (options.type === "start") {
                Ext.ComponentQuery.query("#cwn2-routeplanner-start-combo")[0].setValue("Coordinate: " + displayCoord.lon.toFixed(decimalPlaces) + " , " + displayCoord.lat.toFixed(decimalPlaces));
                me.setOrigin(null, wgs84Coord.lat, wgs84Coord.lon);
            } else {
                Ext.ComponentQuery.query("#cwn2-routeplanner-end-combo")[0].setValue("Coordinate: " + displayCoord.lon.toFixed(decimalPlaces) + " , " + displayCoord.lat.toFixed(decimalPlaces));
                me.setDestination(null, wgs84Coord.lat, wgs84Coord.lon);
            }
        });
        CWN2.app.map.addControl(this.clickMapCtrl);
    },

    onClick: function() {
        var mapPanel = CWN2.app.layout.mapPanel,
            win = this.getWin(),
            button = this.getButton(),
            me = this;

        if (!win) {
            win = Ext.create("CWN2.button.RoutePlanner.Window", {});
        }

        this.showHideWin(win, mapPanel);

    },

    showHideWin: function(win, mapPanel) {
        if (!win.isVisible()) {
            win.show();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        } else {
            win.hide();
        }
    },

    onStartComboSelect: function(combo, records) {
        var address,
            lat,
            lon,
            record = records[0];
        try {
            address = record.data.name;
            lat = record.data.lonlat[1];
            lon = record.data.lonlat[0];
            // controllo che il punto ricada dentro il maxExtent
            if (!CWN2.app.map.isPointInMaxExtent(lat, lon)) {
                Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Il punto è fuori dai limiti geografici della mappa"));
                return;
            }
            this.setOrigin(address, lat, lon);
            Ext.ComponentQuery.query("#cwn2-routeplanner-end-combo")[0].focus("", 100);
        } catch (ex) {
            if (ex.name === "PointOutOfMaxExtent") {
                Ext.MessageBox.alert(
                    CWN2.I18n.get("Attenzione"),
                    CWN2.I18n.get("Il punto e' fuori dai limiti geografici della mappa"),
                    function() {
                        combo.setValue("");
                        combo.focus("", 100);
                    }
                );
            }
        }
    },

    onEndComboSelect: function(combo, records) {
        var address,
            lat,
            lon,
            record = records[0];
        try {
            address = record.data.name;
            lat = record.data.lonlat[1];
            lon = record.data.lonlat[0];
            if (!CWN2.app.map.isPointInMaxExtent(lat, lon)) {
                Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Il punto è fuori dai limiti geografici della mappa"));
                return;
            }
            this.setDestination(address, lat, lon);
        } catch (ex) {
            if (ex.name === "PointOutOfMaxExtent") {
                Ext.MessageBox.alert(
                    "Attenzione",
                    "Il punto e' fuori dai limiti geografici della mappa",
                    function() {
                        combo.setValue("");
                        combo.focus("", 100);
                    }
                );
            }
        }
    },

    onModeComboSelect: function(combo, record) {
        this.setTravelMode(record[0].data.field1);
    },

    onStartButtonClick: function(combo, record) {
        this.clickMapCtrl.activate({type: "start"});
    },

    onEndButtonClick: function(combo, record) {
        this.clickMapCtrl.activate({type: "end"});
    },

    onSubmitButtonClick: function() {

        // registro i callback per la select delle feature OL
        this.registerCallbacks();

        try {
            this.calculate(showResult);
        } catch (exception) {
            CWN2.Util.handleException(exception);
        }

        var me = this;

        function showResult(result) {
            var map = CWN2.app.map,
                outputPanel = me.getOutputPanel();

            // disegna il percorso sulla mappa
            me.drawRouteOnMap(map, result);
            // imposta il titolo
            me.getOutputPanelTitle().setValue(CWN2.I18n.get("Distanza totale") + ": " + result.distance + " - " + CWN2.I18n.get("Durata totale") + ": " + result.duration);
            // aggiorna lo store
            var store = outputPanel.store;
            store.clearData();
            var len = result.steps.length;
            for (var i = 0; i < len; i++) {
                var rec = {
                    "id": i,
                    "instructions": result.steps[i].instructions,
                    "distance": result.steps[i].distance.text,
                    "duration": result.steps[i].duration.text
                };
                store.add(rec);
            }
            // aggiorna la finestra
            outputPanel.setVisible(true);
            me.getWin().setHeight(500);
        }
    },

    onResetButtonClick: function() {
        var outputPanel = this.getOutputPanel();
        Ext.ComponentQuery.query("#cwn2-routeplanner-start-combo")[0].setValue("");
        Ext.ComponentQuery.query("#cwn2-routeplanner-end-combo")[0].setValue("");
        this.reset();
        this.getOutputPanelTitle().setValue(null);
        outputPanel.store.clearData();
        outputPanel.setVisible(false);
        this.getWin().setHeight(160);
    },

    onZoomButtonClick: function() {
        CWN2.app.map.zoomToStringExtent(this.getResult().bounds, "EPSG:4326");
    },

    onOutputPanelSelect: function(sm, record, rowIdx) {
        if (CWN2.app.map.getLayerByName("routingLayer") && CWN2.app.map.getLayerByName("routingLayer").visibility) {
            try {
                CWN2.FeatureSelecter.selectFeature({
                    "layer": CWN2.app.map.getLayerByName("routingLayer"),
                    "attrName": "id",
                    "item": record.data.id,
                    "options": {
                        "zoom": true,
                        "maxZoomLevel": 15,
                        "hiliteOnly": false
                    }
                });
            } catch (ex) {
                CWN2.Util.handleException(ex);
            }
        }
    },

    showStepPopup: function(feature) {
        var popup;

        if (feature.popup) {
            popup = feature.popup;
            // rimuovo la popup dalla mappa
            CWN2.app.map.removePopup(popup);
            feature.popup = null;
        } else {
            popup = new OpenLayers.Popup.Anchored(
                "stepPopup",
                feature.geometry.getBounds().getCenterLonLat(),
                new OpenLayers.Size(200, 60),
                feature.attributes.label,
                null,
                false,
                null
            );
            feature.popup = popup;
            popup.feature = feature;
            popup.panMapIfOutOfView = false;
            // imposto lo sfondo delle popup
            popup.backgroundColor = "#FFFFFF";
            popup.opacity = 0.9;
            // aggiungo la popup alla mappa
            CWN2.app.map.addPopup(popup);
        }

    },

    registerCallbacks: function() {
        var me = this;

        CWN2.app.map.featureManager.registerCallback(
            "onFeatureSelect",
            function(feature) {
                if ((feature.attributes.type === "step") || (feature.attributes.type === "start")) {
                    var grid = me.getOutputPanel();
                    grid.getView().getSelectionModel().suspendEvents();
                    grid.getView().select(feature.attributes.id);
                    grid.getView().getSelectionModel().resumeEvents();
                    grid.getView().focusRow(feature.attributes.id);
                    CWN2.app.map.zoomToFeatures([feature], 15);
                }
            }
        );

        CWN2.app.map.featureManager.registerCallback(
            "onFeatureUnselect",
            function(feature) {
                if ((feature.attributes.type === "step") || (feature.attributes.type === "start")) {
                    var selectedRow = me.getOutputPanel().getView().getSelectionModel().getSelection()[0];
                    if (selectedRow) {
                        me.getOutputPanel().getView().deselect(feature.attributes.id);
                    }
                }
            }
        );

        CWN2.app.map.featureManager.registerCallback(
            "onFeatureOver",
            function(feature) {
                if (feature.attributes.type === "step") {
                    me.showStepPopup(feature);
                }
            }
        );

        CWN2.app.map.featureManager.registerCallback(
            "onFeatureOut",
            function(feature) {
                if (feature.attributes.type === "step") {
                    me.showStepPopup(feature);
                }
            }
        );
    },

    initRouteMngr: function() {

        if (typeof google !== 'undefined') {
            this.travelMode = google.maps.TravelMode.DRIVING;
            this.directionsDisplay = new google.maps.DirectionsRenderer({preserveViewport: true});
        }
    },

    origin: {
        address: null,
        lat: null,
        lon: null,
        latLng: null
    },
    destination: {
        address: null,
        lat: null,
        lon: null,
        latLng: null
    },

    routingLayer: null,

    result: {},

    travelMode: null,

    directionsDisplay: null,

    setOrigin: function(address, lat, lon) {
        this.origin.address = address;
        this.origin.lat = lat;
        this.origin.lon = lon;
        if (lat && lon) {
            this.origin.latLng = new google.maps.LatLng(lat, lon);
        } else {
            this.origin.latLng = null;
        }
    },

    setDestination: function(address, lat, lon) {
        this.destination.address = address;
        this.destination.lat = lat;
        this.destination.lon = lon;
        if (lat && lon) {
            this.destination.latLng = new google.maps.LatLng(lat, lon);
        } else {
            this.destination.latLng = null;
        }
    },

    setTravelMode: function(mode) {
        this.travelMode = mode;
    },

    calculate: function(callback) {
        var me = this;
        var directionsRequest = getRequestParams(),
            directionsService = new google.maps.DirectionsService();

        CWN2.Util.assert(directionsRequest.origin,
            {
                name: "MissingOrigin",
                message: "Partenza deve essere indicata",
                level: 1
            }
        );

        CWN2.Util.assert(directionsRequest.destination,
            {
                name: "MissingDestination",
                message: "Destinazione deve essere indicata",
                level: 1
            }
        );

        directionsService.route(directionsRequest, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                me.result = processResults(result, callback);
            } else {
                var message = "CWN2.routingMngr.calculate: Servizio Google ha ritornato un errore./n";
                switch (status) {
                    case google.maps.DirectionsStatus.NOT_FOUND:
                        message += "Origine o destinazione non trovati";
                        break;
                    case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
                        message += "Superato il numero di richieste permesse";
                        break;
                    case google.maps.DirectionsStatus.REQUEST_DENIED:
                        message += "Richiesta rifiutata";
                        break;
                    case google.maps.DirectionsStatus.UNKNOWN_ERROR:
                        message += "Errore del server Google. Riprova successivamente";
                        break;
                    case google.maps.DirectionsStatus.ZERO_RESULTS:
                        message += "Non è stato possibile trovare un percorso dall'origine alla destinazione";
                        break;
                }
                throw {
                    name: "GoogleDirectionsError",
                    message: message,
                    level: 1
                };
            }
        });

        function processResults(directionsResult, callBack) {

            // mappa google
            var map = CWN2.app.map;
            //imposto stradario come baseLayer
            map.layerManager.addBaseLayers([
                {
                    "type": "google_roadmap",
                    "name": "google_roadmap",
                    "legend": {
                        "label": "Google Stradario",
                        "icon": "http://geoportale.regione.liguria.it/geoviewer/img/legend/google.png"
                    },
                    "visible": false,
                    "isBaseLayer": false
                }
            ]);

            var gMap = OpenLayers.Layer.Google.cache[map.id].mapObject;

            // disegno il percorso sulla mappa google
            try {
                me.directionsDisplay.setMap(gMap);
                me.directionsDisplay.setDirections(directionsResult);
            } catch (ex) {
            }

            // imposta l'oggetto result
            var result = setResult(directionsResult);

            // Chiama la funzione di callback
            if (callBack) {
                callBack(result);
            }

            return result;

            function setResult(directionsResult) {
                var i,
                    len,
                    result = {};

                result.origin = directionsResult.routes[0].legs[0].start_address;
                result.destination = directionsResult.routes[0].legs[0].end_address;
                result.copyrights = directionsResult.routes[0].copyrights;
                result.bounds = decodeGoogleBounds(directionsResult.routes[0].bounds);
                result.overview_path = directionsResult.routes[0].overview_path;
                result.distance = directionsResult.routes[0].legs[0].distance.text;
                result.duration = directionsResult.routes[0].legs[0].duration.text;
                result.steps = directionsResult.routes[0].legs[0].steps;

                // imposto l'id delle tappe
                len = result.steps.length;
                for (i = 0; i < len; i++) {
                    result.steps[i].id = i;
                }

                return result;

                // converte un oggetto bounds Google in una stringa
                function decodeGoogleBounds(googleBounds) {
                    return me.extractCoordinates(googleBounds.getSouthWest()) + "," + me.extractCoordinates(googleBounds.getNorthEast());
                }
            }
        }

        function getRequestParams() {
            var start = (me.origin.address) ? me.origin.address : me.origin.latLng,
                end = (me.destination.address) ? me.destination.address : me.destination.latLng,
                unitSystem = google.maps.UnitSystem.METRIC,
                region = "it";

            return {
                origin: start,
                destination: end,
                travelMode: me.travelMode,
                unitSystem: unitSystem,
                region: region
            };
        }
    },

    drawRouteOnMap: function(map, result) {
        var me = this;
        var classes,
            baseLayerConfig;

        //creo la styleMap
        classes = getClasses();
        // creo il layer
        this.routingLayer = CWN2.app.map.layerManager.createVectorLayer({
            name: "routingLayer",
            format: "GeoJSON",
            classes: classes,
            legend: null
        });
        this.routingLayer.setVisibility(true);

        // carico le feature
        CWN2.FeatureLoader.loadFeatures({
            layer: this.routingLayer,
            features: createPointFeatures(result.steps, result.destination),
            url: null,
            "options": {
                "zoom": false,
                "clean": true
            }
        });

        //imposto stradario come baseLayer
        baseLayerConfig = {
            "type": "google_roadmap",
            "name": "google_roadmap",
            "legend": {
                "label": "Google Stradario",
                "icon": "http://geoportale.regione.liguria.it/geoviewer/img/legend/google.png"
            },
            "visible": false,
            "isBaseLayer": false
        };
        CWN2.app.map.layerManager.addBaseLayers([baseLayerConfig]);
        CWN2.app.map.setBaseLayerOnMap("google_roadmap");

        // faccio lo zoom
        var boundsStr = result.bounds;
        CWN2.app.map.zoomToStringExtent(boundsStr, "EPSG:4326");

        // funzione che ritorna lo stile del layer
        function getClasses() {

            var styleMapsStart,
                styleMapsEnd,
                styleMapsSteps,
                classes;

            styleMapsSteps = [
                {
                    "renderIntent": "default",
                    "style": {
                        fillColor: "#3838FF",
                        fillOpacity: 0.5,
                        strokeColor: "#3838FF",
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        pointRadius: 5
                    }
                },
                {
                    "renderIntent": "hover",
                    "style": {
                        fillColor: "#ee9900",
                        fillOpacity: 0.8,
                        strokeColor: "#3838FF",
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        pointRadius: 7
                    }
                },
                {
                    "renderIntent": "select",
                    "style": {
                        fillColor: "#ee9900",
                        fillOpacity: 0.8,
                        strokeColor: "#3838FF",
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        pointRadius: 7
                    }
                }
            ];

            styleMapsStart = [
                {
                    "renderIntent": "default",
                    "style": {
                        "externalGraphic": "http://geoportale.regione.liguria.it/geoviewer/img/icons/numbers/letter_a.png",
                        "graphicWidth": 32,
                        "graphicHeight": 37,
                        "graphicOpacity": 1.0,
                        "graphicXOffset": -16,
                        "graphicYOffset": -37,
                        "graphicTitle": "${label}"
                    }
                }
            ];

            styleMapsEnd = [
                {
                    "renderIntent": "default",
                    "style": {
                        "externalGraphic": "http://geoportale.regione.liguria.it/geoviewer/img/icons/numbers/letter_b.png",
                        "graphicWidth": 32,
                        "graphicHeight": 37,
                        "graphicOpacity": 1.0,
                        "graphicXOffset": -16,
                        "graphicYOffset": -37,
                        "graphicTitle": "${label}"
                    }
                }
            ];

            classes = [
                {
                    "filter": "type = 'start'",
                    "styleMaps": styleMapsStart
                },
                {
                    "filter": "type = 'end'",
                    "styleMaps": styleMapsEnd
                },
                {
                    "filter": "type = 'step'",
                    "styleMaps": styleMapsSteps
                }
            ];

            return classes;
        }

        function createPointFeatures(steps, destinationLabel) {

            var featureStr,
                i,
                len = steps.length,
                coordinates,
                type,
                decimalPlaces = 6;

            featureStr = "{ \"type\": \"FeatureCollection\",\"features\": [";
            for (i = 0; i < len; i++) {
                type = (i === 0) ? "start" : "step";
                coordinates = "[" + me.extractCoordinates(steps[i].start_location) + "]";

                featureStr += "{ \"type\": \"Feature\",";
                featureStr += "\"geometry\": {\"type\": \"Point\", \"coordinates\": " + coordinates + "},";
                featureStr += "\"properties\": {\"label\": \"" + replaceDoubleQuote(steps[i].instructions) + "\",\"type\": \"" + type + "\",\"id\": " + steps[i].id + "}},";
            }
            // punto di arrivo
            if (typeof destinationLabel !== "string") {
                destinationLabel = "Coordinate: " + destinationLabel.Oa.toFixed(decimalPlaces) + " , " + destinationLabel.Na.toFixed(decimalPlaces);
            }
            type = "end";
            coordinates = "[" + me.extractCoordinates(steps[i - 1].end_location) + "]";

            featureStr += "{ \"type\": \"Feature\",";
            featureStr += "\"geometry\": {\"type\": \"Point\", \"coordinates\": " + coordinates + "},";
            featureStr += "\"properties\": {\"label\": \"" + replaceDoubleQuote(destinationLabel) + "\",\"type\": \"" + type + "\"}},";

            featureStr = featureStr.substr(0, featureStr.length - 1);
            featureStr += "]}";
            return Ext.decode(featureStr);

            function replaceDoubleQuote(inStr) {

                if (typeof inStr === "string") {
                    return inStr.replace(/"/g, "\'");
                }
            }
        }

    },

    reset: function() {
        this.directionsDisplay.setMap(null);
        if (this.routingLayer) {
            this.routingLayer.setVisibility(false);
            // levo eventuali popup
            var features = this.routingLayer.features;
            var len = features.length;
            for (var i = 0; i < len; i++) {
                if (features[i].popup) {
                    var popup = features[i].popup;
                    popup.feature = null;
                    CWN2.app.map.removePopup(features[i].popup);
                    features[i].popup.destroy();
                    features[i].popup = null;
                }
            }
        }
        this.origin.address = null;
        this.origin.lat = null;
        this.origin.lon = null;
        this.origin.latLng = null;
        this.destination.address = null;
        this.destination.lat = null;
        this.destination.lon = null;
        this.destination.latLng = null;
    },

    getResult: function() {
        return this.result;
    },

    swapDirection: function() {
        var cacheOrigin = Ext.clone(origin),
            cacheDestination = Ext.clone(destination);
        this.destination = cacheOrigin;
        this.origin = cacheDestination;
    },

    extractCoordinates: function(point) {
        var coord = point.toString().replace('(', '[').replace(')', ']');
        var coordArray = eval(coord);
        return coordArray[1] + "," + coordArray[0];
    }

});



