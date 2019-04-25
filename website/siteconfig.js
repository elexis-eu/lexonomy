const path=require("path");
const fs=require("fs");

var siteconfig = {}

function load() {
  var new_siteconfig=JSON.parse(fs.readFileSync(path.join(__dirname, "siteconfig.json"), "utf8"));
  for (var attrname in new_siteconfig) {
    siteconfig[attrname] = new_siteconfig[attrname];
  }
  return siteconfig;
}

siteconfig.load = load;
siteconfig.reload = load;
module.exports = siteconfig
