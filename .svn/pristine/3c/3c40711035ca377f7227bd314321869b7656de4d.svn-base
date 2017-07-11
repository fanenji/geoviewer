YAHOO.namespace("CWN2.yuitest");

// Test Cases 
YAHOO.CWN2.yuitest.openlayersExt_loadGeoJSON = new YAHOO.tool.TestCase({
 
    name: "openlayersExt_loadGeoJSON",
 
    setUp : function () {
    },
 
    tearDown : function () { 
    },

    test_openlayersExt_loadGeoJSON : function () {
		// carico la mappa
		var cwn2Map = new CWN2.Map('pippo');
		cwn2Map.loadConfig();

		// definisco il geoJSON
		// definizione di un oggetto contenente un GeoJSON
		var GeoJSON = { "type": "FeatureCollection",
		  "features": [
			    { "type": "Feature",
			      "geometry": {"type": "Point", "coordinates": [8.0, 44.5]},
			      "properties": {
				  	"id": "ID1",
				  	"label": "Label 1"
					}
			      },
			    { "type": "Feature",
			      "geometry": {"type": "Point", "coordinates": [9.0, 44.5]},
			      "properties": {
				  	"id": "ID2",
				  	"label": "Label 2"
					}
			      },
			    { "type": "Feature",
			      "geometry": {"type": "Point", "coordinates": [8.5, 44.5]},
			      "properties": {
				  	"id": "ID1",
				  	"label": "Label 3"
				  }
			    }
		     ]
		   };
		// carico il geoJson
		var layer = cwn2Map.getLayersByName('GeoJSON')[0];
		layer.loadGeoJSON(GeoJSON);
		YAHOO.util.Assert.areEqual(layer.features.length, 3, "Le feature caricate devono essere 3");
    }
 
 
 });
 
 // Test Suite
YAHOO.CWN2.yuitest.openlayersExt_suite = new YAHOO.tool.TestSuite("openlayersExt Test Suite"); 
YAHOO.CWN2.yuitest.openlayersExt_suite.add(YAHOO.CWN2.yuitest.openlayersExt_loadGeoJSON); 
 
