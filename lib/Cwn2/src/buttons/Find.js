Ext.define("CWN2.button.Find", {
  extend: "Ext.button.Button",
  alias: "widget.cwn2-button-find",

  constructor: function(config) {
    var btnOptions = config.options,
      id = "find";

    this.config = config;

    this.superclass.constructor.call(this, {
      tooltip: CWN2.I18n.get("Ricerche"),
      pressed: false,
      id: id,
      iconCls: btnOptions && btnOptions.iconCls ? btnOptions.iconCls : id,
      text: btnOptions && btnOptions.text ? btnOptions.text : "",
      width: btnOptions && btnOptions.width ? btnOptions.width : 26
    });
  }
});

Ext.define("CWN2.button.Find.Window", {
  extend: "Ext.window.Window",
  alias: "widget.cwn2-find-win",
  title: CWN2.I18n.get("Ricerche"),
  height: 205,
  width: 335,
  resizable: false,
  layout: "fit",
  closeAction: "hide"
});

Ext.define("CWN2.button.Find.TabPanel", {
  extend: "Ext.tab.Panel",
  alias: "widget.cwn2-btn-find-tab-panel",
  activeTab: 0,
  bodyBorder: false,
  deferredRender: false,
  layoutOnTabChange: true,
  border: false,
  flex: 1,
  plain: true
});

Ext.define("CWN2.button.Find.AddressPanel", {
  extend: "Ext.panel.Panel",
  alias: "widget.cwn2-btn-find-address-panel",
  frame: true,
  labelWidth: 1,
  bodyStyle: "padding:5px 5px 0",
  height: 215
});

Ext.define("CWN2.button.Find.LayerPanel", {
  extend: "Ext.panel.Panel",
  alias: "widget.cwn2-btn-find-layer-panel",
  frame: true,
  labelWidth: 1,
  bodyStyle: "padding:5px 5px 0",
  height: 215
});

Ext.define("CWN2.button.Find.CoordPanel", {
  extend: "Ext.panel.Panel",
  alias: "widget.cwn2-btn-find-coord-panel",
  frame: true,
  labelWidth: 1,
  bodyStyle: "padding:5px 5px 0",
  height: 215
});

Ext.define("CWN2.button.Find.LayerCombo", {
  extend: "Ext.form.field.ComboBox",
  alias: "widget.cwn2-btn-find-layer-combo",
  mode: "local",
  typeAhead: true,
  triggerAction: "all",
  value: "Scegli un livello...",
  valueField: "name",
  displayField: "label",
  width: 300,
  constructor: function(config) {
    //        console.log(config.layersConfig)
    Ext.define("FindLayers", {
      extend: "Ext.data.Model",
      fields: [
        { name: "name", type: "string" },
        { name: "label", type: "string" },
        { name: "columns" }
      ]
    });
    this.store = Ext.create("Ext.data.Store", {
      model: "FindLayers",
      data: { layers: config.layersConfig },
      proxy: {
        type: "memory",
        reader: {
          type: "json",
          root: "layers"
        }
      }
    });
    this.superclass.constructor.call(this);
    var firstRecord = this.getStore().getAt(0);
    if (firstRecord && firstRecord.data) {
      this.setValue(firstRecord.data.name);
    }
  }
});

Ext.define("CWN2.button.Find.ColumnCombo", {
  extend: "Ext.form.field.ComboBox",
  alias: "widget.cwn2-btn-find-column-combo",
  queryMode: "local",
  typeAhead: true,
  triggerAction: "all",
  width: 300,
  valueField: "name",
  displayField: "label",
  constructor: function(config) {
    var columns = [];
    Ext.each(config.layersConfig[0].columns, function(column) {
      var name = column.name,
        label = CWN2.Util.capitalizeString(column.name.replace(/_/g, " ")),
        type = column.type;
      columns.push({ name: name, label: label, type: type });
    });
    Ext.define("FindColumns", {
      extend: "Ext.data.Model",
      fields: [
        { name: "name", type: "string" },
        { name: "label", type: "string" },
        { name: "type", type: "string" }
      ]
    });
    this.store = Ext.create("Ext.data.Store", {
      model: "FindColumns",
      data: { columns: columns },
      proxy: {
        type: "memory",
        reader: {
          type: "json",
          root: "columns"
        }
      }
    });

    this.superclass.constructor.call(this);
    if (this.getStore().getAt(0)) {
      this.setValue(this.getStore().getAt(0).data.name);
    }
  }
});

