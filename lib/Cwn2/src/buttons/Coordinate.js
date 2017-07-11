Ext.define('CWN2.button.Coordinate', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-coordinate',

    constructor: function(config) {
        var btnOptions = config.options,
            id = "coordinate",
            map = CWN2.app.map,
            me = this,
            control = new CWN2.Control.DrawPoint(CWN2.Editor.createEditingLayer(map), {singleFeature: true});

        this.config = config;

        // Controllo OL
        control.events.register('featureadded', this, function(event) {
            me.fireEvent("featureadded", event);
        });
        map.addControl(control);

        // Creo il bottone
        this.superclass.constructor.call(this, Ext.create('GeoExt.Action', {
            id: id,
            tooltip: CWN2.I18n.get("Coordinate Punto"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "drawPoint",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            control: control,
            enableToggle: true,
            toggleGroup: "mapInteractToggleGroup"
        }));
    }
});

Ext.define('CWN2.button.Coordinate.Win', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-coordinate-win',
    title: ' Coordinate selezionate',
    width: 300,
    height: 120,
    layout: "fit",
    resizable: false,
    items: [
        {
            xtype: 'panel',
            id: 'cwn2-coordinate-panel',
            bodyPadding: 10
        }
    ],
    geometry: null,
    closable: false,
    fbar: [
        {
            text: CWN2.I18n.get("Conferma"),
            action: 'coordinate-submit'
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: 'coordinate-cancel'
        }
    ]
});

// CONTROLLER
Ext.define('CWN2.controller.button.coordinate', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.Coordinate'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-coordinate'
        },
        {
            ref: 'win',
            selector: 'cwn2-coordinate-win'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.coordinate: init');

        this.control({
            'cwn2-button-coordinate': {
                toggle: this.onButtonPress,
                featureadded: this.onFeatureAdded
            },
            'button[action=coordinate-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=coordinate-cancel]': {
                click: this.onCancelButtonClick
            }
        });

    },

    onSubmitButtonClick: function() {
        var win = this.getWin(),
            btnOptions = this.getButton().config.options;
        if (btnOptions && btnOptions.callBacks && btnOptions.callBacks["submit"]) {
            if (win.geometry) {
                //var geom = win.geometry.clone();
                //if (CWN2.app.map.projection !== CWN2.app.map.displayProjection.projCode) {
                //    geom.transform(new OpenLayers.Projection(CWN2.app.map.projection), CWN2.app.map.displayProjection);
                //}
                btnOptions.callBacks["submit"](win.geometry);
            } else {
                CWN2.Util.handleException({
                    message: "Nessun punto selezionato",
                    level: 1
                });
            }
        } else {
            CWN2.Util.log("Funzione di callback 'submit' non definita", 1);
        }
    },

    onCancelButtonClick: function() {
        var win = this.getWin(),
            btnOptions = this.getButton().config.options;
        if (btnOptions && btnOptions.callBacks && btnOptions.callBacks["cancel"]) {
            btnOptions.callBacks["cancel"]();
        } else {
            CWN2.Util.log("Funzione di callback 'cancel' non definita", 1);
        }
    },

    onButtonPress: function() {
        var win = this.getWin(),
            btnOptions = this.getButton().config.options;

        if (!win) {
            win = Ext.create('CWN2.button.Coordinate.Win');
        }
        this.showHideWin(win, CWN2.app.layout.mapPanel);
    },

    onFeatureAdded: function(event) {
        var win = this.getWin();

        var ntvProjection = this.getButton().config.options.projection;
        var mapProjection = CWN2.app.map.projection;

        if (ntvProjection && ntvProjection !== mapProjection) {
            var srvUrl = "/geoservices/REST/coordinate/transform_point/" + mapProjection.replace("EPSG:","") + "/" + ntvProjection.replace("EPSG:","") + "/" + event.feature.geometry.x + "," + event.feature.geometry.y;
            CWN2.Util.ajaxRequest({
                type: "JSON",
                url: srvUrl,
                callBack: function(data,response) {
                    var point = data.points[0].split(",");
                    updateCoordinate(point[0],point[1])
                    //console.log(data)
                }
            });
        } else {
            updateCoordinate(event.feature.geometry.x,event.feature.geometry.y)
        }


        function updateCoordinate(x,y) {
            x = parseFloat(x);
            y = parseFloat(y);
            win.geometry = {
                x: x, y: y
            };
            var cifreDecimali = (CWN2.app.map.displayProjection.getUnits() === 'm') ? 0 : 6;
            var labelCoord1 = (CWN2.app.map.displayProjection.getUnits() === 'm') ? "X" : "lon";
            var labelCoord2 = (CWN2.app.map.displayProjection.getUnits() === 'm') ? "Y" : "lat";
            var html = "<b>" + labelCoord1 + " = " + x.toFixed(cifreDecimali) + "<br> " + labelCoord2 + " = " + y.toFixed(cifreDecimali);
            Ext.ComponentQuery.query('panel[id="cwn2-coordinate-panel"]')[0].update(html);
        }

    },

    showHideWin: function(win, mapPanel) {
        if (!win.isVisible()) {
            win.show();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        } else {
            win.hide();
        }
    }


});
