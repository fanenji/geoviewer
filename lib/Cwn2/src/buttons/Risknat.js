Ext.define('CWN2.button.Risknat', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-risknat',

    constructor: function(config) {
        var btnOptions = config.options,
            id = "risknat";

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: CWN2.I18n.get("Caricamento Livelli Risknat"),
            pressed: false,
            id: id,
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26
        });

    }
});

Ext.define('CWN2.button.Risknat.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-risknat-win',
    title: CWN2.I18n.get("Caricamento Livelli Risknat"),
    height: 205,
    width: 335,
    resizable: false,
    layout: "fit",
    closeAction: "hide",
    buttons: [
        {
            text: CWN2.I18n.get("Carica"),
            action: "risknat-submit"
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: "risknat-cancel"
        }
    ]
});

Ext.define('CWN2.button.Risknat.TabPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.cwn2-btn-risknat-tab-panel',
    activeTab: 0,
    bodyBorder: false,
    deferredRender: false,
    layoutOnTabChange: true,
    border: false,
    flex: 1,
    plain: true
});

Ext.define('CWN2.button.Risknat.Target', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-risknat-target-panel',
    frame: true,
    labelWidth: 1,
//    bodyStyle: "padding:10px 5px 0",
    height: 215,
    type: 'target'
});

Ext.define('CWN2.button.Risknat.Aree', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-risknat-aree-panel',
    frame: true,
    labelWidth: 1,
    height: 215,
    type: 'aree'
});


Ext.define('CWN2.button.Risknat.DatasetCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-risknat-dataset-combo",
    mode: 'remote',
    typeAhead: true,
    triggerAction: 'all',
    value: "Scegli un dataset...",
    valueField: "codice",
    displayField: "label",
    margin: '10 0 0 0',

    width: 300,
    constructor: function(config) {
        var url = "/geoservices/REST/risknat/ds_list?type=" + config.type;
        Ext.define('DatasetModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'codice', type: 'integer'},
                {name: 'label', type: 'string'},
                {name: 'extent', type: 'string'}
            ]
        });
        this.store = Ext.create('Ext.data.Store', {
            fields: [
                'codice',
                'label',
                'extent'
            ],
            proxy: {
                type: 'ajax',
                url: url,
                reader: {
                    type: 'json',
                    root: 'dataset'
                },
                listeners: {
                    exception: {
                        fn: function (el, response, operation, eOpts) {
                            var exception = {};
                            exception.message = "Errore caricamento dataset";
                            exception.level = 2;
                            CWN2.Util.handleException(exception);
                        }
                    }
                }
            },
            autoLoad: true
        });
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.Risknat.DatasetComboAree', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-risknat-dataset-combo-aree",
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    value: "Scegli un dataset...",
    valueField: "codice",
    displayField: "label",
    margin: '10 0 0 0',

    width: 300,
    constructor: function(config) {
        var url = "/geoservices/REST/risknat/ds_list?type=" + config.type;
        Ext.define('DatasetModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'codice', type: 'integer'},
                {name: 'label', type: 'string'},
                {name: 'extent', type: 'string'}
            ]
        });
        this.store = Ext.create('Ext.data.Store', {
            fields: [
                'codice',
                'label',
                'extent'
            ],
            proxy: {
                type: 'ajax',
                url: url,
                reader: {
                    type: 'json',
                    root: 'dataset'
                },
                listeners: {
                    exception: {
                        fn: function (el, response, operation, eOpts) {
                            var exception = {};
                            exception.message = "Errore caricamento dataset";
                            exception.level = 2;
                            CWN2.Util.handleException(exception);
                        }
                    }
                }
            },
            autoLoad: true
        });
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.Risknat.TargetSubmit', {
    extend: 'Ext.button.Button',
    alias: "widget.cwn2-btn-risknat-target-submit",
    text: "Carica..."
});

