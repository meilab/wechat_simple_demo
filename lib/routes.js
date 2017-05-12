/*
 * routes.js - module to provide routing
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
  configRoutes,
  crud        = require( './crud' ),
  emotion     = require( './emotion' ),
  makeMongoId = crud.makeMongoId;
// ------------- END MODULE SCOPE VARIABLES ---------------

// ---------------- BEGIN PUBLIC METHODS ------------------
configRoutes = function ( app, server ) {
  app.get( '/', function ( request, response ) {
    response.redirect( '/emotion.html' );
  });

  app.all( '/:obj_type/*?', function ( request, response, next ) {
    response.contentType( 'json' );
    next();
  });

  app.post( '/:obj_type/emotion_analysis', function ( request, response ) {
    emotion.analysis(
      request.params.obj_type,
      request.body,
      function ( result_map ) { response.send( result_map ); }
    );
  });

  app.get( '/:obj_type/list', function ( request, response ) {
    crud.read(
      request.params.obj_type,
      {}, {},
      function ( map_list ) { response.send( map_list ); }
    );
  });

  app.get( '/:obj_type/readwithprojection', function ( request, response ) {
    crud.read(
      request.params.obj_type,
      {}, 
			request.query,
      function ( map_list ) { response.send( map_list ); }
    );
  });

  app.get( '/:obj_type/distinct/:item', function ( request, response ) {
    crud.distinct(
      request.params.obj_type,
      request.params.item, 
			request.query,
      function ( map_list ) { response.send( map_list ); }
    );
  });

  app.post( '/:obj_type/create', function ( request, response ) {
    crud.construct(
      request.params.obj_type,
      request.body,
      function ( result_map ) { response.send( result_map ); }
    );
  });

  app.get( '/:obj_type/read/:id', function ( request, response ) {
    crud.read(
      request.params.obj_type,
      { _id: makeMongoId( request.params.id ) },
      {},
      function ( map_list ) { response.send( map_list ); }
    );
  });

  app.post( '/:obj_type/update/:id', function ( request, response ) {
    crud.update(
      request.params.obj_type,
      { _id: makeMongoId( request.params.id ) },
      request.body,
      function ( result_map ) { response.send( result_map ); }
    );
  });

  app.get( '/:obj_type/readbyname/:name', function ( request, response ) {
    crud.read(
      request.params.obj_type,
      { name: request.params.name },
      {},
      function ( map_list ) { response.send( map_list ); }
    );
  });

  app.post( '/:obj_type/updatebyname/:name', function ( request, response ) {
    crud.update(
      request.params.obj_type,
      { name: request.params.name },
      request.body,
      function ( result_map ) { response.send( result_map ); }
    );
  });

  app.get( '/:obj_type/delete/:id', function ( request, response ) {
    crud.destroy(
      request.params.obj_type,
      { _id: makeMongoId( request.params.id ) },
      function ( result_map ) { response.send( result_map ); }
    );
  });

};

module.exports = { configRoutes : configRoutes };
// ----------------- END PUBLIC METHODS -------------------
