/**
 *
 * Class: CWN2.MapPanel
 *
 * Costruisce il pannello per la mappa
 * Estende GeoExt.MapPanel
 *
 *
 */

Ext.define('CWN2.MapPanel', {
    extend: 'GeoExt.panel.Map',
    alias: 'widget.cwn2-mappanel',

    region: "center",
    bodyStyle: "background-color:#FFFFFF",
    border: false,

    /**
     *
     * Constructor: CWN2.MapPanel
     *
     * Costruisce il pannello per la mappa
     *
     * Parameters:
     *
     *
     */
    constructor: function() {
        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false */
        "use strict";
        CWN2.Util.log("CWN2.MapPanel");

        var layoutConfig = CWN2.app.configuration.application.layout;

        this.map = CWN2.app.map = new CWN2.Map(CWN2.app);
        this.id = "cwn2-map-panel";

        // costruisco statusbar e toolbar
        var dockedItems = [];
        if (layoutConfig.statusBar) {
            var statusbar = new CWN2.Statusbar(layoutConfig.widgets);
            dockedItems.push(statusbar);
        }
        if (layoutConfig.toolbar) {
            this.pressedButton = layoutConfig.toolbar.pressed || "pan";
            var toolbar = new CWN2.Toolbar(layoutConfig.toolbar, this);
            dockedItems.push(toolbar);
        }

        // se caricamento dinamico mappa imposto titolo provvisorio per evitare peroblemi di shift a layer google
        var title = ((CWN2.app.initOptions.idMap || CWN2.app.initOptions.idRequest) && !CWN2.app.initOptions.setMapTitle) ?
            "_" : layoutConfig.mapTitle || null;

        var panelOptions = {
            id: this.id,
            title: title,
            map: this.map,
            dockedItems: dockedItems
        };

        this.superclass.constructor.call(this, panelOptions);

        // Lancio eventi ExtJS per selezione feature
        // registro callback su selectfeature
        // TODO: gestire altri eventi
        var me = this;
        me.map.featureManager.registerCallback(
            "onFeatureSelect",
            function(feature) {
                me.fireEvent('featureselect', feature);
            }
        )
    },

    /**
     *
     * Method: getToolbar
     *
     * Ritorna la toolbar del mappanel
     *

     *
     *
     */
    getToolbar: function() {
        return Ext.ComponentQuery.query('cwn2-toolbar')[0];
    }


});
