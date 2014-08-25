"use strict";

var index  = require("../index");
var merge  = index.merge;
var assert = require("chai").assert;
var sinon  = require("sinon");

var callbackFunc = function (defaultValue, newValue, args) {

    var split = newValue.split(":");

    return {
        host: split[0],
        port: split[1]
    }
};

describe("Merging opts", function(){

    var defaults, argsStub;

    before(function () {
        argsStub = sinon.stub(index, "getArgs");
    });
    beforeEach(function () {
        defaults = {
            name: "shane",
            type: "cat",
            open: true,
            proxy: false
        };
    });
    afterEach(function () {
        argsStub.reset();
    });
    after(function () {
        argsStub.restore();
    });

    it("can merge certain options with a callback", function () {

        var opts = {
            type: "dog",
            proxy: "localhost:8000",
            open: false
        };

        var callbacks = {
            "proxy": callbackFunc
        };

        var merged = merge(defaults, opts, false, callbacks);


        assert.equal(merged.name, "shane"); // simple merge
        assert.equal(merged.type, "dog"); // simple merge
        assert.equal(merged.open, false); // simple merge

        assert.equal(merged.proxy.host, "localhost");
        assert.equal(merged.proxy.port, "8000");

    });
    it("can merge certain options from command-line", function () {

        var defaultConf = {
            proxy: false,
            open: true
        };

        argsStub.returns({
            proxy: "localhost:8000",
            open: false
        });

        var callbacks = {
            "proxy": callbackFunc
        };

        var merged = merge(defaultConf, {}, false, callbacks);

        assert.equal(merged.open, false);

        assert.equal(merged.proxy.host, "localhost");
        assert.equal(merged.proxy.port, "8000");

    });
    it("can merge multiple options from command-line", function () {

        var defaultConf = {
            proxy: false,
            open: true
        };

        argsStub.returns({
            proxy: "localhost:8000",
            open: false
        });

        var callbacks = {
            "proxy": callbackFunc
        };

        var merged = merge(defaultConf, {}, false, callbacks);


        // simple merge DID NOT occur here, because this property was not in the 'allowed' array
        assert.equal(merged.open, false);

        assert.equal(merged.proxy.host, "localhost");
        assert.equal(merged.proxy.port, "8000");

    });

    it("can merge simple option from command-line", function () {

        var defaultConf = {
            proxy: false
        };

        argsStub.returns({
            proxy: "shane.local"
        });

        var merged = merge(defaultConf, {});
        assert.equal(merged.proxy, "shane.local");

    });

    it("can merge options from command-line + Config together", function () {

        var defaultConf = {
            proxy: false,
            open: true,
            names: ["shane", "sally"]
        };

        argsStub.returns({
            proxy: "localhost:8000"
        });

        var callbacks = {
            "proxy": callbackFunc,
            "open": function () {
                return "fromFunc";
            }
        };

        var config = {
            open: false,
            names: ["kittie"]
        };

        var merged = merge(defaultConf, config, false, callbacks);

        // simple merge DID NOT occur here, because this property was not in the 'allowed' array
        assert.equal(merged.open, "fromFunc");

        assert.equal(merged.proxy.host, "localhost");
        assert.equal(merged.proxy.port, "8000");
        assert.deepEqual(merged.names, ["shane", "sally", "kittie"])
    });
    it("can merge options from command-line + Config together with command-line taking precedence", function () {

        var defaultConf = {
            proxy: false,
            open: true,
            names: ["shane"]
        };

        argsStub.returns({
            proxy: "localhost:8000"
        });

        var config = {
            proxy: "127.0.0.1:3000",
            open: false,
            names: ["sally"]
        };

        var merged = merge(defaultConf, config);

        assert.equal(merged.proxy, "localhost:8000");
        assert.equal(merged.open, false);
        assert.deepEqual(merged.names, ["shane", "sally"]);
    });
    it("can merge options from command-line + Config together with command-line taking precedence (2)", function () {

        var defaultConf = {
            proxy: false,
            open: true,
            names: ["shane"]
        };

        argsStub.returns({
            proxy: "localhost:8000",
            names: "kittie"
        });

        var config = {
            proxy: "127.0.0.1:3000",
            open: false,
            names: ["sally"]
        };

        var merged = merge(defaultConf, config);

        assert.equal(merged.proxy, "localhost:8000");
        assert.equal(merged.open, false);
        assert.deepEqual(merged.names, "kittie");
    });
    it("can merge options from command-line when it relies on other args", function () {

        var defaultConf = {
            proxy: false
        };

        argsStub.returns({
            proxy: "localhost:8000",
            startPath: "/app"
        });

        var funcs = {

            "proxy": function (defaultValue, newValue, args) {

                var proxy = {
                    host: "localhost",
                    port: "8000"
                };

                if (args.startPath) {
                    proxy.startPath = args.startPath;
                }

                return proxy;
            }
        };

        var merged = merge(defaultConf, {}, false, funcs);

        assert.equal(merged.proxy.host, "localhost");
        assert.equal(merged.proxy.port, "8000");
        assert.equal(merged.proxy.startPath, "/app");
    });
    it("can merge options from config when it relies on other config args", function () {

        var defaultConf = {
            files: []
        };

        var config = {
            files: "*.php",
            exclude: "*.html"
        };

        var funcs = {

            "files": function (defaultValue, newValue, args, config) {

                var returnArr = [newValue];

                if (config && config.exclude) {
                    returnArr.push("!" + config.exclude)
                }

                return returnArr;
            }
        };

        var merged = merge(defaultConf, config, false, funcs);

        assert.deepEqual(merged.files, ["*.php", "!*.html"]);
    });
    it("Does NOT merge options from config if not provided, but callback provided", function () {

        var defaultConf = {
            files: []
        };

        var config = {};

        var funcs = {

            "files": function (defaultValue, newValue, args, config) {

                if (!newValue) {
                    return defaultValue;
                }
                var returnArr = [newValue];

                if (config && config.exclude) {
                    returnArr.push("!" + config.exclude)
                }

                return returnArr;
            }
        };

        var merged = merge(defaultConf, config, false, funcs);

        assert.deepEqual(merged.files, []);
    });
});


