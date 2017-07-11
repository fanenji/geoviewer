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

/**
 *
 * Class: CWN2.Util
 *
 * Namespace contenente metodi di utilità
 *
 *
 */

Ext.define("CWN2.Util", {

    singleton: true,

    /**
     *  Function: getUrlParam
     *
     *  Ritorna il valore di un parametro nella queryString
     *
     *  Parameters:
     *  paramName - {String} Nome del parametro
     *
     *  Retur     *
     */
    getUrlParam: function(paramName) {
        var results = new RegExp("[\\?&]" + paramName + "=([^&#]*)").exec(window.location.href);
        return results ? decodeURIComponent(results[1]) : null;
    },

    /**
     *  Function: assert
     *
     *  Assert per i controlli.
     *
     *  Controlla che l'espressione passata sia vera, altrimenti effettua la throw dell'errore
     *
     *  Parameters:
     *  test - {Expression} Condizione da verificare
     *  error - {Object} Oggetto errore
     *
     */
    assert: function(condition, error) {
        if (!condition) {
            throw error;
        }
    },

    /**
     * Function: handleException
     *
     * Gestione exception
     *
     * Parameters:
     * exception - {Object} Oggetto exception
     * exception level:
     * - 0 = warning (non viene mandato messaggio all'utente
     * - 1 = errore
     * - 2 = errore bloccante
     *
     */
    handleException: function(exception) {
        CWN2.Util.log(exception.message, exception.level);
        (exception.level > 0) ? CWN2.Util.msgBox(exception.message, "ERROR") : null;
    },

    /**
     *  Function: log
     *
     *  Scrive un messaggio sulla console
     *
     *  Parameters:
     *  msg - {String} Messaggio da scrivere
     *  level:
     * - undefined = info
     * - 0 = warn
     * - 1/2 = error
     *
     */
    log: function(message, level) {
        if (!CWN2.Globals.debug) {
            return;
        }

        var action;
        switch (level) {
            case 0:
                action = "warn";
                break;
            case 1:
            case 2:
                action = "error";
                break;
            default:
                action = "info";
        }

        try {
            console[action](message);
        } catch (e) {
        }
    },

    /**
     *  Function: msgBox
     *
     *  Manda un alert di avviso all'utente
     *
     *  Parameters:
     *  msg - {string} Messaggio da scrivere sull'alert
     *
     */
    msgBox: function(msg, type, title) {
        var icon = (type) ? Ext.Msg[type] : Ext.Msg.INFO;
        var titolo = (title) || "Info";
        Ext.Msg.show({
            title: titolo,
            msg: msg,
            icon: icon,
            buttons: Ext.Msg.OK
        });
    },

    /**
     * Function: ajaxRequest
     *
     * Funzione per effettuare una richiesta XmlHTTP.
     *
     * Ritorna un oggetto javascript contentente la deserializzazione del json
     * oppure un documento xml
     *
     * Parameters:
     * options - {Object} oggetto di configurazione
     *  - type - {String}
     *  - url - {String} Url del file o del servizio
     *  - urlParams - {Object} Oggetto contenente i parametri da passare.
     *  - callBack {Function} Funzione da richiamare dopo il caricamento
     *  - args - {Array} Array di argomenti da passare alla funzione di callback
     *
     * Returns:
     * {object/xmlDoc} L'oggetto contenente la deserializzazione del JSON o il document XML
     *
     */
    ajaxRequest: function(options) {
        var type = options.type,
            url = options.url,
            urlParams = options.urlParams,
            callBack = options.callBack,
            args = options.args,
            jsonData = options.jsonData,
            exception = {};

        function success(response, opts) {
            var data;
            CWN2.app.removeLoadingScreen(100);
            switch (type) {
                case "JSONP":
                    data = response;
                    break;
                case "JSON":
                    data = Ext.JSON.decode(response.responseText, true);
                    break;
                case "XML":
                    // Utilizzo metodo seguente invece di utilizzare response.responseXml perchè
                    // IE10 non riconosce il documento creato come documento XML e non applica la
                    // xslTransform
                    if (window.ActiveXObject) {
                        data = new ActiveXObject("Microsoft.XMLDOM");
                        data.async = "false";
                        data.loadXML(response.responseText);
                    } else {
                        data = new DOMParser().parseFromString(response.responseText, "text/xml");
                    }
                    //data = response.responseXML;
                    break;
            }
            if (!data) {
                if (type === "XML") {
                    exception.message = "CWN2.Util.ajaxRequest - la risposta del server non sembra un documento xml. \nControllare contentType della risposta \n(deve essere text/xml o application/xml ";
                } else {
                    exception.message = "CWN2.Util.ajaxRequest - " + response.responseText;
                }
                exception.level = 2;
                CWN2.Util.handleException(exception);
                return;
            }
            if (!options.disableException && data.success === false) {
                exception.message = data.message;
                exception.level = 2;
                CWN2.Util.handleException(exception);
                return;
            }
            callBack(data, response, args);
        }

        function failure(response, opts) {
            CWN2.app.removeLoadingScreen(100);
            var exception = {};
            exception.message = response.responseText;
            exception.level = 2;
            CWN2.Util.handleException(exception);
        }

        var requestOptions = {
            url: url,
            params: urlParams,
            success: success,
            failure: failure,
            jsonData: jsonData
        };

        if (type === "JSONP") {
            Ext.data.JsonP.request(requestOptions);
        } else {
            requestOptions.headers = {'Content-Type': 'application/json; charset=UTF-8'};
//            if (CWN2.Globals.RUOLO && CWN2.Globals.RUOLO !== 'PUBBLICO') {
//                requestOptions.headers['x-codutente'] = CWN2.Globals.RUOLO;
//            }
            Ext.Ajax.request(requestOptions);
        }
    },

    /**
     * Function: parseXML
     *
     * Funzione per fare il parsing di una stringa xml
     *
     * Ritorna un oggetto doc xml
     *
     * Parameters:
     * xmlString - {String} Stringa xml
     *
     * Returns:
     * {object} Oggetto xmlDoc
     *
     */
    parseXML: function(xmlString) {

        CWN2.Util.log("CWN2.Util.parseXML");
        try {
            var xmlDoc = null;
            if (window.DOMParser && window.XSLTProcessor) {
                var parser = new DOMParser();
                xmlDoc = parser.parseFromString(xmlString, "text/xml");
            } else {
                xmlDoc = new ActiveXObject("Msxml2.DOMDocument.3.0");
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString);

            }
            return xmlDoc;
        } catch (exception) {
            throw {
                name: "xmlTransformation",
                message: "CWN2.Util.parseXml: errore parsing xml - " + exception.message,
                level: 1
            };
        }
    },

    /**
     * Function: transformStrBounds
     *
     * Trasforma un bound in forma string da un sistema di coordinate ad un altro
     *
     * Parameters:
     * fromProjStr - {string} Codice EPSG del sistema di coordinate di partenza (es: "EPSG:3003")
     * toProjStr - {string} Codice EPSG del sistema di coordinate di arrivo
     *
     * Returns:
     * {string} Stringa del bound con coordinate separate da virgole
     *
     */
    transformStrBounds: function(fromProjStr, toProjStr, boundsStr) {

        CWN2.Util.log("CWN2.Util.transformStrBounds");

        if (fromProjStr === toProjStr) {
            return boundsStr;
        }

        var fromProj = new OpenLayers.Projection(fromProjStr),
            toProj = new OpenLayers.Projection(toProjStr);

        var boundStrIn = boundsStr;
        // Hack per shift lungo asse x e y
        if (fromProjStr === "EPSG:3003") {
            var boundArray = boundStrIn.split(",");
            boundArray[0] = parseInt(boundArray[0]) - parseInt(40);
            boundArray[2] = parseInt(boundArray[2]) - parseInt(40);
            boundArray[1] = parseInt(boundArray[1]) + parseInt(120);
            boundArray[3] = parseInt(boundArray[3]) + parseInt(120);
            boundStrIn = boundArray.join(",");
        }
        var bounds = new OpenLayers.Bounds.fromString(boundStrIn);
        return bounds.transform(fromProj, toProj).toString();

    },

    /**
     * Function: getArrayElementByAttribute
     *
     * Ritorna un elemento di un array contenente un attributo con un determinato valore
     *
     * Parameters:
     * array - {Array} array su cui cercare l'elemento
     * attributo - {string} Nome dell'attributo dell'elemento
     * value - {string} Valore dell'attributo
     *
     * Returns:
     * {Object} Oggetto
     *
     */
    getArrayElementByAttribute: function(array, attribute, value) {
        if (!array) {
            return null;
        }

        var len = array.length;

        for (var i = 0; i < len; i++) {
            if (array[i][attribute] === value) {
                return array[i];
            }
        }
        return null;
    },

    capitalizeString: function (str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    },

    endsWith: function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },

    /**
     * Function: geoCode
     *
     * Effettua il geocode di un indirizzo utilizzando i servizi google
     *
     * Parameters:
     * address - {string} Indirizzo
     * properties - {Object} oggetto contenente le proprietà da aggiungere all'oggetto properties della feature
     * callback - {function} funzione di callback
     *
     * Returns:
     * {GeoJSON Object}
     *
     */
    geoCode: function(address, properties, callback) {
        new google.maps.Geocoder().geocode({ "address": address }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                var x = results[0].geometry.location.lng();
                var y = results[0].geometry.location.lat();
                var feature = {
                    "type": "FeatureCollection",
                    "features": [
                        { "type": "Feature",
                            "geometry": {"type": "Point", "coordinates": [x, y]},
                            "properties": {
                                "address": address
                            }
                        }
                    ]
                };
                if (properties) {
                    for (var p in properties) {
                        if (properties.hasOwnProperty(p)) {
                            feature.features[0].properties[p] = properties[p];
                        }
                    }
                }
                callback(feature);
            } else {
                if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                    CWN2.Util.msgBox("Indirizzo '" + address + "' non trovato");
                } else {
                    CWN2.Util.handleException({
                        name: "BadGeocoding",
                        message: "Errore di geocoding: " + status,
                        level: 1
                    });
                }
            }
        });
    },


    /**
     * Function: getXmlDoc
     *
     * Effettua il parsing di una stringa xml e ritorna un doc xml
     *
     * Parameters:
     * xmlString - {string} Stringa xml
     *
     * Returns:
     * {xml doc}
     *
     */
    getXmlDoc: function(xmlString) {
        var doc;
        if(window.ActiveXObject){
            doc = new ActiveXObject("Microsoft.XMLDOM");
            doc.async = "false";
            doc.loadXML(xmlString);
        }else{
            doc = new DOMParser().parseFromString(xmlString,"text/xml");
        }
        return doc;
    },


    /**
     * Function: transformFilterCQL2json
     *
     * Trasforma una stringa cql un oggetto filtro json
     *
     * Parameters:
     * cqlFilterStr - {string} Stringa cql
     *
     * Returns:
     * {oggetto filtro}
     *
     */
    transformFilterCQL2json: function(cqlFilterStr) {
        var cqlFilter = new OpenLayers.Format.CQL().read(cqlFilterStr);
        var xmlFilter = new OpenLayers.Format.Filter.v1_0_0().write(cqlFilter);
        var xmlString = xmlFilter.innerHTML.replace(/ogc:/g, "");
        return new X2JS().xml_str2json(xmlString);
    },

    /**
     * Function: transformFilterJson2CQL
     *
     * Trasforma un oggetto filtro json in una stringa cql
     *
     * Parameters:
     * jsonFilter - filtro
     *
     * Returns:
     * {stringa cql}
     *
     */
    transformFilterJson2CQL: function(jsonFilter) {
        function traverse(o ) {
            for (i in o) {
                if (typeof(o[i])=="object") {
                    console.log(i, o[i])
                    traverse(o[i] );
                }
            }
        }

        var xmlFilter = new X2JS().json2xml(jsonFilter);
        var ogcFilter = new OpenLayers.Format.Filter.v1_1_0().read(xmlFilter);
        // hack per risolvere baco OpenLayers: valori numerici letterali vengono convertiti in numero (es: "08" --> 8)
        //ogcFilter.value = jsonFilter.Literal;
        var cqlFilter = new OpenLayers.Format.CQL().write(ogcFilter);
        return cqlFilter;
    },


/**
     * Function: unescapeHtmlEntities
     *
     * Decodifica caratteri html da una stringa contenente caratteri speciali codificati :
     * &amp; (&)
     * &quot; (")
     * &lt; (<)
     * &gt; (>)
     *
     * Parameters:
     * encodedString - {String} Stringa da decodificare
     *
     * Returns:
     * {String} - Stringa decodificata
     *
     * */
    unescapeHtmlEntities: function(encodedString) {
        encodedString = encodedString.replace(/\&amp;/g, '&');
        encodedString = encodedString.replace(/\&quot;/g, '\"');
        encodedString = encodedString.replace(/\&lt;/g, '<');
        encodedString = encodedString.replace(/\&gt;/g, '>');
        return encodedString;
    },

    // Funzione per il decode di html
    htmlDecode: function(string, quote_style) {

        function get_html_translation_table(table, quote_style) {
            var entities = {},
                hash_map = {},
                decimal;
            var constMappingTable = {},
                constMappingQuoteStyle = {};
            var useTable = {},
                useQuoteStyle = {};

            // Translate arguments
            constMappingTable[0] = 'HTML_SPECIALCHARS';
            constMappingTable[1] = 'HTML_ENTITIES';
            constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
            constMappingQuoteStyle[2] = 'ENT_COMPAT';
            constMappingQuoteStyle[3] = 'ENT_QUOTES';

            useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
            useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

            if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
                throw new Error("Table: " + useTable + ' not supported');
                // return false;
            }

            entities['38'] = '&amp;';
            if (useTable === 'HTML_ENTITIES') {
                entities['160'] = '&nbsp;';
                entities['161'] = '&iexcl;';
                entities['162'] = '&cent;';
                entities['163'] = '&pound;';
                entities['164'] = '&curren;';
                entities['165'] = '&yen;';
                entities['166'] = '&brvbar;';
                entities['167'] = '&sect;';
                entities['168'] = '&uml;';
                entities['169'] = '&copy;';
                entities['170'] = '&ordf;';
                entities['171'] = '&laquo;';
                entities['172'] = '&not;';
                entities['173'] = '&shy;';
                entities['174'] = '&reg;';
                entities['175'] = '&macr;';
                entities['176'] = '&deg;';
                entities['177'] = '&plusmn;';
                entities['178'] = '&sup2;';
                entities['179'] = '&sup3;';
                entities['180'] = '&acute;';
                entities['181'] = '&micro;';
                entities['182'] = '&para;';
                entities['183'] = '&middot;';
                entities['184'] = '&cedil;';
                entities['185'] = '&sup1;';
                entities['186'] = '&ordm;';
                entities['187'] = '&raquo;';
                entities['188'] = '&frac14;';
                entities['189'] = '&frac12;';
                entities['190'] = '&frac34;';
                entities['191'] = '&iquest;';
                entities['192'] = '&Agrave;';
                entities['193'] = '&Aacute;';
                entities['194'] = '&Acirc;';
                entities['195'] = '&Atilde;';
                entities['196'] = '&Auml;';
                entities['197'] = '&Aring;';
                entities['198'] = '&AElig;';
                entities['199'] = '&Ccedil;';
                entities['200'] = '&Egrave;';
                entities['201'] = '&Eacute;';
                entities['202'] = '&Ecirc;';
                entities['203'] = '&Euml;';
                entities['204'] = '&Igrave;';
                entities['205'] = '&Iacute;';
                entities['206'] = '&Icirc;';
                entities['207'] = '&Iuml;';
                entities['208'] = '&ETH;';
                entities['209'] = '&Ntilde;';
                entities['210'] = '&Ograve;';
                entities['211'] = '&Oacute;';
                entities['212'] = '&Ocirc;';
                entities['213'] = '&Otilde;';
                entities['214'] = '&Ouml;';
                entities['215'] = '&times;';
                entities['216'] = '&Oslash;';
                entities['217'] = '&Ugrave;';
                entities['218'] = '&Uacute;';
                entities['219'] = '&Ucirc;';
                entities['220'] = '&Uuml;';
                entities['221'] = '&Yacute;';
                entities['222'] = '&THORN;';
                entities['223'] = '&szlig;';
                entities['224'] = '&agrave;';
                entities['225'] = '&aacute;';
                entities['226'] = '&acirc;';
                entities['227'] = '&atilde;';
                entities['228'] = '&auml;';
                entities['229'] = '&aring;';
                entities['230'] = '&aelig;';
                entities['231'] = '&ccedil;';
                entities['232'] = '&egrave;';
                entities['233'] = '&eacute;';
                entities['234'] = '&ecirc;';
                entities['235'] = '&euml;';
                entities['236'] = '&igrave;';
                entities['237'] = '&iacute;';
                entities['238'] = '&icirc;';
                entities['239'] = '&iuml;';
                entities['240'] = '&eth;';
                entities['241'] = '&ntilde;';
                entities['242'] = '&ograve;';
                entities['243'] = '&oacute;';
                entities['244'] = '&ocirc;';
                entities['245'] = '&otilde;';
                entities['246'] = '&ouml;';
                entities['247'] = '&divide;';
                entities['248'] = '&oslash;';
                entities['249'] = '&ugrave;';
                entities['250'] = '&uacute;';
                entities['251'] = '&ucirc;';
                entities['252'] = '&uuml;';
                entities['253'] = '&yacute;';
                entities['254'] = '&thorn;';
                entities['255'] = '&yuml;';
            }

            if (useQuoteStyle !== 'ENT_NOQUOTES') {
                entities['34'] = '&quot;';
            }
            if (useQuoteStyle === 'ENT_QUOTES') {
                entities['39'] = '&#39;';
            }
            entities['60'] = '&lt;';
            entities['62'] = '&gt;';

            // ascii decimals to real symbols
            for (decimal in entities) {
                if (entities.hasOwnProperty(decimal)) {
                    hash_map[String.fromCharCode(decimal)] = entities[decimal];
                }
            }

            return hash_map;
        }

        var hash_map = {},
            symbol = '',
            tmp_str = '',
            entity = '';
        tmp_str = string.toString();

        if (false === (hash_map = get_html_translation_table('HTML_ENTITIES', quote_style))) {
            return false;
        }

        // fix &amp; problem
        // http://phpjs.org/functions/get_html_translation_table:416#comment_97660
        delete(hash_map['&']);
        hash_map['&'] = '&amp;';

        for (symbol in hash_map) {
            entity = hash_map[symbol];
            tmp_str = tmp_str.split(entity).join(symbol);
        }
        tmp_str = tmp_str.split('&#039;').join("'");
        tmp_str = t_str.split('&#39;').join("'");

        return tmp_str;
    }


});

/**
 *
 * Class: CWN2.I18n
 *
 * Gestione multilinguismo
 *
 */
Ext.define("CWN2.I18n", {

    singleton: true,

    dict: {
        "Scala": {
            "en": "Scale"
        },
        "Coordinate:": {
            "en": "Coordinates:"
        },
        "Ricerche": {
            "en": "Find"
        },
        "Attenzione": {
            "en": "Attention"
        },
        "Nessun indirizzo indicato": {
            "en": "No Address"
        },
        "Il punto è fuori dai limiti geografici della mappa": {
            "en": "Address is outside the map boundary"
        },
        "Indirizzo": {
            "en": "Address"
        },
        "Vai": {
            "en": "OK"
        },
        "Annulla": {
            "en": "Cancel"
        },
        "Aggiunta Livelli": {
            "en": "Add Layers"
        },
        "Zoom alla massima estensione": {
            "en": "Zoom to max extension"
        },
        "Zoom alla estensione iniziale": {
            "en": "Zoom to initial extension"
        },
        "Temi": {
            "en": "Themes"
        },
        "Aggiungi": {
            "en": "Add"
        },
        "Nessun livello selezionato": {
            "en": "No layer selected"
        },
        "Misure Areali": {
            "en": "Measure Area"
        },
        "Area": {
            "en": "Area"
        },
        "Misure Lineari": {
            "en": "Measure Line"
        },
        "Distanza": {
            "en": "Distance"
        },
        "Pan": {
            "en": "Pan"
        },
        "Togli Livelli": {
            "en": "Remove Layers"
        },
        "Seleziona i livelli da eliminare": {
            "en": "Select the layers to remove"
        },
        "Calcolo Percorsi": {
            "en": "Route Planner"
        },
        "Mezzo": {
            "en": "Mode"
        },
        "In auto": {
            "en": "Driving"
        },
        "A piedi": {
            "en": "Walking"
        },
        "Invio": {
            "en": "OK"
        },
        "Inverti direzione": {
            "en": "Swap"
        },
        "Seleziona punto di partenza sulla mappa": {
            "en": "Select start point on map"
        },
        "Seleziona punto di arrivo sulla mappa": {
            "en": "Select end point on map"
        },
        "Distanza totale": {
            "en": "Distance"
        },
        "Durata totale": {
            "en": "Duration"
        },
        "Calcola": {
            "en": "OK"
        },
        "Reset": {
            "en": "Reset"
        },
        "Zoom In": {
            "en": "Zoom In"
        },
        "Zoom Successivo": {
            "en": "Zoom Next"
        },
        "Zoom Out": {
            "en": "Zoom Out"
        },
        "Zoom Precedente": {
            "en": "Zoom Previous"
        },
        "Trasparenza": {
            "en": "Transparency"
        },
        "Sfondi": {
            "en": "Base Layer"
        },
        "Livelli": {
            "en": "Overlays"
        },
        "": {
            "en": ""

        }

    },

    /**
     *
     *  Function: get
     *
     *  Ritorna una stringa dal dizionario nella lingua impostata.
     *
     *  Parameters:
     *  string - {string} Stringa

     */
    get: function get(string) {

        if (CWN2.I18n.dict[string]) {
            return CWN2.I18n.dict[string][CWN2.Globals.language] || string;
        } else {
            return string;
        }

    }
});


/**
 *
 *
 * Class:CWN2.GoogleGeocoderCombo
 * Combo ExtJS per il geocoding google. Estende Ext.form.ComboBox
 *

 *
 */

Ext.define('CWN2.BaseLayersComboBox', {

    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.cwn2-base-layers-combobox',
    queryMode: 'local',
    displayField: 'legendLabel',
    valueField: 'name',
    triggerAction: 'all',
    //fieldLabel: 'Sfondo',
    editable: false,
    width: 150,

    /**
     *
     * Constructor: CWN2.BaseLayersComboBox
     *
     * Crea una combo per la selezione dei layer di sfondo.
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


        this.store = CWN2.app.map.layerManager.baseLayerStore;

        // call parent constructor
        this.superclass.constructor.call(this, config);

        // imposto base layer iniziale
        var baseLayer;
        Ext.each(CWN2.app.map.layerManager.baseLayersConfig, function(layer) {
            if (layer.visible === true) {
                baseLayer = layer.name;
                return false;
            }
        });
        this.setValue(baseLayer);

        this.on({
            select: this.onSelect,
            scope: this
        });

    },

    onSelect: function(cmb, record, index) {
        CWN2.app.map.setBaseLayerOnMap(record[0].data.name);
    }


});

/**
 *
 * Class: CWN2.Editor
 *
 * Raccoglie le funzioni per l'editing delle geometrie
 *
 */
Ext.define("CWN2.Editor", {

    singleton: true,

    /**
     *
     * Function: createEditingLayer
     *
     * Crea un il layer vettoriale per l'editing.
     *
     * Parameters:
     *
     * Returns:
     * {OpenLayers.Layer} - Il layer OL creato
     *
     */
    createEditingLayer: function createEditingLayer(map, styleMap) {
        CWN2.Util.log("CWN2.Editor.createEditingLayer ");

        var classes = (styleMap) ? { "filter": null, "styleMaps": styleMap } : getClasses();

        var editingLayer = map.layerManager.createVectorLayer({
            name: "editingLayer",
            format: "GeoJSON",
            classes: classes
        });

        // registro gli eventi per il controllo ModifyFeature che deattivano e attivano i controlli base
        editingLayer.events.on({
            "beforefeaturemodified": function() {
                map.featureManager.deactivateControls();
            },
            "afterfeaturemodified": function() {
                map.featureManager.activateControls();
            }
        });
        return editingLayer;

        function getClasses() {
            var styleMaps = [
                {
                    "renderIntent": "default",
                    "style": {
                        pointRadius: 6,
                        fillColor: "#ee9900",
                        fillOpacity: 0.0,
                        hoverFillColor: "white",
                        hoverFillOpacity: 0.8,
                        strokeColor: "#ee9900",
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        strokeLinecap: "round",
                        strokeDashstyle: "solid",
                        hoverStrokeColor: "red",
                        hoverStrokeOpacity: 1,
                        hoverStrokeWidth: 0.2,
                        hoverPointRadius: 1,
                        hoverPointUnit: "%",
                        pointerEvents: "visiblePainted",
                        cursor: "inherit"
                    }
                },
                {
                    "renderIntent": "select",
                    "style": {
                        pointRadius: 6,
                        fillColor: "blue",
                        fillOpacity: 0.0,
                        hoverFillColor: "white",
                        hoverFillOpacity: 0.8,
                        strokeColor: "blue",
                        strokeOpacity: 1,
                        strokeWidth: 2,
                        strokeLinecap: "round",
                        strokeDashstyle: "solid",
                        hoverStrokeColor: "red",
                        hoverStrokeOpacity: 1,
                        hoverStrokeWidth: 0.2,
                        hoverPointRadius: 1,
                        hoverPointUnit: "%",
                        pointerEvents: "visiblePainted",
                        cursor: "pointer"

                    }
                },
                {
                    "renderIntent": "hover",
                    "style": {
                        pointRadius: 6,
                        fillColor: "blue",
                        fillOpacity: 0.0,
                        hoverFillColor: "white",
                        hoverFillOpacity: 0.8,
                        strokeColor: "blue",
                        strokeOpacity: 1,
                        strokeWidth: 2,
                        strokeLinecap: "round",
                        strokeDashstyle: "solid",
                        hoverStrokeColor: "red",
                        hoverStrokeOpacity: 1,
                        hoverStrokeWidth: 0.2,
                        hoverPointRadius: 1,
                        hoverPointUnit: "%",
                        pointerEvents: "visiblePainted",
                        cursor: "pointer"

                    }
                },
                {
                    "renderIntent": "temporary",
                    "style": {
                        fillColor: "#66cccc",
                        fillOpacity: 0.0,
                        hoverFillColor: "white",
                        hoverFillOpacity: 0.8,
                        strokeColor: "#66cccc",
                        strokeOpacity: 1,
                        strokeLinecap: "round",
                        strokeWidth: 2,
                        strokeDashstyle: "solid",
                        hoverStrokeColor: "red",
                        hoverStrokeOpacity: 1,
                        hoverStrokeWidth: 0.2,
                        pointRadius: 6,
                        hoverPointRadius: 1,
                        hoverPointUnit: "%",
                        pointerEvents: "visiblePainted",
                        cursor: "inherit"
                    }
                }
            ];

            return [
                { "filter": null, "styleMaps": styleMaps }
            ];
        }
    },
    /**
     *
     * Function: getEditingGeom
     *
     * Ritorna le geometrie in formato GeoJSON che sono sul layer di editing
     *
     * Parameters:
     * map - {CWN2.Map} Oggetto mappa contenente il layer di editing
     *
     * Returns:
     * {String/Array} - Stringa contenente la geometria in formato GeoJSON oppure
     * un array di stringhe nel caso di geometrie multiple
     *
     */
    getEditingGeom: function getEditingGeom(map, format) {

        CWN2.Util.log("CWN2.Editor.getEditingGeom ");

        var editingLayer = map.getLayerByName("editingLayer");

        if (editingLayer.features.length === 0) {
            return null;
        }

        if (editingLayer.features.length === 1) {
            if (format === "WKT") {
                if (map.projection !== map.displayProjection) {
                    return editingLayer.features[0].geometry.clone().transform(map.projection, map.displayProjection).toString();
                } else {
                    return editingLayer.features[0].geometry.toString();
                }
            } else {
                return getGeoJSONGeometry(map, editingLayer.features[0].geometry);
            }
        }

        if (editingLayer.features.length > 1) {
            var geomArray = [],
                len = editingLayer.features.length;

            for (var i = 0; i < len; i++) {
                if (format === "WKT") {
                    if (map.projection !== map.displayProjection) {
                        geomArray.push(editingLayer.features[0].geometry.clone().transform(map.projection, map.displayProjection).toString());
                    } else {
                        geomArray.push(editingLayer.features[0].geometry.toString());
                    }
                } else {
                    geomArray.push(getGeoJSONGeometry(map, editingLayer.features[i].geometry));
                }
            }
            return geomArray;
        }

        function getGeoJSONGeometry(map, geometry) {
            if (map.projection !== map.displayProjection) {
                geometry = geometry.clone().transform(map.projection, map.displayProjection);
            }

            var geoJSON = new OpenLayers.Format.GeoJSON();
            var geoJSONStr = geoJSON.write(geometry);
            return Ext.JSON.decode(geoJSONStr);
        }

    },

    /**
     *
     * Function: getAreaGeom
     *
     * Ritorna l'area della geometrie che è sul layer di editing
     *
     * Parameters:
     * map - {CWN2.Map} Oggetto mappa contenente il layer di editing
     *
     * Returns:
     * {Float} - Area
     *
     */
    getAreaGeom: function getAreaGeom(map) {
        var editingLayer = map.getLayerByName("editingLayer");
        var len = editingLayer.features.length;
        var area = 0;
        for (var i = 0; i < len; i++) {
            area = area + editingLayer.features[0].geometry.getArea('m');
        }
        return area;
    },

    /**
     *
     * Function: getAreaGeom
     *
     * Ritorna il bound della geometria
     *
     * Parameters:
     * map - {CWN2.Map} Oggetto mappa contenente il layer di editing
     *
     * Returns:
     * {Bounds} - Bounds
     *
     */
    getGeometryBounds: function getGeometryBounds(map) {
        var editingLayer = map.getLayerByName("editingLayer");

        if (editingLayer.features.length === 1) {
            var bounds = editingLayer.features[0].geometry.bounds;
            if (map.projection !== map.displayProjection) {
                return bounds.transform(new OpenLayers.Projection(map.projection), map.displayProjection);
            } else {
                return bounds;
            }

        } else {
            return null;
        }
    }
});

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

/**
 *
 * Class: CWN2.FeatureManager
 *
 * Gestore dei controlli per le features vettoriali.
 *
 * Crea i controlli OL di tipo FeatureSelect per select/hover.
 *
 * Comprende le funzioni di callback richiamate sull'evento "featureselect"
 *
 *
 */
Ext.define("CWN2.FeatureManager", {

    selectFeatureControl: null,
    hoverFeatureControl: null,
    map: null,
    // dizionario delle funzioni di callback registrate
    registeredCallbacks: {
        "onFeatureSelect": [],
        "onFeatureUnselect": [],
        "onFeatureOver": [],
        "onFeatureOut": []
    },

    /**
     *
     * Function: registerCallback
     *
     * Registra una  funzione di callback
     *
     * Parameters:
     * event - {String} evento
     * callback - {Function} funzione di callback
     *
     * Return:
     * {Boolean} true se la feature � tra quelle selezionate
     *
     */
    registerCallback: function(event, callback) {
        this.registeredCallbacks[event].push(callback);
    },

    /**
     *
     * Function: getRegisteredCallbacks
     *
     * Ritorna una funzione di callback associata ad un evento
     *
     * Parameters:
     * event - {String} evento
     *
     * Return:
     * {Function} funzione di callback
     *
     */
    getRegisteredCallbacks: function(event) {
        return this.registeredCallbacks[event];
    },

    // Attiva il controllo OL
    activateHoverFeatureControl: function(vectLayerArray) {

        // funzione richiamata sull"evento mouseover della feature
        var onFeatureOver = function(feature, callbacks) {
            Ext.each(callbacks, function(callback) {
                if (typeof callback === "function") {
                    callback(feature);
                }
            });
        };

        // funzione richiamata sull'evento mouseout della feature
        var onFeatureOut = function(feature, callbacks) {
            Ext.each(callbacks, function(callback) {
                if (typeof callback === "function") {
                    callback(feature);
                }
            });
        };

        var featureOutCallbacks = this.getRegisteredCallbacks("onFeatureOut");
        var featureOverCallbacks = this.getRegisteredCallbacks("onFeatureOver");

        this.hoverFeatureControl = new OpenLayers.Control.SelectFeature(vectLayerArray, {
            hover: true,
            renderIntent: "hover",
            highlightOnly: true,
            eventListeners: {
                featurehighlighted: function(e) {
                    onFeatureOver(e.feature, featureOverCallbacks);
                },
                featureunhighlighted: function(e) {
                    onFeatureOut(e.feature, featureOutCallbacks);
                }
            }
        });

        this.hoverFeatureControl.name = "hoverFeatureControl";
        this.map.addControl(this.hoverFeatureControl);
        this.hoverFeatureControl.activate();

    },

    // Attiva il controllo OL
    activateSelectFeatureControl: function(vectLayerArray) {

        // funzione richiamata sull'evento select della feature
        var onFeatureSelect = function(feature, callbacks) {
            CWN2.InfoPopupManager.onFeatureSelect(feature);

            Ext.each(callbacks, function(callback) {
                if (typeof callback === "function") {
                    callback(feature);
                }
            });
        };

        // funzione richiamata sull'evento unselect della feature
        var onFeatureUnselect = function(feature, callbacks) {
            CWN2.InfoPopupManager.onFeatureUnselect(feature);

            Ext.each(callbacks, function(callback) {
                if (typeof callback === "function") {
                    callback(feature);
                }
            });
        };

        var featureSelectCallbacks = this.getRegisteredCallbacks("onFeatureSelect");
        var featureUnselectCallbacks = this.getRegisteredCallbacks("onFeatureUnselect");

        this.selectFeatureControl = new OpenLayers.Control.SelectFeature(vectLayerArray);
        this.selectFeatureControl.onSelect = function(feature) {
            onFeatureSelect(feature, featureSelectCallbacks);
        };
        this.selectFeatureControl.onUnselect = function(feature) {
            onFeatureUnselect(feature, featureUnselectCallbacks);
        };
        this.selectFeatureControl.name = "selectFeatureControl";

        this.map.addControl(this.selectFeatureControl);
        this.selectFeatureControl.activate();

    },

    /**
     *
     * Function: registerLayerAction
     *
     * Registra le azioni collegate ai layer vettoriali
     *
     * Parameters:
     * layersConfig - {Array} Array di configurazione dei layer
     *
     */
    registerLayerAction: function(layersConfig) {

        var me = this,
            event,
            callbackName,
            callback,
            exception;

        Ext.each(layersConfig, function(layer) {
            if (layer.actions && layer.actions.length > 0) {
                Ext.each(layer.actions, function(action) {
                    // controllo che esistano actions.event e actions.callback in configurazione
                    event = layer.action.event;
                    if (!event) {
                        exception = {
                            name: 'BadAction',
                            message: 'CWN2.FeatureManager.registerLayerAction: event non definito',
                            level: 1
                        };
                        CWN2.util.handleException(exception);
                        return false;
                    }
                    callbackName = layer.action.callback;
                    if (!callbackName) {
                        exception = {
                            name: 'BadAction',
                            message: 'CWN2.FeatureManager.registerLayerAction: calback non definito',
                            level: 1
                        };
                        CWN2.util.handleException(exception);
                        return false;
                    }
                    callback = CWN2.FeatureManager.layerActionsRegistry[callbackName];
                    if (typeof callback !== "function") {
                        exception = {
                            name: 'BadCallbackName',
                            message: 'CWN2.FeatureManager.registerLayerAction: funzione di callback ' + callbackName + ' non esiste',
                            level: 1
                        };
                        CWN2.util.handleException(exception);
                        return false;
                    }

                    // registro la action
                    me.registerCallback(
                        layer.action.event,
                        callback
                    );
                });
            }
        });

    },

    updateControlLayer: function() {
        var vectLayers = this.map.getLayersByClass("OpenLayers.Layer.Vector");

        // ATTENZIONE: NON MODIFICARE L'ORDINE DI AGGIORNAMENTO DEI CONTROLLI
        this.hoverFeatureControl.setLayer(vectLayers);
        this.selectFeatureControl.setLayer(vectLayers);
    },

    activateControls: function() {
        // ATTENZIONE:
        // NON MODIFICARE L'ORDINE DI AGGIORNAMENTO DEI CONTROLLI
        this.hoverFeatureControl.activate();
        this.selectFeatureControl.activate();
    },

    deactivateControls: function() {
        // ATTENZIONE:
        // NON MODIFICARE L'ORDINE DI AGGIORNAMENTO DEI CONTROLLI
        this.hoverFeatureControl.deactivate();
        this.selectFeatureControl.deactivate();
    },

    constructor: function(map) {
        this.map = map;

        // carico l'array con i layer vettoriali
        var vectLayerArray = map.getLayersByClass("OpenLayers.Layer.Vector");

        // ATTENZIONE:
        // NON MODIFICARE L'ORDINE DI CREAZIONE DEI CONTROLLI
        // L'ULTIMO DEVE ESSERE QUELLO PER LA SELECT
        // NON MODIFICARE LA MODALITA' DI CREAZIONE DEI CONTROLLI DI OVER
        this.activateHoverFeatureControl(vectLayerArray);
        this.activateSelectFeatureControl(vectLayerArray);

        // registro le action sui layer vettoriali
        this.registerLayerAction(map.layerManager.getLayersConfig());
    },

    statics: {

        /*
         * Registro delle action associate ai layer
         *
         */
        layerActionsRegistry: {
            /**
             * Function: testOver
             * Funzione di test per verificare la registrazione del callback sull'evento mouseover
             *
             */
            testOver: function(feature) {
                CWN2.Util.log(feature);
            },

            /**
             * Function: testOut
             * Funzione di test per verificare la registrazione del callback sull'evento mouseout
             *
             */
            testOut: function(feature) {
                CWN2.Util.log(feature);
            },

            /**
             * Function: testSelect
             * Funzione di test per verificare la registrazione del callback sull'evento select
             *
             */
            testSelect: function(feature) {
                CWN2.Util.log(feature);
            },

            /**
             * Function: testUnselect
             * Funzione di test per verificare la registrazione del callback sull'evento unselect
             *
             */
            testUnselect: function(feature) {
                CWN2.Util.log(feature);
            }
        }
    }
});





/**
 *
 * Class: CWN2.FeatureSelecter
 *
 *
 * Oggetto per la selezione programmatica di feature
 *
 */
Ext.define("CWN2.FeatureSelecter", {

    singleton: true,

    /**
     *
     * Function: selectFeature
     *
     * Selezione programmatica feature di un layer vettoriali.
     *
     * Se pi� feature soddisfano il criterio di selezione solo la prima viene selezionata.
     *
     * Se impostato il parametro options.hiliteOnly=true viene fatto solo l'highlight della feaure.
     *
     * Se impostato il parametro feature viene selezionata la feature,
     * altrimenti viene fatta una ricerca della feature sul layer in base alla configurazione del parametro config.
     *
     *
     * Parameters:
     * config - {Object} Oggetto di configurazione dell'hilite
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

    selectFeature: function selectFeature(selectConfig, feature) {

        try {
            CWN2.Util.assert(selectConfig,
                {
                    name: "BadParameter",
                    message: "CWN2.featureSelected.selectFeature: selectConfig deve essere valorizzato",
                    level: 1
                }
            );
            CWN2.Util.assert(selectConfig.layer,
                {
                    name: "BadParameter",
                    message: "CWN2.featureSelected.selectFeature: layer deve essere valorizzato",
                    level: 1
                }
            );
            CWN2.Util.assert(feature || selectConfig.attrName,
                {
                    name: "BadParameter",
                    message: "CWN2.featureSelected.selectFeature: attrName (oppure feature) deve essere valorizzato",
                    level: 1
                }
            );
            CWN2.Util.assert(
                ( feature ||
                    ( selectConfig.item !== null && selectConfig.item !== undefined )
                    ),
                {
                    name: "BadParameter",
                    message: "CWN2.featureSelected.selectFeature: item (oppure feature) deve essere valorizzato",
                    level: 1
                }
            );
        } catch (e) {
            throw e;
        }

        // configurazione hilite
        var layer = selectConfig.layer,
            attrName = selectConfig.attrName,
            item = selectConfig.item,
            options = selectConfig.options || {"zoom": false, "hiliteOnly": false},
            zoom = options.zoom,
            maxZoomLevel = options.maxZoomLevel,
            hiliteOnly = options.hiliteOnly,
            multiSelect = options.multiSelect,
            foundFeatures,
            foundFeature;

        if (feature) {
            foundFeature = feature;
        } else {
            // cerco nelle feature del layer quelle che soddisfano il criterio e seleziono la prima
            foundFeatures = layer.getFeaturesByAttribute(attrName, item);
            if (foundFeatures.length > 0) {
                foundFeature = foundFeatures[0];
            }
        }
        if (foundFeature) {
            if (hiliteOnly) {
                layer.map.featureManager.hoverFeatureControl.highlight(foundFeature);
            } else {
                var selectFeatureControl = layer.map.featureManager.selectFeatureControl;
                if (!multiSelect) {
                    selectFeatureControl.unselectAll();
                }
                selectFeatureControl.select(foundFeature);
            }
            // se impostato flag per zoom faccio lo zoom
            if (zoom) {
//                layer.map.zoomToFeatures(layer.selectedFeatures, maxZoomLevel);
                layer.map.zoomToFeatures([foundFeature], maxZoomLevel);
            }
        }
    },

    /**
     *
     * Function: unselectFeature
     *
     * Deselezione programmatica feature di un layer vettoriali.
     *
     * Se pi� feature soddisfano il criterio di selezione solo la prima viene deselezionata.
     *
     * Se impostato il parametro options.hiliteOnly=true viene fatto solo l'unhighlight della feaure.
     *
     * Se impostato il parametro feature viene deselezionata la feature,
     * altrimenti viene fatta una ricerca della feature sul layer in base alla configurazione del parametro config
     *
     *
     * Parameters:
     * config - {Object} Oggetto di configurazione dell'hilite
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

    unselectFeature: function unselectFeature(selectConfig, feature) {

        //CWN2.Util.log("CWN2.featureSelected.unselectFeature");

        try {
            CWN2.Util.assert(selectConfig,
                {
                    name: "BadParameter",
                    message: "CWN2.featureSelected.unselectFeature: selectConfig deve essere valorizzato",
                    level: 1
                }
            );
            CWN2.Util.assert(selectConfig.layer,
                {
                    name: "BadParameter",
                    message: "CWN2.featureSelected.unselectFeature: layer deve essere valorizzato",
                    level: 1
                }
            );
            CWN2.Util.assert(feature || selectConfig.attrName,
                {
                    name: "BadParameter",
                    message: "CWN2.featureSelected.unselectFeature: attrName (oppure feature) deve essere valorizzato",
                    level: 1
                }
            );
            CWN2.Util.assert(feature || selectConfig.item,
                {
                    name: "BadParameter",
                    message: "CWN2.featureSelected.unselectFeature: item (oppure feature) deve essere valorizzato",
                    level: 1
                }
            );
        } catch (e) {
            throw e;
        }

        // configurazione hilite
        var layer = selectConfig.layer,
            attrName = selectConfig.attrName,
            item = selectConfig.item,
            options = selectConfig.options || {"hiliteOnly": false},
            hiliteOnly = options.hiliteOnly,
            foundFeatures,
            foundFeature,
            selectConfig2 = {};

        if (feature) {
            foundFeature = feature;
        } else {
            // cerco nelle feature del layer quelle che soddisfano il criterio e seleziono la prima
            foundFeatures = layer.getFeaturesByAttribute(attrName, item);
            if (foundFeatures.length > 0) {
                foundFeature = foundFeatures[0];
            }
        }

        if (foundFeature) {
            if (hiliteOnly) {
                layer.map.featureManager.hoverFeatureControl.unhighlight(foundFeature);
                if (foundFeature.isSelected()) {
                    selectConfig2.layer = selectConfig.layer;
                    selectConfig2.attrName = selectConfig.attrName;
                    selectConfig2.item = selectConfig.item;
                    selectConfig2.options = {"hiliteOnly": false};
                    selectFeature(selectConfig2, foundFeature);

                }
            } else {
                layer.map.featureManager.selectFeatureControl.unselect(foundFeature);
            }
        }
    }

});

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

/**
 *
 * Class: CWN2.Globals
 *
 * Variabili globali
 *
 */
Ext.define("CWN2.Globals", {
    singleton: true,

    language: "it",
    debug: false,
    proxy: null,

    USE_SUBDOMAINS: false,

    DEFAULT_PROXY: "/geoservices/proxy/proxy.jsp?url=",

    OL_IMG_PATH: "http://geoportale.regione.liguria.it/geoviewer/lib/OpenLayers/img/",

    BING_MAPS_KEY: "Agzh6x2xuNQ4qhwHW_yc0Yd8vhb-5pMRsAHjkneosLHLesOAGqxv35yqxZBlqqVa",

    RL_MAP_CONFIG_SERVICE: "http://geoportale.regione.liguria.it/geoservices/REST/config/map/",
    RL_AG_REQUEST_CONFIG_SERVICE: "http://geoportale.regione.liguria.it/geoservices/REST/config/ag_request/",
    RL_LAYER_CONFIG_SERVICE: "http://geoportale.regione.liguria.it/geoservices/REST/config/layer/",
    RL_CREATE_SLD_SERVICE: "http://geoportale.regione.liguria.it/geoservices/REST/config/create_sld/",

    GOOGLE_GEOCODE_PROXY: "http://geoportale.regione.liguria.it/geoservices/REST/proxy/google_geocode?region=it&language=it&sensor=false&bounds=7.43,43.75|10.00,44.70",

    INFO_WMS_MAX_FEATURES: 10,

    BASE_RESOLUTIONS: [
        156543.03390625,
        78271.516953125,
        39135.7584765625,
        19567.87923828125,
        9783.939619140625,
        4891.9698095703125,
        2445.9849047851562,
        1222.9924523925781,
        611.4962261962891,
        305.74811309814453,
        152.87405654907226,
        76.43702827453613,
        38.218514137268066,
        19.109257068634033,
        9.554628534317017,
        4.777314267158508,
        2.388657133579254,
        1.194328566789627,
        0.5971642833948135      // 1:1693
        ,0.29858214169740677
        ,0.14929107084870338
    ],

    DEFAULT_CONFIG: {
        "application": {
            "mapOptions": {
                "projection": "EPSG:3857",
                "displayProjection": "EPSG:25832",
                "initialExtent": "830036,5402959,1123018,5597635"
            },
            "layout": {
                "type": "viewport"
            }
        },
        "baseLayers": [
            {
                "type": "bing_aerial",
                "legend": {
                    "label": "Bing Aerial",
                    "icon": "http://geoportale.regione.liguria.it/geoviewer/img/legend/bing.jpeg"
                },
                "visible": false
            }
        ]
    },

    DEFAULT_BASE_LAYERS_LEGEND: {
        'no_base': {
            label: "Sfondo Bianco",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/bianco.gif"
        },
        'OSM': {
            label: "OpenStreetMap",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/openstreetmap.png"
        },
        'google_roadmap': {
            label: "Google Stradario",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/google.png"
        },
        'google_hybrid': {
            label: "Google Ibrido",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/google.png"
        },
        'google_terrain': {
            label: "Google Terreno",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/google.png"
        },
        'google_satellite': {
            label: "Google Satellite",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/google.png"
        },
        'bing_road': {
            label: "Bing Road",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/bing.jpeg"
        },
        'bing_hybrid': {
            label: "Bing Hybrid",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/bing.jpeg"
        },
        'bing_aerial': {
            label: "Bing Aerial",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/bing.jpeg"
        },
        'rl_ortofoto_2000': {
            label: "Ortofoto IT 2000",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_ortofoto_2007': {
            label: "Ortofoto 2007",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_ortofoto_2010': {
            label: "AGEA: Ortofoto 2010",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_ortofoto_2013': {
            label: "AGEA: Ortofoto 2013",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_ortofoto_2016': {
            label: "AGEA: Ortofoto 2016",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_carte_base': {
            label: "Carte di base regionali",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_ortofoto_2013_GS': {
            label: "AGEA: Ortofoto 2013",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        },
        'rl_carte_base_GS': {
            label: "Carte di base regionali",
            icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/sfondi_rl.jpg"
        }

    },

    DEFAULT_RENDER_INTENTS: ["default","select","hover","temporary"],

    MAP_BASE_CONTROL_CONFIG: [
        {
            "type": "control",
            "name": "ArgParser"
        },
        {
            "type": "control",
            "name": "Attribution"
        },
        {
            "type": "control",
            "name": "KeyboardDefaults"
        },
        {
            "type": "control",
            "name": "Navigation"
        },
        {
            "type": "control",
            "name": "LoadingPanel"
        }
    ],

    RUOLO: "PUBBLICO",

    COLOR_SCALES: {
        Rosso: {
            3: ["#fee0d2","#fc9272","#de2d26"],
            4: ["#fee5d9","#fcae91","#fb6a4a","#cb181d"],
            5: ["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"],
            6: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"],
            7: ["#fee5d9","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
            8: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#99000d"],
            9: ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"]
        },
        Blu: {
            3: ["#deebf7","#9ecae1","#3182bd"],
            4: ["#eff3ff","#bdd7e7","#6baed6","#2171b5"],
            5: ["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"],
            6: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"],
            7: ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
            8: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"],
            9: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"]
        },
        Verde: {
            3: ["#e5f5e0","#a1d99b","#31a354"],
            4: ["#edf8e9","#bae4b3","#74c476","#238b45"],
            5: ["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],
            6: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#31a354","#006d2c"],
            7: ["#edf8e9","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
            8: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#005a32"],
            9: ["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"]
        },
        Grigio: {
            3: ["#f0f0f0","#bdbdbd","#636363"],
            4: ["#f7f7f7","#cccccc","#969696","#525252"],
            5: ["#f7f7f7","#cccccc","#969696","#636363","#252525"],
            6: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#636363","#252525"],
            7: ["#f7f7f7","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
            8: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525"],
            9: ["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"]
        },
        Random: {
            3: ["#377eb8","#4daf4a","#e41a1c"],
            4: ["#377eb8","#4daf4a","#e41a1c","#984ea3"],
            5: ["#377eb8","#4daf4a","#e41a1c","#984ea3","#ff7f00"],
            6: ["#377eb8","#4daf4a","#e41a1c","#984ea3","#ff7f00","#ffff33"],
            7: ["#377eb8","#4daf4a","#e41a1c","#984ea3","#ff7f00","#ffff33","#a65628"],
            8: ["#377eb8","#4daf4a","#e41a1c","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf"],
            9: ["#377eb8","#4daf4a","#e41a1c","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]
        }
    },

    set: function(initOptions) {
        // impostazioni CWN2
        CWN2.Globals.debug = ((initOptions.debug) || (CWN2.Util.getUrlParam("debug") === "true"));
        CWN2.Globals.proxy = initOptions.proxy || CWN2.Globals.DEFAULT_PROXY;
        CWN2.Globals.language = initOptions.language || "it";
        // impostazioni OL
        OpenLayers.ProxyHost = CWN2.Globals.proxy;
        OpenLayers.Layer.Vector.prototype.renderers = ["SVG2", "SVG", "VML", "Canvas"];
        OpenLayers.ImgPath = CWN2.Globals.OL_IMG_PATH;

    }

});


/**
 *
 * Class: CWN2.IframeWindow
 *
 * Crea una finestra ExtJS con un pannello contenente un Iframe con un documento esterno (html/pdf/ecc...)
 *
 */

Ext.define('CWN2.IframeWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-iframe-window',

    layout: 'fit',
    renderTo: window.document.body,
    renderSelectors: {
        iframeEl: 'iframe'
    },

    loadDocument: function(uri) {
        var el = this.iframeEl;

        // Windows are lazy and render themselves to the DOM
        // only when they're shown the first time, so if you
        // call loadDocument before first show(), the iframeEl
        // will be missing. This is to avoid the kaboom.
        if (el) {
            el.set({ src: uri });
        }
    },

    constructor: function(config) {
        var defaultConfig = {
            height: config.height || 400,
            width: config.width || 600,
            items: [
                {
                    xtype: 'box',
                    autoEl: {
                        tag: 'iframe',
                        src: config.url
                    }
                }
            ],
            id: config.id,
            resizable: (config.resizable === false) ? false : true,
            listeners: config.listeners
        };

        if (config.hide) {
            defaultConfig.closeAction = 'hide';
        }

        this.superclass.constructor.call(this, defaultConfig);
        //if (!config.hide) {
        //    this.show();
        //}
        Ext.WindowManager.register(this);
        Ext.WindowManager.bringToFront(this);
    }

});


/**
 *
 * Class: CWN2.InfoPopupManager
 *
 * Gestore delle funzioni per la info e le popup
 *
 *
 */
Ext.define("CWN2.InfoPopupManager", {

    singleton: true,

    /**
     *
     * Function: onFeatureSelect
     *
     * Gestisce le operazioni di info e gestione popup.
     * Richiamato sulla select della feature
     *
     * Parameters:
     * feature - {OpenLayers.Feature} Feature
     *
     */
    onFeatureSelect: function(feature) {
        var configOptions = CWN2.InfoPopupManager.getConfigOptions(feature);

        if (configOptions.infoPopUp) {
            CWN2.InfoPopupManager.loadPopUp(feature, configOptions);
        } else if (configOptions.infoUrl) {
            CWN2.InfoPopupManager.info(feature, configOptions);
        }
    },

    /**
     *
     * Function: onFeatureUnselect
     *
     * Gestisce le operazioni di info e gestione popup.
     * Richiamato sulla unselect della feature
     *
     * Parameters:
     * feature - {OpenLayers.Feature} Feature
     *
     */
    onFeatureUnselect: function(feature) {
        CWN2.InfoPopupManager.destroyPopup(feature);
    },

    getConfigOptions: function(feature) {
        var configOptions = {};

        configOptions.layerName = feature.layer.name;
        configOptions.layerConfig = feature.layer.map.layerManager.getLayerConfigByName(configOptions.layerName) || {};
        configOptions.infoOptions = configOptions.layerConfig.infoOptions || {
            "infoLabelAttr": null,
            "infoUrl": null,
            "infoTarget": null,
            "infoWidth": null,
            "infoHeight": null,
            "infoPopUp": null
        };
        configOptions.infoLabelAttr = feature.attributes.infoLabelAttr || configOptions.infoOptions.infoLabelAttr;
        configOptions.infoUrl = feature.attributes.infoUrl || configOptions.infoOptions.infoUrl;
        configOptions.infoTarget = feature.attributes.infoTarget || configOptions.infoOptions.infoTarget;
        configOptions.infoWidth = feature.attributes.infoWidth || configOptions.infoOptions.infoWidth;
        configOptions.infoHeight = feature.attributes.infoHeight || configOptions.infoOptions.infoHeight;
        configOptions.infoPopUp = feature.attributes.infoPopUp || configOptions.infoOptions.infoPopUp;

        return configOptions;
    },

    info: function(feature, configOptions) {
        // attribute replacement {$attribute_name} - utilizzo la funzione OpenLayers.Style.createLiteral
        var infoUrl = OpenLayers.Style.createLiteral(configOptions.infoUrl, feature.attributes, feature);

        var map = feature.layer.map;

        if (configOptions.infoTarget) {
            if (configOptions.infoTarget === "panel") {
                var id = "layerInfoMediaWin";
                var mediaWin = new CWN2.IframeWindow({
                    url: infoUrl,
                    width: configOptions.infoWidth,
                    height: configOptions.infoHeight,
                    id: id,
                    resizable: false
                }).show();
                // gestisco la deselezione della feature quando chiudo la finestra
                mediaWin.on("destroy",
                    function() {
                        map.featureManager.selectFeatureControl.unselect(this);
                    },
                    feature
                );
            }
            else {
                var options = "status=yes, toolbar=yes, menubar=no, width=" + configOptions.infoWidth + ", height=" + configOptions.infoHeight + ", resizable=yes, scrollbars=yes";
                window.open(infoUrl, configOptions.infoTarget, options);
            }
        } else {
            window.document.location.href = infoUrl;
        }

    },

    loadPopUp: function(feature, configOptions) {
        var infoPopUp = (configOptions.infoPopUp === "simple") ? CWN2.InfoPopupManager.buildSimplePopup(feature, configOptions) :
            (configOptions.infoPopUp === "default") ? CWN2.InfoPopupManager.buildDefaultPopup(configOptions) :
            configOptions.infoPopUp;


        var popUpWidth = configOptions.infoWidth || 150,
            popUpHeight = configOptions.infoHeight || 100,
            maxPopUpWidth = 300,
            maxPopUpHeight = 200,
            closeBox = true,
            popup;

        // se cluster costruisco popup per il cluster
        if (feature.cluster) {
            if (feature.attributes.count > 1) {
                infoPopUp = CWN2.InfoPopupManager.buildClusterPopup(configOptions, feature);
            } else {
                feature.attributes = feature.cluster[0].attributes;
                feature.attributes.count = 1;
            }
        }

        // attribute replacement {$attribute_name} - utilizzo la funzione OpenLayers.Style.createLiteral
        infoPopUp = OpenLayers.Style.createLiteral(infoPopUp, feature.attributes, feature);
        // decodifico eventuali encoding html (&amp;, ecc...)
        infoPopUp = CWN2.Util.unescapeHtmlEntities(infoPopUp);

        //costruisco la popup
        //popup = new OpenLayers.Popup.Anchored(
        popup = new OpenLayers.Popup.FramedCloud(
            "featurePopup",
            feature.geometry.getBounds().getCenterLonLat(),
            new OpenLayers.Size(popUpWidth, popUpHeight),
            infoPopUp,
            null,
            closeBox,
            function(evt) {
                // 'this' is the popup.
                this.feature.layer.map.featureManager.selectFeatureControl.unselect(this.feature);
            }
        );
        popup.maxSize = new OpenLayers.Size(maxPopUpWidth, maxPopUpHeight);
        popup.autoSize = false;

        // aggiungo alla feature e alla mappa
        // HACK per risolvere il seguente malfunzionamento
        // Se aggiungo un layer vettoriale mi si sputtanano le pop-up (non vengono cancellate sull'unselect, non funziona il tasto close).
        // il problema � legato al fatto che viene chiamato due volte la funzione onFeatureSelect e quindi create due popup sulla feature
        // Quindi creo la popup sulla feature solo se non esiste gi�
        if (!feature.popup) {
            feature.popup = popup;
            popup.feature = feature;
            popup.panMapIfOutOfView = true;
            // imposto lo sfondo delle popup
            popup.backgroundColor = "#BBCCFF";
            popup.opacity = 0.9;
            // aggiungo la popup alla mappa
            feature.layer.map.addPopup(popup);
        }
    },

    buildDefaultPopup: function(configOptions) {
        var defaultPopUp = "<div class='defaultPopUpTitle'>" + configOptions.layerConfig.legend.label + "<br><br></div>";
        defaultPopUp += "<div class='defaultPopUpLabel'>${" + configOptions.infoLabelAttr + "}<br><br></div>";
        if (configOptions.infoUrl) {
            defaultPopUp += "<div class='defaultPopUpLink'><a href=" + configOptions.infoUrl;
            if (configOptions.infoTarget) {
                defaultPopUp += " target='" + configOptions.infoTarget + "'";
            }
            defaultPopUp += ">Dettagli</a></div>";
        }
        return defaultPopUp;
    },

    buildSimplePopup: function(feature, configOptions) {
        var popUp = "<div class='defaultPopUpTitle'>" + configOptions.layerConfig.legend.label + "<br><br></div>";
        popUp += "<div class='defaultPopUpLabel'>";
        Ext.iterate(feature.attributes, function(key, value) {
            popUp += key + ":" + value + "<br>";
        });
        popUp += "</div>";
        return popUp;
    },

    buildClusterPopup: function(configOptions, feature) {
        var appId = feature.layer.map.appId;
        var layerName = feature.layer.name;
        var featureId = feature.id;

        var clusterPopUp = "<div class='defaultPopUpTitle'>" + configOptions.layerConfig.legend.label + "<br><br></div>";
        clusterPopUp += "<div class='defaultPopUpLabel'>" + feature.attributes.count + " Elementi<br><br></div>";
        clusterPopUp += "<div class='defaultPopUpLink'>"
        clusterPopUp += "<a href=javascript:CWN2.InfoPopupManager.zoomClusterPopup(" + appId + "," + feature.geometry.x + "," + feature.geometry.y + ",'" + layerName + "','" + featureId + "')>Zoom</a></div>";

        return clusterPopUp;
    },

    zoomClusterPopup: function(appId, x, y, layerName, featureId) {
        var map = CWN2.app.map;
        CWN2.InfoPopupManager.destroyPopup(map.getLayerByName(layerName).getFeatureById(featureId));
        map.setCenter(new OpenLayers.LonLat(x, y), map.zoom + 2);
    },

    destroyPopup: function(feature) {
        if (feature.popup) {
            var map = feature.layer.map;
            var popup = feature.popup;
            popup.feature = null;
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
        }
    }

});

/**
 *
 * Class: CWN2.LayerFactory
 *
 *
 * Factory per creazione di layers OpenLayers
 *
 */
Ext.define("CWN2.LayerFactory", {
  singleton: true,

  /**
   *
   * Function: create
   * Crea un Layer OpenLayers in base ad una determinata configurazione
   *
   * Parameters:
   * layerConfig - {Object} Oggetto contenente la configurazione del layer
   *
   * Returns:
   * layer - {OpenLayers.Layer}
   *
   */
  create: function create (layerConfig, map) {
    try {
      var layer = CWN2.LayerFactory[layerConfig.type](layerConfig, map);
      layer.legend = layerConfig.legend;
      if (!layerConfig.legend) {
        layer.displayInLayerSwitcher = false;
      }
      // imnposto un attributo contenente la configurazione del layer
      layer.config = layerConfig;
      return layer;
    }
    catch (exception) {
      throw {
        name: "BadLayerConfig",
        message: "CWN2.LayerFactory.create: Errore creazione layer " + layerConfig.name + " di tipo " + layerConfig.type,
        level: 1
      };
    }
  },

  /*
   *
   * Metodi per creazione dei layer Openlayers dei vari tipi
   *
   */

  setLayerOptions: function (layerConfig, map) {
    var layerOptions = {};
    layerOptions.projection = layerConfig.projection || map.projection;
    layerOptions.opacity = layerConfig.opacity || 1;
    layerOptions.attribution = layerConfig.attribution;
    layerOptions.transitionEffect = "resize";
    //layerOptions.transitionEffect = null;
    layerOptions.metadata = layerConfig.metadata;
    layerOptions.minScale = layerConfig.minScale || null;
    layerOptions.maxScale = layerConfig.maxScale || null;
    layerOptions.infoOptions = layerConfig.infoOptions;
    return layerOptions;
  },

  createGoogleLayer: function (layerType, layerConfig) {
    var maxZoomLevel = (layerType === google.maps.MapTypeId.TERRAIN) ? 15 : 20;
    return new OpenLayers.Layer.Google(
      layerConfig.name,
      {
        type: layerType,
        resolutions: CWN2.Globals.BASE_RESOLUTIONS,
        serverResolutions: CWN2.Globals.BASE_RESOLUTIONS,
        minZoomLevel: 0,
        maxZoomLevel: maxZoomLevel,
        //alwaysInRange: true,
        isBaseLayer: false
      }
    );
  },

  google_roadmap: function (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create google_roadmap");
    return CWN2.LayerFactory.createGoogleLayer(google.maps.MapTypeId.ROADMAP, layerConfig);
  },

  google_satellite: function (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create google_satellite");
    return CWN2.LayerFactory.createGoogleLayer(google.maps.MapTypeId.SATELLITE, layerConfig);
  },

  google_hybrid: function (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create google_hybrid");
    return CWN2.LayerFactory.createGoogleLayer(google.maps.MapTypeId.HYBRID, layerConfig);
  },

  google_terrain: function (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create google_terrain");
    return CWN2.LayerFactory.createGoogleLayer(google.maps.MapTypeId.TERRAIN, layerConfig);
  },

  bing_hybrid: function bing_hybrid () {
    return new OpenLayers.Layer.Bing({
      name: "bing_hybrid",
      key: CWN2.Globals.BING_MAPS_KEY,
      type: "AerialWithLabels",
      resolutions: CWN2.Globals.BASE_RESOLUTIONS,
      isBaseLayer: false
    });
  },

  bing_aerial: function bing_aerial () {
    return new OpenLayers.Layer.Bing({
      name: "bing_aerial",
      key: CWN2.Globals.BING_MAPS_KEY,
      type: "Aerial",
      resolutions: CWN2.Globals.BASE_RESOLUTIONS,
      isBaseLayer: false
    });
  },

  bing_road: function bing_road () {
    return new OpenLayers.Layer.Bing({
      name: "bing_road",
      key: CWN2.Globals.BING_MAPS_KEY,
      type: "Road",
      resolutions: CWN2.Globals.BASE_RESOLUTIONS,
      isBaseLayer: false
    });
  },

  no_base: function no_base (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create no_base");
    return new OpenLayers.Layer(
      layerConfig.name,
      {
        resolutions: CWN2.Globals.BASE_RESOLUTIONS,
        serverResolutions: CWN2.Globals.BASE_RESOLUTIONS,
        alwaysInRange: true,
        isBaseLayer: false
      }
    );
  },

  OSM: function OSM (layerConfig) {
    CWN2.Util.log("CWN2.LayerFactory.create OSM");

    return new OpenLayers.Layer.OSM(
      layerConfig.name,
      null,
      {
        transitionEffect: "resize",
        isBaseLayer: false
      }
    );
  },

  rl_ortofoto_2000_OLD: function (layerConfig, map) {
    var config = {
      "wmsParams": {
        "url": "http://www.cartografiarl.regione.liguria.it/mapfiles/repertoriocartografico/ORTOFOTO/48.asp?",
        "name": "L48",
        "transparent": false,
        "format": "image/jpeg"
      },
      "flagGeoserver": false,
      "type": "WMS",
      "name": "rl_ortofoto_2000",
      "projection": "EPSG:3857",
      "geomType": "RASTER",
      "geomSubType": "RASTER",
      "legend": {
        "label": "Ortofoto IT 2000",
        "icon": "/geoviewer/img/legend/raster.gif"
      },
      "visible": false
    };

    return this.WMS(config, map)
  },

  rl_carte_base_GS: function (layerConfig, map) {
    var config = {
      "wmsParams": {
        "url": "http://geoservizi.regione.liguria.it/geoserver/M1623/wms?",
        "name": "C1623",
        "transparent": false,
        "format": "image/jpeg"
      },
      "flagGeoserver": true,
      "type": "WMS",
      "name": "rl_carte_base_GS",
      "projection": "EPSG:3857",
      "geomType": "RASTER",
      "geomSubType": "RASTER",
      "legend": {
        "label": "Carte di base regionali",
        "icon": "/geoviewer/img/legend/raster.gif"
      },
      "visible": false,
      cacheMinZoomLevel: 7,
      cacheMaxZoomLevel: 17
    };

    return this.WMS(config, map)
  },

  rl_ortofoto_2013_GS: function (layerConfig, map) {
    var config = {
      "wmsParams": {
        "url": "http://geoservizi.regione.liguria.it/geoserver/M1661/wms?",
        "name": "L4419",
        "transparent": false,
        "format": "image/jpeg"
      },
      "flagGeoserver": true,
      "type": "WMS",
      "name": "rl_ortofoto_2013_GS",
      "projection": "EPSG:3857",
      "geomType": "RASTER",
      "geomSubType": "RASTER",
      "legend": {
        "label": "Carte di base regionali",
        "icon": "/geoviewer/img/legend/raster.gif"
      },
      "attribution": "Immagine di proprietà AGEA",
      "visible": false,
      cacheMinZoomLevel: 7,
      cacheMaxZoomLevel: 17
    };

    return this.WMS(config, map)
  },

  rl_ortofoto_2010_GS: function (layerConfig, map) {
    var config = {
      "wmsParams": {
        "url": "http://geoservizi.regione.liguria.it/geoserver/M1505/wms?",
        "name": "L3861",
        "transparent": false,
        "format": "image/jpeg"
      },
      "flagGeoserver": true,
      "type": "WMS",
      "name": "rl_ortofoto_2010_GS",
      "projection": "EPSG:3857",
      "geomType": "RASTER",
      "geomSubType": "RASTER",
      "legend": {
        "label": "Carte di base regionali",
        "icon": "/geoviewer/img/legend/raster.gif"
      },
      "attribution": "Immagine di proprietà AGEA",
      "visible": false,
      cacheMinZoomLevel: 7,
      cacheMaxZoomLevel: 17
    };

    return this.WMS(config, map)
  },

  rl_ortofoto_2007_GS: function (layerConfig, map) {
    var config = {
      "wmsParams": {
        "url": "http://www.cartografiarl.regione.liguria.it/mapfiles/repertoriocartografico/ORTOFOTO/1361.asp?",
        "name": "L3463",
        "transparent": false,
        "format": "image/jpeg"
      },
      "flagGeoserver": false,
      "type": "WMS",
      "name": "rl_ortofoto_2007_GS",
      "projection": "EPSG:3857",
      "geomType": "RASTER",
      "geomSubType": "RASTER",
      "legend": {
        "label": "Ortofoto 2007",
        "icon": "/geoviewer/img/legend/raster.gif"
      },
      "visible": false
    };

    return this.WMS(config, map)
  },

  rl_carte_base: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/1623/tms/",
      "name": "rl_carte_base",
      "tmsName": "C1623/webmercator",
      "visible": false,
      "projection": "EPSG:3857",
      "attribution": "Regione Liguria"
    }, map)
  },

  rl_ortofoto_2016: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/1828/tms/",
      "name": "rl_ortofoto_2016",
      "tmsName": "L5802/webmercator",
      "visible": false,
      "projection": "EPSG:3857",
      "attribution": "Immagine di proprietà AGEA"
    }, map)
  },

  rl_ortofoto_2013: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/1661/tms/",
      "name": "rl_ortofoto_2013",
      "tmsName": "L4419/webmercator",
      "visible": false,
      "projection": "EPSG:3857",
      "attribution": "Immagine di proprietà AGEA"
    }, map)
  },

  rl_ortofoto_2010: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/1505/tms/",
      "name": "rl_ortofoto_2010",
      "tmsName": "L3861/webmercator",
      "visible": false,
      "projection": "EPSG:3857",
      "attribution": "Immagine di proprietà AGEA"
    }, map)
  },

  rl_ortofoto_2007: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/1361/tms/",
      "name": "rl_ortofoto_2007",
      "tmsName": "L3463/webmercator",
      "visible": false,
      "projection": "EPSG:3857",
      "attribution": "Immagine di proprietà AGEA"
    }, map)
  },

  rl_ortofoto_2000: function (layerConfig, map) {
    return this.MapProxyTMS({
      "type": "MapProxyTMS",
      "url": "http://mapproxy.regione.liguria.it/mapproxy/48/tms/",
      "name": "rl_ortofoto_2000",
      "tmsName": "L48/webmercator",
      "visible": false,
      "projection": "EPSG:3857"
    }, map);
  },

  TMS: function (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create TMS");

/*    return new OpenLayers.Layer.TMS(
      layerConfig.name,
      layerConfig.layerConfig.tmsParams.url,
      {
        layername: layerConfig.tmsName || layerConfig.name,
        type: 'png',
        resolutions: map.calculateResolutions(layerConfig.minScale, layerConfig.maxScale, layerConfig.units),
        zoomOffset: -1,
        tileSize: new OpenLayers.Size(256, 256),
        minScale: layerConfig.minScale || null,
        maxScale: layerConfig.maxScale || null,
        attribution: layerConfig.attribution,
        isBaseLayer: false
      }
    );*/


    return this.MapProxyTMS({
      type: "MapProxyTMS",
      url: layerConfig.tmsParams.url,
      name: layerConfig.name,
      tmsName: layerConfig.tmsParams.name,
      minScale: layerConfig.minScale,
      maxScale: layerConfig.maxScale
    }, map)


  },

  MapProxyTMS: function MapProxyTMS (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create MapProxyTMS");

    //var url = layerConfig.tmsParams.url.replace('/tms/', '/tiles/')

    return new OpenLayers.Layer.TMS(
      layerConfig.name,
      layerConfig.url,
      {
        layername: layerConfig.tmsName || layerConfig.name,
        type: 'png',
        resolutions: map.calculateResolutions(layerConfig.minScale,  layerConfig.maxScale , layerConfig.units),
        zoomOffset: -1,
        tileSize: new OpenLayers.Size(256, 256),
        minScale: layerConfig.minScale || null,
        maxScale: layerConfig.maxScale || null,
        attribution: layerConfig.attribution,
        isBaseLayer: false
      }
    );
  },

  base_layer: function (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create base_layer");
    var olLayer = new OpenLayers.Layer(
      'base_layer',
      {
        resolutions: map.resolutions,
        serveResolutions: CWN2.Globals.BASE_RESOLUTIONS,
        alwaysInRange: true,
        isBaseLayer: true,
        order: 0
      }
    );
    return olLayer;
  },

  GeoJSON: function GeoJSON (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create GeoJSON");

    // impostazione opzioni di base
    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map);

    if (layerConfig.url) {
      // creo il protocollo
      layerOptions.protocol = new OpenLayers.Protocol.HTTP({
        format: new OpenLayers.Format.GeoJSON({ignoreExtraDims: true}),
        url: layerConfig.url
      });
      // creo le strategie
      layerOptions.strategies = CWN2.LayerFactory.createStrategies(layerConfig);
    }
    layerOptions.isBaseLayer = false;
    layerOptions.styleMap = CWN2.LayerFactory.createVectorStyleMap(layerConfig);

    return new OpenLayers.Layer.Vector(
      layerConfig.name,
      layerOptions
    );
  },

  KML: function KML (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create KML");

    // impostazione opzioni di base
    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map);

    if (layerConfig.url) {
      // creo il protocollo
      layerOptions.protocol = new OpenLayers.Protocol.HTTP({
        format: new OpenLayers.Format.KML({
          extractStyles: true,
          extractAttributes: true,
          kvpAttributes: true
        }),
        url: layerConfig.url
      });
      // creo le strategie
      layerOptions.strategies = CWN2.LayerFactory.createStrategies(layerConfig);
    }
    layerOptions.isBaseLayer = false;
    //layerOptions.styleMap = CWN2.LayerFactory.createVectorStyleMap(layerConfig);

    return new OpenLayers.Layer.Vector(
      layerConfig.name,
      layerOptions
    );
  },

  GPX: function GPX (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create GPX");

    // impostazione opzioni di base
    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map);

    if (layerConfig.url) {
      // creo il protocollo
      layerOptions.protocol = new OpenLayers.Protocol.HTTP({
        format: new OpenLayers.Format.GPX({}),
        url: layerConfig.url
      });
      // creo le strategie
      layerOptions.strategies = CWN2.LayerFactory.createStrategies(layerConfig);
    }
    layerOptions.isBaseLayer = false;
    layerOptions.styleMap = CWN2.LayerFactory.createVectorStyleMap(layerConfig);

    return new OpenLayers.Layer.Vector(
      layerConfig.name,
      layerOptions
    );
  },

  WFS: function WFS (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create WFS");

    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map);

    if (layerConfig.wfsParams.method = "GET") {
      var params = {
        request: "GetFeature",
        service: "wfs",
        version: "1.0.0"
      };
      params.typeName = layerConfig.wfsParams.featureType;
      if (layerConfig.wfsParams.filter) {
        params.filter = layerConfig.wfsParams.filter;
      }
      var options = {
        url: layerConfig.wfsParams.url,
        params: params,
        format: new OpenLayers.Format.GML({
          featureNS: "http://ng.org/sf",
          geometryName: "wkb_geometry"
        })
      };
      layerOptions.protocol = new OpenLayers.Protocol.HTTP(options);
    } else {
      layerOptions.protocol = new OpenLayers.Protocol.WFS(layerConfig.wfsParams);
    }

    layerOptions.strategies = CWN2.LayerFactory.createStrategies(layerConfig);
    layerOptions.styleMap = CWN2.LayerFactory.createVectorStyleMap(layerConfig);
    layerOptions.isBaseLayer = false;

    return new OpenLayers.Layer.Vector(
      layerConfig.name,
      layerOptions
    );
  },

  WMS: function WMS (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create WMS " + layerConfig.name);

    // impostazione opzioni di base
    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map),
      wmsParams,
      olLayer;

    layerConfig.wmsParams.layers = layerConfig.wmsParams.name;
    wmsParams = Ext.clone(layerConfig.wmsParams);
    wmsParams.url = null;
    wmsParams.name = null;


    // Parametro NO_GWC_CACHE utilizzato da GeoStyler per inibire la cache
    if (layerConfig.flagGeoserver && !CWN2.Globals.NO_GWC_CACHE && layerConfig.cacheMinZoomLevel && layerConfig.cacheMaxZoomLevel) {
      layerOptions.tiled = true;
      wmsParams.tiled = true;
      wmsParams.tilesorigin = [map.maxExtent.left, map.maxExtent.bottom];
      wmsParams.cache_version = layerConfig.cacheVersion;
      if (!wmsParams.format_options) {
        wmsParams.format_options = "antialias:text";
      }
    } else {
      layerOptions.singleTile = true;
    }

    layerOptions.buffer = 0;
    layerOptions.transitionEffect = null;
    layerOptions.isBaseLayer = false;

    // GESTIONE SUBDOMAINS
    if (CWN2.Globals.USE_SUBDOMAINS && layerConfig.wmsParams.url.indexOf('geoservizi.regione.liguria.it') > 0) {
      var appoUrl = layerConfig.wmsParams.url;
      layerConfig.wmsParams.url = [];
      layerConfig.wmsParams.url.push(appoUrl.replace('geoservizi','geoservizi1'));
      layerConfig.wmsParams.url.push(appoUrl.replace('geoservizi','geoservizi2'));
    }

    olLayer = new OpenLayers.Layer.WMS(
      layerConfig.name,
      layerConfig.wmsParams.url,
      wmsParams,
      layerOptions
    );

    // registro l'evento tileerror per gestire errori nei servizi WMS
    olLayer.events.register("tileerror", olLayer, function () {
      var tile = arguments[0].tile;
      var url = tile.url;

      if (url.indexOf("WIDTH=1&HEIGHT=1")>0) {
        return;
      }

      Ext.Ajax.request({
        url: CWN2.Globals.proxy + url,
        method: 'GET',
        success: function (response, opts) {
          //var xml = response.responseXML;
          var xml = CWN2.Util.getXmlDoc(response.responseText);
          // gestione service exception
          var serviceException = Ext.DomQuery.selectValue('ServiceException', xml);
          if (serviceException) {
            CWN2.Util.handleException({
              message: "Errore Servizio WMS <br>Layer " + layerConfig.legend.label + " (" + layerConfig.name + ")" + "<br>Service Exception:<br>" + serviceException + "<br>URL: " + url + "<br><br>",
              level: 0
            });
          }
        },
        failure: function (response, opts) {
          CWN2.Util.handleException({
            message: "WMSServerError - failure",
            level: 0
          });
        }
      });
    });

    return olLayer;
  },

  JSONP: function JSONP (layerConfig, map) {
    CWN2.Util.log("CWN2.LayerFactory.create JSONP");

    // impostazione opzioni di base
    var layerOptions = CWN2.LayerFactory.setLayerOptions(layerConfig, map),
      olLayer;

    if (layerConfig.url) {

      // creo il protocollo - ATTENZIONE parametri impostati per geoserver
      layerOptions.protocol = new OpenLayers.Protocol.Script({
        format: new OpenLayers.Format.GeoJSON({ignoreExtraDims: true}),
        callbackKey: "format_options",
        callbackPrefix: "callback:",
        url: layerConfig.url
      });

      // creo le strategie
      layerOptions.strategies = CWN2.LayerFactory.createStrategies(layerConfig);

    }
    layerOptions.styleMap = CWN2.LayerFactory.createVectorStyleMap(layerConfig);
    layerOptions.isBaseLayer = false;

    // creo il livello OL
    return new OpenLayers.Layer.Vector(
      layerConfig.name,
      layerOptions
    );
  },

  createVectorStyleMap: function (layerConfig) {
    if (!layerConfig.classes) {
      return null;
    }

    var classes = (layerConfig.classes instanceof Array) ? layerConfig.classes : [layerConfig.classes],
      StyleMapLiteral = {};

    Ext.each(CWN2.Globals.DEFAULT_RENDER_INTENTS, function (renderIntent) {
      var rules = [];
      var clusterStrategyStyle = getClusterStrategyStyle(layerConfig.strategies);
      var noClusterFilter = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.EQUAL_TO,
        property: "count",
        value: 1
      });
      var defaultClassFilter = (clusterStrategyStyle) ? noClusterFilter : null;
      Ext.each(classes, function (styleClass) {
        var classFilter = (styleClass.filter) ? new OpenLayers.Format.CQL().read(styleClass.filter) : null;
        rules.push(buildRule(styleClass.styleMaps, renderIntent, classFilter, styleClass.id));
      });
      var style = new OpenLayers.Style();
      if (clusterStrategyStyle) {
        rules.push(buildClusterRule(clusterStrategyStyle));
        // Aggiungo context per cluster: gestione radius per point
        style.context = {
          //label: label,
          radius: function (feature) {
            return Math.min(feature.attributes.count, 7) + 7;
          }
        };
      }
      style.addRules(rules);
      StyleMapLiteral[renderIntent] = style;
    });

    return new OpenLayers.StyleMap(StyleMapLiteral);

    // Ritorna la rule (filtro e simbolizer) da utilizzare per le feature per un determinato renderIntent
    // Se lo stile non è definito viene costruito uno style di default
    function buildRule (styleMaps, renderIntent, classFilter, id) {
      return new OpenLayers.Rule({
        name: id,
        symbolizer: getClassStyleByIntent(styleMaps, renderIntent) || getClassStyleByIntent(styleMaps, "default"),
        filter: classFilter
      });
    }

    // Ritorna lo style (symbolizer) associato ad una stylemap per un determinato renderIntet
    function getClassStyleByIntent (styleMaps, renderIntent) {
      var len = styleMaps.length;
      for (var s = 0; s<len; s++) {
        if (styleMaps[s].renderIntent === renderIntent) {
          return Ext.clone(styleMaps[s].style);
        }
      }
      return null;
    }

    // Testa se è un cluster
    function getClusterStrategyStyle (strategiesConfig) {
      if (strategiesConfig && strategiesConfig.length) {
        var len = strategiesConfig.length;
        for (var i = 0; i<len; i++) {
          if (strategiesConfig[i].name === "Cluster" && strategiesConfig[i].style) {
            return strategiesConfig[i].style;
          }
        }
      }
      return false;
    }

    // Ritorna la rule (filtro e simbolizer) da utilizzare per le feature in cluster
    function buildClusterRule (style) {
      var symbolizer = {},
        scale = 1,
        graphicWidth,
        graphicHeight,
        graphicYOffset,
        graphicXOffset,
        graphicOpacity;

      if (style.externalGraphic) {
        symbolizer.externalGraphic = style.externalGraphic;
        symbolizer.graphicOpacity = style.graphicOpacity || 1;
        symbolizer.graphicWidth = style.graphicWidth;
        symbolizer.graphicHeight = style.graphicHeight;
        symbolizer.graphicYOffset = style.graphicYOffset || -(style.graphicHeight / 2);
        symbolizer.graphicXOffset = style.graphicXOffset || -(style.graphicWidth / 2);
        symbolizer.graphicTitle = style.graphicTitle || "${count} Elementi";
      } else {
        symbolizer.pointRadius = "${radius}";
        symbolizer.fillColor = style.fillColor || "#ff7700";
        symbolizer.fillOpacity = style.fillOpacity || 0.9;
        symbolizer.strokeColor = style.strokeColor || "#ff7700";
        symbolizer.strokeOpacity = style.strokeOpacity || 0.5;
        symbolizer.strokeWidth = style.strokeWidth || 12;
      }

      if (style.label) {
        symbolizer.label = "${count}";
        symbolizer.fontColor = style.fontColor || "#000000";
        symbolizer.fontOpacity = style.fontOpacity || 1;
        symbolizer.fontSize = style.fontSize || "12px";
        symbolizer.fontWeight = style.fontWeight || "bold";
        symbolizer.fontFamily = style.fontFamily || "Verdana";
        symbolizer.labelOutlineWidth = style.labelOutlineWidth || 0;
        symbolizer.labelAlign = style.labelAlign || "cm";
      }

      if (symbolizer) {
        var rule = new OpenLayers.Rule({
          symbolizer: symbolizer,
          filter: new OpenLayers.Filter.Comparison({
            type: OpenLayers.Filter.Comparison.GREATER_THAN,
            property: "count",
            value: 1
          })
        });
      }
      return rule;
    }

  },

  createStrategies: function (layerConfig) {
    var strategiesConfig = layerConfig.strategies;
    var strategiesArray = [];
    if (strategiesConfig) {
      var len = strategiesConfig.length;
      var isBBox = false;
      for (var i = 0; i<len; i++) {
        strategiesArray.push(createStrategy(strategiesConfig[i]));
        if (strategiesConfig[i] && strategiesConfig[i].name === "BBOX") {
          isBBox = true;
        }
      }
      if (!isBBox) {
        strategiesArray.push(new OpenLayers.Strategy.Fixed());
      }
    } else {
      strategiesArray.push(new OpenLayers.Strategy.Fixed());
    }

    return strategiesArray;

    function createStrategy (strategy) {
      if (strategy.name === "BBOX") {
        return new OpenLayers.Strategy.BBOX();
      }
      if (strategy.name === "Fixed") {
        return new OpenLayers.Strategy.Fixed();
      }
      if (strategy.name === "Cluster") {
        var options = {};
        if (strategy.options && strategy.options.distance) {
          options.distance = strategy.options.distance;
        }
        if (strategy.options && strategy.options.threshold) {
          options.threshold = strategy.options.threshold;
        }
        return new OpenLayers.Strategy.Cluster(options);
      }
      return null;
    }
  }
});



/**
 *
 * Class: CWN2.LayerManager
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

Ext.define("CWN2.LayerManager", {

    overlayLayerStore: null,
    baseLayerStore: null,
    overlayLayersConfig: null,
    baseLayersConfig: null,
    map: null,

    setBaseLayers: function() {

        var visible = false,
            i,
            len = this.baseLayersConfig.length;

        for (i = 0; i < len; i++) {
            if (this.baseLayersConfig[i].visible && !visible) { //imposto a visible solo il primo layer visible
                visible = true;
            }
            this.baseLayersConfig[i].order = 0;
        }

        // se non esiste nessun baseLayer visibile rendo visibile l'ultimo
        if (!visible) {
            this.baseLayersConfig[len - 1].visible = true;
        }

    },

    /**
     *
     * Function: getLayerConfigByName
     *
     * Ritorna la configurazione di un layer
     *
     * Parameters:
     * name - {String} Nome del layer
     *
     * Returns:
     * {Object} Configurazione del layer
     *
     */
    getLayerConfigByName: function(layerName) {
        var layerConfig = null;
        Ext.each(this.overlayLayersConfig, function(layer) {
            if (layer.name === layerName) {
                layerConfig = layer;
                return false;
            }
        });
        if (layerConfig) {
            return layerConfig;
        }
        Ext.each(this.baseLayersConfig, function(layer) {
            if (layer.name === layerName) {
                layerConfig = layer;
                return false;
            }
        });
        if (layerConfig) {
            return layerConfig;
        }
    },

    /**
     *
     * Function: getLayerIndexByName
     *
     * Ritorna l'indice di un layer in configurazione
     *
     * Parameters:
     * name - {String} Nome del layer
     *
     * Returns:
     * {Integer}
     *
     */
    getLayerIndexByName: function(layerName) {
        var index = -1;

        Ext.each(this.overlayLayersConfig, function(layer, ind) {
            if (layer.name === layerName) {
                index = ind;
                return false;
            }
        });

        return index;
    },

    /**
     *
     * Function: isbaseLayerInConfig
     *
     * Indica se il baseLayer è in configurazione
     *
     * Parameters:
     * name - {String} Nome del layer
     *
     * Returns:
     * {Boolean}
     *
     */
    isBaseLayerInConfig: function(layerName) {
        var itIs = false;
        Ext.each(this.baseLayersConfig, function(layer) {
            if (layerName === layer.name) {
                itIs = true;
                return false;
            }
        });
        return itIs;
    },

    /**
     *
     * Function: isLayerInConfig
     *
     * Indica se il layer è in configurazione
     *
     * Parameters:
     * name - {String} Nome del layer
     *
     * Returns:
     * {Boolean}
     */
    isLayerInConfigWithTitle: function(layer) {
        var layerName = layer.name,
            layerTitle = (layer.legend && layer.legend.label)? layer.legend.label : null;

        var itIs = false;
        Ext.each(this.overlayLayersConfig, function(layerInConfig) {
            if (layerName === layerInConfig.name) {
                itIs = true;
                return false;
            }
            // test sul titolo del layer (legendLabel)
            var layerInConfigTitle = (layerInConfig.legend && layerInConfig.legend.label) ? layerInConfig.legend.label : null;
            if (layerTitle && layerInConfigTitle && layerTitle === layerInConfigTitle ) {
                itIs = true;
                return false;
            }
        });
        return itIs;
    },

    /**
     *
     * Function: isLayerInConfig
     *
     * Indica se il layer è in configurazione
     *
     * Parameters:
     * name - {String} Nome del layer
     *
     * Returns:
     * {Boolean}
     */
    isLayerInConfig: function(layerName) {
        var itIs = false;
        Ext.each(this.overlayLayersConfig, function(layer) {
            if (layerName === layer.name) {
                itIs = true;
                return false;
            }
        });
        return itIs;
    },

    getFieldFromLayerConfig: function(layerName, fieldName) {
        var value = null;
        Ext.each(this.overlayLayersConfig, function(layer) {
            if (layerName === layer.name) {
                value = layer[fieldName];
                return false;
            }
        });
        return value;
    },

    // costruisce lo store dei layer in base al tipo
    buildLayerStoreByType: function(type) {
        var layers = [],
            layersConfig = (type === "overlay") ? this.overlayLayersConfig : this.baseLayersConfig,
            idStore = type + "-layer-store",
            layerStore,
            me = this;

        if (layersConfig) {
            Ext.each(layersConfig, function(layer) {
                if ((layer.showInLegend === undefined) || (layer.showInLegend === true)) {
                    layers.push(me.buildLayerRecord(layer));
                }
            });
        }
        layers.reverse();

        layerStore = new Ext.data.Store({
            storeId: idStore,
            data: layers,
            model: 'CWN2.LayerModel'
        });

        if (type === "overlay") {
            this.overlayLayerStore = layerStore;
        } else {
            this.baseLayerStore = layerStore;
        }
    },

    // rimuove un layer dallo store
    removeLayerFromStore: function(layerName) {

        CWN2.Util.log("CWN2.LayerManager.removeLayerFromStore");

        var storeItems = this.overlayLayerStore.data.items,
            item,
            len2 = storeItems.length,
            rec;

        for (item = 0; item < len2; item++) {
            if (storeItems[item]) {
                if (storeItems[item].data.name === layerName) {
                    rec = this.overlayLayerStore.getAt(item);
                    this.overlayLayerStore.remove(rec);
                }
            }
        }
    },

    // aggiunge un layer allo store
    addLayerToStore: function(layerConfig) {
        CWN2.Util.log("CWN2.LayerManager.addLayerToStore");

        if ((layerConfig.showInLegend === undefined) || (layerConfig.showInLegend === true)) {
            if (this.overlayLayerStore) {
                this.overlayLayerStore.insert(0, this.buildLayerRecord(layerConfig));
            } else {
                this.initStore();
            }
        }
    },

    // aggiunge un base layer allo store
    addBaseLayerToStore: function(layerConfig) {
        CWN2.Util.log("CWN2.LayerManager.addBaseLayerToStore");

        if ((layerConfig.showInLegend === undefined) || (layerConfig.showInLegend === true)) {
            if (this.baseLayerStore) {
                this.baseLayerStore.insert(0, this.buildLayerRecord(layerConfig));
            } else {
                this.initStore();
            }
        }
    },

    buildLayerRecord: function(layerConfig) {
        layerConfig.legend = layerConfig.legend || {};
        return {
            id: layerConfig.name,
            name: layerConfig.name,
            legendIcon: (layerConfig.legend.popUpUrl && !layerConfig.legend.popUpFlag) ? layerConfig.legend.popUpUrl : layerConfig.legend.icon,
            legendLabel: layerConfig.legend.label,
            legendPopUpFlag: layerConfig.legend.popUpFlag,
            minScale: layerConfig.minScale,
            maxScale: layerConfig.maxScale,
            legendPopUpUrl: layerConfig.legend.popUpUrl,
            multiClasse: layerConfig.multiClasse,
            visible: layerConfig.visible,
            inRange: (this.map && this.map.getLayerByName(layerConfig.name) && this.map.getLayerByName(layerConfig.name).calculateInRange()) ? true : false,
            config: layerConfig
        };
    },

    /**
     *
     * Function: getOverlayLayersNameFromStore
     *
     * Ritorna un array con i nomi dei layer nello store
     *
     * Returns:
     * layerNames - {Array} Array contenente i nomi dei layer nello store
     *
     */
    getOverlayLayersNameFromStore: function() {
        CWN2.Util.log("CWN2.LayerManager.getOverlayLayersNameFromStore");

        if (this.overlayLayerStore) {
            var layersName = [],
                storeItems = this.overlayLayerStore.data.items,
                item,
                len2 = storeItems.length;

            for (item = 0; item < len2; item++) {
                layersName.push(storeItems[item].data.name);
            }
            return layersName;
        }
    },

    /**
     *
     * Function: getLayerStore
     *
     * Ritorna lo store dei layer
     *
     * Parameters:
     * type  - {String} Tipo di store ("base"/"overlay")
     *
     * Returns:
     * store - {Ext.data.Store}
     *
     */
    getLayerStore: function(type) {
        CWN2.Util.log("CWN2.LayerManager.getLayerStore");

        if (type === "base") {
            return this.baseLayerStore;
        } else {
            return this.overlayLayerStore;
        }

    },

    updateSelectControls: function(layers) {
        // aggiorno il controllo per la selezione delle feature dei livelli vettoriali
        if (this.map) {
            // ATTENZIONE:
            // NON MODIFICARE L'ORDINE DI AGGIORNAMENTO DEI CONTROLLI
            this.map.featureManager.hoverFeatureControl.setLayer(layers);
            this.map.featureManager.selectFeatureControl.setLayer(layers);
        }
    },

    /**
     *
     * Function: addLayers
     *
     * Aggiunge i layer alla applicazione (aggiorna configurazione, store, mappa e legenda)
     *
     * Parameters:
     * layers - {Array/Object} Array oppure singolo oggetto contenente la configurazione dei layer
     *
     *
     */
    addLayers: function(layersIn) {
        CWN2.Util.log("CWN2.LayerManager.addLayers");

        CWN2.Util.assert(layersIn,
            {
                name: "BadParameter",
                message: "CWN2.LayerManager.addLayers: parametro deve essere valorizzato",
                level: 1
            }
        );

        var layers = (layersIn instanceof Array) ? layersIn : [layersIn],
            me = this,
            olLayers = [];

        // aggiungo i layer alla configurazione (se non sono già presenti)
        Ext.each(layers, function(layerConfig) {
            if (!me.isLayerInConfigWithTitle(layerConfig)) {
                // aggiorno la configurazione
                me.overlayLayersConfig.push(layerConfig);
                // aggiorno la mappa
                var olLayer = me.map.loadLayer(layerConfig);
                olLayers.push(olLayer);
                // aggiorno gli store
                me.addLayerToStore(layerConfig);
                // registro le action sugli eventi delle feature per i livelli vettoriali
                if (olLayer.CLASS_NAME === "OpenLayers.Layer.Vector") {
                    me.map.featureManager.registerLayerAction([layerConfig]);
                }
                // aggiorno il controllo per la getFeatureInfo dei livelli WMS se il layer è interrogabile
                if (layerConfig.type === "WMS" && layerConfig.queryable) {
                    var infoWmsControl = me.map.getControl("infoWmsControl");
                    if (infoWmsControl) {
                        infoWmsControl.addLayers([olLayer]);
                    }
                }
            }
        });
        // aggiorno il controllo per la selezione delle feature dei livelli vettoriali
        if (me.map) {
            me.map.featureManager.updateControlLayer();
        }

        // aggiorno l'ordine dei livelli di base
        me.map.setBaseLayerIndex();

        return olLayers;
    },

    /**
     *
     * Function: addBaseLayers
     *
     * Aggiunge i baseLayer alla applicazione (aggiorna configurazione, store, mappa e legenda)
     *
     * Parameters:
     * layers - {Array/Object} Array oppure singolo oggetto contenente la configurazione dei layer
     *
     *
     */
    addBaseLayers: function(layersIn) {

        CWN2.Util.log("CWN2.LayerManager.addBaseLayers");

        CWN2.Util.assert(layersIn,
            {
                name: "BadParameter",
                message: "CWN2.LayerManager.addBaseLayers: parametro deve essere valorizzato",
                level: 1
            }
        );

        var layers = (layersIn instanceof Array) ? layersIn : [layersIn],
            me = this;

        Ext.each(layers, function(layer) {
            if (!me.isBaseLayerInConfig(layer.name)) {
                // aggiorno la configurazione
                me.baseLayersConfig.push(layer);
                // aggiorno la mappa
                me.map.loadLayer(layer);
                // aggiorno gli store
                me.addBaseLayerToStore(layer);
            }
        });

    },

    /**
     *
     * Function: remove
     *
     * Rimuove i layer dalla applicazione
     *
     * Parameters:
     * layersName - {Array} Array contenente i nomi dei layer
     *
     *
     */
    remove: function(layersName) {

        CWN2.Util.log("CWN2.LayerManager.remove");

        var i,
            len = layersName.length;

        for (i = 0; i < len; i++) {
            // aggiorno la configurazione
            var index = this.getLayerIndexByName(layersName[i]);
            if (index !== -1) {
                this.overlayLayersConfig.splice(index, 1);
            }
            // aggiorno la mappa
            this.map.removeLayerByName(layersName[i]);

            /* TODO: rifare
            //Se il layer ha un hilite sld rimuovo anche il layer dell'hilite
            if (this.map.wmsSldHiliter && this.map.wmsSldHiliter.hilitedLayerName === layersName[i]) {
                this.map.removeLayerByName(this.map.wmsSldHiliter.hiliteLayerName);
            }
            */
            // aggiorno il controllo per la getFeatureInfo dei livelli WMS se il layer è interrogabile

            var infoWmsControl = this.map.getControl("infoWmsControl");
            if (infoWmsControl) {
                var infoWmsControlLayers = infoWmsControl.layers;
                if (infoWmsControlLayers) {
                    for (var j = 0; j < infoWmsControlLayers.length; j++) {
                        if (infoWmsControlLayers[j].name === layersName[i]) {
                            infoWmsControlLayers.splice(j, 1);
                        }
                    }
                }
            }
            // aggiorno lo store dei layer
            this.removeLayerFromStore(layersName[i]);
        }

        if (this.map) {
            this.map.featureManager.updateControlLayer();
        }

    },

    /**
     *
     * Function: createVectorLayer
     *
     * Crea un layer vettoriale. Utilizzato da Find, CalcoloPercorsi per creare il layer delle evidenziazioni
     *
     * Parameters:
     * config - {Object} Oggetto configurazione della combo.
     *
     * - layerName - {String} Nome del layer
     * - format - {String} Formato del layer (GeoJSON/WFS)
     * - classes - {Array} Array delle classi
     * - infoOptions - {Object} Oggetto contentente le opzioni per la info
     * - legend - {Object} Oggetto contentente la configurazione della legenda
     *
     * Returns:
     * layer - {OpenLayers.Layer.Vector} Il layer vettoriale creato
     *
     */
    createVectorLayer: function(config) {
        CWN2.Util.log("CWN2.LayerManager.createVectorLayer");

        var format = "GeoJSON";
        var layerName = config.name;
        var classes = config.classes;
        var infoOptions = config.infoOptions;
        var legend = config.legend;
        var showInLegend = (legend) ? true : false;
        var visible = (config.notVisible) ? false : true;
        var projection = config.projection || "EPSG:4326";

        // se esiste già lo ritorno altrimenti lo creo
        return this.map.getLayerByName(layerName) || this.addLayers({
            "type": "GeoJSON",
            "name": layerName,
            "projection": projection,
            "isBaseLayer": false,
            "url": null,
            "visible": visible,
            "showInLegend": showInLegend,
            "classes": classes,
            "infoOptions": infoOptions,
            "legend": legend
        })[0];

    },

    /**
     *
     * Function: createWMSLayer
     *
     * Crea un layer WMS. Utilizzato da Info per creare il layer delle evidenziazioni
     *
     * Parameters:
     * config - {Object} Oggetto configurazione del layer WMS.
     *
     *
     * Returns:
     * layer - {OpenLayers.Layer.WMS} Il layer WMS creato
     *
     */
    createWMSLayer: function(layerConfig) {
        CWN2.Util.log("CWN2.LayerManager.createWMSLayer");

        // se esiste già lo ritorno altrimenti lo creo
        return this.map.getLayerByName(layerConfig.name) || this.addLayers(layerConfig)[0];

    },

    // inizializza gli store dei layer
    initStore: function() {
        CWN2.Util.log("CWN2.LayerManager.initStore");

        this.buildLayerStoreByType("base");
        this.buildLayerStoreByType("overlay");
    },

    /**
     *
     * Function: getLayersConfig
     *
     * Ritorna la configurazione dei layer
     *
     * Returns:
     * config - {Array} Array contenente la configurazione del layer
     */
    getLayersConfig: function() {
        return this.overlayLayersConfig;
    },

    /**
     *
     * Function: getBaseLayersConfig
     *
     * Ritorna la configurazione dei baseLayer
     *
     * Returns:
     * config - {Array} Array contenente la configurazione del layer
     */
    getBaseLayersConfig: function() {
        return this.baseLayersConfig;
    },


    /**
     *
     * Function: getActiveBaseLayerConfig
     *
     * Ritorna il type del base layer attivo
     *
     * Returns:
     * config - {Array} Array contenente la configurazione del layer
     */
    getActiveBaseLayerConfig: function() {
        var activeBaseLayerConfig = null;
        Ext.each(this.baseLayersConfig, function(layer) {
            if (layer.visible) {
                activeBaseLayerConfig = layer;
                return false;
            }
        });
        return activeBaseLayerConfig;

    },
    /**
     *
     * Function: updateInRange
     *
     * Calcola l'attributo inRange dei layer degli store
     * Richiamato sull'evento "moveend" dell'oggetto CWN2.Map
     */
    updateInRange: function() {
        var layers, i;
        layers = this.overlayLayerStore.data.items;
        if (layers.length > 0 && this.map) {
            for (i = 0; i < layers.length; i++) {
                (this.map.getLayerByName(layers[i].data.name).calculateInRange()) ? layers[i].data.inRange = true : layers[i].data.inRange = false;
            }
        }
        layers = this.baseLayerStore.data.items;
        if (layers.length > 0 && this.map) {
            for (i = 0; i < layers.length; i++) {
                (this.map.getLayerByName(layers[i].data.name).calculateInRange()) ? layers[i].data.inRange = true : layers[i].data.inRange = false;
            }
        }
        layers = this.overlayLayersConfig;
        if (layers.length > 0 && this.map) {
            for (i = 0; i < layers.length; i++) {
                (this.map.getLayerByName(layers[i].name).calculateInRange()) ? layers[i].inRange = true : layers[i].inRange = false;
            }
        }

    },

    constructor: function() {
        CWN2.Util.log("CWN2.LayerManager");

        CWN2.Util.assert(CWN2.app.configuration.baseLayers,
            {
                name: "BadConfiguration",
                message: "CWN2.LayerManager.init: baseLayers deve essere valorizzato",
                level: 2
            }
        );

        CWN2.Util.assert(CWN2.app.configuration.baseLayers.length > 0,
            {
                name: "BadConfiguration",
                message: "CWN2.LayerManager.init: baseLayers deve contenere almeno un layer",
                level: 2
            }
        );

        this.overlayLayersConfig = CWN2.app.configuration.layers || [];
        this.baseLayersConfig = CWN2.app.configuration.baseLayers || [];
        this.map = CWN2.app.map;

        // Imposto le proprietà dei baseLayer
        this.setBaseLayers();

        // inizializzo gli store
        this.buildLayerStoreByType("base");
        this.buildLayerStoreByType("overlay");

    },

    /**
     *
     *
     * Function: setLayerVisible
     *
     * Rende un layer visibile o invisibile in mappa
     *
     * Parameters:
     * name - {String} Nome del layer
     * visible - {Boolean} Flag che indica se renderlo visibile o invisibile
     *
     */
    setLayerVisible: function(name, visible) {

        var layer = CWN2.app.map.getLayerByName(name),
            layerConfig = this.getLayerConfigByName(name),
            hilitedLayers = this.getHiliteLayers(name),
            record = this.overlayLayerStore.getById(name) || this.baseLayerStore.getById(name);

        if (layer) {
            layer.setVisibility(visible);
            for (i = 0; i < hilitedLayers.length; i++) {
                hilitedLayers[i].setVisibility(visible);
            }
        }

        if (layerConfig) {
            layerConfig.visible = visible;
        }

        if (record) {
            record.set('visible', visible);
            record.commit();
        }
    },

    getHiliteLayers: function(hilitedLayerName) {
        var hiliteLayers = [];
        var mapLayers = this.map.layers;
        for (var i = 0; i < mapLayers.length; i++) {
            if (mapLayers[i].hiliteLayer) {
                Ext.each(mapLayers[i].hilitedLayers, function(layer) {
                    if (layer === hilitedLayerName)  {
                        hiliteLayers.push(mapLayers[i]);
                    }
                });
            }
        }
        return hiliteLayers;
    },

    applyWmsParam: function(layerName,param, value) {
        if (layerName) {
            var hiliteLayer = this.map.getLayerByName(layerName);
            if (hiliteLayer) {
                var params = {};
                params[param] = value;
                hiliteLayer.mergeNewParams(params);
                var hiliteLayerConfig = this.getLayerConfigByName(layerName);
                if (hiliteLayerConfig) {
                    hiliteLayerConfig.wmsParams[param] = value;
                }
            }
        }
    },

    removeWmsParam: function(layerName,param) {
        if (layerName) {
            var hiliteLayer = this.map.getLayerByName(layerName);
            if (hiliteLayer) {
                hiliteLayer.params[param] = null;
                var hiliteLayerConfig = this.getLayerConfigByName(layerName);
                if (hiliteLayerConfig) {
                    hiliteLayerConfig.wmsParams[param] = null;
                }
            }
        }
    }



});




/**
 *
 * Class: CWN2.LayerModel
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

Ext.define('CWN2.LayerModel', {
    extend: 'Ext.data.Model',
    statics: {
        /**
         * Convenience function for creating new layer model instance object
         * using a layer object.
         *
         * @param {OpenLayers.Layer} layer
         * @return {GeoExt.data.LayerModel}
         * @static
         */
        createFromLayer: function(layer) {
            return this.getProxy().reader.readRecords([layer]).records[0];
        }
    },
    fields: [
        {name: "id", type: 'string'},
        {name: "name", type: 'string'},
        {name: "legendIcon", type: 'string'},
        {name: "legendLabel", type: 'string'},
        {name: "legendPopUpFlag", type: 'bool'},
        {name: "legendLabel", type: 'string'},
        {name: "minScale", type: 'int'},
        {name: "maxScale", type: 'int'},
        {name: "legendPopUpUrl", type: 'string'},
        {name: "multiClasse", type: 'bool'},
        {name: "visible", type: 'bool'},
        {name: "inRange", type: 'bool'},
        {name: "config"}

    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    /**
     * Returns the {OpenLayers.Layer} layer object used in this model instance.
     *
     * @return {OpenLayers.Layer}
     */
    getLayer: function() {
        return this.raw;
    }
});/**
 * Class: CWN2.Layout
 *
 *
 * Costruisce il layout della applicazione
 *
 *
 */
Ext.define("CWN2.Layout", {

    layout: null,
    mapPanel: null,
    mapTitle: null,

    setMapTitle: function(title) {
        Ext.getCmp("cwn2-map-panel").setTitle(title);
    },

    constructor: function(divId) {
        CWN2.Util.log("CWN2.Layout");

        var me = this;

        var layoutConfig = CWN2.app.configuration.application.layout;
        this.mapTitle = layoutConfig.mapTitle;

        // costruisco le opzioni di base
        var basicOptions = {
            id: "cwn2-container",
            layout: "border",
            hideBorders: false,
            forceLayout: true,
            items: buildPanels(layoutConfig)
        };

        // construisco il layout
        switch (layoutConfig.type) {
            case "viewport":
                me.layout = Ext.create('Ext.container.Viewport', basicOptions);
                break;
            case "panel":
                basicOptions.renderTo = divId;
                if (layoutConfig.height) {
                    basicOptions.height = layoutConfig.height;
                }
                if (layoutConfig.width) {
                    basicOptions.width = layoutConfig.width;
                }
                me.layout = Ext.create('Ext.panel.Panel', basicOptions);
                break;
            case "window":
                basicOptions.closeAction = "hide";
                if (layoutConfig.height) {
                    basicOptions.height = layoutConfig.height;
                }
                if (layoutConfig.width) {
                    basicOptions.width = layoutConfig.width;
                }
                me.layout = Ext.create('Ext.window.Window', basicOptions);
                break;
        }

        function buildPanels(layoutConfig) {
            var panels = [];

            // pannello mappa
            if (CWN2.MapPanel) {
                me.mapPanel = new CWN2.MapPanel();
                panels.push(me.mapPanel);
            }

            // pannello legenda
            if (layoutConfig.legend) {
                switch (layoutConfig.legend.type) {
                    // creo una legenda di tipo simple
                    case "simple":
                        panels.push(new CWN2.SimpleLegendPanel());
                        break;
                    case "tree":
                        panels.push(new CWN2.TreeLegendPanel());
                        break;
                }

            }

            // header
            if (layoutConfig.header) {
                panels.push({
                    region: 'north',
                    height: layoutConfig.header.height || 80,
                    id: "cwn2-layout-title",
                    style: layoutConfig.header.style || null,
                    html: layoutConfig.header.html || "Header",
                    xtype: 'container'
                });
            }

            // header
            if (layoutConfig.toolsPanel) {
                panels.push({
                    region: layoutConfig.toolsPanel.position || "south",
                    height: layoutConfig.toolsPanel.height || 80,
                    autoScroll: true,
                    split: true,
                    collapsible: layoutConfig.toolsPanel.collapsible,
                    collapsed: layoutConfig.toolsPanel.collapsed,
                    id: "cwn2-layout-toolspanel",
                    xtype: 'panel'
                });
            }

            return panels;
        }
    }

});





/**
 *
 * Class: OpenLayers.Control.LoadingPanel
 * In some applications, it makes sense to alert the user that something is
 * happening while tiles are loading. This control displays a div across the
 * map when this is going on.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.LoadingPanel = OpenLayers.Class(OpenLayers.Control, {


    /**
     * Property: counter
     * {Integer} A counter for the number of layers loading
     */
    counter: 0,

    /**
     * Property: maximized
     * {Boolean} A boolean indicating whether or not the control is maximized
     */
    maximized: false,

    /**
     * Property: visible
     * {Boolean} A boolean indicating whether or not the control is visible
     */
    visible: true,

    /**
     * Constructor: OpenLayers.Control.LoadingPanel
     * Display a panel across the map that says "loading".
     *
     * Parameters:
     * options - {Object} additional options.
     */
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },

    /**
     * Function: setVisible
     * Set the visibility of this control
     *
     * Parameters:
     * visible - {Boolean} should the control be visible or not?
     */
    setVisible: function(visible) {
        this.visible = visible;
        if (visible) {
            OpenLayers.Element.show(this.div);
        } else {
            OpenLayers.Element.hide(this.div);
        }
    },

    /**
     * Function: getVisible
     * Get the visibility of this control
     *
     * Returns:
     * {Boolean} the current visibility of this control
     */
    getVisible: function() {
        return this.visible;
    },

    /**
     * APIMethod: hide
     * Hide the loading panel control
     */
    hide: function() {
        this.setVisible(false);
    },

    /**
     * APIMethod: show
     * Show the loading panel control
     */
    show: function() {
        this.setVisible(true);
    },

    /**
     * APIMethod: toggle
     * Toggle the visibility of the loading panel control
     */
    toggle: function() {
        this.setVisible(!this.getVisible());
    },

    /**
     * Method: addLayer
     * Attach event handlers when new layer gets added to the map
     *
     * Parameters:
     * evt - {Event}
     */
    addLayer: function(evt) {
        if (evt.layer) {
            evt.layer.events.register("loadstart", this, this.increaseCounter);
            evt.layer.events.register("loadend", this, this.decreaseCounter);
        }
    },

    /**
     * Method: setMap
     * Set the map property for the control and all handlers.
     *
     * Parameters:
     * map - {OpenLayers.Map} The control's map.
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        this.map.events.register("preaddlayer", this, this.addLayer);
        for (var i = 0; i < this.map.layers.length; i++) {
            var layer = this.map.layers[i];
            layer.events.register("loadstart", this, this.increaseCounter);
            layer.events.register("loadend", this, this.decreaseCounter);
        }
    },

    /**
     * Method: increaseCounter
     * Increase the counter and show control
     */
    increaseCounter: function() {
        this.counter++;
        if (this.counter > 0) {
            if (!this.maximized && this.visible) {
                this.maximizeControl();
            }
        }
    },

    /**
     * Method: decreaseCounter
     * Decrease the counter and hide the control if finished
     */
    decreaseCounter: function() {
        if (this.counter > 0) {
            this.counter--;
        }
        if (this.counter == 0) {
            if (this.maximized && this.visible) {
                this.minimizeControl();
            }
        }
    },

    /**
     * Method: draw
     * Create and return the element to be splashed over the map.
     */
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        return this.div;
    },

    /**
     * Method: minimizeControl
     * Set the display properties of the control to make it disappear.
     *
     * Parameters:
     * evt - {Event}
     */
    minimizeControl: function(evt) {
        this.div.style.display = "none";
        this.maximized = false;

        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: maximizeControl
     * Make the control visible.
     *
     * Parameters:
     * evt - {Event}
     */
    maximizeControl: function(evt) {
        this.div.style.display = "block";
        this.maximized = true;

        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: destroy
     * Destroy control.
     */
    destroy: function() {
        if (this.map) {
            this.map.events.unregister("preaddlayer", this, this.addLayer);
            if (this.map.layers) {
                for (var i = 0; i < this.map.layers.length; i++) {
                    var layer = this.map.layers[i];
                    layer.events.unregister("loadstart", this,
                        this.increaseCounter);
                    layer.events.unregister("loadend", this,
                        this.decreaseCounter);
                }
            }
        }
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    CLASS_NAME: "OpenLayers.Control.LoadingPanel"

});
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




Ext.define('CWN2.MapCatalogueLoader', {
  singleton: true,

  loadRequest: function (response, findOptions) {
    CWN2.Util.log("CWN2.MapCatalogueLoader.loadRequest");
    var agRequest = response.data;
    var mapConfig = agRequest.map;
    // memorizzo i dati della richiesta nella configurazione
    CWN2.app.configuration.agRequest = agRequest;
    // gestione find
    if (agRequest.valori.length>0) {
      // impostazione findOptions
      var values = [];
      Ext.each(agRequest.valori, function (valore) {
        if (valore.valorePkAlfa) {
          values.push(valore.valorePkAlfa);
        }
      });
      if (values.length>0) {
        // unisco eventuali findOptions da initOptions (per esempio maxZoomLevel) con quelle della richiesta
        findOptions = findOptions || {};
        var layers = [];
        Ext.each(agRequest.livelli, function (livello) {
          layers.push(livello.codiceLivello);
        });
        Ext.apply(findOptions, {
          flagFindQuery: agRequest.flagFindQuery,
          layers: layers,
          fields: agRequest.livelli[0].nomeFkVersoAlfa,
          values: values,
          tipoFind: agRequest.tipoFind,
          bounds: agRequest.bounds
        });
      }
      // gestione find per coordinate
      if (agRequest.valori[0].longitudine && agRequest.valori[0].latitudine) {
        CWN2.FeatureLoader.loadMarker({
          x: agRequest.valori[0].longitudine,
          y: agRequest.valori[0].latitudine,
          map: CWN2.app.map,
          zoomLevel: 14,
          zoom: true,
          epsgCode: "EPSG:3003"
        });
      }
    }
    // gestione modalità (bottoniera)
    if (agRequest.modalita && agRequest.modalita !== 'GENERICA') {
      var buttons = CWN2.app.configuration.application.layout.ag_toolbar[agRequest.modalita];
      if (!buttons) {
        CWN2.Util.handleException({
          message: "Configurazione bottoni per modalità " + agRequest.modalita + " non presente",
          level: 1
        });
        return;
      }
      Ext.each(buttons, function (button) {
        if (button.options && button.options.preProcessing && typeof(button.options.preProcessing) === "function") {
          button.options.preProcessing(button, agRequest);
        }
        CWN2.app.layout.mapPanel.toolbar.addButton(button);
      });
    }
    return {mapConfig: mapConfig, findOptions: findOptions};
  },

  loadQPGRequest: function (response) {
    CWN2.Util.log("CWN2.MapCatalogueLoader.loadQPGRequest");

    var qpgRequest = response.data;
    var mapConfig = qpgRequest.map;
    mapConfig.name = qpgRequest.titolo;
    // memorizzo i dati della richiesta nella configurazione
    CWN2.app.configuration.qpgRequest = qpgRequest;
    return {mapConfig: mapConfig, tematismi: qpgRequest.tematismi};
  },

  loadMap: function (initOptions) {
    var me = this,
      idMap = initOptions.idMap,
      idRequest = initOptions.idRequest,
      qpgRequest = initOptions.qpgRequest,
      findOptions = initOptions.findOptions,
      loadBaseLayers = initOptions.loadBaseLayers,
      queryBaseLayers = initOptions.queryBaseLayers,
      flagGeoserver = initOptions.flagGeoserver,
      geoserverUrl = initOptions.geoserverUrl,
      app = initOptions.app;

    CWN2.Util.log("CWN2.MapCatalogueLoader.loadMap");

    var layerConfigService = CWN2.Globals.RL_MAP_CONFIG_SERVICE + idMap + "?param=value";
    if (idRequest) {
      layerConfigService = CWN2.Globals.RL_AG_REQUEST_CONFIG_SERVICE + idRequest + "?map_projection=" + CWN2.app.map.projection;
    }
    if (qpgRequest) {
      layerConfigService = CWN2.Globals.RL_QPG_REQUEST_CONFIG_SERVICE + qpgRequest + "?map_projection=" + CWN2.app.map.projection;
    }

    if (loadBaseLayers) {
      layerConfigService += "&loadBaseLayers=true";
    }

    if (queryBaseLayers) {
      layerConfigService += "&queryBaseLayers=true";
    }

    if (flagGeoserver) {
      layerConfigService += "&geoserver=true";
    }

    if (geoserverUrl) {
      layerConfigService += "&geoserverUrl=" + geoserverUrl;
    }

    layerConfigService += "&app=" + app

    var calculateExtent = function (mapConfig) {
      CWN2.Util.log("CWN2.MapCatalogueLoader.calculateExtent");
      var transformedExtent = (mapConfig.projection !== CWN2.app.map.projection) ? CWN2.Util.transformStrBounds(mapConfig.projection, CWN2.app.map.projection, mapConfig.extent) : mapConfig.extent;
      return transformedExtent.split(',');
    };

    CWN2.Util.ajaxRequest({
      type: "JSON",
      url: layerConfigService,
      callBack: function (response) {
        var mapConfig;
        if (idRequest) {
          var req = me.loadRequest(response, findOptions);
          mapConfig = req.mapConfig;
          findOptions = req.findOptions;
        } else {
          if (qpgRequest) {
            var req = me.loadQPGRequest(response);
            mapConfig = req.mapConfig;
          } else {
            mapConfig = response.data;
          }
        }
        // imposto il titolo
        if (initOptions.setMapTitle) {
          var titleEl = Ext.fly(initOptions.setMapTitle);
          if (titleEl) {
            titleEl.update(mapConfig.name)
          }
        } else {
          CWN2.app.layout.setMapTitle(mapConfig.name);
        }
        CWN2.app.layout.mapTitle = mapConfig.name;
        // aggiungo i layer
        CWN2.app.map.layerManager.addLayers(mapConfig.layers);
        // aggiungo i layer dei tematismi QPG
        if (qpgRequest) {
          CWN2.QPG.loadQPGLayers(CWN2.app.configuration.qpgRequest.tematismi);
          // rovescio ordine tematismi in modo tale che ordine tematismi in legenda sia uguale a quello nel bottone
          CWN2.app.configuration.qpgRequest.tematismi.reverse();
        }
        // imposto la displayProjection uguale a quella della mappa
        if (initOptions.setDisplayProjection) {
          CWN2.app.map.displayProjection = new OpenLayers.Projection(mapConfig.projection)
        }

        // imposto extent
        if (mapConfig.extent) {
          CWN2.app.map.initialExtent = calculateExtent(mapConfig);
        }
        CWN2.app.map.zoomToInitialExtent()

        // se tipo mappa è raster imposto lo sfondo bianco
        if (mapConfig.type && mapConfig.type == "R") {
          CWN2.app.map.setBaseLayerOnMap("no_base");
        }
        // se configurata find la effettuo
        if ((findOptions && findOptions.values && findOptions.values !== "null") || (findOptions && findOptions.sldFilter)) {
          findOptions.setInitialExtent = true;
          me.findWMS(findOptions);
        }
        if (findOptions && findOptions.address) {
          findOptions.setInitialExtent = true;
          me.findAddress(findOptions);
        }

        // richiamo eventuale callback
        CWN2.app.callback(initOptions);
      }
    });

  },

  loadLayers: function (initOptions) {
    var idLayer = initOptions.idLayer,
      me = this,
      findOptions = initOptions.findOptions;

    CWN2.Util.log("CWN2.MapCatalogueLoader.loadLayers");

    if (!idLayer || idLayer === "null") {
      var exception = {};
      exception.message = "manca parametro layer";
      exception.level = 1;
      CWN2.Util.handleException(exception);
      return;
    }

    var layerConfigService = CWN2.Globals.RL_LAYER_CONFIG_SERVICE + idLayer;

    CWN2.Util.ajaxRequest({
      type: "JSONP",
      url: layerConfigService,
      callBack: function (response) {
        var layerConfig = response.data;
        if (initOptions.sldUrl) {
          layerConfig[0].wmsParams.SLD = initOptions.sldUrl;
        }
        CWN2.app.map.layerManager.addLayers(layerConfig);
        // se configurata find la effettuo
        if (findOptions) {
          if ((findOptions.idList && findOptions.idList !== "null") || (findOptions.sldFilter)) {
            findOptions.setInitialExtent = true;
            me.findWMS(findOptions);
          } else {
            exception = {};
            exception.message = "Lista valori find non impostata";
            exception.level = 0;
            CWN2.Util.handleException(exception);
          }
        }
        // richiamo eventuale callback
        CWN2.app.callback(initOptions);
      }
    });

  },

  /**
   *
   * Function: findAddress
   *
   * Effettua una find per indirizzo
   *
   *
   * Parameters:
   * findOptions - {Object} Oggetto di configurazione dell'hilite
   *  - address - {String} Indirizzo
   *
   */
  findAddress: function (findOptions) {
    var address = findOptions.address,
      me = this;

    CWN2.Util.log("CWN2.MapCatalogueLoader.findAddress");

    var googleSrvURL = CWN2.Globals.GOOGLE_GEOCODE_PROXY;
    googleSrvURL += "&address=" + address;
    CWN2.Util.ajaxRequest({
      type: "JSON",
      url: googleSrvURL,
      callBack: function (response) {
        var results = [];
        if (response.results) {
          Ext.each(response.results, function (result) {
            results.push({
              label: result.formatted_address,
              x: result.geometry.location.lng,
              y: result.geometry.location.lat,
              rilevanza: result.types[0],
              trovato: result.formatted_address
            })
          });
        }
        if (results.length>0) {
          CWN2.FeatureLoader.loadMarker(
            {
              x: results[0].x,
              y: results[0].y,
              map: CWN2.app.map,
              epsgCode: "EPSG:4326",
              label: '',
              zoomLevel: 17
            }
          );
        } else {
          CWN2.Util.msgBox("Indirizzo non trovato", "INFO")
        }
      }
    });

  },
  /**
   *
   * Function: findWMS
   *
   * Effettua una find con evidenziazione su layer WMS
   *
   *
   * Parameters:
   * findOptions - {Object} Oggetto di configurazione dell'hilite
   *  - layerName - {String} Nome del layer
   *  - idField - {String} Nome del campo ID su cui fare il filtro
   *  - idList - {String} Lista dei valori separati da virgola
   *  - zoomLevel - {String} Livello di zoom massimo
   *  - bounds - {OpenLayers.Bounds} Bounds per find
   *
   */
  findWMS: function (findOptions) {
    var layers = findOptions.layers,
      me = this;

    CWN2.Util.log("CWN2.MapCatalogueLoader.findWMS");

    var missingLayerConfig = [];
    Ext.each(layers, function (layerName) {
      if (!CWN2.app.map.layerManager.isLayerInConfig(layerName)) {
        missingLayerConfig.push(layerName.replace("L", ""));
      }
    });
    if (missingLayerConfig.length === 0) {
      var layerConfig = CWN2.app.map.layerManager.getLayerConfigByName(layers[0])
      me.findLayer(findOptions, layerConfig);
    } else {
      CWN2.Util.ajaxRequest({
        type: "JSONP",
        url: CWN2.Globals.RL_LAYER_CONFIG_SERVICE + missingLayerConfig.join(","),
        callBack: function (response) {
          var layerConfig = response.data[0];
          CWN2.app.map.layerManager.addLayers(layerConfig);
          me.findLayer(findOptions, layerConfig);
        }
      });
    }
  },

  findLayer: function find (findOptions, layerConfig) {
    var me = this;

    CWN2.Util.log("CWN2.MapCatalogueLoader.findLayer");

    if (!Ext.isArray(findOptions.values)) {
      findOptions.values = [findOptions.values];
    }

    if (!findOptions.sldFilter) {
      findOptions.sldFilter = this.buildSldFilter(findOptions);
    }

    // funzione di callback richiamata da Util.getWFSBound
    var hiliteFeature = function (bounds) {
      // faccio il filtro su livello base (QUERY) solo se livello geoserver
      if (findOptions.flagFindQuery === "QUERY") {
        me.hiliteFeatureQuery(findOptions, bounds, layerConfig.flagGeoserver);
      }
      me.hiliteFeatureFind(findOptions, bounds);
    };

    // se ho già il bounds faccio hilitefeature altrimenti prendo bound da servizio WFS
    if (findOptions.bounds) {
      var bounds = (typeof findOptions.bounds === "string") ? OpenLayers.Bounds.fromString(findOptions.bounds) : findOptions.bounds;
      hiliteFeature(bounds);
    } else {
      //TODO: NOTA getWFSBound funziona solo per find su singolo layer
      if (findOptions.layers.length === 1) {
        var typeName = findOptions.layers[0];
        var wfsUrl = (Array.isArray(layerConfig.wmsParams.url))? layerConfig.wmsParams.url[0] : layerConfig.wmsParams.url;
        var bounds = this.getWFSBound({

          wfsUrl: CWN2.Globals.proxy + wfsUrl + "VERSION=1.0.0&SERVICE=WFS&REQUEST=GetFeature&TYPENAME=" + typeName + "&Filter=" + findOptions.sldFilter,
          callback: hiliteFeature
        });
      }
    }
  },

  buildSldFilter: function (findOptions) {
    if (!findOptions.values || findOptions.values === "null") {
      var exception = {};
      exception.message = "manca parametro values";
      exception.level = 0;
      CWN2.Util.handleException(exception);
      return;
    }
    // creo il filtro sld
    var cachePostGIS = CWN2.app.map.layerManager.getFieldFromLayerConfig(findOptions.layers[0],"cachePostGIS");
    return CWN2.WmsSldHiliter.getFilter(findOptions.fields, findOptions.values, cachePostGIS);
  },

  hiliteFeatureFind: function (findOptions, bounds) {
    Ext.each(findOptions.layers, function (layer) {
      var cachePostGIS = CWN2.app.map.layerManager.getFieldFromLayerConfig(layer,"cachePostGIS");
      var fields = (cachePostGIS)? findOptions.fields.toLowerCase() : findOptions.fields;
      var hilite = new CWN2.WmsSldHiliter(CWN2.app.map, "_findWMS_" + layer).hiliteFeature({
        layers: [layer],
        fields: fields,
        values: findOptions.values,
        sldFilter: findOptions.sldFilter,
        bounds: bounds,
        zoomLevel: findOptions.zoomLevel,
        maxZoomLevel: findOptions.maxZoomLevel,
        callback: function () {
          if (findOptions.setInitialExtent) {
            CWN2.app.map.initialExtent = CWN2.app.map.getExtent();
          }
        }
      });

    });
  },

  hiliteFeatureQuery: function (findOptions, bounds, flagGeoserver) {

    if (flagGeoserver) {
      // creo il file sld e imposto il parametro sld dei layer oggetto di query
      CWN2.Util.ajaxRequest({
        type: "JSON",
        url: CWN2.Globals.RL_CREATE_SLD_SERVICE,
        jsonData: {"layers": findOptions.layers, "sldFilter": findOptions.sldFilter},
        callBack: function (response) {
          Ext.each(findOptions.layers, function (layer) {
            // Annullo parametri TILED e LAYERS
            CWN2.app.map.getLayerByName(layer).params.LAYERS = null;
            CWN2.app.map.getLayerByName(layer).params.TILED = false;
            var sldUrl = "http://srvcarto.regione.liguria.it/geoservices/temp/" + response.data.sldFile;
            CWN2.app.map.layerManager.applyWmsParam(layer, "SLD", sldUrl);
          });
          var maxZoomLevel = findOptions.maxZoomLevel || 17;
          CWN2.WmsSldHiliter.zoomToFeatures(bounds, findOptions.zoomLevel, maxZoomLevel);
        },
        disableException: true
      });

    } else {
      var geomType = [];
      Ext.each(findOptions.layers, function (layer) {
        geomType.push(CWN2.app.map.layerManager.getFieldFromLayerConfig(layer, "geomSubType"));
      });
      var sldBody = (((findOptions.fields && findOptions.values && findOptions.values.length>0) || findOptions.sldFilter) && geomType.length>0) ?
        CWN2.WmsSldHiliter.getStyle({
          layers: findOptions.layers,
          geomType: geomType,
          fields: findOptions.fields,
          values: findOptions.values,
          sldFilter: findOptions.sldFilter
        }) :
        null;
      var sldCleanBody = CWN2.WmsSldHiliter.getStyle({
        layers: findOptions.layers,
        geomType: geomType,
        fields: findOptions.fields,
        values: null,
        sldFilter: null
      });
      CWN2.Util.ajaxRequest({
        type: "JSON",
        url: CWN2.Globals.RL_CREATE_SLD_SERVICE,
        jsonData: {"sldBody": sldBody, "sldCleanBody": sldCleanBody},
        callBack: function (response) {
          Ext.each(findOptions.layers, function (layer) {
            CWN2.app.map.layerManager.applyWmsParam(layer, "sld", response.data.sldUrl)
          });
        },
        disableException: true
      });
      var maxZoomLevel = findOptions.maxZoomLevel || 17;
      CWN2.WmsSldHiliter.zoomToFeatures(bounds, findOptions.zoomLevel, maxZoomLevel);
    }

  },

  getGeoserverSldFile: function (layers, sldFilter, callBack) {
    CWN2.Util.ajaxRequest({
      type: "JSON",
      url: CWN2.Globals.RL_CREATE_SLD_SERVICE,
      callBack: callBack,
      jsonData: {"layers": layers, "sldFilter": sldFilter},
      disableException: true
    });
  },

  /**
   * Function: getWFSBound
   *
   * Ritorna il bound degli elementi attraverso un servizio WFS
   *
   * Parameters:
   * wfsUrl - {string} URL del servizio WFS
   * typeName - {string} nome della feature
   * sldFilter - {string} Filtro SLD
   * callback - {Function} Funzione di callback da richiamare
   *
   * Returns:
   * {OpenLayers.Bound}
   *
   */
  getWFSBound: function (initOptions) {
    // URL di prova http://localhost:8080/geoservices/proxy/proxy.jsp?url=http://www.cartografiarl.regione.liguria.it/mapserver/mapserv.exe?MAP=E:/progetti/mapfiles/repertoriocartografico/CONFINI/56.map&VERSION=1.0.0&SERVICE=WFS&REQUEST=GetFeature&TYPENAME=L3&Filter=%3CFilter%3E%3COr%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3EID%3C/PropertyName%3E%3CLiteral%3E30%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3EID%3C/PropertyName%3E%3CLiteral%3E31%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3C/Or%3E%3C/Filter%3E
    var wfsUrl = initOptions.wfsUrl;
    var callback = initOptions.callback;

    CWN2.Util.log("CWN2.MapCatalogueLoader.getWFSBound");
    CWN2.loadingScreen = Ext.getBody().mask('Interrogazione WFS', 'loadingscreen');

    CWN2.Util.ajaxRequest({
      type: "XML",
      url: wfsUrl,
      callBack: function (xml) {
        var serviceException, boundedBy, bbox, coordinates, srs;
        if (Ext.isIE) {
          // gestione service exception
          serviceException = Ext.DomQuery.selectValue('ServiceException', xml);
          if (serviceException) {
            CWN2.Util.handleException({
              message: "CWN2.Util.getWFSBound - Service Exception: " + serviceException,
              level: 2
            });
            return;
          }
          // calcolo bounds
          boundedBy = xml.childNodes[1].firstChild;
          if (!boundedBy) {
            CWN2.Util.handleException({
              message: "CWN2.Util.getWFSBound - bbox non ritornato dal servizio ",
              level: 2
            });
          }
          bbox = boundedBy.firstChild;
          if (!bbox) {  // Gestione not found
            CWN2.Util.handleException({
              message: "CWN2.Util.getWFSBound - elemento non trovato ",
              level: 2
            });
            return;
          }
          coordinates = (bbox.firstChild && bbox.firstChild.firstChild) ? bbox.firstChild.firstChild.data : null;
          if (!coordinates) {  // Gestione not found
            CWN2.Util.handleException({
              message: "CWN2.Util.getWFSBound - elemento non trovato ",
              level: 2
            });
            return;
          }
          srs = (bbox.attributes) ? bbox.attributes[0].text : null;
        } else {
          // gestione service exception
          serviceException = Ext.DomQuery.selectValue('ServiceException', xml);
          if (serviceException) {
            CWN2.Util.handleException({
              message: "CWN2.getWFSBound - Service Exception: " + serviceException,
              level: 2
            });
            return;
          }
          // calcolo bounds
          boundedBy = Ext.DomQuery.select('gml|boundedBy', xml)[0];
          if (!boundedBy) {
            CWN2.Util.handleException({
              message: "CWN2.getWFSBound - elemento non trovato ",
              level: 2
            });
            return;
          }
          bbox = Ext.DomQuery.select('gml|Box', boundedBy)[0];
          if (!bbox) {
            CWN2.Util.handleException({
              message: "CWN2.getWFSBound - elemento non trovato ",
              level: 2
            });
            return;
          }
          coordinates = Ext.DomQuery.selectValue('gml|coordinates', bbox);
          if (!coordinates) {
            CWN2.Util.handleException({
              message: "CWN2.getWFSBound - elemento non trovato ",
              level: 2
            });
            return;
          }
          srs = Ext.DomQuery.selectValue('gml|Box/@srsName', boundedBy);
        }

        if (coordinates && srs) {
          if (coordinates === "-1,-1 0,0") {
            return;
          }
          srs = srs.replace('http://www.opengis.net/gml/srs/epsg.xml#', 'EPSG:');
          var bounds = (srs !== CWN2.app.map.projection) ?
            OpenLayers.Bounds.fromString(CWN2.Util.transformStrBounds(srs, CWN2.app.map.projection, coordinates.replace(" ", ","))) :
            OpenLayers.Bounds.fromString(coordinates.replace(" ", ","));
          callback(bounds);
        }
      }
    });
  },

  ag_bottoni_coordinate: function (projection) {
    var bottoni = [
      {
        "name": "coordinate",
        "options": {
          "pressed": true,
          "projection": projection,
          "callBacks": {
            "submit": function (geom) {
              CWN2.MapCatalogueLoader.ag_insertCoordinate(geom.x, geom.y);
            },
            "cancel": function (geom) {
              Ext.MessageBox.confirm(
                CWN2.I18n.get('Conferma'),
                CWN2.I18n.get('Sei sicuro?'),
                function (btn) {
                  if (btn === "yes") {
                    CWN2.MapCatalogueLoader.ag_insertCoordinate("", "");
                  }
                }
              );
            }
          }
        }
      }
    ];
    return bottoni;
  },

  ag_bottoni_filtro: function () {
    var bottoni = [
      {
        "name": "selectfeature",
        "options": {
          "idLayer": "",
          "iconCls": "selezioneOggetti",
          "radius": 5,
          "preProcessing": function (button, agRequest) {
            var codLayers = [];
            Ext.each(agRequest.agLivelli, function (layer) {
              codLayers.push(layer.codiceLivello)
            });
            button.options.idLayer = codLayers.join(",");
          },
          "callBacks": {
            "submit": function (items, btn) {
              CWN2.MapCatalogueLoader.ag_insertFeature(items);
            },
            "cancel": function (items, btn) {
              btn.getEl().dom.click();
            }
          }
        }
      },
      {
        "name": "drawRegularPolygon",
        "options": {
          "id": "drawCircle",
          "type": "circle",
          "tooltip": "Inserisci un cerchio",
          "iconCls": "selezioneCerchio",
          "singleFeature": true,
          "callback": function (geom, evt) {
            CWN2.MapCatalogueLoader.ag_confermaFiltro("circle", geom, evt);
          }
        }
      },
      {
        "name": "drawRegularPolygon",
        "options": {
          "id": "drawRectangle",
          "type": "rectangle",
          "tooltip": "Inserisci un rettangolo",
          "iconCls": "selezioneRettangolo",
          "singleFeature": true,
          "callback": function (geom, evt) {
            CWN2.MapCatalogueLoader.ag_confermaFiltro("rectangle", geom, evt);
          }
        }
      },
      {
        "name": "drawPolygon",
        "options": {
          "singleFeature": true,
          "iconCls": "selezionePoligono",
          "callback": function (geom, evt) {
            CWN2.MapCatalogueLoader.ag_confermaFiltro("polygon", geom, evt);
          }
        }
      },
      {
        "name": "generic",
        "options": {
          "id": "annulla-filtro",
          "iconCls": "selezioneAnnulla",
          "tooltip": "Annulla",
          "callback": function () {
            CWN2.MapCatalogueLoader.ag_ritorna("");
          }
        }
      }
    ];
    return bottoni;
  },

  ag_ritorna: function (idRichiesta) {
    var chiamante = CWN2.app.configuration.agRequest.chiamante;
    if (chiamante.indexOf("?")> -1) {
      chiamante += "&idRichiesta=" + idRichiesta;
    } else {
      chiamante += "?idRichiesta=" + idRichiesta;
    }
    window.location = chiamante;
  },

  ag_insertCoordinate: function (x, y) {
    var data = {
      "modalita": "COORDINATE",
      "applicazione": CWN2.app.configuration.agRequest.applicazione,
      "idAlfaGis": CWN2.app.configuration.agRequest.idAlfaGis,
      "longitudine": x,
      "latitudine": y
    }
    CWN2.MapCatalogueLoader.ag_callInsertService(data);
  },

  ag_confermaFiltro: function (type, geom, evt) {
    Ext.MessageBox.show({
      title: 'Conferma',
      msg: 'Confermi?',
      buttonText: {yes: "Conferma", no: "Annulla"},
      fn: function (btn) {
        switch (btn) {
          case "yes":
            CWN2.MapCatalogueLoader.ag_insertFiltro(type, geom, evt)
            break;
          case "no":
            evt.feature.layer.removeAllFeatures();
            break;
        }
      },
      animateTarget: 'mb4',
      icon: Ext.MessageBox.QUESTION
    });
  },

  ag_insertFeature: function (items) {
    var data = {
      "modalita": "FILTRO",
      "filterType": "feature",
      "applicazione": CWN2.app.configuration.agRequest.applicazione,
      "idAlfaGis": CWN2.app.configuration.agRequest.idAlfaGis
    }
    data.idField = CWN2.app.configuration.agRequest.agLivelli[0].idField;
    data.valori = [];
    Ext.each(items, function (item) {
      data.valori.push(item.data.ID);
    });
    CWN2.MapCatalogueLoader.ag_callInsertService(data)
  },

  ag_insertFiltro: function (type, geom, evt) {
    var data = {
      "modalita": "FILTRO",
      "filterType": type,
      "applicazione": CWN2.app.configuration.agRequest.applicazione,
      "idAlfaGis": CWN2.app.configuration.agRequest.idAlfaGis
    }
    if (type === "circle") {
      data.points = [
        [geom.bounds.getCenterLonLat().lon, geom.bounds.getCenterLonLat().lat]
      ];
      data.radius = geom.bounds.getWidth() / 2;
    } else {
      data.points = []
      Ext.each(geom.components[0].components, function (point) {
        data.points.push([parseInt(point.x), parseInt(point.y)]);
      });
      data.points[data.points.length - 1] = data.points[0];
    }
    CWN2.MapCatalogueLoader.ag_callInsertService(data)
  },

  ag_callInsertService: function (data) {
    CWN2.loadingScreen = Ext.getBody().mask('Caricamento Filtro', 'loadingscreen');
    CWN2.Util.ajaxRequest({
      type: "JSON",
      url: CWN2.Globals.RL_AG_REQUEST_CONFIG_SERVICE,
      callBack: function (response) {
        CWN2.app.removeLoadingScreen();
        var exception = {};
        if (!response) {
          exception.message = response.responseText;
          exception.level = 2;
          CWN2.Util.handleException(exception);
          return;
        }
        if (response.success === false) {
          exception.message = response.message;
          exception.level = 2;
          CWN2.Util.handleException(exception);
          return;
        }
        CWN2.MapCatalogueLoader.ag_ritorna(response.data.idRichiesta);
      },
      jsonData: data,
      disableException: true
    });
  }
});

/**
 *
 * Class: CWN2.MapPanel
 *
 * Costruisce il pannello per la mappa
 * Estende GeoExt.MapPanel
 *
 *
 */

Ext.define('CWN2.MapPanel', {
    extend: 'GeoExt.panel.Map',
    alias: 'widget.cwn2-mappanel',

    region: "center",
    bodyStyle: "background-color:#FFFFFF",
    border: false,

    /**
     *
     * Constructor: CWN2.MapPanel
     *
     * Costruisce il pannello per la mappa
     *
     * Parameters:
     *
     *
     */
    constructor: function() {
        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false */
        "use strict";
        CWN2.Util.log("CWN2.MapPanel");

        var layoutConfig = CWN2.app.configuration.application.layout;

        this.map = CWN2.app.map = new CWN2.Map(CWN2.app);
        this.id = "cwn2-map-panel";

        // costruisco statusbar e toolbar
        var dockedItems = [];
        if (layoutConfig.statusBar) {
            var statusbar = new CWN2.Statusbar(layoutConfig.widgets);
            dockedItems.push(statusbar);
        }
        if (layoutConfig.toolbar) {
            this.pressedButton = layoutConfig.toolbar.pressed || "pan";
            var toolbar = new CWN2.Toolbar(layoutConfig.toolbar, this);
            dockedItems.push(toolbar);
        }

        // se caricamento dinamico mappa imposto titolo provvisorio per evitare peroblemi di shift a layer google
        var title = ((CWN2.app.initOptions.idMap || CWN2.app.initOptions.idRequest) && !CWN2.app.initOptions.setMapTitle) ?
            "_" : layoutConfig.mapTitle || null;

        var panelOptions = {
            id: this.id,
            title: title,
            map: this.map,
            dockedItems: dockedItems
        };

        this.superclass.constructor.call(this, panelOptions);

        // Lancio eventi ExtJS per selezione feature
        // registro callback su selectfeature
        // TODO: gestire altri eventi
        var me = this;
        me.map.featureManager.registerCallback(
            "onFeatureSelect",
            function(feature) {
                me.fireEvent('featureselect', feature);
            }
        )
    },

    /**
     *
     * Method: getToolbar
     *
     * Ritorna la toolbar del mappanel
     *

     *
     *
     */
    getToolbar: function() {
        return Ext.ComponentQuery.query('cwn2-toolbar')[0];
    }


});
/**
 *
 * Class: CWN2.MultiClassLegendWindow
 *
 * Crea una finestra ExtJS per la legenda delle classi di un layer multiclasse
 *
 */

Ext.define('CWN2.MultiClassLegendWindow', {

    extend: 'Ext.window.Window',

    /**
     *
     * Constructor: CWN2.MultiClassLegendWindow
     * Crea una finestra ExtJS per la legenda delle classi di un layer multiclasse
     *
     * Parameters:
     * layerConfig - {Object} Oggetto configurazione del layer.
     *
     * Return:
     * {CWN2.MultiClassLegendWindow}
     *
     */

    constructor: function(layerConfig) {

        //layerConfig.legend.popUpWidth

        CWN2.MultiClassLegendWindow.superclass.constructor.call(this, {
            title: layerConfig.legend.label,
            height: layerConfig.legend.popUpHeight || 400,
            width: layerConfig.legend.popUpWidth || 600,
            layout: "fit",
            items: [
                {
                    xtype: "panel",
                    bodyStyle: "padding:5px",
                    autoScroll: true,
                    items: [
                        {
                            xtype: "dataview",
                            store: new Ext.data.Store({
                                data: layerConfig.classes,
                                fields: [
                                    { name: "icon", mapping: "legendIcon" },
                                    { name: "label", mapping: "legendLabel" }
                                ]
                            }),
                            tpl: new Ext.XTemplate(
                                '<table width=100% border=0>',
                                '<tpl for=".">',
                                '<tr>',
                                '<td width=30><img src="{icon}"></td>',
                                '<td>{label}</td>',
                                '</tpl>'
                            ),
                            autoHeight: true,
                            multiSelect: false,
                            itemSelector: "div.thumb-wrap",
                            emptyText: ""
                        }
                    ]
                }
            ]
        });

    }

});




/**
 *
 * Class:  CWN2.ogcServicesMngr
 *
 * Gestione dei servizi OGC (WMS/WFS)
 *
 *
 */
/*global CWN2:false, window:false, OpenLayers:false */

Ext.define('CWN2.OgcServicesMngr', {

    alias: 'widget.cwn2-ogcservicemanager',

    /**
     *
     *  Function: add
     *
     *  Aggiunge una applicazione al registry.
     *
     *  Parameters:
     *  serviceType - {string} Stringa Tipo di servizio wms/wfs
     *  serviceTitle - {string} Stringa Nome del servizio
     *  serviceUrl - {string} Stringa URL del servizio
     *  proxyUrl - {string} Stringa URL del proxy
     *
     */
    addService: function(serviceType, serviceTitle, serviceUrl, proxyUrl) {

        var proxy = proxyUrl || CWN2.Globals.proxy;
        var proxyServiceUrl = proxy + serviceUrl;

        var store = Ext.create('GeoExt.data.WmsCapabilitiesLayerStore', {
            storeId: "wmsCapStore",
            url: proxyServiceUrl,
            autoLoad: true,
            listeners: {
                'load': function(store, records, options) {
                    CWN2.ogcServicesMngr.loadLayers(serviceUrl, records);
                }
            }
        });
    },

    /**
     *
     * Function: loadLayers
     *
     * Carica i layer del servizio
     *
     * Parameters:
     * id -  {string} ID della applicazione
     *
     */
    loadLayers: function(serviceUrl, records) {

        var len = records.length,
            srvUrl = OpenLayers.Util.removeTail(serviceUrl),
            layerName,
            layerProjection,
            layerMinScale = 0,
            layerMaxScale = 0,
            layerTitle,
            layerIcon = null,
            layerLegend = null,
            legendPopUpUrl = null,
            legendPopUpWidth = 600,
            legendPopUpHeight = 400;

        // ATTENZIONE: non carico gli ultimi due livelli perch� sono quelli aggregati
        // Vale solo per i servizi interni di R.L.
        len = len - 2;

        var layersToLoad = [];

        for (var i = 0; i < len; i++) {
            var wmsLayer = records[i].data;

            layerName = wmsLayer.name;
            layerMinScale = wmsLayer.minScale;
            layerMaxScale = wmsLayer.maxScale;
            layerTitle = wmsLayer.title.replace(/_/g, ' ');

            layerLegend = CWN2.ogcServicesMngr.getLayerLegend(layerTitle, wmsLayer);

            var layer = {
                "name": layerName,
                "type": "WMS",
                "visible": true,
                "projection": layerProjection,
                "minScale": layerMinScale,
                "maxScale": layerMaxScale,
                "opacity": 1,
                "legend": layerLegend,
                "classes": [],
                "wmsParams": {
                    "url": srvUrl,
                    "name": layerName,
                    "transparent": true
                },
                "infoOptions": {}
            };

            layersToLoad.push(layer);
        }

        this.app.map.layerManager.addLayers(layersToLoad);

    },

    /**
     *
     * Function: getLayerLegend
     *
     * Carica i layer del servizio
     *
     * Parameters:
     * id -  {string} ID della applicazione
     *
     */
    getLayerLegend: function(layerTitle, wmsLayer) {

        var legend = {};

        legend.label = layerTitle;

        if (wmsLayer.styles.length > 0) {
            // se trovo styles impostati imposto la legenda in popup (valido per servizi interni)
            if ((wmsLayer.styles[0].legend) && (wmsLayer.styles[0].legend.href)) {
                if (wmsLayer.styles[0].name == "legenda") {
                    legend.icon = wmsLayer.styles[0].legend.href;
                } else {
                    legend.icon = "http://geoportale.regione.liguria.it/geoviewer/img/legend/classi.gif";
                    legend.popUpUrl = wmsLayer.styles[0].legend.href;
                    if ((wmsLayer.styles[0].legend.width) && (wmsLayer.styles[0].legend.height)) {
                        legend.popUpWidth = parseInt(wmsLayer.styles[0].legend.width) + parseInt(31);
                        legend.popUpHeight = parseInt(wmsLayer.styles[0].legend.height) + parseInt(35);
                    }
                }
            }
            // controllo min e max height
            if (legend.popUpHeight) {
                if (legend.popUpHeight < 100) {
                    legend.popUpHeight = 100;
                }
                if (legend.popUpHeight > 400) {
                    legend.popUpHeight = 400;
                }
            }
        } else {
            // se non trovo styles impostati assumo che sia un raster (valido per servizi interni)
            legend.icon = "http://geoportale.regione.liguria.it/geoviewer/img/legend/raster.gif"
        }

        return legend;
    },

    constructor: function(app) {
        this.app = app;
    }
});


/*
 *  Class: OpenLayersExt.js
 *  
 *  Estensioni delle classi Openlayers.
 *
 *  Vengono implementati OVERRIDE di metodi OL per rimediare bug o personalizzare il comportamento
 *  
 */



/*
 *  Function: OpenLayers.Layer.Vector.setOpacity
 *  
 *  Serve per rimediare un bug OL:
 *
 *  Se ho attivo il controllo SelectFeature su più di un livello vettoriale il metodo non funziona.
 *
 *  Bisogna intervenire non sul livello stesso (this) ma sul layer di tipo RootContainer e in
 *      particolare sul div che ha id = Layer.id + "_root"
 *  
 *  
 */
OpenLayers.Layer.Vector.prototype.setOpacity = function(opacity) {


    //	CWN2.Util.log('Openlayers.Layer.Vector.setOpacity');

    if (opacity != this.opacity) {
        this.opacity = opacity;
        for (var i = 0, len = this.div.childNodes.length; i < len; ++i) {
            if (this.div.childNodes[i].firstChild) {
                var element = this.div.childNodes[i].firstChild;
                OpenLayers.Util.modifyDOMElement(element, null, null, null, null, null, null, opacity);
            } else {
                var elementRoot = document.getElementById(this.id + "_root");
                if (elementRoot) {
                    OpenLayers.Util.modifyDOMElement(elementRoot, null, null, null, null, null, null, opacity);
                }
            }
        }
        if (this.map != null) {
            this.map.events.triggerEvent("changelayer", {
                layer: this,
                property: "opacity"
            });
        }
    }
};

/*
 *  Function: OpenLayers.Feature.isSelected
 *
 *
 *  Nuovo metodo: ritorna true se la feature è tra quelle selezionate
 *
 */

OpenLayers.Feature.prototype.isSelected = function() {

    var selected = this.layer.selectedFeatures;

    for (var i = 0; i < selected.length; i++) {
        if (this === selected[i]) {
            return true;
        }
    }
    return false;

};

/*
 *  Function: OpenLayers.Control.WMSGetFeatureInfo.findLayers
 *
 *
 *  Override metodo findLayer: verifica che il layer sia nel range di scala
 *
 */

OpenLayers.Control.WMSGetFeatureInfo.prototype.findLayers = function() {

    var candidates = this.layers || this.map.layers;
    var layers = [];
    var layer, url;
    for (var i = candidates.length - 1; i >= 0; --i) {
        layer = candidates[i];
// INIZIO MODIFICHE - verifico che il layer sia nel range di scala
        if (layer instanceof OpenLayers.Layer.WMS &&
            (!this.queryVisible || layer.getVisibility()) &&
            layer.inRange) {
//            if(layer instanceof OpenLayers.Layer.WMS &&
//               (!this.queryVisible || layer.getVisibility())) {
// FINE MODIFICHE
            url = OpenLayers.Util.isArray(layer.url) ? layer.url[0] : layer.url;
            // if the control was not configured with a url, set it
            // to the first layer url
            if (this.drillDown === false && !this.url) {
                this.url = url;
            }
            if (this.drillDown === true || this.urlMatches(url)) {
                layers.push(layer);
            }
        }
    }
    return layers;
};

/*
 *  Function: OpenLayers.Control.WMSGetFeatureInfo.buildWMSOptions
 *
 *
 *  Override metodo buildWMSOptions: verifica che il layer sia nel range di scala
 *
 */

OpenLayers.Control.WMSGetFeatureInfo.prototype.buildWMSOptions = function(url, layers, clickPosition, format) {
    var layerNames = [], styleNames = [];
    for (var i = 0, len = layers.length; i < len; i++) {
        if (layers[i].params.LAYERS != null) {
            layerNames = layerNames.concat(layers[i].params.LAYERS);
            styleNames = styleNames.concat(this.getStyleNames(layers[i]));
        }
    }
    var firstLayer = layers[0];
    // use the firstLayer's projection if it matches the map projection -
    // this assumes that all layers will be available in this projection
    var projection = this.map.getProjection();
    var layerProj = firstLayer.projection;
    if (layerProj && layerProj.equals(this.map.getProjectionObject())) {
        projection = layerProj.getCode();
    }
    var params = OpenLayers.Util.extend({
            service: "WMS",
            version: firstLayer.params.VERSION,
// AGGIUNGO LA LETTURA DEL PARAMETRO SLD
            sld: firstLayer.params.SLD,
// FINE INTERVENTO
            request: "GetFeatureInfo",
            exceptions: firstLayer.params.EXCEPTIONS,
            bbox: this.map.getExtent().toBBOX(null,
                firstLayer.reverseAxisOrder()),
            feature_count: this.maxFeatures,
            height: this.map.getSize().h,
            width: this.map.getSize().w,
            format: format,
            info_format: firstLayer.params.INFO_FORMAT || this.infoFormat
        }, (parseFloat(firstLayer.params.VERSION) >= 1.3) ?
        {
            crs: projection,
            i: parseInt(clickPosition.x),
            j: parseInt(clickPosition.y)
        } :
        {
            srs: projection,
            x: parseInt(clickPosition.x),
            y: parseInt(clickPosition.y)
        }
    );
    if (layerNames.length != 0) {
        params = OpenLayers.Util.extend({
            layers: layerNames,
            query_layers: layerNames,
            styles: styleNames
        }, params);
    }
    OpenLayers.Util.applyDefaults(params, this.vendorParams);
    return {
        url: url,
        params: OpenLayers.Util.upperCaseObject(params),
        callback: function(request) {
            this.handleResponse(clickPosition, request, url);
        },
        scope: this
    };
};
/*
 *  Function: OpenLayers.Control.WMSGetFeatureInfo.addLayers
 *
 *
 *  Nuova funzione: permette di aggiungere layers all'array dei layer interrogabili
 *
 * Parameters:
 * layers - {Array} Array dei layer OL da aggiungere
 *
 */

OpenLayers.Control.WMSGetFeatureInfo.prototype.addLayers = function(layers) {

    if (!this.layers) {
        this.layers = [];
    }
    for (var i = 0; i < layers.length; i++) {
        this.layers.push(layers[i])
    }

};

/**
 * Class: OpenLayers.Strategy.RuleCluster
 * Strategy for vector feature clustering according to a given rule.
 *
 * Inherits from:
 *  - <OpenLayers.Strategy.Cluster>
 */
OpenLayers.Strategy.RuleCluster = OpenLayers.Class(OpenLayers.Strategy.Cluster, {
    /**
     * the rule to use for comparison
     */
    rule: null,
    /**
     * Method: shouldCluster
     * Determine whether to include a feature in a given cluster.
     *
     * Parameters:
     * cluster - {<OpenLayers.Feature.Vector>} A cluster.
     * feature - {<OpenLayers.Feature.Vector>} A feature.
     *
     * Returns:
     * {Boolean} The feature should be included in the cluster.
     */
    shouldCluster: function(cluster, feature) {
        var superProto = OpenLayers.Strategy.Cluster.prototype;
        return this.rule.evaluate(cluster.cluster[0]) &&
            this.rule.evaluate(feature) &&
            superProto.shouldCluster.apply(this, arguments);
    },
    CLASS_NAME: "OpenLayers.Strategy.RuleCluster"
});

/*
 *  Function: OpenLayers.Strategy.Cluster.cluster
 *
 *
 *  Override metodo cluster: se un cluster è formato da una sola feature eredita gli attributi della feature
 *
 */
// COMMENTO PERCHE' NON FUNZIONA CON NUOVA VERSIONE OL
/*
OpenLayers.Strategy.Cluster.prototype.cluster = function(event) {

    if ((!event || event.zoomChanged) && this.features) {
        var resolution = this.layer.map.getResolution();
        if (resolution != this.resolution || !this.clustersExist()) {
            this.resolution = resolution;
            var clusters = [];
            var feature, clustered, cluster;
            for (var i = 0; i < this.features.length; ++i) {
                feature = this.features[i];
                if (feature.geometry) {
                    clustered = false;
                    for (var j = clusters.length - 1; j >= 0; --j) {
                        cluster = clusters[j];
                        if (this.shouldCluster(cluster, feature)) {
                            this.addToCluster(cluster, feature);
                            clustered = true;
                            break;
                        }
                    }
                    if (!clustered) {
                        clusters.push(this.createCluster(this.features[i]));
                    }
                }
            }
            this.layer.removeAllFeatures();
            if (clusters.length > 0) {
                if (this.threshold > 1) {
                    var clone = clusters.slice();
                    clusters = [];
                    var candidate;
                    for (var i = 0, len = clone.length; i < len; ++i) {
                        candidate = clone[i];
                        if (candidate.attributes.count < this.threshold) {
                            Array.prototype.push.apply(clusters, candidate.cluster);
                        } else {
                            clusters.push(candidate);
                        }
                    }
                }
                // INIZIO MODIFICHE - se cluster contiene una sola feature copio gli attributi della feature nel cluster
                for (var i = 0, len = clusters.length; i < len; ++i) {
                    cluster = clusters[i];
                    if (cluster.attributes.count === 1) {
                        feature = cluster.cluster[0].clone();
                        cluster.attributes = feature.attributes;
                        cluster.attributes.count = 1;
                    }
                }
                // FINE MODIFICHE
                this.clustering = true;
                // A legitimate feature addition could occur during this
                // addFeatures call.  For clustering to behave well, features
                // should be removed from a layer before requesting a new batch.
                this.layer.addFeatures(clusters);
                this.clustering = false;
            }
            this.clusters = clusters;
        }
    }
};

*/

/*
 *  Function: OpenLayers.Bounds.transform
 *
 *
 *  Override: Inserito hack per conversione gauss-boaga (shift coordinate)
 *
 * Parameters:
 * layers - {Array} Array dei layer OL da aggiungere
 *
 */

OpenLayers.Bounds.transform = function(source, dest) {

    // clear cached center location
    this.centerLonLat = null;
    var ll = OpenLayers.Projection.transform(
        {'x': this.left, 'y': this.bottom}, source, dest);
    var lr = OpenLayers.Projection.transform(
        {'x': this.right, 'y': this.bottom}, source, dest);
    var ul = OpenLayers.Projection.transform(
        {'x': this.left, 'y': this.top}, source, dest);
    var ur = OpenLayers.Projection.transform(
        {'x': this.right, 'y': this.top}, source, dest);
    this.left   = Math.min(ll.x, ul.x);
    this.bottom = Math.min(ll.y, lr.y);
    this.right  = Math.max(lr.x, ur.x);
    this.top    = Math.max(ul.y, ur.y);

    // INIZIO MODIFICHE - HACK per Conversione GaussBoaga
    if (source.projCode === "EPSG:3003") {
        this.top = this.top + parseInt(120);
        this.bottom = this.bottom + parseInt(120);
        this.left = parseInt(this.left) - parseInt(40);
        this.right = parseInt(this.right) - parseInt(40);
    }
    // FINE MODIFICHE

    return this;

};

/*
 *  Function: OpenLayers.Format.Filter.v1_1_0.prototype.readers.ogc.Literal
 *
 *
 *  Override: non effettuo conversione in numerico perchè vengono eliminati eventuali "0" da campi alfanumerici
 *  Es: "08" --> 8
 *
 *
 */


OpenLayers.Format.Filter.v1_1_0.prototype.readers.ogc.Literal = function(node, obj) {
    //obj.value = OpenLayers.String.numericIf(
    //    this.getChildValue(node), true);

    obj.value = this.getChildValue(node);
}


/**
 *
 * Class: CWN2.QPG
 *
 * Raccoglie le funzioni per la gestione dei tematismi statistici
 *
 */
Ext.define("CWN2.QPG", {

    singleton: true,


    calculateStats: function (tematismo,bounds) {

        tematismo.stat = {};
        // calcolo la serie statistica
        tematismo.stat.serie = this.getSerie(tematismo,bounds);
        // imposto array dei colori
        if (tematismo.idTipoClassificazione === 0) {
            tematismo.scalaColore = "Random";
        }
        tematismo.stat.colors = CWN2.Globals.COLOR_SCALES[tematismo.scalaColore][tematismo.numClassi];
        // creo stile OpenLayer
        tematismo.stat.style = this.getStyle(tematismo);
        // creo SLD
        tematismo.stat.sldBody = new OpenLayers.Format.SLD().write({
            namedLayers: [{
                name: "QPG_" + tematismo.livello.idLivello,
                userStyles: [tematismo.stat.style]
            }]
        });
    },

    /**
     *
     * Function: createQPGLayer
     *
     * Crea un layer QPG.
     *
     * Parameters:
     * tematismo - Oggetto contenente la configurazione del tematismo
     *
     * Returns:
     * {LayerConfig} - La configurazione del layer
     *
     */
    createQPGLayer: function (tematismo) {
        CWN2.Util.log("CWN2.QPG.createQPGLayer ");

        // calcolo statistiche
        this.calculateStats(tematismo);

        // chiamo servizio di scrittura SLD
        CWN2.Util.ajaxRequest({
            type: "JSON",
            url: CWN2.Globals.RL_CREATE_SLD_SERVICE,
            callBack: function (response) {
                // carico il layer sulla mappa
                CWN2.QPG.loadQPGLayer(tematismo, response.data.sldUrl);
                // imposto layer per controllo infoWms
                if (tematismo.tipoTematismo === "WMS") {
                    CWN2.app.map.getControl("infoWmsControl").layers.push(tematismo.olLayer);
                } else {
                    var map = CWN2.app.map;
                    map.featureManager.registerCallback(
                        "onFeatureSelect",
                        function (feature) {
                            CWN2.QPG.clearPopups(map);
                            CWN2.QPG.addPopup(tematismo,feature);
                        }
                    );
                }

            },
            jsonData: {"sldBody": tematismo.stat.sldBody, "sldCleanBody": ""},
            disableException: true
        });
    },

    addPopup: function (tematismo,feature) {
        var campoTooltip = tematismo.livello.nomeCampoTooltip.replace("_"," ");
        var tooltip = feature.attributes[tematismo.livello.nomeCampoTooltip].replace(/\s+$/,"");
        var campoValore = "VALORE";
        var valore = feature.attributes[campoValore];

        var html = "<b><br>&nbsp;" + campoTooltip + ": " + tooltip + "<br>&nbsp;" + campoValore + ": " + valore;

        var width = (campoTooltip.length + tooltip.length) * 9 + 20;
        var size = new OpenLayers.Size(width, 60);

        var popup = new OpenLayers.Popup.Anchored(
            "info",
            feature.geometry.getBounds().getCenterLonLat(),
            size,
            html,
            null,
            false
        );
        popup.feature = feature;
        popup.backgroundColor = "#BBCCFF";
        popup.panMapIfOutOfView = false;
        popup.keepInMap = true;
        popup.opacity = 0.9;

        feature.popup = popup;
        CWN2.app.map.addPopup(popup);
    },

    clearPopups: function (map) {
        if (map.popups && map.popups.length > 0) {
            for (var i = 0; i < map.popups.length; i++) {
                var popup = map.popups[i];
                popup.feature.popup = null;
                popup.destroy();
            }
        }
    },

    getRules: function (tematismo, serverUrl, sldUrl) {
        var rules = [];
        Ext.each(tematismo.stat.style.rules, function (rule, index) {
            rules.push({
                filter: new OpenLayers.Format.CQL().write(rule.filter),
                legendIcon: serverUrl + "wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=QPG_TEMI:QPG_1&SLD=" + sldUrl + "&RULE=" + rule.name,
                legendLabel: rule.title,
                styleMaps: [
                    {
                        "renderIntent": "default",
                        "style": rule.symbolizer
                    },
                    {
                        "renderIntent": "hover",
                        "style": rule.hoverSymbolizer
                    },
                    {
                        "renderIntent": "select",
                        "style": rule.hoverSymbolizer
                    }
                ],
                from: Math.round(rule.from*100)/100,
                to: Math.round(rule.to*100)/100,
                count: rule.count
            });
        });
        tematismo.legendClasses = rules;
        return rules;
    }, /**
     *
     * Function: loadQPGLayer
     *
     * Carica un layer QPG sulla mappa.
     *
     * Parameters:
     * tematismo - Oggetto contenente la configurazione del tematismo
     *
     * Returns:
     * {LayerConfig} - La configurazione del layer
     *
     */
    loadQPGLayer: function (tematismo, sldUrl) {

        var layerName = "QPG_" + tematismo.livello.idLivello;
        var layerId = layerName + "_" + tematismo.idTema;
        var layerType = (tematismo.tipoTematismo === "WFS") ? "GeoJSON" : "WMS";

        var infoUrl = (tematismo.tipoTematismo === "WFS") ? null : "http://geoportale.regione.liguria.it/geoviewer/pages/apps/qpg/info.xsl";
        var serverUrl = CWN2.Globals.RL_QPG_OWS_SERVICE_URL;
        var wmsUrl = serverUrl + "wms?" + "VIEWPARAMS=ID_RICHIESTA:" + tematismo.idRichiesta + ";ID_TEMA:" + tematismo.idTema + "&SLD=" + sldUrl;
        var layerUrl = serverUrl + "wfs?service=WFS&version=1.3.0&request=GetFeature&srs=EPSG:3857&outputFormat=application/json&typeName=" + layerName + "&VIEWPARAMS=ID_RICHIESTA:" + tematismo.idRichiesta + ";ID_TEMA:" + tematismo.idTema;

        var rules = this.getRules(tematismo, serverUrl, sldUrl);


        // configurazione layer
        var layerConfig = {
            "id": layerId,
            "idMap": "QPG",
            "type": layerType,
            "name": layerId,
            "visible": true,
            "projection": tematismo.livello.projection,
            "attribution": null,
            "geomType": "VECTOR",
            "geomSubType": tematismo.livello.tipoGeom,
            "queryable": false,
            "order": 100 + tematismo.idTema,
            "inRange" : true,
            "multiClasse": true,
            //"infoUrl": serverUrl + "wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&BBOX=772898.756677%2C5291471.038754%2C1180155.243323%2C5709122.961246&FEATURE_COUNT=10&HEIGHT=683&WIDTH=666&FORMAT=image%2Fpng&INFO_FORMAT=application%2Fvnd.ogc.gml&SRS=EPSG%3A3857&X=369&Y=293&VIEWPARAMS=ID_RICHIESTA:QPG_A54E991A4002A38506694F49DFB39B0E_20150330_093006;ID_TEMA:3",
            "wmsParams": {
                "url": wmsUrl,
                "transparent": true,
                "format": "image/png",
                "format_options": "antialias:none"
            },
            "url": layerUrl,
            "legend": {
                "label": tematismo.descrizione,
                "icon": "http://geoportale.regione.liguria.it/geoviewer/img/legend/classi.gif",
                "popUpFlag": 1,
                "popUpUrl": null,
                "popUpWidth": 230,
                "popUpHeight": 270,
                "popUpAlignTo": {
                    "position": "br-br",
                    "offsets": [230,0]
                }
            },
            "infoOptions": {
                "infoUrl": infoUrl,
                "infoTarget": "panel",
                "infoWidth": 400,
                "infoHeight": 350,
                "infoPopUp": "",
                "infoIdAttr": tematismo.livello.nomeCampoPk,
                "infoLabelAttr": tematismo.livello.nomeCampoTooltip
            },
            "classes": rules,
            "flagGeoserver": false //ATTENZIONE: se impostato a true non funziona anche se utilizza GeoServer (problema tiled?)
        }

        tematismo.layerConfig = layerConfig;

        //CWN2.app.map.layerManager.remove([layerConfig.name]);
        tematismo.olLayer = CWN2.app.map.layerManager.addLayers([layerConfig])[0];


    },


    /**
     *
     * Function: loadQPGLayers
     *
     * Carica i layer QPG sulla mappa.
     *
     * Parameters:
     * tematismo - Oggetto contenente la configurazione del tematismo
     *
     *
     */
    loadQPGLayers: function (tematismi) {
        //if (CWN2.app.map.getControl("infoWmsControl")) {
        //    CWN2.app.map.getControl("infoWmsControl").layers = [];
        //}
        Ext.each(tematismi, function (tematismo) {
            CWN2.QPG.createQPGLayer(tematismo);
        });
    },


    /**
     *
     * Function: getStyle
     *
     * Ritorna lo stile OpenLayers per il tematismo
     *
     * Parameters:
     * tematismo - Oggetto contenente la configurazione del tematismo
     *
     * Returns:
     * {OpenLayers.Style} - Stile openlayer
     *
     */
    getStyle: function getStyle(tematismo) {
        CWN2.Util.log("CWN2.QPG.getStyle ");

        var rules = [];

        if (tematismo.separatoreDecimale === ",") {
            numeral.language('it');
        } else {
            numeral.language('en');
        }

        Ext.each(tematismo.stat.serie.counter, function (count, index) {
            var rule, symbolizer, hoverSymbolizer;

            switch (tematismo.livello.tipoGeom) {
                case "POLYGON":
                    symbolizer = {
                        "Polygon": {
                            fillColor: tematismo.stat.colors[index],
                            strokeColor: "#000000",
                            fillOpacity: 1,
                            fillStroke: 1
                        }
                    };
                    hoverSymbolizer = {
                        "Polygon": {
                            fillColor: tematismo.stat.colors[index],
                            strokeColor: "#FF9900",
                            strokeWidth: 3,
                            fillOpacity: 1,
                            fillStroke: 1
                        }
                    };
                    break;
                case "LINE":
                    symbolizer = {"Line": {strokeColor: tematismo.stat.colors[index], strokeWidth: 3, fillStroke: 1}};
                    break;
                default:
                    symbolizer = {
                        "Point": {
                            graphicName: "circle",
                            pointRadius: 4,
                            fillColor: tematismo.stat.colors[index],
                            fillOpacity: 1,
                            fillStroke: 1
                        }
                    };
            }

            if (tematismo.idTipoClassificazione === 0) {
                var value = tematismo.stat.serie.bounds[index];
                if (typeof value === "number") {
                    value = numeral(value).format('0000.00')
                }
                rule = new OpenLayers.Rule({
                    name: "R" + index,
                    title: value,
                    filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "VALORE",
                        value: value
                    }),
                    symbolizer: symbolizer,
                    hoverSymbolizer: hoverSymbolizer
                });
                rule.value = tematismo.stat.serie.bounds[index];
            } else {
                var lowerLimit = tematismo.stat.serie.bounds[index],
                    upperLimit = tematismo.stat.serie.bounds[index + 1],
                    formattedLowerLimit = numeral(lowerLimit).format('0000.00'),
                    formattedUpperLimit = numeral(upperLimit).format('0000.00');
                rule = new OpenLayers.Rule({
                    name: "R" + index,
                    title: "da " + formattedLowerLimit + " a " + formattedUpperLimit + " (" + count + ")",
                    filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.BETWEEN,
                        property: "VALORE_NUM",
                        lowerBoundary: lowerLimit,
                        upperBoundary: upperLimit
                    }),
                    symbolizer: symbolizer,
                    hoverSymbolizer: hoverSymbolizer
                })
                rule.from = lowerLimit;
                rule.to = upperLimit;
                rule.count = count;
            }
            rules.push(rule);
        });


        var style = new OpenLayers.Style();
        style.addRules(rules);

        return style;


    },

    /**
     *
     * Function: getSerie
     *
     * Calcola i parametri geostats
     *
     * Parameters:
     * tematismo - Configurazione del tematismo
     *
     * Returns:
     * Serie geostat
     *
     */
    getSerie: function getSerie(tematismo,bounds) {
        CWN2.Util.log("CWN2.QPG.getRanges ");

        var serie = new geostats(tematismo.valori);
        serie.setPrecision(2);
        var ranges;
        switch (tematismo.idTipoClassificazione) {
            case 0:
                ranges = serie.getClassUniqueValues(tematismo.numClassi);
                break;
            case 1:
                ranges = serie.getClassEqInterval(tematismo.numClassi);
                break;
            case 2:
                ranges = serie.getClassQuantile(tematismo.numClassi);
                break;
            case 3:
                ranges = serie.setClassManually(bounds);
                break;
            default:
        }
        serie.doCount();
        return serie;
    }
});

/**
 *
 * Class: CWN2.SimpleLegendGridPanel
 *
 * Pannello contenente le grid per i layer di base e overlay utilizzati dalla legenda di tipo ?simple?.
 *
 * Estende Ext.grid.GridPanel
 *
 */

Ext.define('CWN2.SimpleLegendGridPanel', {

    extend: 'Ext.grid.Panel',
    alias: "widget.cwn2-simplelegend-grid",

    /**
     *
     * Constructor: CWN2.SimpleLegendGridPanel
     * Costruisce il pannello con la grid.
     *
     * Parameters:
     * legendConfig - {Object} Oggetto configurazione della legenda.
     * type - {String} Tipo di griglia (base / overlay)
     *
     * Return:
     * {CWN2.SimpleLegendGridPanel}
     *
     */
    constructor: function(type) {
        CWN2.Util.log("CWN2.SimpleLegendGridPanel");

        var store = CWN2.app.map.layerManager.getLayerStore(type),
            inRangeStyle = "white-space:normal; text-align:left",
            outRangeStyle = "white-space:normal; opacity:0.3; filter: alpha(opacity = 30); zoom: 1";

        function getRenderLabel(value, metaData, record) {
            return (record.data.inRange) ?
                "<div style='" + inRangeStyle + "'>" + record.data.legendLabel + " </div>" :
                "<div style='" + outRangeStyle + "'>" + record.data.legendLabel + " </div>";
        }

        function getRenderIcon(value, metaData, record) {
            return (record.data.inRange) ?
                "<img id='legend_img_" + record.internalId + "' src='" + record.data.legendIcon + "' width='20px' height='20px' >" :
                "<img id='legend_img_" + record.internalId + "' src='" + record.data.legendIcon + "' style='" + outRangeStyle + "' >";
        }

        function getRadioButton(value, metaData, record) {
            var checked = (record.data.visible) ? "CHECKED" : "",
                onClick = "CWN2.app.map.setBaseLayerOnMap('" + value + "');";
            return (record.data.inRange) ?
                "<input type='radio' onClick=" + onClick + " " + checked + ">"
                : null;
        }

        function getCheckBox(value, metaData, record) {
            var checked = (record.data.visible) ? "CHECKED" : "",
                onClick = "CWN2.app.map.layerManager.setLayerVisible('" + value + "',this.checked);";
            return (record.data.inRange) ?
                "<input type='checkbox' onClick=" + onClick + " " + checked + ">"
                : null
        }

        CWN2.SimpleLegendGridPanel.superclass.constructor.call(this, {
            store: store,
            viewConfig: {
                forceFit: true,
                getRowClass: function(row, index) {
                    return (row.data.inRange) ? "inrange-row" : "outrange-row";
                }
            },
            width: 230,
            title: (type == "base") ? "Sfondi" : "Livelli",
            hideHeaders: true,
            disableSelection: true,
            columns: [
                {
                    xtype: 'actioncolumn',
                    dataIndex: "legendIcon",
                    renderer: getRenderIcon,
                    width: 30
                },
                {
                    dataIndex: "name",
                    renderer: type === "base" ? getRadioButton : getCheckBox,
                    width: 25
                },
                {
                    dataIndex: "legendLabel",
                    renderer: getRenderLabel,
                    width: 170
                }
            ],
            autoScroll: true,
            frame: false
        });
    }



});

Ext.define('CWN2.controller.SimpleLegendGridPanel', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.SimpleLegendGridPanel'
    ],

    refs: [

    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.simplelegend: init');

        this.control({
            'cwn2-simplelegend-grid': {
                itemmouseenter: this.onItemMouseEnter
            },
            'cwn2-simplelegend-grid actioncolumn': {
                click: this.onLegendIconClick
            }
        });
    },

    onLegendIconClick: function(view, cell, row) {
        var data = view.store.data.items[row].data;
        if (data.inRange && (data.multiClasse || data.legendPopUpFlag)) {
            this.showLegendWindow(data.config);
        }
    },

    showLegendWindow: function(layerConfig) {
        if (layerConfig.legend.popUpUrl && layerConfig.legend.popUpFlag) {
            // se impostato attributo legendPopupUrl apro una finestra con il documento
            var mediaWin = new CWN2.IframeWindow({
                url: layerConfig.legend.popUpUrl,
                width: layerConfig.legend.popUpWidth || 600,
                height: layerConfig.legend.popUpHeight || 400,
                resizable: false
            });
        } else if (layerConfig.multiClasse) {
            // se livello multiclasse apro una finestra con la legenda dei livelli multiclasse
            if (layerConfig.flagGeoserver) {
                var url = (Array.isArray(layerConfig.wmsParams.url))? layerConfig.wmsParams.url[0] : layerConfig.wmsParams.url;
                var multiClassUrl = url + "LAYER=" + layerConfig.name + "&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&";
                var mediaWin = new CWN2.IframeWindow({
                    url: multiClassUrl,
                    width: 500,
                    height: 400,
                    //id: "multi-class-win",
                    resizable: false
                });
            } else {
                var win = new CWN2.MultiClassLegendWindow(layerConfig).show();
                if (layerConfig.legend.popUpAlignTo) {
                    win.alignTo(CWN2.app.layout.mapPanel.body, layerConfig.legend.popUpAlignTo.position, layerConfig.legend.popUpAlignTo.offsets);
                }
            }
        }
    },

    onItemMouseEnter: function(view, record, item) {
        var maxScale = record.data.maxScale || 1,
            minScale = record.data.minScale,
            alt = (!record.data.inRange && (minScale || maxScale > 1)) ?
                "Livello visibile da 1:" + maxScale + " a 1:" + minScale :
                (record.data.multiClasse || record.data.legendPopUpFlag) ?
                    "Seleziona <img src = '" + record.data.legendIcon + "'> per visualizzare la legenda" : "";

        Ext.fly(item).set({ 'data-qtip': alt });
    }
});
/**
 *
 * Class: CWN2.SimpleLegendPanel
 *
 * Pannello contenente la legenda di tipo ?simple?.
 *
 * Estende Ext.Panel
 *
 */

Ext.define('CWN2.SimpleLegendPanel', {

    extend: 'Ext.panel.Panel',

    /**
     *
     * Constructor: CWN2.SimpleLegendPanel
     * Costruisce il pannello legenda.
     *
     * Parameters:
     * flagBtn - {Boolean} Indica se è richiamato dal bottone simpleLegend
     *
     * Return:
     * {CWN2.SimpleLegendPanel}
     *
     */

    constructor: function(config) {
        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false */
        "use strict";
        CWN2.Util.log("CWN2.SimpleLegendPanel");


        var flagBtn = (config)? config.flagBtn : false,
            noBaseLayerGrid = (config)? config.noBaseLayerGrid : false;


        var legendConfig = CWN2.app.configuration.application.layout.legend,
            panelId = (flagBtn) ? "cwn2-legend-panel-btn" : "cwn2-legend-panel";

        var pos,
            collapsed,
            collapsible,
            overlayGrid,
            baseGrid;

        if (legendConfig) {
            pos = legendConfig.position || "east";
            collapsed = (flagBtn) ? false : legendConfig.collapsed || false;
            collapsible = (!flagBtn);
            noBaseLayerGrid = legendConfig.noBaseLayerGrid;
        }


        overlayGrid = new CWN2.SimpleLegendGridPanel("overlay");
        if (!noBaseLayerGrid) {
            baseGrid = new CWN2.SimpleLegendGridPanel("base");
        }


        // Gestisco l'update della legenda sull'evento "zoomend" della mappa
        CWN2.app.map.events.register("zoomend",
            CWN2.app.map,
            function(e) {
                overlayGrid.getView().refresh();
                if (!noBaseLayerGrid) {
                    baseGrid.getView().refresh();
                }
            }
        );

        var items = [overlayGrid];
        if (!noBaseLayerGrid) {
            items.push(baseGrid);
        }

        // Se presente configurazione QPG carico il pannello QPG
        if (CWN2.app.configuration.qpgRequest) {
            var tematismi = CWN2.app.configuration.qpgRequest.tematismi;
            if (tematismi.length === 1) {
                var layerConfig = tematismi[0].layerConfig;
                items.push({
                    xtype: "panel",
                    bodyStyle: "padding:5px",
                    autoScroll: true,
                    items: [
                        {
                            xtype: "dataview",
                            store: new Ext.data.Store({
                                data: layerConfig.classes,
                                fields: [
                                    {name: "icon", mapping: "legendIcon"},
                                    {name: "label", mapping: "legendLabel"}
                                ]
                            }),
                            tpl: new Ext.XTemplate(
                                '<table width=100% border=0>',
                                '<tpl for=".">',
                                '<tr>',
                                '<td width=30><img src="{icon}"></td>',
                                '<td>{label}</td>',
                                '</tpl>'
                            ),
                            autoHeight: true,
                            multiSelect: false,
                            itemSelector: "div.thumb-wrap",
                            emptyText: ""
                        }
                    ]
                });
            }
        }

        var config = {
            id: panelId,
            width: 230,
            autoScroll: true,
            height: 100,
            region: pos,
            border: false,
            collapsible: collapsible,
            collapsed: collapsed,
            items: items
        };

        CWN2.SimpleLegendPanel.superclass.constructor.call(this, config);

    }
});

	


/**
 *
 * Class: CWN2.Statusbar
 *
 *
 * Costruisce la statusbar.
 *
 * Estende Ext.Statusbar
 *
 */

Ext.define('CWN2.Statusbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.cwn2-statusbar',

    /**
     *
     * Constructor: CWN2.Statusbar
     *
     * Costruisce la Statusbar
     *
     * Parameters:
     * toolbarConfig - {Object} Oggetto configurazione della toolbar.
     *
     *
     */
    constructor: function(widgets, mapPanel) {
        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false */
        "use strict";
        CWN2.Util.log("CWN2.Toolbar");

        CWN2.Statusbar.superclass.constructor.call(this, {
            id: "cwn2-statusbar",
            cls: "x-statusbar",
            dock: 'bottom'
        });

        // carico i widgets
        var me = this;
        Ext.each(widgets, function(widget) {
            var item = new CWN2.Widget[widget.name](widget, me);
            if (item) {
                me.add(item);
            }
        });
    },

    /**
     * Function: addStatusbarItem
     *
     * Aggiunge un elemento alla Statusbar
     *
     * Parameters:
     * item - {Object} Oggetto configurazione dell'elemento
     *
     */
    addStatusbarItem: function(item) {
        if (item && !Ext.getCmp(item.id)) {
            this.add(item);
        }
    },

    /**
     * Function: setStatusbarItemText
     *
     * Imposta un testo su un item della Statubar
     *
     * Parameters:
     * itemName - {string} Nome dell'elemento
     * text - {string} Testo da scrivere
     *
     */
    setStatusbarItemText: function(itemName, text) {
        if (Ext.getCmp(itemName)) {
            Ext.getCmp(itemName).setText(text);
        }
    }

});
/**
 *
 * Class: CWN2.Toolbar
 *
 *
 * Costruisce la toolbar.
 *
 * Estende Ext.Toolbar
 *
 */

Ext.define('CWN2.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.cwn2-toolbar',

    /**
     *
     * Constructor: CWN2.Toolbar
     *
     * Costruisce la toolbar
     *
     * Parameters:
     * toolbarConfig - {Object} Oggetto configurazione della toolbar.
     *
     *
     */

    constructor: function(toolbarConfig, mapPanel) {
        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false */
        "use strict";
        CWN2.Util.log("CWN2.Toolbar");

        this.config = toolbarConfig;
        var me = this;

        var buttons = [];           // Bottoni attivi (in configurazione)
        var groups = toolbarConfig.itemGroups;
        var scale = toolbarConfig.scale || "small";

        // ciclo su tutti gli elementi della configurazione della toolbar
        Ext.each(groups, function(group, i) {
            if (group) {
                var alignRight = false;
                if (groups[i + 1] && groups[i + 1].align && groups[i + 1].align == "right") {
                    alignRight = true;
                }
                var isLastGroup = (i >= (groups.length - 1));
                addGroup(group.items, isLastGroup, alignRight);
            }
        });

        function addGroup(items, lastGroup, alignRight) {
            if (items) {
                Ext.each(items, function(item, i) {
                    if (typeof(item) !== "function") {
                        buttons.push(me.checkButton(item,scale));
                    }
                });

                // se non è l'ultimo aggiungo un separatore
                if (!lastGroup) {
                    // se il successivo ha align=right lo metto in fondo
                    if (alignRight) {
                        buttons.push("->");
                    } else {
                        buttons.push("-");
                    }
                }
            }
        }

        CWN2.Toolbar.superclass.constructor.call(this, {
            id: "cwn2-toolbar",
            items: buttons
        });

        mapPanel.toolbar = this;
    },

    /**
     *
     * Function: getButtonOptions
     *
     * Ritorna un oggetto contenente le opzioni di configurazione di un bottone
     *
     * Parameters:
     * buttonID - {String} Id del bottone
     *
     */
    getButtonOptions: function(buttonId) {
        var groups = this.config.itemGroups,
            btnOpt = null;

        groups.map(function(group) {
            group.items.map(function(button) {
                if (button.name === buttonId && button.options) {
                    btnOpt = button.options;
                }
            });
        });

        return btnOpt;
    },

    /**
     *
     * Function: checkButton
     *
     * Effettua i controlli sul bottone e ritorna un oggetto con xtype impostato
     *
     * Parameters:
     * buttonID - {String} Id del bottone
     *
     */
    checkButton: function(item,scale) {
        CWN2.Util.log("CWN2.Toolbar: Bottone " + item.name);
        if (item !== '-' && item !== '->') {
            var type = item.type || "button";
            item.xtype = "cwn2-" + type + "-" + item.name.toLowerCase();
            item.scale = scale;
            if (!checkButtonId(item.xtype)) {
                CWN2.Util.handleException({
                    message: "CWN2.Toolbar - Bottone con name: " + item.name.toLowerCase() + " non definito in libreria. Bottone custom?",
                    level: 0
                });
            }
            return item;
        } else {
            return item
        }

        function checkButtonId(xtype) {
            var found = false;
            Ext.iterate(CWN2.button, function(buttonName,button) {
                if (button.xtype === xtype) {
                    found = true;
                    return false;
                }
            });
            return found;
        }
    },

    /**
     *
     * Function: addButton
     *
     * Aggiunge un bottone alla bottoniera
     *
     * Parameters:
     * item - {String} Id del bottone (name)
     *
     */
    addButton: function(item) {
        this.add(this.checkButton(item));
    }    
});
/**
 *
 * Class: CWN2.TreeLegendGridPanel
 *
 * Pannello contenente le grid per i layer di base e overlay utilizzati dalla legenda di tipo ?simple?.
 *
 * Estende Ext.grid.GridPanel
 *
 */

Ext.define('CWN2.TreeLegendGridPanel', {

    extend: 'Ext.grid.Panel',
    alias: "widget.cwn2-simplelegend-grid",

    /**
     *
     * Constructor: CWN2.TreeLegendGridPanel
     * Costruisce il pannello con la grid.
     *
     * Parameters:
     * legendConfig - {Object} Oggetto configurazione della legenda.
     * type - {String} Tipo di griglia (base / overlay)
     *
     * Return:
     * {CWN2.TreeLegendGridPanel}
     *
     */
    constructor: function(type) {
        CWN2.Util.log("CWN2.TreeLegendGridPanel");

        var store = CWN2.app.map.layerManager.getLayerStore(type),
            inRangeStyle = "white-space:normal; text-align:left",
            outRangeStyle = "white-space:normal; opacity:0.3; filter: alpha(opacity = 30); zoom: 1";

        function getRenderLabel(value, metaData, record) {
            return (record.data.inRange) ?
                "<div style='" + inRangeStyle + "'>" + record.data.legendLabel + " </div>" :
                "<div style='" + outRangeStyle + "'>" + record.data.legendLabel + " </div>";
        }

        function getRenderIcon(value, metaData, record) {
            return (record.data.inRange) ?
                "<img id='legend_img_" + record.internalId + "' src='" + record.data.legendIcon + "' >" :
                "<img id='legend_img_" + record.internalId + "' src='" + record.data.legendIcon + "' style='" + outRangeStyle + "' >";
        }

        function getRadioButton(value, metaData, record) {
            var checked = (record.data.visible) ? "CHECKED" : "",
                onClick = "CWN2.app.map.setBaseLayerOnMap('" + value + "');";
            return (record.data.inRange) ?
                "<input type='radio' onClick=" + onClick + " " + checked + ">"
                : null;
        }

        function getCheckBox(value, metaData, record) {
            var checked = (record.data.visible) ? "CHECKED" : "",
                onClick = "CWN2.app.map.layerManager.setLayerVisible('" + value + "',this.checked);";
            return (record.data.inRange) ?
                "<input type='checkbox' onClick=" + onClick + " " + checked + ">"
                : null
        }

        CWN2.TreeLegendGridPanel.superclass.constructor.call(this, {
            store: store,
            viewConfig: {
                forceFit: true,
                getRowClass: function(row, index) {
                    return (row.data.inRange) ? "inrange-row" : "outrange-row";
                }
            },
            width: 230,
            title: (type == "base") ? "Sfondi" : "Livelli",
            hideHeaders: true,
            disableSelection: true,
            columns: [
                {
                    xtype: 'actioncolumn',
                    dataIndex: "legendIcon",
                    renderer: getRenderIcon,
                    width: 30
                },
                {
                    dataIndex: "name",
                    renderer: type === "base" ? getRadioButton : getCheckBox,
                    width: 25
                },
                {
                    dataIndex: "legendLabel",
                    renderer: getRenderLabel,
                    width: 170
                }
            ],
            autoScroll: true,
            frame: false
        });
    }



});

Ext.define('CWN2.controller.TreeLegendGridPanel', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.TreeLegendGridPanel'
    ],

    refs: [

    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.treelegend: init');

        this.control({
            'cwn2-simplelegend-grid': {
                itemmouseenter: this.onItemMouseEnter
            },
            'cwn2-simplelegend-grid actioncolumn': {
                click: this.onLegendIconClick
            }
        });
    },

    onLegendIconClick: function(view, cell, row) {
        var data = view.store.data.items[row].data;
        if (data.inRange && (data.multiClasse || data.legendPopUpFlag)) {
            this.showLegendWindow(data.config);
        }
    },

    showLegendWindow: function(layerConfig) {
        if (layerConfig.legend.popUpUrl && layerConfig.legend.popUpFlag) {
            // se impostato attributo legendPopupUrl apro una finestra con il documento
            var mediaWin = new CWN2.IframeWindow({
                url: layerConfig.legend.popUpUrl,
                width: layerConfig.legend.popUpWidth || 600,
                height: layerConfig.legend.popUpHeight || 400,
                resizable: false
            }).show();
        } else if (layerConfig.multiClasse) {
            // se livello multiclasse apro una finestra con la legenda dei livelli multiclasse
            if (layerConfig.flagGeoserver) {
                var url = (Array.isArray(layerConfig.wmsParams.url))? layerConfig.wmsParams.url[0] : layerConfig.wmsParams.url;
                var multiClassUrl = url + "LAYER=" + layerConfig.name + "&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&";
                var mediaWin = new CWN2.IframeWindow({
                    url: multiClassUrl,
                    width: 500,
                    height: 400,
                    id: "multi-class-win",
                    resizable: false
                }).show();
            } else {
                var win = new CWN2.MultiClassLegendWindow(layerConfig).show();
                if (layerConfig.legend.popUpAlignTo) {
                    win.alignTo(CWN2.app.layout.mapPanel.body, layerConfig.legend.popUpAlignTo.position, layerConfig.legend.popUpAlignTo.offsets);
                }
            }
        }
    },

    onItemMouseEnter: function(view, record, item) {
        var maxScale = record.data.maxScale || 1,
            minScale = record.data.minScale,
            alt = (!record.data.inRange && (minScale || maxScale > 1)) ?
                "Livello visibile da 1:" + maxScale + " a 1:" + minScale :
                (record.data.multiClasse || record.data.legendPopUpFlag) ?
                    "Seleziona <img src = '" + record.data.legendIcon + "'> per visualizzare la legenda" : "";

        Ext.fly(item).set({ 'data-qtip': alt });
    }
});
/**
 *
 * Class: CWN2.SimpleLegendPanel
 *
 * Pannello contenente la legenda di tipo ?simple?.
 *
 * Estende Ext.Panel
 *
 */

Ext.define('CWN2.TreeLegendPanel', {

    extend: 'Ext.panel.Panel',

    /**
     *
     * Constructor: CWN2.TreeLegendPanel
     * Costruisce il pannello legenda.
     *
     * Parameters:
     * flagBtn - {Boolean} Indica se è richiamato dal bottone simpleLegend
     *
     * Return:
     * {CWN2.TreeLegendPanel}
     *
     */

    constructor: function(config) {
        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false */
        "use strict";
        CWN2.Util.log("CWN2.TreeLegendPanel");


        var flagBtn = (config)? config.flagBtn : false,
            noBaseLayerGrid = (config)? config.noBaseLayerGrid : false;


        var legendConfig = CWN2.app.configuration.application.layout.legend,
            panelId = (flagBtn) ? "cwn2-legend-panel-btn" : "cwn2-legend-panel";

        var pos,
            collapsed,
            collapsible,
            overlayGrid,
            baseGrid;

        if (legendConfig) {
            pos = legendConfig.position || "east";
            collapsed = (flagBtn) ? false : legendConfig.collapsed || false;
            collapsible = (!flagBtn);
            noBaseLayerGrid = legendConfig.noBaseLayerGrid;
        }


        overlayGrid = new CWN2.TreeLegendGridPanel("overlay");
        if (!noBaseLayerGrid) {
            baseGrid = new CWN2.TreeLegendGridPanel("base");
        }


        // Gestisco l'update della legenda sull'evento "zoomend" della mappa
        CWN2.app.map.events.register("zoomend",
            CWN2.app.map,
            function(e) {
                overlayGrid.getView().refresh();
                if (!noBaseLayerGrid) {
                    baseGrid.getView().refresh();
                }
            }
        );

        var items = [overlayGrid];
        if (!noBaseLayerGrid) {
            items.push(baseGrid);
        }

        // Se presente configurazione QPG carico il pannello QPG
        if (CWN2.app.configuration.qpgRequest) {
            var tematismi = CWN2.app.configuration.qpgRequest.tematismi;
            if (tematismi.length === 1) {
                var layerConfig = tematismi[0].layerConfig;
                items.push({
                    xtype: "panel",
                    bodyStyle: "padding:5px",
                    autoScroll: true,
                    items: [
                        {
                            xtype: "dataview",
                            store: new Ext.data.Store({
                                data: layerConfig.classes,
                                fields: [
                                    {name: "icon", mapping: "legendIcon"},
                                    {name: "label", mapping: "legendLabel"}
                                ]
                            }),
                            tpl: new Ext.XTemplate(
                                '<table width=100% border=0>',
                                '<tpl for=".">',
                                '<tr>',
                                '<td width=30><img src="{icon}"></td>',
                                '<td>{label}</td>',
                                '</tpl>'
                            ),
                            autoHeight: true,
                            multiSelect: false,
                            itemSelector: "div.thumb-wrap",
                            emptyText: ""
                        }
                    ]
                });
            }
        }

        var config = {
            id: panelId,
            width: 230,
            autoScroll: true,
            height: 100,
            region: pos,
            border: false,
            collapsible: collapsible,
            collapsed: collapsed,
            items: items
        };

        CWN2.TreeLegendPanel.superclass.constructor.call(this, config);

    }
});

	


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





/**
 *
 * Class: CWN2.ZoomifyPanel
 *
 * Costruisce il pannello per la visualizzazione immagini con Zoomify
 * Estende GeoExt.MapPanel
 *
 *
 */

Ext.define('CWN2.ZoomifyPanel', {

    /**
     *
     * Constructor: CWN2.MapPanel
     *
     * Costruisce il pannello per la mappa
     *
     * Parameters:
     * config - {Object} Oggetto configurazione.
     *  - imgUrl - {String} Url della immagine Zoomify
     *  - win - (Ext.Window) finestra Ext a cui aggiungere il pannello
     *  - logo - (String) Url della immagine da utilizzare come logo sulle foto
     *
     */

    constructor: function(config) {
        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false */
        "use strict";

        var imgUrl = config.imgUrl,
            win = config.win,
            logo = config.logo,
            alignTo = config.alignTo;

        CWN2.Util.log("CWN2.ZoomifyPanel");

        CWN2.Util.ajaxRequest({
            type: "XML",
            url: CWN2.Globals.proxy + imgUrl + "ImageProperties.xml",
            callBack: function(response) {
                var imgWidth = Ext.DomQuery.selectValue('IMAGE_PROPERTIES/@WIDTH', response);
                var imgHeight = Ext.DomQuery.selectValue('IMAGE_PROPERTIES/@HEIGHT', response);
                loadImage(imgWidth, imgHeight, imgUrl);
            }
        });

        function loadImage(imgWidth, imgHeight, imgUrl) {
            win.removeAll();

            var zoomify = new OpenLayers.Layer.Zoomify(
                "Zoomify",
                imgUrl,
                new OpenLayers.Size(imgWidth, imgHeight)
            );
            zoomify.attribution = logo ? "<img src=" + logo + ">" : "";

            var map = new OpenLayers.Map("map", {
                maxExtent: new OpenLayers.Bounds(0, 0, imgWidth, imgHeight),
                maxResolution: Math.pow(2, zoomify.numberOfTiers - 1),
                numZoomLevels: zoomify.numberOfTiers,
                units: 'pixels',
                fractionalZoom: true
            });
            map.addLayer(zoomify);
            map.setBaseLayer(zoomify);

            win.add(new GeoExt.MapPanel({
                id: "zoomify-panel",
                xtype: "gx_mappanel",
                region: "center",
                border: false,
                map: map
            }));
            win.doLayout();
            win.show();

            if (alignTo) {
                win.alignTo(alignTo.element, alignTo.position, alignTo.offset);
            }

            map.zoomToMaxExtent();
        }

    }

});
/*
 *
 * Class: CWN2.Control.DeleteFeature
 *
 * Controllo OpenLayers Custom che permette di cancellare feature sulla mappa.
 *
 *
 */

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/

CWN2.Control.DeleteFeature = OpenLayers.Class(OpenLayers.Control.SelectFeature, {

    /**
     *
     * Constructor: CWN2.Control.DeleteFeature
     * Costruttore
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Points will be added to this layer.
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     *
     */
    initialize: function(layer, options) {

        var deleteControl = this;

        function showConfirmDialog(feature) {
            Ext.MessageBox.confirm(
                CWN2.I18n.get('Conferma'),
                CWN2.I18n.get('Sei sicuro di voler cancellare la feature?'),
                function(btn) {
                    if (btn === "yes") {
                        layer.destroyFeatures([feature]);
                    } else {
                        deleteControl.unselect(feature);
                    }
                }
            );
        }

        OpenLayers.Control.SelectFeature.prototype.initialize.apply(this,
            [layer, {onSelect: showConfirmDialog}]);

    },

    CLASS_NAME: "CWN2.Control.DrawPoint"

});
/*
 *
 * Class: CWN2.Control.DrawLine
 *
 * Controllo OpenLayers Custom che permette di disegnare linee sulla mappa.
 *
 *
 */

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/

CWN2.Control.DrawLine = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

    // flag singleGeometry se impostato a true permette l'inserimento di una sola geometria
    singleFeature: false,

    /**
     *
     * Constructor: CWN2.Control.DrawPoint
     * Costruttore
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Points will be added to this layer.
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     *
     */
    initialize: function(layer, options) {

        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this,
            [layer, OpenLayers.Handler.Path, options]);

        if (options && options.singleFeature) {
            this.singleFeature = true;
        }

    },

    /**
     *
     * Function: activate
     * Attiva il controllo, nel parametro params vengono impostati eventuali parametri da passare
     * alla funzione di callback
     *
     * Parameters:
     * params {Object} Oggetto contenente i parametri
     * da passare alla funzione di callback
     *
     */
    activate: function(params) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        this.params = params;

        return OpenLayers.Control.prototype.activate.apply(this, arguments);

    },

    /**
     * Method: draw point
     */
    drawFeature: function(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry),
            proceed = this.layer.events.triggerEvent('sketchcomplete', {feature: feature});
        if (proceed !== false) {
            // se impostato singleGeometry rimuovo le feature
            if (this.singleFeature) {
                this.layer.removeAllFeatures();
            }
            feature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([feature]);
            this.featureAdded(feature);
            this.events.triggerEvent('featureadded', {feature: feature});
        }
    },

    CLASS_NAME: "CWN2.Control.DrawLine"

});
/*
 *
 * Class: CWN2.Control.DrawPoint
 *
 * Controllo OpenLayers Custom che permette di disegnare punti sulla mappa.
 *
 *
 */

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/

CWN2.Control.DrawPoint = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

    // flag singleGeometry se impostato a true permette l'inserimento di una sola geometria
    singleFeature: false,

    // funzione di callback da richiamare dopo ogni inserimento
    callback: null,

    /**
     *
     * Constructor: CWN2.Control.DrawPoint
     * Costruttore
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Points will be added to this layer.
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     *
     */
    initialize: function(layer, options) {

        options.id = "cwn2-control-drawpoint";

        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this,
            [layer, OpenLayers.Handler.Point, options]);

        if (options && options.singleFeature) {
            this.singleFeature = true;
        }
        if (options && options.callback) {
            this.callback = options.callback;
        }

    },

    /**
     *
     * Function: activate
     * Attiva il controllo, nel parametro params vengono impostati eventuali parametri da passare
     * alla funzione di callback
     *
     * Parameters:
     * params {Object} Oggetto contenente i parametri
     * da passare alla funzione di callback
     *
     */
    activate: function(params) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        this.params = params;

        return OpenLayers.Control.prototype.activate.apply(this, arguments);

    },

    /**
     * Method: draw point
     */
    drawFeature: function(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry),
            proceed = this.layer.events.triggerEvent('sketchcomplete', {feature: feature});
        if (proceed !== false) {
            // se impostato singleGeometry rimuovo le feature
            if (this.singleFeature) {
                this.layer.removeAllFeatures();
            }
            feature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([feature]);
            this.featureAdded(feature);
            this.events.triggerEvent('featureadded', {feature: feature});
        }
    },

    CLASS_NAME: "CWN2.Control.DrawPoint"

});
/*
 *
 * Class: CWN2.Control.DrawPolygon
 *
 * Controllo OpenLayers Custom che permette di disegnare polugoni sulla mappa.
 *
 *
 */

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/

CWN2.Control.DrawPolygon = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

    // flag singleGeometry se impostato a true permette l'inserimento di una sola geometria
    singleFeature: false,

    /**
     *
     * Constructor: CWN2.Control.DrawPoint
     * Costruttore
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Points will be added to this layer.
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     *
     */
    initialize: function(layer, options) {

        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this,
            [layer, OpenLayers.Handler.Polygon, options]);

        if (options && options.singleFeature) {
            this.singleFeature = true;
        }

    },

    /**
     *
     * Function: activate
     * Attiva il controllo, nel parametro params vengono impostati eventuali parametri da passare
     * alla funzione di callback
     *
     * Parameters:
     * params {Object} Oggetto contenente i parametri
     * da passare alla funzione di callback
     *
     */
    activate: function(params) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        this.params = params;

        return OpenLayers.Control.prototype.activate.apply(this, arguments);

    },

    /**
     * Method: draw point
     */
    drawFeature: function(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry),
            proceed = this.layer.events.triggerEvent('sketchcomplete', {feature: feature});

        if (proceed !== false) {
            // se impostato singleGeometry rimuovo le feature
            if (this.singleFeature) {
                this.layer.removeAllFeatures();
            }
            feature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([feature]);
            this.featureAdded(feature);
            this.events.triggerEvent('featureadded', {feature: feature});
        }
    },

    CLASS_NAME: "CWN2.Control.DrawLine"

});
/*
 *
 * Class: CWN2.Control.RegularPolygon
 *
 * Controllo OpenLayers Custom che permette di disegnare poligoni regolari sulla mappa.
 *
 *
 */

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/

CWN2.Control.DrawRegularPolygon = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

    // flag singleGeometry se impostato a true permette l'inserimento di una sola geometria
    singleFeature: false,

    /**
     *
     * Constructor: CWN2.Control.DrawPoint
     * Costruttore
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Points will be added to this layer.
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     *
     */
    initialize: function(layer, options) {

        // passare opzioni per handler
        // es: rettangolo
        // handlerOptions: {
        //    sides: 4,
        //    irregular: true
        // }
        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this,
            [layer, OpenLayers.Handler.RegularPolygon, options]);

        if (options && options.singleFeature) {
            this.singleFeature = true;
        }

    },

    /**
     *
     * Function: activate
     * Attiva il controllo, nel parametro params vengono impostati eventuali parametri da passare
     * alla funzione di callback
     *
     * Parameters:
     * params {Object} Oggetto contenente i parametri
     * da passare alla funzione di callback
     *
     */
    activate: function(params) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        this.params = params;

        return OpenLayers.Control.prototype.activate.apply(this, arguments);

    },

    deactivate: function(params) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        this.params = params;

        return OpenLayers.Control.prototype.deactivate.apply(this, arguments);

    },

    /**
     * Method: draw feature
     */
    drawFeature: function(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry),
            proceed = this.layer.events.triggerEvent('sketchcomplete', {feature: feature});
        if (proceed !== false) {
            // se impostato singleGeometry rimuovo le feature
            if (this.singleFeature) {
                this.layer.removeAllFeatures();
            }
            feature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([feature]);
            this.featureAdded(feature);
            this.events.triggerEvent('featureadded', {feature: feature});
        }
    },

    CLASS_NAME: "CWN2.Control.DrawLine"

});
/*
 *
 * Class: CWN2.Control.GetMapCoordinatesOnClick
 *
 * Controllo OpenLayers Custom che permette di richiamare una funzione di callback sull evento click sulla mappa OL.
 *
 * In fase di attivazione del controllo e' possibile impostare i parametri da passare alla funzione di callback.
 *
 *  Esempio:
 *  (start code)
 *  var clickMapCtrl = new CWN2.Control.GetMapCoordinatesOnClick({
 *      callback: setPointOnMap
 *  });
 *  clickMapCtrl.activate({
 *      type: "start"
 *  });
 *  (end)
 *
 */

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/

CWN2.Control.GetMapCoordinatesOnClick = OpenLayers.Class(OpenLayers.Control, {

    // funzione da richiamare al click
    callback: null,

    // opzioni: oggetto che viene passato alla funzione di callback
    params: {},

    /**
     *
     * Constructor: CWN2.Control.GetMapCoordinatesOnClick
     * Costruttore
     *
     * Parameters:
     * callback - {Function} funzione di callback da richiamare al click
     *
     */
    initialize: function(callback) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        // controllo che callback sia una funzione
        try {
            CWN2.Util.assert(
                (typeof callback === "function"),
                {
                    name: "NotFunction",
                    message: "CWN2.Control.GetMapCoordinatesOnClick: parametro deve essere una funzione",
                    level: 1
                }
            );
        } catch (exception) {
            CWN2.Util.handleException(exception);
            return null;
        }

        this.callback = callback;

        OpenLayers.Control.prototype.initialize.apply(this, [callback]);

        var callbacks = {};
        callbacks["click"] = this.getInfoForClick;
        this.handler = new OpenLayers.Handler.Click(
            this,
            callbacks
        );

    },

    /**
     *
     * Function: activate
     * Attiva il controllo, nel parametro params vengono impostati eventuali parametri da passare
     * alla funzione di callback
     *
     * Parameters:
     * params {Object} Oggetto contenente i parametri
     * da passare alla funzione di callback
     *
     */
    activate: function(params) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        this.params = params;

        return OpenLayers.Control.prototype.activate.apply(this, arguments);

    },

    // funzione richiamata al click
    // calcola le coordinate e richiama la funzione di callback passando le coordinate
    // ed eventuali parametri

    getInfoForClick: function(evt) {

        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
        "use strict";

        var mapCoord,
            displayCoord,
            wgs84Coord;

        mapCoord = this.map.getLonLatFromPixel(evt.xy);
        displayCoord = mapCoord.clone();
        wgs84Coord = mapCoord.clone();

        if (this.map.getProjectionObject() !== this.map.displayProjection) {
            displayCoord = displayCoord.transform(
                this.map.getProjectionObject(),
                this.map.displayProjection
            );
        }

        if (this.map.projection !== "EPSG:4326") {
            wgs84Coord = wgs84Coord.transform(
                this.map.getProjectionObject(),
                new OpenLayers.Projection("EPSG:4326")
            );
        }

        if (typeof this.callback === "function") {
            this.callback(mapCoord, displayCoord, wgs84Coord, this.params);
        }
    },

    CLASS_NAME: "CWN2.Control.GetMapCoordinatesOnClick"

});
/**
 * Class: CWN2.Control.ZoomToInitialExtent
 * The ZoomToExtent control is a button that zooms out to the initial extent
 * of the map.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
CWN2.Control.ZoomToInitialExtent = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: type
     * {String} The type of <OpenLayers.Control> -- When added to a
     *     <Control.Panel>, 'type' is used by the panel to determine how to
     *     handle our events.
     */
    type: OpenLayers.Control.TYPE_BUTTON,

    /*
     * Method: trigger
     * Do the zoom.
     */
    trigger: function() {
        if (this.map) {
            this.map.zoomToInitialExtent();
        }
    },

    CLASS_NAME: "OpenLayers.Control.ZoomToExtent"
});
Ext.define('CWN2.button.BaseLayersCombo', {
    alias: 'widget.cwn2-combo-base-layers',
    constructor: function(config) {
        return Ext.create("CWN2.BaseLayersComboBox", {id: 'combo-base-layers'});
    }
});

Ext.define('CWN2.button.Coordinate', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-coordinate',

    constructor: function(config) {
        var btnOptions = config.options,
            id = "coordinate",
            map = CWN2.app.map,
            me = this,
            control = new CWN2.Control.DrawPoint(CWN2.Editor.createEditingLayer(map), {singleFeature: true});

        this.config = config;

        // Controllo OL
        control.events.register('featureadded', this, function(event) {
            me.fireEvent("featureadded", event);
        });
        map.addControl(control);

        // Creo il bottone
        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Coordinate Punto"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "drawPoint",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

Ext.define('CWN2.button.Coordinate.Win', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-coordinate-win',
    title: ' Coordinate selezionate',
    width: 300,
    height: 120,
    layout: "fit",
    resizable: false,
    items: [
        {
            xtype: 'panel',
            id: 'cwn2-coordinate-panel',
            bodyPadding: 10
        }
    ],
    geometry: null,
    closable: false,
    fbar: [
        {
            text: CWN2.I18n.get("Conferma"),
            action: 'coordinate-submit'
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: 'coordinate-cancel'
        }
    ]
});

// CONTROLLER
Ext.define('CWN2.controller.button.coordinate', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.Coordinate'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-coordinate'
        },
        {
            ref: 'win',
            selector: 'cwn2-coordinate-win'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.coordinate: init');

        this.control({
            'cwn2-button-coordinate': {
                toggle: this.onButtonPress,
                featureadded: this.onFeatureAdded
            },
            'button[action=coordinate-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=coordinate-cancel]': {
                click: this.onCancelButtonClick
            }
        });

    },

    onSubmitButtonClick: function() {
        var win = this.getWin(),
            btnOptions = this.getButton().config.options;
        if (btnOptions && btnOptions.callBacks && btnOptions.callBacks["submit"]) {
            if (win.geometry) {
                //var geom = win.geometry.clone();
                //if (CWN2.app.map.projection !== CWN2.app.map.displayProjection.projCode) {
                //    geom.transform(new OpenLayers.Projection(CWN2.app.map.projection), CWN2.app.map.displayProjection);
                //}
                btnOptions.callBacks["submit"](win.geometry);
            } else {
                CWN2.Util.handleException({
                    message: "Nessun punto selezionato",
                    level: 1
                });
            }
        } else {
            CWN2.Util.log("Funzione di callback 'submit' non definita", 1);
        }
    },

    onCancelButtonClick: function() {
        var win = this.getWin(),
            btnOptions = this.getButton().config.options;
        if (btnOptions && btnOptions.callBacks && btnOptions.callBacks["cancel"]) {
            btnOptions.callBacks["cancel"]();
        } else {
            CWN2.Util.log("Funzione di callback 'cancel' non definita", 1);
        }
    },

    onButtonPress: function() {
        var win = this.getWin(),
            btnOptions = this.getButton().config.options;

        if (!win) {
            win = Ext.create('CWN2.button.Coordinate.Win');
        }
        this.showHideWin(win, CWN2.app.layout.mapPanel);
    },

    onFeatureAdded: function(event) {
        var win = this.getWin();

        var ntvProjection = this.getButton().config.options.projection;
        var mapProjection = CWN2.app.map.projection;

        if (ntvProjection && ntvProjection !== mapProjection) {
            var srvUrl = "/geoservices/REST/coordinate/transform_point/" + mapProjection.replace("EPSG:","") + "/" + ntvProjection.replace("EPSG:","") + "/" + event.feature.geometry.x + "," + event.feature.geometry.y;
            CWN2.Util.ajaxRequest({
                type: "JSON",
                url: srvUrl,
                callBack: function(data,response) {
                    var point = data.points[0].split(",");
                    updateCoordinate(point[0],point[1])
                    //console.log(data)
                }
            });
        } else {
            updateCoordinate(event.feature.geometry.x,event.feature.geometry.y)
        }


        function updateCoordinate(x,y) {
            x = parseFloat(x);
            y = parseFloat(y);
            win.geometry = {
                x: x, y: y
            };
            var cifreDecimali = (CWN2.app.map.displayProjection.getUnits() === 'm') ? 0 : 6;
            var labelCoord1 = (CWN2.app.map.displayProjection.getUnits() === 'm') ? "X" : "lon";
            var labelCoord2 = (CWN2.app.map.displayProjection.getUnits() === 'm') ? "Y" : "lat";
            var html = "<b>" + labelCoord1 + " = " + x.toFixed(cifreDecimali) + "<br> " + labelCoord2 + " = " + y.toFixed(cifreDecimali);
            Ext.ComponentQuery.query('panel[id="cwn2-coordinate-panel"]')[0].update(html);
        }

    },

    showHideWin: function(win, mapPanel) {
        if (!win.isVisible()) {
            win.show();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        } else {
            win.hide();
        }
    }


});
/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.button.DeleteFeature', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-deletefeature',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            editingLayer = CWN2.Editor.createEditingLayer(map),
            control = new CWN2.Control.DeleteFeature(editingLayer),
            id = "deleteFeature";

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Cancella Geometria"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));

    }
});/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.button.DragFeature', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-dragfeature',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            editingLayer = CWN2.Editor.createEditingLayer(map),
            control = new OpenLayers.Control.DragFeature(editingLayer),
            id = "dragFeature";

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Sposta Geometria"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.button.DrawLine', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-drawline',

    constructor: function(config) {
        var btnOptions = config.options || {},
            map = CWN2.app.map,
            id = "drawLine",
            control = new CWN2.Control.DrawLine(CWN2.Editor.createEditingLayer(map, btnOptions.styleMap), btnOptions);

        // Se esiste funzione callback definita nelle opzioni del bottone la chiamo passando la geometria
        control.events.register('featureadded', this, function(evt) {
            if (btnOptions.callback && typeof btnOptions.callback == "function") {
                btnOptions.callback(evt.feature.geometry,evt);
            }
        });

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Inserisci Linea"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.button.DrawPoint', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-drawpoint',

    constructor: function(config) {
        var btnOptions = config.options || {},
            map = CWN2.app.map,
            id = "drawPoint",
            control = new CWN2.Control.DrawPoint(CWN2.Editor.createEditingLayer(map, btnOptions.styleMap), btnOptions);

        // Se esiste funzione callback definita nelle opzioni del bottone la chiamo passando la geometria
        control.events.register('featureadded', this, function(evt) {
            if (btnOptions.callback && typeof btnOptions.callback == "function") {
                btnOptions.callback(evt.feature.geometry,evt);
            }
        });

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Inserisci Punto"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

Ext.define('CWN2.button.DrawPolygon', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-drawpolygon',

    constructor: function(config) {
        var btnOptions = config.options || {},
            map = CWN2.app.map,
            id = "drawPolygon",
            control = new CWN2.Control.DrawPolygon(CWN2.Editor.createEditingLayer(map, btnOptions.styleMap), btnOptions);

        // Se esiste funzione callback definita nelle opzioni del bottone la chiamo passando la geometria
        control.events.register('featureadded', this, function(evt) {
            if (btnOptions.callback && typeof btnOptions.callback == "function") {
                btnOptions.callback(evt.feature.geometry,evt);
            }
        });

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: (btnOptions && btnOptions.tooltip) ? CWN2.I18n.get(btnOptions.tooltip) : CWN2.I18n.get("Inserisci Poligono"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

Ext.define('CWN2.button.DrawRegularPolygon', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-drawregularpolygon',

    constructor: function(config) {
        var btnOptions = config.options || {},
            handlerOptions,
            map = CWN2.app.map,
            id = btnOptions.id || "drawRegularPolygon";

        btnOptions.type = btnOptions.type || "rectangle";

        switch (btnOptions.type) {
            case "rectangle":
                handlerOptions = {
                    "sides": 4,
                    "irregular": true
                };
                break;
            case "circle":
                handlerOptions = {
                    "sides": 40
                };
                break;
            case "triangle":
                handlerOptions = {
                    "sides": 3
                };
                break;
            case "pentagon":
                handlerOptions = {
                    "sides": 5
                };
                break;
            case "hexagon":
                handlerOptions = {
                    "sides": 6
                };
                break;
        }


        btnOptions.handlerOptions = handlerOptions;

        var control = new CWN2.Control.DrawRegularPolygon(CWN2.Editor.createEditingLayer(map, btnOptions.styleMap), btnOptions);

        // Se esiste funzione callback definita nelle opzioni del bottone la chiamo passando la geometria
        control.events.register('featureadded', this, function(evt) {
            if (btnOptions.callback && typeof btnOptions.callback == "function") {
                btnOptions.callback(evt.feature.geometry,evt);
            }
        });

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: (btnOptions && btnOptions.tooltip) ? CWN2.I18n.get(btnOptions.tooltip) : CWN2.I18n.get("Inserisci un poligono"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "drawPolygon",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

Ext.define("CWN2.button.Find", {
  extend: "Ext.button.Button",
  alias: "widget.cwn2-button-find",

  constructor: function(config) {
    var btnOptions = config.options,
      id = "find";

    this.config = config;

    this.superclass.constructor.call(this, {
      tooltip: CWN2.I18n.get("Ricerche"),
      pressed: false,
      id: id,
      iconCls: btnOptions && btnOptions.iconCls ? btnOptions.iconCls : id,
      text: btnOptions && btnOptions.text ? btnOptions.text : "",
      width: btnOptions && btnOptions.width ? btnOptions.width : 26
    });
  }
});

Ext.define("CWN2.button.Find.Window", {
  extend: "Ext.window.Window",
  alias: "widget.cwn2-find-win",
  title: CWN2.I18n.get("Ricerche"),
  height: 205,
  width: 335,
  resizable: false,
  layout: "fit",
  closeAction: "hide"
});

Ext.define("CWN2.button.Find.TabPanel", {
  extend: "Ext.tab.Panel",
  alias: "widget.cwn2-btn-find-tab-panel",
  activeTab: 0,
  bodyBorder: false,
  deferredRender: false,
  layoutOnTabChange: true,
  border: false,
  flex: 1,
  plain: true
});

Ext.define("CWN2.button.Find.AddressPanel", {
  extend: "Ext.panel.Panel",
  alias: "widget.cwn2-btn-find-address-panel",
  frame: true,
  labelWidth: 1,
  bodyStyle: "padding:5px 5px 0",
  height: 215
});

Ext.define("CWN2.button.Find.LayerPanel", {
  extend: "Ext.panel.Panel",
  alias: "widget.cwn2-btn-find-layer-panel",
  frame: true,
  labelWidth: 1,
  bodyStyle: "padding:5px 5px 0",
  height: 215
});

Ext.define("CWN2.button.Find.CoordPanel", {
  extend: "Ext.panel.Panel",
  alias: "widget.cwn2-btn-find-coord-panel",
  frame: true,
  labelWidth: 1,
  bodyStyle: "padding:5px 5px 0",
  height: 215
});

Ext.define("CWN2.button.Find.LayerCombo", {
  extend: "Ext.form.field.ComboBox",
  alias: "widget.cwn2-btn-find-layer-combo",
  mode: "local",
  typeAhead: true,
  triggerAction: "all",
  value: "Scegli un livello...",
  valueField: "name",
  displayField: "label",
  width: 300,
  constructor: function(config) {
    //        console.log(config.layersConfig)
    Ext.define("FindLayers", {
      extend: "Ext.data.Model",
      fields: [
        { name: "name", type: "string" },
        { name: "label", type: "string" },
        { name: "columns" }
      ]
    });
    this.store = Ext.create("Ext.data.Store", {
      model: "FindLayers",
      data: { layers: config.layersConfig },
      proxy: {
        type: "memory",
        reader: {
          type: "json",
          root: "layers"
        }
      }
    });
    this.superclass.constructor.call(this);
    var firstRecord = this.getStore().getAt(0);
    if (firstRecord && firstRecord.data) {
      this.setValue(firstRecord.data.name);
    }
  }
});

Ext.define("CWN2.button.Find.ColumnCombo", {
  extend: "Ext.form.field.ComboBox",
  alias: "widget.cwn2-btn-find-column-combo",
  queryMode: "local",
  typeAhead: true,
  triggerAction: "all",
  width: 300,
  valueField: "name",
  displayField: "label",
  constructor: function(config) {
    var columns = [];
    Ext.each(config.layersConfig[0].columns, function(column) {
      var name = column.name,
        label = CWN2.Util.capitalizeString(column.name.replace(/_/g, " ")),
        type = column.type;
      columns.push({ name: name, label: label, type: type });
    });
    Ext.define("FindColumns", {
      extend: "Ext.data.Model",
      fields: [
        { name: "name", type: "string" },
        { name: "label", type: "string" },
        { name: "type", type: "string" }
      ]
    });
    this.store = Ext.create("Ext.data.Store", {
      model: "FindColumns",
      data: { columns: columns },
      proxy: {
        type: "memory",
        reader: {
          type: "json",
          root: "columns"
        }
      }
    });

    this.superclass.constructor.call(this);
    if (this.getStore().getAt(0)) {
      this.setValue(this.getStore().getAt(0).data.name);
    }
  }
});

Ext.define("CWN2.button.Find.OperatorCombo", {
  extend: "Ext.form.field.ComboBox",
  alias: "widget.cwn2-btn-find-operator-combo",
  queryMode: "local",
  store: [
    ["=", "="],
    ["!=", "!="],
    ["<", "<"],
    [">", ">"],
    ["<=", "<="],
    [">=", ">="]
    //,["LIKE", "LIKE"]
  ],
  typeAhead: true,
  triggerAction: "all",
  value: "=",
  width: 100
});

Ext.define("CWN2.button.Find.ValueField", {
  extend: "Ext.form.field.Text",
  alias: "widget.cwn2-btn-find-value-field",
  allowBlank: false,
  width: 300
});

Ext.define("CWN2.button.Find.LayerSubmit", {
  extend: "Ext.button.Button",
  alias: "widget.cwn2-btn-find-layer-submit",
  text: "Ricerca..."
});

Ext.define("CWN2.button.Find.LayerValueListButton", {
  extend: "Ext.button.Button",
  alias: "widget.cwn2-btn-find-layer-value-list-btn",
  text: "Lista Valori"
});

Ext.define("CWN2.button.Find.LayerResultStore", {
  extend: "Ext.data.Store",
  storeId: "find-layer-result",
  autoLoad: false,
  fields: ["id", "label", "bbox"]
});

Ext.define("CWN2.button.Find.LayerValueListStore", {
  extend: "Ext.data.Store",
  storeId: "find-layer-value-list",
  autoLoad: false,
  fields: ["value"]
});

Ext.define("CWN2.button.Find.LayerResultWindow", {
  extend: "Ext.window.Window",
  alias: "widget.cwn2-btn-find-layer-result-win",
  title: CWN2.I18n.get("Risultato ricerca"),
  width: 335,
  height: 360,
  layout: "fit",
  closable: true,
  closeAction: "hide",
  items: [{ xtype: "cwn2-btn-find-layer-result-grid" }]
});

Ext.define("CWN2.button.Find.LayerValueListWindow", {
  extend: "Ext.window.Window",
  alias: "widget.cwn2-btn-find-layer-value-list-win",
  title: CWN2.I18n.get("Lista valori"),
  width: 335,
  height: 360,
  layout: "fit",
  closable: true,
  closeAction: "hide",
  items: [{ xtype: "cwn2-btn-find-layer-value-list-grid" }]
});

Ext.define("CWN2.button.Find.LayerValueListGrid", {
  extend: "Ext.grid.Panel",
  alias: "widget.cwn2-btn-find-layer-value-list-grid",
  frame: true,
  width: 320,
  height: 300,
  header: false,
  //hideHeaders: true,
  iconCls: "icon-grid",
  store: Ext.create("CWN2.button.Find.LayerValueListStore"),
  columns: [
    {
      header: "Valore",
      sortable: true,
      dataIndex: "value",
      width: 290
    }
  ]
});

Ext.define("CWN2.button.Find.LayerResultGrid", {
  extend: "Ext.grid.Panel",
  alias: "widget.cwn2-btn-find-layer-result-grid",
  frame: true,
  width: 320,
  height: 300,
  header: false,
  //hideHeaders: true,
  iconCls: "icon-grid",
  store: Ext.create("CWN2.button.Find.LayerResultStore"),
  columns: [
    {
      header: "ID",
      sortable: true,
      dataIndex: "id",
      width: 70
    },
    {
      header: "LABEL",
      sortable: true,
      dataIndex: "label",
      width: 220
    }
  ]
});

Ext.define("CWN2.button.Find.SrsCombo", {
  extend: "Ext.form.field.ComboBox",
  alias: "widget.cwn2-btn-find-srs-combo",
  fieldLabel: "",
  labelWidth: 1,
  queryMode: "local",
  store: [
    ["3003", "Coordinate Piane - Gauss-Boaga - Fuso Ovest"],
    ["25832", "Coordinate Piane - ETRS - UTM - ETRF89 - Fuso 32"],
    ["4806", "Coordinate Geografiche - ROMA40"],
    ["4258", "Coordinate Geografiche - ETRS - ETRF89"]
  ],
  typeAhead: true,
  triggerAction: "all",
  value: "3003",
  width: 300
});

Ext.define("CWN2.button.Find.XField", {
  extend: "Ext.form.field.Number",
  alias: "widget.cwn2-btn-find-x-field",
  allowBlank: false,
  fieldLabel: "X (Est)",
  decimalPrecision: 0,
  minValue: 1378000,
  maxValue: 1586000,
  width: 300
});

Ext.define("CWN2.button.Find.YField", {
  extend: "Ext.form.field.Number",
  alias: "widget.cwn2-btn-find-y-field",
  allowBlank: false,
  fieldLabel: "Y (Nord)",
  decimalPrecision: 0,
  minValue: 4846000,
  maxValue: 4948000,
  width: 300
});

Ext.define("CWN2.button.Find.CoordSubmit", {
  extend: "Ext.button.Button",
  alias: "widget.cwn2-btn-find-coord-submit",
  text: "Trova..."
});

// CONTROLLER
Ext.define("CWN2.controller.button.find", {
  extend: "Ext.app.Controller",

  views: ["CWN2.button.Find"],

  refs: [
    {
      ref: "button",
      selector: "cwn2-button-find"
    },
    {
      ref: "win",
      selector: "cwn2-find-win"
    },
    {
      ref: "layerCombo",
      selector: "cwn2-btn-find-layer-combo"
    },
    {
      ref: "columnCombo",
      selector: "cwn2-btn-find-column-combo"
    },
    {
      ref: "operatorCombo",
      selector: "cwn2-btn-find-operator-combo"
    },
    {
      ref: "valueField",
      selector: "cwn2-btn-find-value-field"
    },
    {
      ref: "layerResultWin",
      selector: "cwn2-btn-find-layer-result-win"
    },
    {
      ref: "layerResultGrid",
      selector: "cwn2-btn-find-layer-result-grid"
    },
    {
      ref: "layerValueListWin",
      selector: "cwn2-btn-find-layer-value-list-win"
    },
    {
      ref: "layerValueListGrid",
      selector: "cwn2-btn-find-layer-value-list-grid"
    },
    {
      ref: "srsCombo",
      selector: "cwn2-btn-find-srs-combo"
    },
    {
      ref: "xField",
      selector: "cwn2-btn-find-x-field"
    },
    {
      ref: "yField",
      selector: "cwn2-btn-find-y-field"
    }
  ],

  layersConfig: [],

  init: function(application) {
    CWN2.Util.log("CWN2.controller.button.find: init");

    this.control({
      "cwn2-button-find": {
        click: this.onClick
      },
      "cwn2-btn-find-layer-combo": {
        select: this.onLayerSelect
      },
      "cwn2-btn-find-column-combo": {
        select: this.onColumnSelect
      },
      "cwn2-btn-find-layer-submit": {
        click: this.onLayerSubmit
      },
      "cwn2-btn-find-coord-submit": {
        click: this.onCoordSubmit
      },
      "cwn2-btn-find-srs-combo": {
        select: this.onSrsSelect
      },
      "cwn2-btn-find-layer-result-grid": {
        select: this.onLayerGridSelect
      },
      "cwn2-btn-find-layer-value-list-btn": {
        click: this.onLayerValueListClick
      },
      "cwn2-btn-find-layer-value-list-grid": {
        select: this.onValueListGridSelect
      }
    });
  },

  onCoordSubmit: function(button, e, eOpts) {
    var me = this,
      srs = this.getSrsCombo().value,
      xField = this.getXField(),
      yField = this.getYField(),
      x = xField.value,
      y = yField.value;

    if (!xField.isValid()) {
      Ext.MessageBox.alert(
        "Attenzione",
        "Coordinata X fuori dai limiti ammessi.<br>Posiziona il cursore sopra il campo per conoscere i valori ammessi"
      );
      return false;
    }
    if (!yField.isValid()) {
      Ext.MessageBox.alert(
        "Attenzione",
        "Coordinata Y fuori dai limiti ammessi.<br>Posiziona il cursore sopra il campo per conoscere i valori ammessi"
      );
      return false;
    }

    // chiamo servizio conversione coordinate
    var srvUrl =
      "/geoservices/REST/coordinate/transform_point/" +
      srs +
      "/3857/" +
      x +
      "," +
      y;
    CWN2.Util.ajaxRequest({
      type: "JSON",
      url: srvUrl,
      callBack: function(data, response) {
        var point = data.points[0].split(",");
        //                CWN2.app.map.setCenter([point[0],point[1]],16);
        CWN2.FeatureLoader.loadMarker({
          x: point[0],
          y: point[1],
          map: CWN2.app.map,
          label: "",
          //label: point[0] & ',' & point[1],
          zoomLevel: 17
        });
      }
    });
  },

  onSrsSelect: function(combo, records, eOpts) {
    var xField = this.getXField();
    var yField = this.getYField();
    var srs = this.getSrsCombo().value;
    switch (srs) {
      case "3003":
        xField.setMinValue(1378000);
        xField.setMaxValue(1586000);
        yField.setMinValue(4846000);
        yField.setMaxValue(4948000);
        xField.decimalPrecision = 0;
        yField.decimalPrecision = 0;
        break;
      case "25832":
        xField.setMinValue(377000);
        xField.setMaxValue(586000);
        yField.setMinValue(4845000);
        yField.setMaxValue(4948000);
        xField.decimalPrecision = 0;
        yField.decimalPrecision = 0;
        break;
      case "4258":
        xField.setMinValue(7.48416);
        xField.setMaxValue(10.08478);
        yField.setMinValue(43.756831);
        yField.setMaxValue(44.680042);
        xField.decimalPrecision = 6;
        yField.decimalPrecision = 6;
        break;
      case "4806":
        xField.setMinValue(-4.967781);
        xField.setMaxValue(-2.366957);
        yField.setMinValue(43.756193);
        yField.setMaxValue(44.678726);
        xField.decimalPrecision = 6;
        yField.decimalPrecision = 6;
        break;
    }

    //        var srs = record.data["value"].toString()
  },

  onLayerSubmit: function(button, e, eOpts) {
    var me = this,
      layerName = this.getLayerCombo().value,
      column = this.getColumnCombo().value,
      datatype = this.getColumnCombo().findRecordByValue(column).data["type"],
      operator = this.getOperatorCombo().value,
      value = this.getValueField().value;

    if (!value) {
      Ext.Msg.show({
        msg: "Indicare un valore",
        icon: Ext.Msg.INFO,
        buttons: Ext.Msg.OK
      });
      return;
    }

    if (datatype == "DATE") {
      if (
        !value.match(/^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/]\d{4}$/)
      ) {
        Ext.Msg.show({
          msg:
            "Valori di tipo data devono essere espressi nel formato: 'GG/MM/AAAA'",
          icon: Ext.Msg.INFO,
          buttons: Ext.Msg.OK
        });
        return;
      }
      if (operator == "LIKE") {
        Ext.Msg.show({
          msg: "Campi di tipo data non sono compatibili con l'operatore LIKE",
          icon: Ext.Msg.INFO,
          buttons: Ext.Msg.OK
        });
        return;
      }
    }

    CWN2.loadingScreen = Ext.getBody().mask(
      "Ricerca in corso",
      "loadingscreen"
    );
    CWN2.Util.ajaxRequest({
      type: "JSONP",
      url:
        "/geoservices/REST/config/query_layer/" +
        layerName.replace("L", "") +
        "?column=" +
        column +
        "&datatype=" +
        datatype +
        "&operator=" +
        operator +
        "&value=" +
        value +
        "&map_projection=" +
        CWN2.app.map.projection,
      callBack: function(response) {
        if (response && !response.success) {
          CWN2.Util.msgBox("Attenzione: - " + response.message);
          return;
        }
        response.data && response.data.length > 0
          ? me.onLayerDataResponse(layerName, response.data)
          : CWN2.Util.msgBox("Nessun oggetto trovato");
      }
    });
  },

  columnComboChange: true,

  onLayerValueListClick: function(button, e, eOpts) {
    var me = this,
      layerName = this.getLayerCombo().value,
      column = this.getColumnCombo().value,
      datatype = this.getColumnCombo().findRecordByValue(column).data["type"],
      column = this.getColumnCombo().value;

      CWN2.loadingScreen = Ext.getBody().mask(
        "Ricerca in corso",
        "loadingscreen"
      );
      CWN2.Util.ajaxRequest({
        type: "JSONP",
        url:
          "/geoservices/REST/config/query_layer_valuelist/" +
          layerName.replace("L", "") +
          "?column=" +
          column +
          "&datatype=" +
          datatype,
        callBack: function(response) {
          if (response && !response.success) {
            CWN2.Util.msgBox("Attenzione: - " + response.message);
            return;
          }
          response.data && response.data.length > 0
            ? me.onLayerValueListResponse(layerName, response.data)
            : CWN2.Util.msgBox("Nessun oggetto trovato");
        }
      });
      this.columnComboChange = false;
  },

  onLayerValueListResponse: function(layerName, data) {
    var me = this,
      mainWin = this.getWin(),
      win =
        this.getLayerValueListWin() ||
        Ext.create("CWN2.button.Find.LayerValueListWindow"),
      store = this.getLayerValueListGrid().getStore();

    store.removeAll();
    Ext.each(data, function(rec) {
      store.add(rec);
    });
    win.show();
    win.alignTo(CWN2.app.layout.mapPanel.body, "tl-tl", [
      10 + mainWin.getWidth() + 10,
      10
    ]);
  },

  onLayerDataResponse: function(layerName, data) {
    var me = this,
      layerConfig = CWN2.app.map.layerManager.getLayerConfigByName(layerName),
      mainWin = this.getWin(),
      win =
        this.getLayerResultWin() ||
        Ext.create("CWN2.button.Find.LayerResultWindow"),
      store = this.getLayerResultGrid().getStore();

    store.removeAll();
    Ext.each(data, function(rec) {
      store.add(rec);
    });
    win.show();
    win.alignTo(CWN2.app.layout.mapPanel.body, "tl-tl", [
      10,
      10 + mainWin.getHeight() + 10
    ]);
  },

  onLayerSelect: function(combo, records, eOpts) {
    var columnCombo = this.getColumnCombo();
    var columns = [];
    columnCombo.enable();
    columnCombo.clearValue();
    Ext.each(records[0].data.columns, function(column) {
      var name = column.name,
        label = CWN2.Util.capitalizeString(column.name.replace(/_/g, " ")),
        type = column.type;
      columns.push({ name: name, label: label, type: type });
    });
    columnCombo.store.loadData(columns, false);
    columnCombo.setValue(columnCombo.getStore().getAt(0).data.name);
  },

  onColumnSelect: function(combo, records, eOpts) {
    this.columnComboChange = true;
  },

  buildLayersConfig: function(panelConfig) {
    var me = this;
    me.layersConfig = [];
    var layersConfig = CWN2.app.map.layerManager.overlayLayersConfig;
    if (panelConfig && panelConfig.layers) {
      Ext.each(panelConfig.layers, function(layer) {
        var layerAppConfig = CWN2.Util.getArrayElementByAttribute(
          layersConfig,
          "name",
          layer.name
        );
        me.layersConfig.push({
          name: layer.name,
          label: layerAppConfig.legend.label,
          columns:
            layer.dbSchema && layer.dbSchema.columns
              ? layer.dbSchema.columns
              : layersConfig.dbSchema.columns
        });
      });
    } else {
      Ext.each(layersConfig, function(layer) {
        if (
          layer.dbSchema &&
          layer.dbSchema.schema &&
          layer.dbSchema.columns &&
          layer.dbSchema.columns.length > 0
        ) {
          me.layersConfig.push({
            name: layer.name,
            label: layer.legend.label,
            columns: layer.dbSchema.columns
          });
        }
      });
    }
  },

  onValueListGridSelect: function(grid, record, index) {
    this.getValueField().setValue(record.data["value"].toString());
    this.getLayerValueListWin().hide();
  },

  onLayerGridSelect: function(grid, record, index) {
    var me = this,
      layerName = this.getLayerCombo().value,
      layerConfig = CWN2.app.map.layerManager.getLayerConfigByName(layerName),
      infoIdAttr = layerConfig.infoOptions.infoIdAttr,
      idValue = record.data["id"].toString(),
      bounds = new OpenLayers.Bounds.fromString(record.data["bbox"]);

    CWN2.MapCatalogueLoader.findLayer({
      layers: [layerName],
      fields: infoIdAttr,
      values: idValue,
      bounds: bounds,
      maxZoomLevel: 17
    });
  },

  onClick: function() {
    var mapPanel = CWN2.app.layout.mapPanel,
      win = this.getWin(),
      button = this.getButton(),
      me = this,
      layerValueListWin = this.getLayerValueListWin();

    if (win) {
      win.destroy();
    }
    if (layerValueListWin) {
      layerValueListWin.destroy();
    }

    var tabs = [];
    Ext.each(button.config.panels, function(panelConfig) {
      switch (panelConfig.type) {
        case "coordinate":
          tabs.push({
            xtype: "cwn2-btn-find-coord-panel",
            title: CWN2.I18n.get(panelConfig.name),
            items: [
              {
                xtype: "label",
                text: "Sistema di Riferimento:"
              },
              {
                xtype: "cwn2-btn-find-srs-combo"
              },
              {
                xtype: "cwn2-btn-find-x-field"
              },
              {
                xtype: "cwn2-btn-find-y-field"
              },
              {
                xtype: "cwn2-btn-find-coord-submit"
              }
            ]
          });
          break;
        case "indirizzo":
          tabs.push({
            xtype: "cwn2-btn-find-address-panel",
            title: CWN2.I18n.get(panelConfig.name),
            items: [
              {
                xtype: "cwn2-geocoder-combobox",
                map: mapPanel.map,
                service: "google",
                configOptions: panelConfig.options,
                width: 200
              }
            ]
          });
          break;
        case "layer":
          me.buildLayersConfig(panelConfig.options);
          tabs.push({
            xtype: "cwn2-btn-find-layer-panel",
            title: CWN2.I18n.get(panelConfig.name),
            items: [
              {
                xtype: "cwn2-btn-find-layer-combo",
                layersConfig: me.layersConfig
              },
              {
                xtype: "cwn2-btn-find-column-combo",
                layersConfig: me.layersConfig
              },
              {
                xtype: "fieldcontainer",
                border: false,
                width: 300,
                flex: 1,
                layout: "hbox",
                items: [
                  {
                    xtype: "cwn2-btn-find-operator-combo"
                  },
                  {
                    xtype: "tbfill"
                  },
                  {
                    xtype: "cwn2-btn-find-layer-value-list-btn"
                  }
                ]
              },
              {
                xtype: "cwn2-btn-find-value-field"
              },
              {
                xtype: "cwn2-btn-find-layer-submit"
              }
            ]
          });
          break;
      }
    });
    win = Ext.create("CWN2.button.Find.Window", {
      items: [
        {
          xtype: "cwn2-btn-find-tab-panel",
          id: "find-tabpanel",
          items: tabs
        }
      ]
    });

    this.showHideWin(win, mapPanel);
  },

  showHideWin: function(win, mapPanel) {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
    }
  }
});
Ext.define('CWN2.button.Fitall', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-fitall',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            control = new OpenLayers.Control.ZoomToMaxExtent();

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            tooltip: CWN2.I18n.get("Zoom alla massima estensione"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "fit",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false,
            control: control,
            id: "fitall"
        }));
    }
});


/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.button.Generic', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-generic',

    constructor: function(config) {
        var btnOptions = config.options || {},
            map = CWN2.app.map,
            id = "generic";

        this.options = btnOptions;

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: (btnOptions && btnOptions.tooltip) ? btnOptions.tooltip : CWN2.I18n.get("Bottone Generico"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26
        }));
    }
});

Ext.define('CWN2.controller.button.generic', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.Generic'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-generic'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.generic: init');

        this.control({
            'cwn2-button-generic': {
                click: this.onClick
            }
        });
    },

    onClick: function() {
        var btnOptions = this.getButton().options;

            // richiamo funzione di callback
        if (btnOptions.callback && typeof btnOptions.callback === "function") {
            btnOptions.callback();
        } else {
            CWN2.Util.log('CWN2.button.Generic: funzione di callback non definita',2);
        }
    }


});
// Componenti BASE
Ext.define('Ext.picker.Color', {
    extend: 'Ext.Component',
    requires: 'Ext.XTemplate',
    alias: 'widget.colorpicker',
    alternateClassName: 'Ext.ColorPalette',

    /**
     * @cfg {String} [componentCls='x-color-picker']
     * The CSS class to apply to the containing element.
     */
    componentCls: Ext.baseCSSPrefix + 'color-picker',

    /**
     * @cfg {String} [selectedCls='x-color-picker-selected']
     * The CSS class to apply to the selected element
     */
    selectedCls: Ext.baseCSSPrefix + 'color-picker-selected',

    /**
     * @cfg {String} itemCls
     * The CSS class to apply to the color picker's items
     */
    itemCls: Ext.baseCSSPrefix + 'color-picker-item',

    /**
     * @cfg {String} value
     * The initial color to highlight (should be a valid 6-digit color hex code without the # symbol). Note that the hex
     * codes are case-sensitive.
     */
    value: null,

    /**
     * @cfg {String} clickEvent
     * The DOM event that will cause a color to be selected. This can be any valid event name (dblclick, contextmenu).
     */
    clickEvent: 'click',

    /**
     * @cfg {Boolean} allowReselect
     * If set to true then reselecting a color that is already selected fires the {@link #event-select} event
     */
    allowReselect: false,

    /**
     * @property {String[]} colors
     * An array of 6-digit color hex code strings (without the # symbol). This array can contain any number of colors,
     * and each hex code should be unique. The width of the picker is controlled via CSS by adjusting the width property
     * of the 'x-color-picker' class (or assigning a custom class), so you can balance the number of colors with the
     * width setting until the box is symmetrical.
     *
     * You can override individual colors if needed:
     *
     *     var cp = new Ext.picker.Color();
     *     cp.colors[0] = 'FF0000';  // change the first box to red
     *
     * Or you can provide a custom array of your own for complete control:
     *
     *     var cp = new Ext.picker.Color();
     *     cp.colors = ['000000', '993300', '333300'];
     */
    colors: [
        '000000', '993300', '333300', '003300', '003366', '000080', '333399', '333333',
        '800000', 'FF6600', '808000', '008000', '008080', '0000FF', '666699', '808080',
        'FF0000', 'FF9900', '99CC00', '339966', '33CCCC', '3366FF', '800080', '969696',
        'FF00FF', 'FFCC00', 'FFFF00', '00FF00', '00FFFF', '00CCFF', '993366', 'C0C0C0',
        'FF99CC', 'FFCC99', 'FFFF99', 'CCFFCC', 'CCFFFF', '99CCFF', 'CC99FF', 'FFFFFF'
    ],

    /**
     * @cfg {Function} handler
     * A function that will handle the select event of this picker. The handler is passed the following parameters:
     *
     * - `picker` : ColorPicker
     *
     *   The {@link Ext.picker.Color picker}.
     *
     * - `color` : String
     *
     *   The 6-digit color hex code (without the # symbol).
     */

    /**
     * @cfg {Object} scope
     * The scope (`this` reference) in which the `{@link #handler}` function will be called.
     *
     * Defaults to this Color picker instance.
     */

    colorRe: /(?:^|\s)color-(.{6})(?:\s|$)/,

    renderTpl: [
        '<tpl for="colors">',
        '<a href="#" class="color-{.} {parent.itemCls}" hidefocus="on">',
        '<span class="{parent.itemCls}-inner" style="background:#{.}">&#160;</span>',
        '</a>',
        '</tpl>'
    ],

    // @private
    initComponent: function () {
        var me = this;

        me.callParent(arguments);
        me.addEvents(
            /**
             * @event select
             * Fires when a color is selected
             * @param {Ext.picker.Color} this
             * @param {String} color The 6-digit color hex code (without the # symbol)
             */
            'select'
        );

        if (me.handler) {
            me.on('select', me.handler, me.scope, true);
        }
    },


    // @private
    initRenderData: function () {
        var me = this;
        return Ext.apply(me.callParent(), {
            itemCls: me.itemCls,
            colors: me.colors
        });
    },

    onRender: function () {
        var me = this,
            clickEvent = me.clickEvent;

        me.callParent(arguments);

        me.mon(me.el, clickEvent, me.handleClick, me, {delegate: 'a'});
        // always stop following the anchors
        if (clickEvent != 'click') {
            me.mon(me.el, 'click', Ext.emptyFn, me, {delegate: 'a', stopEvent: true});
        }
    },

    // @private
    afterRender: function () {
        var me = this,
            value;

        me.callParent(arguments);
        if (me.value) {
            value = me.value;
            me.value = null;
            me.select(value, true);
        }
    },

    // @private
    handleClick: function (event, target) {
        var me = this,
            color;

        event.stopEvent();
        if (!me.disabled) {
            color = target.className.match(me.colorRe)[1];
            me.select(color.toUpperCase());
        }
    },

    /**
     * Selects the specified color in the picker (fires the {@link #event-select} event)
     * @param {String} color A valid 6-digit color hex code (# will be stripped if included)
     * @param {Boolean} [suppressEvent=false] True to stop the select event from firing.
     */
    select: function (color, suppressEvent) {

        var me = this,
            selectedCls = me.selectedCls,
            value = me.value,
            el;

        color = color.replace('#', '');
        if (!me.rendered) {
            me.value = color;
            return;
        }


        if (color != value || me.allowReselect) {
            el = me.el;

            if (me.value) {
                el.down('a.color-' + value).removeCls(selectedCls);
            }
            el.down('a.color-' + color).addCls(selectedCls);
            me.value = color;
            if (suppressEvent !== true) {
                me.fireEvent('select', me, color);
            }
        }
    },

    /**
     * Clears any selection and sets the value to `null`.
     */
    clear: function () {
        var me = this,
            value = me.value,
            el;

        if (value && me.rendered) {
            el = me.el.down('a.color-' + value);
            el.removeCls(me.selectedCls);
        }
        me.value = null;
    },

    /**
     * Get the currently selected color value.
     * @return {String} value The selected value. Null if nothing is selected.
     */
    getValue: function () {
        return this.value || null;
    }
});

Ext.define('Ext.menu.ColorPicker', {
    extend: 'Ext.menu.Menu',

    alias: 'widget.colormenu',

    requires: [
        'Ext.picker.Color'
    ],

    /**
     * @cfg {Boolean} hideOnClick
     * False to continue showing the menu after a color is selected.
     */
    hideOnClick: true,

    /**
     * @cfg {String} pickerId
     * An id to assign to the underlying color picker.
     */
    pickerId: null,

    /**
     * @cfg {Number} maxHeight
     * @private
     */

    /**
     * @property {Ext.picker.Color} picker
     * The {@link Ext.picker.Color} instance for this ColorMenu
     */

    /**
     * @event click
     * @private
     */

    initComponent: function () {
        var me = this,
            cfg = Ext.apply({}, me.initialConfig);

        // Ensure we don't get duplicate listeners
        delete cfg.listeners;
        Ext.apply(me, {
            plain: true,
            showSeparator: false,
            items: Ext.applyIf({
                cls: Ext.baseCSSPrefix + 'menu-color-item',
                id: me.pickerId,
                xtype: 'colorpicker'
            }, cfg)
        });

        me.callParent(arguments);

        me.picker = me.down('colorpicker');

        /**
         * @event select
         * @inheritdoc Ext.picker.Color#select
         */
        me.relayEvents(me.picker, ['select']);

        if (me.hideOnClick) {
            me.on('select', me.hidePickerOnSelect, me);
        }
    },

    /**
     * Hides picker on select if hideOnClick is true
     * @private
     */
    hidePickerOnSelect: function () {
        Ext.menu.Manager.hideAll();
    }
});

Ext.define('Ext.ux.ColorField', {
    extend: 'Ext.form.TriggerField',
    triggerConfig: {
        src: Ext.BLANK_IMAGE_URL,
        tag: "img",
        cls: "x-form-trigger x-form-color-trigger"
    },
    invalidText: "Colors must be in a the hex format #FFFFFF.",
    regex: /^\#[0-9A-F]{6}$/i,
    allowBlank: false,
    initComponent: function () {
        this.callParent()
        this.addEvents('select');
        this.on('change', function (c, v) {
            this.onSelect(c, v);
        }, this);
    },


    // private
    onDestroy: function () {
        Ext.destroy(this.menu);
        this.callParent()
        //        Ext.ux.ColorField.superclass.onDestroy.call(this);
    },


    // private
    afterRender: function () {
        //Ext.ux.ColorField.superclass.afterRender.call(this);
        this.callParent(arguments)
        this.inputEl.setStyle('background', this.value);
        this.detectFontColor();
    },


    /**
     * @method onTriggerClick
     * @hide
     */
    // private
    onTriggerClick: function (e) {
        if (this.disabled) {
            return;
        }


        this.menu = new Ext.ux.ColorPicker({
            shadow: true,
            autoShow: true,
            hideOnClick: false,
            value: this.value,
            fallback: this.fallback
        });
        this.menu.alignTo(this.inputEl, 'tl-bl?');
        this.menuEvents('on');
        this.menu.show(this.inputEl);
    },


    //private
    menuEvents: function (method) {
        this.menu[method]('select', this.onSelect, this);
        this.menu[method]('hide', this.onMenuHide, this);
        this.menu[method]('show', this.onFocus, this);
    },


    onSelect: function (m, d) {
        d = Ext.isString(d) && d.substr(0, 1) != '#' ? '#' + d : d;
        this.setValue(d);
        this.fireEvent('select', this, d);
        if (this.inputEl) {
            this.inputEl.setStyle('background', d);
            this.detectFontColor();
        }
    },


    // private
    // Detects whether the font color should be white or black, according to the
    // current color of the background
    detectFontColor: function () {
        if (!this.menu || !this.menu.picker.rawValue) {
            if (!this.value) value = 'FFFFFF';
            else {
                var h2d = function (d) {
                    return parseInt(d, 16);
                }
                var value = [
                    h2d(this.value.slice(1, 3)),
                    h2d(this.value.slice(3, 5)),
                    h2d(this.value.slice(5))
                ];
            }
        } else var value = this.menu.picker.rawValue;
        var avg = (value[0] + value[1] + value[2]) / 3;
        this.inputEl.setStyle('color', (avg > 128) ? '#000' : '#FFF');
    },


    onMenuHide: function () {
        this.focus(false, 60);
        this.menuEvents('un');
    }


});

Ext.define('Ext.ux.CanvasPalette', {
    alias: 'widget.canvaspalette',
    extend: 'Ext.Component',
    itemCls: 'x-color-picker',
    defaultValue: "#0000FF",
    width: 200,
    height: 200,
    initComponent: function () {
        this.callParent()
        this.addEvents(
            /**
             * @event select
             * Fires when a color is selected
             * @param {ColorPalette} this
             * @param {String} color The 6-digit color hex code (without the # symbol)
             */
            'select');


        if (!this.value) this.value = this.defaultValue;
    },
    getValue: function () {
        return this.value;
    },


    setValue: function (v) {
        this.value = v;
    },
    onRender: function (container, position) {
        var el = document.createElement("div");
        el.className = this.itemCls;
        container.dom.insertBefore(el, null);
        Ext.get(el).setWidth(this.width);
        this.canvasdiv = Ext.get(el).createChild({
            tag: 'div'
        });
        this.wheel = this.canvasdiv.dom.appendChild(document.createElement("canvas"));
        this.wheel.setAttribute('width', '200');
        this.wheel.setAttribute('height', '200');
        this.wheel.setAttribute('class', 'x-color-picker-wheel');


        /* Draw the wheel image onto the container */
        this.wheel.getContext('2d').drawImage(this.wheelImage, 0, 0);
        this.drawGradient();


        Ext.get(this.wheel).on('click', this.select, this);
        this.callParent();
    },


    // private
    afterRender: function () {
        var me = this;
        me.callParent();
        var t = new Ext.dd.DragDrop(me.wheel)
        t.onDrag = function (e, t) {
            me.select(e, this.DDMInstance.currentTarget);
        };
    },


    select: function (e, t) {
        var context = this.wheel.getContext('2d');
        var coords = [
            e.getX() - Ext.get(t).getLeft(),
            e.getY() - Ext.get(t).getTop()
        ];


        try {
            var data = context.getImageData(coords[0], coords[1], 1, 1);
        } catch (e) {
            return;
        } // The user selected an area outside the <canvas>
        // Disallow selecting transparent regions
        var toHex = function () {
            this.color = new Ext.draw.Color(this.rawValue[0], this.rawValue[1], this.rawValue[2])
            this.value = this.color.toString();
        };
        if (data.data[3] == 0) {
            var context = this.gradient.getContext('2d');
            var data = context.getImageData(coords[0], coords[1], 1, 1);
            if (data.data[3] == 0) return;
            this.rawValue = data.data;
            toHex.call(this);
            this.fireEvent('select', this, this.value);
        } else {
            this.rawValue = data.data;
            toHex.call(this)
            this.drawGradient();
            this.fireEvent('select', this, this.value);
        }
    },


    // private
    drawGradient: function () {
        if (!this.gradient) {
            this.gradient = this.canvasdiv.dom.appendChild(document.createElement("canvas"));
            this.gradient.setAttribute('width', '200');
            this.gradient.setAttribute('height', '200');
            this.gradient.setAttribute('class', 'x-color-picker-gradient');
            if (typeof G_vmlCanvasManager != 'undefined') this.gradient = G_vmlCanvasManager.initElement(this.gradient);
            Ext.get(this.gradient).on('click', this.select, this);
        }
        var context = this.gradient.getContext('2d');
        var center = [97.5, 98];


        // Clear the canvas first
        context.clearRect(0, 0, this.gradient.width, this.gradient.height)


        context.beginPath();
        context.fillStyle = this.value;
        context.strokeStyle = this.value;
        context.arc(center[0], center[0], 65, 0, 2 * Math.PI, false);
        context.closePath();
        context.fill();


        /* Draw the wheel image onto the container */
        this.gradient.getContext('2d').drawImage(this.gradientImage, 33, 32);


    }


}, function () { /* Preload the picker images so they're available at render time */
    var p = this.prototype;
    p.wheelImage = (function () {
        var wheelImage = new Image();
        wheelImage.onload = Ext.emptyFn;
        wheelImage.src = '/geoviewer/stili/default/icons/wheel.png';
        return wheelImage;
    })();
    p.gradientImage = (function () {
        var gradientImage = new Image();
        gradientImage.onload = Ext.emptyFn;
        gradientImage.src = '/geoviewer/stili/default/icons/gradient.png';
        return gradientImage;
    })();
});

Ext.define('Ext.ux.ColorPicker', {
    extend: 'Ext.menu.ColorPicker',
    initComponent: function () {
        var me = this;
        if (!Ext.supports.Canvas || me.fallback == true) {
            me.height = 100;
            me.hideOnClick = true;
            me.callParent();
            return me.processEvent();
        }
        cfg = Ext.apply({}, me.canvasCfg);


        // Ensure we don't get duplicate listeners
        delete cfg.listeners;
        Ext.apply(me, {
            plain: true,
            showSeparator: false,
            items: Ext.applyIf({
                cls: Ext.baseCSSPrefix + 'menu-color-item',
                id: me.pickerId,
                value: me.value,
                xtype: 'canvaspalette'
            }, cfg)
        });


        Ext.menu.ColorPicker.superclass.initComponent.call(me)


        me.picker = me.down('canvaspalette');
        me.processEvent()


    },
    processEvent: function () {
        var me = this;
        me.picker.clearListeners();
        me.relayEvents(me.picker, ['select']);


        if (me.hideOnClick) {
            me.on('select', me.hidePickerOnSelect, me);
        }
    }
});

// --------------------------------

Ext.define('CWN2.button.GeoStyler', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-geostyler',

    constructor: function (config) {
        var btnOptions = config.options;

        this.config = config;
        this.superclass.constructor.call(this, {
            id: "geostyler",
            tooltip: CWN2.I18n.get("GeoStyler"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "styler",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false
        });
    }
});

Ext.define('CWN2.button.GeoStyler.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-btn-geostyler-win',
    closeAction: 'hide',
    title: CWN2.I18n.get("Stili"),
    height: 700,
    width: 500,
    layout: "fit",
    resizable: false,

    constructor: function (config) {
        var me = this;

        this.items = [

            {
                xtype: 'cwn2-btn-geostyler-panel',
                layersConfig: config.layersConfig
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-panel',
    height: "auto",
    width: "auto",
    frame: true,
    buttons: [
        {
            text: CWN2.I18n.get("Salva"),
            action: "geostyler-submit"
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: "geostyler-cancel"
        }
    ],
    autoScroll: true,
    constructor: function (config) {
        this.items = [
            {
                xtype: 'cwn2-btn-geostyler-layer-combo',
                layersConfig: config.layersConfig
            },
            {
                xtype: 'cwn2-btn-geostyler-rule-fieldset',
                layer: config.layersConfig[0]
            },
            {
                xtype: 'cwn2-btn-geostyler-tab-panel',
                rule: config.layersConfig[0].sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[0],
                labelRule: config.layersConfig[0].labelRule,
                columns: config.layersConfig[0].columns,
                geomType: config.layersConfig[0].geomType
            }

        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LayerCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-layer-combo",
    fieldLabel: 'Layer',
    labelWidth: 40,
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    value: "Scegli un livello...",
    valueField: "name",
    displayField: "label",
    width: 300,
    constructor: function (config) {
        Ext.define('GeostylerLayers', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'name', type: 'string'},
                {name: 'label', type: 'string'},
                {name: 'geomType', type: 'string'},
                {name: 'legendUrl', type: 'string'},
                {name: 'labelRule'},
                {name: 'columns'},
                {name: 'sld'}
            ]
        });
        this.store = Ext.create('Ext.data.Store', {
            model: 'GeostylerLayers',
            data: {"layers": config.layersConfig},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'layers'
                }
            }
        });
        this.superclass.constructor.call(this);
        this.setValue(this.getStore().getAt(0).data.name);
    }
});

Ext.define('CWN2.button.GeoStyler.RuleCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-rule-combo",
    fieldLabel: 'Rule',
    labelWidth: 40,
    queryMode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    width: 300,
    valueField: "Name",
    displayField: "Title",
    constructor: function (config) {
        var rules = [];
        Ext.each(config.layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule, function (rule) {
            if (rule.name !== "LABEL") {

                rules.push({
                    "Name": rule.Name,
                    "Title": rule.Title,
                    "legendUrl": config.layer.legendUrl + "&RULE=" + rule.Name,
                    "MinScaleDenominator": parseFloat(rule.MinScaleDenominator),
                    "MaxScaleDenominator": parseFloat(rule.MaxScaleDenominator),
                    "Filter": rule.Filter,
                    "PointSymbolizer": rule.PointSymbolizer,
                    "LineSymbolizer": rule.LineSymbolizer,
                    "PolygonSymbolizer": rule.PolygonSymbolizer
                });
            }
        });


        Ext.define('GeostylerRules', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'Name', type: 'string'},
                {name: 'Title', type: 'string'},
                {name: 'legendUrl', type: 'string'},
                {name: 'MinScaleDenominator'},
                {name: 'MaxScaleDenominator'},
                {name: 'Filter'},
                {name: 'PointSymbolizer'},
                {name: 'LineSymbolizer'},
                {name: 'PolygonSymbolizer'}
            ]
        });
        this.store = Ext.create('Ext.data.Store', {
            model: 'GeostylerRules',
            data: {"rules": rules},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'rules'
                }
            }
        });

        this.superclass.constructor.call(this);
        this.setValue(this.getStore().getAt(0).data.Name);
    }
});


Ext.define('CWN2.button.GeoStyler.RuleFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: "widget.cwn2-btn-geostyler-rule-fieldset",
    title: ' ',
    border: false,
    layout: 'vbox',
    padding: '0',
    constructor: function (config) {
        this.items = [
            {
                xtype: 'fieldset',
                border: false,
                flex: 1,
                width: 350,
                layout: 'hbox',
                padding: '0',
                items: [
                    {
                        xtype: 'cwn2-btn-geostyler-rule-combo',
                        layer: config.layer
                    },
                    {
                        xtype: 'tbfill'
                    },
                    {
                        xtype: 'cwn2-btn-geostyler-rule-legend',
                        legendUrl: config.layer.legendUrl + "&RULE=" + config.layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[0].Name
                    }
                ]

            }, {
                xtype: 'fieldset',
                border: false,
                flex: 1,
                width: 350,
                layout: 'hbox',
                padding: '0',
                items: [
                    {
                        xtype: 'cwn2-btn-geostyler-add-rule'
                    },
                    {
                        xtype: 'tbfill'
                    },
                    {
                        xtype: 'cwn2-btn-geostyler-delete-rule'
                    },
                    {
                        xtype: 'tbfill'
                    },

                    {
                        xtype: 'cwn2-btn-geostyler-change-rule-order'
                    },
                    {
                        xtype: 'tbfill'
                    },
                    {
                        xtype: 'cwn2-btn-geostyler-generate-rules'
                    }

                ]
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.AddRule', {
    extend: 'Ext.button.Button',
    alias: "widget.cwn2-btn-geostyler-add-rule",
    text: 'Add Rule',
    constructor: function (config) {
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.DeleteRule', {
    extend: 'Ext.button.Button',
    alias: "widget.cwn2-btn-geostyler-delete-rule",
    text: 'Delete Rule',
    constructor: function (config) {
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.ChangeRuleOrder', {
    extend: 'Ext.button.Button',
    alias: "widget.cwn2-btn-geostyler-change-rule-order",
    text: 'Cambia Ordine',
    constructor: function (config) {
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.ChangeRuleOrder.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-btn-geostyler-change-rule-order-window',
    closeAction: 'destroy',
    title: CWN2.I18n.get("Cambia Ordine"),
    height: 500,
    width: 400,
    layout: "fit",
    resizable: false,

    constructor: function (config) {
        var me = this;

        var data = [];
        Ext.each(config.rules, function (rule, index) {
            if (rule.Name !== "LABEL") {
                data.push(rule);
            }
        });
        this.items = [
            {
                xtype: 'cwn2-btn-geostyler-change-rule-order-panel',
                rules: config.rules
            }
        ];

        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.ChangeRuleOrder.Panel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cwn2-btn-geostyler-change-rule-order-panel',
    hideHeaders: true,
    selModel: {
        mode: 'MULTI'
    },
    viewConfig: {
        plugins: {
            ptype: 'gridviewdragdrop'
        }
    },
    columns: [
        {
            dataIndex: "Title",
            width: 380
        }
    ],
    width: 380,
    height: 150,
    buttons: [
        {
            text: CWN2.I18n.get("Salva"),
            action: "change-rule-order-submit"
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: "change-rule-order-cancel"
        }
    ],
    constructor: function (config) {

        var data = [];
        Ext.each(config.rules, function (rule, index) {
            if (rule.Name !== "LABEL") {
                data.push(rule);
            }
        });

        this.store = Ext.create('Ext.data.Store', {
            fields: [
                {
                    name: "Name", mapping: "Name"
                },
                {
                    name: "Title", mapping: "Title"
                }
            ],
            data: data
        })

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.GenerateRules', {
    extend: 'Ext.button.Button',
    alias: "widget.cwn2-btn-geostyler-generate-rules",
    text: 'Genera Rules',
    constructor: function (config) {
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.GenerateRules.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-btn-geostyler-generate-rules-window',
    closeAction: 'destroy',
    title: CWN2.I18n.get("Genera Classificazione"),
    height: 500,
    width: 400,
    layout: "fit",
    resizable: false,

    constructor: function (config) {
        var me = this;

        this.items = [
            {
                xtype: 'cwn2-btn-geostyler-generate-rules-order-panel',
                columns: config.columns
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.GenerateRules.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-generate-rules-order-panel',
    frame: true,
    labelWidth: 1,
    bodyStyle: "padding:5px 5px 0",
    height: 215,
    buttons: [
        {
            text: CWN2.I18n.get("Salva"),
            action: "change-generate-rules-submit"
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: "change-rule-order-cancel"
        }
    ],

    constructor: function (config) {
        var me = this;

        this.items = [
            {
                xtype: 'cwn2-btn-geostyler-generate-rules-columns-combo',
                columns: config.columns
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.GenerateRules.ColumnCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-generate-rules-columns-combo",
    fieldLabel: 'Campo',
    labelWidth: 40,
    queryMode: 'local',
    store: [],
    typeAhead: true,
    triggerAction: 'all',
    width: 300,
    previousValue: null,
    constructor: function (config) {
        var columns = [];
        Ext.each(config.columns, function (column) {
            if (column.type === "VARCHAR2") {
                columns.push(column.name);
            }
        });
        this.store = columns;
        this.superclass.constructor.call(this);
    }
});



Ext.define('CWN2.button.GeoStyler.TabPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.cwn2-btn-geostyler-tab-panel',
    activeTab: 0,
    bodyBorder: false,
    deferredRender: false,
    layoutOnTabChange: true,
    border: false,
    flex: 1,
    plain: true,
    items: [],
    constructor: function (config) {
        var me = this;
        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-symbol-tab',
                rule: config.rule,
                geomType: config.geomType
            },
            {
                xtype: 'cwn2-btn-geostyler-advanced-tab',
                rule: config.rule
            },
            {
                xtype: 'cwn2-btn-geostyler-label-tab',
                labelRule: config.labelRule,
                columns: config.columns,
                geomType: config.geomType
            }
        ];

        this.superclass.constructor.call(this);
        this.setActiveTab(config.activeTab);
    }
});


Ext.define('CWN2.button.GeoStyler.LabelTab', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-tab',
    frame: false,
    title: "Label",
    labelWidth: 1,
    //height: 250,
    items: [],
    constructor: function (config) {
        var me = this;

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-label-panel",
                labelRule: config.labelRule,
                columns: config.columns,
                geomType: config.geomType
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LabelPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-panel',
    frame: true,
    //height: 250,
    title: "",
    items: [],
    constructor: function (config) {
        var me = this;

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-label-columns-combo",
                columns: config.columns,
                labelRule: config.labelRule
            },
            {
                xtype: "cwn2-btn-geostyler-label-font-panel",
                labelRule: config.labelRule
            },
            {
                xtype: "cwn2-btn-geostyler-label-placement-panel",
                labelRule: config.labelRule,
                geomType: config.geomType
            }
        ];


        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LabelColumnsCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-label-columns-combo",
    fieldLabel: 'Campo',
    labelWidth: 40,
    queryMode: 'local',
    store: [],
    typeAhead: true,
    triggerAction: 'all',
    width: 400,
    previousValue: null,
    listeners: {
        select: function (comp, record, index) {
            if (comp.getValue() == "" || comp.getValue() == "&nbsp;")
                comp.setValue(null);
        }
    },
    constructor: function (config) {
        var columns = [];
        Ext.each(config.columns, function (column) {
            columns.push(column.name);
        });
        this.store = columns;
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.Label && config.labelRule.TextSymbolizer.Label.PropertyName) {
            this.setValue(config.labelRule.TextSymbolizer.Label.PropertyName);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFontPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-font-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            labelRule = config.labelRule,
            fontFamily = null,
            fontSize = null,
            fontStyle = null,
            fontWeight = null,
            haloColor = null,
            haloRadius = null,
            minScale = null,
            maxScale = null,
            color = null;

        if (labelRule && labelRule.TextSymbolizer) {
            fontFamily = getCssParameter(labelRule.TextSymbolizer.Font, "font-family");
            fontSize = getCssParameter(labelRule.TextSymbolizer.Font, "font-size");
            fontStyle = getCssParameter(labelRule.TextSymbolizer.Font, "font-style");
            fontWeight = getCssParameter(labelRule.TextSymbolizer.Font, "font-weight");
            color = getCssParameter(labelRule.TextSymbolizer.Fill, "fill");
            minScale = parseFloat(labelRule.MinScaleDenominator);
            maxScale = parseFloat(labelRule.MaxScaleDenominator);
            haloColor = (labelRule.TextSymbolizer.Halo) ? getCssParameter(labelRule.TextSymbolizer.Halo.Fill, "fill") : null;
            haloRadius = (labelRule.TextSymbolizer.Halo) ? labelRule.TextSymbolizer.Halo.Radius: null;
        }

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-label-font-family-combo',
                fontFamily: fontFamily
            },
            {
                xtype: 'cwn2-btn-geostyler-label-font-size',
                fontSize: fontSize
            },
            {
                xtype: 'cwn2-btn-geostyler-label-font-style-combo',
                fontStyle: fontStyle
            },
            {
                xtype: 'cwn2-btn-geostyler-label-font-weight-combo',
                fontWeight: fontWeight
            },
            {
                xtype: 'cwn2-btn-geostyler-label-fill-color-field',
                color: color
            },
            {
                xtype: 'cwn2-btn-geostyler-label-halo-radius',
                haloRadius: haloRadius
            },
            {
                xtype: 'cwn2-btn-geostyler-label-halo-color-field',
                haloColor: haloColor
            },
            {
                xtype: "cwn2-btn-geostyler-label-min-scale",
                minScale: minScale
            },
            {
                xtype: "cwn2-btn-geostyler-label-max-scale",
                maxScale: maxScale
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LabelPlacementPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-placement-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this;

        //if (config.geomType === "LINE") {
        //    me.items = [
        //        {
        //            xtype: "cwn2-btn-geostyler-label-point-placement-panel",
        //            labelRule: config.labelRule
        //        },
        //        {
        //            xtype: "cwn2-btn-geostyler-label-line-placement-panel",
        //            labelRule: config.labelRule
        //        }
        //    ]
        //} else {
        me.items = [
            {
                xtype: "cwn2-btn-geostyler-label-point-placement-panel",
                labelRule: config.labelRule
            }
        ]
        //}

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LabelLinePlacementPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-line-placement-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this;
        me.items = [
            {
                xtype: "cwn2-btn-geostyler-label-line-perpendicular-offset",
                labelRule: config.labelRule
            }
        ]
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.LabelPerpendicularOffset', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-line-perpendicular-offset",
    fieldLabel: 'Line Offset',
    labelWidth: 80,
    minValue: 1,
    width: 130,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.LabelPlacement && config.labelRule.TextSymbolizer.LabelPlacement.LinePlacement && config.labelRule.TextSymbolizer.LabelPlacement.LinePlacement.PerpendicularOffset) {
            this.setValue(config.labelRule.TextSymbolizer.LabelPlacement.LinePlacement.PerpendicularOffset);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelPointPlacementPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-label-point-placement-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this;
        me.items = [
            {
                xtype: "cwn2-btn-geostyler-label-anchor-x",
                labelRule: config.labelRule
            },
            {
                xtype: "cwn2-btn-geostyler-label-anchor-y",
                labelRule: config.labelRule
            },
            {
                xtype: "cwn2-btn-geostyler-label-displacement-x",
                labelRule: config.labelRule
            },
            {
                xtype: "cwn2-btn-geostyler-label-displacement-y",
                labelRule: config.labelRule
            }
        ];
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFontSize', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-font-size",
    fieldLabel: 'Size',
    labelWidth: 40,
    minValue: 1,
    width: 100,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.fontSize)) {
            this.setValue(parseInt(config.fontSize));
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFontFamilyCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-label-font-family-combo",
    fieldLabel: 'Font',
    labelWidth: 40,
    queryMode: 'local',
    store: [],
    typeAhead: true,
    triggerAction: 'all',
    width: 250,
    previousValue: null,
    constructor: function (config) {
        this.store = GeoStyler.app.geoServerFontList;
        this.superclass.constructor.call(this);
        if (config.fontFamily) {
            this.setValue(config.fontFamily);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFontStyleCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-label-font-style-combo",
    fieldLabel: 'Stile',
    labelWidth: 40,
    queryMode: 'local',
    store: ["normal", "italic", "oblique"],
    typeAhead: true,
    triggerAction: 'all',
    value: "normal",
    width: 150,
    previousValue: null,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.fontStyle) {
            this.setValue(config.fontStyle);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFontWeightCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-label-font-weight-combo",
    fieldLabel: 'Peso',
    labelWidth: 40,
    queryMode: 'local',
    store: ["normal", "bold"],
    typeAhead: true,
    triggerAction: 'all',
    value: "normal",
    width: 150,
    previousValue: null,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.fontWeight) {
            this.setValue(config.fontWeight);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelFillColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-label-fill-color-field",
    fieldLabel: 'Color',
    labelWidth: 40,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.color) {
            this.setValue(config.color);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelHaloColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-label-halo-color-field",
    fieldLabel: 'Halo Color',
    labelWidth: 60,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.haloColor) {
            this.setValue(config.haloColor);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelHaloRadius', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-halo-radius",
    fieldLabel: 'Halo',
    labelWidth: 60,
    minValue: 0,
    width: 120,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.haloRadius)) {
            this.setValue(parseInt(config.haloRadius));
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelMinScaleDenominator', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-min-scale",
    fieldLabel: 'Denom. Scala Min.',
    labelWidth: 120,
    minValue: 1,
    width: 300,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.minScale)) {
            this.setValue(config.minScale);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelMaxScaleDenominator', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-max-scale",
    fieldLabel: 'Denom. Scala Max.',
    labelWidth: 120,
    minValue: 1,
    width: 300,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.maxScale)) {
            this.setValue(config.maxScale);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelAnchorX', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-anchor-x",
    fieldLabel: 'Anchor X',
    labelWidth: 60,
    minValue: 0,
    maxValue: 1,
    width: 110,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.LabelPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint) {
            this.setValue(config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint.AnchorPointX);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelAnchorY', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-anchor-y",
    fieldLabel: 'Anchor Y',
    labelWidth: 60,
    minValue: 0,
    maxValue: 1,
    width: 110,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.LabelPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint) {
            this.setValue(config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint.AnchorPointY);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelDisplacementX', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-displacement-x",
    fieldLabel: 'Displacement X',
    labelWidth: 90,
    minValue: 0,
    maxValue: 100,
    width: 140,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.LabelPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement) {
            this.setValue(config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement.DisplacementX);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.LabelDisplacementY', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-label-displacement-y",
    fieldLabel: 'Displacement Y',
    labelWidth: 90,
    minValue: 0,
    maxValue: 100,
    width: 140,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.labelRule && config.labelRule.TextSymbolizer && config.labelRule.TextSymbolizer.LabelPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement && config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement) {
            this.setValue(config.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement.DisplacementY);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.AdvancedTab', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-advanced-tab',
    frame: false,
    title: "Avanzate",
    labelWidth: 1,
    //height: 250,
    items: [],
    constructor: function (config) {
        var me = this;


        me.items = [
            {
                xtype: "cwn2-btn-geostyler-advanced-panel",
                rule: config.rule
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.AdvancedPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-advanced-panel',
    frame: true,
    //height: 250,
    title: "",
    items: [],
    buttons: [
        {
            text: CWN2.I18n.get("Validazione"),
            action: "geostyler-validate-cql"
        }
    ],
    constructor: function (config) {
        var me = this;


        me.items = [
            {
                xtype: "cwn2-btn-geostyler-rule-title",
                rule: config.rule
            },
            {
                xtype: "cwn2-btn-geostyler-min-scale",
                rule: config.rule
            },
            {
                xtype: "cwn2-btn-geostyler-max-scale",
                rule: config.rule
            },
            {
                xtype: "cwn2-btn-geostyler-cql-filter",
                rule: config.rule
            }

        ];

        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.GeoStyler.RuleTitle', {
    extend: 'Ext.form.field.Text',
    alias: "widget.cwn2-btn-geostyler-rule-title",
    fieldLabel: 'Titolo',
    labelWidth: 70,
    width: 300,
    value: "Classe Base",
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.rule.Title)) {
            this.setValue(config.rule.Title);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.MinScaleDenominator', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-min-scale",
    fieldLabel: 'Denom. Scala Min.',
    labelWidth: 120,
    minValue: 1,
    width: 300,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.rule.MinScaleDenominator)) {
            this.setValue(config.rule.MinScaleDenominator);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.MaxScaleDenominator', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-max-scale",
    fieldLabel: 'Denom. Scala Max.',
    labelWidth: 120,
    minValue: 1,
    width: 300,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.rule.MaxScaleDenominator)) {
            this.setValue(config.rule.MaxScaleDenominator);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.CQLFilter', {
    extend: 'Ext.form.field.TextArea',
    alias: "widget.cwn2-btn-geostyler-cql-filter",
    fieldLabel: 'Filtro',
    labelWidth: 50,
    width: 450,
    rows: 10,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.rule.Filter)) {
            var cqlFilter = CWN2.Util.transformFilterJson2CQL(config.rule.Filter);
            this.setValue(cqlFilter);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.SymbolTab', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-symbol-tab',
    frame: false,
    title: "Simbologia",
    labelWidth: 1,
    //height: 250,
    items: [],
    constructor: function (config) {
        var me = this,
            geomType = config.geomType,
            xType = null;

        switch (geomType) {
            case "POLYGON":
                xType = 'cwn2-btn-geostyler-polygon-panel'
                break;
            case "LINE":
                xType = 'cwn2-btn-geostyler-line-panel'
                break;
            case "POINT":
                xType = 'cwn2-btn-geostyler-point-panel'
                break;
        }

        me.items = [
            {
                xtype: xType,
                rule: config.rule
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.PointPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-point-panel',
    frame: true,
    //height: 250,
    title: "POINT",
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            pointType,
            pointTab;

        if (!rule.PointSymbolizer) {
            console.log("Manca elemento <PointSymbolizer>")
            return;
        }
        if (!rule.PointSymbolizer.Graphic) {
            console.log("Manca elemento <Graphic>")
            return;
        }
        if (rule.PointSymbolizer.Graphic.ExternalGraphic) {
            pointType = "Graphic";
            pointTab = {xtype: "cwn2-btn-geostyler-graphic-point-panel", rule: rule};
        }

        if (rule.PointSymbolizer.Graphic.Mark) {
            pointType = "WKN";
            pointTab = {xtype: "cwn2-btn-geostyler-wkn-point-panel", rule: rule};
        }

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-point-type-combo",
                rule: rule,
                pointType: pointType
            },
            pointTab
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.GraphicPointPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-graphic-point-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            graphic = config.rule.PointSymbolizer.Graphic;

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-external-graphic-url',
                externalGraphic: graphic.ExternalGraphic.OnlineResource["_xlink:href"]
            },
            {
                xtype: 'cwn2-btn-geostyler-graphic-format-combo',
                graphicFormat: graphic.ExternalGraphic.Format
            },
            {
                xtype: 'cwn2-btn-geostyler-symbol-size',
                size: graphic.Size
            },
            {
                xtype: 'cwn2-btn-geostyler-external-graphic-img',
                externalGraphic: graphic.ExternalGraphic.OnlineResource["_xlink:href"],
                size: graphic.Size
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.WknPointPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-wkn-point-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            mark = config.rule.PointSymbolizer.Graphic.Mark;

        setDefaultMark(mark, "POINT");

        var fillColor = getCssParameter(mark.Fill, "fill");
        var fillOpacity = getCssParameter(mark.Fill, "fill-opacity") || "1";
        var strokeColor = getCssParameter(mark.Stroke, "stroke");
        var strokeWidth = getCssParameter(mark.Stroke, "stroke-width");
        var strokeOpacity = getCssParameter(mark.Stroke, "stroke-opacity");

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-symbol-combo',
                symbol: mark.WellKnownName
            },
            {
                xtype: 'cwn2-btn-geostyler-symbol-size',
                size: config.rule.PointSymbolizer.Graphic.Size
            },
            {
                xtype: 'cwn2-btn-geostyler-fill-color-field',
                color: fillColor
            },
            {
                xtype: 'cwn2-btn-geostyler-fill-opacity-slider',
                opacity: fillOpacity
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-color-field',
                color: strokeColor
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-width',
                width: strokeWidth
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-opacity-slider',
                opacity: strokeOpacity
            }
        ];
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.LinePanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-line-panel',
    frame: false,
    //height: 250,
    title: "LINE",
    items: [],
    constructor: function (config) {
        var me = this;

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-stroke-panel",
                rule: config.rule
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.PolygonPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-polygon-panel',
    frame: false,
    //height: 250,
    title: "POLYGON",
    items: [],
    constructor: function (config) {
        var me = this;

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-stroke-panel",
                rule: config.rule
            },
            {
                xtype: "cwn2-btn-geostyler-polygon-fill-panel",
                rule: config.rule
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.PolygonFillPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-polygon-fill-panel',
    frame: true,
    //height: 250,
//    title: "Fill",
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.PolygonSymbolizer;

        var fillType,
            fillTab = null;

        if (!symbolizer.Fill) {
            fillType = "None";
            fillTab = null;
        } else {
            if (!symbolizer.Fill.GraphicFill) {
                fillType = "Simple";
                fillTab = {xtype: "cwn2-btn-geostyler-simple-fill-panel", rule: rule};
            } else {
                if (symbolizer.Fill.GraphicFill.Graphic.ExternalGraphic) {
                    fillType = "Graphic";
                    fillTab = {xtype: "cwn2-btn-geostyler-graphic-fill-panel", rule: rule};
                }
                if (symbolizer.Fill.GraphicFill.Graphic.Mark) {
                    fillType = "Hatch";
                    fillTab = {xtype: "cwn2-btn-geostyler-hatch-fill-panel", rule: rule};
                }
            }
        }

        me.items = [
            {
                xtype: "cwn2-btn-geostyler-fill-type-combo",
                rule: rule,
                fillType: fillType
            },
            fillTab
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.SimpleFillPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-simple-fill-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.PolygonSymbolizer;


        var fillColor = getCssParameter(symbolizer.Fill, "fill");
        var fillOpacity = getCssParameter(symbolizer.Fill, "fill-opacity") || "1";

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-fill-color-field',
                color: fillColor
            },
            {
                xtype: 'cwn2-btn-geostyler-fill-opacity-slider',
                opacity: fillOpacity
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.HatchFillPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-hatch-fill-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.PolygonSymbolizer,
            graphic = symbolizer.Fill.GraphicFill.Graphic;

        setDefaultMark(graphic.Mark, "POLYGON");

        var graphicName = graphic.Mark.WellKnownName;
        var symbolSize = graphic.Size;
        var fillColor = getCssParameter(graphic.Mark.Fill, "fill");
        var fillOpacity = getCssParameter(graphic.Mark.Fill, "fill-opacity") || "1";
        var strokeColor = getCssParameter(graphic.Mark.Stroke, "stroke");
        var strokeWidth = getCssParameter(graphic.Mark.Stroke, "stroke-width");
        var strokeOpacity = getCssParameter(graphic.Mark.Stroke, "stroke-opacity");
        var strokeDasharray = getCssParameter(symbolizer.Stroke, "stroke-dasharray");

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-hatch-combo',
                symbol: graphicName
            },
            {
                xtype: 'cwn2-btn-geostyler-symbol-size',
                size: symbolSize
            },
            {
                xtype: 'cwn2-btn-geostyler-hatch-stroke-color-field',
                color: strokeColor
            },
            {
                xtype: 'cwn2-btn-geostyler-hatch-stroke-width',
                width: strokeWidth
            },
            {
                xtype: 'cwn2-btn-geostyler-hatch-stroke-opacity-slider',
                opacity: strokeOpacity
            },
            {
                xtype: 'cwn2-btn-geostyler-hatch-fill-color-field',
                color: fillColor
            },
            {
                xtype: 'cwn2-btn-geostyler-hatch-fill-opacity-slider',
                opacity: fillOpacity
            }

        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.GraphicFillPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-graphic-fill-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            graphic = rule.PolygonSymbolizer.Fill.GraphicFill.Graphic;

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-external-graphic-url',
                externalGraphic: graphic.ExternalGraphic.OnlineResource["_xlink:href"]
            },
            {
                xtype: 'cwn2-btn-geostyler-graphic-format-combo',
                graphicFormat: graphic.ExternalGraphic.Format
            },
            {
                xtype: 'cwn2-btn-geostyler-symbol-size',
                size: graphic.Size
            }, {
                xtype: 'cwn2-btn-geostyler-external-graphic-img',
                externalGraphic: graphic.ExternalGraphic.OnlineResource["_xlink:href"],
                size: graphic.Size
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.StrokePanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-stroke-panel',
    frame: true,
    //height: 200,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.LineSymbolizer || rule.PolygonSymbolizer;

        var strokeType,
            strokeTab = null;

        if (symbolizer.Stroke || symbolizer.Stroke === "") {
            if (symbolizer.Stroke.GraphicStroke) {
                strokeType = "WKN";
                strokeTab = {xtype: "cwn2-btn-geostyler-wkn-stroke-panel", rule: rule};
            } else {
                strokeType = "Simple";
                strokeTab = {xtype: "cwn2-btn-geostyler-simple-stroke-panel", rule: rule};
            }
        } else {
            strokeType = "None";
            strokeTab = null;
        }


        me.items = [
            {
                xtype: "cwn2-btn-geostyler-stroke-type-combo",
                strokeType: strokeType,
                rule: rule
            },
            strokeTab
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.SimpleStrokePanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-simple-stroke-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.LineSymbolizer || rule.PolygonSymbolizer;

        if (symbolizer.Stroke === "") {
            symbolizer.Stroke = {
                "CssParameter": [
                    {
                        "_name": "stroke",
                        "__text": "#000000"
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "1"
                    }
                ]
            }
        }
        var strokeColor = getCssParameter(symbolizer.Stroke, "stroke") || "#000000";
        var strokeWidth = getCssParameter(symbolizer.Stroke, "stroke-width");
        var strokeOpacity = getCssParameter(symbolizer.Stroke, "stroke-opacity");
        var strokeDasharray = getCssParameter(symbolizer.Stroke, "stroke-dasharray");

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-stroke-color-field',
                color: strokeColor
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-width',
                width: strokeWidth
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-opacity-slider',
                opacity: strokeOpacity
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-dasharray',
                strokeDashstyle: strokeDasharray
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.WknStrokePanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-geostyler-wkn-stroke-panel',
    frame: true,
    //height: 60,
    items: [],
    constructor: function (config) {
        var me = this,
            rule = config.rule,
            symbolizer = rule.LineSymbolizer || rule.PolygonSymbolizer,
            graphic = symbolizer.Stroke.GraphicStroke.Graphic;

        setDefaultMark(graphic.Mark, "LINE");

        var graphicName = graphic.Mark.WellKnownName;
        var symbolSize = graphic.Size;
        var fillColor = getCssParameter(graphic.Mark.Fill, "fill");
        var fillOpacity = getCssParameter(graphic.Mark.Fill, "fill-opacity") || "1";
        var strokeColor = getCssParameter(graphic.Mark.Stroke, "stroke");
        var strokeWidth = getCssParameter(graphic.Mark.Stroke, "stroke-width");
        var strokeOpacity = getCssParameter(graphic.Mark.Stroke, "stroke-opacity");
        var strokeDasharray = getCssParameter(symbolizer.Stroke, "stroke-dasharray");

        me.items = [
            {
                xtype: 'cwn2-btn-geostyler-symbol-combo',
                symbol: graphicName
            },
            {
                xtype: 'cwn2-btn-geostyler-symbol-size',
                size: symbolSize
            },
            {
                xtype: 'cwn2-btn-geostyler-fill-color-field',
                color: fillColor
            },
            //{
            //    xtype: 'cwn2-btn-geostyler-fill-opacity-slider',
            //    opacity: fillOpacity
            //},
            {
                xtype: 'cwn2-btn-geostyler-stroke-color-field',
                color: strokeColor
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-width',
                width: strokeWidth
            },
            //{
            //    xtype: 'cwn2-btn-geostyler-stroke-opacity-slider',
            //    opacity: strokeOpacity
            //},
            {
                xtype: 'cwn2-btn-geostyler-stroke-dasharray',
                strokeDashstyle: strokeDasharray
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.FillColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-fill-color-field",
    fieldLabel: 'Fill Color',
    labelWidth: 50,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.color) {
            this.setValue(config.color);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.HatchFillColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-hatch-fill-color-field",
    fieldLabel: 'Fill Color',
    labelWidth: 50,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.color) {
            this.setValue(config.color);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.FillOpacitySlider', {
    extend: 'Ext.slider.Single',
    alias: "widget.cwn2-btn-geostyler-fill-opacity-slider",
    fieldLabel: 'Fill Opacity',
    labelWidth: 50,
    width: 200,
    value: 100,
    //increment: 5,
    minValue: 0,
    maxValue: 100,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.opacity) {
            this.setValue(100 * parseFloat(config.opacity));
        }
    }
});


Ext.define('CWN2.button.GeoStyler.HatchFillOpacitySlider', {
    extend: 'Ext.slider.Single',
    alias: "widget.cwn2-btn-geostyler-hatch-fill-opacity-slider",
    fieldLabel: 'Fill Opacity',
    labelWidth: 50,
    width: 200,
    value: 100,
    //increment: 5,
    minValue: 0,
    maxValue: 100,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.opacity) {
            this.setValue(100 * parseFloat(config.opacity));
        }
    }
});
Ext.define('CWN2.button.GeoStyler.StrokeColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-stroke-color-field",
    fieldLabel: 'Stroke Color',
    labelWidth: 50,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.color) {
            this.setValue(config.color);
        }
    }
});

Ext.define('CWN2.button.GeoStyler.HatchStrokeColorField', {
    extend: 'Ext.ux.ColorField',
    alias: "widget.cwn2-btn-geostyler-hatch-stroke-color-field",
    fieldLabel: 'Stroke Color',
    labelWidth: 50,
    width: 200,
    value: '#ffffff',
    msgTarget: 'qtip',
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.color) {
            this.setValue(config.color);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.StrokeOpacitySlider', {
    extend: 'Ext.slider.Single',
    alias: "widget.cwn2-btn-geostyler-stroke-opacity-slider",
    fieldLabel: 'Stroke Opacity',
    labelWidth: 50,
    width: 200,
    value: 100,
    //increment: 5,
    minValue: 0,
    maxValue: 100,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.opacity) {
            this.setValue(100 * parseFloat(config.opacity));
        }
    }
});

Ext.define('CWN2.button.GeoStyler.HatchStrokeOpacitySlider', {
    extend: 'Ext.slider.Single',
    alias: "widget.cwn2-btn-geostyler-hatch-stroke-opacity-slider",
    fieldLabel: 'Stroke Opacity',
    labelWidth: 50,
    width: 200,
    value: 100,
    //increment: 5,
    minValue: 0,
    maxValue: 100,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.opacity) {
            this.setValue(100 * parseFloat(config.opacity));
        }
    }
});

Ext.define('CWN2.button.GeoStyler.StrokeTypeCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-stroke-type-combo",
    fieldLabel: 'Stroke',
    labelWidth: 40,
    queryMode: 'local',
    store: [],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 200,
    previousValue: null,
    constructor: function (config) {
        if (config.rule.LineSymbolizer) {
            this.store = [
                ["Simple", "Simple"],
                ["WKN", "WKN"]
            ]
        } else {
            this.store = [
                ["None", "None"],
                ["Simple", "Simple"]
            ]

        }
        this.superclass.constructor.call(this);
        this.setValue(config.strokeType);
        this.previousValue = config.strokeType;
    }

});

Ext.define('CWN2.button.GeoStyler.StrokeWidth', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-stroke-width",
    fieldLabel: 'Width',
    labelWidth: 50,
    width: 100,
    maxValue: 99,
    minValue: 0,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(parseFloat(config.width));
    }
});

Ext.define('CWN2.button.GeoStyler.HatchStrokeWidth', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-hatch-stroke-width",
    fieldLabel: 'Width',
    labelWidth: 50,
    width: 100,
    maxValue: 99,
    minValue: 0.5,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(parseFloat(config.width));
    }
});

Ext.define('CWN2.button.GeoStyler.StrokeDashStyle1', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-stroke-dashstyle1",
    width: 45,
    flex: 1,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(parseFloat(config.value));
    }
});

Ext.define('CWN2.button.GeoStyler.StrokeDashStyle2', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-stroke-dashstyle2",
    width: 45,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(parseFloat(config.value));
    }
});

Ext.define('CWN2.button.GeoStyler.StrokeDashArray', {
    extend: 'Ext.form.FieldContainer',
    alias: "widget.cwn2-btn-geostyler-stroke-dasharray",
    fieldLabel: 'Dash',
    labelWidth: 50,
    width: 190,
    layout: 'hbox',
    items: [],
    constructor: function (config) {

        var dashArray, value1, value2;

        if (config.strokeDashstyle) {
            dashArray = config.strokeDashstyle.split(" ");
            value1 = dashArray[0];
            value2 = dashArray[1];
        }

        this.items = [
            {
                xtype: 'cwn2-btn-geostyler-stroke-dashstyle1',
                flex: 1,
                value: value1
            },
            {
                xtype: 'tbfill'
            },
            {
                xtype: 'cwn2-btn-geostyler-stroke-dashstyle2',
                flex: 1,
                value: value2
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.GeoStyler.SymbolCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-symbol-combo",
    fieldLabel: 'Symbol',
    labelWidth: 40,
    queryMode: 'local',
    store: [
        ["circle", "circle"],
        ["square", "square"],
        ["triangle", "triangle"],
        ["star", "star"],
        ["cross", "cross"],
        ["x", "x"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 200,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.symbol) {
            this.setValue(config.symbol);
        } else {
            this.setValue("circle");
        }
    }
});

Ext.define('CWN2.button.GeoStyler.ExternalGraphicUrl', {
    extend: 'Ext.form.field.TextArea',
    alias: "widget.cwn2-btn-geostyler-external-graphic-url",
    fieldLabel: 'Url',
    labelWidth: 50,
    width: 400,
    value: "http://geoportale.regione.liguria.it/geoservices/geoserver_sld/sld/img/point-black.png",
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if ((config.externalGraphic)) {
            this.setValue(config.externalGraphic);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.RuleLegend', {
    extend: 'Ext.Img',
    alias: "widget.cwn2-btn-geostyler-rule-legend",
    width: 20,
    height: 20,
    value: "",
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.legendUrl) {
            this.setSrc(config.legendUrl);
        }
    }
});


Ext.define('CWN2.button.GeoStyler.ExternalGraphicImg', {
    extend: 'Ext.Img',
    alias: "widget.cwn2-btn-geostyler-external-graphic-img",
    fieldLabel: 'Img',
    labelWidth: 50,
    width: 20,
    height: 20,
    value: "http://geoportale.regione.liguria.it/geoservices/geoserver_sld/sld/img/point-black.png",
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.externalGraphic) {
            this.setSrc(config.externalGraphic);
        }
        if (config.size) {
            this.setHeight(parseInt(config.size));
            this.setWidth(parseInt(config.size));
        }
    }
});

Ext.define('CWN2.button.GeoStyler.GraphicFormatCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-graphic-format-combo",
    fieldLabel: 'Formato',
    labelWidth: 50,
    queryMode: 'local',
    store: [
        ["image/png", "png"],
        ["image/jpeg", "jpeg"],
        ["image/gif", "gif"],
        ["image/svg+xml", "svg"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 120,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        if (config.graphicFormat) {
            this.setValue(config.graphicFormat);
        } else {
            this.setValue("image/png");
        }
    }
});

Ext.define('CWN2.button.GeoStyler.HatchCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-hatch-combo",
    fieldLabel: 'Symbol',
    labelWidth: 40,
    queryMode: 'local',
    store: [
        ["circle", "circle"],
        ["square", "square"],
        ["triangle", "triagle"],
        ["star", "star"],
        ["cross", "cross"],
        ["x", "x"],
        ["shape://vertline", "shape://vertline"],
        ["shape://horline", "shape://horline"],
        ["shape://slash", "shape://slash"],
        ["shape://backslash", "shape://backslash"],
        ["shape://dot", "shape://dot"],
        ["shape://plus", "shape://plus"],
        ["shape://times", "shape://times"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 200,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(config.symbol);
    }
});

Ext.define('CWN2.button.GeoStyler.SymbolSize', {
    extend: 'Ext.form.field.Number',
    alias: "widget.cwn2-btn-geostyler-symbol-size",
    fieldLabel: 'Size',
    labelWidth: 50,
    width: 100,
    maxValue: 99,
    minValue: 0.5,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(parseFloat(config.size));
    }
});

Ext.define('CWN2.button.GeoStyler.PointTypeCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-point-type-combo",
    fieldLabel: 'Type',
    labelWidth: 40,
    queryMode: 'local',
    store: [
        ["WKN", "WKN"],
        ["Graphic", "Graphic"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 200,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(config.pointType);
    }
});

Ext.define('CWN2.button.GeoStyler.FillTypeCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-geostyler-fill-type-combo",
    fieldLabel: 'Fill',
    labelWidth: 40,
    queryMode: 'local',
    store: [
        ["None", "None"],
        ["Simple", "Simple"],
        ["Graphic", "Graphic"],
        ["Hatch", "Hatch"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "Simple",
    width: 200,
    previousValue: null,
    constructor: function (config) {
        this.superclass.constructor.call(this);
        this.setValue(config.fillType);
        this.previousValue = config.fillType;
    }
});


// CONTROLLER
Ext.define('CWN2.controller.button.geostyler', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.GeoStyler'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-geostyler'
        },
        {
            ref: 'win',
            selector: 'cwn2-btn-geostyler-win'
        },
        {
            ref: 'panel',
            selector: 'cwn2-btn-geostyler-panel'
        },
        {
            ref: 'layerCombo',
            selector: 'cwn2-btn-geostyler-layer-combo'
        },
        {
            ref: 'ruleCombo',
            selector: 'cwn2-btn-geostyler-rule-combo'
        },
        {
            ref: 'ruleFieldset',
            selector: 'cwn2-btn-geostyler-rule-fieldset'
        },
        {
            ref: 'tabPanel',
            selector: 'cwn2-btn-geostyler-tab-panel'
        },
        {
            ref: 'labelPanel',
            selector: 'cwn2-btn-geostyler-label-panel'
        },
        {
            ref: 'labelFontPanel',
            selector: 'cwn2-btn-geostyler-label-font-panel'
        },
        {
            ref: 'labelPlacementPanel',
            selector: 'cwn2-btn-geostyler-label-placement-panel'
        },
        {
            ref: 'pointTypeCombo',
            selector: 'cwn2-btn-geostyler-point-type-combo'
        },
        {
            ref: 'strokeTypeCombo',
            selector: 'cwn2-btn-geostyler-stroke-type-combo'
        },
        {
            ref: 'strokePanel',
            selector: 'cwn2-btn-geostyler-stroke-panel'
        },
        {
            ref: 'fillTypeCombo',
            selector: 'cwn2-btn-geostyler-fill-type-combo'
        },
        {
            ref: 'fillPanel',
            selector: 'cwn2-btn-geostyler-polygon-fill-panel'
        },
        {
            ref: 'pointPanel',
            selector: 'cwn2-btn-geostyler-point-panel'
        },
        {
            ref: 'dashLine',
            selector: 'cwn2-btn-geostyler-stroke-dashstyle1'
        },
        {
            ref: 'dashSpace',
            selector: 'cwn2-btn-geostyler-stroke-dashstyle2'
        },
        {
            ref: 'externalGraphicImg',
            selector: 'cwn2-btn-geostyler-external-graphic-img'
        },
        {
            ref: 'cqlFilter',
            selector: 'cwn2-btn-geostyler-cql-filter'
        },
        {
            ref: 'ruleLegend',
            selector: 'cwn2-btn-geostyler-rule-legend'
        },
        {
            ref: 'changeRuleOrderWin',
            selector: 'cwn2-btn-geostyler-change-rule-order-window'
        },
        {
            ref: 'changeRuleOrderPanel',
            selector: 'cwn2-btn-geostyler-change-rule-order-panel'
        },
        {
            ref: 'generateRulesWin',
            selector: 'cwn2-btn-geostyler-generate-rules-window'
        },
        {
            ref: 'generateRulesColumnCombo',
            selector: 'cwn2-btn-geostyler-generate-rules-columns-combo'
        }


    ],

    init: function (application) {
        CWN2.Util.log('CWN2.controller.button.geostyler: init');

        this.control({
            'button[action=geostyler-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=geostyler-cancel]': {
                click: this.onCancelButtonClick
            },
            'button[action=geostyler-validate-cql]': {
                click: this.onValidateCQLButtonClick
            },
            'button[action=change-rule-order-submit]': {
                click: this.onChangeRuleOrderSubmitButtonClick
            },
            'button[action=change-rule-order-cancel]': {
                click: this.onChangeRuleOrderCancelButtonClick
            },
            'button[action=change-generate-rules-submit]': {
                click: this.onChangeGenerateRulesSubmitButtonClick
            },
            'cwn2-btn-geostyler-layer-combo': {
                select: this.onLayerSelect
            },
            'cwn2-btn-geostyler-rule-combo': {
                select: this.onRuleSelect
            },
            'cwn2-btn-geostyler-rule-title': {
                change: this.onRuleTitleChange
            },
            'cwn2-btn-geostyler-min-scale': {
                change: this.onMinScaleChange
            },
            'cwn2-btn-geostyler-max-scale': {
                change: this.onMaxScaleChange
            },
            'cwn2-btn-geostyler-point-type-combo': {
                select: this.onPointTypeSelect
            },
            'cwn2-btn-geostyler-stroke-type-combo': {
                select: this.onStrokeTypeSelect
            },
            'cwn2-btn-geostyler-fill-type-combo': {
                select: this.onFillTypeSelect
            },
            'cwn2-button-geostyler': {
                click: this.onClick
            },
            'cwn2-btn-geostyler-add-rule': {
                click: this.onAddRuleClick
            },
            'cwn2-btn-geostyler-delete-rule': {
                click: this.onDeleteRuleClick
            },
            'cwn2-btn-geostyler-change-rule-order': {
                click: this.onChangeRuleOrderClick
            },
            'cwn2-btn-geostyler-generate-rules': {
                click: this.onGenerateRulesClick
            },
            //
            'cwn2-btn-geostyler-symbol-combo': {
                select: this.onSymbolComboSelect
            },
            'cwn2-btn-geostyler-hatch-combo': {
                select: this.onHatchComboSelect
            },
            'cwn2-btn-geostyler-symbol-size': {
                change: this.onSymbolSizeChange
            },
            'cwn2-btn-geostyler-fill-color-field': {
                select: this.onFillColorFieldChange
            },
            'cwn2-btn-geostyler-hatch-fill-color-field': {
                select: this.onHatchFillColorFieldChange
            },
            'cwn2-btn-geostyler-stroke-color-field': {
                select: this.onStrokeColorFieldChange
            },
            'cwn2-btn-geostyler-hatch-stroke-color-field': {
                select: this.onHatchStrokeColorFieldChange
            },
            'cwn2-btn-geostyler-stroke-width': {
                change: this.onStrokeWidthChange
            },
            'cwn2-btn-geostyler-hatch-stroke-width': {
                change: this.onHatchStrokeWidthChange
            },
            'cwn2-btn-geostyler-stroke-dashstyle1': {
                change: this.onStrokeDashStyleChange
            },
            'cwn2-btn-geostyler-stroke-dashstyle2': {
                change: this.onStrokeDashStyleChange
            },
            'cwn2-btn-geostyler-stroke-opacity-slider': {
                change: this.onStrokeOpacitySliderChange
            },
            'cwn2-btn-geostyler-hatch-stroke-opacity-slider': {
                change: this.onHatchStrokeOpacitySliderChange
            },
            'cwn2-btn-geostyler-fill-opacity-slider': {
                change: this.onFillOpacitySliderChange
            },
            'cwn2-btn-geostyler-hatch-fill-opacity-slider': {
                change: this.onHatchFillOpacitySliderChange
            },
            'cwn2-btn-geostyler-external-graphic-url': {
                change: this.onExternalGraphicUrlChange
            },
            'cwn2-btn-geostyler-graphic-format-combo': {
                select: this.onGraphicFormatSelect
            },
            'cwn2-btn-geostyler-cql-filter': {
                change: this.onCQLFilterChange
            },
            'cwn2-btn-geostyler-label-font-size': {
                change: this.onLabelFontSizeChange
            },
            'cwn2-btn-geostyler-label-font-family-combo': {
                select: this.onLabelFontFamilySelect
            },
            'cwn2-btn-geostyler-label-font-style-combo': {
                select: this.onLabelFontStyleSelect
            },
            'cwn2-btn-geostyler-label-font-weight-combo': {
                select: this.onLabelFontWeightSelect
            },
            'cwn2-btn-geostyler-label-fill-color-field': {
                select: this.onLabelFillColorFieldChange
            },
            'cwn2-btn-geostyler-label-halo-color-field': {
                select: this.onLabelHaloColorFieldChange
            },
            'cwn2-btn-geostyler-label-halo-radius': {
                change: this.onLabelHaloRadiusChange
            },
            'cwn2-btn-geostyler-label-min-scale': {
                change: this.onLabelMinScaleChange
            },
            'cwn2-btn-geostyler-label-max-scale': {
                change: this.onLabelMaxScaleChange
            },
            'cwn2-btn-geostyler-label-anchor-x': {
                change: this.onLabelAnchorXChange
            },
            'cwn2-btn-geostyler-label-anchor-y': {
                change: this.onLabelAnchorYChange
            },
            'cwn2-btn-geostyler-label-displacement-x': {
                change: this.onLabelDisplacementXChange
            },
            'cwn2-btn-geostyler-label-displacement-y': {
                change: this.onLabelDisplacementYChange
            },
            'cwn2-btn-geostyler-label-line-perpendicular-offset': {
                change: this.onLabelPerpendicularOffsetChange
            },
            'cwn2-btn-geostyler-label-columns-combo': {
                change: this.onLabelColumnSelect
            }
            //

        });
    },

    onAddRuleClick: function (button, e, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var rules = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;

        var ind = 0;
        var indLabel = rules.length;
        Ext.each(rules, function (rule, index) {
            if (rule.Name !== "LABEL") {
                ind = parseInt(rule.Name.replace("R", ""));
            } else {
                indLabel = index;
            }
        });
        var ruleName = "R" + parseInt(ind + 1);

        var pointSymbolizer = null,
            lineSymbolizer = null,
            polygonSymbolizer = null,
            rule = {
                Name: ruleName,
                Title: "Nuova Rule"
            };

        switch (selectedLayer.geomType) {
            case "POLYGON":
                rule.PolygonSymbolizer = {
                    Stroke: this.defaultSimpleStrokeStyle
                };
                break;
            case "LINE":
                rule.LineSymbolizer = {
                    Stroke: this.defaultSimpleStrokeStyle
                };
                break;
            case "POINT":
                rule.PointSymbolizer = {
                    Graphic: this.defaultWKNPointStyle
                };
                break;
        }

        rules.splice(indLabel, 0, rule);

        //ricarico panel
        me.selectedRule = me.getSelectedRuleIndex(me.selectedLayer, ruleName);
        this.reloadRuleCombo();
        this.getRuleCombo().setValue(ruleName);
        this.reloadTabPanel();
    },

    getNumRules: function (rules) {
        var numRules = 0;
        Ext.each(rules, function (rule, index) {
            if (rule.Name !== "LABEL") {
                numRules++;
            }
        });
        return numRules;
    },

    onChangeRuleOrderClick: function (button, e, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var rules = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;

        var indLabel = rules.length;
        var numRules = me.getNumRules(rules);
        if (numRules < 2) {
            CWN2.Util.msgBox("Attenzione: Non posso riordinare le rule perchè unica");
            return;
        }

        var win = this.getChangeRuleOrderWin();

        if (!win) {
            win = Ext.create('CWN2.button.GeoStyler.ChangeRuleOrder.Window', {
                rules: rules
            });
        }
        this.showHideWin(win, CWN2.app.layout.mapPanel);
    },


    onGenerateRulesClick: function (button, e, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var columns = selectedLayer.columns;

        var win = this.getGenerateRulesWin();


        if (!win) {
            win = Ext.create('CWN2.button.GeoStyler.GenerateRules.Window', {
                columns: columns
            });
        }
        this.showHideWin(win, CWN2.app.layout.mapPanel);
    },


    onDeleteRuleClick: function (button, e, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var rules = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;

        var indLabel = rules.length;
        var numRules = me.getNumRules(rules);
        if (numRules < 2) {
            CWN2.Util.msgBox("Attenzione: Non posso cancellare la rule perchè unica");
            return;
        }

        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    rules.splice(me.selectedRule, 1);
                    me.selectedRule = 0;
                    me.reloadRuleCombo();
                    me.reloadTabPanel();
                }
            }
        );


    },

    onLabelColumnSelect: function (combo, records, eOpts) {
        var newValue = records;
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];

        if (newValue === "&nbsp;") {
            return;
        }
        if (newValue === null) {
            Ext.MessageBox.confirm(
                CWN2.I18n.get('Conferma'),
                CWN2.I18n.get('Sei sicuro?'),
                function (btn) {
                    if (btn === "yes") {
                        me.deleteLabelRule();
                        me.reloadLabelPanel();
                        me.setEditedLayerFlag(selectedLayer.name);
                    }
                }
            );
        } else {
            if (!selectedLayer.labelRule) {
                me.createLabelRule();
                me.reloadLabelPanel();
            }
            selectedLayer.labelRule.TextSymbolizer.Label.PropertyName = newValue;
            me.setEditedLayerFlag(selectedLayer.name);
        }
    },

    reloadLabelPanel: function () {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];

        Ext.suspendLayouts();
        var panel = this.getLabelPanel();
        panel.remove(this.getLabelFontPanel());
        panel.remove(this.getLabelPlacementPanel());

        panel.add({
            xtype: "cwn2-btn-geostyler-label-font-panel",
            labelRule: selectedLayer.labelRule
        });
        panel.add({
            xtype: "cwn2-btn-geostyler-label-placement-panel",
            labelRule: selectedLayer.labelRule,
            geomType: selectedLayer.geomType
        });

        Ext.resumeLayouts(true);
    },

    createLabelRule: function () {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        selectedLayer.labelRule = Ext.clone(me.defaultLabel);

        Ext.each(me.layersConfig, function (layerConfig) {
            if (layerConfig.name === selectedLayer.name) {
                layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule.push(selectedLayer.labelRule);
            }
        });
    },

    deleteLabelRule: function () {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];

        delete selectedLayer.labelRule;

        Ext.each(me.layersConfig, function (layerConfig) {
            if (layerConfig.name === selectedLayer.name) {
                delete layerConfig.labelRule;
                var labelRuleIndex = -1;
                Ext.each(layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule, function (rule, index) {
                    if (rule.Name === "LABEL") {
                        labelRuleIndex = index;
                    }
                });
                if (labelRuleIndex > -1) {
                    layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule.splice(labelRuleIndex, 1);
                }
            }
        });
    },


    onLabelPerpendicularOffsetChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.LabelPlacement && selectedLayer.labelRule.TextSymbolizer.LabelPlacement.LinePlacement) {
            selectedLayer.labelRule.TextSymbolizer.LabelPlacement.LinePlacement.PerpendicularOffset = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelDisplacementXChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.LabelPlacement && selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement) {
            selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement.DisplacementX = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelDisplacementYChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.LabelPlacement && selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement) {
            selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.Displacement.DisplacementY = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelAnchorXChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.LabelPlacement && selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement) {
            selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint.AnchorPointX = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelAnchorYChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.LabelPlacement && selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement) {
            selectedLayer.labelRule.TextSymbolizer.LabelPlacement.PointPlacement.AnchorPoint.AnchorPointY = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelMaxScaleChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (newValue) {
            if (selectedLayer.labelRule) {
                selectedLayer.labelRule.MaxScaleDenominator = newValue;
            }
        } else {
            delete selectedLayer.labelRule['MaxScaleDenominator'];
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelMinScaleChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (newValue) {
            if (selectedLayer.labelRule) {
                selectedLayer.labelRule.MinScaleDenominator = newValue;
            }
        } else {
            delete selectedLayer.labelRule['MinScaleDenominator'];
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelHaloRadiusChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Halo) {
            selectedLayer.labelRule.TextSymbolizer.Halo.Radius = newValue;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelHaloColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Halo) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Halo.Fill, "fill", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelFillColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Fill) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Fill, "fill", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onSymbolComboSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];
        // POINT_WNK
        if (selectedRule.PointSymbolizer) {
            selectedRule.PointSymbolizer.Graphic.Mark.WellKnownName = records[0].data.field1;
        }
        // LINE_WKN
        if (selectedRule.LineSymbolizer) {
            selectedRule.LineSymbolizer.Stroke.GraphicStroke.Graphic.Mark.WellKnownName = records[0].data.field1;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },


    onLabelFontWeightSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var newValue = records[0].data.field1;
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Font) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Font, "font-weight", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelFontStyleSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var newValue = records[0].data.field1;
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Font) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Font, "font-style", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },
    onLabelFontFamilySelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var newValue = records[0].data.field1;
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Font) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Font, "font-family", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onLabelFontSizeChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        if (selectedLayer.labelRule && selectedLayer.labelRule.TextSymbolizer && selectedLayer.labelRule.TextSymbolizer.Font) {
            setCssParameter(selectedLayer.labelRule.TextSymbolizer.Font, "font-size", newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onCQLFilterChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];
        try {
            if (newValue) {
                selectedRule.Filter = CWN2.Util.transformFilterCQL2json(newValue);
            } else {
                delete selectedRule['Filter'];
            }
        } catch (exception) {
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onExternalGraphicUrlChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        // POINT_GRAPHIC
        if (selectedRule.PointSymbolizer) {
            selectedRule.PointSymbolizer.Graphic.ExternalGraphic.OnlineResource["_xlink:href"] = newValue;
        }
        // POLYGON_GRAPHIC
        if (selectedRule.PolygonSymbolizer) {
            selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.ExternalGraphic.OnlineResource["_xlink:href"] = newValue;
        }
        var externalGraphicImg = this.getExternalGraphicImg()
        if (externalGraphicImg) {
            externalGraphicImg.setSrc(newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onRuleTitleChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        selectedRule.Title = newValue;
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onMinScaleChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        if (newValue) {
            selectedRule.MinScaleDenominator = newValue;
        } else {
            delete selectedRule['MinScaleDenominator'];
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onMaxScaleChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        if (newValue) {
            selectedRule.MaxScaleDenominator = newValue;
        } else {
            delete selectedRule['MaxScaleDenominator'];
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    setFillParam: function (param, newValue) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        // POINT_WNK
        if (selectedRule.PointSymbolizer) {
            setCssParameter(selectedRule.PointSymbolizer.Graphic.Mark.Fill, param, newValue);
        }
        // LINE_WKN
        if (selectedRule.LineSymbolizer) {
            setCssParameter(selectedRule.LineSymbolizer.Stroke.GraphicStroke.Graphic.Mark.Fill, param, newValue);
        }
        // POLYGON_SIMPLE_FILL
        if (selectedRule.PolygonSymbolizer) {
            setCssParameter(selectedRule.PolygonSymbolizer.Fill, param, newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onFillColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        this.setFillParam("fill", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchFillColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        setCssParameter(selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.Fill, "fill", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onFillOpacitySliderChange: function (slider, newValue, thumb, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        this.setFillParam("fill-opacity", newValue / 100);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchFillOpacitySliderChange: function (slider, newValue, thumb, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        setCssParameter(selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.Fill, "fill-opacity", newValue / 100);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onSymbolComboSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        // POINT_WNK
        if (selectedRule.PointSymbolizer) {
            selectedRule.PointSymbolizer.Graphic.Mark.WellKnownName = records[0].data.field1;
        }
        // LINE_WKN
        if (selectedRule.LineSymbolizer) {
            selectedRule.LineSymbolizer.Stroke.GraphicStroke.Graphic.Mark.WellKnownName = records[0].data.field1;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchComboSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.WellKnownName = records[0].data.field1;
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onGraphicFormatSelect: function (combo, records, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        if (selectedRule.PointSymbolizer) {
            selectedRule.PointSymbolizer.Graphic.ExternalGraphic.Format = records[0].data.field1;
        }
        if (selectedRule.PolygonSymbolizer) {
            selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.ExternalGraphic.Format = records[0].data.field1;
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onSymbolSizeChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        if (selectedRule.PointSymbolizer) {
            selectedRule.PointSymbolizer.Graphic.Size = newValue;
        }
        if (selectedRule.LineSymbolizer) {
            selectedRule.LineSymbolizer.Stroke.GraphicStroke.Graphic.Size = newValue;
        }
        if (selectedRule.PolygonSymbolizer) {
            //selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Size =  newValue;
        }
        var externalGraphicImg = this.getExternalGraphicImg()
        if (externalGraphicImg) {
            externalGraphicImg.setWidth(newValue);
            externalGraphicImg.setHeight(newValue);
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    setStrokeParam: function (param, newValue) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        // POINT_WNK
        if (selectedRule.PointSymbolizer) {
            setCssParameter(selectedRule.PointSymbolizer.Graphic.Mark.Stroke, param, newValue);
        }
        // LINE
        if (selectedRule.LineSymbolizer && selectedRule.LineSymbolizer.Stroke) {
            if (selectedRule.LineSymbolizer && selectedRule.LineSymbolizer.Stroke.GraphicStroke) {
                // LINE_WNK
                setCssParameter(selectedRule.LineSymbolizer.Stroke.GraphicStroke.Graphic.Mark.Stroke, param, newValue);
            } else {
                // LINE_SIMPLE
                setCssParameter(selectedRule.LineSymbolizer.Stroke, param, newValue);
            }
        }
        // POLYGON_STROKE
        if (selectedRule.PolygonSymbolizer) {
            setCssParameter(selectedRule.PolygonSymbolizer.Stroke, param, newValue);
        }
    },


    onStrokeColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        this.setStrokeParam("stroke", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchStrokeColorFieldChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        setCssParameter(selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.Stroke, "stroke", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onStrokeWidthChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        this.setStrokeParam("stroke-width", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchStrokeWidthChange: function (field, newValue, oldValue, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        setCssParameter(selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.Stroke, "stroke-width", newValue);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onStrokeOpacitySliderChange: function (slider, newValue, thumb, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        this.setStrokeParam("stroke-opacity", newValue / 100);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onHatchStrokeOpacitySliderChange: function (slider, newValue, thumb, eOpts) {
        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        setCssParameter(selectedRule.PolygonSymbolizer.Fill.GraphicFill.Graphic.Mark.Stroke, "stroke-opacity", newValue / 100);
        this.setEditedLayerFlag(selectedLayer.name);
    },

    onStrokeDashStyleChange: function (field, newValue, thumb, eOpts) {
        var dashStyleLine = this.getDashLine(),
            dashStyleSpace = this.getDashSpace();

        var me = this;
        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        if (dashStyleLine && dashStyleSpace) {
            if (dashStyleLine.getValue() && dashStyleSpace.getValue()) {
                var strokeDasharray = dashStyleLine.getValue() + " " + dashStyleSpace.getValue();
                // LINE
                if (selectedRule.LineSymbolizer) {
                    setCssParameter(selectedRule.LineSymbolizer.Stroke, "stroke-dasharray", strokeDasharray);
                }
                // POLYGON_SIMPLE_STROKE
                if (selectedRule.PolygonSymbolizer) {
                    setCssParameter(selectedRule.PolygonSymbolizer.Stroke, "stroke-dasharray", strokeDasharray);
                }
            }
            else {
                // LINE
                if (selectedRule.LineSymbolizer) {
                    setCssParameter(selectedRule.LineSymbolizer.Stroke, "stroke-dasharray", "");
                }
                // POLYGON_SIMPLE_STROKE
                if (selectedRule.PolygonSymbolizer) {
                    setCssParameter(selectedRule.PolygonSymbolizer.Stroke, "stroke-dasharray", "");
                }
            }
        }
        this.setEditedLayerFlag(selectedLayer.name);
    },

    setEditedLayerFlag: function (layerName) {
        var layersConfig = this.layersConfig;
        Ext.each(layersConfig, function (layerConfig) {
            if (layerConfig.name === layerName) {
                layerConfig.edited = true;
            }
        });
    },

    onClick: function () {
        var win = this.getWin(),
            button = this.getButton(),
            me = this;

        if (!win) {
            var layers = me.buildLayersConfig(button.config);
            if (!layers) {
                CWN2.Util.msgBox("Attenzione: Nessun livello disponibile");
                return;
            }
            win = Ext.create('CWN2.button.GeoStyler.Window', {
                layersConfig: me.layersConfig
            });
        }
        this.showHideWin(win, CWN2.app.layout.mapPanel);

    },

    showHideWin: function (win, mapPanel) {
        if (!win.isVisible()) {
            win.show();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        } else {
            win.hide();
        }
    },

    buildLayersConfig: function (config) {
        var me = this;
        var idMap = parseInt(config.options.idMap);
        var layersConfig = CWN2.app.map.layerManager.overlayLayersConfig;
        me.layersConfig = [];
        Ext.each(layersConfig, function (layerConfig) {
            var layer = Ext.clone(layerConfig);
            if (layer.geomType === "VECTOR" && layer.idMap === idMap) {
                var rules = layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
                var labelRule = null;
                Ext.each(rules, function (rule) {
                    if (rule.Name === 'LABEL') {
                        labelRule = rule;
                        return false;
                    }
                });
                var columns = [{name: "&nbsp;",type: null}];
                Ext.each(layer.dbSchema.columns, function (column) {
                    columns.push(column);
                });
                var url = (Array.isArray(layerConfig.wmsParams.url))? layerConfig.wmsParams.url[0] : layerConfig.wmsParams.url;
                var legendUrl = url + "LAYER=" + layer.name + "&REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LEGEND_OPTIONS=forceLabels:off";
                me.layersConfig.push({
                    name: layer.name,
                    label: layer.legend.label,
                    legendUrl: legendUrl,
                    id: layer.id,
                    sld: layer.sld,
                    labelRule: labelRule,
                    columns: columns,
                    edited: false,
                    cachePostGIS: layerConfig.cachePostGIS,
                    geomType: layer.geomSubType
                })
            }
        });
        if (me.layersConfig.length > 0) {
            me.layersConfig.reverse();
            me.selectedLayer = 0;
            me.selectedRule = 0;
            return true;
        } else {
            return false;
        }

    },

    onLayerSelect: function (combo, records, eOpts) {
        var me = this;

        me.selectedLayer = me.getSelectedLayerIndex(records[0].data.name);
        me.selectedRule = 0;

        //ricarico panel
        this.reloadRuleCombo();
        this.reloadTabPanel();
    },

    getSelectedLayerIndex: function (layerName) {
        var me = this,
            layerIndex = 0;

        Ext.each(me.layersConfig, function (layerConfig, index) {
            if (layerConfig.name === layerName) {
                layerIndex = index;
                return false;
            }
        });

        return layerIndex;
    },

    getSelectedRuleIndex: function (layerIndex, ruleName) {
        var me = this,
            ruleIndex = 0;

        var rules = me.layersConfig[layerIndex].sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
        Ext.each(rules, function (ruleConfig, index2) {
            if (ruleConfig.Name === ruleName) {
                ruleIndex = index2;
                return false;
            }
        });

        return ruleIndex;
    },

    onRuleSelect: function (combo, records, eOpts) {
        var me = this;
        // imposto la rule selezionata
        me.selectedRule = me.getSelectedRuleIndex(me.selectedLayer, records[0].data.Name);
        // imposto immagine legenda
        this.getRuleLegend().setSrc(records[0].data.legendUrl);
        //ricarico panel
        this.reloadTabPanel();
    },

    reloadRuleCombo: function () {
        var me = this;

        Ext.suspendLayouts();
        var panel = me.getPanel();
        panel.remove(me.getRuleFieldset());
        panel.add({
            xtype: 'cwn2-btn-geostyler-rule-fieldset',
            layer: me.layersConfig[me.selectedLayer]
        });

        var ruleCombo = me.getRuleCombo();
        ruleCombo.setValue(ruleCombo.getStore().getAt(me.selectedRule).data.Name);

        Ext.resumeLayouts(true);

    },

    reloadTabPanel: function () {
        var me = this;
        Ext.suspendLayouts();
        var panel = this.getPanel();
        var tabPanel = this.getTabPanel();

        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        var idx = (tabPanel.items) ? tabPanel.items.indexOf(tabPanel.getActiveTab()) : 0;
        panel.remove(tabPanel);
        panel.add({
            xtype: 'cwn2-btn-geostyler-tab-panel',
            rule: selectedRule,
            geomType: selectedLayer.geomType,
            labelRule: selectedLayer.labelRule,
            columns: selectedLayer.columns,
            activeTab: idx
        });
        Ext.resumeLayouts(true);
    },

    onStrokeTypeSelect: function (combo, records, eOpts) {
        var me = this,
            strokeType = records[0].data.field1,
            strokeTab;

        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        //controllo fill/stroke
        if (me.getFillTypeCombo()) {
            var fillType = me.getFillTypeCombo().getValue();
            if (fillType === "None" && strokeType === "None") {
                CWN2.Util.msgBox("Attenzione: Stroke e Fill non possono essere entrambi non impostati");
                combo.setValue(combo.previousValue);
                return;
            }
        }

        combo.previousValue = strokeType;

        //ricarico panel
        Ext.suspendLayouts();
        var panel = this.getStrokePanel();
        panel.remove(panel.items.items[1]);
        var symbolizer = selectedRule.LineSymbolizer || selectedRule.PolygonSymbolizer;

        if (strokeType === "None") {
            // Se stile attuale è di tipo STROKE_* levo elemento Stroke
            if (selectedRule.PolygonSymbolizer && selectedRule.PolygonSymbolizer.Stroke) {
                var fill = selectedRule.PolygonSymbolizer.Fill;
                selectedRule.PolygonSymbolizer = {
                    "Fill": fill
                }
            }
        }
        if (strokeType === "Simple") {
            // Se stile attuale è di tipo STROKE_NONE o STROKE_GRAPHIC cambio in STROKE_SIMPLE di default
            if ((!symbolizer.Stroke) || (symbolizer.Stroke.GraphicStroke)) {
                symbolizer.Stroke = Ext.clone(this.defaultSimpleStrokeStyle);
            }
            strokeTab = {xtype: "cwn2-btn-geostyler-simple-stroke-panel", rule: selectedRule};
            panel.add(strokeTab);
        }
        if (strokeType === "WKN") {
            // Se stile attuale è di tipo STROKE_NONE o STROKE_SIMPLE cambio in STROKE_SIMPLE di default
            if ((!symbolizer.Stroke) || (!symbolizer.Stroke.GraphicStroke)) {
                symbolizer.Stroke = Ext.clone(this.defaultWKNStrokeStyle);
            }
            strokeTab = {xtype: "cwn2-btn-geostyler-wkn-stroke-panel", rule: selectedRule};
            panel.add(strokeTab);
        }

        Ext.resumeLayouts(true);
    },

    onFillTypeSelect: function (combo, records, eOpts) {
        var me = this,
            fillType = records[0].data.field1,
            fillTab;

        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        //controllo fill/stroke
        var strokeType = me.getStrokeTypeCombo().getValue();
        if (fillType === "None" && strokeType === "None") {
            CWN2.Util.msgBox("Attenzione: Stroke e Fill non possono essere entrambi non impostati");
            combo.setValue(combo.previousValue);
            return;
        }

        combo.previousValue = fillType;

        //ricarico panel
        Ext.suspendLayouts();
        var panel = this.getFillPanel();
        panel.remove(panel.items.items[1]);

        var symbolizer = selectedRule.PolygonSymbolizer;

        if (fillType === "None") {
            // Se stile attuale è di tipo STROKE_* levo elemento Stroke
            if (symbolizer && symbolizer.Fill) {
                var stroke = symbolizer.Stroke;
                symbolizer = {
                    "Stroke": stroke
                }
            }
        }
        if (fillType === "Simple") {
            // Se stile attuale non è di tipo FILL_SIMPLE imposto FILL_SIMPLE di default
            if ((!symbolizer.Fill) || (symbolizer.Fill.GraphicFill)) {
                symbolizer.Fill = Ext.clone(this.defaultSimpleFillStyle);
            }
            fillTab = {xtype: "cwn2-btn-geostyler-simple-fill-panel", rule: selectedRule};
            panel.add(fillTab);
        }
        if (fillType === "Graphic") {
            // Se stile attuale non è di tipo FILL_GRAPHIC imposto FILL_GRAPHIC di default
            if ((!symbolizer.Fill) || (!symbolizer.Fill.GraphicFill) || (!symbolizer.Fill.GraphicFill.Graphic.ExternalGraphic)) {
                symbolizer.Fill = Ext.clone(this.defaultGraphicFillStyle);
            }
            fillTab = {xtype: "cwn2-btn-geostyler-graphic-fill-panel", rule: selectedRule};
            panel.add(fillTab);
        }
        if (fillType === "Hatch") {
            // Se stile attuale non è di tipo FILL_HATCH imposto FILL_HATCH di default
            if ((!symbolizer.Fill) || (!symbolizer.Fill.GraphicFill) || (!symbolizer.Fill.GraphicFill.Graphic.Mark)) {
                symbolizer.Fill = Ext.clone(this.defaultHatchFillStyle);
            }
            fillTab = {xtype: "cwn2-btn-geostyler-hatch-fill-panel", rule: selectedRule};
            panel.add(fillTab);
        }
        Ext.resumeLayouts(true);
    },

    onPointTypeSelect: function (combo, records, eOpts) {
        var me = this,
            pointType = records[0].data.field1,
            pointTab;

        var selectedLayer = me.layersConfig[me.selectedLayer];
        var selectedRule = selectedLayer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule];

        //ricarico panel
        Ext.suspendLayouts();
        var panel = this.getPointPanel();
        panel.remove(panel.items.items[1]);
        if (pointType === "WKN") {
            // Se stile attuale è di tipo POINT_GRAPHIC cambio stile e imposto lo stile POINT_WKN di default
            if (selectedRule.PointSymbolizer.Graphic.ExternalGraphic) {
                selectedRule.PointSymbolizer.Graphic = Ext.clone(this.defaultWKNPointStyle);
            }
            pointTab = {xtype: "cwn2-btn-geostyler-wkn-point-panel", rule: selectedRule};
        }
        if (pointType === "Graphic") {
            // Se stile attuale è di tipo POINT_WKN cambio stile e imposto lo stile POINT_GRAPHIC di default
            if (selectedRule.PointSymbolizer.Graphic.Mark) {
                selectedRule.PointSymbolizer.Graphic = Ext.clone(this.defaultGraphicPointStyle);
            }
            pointTab = {xtype: "cwn2-btn-geostyler-graphic-point-panel", rule: selectedRule};
        }
        panel.add(pointTab);
        Ext.resumeLayouts(true);
    },


    defaultLabel: {
        "Name": "LABEL",
        "Title": "",
        "TextSymbolizer": {
            "Label": {
                "PropertyName": "NUMERO_PRATICA"
            },
            "Font": {
                "CssParameter": [
                    {
                        "_name": "font-family",
                        "__text": "Verdana"
                    },
                    {
                        "_name": "font-size",
                        "__text": 8
                    },
                    {
                        "_name": "font-style",
                        "__text": "normal"
                    },
                    {
                        "_name": "font-weight",
                        "__text": "normal"
                    }
                ]
            },
            "LabelPlacement": {
                "PointPlacement": {
                    "AnchorPoint": {
                        "AnchorPointX": 0,
                        "AnchorPointY": 0
                    }
                }
            },
            "Halo": {
                "Radius": 2,
                "Fill": {
                    "CssParameter": [{
                        "_name": "fill",
                        "__text": "#F5FFFA"
                    }]
                }
            },
            "Fill": {
                "CssParameter": [{
                    "_name": "fill",
                    "__text": "#000000"
                }]
            },
            "VendorOption": {
                "_name": "conflictResolution",
                "__text": "false"
            }
        }
    },

    defaultSimpleFillStyle: {
        "CssParameter": [
            {
                "_name": "fill",
                "__text": "#FFFFFF"
            },
            {
                "_name": "fill-opacity",
                "__text": "1"
            }
        ]
    },

    defaultGraphicFillStyle: {
        "GraphicFill": {
            "Graphic": {
                "ExternalGraphic": {
                    "OnlineResource": {
                        "_xmlns:xlink": "http://www.w3.org/1999/xlink",
                        "_xlink:type": "simple",
                        "_xlink:href": "http://geoportale.regione.liguria.it/geoservices/geoserver_sld/sld/img/point-black.png"
                    },
                    "Format": "image/png"
                },
                "Size": "6"
            }
        }
    },

    defaultHatchFillStyle: {
        "GraphicFill": {
            "Graphic": {
                "Mark": {
                    "WellKnownName": "shape://slash",
                    "Stroke": {
                        "CssParameter": [
                            {
                                "_name": "stroke",
                                "__text": "#000000"
                            }
                        ]
                    }
                },
                "Size": "8"
            }
        }
    },


    defaultSimpleStrokeStyle: {
        "CssParameter": [
            {
                "_name": "stroke",
                "__text": "#000000"
            },
            {
                "_name": "stroke-opacity",
                "__text": "1"
            },
            {
                "_name": "stroke-width",
                "__text": "1"
            }
        ]
    },


    defaultWKNStrokeStyle: {
        "GraphicStroke": {
            "Graphic": {
                "Mark": {
                    "WellKnownName": "circle",
                    "Fill": {
                        "CssParameter": [
                            {
                                "_name": "fill",
                                "__text": "#FF0000"
                            }
                        ]
                    },
                    "Stroke": {
                        "CssParameter": [
                            {
                                "_name": "stroke",
                                "__text": "#000000"
                            }
                        ]
                    }
                },
                "Size": "6"
            }
        }
    },


    defaultWKNPointStyle: {
        "Mark": {
            "WellKnownName": "circle",
            "Fill": {
                "CssParameter": [
                    {
                        "_name": "fill",
                        "__text": "#FF0000"
                    },
                    {
                        "_name": "fill-opacity",
                        "__text": "1"
                    }
                ]
            },
            "Stroke": {
                "CssParameter": [
                    {
                        "_name": "stroke",
                        "__text": "#000000"
                    },
                    {
                        "_name": "stroke-opacity",
                        "__text": "1"
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "1"
                    }
                ]
            }
        },
        "Size": "10"
    },

    defaultGraphicPointStyle: {
        "ExternalGraphic": {
            "OnlineResource": {
                "_xmlns:xlink": "http://www.w3.org/1999/xlink",
                "_xlink:type": "simple",
                "_xlink:href": "http://geoportale.regione.liguria.it/geoservices/geoserver_sld/sld/img/point-black.png"
            },
            "Format": "image/png"
        },
        "Size": "10"
    },

    onCancelButtonClick: function () {
        var me = this;
        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    //Rispristino configurazione salvata
                    me.buildLayersConfig(me.getButton().config);
                    //Ricostruisco finestra
                    var win = me.getWin();
                    win.destroy();
                    win = Ext.create('CWN2.button.GeoStyler.Window', {
                        layersConfig: me.layersConfig
                    });
                    me.showHideWin(win, CWN2.app.layout.mapPanel);
                }
            }
        );
    },

    onValidateCQLButtonClick: function () {
        var cqlFilter = this.getCqlFilter().getValue();
        if (cqlFilter) {
            try {
                var testFilter = CWN2.Util.transformFilterCQL2json(cqlFilter);
                CWN2.Util.msgBox("Parsing Corretto");
            } catch (exception) {
                CWN2.Util.msgBox("Errore parsing del filtro.<br> " + exception);
            }
        }
    },

    onSubmitButtonClick: function (button, e, eOpts) {
        var me = this;

        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    // aggiorno configurazione sld del LayerManager
                    Ext.each(me.layersConfig, function (layerConfig) {
                        if (layerConfig.edited) {
                            // controllo stroke-width se = 0 cancello elemento <Stroke>
                            me.checkStrokeWidth(layerConfig)
                            // controllo che scala_min sia minore di scala max
                            if (me.checkScale(layerConfig) && me.checkExternalGraphic(layerConfig)) {
                                var layerConfig2 = Ext.clone(layerConfig);
                                var layerManagerConfig = CWN2.app.map.layerManager.getLayerConfigByName(layerConfig2.name);
                                layerManagerConfig.sld = layerConfig2.sld
                                //mando sld a geoserver
                                var sldXml = GeoStyler.app.x2js.json2xml_str(layerConfig2.sld);
                                var url = "/geoservices/REST/geoserver/geoserver_sld?id=" + layerConfig2.id + "&cache_postgis=" + layerConfig.cachePostGIS
                                Ext.Ajax.request({
                                    url: url,
                                    headers: {'Content-Type': 'application/xml; charset=UTF-8'},
                                    xmlData: sldXml,
                                    success: function (response) {
                                        if (response.responseText.substring(0, 2) === "OK") {
                                            layerConfig.edited = false;
                                        }
                                        // Aggiorno il layer sulla mappa
                                        var olLayer = CWN2.app.map.getLayerByName(layerConfig.name);
                                        olLayer.redraw(true);
                                        // Aggiorno l'immmagine sulla legenda
                                        var legendImg = document.getElementById("legend_img_" + layerConfig.name);
                                        legendImg.src = layerManagerConfig.legend.icon + "?" + new Date().getTime();
                                    }
                                });
                                // imposto flag multiclasse
                                var rules = layerConfig2.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
                                var numRules = me.getNumRules(rules);
                                CWN2.Util.ajaxRequest({
                                    type: "JSON",
                                    url: "/geoservices/REST/geoserver/set_flag_multiclasse?id=" + layerConfig2.id + "&num_rules=" + numRules,
                                    callBack: function (response) {
                                        console.log(response.message);
                                    }
                                });

                            }
                        }
                    });
                    me.reloadRuleCombo();

                    me.reloadTabPanel();
                    var layer = me.layersConfig[me.selectedLayer]
                    var legendUrl = layer.legendUrl + "&RULE=" + layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule].Name + '&dc=' + new Date().getTime();
                    ;
                    me.getRuleLegend().setSrc(legendUrl);
                }
            }
        );
    },

    checkScale: function (layerConfig) {
        var rules = layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
        var isValid = true;
        Ext.each(rules, function (rule) {
            if (rule.MinScaleDenominator && rule.MaxScaleDenominator && rule.MinScaleDenominator >= rule.MaxScaleDenominator) {
                CWN2.Util.msgBox("Attenzione: la Scala Min. deve essere minore di Scala Max. <br>Layer: " + layerConfig.name + " - " + layerConfig.label);
                isValid = false;
                return false;
            }
        });
        return isValid;
    },

    checkStrokeWidth: function (layerConfig) {
        var rules = layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
        Ext.each(rules, function (rule) {
            // POINT_GRAPHIC
            if (rule.PointSymbolizer && rule.PointSymbolizer.Graphic.Mark && rule.PointSymbolizer.Graphic.Mark.Stroke) {
                if (getCssParameter(rule.PointSymbolizer.Graphic.Mark.Stroke, "stroke-width") === 0) {
                    // se stroke-width = 0 levo elemento stroke
                    rule.PointSymbolizer.Graphic.Mark = {
                        WellKnownName: rule.PointSymbolizer.Graphic.Mark.WellKnownName,
                        Fill: rule.PointSymbolizer.Graphic.Mark.Fill
                    };
                }
            }
        });
    },

    checkExternalGraphic: function (layerConfig) {
        var rules = layerConfig.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule;
        var isValid = true;
        var imgUrl = null;
        Ext.each(rules, function (rule) {
            // POINT_GRAPHIC
            if (rule.PointSymbolizer && rule.PointSymbolizer.Graphic.ExternalGraphic) {
                imgUrl = rule.PointSymbolizer.Graphic.ExternalGraphic.OnlineResource["_xlink:href"];
            }
            // POLYGON_GRAPHIC
            if (rule.PolygonSymbolizer && rule.PolygonSymbolizer.Fill && rule.PolygonSymbolizer.Fill.GraphicFill && rule.PolygonSymbolizer.Fill.GraphicFill.Graphic && rule.PolygonSymbolizer.Fill.GraphicFill.Graphic.ExternalGraphic) {
                imgUrl = rule.PolygonSymbolizer.Fill.GraphicFill.Graphic.ExternalGraphic.OnlineResource["_xlink:href"];
            }
            if (imgUrl) {
                var nImg = document.createElement('img');
                nImg.onerror = function () {
                    CWN2.Util.msgBox("Attenzione: l'immagine " + imgUrl + " non esiste!");
                    isValid = false;
                    return false;
                }
                nImg.src = imgUrl;
            }
        });
        return isValid;
    },

    checkFilter: function (rule, layerConfig) {
        if (rule.Filter) {
            try {
                var testFilter = CWN2.Util.transformFilterJson2CQL(rule.Filter);
            } catch (exception) {
                CWN2.Util.msgBox("Attenzione: Errore Parsing del filtro. <br>Layer: " + layerConfig.name + " - " + layerConfig.label + "<br>Rule: " + rule.Name + " - " + rule.Title + "<br>Errore: " + exception);
            }
        }
    },

    onChangeGenerateRulesSubmitButtonClick: function (button, e, eOpts) {
        var me = this;

        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    var column = me.getGenerateRulesColumnCombo().getValue(),
                        layer = me.layersConfig[me.selectedLayer];

                    if (column) {
                        CWN2.Util.ajaxRequest({
                            type: "JSONP",
                            url: "/geoservices/REST/config/query_layer_valuelist/" + layer.name.replace("L", "") + "?column=" + column,
                            callBack: function(response) {
                                if (response && !response.success) {
                                    CWN2.Util.msgBox("Attenzione: - " + response.message);
                                    return;
                                }
                                (response.data && response.data.length > 0) ?
                                    me.generateRules(column, response.data) :
                                    CWN2.Util.msgBox("Nessun oggetto trovato");
                            }
                        });

                    } else {
                        CWN2.Util.msgBox("Attenzione: Selezionare una colonna");
                        return;

                    }
                    var win = me.getGenerateRulesWin();
                    win.destroy();
                }
            }
        );
    },

    generateRules: function(column,values) {
        var me = this,
            layer = me.layersConfig[me.selectedLayer],
            rules = [];

        Ext.each(values, function (value,index) {
            if (value.value) {
                var rule = {};
                rule.Name = "R" + index;
                rule.Title = column + " = " + value.value;
                rule.Filter = CWN2.Util.transformFilterCQL2json(column + " = '" + value.value + "'");
                var colorIndex = (index < 9)? index : index - 9;
                var color = CWN2.Globals.COLOR_SCALES["Random"]["9"][colorIndex];
                switch (layer.geomType) {
                    case "POLYGON":
                        rule.PolygonSymbolizer = {
                            Stroke: me.defaultSimpleStrokeStyle,
                            Fill: {
                                "CssParameter": [
                                    {
                                        "_name": "fill",
                                        "__text": color
                                    },
                                    {
                                        "_name": "fill-opacity",
                                        "__text": "1"
                                    }
                                ]
                            }
                        };
                        break;
                    case "LINE":
                        rule.LineSymbolizer = {
                            Stroke: {
                                "CssParameter": [
                                    {
                                        "_name": "stroke",
                                        "__text": color
                                    },
                                    {
                                        "_name": "stroke-opacity",
                                        "__text": "1"
                                    },
                                    {
                                        "_name": "stroke-width",
                                        "__text": "1"
                                    }
                                ]
                            }
                        };
                        break;
                    case "POINT":
                        rule.PointSymbolizer = {
                            Graphic:{
                                "Mark": {
                                    "WellKnownName": "circle",
                                    "Fill": {
                                        "CssParameter": [
                                            {
                                                "_name": "fill",
                                                "__text": color
                                            },
                                            {
                                                "_name": "fill-opacity",
                                                "__text": "1"
                                            }
                                        ]
                                    }
                                },
                                "Size": "10"
                            }
                        };
                        break;
                }
                rules.push(rule);
            }
        });
        layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule = rules;
        me.reloadRuleCombo();
        me.reloadTabPanel();
        var legendUrl = layer.legendUrl + "&RULE=" + layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule].Name + '&dc=' + new Date().getTime();
        me.getRuleLegend().setSrc(legendUrl);


    },

    onChangeRuleOrderSubmitButtonClick: function (button, e, eOpts) {
        var me = this;

        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    var layer = me.layersConfig[me.selectedLayer],
                        rules = layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule,
                        items = me.getChangeRuleOrderPanel().store.data.items,
                        newRules = [];

                    Ext.each(items, function (item) {
                        Ext.each(rules, function (rule) {
                            if (rule.Name === item.data.Name) {
                                newRules.push(rule);
                            }
                        });
                    });
                    Ext.each(rules, function (rule) {
                        if (rule.Name === "LABEL") {
                            newRules.push(rule);
                        }
                    });
                    layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule = newRules;

                    me.reloadRuleCombo();
                    me.reloadTabPanel();
                    var legendUrl = layer.legendUrl + "&RULE=" + layer.sld.StyledLayerDescriptor.NamedLayer.UserStyle.FeatureTypeStyle.Rule[me.selectedRule].Name + '&dc=' + new Date().getTime();
                    me.getRuleLegend().setSrc(legendUrl);
                    var win = me.getChangeRuleOrderWin();
                    win.destroy();
                }
            }
        );
    },

    onChangeRuleOrderCancelButtonClick: function () {
        var me = this;
        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function (btn) {
                if (btn === "yes") {
                    var win = me.getChangeRuleOrderWin();
                    win.destroy();
                }
            }
        );
    },
    layersConfig: [],

    selectedLayer: null,

    selectedRule: null
});


function getCssParameter(element, paramName) {
    var params = (element) ? element.CssParameter : null,
        value = null;

    Ext.each(params, function (param) {
        if (param["_name"] === paramName) {
            value = param["__text"];
            return false;
        }
    });

    return value;
};

function setCssParameter(element, paramName, paramValue) {
    if (!element) return;

    var params = element.CssParameter,
        flagFound = false;

    Ext.each(params, function (param) {
        if (param["_name"] === paramName) {
            // se esiste parametro lo aggiorno
            param["__text"] = paramValue;
            flagFound = true;
            return false;
        }
    });

    if (!flagFound) {
        if (!element.CssParameter) {
            element.CssParameter = [];
        }
        // se non esiste parametro lo inserisco
        element.CssParameter.push({
            "_name": paramName,
            "__text": paramValue
        })
    }

};

function setDefaultMark(mark, type) {
    // se non esiste fill lo creo
    if (!mark.Fill) {
        mark.Fill = {
            CssParameter: [
                {
                    "_name": "fill",
                    "__text": "#000000"
                }
            ]
        }
        if (type === "POINT") {
            mark.Fill.CssParameter.push(
                {
                    "_name": "fill-opacity",
                    "__text": "1"
                }
            );
        }

    }

    // se non esiste stroke lo creo
    if (typeof mark.Stroke === 'undefined') {
        if (type === "POINT") {
            var stroke = getCssParameter(mark.Fill, "fill");
            mark.Stroke = {
                CssParameter: [
                    {
                        "_name": "stroke",
                        "__text": stroke
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "0"
                    },
                    {
                        "_name": "stroke-opacity",
                        "__text": "1"
                    }
                ]
            }
        } else {
            mark.Stroke = {
                CssParameter: [
                    {
                        "_name": "stroke",
                        "__text": "#000000"
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "1"
                    }
                ]
            }
        }
    }

    // se esiste ma è vuoto (<Stroke />) lo creo
    if (mark.Stroke === "") {
        if (type === "POINT") {
            mark.Stroke = {
                CssParameter: [
                    {
                        "_name": "stroke",
                        "__text": "#000000"
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "1"
                    },
                    {
                        "_name": "stroke-opacity",
                        "__text": "1"
                    }
                ]
            }
        } else {
            mark.Stroke = {
                CssParameter: [
                    {
                        "_name": "stroke",
                        "__text": "#000000"
                    },
                    {
                        "_name": "stroke-width",
                        "__text": "1"
                    }
                ]
            }
        }
    }

    // se Stroke è impostato ma stroke-width non è impostato lo imposto a default (1)
    var strokeWidth = getCssParameter(mark.Stroke, "stroke-width");
    if (mark.Stroke && !strokeWidth && strokeWidth !== 0) {
        setCssParameter(mark.Stroke, "stroke-width", "1");
    }

};

Ext.define('CWN2.button.GeocoderCombo', {
    alias: 'widget.cwn2-combo-geocoder',

    constructor: function(config) {

        var btnOptions = config.options || {};

        return Ext.create("CWN2.GeocoderComboBox", {
            id: 'combo-geocoder',
            map: CWN2.app.map,
            hilite: btnOptions.hilite,
            service: "google",
            width: btnOptions.width || 200
        });
    }
});

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.button.InfoWms', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-infowms',

    constructor: function (config) {
        "use strict";

        var btnOptions = config.options || {},
            map = CWN2.app.map,
            id = "infowms",
            me = this,
            hiliteLayerName = "_wmsInfo";

        // --------------------------------------------------------------------------------//

        // instanzio il gestore del layer di evidenziazione
        if (!btnOptions.disableHilite) {
            this.wmsSldHiliter = new CWN2.WmsSldHiliter(map, hiliteLayerName);
        }

        function setQueryLayersByName(layers) {
            if (layers) {
                var len = layers.length,
                    match = {},
                    i;
                match.test = function (name) {
                    for (i = 0; i < len; i++) {
                        if (name === layers[i]) {
                            return true;
                        }
                    }
                    return false;
                };
                return map.getLayersByName(match);
            } else {
                return null;
            }
        }

        // ritorna l'array con i layer della mappa
        function setQueryLayersByConfig() {
            var layers = map.layers,
                queryLayers = [];
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].config && layers[i].config.type === "WMS" && layers[i].config.queryable) {
                    queryLayers.push(layers[i]);
                }
            }
            return queryLayers;
        }

        var vendorParams = btnOptions.vendorParams || {};
        if (btnOptions.radius) {
            vendorParams.radius = btnOptions.radius;
        }

        var control = new OpenLayers.Control.WMSGetFeatureInfo(
            {
                id: "infoWmsControl",
                layers: (btnOptions.layers) ? setQueryLayersByName(btnOptions.layers.split(",")) : setQueryLayersByConfig(),
                queryVisible: true,
                drillDown: true,
                maxFeatures: btnOptions.maxFeatures || CWN2.Globals.INFO_WMS_MAX_FEATURES,
                infoFormat: "application/vnd.ogc.gml",
                //vendorParams: vendorParams,
                output: "object",
                eventListeners: {
                    getfeatureinfo: function (event) {
                        me.fireEvent("getfeatureinfo", event);
                    }
                }
            }
        );

        map.addControl(control);

        this.options = btnOptions;

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Info"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            enableToggle: true,
            control: control,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

Ext.define('CWN2.button.InfoWms.featureList.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-infowms-featurelist-win',
    title: CWN2.I18n.get("Risultato Interrogazione"),
    height: 350,
    width: 480,
    layout: "fit",
    resizable: false,
    constructor: function (config) {
        this.items = config.items;
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.InfoWms.featureList.GridPanel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cwn2-infowms-featurelist-grid',
    header: false,
    frame: true,
    width: 440,
    height: 300,
    iconCls: "icon-grid",
    columns: [
        {
            header: "Livello",
            id: "layerLabel",
            sortable: true,
            dataIndex: "layerLabel",
            renderer: function (legend, metaData, record) {
                var label = record.data.layerLabel;
                var cssStyle = "cursor:pointer; text-decoration:underline";
                return "<div style='" + cssStyle + "'>" + label + " </div>";
            },
            width: 240
        },
        {
            header: "Feature",
            id: "label",
            sortable: true,
            dataIndex: "label",
            renderer: function (legend, metaData, record) {
                var label = record.data.label;
                var cssStyle = "cursor:pointer; text-decoration:underline;font-weight: bold";
                return "<div style='" + cssStyle + "'>" + label + " </div>";
            },
            width: 200
        }
    ],

    constructor: function (config) {
        this.store = Ext.create('CWN2.button.InfoWms.featureList.Store', {
            data: config.data
        });

        this.superclass.constructor.call(this);
    }


});

Ext.define('CWN2.button.InfoWms.featureList.Store', {
    extend: 'Ext.data.Store',
    fields: [
        {
            name: "featureId", mapping: "featureId"
        },
        {
            name: "layerLabel", mapping: "layerLabel"
        },
        {
            name: "layerName", mapping: "layerName"
        },
        {
            name: "label", mapping: "label"
        },
        {
            name: "attributes", mapping: "attributes"
        },
        {
            name: "doc", mapping: "doc"
        },
        {
            name: "feature", mapping: "feature"
        }
    ],
    sortInfo: {field: "layerName", direction: "ASC"},

    constructor: function (config) {
        this.data = config.data;
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.InfoWms.baseInfo.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-infowms-baseinfo-win',
    height: 400,
    width: 360,
    layout: "fit",
    resizable: false,
    constructor: function (config) {
        this.title = config.title;
        this.items = config.items;
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.InfoWms.baseInfo.GridPanel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cwn2-infowms-baseinfo-grid',
    frame: true,
    width: 300,
    header: false,
    height: 300,
    hideHeaders: true,
    iconCls: "icon-grid",
    columns: [
        {
            header: "Campo",
            id: "infoLabelAttr",
            dataIndex: "infoLabelAttr",
            renderer: function (val) {
                return '<div style="white-space:normal !important;"><b>' + val + '</b></div>';
            },
            width: 150
        },
        {
            header: "Valore",
            id: "fieldValue",
            dataIndex: "fieldValue",
            renderer: function (val) {
                return '<div style="white-space:normal !important;">' + val + '</div>';
            },
            width: 150
        }
    ],

    constructor: function (config) {
        this.id = config.id;

        this.store = Ext.create('CWN2.button.InfoWms.baseInfo.Store', {
            data: config.data
        });

        this.superclass.constructor.call(this);
    }

});

Ext.define('CWN2.button.InfoWms.baseInfo.Store', {
    extend: 'Ext.data.Store',
    fields: [
        {
            name: "infoLabelAttr", mapping: "infoLabelAttr"
        },
        {
            name: "fieldValue", mapping: "fieldValue"
        }
    ],

    constructor: function (config) {
        this.data = config.data;
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.InfoWms.html.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-infowms-html-win',
    title: "Info",
    resizable: false,
//    layout: "fit",
    autoScroll: true,

    constructor: function (config) {
        this.height = config.height;
        this.width = config.width;
        this.items = config.items;
        this.superclass.constructor.call(this);
    }
});

// CONTROLLER
Ext.define('CWN2.controller.button.infowms', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.InfoWms'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-infowms'
        },
        {
            ref: 'featureListWin',
            selector: 'cwn2-infowms-featurelist-win'
        },
        {
            ref: 'featureListGrid',
            selector: 'cwn2-infowms-featurelist-grid'
        },
        {
            ref: 'baseInfoWin',
            selector: 'cwn2-infowms-baseinfo-win'
        },
        {
            ref: 'htmlWin',
            selector: 'cwn2-infowms-html-win'
        }
    ],

    init: function (application) {
        CWN2.Util.log('CWN2.controller.button.infowms: init');

        this.control({
            'cwn2-button-infowms': {
                toggle: this.onButtonPress,
                getfeatureinfo: this.onGetFeatureInfo
            },
            'cwn2-infowms-featurelist-win': {
                destroy: this.onWinDestroy
            },
            'cwn2-infowms-baseinfo-win': {
                destroy: this.onWinDestroy
            },
            'cwn2-infowms-html-win': {
                destroy: this.onWinDestroy
            },
            '#infoWmsMediaWin': {
                destroy: this.onWinDestroy
            },
            'cwn2-infowms-featurelist-grid': {
                select: this.onFeatureListGridSelect
            }

        });
    },

    onGetFeatureInfo: function (event) {
        this.showFeatureList(event);
    },

    onWinDestroy: function () {
        var wmsSldHiliter = this.getButton().wmsSldHiliter;
        if (wmsSldHiliter) {
            wmsSldHiliter.cleanHiliteLayer();
        }
    },

    onFeatureListGridSelect: function (RowModel, record) {
        this.showFeatureInfo(record);
        this.getFeatureListGrid().getSelectionModel().clearSelections();
    },

    onButtonPress: function () {
    },

    showHideWin: function (win, mapPanel) {
        if (!win.isVisible()) {
            win.show();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        } else {
            win.hide();
        }
    },

    // Costruisce una finestra con una grid contenente le feature trovate raggruppate per livello
    // Richiamata dalla getFeatureInfo
    showFeatureList: function (event) {
        var me = this,
            button = this.getButton();

        var layers = event.object.findLayers(),                             // elenco dei layer
            layersLabelList = setLayersLabelList(layers),                   // lista delle label dei layer
            groupFeature = event.features,                                  // gruppi di feature
            featureList = setFeatureList(groupFeature, layersLabelList, layers);     // array delle feature

        // se nessuna feature esco
        if (featureList.length === 0) {
            return;
        }

        // se esiste la finestra la distruggo
        if (this.getFeatureListWin()) {
            this.getFeatureListWin().destroy();
        }

        Ext.create("CWN2.button.InfoWms.featureList.Window", {
            items: [
                Ext.create("CWN2.button.InfoWms.featureList.GridPanel", {
                    data: featureList
                })
            ]
        }).show().alignTo(CWN2.app.layout.mapPanel.body, "tl-tl", [10, 10]);

        // se solo una riga apro la finestra della info
        if (featureList.length === 1) {
            this.getFeatureListGrid().getSelectionModel().select(0);
            // commentato per problemi di evidenziazione
            if (button.options.hideFeatureList) {
                this.getFeatureListWin().close();
            }
            //this.getFeatureListWin().close();
        }

        // imposta una lista con le etichette dei layer
        function setLayersLabelList(layers) {
            var label,
                layersLabelList = {},
                len = layers.length;

            for (var i = 0; i < len; i++) {
                if (layers[i].legend && layers[i].legend.label) {
                    label = layers[i].legend.label;
                } else {
                    label = layers[i].name;
                }
                layersLabelList[layers[i].name] = label;
            }

            return layersLabelList;

        }

        // imposta l'array delle feature
        function setFeatureList(groupFeature, layersLabelList, layers) {

            var featureId = 0,
                featureList = [],
                features = null,
                feature = null,
                len2 = groupFeature.length,
                len3 = null;

            for (var j = 0; j < len2; j++) {
                features = groupFeature[j].features;
                len3 = features.length;
                for (var j2 = 0; j2 < len3; j2++) {
                    feature = updateFeatureAttr(featureId, features[j2], groupFeature[j], layersLabelList, layers);
                    featureList.push(feature);
                    featureId++;
                }
            }

            return featureList;

        }

        // aggiorna gli attributi della feature
        function updateFeatureAttr(featureId, feature, group, layersLabelList, layers) {

            var featureType = (feature.gml && feature.gml.featureType) ? feature.gml.featureType : feature.type,
                layerName = getFeatureLayer(featureType, layers),
                attributes = getAttributes(featureType, feature, layers),
                newFeature = {};


            newFeature.featureId = featureId;
            newFeature.layerLabel = layersLabelList[layerName];
            newFeature.layerName = layerName;
            newFeature.attributes = attributes;
            newFeature.feature = feature;
            newFeature.url = group.url;
            newFeature.label = setFeatureLabel(layerName, attributes);

            return newFeature;
        }


        // imposta attributi feature
        // se layer ha cache PostGIS fa uppercase delle chiavi
        function getAttributes(featureType, feature, layers) {
            var len = layers.length,
                cachePostGIS = false;

            for (var i = 0; i < len; i++) {
                if (layers[i].params.LAYERS.indexOf(featureType) !== -1) {
                    if (layers[i].config.cachePostGIS) {
                        cachePostGIS = true;
                    }
                }
            }

            if (cachePostGIS) {
                return upperAttributes(feature.attributes)
            } else {
                return feature.attributes;
            }
        }

        function upperAttributes(attributes) {
            var newAttributes = {}
            for (var key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                    newAttributes[key.toUpperCase()] = attributes[key];
                }
            }
            return newAttributes;
        }

        // imposta il nome del layer di riferimento della feature
        // in base al nome del layer WMS/WFS (feature.type) cerca nei layer OL passati (layers)
        // quello che ha l'attributo params.NAME contenente la stringa contenuta in feature.type
        function getFeatureLayer(featureType, layers) {
            var len = layers.length;
            for (var i = 0; i < len; i++) {
                if (!layers[i].params.LAYERS) {
                    return featureType;
                }
                if (layers[i].params.LAYERS.indexOf(featureType) !== -1) {
                    return layers[i].name;
                }
            }
        }

        // ritorna la label della feature
        // se impostato uso il campo infoLabelAttr altrimenti uso il campo infoIdAttr altrimenti uso il primo attributo
        function setFeatureLabel(layerName, attributes) {
            var infoLabelAttr,
                infoIdAttr;
            infoLabelAttr = getField(layerName, "infoLabelAttr");
            infoIdAttr = getField(layerName, "infoIdAttr");
            if (infoLabelAttr && attributes[infoLabelAttr]) {
                return attributes[infoLabelAttr];
            } else {
                if (infoIdAttr && attributes[infoIdAttr]) {
                    return attributes[infoIdAttr];
                } else {
                    return attributes[getFirstAttribute(attributes)];
                }
            }
        }

        // ritorna il campo del layer corrispondente al fildName se non trovato ritorna null
        function getField(layerName, fieldName) {
            try {
                var layerConfig = CWN2.app.map.layerManager.getLayerConfigByName(layerName);
                if (!layerConfig) {
                    throw {
                        name: "BadConfiguration",
                        message: "CWN2.button.InfoWms: layer non esistente",
                        level: 1
                    };
                }
                if (layerConfig.infoOptions && layerConfig.infoOptions[fieldName]) {
                    return layerConfig.infoOptions[fieldName];
                } else {
                    return null;
                }
            } catch (exception) {
                CWN2.Util.handleException(exception);
                return null;
            }
        }

        // ritorna il primo attributo dalla lista di attributi della feature
        function getFirstAttribute(attributes) {

            for (var i in attributes) {
                if (attributes.hasOwnProperty(i) && typeof(i) !== "function") {
                    return i;
                }
            }
            return null;
        }
    },

    showFeatureInfo: function (rec) {
        var data = rec.data,
            layerName = data.layerName,
            layerConfig = CWN2.app.map.layerManager.getLayerConfigByName(layerName),
            me = this,
            btnOptions = me.getButton().options,
            configOptions = layerConfig.infoOptions,
            exception = {};

        if (!layerConfig) {
            return;
        }

        checkLayerConfig();

        if (me.getButton().wmsSldHiliter) {
            hiliteFeature();
        }


        // gestione infoUrl: se impostato attributo infoUrl gestisco la info con la url altrimenti costruisco scheda base con pannello extjs
        (configOptions && configOptions.infoUrl) ? showInfoUrlWiew(configOptions, data) : showBaseInfoWin(configOptions, data);

        // controlli
        function checkLayerConfig() {
            if (layerConfig.infoOptions && !layerConfig.infoOptions.infoIdAttr) {
                CWN2.Util.log("CWN2.button.InfoWms - parametro di configurazione del layer non impostato: infoIdAttr ", 0);
            }
            if (!layerConfig.geomSubType) {
                CWN2.Util.log("CWN2.button.InfoWms - parametro di configurazione del layer non impostato: geomSubType ", 0);
            }
        }

        // costruisce un pannello extjs con la scheda della feature
        // (se esiste oggetto "configOptions.infoScheda.mapping" in configurazione)
        function showBaseInfoWin(configOptions, data) {

            var attributes = data.attributes,
                attrList = [],
                gridTitle = data.layerLabel,
                fieldMapping = configOptions ? configOptions.fieldMapping : null,
                infoLabelAttr,
                fieldValue;

            // costruisco l'array con gli attributi della feature
            for (var attr in attributes) {
                if (attributes.hasOwnProperty(attr)) {
                    infoLabelAttr = fieldMapping ? fieldMapping[attr] : attr;
                    fieldValue = attributes[attr] || '';
                    attrList.push({"infoLabelAttr": infoLabelAttr, "fieldValue": fieldValue});
                }
            }

            // se esiste la finestra la distruggo
            if (me.getBaseInfoWin()) {
                me.getBaseInfoWin().destroy();
            }

            var win = Ext.create("CWN2.button.InfoWms.baseInfo.Window", {
                title: data.layerLabel,
                items: [
                    Ext.create("CWN2.button.InfoWms.baseInfo.GridPanel", {
                        data: attrList
                    })
                ]
            });

            win.show().alignTo(CWN2.app.layout.mapPanel.body, "tl-tl", [500, 10]);

            //Ext.WindowManager.register(win);
            //Ext.WindowManager.bringToFront(win);

        }

        // costruisce la scheda con una url remota
        function showInfoUrlWiew(configOptions, data) {
            // sostituisco variabile con valore - prerequisito: deve esistere un attributo con nome uguale alla variabile
            // es: se infoUrl e' http://pippo/pluto.asp?id=${gid} deve esistere attributo "gid" in attributes della feature
            var infoUrl = OpenLayers.String.format(configOptions.infoUrl, data.attributes);

            // gestione formattazione QPG
            if (CWN2.app.configuration.qpgRequest) {
                var tematismi = CWN2.app.configuration.qpgRequest.tematismi;
                Ext.each(tematismi, function (tematismo) {
                    if (data.layerName === tematismo.olLayer.name && tematismo.separatoreDecimale === ",") {
                        numeral.language('it');
                        var valore = parseFloat(data.attributes["VALORE"]);
                        if (!isNaN(valore)) {
                            data.attributes["VALORE"] =  numeral(valore).format('0000.00')
                        }
                    }
                });
            }

            if ((infoUrl.substr(infoUrl.length - 4) === ".xsl") || (infoUrl.substr(infoUrl.length - 5) === ".xslt")) {
                buildHtmlDoc(configOptions, data);
            } else {
                if (!configOptions.infoTarget || configOptions.infoTarget === "panel") {
                    showIframeWin(infoUrl, configOptions);
                } else {
                    showPopupUrl(infoUrl, configOptions);
                }
            }

// costruisce una scheda html nel caso di info xsl
            function buildHtmlDoc(configOptions, data) {
                var xslUrl = "/geoservices/REST/config/xsl_info_service?";
                // costruisco il gml in formato getFeatureInfo Mapserver
                var xmlDoc = buildGml(data);

                var jsonData = {
                    xslUrl: configOptions.infoUrl,
                    ambiente: CWN2.Globals.AMBIENTE,
                    idLayer: data.layerName.replace("L", ""),
                    featureAttributes: data.attributes
                }

                CWN2.Util.ajaxRequest({
                    type: "XML",
                    url: xslUrl,
                    jsonData: jsonData,
                    callBack: function (xslDoc) {
                        try {
                            // scrivo il titolo del layer
                            var td = Ext.DomQuery.select("td", xslDoc);
                            Ext.each(td, function (el) {
                                if (el.id === "Titolo") {
                                    el.textContent = data.layerLabel;
                                    return false;
                                }
                                // Gestione IE
                                Ext.each(el.attributes, function (attr) {
                                        if (attr.text === "Titolo") {
                                            el.text = data.layerLabel; // IE8/9
                                            return false;
                                        }
                                    }
                                );
                            })
                            // applico la trasformazione xslt
                            var result = xslTransform(xmlDoc, xslDoc);
                            // levo i caratteri di encoding %0A e %09 dai link
                            result = result.replace(new RegExp('%0A', 'g'), '').replace(new RegExp('%09', 'g'), '').replace(new RegExp('%20', 'g'), '');
                            // visualizzo il risultato
                            if (!configOptions.infoTarget || configOptions.infoTarget === "panel") {
                                showHtmlPanel(result, configOptions);
                            } else {
                                showHtmlPopup(result, configOptions);
                            }
                        } catch (exception) {
                            CWN2.Util.handleException(exception);
                        }
                    }
                });

                // costruisce un documento GML in formato getFeatureInfo Mapserver
                function buildGml(feature) {
                    try {
                        var baseXml = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?><msGMLOutput xmlns:gml=\"http://www.opengis.net/gml\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"></msGMLOutput>",
                            xmlDoc = CWN2.Util.parseXML(baseXml),
                            layerName = feature.layerName + "_layer",
                            layerNode = xmlDoc.createElement(layerName),
                            featureName = feature.layerName + "_feature",
                            featureNode = xmlDoc.createElement(featureName),
                            attributes = feature.attributes;

                        for (var key in attributes) {
                            if (attributes.hasOwnProperty(key)) {
                                var text = null;
                                if (attributes[key]) {
                                    text = xmlDoc.createTextNode(attributes[key]);
                                } else {
                                    text = xmlDoc.createTextNode("");
                                }
                                var attrNode = xmlDoc.createElement(key);
                                attrNode.appendChild(text);
                                featureNode.appendChild(attrNode);
                            }
                        }
                        layerNode.appendChild(featureNode);
                        xmlDoc.documentElement.appendChild(layerNode);
                        return xmlDoc;
                    } catch (exception) {
                        throw {
                            name: "gmlTransformation",
                            message: "CWN2.button.infoWms.buildGml: errore costruzione xmlDoc gml - " + exception.message,
                            level: 1
                        };
                    }
                }

                // trasformo xml in html applicando xslt
                function xslTransform(xmlDoc, xslDoc) {
                    try {
                        if (window.XSLTProcessor) {
                            var xsltProcessor = new XSLTProcessor();
                            xsltProcessor.importStylesheet(xslDoc);
                            var transformedDoc = xsltProcessor.transformToDocument(xmlDoc);
                            return (new XMLSerializer()).serializeToString(transformedDoc);
                        } else {
                            return xmlDoc.transformNode(xslDoc);
                        }
                    } catch (exception) {
                        throw {
                            name: "gmlTransformation",
                            message: "CWN2.button.infoWms.xslTransform: errore trasformazione xslt - " + exception.message,
                            level: 1
                        };
                    }
                }

                // apre una panel extjs con un documento html
                function showHtmlPanel(html, configOptions) {
                    var width = configOptions.infoWidth || 400,
                        height = configOptions.infoHeight || 500;

                    // se esiste la finestra la distruggo
                    if (me.getHtmlWin()) {
                        me.getHtmlWin().destroy();
                    }

                    var win = Ext.create('CWN2.button.InfoWms.html.Window', {
                        height: height,
                        width: width,
                        items: [
                            {
                                xtype: 'panel',
                                manageHeight: false,
                                border: false,
                                title: "",
                                html: html
                            }
                        ]
                    }).show().alignTo(CWN2.app.layout.mapPanel.body, "tl-tl", [20, 20]);
                }

                // apre una popup con un documento html
                function showHtmlPopup(htmlString, configOptions) {
                    var width = configOptions.infoWidth || 400,
                        height = configOptions.infoHeight || 500,
                        popup = window.open("", null, "status=yes, toolbar=yes, menubar=no, width=" + width + ", height=" + height + ", resizable=yes, scrollbars=yes");
                    popup.document.open();
                    popup.document.write(htmlString);
                    popup.document.close();
                    popup.focus();
                }
            }

// costruisce la scheda con una documento in un Iframe
            function showIframeWin(infoUrl, configOptions) {
                var win = new CWN2.IframeWindow({
                    url: infoUrl,
                    width: configOptions.infoWidth,
                    height: configOptions.infoHeight,
                    id: "infoWmsMediaWin"
                }).alignTo(CWN2.app.layout.mapPanel.body, "tl-tl", [10, 10]);
            }

// apre una popup con una url remota
            function showPopupUrl(url, configOptions) {
                var width = configOptions.infoWidth || 400,
                    height = configOptions.infoHeight || 500,
                    popup = window.open(url, configOptions.infoTarget, "status=yes, toolbar=yes, menubar=no, width=" + width + ", height=" + height + ", resizable=yes, scrollbars=yes");
                popup.focus();
            }

        }

        // evidenziazione feature
        function hiliteFeature() {
            if (!layerConfig.infoOptions) {
                return null;
            }
            var idField = layerConfig.infoOptions.infoIdAttr;
            if (layerConfig.cachePostGIS) {
                idField = idField.toLowerCase();
            }
            var values = [];
            if (data.feature && data.feature.attributes) {
                values.push(data.feature.attributes[idField]);
            }
            if (typeof values[0] === "undefined") {
                CWN2.Util.log("Parametro layerConfig.infoOptions.infoIdAttr non impostato", 0);
                return;
            }
            var bounds = null,
                zoomLevel = null;
            if (btnOptions && btnOptions.zoomToSelected) {
                bounds = data.feature.bounds;
            }
            if (btnOptions && btnOptions.zoomLevel) {
                zoomLevel = btnOptions.zoomLevel;
            }
            return me.getButton().wmsSldHiliter.hiliteFeature({
                layers: [layerConfig.name],
                fields: idField,
                values: values,
                bounds: bounds,
                zoomLevel: zoomLevel
            });
        }

    }

});



Ext.define('CWN2.button.LoadLayers', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-loadlayers',

    constructor: function(config) {
        var btnOptions = config.options,
            id = "loadlayers";

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: CWN2.I18n.get("Aggiunta Livelli"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false,
            id: id
        });
    }
});

Ext.define('CWN2.button.LoadLayers.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-loadlayers-win',

    title: CWN2.I18n.get("Aggiunta Livelli"),
    height: 500,
    width: 700,
    resizable: true,
    layout: "fit",
    closeAction: "hide",
    buttons: [
        {
            text: CWN2.I18n.get("Aggiungi"),
            action: "loadlayers-submit"
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: "loadlayers-cancel"
        }
    ],
    constructor: function(config) {
        var tabs = Ext.create('CWN2.button.LoadLayers.TabPanel', {
            items: config.items
        });
        //TODO Impostare tab attivo
        if (config.activePanel) {
            tabs.setActiveTab(config.activePanel);
        }
        this.items = tabs;

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.LoadLayers.TabPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.cwn2-loadlayers-tabpanel',
    activeTab: 0,
    bodyBorder: false,
    deferredRender: false,
    layoutOnTabChange: false,
    border: false,
    flex: 1,
    plain: true,

    constructor: function(config) {
        this.items = config.items;

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.LoadLayers.TreePanel', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.cwn2-loadlayers-tree',
    layout: 'anchor',
    rootVisible: false,
    animate: true,
    autoScroll: true,
    nodeType: "async",
    containerScroll: true,
    border: false,
    bodyStyle: "padding:10px",
    bodyBorder: true,
    height: 530,
    useArrows: true,
    multiSelect: true,

    constructor: function(config) {
        this.title = config.title;
        this.store = config.store;
        this.type = config.type;
        this.panelConfig = config.panelConfig;

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.LoadLayers.WmsCapabilitiesUrl', {
    extend: 'Ext.form.field.Text',
    alias: "widget.cwn2-btn-loadlayers-wmsurl-field",
    allowBlank: false,
    value: "",
    width: 500
});



Ext.define('CWN2.button.LoadLayers.WmsPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.cwn2-loadlayers-wmspanel',
    height: 530,
    title: "Servizi WMS",
    bodyStyle: "padding:5px 5px 0",


    constructor: function(config) {
        this.type = "wms";
        this.panelConfig = config.panelConfig;

        this.items = [
            {
                xtype: 'fieldcontainer',
                border: false,
                width: 600,
                flex: 1,
                layout: 'hbox',
                items: [
                    {
                        xtype: 'cwn2-btn-loadlayers-wmsurl-field',
                        fieldLabel: 'URL Capabilities'
                    },
                    {
                        xtype: 'tbfill'
                    },
                    {
                        xtype: 'button',
                        text: 'Lista Layer',
                        handler: function() {
                            var store = Ext.data.StoreManager.lookup('wmscapsStore')
                            var url = Ext.ComponentQuery.query("cwn2-btn-loadlayers-wmsurl-field")[0].value;
                            if (url.indexOf("?") === -1) {
                                url += "?"
                            }
                            if (url.toUpperCase().indexOf("REQUEST=GETCAPABILITIES") === -1) {
                                url += "&REQUEST=GETCAPABILITIES"
                            }
                            if (url.toUpperCase().indexOf("SERVICE=WMS") === -1) {
                                url += "&SERVICE=WMS"
                            }
                            store.getProxy().url = CWN2.Globals.proxy + url;
                            store.load();
                        }
                    }
                ]
            },
            Ext.create('CWN2.button.LoadLayers.WmsGrid', {
                panelConfig: config.panelConfig
            })
        ]
        this.superclass.constructor.call(this);
    }

});

Ext.define('CWN2.button.LoadLayers.WmsGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cwn2-loadlayers-wmsgrid',
    height: 380,
    multiSelect: true,
    columns: [
        {header: "Titolo", dataIndex: "title", sortable: true},
        {id: "description", header: "Descrizione", dataIndex: "abstract", flex: 1}
    ],

    constructor: function(config) {

        this.store = Ext.create('GeoExt.data.WmsCapabilitiesStore', {
            storeId: 'wmscapsStore',
            url: null,
            autoLoad: false
        });
        this.type = "wms";
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.LoadLayers.KmlPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.cwn2-loadlayers-kmlpanel',
    height: 530,
    title: "File KML/GPX",
    bodyStyle: "padding:5px 5px 0",


    constructor: function(config) {
        this.type = "kml";
        this.panelConfig = config.panelConfig;

        this.items = [
            {
                xtype: 'displayfield',
                //fieldLabel: 'Indicare la URL di un file kml/kmz/gpx oppure selezionare un file ca caricare',
                name: 'home_score',
                value: '<br><b>Selezionare un file da caricare oppure indicare la URL di un file KML/KMZ o GPX (anche zippato)</b><br><br>'
            },
            {
                xtype: 'filefield',
                emptyText: 'Seleziona un file kml/kmz o gpx',
                width: 500,
                regex     : (/.(kml|kmz|gpx|zip)$/i),
                regexText : 'Sono ammessi solo i file con estensione kml/kmz/gpx/zip',
                msgTarget : 'under',
                //buttonOnly: true,
                //allowBlank: false,
                validator: function() {
                    var form = this.up('form').getForm();
                    var urlField = form.findField("kml-url").getValue();
                    if (!this.value && !urlField) {
                        return false;
                    }
                    return true;
                },
                fieldLabel: 'File',
                name: 'kml-file',
                buttonText: 'Browse'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'URL',
                name: 'kml-url',
                allowBlank: true,
                vtype:'url',
                msgTarget : 'under',
                value: "",
                width: 500,
                validator: function() {
                    var form = this.up('form').getForm();
                    var fileField = form.findField("kml-file").getValue();
                    if (!this.value && !fileField) {
                        return false;
                    }
                    return true;
                }
            }

        ]
        this.superclass.constructor.call(this);
    }

});

// CONTROLLER
Ext.define('CWN2.controller.button.loadlayers', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.LoadLayers',
        'CWN2.button.LoadLayers.Window'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-loadlayers'
        },
        {
            ref: 'win',
            selector: 'cwn2-loadlayers-win'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.loadlayers: init');

        this.control({
            'cwn2-button-loadlayers': {
                click: this.onClick
            },
            'button[action=loadlayers-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=loadlayers-cancel]': {
                click: this.onCancelButtonClick
            }

        });
    },

    onSubmitButtonClick: function() {
        var activeTab = Ext.ComponentQuery.query('cwn2-loadlayers-tabpanel')[0].getActiveTab();

        switch (activeTab.type) {
            case "map":
                this.mapTreeSubmitHandler(activeTab);
                break;
            case "layer":
                this.layerTreeSubmitHandler(activeTab);
                break;
            case "wms":
                this.wmsSubmitHandler(activeTab);
                break;
            case "kml":
                this.kmlSubmitHandler(activeTab);
                break;
        }
    },

    mapTreeSubmitHandler: function(activeTab) {
        var selNode = activeTab.getSelectionModel().getSelection()[0],
            me = this;

        if (!selNode || !selNode.data.idMap) {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Nessuna carta selezionata"));
            return;
        }

        CWN2.loadingScreen = Ext.getBody().mask('Caricamento Livelli', 'loadingscreen');
        CWN2.Util.ajaxRequest({
            type: "JSONP",
            url: CWN2.Globals.RL_MAP_CONFIG_SERVICE + selNode.data.idMap,
            callBack: function(response) {
                CWN2.app.map.layerManager.addLayers(response.data.layers);
                me.getWin().hide();
            }
        });
    },

    layerTreeSubmitHandler: function(activeTab) {
        var selNodes = activeTab.getSelectionModel().getSelection(),
            me = this,
            layerList = "";

        // costruisco la stringa con i codici dei layer concatenati da virgole
        Ext.each(selNodes, function(node) {
            if (node.data.idLayer) {
                layerList += node.data.idLayer + ",";
            }
        });

        if ((layerList.length) === 0) {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Nessun livello selezionato"));
            return;
        }
        layerList = layerList.substr(0, layerList.length - 1);

        // chiamo il servizio che mi ritorna la configurazione dei layer
        Ext.MessageBox.wait('Caricamento', 'Attendere');
        CWN2.Util.ajaxRequest({
            type: "JSONP",
            url: activeTab.panelConfig.options["layersConfigServiceUrl"] + layerList,
            callBack: function(response) {
                CWN2.app.map.layerManager.addLayers(response.data);
                me.getWin().hide();
                Ext.MessageBox.hide();
            }
        });
    },


    wmsSubmitHandler: function(activeTab) {
        var selNodes = activeTab.items.items[1].getSelectionModel().getSelection(),
            me = this,
            layerList = "",
            srsDefined = true;

        // costruisco la stringa con i codici dei layer concatenati da virgole
        Ext.each(selNodes, function(node) {
            // controllo che srs della mappa sia gestito dal servizio wms
            if (!node.data.srs[CWN2.app.map.projection]) {
                srsDefined = false;
                return false;
            }
            CWN2.app.map.layerManager.addLayers(
                {
                    type: "WMS",
                    name: node.data.name,
                    minScale: node.data.minScale,
                    maxScale: node.data.maxScale,
                    queryable: node.data.queryable,
                    visible: true,
                    wmsParams: {
                        url: node.raw.url,
                        transparent: true,
                        name: node.data.name
                    },
                    legend: {
                        label: node.data.title,
                        icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/classi.gif"
                    }
                }
            );

        });

        if (!srsDefined) {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Sistema di riferimento non gestito"));
        }
        me.getWin().hide();

    },

    kmlSubmitHandler: function(activeTab) {
        var me = this;
        var form = activeTab.form;
        //TODO controllo estensione kml/kmz/gpz/zip
        if(form.isValid()){
            if (form.getValues()["kml-url"]) {
                if (form.getValues()["kml-url"].indexOf("kmz") > -1) {
                    form.submit({
                        url: '/geoservices/REST/utils/kmz_upload_and_unzip/?url=' + form.getValues()["kml-url"],
                        waitMsg: 'Caricamento file....',
                        success: function(fp, o) {
                            me.kmlLoadLayer(o.result.file);
                        },
                        failure: function(form, response) {
                            Ext.Msg.alert(CWN2.I18n.get("Attenzione"), response.result.error);
                        }
                    });
                } else {
                    me.kmlLoadLayer(form.getValues()["kml-url"]);
                }
            } else {
                form.submit({
                    url: '/geoservices/REST/utils/file_upload',
                    waitMsg: 'Caricamento file....',
                    success: function(fp, o) {
                        me.kmlLoadLayer(o.result.file);
                    },
                    failure: function(form, response) {
                        Ext.Msg.alert(CWN2.I18n.get("Attenzione"), response.result.error);
                    }
                });
            }
            me.getWin().hide();
        } else {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), "Indicare una URL o un file da caricare");
        }
    },

    kmlLoadLayer: function(url) {
        if (url.indexOf("kml") === -1 && url.indexOf("gpx") === -1) {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), "Indicare una URL o un file da caricare");
        }
        var type = (url.indexOf("kml") > -1)? "KML" : "GPX";
        var name = url.substring(url.lastIndexOf("/") + 1 , url.length - 4);

        var layerConfig = {
            name: name,
            type: type,
            projection: "EPSG:4326",
            url: url,
            visible: true,
            legend: {
                label: name,
                icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/classi.gif"
            },
            infoOptions: {
                infoPopUp: "simple",
                infoWidth: 300,
                infoHeight: 300

            }
        };

        if (!CWN2.app.map.layerManager.isLayerInConfigWithTitle(layerConfig)) {
            CWN2.app.map.layerManager.addLayers(layerConfig);
        } else {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), "File già presente come livello sulla mappa");
        }
    },

    onCancelButtonClick: function() {
        this.getWin().hide();
    },

    onClick: function() {
        var mapPanel = CWN2.app.layout.mapPanel,
            win = this.getWin(),
            button = this.getButton(),
            me = this;

        if (!win) {
            var tabs = [];
            var activePanel = 0;
            // ciclo sull'array dei pannelli per costruirli
            Ext.each(button.config.panels, function(panel, index) {
                switch (panel.type) {
                    case "layerTree":
                        tabs.push(me.buildTreePanel(panel, "layer"));
                        break;
                    case "mapTree":
                        tabs.push(me.buildTreePanel(panel, "map"));
                        break;
                    case "wms":
                        tabs.push(me.buildWmsPanel(panel));
                        break;
                    case "kml":
                        tabs.push(me.buildKmlPanel(panel));
                        break;
                }
                if (panel.options.active) {
                    activePanel = index;
                }
            });
            win = Ext.create('CWN2.button.LoadLayers.Window', {
                items: tabs,
                activePanel: activePanel
            });
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

    // costruisce un panel di tipo tree per aggiunta mappe o layer
    buildTreePanel: function(panelConfig, type) {
        var idField = (type === "map") ? "idMap" : "idLayer";
        var me = this;

        Ext.define('CWN2.button.LoadLayers.Tree', {
            extend: 'Ext.data.Model',
            fields: [idField, 'text']
        });

        var store = Ext.create('Ext.data.TreeStore', {
            model: 'CWN2.button.LoadLayers.Tree',
            proxy: {
                type: 'jsonp',
                url: panelConfig.options.treeServiceUrl,
                root: 'data'
            },
            root: 'data'
        });
        this.loadTree(store, panelConfig.options.treeServiceUrl);

        return Ext.create('CWN2.button.LoadLayers.TreePanel', {
            title: CWN2.I18n.get(panelConfig.name),
            store: store,
            type: type,
            panelConfig: panelConfig
        });
    },

    loadTree: function(treePanel, treeServiceUrl) {
        CWN2.Util.ajaxRequest({
            type: "JSONP",
            url: treeServiceUrl,
            callBack: function(response) {
                var root = response.data;
                treePanel.setRootNode(root);
            }
        });
    },

    // costruisce un panel per i servizi wms
    buildWmsPanel: function(panelConfig) {
        var me = this;
        return Ext.create('CWN2.button.LoadLayers.WmsPanel', {
            panelConfig: panelConfig
        });
    },

    // costruisce un panel per i servizi wms
    buildKmlPanel: function(panelConfig) {
        var me = this;
        return Ext.create('CWN2.button.LoadLayers.KmlPanel', {
            panelConfig: panelConfig
        });
    }



});Ext.define('CWN2.button.MeasureArea', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-measurearea',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            id = "measurearea",
            statusBarItemName = "cwn2-measure-div",
            control = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
                persist: true,
                geodesic: true,
                eventListeners: {
                    measure: function(evt) {
                        var text = CWN2.I18n.get("Area") + ": " + evt.measure.toFixed(3) + " " + evt.units + "2";
                        Ext.ComponentQuery.query('cwn2-statusbar')[0].setStatusbarItemText(statusBarItemName, text);
                    },
                    measurepartial: function(evt) {
                        var text = CWN2.I18n.get("Area") + ": " + evt.measure.toFixed(3) + " " + evt.units + "2";
                        Ext.ComponentQuery.query('cwn2-statusbar')[0].setStatusbarItemText(statusBarItemName, text);
                    }
                }
            });

        // aggiungo alla statusbar il campo per la visualizzazione delle misure
        Ext.ComponentQuery.query('cwn2-statusbar')[0].addStatusbarItem({
            id: statusBarItemName,
            text: "",
            width: 200,
            xtype: "tbtext"
        });

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Misure Areali"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            enableToggle: true,
            control: control,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});


Ext.define('CWN2.button.MeasureLine', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-measureline',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            statusBarItemName = "cwn2-measure-div",
            id = "measureline",
            control = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
                persist: true,
                geodesic: true,
                eventListeners: {
                    measure: function(evt) {
                        var text = CWN2.I18n.get("Distanza") + ": " + evt.measure.toFixed(3) + " " + evt.units;
                        Ext.ComponentQuery.query('cwn2-statusbar')[0].setStatusbarItemText(statusBarItemName, text);
                    },
                    measurepartial: function(evt) {
                        var text = CWN2.I18n.get("Distanza") + ": " + evt.measure.toFixed(3) + " " + evt.units;
                        Ext.ComponentQuery.query('cwn2-statusbar')[0].setStatusbarItemText(statusBarItemName, text);
                    }
                }
            });

        // aggiungo alla statusbar il campo per la visualizzazione delle misure
        Ext.ComponentQuery.query('cwn2-statusbar')[0].addStatusbarItem({
            id: statusBarItemName,
            text: "",
            width: 200,
            xtype: "tbtext"
        });

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Misure Lineari"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            enableToggle: true,
            control: control,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});


Ext.define('CWN2.button.ModifyFeature', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-modifyfeature',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            id = "modifyFeature",
            mode = OpenLayers.Control.ModifyFeature.RESHAPE,
            ctrlOptions = {
                mode: mode,
                createVertices: true
            },
            control = new OpenLayers.Control.ModifyFeature(CWN2.Editor.createEditingLayer(map), ctrlOptions);

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Modifica geometria"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));

    }
});

Ext.define('CWN2.button.Pan', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-pan',

    constructor: function(config) {
        var id = "pan",
            btnOptions = config.options,
            btnPanels = config.panels,
            map = CWN2.app.map,
            control = new OpenLayers.Control.Navigation();

        map.addControl(control);
        map.getControlsByClass("OpenLayers.Control.Navigation")[0].deactivate();

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            tooltip: CWN2.I18n.get("Pan"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            //width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            scale: config.scale,
            enableToggle: true,
            control: control,
            id: id,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});


Ext.define('CWN2.button.Print', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-print',

    constructor: function(config) {
        var btnOptions = config.options;

        this.superclass.constructor.call(this, {
            id: "print",
            tooltip: CWN2.I18n.get("Stampa"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "print",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false
        });
    }
});

Ext.define('CWN2.button.Print.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-print-win',
    closeAction: 'hide',
    title: CWN2.I18n.get("Stampa"),
    height: 400,
    width: 400,
    layout: "fit",
    resizable: false,

    constructor: function(config) {

        this.items = [
            {
                xtype: 'panel',
                height: "auto",
                width: "auto",
                frame: true,
                items: [
                    {
                        xtype: 'fieldset',
                        title: ' ',
                        width: 350,
                        border: false,
                        labelWidth: 20,
                        flex: 1,
                        //layout: 'hbox',
                        items: [
                            {
                                xtype: 'cwn2-btn-print-format-combo'
                            },
                            {
                                xtype: 'cwn2-btn-print-scale-field'
                            }
                        ]
                    },
                    {
                        xtype: 'cwn2-btn-print-pngfieldset'
                    },
                    {
                        xtype: 'cwn2-btn-print-pdffieldset'
                    }

                ],
                buttons: [
                    {
                        text: CWN2.I18n.get("Stampa"),
                        action: "print-submit"
                    },
                    {
                        text: CWN2.I18n.get("Annulla"),
                        action: "print-cancel"
                    }
                ],
                autoScroll: true
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.Print.PngFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: "widget.cwn2-btn-print-pngfieldset",
    title: 'Dimensione PNG',
    width: 370,
    flex: 1,
    //layout: 'hbox',
    items: [
        {
            xtype: 'cwn2-btn-print-width-field'
        },
        {
            xtype: 'cwn2-btn-print-height-field'
        }
    ]

});

Ext.define('CWN2.button.Print.PdfFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: "widget.cwn2-btn-print-pdffieldset",
    title: 'Pagina PDF',
    width: 370,
    flex: 1,
    //layout: 'hbox',
    items: [
        {
            xtype: 'cwn2-btn-print-pagesize-combo'
        },
        {
            xtype: 'cwn2-btn-print-orientation-combo'
        },
        {
            xtype: 'cwn2-btn-print-title-field'
        }
    ]

});

Ext.define('CWN2.button.Print.OrientationCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-print-orientation-combo",
    fieldLabel: 'Orientazione',
    queryMode: 'local',
    store: [
        ["portrait", "Verticale"],
        ["landscape", "Orizzontale"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "portrait",
    width: 200
});

Ext.define('CWN2.button.Print.PageSizeCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-print-pagesize-combo",
    fieldLabel: 'Dimensione',
    queryMode: 'local',
    store: [
        ["A3", "A3"],
        ["A4", "A4"],
        ["A5", "A5"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "A4",
    width: 160
});

Ext.define('CWN2.button.Print.FormatCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-print-format-combo",
    fieldLabel: 'Formato',
    labelWidth: 50,
    queryMode: 'local',
    store: [
        ["pdf", "File PDF"],
        ["png", "Immagine PNG"]
    ],
    typeAhead: true,
    triggerAction: 'all',
    value: "pdf",
    width: 160
});

Ext.define('CWN2.button.Print.TitleField', {
    extend: 'Ext.form.TextArea',
    alias: "widget.cwn2-btn-print-title-field",
    fieldLabel: 'Titolo',
    allowBlank: true,
    width: 340,
    value: null
});

Ext.define('CWN2.button.Print.WidthField', {
    extend: 'Ext.form.NumberField',
    alias: "widget.cwn2-btn-print-width-field",
    fieldLabel: 'Larghezza (pixel)',
    allowBlank: false,
    value: "1",
    minValue: 1,
    maxValue: 2024,
    width: 160
});

Ext.define('CWN2.button.Print.ScaleField', {
    extend: 'Ext.form.field.Checkbox',
    alias: "widget.cwn2-btn-print-scale-field",
    boxLabel: 'Mantieni Scala',
    checked   : true
});

Ext.define('CWN2.button.Print.HeightField', {
    extend: 'Ext.form.NumberField',
    alias: "widget.cwn2-btn-print-height-field",
    fieldLabel: 'Altezza (pixel)',
    allowBlank: false,
    value: "1",
    minValue: 1,
    maxValue: 2024,
    width: 160
});

// CONTROLLER
Ext.define('CWN2.controller.button.print', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.Print'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-print'
        },
        {
            ref: 'win',
            selector: 'cwn2-print-win'
        },
        {
            ref: 'format',
            selector: 'cwn2-btn-print-format-combo'
        },
        {
            ref: 'width',
            selector: 'cwn2-btn-print-width-field'
        },
        {
            ref: 'height',
            selector: 'cwn2-btn-print-height-field'
        },
        {
            ref: 'title',
            selector: 'cwn2-btn-print-title-field'
        },
        {
            ref: 'orientation',
            selector: 'cwn2-btn-print-orientation-combo'
        },
        {
            ref: 'pageSize',
            selector: 'cwn2-btn-print-pagesize-combo'
        },
        {
            ref: 'scale',
            selector: ' cwn2-btn-print-scale-field'
        },
        {
            ref: 'pngFieldSet',
            selector: ' cwn2-btn-print-pngfieldset'
        },
        {
            ref: 'pdfFieldSet',
            selector: ' cwn2-btn-print-pdffieldset'
        }



    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.print: init');

        this.control({
            'button[action=print-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=print-cancel]': {
                click: this.onCancelButtonClick
            },
            'cwn2-btn-print-format-combo': {
                select: this.onFormatSelect
            },
            'cwn2-button-print': {
                click: this.onClick
            }
        });
    },

    onClick: function() {
        var mapPanel = CWN2.app.layout.mapPanel,
            win = this.getWin(),
            button = this.getButton(),
            me = this;

        if (!win) {
            win = Ext.create('CWN2.button.Print.Window', {
            });
        }
        this.showHideWin(win, mapPanel);

    },

    showHideWin: function(win, mapPanel) {
        if (!win.isVisible()) {
            win.show();
            this.setFieldValues();
            this.enableFieldSets();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        } else {
            win.hide();
        }
    },

    setFieldValues: function() {
        var widthField = this.getWidth(),
            heightField = this.getHeight(),
            titleField = this.getTitle();
        if (widthField.value === 1) {
            widthField.setValue(CWN2.app.map.div.scrollWidth);
        }
        if (heightField.value === 1) {
            heightField.setValue(CWN2.app.map.div.scrollHeight);
        }
        if (titleField.value === null || titleField.value === "") {
            titleField.setValue(CWN2.app.layout.mapTitle);
        }
    },

    enableFieldSets: function() {
        var fileType = this.getFormat().value;
        if (fileType === "png") {
            this.getPngFieldSet().enable();
            this.getPdfFieldSet().disable();
        } else {
            this.getPngFieldSet().disable();
            this.getPdfFieldSet().enable();
        }
    },

    onFormatSelect: function() {
        this.enableFieldSets();
    },


    onCancelButtonClick: function() {
        this.getWin().hide();
    },

    onSubmitButtonClick: function(button, e, eOpts) {
        var me = this,
            win = this.getWin(),
            fileType = this.getFormat().value,
            width = this.getWidth().value,
            height = this.getHeight().value,
            title = this.getTitle().value || null,
            scale = this.getScale().value,
            orientation = this.getOrientation().value,
            pageSize = this.getPageSize().value;


        if (fileType === "pdf") {
            var ratio = CWN2.app.map.div.scrollHeight/CWN2.app.map.div.scrollWidth;
            switch (pageSize) {
                case "A4":
                    if (orientation === "portrait") {
                        width = 900;
                        height = parseInt(width*ratio);
                    } else {
                        height = 800;
                        width = parseInt(height/ratio)
                    }
                    break;
                case "A3":
                    if (orientation === "portrait") {
                        width = 1400;
                        height = parseInt(width*ratio);
                    } else {
                        height = 1150;
                        width = parseInt(height/ratio)
                    }
                    break;
                case "A5":
                    if (orientation === "portrait") {
                        width = 750;
                        height = parseInt(width*ratio);
                    } else {
                        height = 600;
                        width = parseInt(height/ratio)
                    }
                    break;
            }

        }

        // costruisco configurazione
        var data = {
            printConfig: {
                fileType : fileType,
                title: title,
                width : width,
                height : height,
                pageSize : pageSize,
                orientation : orientation
            },
            mapOptions: {
                projection : CWN2.app.map.projection,
                extent : CWN2.app.map.getExtent().toString(),
                center : {
                    lon: CWN2.app.map.center.lon,
                    lat: CWN2.app.map.center.lat
                },
                zoom : CWN2.app.map.zoom,
                flagSameScale : scale,
                scale: CWN2.app.map.getScale()
            },
            baseLayers: [
                CWN2.app.map.layerManager.getActiveBaseLayerConfig()
            ],
            layers: CWN2.app.map.layerManager.overlayLayersConfig
        };

        CWN2.loadingScreen = Ext.getBody().mask('Preparazione Stampa', 'loadingscreen');

        // chiamo servizio di stampa della mappa
        CWN2.Util.ajaxRequest({
            type: "JSON",
            url: "/geoservices/REST/gv_print/print",
            callBack: function(response) {
                //CWN2.loadingScreen = Ext.getBody().mask('Preparazione Stampa', 'loadingscreen');
                var exception = {};
                if (!response ) {
                    exception.message = response.responseText;
                    exception.level = 2;
                    CWN2.Util.handleException(exception);
                    return;
                }
                if (response.success === false) {
                    exception.message = response.message;
                    exception.level = 2;
                    CWN2.Util.handleException(exception);
                    return;
                }
                CWN2.Util.log('Preparato file di stampa: ' + response.url);
                var strWindowFeatures = "menubar=yes,location=no,resizable=no,scrollbars=no,status=no";
                var popup = window.open(response.url, '', strWindowFeatures);
                popup.focus();
                win.hide();
            },
            jsonData: data
        });

        if (fileType === "pdf") {
            // chiamo servizio di stampa della legenda
            CWN2.Util.ajaxRequest({
                type: "JSON",
                url: "/geoservices/REST/gv_print/print_legend",
                callBack: function(response) {
                    var exception = {};
                    if (!response ) {
                        exception.message = response.responseText;
                        exception.level = 2;
                        CWN2.Util.handleException(exception);
                        return;
                    }
                    if (response.success === false) {
                        exception.message = response.message;
                        exception.level = 2;
                        CWN2.Util.handleException(exception);
                        return;
                    }
                    Ext.each(response.url, function(url,index) {
                        //CWN2.Util.log('Preparato file di stampa della legenda: ' + url);
                        var strWindowFeatures = "menubar=yes,location=no,resizable=no,scrollbars=no,status=no";
                        window.open(url, '', strWindowFeatures);
                        win.hide();
                    });


                },
                jsonData: data
            });
        }
    }

});
Ext.define('CWN2.button.QpgTematismi', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-qpgtematismi',

    constructor: function(config) {
        var btnOptions = config.options;

        this.config = config;
        this.superclass.constructor.call(this, {
            id: "qpgtematismi",
            tooltip: CWN2.I18n.get("Tematismi"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "tematismi",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false
        });
    }
});

Ext.define('CWN2.button.QpgTematismi.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-btn-qpgtematismi-win',
    closeAction: 'hide',
    title: CWN2.I18n.get("Modifica Tematismo"),
    height: 450,
    width: 350,
    layout: "fit",
    resizable: false,

    constructor: function(config) {
        var me = this;

        this.items = [

            {
                xtype: 'cwn2-btn-qpgtematismi-panel',
                tematismi: config.tematismi
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.QpgTematismi.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-qpgtematismi-panel',
    height: "auto",
    width: "auto",
    frame: true,
    buttons: [
        {
            text: CWN2.I18n.get("Ricalcola Classi"),
            action: "qpgtematismi-recalc"
        },
        {
            text: CWN2.I18n.get("Modifica Tema"),
            action: "qpgtematismi-submit"
        }
/*
        ,{
            text: CWN2.I18n.get("Annulla"),
            action: "qpgtematismi-cancel"
        }
*/
    ],
    autoScroll: true,
    constructor: function(config) {
        this.items = [
            {
                xtype: 'cwn2-btn-qpgtematismi-temi-combo',
                tematismi: config.tematismi
            },
            {
                xtype: 'cwn2-btn-qpgtematismi-tipo-combo',
                tematismo: config.tematismi[0]
            },
            {
                xtype: 'cwn2-btn-qpgtematismi-classi-combo',
                tematismo: config.tematismi[0]
            },
            {
                xtype: 'cwn2-btn-qpgtematismi-scala-colore-combo',
                tematismo: config.tematismi[0]
            },
            {
                xtype: 'cwn2-btn-qpgtematismi-grid-panel',
                tematismo: config.tematismi[0]
            }
        ];
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.QpgTematismi.TemiCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-qpgtematismi-temi-combo",
    fieldLabel: 'Tematismo',
    labelWidth: 70,
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    valueField: "idTema",
    displayField: "descrizione",
    width: 300,
    constructor: function(config) {
        Ext.define('QpgTematismi', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'idTema', type: 'number'},
                {name: 'descrizione', type: 'string'}
            ]
        });
        this.store = Ext.create('Ext.data.Store', {
            model: 'QpgTematismi',
            data: {"tematismi": config.tematismi},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'tematismi'
                }
            }
        });
        this.superclass.constructor.call(this);
        this.setValue(this.getStore().getAt(0).data.descrizione);
    }
});

Ext.define('CWN2.button.QpgTematismi.TipoCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-qpgtematismi-tipo-combo",
    fieldLabel: 'Tipo',
    labelWidth: 70,
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    valueField: "id",
    displayField: "tipo",
    width: 300,
    constructor: function(config) {

        this.store = [
            [1, "Uguale Ampiezza degli Intervalli"],
            [2, "Uguale numero di occorrenze (quantili)"],
            [3, "Personalizzata"]
        ];

        this.superclass.constructor.call(this);
        this.setValue(config.tematismo.idTipoClassificazione);
    }
});

Ext.define('CWN2.button.QpgTematismi.ClassiCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-qpgtematismi-classi-combo",
    fieldLabel: 'Num. Classi',
    labelWidth: 70,
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    //valueField: "numClassi",
    //displayField: "numClassi",
    width: 200,
    constructor: function(config) {
        this.store = [
            [2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[9,9]
        ];

        this.superclass.constructor.call(this);
        this.setValue(config.tematismo.numClassi);
    }
});

Ext.define('CWN2.button.QpgTematismi.ScalaColoreCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-qpgtematismi-scala-colore-combo",
    fieldLabel: 'Scala Colore',
    labelWidth: 70,
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    width: 200,
    constructor: function(config) {
        this.store = [
            ["Rosso","Rosso"],["Verde","Verde"],["Blu","Blu"]
            //,["Random","Random"]
        ];

        this.superclass.constructor.call(this);
        this.setValue(config.tematismo.scalaColore);
    }
});

Ext.define('CWN2.button.QpgTematismi.GridPanel', {

    extend: 'Ext.grid.Panel',
    alias: "widget.cwn2-btn-qpgtematismi-grid-panel",

    constructor: function(config) {


        function getRenderIcon(value, metaData, record) {
            return "<img id='legend_img_" + record.internalId + "' src='" + record.data.legendIcon + "' >";
        }

        Ext.define('QpgTematismiGridClassi', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'legendIcon', type: 'string'},
                {name: 'from', type: 'number'},
                {name: 'to', type: 'number'},
                {name: 'count', type: 'number'}
            ]
        });

        var store = Ext.create('Ext.data.Store', {
            model: 'QpgTematismiGridClassi',
            data: {"classes": config.tematismo.legendClasses},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'classes'
                }
            }
        });


        this.superclass.constructor.call(this, {
            store: store,
            viewConfig: {
                forceFit: true
            },
            width: 230,
            height: 250,
            margin: '15 0 0 0',
            title: null,
            hideHeaders: true,
            disableSelection: true,
            columns: [
                {
                    xtype: 'actioncolumn',
                    dataIndex: "legendIcon",
                    renderer: getRenderIcon,
                    width: 30
                },
                {
                    dataIndex: "from",
                    editor: {
                        xtype:'numberfield',
                        allowBlank:false
                    },
                    renderer :  function(val) {
                        if (config.tematismo.separatoreDecimale === ",") {
                            numeral.language('it');
                        } else {
                            numeral.language('en');
                        }
                        return numeral(val).format('0000.00');
                    },
                    width: 60
                },
                {
                    dataIndex: "to",
                    editor: {
                        xtype:'numberfield',
                        allowBlank:false
                    },
                    renderer :  function(val) {
                        if (config.tematismo.separatoreDecimale === ",") {
                            numeral.language('it');
                        } else {
                            numeral.language('en');
                        }
                        return numeral(val).format('0000.00');
                    },
                    width: 60
                },
                {
                    dataIndex: "count",
                    renderer :  function(val) {
                        return "(" + val + ")";
                    },
                    width: 60
                }
            ],
            //autoScroll: true,
            frame: true,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        });

        var grid = this;

/*        this.on('edit', function(editor, e) {
            // modifico il valore della classe adiacente
            if (e.colIdx === 1 && e.rowIdx > 0) {
                var record = grid.getView().getRecord(grid.getView().getNode(e.rowIdx-1));
                record.set("to",e.value)
            }
            if (e.colIdx === 2 && e.rowIdx < e.store.data.length) {
                var record = grid.getView().getRecord(grid.getView().getNode(e.rowIdx+1));
                record.set("from",e.value)
            }
        });*/
    }



});

// CONTROLLER
Ext.define('CWN2.controller.button.qpgtematismi', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.QpgTematismi',
        'CWN2.button.QpgTematismi.GridPanel'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-qpgtematismi'
        },
        {
            ref: 'win',
            selector: 'cwn2-btn-qpgtematismi-win'
        },
        {
            ref: 'panel',
            selector: 'cwn2-btn-qpgtematismi-panel'
        },
        {
            ref: 'gridPanel',
            selector: 'cwn2-btn-qpgtematismi-grid-panel'
        },
        {
            ref: 'temi',
            selector: 'cwn2-btn-qpgtematismi-temi-combo'
        },
        {
            ref: 'tipo',
            selector: 'cwn2-btn-qpgtematismi-tipo-combo'
        },
        {
            ref: 'classi',
            selector: 'cwn2-btn-qpgtematismi-classi-combo'
        },
        {
            ref: 'scalaColore',
            selector: 'cwn2-btn-qpgtematismi-scala-colore-combo'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.qpgtematismi: init');

        this.control({
            'cwn2-button-qpgtematismi': {
                click: this.onClick
            },
            'cwn2-btn-qpgtematismi-temi-combo': {
                select: this.onThemesSelect
            },
            'cwn2-btn-qpgtematismi-grid-panel': {
                edit: this.onGridEdit
            },
            'button[action=qpgtematismi-recalc]': {
                click: this.onRecalcButtonClick
            },
            'button[action=qpgtematismi-submit]': {
                click: this.onSubmitButtonClick
            }

        });
    },

    onGridEdit: function(editor, e) {
        var me = this;
        var grid = this.getGridPanel();
        if (e.colIdx === 1 && e.rowIdx > 0) {
            var record = grid.getView().getRecord(grid.getView().getNode(e.rowIdx-1));
            if (record && record.data.to !== e.value) {
                record.set("to",e.value);
            }
        }
        if (e.colIdx === 2 && e.rowIdx < e.store.data.length) {
            var record = grid.getView().getRecord(grid.getView().getNode(e.rowIdx+1));
            if (record && record.data.from !== e.value) {
                record.set("from", e.value);
            }
        }

        if (this.checkChangedBounds()) {
            // imposto tipo personalizzato in combo
            this.getTipo().setValue(3);
        }

    },


    checkChangedBounds: function() {
        var me = this;

        var records = this.getGridPanel().getStore().getRange();
        var oldData = this.getTematismo(this.selectedTheme).legendClasses;
        var changed = false;

        Ext.each(records, function(record, index) {
            if (record.data.from !== oldData[index].from || record.data.to !== oldData[index].to) {
                changed = true;
            }
        });

        return changed;

    },


    calculateStats: function (tematismo) {
        var records = this.getGridPanel().getStore().getRange();
        var bounds = []
        Ext.each(records, function (record, index) {
            if (index === 0) {
                bounds.push(record.data.from);
            }
            bounds.push(record.data.to);
        });
        CWN2.QPG.calculateStats(tematismo, bounds);
    },

    onRecalcButtonClick: function() {
        var me = this;

        var tema = this.getTematismo(this.selectedTheme);

        var tematismo = {};

        // imposto proprietà
        tematismo.tipoTematismo = tema.tipoTematismo;
        tematismo.descrizione = tema.descrizione;
        tematismo.valori = tema.valori;
        tematismo.separatoreDecimale = tema.separatoreDecimale;
        tematismo.livello = Ext.clone(tema.livello);
        tematismo.idTipoClassificazione = this.getTipo().getValue();
        tematismo.numClassi = this.getClassi().getValue();
        tematismo.scalaColore = this.getScalaColore().getValue();

        // calcolo statistiche
        this.calculateStats(tematismo);

        // chiamo servizio di scrittura SLD
        CWN2.Util.ajaxRequest({
            type: "JSON",
            url: CWN2.Globals.RL_CREATE_SLD_SERVICE,
            callBack: function (response) {
                CWN2.QPG.loadQPGLayer(tematismo, response.data.sldUrl);
                // ricarico panel grid
                me.reloadGridPanel(tematismo);
            },
            jsonData: {"sldBody": tematismo.stat.sldBody, "sldCleanBody": ""},
            disableException: true
        });

    },


    onSubmitButtonClick: function() {
        var me = this;

        var tematismo = this.getTematismo(this.selectedTheme);

        // imposto proprietà modificate
        tematismo.idTipoClassificazione = this.getTipo().getValue();
        tematismo.numClassi = this.getClassi().getValue();
        tematismo.scalaColore = this.getScalaColore().getValue();

        // calcolo statistiche
        this.calculateStats(tematismo);

        // chiamo servizio di scrittura SLD
        CWN2.Util.ajaxRequest({
            type: "JSON",
            url: CWN2.Globals.RL_CREATE_SLD_SERVICE,
            callBack: function (response) {
                // calcolo rules
                tematismo.layerConfig.classes = CWN2.QPG.getRules(tematismo, "http://geoservizi.regione.liguria.it/geoserver/QPG_TEMI/", response.data.sldUrl);
                // cambio stylemap
                tematismo.olLayer.styleMap = CWN2.LayerFactory.createVectorStyleMap(tematismo.layerConfig);
                // cambio url
                tematismo.olLayer.url = "http://geoservizi.regione.liguria.it/geoserver/QPG_TEMI/wms?VIEWPARAMS=ID_RICHIESTA:" + tematismo.idRichiesta + ";ID_TEMA:" + tematismo.idTema + "&SLD=" + response.data.sldUrl;
                //refresh layer
                tematismo.olLayer.redraw(true);
                //refresh grid panel
                me.reloadGridPanel(tematismo);
            },
            jsonData: {"sldBody": tematismo.stat.sldBody, "sldCleanBody": ""},
            disableException: true
        });
    },

    getTematismo: function (idTema) {
        var tematismo;

        var tematismi = CWN2.app.configuration.qpgRequest.tematismi;
        Ext.each(tematismi, function(tema) {
            if (tema.idTema === idTema) {
                tematismo = tema;
                return false;
            }
        });
        return tematismo;
    },

    onThemesSelect: function(combo, records, eOpts) {
        var me = this;

        this.selectedTheme = records[0].data.idTema;

        var tematismo = this.getTematismo(records[0].data.idTema);

        // aggiorno le combo
        me.getTipo().setValue(tematismo.idTipoClassificazione);
        me.getClassi().setValue(tematismo.numClassi);
        me.getScalaColore().setValue(tematismo.scalaColore);

        // ricarico panel grid
        this.reloadGridPanel(tematismo);
    },

    reloadGridPanel: function(tematismo) {
        var me = this;
        Ext.suspendLayouts();
        var panel = this.getPanel();
        var gridPanel = this.getGridPanel();
        panel.remove(gridPanel);
        panel.add({
            xtype: 'cwn2-btn-qpgtematismi-grid-panel',
            tematismo: tematismo
        });

        Ext.resumeLayouts(true);
    },

    onClick: function() {
        var win = this.getWin(),
            button = this.getButton(),
            me = this;

        var tematismi = CWN2.app.configuration.qpgRequest.tematismi;
        var flagTematismi = false;
        Ext.each(tematismi, function(tematismo) {
            if (tematismo.idTipoClassificazione > 0) {
                flagTematismi = true;
                return false;
            }
        });
        if (flagTematismi) {
            if (!win) {
                win = Ext.create('CWN2.button.QpgTematismi.Window', {
                    tematismi: tematismi
                });
            }
            this.showHideWin(win, CWN2.app.layout.mapPanel);
        } else {
            CWN2.Util.msgBox("Nessun tematismo editabile");
            return;
        }
        this.selectedTheme = tematismi[0].idTema;

    },

    selectedTheme: null,

    showHideWin: function(win, mapPanel) {
    if (!win.isVisible()) {
        win.show();
        win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
    } else {
        win.hide();
    }
}
});




Ext.define('CWN2.button.RemoveLayers', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-removelayers',

    constructor: function(config) {
        var btnOptions = config.options,
            id = "removelayers",
            map = CWN2.app.map;

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: CWN2.I18n.get("Togli Livelli"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false,
            id: id,
            handler: function() {

            }
        });

    }
});

Ext.define('CWN2.button.RemoveLayers.GridPanel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cwn2-removelayers-grid',
    id: "remove-layer-panel",
    disableSelection: true,
    header: false,
    hideHeaders: true,
    columns: [
        {
            dataIndex: "name",
            renderer: function(id) {
                return "<input name='" + id + "' id='rm_check_" + id + "' type='checkbox' >";
            },
            width: 25
        },
        {
            dataIndex: "legend",
            renderer: function(legend, metaData, record) {
                var label = record.data.legendLabel;
                return "<div>" + label + " </div>";
            },
            width: 275
        }
    ],
    autoScroll: true,
    width: 320,
    frame: true,

    constructor: function(config) {
        this.store = config.store;

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.RemoveLayers.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-removelayers-win',
    title: CWN2.I18n.get("Seleziona i livelli da eliminare"),
    height: 300,
    width: 360,
    layout: "fit",
    resizable: false,
    closable: false,
    closeAction: "hide",

    constructor: function(config) {
        this.items = [
            {
                xtype: 'cwn2-removelayers-grid',
                store: config.store
            }
        ];
        this.buttons = config.buttons;

        this.superclass.constructor.call(this);
    }
});

// CONTROLLER
Ext.define('CWN2.controller.button.removelayers', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.RemoveLayers',
        'CWN2.button.RemoveLayers.Window'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-removelayers'
        },
        {
            ref: 'win',
            selector: 'cwn2-removelayers-win'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.removelayers: init');

        this.control({
            'cwn2-button-removelayers': {
                click: this.onClick
            },
            'button[action=removelayers-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=removelayers-cancel]': {
                click: this.onCancelButtonClick
            }
        });
    },

    onSubmitButtonClick: function() {
        var rmLayerArray = [];
        Ext.each(CWN2.app.map.layerManager.getLayersConfig(), function(layer) {
            var check = window.document.getElementById("rm_check_" + layer.name);
            if (check && check.checked) {
                rmLayerArray.push(layer.name);
            }
        });
        // aggiorno la applicazione
        CWN2.app.map.layerManager.remove(rmLayerArray);
        // nascondo la finestra
        this.getWin().hide();
    },

    onCancelButtonClick: function() {
        this.getWin().hide();
    },

    onClick: function() {
        var mapPanel = CWN2.app.layout.mapPanel,
            win = this.getWin(),
            button = this.getButton(),
            me = this;

        if (!win) {
            win = Ext.create('CWN2.button.RemoveLayers.Window', {
                store: CWN2.app.map.layerManager.getLayerStore("overlay"),
                buttons: [
                    {
                        action: "removelayers-submit",
                        text: CWN2.I18n.get("Rimuovi")
                    },
                    {
                        action: "removelayers-cancel",
                        text: CWN2.I18n.get("Annulla")
                    }
                ]
            });
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
    }

});Ext.define('CWN2.button.Risknat', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-risknat',

    constructor: function(config) {
        var btnOptions = config.options,
            id = "risknat";

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: CWN2.I18n.get("Caricamento Livelli Risknat"),
            pressed: false,
            id: id,
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26
        });

    }
});

Ext.define('CWN2.button.Risknat.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-risknat-win',
    title: CWN2.I18n.get("Caricamento Livelli Risknat"),
    height: 205,
    width: 335,
    resizable: false,
    layout: "fit",
    closeAction: "hide",
    buttons: [
        {
            text: CWN2.I18n.get("Carica"),
            action: "risknat-submit"
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: "risknat-cancel"
        }
    ]
});

Ext.define('CWN2.button.Risknat.TabPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.cwn2-btn-risknat-tab-panel',
    activeTab: 0,
    bodyBorder: false,
    deferredRender: false,
    layoutOnTabChange: true,
    border: false,
    flex: 1,
    plain: true
});

Ext.define('CWN2.button.Risknat.Target', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-risknat-target-panel',
    frame: true,
    labelWidth: 1,
//    bodyStyle: "padding:10px 5px 0",
    height: 215,
    type: 'target'
});

Ext.define('CWN2.button.Risknat.Aree', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-risknat-aree-panel',
    frame: true,
    labelWidth: 1,
    height: 215,
    type: 'aree'
});


Ext.define('CWN2.button.Risknat.DatasetCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-risknat-dataset-combo",
    mode: 'remote',
    typeAhead: true,
    triggerAction: 'all',
    value: "Scegli un dataset...",
    valueField: "codice",
    displayField: "label",
    margin: '10 0 0 0',

    width: 300,
    constructor: function(config) {
        var url = "/geoservices/REST/risknat/ds_list?type=" + config.type;
        Ext.define('DatasetModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'codice', type: 'integer'},
                {name: 'label', type: 'string'},
                {name: 'extent', type: 'string'}
            ]
        });
        this.store = Ext.create('Ext.data.Store', {
            fields: [
                'codice',
                'label',
                'extent'
            ],
            proxy: {
                type: 'ajax',
                url: url,
                reader: {
                    type: 'json',
                    root: 'dataset'
                },
                listeners: {
                    exception: {
                        fn: function (el, response, operation, eOpts) {
                            var exception = {};
                            exception.message = "Errore caricamento dataset";
                            exception.level = 2;
                            CWN2.Util.handleException(exception);
                        }
                    }
                }
            },
            autoLoad: true
        });
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.Risknat.DatasetComboAree', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-risknat-dataset-combo-aree",
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    value: "Scegli un dataset...",
    valueField: "codice",
    displayField: "label",
    margin: '10 0 0 0',

    width: 300,
    constructor: function(config) {
        var url = "/geoservices/REST/risknat/ds_list?type=" + config.type;
        Ext.define('DatasetModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'codice', type: 'integer'},
                {name: 'label', type: 'string'},
                {name: 'extent', type: 'string'}
            ]
        });
        this.store = Ext.create('Ext.data.Store', {
            fields: [
                'codice',
                'label',
                'extent'
            ],
            proxy: {
                type: 'ajax',
                url: url,
                reader: {
                    type: 'json',
                    root: 'dataset'
                },
                listeners: {
                    exception: {
                        fn: function (el, response, operation, eOpts) {
                            var exception = {};
                            exception.message = "Errore caricamento dataset";
                            exception.level = 2;
                            CWN2.Util.handleException(exception);
                        }
                    }
                }
            },
            autoLoad: true
        });
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.Risknat.TargetSubmit', {
    extend: 'Ext.button.Button',
    alias: "widget.cwn2-btn-risknat-target-submit",
    text: "Carica..."
});

// CONTROLLER
Ext.define('CWN2.controller.button.risknat', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.Risknat'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-risknat'
        },
        {
            ref: 'win',
            selector: 'cwn2-risknat-win'
        },
        {
            ref: 'datasetCombo',
            selector: 'cwn2-btn-risknat-dataset-combo'
        },
        {
            ref: 'datasetComboAree',
            selector: 'cwn2-btn-risknat-dataset-combo-aree'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.risknat: init');

        this.control({
            'cwn2-button-risknat': {
                click: this.onClick
            },
            'button[action=risknat-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=risknat-cancel]': {
                click: this.onCancelButtonClick
            }
        });
    },

    onSubmitButtonClick: function() {
        var activeTab = Ext.ComponentQuery.query('cwn2-btn-risknat-tab-panel')[0].getActiveTab();

        var me = this,
            dsCombo = (activeTab.type === "target")? this.getDatasetCombo() : this.getDatasetComboAree(),
            id_dataset = dsCombo.value;


        if (isNaN(parseInt(id_dataset))) {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Nessun Dataset selezionato"));
        } else {
            var label = dsCombo.findRecordByValue(id_dataset).data["label"];
            var extent = dsCombo.findRecordByValue(id_dataset).data["extent"];
            // carico layer
            switch (activeTab.type) {
                case "target":
                    me.caricaTarget(id_dataset,label);
                    break;
                case "aree":
                    me.caricaAree(id_dataset,label);
                    break;
            }

            // faccio eventuale zoom
            if (Ext.getCmp('risknat-zoom-checkbox').value) {
                CWN2.app.map.zoomToExtent(OpenLayers.Bounds.fromString(CWN2.Util.transformStrBounds("EPSG:3003", CWN2.app.map.projection, extent)));
            }

            this.getWin().hide();
        }


    },

    caricaAree: function(id_dataset,label) {
        var me = this,
            button = this.getButton();


        //var wmsUrl = "http://geoservizi.regione.liguria.it/geoserver/RISKNAT/wms?"
        //var wmsUrl = "http://geoservizi.datasiel.net:8080/geoserver/RISKNAT/wms?";
        var wmsUrl = button.config.options.serviceUrl || "http://geoservizi.datasiel.net:8080/geoserver/RISKNAT/wms?";

        wmsUrl += "VIEWPARAMS=ID_DATASET:" + id_dataset
        var layerName = "AREE_DS" + id_dataset;

/*
        var value = "" + id_dataset + "";
        var sld = CWN2.WmsSldHiliter.getStyle({
            layers: layerName,
            geomType: ["POLYGON"],
            fields: "ID_DATASET",
            values: [value]
        });
*/

        CWN2.app.map.layerManager.addLayers(
            {
                type: "WMS",
                name: layerName,
                queryable: true,
                flagGeoserver: true,
                visible: true,
                geomSubType: "POLYGON",
                multiClasse: true,
                wmsParams: {
                    url: wmsUrl,
                    transparent: true,
                    //sld_body: sld,
                    name: "AREE_ANOMALE",
                    format: "image/png8"
                },
                "infoOptions": {
                    "infoUrl": "http://www.cartografiarl.regione.liguria.it/mapfiles/info/repertoriocartografico/RISKNATAreePubblico.xsl",
                    "infoTarget": "info",
                    "infoIdAttr": "ID_AREA",
                    "infoLabelAttr": "ID_AREA"
                },
                legend: {
                    label: label + " - Aree Anomale",
                    icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/classi.gif"
                }
            }
        );
    },

    caricaTarget: function(id_dataset,label) {
        var me = this,
            button = this.getButton();

        //var wmsUrl = "http://geoservizi.regione.liguria.it/geoserver/RISKNAT/wms?"
        //var wmsUrl = "http://geoservizi.datasiel.net:8080/geoserver/RISKNAT/wms?";
        var wmsUrl = button.config.options.serviceUrl || "http://geoservizi.datasiel.net:8080/geoserver/RISKNAT/wms?";
        var layerName =  "TARGET_DS" + id_dataset;

        CWN2.app.map.layerManager.addLayers(
            {
                type: "WMS",
                name: layerName,
                minScale: "150000",
                queryable: true,
                flagGeoserver: true,
                visible: true,
                multiClasse: true,
                wmsParams: {
                    url: wmsUrl,
                    transparent: true,
                    name: layerName,
                    format: "image/png8"
                },
                "infoOptions": {
                    "infoUrl": "http://www.cartografiarl.regione.liguria.it/mapfiles/info/repertoriocartografico/RisknatTarget.xsl",
                    "infoTarget": "info",
                    "infoIdAttr": "ID",
                    "infoLabelAttr": "CODE_TARGET"
                },
                legend: {
                    label: label + " - Target",
                    icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/classi.gif"
                }
            }
        );
    },

    onCancelButtonClick: function() {
        this.getWin().hide();
    },

    onClick: function() {
        var mapPanel = CWN2.app.layout.mapPanel,
            win = this.getWin(),
            button = this.getButton(),
            me = this;

        if (!win) {
            var tabs = [];
            tabs.push({
                xtype: 'cwn2-btn-risknat-target-panel',
                title: "Target",
                items: [
                    {
                        xtype: 'cwn2-btn-risknat-dataset-combo',
                        type: "target"
                    },
                    {
                        xtype: 'button',
                        text : 'Info sul Dataset',
                        margin: '10 0 0 0',
                        handler: function() {
                            var id_dataset = me.getDatasetCombo().value;

                            if (isNaN(parseInt(id_dataset))) {
                                Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Nessun Dataset selezionato"));
                            } else {
                                var label = me.getDatasetCombo().findRecordByValue(id_dataset).data["label"];
                                window.open('http://www.cartografiarl.regione.liguria.it/RiskNat/pdf/' + label + '.pdf');
                            }

                        }
                    },
                    {
                        xtype: 'checkbox',
                        boxLabel  : 'Zoom sul Dataset',
                        name      : 'risknat-zoom-checkbox',
                        inputValue: '1',
                        margin: '10 0 0 0',
                        id        : 'risknat-zoom-checkbox'
                    }
                ]
            });
            tabs.push({
                xtype: 'cwn2-btn-risknat-aree-panel',
                title: "Aree Anomale",
                items: [
                    {
                        xtype: 'cwn2-btn-risknat-dataset-combo-aree',
                        type: "aree"
                    },
                    {
                        xtype: 'button',
                        text : 'Info sul Dataset',
                        margin: '10 0 0 0',
                        handler: function() {
                            var id_dataset = me.getDatasetCombo().value;

                            if (isNaN(parseInt(id_dataset))) {
                                Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Nessun Dataset selezionato"));
                            } else {
                                var label = me.getDatasetCombo().findRecordByValue(id_dataset).data["label"];
                                window.open('http://www.cartografiarl.regione.liguria.it/RiskNat/pdf/' + label + '.pdf');
                            }

                        }
                    },
                    {
                        xtype: 'checkbox',
                        boxLabel  : 'Zoom sul Dataset',
                        name      : 'risknat-zoom-checkbox',
                        inputValue: '1',
                        margin: '10 0 0 0',
                        id        : 'risknat-zoom-checkbox'
                    }
                ]
            });
            win = Ext.create('CWN2.button.Risknat.Window', {
                items: [
                    {
                        xtype: 'cwn2-btn-risknat-tab-panel',
                        id: "risknat-tabpanel",
                        items: tabs
                    }
                ]

            });
        }
        this.showHideWin(win, mapPanel);
    },

    showHideWin: function(win, mapPanel) {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        }
    }


});
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



Ext.define('CWN2.button.S3Ricerche', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-s3ricerche',

    constructor: function(config) {
        var btnOptions = config.options;

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: (btnOptions && btnOptions.tooltip) ? btnOptions.tooltip : CWN2.I18n.get("Ricerca avanzata"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : btnOptions.id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            id: btnOptions.id
        });
    }
});

// CONTROLLER
Ext.define('CWN2.controller.button.s3ricerche', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.S3Ricerche'
    ],

    refs: [
        {
            ref: 'buttonS3ricerche',
            selector: '#s3ricerche'
        },
        {
            ref: 'buttonS3RicercaPraticaGenioWeb',
            selector: '#s3RicercaPraticaGenioWeb'
        },
        {
            ref: 'win',
            selector: 'cwn2-button-s3ricerche'
        }

    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.s3ricerche: init');

        this.control({
            '#s3ricerche': {
                click: this.onClickS3ricerche
            },
            '#s3RicercaPraticaGenioWeb': {
                click: this.onClickS3RicercaPraticaGenioWeb
            }
        });
    },

    onClickS3ricerche: function() {
        this.createWin(this.getButtonS3ricerche());
    },

    onClickS3RicercaPraticaGenioWeb: function() {
        this.createWin(this.getButtonS3RicercaPraticaGenioWeb());
    },

    createWin: function(button) {
        var mapPanel = CWN2.app.layout.mapPanel,
            width = button.config.options.panelWidth || 400,
            height =button.config.options.panelHeight || 400,
            winId = button.config.options.id + "-win";

        var win = Ext.ComponentQuery.query("#" + winId)[0];
        if (!win) {
            win = Ext.create('CWN2.IframeWindow', {
                url: button.config.options.url,
                id: winId,
                width: width,
                height: height,
                resizable: false,
                hide: true
            });
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
    }
});
Ext.define('CWN2.button.SelectFeature', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-selectfeature',

    constructor: function(config) {
        this.config = config;
        var btnOptions = config.options,
            map = CWN2.app.map,
            id = "selectfeature",
            me = this;

        // instanzio i gestori dei layer di evidenziazione (uno per ogni livello)
        this.layers = btnOptions.idLayer.split(",");
        this.wmsSldHiliter = {};
        for (var i = 0; i < this.layers.length; i++) {
            this.wmsSldHiliter[this.layers[i]] = new CWN2.WmsSldHiliter(map, "_selezione_" + this.layers[i]);
        }

        // Creo il controllo OL per il bottone
        var control = new OpenLayers.Control.WMSGetFeatureInfo({
            layers: null,
            queryVisible: true,
            name: "selectfeature",
            drillDown: true,
            maxFeatures: 1,
            vendorParams: (btnOptions.radius) ? {radius: btnOptions.radius} : null,
            infoFormat: "application/vnd.ogc.gml",
            output: "object",
            eventListeners: {
                getfeatureinfo: function(event) {
                    me.fireEvent("getfeatureinfo", event);
                }
            }
        });

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Seleziona"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "select",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            enableToggle: true,
            control: control,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

Ext.define('CWN2.button.selectFeature.Store', {
    extend: 'Ext.data.Store',
    data: [],
    autoLoad: false,
    fields: [
        {
            name: "ID_LAYER", mapping: "ID_LAYER"
        },
        {
            name: "ID", mapping: "ID"
        },
        {
            name: "LABEL", mapping: "LABEL"
        }
    ]
});

Ext.define('CWN2.button.selectFeature.GridPanel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cwn2-selectfeature-grid',
    frame: true,
    width: 300,
    height: 300,
    hideHeaders: true,
    iconCls: "icon-grid",
    store: Ext.create('CWN2.button.selectFeature.Store'),
    columns: [
        {
            header: "ID",
            sortable: true,
            dataIndex: "ID",
            width: 70
        },
        {
            header: "LABEL",
            sortable: true,
            dataIndex: "LABEL",
            width: 200
        },
        {
            xtype: 'actioncolumn',
            header: " ",
            items: [
                {
                    icon: 'http://geoportale.regione.liguria.it/geoviewer/img/silk/delete.png',
                    tooltip: 'Seleziona per cancellare'
                }
            ],
            width: 30
        }
    ]
});

Ext.define('CWN2.button.selectFeature.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-selectfeature-win',
    title: CWN2.I18n.get("Oggetti Selezionati"),
    width: 335,
    height: 360,
    layout: "fit",
    closable: false,
    closeAction: "hide",
    items: [
        Ext.create("CWN2.button.selectFeature.GridPanel")
    ],
    buttons: [
        {
            text: CWN2.I18n.get("Conferma"),
            action: 'selectfeature-submit'
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: 'selectfeature-cancel'
        }
    ]
});

// CONTROLLER
Ext.define('CWN2.controller.button.selectfeature', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.SelectFeature'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-selectfeature'
        },
        {
            ref: 'win',
            selector: 'cwn2-selectfeature-win'
        },
        {
            ref: 'grid',
            selector: 'cwn2-selectfeature-grid'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.selectfeature: init');

        this.control({
            'cwn2-button-selectfeature': {
                toggle: this.onButtonPress,
                getfeatureinfo: this.onGetFeatureInfo
            },
            'button[action=selectfeature-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=selectfeature-cancel]': {
                click: this.onCancelButtonClick
            },
            'cwn2-selectfeature-grid actioncolumn': {
                click: this.onDeleteClick
            }

        });

    },

    onSubmitButtonClick: function() {
        var button = this.getButton(),
            items = this.getGrid().store.data.items;

        if (items.length === 0) {
            alert('Selezionare almeno un oggetto');
            return;
        }
        if (button.config.options && button.config.options.callBacks && button.config.options.callBacks["submit"]) {
            button.config.options.callBacks["submit"](items);
        } else {
            CWN2.Util.log("Funzione di callback 'submit' non definita", 1);
        }
    },

    onCancelButtonClick: function() {
        var button = this.getButton(),
            items = this.getGrid().store.data.items;
        if (button.config.options && button.config.options.callBacks && button.config.options.callBacks["cancel"]) {
            button.config.options.callBacks["cancel"](items,this.getButton());
        } else {
            CWN2.Util.log("Funzione di callback 'cancel' non definita", 1);
        }
    },

    onDeleteClick: function(view, cell, row, col, e) {
        var me = this;
        Ext.MessageBox.confirm(
            CWN2.I18n.get('Conferma'),
            CWN2.I18n.get('Sei sicuro?'),
            function(btn) {
                if (btn === "yes") {
                    var store = Ext.ComponentQuery.query('cwn2-selectfeature-grid')[0].store;
                    store.removeAt(row);
                    me.updateHiliteLayer(store);
                }
            }
        );
    },

    onGetFeatureInfo: function(event) {
        this.updateList(event);
    },

    onButtonPress: function() {
        var mapPanel = CWN2.app.layout.mapPanel,
            win = this.getWin(),
            button = this.getButton(),
            me = this,
            map = CWN2.app.map;

        // costruisco la finestra
        win = this.getWin() || Ext.create("CWN2.button.selectFeature.Window");

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

    updateList: function(event) {
        var button = this.getButton(),
            me = this;

        Ext.each(button.layers, function(idLayer) {
            var featureGroups = event.features;
            Ext.each(featureGroups, function(featureGroup) {
                var features = featureGroup.features;
                Ext.each(features, function(feature) {
                    if (feature.type === idLayer || (feature.gml && feature.gml.featureType === idLayer)) {
                        // se definita la funzione di controllo la eseguo
                        if (button.config.options && button.config.options.callBacks && button.config.options.callBacks["check"]) {
                            // se la funzione di controllo ritorna false esco altrimenti aggiorno store
                            if (!button.config.options.callBacks["check"](feature)) {
                                return false;
                            }
                        }
                        updateStore(feature.attributes, idLayer);
                        return false; // forzo uscita da each
                    }
                });
            });
        });

        function updateStore(attributes, idLayer) {
            var record = buildRecordFromFeatureAttributes(attributes, idLayer);
            var store = Ext.ComponentQuery.query('cwn2-selectfeature-grid')[0].store,
                idValue = record["ID"],
                recordIndex = store.findBy(
                    function(record, id) {
                        return record.get('ID') === idValue;
                    }
                );
            // se già presente in store lo levo altrimenti lo aggiungo
            (recordIndex !== -1) ? store.removeAt(recordIndex) : addRecordToStore(store, record);
            // aggiorno il layer di evidenziazione
            me.updateHiliteLayer(store);
        }

        // Aggiungo il record allo store
        function addRecordToStore(store, rec) {
            if (button.config.options.flagSelezioneSingola) {
                store.removeAll();
            }
            store.add(rec);
        }

        // Costruisce un record da aggiungere alla lista delle feature trovate
        // a partire dalla lista degli attributes della feature
        function buildRecordFromFeatureAttributes(attributes, idLayer) {

            var record = null;
            // prendo idField e labelField da config layer
            var layerConfig = CWN2.app.map.layerManager.getLayerConfigByName(idLayer);
            var idField = layerConfig.infoOptions.infoIdAttr;
            var labelField = layerConfig.infoOptions.infoLabelAttr;
            if (layerConfig.cachePostGIS) {
                idField = idField.toLowerCase();
                labelField = labelField.toLowerCase();
            }
            // se idField non è impostato mando exception
            if (!idField) {
                var exception = {
                    name: 'BadConfiguration',
                    message: 'CWN2.button.selectFeature: infoOptions.infoIdAttr non impostato per layer ' + idLayer,
                    level: 1
                };
                CWN2.util.handleException(exception);
                return null;
            }
            // se labelField è nullo lo imposto a idField
            if (!labelField) {
                labelField = idField;
            }
            // imposto l'oggetto da restituire
            if (attributes[idField]) {
                record = {};
                record.ID_LAYER = idLayer;
                record.ID = attributes[idField];
                if (attributes[labelField]) {
                    record.LABEL = attributes[labelField];
                } else {
                    record.LABEL = attributes[idField];
                    CWN2.Util.log("CWN2.button.selectFeature: valore non trovato per campo ID per layer " + idLayer);
                }
                record.LABEL = attributes[labelField];
            } else {
                CWN2.Util.log("CWN2.button.selectFeature: valore non trovato per campo ID per layer " + idLayer);
            }
            return record;
        }
    },

    updateHiliteLayer: function(store) {
        var elementiSelezionati = store.data.items,
            button = this.getButton(),
            me = this,
            layers = button.layers;

        for (var i = 0; i < layers.length; i++) {
            var layerName = layers[i];
            var layerConfig = CWN2.app.map.layerManager.getLayerConfigByName(layerName);
            var values = [];
            Ext.each(elementiSelezionati, function(record, ind) {
                (record.data["ID_LAYER"] == layerName) ? values.push(record.data["ID"]) : null;
            });
            // Istanzio wmsSldFilter relativo al layer in oggetto
            (values.length > 0 ) ?
                button.wmsSldHiliter[layerName].hiliteFeature({
                    layers: [layerConfig.name],
                    fields: layerConfig.infoOptions.infoIdAttr,
                    values: values
                }) :
                button.wmsSldHiliter[layerName].cleanHiliteLayer(layerName)
        }
    }

});/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.button.SimpleLegend', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-simplelegend',

    constructor: function(config) {
        var btnOptions = config.options;

        this.config = config;

        this.superclass.constructor.call(this, {
            id: "simpleLegend",
            tooltip: "Legenda",
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "legend",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false
        });

    }
});

Ext.define('CWN2.button.SimpleLegend.Win', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-simplelegend-win',
    title: "Legenda",
    autoScroll: true,
    layout: "fit",
    height: 430,
    width: 260,
    resizable: false,
    closeAction: "hide"
});

Ext.define('CWN2.controller.button.simpleLegend', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.SimpleLegend'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-simplelegend'
        },
        {
            ref: 'win',
            selector: 'cwn2-simplelegend-win'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.simpleLegend: init');

        this.control({
            'cwn2-button-simplelegend': {
                click: this.onClick
            }
        });
    },

    onClick: function() {
        var win = this.getWin(),
            button = this.getButton();

        var noBaseLayerGrid = (button.config.options && button.config.options.noBaseLayerGrid)? button.config.options.noBaseLayerGrid : false;

        if (!win) {
            win = Ext.create('CWN2.button.SimpleLegend.Win', {
                items: [
                    new CWN2.SimpleLegendPanel({
                        flagBtn: true,
                        noBaseLayerGrid: noBaseLayerGrid
                    })
                ]
            });
        }
        this.showHideWin(win, CWN2.app.layout.mapPanel);
    },

    showHideWin: function(win, mapPanel) {
        if (!win.isVisible()) {
            win.show();
            win.alignTo(mapPanel.body, "tr-tr", [-10, 10]);
        } else {
            win.hide();
        }
    }
});
Ext.define('CWN2.button.Transparency', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-transparency',

    constructor: function(config) {
        var btnOptions = config.options;

        this.superclass.constructor.call(this, {
            id: "transparency",
            tooltip: CWN2.I18n.get("Trasparenza"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "transparency",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false
        });
    }
});

Ext.define('CWN2.button.Transparency.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-transparency-win',

    title: CWN2.I18n.get("Trasparenza"),
    height: 300,
    width: 330,
    layout: "fit",
    resizable: false,

    constructor: function(config) {
        var sliders = [];
        Ext.each(config.layers, function(layer, i) {
            var olLayer = config.mapPanel.map.getLayerByName(layer.data.name);
            sliders.push({
                xtype: "gx_opacityslider",
                layer: olLayer,
                aggressive: true,
                width: 300,
                isFormField: true,
                labelWidth: 150,
                fieldLabel: layer.data.legendLabel
            });
        });

        this.items = [
            {
                xtype: 'panel',
                height: "auto",
                width: "auto",
                frame: true,
                items: sliders,
                autoScroll: true
            }
        ];

        this.superclass.constructor.call(this);
    }
});

// CONTROLLER
Ext.define('CWN2.controller.button.transparency', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.Transparency'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-transparency'
        },
        {
            ref: 'win',
            selector: 'cwn2-transparency-win'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.transparency: init');

        this.control({
            'cwn2-button-transparency': {
                click: this.onClick
            }
        });
    },

    onClick: function() {
        var mapPanel = CWN2.app.layout.mapPanel,
            win = this.getWin(),
            button = this.getButton(),
            me = this;

        if (!win) {
            win = Ext.create('CWN2.button.Transparency.Window', {
                layers: CWN2.app.map.layerManager.getLayerStore("overlay").data.items,
                mapPanel: CWN2.app.layout.mapPanel
            });
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
    }

});Ext.define('CWN2.button.ZoomIn', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-zoomin',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            id = "zoomin",
            control = new OpenLayers.Control.ZoomBox();

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Zoom In"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});



Ext.define('CWN2.button.ZoomNext', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-zoomnext',

    constructor: function(config) {
        var btnOptions = config.options,
            btnPanels = config.panels,
            map = CWN2.app.map,
            id = "zoomnext";

        function getNavigationHistoryControl() {
            var historyControl = null,
                controls = map.getControlsByClass("OpenLayers.Control.NavigationHistory");
            if (controls.length === 0) {
                historyControl = new OpenLayers.Control.NavigationHistory();
                map.addControl(historyControl);
            } else {
                historyControl = controls[0];
            }
            return historyControl;
        }

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            tooltip: CWN2.I18n.get("Zoom Successivo"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            disabled: true,
            control: getNavigationHistoryControl().next,
            pressed: false,
            id: id
        }));
    }
});




Ext.define('CWN2.button.ZoomOut', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-zoomout',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            id = "zoomout",
            control = new OpenLayers.Control.ZoomBox({out: true});

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Zoom Out"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            enableToggle: true,
            control: control,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});


Ext.define('CWN2.button.ZoomPrevious', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-zoomprevious',

    constructor: function(config) {
        var btnOptions = config.options,
            btnPanels = config.panels,
            map = CWN2.app.map,
            id = "zoomprevious";

        function getNavigationHistoryControl() {
            var historyControl = null,
                controls = map.getControlsByClass("OpenLayers.Control.NavigationHistory");
            if (controls.length === 0) {
                historyControl = new OpenLayers.Control.NavigationHistory();
                map.addControl(historyControl);
            } else {
                historyControl = controls[0];
            }
            return historyControl;
        }

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            tooltip: CWN2.I18n.get("Zoom Precedente"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            disabled: true,
            control: getNavigationHistoryControl().previous,
            pressed: false,
            id: id
        }));
    }
});

Ext.define('CWN2.button.ZoomToInitialExtent', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-zoomtoinitialextent',

    constructor: function(config) {
        var btnOptions = config.options,
            map = CWN2.app.map,
            id = "zoomToInitialExtent",
            control = new CWN2.Control.ZoomToInitialExtent();

        map.addControl(control);

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            tooltip: CWN2.I18n.get("Zoom alla estensione iniziale"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false,
            control: control,
            id: id
        }));
    }
});


Ext.define('CWN2.button.redirect', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-redirect',

    constructor: function(config) {
        var btnOptions = config.options;

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: (btnOptions && btnOptions.tooltip) ? btnOptions.tooltip : CWN2.I18n.get("Redirect"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : btnOptions.id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            id: btnOptions.id
        });
    }
});

// CONTROLLER
Ext.define('CWN2.controller.button.redirect', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.redirect'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-redirect'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.redirect: init');

        this.control({
            'cwn2-button-redirect': {
                click: this.onClick
            }
        });
    },

    onClick: function() {
        window.location.href = this.getButton().config.options.url;
    }

});
Ext.define('CWN2.button.window', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-window',

    constructor: function(config) {
        var btnOptions = config.options;

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: (btnOptions && btnOptions.tooltip) ? btnOptions.tooltip : CWN2.I18n.get("Finestra"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : btnOptions.id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            id: btnOptions.id
        });
    }
});

// CONTROLLER
Ext.define('CWN2.controller.button.window', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.window'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-window'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.window: init');

        this.control({
            'cwn2-button-window': {
                click: this.onClick
            }
        });
    },

    onClick: function() {
        this.createWin(this.getButton());
    },

    createWin: function(button) {
        var mapPanel = CWN2.app.layout.mapPanel,
            width = button.config.options.winWidth || 600,
            height = button.config.options.winHeight || 400,
            url = button.config.options.url,
            resizable = button.config.options.resizable || false,
            target = button.config.options.target || "panel",
            winId = button.config.options.id + "-win";

        if (!url) {
            CWN2.Util.handleException({
                message: "Url del bottone 'window' non definita",
                level: 1
            });
            return;
        }
        if (target === "panel") {
            var win = Ext.ComponentQuery.query("#" + winId)[0];
            if (!win) {
                win = Ext.create('CWN2.IframeWindow', {
                    url: url,
                    id: winId,
                    width: width,
                    height: height,
                    resizable: resizable,
                    hide: true
                });
            }
            this.showHideWin(win, mapPanel);
        } else {
                window.open(url,"menubar=no,location=no,resizable=no,scrollbars=yes,status=no,width=" + width + ",height=" + height);
        }
    },

    showHideWin: function(win, mapPanel) {
        if (!win.isVisible()) {
            win.show();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        } else {
            win.hide();
        }
    }
});
/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.Widget.Button', {
    constructor: function(widgetConfig, statusbar) {
        "use strict";
        CWN2.Util.log('CWN2.Widget.button');

        var id = widgetConfig.id,
            text = "bottone",
            handler = null,
            width = null;

        if (!widgetConfig.id) {
            CWN2.Util.log("Attenzione: id widget Button non definito", 0);
        }
        var map = CWN2.app.map;

        if (widgetConfig.options) {
            if (widgetConfig.options.text) {
                text = widgetConfig.options.text;
            }
            if (widgetConfig.options.handler) {
                handler = widgetConfig.options.handler;
            }
            if (widgetConfig.options.width) {
                width = widgetConfig.options.width;
            }
            if (widgetConfig.options.align && widgetConfig.options.align === "right") {
                statusbar.addStatusbarItem('->');
            }
        }

        return [
            {
                xtype: "button",
                id: id,
                text: CWN2.I18n.get(text),
                width: width,
                handler: handler
            }
        ];
    }
});





/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.Widget.CoordinateReadOut', {
    constructor: function(widgetConfig, statusbar) {
        "use strict";
        CWN2.Util.log('CWN2.Widget.CoordinateReadOut');

        var statusBarItemName = "cwn2-coordinate-readout-div";
        var map = CWN2.app.map;

        // funzione di callback richiamata sull'evento mousemove
        function drawMeasure(e) {
            var lonLat = map.getLonLatFromPixel(e.xy),
                decimalPlaces = 0,
                text;

            if (map.displayProjection) {
                if (map.displayProjection.projCode === "EPSG:4326") {
                    decimalPlaces = 6;
                }
                lonLat.transform(map.getProjectionObject(), map.displayProjection);
            }

            text = " X=" + lonLat.lon.toFixed(decimalPlaces) + " Y=" + lonLat.lat.toFixed(decimalPlaces);

            statusbar.setStatusbarItemText(statusBarItemName, text);

        }

        // registro l'evento sul mousemove (scrittura coodinate su statusbar)
        map.events.register("mousemove", map, drawMeasure);

        return [CWN2.I18n.get("Coordinate:"), {
            id: statusBarItemName,
            text: '',
            width: 200,
            xtype: "tbtext"
        }];
    }
});




/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.Widget.Scale', {
    constructor: function(widgetConfig, statusbar) {
        "use strict";
        CWN2.Util.log('CWN2.Widget.Scale');

        var statusBarItemName = "cwn2-scale-div";
        var map = CWN2.app.map;

        function drawScale() {
            var text = " 1:" + map.getScale().toFixed(0);
            statusbar.setStatusbarItemText(statusBarItemName, text);
        }

        // registro l'evento sul mousemove (scrittura coodinate su statusbar)
        map.events.register("zoomend", map, drawScale);

        drawScale();

        return [CWN2.I18n.get("Scala"), {
            id: statusBarItemName,
            text: '',
            width: 60,
            xtype: "tbtext"
        }];
    }
});

/*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false*/
Ext.define('CWN2.Widget.ScaleCombo', {
    constructor: function(widgetConfig, statusbar) {
        "use strict";
        CWN2.Util.log('CWN2.Widget.ScaleCombo');

        var statusBarItemName = "cwn2-scale-combo-div";
        var map = CWN2.app.map;

        function drawScale() {
            combo.setValue(map.zoom.toString());
        }

        // registro l'evento sul mousemove (selezione combo)
        map.events.register("zoomend", map, drawScale);

        var scales = Ext.create('Ext.data.Store', {
            fields: ['zoom', 'scale'],
            data : [
//                {"zoom":"7", "scale":"3.200.000"},
                {"zoom":"8", "scale":"1:1.600.000"},
                {"zoom":"9", "scale":"1:800.000"},
                {"zoom":"10", "scale":"1:400.000"},
                {"zoom":"11", "scale":"1:200.000"},
                {"zoom":"12", "scale":"1:100.000"},
                {"zoom":"13", "scale":"1:50.000"},
                {"zoom":"14", "scale":"1:25.000"},
                {"zoom":"15", "scale":"1:12.500"},
                {"zoom":"16", "scale":"1:6.250"},
                {"zoom":"17", "scale":"1:3.125"},
                {"zoom":"18", "scale":"1:1.560"},
                {"zoom":"19", "scale":"1:800"},
                {"zoom":"20", "scale":"1:400"}
            ]
        });

        var combo = Ext.create('Ext.form.ComboBox', {
            store: scales,
            queryMode: 'local',
            displayField: 'scale',
            valueField: 'zoom',
            width: 100,
            editable: false,
            listeners:
            {
                select: function (cmb, record, index)
                {
                    var zoom = parseInt(record[0].data.zoom);
                    if (CWN2.app.map.zoom !== zoom) {
                        CWN2.app.map.zoomTo(zoom);
                    }
                }
            }
        })

        return [CWN2.I18n.get("Scala "), combo];
    }
});
