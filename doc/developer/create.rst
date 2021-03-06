.. sectionauthor:: Dmitry Baryshnikov <dmitry.baryshnikov@nextgis.ru>

Create resource
=================

Resource group
---------------

To create new group execute following request.

.. http:post:: /api/resource

   Create resource group request.
   
   :reqheader Accept: must be ``*/*``
   :reqheader Authorization: optional Basic auth string to authenticate
   :<json jsonobj resource: resource JSON object
   :<json string cls: type (must be ``resource_group``, for a list of supported types see :ref:`ngwdev_resource_classes`)
   :<json jsonobj parent:  parent resource json object
   :<json int id: parent resource identificator
   :<json string display_name: group name
   :<json string keyname: key (optional)
   :<json string description: decription text, HTML supported (optional)
   :statuscode 201: no error
   
**Example request**:

.. sourcecode:: http

   POST /api/resource HTTP/1.1
   Host: ngw_url
   Accept: */*
   
    {"resource":
      {"cls":"resource_group",
       "parent":{"id":0},
       "display_name":"test",
       "keyname":"test_key",
       "description":"qqq"
      }
    }   

.. _ngwdev_create_pg_conn:

PostGIS Connection
-------------------

To create PostGIS connection execute following request.

.. http:post:: /api/resource

   PostGIS connection create request.
   
   :reqheader Accept: must be ``*/*``
   :reqheader Authorization: optional Basic auth string to authenticate
   :<json jsonobj resource: resource JSON object
   :<json string cls: type (must be ``postgis_connection``, for a list of supported types see :ref:`ngwdev_resource_classes`)
   :<json jsonobj parent:  parent resource json object
   :<json int id: parent resource identificator
   :<json string display_name: name
   :<json string keyname: key (optional)
   :<json string description: decription text, HTML supported (optional)
   :<json jsonobj postgis_connection: postgis connection JSON object
   :<json string database: Database name 
   :<json string hostname: Database host
   :<json string password: password
   :<json string username: login
   :statuscode 201: no error
   
**Example request**:

.. sourcecode:: http

   POST /api/resource HTTP/1.1
   Host: ngw_url
   Accept: */*
   
    {
      "postgis_connection": {
        "database": "postgis", 
        "hostname": "localhost", 
        "password": "secret", 
        "username": "user"
      }, 
      "resource": {
        "cls": "postgis_connection", 
        "description": "The localhost PostGIS Connection", 
        "display_name": "localhost", 
        "keyname": "localhost_key", 
        "parent": {
          "id": 0
        }
      }
    }      


PostGIS Layer
-------------

To create PostGIS layer execute following request.

.. http:post:: /api/resource

   Create PostGIS layer request.
   
   :reqheader Accept: must be ``*/*``
   :reqheader Authorization: optional Basic auth string to authenticate   
   :<json jsonobj resource: resource JSON object
   :<json string cls: type (must be ``postgis_layer``, for a list of supported types see :ref:`ngwdev_resource_classes`)
   :<json jsonobj parent:  parent resource json object
   :<json int id: parent resource identificator
   :<json string display_name: name
   :<json string keyname: key (optional)
   :<json string description: decription text, HTML supported (optional)
   :<json jsonobj postgis_layer: postgis layer JSON object
   :<json string column_geom: geometry column name (usually ``wkb_geometry``)
   :<json string column_id: primary key column (usually ``ogc_fid``)
   :<json jsonobj connection: PostGIS connection identificator (to create PostGIS connection see :ref:`ngwdev_create_pg_conn`) 
   :<json string fields: check to reread fields from database (must be ``update`` or not set)
   :<json string geometry_type: geometry type (if null, will read from database table). See :ref:`ngwdev_geom_types`
   :<json string schema: table schema
   :<json jsonobj srs: spatial reference JSON object
   :<json int id: EPSG code
   :<json string table: table name
   :statuscode 201: no error
   
**Example request**:

.. sourcecode:: http

   POST /api/resource HTTP/1.1
   Host: ngw_url
   Accept: */*
   
    {
      "postgis_layer": {
        "column_geom": "wkb_geometry", 
        "column_id": "ogc_fid", 
        "connection": {
          "id": 31
        }, 
        "fields": "update", 
        "geometry_type": null, 
        "schema": "thematic", 
        "srs": {
          "id": 3857
        }, 
        "table": "roads"
      }, 
      "resource": {
        "cls": "postgis_layer", 
        "description": null, 
        "display_name": "test", 
        "keyname": null, 
        "parent": {
          "id": 0
        }
      }
    }     


Empty vector layer 
-----------------------

