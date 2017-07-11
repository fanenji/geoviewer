Ext.define('CWN2.button.ZoomNext', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-zoomnext',

    constructor: function(config) {
        var btnOptions = config.options,
            btnPanels = config.panels,
            map = CWN2.app.map,
            id = "zoomnext";

        function getNavigationHistoryControl() {
            var historyControl = null,
                controls = map.getControlsByClass("OpenLayers.Control.NavigationHistory");
            if (controls.length === 0) {
                historyControl = new OpenLayers.Control.NavigationHistory();
                map.addControl(historyControl);
            } else {
                historyControl = controls[0];
            }
            return historyControl;
        }

        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            tooltip: CWN2.I18n.get("Zoom Successivo"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            disabled: true,
            control: getNavigationHistoryControl().next,
            pressed: false,
            id: id
        }));
    }
});