Ext.define("CWN2.button.Find.OperatorCombo", {
  extend: "Ext.form.field.ComboBox",
  alias: "widget.cwn2-btn-find-operator-combo",
  queryMode: "local",
  store: [
    ["=", "="],
    ["!=", "!="],
    ["<", "<"],
    [">", ">"],
    ["<=", "<="],
    [">=", ">="]
    //,["LIKE", "LIKE"]
  ],
  typeAhead: true,
  triggerAction: "all",
  value: "=",
  width: 100
});

Ext.define("CWN2.button.Find.ValueField", {
  extend: "Ext.form.field.Text",
  alias: "widget.cwn2-btn-find-value-field",
  allowBlank: false,
  width: 300
});

Ext.define("CWN2.button.Find.LayerSubmit", {
  extend: "Ext.button.Button",
  alias: "widget.cwn2-btn-find-layer-submit",
  text: "Ricerca..."
});

Ext.define("CWN2.button.Find.LayerValueListButton", {
  extend: "Ext.button.Button",
  alias: "widget.cwn2-btn-find-layer-value-list-btn",
  text: "Lista Valori"
});

Ext.define("CWN2.button.Find.LayerResultStore", {
  extend: "Ext.data.Store",
  storeId: "find-layer-result",
  autoLoad: false,
  fields: ["id", "label", "bbox"]
});

Ext.define("CWN2.button.Find.LayerValueListStore", {
  extend: "Ext.data.Store",
  storeId: "find-layer-value-list",
  autoLoad: false,
  fields: ["value"]
});

Ext.define("CWN2.button.Find.LayerResultWindow", {
  extend: "Ext.window.Window",
  alias: "widget.cwn2-btn-find-layer-result-win",
  title: CWN2.I18n.get("Risultato ricerca"),
  width: 335,
  height: 360,
  layout: "fit",
  closable: true,
  closeAction: "hide",
  items: [{ xtype: "cwn2-btn-find-layer-result-grid" }]
});

Ext.define("CWN2.button.Find.LayerValueListWindow", {
  extend: "Ext.window.Window",
  alias: "widget.cwn2-btn-find-layer-value-list-win",
  title: CWN2.I18n.get("Lista valori"),
  width: 335,
  height: 360,
  layout: "fit",
  closable: true,
  closeAction: "hide",
  items: [{ xtype: "cwn2-btn-find-layer-value-list-grid" }]
});

Ext.define("CWN2.button.Find.LayerValueListGrid", {
  extend: "Ext.grid.Panel",
  alias: "widget.cwn2-btn-find-layer-value-list-grid",
  frame: true,
  width: 320,
  height: 300,
  header: false,
  //hideHeaders: true,
  iconCls: "icon-grid",
  store: Ext.create("CWN2.button.Find.LayerValueListStore"),
  columns: [
    {
      header: "Valore",
      sortable: true,
      dataIndex: "value",
      width: 290
    }
  ]
});

Ext.define("CWN2.button.Find.LayerResultGrid", {
  extend: "Ext.grid.Panel",
  alias: "widget.cwn2-btn-find-layer-result-grid",
  frame: true,
  width: 320,
  height: 300,
  header: false,
  //hideHeaders: true,
  iconCls: "icon-grid",
  store: Ext.create("CWN2.button.Find.LayerResultStore"),
  columns: [
    {
      header: "ID",
      sortable: true,
      dataIndex: "id",
      width: 70
    },
    {
      header: "LABEL",
      sortable: true,
      dataIndex: "label",
      width: 220
    }
  ]
});

