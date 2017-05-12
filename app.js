/*
 * app.js - Express server with routing
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';
var
  http    = require( 'http'         ),
  express = require( 'express'      ),
  routes  = require( './lib/routes' ),
  wechat  = require( 'wechat' ),
  wechatApi  = require( 'wechat-api' ),
  emotion = require( './lib/emotion' ),
  wechat_util = require( './lib/wechat_util' ),

	wechatConfig = {
		token: '',

		//测试号
		appid: '',
		appsecret: '',

		encodingAESKey: '',
	},
	wechatMenu = {
		"button" : [
			{
				"type" : "view",
				"name" : "跑腿",
				"url"  : "https://www.baidu.com"
			},
			{
				"name" : "小店",
				"sub_button": [
					{
						"type" : "view",
						"name" : "好情绪商品",
						"url"  : "http://www.soso.com"
					},
					{
						"type" : "view",
						"name" : "汽车保养",
						"url"  : "http://www.soso.com"
					}
				]
			},
			{
				"type" : "click",
				"name" : "跑腿的简介",
				"key"  : "paotui_intro"
			}
		]
	},

  app     = express(),
  api     = new wechatApi(wechatConfig.appid, wechatConfig.appsecret),
  server  = http.createServer( app );
// ------------- END MODULE SCOPE VARIABLES ---------------

// ------------- BEGIN SERVER CONFIGURATION ---------------
app.configure( function () {
  app.use( express.bodyParser() );
  app.use( express.methodOverride() );
  app.use( express.static( __dirname + '/public' ) );
  app.use( app.router );
  app.use( express.query() );
	app.use( '/wechat', wechat(wechatConfig).text( wechat_util.textHandler)
	  .voice( wechat_util.voiceHandler )
	  .event( wechat_util.eventHandler )
		.middlewarify());
});

app.configure( 'development', function () {
  app.use( express.logger() );
  app.use( express.errorHandler({
    dumpExceptions : true,
    showStack      : true
  }) );
});

app.configure( 'production', function () {
  app.use( express.errorHandler() );
});

routes.configRoutes( app, server );

api.createMenu(wechatMenu, function(){
});

// -------------- END SERVER CONFIGURATION ----------------

// ----------------- BEGIN START SERVER -------------------
server.listen( 80 );
console.log(
//  'Express server listening on port %d in %s mode',
//   server.address().port, app.settings.env

  'Express server listening in %s mode',
   app.settings.env
);
// ------------------ END START SERVER --------------------