To create empty vector layer execute following request:

.. http:post:: /api/resource

   Create PostGIS layer request.
   
   :reqheader Accept: must be ``*/*``
   :reqheader Authorization: optional Basic auth string to authenticate
   :<json jsonobj resource: resource JSON object
   :<json string cls: type (must be ``vector_layer``, for a list of supported types see :ref:`ngwdev_resource_classes`)
   :<json jsonobj parent:  parent resource json object
   :<json int id: parent resource identificator
   :<json string display_name: name
   :<json string keyname: key (optional)
   :<json string description: decription text, HTML supported (optional)
   :<json jsonobj vector_layer: vector layer JSON object
   :<json jsonarr fields: array of json objects:
   :<jsonarr string keyname: field name
   :<jsonarr string datatype: field type. See :ref:`ngwdev_field_types`
   :<jsonarr string display_name: field alias
   :<json string geometry_type: geometry type. See :ref:`ngwdev_geom_types`   
   :<json jsonobj srs: spatial reference json object
   :<json int id: :term:`EPSG` code
   :statuscode 201: no error
   

**Example request**:

.. sourcecode:: http

    POST /api/resource/ HTTP/1.1

    {
    "resource":{
        "cls":"vector_layer",
        "parent":{
            "id":0
        },
        "display_name":"Foo bar",
        "keyname":null,
        "description":null
    },
    "resmeta":{
        "items":{

        }
    },
    "vector_layer":{
        "srs":{ "id":3857 },
        "geometry_type": "POINT",
        "fields": [
            {
                "keyname": "REAL_FIELD",
                "datatype": "REAL"
            },
            {
                "keyname": "INTEGER_FIELD",
                "datatype": "INTEGER"
            },
            {
                "keyname": "DATE_FIELD",
                "datatype": "DATE"
            },
            {
                "keyname": "TIME_FIELD",
                "datatype": "TIME",
                "display_name": "TIME FIELD"
            }
        ]
    }
    }   

Vector layer with data 
-----------------------

Vector layer creation from geodata source (:term:`Shapefile`, :term:`GeoJSON`) consists of following steps:

1. Prepare vector geodata for layer
2. Upload vector geodata
3. Create vector layer

Vector geodata preparing
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To prepare your geodata export it to ESRI Shapefile or GeoJSON format (if needed). The field name ``id`` is forbidden. 
Also, geodata must have spatial reference and ``UTF-8`` or ``CP1251`` encoding. Geometry must be valid and exist in all features, field names and values cannot include non-printing characters. 

Uploading vector geodata
^^^^^^^^^^^^^^^^^^^^^^^^^

If geodata is in ESRI Shapefile format, all files must be packed into the one ZIP archive. GeoJSON file can be uploaded without archiving. Geodata uploading detailes see in :ref:`ngw_file_upload`.

Create vector layer
^^^^^^^^^^^^^^^^^^^

To create vector layer execute following request:

.. http:post:: /api/resource

   Create vector layer from uploaded file request.
   
   :reqheader Accept: must be ``*/*``
   :reqheader Authorization: optional Basic auth string to authenticate
   :<json jsonobj resource: resource JSON object
   :<json string cls: type (must be ``vector_layer``, for a list of supported types see :ref:`ngwdev_resource_classes`)
   :<json jsonobj parent:  parent resource json object
   :<json int id: parent resource identificator
   :<json string display_name: name
   :<json string keyname: key (optional)
   :<json string description: decription text, HTML supported (optional)
   :<json jsonobj vector_layer: vector layer JSON object
   :<json jsonobj source: JSON object with file upload response
   :<json jsonobj srs: spatial reference of creating vector layer. Should be the same as web map
   :<json int id: EPSG code
   :statuscode 201: no error
   
**Example request**:

.. sourcecode:: http

   POST /api/resource HTTP/1.1
   Host: ngw_url
   Accept: */*
   
    {
      "resource": {
        "cls": "vector_layer", 
        "description": null, 
        "display_name": "ggg www", 
        "keyname": null, 
        "parent": {
          "id": 0
        }
      }, 
      "vector_layer": {
        "source": {
          "encoding": "utf-8", 
          "id": "2f906bf9-0947-45aa-b271-c711fef1d2fd", 
          "mime_type": "application/zip", 
          "name": "ngw1_1.zip", 
          "size": 2299
        }, 
        "srs": {
          "id": 3857
        }
      }
    }
    
Same steps with curl:

.. sourcecode:: bash
   
   $ curl -F file=@/tmp/bld.zip http://<ngw url>/api/component/file_upload/upload

   {"upload_meta": [{"id": "00cc4aa9-cca7-4160-b069-58070dff9399", "name": "bld.zip", 
   "mime_type": "application/octet-stream", "size": 62149}]}

   $ curl --user "user:password" -H "Accept: */*" -X POST -d '{"resource": 
   {"cls": "vector_layer","description": "test curl create", "display_name": "buildings",
   "keyname": null,"parent": {"id": 0}},"vector_layer": {"source": {"encoding": "utf-8",
   "id": "00cc4aa9-cca7-4160-b069-58070dff9399","mime_type": "application/zip","name": "bld.zip",
   "size": 62149},"srs": {"id": 3857}}}' http://<ngw url>/api/resource/

   {"id": 108, "parent": {"id": 0}}
   
   
