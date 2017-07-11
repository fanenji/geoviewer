/**
 *
 * Class: CWN2.Statusbar
 *
 *
 * Costruisce la statusbar.
 *
 * Estende Ext.Statusbar
 *
 */

Ext.define('CWN2.Statusbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.cwn2-statusbar',

    /**
     *
     * Constructor: CWN2.Statusbar
     *
     * Costruisce la Statusbar
     *
     * Parameters:
     * toolbarConfig - {Object} Oggetto configurazione della toolbar.
     *
     *
     */
    constructor: function(widgets, mapPanel) {
        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false */
        "use strict";
        CWN2.Util.log("CWN2.Toolbar");

        CWN2.Statusbar.superclass.constructor.call(this, {
            id: "cwn2-statusbar",
            cls: "x-statusbar",
            dock: 'bottom'
        });

        // carico i widgets
        var me = this;
        Ext.each(widgets, function(widget) {
            var item = new CWN2.Widget[widget.name](widget, me);
            if (item) {
                me.add(item);
            }
        });
    },

    /**
     * Function: addStatusbarItem
     *
     * Aggiunge un elemento alla Statusbar
     *
     * Parameters:
     * item - {Object} Oggetto configurazione dell'elemento
     *
     */
    addStatusbarItem: function(item) {
        if (item && !Ext.getCmp(item.id)) {
            this.add(item);
        }
    },

    /**
     * Function: setStatusbarItemText
     *
     * Imposta un testo su un item della Statubar
     *
     * Parameters:
     * itemName - {string} Nome dell'elemento
     * text - {string} Testo da scrivere
     *
     */
    setStatusbarItemText: function(itemName, text) {
        if (Ext.getCmp(itemName)) {
            Ext.getCmp(itemName).setText(text);
        }
    }

});
