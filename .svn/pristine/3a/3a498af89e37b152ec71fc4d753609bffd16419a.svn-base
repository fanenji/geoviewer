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



});

