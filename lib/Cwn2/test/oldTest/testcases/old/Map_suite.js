YAHOO.namespace("CWN2.yuitest");

// Test Cases 
YAHOO.CWN2.yuitest.Map_loadConfig = new YAHOO.tool.TestCase({
 
    name: "test_Map_loadConfig",
 
    setUp : function () {
    },
 
    tearDown : function () {
    },

    test_Map_loadConfig  : function () {

		var cwn2Map = new CWN2.Map('testMap');
		cwn2Map.loadConfig();
		YAHOO.util.Assert.areEqual(cwn2Map.projection, "EPSG:900913", "Proiezione dovrebbe essere 'EPSG:900913'");
    },
	
    test_Map_loadLayer  : function () {

		var cwn2Map = new CWN2.Map('testMap');
		var layerConfig = CWN2.configuration.layers[0]; 
		cwn2Map.loadLayer(layerConfig);
		YAHOO.util.Assert.areEqual(cwn2Map.layers[0].name, layerConfig.name, "Nome layer OL dovrebbe essere uguale al nome del layerConfig");
    },
	
     test_Map_loadControl  : function () {

		var cwn2Map = new CWN2.Map('testMap');
		var controlConfig = CWN2.configuration.olControls[0]; 
		cwn2Map.loadControl(controlConfig);
		var  controls = cwn2Map.getControlsByClass("OpenLayers.Control.LayerSwitcher");
		YAHOO.util.Assert.areNotEqual(controls.length, 0, "Controlli in mappa devono essere diversi da 0");
    },
 
     test_Map_initControl  : function () {

		var cwn2Map = new CWN2.Map('testMap');
		var controlConfig = CWN2.configuration.olControls; 
		cwn2Map.initControls(controlConfig);
		var  mapControls = cwn2Map.controls;
		YAHOO.util.Assert.areEqual(mapControls.length, 6, "Controlli in mappa devono essere 6");
    }
 
 });
 
 // Test Suite
YAHOO.CWN2.yuitest.Map_suite = new YAHOO.tool.TestSuite("Map Test Suite"); 
YAHOO.CWN2.yuitest.Map_suite.add(YAHOO.CWN2.yuitest.Map_loadConfig); 
YAHOO.CWN2.yuitest.Map_suite.add(YAHOO.CWN2.yuitest.Map_loadLayer);  
YAHOO.CWN2.yuitest.Map_suite.add(YAHOO.CWN2.yuitest.Map_loadControl); 
