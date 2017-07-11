YAHOO.namespace("CWN2.yuitest");

// Test Cases 
YAHOO.CWN2.yuitest.test_featureMngr = new YAHOO.tool.TestCase({
 
    name: "featureMngr_loadFeatures",
 
    setUp : function () {
    },
 
    tearDown : function () {
    },

    test_featureMngr_loadFeatures : function () {

		var layerName = 'GeoJSON';
		var zoom = true;

		// Caricamento tramite json
		var features = { "type": "FeatureCollection",
		  "features": [
			    { "type": "Feature",
			      "geometry": {"type": "Point", "coordinates": [8.0, 44.5]},
			      	"properties": {
				  		"infoPopUp": "<a href=http://dcarto3.datasiel.net?contentId=1 target = '_blank'>museo 1</a><br><br>Prova 1 ",
					  	"label": "Prova 1 "
					}
			    },
			    { "type": "Feature",
			      "geometry": {"type": "Point", "coordinates": [9.0, 44.5]},
			      	"properties": {
				  		"infoPopUp": "<a href=http://dcarto3.datasiel.net?contentId=1 target = '_blank'>museo 2</a><br><br>Prova 2 ",
					  	"label": "Prova 2"
					}
			    }
		     ]
		};					
		// config
		var config = {
			layerName: layerName,
			features: features,
			url: null,
			"filter": {
				"text": null,
				"format": null
			},
			"options": {
				"zoom": true,
				"clean": true
			}
		};
				
		CWN2.map.loadFeatures(config);
		

		// config
		var config = {
			layerName: layerName,
			features: null,
			url: url,
			"filter": {
				"text": null,
				"formar": null
			},
			"options": {
				"zoom": true,
				"clean": false
			}
		};
		var url = "services/Configuration/Static/Prove/TestGeoJSON.json"
		// Caricamento tramite url (non faccio la clean)
		CWN2.map.loadFeatures(config);

		// quando il layer ha finito il caricamento faccio assert
		var layer = CWN2.mapMngr.getLayerByName(layerName);
	    layer.events.register("loadend", layer, function() {
            console.log('ciao');
			var numFeatures = CWN2.mapMngr.getLayerByName(config.layerName).features.length;
			YAHOO.util.Assert.areEqual(5,numFeatures,"Feature caricate devono essere 5");
	    });

					
	}
 
 });
 
 // Test Suite
YAHOO.CWN2.yuitest.featureMngr = new YAHOO.tool.TestSuite("featureMngr Test Suite"); 
YAHOO.CWN2.yuitest.featureMngr.add(YAHOO.CWN2.yuitest.test_featureMngr); 
 
