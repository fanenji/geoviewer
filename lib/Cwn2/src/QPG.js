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

