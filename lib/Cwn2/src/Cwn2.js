/*global Ext: false, CWN2:false, window:false, OpenLayers:false */
//----------------------------------------------------------------

Ext.namespace('CWN2.Control');

//----------------------------------------------------------------

Ext.application({
    name: 'CWN2',

    // array dei controller della applicazione
    controllerList: [
        'CWN2.controller.button.simpleLegend',
        'CWN2.controller.button.loadlayers',
        'CWN2.controller.button.removelayers',
        'CWN2.controller.button.infowms',
        'CWN2.controller.button.transparency',
        'CWN2.controller.button.s3ricerche',
        'CWN2.controller.button.redirect',
        'CWN2.controller.button.routeplanner',
        'CWN2.controller.button.selectfeature',
        'CWN2.controller.button.coordinate',
        'CWN2.controller.button.find',
        'CWN2.controller.button.window',
        'CWN2.controller.button.print',
        'CWN2.controller.button.generic',
        'CWN2.controller.button.geostyler',
        'CWN2.controller.button.qpgtematismi',
        'CWN2.controller.button.risknat',
        'CWN2.controller.SimpleLegendGridPanel',
        'CWN2.controller.TreeLegendGridPanel'
    ],

    initOptions: null,
    configuration: {},
    id: null,
    map: null,
    layout: null,

    init: function() {
        "use strict";
        //CWN2.loadingScreen = Ext.getBody().mask('Caricamento Applicazione', 'loadingscreen');
    },

    launch: function() {
        "use strict";
        var me = this;
        Ext.each(this.controllerList, function(controller) {
            me.getController(controller);
        });
    },

    load: function(initOptions) {
        "use strict";
        CWN2.Util.log("CWN2.load");
        var me = this;

        if (!initOptions.disableLoadingScreen) {
            CWN2.loadingScreen = Ext.getBody().mask('Caricamento Applicazione', 'loadingscreen');
        }

        this.initOptions = initOptions;

        CWN2.Globals.set(initOptions);

        if (typeof initOptions.appConfig === "string") {
            CWN2.Util.ajaxRequest({
                type: "JSONP",
                url: initOptions.appConfig,
                callBack: function(appConfig) {
                    me.setConfig(appConfig);
                    me.build(initOptions);
                }
            });
        } else {
            me.setConfig(initOptions.appConfig);
            me.build(initOptions);
        }
    },

    /**
     *  Function: setConfig
     *
     * Imposta la configurazione
     * Parameters:
     * config - {Object} Oggetto di configurazione della applicazione
     *
     */
    setConfig: function(config) {
        "use strict";
        this.configuration = config || CWN2.Globals.DEFAULT_CONFIG;

        if (config && config.application) {
            this.configuration.application = config.application;
            if (config.application.mapOptions) {
                this.configuration.application.mapOptions.projection = config.application.mapOptions.projection || CWN2.Globals.DEFAULT_CONFIG.application.mapOptions.projection;
                this.configuration.application.mapOptions.displayProjection = config.application.mapOptions.displayProjection || CWN2.Globals.DEFAULT_CONFIG.application.mapOptions.displayProjection;
                this.configuration.application.mapOptions.initialExtent = config.application.mapOptions.initialExtent || CWN2.Globals.DEFAULT_CONFIG.application.mapOptions.initialExtent;
            } else {
                this.configuration.application.mapOptions = CWN2.Globals.DEFAULT_CONFIG.application.mapOptions;
            }
            if (config.application.layout) {
                this.configuration.application.layout.type = config.application.layout.type || CWN2.Globals.DEFAULT_CONFIG.application.layout.type;
            } else {
                this.configuration.application.layout = CWN2.Globals.DEFAULT_CONFIG.application.layout;
            }
        } else {
            this.configuration.application = CWN2.Globals.DEFAULT_CONFIG.application;
        }

        if (config && config.baseLayers && config.baseLayers.length > 0) {
            this.configuration.baseLayers = config.baseLayers;
        } else {
            this.configuration.baseLayers = CWN2.Globals.DEFAULT_CONFIG.baseLayers;
        }

        Ext.each(this.configuration.baseLayers, function(layer) {
            layer.legend = layer.legend || {};
            layer.name = layer.name || layer.type;
            if (CWN2.Globals.DEFAULT_BASE_LAYERS_LEGEND[layer.type]) {
                layer.legend.label = layer.legend.label || CWN2.Globals.DEFAULT_BASE_LAYERS_LEGEND[layer.type].label;
                layer.legend.icon = layer.legend.icon || CWN2.Globals.DEFAULT_BASE_LAYERS_LEGEND[layer.type].icon;
            }
        });

        Ext.each(this.configuration.layers, function(layer) {
            layer.legend = layer.legend || {};
        });

    },

    /**
     *  Function: build
     *
     *  Costruisce la applicazione
     *  Prerequisito: Configurazione caricata
     * Parameters:
     * configuration - {Object} Oggetto di configurazione della applicazione
     * initOptions - {Object} Oggetto contenente le opzioni di inizializzazione
     *
     */
    build: function(initOptions) {
        "use strict";
        var layerManager,
            configuration = this.configuration;

        try {
            Ext.suspendLayouts();

            Ext.QuickTips.init();
            Ext.Ajax.disableCaching = false;

            this.layout = new CWN2.Layout(initOptions.divID);
            this.layout.mapPanel.map.zoomToInitialExtent();

            // se impostato idMap/idRequest/idLayer carico i dati da catalogo
            if (initOptions.idMap || initOptions.idRequest || initOptions.qpgRequest) {
                CWN2.MapCatalogueLoader.loadMap(initOptions);
            } else if (initOptions.idLayer) {
                CWN2.MapCatalogueLoader.loadLayers(initOptions);
            } else {
                this.removeLoadingScreen();
                this.callback(initOptions);
            }

            Ext.resumeLayouts(true);

            // Gestione bottone "pressed"
            if (this.layout.mapPanel.pressedButton && this.layout.mapPanel.pressedButton !== "pan") {
                CWN2.Util.log("Imposto selezione bottone: " + this.layout.mapPanel.pressedButton);
                var selectButton = Ext.ComponentQuery.query('cwn2-button-' + this.layout.mapPanel.pressedButton)[0]
                if (selectButton) {
                    selectButton.getEl().dom.click();
                } else {
                    CWN2.Util.handleException({
                        message: "Bottone " + this.layout.mapPanel.pressedButton + " non esistente",
                        level: 0
                    });
                }
            }
        } catch (exception) {
            CWN2.Util.handleException(exception);
        }
    },

    callback: function(initOptions) {
        "use strict";
        if (initOptions.callBack) {
            initOptions.callBack(initOptions.callBackArgs);
        }
    },

    /**
     *  Function: showMapWindow
     *
     *  Mostra la finestra mappa.
     *  Utilizzata da applicazioni con layout di tipo "window".
     *
     */
    showMapWindow: function() {
        "use strict";
        this.layout.layout.show();
    },

    /**
     *
     * Function: loadFeatures
     *
     * Carica le feature in formato GeoJSON in un layer di tipo OpenLayers.Layer.Vector
     *
     * Parameters:
     * options - {Object} Oggetto di configurazione
     *  - layerName - {String} Nome del layer
     *  - features - {Object} Oggetto GeoJSON contenente le feature
     *  - url - {String} URL del servizio/file con serve le feature
     *  - options - {Object} Oggetto configurazione delle opzioni
     *  - - zoom - {Boolean} Flag per impostare lo zoom sulle feature caricate
     *  - - zoomLevel - {Integer} Se negativo effettua uno zoom all'indietro, se positivo e inferiore al livello di zoom attuale va a quel livello di zoom (zoom minimo)
     *  - - clean - {Boolean} Flag per indicare se bisogna cancellare eventuali feature preesistenti
     *
     *  Esempio:
     *  (start code)
     * var config = {
     *			"layerName": "Prova",
     *           "features": features,
     *           "url": null,
     *			"options": {
     *				"zoom": false
     *				"clean": false
     *			}
     *		};
     *   (end)
     *
     */
    loadFeatures: function(options) {
        "use strict";
        var olLayer = this.map.getLayerByName(options.layerName);
        if (olLayer) {
            options.layer = olLayer;
            CWN2.FeatureLoader.loadFeatures(options);
        }
    },

    /**
     *
     * Function: loadFeatureByAddress
     *
     * Carica le feature in formato GeoJSON in un layer di tipo OpenLayers.Layer.Vector
     *
     * Parameters:
     * options - {Object} Oggetto di configurazione
     *  - layerName - {String} Nome del layer
     *  - features - {Object} Oggetto GeoJSON contenente le feature
     *  - url - {String} URL del servizio/file con serve le feature
     *  - options - {Object} Oggetto configurazione delle opzioni
     *  - - zoom - {Boolean} Flag per impostare lo zoom sulle feature caricate
     *  - - zoomLevel - {Integer} Se negativo effettua uno zoom all'indietro, se positivo e inferiore al livello di zoom attuale va a quel livello di zoom (zoom minimo)
     *  - - clean - {Boolean} Flag per indicare se bisogna cancellare eventuali feature preesistenti
     *
     *  Esempio:
     *  (start code)
     * var config = {
     *			"layerName": "Prova",
     *           "address": " Genova, Liguria",
     *			"options": {
     *				"zoom": true
     *				"zoomLevel": 16
     *				"clean": true
     *			}
     *		};
     *   (end)
     *
     */
    loadFeatureByAddress: function(options) {
        "use strict";
        var olLayer = this.map.getLayerByName(options.layerName);
        if (olLayer) {
            options.layer = olLayer;
            CWN2.FeatureLoader.loadFeatureByAddress(options);
        }
    },

    /**
     *
     * Function: selectFeature
     *
     * Selezione programmatica feature di un layer vettoriali.
     *
     * Se più feature soddisfano il criterio di selezione solo la prima viene selezionata.
     *
     * Se impostato il parametro options.hiliteOnly=true viene fatto solo l'highlight della feaure.
     *
     * Se impostato il parametro feature viene selezionata la feature,
     * altrimenti viene fatta una ricerca della feature sul layer in base alla configurazione del parametro config.
     *
     *
     * Parameters:
     * options - {Object} Oggetto di configurazione dell'hilite
     *  - layerName - {String} Nome del layer
     *  - attrName - {String} Nome dell'attributo
     *  - item - {String}/{Number} Valore
     *  - options - {Object} Oggetto configurazione delle opzioni
     *  -  - zoom - {Boolean} Flag per impostare lo zoom sulle feature caricate
     *  -  - hiliteOnly - {Boolean} Flag per effettuare solo l'highlight della feature (default: false)
     * feature - {OpenLayers.Feature} Feature da selezionare
     *
     *  Esempio:
     *  (start code)
     * var selectConf = {
     *			"layerName": "Prova",
     *			"attrName": "ID",
     *				"items": "1"
     *			},
     *            "options": {
     *				"zoom": false,
     *				"hiliteOnly": false
     *			}
     *        };
     *   (end)
     *
     */
    selectFeature: function(options) {
        "use strict";
        var olLayer = this.map.getLayerByName(options.layerName);
        if (olLayer) {
            options.layer = olLayer;
            CWN2.FeatureSelecter.selectFeature(options);
        }
    },

    /**
     *
     * Function: unselectFeature
     *
     * Deselezione programmatica feature di un layer vettoriali.
     *
     * Se più feature soddisfano il criterio di selezione solo la prima viene deselezionata.
     *
     * Se impostato il parametro options.hiliteOnly=true viene fatto solo l'unhighlight della feaure.
     *
     * Se impostato il parametro feature viene deselezionata la feature,
     * altrimenti viene fatta una ricerca della feature sul layer in base alla configurazione del parametro config
     *
     *
     * Parameters:
     * options - {Object} Oggetto di configurazione dell'hilite
     *  - layerName - {String} Nome del layer
     *  - attrName - {String} Nome dell'attributo
     *  - item - {String}/{Number} Valore
     *  - options - {Object} Oggetto configurazione delle opzioni
     *  -  - hiliteOnly - {Boolean} Flag per effettuare solo l'highlight della feature (default: false)
     * feature - {OpenLayers.Feature} Feature da selezionare
     *
     *  Esempio:
     *  (start code)
     * var selectConf = {
     *			"layerName": "Prova",
     *			"attrName": "ID",
     *				"items": "1"
     *			},
     *            "options": {
     *				"hiliteOnly": false
     *			}
     *        };
     *   (end)
     *
     */
    unselectFeature: function(options) {
        "use strict";
        var olLayer = this.map.getLayerByName(options.layerName);
        if (olLayer) {
            options.layer = olLayer;
            CWN2.FeatureSelecter.unselectFeature(options);
        }
    },

    /**
     *
     * Function: checkServiceException
     *
     * Effettua il controllo che il servizio non abbia ritornato una eccezzione.
     * Metodo statico
     *
     * Parameters:
     * config -  {Object} oggetto configurazione
     *
     */
    checkServiceException: function(config) {
        "use strict";
        if (config.exception) {
            throw {
                name: "ServiceError",
                message: "CWN2.app: " + config.exception.message,
                level: 2
            };
        }
    },

    /**
     *
     * Function: checkConfig
     *
     * Effettua dei controlli di base sulla configurazione.
     * Metodo statico
     *
     * Parameters:
     * config -  {Object} oggetto configurazione
     *
     */
    checkConfig: function(config) {
        "use strict";
        CWN2.Util.assert(config, {
            name: "BadConfiguration",
            message: "CWN2.app.checkConfig: configuration deve essere valorizzato",
            level: 2
        });

        CWN2.Util.assert(config.application, {
            name: "BadConfiguration",
            message: "CWN2.app.checkConfig: application deve essere valorizzato",
            level: 2
        });

        CWN2.Util.assert(config.application.mapOptions, {
            name: "BadConfiguration",
            message: "CWN2.app.checkConfig: mapOptions deve essere valorizzato",
            level: 2
        });

        CWN2.Util.assert(config.application.layout, {
            name: "BadConfiguration",
            message: "CWN2.app.checkConfig: layout deve essere valorizzato",
            level: 2
        });

        CWN2.Util.assert(((config.application.layout.type === "simple") ||
            (config.application.layout.type === "panel") ||
            (config.application.layout.type === "window") ||
            (config.application.layout.type === "viewport")), {
            name: "BadConfiguration",
            message: "CWN2.app.checkConfig: layout deve essere di tipo gestito (simple/panel/window/viewport)",
            level: 2
        });

        CWN2.Util.assert(config.baseLayers, {
            name: "BadConfiguration",
            message: "CWN2.app.checkConfig: baseLayers deve essere valorizzato",
            level: 2
        });

        CWN2.Util.assert(config.baseLayers.length > 0, {
            name: "BadConfiguration",
            message: "CWN2.app.checkConfig: baseLayers deve contenere almeno un layer",
            level: 2
        });

    },

    removeLoadingScreen: function(delay) {
        "use strict";
        var timeDelay = delay || 2000;
        if (CWN2.loadingScreen && CWN2.loadingScreen.dom) {
            var task = new Ext.util.DelayedTask(function() {
                CWN2.loadingScreen.fadeOut({
                    duration: 1000,
                    remove: true
                });
                CWN2.loadingScreen.next().fadeOut({
                    duration: 1000,
                    remove: true
                });
            });
            task.delay(timeDelay);
        }
    },

    /**
     *
     * Function: setButtonOption
     *
     * Imposta una opzione di configurazione di un bottone
     *
     * Parameters:
     * buttonName - {String} Id del bottone
     * optionsName - {String} Nome della opzione
     * optionsValue - {String/Function/Object....} Valore della opzione
     *
     */
    setButtonOption: function(buttonName, optionName, optionValue) {
        var groups = this.configuration.application.layout.toolbar.itemGroups;
        Ext.each(groups, function(group) {
            Ext.each(group.items, function(button) {
                if (button.name.toLowerCase() === buttonName.toLowerCase()) {
                    button.options = button.options || {};
                    button.options[optionName] = optionValue;
                    return false;
                } else {
                    return true;
                }
            });
        });
    },

    /**
     *
     * Function: loadMap
     *
     * Carica una mappa del catalogo RL
     *
     * Parameters:
     * idMap - {String} Id della Mappa
     * loadBaseLayers - {Bool}
     * setMapTitle - {String} Id del div da cui impostare con il titolo della mappa
     *
     */
    loadMap: function(initOptions) {
        "use strict";
        CWN2.MapCatalogueLoader.loadMap(initOptions);
    },

    /**
     *
     * Function: findWMS
     *
     * Carica una find WMS
     *
     * Parameters:
     *
     */
    findWMS: function(findOptions) {
        "use strict";
        CWN2.MapCatalogueLoader.findWMS(findOptions);
    }
});
