/**
 * Created by JetBrains WebStorm.
 * User: parodi
 * Date: 14/12/11
 * Time: 18.37
 * To change this template use File | Settings | File Templates.
 */

// namespace
CWN2.test = {};

// configurazione per test
// layout panel
// baseLayer - google satellite
// overlay - 1 layer vettoriale geoJSON
CWN2.test.appConfigPanel = {
  "application": {
    "name": "test",
    "mapOptions": {
      "id": 1,
      "projection": "EPSG:900913",
      "displayProjection": "EPSG:4326",
      "maxExtent": "830036.283895,5402959.60361,1123018.973727,5597635.329038",
      "units": "m"
    },
    "widgets": [
      {
        "id": 1,
        "type": "widget",
        "name": "Scale"
      },
      {
        "id": 2,
        "type": "widget",
        "name": "CoordinateReadOut"
      }
    ],
    "layout": {
      "id": 1,
      "type": "window",
      "title": "Esempio Panel",
      "language": "it",
	  "statusBar": true,
      "width": 600,
      "height": 400,
		"legend": {
			"type": "simple",
			"position": "east",
			"collapsed": true
		}
    }
  },
  "baseLayers": [
    {
      "id": 5,
      "idAppl": 1,
      "idBaseLayer": 1,
      "type": "no_base",
      "name": "sfondo_bianco",
      "minZoomLevel": 0,
      "maxZoomLevel": 0,
      "projection": null,
      "legend": {
        "label": "Sfondo Bianco",
        "icon": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/legend/bianco.gif",
        "popUpUrl": null,
        "popUpWidth": 0,
        "popUpHeight": 0
      },
      "visible": false,
      "isBaseLayer": true
    },
    {
      "id": 1,
      "idAppl": 1,
      "idBaseLayer": 3,
      "type": "google_roadmap",
      "name": "Google_Stradario",
      "minZoomLevel": 8,
      "maxZoomLevel": 18,
      "projection": null,
      "legend": {
        "label": "Google Stradario",
        "icon": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/legend/google_stradario.png",
        "popUpUrl": null,
        "popUpWidth": 0,
        "popUpHeight": 0
      },
      "visible": false,
      "isBaseLayer": true
    },
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
          "name": "GeoJSON_VOID",
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
              "label": "GeoJSON Void",
              "icon": null
          },
          "classes": [
              {
                "legendLabel": "Classe Base",
                "legendIcon": null,
                "styleMaps": []
              }
          ]
      }
  ]
};

