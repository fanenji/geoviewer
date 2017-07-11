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