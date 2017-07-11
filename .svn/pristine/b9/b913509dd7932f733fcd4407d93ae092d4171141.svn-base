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





