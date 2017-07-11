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