Ext.define("CWN2.button.Find.SrsCombo", {
  extend: "Ext.form.field.ComboBox",
  alias: "widget.cwn2-btn-find-srs-combo",
  fieldLabel: "",
  labelWidth: 1,
  queryMode: "local",
  store: [
    ["3003", "Coordinate Piane - Gauss-Boaga - Fuso Ovest"],
    ["25832", "Coordinate Piane - ETRS - UTM - ETRF89 - Fuso 32"],
    ["4806", "Coordinate Geografiche - ROMA40"],
    ["4258", "Coordinate Geografiche - ETRS - ETRF89"]
  ],
  typeAhead: true,
  triggerAction: "all",
  value: "3003",
  width: 300
});

Ext.define("CWN2.button.Find.XField", {
  extend: "Ext.form.field.Number",
  alias: "widget.cwn2-btn-find-x-field",
  allowBlank: false,
  fieldLabel: "X (Est)",
  decimalPrecision: 0,
  minValue: 1378000,
  maxValue: 1586000,
  width: 300
});

Ext.define("CWN2.button.Find.YField", {
  extend: "Ext.form.field.Number",
  alias: "widget.cwn2-btn-find-y-field",
  allowBlank: false,
  fieldLabel: "Y (Nord)",
  decimalPrecision: 0,
  minValue: 4846000,
  maxValue: 4948000,
  width: 300
});

Ext.define("CWN2.button.Find.CoordSubmit", {
  extend: "Ext.button.Button",
  alias: "widget.cwn2-btn-find-coord-submit",
  text: "Trova..."
});

