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
