
Ext.define('CWN2.button.QpgTematismi', {
    extend: 'Ext.button.Button',
    alias: 'widget.cwn2-button-qpgtematismi',

    constructor: function(config) {
        var btnOptions = config.options;

        this.config = config;
        this.superclass.constructor.call(this, {
            id: "qpgtematismi",
            tooltip: CWN2.I18n.get("Tematismi"),
            iconCls: (btnOptions && btnOptions.iconCls) ? btnOptions.iconCls : "tematismi",
            text: (btnOptions && btnOptions.text) ? btnOptions.text : "",
            width: (btnOptions && btnOptions.width) ? btnOptions.width : 26,
            pressed: false
        });
    }
});

Ext.define('CWN2.button.QpgTematismi.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.cwn2-btn-qpgtematismi-win',
    closeAction: 'hide',
    title: CWN2.I18n.get("Modifica Tematismo"),
    height: 450,
    width: 350,
    layout: "fit",
    resizable: false,

    constructor: function(config) {
        var me = this;

        this.items = [

            {
                xtype: 'cwn2-btn-qpgtematismi-panel',
                tematismi: config.tematismi
            }
        ];

        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.QpgTematismi.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cwn2-btn-qpgtematismi-panel',
    height: "auto",
    width: "auto",
    frame: true,
    buttons: [
        {
            text: CWN2.I18n.get("Ricalcola Classi"),
            action: "qpgtematismi-recalc"
        },
        {
            text: CWN2.I18n.get("Modifica Tema"),
            action: "qpgtematismi-submit"
        }
/*
        ,{
            text: CWN2.I18n.get("Annulla"),
            action: "qpgtematismi-cancel"
        }
*/
    ],
    autoScroll: true,
    constructor: function(config) {
        this.items = [
            {
                xtype: 'cwn2-btn-qpgtematismi-temi-combo',
                tematismi: config.tematismi
            },
            {
                xtype: 'cwn2-btn-qpgtematismi-tipo-combo',
                tematismo: config.tematismi[0]
            },
            {
                xtype: 'cwn2-btn-qpgtematismi-classi-combo',
                tematismo: config.tematismi[0]
            },
            {
                xtype: 'cwn2-btn-qpgtematismi-scala-colore-combo',
                tematismo: config.tematismi[0]
            },
            {
                xtype: 'cwn2-btn-qpgtematismi-grid-panel',
                tematismo: config.tematismi[0]
            }
        ];
        this.superclass.constructor.call(this);
    }
});

Ext.define('CWN2.button.QpgTematismi.TemiCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-qpgtematismi-temi-combo",
    fieldLabel: 'Tematismo',
    labelWidth: 70,
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    valueField: "idTema",
    displayField: "descrizione",
    width: 300,
    constructor: function(config) {
        Ext.define('QpgTematismi', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'idTema', type: 'number'},
                {name: 'descrizione', type: 'string'}
            ]
        });
        this.store = Ext.create('Ext.data.Store', {
            model: 'QpgTematismi',
            data: {"tematismi": config.tematismi},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'tematismi'
                }
            }
        });
        this.superclass.constructor.call(this);
        this.setValue(this.getStore().getAt(0).data.descrizione);
    }
});

Ext.define('CWN2.button.QpgTematismi.TipoCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-qpgtematismi-tipo-combo",
    fieldLabel: 'Tipo',
    labelWidth: 70,
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    valueField: "id",
    displayField: "tipo",
    width: 300,
    constructor: function(config) {

        this.store = [
            [1, "Uguale Ampiezza degli Intervalli"],
            [2, "Uguale numero di occorrenze (quantili)"],
            [3, "Personalizzata"]
        ];

        this.superclass.constructor.call(this);
        this.setValue(config.tematismo.idTipoClassificazione);
    }
});