// CONTROLLER
Ext.define("CWN2.controller.button.find", {
  extend: "Ext.app.Controller",

  views: ["CWN2.button.Find"],

  refs: [
    {
      ref: "button",
      selector: "cwn2-button-find"
    },
    {
      ref: "win",
      selector: "cwn2-find-win"
    },
    {
      ref: "layerCombo",
      selector: "cwn2-btn-find-layer-combo"
    },
    {
      ref: "columnCombo",
      selector: "cwn2-btn-find-column-combo"
    },
    {
      ref: "operatorCombo",
      selector: "cwn2-btn-find-operator-combo"
    },
    {
      ref: "valueField",
      selector: "cwn2-btn-find-value-field"
    },
    {
      ref: "layerResultWin",
      selector: "cwn2-btn-find-layer-result-win"
    },
    {
      ref: "layerResultGrid",
      selector: "cwn2-btn-find-layer-result-grid"
    },
    {
      ref: "layerValueListWin",
      selector: "cwn2-btn-find-layer-value-list-win"
    },
    {
      ref: "layerValueListGrid",
      selector: "cwn2-btn-find-layer-value-list-grid"
    },
    {
      ref: "srsCombo",
      selector: "cwn2-btn-find-srs-combo"
    },
    {
      ref: "xField",
      selector: "cwn2-btn-find-x-field"
    },
    {
      ref: "yField",
      selector: "cwn2-btn-find-y-field"
    }
  ],

  layersConfig: [],

  init: function(application) {
    CWN2.Util.log("CWN2.controller.button.find: init");

    this.control({
      "cwn2-button-find": {
        click: this.onClick
      },
      "cwn2-btn-find-layer-combo": {
        select: this.onLayerSelect
      },
      "cwn2-btn-find-column-combo": {
        select: this.onColumnSelect
      },
      "cwn2-btn-find-layer-submit": {
        click: this.onLayerSubmit
      },
      "cwn2-btn-find-coord-submit": {
        click: this.onCoordSubmit
      },
      "cwn2-btn-find-srs-combo": {
        select: this.onSrsSelect
      },
      "cwn2-btn-find-layer-result-grid": {
        select: this.onLayerGridSelect
      },
      "cwn2-btn-find-layer-value-list-btn": {
        click: this.onLayerValueListClick
      },
      "cwn2-btn-find-layer-value-list-grid": {
        select: this.onValueListGridSelect
      }
    });
  },

  onCoordSubmit: function(button, e, eOpts) {
    var me = this,
      srs = this.getSrsCombo().value,
      xField = this.getXField(),
      yField = this.getYField(),
      x = xField.value,
      y = yField.value;

    if (!xField.isValid()) {
      Ext.MessageBox.alert(
        "Attenzione",
        "Coordinata X fuori dai limiti ammessi.<br>Posiziona il cursore sopra il campo per conoscere i valori ammessi"
      );
      return false;
    }
    if (!yField.isValid()) {
      Ext.MessageBox.alert(
        "Attenzione",
        "Coordinata Y fuori dai limiti ammessi.<br>Posiziona il cursore sopra il campo per conoscere i valori ammessi"
      );
      return false;
    }

    // chiamo servizio conversione coordinate
    var srvUrl =
      "/geoservices/REST/coordinate/transform_point/" +
      srs +
      "/3857/" +
      x +
      "," +
      y;
    CWN2.Util.ajaxRequest({
      type: "JSON",
      url: srvUrl,
      callBack: function(data, response) {
        var point = data.points[0].split(",");
        //                CWN2.app.map.setCenter([point[0],point[1]],16);
        CWN2.FeatureLoader.loadMarker({
          x: point[0],
          y: point[1],
          map: CWN2.app.map,
          label: "",
          //label: point[0] & ',' & point[1],
          zoomLevel: 17
        });
      }
    });
  },

  onSrsSelect: function(combo, records, eOpts) {
    var xField = this.getXField();
    var yField = this.getYField();
    var srs = this.getSrsCombo().value;
    switch (srs) {
      case "3003":
        xField.setMinValue(1378000);
        xField.setMaxValue(1586000);
        yField.setMinValue(4846000);
        yField.setMaxValue(4948000);
        xField.decimalPrecision = 0;
        yField.decimalPrecision = 0;
        break;
      case "25832":
        xField.setMinValue(377000);
        xField.setMaxValue(586000);
        yField.setMinValue(4845000);
        yField.setMaxValue(4948000);
        xField.decimalPrecision = 0;
        yField.decimalPrecision = 0;
        break;
      case "4258":
        xField.setMinValue(7.48416);
        xField.setMaxValue(10.08478);
        yField.setMinValue(43.756831);
        yField.setMaxValue(44.680042);
        xField.decimalPrecision = 6;
        yField.decimalPrecision = 6;
        break;
      case "4806":
        xField.setMinValue(-4.967781);
        xField.setMaxValue(-2.366957);
        yField.setMinValue(43.756193);
        yField.setMaxValue(44.678726);
        xField.decimalPrecision = 6;
        yField.decimalPrecision = 6;
        break;
    }

    //        var srs = record.data["value"].toString()
  },

  onLayerSubmit: function(button, e, eOpts) {
    var me = this,
      layerName = this.getLayerCombo().value,
      column = this.getColumnCombo().value,
      datatype = this.getColumnCombo().findRecordByValue(column).data["type"],
      operator = this.getOperatorCombo().value,
      value = this.getValueField().value;

    if (!value) {
      Ext.Msg.show({
        msg: "Indicare un valore",
        icon: Ext.Msg.INFO,
        buttons: Ext.Msg.OK
      });
      return;
    }

    if (datatype == "DATE") {
      if (
        !value.match(/^(0?[1-9]|[12][0-9]|3[01])[\/](0?[1-9]|1[012])[\/]\d{4}$/)
      ) {
        Ext.Msg.show({
          msg:
            "Valori di tipo data devono essere espressi nel formato: 'GG/MM/AAAA'",
          icon: Ext.Msg.INFO,
          buttons: Ext.Msg.OK
        });
        return;
      }
      if (operator == "LIKE") {
        Ext.Msg.show({
          msg: "Campi di tipo data non sono compatibili con l'operatore LIKE",
          icon: Ext.Msg.INFO,
          buttons: Ext.Msg.OK
        });
        return;
      }
    }

    CWN2.loadingScreen = Ext.getBody().mask(
      "Ricerca in corso",
      "loadingscreen"
    );
    CWN2.Util.ajaxRequest({
      type: "JSONP",
      url:
        "/geoservices/REST/config/query_layer/" +
        layerName.replace("L", "") +
        "?column=" +
        column +
        "&datatype=" +
        datatype +
        "&operator=" +
        operator +
        "&value=" +
        value +
        "&map_projection=" +
        CWN2.app.map.projection,
      callBack: function(response) {
        if (response && !response.success) {
          CWN2.Util.msgBox("Attenzione: - " + response.message);
          return;
        }
        response.data && response.data.length > 0
          ? me.onLayerDataResponse(layerName, response.data)
          : CWN2.Util.msgBox("Nessun oggetto trovato");
      }
    });
  },

  columnComboChange: true,

  onLayerValueListClick: function(button, e, eOpts) {
    var me = this,
      layerName = this.getLayerCombo().value,
      column = this.getColumnCombo().value,
      datatype = this.getColumnCombo().findRecordByValue(column).data["type"],
      column = this.getColumnCombo().value;

      CWN2.loadingScreen = Ext.getBody().mask(
        "Ricerca in corso",
        "loadingscreen"
      );
      CWN2.Util.ajaxRequest({
        type: "JSONP",
        url:
          "/geoservices/REST/config/query_layer_valuelist/" +
          layerName.replace("L", "") +
          "?column=" +
          column +
          "&datatype=" +
          datatype,
        callBack: function(response) {
          if (response && !response.success) {
            CWN2.Util.msgBox("Attenzione: - " + response.message);
            return;
          }
          response.data && response.data.length > 0
            ? me.onLayerValueListResponse(layerName, response.data)
            : CWN2.Util.msgBox("Nessun oggetto trovato");
        }
      });
      this.columnComboChange = false;
  },

  onLayerValueListResponse: function(layerName, data) {
    var me = this,
      mainWin = this.getWin(),
      win =
        this.getLayerValueListWin() ||
        Ext.create("CWN2.button.Find.LayerValueListWindow"),
      store = this.getLayerValueListGrid().getStore();

    store.removeAll();
    Ext.each(data, function(rec) {
      store.add(rec);
    });
    win.show();
    win.alignTo(CWN2.app.layout.mapPanel.body, "tl-tl", [
      10 + mainWin.getWidth() + 10,
      10
    ]);
  },

  onLayerDataResponse: function(layerName, data) {
    var me = this,
      layerConfig = CWN2.app.map.layerManager.getLayerConfigByName(layerName),
      mainWin = this.getWin(),
      win =
        this.getLayerResultWin() ||
        Ext.create("CWN2.button.Find.LayerResultWindow"),
      store = this.getLayerResultGrid().getStore();

    store.removeAll();
    Ext.each(data, function(rec) {
      store.add(rec);
    });
    win.show();
    win.alignTo(CWN2.app.layout.mapPanel.body, "tl-tl", [
      10,
      10 + mainWin.getHeight() + 10
    ]);
  },

  onLayerSelect: function(combo, records, eOpts) {
    var columnCombo = this.getColumnCombo();
    var columns = [];
    columnCombo.enable();
    columnCombo.clearValue();
    Ext.each(records[0].data.columns, function(column) {
      var name = column.name,
        label = CWN2.Util.capitalizeString(column.name.replace(/_/g, " ")),
        type = column.type;
      columns.push({ name: name, label: label, type: type });
    });
    columnCombo.store.loadData(columns, false);
    columnCombo.setValue(columnCombo.getStore().getAt(0).data.name);
  },

  onColumnSelect: function(combo, records, eOpts) {
    this.columnComboChange = true;
  },

  buildLayersConfig: function(panelConfig) {
    var me = this;
    me.layersConfig = [];
    var layersConfig = CWN2.app.map.layerManager.overlayLayersConfig;
    if (panelConfig && panelConfig.layers) {
      Ext.each(panelConfig.layers, function(layer) {
        var layerAppConfig = CWN2.Util.getArrayElementByAttribute(
          layersConfig,
          "name",
          layer.name
        );
        me.layersConfig.push({
          name: layer.name,
          label: layerAppConfig.legend.label,
          columns:
            layer.dbSchema && layer.dbSchema.columns
              ? layer.dbSchema.columns
              : layersConfig.dbSchema.columns
        });
      });
    } else {
      Ext.each(layersConfig, function(layer) {
        if (
          layer.dbSchema &&
          layer.dbSchema.schema &&
          layer.dbSchema.columns &&
          layer.dbSchema.columns.length > 0
        ) {
          me.layersConfig.push({
            name: layer.name,
            label: layer.legend.label,
            columns: layer.dbSchema.columns
          });
        }
      });
    }
  },

  onValueListGridSelect: function(grid, record, index) {
    this.getValueField().setValue(record.data["value"].toString());
    this.getLayerValueListWin().hide();
  },

  onLayerGridSelect: function(grid, record, index) {
    var me = this,
      layerName = this.getLayerCombo().value,
      layerConfig = CWN2.app.map.layerManager.getLayerConfigByName(layerName),
      infoIdAttr = layerConfig.infoOptions.infoIdAttr,
      idValue = record.data["id"].toString(),
      bounds = new OpenLayers.Bounds.fromString(record.data["bbox"]);

    CWN2.MapCatalogueLoader.findLayer({
      layers: [layerName],
      fields: infoIdAttr,
      values: idValue,
      bounds: bounds,
      maxZoomLevel: 17
    });
  },

  onClick: function() {
    var mapPanel = CWN2.app.layout.mapPanel,
      win = this.getWin(),
      button = this.getButton(),
      me = this,
      layerValueListWin = this.getLayerValueListWin();

    if (win) {
      win.destroy();
    }
    if (layerValueListWin) {
      layerValueListWin.destroy();
    }

    var tabs = [];
    Ext.each(button.config.panels, function(panelConfig) {
      switch (panelConfig.type) {
        case "coordinate":
          tabs.push({
            xtype: "cwn2-btn-find-coord-panel",
            title: CWN2.I18n.get(panelConfig.name),
            items: [
              {
                xtype: "label",
                text: "Sistema di Riferimento:"
              },
              {
                xtype: "cwn2-btn-find-srs-combo"
              },
              {
                xtype: "cwn2-btn-find-x-field"
              },
              {
                xtype: "cwn2-btn-find-y-field"
              },
              {
                xtype: "cwn2-btn-find-coord-submit"
              }
            ]
          });
          break;
        case "indirizzo":
          tabs.push({
            xtype: "cwn2-btn-find-address-panel",
            title: CWN2.I18n.get(panelConfig.name),
            items: [
              {
                xtype: "cwn2-geocoder-combobox",
                map: mapPanel.map,
                service: "google",
                configOptions: panelConfig.options,
                width: 200
              }
            ]
          });
          break;
        case "layer":
          me.buildLayersConfig(panelConfig.options);
          tabs.push({
            xtype: "cwn2-btn-find-layer-panel",
            title: CWN2.I18n.get(panelConfig.name),
            items: [
              {
                xtype: "cwn2-btn-find-layer-combo",
                layersConfig: me.layersConfig
              },
              {
                xtype: "cwn2-btn-find-column-combo",
                layersConfig: me.layersConfig
              },
              {
                xtype: "fieldcontainer",
                border: false,
                width: 300,
                flex: 1,
                layout: "hbox",
                items: [
                  {
                    xtype: "cwn2-btn-find-operator-combo"
                  },
                  {
                    xtype: "tbfill"
                  },
                  {
                    xtype: "cwn2-btn-find-layer-value-list-btn"
                  }
                ]
              },
              {
                xtype: "cwn2-btn-find-value-field"
              },
              {
                xtype: "cwn2-btn-find-layer-submit"
              }
            ]
          });
          break;
      }
    });
    win = Ext.create("CWN2.button.Find.Window", {
      items: [
        {
          xtype: "cwn2-btn-find-tab-panel",
          id: "find-tabpanel",
          items: tabs
        }
      ]
    });

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