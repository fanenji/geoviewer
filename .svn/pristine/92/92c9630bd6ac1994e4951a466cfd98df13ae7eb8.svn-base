Ext.define('CWN2.button.LoadLayers', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-loadlayers',

    constructor: function(config) {
        var btnOptions = config.options,
            id = "loadlayers";

        this.config = config;

        this.superclass.constructor.call(this, {
            tooltip: CWN2.I18n.get("Aggiunta Livelli"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : id,
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false,
            id: id
        });
    }
});

Ext.define('CWN2.button.LoadLayers.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-loadlayers-win',

    title: CWN2.I18n.get("Aggiunta Livelli"),
    height: 500,
    width: 700,
    resizable: true,
    layout: "fit",
    closeAction: "hide",
    buttons: [
        {
            text: CWN2.I18n.get("Aggiungi"),
            action: "loadlayers-submit"
        },
        {
            text: CWN2.I18n.get("Annulla"),
            action: "loadlayers-cancel"
        }
    ],
    constructor: function(config) {
        var tabs = Ext.create('CWN2.button.LoadLayers.TabPanel', {
            items: config.items
        });
        //TODO Impostare tab attivo
        if (config.activePanel) {
            tabs.setActiveTab(config.activePanel);
        }
        this.items = tabs;

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.LoadLayers.TabPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.cwn2-loadlayers-tabpanel',
    activeTab: 0,
    bodyBorder: false,
    deferredRender: false,
    layoutOnTabChange: false,
    border: false,
    flex: 1,
    plain: true,

    constructor: function(config) {
        this.items = config.items;

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.LoadLayers.TreePanel', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.cwn2-loadlayers-tree',
    layout: 'anchor',
    rootVisible: false,
    animate: true,
    autoScroll: true,
    nodeType: "async",
    containerScroll: true,
    border: false,
    bodyStyle: "padding:10px",
    bodyBorder: true,
    height: 530,
    useArrows: true,
    multiSelect: true,

    constructor: function(config) {
        this.title = config.title;
        this.store = config.store;
        this.type = config.type;
        this.panelConfig = config.panelConfig;

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.LoadLayers.WmsCapabilitiesUrl', {
    extend: 'Ext.form.field.Text',
    alias: "widget.cwn2-btn-loadlayers-wmsurl-field",
    allowBlank: false,
    value: "",
    width: 500
});



Ext.define('CWN2.button.LoadLayers.WmsPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.cwn2-loadlayers-wmspanel',
    height: 530,
    title: "Servizi WMS",
    bodyStyle: "padding:5px 5px 0",


    constructor: function(config) {
        this.type = "wms";
        this.panelConfig = config.panelConfig;

        this.items = [
            {
                xtype: 'fieldcontainer',
                border: false,
                width: 600,
                flex: 1,
                layout: 'hbox',
                items: [
                    {
                        xtype: 'cwn2-btn-loadlayers-wmsurl-field',
                        fieldLabel: 'URL Capabilities'
                    },
                    {
                        xtype: 'tbfill'
                    },
                    {
                        xtype: 'button',
                        text: 'Lista Layer',
                        handler: function() {
                            var store = Ext.data.StoreManager.lookup('wmscapsStore')
                            var url = Ext.ComponentQuery.query("cwn2-btn-loadlayers-wmsurl-field")[0].value;
                            if (url.indexOf("?") === -1) {
                                url += "?"
                            }
                            if (url.toUpperCase().indexOf("REQUEST=GETCAPABILITIES") === -1) {
                                url += "&REQUEST=GETCAPABILITIES"
                            }
                            if (url.toUpperCase().indexOf("SERVICE=WMS") === -1) {
                                url += "&SERVICE=WMS"
                            }
                            store.getProxy().url = CWN2.Globals.proxy + url;
                            store.load();
                        }
                    }
                ]
            },
            Ext.create('CWN2.button.LoadLayers.WmsGrid', {
                panelConfig: config.panelConfig
            })
        ]
        this.superclass.constructor.call(this);
    }

});

Ext.define('CWN2.button.LoadLayers.WmsGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cwn2-loadlayers-wmsgrid',
    height: 380,
    multiSelect: true,
    columns: [
        {header: "Titolo", dataIndex: "title", sortable: true},
        {id: "description", header: "Descrizione", dataIndex: "abstract", flex: 1}
    ],

    constructor: function(config) {

        this.store = Ext.create('GeoExt.data.WmsCapabilitiesStore', {
            storeId: 'wmscapsStore',
            url: null,
            autoLoad: false
        });
        this.type = "wms";
        this.superclass.constructor.call(this);
    }
});