Ext.define('CWN2.button.QpgTematismi.ClassiCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-qpgtematismi-classi-combo",
    fieldLabel: 'Num. Classi',
    labelWidth: 70,
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    //valueField: "numClassi",
    //displayField: "numClassi",
    width: 200,
    constructor: function(config) {
        this.store = [
            [2,2],[3,3],[4,4],[5,5],[6,6],[7,7],[8,8],[9,9]
        ];

        this.superclass.constructor.call(this);
        this.setValue(config.tematismo.numClassi);
    }
});

Ext.define('CWN2.button.QpgTematismi.ScalaColoreCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: "widget.cwn2-btn-qpgtematismi-scala-colore-combo",
    fieldLabel: 'Scala Colore',
    labelWidth: 70,
    mode: 'local',
    typeAhead: true,
    triggerAction: 'all',
    width: 200,
    constructor: function(config) {
        this.store = [
            ["Rosso","Rosso"],["Verde","Verde"],["Blu","Blu"]
            //,["Random","Random"]
        ];

        this.superclass.constructor.call(this);
        this.setValue(config.tematismo.scalaColore);
    }
});

Ext.define('CWN2.button.QpgTematismi.GridPanel', {

    extend: 'Ext.grid.Panel',
    alias: "widget.cwn2-btn-qpgtematismi-grid-panel",

    constructor: function(config) {


        function getRenderIcon(value, metaData, record) {
            return "<img id='legend_img_" + record.internalId + "' src='" + record.data.legendIcon + "' >";
        }

        Ext.define('QpgTematismiGridClassi', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'legendIcon', type: 'string'},
                {name: 'from', type: 'number'},
                {name: 'to', type: 'number'},
                {name: 'count', type: 'number'}
            ]
        });

        var store = Ext.create('Ext.data.Store', {
            model: 'QpgTematismiGridClassi',
            data: {"classes": config.tematismo.legendClasses},
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'classes'
                }
            }
        });


        this.superclass.constructor.call(this, {
            store: store,
            viewConfig: {
                forceFit: true
            },
            width: 230,
            height: 250,
            margin: '15 0 0 0',
            title: null,
            hideHeaders: true,
            disableSelection: true,
            columns: [
                {
                    xtype: 'actioncolumn',
                    dataIndex: "legendIcon",
                    renderer: getRenderIcon,
                    width: 30
                },
                {
                    dataIndex: "from",
                    editor: {
                        xtype:'numberfield',
                        allowBlank:false
                    },
                    renderer :  function(val) {
                        if (config.tematismo.separatoreDecimale === ",") {
                            numeral.language('it');
                        } else {
                            numeral.language('en');
                        }
                        return numeral(val).format('0000.00');
                    },
                    width: 60
                },
                {
                    dataIndex: "to",
                    editor: {
                        xtype:'numberfield',
                        allowBlank:false
                    },
                    renderer :  function(val) {
                        if (config.tematismo.separatoreDecimale === ",") {
                            numeral.language('it');
                        } else {
                            numeral.language('en');
                        }
                        return numeral(val).format('0000.00');
                    },
                    width: 60
                },
                {
                    dataIndex: "count",
                    renderer :  function(val) {
                        return "(" + val + ")";
                    },
                    width: 60
                }
            ],
            //autoScroll: true,
            frame: true,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        });

        var grid = this;

/*        this.on('edit', function(editor, e) {
            // modifico il valore della classe adiacente
            if (e.colIdx === 1 && e.rowIdx > 0) {
                var record = grid.getView().getRecord(grid.getView().getNode(e.rowIdx-1));
                record.set("to",e.value)
            }
            if (e.colIdx === 2 && e.rowIdx < e.store.data.length) {
                var record = grid.getView().getRecord(grid.getView().getNode(e.rowIdx+1));
                record.set("from",e.value)
            }
        });*/
    }



});

