/**
 * Created by JetBrains WebStorm.
 * User: parodi
 * Date: 14/12/11
 * Time: 18.37
 * To change this template use File | Settings | File Templates.
 */

// suite per il test generico di sistema
describe("CWN2 System Test", function() {


    var app = new CWN2.Application({
        appConfig: "http://dcarto3.datasiel.net:5984/cwn2_config/SystemTest",
        divID: null,
        callBack: null,
        language: "en",
        proxy: "/CartoWebNet2/services/proxy/proxy.asp?url=",
        debug:false
    });
    app.id = 1;

    describe("init app", function() {

        it("build layout panels",function(){

            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                var viewport = Ext.getCmp("cwn2-container-" + app.id);
                expect(viewport).toBeTruthy();
                expect(viewport.items.items[0].id).toEqual("cwn2-legend-panel-" + app.id);
                expect(viewport.items.items[1].id).toEqual("cwn2-map-panel-" + app.id);
            });

        });

        it("load items on statusBar",function(){

            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                expect(Ext.getCmp("cwn2-statusbar-" + app.id).items.items[0].id).toEqual("cwn2-scale-div-"  + app.id);
                expect(Ext.getCmp("cwn2-statusbar-" + app.id).items.items[1].id).toEqual("cwn2-coordinate-readout-div-"  + app.id);
                expect(Ext.getCmp("cwn2-statusbar-" + app.id).items.items[2].id).toEqual("cwn2-measure-div-"  + app.id);
            });

        });

        it("load buttons on toolbar",function(){

            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                var toolbar = Ext.getCmp("cwn2-toolbar-" + app.id);
                expect(toolbar.items.length).toEqual(15);
            });

        });

        it("build the map",function(){

            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                expect(app.map.CLASS_NAME).toEqual("CWN2.Map");
            });

        });

        xit("load olControls",function(){

            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                expect(app.map.getControlsByClass("CWN2.Control.Zoom").length).toEqual(1);
            });

        });

        it("load layers on map",function(){

            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                expect(app.map.getLayerByName("sfondo_bianco").CLASS_NAME).toEqual("OpenLayers.Layer");
                expect(app.map.getLayerByName("Google_Stradario").CLASS_NAME).toEqual("OpenLayers.Layer.Google");
                expect(app.map.getLayerByName("Google_Satellite").CLASS_NAME).toEqual("OpenLayers.Layer.Google");
                expect(app.map.getLayerByName("OSM").CLASS_NAME).toEqual("OpenLayers.Layer.OSM");
                expect(app.map.getLayerByName("L1").CLASS_NAME).toEqual("OpenLayers.Layer.WMS");
                expect(app.map.getLayerByName("L3").CLASS_NAME).toEqual("OpenLayers.Layer.WMS");
                expect(app.map.getLayerByName("WFS").CLASS_NAME).toEqual("OpenLayers.Layer.Vector");
                expect(app.map.getLayerByName("GeoJSON").CLASS_NAME).toEqual("OpenLayers.Layer.Vector");
            });

        });

        it("load layers on legend",function(){

            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                var overlayLegend = Ext.getCmp("cwn2-legend-panel-" + app.id).items.items[0];
                var overlayNumLegendEntry = overlayLegend.store.data.items.length;
                expect(overlayNumLegendEntry).toEqual(4);
                var label1 = overlayLegend.store.data.items[0].data.legend.label;
                expect(label1).toEqual("GeoJSON");
                var label2 = overlayLegend.store.data.items[1].data.legend.label;
                expect(label2).toEqual("GNSS (WFS)");
                var label3 = overlayLegend.store.data.items[2].data.legend.label;
                expect(label3).toEqual("Province");
                var label4 = overlayLegend.store.data.items[3].data.legend.label;
                expect(label4).toEqual("Comuni 1:5000");
                var baseLegend = Ext.getCmp("cwn2-legend-panel-" + app.id).items.items[1];
                var baseNumLegendEntry = overlayLegend.store.data.items.length;
                expect(baseNumLegendEntry).toEqual(4);
                label1 = baseLegend.store.data.items[0].data.legend.label;
                expect(label1).toEqual("OSM");
                label2 = baseLegend.store.data.items[1].data.legend.label;
                expect(label2).toEqual("Google Satellite");
                label3 = baseLegend.store.data.items[2].data.legend.label;
                expect(label3).toEqual("Google Stradario");
                label4 = baseLegend.store.data.items[3].data.legend.label;
                expect(label4).toEqual("Sfondo Bianco");

            });

        });

        it("set base layer",function(){

            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                expect(app.map.baseLayer.name).toEqual("Google_Satellite");
            });

        });

        it("set out-of-scale layer not visible",function(){

            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                expect(app.map.getLayerByName("L3").inRange).toBeFalsy();
            });

        });

        it("set out-of-scale layer visible on zoom",function(){

            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                app.map.zoomToScale(100000);
                expect(app.map.getLayerByName("L3").inRange).toBeTruthy();
                app.map.zoomToMaxExtent();
            });

        });

        it("Register actions",function(){

            waitsFor(function() {return app.loadend;}, "Inizializzazione non effettuata", 3000);
            runs(function () {
                expect(app.map.featureManager.registeredCallbacks.onFeatureOut[0] === CWN2.featureActionsRegistry.testOut).toBeTruthy();
                expect(app.map.featureManager.registeredCallbacks.onFeatureOver[0] === CWN2.featureActionsRegistry.testOver).toBeTruthy();
                expect(app.map.featureManager.registeredCallbacks.onFeatureSelect[0] === CWN2.featureActionsRegistry.testSelect).toBeTruthy();
                expect(app.map.featureManager.registeredCallbacks.onFeatureUnselect[0] === CWN2.featureActionsRegistry.testUnselect).toBeTruthy();
            });

        });
    });

    describe("featureLoader", function() {

        var layerName = "GeoJSON";
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
        var url = "http://parodis-dts-pc.datasiel.net/cartowebNet2/services/Configuration/Static/Test/TestGeoJSON.json";

        describe("load feature by json", function() {

            it("load features",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    var layer = app.map.getLayerByName("GeoJSON");
                    var config = {
                      layer: layer,
                      features: features,
                      url: null,
                      options: {
                          zoom: false
                      }
                    };
                    CWN2.featureLoader.loadFeatures(config);
                    expect(layer.features.length).toEqual(3);
                    layer.destroyFeatures();
                });
            });

            xit("zoom to feature",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    var layer = app.map.getLayerByName("GeoJSON");
                    var config = {
                      layer: layer,
                      features: features,
                      url: null,
                      options: {
                          zoom: true
                      }
                    };
                    var beforeExtent = app.map.getExtent();

                    CWN2.featureLoader.loadFeatures(config);

                    waitsFor(function() {return layer.loadend; }, "Layer non caricato", 3000);
                    runs(function () {
                        var afterExtent = app.map.getExtent();
                        expect(afterExtent).not.toEqual(beforeExtent);
                        layer.destroyFeatures();
                        app.map.zoomToMaxExtent();

                    });
                });
            });

        });

        xdescribe("load feature by url", function() {

            it("load features",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    var layer = app.map.getLayerByName("GeoJSON");
                    var config = {
                      layer: layer,
                      features: null,
                      url: url,
                      options: {
                          zoom: false
                      }
                    };
                    CWN2.featureLoader.loadFeatures(config);

                    waitsFor(function() {return layer.loadend; }, "Layer non caricato", 3000);
                    runs(function () {
                        expect(layer.features.length).toEqual(3);
                        layer.destroyFeatures();
                        app.map.zoomToMaxExtent();

                    });

                });
            });



        });

    });

    describe("hiliteFeature", function() {

        var layerName = "GeoJSON";
        var features = { "type": "FeatureCollection",
        "features": [
          { "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [8.0, 44.5]},
            "properties": {
                "ID": "1"
            }
          },
          { "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [9.0, 44.5]},
            "properties": {
                "ID": "2"
            }
          },
          { "type": "Feature",
              "geometry": {"type": "Point", "coordinates": [9.0, 44.5]},
              "properties": {
                  "ID": "3"
              }
          }
         ]
        };

        it("hilite/reset",function(){
            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {

                var layer = app.map.getLayerByName(layerName);

                // carico le features
                var config = {
                  layer: layer,
                  features: features,
                  url: null,
                  options: {
                      zoom: false
                  }
                };
                CWN2.featureLoader.loadFeatures(config);

                // verifico situazione prima hilite
                var feature1 = layer.getFeaturesByAttribute("ID","1")[0];
                var feature2 = layer.getFeaturesByAttribute("ID","2")[0];
                var feature3 = layer.getFeaturesByAttribute("ID","3")[0];

                // preparo hilite
                var hiliteConf = {
                    "layer": layer,
                    "filter" : {
                        "type": "BY_ATTRIBUTE",
                        "attrName": "ID",
                        "items": ["1","2"]
                    },
                    "options": {
                        "zoom": false
                    }
                };
                expect(feature1.renderIntent).toEqual("default");
                expect(feature2.renderIntent).toEqual("default");
                expect(feature3.renderIntent).toEqual("default");

                // faccio hilite
                CWN2.featureHiliter.hiliteFeatures(hiliteConf);

                expect(feature1.renderIntent).toEqual("hilite");
                expect(feature2.renderIntent).toEqual("hilite");
                expect(feature3.renderIntent).toEqual("default");

                // faccio reset
                CWN2.featureHiliter.resetHilite(layer.map);

                expect(feature1.renderIntent).toEqual("default");
                expect(feature2.renderIntent).toEqual("default");

                // ripulisco layer
                layer.destroyFeatures();

            });
        });

    });

    describe("selectFeature", function() {

        var layerName = "GeoJSON";
        var features = { "type": "FeatureCollection",
        "features": [
          { "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [8.0, 44.5]},
            "properties": {
                "ID": "1"
            }
          },
          { "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [9.0, 44.5]},
            "properties": {
                "ID": "2"
            }
          },
          { "type": "Feature",
              "geometry": {"type": "Point", "coordinates": [9.0, 44.5]},
              "properties": {
                  "ID": "3"
              }
          }
         ]
        };

        it("select/unselect - hiliteOnly = true",function(){
            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {

                var layer = app.map.getLayerByName(layerName);

                // carico le features
                var config = {
                  layer: layer,
                  features: features,
                  url: null,
                  options: {
                      zoom: false
                  }
                };
                CWN2.featureLoader.loadFeatures(config);

                var feature1 = layer.getFeaturesByAttribute("ID","1")[0];

                // preparo hilite
                var selectConf = {
                    "layer": layer,
                    "attrName": "ID",
                    "item": "1",
                    "options": {
                        "zoom": true,
                        "hiliteOnly": true
                    }
                };

                // verifico situazione prima hilite
                expect(feature1.renderIntent).toEqual("default");

                // faccio select
                CWN2.featureSelecter.selectFeature(selectConf);

                expect(feature1.renderIntent).toEqual("hover");

                // faccio unselect
                CWN2.featureSelecter.unselectFeature(selectConf);
                //expect(feature1.renderIntent).toEqual("default");

                // ripulisco layer
                layer.destroyFeatures();

            });
        });

        it("select/unselect - hiliteOnly = false",function(){
            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {

                var layer = app.map.getLayerByName(layerName);

                // carico le features
                var config = {
                  layer: layer,
                  features: features,
                  url: null,
                  options: {
                      zoom: false
                  }
                };
                CWN2.featureLoader.loadFeatures(config);

                var feature1 = layer.getFeaturesByAttribute("ID","1")[0];

                // preparo hilite
                var selectConf = {
                    "layer": layer,
                    "attrName": "ID",
                    "item": "1",
                    "options": {
                        "zoom": true,
                        "hiliteOnly": false
                    }
                };

                // verifico situazione prima hilite
                expect(feature1.renderIntent).toEqual("default");

                // faccio select
                CWN2.featureSelecter.selectFeature(selectConf);

                expect(feature1.renderIntent).toEqual("select");

                // faccio unselect
                CWN2.featureSelecter.unselectFeature(selectConf);
                expect(feature1.renderIntent).toEqual("default");

                // ripulisco layer
                layer.destroyFeatures();

            });
        });


    });

    describe("buttons", function() {

        xdescribe("measure",function(){

            beforeEach(function(){
                Ext.getCmp("cwn2-toolbar-" + app.id).items.items[7].btnEl.dom.click();
            });

            afterEach(function(){
                Ext.getCmp("cwn2-toolbar-" + app.id).items.items[7].btnEl.dom.click();
                app.layout.mapPanel.setStatusbarItemText("cwn2-measure-div-" + app.id,"");
            });

            it("show label on statusbar",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    var control = app.map.getControlsByClass("OpenLayers.Control.Measure")[0];
                    control.events.triggerEvent(
                        "measure",
                        {
                            "measure": 160,
                            "units": "km"
                        }
                    );
                    expect(app.layout.mapPanel.getStatusbarItemCmp("cwn2-measure-div-" + app.id).el.dom.childNodes[0].wholeText === "Distanza: 160.000 km").toBeTruthy();
                });
            });


        });

        describe("transparency",function(){

            beforeEach(function(){
                var winCmpId = "cwn2-transparency-win-" + app.id;
                var win = Ext.getCmp(winCmpId);
                if (!win) {
                    Ext.getCmp("cwn2-toolbar-" + app.id).items.items[10].btnEl.dom.click();
                }
            });

            afterEach(function(){
                Ext.getCmp("cwn2-transparency-win-" + app.id).hide();
            });

            it("show window",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    expect(Ext.getCmp("cwn2-transparency-win-" + app.id).isVisible()).toBeTruthy();
                });
            });

            it("show 2 sliders",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    expect(Ext.getCmp("trasp-form").items.items.length).toEqual(4);
                });
            });

            function getSlider(items,label) {
                for (var i=0; i < items.length; i++) {
                    if (items[i].fieldLabel === label) {
                        return items[i];
                    }
                }
            }

            it("show layers opacity",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {

                    // prendo il layer L1 e L3
                    var slider1 = getSlider(Ext.getCmp("trasp-form").items.items,"Province"),
                        slider2 = getSlider(Ext.getCmp("trasp-form").items.items,"Comuni 1:5000");

                    expect(slider1.value).toEqual(app.map.getLayerByName("L1").opacity*100);
                    expect(slider2.value).toEqual(app.map.getLayerByName("L3").opacity*100);


                });
            });

            it("set layers opacity",function(){
                var layerLoadEnd = false;
                app.map.getLayerByName("L1").events.register('loadend', this, function() {
                    layerLoadEnd = true;
                });
                waitsFor(function() {return layerLoadEnd; }, "Layer non caricato", 3000);
                runs(function () {
                    // prendo il penultimo layer (L1)
                    var itemsLength = Ext.getCmp("trasp-form").items.items.length;
                    Ext.getCmp("trasp-form").items.items[itemsLength-2].setValue(100);
                    waits(20);
                    runs(function () {
                        var opacity = app.map.getLayerByName("L1").opacity;
                        expect(opacity).toEqual(1);
                    });
                });
            });

        });

        describe("loadlayers",function(){

            beforeEach(function(){
                var winCmpId = "cwn2-loadlayers-win-" + app.id;
                var win = Ext.getCmp(winCmpId);
                if (!win.isVisible()) {
                    Ext.getCmp("cwn2-toolbar-" + app.id).items.items[11].btnEl.dom.click();
                }
            });

            afterEach(function(){
                Ext.getCmp("cwn2-loadlayers-win-" + app.id).hide();
            });

            it("show window",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    expect(Ext.getCmp("cwn2-loadlayers-win-" + app.id).isVisible()).toBeTruthy();
                });
            });

            xit("load layer",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    // seleziono il primo nodo foglia (CORINE)
//                    console.log(Ext.getCmp("cwn2-loadlayers-canalitematici-tree-submit").getRootNode());
                    var firstLeaf = Ext.getCmp("cwn2-loadlayers-canalitematici-tree-" + app.id).getRootNode().childNodes[0].childNodes[0];
                    var selectionModel = Ext.getCmp("cwn2-loadlayers-canalitematici-tree-" + app.id).getSelectionModel();
                    selectionModel.select(firstLeaf);
                    // faccio submit
                    Ext.getCmp("cwn2-loadlayers-canalitematici-tree-submit-" + app.id).btnEl.dom.click();
                    waits(6000);
                    runs(function () {
                        expect(Ext.getCmp("cwn2-loadlayers-win-" + app.id).isVisible()).toBeFalsy();
                        var overlayLegend = Ext.getCmp("cwn2-legend-panel-" + app.id).items.items[0];
                        var overlayNumLegendEntry = overlayLegend.store.data.items.length;
                        expect(overlayNumLegendEntry).toEqual(5);
                        expect(app.map.getLayerByName("L4").CLASS_NAME).toEqual("OpenLayers.Layer.WMS");
                        app.map.layerManager.setLayerVisible("L4",false,1);
                    });

                });
            });

        });

        describe("removelayers",function(){

            beforeEach(function(){
                var winCmpId = "cwn2-removelayers-win-" + app.id;
                var win = Ext.getCmp(winCmpId);
                if (!win.isVisible()) {
                    Ext.getCmp("cwn2-toolbar-" + app.id).items.items[12].btnEl.dom.click();
                }
            });

            afterEach(function(){
                Ext.getCmp("cwn2-removelayers-win-" + app.id).hide();
            });

            it("show window",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    expect(Ext.getCmp("cwn2-removelayers-win-" + app.id).isVisible()).toBeTruthy();
                });
            });

            xit("remove layer",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {


                    // seleziono il layer WFS e lo rimuovo
                    document.getElementById("rm_check_WFS").click();
                    Ext.getCmp("cwn2-removelayers-submit-" + app.id).btnEl.dom.click();
                        var overlayLegend = Ext.getCmp("cwn2-legend-panel-" + app.id).items.items[0];
                        var overlayNumLegendEntry = overlayLegend.store.data.items.length;
                        expect(overlayNumLegendEntry).toEqual(4);
                        expect(app.map.getLayerByName("WFS")).toBeFalsy();
                });
            });

        });

        describe("find",function(){

            beforeEach(function(){
                var winCmpId = "cwn2-find-win-" + app.id;
                var win = Ext.getCmp(winCmpId);
                if (!win.isVisible()) {
                    Ext.getCmp("cwn2-toolbar-" + app.id).items.items[13].btnEl.dom.click();
                }
            });

            afterEach(function(){
                Ext.getCmp("cwn2-find-win-" + app.id).hide();
            });

            it("show window",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    expect(Ext.getCmp("cwn2-find-win-" + app.id).isVisible()).toBeTruthy();
                });
            });

            xit("find",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    // seleziono il layer WFS e lo rimuovo
                    var comboId = 'cwn-find-geocode-combo';
                    Ext.getCmp(comboId).setValue("ext-record-10");
                    var addressStore = Ext.getCmp(comboId).getStore();
                    var x = 8.934;
                    var y = 44.407;
                    var addressTest = {
                        Point: {
                            coordinates: [x,y]
                        }
                    }
                    var rec = new addressStore.recordType(addressTest);
                    addressStore.insert(0, rec);
                    Ext.getCmp("cwn2-find-submit-" + app.id).btnEl.dom.click();
                    waits(1000);
                    runs(function () {
                        // carica il layer con una feature
                        var layer = app.map.getLayerByName("findLayer");
                        expect(layer).toBeDefined();
                        expect(layer.features.length).toEqual(1);
                        // centra la mappa
                        var fromProj = layer.map.getProjectionObject(),
                        toProj = new OpenLayers.Projection("EPSG:4326");
                        var lon = app.map.getCenter().transform(fromProj, toProj).lon;
                        var lat = app.map.getCenter().transform(fromProj, toProj).lat;
                        lon = Math.round(lon*1000)/1000;
                        lat = Math.round(lat*1000)/1000;
                        expect(lon).toEqual(x);
                        expect(lat).toEqual(y);
                        app.map.zoomToInitialExtent();
                    });
                });
            });

        });

        describe("calcoloPercorsi",function(){
            var winCmpId = "cwn2-routeplanner-win-" + app.id;

            beforeEach(function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    var win = Ext.getCmp(winCmpId);
                    if (!win.isVisible()) {
                        Ext.getCmp("cwn2-toolbar-" + app.id).items.items[14].btnEl.dom.click();
                    }
                });

            });

            afterEach(function(){
                //Ext.getCmp(winCmpId).hide();
            });

            it("show window",function(){
                waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
                runs(function () {
                    expect(Ext.getCmp(winCmpId).isVisible()).toBeTruthy();
                });
            });

            it("call callback function",function(){

                spyOn(CWN2.routingMngr,'calculate');

                Ext.getCmp("cwn2-routeplanner-submit-" + app.id).btnEl.dom.click();

                waits(100);
                runs(function () {
                    expect(CWN2.routingMngr.calculate).toHaveBeenCalled();
                });

            });

            it("handle exception",function(){

                spyOn(CWN2.Util,'handleException');

                Ext.getCmp("cwn2-routeplanner-submit-" + app.id).btnEl.dom.click();

                waits(100);
                runs(function () {
                    expect(CWN2.Util.handleException).toHaveBeenCalled();
                });

            });

            it("process results",function(){

                var startComboId = 'cwn2-routeplanner-start-combo-' + app.id;
                Ext.getCmp(startComboId).setValue("Via Vado, 16154 Genoa, Italy");
                var endComboId = 'cwn2-routeplanner-end-combo-' + app.id;
                Ext.getCmp(endComboId).setValue("Piazza Caricamento, 16124 Genoa, Italy");

                var address1 = "Via Vado, 16154 Genoa, Italy",
                    lat1 = 44.426899,
                    lon1 = 8.842473,
                    address2 = "Piazza Caricamento, 16124 Genoa, Italy",
                    lat2 = 44.410536,
                    lon2 = 8.928650,
                    mode = google.maps.TravelMode.WALKING,
                    requestParam;

                var foo = {
                    callBack: function (result) {
                        //console.log(result)
                    }
                };
                spyOn(foo,"callBack");

                CWN2.routingMngr.setOrigin(address1,lat1,lon1);
                CWN2.routingMngr.setDestination(address2,lat2,lon2);
//                CWN2.routingMngr.calculate(foo.callBack);
                Ext.getCmp("cwn2-routeplanner-submit-" + app.id).btnEl.dom.click();



                waits(2000);
                runs(function () {
                    // richiama callback
//                    expect(foo.callBack).toHaveBeenCalled();
                    // crea layer
                    expect(app.map.getLayersByName('routingLayer').length).toEqual(1);
                    // crea features
                    expect(app.map.getLayersByName('routingLayer')[0].features.length).toBeGreaterThan(0);
                });

            });

        });

    });

    describe("legend", function() {

        it("show/hide layer on checkbox click",function(){
            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                expect(app.map.getLayerByName("L1").visibility).toBeTruthy();
                document.getElementById("check_L1").click();
                expect(app.map.getLayerByName("L1").visibility).toBeFalsy();
                document.getElementById("check_L1").click();
                expect(app.map.getLayerByName("L1").visibility).toBeTruthy();
            });
        });

        it("show/hide baselayer on radiobutton click",function(){
            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 3000);
            runs(function () {
                document.getElementById("radio_Google_Satellite").click();
                expect(app.map.getLayerByName("Google_Satellite").visibility).toBeTruthy();
                expect(app.map.baseLayer.name).toEqual("Google_Satellite");
                document.getElementById("radio_Google_Stradario").click();
                expect(app.map.getLayerByName("Google_Satellite").visibility).toBeFalsy();
                expect(app.map.getLayerByName("Google_Stradario").visibility).toBeTruthy();
                expect(app.map.baseLayer.name).toEqual("Google_Stradario");
            });
        });

    });



});



