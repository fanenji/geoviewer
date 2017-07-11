Ext.define('CWN2.button.GeocoderCombo', {
    alias: 'widget.cwn2-combo-geocoder',

    constructor: function(config) {

        var btnOptions = config.options || {};

        return Ext.create("CWN2.GeocoderComboBox", {
            id: 'combo-geocoder',
            map: CWN2.app.map,
            hilite: btnOptions.hilite,
            service: "google",
            width: btnOptions.width || 200
        });
    }
});