Ext.define('CWN2.button.LoadLayers.KmlPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.cwn2-loadlayers-kmlpanel',
    height: 530,
    title: "File KML/GPX",
    bodyStyle: "padding:5px 5px 0",


    constructor: function(config) {
        this.type = "kml";
        this.panelConfig = config.panelConfig;

        this.items = [
            {
                xtype: 'displayfield',
                //fieldLabel: 'Indicare la URL di un file kml/kmz/gpx oppure selezionare un file ca caricare',
                name: 'home_score',
                value: '<br><b>Selezionare un file da caricare oppure indicare la URL di un file KML/KMZ o GPX (anche zippato)</b><br><br>'
            },
            {
                xtype: 'filefield',
                emptyText: 'Seleziona un file kml/kmz o gpx',
                width: 500,
                regex     : (/.(kml|kmz|gpx|zip)$/i),
                regexText : 'Sono ammessi solo i file con estensione kml/kmz/gpx/zip',
                msgTarget : 'under',
                //buttonOnly: true,
                //allowBlank: false,
                validator: function() {
                    var form = this.up('form').getForm();
                    var urlField = form.findField("kml-url").getValue();
                    if (!this.value && !urlField) {
                        return false;
                    }
                    return true;
                },
                fieldLabel: 'File',
                name: 'kml-file',
                buttonText: 'Browse'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'URL',
                name: 'kml-url',
                allowBlank: true,
                vtype:'url',
                msgTarget : 'under',
                value: "",
                width: 500,
                validator: function() {
                    var form = this.up('form').getForm();
                    var fileField = form.findField("kml-file").getValue();
                    if (!this.value && !fileField) {
                        return false;
                    }
                    return true;
                }
            }

        ]
        this.superclass.constructor.call(this);
    }

});