Create new feature in vector layer
-----------------------------------

To create new feature in vector layer execute following request:

.. http:post:: /api/resource/(int:layer_id)/feature/

   Create feature request
   
   :param layer_id: layer resource identificator
   :reqheader Accept: must be ``*/*``
   :reqheader Authorization: optional Basic auth string to authenticate 
   :<json string geom: geometry in WKT format (geometry type ans spatial reference must be corespondent to layer geometry type and spatial reference)
   :<jsonarr fields: attributes array in form of JSON field name - value object 
   :statuscode 201: no error
   
**Example request**:

.. sourcecode:: http   

   POST /api/resource/3/feature/ HTTP/1.1
   Host: ngw_url
   Accept: */*

   {
     "extensions": {
       "attachment": null, 
       "description": null
     }, 
     "fields": {
       "Age": 1, 
       "DateTr": {
         "day": 7, 
         "month": 2, 
         "year": 2015
       }, 
       "Davnost": 4, 
       "Foto": 26, 
       "Nomerp": 1, 
       "Nomers": 1, 
       "Samka": 0, 
       "Sex": 3, 
       "Sizeb": 0.0, 
       "Sizef": 0.0, 
       "Sizes": 9.19999980926514, 
       "Snowdepth": 31, 
       "Wher": "\u043b\u044b\u0436\u043d\u044f", 
       "id01": 0
     }, 
     "geom": "MULTIPOINT (15112317.9207317382097244 6059092.3103669174015522)"
   }

For timestamp field input value must be divided on parts: *day*, *month*,
*day*, *hour*, *minute*, *second*. 
In request payload add only set fields. Other fields will set to default values.
    
**Example response body**:
    
.. sourcecode:: json 

   {"id": 25}

Raster layer
------------

Raster layer creation consists of following steps:

1. Raster file prepare
2. Upload raster
3. Create raster layer

Raster preparing
^^^^^^^^^^^^^^^^^^^^^^^^^^

You can upload raster file in GeoTIFF format with 3 (RGB) or 4 (RGBA) bands. GeoTIFF file must have spatial reference, which can project to web map spatial reference (usually EPSG:3857). Value of ``color interpretation`` muast be set for bands. Compression (LZW, DEFLATE) can be used for decrease traffic. Pixel values must be between 0 to 255 (1 byte).

Loading raster
^^^^^^^^^^^^^^^

Prepared raster can be upload. See :ref:`ngw_file_upload`.

Create raster layer
^^^^^^^^^^^^^^^^^^^

To create raster layer execute following request:

.. http:post:: /api/resource

   Create raster layer request.
   
   :reqheader Accept: must be ``*/*``
   :reqheader Authorization: optional Basic auth string to authenticate
   :<json string cls: type (must be ``raster_layer``, for a list of supported types see :ref:`ngwdev_resource_classes`)
   :<json jsonobj parent:  parent resource json object
   :<json int id: parent resource identificator
   :<json string display_name: name
   :<json string keyname: key (optional)
   :<json string description: decription text, HTML supported (optional)
   :<json jsonobj source: JSON object with file upload response
   :<json jsonobj srs: spatial reference of creating vector layer. Should be the same as web map
   :<json int id: EPSG code
   :statuscode 201: no error
   
**Example request**:

.. sourcecode:: http

   POST /api/resource HTTP/1.1
   Host: ngw_url
   Accept: */*
   
    {
      "resource": {
      "cls": "raster_layer",
      "display_name": "20150820_211250_1_0b0e",
      "parent": {"id": 101}
      },
      "raster_layer": {
        "source": {
          "id": "a2f381f9-8467-477c-87fa-3f71ecb749a5", 
          "mime_type": "image/tiff", 
          "size": 17549598
         },
        "srs": {"id": 3857}
      }
    }

    
Same steps with curl:

