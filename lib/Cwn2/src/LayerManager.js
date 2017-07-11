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