// CONTROLLER
Ext.define('CWN2.controller.button.loadlayers', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.LoadLayers',
        'CWN2.button.LoadLayers.Window'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-loadlayers'
        },
        {
            ref: 'win',
            selector: 'cwn2-loadlayers-win'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.loadlayers: init');

        this.control({
            'cwn2-button-loadlayers': {
                click: this.onClick
            },
            'button[action=loadlayers-submit]': {
                click: this.onSubmitButtonClick
            },
            'button[action=loadlayers-cancel]': {
                click: this.onCancelButtonClick
            }

        });
    },

    onSubmitButtonClick: function() {
        var activeTab = Ext.ComponentQuery.query('cwn2-loadlayers-tabpanel')[0].getActiveTab();

        switch (activeTab.type) {
            case "map":
                this.mapTreeSubmitHandler(activeTab);
                break;
            case "layer":
                this.layerTreeSubmitHandler(activeTab);
                break;
            case "wms":
                this.wmsSubmitHandler(activeTab);
                break;
            case "kml":
                this.kmlSubmitHandler(activeTab);
                break;
        }
    },

    mapTreeSubmitHandler: function(activeTab) {
        var selNode = activeTab.getSelectionModel().getSelection()[0],
            me = this;

        if (!selNode || !selNode.data.idMap) {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Nessuna carta selezionata"));
            return;
        }

        CWN2.loadingScreen = Ext.getBody().mask('Caricamento Livelli', 'loadingscreen');
        CWN2.Util.ajaxRequest({
            type: "JSONP",
            url: CWN2.Globals.RL_MAP_CONFIG_SERVICE + selNode.data.idMap,
            callBack: function(response) {
                CWN2.app.map.layerManager.addLayers(response.data.layers);
                me.getWin().hide();
            }
        });
    },

    layerTreeSubmitHandler: function(activeTab) {
        var selNodes = activeTab.getSelectionModel().getSelection(),
            me = this,
            layerList = "";

        // costruisco la stringa con i codici dei layer concatenati da virgole
        Ext.each(selNodes, function(node) {
            if (node.data.idLayer) {
                layerList += node.data.idLayer + ",";
            }
        });

        if ((layerList.length) === 0) {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Nessun livello selezionato"));
            return;
        }
        layerList = layerList.substr(0, layerList.length - 1);

        // chiamo il servizio che mi ritorna la configurazione dei layer
        Ext.MessageBox.wait('Caricamento', 'Attendere');
        CWN2.Util.ajaxRequest({
            type: "JSONP",
            url: activeTab.panelConfig.options["layersConfigServiceUrl"] + layerList,
            callBack: function(response) {
                CWN2.app.map.layerManager.addLayers(response.data);
                me.getWin().hide();
                Ext.MessageBox.hide();
            }
        });
    },


    wmsSubmitHandler: function(activeTab) {
        var selNodes = activeTab.items.items[1].getSelectionModel().getSelection(),
            me = this,
            layerList = "",
            srsDefined = true;

        // costruisco la stringa con i codici dei layer concatenati da virgole
        Ext.each(selNodes, function(node) {
            // controllo che srs della mappa sia gestito dal servizio wms
            if (!node.data.srs[CWN2.app.map.projection]) {
                srsDefined = false;
                return false;
            }
            CWN2.app.map.layerManager.addLayers(
                {
                    type: "WMS",
                    name: node.data.name,
                    minScale: node.data.minScale,
                    maxScale: node.data.maxScale,
                    queryable: node.data.queryable,
                    visible: true,
                    wmsParams: {
                        url: node.raw.url,
                        transparent: true,
                        name: node.data.name
                    },
                    legend: {
                        label: node.data.title,
                        icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/classi.gif"
                    }
                }
            );

        });

        if (!srsDefined) {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), CWN2.I18n.get("Sistema di riferimento non gestito"));
        }
        me.getWin().hide();

    },

    kmlSubmitHandler: function(activeTab) {
        var me = this;
        var form = activeTab.form;
        //TODO controllo estensione kml/kmz/gpz/zip
        if(form.isValid()){
            if (form.getValues()["kml-url"]) {
                if (form.getValues()["kml-url"].indexOf("kmz") > -1) {
                    form.submit({
                        url: '/geoservices/REST/utils/kmz_upload_and_unzip/?url=' + form.getValues()["kml-url"],
                        waitMsg: 'Caricamento file....',
                        success: function(fp, o) {
                            me.kmlLoadLayer(o.result.file);
                        },
                        failure: function(form, response) {
                            Ext.Msg.alert(CWN2.I18n.get("Attenzione"), response.result.error);
                        }
                    });
                } else {
                    me.kmlLoadLayer(form.getValues()["kml-url"]);
                }
            } else {
                form.submit({
                    url: '/geoservices/REST/utils/file_upload',
                    waitMsg: 'Caricamento file....',
                    success: function(fp, o) {
                        me.kmlLoadLayer(o.result.file);
                    },
                    failure: function(form, response) {
                        Ext.Msg.alert(CWN2.I18n.get("Attenzione"), response.result.error);
                    }
                });
            }
            me.getWin().hide();
        } else {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), "Indicare una URL o un file da caricare");
        }
    },

    kmlLoadLayer: function(url) {
        if (url.indexOf("kml") === -1 && url.indexOf("gpx") === -1) {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), "Indicare una URL o un file da caricare");
        }
        var type = (url.indexOf("kml") > -1)? "KML" : "GPX";
        var name = url.substring(url.lastIndexOf("/") + 1 , url.length - 4);

        var layerConfig = {
            name: name,
            type: type,
            projection: "EPSG:4326",
            url: url,
            visible: true,
            legend: {
                label: name,
                icon: "http://geoportale.regione.liguria.it/geoviewer/img/legend/classi.gif"
            },
            infoOptions: {
                infoPopUp: "simple",
                infoWidth: 300,
                infoHeight: 300

            }
        };

        if (!CWN2.app.map.layerManager.isLayerInConfigWithTitle(layerConfig)) {
            CWN2.app.map.layerManager.addLayers(layerConfig);
        } else {
            Ext.MessageBox.alert(CWN2.I18n.get("Attenzione"), "File già presente come livello sulla mappa");
        }
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
            var activePanel = 0;
            // ciclo sull'array dei pannelli per costruirli
            Ext.each(button.config.panels, function(panel, index) {
                switch (panel.type) {
                    case "layerTree":
                        tabs.push(me.buildTreePanel(panel, "layer"));
                        break;
                    case "mapTree":
                        tabs.push(me.buildTreePanel(panel, "map"));
                        break;
                    case "wms":
                        tabs.push(me.buildWmsPanel(panel));
                        break;
                    case "kml":
                        tabs.push(me.buildKmlPanel(panel));
                        break;
                }
                if (panel.options.active) {
                    activePanel = index;
                }
            });
            win = Ext.create('CWN2.button.LoadLayers.Window', {
                items: tabs,
                activePanel: activePanel
            });
        }
        this.showHideWin(win, mapPanel);

    },

    showHideWin: function(win, mapPanel) {
        if (!win.isVisible()) {
            win.show();
            win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
        } else {
            win.hide();
        }
    },

    // costruisce un panel di tipo tree per aggiunta mappe o layer
    buildTreePanel: function(panelConfig, type) {
        var idField = (type === "map") ? "idMap" : "idLayer";
        var me = this;

        Ext.define('CWN2.button.LoadLayers.Tree', {
            extend: 'Ext.data.Model',
            fields: [idField, 'text']
        });

        var store = Ext.create('Ext.data.TreeStore', {
            model: 'CWN2.button.LoadLayers.Tree',
            proxy: {
                type: 'jsonp',
                url: panelConfig.options.treeServiceUrl,
                root: 'data'
            },
            root: 'data'
        });
        this.loadTree(store, panelConfig.options.treeServiceUrl);

        return Ext.create('CWN2.button.LoadLayers.TreePanel', {
            title: CWN2.I18n.get(panelConfig.name),
            store: store,
            type: type,
            panelConfig: panelConfig
        });
    },

    loadTree: function(treePanel, treeServiceUrl) {
        CWN2.Util.ajaxRequest({
            type: "JSONP",
            url: treeServiceUrl,
            callBack: function(response) {
                var root = response.data;
                treePanel.setRootNode(root);
            }
        });
    },

    // costruisce un panel per i servizi wms
    buildWmsPanel: function(panelConfig) {
        var me = this;
        return Ext.create('CWN2.button.LoadLayers.WmsPanel', {
            panelConfig: panelConfig
        });
    },

    // costruisce un panel per i servizi wms
    buildKmlPanel: function(panelConfig) {
        var me = this;
        return Ext.create('CWN2.button.LoadLayers.KmlPanel', {
            panelConfig: panelConfig
        });
    }



});