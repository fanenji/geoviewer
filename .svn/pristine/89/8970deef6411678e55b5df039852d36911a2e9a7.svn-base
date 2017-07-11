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

	