// CONTROLLER
Ext.define('CWN2.controller.button.qpgtematismi', {
    extend: 'Ext.app.Controller',

    views: [
        'CWN2.button.QpgTematismi',
        'CWN2.button.QpgTematismi.GridPanel'
    ],

    refs: [
        {
            ref: 'button',
            selector: 'cwn2-button-qpgtematismi'
        },
        {
            ref: 'win',
            selector: 'cwn2-btn-qpgtematismi-win'
        },
        {
            ref: 'panel',
            selector: 'cwn2-btn-qpgtematismi-panel'
        },
        {
            ref: 'gridPanel',
            selector: 'cwn2-btn-qpgtematismi-grid-panel'
        },
        {
            ref: 'temi',
            selector: 'cwn2-btn-qpgtematismi-temi-combo'
        },
        {
            ref: 'tipo',
            selector: 'cwn2-btn-qpgtematismi-tipo-combo'
        },
        {
            ref: 'classi',
            selector: 'cwn2-btn-qpgtematismi-classi-combo'
        },
        {
            ref: 'scalaColore',
            selector: 'cwn2-btn-qpgtematismi-scala-colore-combo'
        }
    ],

    init: function(application) {
        CWN2.Util.log('CWN2.controller.button.qpgtematismi: init');

        this.control({
            'cwn2-button-qpgtematismi': {
                click: this.onClick
            },
            'cwn2-btn-qpgtematismi-temi-combo': {
                select: this.onThemesSelect
            },
            'cwn2-btn-qpgtematismi-grid-panel': {
                edit: this.onGridEdit
            },
            'button[action=qpgtematismi-recalc]': {
                click: this.onRecalcButtonClick
            },
            'button[action=qpgtematismi-submit]': {
                click: this.onSubmitButtonClick
            }

        });
    },

    onGridEdit: function(editor, e) {
        var me = this;
        var grid = this.getGridPanel();
        if (e.colIdx === 1 && e.rowIdx > 0) {
            var record = grid.getView().getRecord(grid.getView().getNode(e.rowIdx-1));
            if (record && record.data.to !== e.value) {
                record.set("to",e.value);
            }
        }
        if (e.colIdx === 2 && e.rowIdx < e.store.data.length) {
            var record = grid.getView().getRecord(grid.getView().getNode(e.rowIdx+1));
            if (record && record.data.from !== e.value) {
                record.set("from", e.value);
            }
        }

        if (this.checkChangedBounds()) {
            // imposto tipo personalizzato in combo
            this.getTipo().setValue(3);
        }

    },


    checkChangedBounds: function() {
        var me = this;

        var records = this.getGridPanel().getStore().getRange();
        var oldData = this.getTematismo(this.selectedTheme).legendClasses;
        var changed = false;

        Ext.each(records, function(record, index) {
            if (record.data.from !== oldData[index].from || record.data.to !== oldData[index].to) {
                changed = true;
            }
        });

        return changed;

    },


    calculateStats: function (tematismo) {
        var records = this.getGridPanel().getStore().getRange();
        var bounds = []
        Ext.each(records, function (record, index) {
            if (index === 0) {
                bounds.push(record.data.from);
            }
            bounds.push(record.data.to);
        });
        CWN2.QPG.calculateStats(tematismo, bounds);
    },

    onRecalcButtonClick: function() {
        var me = this;

        var tema = this.getTematismo(this.selectedTheme);

        var tematismo = {};

        // imposto proprietà
        tematismo.tipoTematismo = tema.tipoTematismo;
        tematismo.descrizione = tema.descrizione;
        tematismo.valori = tema.valori;
        tematismo.separatoreDecimale = tema.separatoreDecimale;
        tematismo.livello = Ext.clone(tema.livello);
        tematismo.idTipoClassificazione = this.getTipo().getValue();
        tematismo.numClassi = this.getClassi().getValue();
        tematismo.scalaColore = this.getScalaColore().getValue();

        // calcolo statistiche
        this.calculateStats(tematismo);

        // chiamo servizio di scrittura SLD
        CWN2.Util.ajaxRequest({
            type: "JSON",
            url: CWN2.Globals.RL_CREATE_SLD_SERVICE,
            callBack: function (response) {
                CWN2.QPG.loadQPGLayer(tematismo, response.data.sldUrl);
                // ricarico panel grid
                me.reloadGridPanel(tematismo);
            },
            jsonData: {"sldBody": tematismo.stat.sldBody, "sldCleanBody": ""},
            disableException: true
        });

    },


    onSubmitButtonClick: function() {
        var me = this;

        var tematismo = this.getTematismo(this.selectedTheme);

        // imposto proprietà modificate
        tematismo.idTipoClassificazione = this.getTipo().getValue();
        tematismo.numClassi = this.getClassi().getValue();
        tematismo.scalaColore = this.getScalaColore().getValue();

        // calcolo statistiche
        this.calculateStats(tematismo);

        // chiamo servizio di scrittura SLD
        CWN2.Util.ajaxRequest({
            type: "JSON",
            url: CWN2.Globals.RL_CREATE_SLD_SERVICE,
            callBack: function (response) {
                // calcolo rules
                tematismo.layerConfig.classes = CWN2.QPG.getRules(tematismo, "http://geoservizi.regione.liguria.it/geoserver/QPG_TEMI/", response.data.sldUrl);
                // cambio stylemap
                tematismo.olLayer.styleMap = CWN2.LayerFactory.createVectorStyleMap(tematismo.layerConfig);
                // cambio url
                tematismo.olLayer.url = "http://geoservizi.regione.liguria.it/geoserver/QPG_TEMI/wms?VIEWPARAMS=ID_RICHIESTA:" + tematismo.idRichiesta + ";ID_TEMA:" + tematismo.idTema + "&SLD=" + response.data.sldUrl;
                //refresh layer
                tematismo.olLayer.redraw(true);
                //refresh grid panel
                me.reloadGridPanel(tematismo);
            },
            jsonData: {"sldBody": tematismo.stat.sldBody, "sldCleanBody": ""},
            disableException: true
        });
    },

    getTematismo: function (idTema) {
        var tematismo;

        var tematismi = CWN2.app.configuration.qpgRequest.tematismi;
        Ext.each(tematismi, function(tema) {
            if (tema.idTema === idTema) {
                tematismo = tema;
                return false;
            }
        });
        return tematismo;
    },

    onThemesSelect: function(combo, records, eOpts) {
        var me = this;

        this.selectedTheme = records[0].data.idTema;

        var tematismo = this.getTematismo(records[0].data.idTema);

        // aggiorno le combo
        me.getTipo().setValue(tematismo.idTipoClassificazione);
        me.getClassi().setValue(tematismo.numClassi);
        me.getScalaColore().setValue(tematismo.scalaColore);

        // ricarico panel grid
        this.reloadGridPanel(tematismo);
    },

    reloadGridPanel: function(tematismo) {
        var me = this;
        Ext.suspendLayouts();
        var panel = this.getPanel();
        var gridPanel = this.getGridPanel();
        panel.remove(gridPanel);
        panel.add({
            xtype: 'cwn2-btn-qpgtematismi-grid-panel',
            tematismo: tematismo
        });

        Ext.resumeLayouts(true);
    },

    onClick: function() {
        var win = this.getWin(),
            button = this.getButton(),
            me = this;

        var tematismi = CWN2.app.configuration.qpgRequest.tematismi;
        var flagTematismi = false;
        Ext.each(tematismi, function(tematismo) {
            if (tematismo.idTipoClassificazione > 0) {
                flagTematismi = true;
                return false;
            }
        });
        if (flagTematismi) {
            if (!win) {
                win = Ext.create('CWN2.button.QpgTematismi.Window', {
                    tematismi: tematismi
                });
            }
            this.showHideWin(win, CWN2.app.layout.mapPanel);
        } else {
            CWN2.Util.msgBox("Nessun tematismo editabile");
            return;
        }
        this.selectedTheme = tematismi[0].idTema;

    },

    selectedTheme: null,

    showHideWin: function(win, mapPanel) {
    if (!win.isVisible()) {
        win.show();
        win.alignTo(mapPanel.body, "tl-tl", [10, 10]);
    } else {
        win.hide();
    }
}
});




