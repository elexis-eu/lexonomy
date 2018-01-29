"use strict";
var fs = require("fs");
var path = require("path");
var events = require("events");
var util = require("util");

function Semaphore(initial) {
    if (typeof initial === "undefined")
        initial = 1;
    this.counter = initial;
}
util.inherits(Semaphore, events.EventEmitter);
Semaphore.prototype.wait = function(count) {
    if (typeof count === "undefined")
        count = 1;
    this.counter += count;
}
Semaphore.prototype.signal = function() {
    --this.counter;
    if (this.counter === 0) {
        this.emit("done");
    }
}

function OsArch(os, arch, dir) {
    this.os = os;
    this.arch = arch;
    this.dir = dir;
    this.output = {};
}

function multiMatch(s, r) {
    var m, res = [], n = 0;
    while ((m = r.exec(s)) !== null) {
        res[n++] = m;
    }
    return res;
}

function ConfigInput(data) {
    var text = this.text = data.toString();
    var defs = this.defs = [];
    var d = multiMatch(text, /^#undef (\S+)/mg);
    d.forEach(function(m) {
        defs.push(m[1]);
    });
    this.placeholders = text.match(/@\w+@/g);
    if (this.placeholders) {
        var re = text.replace(/([^A-Za-z0-9_@ ,;\r\n])/g, "\\$1");
        re = re.replace(/@\w+@/g, "(.*?)");
        this.re = new RegExp(re);
        this.defs = defs.concat(this.placeholders);
    } else {
        this.re = null;
    }
}

function ConfigOutput(data) {
    this.text = data.toString();
    var defs = this.defs = {};
    var d = multiMatch(this.text,
        /^\/\* #undef (\S+)\s*\*\/|^#define (\S+)\s*(.*)|^#undef (\S+)/mg);
    d.forEach(function(m) {
        var name = m[2], val = m[3];
        if (m[1]) {
            name = m[1];
            val = "/* #undef */";
        }
        else if (m[4]) {
            name = m[4];
            val = "#undef";
        }
        defs[name] = val;
    });
}

function deps(pkg, configs, callback) {
    var central = new Semaphore();
    var indir = path.join(__dirname, pkg);
    var confdir = path.join(__dirname, pkg + ".config");
    var archs = [];
    var input = {};
    fs.readdir(confdir, function(err, oss) {
        if (err) { central.emit("error", err); return; }
        oss.forEach(function(os) { central.emit("os", os); });
        central.wait(oss.length);
        central.signal();
    });
    central.on("os", function(os) {
        fs.readdir(path.join(confdir, os), function(err, archs) {
            if (err) { central.emit("error", err); return; }
            archs.forEach(function(arch) { central.emit("arch", os, arch); });
            central.wait(archs.length);
            central.signal();
        });
    });
    central.on("arch", function(os, arch) {
        var archdir = path.join(confdir, os, arch);
        var oa = new OsArch(os, arch, archdir);
        archs.push(oa);
        configs.forEach(function(cfg) { central.emit("oac", oa, cfg); });
        central.wait(configs.length);
        central.signal();
    });
    central.on("oac", function(osArch, config) {
        fs.readFile(path.join(osArch.dir, config), function(err, content) {
            if (err) { central.emit("error", err); return; }
            osArch.output[config] = new ConfigOutput(content);
            central.signal();
        });
    });
    configs.forEach(function(config) {
        fs.readFile(path.join(indir, config + ".in"), function(err, content) {
            if (err) { central.emit("error", err); return; }
            input[config] = new ConfigInput(content);
            central.signal();
        });
    });
    central.wait(configs.length);
    central.on("done", function() {
        callback(pkg, configs, input, archs);
    });
}

function pad(s, len) {
    if (typeof len === "undefined")
        len = 25;
    while (s.length < len)
        s += " ";
    if (s.length > len)
        s = s.substr(s.length - len);
    return s;
}

function report(pkg, configs, inputs, archs) {
    archs.forEach(function(arch, index) {
        console.log((index + 1) + ": " + arch.os + " / " + arch.arch);
    });
    configs.forEach(function(config) {
        console.log("");
        console.log("=== " + config + " ===");
        var marks = archs.map(function(arch, index) {
            return String((index + 1)%10);
        }).join(" ");
        console.log(pad("") + "  " + marks);
        var input = inputs[config];
        var outputs = archs.map(function(arch) {
            var output = arch.output[config], defs = output.defs;
            if (input.placeholders) {
                var m = output.text.match(input.re);
                if (m !== null) {
                    var i = m.length, p = input.placeholders;
                    while (i > 0) {
                        --i;
                        defs[p[i]] = m[i + 1];
                    }
                }
            }
            return defs;
        });
        inputs[config].defs.forEach(function(setting) {
            var same = outputs[0][setting];
            var marks = outputs.map(function(output) {
                var val = output[setting];
                if (same !== null && val !== same)
                    same = null;
                if (typeof val === "undefined")
                    val = "?";
                else if (val === "#undef")
                    val = "N";
                else if (val === "/* #undef */")
                    val = "n";
                else if (val === "/**/")
                    val = "Y";
                else
                    val = val.substr(0, 1);
                return val;
            }).join(" ");
            var note;
            if (same === null) note = " !!";
            else if (typeof same === "undefined") note = " ??";
            else note = "   " + same;
            console.log(pad(setting) + "  " + marks + note);
        });
    });
}

deps(
    "libxslt",
    ["config.h", "libxslt/xsltconfig.h", "libexslt/exsltconfig.h"],
    report);
