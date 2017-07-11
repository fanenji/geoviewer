YAHOO.namespace("CWN2.yuitest");

// Test Cases 
YAHOO.CWN2.yuitest.layerFactory_create = new YAHOO.tool.TestCase({
 
    name: "test_layerFactory_create",
 
    setUp : function () {
		//CWN2.configuration.load('config/test.json');
    },
 
    tearDown : function () {
    },

    test_layerFactory_create  : function () {
		var config = CWN2.configuration;
		var layerConfig = CWN2.configuration.layers[0];
		var layer = CWN2.layerFactory.create(layerConfig);
		YAHOO.util.Assert.areEqual(layer.name, layerConfig.name, "Nome layer OL dovrebbe essere uguale al nome del layerConfig");
    }
 
 });
 
 // Test Suite
YAHOO.CWN2.yuitest.layerFactory_suite = new YAHOO.tool.TestSuite("layerFactory Test Suite"); 
YAHOO.CWN2.yuitest.layerFactory_suite.add(YAHOO.CWN2.yuitest.layerFactory_create); 
 