// configurazione per test select feature
// layout panel
// baseLayer - google satellite
// overlay - 1 layer vettoriale geoJSON
CWN2.test.appConfigSelectFeature = {
  "application": {
    "name": "test",
    "mapOptions": {
      "id": 1,
      "projection": "EPSG:4326",
      "displayProjection": "EPSG:4326",
      "maxExtent": "4.8,43.0,11.6,45.4",
      "units": "m"
    },
    "widgets": null,
    "layout": {
      "id": 1,
      "type": "window",
      "title": "Esempio Panel",
      "language": "it",
	  "statusBar": true,
      "width": 600,
      "height": 400,
		"legend": {
			"type": "simple",
			"position": "east",
			"collapsed": true
		}
    }
  },
  "baseLayers": [

  ],
  "layers" : [
      {
          "type": "VECTOR",
          "name": "GeoJSON",
          "projection": "EPSG:4326",
          "isBaseLayer": true,
          "visible": true,
          "protocol": {
              "type": "HTTP",
              "options": {
                  "format": "GeoJSON",
                  "url": "/CartoWebNet2/services/Configuration/Static/test/TestGeoJSON.json"
              }
          },
		"infoOptions": {
			"infoPopUp": "default",
			"infoLabelAttr": "label",
			"idAttr": "ID",
			"infoUrl": "http://parodixp2.datasiel.net/pippo.html?id=${ID}",
			"infoTarget": "_blank"
		},
          "legend": {
              "label": "GeoJSON",
              "icon": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/icons/events/alien.png"
          },
          "classes": [
          {
            "legendLabel": "Classe 1",
            "legendIcon": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/icons/events/alien.png",
            "styleMaps": [
              {
                "renderIntent": "default",
                "style": {
                    "fillColor": null,
                    "fillOpacity": 0.0,
                    "strokeColor": null,
                    "strokeOpacity": 0.0,
                    "strokeWidth": 0,
                    "strokeLinecap": null,
                    "strokeDashstyle": null,
                    "pointRadius": 0,
                    "externalGraphic": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/icons/events/alien.png",
                    "graphicWidth": 32,
                    "graphicHeight": 37,
                    "graphicOpacity": 1.0,
                    "graphicXOffset": -16,
                    "graphicYOffset": -37,
                    "rotation": 0,
                    "graphicName": null,
                    "cursor": "pointer",
                    "graphicTitle": "${NOME}",
                    "display": null
                    }
              },
              {
                "renderIntent": "hilite",
                "style": {
                    "fillColor": null,
                    "fillOpacity": 0.0,
                    "strokeColor": null,
                    "strokeOpacity": 0.0,
                    "strokeWidth": 0,
                    "strokeLinecap": null,
                    "strokeDashstyle": null,
                    "pointRadius": 0,
                    "externalGraphic": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/icons/events/alien_h.png",
                    "graphicWidth": 32,
                    "graphicHeight": 37,
                    "graphicOpacity": 1.0,
                    "graphicXOffset": -16,
                    "graphicYOffset": -37,
                    "rotation": 0,
                    "graphicName": null,
                    "graphicTitle": "${NOME}",
                    "cursor": "pointer",
                    "display": null
                    }
              },
              {
                "renderIntent": "select",
                "style": {
                    "fillColor": null,
                    "fillOpacity": 0.0,
                    "strokeColor": null,
                    "strokeOpacity": 0.0,
                    "strokeWidth": 0,
                    "strokeLinecap": null,
                    "strokeDashstyle": null,
                    "pointRadius": 0,
                    "externalGraphic": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/icons/events/alien_s.png",
                    "graphicWidth": 32,
                    "graphicHeight": 37,
                    "graphicOpacity": 1.0,
                    "graphicXOffset": -16,
                    "graphicYOffset": -37,
                    "rotation": 0,
                    "graphicName": null,
                    "graphicTitle": "${NOME}",
                    "cursor": "pointer",
                    "display": null
                }
              },
              {
                "renderIntent": "hover",
                "style": {
                    "fillColor": null,
                    "fillOpacity": 0.0,
                    "strokeColor": null,
                    "strokeOpacity": 0.0,
                    "strokeWidth": 0,
                    "strokeLinecap": null,
                    "strokeDashstyle": null,
                    "pointRadius": 0,
                    "externalGraphic": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/icons/events/alien_h.png",
                    "graphicWidth": 32,
                    "graphicHeight": 37,
                    "graphicOpacity": 1.0,
                    "graphicXOffset": -16,
                    "graphicYOffset": -37,
                    "rotation": 0,
                    "graphicName": null,
                    "graphicTitle": "${NOME}",
                    "cursor": "pointer",
                    "display": null
                }
              }
            ]
          }

        ]
      }
  ]
};

// inizializzazione applicazione per test
CWN2.test.init = function(appConfig) {

    var initConfig = {
        appConfig: appConfig,
        divID: null,
        callBack: CWN2.test.initCallBack,
        debug: true
    };
    CWN2.appMngr.init(initConfig);
    return initConfig;
};