// CONTROLLER
Ext.define('CWN2.controller.button.risknat', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.Risknat'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-risknat'
        },
        {
            ref: 'win',
            selector: 'cwn2-risknat-win'
        },
        {
            ref: 'datasetCombo',
            selector: 'cwn2-btn-risknat-dataset-combo'
        },
        {
            ref: 'datasetComboAree',
            selector: 'cwn2-btn-risknat-dataset-combo-aree'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.risknat: init');

        this.control({
            'cwn2-button-risknat': {
                click: this.onClick
            },
            'button[action=risknat-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=risknat-cancel]': {
                click: this.onCancelButtonClick
            }
        });
    },

    onSubmitButtonClick: function() {
        var activeTab = Ext.ComponentQuery.query('cwn2-btn-risknat-tab-panel')[0].getActiveTab();

        var me = this,
            dsCombo = (activeTab.type === "target")? this.getDatasetCombo() : this.getDatasetComboAree(),
            id_dataset = dsCombo.value;


        if (isNaN(parseInt(id_dataset))) {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Nessun Dataset selezionato"));
        } else {
            var label = dsCombo.findRecordByValue(id_dataset).data["label"];
            var extent = dsCombo.findRecordByValue(id_dataset).data["extent"];
            // carico layer
            switch (activeTab.type) {
                case "target":
                    me.caricaTarget(id_dataset,label);
                    break;
                case "aree":
                    me.caricaAree(id_dataset,label);
                    break;
            }

            // faccio eventuale zoom
            if (Ext.getCmp('risknat-zoom-checkbox').value) {
                CWN2.app.map.zoomToExtent(OpenLayers.Bounds.fromString(CWN2.Util.transformStrBounds("EPSG:3003", CWN2.app.map.projection, extent)));
            }

            this.getWin().hide();
        }


    },

    caricaAree: function(id_dataset,label) {
        var me = this,
            button = this.getButton();


        //var wmsUrl = "http://geoservizi.regione.liguria.it/geoserver/RISKNAT/wms?"
        //var wmsUrl = "http://geoservizi.datasiel.net:8080/geoserver/RISKNAT/wms?";
        var wmsUrl = button.config.options.serviceUrl || "http://geoservizi.datasiel.net:8080/geoserver/RISKNAT/wms?";

        wmsUrl += "VIEWPARAMS=ID_DATASET:" + id_dataset
        var layerName = "AREE_DS" + id_dataset;

/*
        var value = "" + id_dataset + "";
        var sld = CWN2.WmsSldHiliter.getStyle({
            layers: layerName,
            geomType: ["POLYGON"],
            fields: "ID_DATASET",
            values: [value]
        });
*/

        CWN2.app.map.layerManager.addLayers(
            {
                type: "WMS",
                name: layerName,
                queryable: true,
                flagGeoserver: true,
                visible: true,
                geomSubType: "POLYGON",
                multiClasse: true,
                wmsParams: {
                    url: wmsUrl,
                    transparent: true,
                    //sld_body: sld,
                    name: "AREE_ANOMALE",
                    format: "image/png8"
                },
                "infoOptions": {
                    "infoUrl": "http://www.cartografiarl.regione.liguria.it/mapfiles/info/repertoriocartografico/RISKNATAreePubblico.xsl",
                    "infoTarget": "info",
                    "infoIdAttr": "ID_AREA",
                    "infoLabelAttr": "ID_AREA"
                },
                legend: {
                    label: label + " - Aree Anomale",
                    icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/classi.gif"
                }
            }
        );
    },

    caricaTarget: function(id_dataset,label) {
        var me = this,
            button = this.getButton();

        //var wmsUrl = "http://geoservizi.regione.liguria.it/geoserver/RISKNAT/wms?"
        //var wmsUrl = "http://geoservizi.datasiel.net:8080/geoserver/RISKNAT/wms?";
        var wmsUrl = button.config.options.serviceUrl || "http://geoservizi.datasiel.net:8080/geoserver/RISKNAT/wms?";
        var layerName =  "TARGET_DS" + id_dataset;

        CWN2.app.map.layerManager.addLayers(
            {
                type: "WMS",
                name: layerName,
                minScale: "150000",
                queryable: true,
                flagGeoserver: true,
                visible: true,
                multiClasse: true,
                wmsParams: {
                    url: wmsUrl,
                    transparent: true,
                    name: layerName,
                    format: "image/png8"
                },
                "infoOptions": {
                    "infoUrl": "http://www.cartografiarl.regione.liguria.it/mapfiles/info/repertoriocartografico/RisknatTarget.xsl",
                    "infoTarget": "info",
                    "infoIdAttr": "ID",
                    "infoLabelAttr": "CODE_TARGET"
                },
                legend: {
                    label: label + " - Target",
                    icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/classi.gif"
                }
            }
        );
    },

    onCancelButtonClick: function() {
        this.getWin().hide();
    },

    onClick: function() {
        var mapPanel = CWN2.app.layout.mapPanel,
            win = this.getWin(),
            button = this.getButton(),
            me = this;

        if (!win) {
            var tabs = [];
            tabs.push({
                xtype: 'cwn2-btn-risknat-target-panel',
                title: "Target",
                items: [
                    {
                        xtype: 'cwn2-btn-risknat-dataset-combo',
                        type: "target"
                    },
                    {
                        xtype: 'button',
                        text : 'Info sul Dataset',
                        margin: '10 0 0 0',
                        handler: function() {
                            var id_dataset = me.getDatasetCombo().value;

                            if (isNaN(parseInt(id_dataset))) {
                                Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Nessun Dataset selezionato"));
                            } else {
                                var label = me.getDatasetCombo().findRecordByValue(id_dataset).data["label"];
                                window.open('http://www.cartografiarl.regione.liguria.it/RiskNat/pdf/' + label + '.pdf');
                            }

                        }
                    },
                    {
                        xtype: 'checkbox',
                        boxLabel  : 'Zoom sul Dataset',
                        name      : 'risknat-zoom-checkbox',
                        inputValue: '1',
                        margin: '10 0 0 0',
                        id        : 'risknat-zoom-checkbox'
                    }
                ]
            });
            tabs.push({
                xtype: 'cwn2-btn-risknat-aree-panel',
                title: "Aree Anomale",
                items: [
                    {
                        xtype: 'cwn2-btn-risknat-dataset-combo-aree',
                        type: "aree"
                    },
                    {
                        xtype: 'button',
                        text : 'Info sul Dataset',
                        margin: '10 0 0 0',
                        handler: function() {
                            var id_dataset = me.getDatasetCombo().value;

                            if (isNaN(parseInt(id_dataset))) {
                                Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Nessun Dataset selezionato"));
                            } else {
                                var label = me.getDatasetCombo().findRecordByValue(id_dataset).data["label"];
                                window.open('http://www.cartografiarl.regione.liguria.it/RiskNat/pdf/' + label + '.pdf');
                            }

                        }
                    },
                    {
                        xtype: 'checkbox',
                        boxLabel  : 'Zoom sul Dataset',
                        name      : 'risknat-zoom-checkbox',
                        inputValue: '1',
                        margin: '10 0 0 0',
                        id        : 'risknat-zoom-checkbox'
                    }
                ]
            });
            win = Ext.create('CWN2.button.Risknat.Window', {
                items: [
                    {
                        xtype: 'cwn2-btn-risknat-tab-panel',
                        id: "risknat-tabpanel",
                        items: tabs
                    }
                ]

            });
        }
        this.showHideWin(win, mapPanel);
    },

    showHideWin: function(win, mapPanel) {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        }
    }


});
