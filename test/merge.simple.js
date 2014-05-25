"use strict";

var merge  = require("../index").merge;
var assert = require("chai").assert;

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
        assert.deepEqual(merged.log, false);
    });
});


