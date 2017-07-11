/**
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





