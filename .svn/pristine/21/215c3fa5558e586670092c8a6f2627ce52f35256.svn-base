/**
 *
 * Class: CWN2.WmsSldHiliter
 *
 * Oggetto per la gestione dei layer:
 *
 * -    Inizializzare i repository dei layer
 * -    Fornire informazioni sui layer disponibili ai moduli che lo richiedono, in particolare i metodi getBaseLayersConfig e getLayersConfig forniscono le configurazioni dei layer di base e overlay
 * -    Aggiungere layer ai repository
 * -    Rimuovere i layer dai repository
 * -    Creazione di layer di servizio (per esempio per le operazioni di find o calcolo percorsi)
 *
 *
 */

Ext.define("CWN2.WmsSldHiliter", {

    hiliteLayerName: null,
    map: null,
    hilitedLayerName: null,
    polygonSymbolizer: "",

    /**
     *
     * Function: createHiliteLayer
     *
     * Crea il layer per l'hilite
     *
     * Parameters:
     * layerConfig - {Object} Configurazione del layer di partenza
     *
     * Returns:
     * {Layer} Layer OpenLayers
     *
     */
    createHiliteLayer: function(layers,sldUrl,sldCleanUrl) {
        var me = this;
        var projection = this.map.layerManager.getFieldFromLayerConfig(layers[0],"projection");
        var wmsUrl = this.map.layerManager.getFieldFromLayerConfig(layers[0],"wmsParams").url;
        var flagGeoserver = this.map.layerManager.getFieldFromLayerConfig(layers[0],"flagGeoserver");

        var wmsParamsNamesArray = []
        Ext.each(layers, function(layer) {
            wmsParamsNamesArray.push(me.map.layerManager.getFieldFromLayerConfig(layer,"wmsParams").name);
        });
        var wmsParamsNames = wmsParamsNamesArray.join(",");

        var config =  {
            type: "WMS",
            name: this.hiliteLayerName,
            visible: true,
            projection: projection,
            minScale: 0,
            maxScale: 0,
            opacity: 0.7,
            showInLegend: false,
            //queryable: true,
            legend: {},
            classes: [],
            wmsParams: {
                url: wmsUrl,
                transparent: true,
                sld: sldUrl
            }
        }
        if (!flagGeoserver) {
            config.wmsParams.name = wmsParamsNames;
        }

        var hiliteLayer = this.map.layerManager.createWMSLayer(config);

        hiliteLayer.hiliteLayer = true;
        hiliteLayer.sldUrl = sldUrl;
        hiliteLayer.sldCleanUrl = sldCleanUrl;
        hiliteLayer.hilitedLayers = layers;

        return hiliteLayer;
    },



    /**
     *
     * Function: hiliteFeature
     *
     * Effettua l'evidenziazione di una feature
     *
     * Parameters:
     * layerConfig - {Object} Configurazione del layer di partenza
     * fields - {String} Nome del campo o lista separata da virgole
     * values - {Array} Array dei valori
     *  bounds - {OpenLayers.Bound} Bound per effettuare lo zoom
     *  zoomLevel - {Integer} Livello minimo di zoom
     *  callback - {Function} Funzione di callback
     *
     *
     * Returns:
     * {Layer} Layer OpenLayers
     *
     */
    hiliteFeature: function(config) {
        CWN2.Util.log("CWN2.WmsSldHiliter.hiliteFeature");

        var me = this,
            layers = config.layers,
            fields = config.fields,
            values = config.values,
            bounds = config.bounds,
            sldFilter = config.sldFilter,
            zoomLevel = config.zoomLevel,
            callback = config.callback,
            maxZoomLevel = config.maxZoomLevel;

        var geomType = [];
        Ext.each(layers, function(layer) {
            geomType.push(CWN2.app.map.layerManager.getFieldFromLayerConfig(layer,"geomSubType"));
        });

        var sldBody = (((fields && values && values.length > 0) || sldFilter) && geomType.length > 0) ?
            CWN2.WmsSldHiliter.getStyle({
                layers: layers,
                geomType: geomType,
                fields: fields,
                values: values,
                sldFilter: sldFilter
            }) :
            null;

        var sldCleanBody = CWN2.WmsSldHiliter.getStyle({
            layers: layers,
            geomType: geomType,
            fields: fields,
            values: null,
            sldFilter: null
        });

//        return;
        this.map.layerManager.remove([this.hiliteLayerName]);

        // creo il file sld e creo il layer di hilite
        CWN2.WmsSldHiliter.createSldFile(sldBody,sldCleanBody, function (response) {
            //var sldUrl = response.data.sldUrl;
            //var sldCleanUrl = response.data.sldCleanUrl;
            var sldUrl = "http://srvcarto.regione.liguria.it/geoservices/temp/" + response.data.sldFile;
            var sldCleanUrl = "http://srvcarto.regione.liguria.it/geoservices/temp/" + response.data.sldCleanFile;

            var hiliteLayer = me.createHiliteLayer(layers,sldUrl,sldCleanUrl);
            hiliteLayer.setVisibility(true);
        });

        CWN2.WmsSldHiliter.zoomToFeatures(bounds,zoomLevel,maxZoomLevel);

        if (callback) {
            callback();
        }
    },


    /**
     *
     * Function: cleanHiliteLayer
     *
     * Ripulisce il layer
     *
     * Parameters:
     *
     * Returns:
     *
     */
    cleanHiliteLayer: function() {
        var layerName = this.hiliteLayerName;
        var hiliteLayer = this.map.getLayerByName(layerName);
        if  (hiliteLayer) {
            this.map.layerManager.applyWmsParam(layerName,"sld",hiliteLayer.sldCleanUrl);
        }
    },

    constructor: function(map, hiliteLayerName) {
        CWN2.Util.log("CWN2.WmsSldHiliter");

        CWN2.Util.assert(map,
            {
                name: "BadConfiguration",
                message: "CWN2.WmsSldHiliter.init: map deve essere valorizzato",
                level: 2
            }
        );
        CWN2.Util.assert(hiliteLayerName,
            {
                name: "BadConfiguration",
                message: "CWN2.WmsSldHiliter.init: hiliteLayerName deve essere valorizzato",
                level: 2
            }
        );

        this.map = map;
        this.hiliteLayerName = hiliteLayerName;
        map.wmsSldHiliter = this;
    },

    statics: {
        // funzione per impostare la vastizione di default
        defaultSymbolizers: function() {

            var polygonSymbolizer = "";
            polygonSymbolizer += '<sld:PolygonSymbolizer>';
            polygonSymbolizer += '<sld:Stroke>';
            polygonSymbolizer += '<sld:CssParameter name="stroke">#FFCC00</sld:CssParameter>';
            polygonSymbolizer += '<sld:CssParameter name="stroke-width">6.0</sld:CssParameter>';
            polygonSymbolizer += '</sld:Stroke>';
            polygonSymbolizer += '</sld:PolygonSymbolizer>';

            var lineSymbolizer = "";
            lineSymbolizer += '<sld:LineSymbolizer>';
            lineSymbolizer += '<sld:Stroke>';
            lineSymbolizer += '<sld:CssParameter name="stroke">#FFCC00</sld:CssParameter>';
            lineSymbolizer += '<sld:CssParameter name="stroke-width">6.0</sld:CssParameter>';
            lineSymbolizer += '</sld:Stroke>';
            lineSymbolizer += '</sld:LineSymbolizer>';

            var pointSymbolizer = "";
            pointSymbolizer += '<sld:PointSymbolizer>';
            pointSymbolizer += '<sld:Graphic>';
            pointSymbolizer += '<sld:Mark>';
            pointSymbolizer += '<sld:WellKnownName>circle</sld:WellKnownName>';
            pointSymbolizer += '<sld:Fill>';
            pointSymbolizer += '<sld:CssParameter name="fill">#FFCC00</sld:CssParameter>';
            pointSymbolizer += '</sld:Fill>';
            pointSymbolizer += '</sld:Mark>';
            pointSymbolizer += '<sld:Size>10.0</sld:Size>';
            pointSymbolizer += '</sld:Graphic>';
            pointSymbolizer += '</sld:PointSymbolizer>';

            var defaultSymbolizers = {
                "polygonSymbolizer": polygonSymbolizer,
                "lineSymbolizer": lineSymbolizer,
                "pointSymbolizer": pointSymbolizer
            }

            return defaultSymbolizers;

        },

        /**
         *
         * Function: getSLDFilter
         *
         * Metodo statico - Crea una stringa contenente un filtro sld
         *
         * Parameters:
         * idField - {String} Lista dei campi separati da virgole
         * idList - {Array} Array dei valori (ogni singolo valore, separato da virgole)
         *
         * Returns:
         * {String} Stringa contenente il filtro SLD
         *
         */
        getFilter: function(fields, values, cachePostGIS) {
            // gestione chiavi composte
            if (cachePostGIS) {
                fields = fields.toLowerCase();
            }
            var fieldsArray = fields.split(','),
                sldFilter = "<Filter>";

            if (values) {
                if (values.length > 1) {
                    sldFilter += '<Or>';
                }
                Ext.each(values, function(valueList) {
                    var value = valueList.split(',');
                    if (fieldsArray.length > 1) {
                        sldFilter += '<And>';
                    }
                    Ext.each(fieldsArray, function(field, index) {
                        sldFilter += '<PropertyIsEqualTo><PropertyName>' + field + '</PropertyName><Literal>' + value[index] + '</Literal></PropertyIsEqualTo>';
                    });
                    if (fieldsArray.length > 1) {
                        sldFilter += '</And>';
                    }
                });
                if (values.length > 1) {
                    sldFilter += '</Or>';
                }
            } else {
                Ext.each(fieldsArray, function(field, index) {
                    sldFilter += '<PropertyIsEqualTo><PropertyName>' + field + '</PropertyName><Literal>0</Literal></PropertyIsEqualTo>';
                });
            }
            sldFilter += '</Filter>';
            return sldFilter;
        },

        zoomToFeatures: function(bounds,zoomLevel,maxZoomLevel) {
            if (bounds) {
                CWN2.app.map.zoomToExtent(bounds);
                if (zoomLevel) {
                    CWN2.app.map.zoomTo(zoomLevel);
                }
                if (maxZoomLevel && CWN2.app.map.zoom > maxZoomLevel) {
                    CWN2.app.map.zoomTo(maxZoomLevel);
                }
            }
        },

        /**
         *
         * Function: getStyle
         *
         * Metodo statico - Crea una stringa contenente uno stile sld
         *
         * Parameters:
         * layerName - {Array} Array dei nomi dei layer
         * fields - {Array} Nome dei campi ID
         * values - {Array} Array dei valori
         * symbolizer - {Array} Srray degli stili di vestizione
         *
         * Returns:
         * {String} Stringa contenente il documento SLD
         *
         */
        getStyle: function(config) {
            var layers = config.layers,
                geomType = config.geomType,
                fields = config.fields,
                values = config.values,
                sldFilter = config.sldFilter;

            var sld_body = '<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" version="1.0.0">'
            // ciclo sui layer
            Ext.each(layers, function(layer, i) {
                var name = CWN2.app.map.layerManager.getFieldFromLayerConfig(layer,"wmsParams").name;
                var cachePostGIS = CWN2.app.map.layerManager.getFieldFromLayerConfig(layer,"cachePostGIS");

                var symbolizer;
                if (!geomType) {
                    symbolizer = CWN2.WmsSldHiliter.defaultSymbolizers()["polygonSymbolizer"];
                } else {
                    switch (geomType[i]) {
                        case "POLYGON":
                            symbolizer = CWN2.WmsSldHiliter.defaultSymbolizers()["polygonSymbolizer"];
                            break;
                        case "LINE":
                            symbolizer = CWN2.WmsSldHiliter.defaultSymbolizers()["lineSymbolizer"];
                            break;
                        case "POINT":
                            symbolizer = CWN2.WmsSldHiliter.defaultSymbolizers()["pointSymbolizer"];
                            break;
                    }
                }
                sld_body += '<sld:NamedLayer> <sld:Name>' + name + '</sld:Name>';
                sld_body += '<sld:UserStyle> <sld:Name>default</sld:Name>';
                sld_body += '<sld:FeatureTypeStyle> <sld:Rule>';
                sld_body += (sldFilter) ? sldFilter : CWN2.WmsSldHiliter.getFilter(fields, values, cachePostGIS);
                sld_body += symbolizer;
                sld_body += '</sld:Rule></sld:FeatureTypeStyle>';
                sld_body += '</sld:UserStyle> </sld:NamedLayer>';
            });
            sld_body += '</sld:StyledLayerDescriptor>';
            return sld_body;
        },

        createSldFile: function(sldBody,sldCleanBody,callBack) {
            CWN2.Util.ajaxRequest({
                type: "JSON",
                url: CWN2.Globals.RL_CREATE_SLD_SERVICE,
                callBack: callBack,
                jsonData: {"sldBody": sldBody,"sldCleanBody": sldCleanBody},
                disableException: true
            });
        }


    }


});





