const path=require("path");
const fs=require("fs");

var siteconfig = {}

function siteconfig_file() {
  if(process.env.LEXONOMY_SITECONFIG !== undefined) {
    var path = process.env.LEXONOMY_SITECONFIG;
    if(fs.existsSync(path)) {
      return path;
    } else {
      throw Error("Cannot locate $LEXONOMY_SITECONFIG file: ${ path }");
    }
  }
  return path.join(__dirname, "siteconfig.json");
}

function load() {
  var new_siteconfig = JSON.parse(fs.readFileSync(siteconfig_file(), "utf8"));
  for (var attrname in new_siteconfig) {
    siteconfig[attrname] = new_siteconfig[attrname];
  }
  return siteconfig;
}

siteconfig.load = load;
siteconfig.reload = load;
module.exports = siteconfig