// suite per i test di inizializzazione
describe("CWN2", function() {

    // test per inizializzazione del sistema
    // test di alto livello - semplice verifica della creazione dei principali oggetti
    describe("appMngr.init", function() {

        var initConfig;
        // faccio in modo che venga eseguita solo una volta
        var _beforeAll = false;
        beforeEach(function(){
            if (_beforeAll) return;
            _beforeAll = true;
            initConfig = CWN2.test.init(CWN2.test.appConfigPanel);
        });

        it("set global variables",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                expect(CWN2.debug).toEqual(true);
                expect(CWN2.proxy).toEqual(null);
                expect(OpenLayers.ProxyHost).toEqual('/CartoWebNet2/services/proxy/proxy.ashx?url=');
                expect(OpenLayers.Layer.Vector.prototype.renderers.length).toEqual(3);
            });
        });

        it("load configuration",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                expect(CWN2.configuration.getAppConfig().name).toEqual('test');
            });
        });

        it("build layerStore",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                expect(CWN2.layerMngr.getLayerStore("base").storeId).toEqual("base-layer-store");
                expect(CWN2.layerMngr.getLayerStore("overlay").storeId).toEqual("overlay-layer-store");
            });
        });

        it("build OL Map",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                expect(CWN2.olMap.CLASS_NAME).toEqual("OpenLayers.Map");
            });
        });

        it("build mapPanel",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                var cmpID = "cwn2-map-panel";
                expect(Ext.getCmp(cmpID).id).toEqual(cmpID);
            });
        });

        it("build legendPanel",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                var cmpID = "cwn2-legend-panel";
                expect(Ext.getCmp(cmpID).id).toEqual(cmpID);
            });
        });

    });

    describe("layerMngr", function() {

        it("add/remove layer",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                var numLayersInStore = CWN2.layerMngr.getOverlayLayersNameFromStore().length;
                var layerConfig = {
                    "type": "WMS",
                    "name": "TEST_WMS",
                    "projection": "EPSG:900913",
                    "isBaseLayer": false,
                    "visible": true,
                    "wmsParams" : {
                        "url": "http://dcarto3.datasiel.net/mapfiles/test/test.asp",
                        "name": "L1",
                        "transparent": true
                    },
                    "legend": {
                        "label": "Province",
                        "icon": "http://dcarto3.datasiel.net/mapfiles/repertoriocartografico/CONFINI/legenda/L1.png",
                        "popupUrl": "http://dcarto3.datasiel.net/RepertorioCartografico/documentazione/1_PoAmb.pdf"
                    }
                };

                CWN2.layerMngr.add([layerConfig]);
                // verifico che il layer sia stato aggiunto alla configurazione
                expect(CWN2.configuration.getLayerIndexByName(layerConfig.name)).not.toEqual(-1);
                // verifico che il layer sia stato aggiunto alla mappa
                expect(CWN2.mapMngr.getLayerByName(layerConfig.name)).not.toEqual(undefined);
                // verifico che il layerStore sia stato aggiornato
                expect(CWN2.layerMngr.getOverlayLayersNameFromStore().length).toEqual(numLayersInStore+1);

                // rimuovo il layer
                CWN2.layerMngr.remove([layerConfig.name]);
                // verifico che il layer sia stato rimosso dalla configurazione
                expect(CWN2.configuration.getLayerIndexByName(layerConfig.name)).toEqual(-1);
                // verifico che il layer sia stato rimosso alla mappa
                expect(CWN2.mapMngr.getLayerByName(layerConfig.name)).toEqual(undefined);
                // verifico che il layerStore sia stato aggiornato
                expect(CWN2.layerMngr.getOverlayLayersNameFromStore().length).toEqual(numLayersInStore);

            });
        });

        it("createVectorLayer",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                var layerName = "TEST_CREATE_VECTOR_LAYER";
                var format = 'GeoJSON';
                var styleMap = null;
                spyOn(CWN2.layerMngr, "add");
                var layer = CWN2.layerMngr.createVectorLayer(layerName,format,styleMap);
                //verifico che sia stata chiamata la funzione add
                expect(CWN2.layerMngr.add).toHaveBeenCalled();
            });
        });

    });

    describe("ExtMediaWindow", function() {

        it("constructor",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                var url = "http://server/dir/page.html";
                var width = 200;
                var height = 100;
                var winID = 'test-win-1';
                var win = new CWN2.ExtMediaWindow(url,width,height,winID);
                expect(winID).toEqual(win.id);
            });
        });

    });

    describe("layerFactory", function() {

        it("create google",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                var layerConfig = {
                    "type": "google_terrain",
                    "name": "Google_Terrain",
                    "minZoomLevel": 8,
                    "maxZoomLevel": 18,
                    "isBaseLayer": true,
                    "visible": false,
                    "legend": {
                        "label": "Google Terreno",
                        "icon": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/legend/google_terreno.png"
                    }
                };
                var layer = CWN2.layerFactory.create(layerConfig);
                expect(layer.CLASS_NAME).toEqual("OpenLayers.Layer.Google");
            });
        });


        it("create OSM",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                var layerConfig = {
                  "id": 6,
                  "idAppl": 1,
                  "idBaseLayer": 2,
                  "type": "OSM",
                  "name": "OSM",
                  "minZoomLevel": 8,
                  "maxZoomLevel": 20,
                  "projection": null,
                  "legend": {
                    "label": "OSM",
                    "icon": "http://parodis-dts-pc.datasiel.net/CartoWebNet2/img/legend/osm.png",
                    "popUpUrl": null,
                    "popUpWidth": 0,
                    "popUpHeight": 0
                  },
                  "visible": true,
                  "isBaseLayer": true
                };
                var layer = CWN2.layerFactory.create(layerConfig);
                expect(layer.CLASS_NAME).toEqual("OpenLayers.Layer.OSM");
            });
        });

        it("create WMS",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                var layerConfig = 		{
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
                    "legend": {
                        "label": "Comuni",
                        "icon": "http://dcarto3.datasiel.net/mapfiles/repertoriocartografico/CONFINI/legenda/L3.png"
                    }
                };
                var layer = CWN2.layerFactory.create(layerConfig);
                expect(layer.CLASS_NAME).toEqual("OpenLayers.Layer.WMS");
            });
        });

        it("create Vector",function(){
            waitsFor(function() {return CWN2.appMngr.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                var layerConfig = 		{
                    "type": "VECTOR",
                    "name": "Prova",
                    "projection": "EPSG:4326",
                    "isBaseLayer": false,
                    "visible": true,
                    "protocol": {
                        "type": "HTTP",
                        "options": {
                            "format": "GeoJSON",
                            "url": "http://dcarto3.datasiel.net/MapServer/6.0/mapserv.exe?MAP=E:\\progetti\\mapfiles\\test\\test.map&SERVICE=WFS&VERSION=1.0.0&REQUEST=getfeature&TYPENAME=GNSS&OUTPUTFORMAT=GeoJSON"
                        }
                    },
                    "classes": []		
                };
                var layer = CWN2.layerFactory.create(layerConfig);
                expect(layer.CLASS_NAME).toEqual("OpenLayers.Layer.Vector");
            });
        });

        //TODO: per layer vettoriali testare la costruzione corretta delle styleMap

    });

    describe("featureMngr", function() {

        it("loadFeatures",function(){

            var layerName = 'GeoJSON_VOID';

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

            waitsFor(function() {return CWN2.mapMngr.getLayerByName(layerName).loadend; }, "Caricamento non effettuato", 2000);

            runs(function () {
              var numFeatures = CWN2.mapMngr.getLayerByName(config.layerName).features.length;
              expect(numFeatures).toEqual(2);
            });

        });

        it("loadFeatures by URL",function(){

            var layerName = 'GeoJSON_VOID';

            var url = "/CartoWebNet2/services/Configuration/Static/test/TestGeoJSON.json"
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
                  "clean": true
              }
            };
            CWN2.map.loadFeatures(config);

            waitsFor(function() {return CWN2.mapMngr.getLayerByName(layerName).loadend; }, "Caricamento non effettuato", 2000);

            runs(function () {
              var numFeatures = CWN2.mapMngr.getLayerByName(config.layerName).features.length;
              expect(numFeatures).toEqual(3);
              CWN2.mapMngr.getLayerByName(config.layerName).destroyFeatures();
              //CWN2.layerMngr.remove([config.layerName]);

            });
        });

        it("loadSelectFeatureControl",function(){
            CWN2.featureMngr.loadSelectFeatureControl(CWN2.olMap);
            var hoverFeatureControl = CWN2.olMap.getControlsBy("name", "hoverFeatureControl")[0];
            expect(hoverFeatureControl.CLASS_NAME).toEqual("OpenLayers.Control.SelectFeature");
            var selectFeatureControl = CWN2.olMap.getControlsBy("name", "selectFeatureControl")[0];
            expect(selectFeatureControl.CLASS_NAME).toEqual("OpenLayers.Control.SelectFeature");
            var hiliteFeatureControl = CWN2.olMap.getControlsBy("name", "hiliteFeatureControl")[0];
            expect(hiliteFeatureControl.CLASS_NAME).toEqual("OpenLayers.Control.SelectFeature");
        });

    });


    /*
    ATTENZIONE: Per testare selectFeature carico una configurazione particolare
     */
    describe("featureMngr.selectFeature", function() {

        // faccio in modo che venga eseguita solo una volta
        var _beforeAll = false;
        beforeEach(function(){
            if (_beforeAll) return;
            _beforeAll = true;
            initConfig = CWN2.test.init(CWN2.test.appConfigSelectFeature);
        });






        it("selectFeature (hiliteOnly = false) ",function(){

            var layerName = 'GeoJSON';
            var layer = CWN2.mapMngr.getLayerByName(layerName);
            // override del metodo per simulare gli eventi
            layer.getFeatureFromEvent = function(evt) { return _feature; };
            var evt = {xy: new OpenLayers.Pixel(Math.random(), Math.random())};
            var _feature, feature1,feature2,feature3;
            var map = CWN2.olMap;

            waitsFor(function() {return CWN2.mapMngr.getLayerByName(layerName).loadend; }, "Caricamento non effettuato", 2000);

            runs(function () {
                var selectConf = {
                    "layerName": layerName,
                    "attrName": "id",
                    "item": "ID1"
                };
                spyOn(CWN2.featureMngr, "onFeatureSelect");
                CWN2.featureMngr.selectFeature(selectConf);
                feature1 = layer.getFeaturesByAttribute(selectConf.attrName,"ID1")[0];
                feature2 = layer.getFeaturesByAttribute(selectConf.attrName,"ID2")[0];
                feature3 = layer.getFeaturesByAttribute(selectConf.attrName,"ID3")[0];
                // verifico che la feature abbia intent "select"
                expect(feature1.renderIntent).toEqual("select");
                // verifico che la funzione associata alla select sia richiamata
                expect(CWN2.featureMngr.onFeatureSelect).toHaveBeenCalled();
                // verifico che dopo muoseover la feature abbia intent "hover"
                _feature = feature1;
                evt.type = "mousemove";
                map.events.triggerEvent(evt.type, evt);
                expect(feature1.renderIntent).toEqual("hover");
                // verifico che dopo muoseout la feature abbia intent "select"
                _feature = null;
                evt.type = "mousemove";
                map.events.triggerEvent(evt.type, evt);
                expect(feature1.renderIntent).toEqual("select");
                // seleziono la feature 2
                var selectConf = {
                    "layerName": layerName,
                    "attrName": "id",
                    "item": "ID2"
                };
                CWN2.map.selectFeature(selectConf);
                // verifico che la feature2 abbia intent "select" e la feature2 abbia intent "default"
                expect(feature2.renderIntent).toEqual("select");
                expect(feature1.renderIntent).toEqual("default");
                // verifico che dopo muoseover la feature abbia intent "hover"
                _feature = feature1;
                evt.type = "mousemove";
                map.events.triggerEvent(evt.type, evt);
                expect(feature1.renderIntent).toEqual("hover");
                // verifico che dopo muoseout la feature abbia intent "select"
                _feature = null;
                evt.type = "mousemove";
                map.events.triggerEvent(evt.type, evt);
                expect(feature1.renderIntent).toEqual("default");
                // verifico che dopo click su feature3: feature3 con intent "select", feature2 con intent "default"
                _feature = feature3;
                evt.type = "click";
                map.events.triggerEvent(evt.type, evt);
                expect(feature3.renderIntent).toEqual("select");
                expect(feature2.renderIntent).toEqual("default");

            });




      });

        it("unselectFeature (hiliteOnly = false) ",function(){

            var layerName = 'GeoJSON';
            var layer = CWN2.mapMngr.getLayerByName(layerName);
            // override del metodo per simulare gli eventi
            layer.getFeatureFromEvent = function(evt) { return _feature; };
            var evt = {xy: new OpenLayers.Pixel(Math.random(), Math.random())};
            var _feature, feature1,feature2,feature3;
            var map = CWN2.olMap;

            waitsFor(function() {return CWN2.mapMngr.getLayerByName(layerName).loadend; }, "Caricamento non effettuato", 2000);

            runs(function () {
                var selectConf = {
                    "layerName": layerName,
                    "attrName": "id",
                    "item": "ID1"
                };
                CWN2.map.selectFeature(selectConf);
                feature1 = layer.getFeaturesByAttribute(selectConf.attrName,"ID1")[0];
                // verifico che la feature abbia intent "select"
                expect(feature1.renderIntent).toEqual("select");
                CWN2.map.unselectFeature(selectConf);
                expect(feature1.renderIntent).toEqual("default");
            });

      });

        it("selectFeature/unselectFeature (hiliteOnly = true) ",function(){

            var layerName = 'GeoJSON';
            var layer = CWN2.mapMngr.getLayerByName(layerName);
            // override del metodo per simulare gli eventi
            layer.getFeatureFromEvent = function(evt) { return _feature; };
            var evt = {xy: new OpenLayers.Pixel(Math.random(), Math.random())};
            var _feature, feature1,feature2,feature3;
            var map = CWN2.olMap;

            waitsFor(function() {return CWN2.mapMngr.getLayerByName(layerName).loadend; }, "Caricamento non effettuato", 2000);

            runs(function () {
                var selectConf = {
                    "layerName": layerName,
                    "attrName": "id",
                    "item": "ID1",
					"options": {
						"zoom": false,
						"hiliteOnly": true
					}
                };
                feature1 = layer.getFeaturesByAttribute(selectConf.attrName,"ID1")[0];
                feature2 = layer.getFeaturesByAttribute(selectConf.attrName,"ID2")[0];
                feature3 = layer.getFeaturesByAttribute(selectConf.attrName,"ID3")[0];
                // verifico che la feature abbia intent corretto
                expect(feature1.renderIntent).toEqual("default");
                // seleziono la feature 1
                CWN2.map.selectFeature(selectConf);
                // verifico che la feature abbia intent corretto
                expect(feature1.renderIntent).toEqual("hover");
                // deseleziono la feature 1
                CWN2.map.unselectFeature(selectConf);
                // verifico che la feature abbia intent corretto
                expect(feature1.renderIntent).toEqual("default");
                // verifico che dopo click su feature3: feature3 con intent "select", feature2 con intent "default"
                _feature = feature1;
                evt.type = "click";
                map.events.triggerEvent(evt.type, evt);
                expect(feature1.renderIntent).toEqual("select");
                // seleziono la feature 1
                CWN2.map.selectFeature(selectConf);
                // verifico che la feature abbia intent corretto
                expect(feature1.renderIntent).toEqual("hover");
                // deseleziono la feature 1
                CWN2.map.unselectFeature(selectConf);
                // verifico che la feature abbia intent corretto
                expect(feature1.renderIntent).toEqual("select");

            });




      });

        it("hiliteFeatures / resetHilite ",function(){

            var layerName = 'GeoJSON';
            var layer = CWN2.mapMngr.getLayerByName(layerName);
            // override del metodo per simulare gli eventi
            layer.getFeatureFromEvent = function(evt) { return _feature; };
            var evt = {xy: new OpenLayers.Pixel(Math.random(), Math.random())};
            var _feature, feature1,feature2,feature3;
            var map = CWN2.olMap;

            waitsFor(function() {return CWN2.mapMngr.getLayerByName(layerName).loadend; }, "Caricamento non effettuato", 2000);

            runs(function () {
                var hiliteConf = {
                    "layerName": "GeoJSON",
                    "filter" : {
                        "type": "BY_ATTRIBUTE",
                        "attrName": "id",
                        "items": ["ID1","ID2"]
                    },
                    "options": {
                        "zoom": false
                    }
                };

				CWN2.featureMngr.hiliteFeatures(hiliteConf);
                feature1 = layer.getFeaturesByAttribute(hiliteConf.filter.attrName,"ID1")[0];
                feature2 = layer.getFeaturesByAttribute(hiliteConf.filter.attrName,"ID2")[0];
                feature3 = layer.getFeaturesByAttribute(hiliteConf.filter.attrName,"ID3")[0];
                // verifico che le feature abbiano intent corretto
                expect(feature1.renderIntent).toEqual("hilite");
                expect(feature2.renderIntent).toEqual("hilite");
                expect(feature3.renderIntent).toEqual("default");
                expect(CWN2.featureMngr.getHilitedFeatures().length).toEqual(2);
                // verifico che dopo muoseover la feature abbia intent "hover"
                _feature = feature1;
                evt.type = "mousemove";
                map.events.triggerEvent(evt.type, evt);
                expect(feature1.renderIntent).toEqual("hover");
                // verifico che dopo muoseout la feature abbia intent "select"
                _feature = null;
                evt.type = "mousemove";
                map.events.triggerEvent(evt.type, evt);
                expect(feature1.renderIntent).toEqual("hilite");

                // reset
                CWN2.featureMngr.resetHilite();
                // verifico che le feature abbiano intent corretto
                expect(feature1.renderIntent).toEqual("default");
                expect(feature2.renderIntent).toEqual("default");
                expect(feature3.renderIntent).toEqual("default");
                expect(CWN2.featureMngr.getHilitedFeatures().length).toEqual(0);
            });

      });


    });


});

