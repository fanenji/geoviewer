YAHOO.namespace("CWN2.yuitest");

// Test Cases 
YAHOO.CWN2.yuitest.test_configuration = new YAHOO.tool.TestCase({
 
    name: "Configuration",
 
    setUp : function () {
    },
 
    tearDown : function () { 
    },

    test_configuration_load : function () {
		var config = CWN2.configuration.load('/CartoWebNet2/config/test/test.json');
		YAHOO.util.Assert.isNotNull(config.name, "Nome non deve essere null");
    }
	,
    test_configuration_getAppConfig : function () {
		var appConfig = CWN2.configuration.getAppConfig();
		YAHOO.util.Assert.isObject(appConfig, "getAppConfig deve ritornare un oggetto");
    }
	,
    test_configuration_getBaseLayers : function () {
		var baseLayers = CWN2.configuration.getBaseLayers();
		YAHOO.util.Assert.areEqual(baseLayers.length, 5, "getBaseLayers deve ritornare un array di 5 elementi");
    }
	,
    test_configuration_getLayers : function () {
		var layers = CWN2.configuration.getLayers();
		YAHOO.util.Assert.areEqual(layers.length, 2, "getLayers deve ritornare un array di 2 elementi");
    }
	,
    test_configuration_getLayerConfigByName : function () {
		var layerName = "L1";
		var layerConfig = CWN2.configuration.getLayerConfigByName(layerName);
		YAHOO.util.Assert.areEqual(layerConfig.name, layerName, "Nome layer dovrebbe essere 'L1'");
    }
	,
    test_configuration_getLayerIndexByName : function () {
		var layerName = "L1";
		var index = CWN2.configuration.getLayerIndexByName(layerName);
		YAHOO.util.Assert.areEqual(index, 0, "Indice deve essere 0");
    }
	,
    test_configuration_getToolbarItemConfigByName : function () {
		var itemName = "pan";
		var item = CWN2.configuration.getToolbarItemConfigByName(itemName);
		YAHOO.util.Assert.areEqual(item.name, itemName, "Nome deve essere 'pan'");
    } 
	,
    test_configuration_getWidgetConfigByName : function () {
		var itemName = "Scale";
		var item = CWN2.configuration.getWidgetConfigByName(itemName);
		YAHOO.util.Assert.areEqual(item.name, itemName, "Nome deve essere 'Scale'");
    } 
	,
    test_configuration_addLayers : function () {
		var layersConfig = 	[{
			"type": "WMS",
			"name": "L3",
			"projection": "EPSG:900913",
			"isBaseLayer": false,
			"visible": true,
			"minScale": 400000,
			"maxScale": 0,
			"wmsParams" : {
				"url": "http://dcarto3.datasiel.net/mapfiles/test/test.asp",
				"name": "L3",
				"transparent": true
			},
			"infoOptions" : {
				"infoUrl": "http://parodixp2.datasiel.net/pippo.html?id=${id}",
				"infoTarget": "_blank"
			},
			"legend": {
				"label": "Comuni",
				"icon": "http://dcarto3.datasiel.net/mapfiles/repertoriocartografico/CONFINI/legenda/L3.png"
			}
		}];
		var item = CWN2.configuration.addLayers(layersConfig);
		// controllo che sia stato aggiunto alla configurazione
		YAHOO.util.Assert.areEqual(CWN2.configuration.getLayers().length, 3, "I layers della configuraizone devono essere 3");
    } 
 
 
 });
 
 // Test Suite
YAHOO.CWN2.yuitest.Configuration = new YAHOO.tool.TestSuite("Configuration Test Suite"); 
YAHOO.CWN2.yuitest.Configuration.add(YAHOO.CWN2.yuitest.test_configuration); 
 
