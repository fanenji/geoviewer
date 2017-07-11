YAHOO.namespace("CWN2.yuitest");


// Definizione test Suite Globale
YAHOO.CWN2.yuitest.cwn2_suite = new YAHOO.tool.TestSuite({

    name : "CWN2 Test Suite Globale",
 
    setUp : function () {
		
		var appConfig = {
			  "application": {
			    "mapOptions": {
			      "id": 1,
			      "projection": "EPSG:900913",
			      "displayProjection": "EPSG:4326",
			      "maxExtent": "830036.283895,5402959.60361,1123018.973727,5597635.329038",
			      "units": "m"
			    },
				"layout" : {
					"type": "simple",
					"extRequired": false
				}
			  },
			  "baseLayers": [
			    {
			      "id": 6,
			      "idAppl": 1,
			      "idBaseLayer": 2,
			      "type": "google_satellite",
			      "name": "Google_Satellite",
			      "minZoomLevel": 8,
			      "maxZoomLevel": 18,
			      "projection": null,
			      "legend": {
			        "label": "Google Satellite",
			        "icon": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/legend/google_satellite.png",
			        "popUpUrl": null,
			        "popUpWidth": 0,
			        "popUpHeight": 0
			      },
			      "visible": true,
			      "isBaseLayer": true
			    }
			  ],
				"layers" : [
					{
						"type": "VECTOR",
						"name": "GeoJSON",
						"projection": "EPSG:4326",
						"isBaseLayer": false,
						"visible": true,
						"loadVoid": true,
						"protocol": {
							"type": "HTTP",
							"options": {
								"format": "GeoJSON",
								"url": null
							}
						},
						"infoOptions": {
						},
						"legend": {
							"label": "GeoJSON",
							"icon": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/icons/events/alien.png"
						},
				        "classes": [
					        {
					          "legendLabel": "Classe Base",
					          "legendIcon": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/icons/events/alien.png",
					          "styleMaps": []
					        }		
				      	]		
					}
				]
			};

			var initConfig = {
				appConfig: appConfig,
				divID: "cwn2_map",
				callBack: null
			};
			CWN2.map.init(initConfig);

    },
 
    tearDown: function () {
    }
});

// Aggiungo le test suite delle classi
YAHOO.CWN2.yuitest.cwn2_suite.add(YAHOO.CWN2.yuitest.featureMngr); 
//YAHOO.CWN2.yuitest.cwn2_suite.add(YAHOO.CWN2.yuitest.Configuration); 
//YAHOO.CWN2.yuitest.cwn2_suite.add(YAHOO.CWN2.yuitest.OpenlayersExt);  
//YAHOO.CWN2.yuitest.cwn2_suite.add(YAHOO.CWN2.yuitest.controlFactory_suite); 
//YAHOO.CWN2.yuitest.cwn2_suite.add(YAHOO.CWN2.yuitest.layerFactory_suite); 
//YAHOO.CWN2.yuitest.cwn2_suite.add(YAHOO.CWN2.yuitest.Map_suite); 
//YAHOO.CWN2.yuitest.cwn2_suite.add(YAHOO.CWN2.yuitest.actionFactory_suite); 

// Run the tests 
Ext.onReady(function (){
	    Ext.QuickTips.init();

        //create the logger
		var logConfigs = {
		    width: "400px",
		    height: "500px",
		    newestOnTop: false,
		    verboseOutput:false
		};
        var logger = new YAHOO.tool.TestLogger("testLogger",logConfigs);
		// titolo
		logger.setTitle("Test Suite CWN2");
		// disabilito visibilità info
		logger.hideCategory("info");
		
        //run the tests
        YAHOO.tool.TestRunner.add(YAHOO.CWN2.yuitest.cwn2_suite);
        YAHOO.tool.TestRunner.run();
});
	
