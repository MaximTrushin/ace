
define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var Mirror = require("../worker/mirror").Mirror;


var SyntactikWorker = exports.SyntactikWorker = function(sender) {
    Mirror.call(this, sender);
    this.setTimeout(500);

    sender.on("change", function(e) {
        var data = e.data;
        if (data[0].start) {
            //doc.applyDeltas(data);
        } else {
            for (var i = 0; i < data.length; i += 2) {
                if (Array.isArray(data[i+1])) {
                    var d = {action: "insert", start: data[i], lines: data[i+1]};
                } else {
                    var d = {action: "remove", start: data[i], end: data[i+1]};
                }
                //doc.applyDelta(d, true);
            }
        }
        // if (_self.$timeout)
        //     return deferredUpdate.schedule(_self.$timeout);
        // _self.onUpdate();
    });


};

oop.inherits(SyntactikWorker, Mirror);

(function() {
    this.onUpdate = function() {
        var value = this.doc.getValue();
        value = value.replace(/^#!.*\n/, "\n");
        if (!value)
            return this.sender.emit("annotate", []);

        //this.sender.emit("annotate", session);
    };

}).call(SyntactikWorker.prototype);

});
