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
