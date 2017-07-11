/**
 * Created by JetBrains WebStorm.
 * User: parodi
 * Date: 14/12/11
 * Time: 18.37
 * To change this template use File | Settings | File Templates.
 */




// suite per i test di unita'
describe("CWN2 - Unit Test Suite", function() {

    var testConfig = {
        application: {
            mapOptions: {
                maxExtent: "1,2,3,4",
                projection: "EPSG:900913"
            },
            layout: {
                type: "simple"
            }
        },
        map: {},
        baseLayers: [
            { id: 1 },
            { id: 2}
        ]
    };


    describe("util", function() {

        describe("isPointInLig", function() {

            it("return false if point is null",function(){

                var x,y;

                var value = CWN2.Util.isPointInLig(x,y);

                expect(value).toEqual(false);

            });

            it("return false if point is out of lig",function(){

                var x = 1 ,y = 1;

                var value = CWN2.Util.isPointInLig(x,y);

                expect(value).toEqual(false);

            });

            it("return true if point is in lig",function(){

                var x = 8 ,y = 44;

                var value = CWN2.Util.isPointInLig(x,y);

                expect(value).toEqual(true);

            });
        });
        
        describe("transformStrBounds", function() {

            it("transform a bound",function(){

                var oldBound = "830036.283895,5402959.60361,1123018.973727,5597635.329038";
                var newBound = CWN2.Util.transformStrBounds("EPSG:900913","EPSG:3003",oldBound);
                newBound = newBound.split(',');
                newBound[0] = Math.floor(newBound[0]);
                newBound[1] = Math.floor(newBound[1]);
                newBound[2] = Math.floor(newBound[2]);
                newBound[3] = Math.floor(newBound[3]);

                expect(newBound[0]).toEqual(1375394);
                expect(newBound[1]).toEqual(4827631);
                expect(newBound[2]).toEqual(1587844);
                expect(newBound[3]).toEqual(4967416);

            });

        });

        describe("handleException", function() {

            it("write console log for level 0",function(){

                var except = {
                    name: 'TestExcpept',
                    message: 'message',
                    level: 0
                };
                spyOn(CWN2.Util,'log');

                CWN2.Util.handleException(except);

                expect(CWN2.Util.log).toHaveBeenCalledWith('message',0);

            });

            it("write console log and show message for level 1",function(){

                var except = {
                    name: 'TestExcpept',
                    message: 'message',
                    level: 1
                };
                spyOn(CWN2.Util,'log');
                spyOn(CWN2.Util,'messageBox');

                CWN2.Util.handleException(except);

                expect(CWN2.Util.log).toHaveBeenCalledWith('message',1);
                expect(CWN2.Util.msgBox).toHaveBeenCalledWith('message');

            });

        });

        describe("assert", function() {

            it("throw error on false condition",function(){

                expect(function() { CWN2.Util.assert(false,"TestError"); } ).toThrow("TestError");

            });

            it("don't throw error on true condition",function(){

                expect(function() { CWN2.Util.assert(true,"TestError"); } ).not.toThrow("TestError");

            });
        });

        describe("cloneObj", function() {

            it("deep clone an object",function(){

                var oldObj = {
                    "prop1": true,
                    "innerObj": {
                        "prop2": true
                    }
                };
                var newObj = CWN2.Util.cloneObj(oldObj);

                expect(newObj.prop1).toBeTruthy();
                expect(newObj.innerObj.prop2).toBeTruthy();

            });

        });

     });

    describe("widgetMngr", function() {

        it("load",function(){
            var widgetsConfig = [{
                "type": "widget",
                "name": "Scale"
            }];

            CWN2.widgetMngr.load(widgetsConfig);

            expect(CWN2.widgetMngr.getConfig().length).toEqual(1);

        });

        it("raise exception if param is null",function(){
            var widgetConfig = null;

            spyOn(CWN2.Util, "handleException");

            CWN2.widgetMngr.load(widgetConfig);

            expect(CWN2.Util.handleException).toHaveBeenCalled();

        });

        it("raise exception if param is not an array",function(){
            var widgetConfig = {
                "type": "widget",
                "name": "Test2"
            };

            spyOn(CWN2.Util, "handleException");

            CWN2.widgetMngr.load(widgetConfig);

            expect(CWN2.Util.handleException).toHaveBeenCalled();

        });

        it("raise exception on wrong widget name",function(){
            var widgetConfig = [{
                "type": "widget",
                "name": "Test2"
            }];

            spyOn(CWN2.Util, "handleException");

            CWN2.widgetMngr.load(widgetConfig);

            expect(CWN2.Util.handleException).toHaveBeenCalled();

        });

    });

    describe("controlFactory", function() {

        it("create",function(){
            var controlConfig = {
                "type": "control",
                "name": "ArgParser"
            };

            var olControl = CWN2.controlFactory.create(controlConfig);

            expect(olControl.CLASS_NAME).toEqual("OpenLayers.Control.ArgParser");

        });

        it("raise exception",function(){
            var controlConfig = {
                "type": "control",
                "name": null
            };
            expect(function() { CWN2.controlFactory.create(controlConfig); } ).toThrow("BadOLControl");

        });

    });

    describe("layerFactory", function() {

        it("create google",function(){
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

        it("create OSM",function(){
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

        it("create WMS",function(){
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

        it("create GeoJSON",function(){
            var layerConfig = 		{
                "type": "GeoJSON",
                "name": "Prova",
                "projection": "EPSG:4326",
                "isBaseLayer": false,
                "visible": true,
                "url": "http://dcarto3.datasiel.net/MapServer/6.0/mapserv.exe?MAP=E:\\progetti\\mapfiles\\test\\test.map&SERVICE=WFS&VERSION=1.0.0&REQUEST=getfeature&TYPENAME=GNSS&OUTPUTFORMAT=GeoJSON",
                "classes": []
            };
            var layer = CWN2.layerFactory.create(layerConfig);
            expect(layer.CLASS_NAME).toEqual("OpenLayers.Layer.Vector");
        });

        it("throw exception",function(){
            var layerConfig = {
                "type": "test"
            };
            expect(function() { CWN2.layerFactory.create(layerConfig); } ).toThrow("BadLayerConfig");
        });

        //TODO: per layer vettoriali testare la costruzione corretta delle styleMap

    });



    xdescribe("appMngr", function() {

        
        describe("checkConfig", function() {

            it("throw exception if configuration is null",function(){
                var config = null;
                expect(function() { CWN2.Application.checkConfig(config); } ).toThrow("BadConfiguration");
            });

            it("throw exception if application is null",function(){
                var config = {application: null};
                expect(function() { CWN2.Application.checkConfig(config); } ).toThrow("BadConfiguration");
            });

            it("throw exception if mapOptions is null",function(){
                var config = {
                    application: {
                        mapOptions: null
                    }
                };
                expect(function() { CWN2.Application.checkConfig(config); } ).toThrow("BadConfiguration");
            });

            it("throw exception if maxExtent is null",function(){
                var config = {
                    application: {
                        mapOptions: {
                            maxExtent: null
                        }
                    }
                };
                expect(function() { CWN2.Application.checkConfig(config); } ).toThrow("BadConfiguration");
            });

            it("throw exception if projection is null",function(){
                var config = {
                    application: {
                        mapOptions: {
                            maxExtent: "1,2,3,4",
                            projection: null
                        }
                    }
                };
                expect(function() { CWN2.Application.checkConfig(config); } ).toThrow("BadConfiguration");
            });

            it("throw exception if layout is null",function(){
                var config = {
                    application: {
                        mapOptions: {
                            maxExtent: "1,2,3,4",
                            projection: "EPSG:3003"
                        }
                    },
                    layout: null
                };
                expect(function() { CWN2.Application.checkConfig(config); } ).toThrow("BadConfiguration");
            });

            it("throw exception if layout is not supported",function(){
                var config = {
                    application: {
                        mapOptions: {
                            maxExtent: "1,2,3,4",
                            projection: "EPSG:3003"
                        }
                    },
                    layout: {
                        type: null
                    }
                };
                expect(function() { CWN2.Application.checkConfig(config); } ).toThrow("BadConfiguration");
            });

            it("throw exception if baseLayers is null",function(){
                var config = {
                    application: {
                        mapOptions: {
                            maxExtent: "1,2,3,4",
                            projection: "EPSG:3003"
                        }
                    },
                    layout: {
                        type: "simple"
                    }
                };
                expect(function() { CWN2.Application.checkConfig(config); } ).toThrow("BadConfiguration");
            });

            it("throw exception if baseLayers is empty",function(){
                var config = {
                    application: {
                        mapOptions: {
                            maxExtent: "1,2,3,4",
                            projection: "EPSG:3003"
                        }
                    },
                    layout: {
                        type: "simple"
                    },
                    baseLayers: []
                };
                expect(function() { CWN2.Application.checkConfig(config); } ).toThrow("BadConfiguration");
            });

        });

        describe("setLanguage", function() {

            it("set language by configuration",function(){
                var config = {
                    application: {
                        layout: {
                           language: "en-EN"
                        }
                    }
                };
                var initOptions = {
                    language: null
                };

                CWN2.Application.setLanguage(config,initOptions);
                expect(CWN2.i18n.language).toEqual("en-EN");

            });

            it("set language by initOptions",function(){
                var config = {
                    application: {
                        layout: {
                           language: "en-EN"
                        }
                    }
                };

                var initOptions = {
                    language: "en-US"
                };

                CWN2.Application.setLanguage(config,initOptions);
                expect(CWN2.i18n.language).toEqual("en-US");

            });

        });

        it("init - configurazione locale",function(){


            var appConfig = {
                application: {
                    mapOptions: "mapOptions",
                    layout: "layout"
                },
                baseLayers : "baseLayers",
                layers : "layers"
            };
            var callback = function() {
                return "chiamata";
            };
            var initConfig = {
                appConfig: appConfig,
                divID: "divID",
                callBack: callback,
                proxy: "/CartoWebNet2/services/proxy/proxy.asp?url=",
                debug: true
            };
            var getLayoutConfig = function () {
                return "layoutConfig";
            };
            var Cwn2_configuration = {
                getLayoutConfig: getLayoutConfig
            };

            spyOn(CWN2.Application, "checkConfig");
            spyOn(CWN2.layerMngr, "init");
            spyOn(CWN2, "Map");
            spyOn(CWN2, "Layout");
            spyOn(CWN2.mapMngr, "zoomToInitialExtent");
            spyOn(initConfig, "callBack");

            var app = new CWN2.Application(initConfig);

            // controlla la configurazione
            expect(CWN2.Application.checkConfig).toHaveBeenCalledWith(appConfig);
            // impostazione variabili globali
            expect(CWN2.debug).toEqual(true);
            expect(CWN2.proxy).toEqual('/CartoWebNet2/services/proxy/proxy.asp?url=');
            expect(OpenLayers.ProxyHost).toEqual('/CartoWebNet2/services/proxy/proxy.asp?url=');
            expect(OpenLayers.Layer.Vector.prototype.renderers.length).toEqual(3);
            // inizializzazione layer
            expect(CWN2.layerMngr.init).toHaveBeenCalledWith(appConfig.baseLayers,appConfig.layers,true);
            // construzione mappa OL
            expect(CWN2.Map).toHaveBeenCalledWith(appConfig.application.mapOptions);
            // costruzione Layout
            expect(CWN2.Layout).toHaveBeenCalled();
            // zoom iniziale
            expect(CWN2.mapMngr.zoomToInitialExtent).toHaveBeenCalled();
            // impostazione flag fine caricamento
            expect(app.loadend).toBe(true);
            // richiamo funzione di callback
            expect(initConfig.callBack).toHaveBeenCalled();

        });

        it("init - configurazione remota",function(){

            var initConfig = {
                appConfig: "http://url",
                divID: "divID",
                callBack: null,
                proxy: "/CartoWebNet2/services/proxy/proxy.asp?url=",
                debug: true
            };
            var getLayoutConfig = function () {
                return "layoutConfig";
            };
            var Cwn2_configuration = {
                getLayoutConfig: getLayoutConfig
            };

            spyOn(CWN2.Util, "getJSONP");

            var app = new CWN2.Application(initConfig);

            // construzione mappa OL
            expect(CWN2.Util.getJSONP).toHaveBeenCalled();

        });

    });

    xdescribe("mapMngr", function() {

        describe("build", function() {

            var appConfig = {
                application: {
                    layout: {
                        type: "simple"
                    },
                    "mapOptions": {
                          "id": 1,
                          "projection": "EPSG:900913",
                          "displayProjection": "EPSG:4326",
                          "maxExtent": "830036.283895,5402959.60361,1123018.973727,5597635.329038",
                          "units": "m"
                    }
                },
                baseLayers: [
                    { name: "baseLayer", type: "prova" }
                ],
                layers: [
                    { name: "layer1" },
                    { name: "layer2" }
                ]
            };

            var map = CWN2.mapMngr.build(appConfig.application.mapOptions);

            it("build the map",function(){
                expect(map.CLASS_NAME).toEqual("OpenLayers.Map");
            });

            it("set mapOptions",function(){
                var maxExtent = appConfig.application.mapOptions.maxExtent;
                var restrictedExtent = maxExtent;
                var initialExtent = maxExtent;
                var displayProjection = appConfig.application.mapOptions.displayProjection;
                expect(map.maxExtent).toEqual(maxExtent);
                expect(map.restrictedExtent).toEqual(restrictedExtent);
                expect(map.initialExtent).toEqual(initialExtent);
                expect(map.projection).toEqual(appConfig.application.mapOptions.projection);
                expect(map.displayProjection).toEqual(displayProjection);
            });

            it("set fractionalZoom",function(){
                expect(map.fractionalZoom).toEqual(true);
            });

            it("set controls",function(){
                expect(map.controls.length).toEqual(8);
            });

            it("register move event",function(){
                expect(map.events.listeners.move).toBeDefined();
            });

            it("load layers",function(){

                var appConfig = {
                    application: {
                        layout: {
                            type: "simple"
                        },
                        "mapOptions": {
                              "id": 1,
                              "projection": "EPSG:900913",
                              "displayProjection": "EPSG:4326",
                              "maxExtent": "830036.283895,5402959.60361,1123018.973727,5597635.329038",
                              "units": "m"
                        }
                    },
                    baseLayers: [
                        { name: "baseLayer", type: "prova" }
                    ],
                    layers: [
                        { name: "layer1" },
                        { name: "layer2" }
                    ]
                };

                spyOn(CWN2.layerMngr, "getBaseLayersConfig").andReturn(appConfig.baseLayers);
                spyOn(CWN2.layerMngr, "getLayersConfig").andReturn(appConfig.layers);
                spyOn(CWN2.layerFactory, "create").andReturn(null);

                var map = CWN2.mapMngr.build(appConfig.application.mapOptions);

                expect(CWN2.layerFactory.create.callCount).toEqual(3);
            });

            it("throw exception on bad layer config",function(){

                var layerConfig = {
                    "type": "test"
                };

                spyOn(CWN2.Util, "handleException");

                CWN2.mapMngr.loadLayer(layerConfig);

                expect(CWN2.Util.handleException).toHaveBeenCalled();

            });

            it("throw exception on bad control config",function(){

                var controlConfig = {
                    "type": "control",
                    "name": null
                };

                spyOn(CWN2.Util, "handleException");

                CWN2.mapMngr.loadControl(controlConfig);

                expect(CWN2.Util.handleException).toHaveBeenCalled();

            });

        });

// TODO: testare impostazione initialExtent


    });

    xdescribe("featureLoader", function() {

        describe("loadFeatures", function() {
            // inizializzo la mappa
            var layerName = "name";
            var map = new OpenLayers.Map("map");
            var layer = new OpenLayers.Layer.Vector(layerName, {isBaseLayer: true});
            layer.protocol = '{format:"GeoJSON}';
            map.addLayer(layer);

            var features = { "type": "FeatureCollection",
            "features": [
              { "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [8.0, 44.5]},
                "properties": {
                    "id": "ID1"
                }
              },
              { "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [9.0, 44.5]},
                "properties": {
                    "id": "ID2"
                }
              },
              { "type": "Feature",
                  "geometry": {"type": "Point", "coordinates": [9.0, 44.5]},
                  "properties": {
                      "id": "ID3"
                  }
              }
             ]
            };
            var config = {
              layerName: layerName,
              features: features,
              url: null
            };

            it("throw exception if config is null",function(){

                var badConfig = null;

                expect(function() { CWN2.featureLoader.loadFeatures(badConfig); } ).toThrow("BadParameter");

            });

            it("throw exception if layerName is null",function(){

                var badConfig = {
                  layerName: null,
                  features: null,
                  url: null
                };

                expect(function() { CWN2.featureLoader.loadFeatures(badConfig); } ).toThrow("BadParameter");

            });

            it("throw exception if url and features are both null",function(){

                var badConfig = {
                  layerName: 'TEST',
                  features: null,
                  url: null
                };

                expect(function() { CWN2.featureLoader.loadFeatures(badConfig); } ).toThrow("BadParameter");

            });

            it("load features",function(){
                spyOn(CWN2.Map, "getLayerByName").andReturn(layer);
                spyOn(CWN2.Map, "zoomToFeatures");
                CWN2.featureLoader.loadFeatures(config);
                expect(layer.features.length).toEqual(3);
            });

            it("zoom to feature",function(){
                spyOn(CWN2.Map, "getLayerByName").andReturn(layer);
                spyOn(CWN2.Map, "zoomToFeatures");
                CWN2.featureLoader.loadFeatures(config);
                expect(CWN2.mapMngr.zoomToFeatures).toHaveBeenCalled();
            });

            it("trigger loadend event",function(){
                spyOn(CWN2.Map, "getLayerByName").andReturn(layer);
                spyOn(CWN2.Map, "zoomToFeatures");
                spyOn(layer.events, "triggerEvent");
                CWN2.featureLoader.loadFeatures(config);
                expect(layer.events.triggerEvent).toHaveBeenCalledWith("loadend");
            });

            it("throw exception on bad feature",function(){
                config.features = {feature: "badFeatures"};
                spyOn(CWN2.mapMngr, "getLayerByName").andReturn(layer);
                spyOn(CWN2.mapMngr, "zoomToFeatures");
                spyOn(CWN2.Util, "handleException");
                CWN2.featureLoader.loadFeatures(config);
                expect(CWN2.Util.handleException).toHaveBeenCalled();
            });

            it("load features by url",function(){
                config.features = null;
                config.url = 'http://url';
                spyOn(CWN2.mapMngr, "getLayerByName").andReturn(layer);
                spyOn(CWN2.Util, "getJSONP");
                CWN2.featureLoader.loadFeatures(config);
                expect(CWN2.Util.getJSONP).toHaveBeenCalled();
            });

        });

    });

    xdescribe("featureSelecter", function() {

        var CWN2_mapMngr_getLayerByName = CWN2.mapMngr.getLayerByName;

        afterEach(function(){
            CWN2.mapMngr.getLayerByName = CWN2_mapMngr_getLayerByName;
        });

        it("selectFeature - throw exception if config is null",function(){

            var selectConfig = null;

            expect(function() { CWN2.featureSelecter.selectFeature(selectConfig); } ).toThrow("BadParameter");

        });

        it("selectFeature - throw exception if layerName is null",function(){

            var selectConfig = {
                layerName: null
            };

            expect(function() { CWN2.featureSelecter.selectFeature(selectConfig); } ).toThrow("BadParameter");

        });

        it("selectFeature - throw exception if attrName (or feature) is null",function(){

            var selectConfig = {
                layerName: 'Test',
                attrName: null
            };

            expect(function() { CWN2.featureSelecter.selectFeature(selectConfig,null); } ).toThrow("BadParameter");

        });

        it("selectFeature - throw exception if item (or feature) is null",function(){

            var selectConfig = {
                layerName: 'Test',
                attrName: 'Test',
                item: null
            };

            expect(function() { CWN2.featureSelecter.selectFeature(selectConfig,null); } ).toThrow("BadParameter");

        });

        it("unselectFeature - throw exception if config is null",function(){

            var selectConfig = null;

            expect(function() { CWN2.featureSelecter.unselectFeature(selectConfig); } ).toThrow("BadParameter");

        });

        it("unselectFeature - throw exception if layerName is null",function(){

            var selectConfig = {
                layerName: null
            };

            expect(function() { CWN2.featureSelecter.unselectFeature(selectConfig); } ).toThrow("BadParameter");

        });

        it("unselectFeature - throw exception if attrName (or feature) is null",function(){

            var selectConfig = {
                layerName: 'Test',
                attrName: null
            };

            expect(function() { CWN2.featureSelecter.unselectFeature(selectConfig,null); } ).toThrow("BadParameter");

        });

        it("unselectFeature - throw exception if item (or feature) is null",function(){

            var selectConfig = {
                layerName: 'Test',
                attrName: 'Test',
                item: null
            };

            expect(function() { CWN2.featureSelecter.unselectFeature(selectConfig,null); } ).toThrow("BadParameter");

        });

        it("hiliteFeatures - throw exception if config is null",function(){

            var selectConfig = null;

            expect(function() { CWN2.featureSelecter.selectFeature(selectConfig); } ).toThrow("BadParameter");

        });

        it("hiliteFeatures - throw exception if layerName is null",function(){

            var selectConfig = {
                layerName: null
            };

            expect(function() { CWN2.featureSelecter.selectFeature(selectConfig); } ).toThrow("BadParameter");

        });

        it("hiliteFeatures - throw exception if filter is null",function(){

            var selectConfig = {
                layerName: 'test',
                filter: null
            };

            expect(function() { CWN2.featureSelecter.selectFeature(selectConfig); } ).toThrow("BadParameter");

        });

        it("hiliteFeatures - throw exception if filter is not BY_ATTRIBUTE",function(){

            var selectConfig = {
                layerName: 'Test',
                filter: {
                    type: 'FAKE',
                    attrName: null
                }
            };

            expect(function() { CWN2.featureSelecter.selectFeature(selectConfig,null); } ).toThrow("BadParameter");

        });

        it("hiliteFeatures - throw exception if filter.type is BY_ATTRIBUTE and attrName is null",function(){

            var selectConfig = {
                layerName: 'Test',
                filter: {
                    type: 'BY_ATTRIBUTE',
                    attrName: null
                }
            };

            expect(function() { CWN2.featureSelecter.selectFeature(selectConfig,null); } ).toThrow("BadParameter");

        });

        it("hiliteFeatures - throw exception if filter.type is BY_ATTRIBUTE and items is null",function(){

            var selectConfig = {
                layerName: 'Test',
                filter: {
                    type: 'BY_ATTRIBUTE',
                    attrName: 'TEST',
                    items: null
                }
            };

            expect(function() { CWN2.featureSelecter.selectFeature(selectConfig,null); } ).toThrow("BadParameter");

        });

        it("hiliteFeatures - throw exception if filter.type is BY_ATTRIBUTE and items is not an array",function(){

            var selectConfig = {
                layerName: 'Test',
                filter: {
                    type: 'BY_ATTRIBUTE',
                    attrName: 'TEST',
                    items: 'FAKE'
                }
            };

            expect(function() { CWN2.featureSelecter.selectFeature(selectConfig,null); } ).toThrow("BadParameter");

        });

    });

    xdescribe("layerMngr", function() {

        it("init",function(){

            var numLayersInStore = 0;
            var layersConfig = [
                {
                    name: "test1"
                }
            ];
            var baseLayersConfig = [
                {
                    name: "test2"
                }
            ];

            CWN2.layerMngr.init(baseLayersConfig,layersConfig);

            // controlla configurazione
            expect(CWN2.layerMngr.getLayersConfig().length).toBe(1);
            expect(CWN2.layerMngr.getBaseLayersConfig().length).toBe(1);

            // build layer store
            expect(CWN2.layerMngr.getOverlayLayersNameFromStore().length).toBe(1);
            expect(CWN2.layerMngr.getLayerStore("base").data.items.length).toBe(1);

        });

        it("add/remove",function(){

            var numLayersInStore = 0;
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

            spyOn(CWN2.mapMngr, "loadLayer");
            spyOn(CWN2.mapMngr, "getLayerByName").andReturn(null);
            spyOn(CWN2.mapMngr, "removeLayer");

            CWN2.layerMngr.addLayers(layerConfig);

            // carica la configurazione
            expect(CWN2.layerMngr.getLayersConfig().length).toBe(2);
            // carica i layer sulla mappa
            expect(CWN2.mapMngr.loadLayer).toHaveBeenCalled();
            // carica i layer sullo store
            expect(CWN2.layerMngr.getOverlayLayersNameFromStore().length).toBe(2);

            CWN2.layerMngr.remove([layerConfig.name]);
            expect(CWN2.layerMngr.getLayersConfig().length).toBe(1);
            expect(CWN2.layerMngr.getOverlayLayersNameFromStore().length).toBe(1);

        });

        it("createVectorLayer",function(){

            var config = {
                name: 'TEST_CREATE_VECTOR_LAYER',
                format: 'GeoJSON',
                classes: null
            };

            spyOn(CWN2.layerMngr, "addLayers");
            spyOn(CWN2.mapMngr, "getLayerByName").andReturn(null);

            var layer = CWN2.layerMngr.createVectorLayer(config);
            //verifico che sia stata chiamata la funzione add
            expect(CWN2.layerMngr.addLayers).toHaveBeenCalled();

        });


    });

    describe("ExtMediaWindow", function() {

        it("create",function(){
            var url = "http://server/dir/page.html";
            var width = 200;
            var height = 100;
            var winID = 'test-win-1';
            var win = new CWN2.ExtMediaWindow(url,width,height,winID);
            expect(winID).toEqual(win.id);
        });

    });

    describe("GoogleGeocoderCombo", function() {

        it("create",function(){
            var config = {
                id: "test-id",
                listeners: null,
                googleGeocodeServiceUrl: "url"
            };

            var combo = new CWN2.GoogleGeocoderCombo(config);
            expect(combo.id).toEqual(config.id);
        });

    });

    describe("routingMngr", function() {

        it("setOrigin",function(){
            var address = "TEST";
            var lat = 44.5;
            var lon = 8.9;
            var latLng = new google.maps.LatLng(lat, lon);

            CWN2.routingMngr.setOrigin(address,lat,lon);

            expect(CWN2.routingMngr.getOrigin().address).toEqual(address);
            expect(CWN2.routingMngr.getOrigin().lat).toEqual(lat);
            expect(CWN2.routingMngr.getOrigin().lon).toEqual(lon);
            expect(CWN2.routingMngr.getOrigin().latLng).toEqual(latLng);
        });

        it("setOrigin throw exception",function(){
            var address = "TEST";
            var lat = 44.5;
            var lon = 8.9;
            var latLng = new google.maps.LatLng(lat, lon);

            CWN2.routingMngr.setOrigin(address,lat,lon);

            expect(CWN2.routingMngr.getOrigin().address).toEqual(address);
            expect(CWN2.routingMngr.getOrigin().lat).toEqual(lat);
            expect(CWN2.routingMngr.getOrigin().lon).toEqual(lon);
            expect(CWN2.routingMngr.getOrigin().latLng).toEqual(latLng);
        });

        it("setDestination",function(){
            var address = "TEST";
            var lat = 44.5;
            var lon = 8.9;
            var latLng = new google.maps.LatLng(lat, lon);

            CWN2.routingMngr.setDestination(address,lat,lon);

            expect(CWN2.routingMngr.getDestination().address).toEqual(address);
            expect(CWN2.routingMngr.getDestination().lat).toEqual(lat);
            expect(CWN2.routingMngr.getDestination().lon).toEqual(lon);
            expect(CWN2.routingMngr.getDestination().latLng).toEqual(latLng);
        });

        it("setTravelMode",function(){
            var mode = google.maps.TravelMode.WALKING;

            CWN2.routingMngr.setTravelMode(mode);

            expect(CWN2.routingMngr.getTravelMode()).toEqual(mode);
        });

        it("swapDirection",function(){

            var address1 = "ORIGIN";
            var lat1 = 44;
            var lon1 = 8;
            CWN2.routingMngr.setOrigin(address1,lat1,lon1);
            var address2 = "DESTINATION";
            var lat2 = 45;
            var lon2 = 9;
            CWN2.routingMngr.setDestination(address2,lat2,lon2);

            CWN2.routingMngr.swapDirection();

            expect(CWN2.routingMngr.getOrigin().address).toEqual(address2);
            expect(CWN2.routingMngr.getOrigin().lat).toEqual(lat2);
            expect(CWN2.routingMngr.getOrigin().lon).toEqual(lon2);
            expect(CWN2.routingMngr.getDestination().address).toEqual(address1);
            expect(CWN2.routingMngr.getDestination().lat).toEqual(lat1);
            expect(CWN2.routingMngr.getDestination().lon).toEqual(lon1);
        });

        describe("getRequestParams",function(){

            it("by address",function(){

                var address1 = "ORIGIN",
                    lat1 = 44,
                    lon1 = 8,
                    address2 = "DESTINATION",
                    lat2 = 45,
                    lon2 = 9,
                    mode = google.maps.TravelMode.WALKING,
                    request = {
                        origin: address1,
                        destination: address2,
                        travelMode: mode,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        region: "it"
                    },
                    requestParam;
                CWN2.routingMngr.setOrigin(address1,lat1,lon1);
                CWN2.routingMngr.setDestination(address2,lat2,lon2);
                CWN2.routingMngr.setTravelMode(mode);

                requestParam = CWN2.routingMngr.getRequestParams();

                expect(requestParam).toEqual(request);

            });

            it("by latLng",function(){

                var address1 = null,
                    lat1 = 44,
                    lon1 = 8,
                    latLng1 = new google.maps.LatLng(lat1, lon1),
                    address2 = null,
                    lat2 = 45,
                    lon2 = 9,
                    latLng2 = new google.maps.LatLng(lat2, lon2),
                    mode = google.maps.TravelMode.WALKING,
                    request = {
                        origin: latLng1,
                        destination: latLng2,
                        travelMode: mode,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        region: "it"
                    },
                    requestParam;
                CWN2.routingMngr.setOrigin(address1,lat1,lon1);
                CWN2.routingMngr.setDestination(address2,lat2,lon2);
                CWN2.routingMngr.setTravelMode(mode);

                requestParam = CWN2.routingMngr.getRequestParams();

                expect(requestParam).toEqual(request);

            });

        });

        describe("calculate",function(){

            it("throw exception on missing origin",function(){

                var address1 = null,
                    lat1 = null,
                    lon1 = null,
                    address2 = "DESTINATION",
                    lat2 = 45,
                    lon2 = 9,
                    mode = google.maps.TravelMode.WALKING,
                    requestParam;
                CWN2.routingMngr.setOrigin(address1,lat1,lon1);
                CWN2.routingMngr.setDestination(address2,lat2,lon2);

                requestParam = CWN2.routingMngr.getRequestParams();

                expect(function() { CWN2.routingMngr.calculate(requestParam); } ).toThrow("MissingOrigin");

            });

            it("throw exception on missing destination",function(){

                var address1 = "ORIGIN",
                    lat1 = 44,
                    lon1 = 8,
                    address2 = null,
                    lat2 = null,
                    lon2 = null,
                    mode = google.maps.TravelMode.WALKING,
                    requestParam;
                CWN2.routingMngr.setOrigin(address1,lat1,lon1);
                CWN2.routingMngr.setDestination(address2,lat2,lon2);

                requestParam = CWN2.routingMngr.getRequestParams();

                expect(function() { CWN2.routingMngr.calculate(); } ).toThrow("MissingDestination");

            });

        });

    });


});