.. sourcecode:: bash
   
   $ curl --user "user:password" --upload-file 'tmp/myfile.tif' http://<ngw url>/api/component/file_upload/upload

   {"id": "a2f381f9-8467-477c-87fa-3f71ecb749a5", "mime_type": "image/tiff", "size": 17549598}

   $ curl --user "user:password" -H "Accept: */*" -X POST -d '{ "resource": {
   "cls": "raster_layer", "display_name": "20150820_211250_1_0b0e", "parent": { "id": 101 } }, 
   "raster_layer": { "source": {"id": "a2f381f9-8467-477c-87fa-3f71ecb749a5", "mime_type": "image/tiff",
   "size": 17549598}, "srs": {"id": 3857} } }' http://<ngw url>/api/resource/

   {"id": 102, "parent": {"id": 101}}


File bucket
-----------

File bucket creation includes 2 steps:

1. Upload files
2. Execute POST request to create file bucket

File upload
^^^^^^^^^^^^^^^

Upload files to server. See :ref:`ngw_file_upload`. Any file types are supported.

Create file bucket
^^^^^^^^^^^^^^^^^^^^^^

To create file bucket execute following request:

.. http:post:: /api/resource

   Create file bucket request.
   
   :reqheader Accept: must be ``*/*``
   :reqheader Authorization: optional Basic auth string to authenticate
   :<json jsonobj resource: resource JSON object
   :<json string cls: type (must be ``file_bucket``, for a list of supported types see :ref:`ngwdev_resource_classes`)
   :<json jsonobj parent:  parent resource json object
   :<json int id: parent resource identificator
   :<json string display_name: name
   :<json string keyname: key (optional)
   :<json string description: decription text, HTML supported (optional)
   :<json jsonobj files: Part of upload JSON response (files == upload_meta)
   :statuscode 201: no error
   
**Example request**:

.. sourcecode:: http

   POST /api/resource HTTP/1.1
   Host: ngw_url
   Accept: */*

    {
      "file_bucket": {
        "files": [
          {
            "id": "b5c02d94-e1d7-40cf-b9c7-79bc9cca429d", 
            "mime_type": "application/octet-stream", 
            "name": "grunt_area_2_multipolygon.cpg", 
            "size": 5
          }, 
          {
            "id": "d8457f14-39cb-4f9d-bb00-452a381fa62e", 
            "mime_type": "application/x-dbf", 
            "name": "grunt_area_2_multipolygon.dbf", 
            "size": 36607
          }, 
          {
            "id": "1b0754f8-079d-4675-9367-36531da247e1", 
            "mime_type": "application/octet-stream", 
            "name": "grunt_area_2_multipolygon.prj", 
            "size": 138
          }, 
          {
            "id": "a34b5ab3-f3a5-4a60-835d-318e601d34df", 
            "mime_type": "application/x-esri-shape", 
            "name": "grunt_area_2_multipolygon.shp", 
            "size": 65132
          }, 
          {
            "id": "fb439bfa-1a63-4384-957d-ae57bb5eb67b", 
            "mime_type": "application/x-esri-shape", 
            "name": "grunt_area_2_multipolygon.shx", 
            "size": 1324
          }
        ]
      }, 
      "resource": {
        "cls": "file_bucket", 
        "description": null, 
        "display_name": "grunt_area", 
        "keyname": null, 
        "parent": {
          "id": 0
        }
      }
    }
    
**Example response body**:
    
.. sourcecode:: json 

   {"id": 22, "parent": {"id": 0}}

Vector (mapserver) style
------------------------

To create vector style execute following request:

.. http:post:: /api/resource

   Create vector layer request.
   
   :reqheader Accept: must be ``*/*``
   :reqheader Authorization: optional Basic auth string to authenticate
   :<json jsonobj mapserver_style: Style json object.
   :<json string xml: MapServer xml style. Supported tags described in :ref:`ngw_mapstyles`.
   :<json jsonobj resource: Resource json object. 
   :<json string cls: type (must be ``mapserver_style``, for a list of supported types see :ref:`ngwdev_resource_classes`)
   :<json jsonobj parent:  parent resource json object
   :<json int id: parent resource identificator
   :<json string display_name: name
   :<json string keyname: key (optional)
   :<json string description: decription text, HTML supported (optional)
   :statuscode 201: no error
   
**Example request**:

.. sourcecode:: http

   POST /api/resource HTTP/1.1
   Host: ngw_url
   Accept: */*

    {
      "mapserver_style" : {
        "xml" : "<map><layer><class><style><color blue=\"218\" green=\"186\" red=\"190\"/>
        <outlinecolor blue=\"64\" green=\"64\" red=\"64\"/></style></class></layer></map>"  
      },
      "resource": {
        "cls": "raster_style", 
        "description": null, 
        "display_name": "grunt area style", 
        "keyname": null, 
        "parent": {
          "id": 0
        }
      }
    }
        
