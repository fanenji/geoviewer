/**
 * Created by JetBrains WebStorm.
 * User: parodi
 * Date: 14/12/11
 * Time: 18.37
 * To change this template use File | Settings | File Templates.
 */


// suite per i test di inizializzazione
describe("CWN2", function() {

    describe("util", function() {

        describe("getJSON", function() {

            it("load a json",function(){

                var stub = {
                    callBack: function () {}
                };

                spyOn(stub, "callBack");

                CWN2.Util.getJSON(
                    '/cartowebNet2/services/Configuration/Static/test/test.json',
                    null,
                    false,
                    stub.callBack
                );

                expect(stub.callBack).toHaveBeenCalled();

            });

        });

        describe("getJSONP", function() {

            it("calls callback function",function(){

                var stub = {
                    callBack: function(data) {
                        console.log('ciao')
                    }
                };

                var data = {
                   "_id": "test",
                   "_rev": "1-967a00dff5e02add41819138abb3284d"
                };

                spyOn(stub, "callBack");

                CWN2.Util.getJSONP(
                    "http://dcarto3.datasiel.net:5984/cwn2_config/test",
                    null,
                    function (data) {
                        stub.callBack(data);
                    }
                );

                waits(1000);
                runs(function () {
                    expect(stub.callBack).toHaveBeenCalledWith(data);
                });

            });

            it("throw exception",function(){

                spyOn(CWN2.Util, "handleException");

                CWN2.Util.getJSONP(
                    "http://parodis-dts-pc.datasiel.net/cartowebNet2/services/Configuration/Static/test/not_found.json",
                    null,
                    function (data) {
                        stub.callBack(data);
                    }
                );

                waits(1000);
                runs(function () {
                    expect(CWN2.Util.handleException).toHaveBeenCalled();
                });

            });

        });
    });

});


