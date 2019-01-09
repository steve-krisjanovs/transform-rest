const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
const enumerable = require("linq");
const domparser = require("express-xml-domparser");
const jsonminify = require("jsonminify");

const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(domparser());
app.use(cookieParser());

function return_httperror(errorcode, err, res) {
    
    var jsonerror = JSON.stringify(err, Object.getOwnPropertyNames(err));

    if (typeof err === 'string' || err instanceof String) {
        res.setHeader("content-type", "text/plain");
        res.send(errorcode, err);
    }
    else if (err.message) {
        res.setHeader("content-type", "text/plain");
        res.send(errorcode, err.message).end();
    } 
    else {
        res.setHeader("content-type", "application/json");
        res.send(errorcode, jsonerror).end();
    }
}

var handler_xml_post = asyncHandler(async (req, res, next) => {

    var engines = ["handlebars","ejs","mustache","vash","pug"];

    //determine which engine is selected and build a whitelist of pipe-delimited engines
    var engine = enumerable.from(engines).where(function(i){ return i == req.params.engine}).firstOrDefault();
    var whitelist = enumerable.from(engines).select(function(i){return i}).toArray().join("|");
    if (engine == undefined)
        res.send(400, `engine:${req.params.engine} invalid! Allowable values: ${whitelist}`).end();

    //if this is reached then parse the XML request
    try {

        var doc = new dom().parseFromString(req.rawBody);
        var template = xpath.select("/transform/template", doc)[0].firstChild.nextSibling.data.trim();
        var modeldata = xpath.select("/transform/model", doc)[0].firstChild.nextSibling.data.trim();
        var model = JSON.parse(jsonminify(modeldata));
        var result = "";

        //render the view
        if (engine == "mustache") {
            var templater = require("mustache");
            result = templater.render(template,model);
        }
        else if (engine == "pug")
        {
            var templater = require("pug");
            var compiled = templater.compile(template);
            result = compiled(model);
        }
        else if (engine == "vash")
        {
            //vash is got razor rendering
            var templater = require("vash");
            var compiled = templater.compile(template);
            result = compiled(model);
        }
        else if (engine == "ejs") {
            var templater = require("ejs");
            var compiled = templater.compile(template);
            result = compiled(model);
        }
        else if (engine == "handlebars")
        {
            var templater = require("handlebars");
            var compiled = templater.compile(template);
            result = compiled(model);
        }

        res.setHeader("content-type","text/plain");
        res.send(200,result);
    }
    catch (err) {
        return_httperror(500,err,res);
    }
    
});

//spin up the engine
app.set('port', process.env.EXPRESS_PORT || 3000);
var server = app.listen(app.get('port'), function () {

    console.log(`express listening on http port ${app.get("port")}`);

    //wire http XML post controller
    app.post("/api/engine/:engine/transform", domparser(), handler_xml_post);
});
