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
