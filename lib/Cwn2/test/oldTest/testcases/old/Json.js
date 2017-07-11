YAHOO.namespace("CWN2.yuitest");

// Test Cases 
YAHOO.CWN2.yuitest.test_json = new YAHOO.tool.TestCase({
 
    name: "Json_load",
 
    setUp : function () {
    },
 
    tearDown : function () {
    },

    test_json_load_sync : function () {
		var url = '/CartoWebNet2/config/test/test.json';
		var obj = CWN2.util.jsonLoad(url,true);
		YAHOO.util.Assert.isNotNull(obj, "oggetto configurazione non deve essere null");
	}
 
 });
 
 // Test Suite
YAHOO.CWN2.yuitest.Json = new YAHOO.tool.TestSuite("json Test Suite"); 
YAHOO.CWN2.yuitest.Json.add(YAHOO.CWN2.yuitest.test_json); 
 
