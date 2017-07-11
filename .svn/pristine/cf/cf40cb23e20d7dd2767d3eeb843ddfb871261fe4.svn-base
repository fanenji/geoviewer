YAHOO.namespace("CWN2.yuitest");

// Test Cases 
YAHOO.CWN2.yuitest.controlFactory_create = new YAHOO.tool.TestCase({
 
    name: "test_controlFactory_create",
 
    setUp : function () {
		
    },
 
    tearDown : function () {
    },

    test_controlFactory_create  : function () {
		var config = CWN2.configuration;
		var controlConfig = config.olControls[0];
		var control = CWN2.controlFactory.create(controlConfig);
		YAHOO.util.Assert.isInstanceOf(OpenLayers.Control.LayerSwitcher, control, "Controllo deve essere di tipo LayerSwitcher.");
    }
 
 });
 
 // Test Suite
YAHOO.CWN2.yuitest.controlFactory_suite = new YAHOO.tool.TestSuite("controlFactory Test Suite"); 
YAHOO.CWN2.yuitest.controlFactory_suite.add(YAHOO.CWN2.yuitest.controlFactory_create); 
 
