/**
 *
 * Class: CWN2.MultiClassLegendWindow
 *
 * Crea una finestra ExtJS per la legenda delle classi di un layer multiclasse
 *
 */

Ext.define("CWN2.MultiClassLegendWindow", {
  extend: "Ext.window.Window",

  /**
     *
     * Constructor: CWN2.MultiClassLegendWindow
     * Crea una finestra ExtJS per la legenda delle classi di un layer multiclasse
     *
     * Parameters:
     * layerConfig - {Object} Oggetto configurazione del layer.
     *
     * Return:
     * {CWN2.MultiClassLegendWindow}
     *
     */

  constructor: function(layerConfig) {
    //layerConfig.legend.popUpWidth

    CWN2.MultiClassLegendWindow.superclass.constructor.call(this, {
      title: layerConfig.legend.label,
      height: layerConfig.legend.popUpHeight || 400,
      width: layerConfig.legend.popUpWidth || 600,
      layout: "fit",
      items: [
        {
          xtype: "panel",
          bodyStyle: "padding:5px",
          autoScroll: true,
          items: [
            {
              xtype: "dataview",
              store: new Ext.data.Store({
                data: layerConfig.classes,
                fields: [
                  { name: "icon", mapping: "legendIcon" },
                  { name: "label", mapping: "legendLabel" }
                ]
              }),
              tpl: new Ext.XTemplate(
                "<table width=100% border=0>",
                '<tpl for=".">',
                "<tr>",
                '<td width=30><img src="{icon}"></td>',
                "<td>{label}</td>",
                "</tpl>"
              ),
              autoHeight: true,
              multiSelect: false,
              itemSelector: "div.thumb-wrap",
              emptyText: ""
            }
          ]
        }
      ]
    });
  }
});

