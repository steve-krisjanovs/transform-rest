# Introduction

I wrote this to fill a need where some software systems don't have an easy means to construct complex strings without resorting to some ugly hardcoding (e.g. building an HTML body for an email). Using this application allows a system to http post a view, a model, as well as specify a templating engine to use (all the popular ones are supported e.g. pug, handlebars, ejs, etc.). The http server then transforms the view accordingly and returns it back to the caller in an HTTP response. Great for constructing HTML bodies, thermal printer label print jobs, etc.

default port is HTTP 3000. You can override this via EXPRESS_PORT env var. 

NOTE - since the various packages in this app utilize https://www.npmjs.com/package/libxmljs , you will need to set up node-gyp and the toolchains for it. The docker container verision of this app handles this internally. See: https://github.com/nodejs/node-gyp

# Usage

HTTP POST /api/engine/:engine/transform  
* :engine allowable values: mustache|pug|vash|ejs|handlebars
* request headers: Content-Type = text/xml  
* request body:  
```xml
<transform>
    <template>
      <![CDATA[
        Your view goes here
      ]]>
    </template>
    <model>
        <![CDATA[
        JSON-formatted model goes here
        ]]>
    </model>
</transform>
```

# Example

HTTP POST http://localhost:3000/api/engine/vash/transform  
* request headers: Content-Type = text/xml  
* request body:  

```xml
<transform>
	<template>
		<![CDATA[
//vash (razor) - note that we use the @@html helper since we want to suppress any html encoding for this text/plain example
===========================================================================================================================
My name is My name is @html.raw(model.firstname) @html.raw(model.lastname)
My address is @html.raw(model.address) and phone number is @html.raw(model.phone)
		]]>
	</template>
	<model>
		<![CDATA[
{
	"firstname": "steve", 
	"lastname": "krisjanovs", 
	"address": "123 Queen street",
	"phone": "999-999-9999"
}
		]]>
	</model>
</transform>
```