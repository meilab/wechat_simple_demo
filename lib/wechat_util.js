/*
 * crud.js - module to provide CRUD db capabilities
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
	loadCmdDict,
  imageHandler,    voiceHandler, segment,
  textHandler,     videoHandler, locationHandler,
	linkHandler,     eventHandler, device_textHandler,
	device_eventHandler,

  fsHandle    = require( 'fs'      ),
  emotion     = require( './emotion' ),
  Segment     = require( 'segment' ),
  _           = require( 'lodash' ),
	http        = require( 'http' ),
	yahooFinance= require( 'yahoo-finance' ),

	cmdDict = {},

	maxEmotion  = { "word": "太好吃了", "score" : 0 },
	minEmotion  = { "word": "太好吃了", "score" : 0 };

// ------------- END MODULE SCOPE VARIABLES ---------------

// ---------------- BEGIN UTILITY METHODS -----------------

loadCmdDict = function ( commanddict_path ) {
	var 
		data_length,
	  cmd_data;

  fsHandle.readFile( commanddict_path, 'utf8', function ( err, data ) {
    cmd_data = JSON.parse(data);
		data_length = cmd_data.length;

    cmd_data.forEach( function(item) {
			cmdDict[item.word] = item.cmd;
		});

  });
};

// ----------------- END UTILITY METHODS ------------------

// ---------------- BEGIN PUBLIC METHODS ------------------

textHandler = function ( message, req, res, next ) {
		var max_emotion, min_emotion;

		if ( message.Content === 'diaosi' ) {
			res.reply('diaosi');
		}
		else {
			emotion.analysis(
				"emotion",
				{"word":message.Content},
				function ( result_map ) { 
					max_emotion = emotion.getMaxEmotion();
					min_emotion = emotion.getMinEmotion();

					res.reply( "情绪度" + result_map.score + "\n" + 
					  "max:" + max_emotion.word + ":" + max_emotion.score + "\n" +
					  "min:" + min_emotion.word + ":" + min_emotion.score + "\n"
						); 
				}
			);
		}
};

imageHandler = function ( message, req, res, next ) {
};

voiceHandler = function ( message, req, res, next ) {
	var results;

	results =  segment.doSegment( message.Recognition, {
		stripPunctuation: true
	});
	console.log(results);
	res.reply([
		{
			title:'订单详情',
			description: message.Recognition,
			picurl: 'http://img1.imgtn.bdimg.com/it/u=1147510966,3551905099&fm=21&gp=0.jpg',
			url: 'https://wap.koudaitong.com/v2/showcase/goods?alias=3nqejap4lgwp7'
		}
	]);
};

videoHandler = function ( message, req, res, next ) {
};

locationHandler = function ( message, req, res, next ) {
};

linkHandler = function ( message, req, res, next ) {
};

eventHandler = function ( message, req, res, next ) {

	if ( message.Event === "subscribe" ) {
		res.reply( "欢迎关注小美实验室测试帐号\n"
			+ "Have fun:)\n\n"
			+ "目前支持以下玩法:\n"
			+ "1.发送文本消息判断情绪\n"
			+ "2.发送语音执行相应操作"
		);
	}
	else if ( message.Event === "unsubscribe" ) {
		res.reply("I will miss you");
	}
	else if ( message.Event === "CLICK" ) {
		if ( message.EventKey === "paotui_intro" ) {
			yahooFinance.snapshot({
				symbol: '000625.sz',
				fields :['s', 'n', 'd1', 'l1', 'y','r']
			}, function (err, snapshot) {
				console.log(snapshot);
				//res.reply(snapshot.name);
			});

			res.reply("paotui_intro");
		}
	}
	else {
		res.reply("What?");
	}
};

device_textHandler = function ( message, req, res, next ) {
};

device_eventHandler = function ( message, req, res, next ) {
};

module.exports = {
  textHandler      : textHandler,
  imageHandler     : imageHandler,
  voiceHandler     : voiceHandler,
  videoHandler     : videoHandler,
  locationHandler  : locationHandler,
  linkHandler      : linkHandler,
  eventHandler     : eventHandler,
  device_textHandler      : device_textHandler,
  device_eventHandler      : device_eventHandler
};
// ----------------- END PUBLIC METHODS -----------------

// ------------- BEGIN MODULE INITIALIZATION --------------

// load schemas into memory (objTypeMap)
// load emotion dict into memory
(function () {
	var commanddict_path;

	segment = new Segment();
	segment.useDefault();

  commanddict_path = __dirname + '/' + 'command' + '.json';
  //loadCmdDict( commanddict_path );

}());
// -------------- END MODULE INITIALIZATION ---------------
