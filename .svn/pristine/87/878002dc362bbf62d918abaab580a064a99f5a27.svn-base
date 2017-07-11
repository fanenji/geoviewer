/**
 *
 * Class: CWN2.Toolbar
 *
 *
 * Costruisce la toolbar.
 *
 * Estende Ext.Toolbar
 *
 */

Ext.define('CWN2.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.cwn2-toolbar',

    /**
     *
     * Constructor: CWN2.Toolbar
     *
     * Costruisce la toolbar
     *
     * Parameters:
     * toolbarConfig - {Object} Oggetto configurazione della toolbar.
     *
     *
     */

    constructor: function(toolbarConfig, mapPanel) {
        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false */
        "use strict";
        CWN2.Util.log("CWN2.Toolbar");

        this.config = toolbarConfig;
        var me = this;

        var buttons = [];           // Bottoni attivi (in configurazione)
        var groups = toolbarConfig.itemGroups;
        var scale = toolbarConfig.scale || "small";

        // ciclo su tutti gli elementi della configurazione della toolbar
        Ext.each(groups, function(group, i) {
            if (group) {
                var alignRight = false;
                if (groups[i + 1] && groups[i + 1].align && groups[i + 1].align == "right") {
                    alignRight = true;
                }
                var isLastGroup = (i >= (groups.length - 1));
                addGroup(group.items, isLastGroup, alignRight);
            }
        });

        function addGroup(items, lastGroup, alignRight) {
            if (items) {
                Ext.each(items, function(item, i) {
                    if (typeof(item) !== "function") {
                        buttons.push(me.checkButton(item,scale));
                    }
                });

                // se non è l'ultimo aggiungo un separatore
                if (!lastGroup) {
                    // se il successivo ha align=right lo metto in fondo
                    if (alignRight) {
                        buttons.push("->");
                    } else {
                        buttons.push("-");
                    }
                }
            }
        }

        CWN2.Toolbar.superclass.constructor.call(this, {
            id: "cwn2-toolbar",
            items: buttons
        });

        mapPanel.toolbar = this;
    },

    /**
     *
     * Function: getButtonOptions
     *
     * Ritorna un oggetto contenente le opzioni di configurazione di un bottone
     *
     * Parameters:
     * buttonID - {String} Id del bottone
     *
     */
    getButtonOptions: function(buttonId) {
        var groups = this.config.itemGroups,
            btnOpt = null;

        groups.map(function(group) {
            group.items.map(function(button) {
                if (button.name === buttonId && button.options) {
                    btnOpt = button.options;
                }
            });
        });

        return btnOpt;
    },

    /**
     *
     * Function: checkButton
     *
     * Effettua i controlli sul bottone e ritorna un oggetto con xtype impostato
     *
     * Parameters:
     * buttonID - {String} Id del bottone
     *
     */
    checkButton: function(item,scale) {
        CWN2.Util.log("CWN2.Toolbar: Bottone " + item.name);
        if (item !== '-' && item !== '->') {
            var type = item.type || "button";
            item.xtype = "cwn2-" + type + "-" + item.name.toLowerCase();
            item.scale = scale;
            if (!checkButtonId(item.xtype)) {
                CWN2.Util.handleException({
                    message: "CWN2.Toolbar - Bottone con name: " + item.name.toLowerCase() + " non definito in libreria. Bottone custom?",
                    level: 0
                });
            }
            return item;
        } else {
            return item
        }

        function checkButtonId(xtype) {
            var found = false;
            Ext.iterate(CWN2.button, function(buttonName,button) {
                if (button.xtype === xtype) {
                    found = true;
                    return false;
                }
            });
            return found;
        }
    },

    /**
     *
     * Function: addButton
     *
     * Aggiunge un bottone alla bottoniera
     *
     * Parameters:
     * item - {String} Id del bottone (name)
     *
     */
    addButton: function(item) {
        this.add(this.checkButton(item));
    }    
});
