/**
 * Created by JetBrains WebStorm.
 * User: parodi
 * Date: 14/12/11
 * Time: 18.37
 * To change this template use File | Settings | File Templates.
 */

var app;

var setOutput = function (id) {
    $("#output").empty()
    .append("<br>Infrastruttura: " + id)
    .append("<br><br><a href='infrastruttureScheda.html?id=" + id + "'>Scheda</a>")
};

var selectFeature = function (id) {
    var selectConf = {
        "layerName": "INFRASTRUTTURE",
        "attrName": "ID",
        "item": id
    };
    app.selectFeature(selectConf);
};

var hiliteFeature = function (id) {
    var selectConf = {
        "layerName": "INFRASTRUTTURE",
        "attrName": "ID",
        "item": id,
        "options": {
            "zoom": false,
            "hiliteOnly": true
        }
    };
    app.selectFeature(selectConf);
};

var unhiliteFeature = function (id) {
     var selectConf = {
         "layerName": "INFRASTRUTTURE",
         "attrName": "ID",
         "item": id,
         "options": {
             "zoom": false,
             "hiliteOnly": true
         }
     };
    app.unselectFeature(selectConf);
};

var loadFeatures = function() {

    var config = {
        layerName: 'INFRASTRUTTURE',
        features: null,
        url: "http://dcarto3.datasiel.net:5984/cwn2_dati/infrastrutture",
        "filter": {
            "text": null,
            "formar": null
        },
        "options": {
            "zoom": false,
            "clean": false
        }
    };
    app.loadFeatures(config);

    // registro il controllo sull'unselect delle feature
    app.map.featureManager.selectFeatureControl.onUnselect = function (feature) {
       $("#output").empty();
    };

    app.map.zoomToInitialExtent();

};

// suite per i test di inizializzazione
describe("Infrastrutture", function() {



    // inizializzo la mappa
    var initConfig = {
        appConfig: 'http://dcarto3.datasiel.net:5984/cwn2_config/infrastruttureTest',
        divID: "cwn2_map",
        callBack: loadFeatures,
        debug:true
    };
    app = new CWN2.Application(initConfig);



    xdescribe("hilite", function() {


        it("hilite on hover / unhilite on out",function(){

            waitsFor(function() {return app.loadend; }, "Inizializzazione non effettuata", 2000);
            runs(function () {
                var layerLoadEnd = false;
                var layer = app.map.getLayerByName("INFRASTRUTTURE");
                layer.events.register('loadend', this, function() {
                    layerLoadEnd = true;
                });
                waitsFor(function() {return layerLoadEnd; }, "Layer non caricato", 2000);
                // hilite - unhilite
                runs(function () {
                    var feature1 = layer.getFeaturesByAttribute("ID","21")[0];
                    expect(feature1.renderIntent).toEqual("default");
                    simulate(document.getElementById("menu_item1"), "mouseover");
                    expect(feature1.renderIntent).toEqual("hover");
                    simulate(document.getElementById("menu_item1"), "mouseout");
                    expect(feature1.renderIntent).toEqual("default");
                });
                // select
                runs(function () {
                    var feature1 = layer.getFeaturesByAttribute("ID","21")[0];
                    expect(feature1.renderIntent).toEqual("default");
                    // seleziono feature 1
                    expect(document.getElementById('output').innerHTML.length).toEqual(0);
                    simulate(document.getElementById("menu_item1"), "click");
                    waits(1000);
                    runs(function () {
                        expect(document.getElementById('output').innerHTML.length).toBeGreaterThan(0);
                        expect(feature1.renderIntent).toEqual("select");
                        // hilite - unhilite feature 1
                        simulate(document.getElementById("menu_item1"), "mouseover");
                        expect(feature1.renderIntent).toEqual("hover");
                        simulate(document.getElementById("menu_item1"), "mouseout");
                        expect(feature1.renderIntent).toEqual("select");

                    });

                });

            });

        });

    });

});


