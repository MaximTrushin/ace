/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var SyntactikHighlightRules = function() {

    this.$indentFunction = function(val, state, stack, line) {
                    if (stack.length > 1 && stack[1]>0) return this.token;
                    var indent = /^\s*(?:[-?]\s)?/.exec(line)[0];
                    if (stack.length < 1) {
                        stack.push(this.next);
                    } else {
                        stack[0] = this.next;
                    }

                    if (stack.length < 2) {
                        stack.push(indent.length);
                    }
                    else {
                        stack[1] = indent.length;
                    }
                    return this.token;
                };
    this.$enterWsa = function(val, state, stack) {
                if (val.slice(-1) !== "(" ) return this.token;
                if (stack.length < 1) {
                    stack.push("start");
                } else {
                    stack[0] = "start";
                }

                if (stack.length < 2) {
                    stack.push(1);
                }
                else {
                    stack[1] += 1;
                }
                return this.token;
            };
            
    this.$exitWsa = function(val, state, stack) {
                if (stack.length > 1 && stack[1]>0) stack[1]--;
                return this.token;
            };                
    this.$rules = {
        "start" : [
            {
                token : "comment", //multiline comment
                regex : /""".*?(?:(?=""")|$)/,
                next: "mlComment"
            }, {
                token : "comment", //singleline comment
                regex : "\'\'\'.*$"
            }, {
                token: ["identifier"], //sq name
                regex: /'(?:\\.|.)*?(?:'|$)/
            }, {
                token: ["identifier"], //dq name
                regex: /".*?(?:"|$)/
            }, {
                token: ["keyword"], //document
                regex: /\s?![^=:()'",]*/
            }, {
                token: ["variable"], //alias
                regex: /\s?\$[^=:()'",]*/
            }, {
                token: ["paren.rparen"], //rparen
                regex: /\)/,
                onMatch: this.$exitWsa
            }, {
                token: ["identifier"], //open name
                regex: /\s?[^=:()'",]+/
            }, {
                token : "delimiter.operator", //literal value delimiter
                regex : /(?::=)|(?:::?:?\(?)|(?:=::?)\s?/,
                onMatch: this.$enterWsa
            }, {
                token : "delimiter.operator", //literal value delimiter
                regex : /==?\s?$/,
                onMatch: this.$indentFunction,
                next: "mlValue"
            }, {
                token : "delimiter.operator", //literal value delimiter
                regex : /==\s?/,
                next : "freeValue"
            }, {
                token : "delimiter.operator", //literal value delimiter
                regex : /=\s?/,
                next : "value"
            }
        ],
        "mlComment" : [
            {
                token : "comment",
                regex : "\"\"\"",
                next: "start"
            },
            {
                token : "comment",
                regex : ".*?(?:(?=\"\"\")|$)",
                next: "mlComment"
            }
        ],
        "value": [
            {
                token: ["string"], //sq string
                regex: /'(?:\\.|.)*?'/,
                next: "start"
            }, {
                token: ["string"], //sq string
                regex: /'(?:\\.|.)*?$/,
                onMatch: this.$indentFunction,
                next: "mlValue"
            }, {
                token: ["string"], //dq string
                regex: /".*?"/,
                next: "start"
            }, {
                token: ["string"], //dq string
                regex: /".*?$/,
                onMatch: this.$indentFunction,
                next: "mlValue"
            }, {
                token: ["string"], //open string
                regex: /[^=:()'",]*$/,
                onMatch: this.$indentFunction,
                next: "mlValue"
            }, {
                token: ["string"], //open string
                regex: /[^=:()'",]+/,
                next: "start"
            }, {
                token: ["operator"], //open string
                regex: /[,]/,
                next: "start"
            }
        ],
        "freeValue": [
            {
                token: ["freeValue.string"], //free open string
                regex: /.*$/,
                onMatch: this.$indentFunction,
                next: "mlValue"
            }
        ], 
        "mlValue": [
            {
                token : "mlValue.indent",
                regex : /^\s*$/
            }, {
                token : "mlValue.indent",
                regex : /^\s*/,
                onMatch: function(val, state, stack) {
                    var curIndent = stack[1];

                    if (curIndent >= val.length) {
                        this.next = "start";
                        stack.splice(0);
                    }
                    else {
                        this.next = "mlValue";
                    }
                    return this.token;
                },
                next : "mlValue"
            }, {
                token: ["mlValue.string"], //open name
                regex: /.*$/,
                next: "mlValue"
            }
        ]
        
    };


};

oop.inherits(SyntactikHighlightRules, TextHighlightRules);

exports.SyntactikHighlightRules = SyntactikHighlightRules;
});
