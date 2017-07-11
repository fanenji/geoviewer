YAHOO.namespace("CWN2.yuitest");

// Test Cases 
YAHOO.CWN2.yuitest.actionFactory_createAction = new YAHOO.tool.TestCase({
 
    name: "test_actionFactory_createAction",
 
    setUp : function () {
		
    },
 
    tearDown : function () {
    },

    test_actionFactory_createAction  : function () {

		var actionConfig = CWN2.configuration.toolbar.itemGroups[0].items[0];
		var cwn2Map = new CWN2.Map('testMap');

		var action = CWN2.actionFactory.createAction(actionConfig,cwn2Map);

		YAHOO.util.Assert.isInstanceOf(GeoExt.Action, action, "Action deve essere di tipo GeoExt.Action");

    }
 
 });
 
 // Test Suite
YAHOO.CWN2.yuitest.actionFactory_suite = new YAHOO.tool.TestSuite("actionFactory Test Suite"); 
YAHOO.CWN2.yuitest.actionFactory_suite.add(YAHOO.CWN2.yuitest.actionFactory_createAction); 
 
