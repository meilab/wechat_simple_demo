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
  loadSchema,   checkSchema,  loadEmotionDict,
  checkType,    analysis,     segment,
	getMaxEmotion, getMinEmotion,

  mongodb     = require( 'mongodb' ),
  fsHandle    = require( 'fs'      ),
  JSV         = require( 'JSV'     ).JSV,
  Segment     = require( 'segment' ),
  _           = require( 'lodash' ),

  validator   = JSV.createEnvironment(),

  emotionDict = {},
	maxEmotion  = { "word": "太好吃了", "score" : 0 },
	minEmotion  = { "word": "太好吃了", "score" : 0 },

  objTypeMap  = { 
    'emotion' : {}
  };
// ------------- END MODULE SCOPE VARIABLES ---------------

// ---------------- BEGIN UTILITY METHODS -----------------
loadSchema = function ( schema_name, schema_path ) {
  fsHandle.readFile( schema_path, 'utf8', function ( err, data ) {
    objTypeMap[ schema_name ] = JSON.parse( data );
  });
};

loadEmotionDict = function ( emotiondict_path ) {
	var 
		data_length,
	  emotion_data;

  fsHandle.readFile( emotiondict_path, 'utf8', function ( err, data ) {
    emotion_data = JSON.parse(data);
		data_length = emotion_data.length;

/*
		for( i = 0; i < data_length; i++ ) {
			if ( emotion_data[i].polar === 1 ) {
				emotionDict[emotion_data[i].word] = emotion_data[i].strength;
			}
			else if ( emotion_data[i].polar === 2 ) {
				emotionDict[emotion_data[i].word] = -emotion_data[i].strength;
			}
		}
*/
    emotion_data.forEach( function(item) {
			if ( item.polar === 1 ) {
				emotionDict[item.word] = item.strength;
			}
			else if ( item.polar === 2 ) {
				emotionDict[item.word] = -item.strength;
			}
		});

//		console.log(JSON.stringify(emotionDict));
  });
};

checkSchema = function ( obj_type, obj_map, callback ) {
  var
    schema_map = objTypeMap[ obj_type ],
    report_map = validator.validate( obj_map, schema_map );

  callback( report_map.errors );
};

// ----------------- END UTILITY METHODS ------------------

// ---------------- BEGIN PUBLIC METHODS ------------------
checkType = function ( obj_type ) {
  if ( ! objTypeMap[ obj_type ] ) {
    return ({ error_msg : 'Object type "' + obj_type
      + '" is not supported.'
    });
  }
  return null;
};

analysis = function ( obj_type, obj_map, callback ) {
  var 
	  results = [],
		e_score = 0,
		type_check_map = checkType( obj_type );

  if ( type_check_map ) {
    callback( type_check_map );
    return;
  }

  checkSchema(
    obj_type, obj_map,
    function ( error_list ) {
      if ( error_list.length === 0 ) {
				if (obj_map.word) {
					results =  segment.doSegment(obj_map.word, {
						simple: true,
						stripPunctuation: true
					});
				}

				results.forEach( function( item ){
					if ( emotionDict[item] ) {
						e_score += emotionDict[item];
						console.log(emotionDict[item]);
					}
				});

				console.log(e_score);
				if ( e_score > maxEmotion.score ) {
					maxEmotion.word = obj_map.word;
					maxEmotion.score = e_score;
				}

				if ( e_score < minEmotion.score ) {
					minEmotion.word = obj_map.word;
					minEmotion.score = e_score;
				}
        callback( {"score": e_score} );
      }
      else {
        callback({
          error_msg  : 'Input document not valid',
          error_list : error_list
        });
      }
    }
  );
};

getMaxEmotion = function() {
	return maxEmotion;
}

getMinEmotion = function() {
	return minEmotion;
}

module.exports = {
  makeMongoId     : mongodb.ObjectID,
  checkType       : checkType,
  getMaxEmotion   : getMaxEmotion,
  getMinEmotion   : getMinEmotion,
  analysis        : analysis
};
// ----------------- END PUBLIC METHODS -----------------

// ------------- BEGIN MODULE INITIALIZATION --------------

// load schemas into memory (objTypeMap)
// load emotion dict into memory
(function () {
  var
	  e_score = 0,
	  results = [], 
	  schema_name, schema_path, emotiondict_path;
  for ( schema_name in objTypeMap ) {
    if ( objTypeMap.hasOwnProperty( schema_name ) ) {
      schema_path = __dirname + '/' + schema_name + '.json';
      loadSchema( schema_name, schema_path );
    }
  }

	segment = new Segment();
	segment.useDefault();

  results =  segment.doSegment('今天好脏乱，需要责备了', {
	  simple: true,
		stripPunctuation: true
  });

	console.log( results );

  emotiondict_path = __dirname + '/' + 'sheet1' + '.json';
  loadEmotionDict( emotiondict_path );

	results.forEach( function( item ){
		if( emotionDict[item] ) {
      e_score += emotionDict[item];
			console.log(emotionDict[item]);
		}
	});

	console.log(e_score);
}());
// -------------- END MODULE INITIALIZATION ---------------
