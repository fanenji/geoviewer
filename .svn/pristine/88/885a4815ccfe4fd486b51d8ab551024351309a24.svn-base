/**
 *
 * Class: CWN2.FeatureLoader
 *
 * Oggetto per il caricamento delle feature vettoriali
 *
 *
 */
Ext.define("CWN2.FeatureLoader", {

    singleton: true,

    /**
     *
     * Function: loadFeatures
     *
     * Carica le feature in formato GeoJSON in un layer di tipo OpenLayers.Layer.Vector
     *
     * Parameters:
     * loadConfig - {Object} Oggetto di configurazione
     *  - layer - {OpenLayers.Layer} Layer
     *  - features - {Object} Oggetto GeoJSON contenente le feature
     *  - url - {String} URL del servizio/file con serve le feature
     *  - options - {Object} Oggetto configurazione delle opzioni
     *  - - zoom - {Boolean} Flag per impostare lo zoom sulle feature caricate
     *  - - clean - {Boolean} Flag per indicare se bisogna cancellare eventuali feature preesistenti
     *
     *
     */
    loadFeatures: function(config) {
        CWN2.Util.log("CWN2.FeatureLoader.loadFeatures");

        // controlli configurazione
        try {
            CWN2.Util.assert(config,
                {
                    name: "BadParameter",
                    message: "CWN2.FeatureLoader.loadFeatures: oggetto di configurazione deve essere valorizzato",
                    level: 1
                }
            );
            CWN2.Util.assert(config.layer,
                {
                    name: "BadParameter",
                    message: "CWN2.FeatureLoader.loadFeatures: Layer non trovato",
                    level: 1
                }
            );
            CWN2.Util.assert(config.url || config.features,
                {
                    name: "BadParameter",
                    message: "CWN2.FeatureLoader.loadFeatures: url o features devono essere valorizzati",
                    level: 1
                }
            );
        } catch (e) {
            throw e;
        }

        var features = config.features,
            url,
            layer = config.layer;

        // se impostato parametro layerLegendUrl
        // cambio la legenda del layer
        if (config.layerLegendUrl) {
            var styles = layer.styleMap.styles;
            for (var stile in styles) {
                var rule = styles[stile].rules[0];
                rule.symbolizer.externalGraphic = config.layerLegendUrl;
            }
        }

        // se impostato parametro customFeatureImg cambio la legenda del layer
        if (config.customFeatureImg) {
            var style = new OpenLayers.Style({
                externalGraphic: "${img}",
                graphicTitle: layer.styleMap.styles["default"].rules[0].symbolizer.graphicTitle,
                graphicWidth: layer.styleMap.styles["default"].rules[0].symbolizer.graphicWidth,
                graphicHeight: layer.styleMap.styles["default"].rules[0].symbolizer.graphicHeight,
                graphicOpacity: layer.styleMap.styles["default"].rules[0].symbolizer.graphicOpacity,
                graphicXOffset: layer.styleMap.styles["default"].rules[0].symbolizer.graphicXOffset,
                graphicYOffset: layer.styleMap.styles["default"].rules[0].symbolizer.graphicYOffset
            });
            layer.styleMap = new OpenLayers.StyleMap(style);
        }

        // imposto il flag loadend sul layer a false
        layer.loadend = false;

        // caricamento feature
        try {
            // se impostate le feature carico direttamente
            if (features) {
                CWN2.FeatureLoader.loadFeaturesCB(features, config);
            }
            // se impostata la url chiamo il servizio
            if (config.url) {
                CWN2.Util.ajaxRequest({
                    type: "JSONP",
                    url: config.url,
                    callBack: function(features) {
                        CWN2.FeatureLoader.loadFeaturesCB(features, config);
                    }
                });

            }
        }
        catch (exception) {
            CWN2.Util.handleException(exception);
        }

    },

    /**
     *
     * Function: loadFeatureByAddress
     *
     * Effettua geocoding e caricamento di un indirizzo
     *
     * Parameters:
     * loadConfig - {Object} Oggetto di configurazione
     *  - layer - {OpenLayers.Layer} Layer
     *  - address - {String} Indirizzo da geocodificare
     *  - options - {Object} Oggetto configurazione delle opzioni
     *  - - zoom - {Boolean} Flag per impostare lo zoom sulle feature caricate
     *  - - zoomLevel - {Int} Livello di zoom
     *  - - clean - {Boolean} Flag per indicare se bisogna cancellare eventuali feature preesistenti
     *
     *
     */
    loadFeatureByAddress: function(config) {
        CWN2.Util.log("CWN2.FeatureLoader.loadFeatureByAddress");

        // controlli configurazione
        try {
            CWN2.Util.assert(config,
                {
                    name: "BadParameter",
                    message: "CWN2.FeatureLoader.loadFeatureByAddress: oggetto di configurazione deve essere valorizzato",
                    level: 1
                }
            );
            CWN2.Util.assert(config.layer,
                {
                    name: "BadParameter",
                    message: "CWN2.FeatureLoader.loadFeatureByAddress: Layer non trovato",
                    level: 1
                }
            );
            CWN2.Util.assert(config.address,
                {
                    name: "BadParameter",
                    message: "CWN2.FeatureLoader.loadFeatureByAddress: indirizzo deve essere valorizzato",
                    level: 1
                }
            );
        } catch (e) {
            throw e;
        }

        // imposto il flag loadend sul layer a false
        // viene poi reimpostato alla fine del caricamento richiamando l'evento loadend
        config.layer.loadend = false;

        // geocoding e caricamento feature
        try {
            CWN2.Util.geoCode(
                config.address,
                {
                    "infoPopUp": config.html,
                    "label": config.address,
                    "tooltip": config.address
                },
                function(result) {
                    CWN2.FeatureLoader.loadFeaturesCB(result, config);
                }
            );
        }
        catch (exception) {
            CWN2.Util.handleException(exception);
        }

    },

    /**
     * Function: loadMarker
     *
     * Carica un marker sul layer per le ricerche (findLayer)
     *
     * Parameters:
     * initConfig - {Object} Oggetto Configurazione
     *  - map - {CWN2.Map} MAppa su cui caricare il marker
     *  - x - {Number} Coordinata X del marker
     *  - y - {Number} Coordinata Y del marker
     *  - classes - {Object} Stile di vestizione del marker
     *  - label - {String} Etichetta
     *  - epsgCode - {String} Codice EPSG (nel formato "EPSG:3003")
     */
    loadMarker: function(initConfig) {

        var hiliteLayer,
            label = initConfig.label || null,
            x = initConfig.x,
            y = initConfig.y,
            epsgCode = initConfig.epsgCode,
            map = initConfig.map,
            zoomLevel = initConfig.zoomLevel,
            point = new OpenLayers.Geometry.Point(x, y);

        if (epsgCode && epsgCode !== map.projection) {
            point.transform(new OpenLayers.Projection(epsgCode), new OpenLayers.Projection(map.projection));
        }

        var feature = new OpenLayers.Feature.Vector(
            point,
            { label: label },
            {
                "cursor": "pointer",
                "pointRadius": 10,
                "externalGraphic": "http://geoportale.regione.liguria.it/geoviewer/stili/default/icons/marker_blue.png",
                "graphicTitle": label,
                "label": label,
                "graphicOpacity": 1,
                "graphicWidth": 25,
                "graphicHeight": 41,
                "graphicYOffset": -41
            });
        hiliteLayer = map.layerManager.createVectorLayer({
            name: "findLayer"
        });
        hiliteLayer.destroyFeatures();
        hiliteLayer.addFeatures([feature]);
        hiliteLayer.redraw();
        hiliteLayer.map.zoomToFeatures([feature], zoomLevel);
    },

    loadFeaturesCB: function(features, config) {

        try {
            var options = config.options || {"zoom": true, "zoomLevel": 16, "clean": false},
                layer = config.layer,
                featureCollection = new OpenLayers.Format.GeoJSON({
                    "internalProjection": new OpenLayers.Projection(layer.map.projection),
                    "externalProjection": layer.projection
                }).read(features);

            if (options.clean) {
                layer.destroyFeatures();
            }

            layer.addFeatures(featureCollection);
            layer.redraw();

            if (options.zoom) {
                layer.map.zoomToFeatures(featureCollection, options.zoomLevel);
            }

            if (options.setInitialExtent) {
                layer.map.initialExtent = layer.map.getExtent();
            }

        }
        catch (exception) {
            throw {
                name: "BadFeatureFormat",
                message: "CWN2.FeatureLoader.loadFeatures: Non sono riuscito a caricare le feature",
                level: 1
            };
        } finally {
            layer.events.triggerEvent("loadend");
        }

    }
});

