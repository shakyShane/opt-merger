"use strict";

var merge  = require("../index").merge;
var assert = require("assert");

describe("Merging opts", function(){

    var defaults;

    beforeEach(function () {
        defaults = {
            name: "shane",
            numbers: [1, 2, 3],
            user: {
                email: "shane@gmail.com",
                password: "123456"
            },
            mode: {
                level1: {
                    type: "cat"
                }
            },
            log: true
        };
    });

    it("should merge simple", function(){

        var config = {
            name: "kittie",
            numbers: [4],
            ghostMode: {
                links: true,
                forms: {
                    submit: true,
                    checkboxes: true
                }
            },
            user: {
                password: "654321"
            },
            mode: {
                level1: {
                    type: "dog"
                }
            },
            log: false
        };

        var merged = merge(defaults, config);

        assert.equal(merged.name, "kittie");
        assert.deepEqual(merged.numbers, [1, 2, 3, 4]);
        assert.deepEqual(merged.user.email, "shane@gmail.com");
        assert.deepEqual(merged.user.password, "654321");
        assert.deepEqual(merged.mode.level1.type, "dog");
        assert.deepEqual(merged.ghostMode.links, true);
        assert.deepEqual(merged.ghostMode.forms.submit, true);
        assert.deepEqual(merged.log, false);
    });
    it("should merge simple", function(){

        var config = {
            name: "kittie",
            numbers: [4],
            ghostMode: {
                links: true,
                forms: {
                    submit: true,
                    checkboxes: true
                }
            },
            user: {
                password: "654321"
            },
            mode: {
                level1: {
                    type: "dog"
                }
            },
            log: false
        };

        var defaults = {
            name: "shane",
            numbers: [10],
            user: {
                username: "shane"
            }
        };

        var merged = merge(defaults, config, true);

        assert.deepEqual(merged, {
            name: "kittie",
            numbers: [10, 4],
            ghostMode: {
                links: true,
                forms: {
                    submit: true,
                    checkboxes: true
                }
            },
            user: {
                username: "shane",
                password: "654321"
            },
            mode: {
                level1: {
                    type: "dog"
                }
            },
            log: false
        });
    });
    it("should merge simple with functions", function(done){

        var config = {
            cb: function (done) {
                done();
            }
        };

        var defaults = {
            cb: function () {}
        };

        var merged = merge(defaults, config, true);

        merged.cb(done);
    });
});