**Example response body**:
    
.. sourcecode:: json 

   {"id": 24, "parent": {"id": 0}}
    
Raster style
------------

To create raster style execute following request:

.. http:post:: /api/resource

   Create raster layer request.
   
   :reqheader Accept: must be ``*/*``
   :reqheader Authorization: optional Basic auth string to authenticate
   :<json jsonobj resource: resource JSON object
   :<json string cls: type (must be ``raster_style``, for a list of supported types see :ref:`ngwdev_resource_classes`)
   :<json int id: parent resource identificator
   :<json string display_name: name
   :<json string keyname: key (optional)
   :<json string description: decription text, HTML supported (optional)
   :statuscode 201: no error
   
**Example request**:

.. sourcecode:: http

   POST /api/resource HTTP/1.1
   Host: ngw_url
   Accept: */*

    {
      "resource": {
        "cls": "raster_style", 
        "description": null, 
        "display_name": "landsat style", 
        "keyname": null, 
        "parent": {
          "id": 0
        }
      }
    }
    
**Example response body**:
    
.. sourcecode:: json 

   {"id": 25, "parent": {"id": 0}}
    

Lookup table
--------------

To create lookup table execute following request.

.. http:post:: /api/resource

   Create lookup table request.
   
   :reqheader Accept: must be ``*/*``
   :reqheader Authorization: optional Basic auth string to authenticate
   :<json jsonobj resource: resource JSON object
   :<json string cls: type (must be ``lookup_table``, for a list of supported types see :ref:`ngwdev_resource_classes`)
   :<json int id: parent resource identificator
   :<json string display_name: name
   :<json string keyname: key (optional)
   :<json string description: decription text, HTML supported (optional)
   :<json jsonobj resmeta: metadata JSON object. Key - value JSON object struct.
   :<json jsonobj lookup_table: lookup table values JSON object. Key - value JSON object struct.
   :statuscode 201: no error
   
**Example request**:

.. sourcecode:: http

   POST /api/resource HTTP/1.1
   Host: ngw_url
   Accept: */*

    {
        "resource": {
            "cls": "lookup_table",
            "parent": {
                "id": 381
            },
            "display_name": "test_2",
            "keyname": null,
            "description": null
        },
        "resmeta": {
            "items": {}
        },
        "lookup_table": {
            "items": {
                "cat": "Машина"
            }
        }
    }
    
**Example response body**:
    
.. sourcecode:: json 

   {"id": 25, "parent": {"id": 0}}
   
Same steps with curl:

.. sourcecode:: bash
   
   $ curl --user "user:password" -H 'Accept: */*' -X POST -d '{"resource":{"cls":"lookup_table",
   "parent":{"id":381},"display_name":"test_3","keyname":null,"description":null},"resmeta":
   {"items":{}},"lookup_table":{"items":{"cat":"\u041c\u0430\u0448\u0438\u043d\u0430"}}}' 
   http://<ngw url>/api/resource/

   {"id": 385, "parent": {"id": 381}}
   
   
Web map
---------------

To create new web map execute following request.

.. http:post:: /api/resource


   
**Example request**:

.. sourcecode:: http

   POST /api/resource HTTP/1.1
   Host: ngw_url
   Accept: */*
   
   {
   "resource":{
      "display_name":"Test webmap",
      "parent":{
         "id":2317
      },
      "cls":"webmap"
   },
   "webmap":{
      "root_item":{
         "item_type":"root",
         "children":[
            {
               "layer_enabled":false,
               "layer_adapter":"tile",
               "display_name":"LT05_L1TP_124025_20010603_20161211_01",
               "layer_style_id":2284,
               "item_type":"layer"
            }
         ]
      }
   }
   }


Same steps with curl:

.. sourcecode:: bash

   curl --user "login:password" -H "Accept: */*" -X POST -d '{"resource": {"display_name": "cwm Вебкарта", "parent": {"id": 2317}, "cls": "webmap"}, "webmap": {"root_item": {"item_type": "root", "children": [{"layer_enabled": false, "layer_adapter": "tile", "display_name": "LT05_L1TP_124025_20010603_20161211_01", "layer_style_id": 2284, "item_type": "layer"}]}}}' http://trolleway.nextgis.com/api/resource/
