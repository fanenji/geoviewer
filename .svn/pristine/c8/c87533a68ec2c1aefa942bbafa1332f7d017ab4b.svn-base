/**
 *
 *
 * Class:CWN2.GoogleGeocoderCombo
 * Combo ExtJS per il geocoding google. Estende Ext.form.ComboBox
 *

 *
 */

Ext.define('CWN2.BaseLayersComboBox', {

    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.cwn2-base-layers-combobox',
    queryMode: 'local',
    displayField: 'legendLabel',
    valueField: 'name',
    triggerAction: 'all',
    //fieldLabel: 'Sfondo',
    editable: false,
    width: 150,

    /**
     *
     * Constructor: CWN2.BaseLayersComboBox
     *
     * Crea una combo per la selezione dei layer di sfondo.
     *
     * Parameters:
     * config - {Object} Oggetto configurazione della combo.
     *  - id - {String} Id della combo
     *  - fieldLabel - {String} Label della combo
     *  - width - {Integer} Ampiezza della combo
     *  - listeners - {Object} Oggetto contentente i listener associati alla combo
     *
     *
     */
    constructor: function(config) {
        /*global CWN2:false, window:false, OpenLayers:false, Ext:false, GeoExt:false , $:false , console:false  , opera:false  */
        "use strict";


        this.store = CWN2.app.map.layerManager.baseLayerStore;

        // call parent constructor
        this.superclass.constructor.call(this, config);

        // imposto base layer iniziale
        var baseLayer;
        Ext.each(CWN2.app.map.layerManager.baseLayersConfig, function(layer) {
            if (layer.visible === true) {
                baseLayer = layer.name;
                return false;
            }
        });
        this.setValue(baseLayer);

        this.on({
            select: this.onSelect,
            scope: this
        });

    },

    onSelect: function(cmb, record, index) {
        CWN2.app.map.setBaseLayerOnMap(record[0].data.name);
    }


});

