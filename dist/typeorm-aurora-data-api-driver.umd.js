(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('aws-sdk'), require('https')) :
    typeof define === 'function' && define.amd ? define(['aws-sdk', 'https'], factory) :
    (global.typeormAuroraDataApiDriver = factory(global.awsSdk,global.https));
}(this, (function (awsSdk,https) { 'use strict';

    awsSdk = awsSdk && awsSdk.hasOwnProperty('default') ? awsSdk['default'] : awsSdk;
    https = https && https.hasOwnProperty('default') ? https['default'] : https;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var SqlString_1 = createCommonjsModule(function (module, exports) {
    var SqlString  = exports;

    var ID_GLOBAL_REGEXP    = /`/g;
    var QUAL_GLOBAL_REGEXP  = /\./g;
    var CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g; // eslint-disable-line no-control-regex
    var CHARS_ESCAPE_MAP    = {
      '\0'   : '\\0',
      '\b'   : '\\b',
      '\t'   : '\\t',
      '\n'   : '\\n',
      '\r'   : '\\r',
      '\x1a' : '\\Z',
      '"'    : '\\"',
      '\''   : '\\\'',
      '\\'   : '\\\\'
    };

    SqlString.escapeId = function escapeId(val, forbidQualified) {
      if (Array.isArray(val)) {
        var sql = '';

        for (var i = 0; i < val.length; i++) {
          sql += (i === 0 ? '' : ', ') + SqlString.escapeId(val[i], forbidQualified);
        }

        return sql;
      } else if (forbidQualified) {
        return '`' + String(val).replace(ID_GLOBAL_REGEXP, '``') + '`';
      } else {
        return '`' + String(val).replace(ID_GLOBAL_REGEXP, '``').replace(QUAL_GLOBAL_REGEXP, '`.`') + '`';
      }
    };

    SqlString.escape = function escape(val, stringifyObjects, timeZone) {
      if (val === undefined || val === null) {
        return 'NULL';
      }

      switch (typeof val) {
        case 'boolean': return (val) ? 'true' : 'false';
        case 'number': return val + '';
        case 'object':
          if (val instanceof Date) {
            return SqlString.dateToString(val, timeZone || 'local');
          } else if (Array.isArray(val)) {
            return SqlString.arrayToList(val, timeZone);
          } else if (Buffer.isBuffer(val)) {
            return SqlString.bufferToString(val);
          } else if (typeof val.toSqlString === 'function') {
            return String(val.toSqlString());
          } else if (stringifyObjects) {
            return escapeString(val.toString());
          } else {
            return SqlString.objectToValues(val, timeZone);
          }
        default: return escapeString(val);
      }
    };

    SqlString.arrayToList = function arrayToList(array, timeZone) {
      var sql = '';

      for (var i = 0; i < array.length; i++) {
        var val = array[i];

        if (Array.isArray(val)) {
          sql += (i === 0 ? '' : ', ') + '(' + SqlString.arrayToList(val, timeZone) + ')';
        } else {
          sql += (i === 0 ? '' : ', ') + SqlString.escape(val, true, timeZone);
        }
      }

      return sql;
    };

    SqlString.format = function format(sql, values, stringifyObjects, timeZone) {
      if (values == null) {
        return sql;
      }

      if (!(values instanceof Array || Array.isArray(values))) {
        values = [values];
      }

      var chunkIndex        = 0;
      var placeholdersRegex = /\?+/g;
      var result            = '';
      var valuesIndex       = 0;
      var match;

      while (valuesIndex < values.length && (match = placeholdersRegex.exec(sql))) {
        var len = match[0].length;

        if (len > 2) {
          continue;
        }

        var value = len === 2
          ? SqlString.escapeId(values[valuesIndex])
          : SqlString.escape(values[valuesIndex], stringifyObjects, timeZone);

        result += sql.slice(chunkIndex, match.index) + value;
        chunkIndex = placeholdersRegex.lastIndex;
        valuesIndex++;
      }

      if (chunkIndex === 0) {
        // Nothing was replaced
        return sql;
      }

      if (chunkIndex < sql.length) {
        return result + sql.slice(chunkIndex);
      }

      return result;
    };

    SqlString.dateToString = function dateToString(date, timeZone) {
      var dt = new Date(date);

      if (isNaN(dt.getTime())) {
        return 'NULL';
      }

      var year;
      var month;
      var day;
      var hour;
      var minute;
      var second;
      var millisecond;

      if (timeZone === 'local') {
        year        = dt.getFullYear();
        month       = dt.getMonth() + 1;
        day         = dt.getDate();
        hour        = dt.getHours();
        minute      = dt.getMinutes();
        second      = dt.getSeconds();
        millisecond = dt.getMilliseconds();
      } else {
        var tz = convertTimezone(timeZone);

        if (tz !== false && tz !== 0) {
          dt.setTime(dt.getTime() + (tz * 60000));
        }

        year       = dt.getUTCFullYear();
        month       = dt.getUTCMonth() + 1;
        day         = dt.getUTCDate();
        hour        = dt.getUTCHours();
        minute      = dt.getUTCMinutes();
        second      = dt.getUTCSeconds();
        millisecond = dt.getUTCMilliseconds();
      }

      // YYYY-MM-DD HH:mm:ss.mmm
      var str = zeroPad(year, 4) + '-' + zeroPad(month, 2) + '-' + zeroPad(day, 2) + ' ' +
        zeroPad(hour, 2) + ':' + zeroPad(minute, 2) + ':' + zeroPad(second, 2) + '.' +
        zeroPad(millisecond, 3);

      return escapeString(str);
    };

    SqlString.bufferToString = function bufferToString(buffer) {
      return 'X' + escapeString(buffer.toString('hex'));
    };

    SqlString.objectToValues = function objectToValues(object, timeZone) {
      var sql = '';

      for (var key in object) {
        var val = object[key];

        if (typeof val === 'function') {
          continue;
        }

        sql += (sql.length === 0 ? '' : ', ') + SqlString.escapeId(key) + ' = ' + SqlString.escape(val, true, timeZone);
      }

      return sql;
    };

    SqlString.raw = function raw(sql) {
      if (typeof sql !== 'string') {
        throw new TypeError('argument sql must be a string');
      }

      return {
        toSqlString: function toSqlString() { return sql; }
      };
    };

    function escapeString(val) {
      var chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex = 0;
      var escapedVal = '';
      var match;

      while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
        escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]];
        chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
      }

      if (chunkIndex === 0) {
        // Nothing was escaped
        return "'" + val + "'";
      }

      if (chunkIndex < val.length) {
        return "'" + escapedVal + val.slice(chunkIndex) + "'";
      }

      return "'" + escapedVal + "'";
    }

    function zeroPad(number, length) {
      number = number.toString();
      while (number.length < length) {
        number = '0' + number;
      }

      return number;
    }

    function convertTimezone(tz) {
      if (tz === 'Z') {
        return 0;
      }

      var m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
      if (m) {
        return (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
      }
      return false;
    }
    });

    var D__Development_Workspace_typeormDataApiDriver_node_modules_sqlstring = SqlString_1;

    /*
     * This module provides a simplified interface into the Aurora Serverless
     * Data API by abstracting away the notion of field values.
     *
     * More detail regarding the Aurora Serverless Data APIcan be found here:
     * https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/data-api.html
     *
     * @author Jeremy Daly <jeremy@jeremydaly.com>
     * @version 1.0.0-beta
     * @license MIT
     */

    // Require the aws-sdk. This is a dev dependency, so if being used
    // outside of a Lambda execution environment, it must be manually installed.


    // Require sqlstring to add additional escaping capabilities


    /**********************************************************************/
    /** Enable HTTP Keep-Alive per https://vimeo.com/287511222          **/
    /** This dramatically increases the speed of subsequent HTTP calls  **/
    /**********************************************************************/

      

      const sslAgent = new https.Agent({
        keepAlive: true,
        maxSockets: 50, // same as aws-sdk
        rejectUnauthorized: true  // same as aws-sdk
      });
      sslAgent.setMaxListeners(0); // same as aws-sdk


    /********************************************************************/
    /**  PRIVATE METHODS                                               **/
    /********************************************************************/

      // Simple error function
      const error = (...err) => { throw Error(...err) };

      // Parse SQL statement from provided arguments
      const parseSQL = args =>
        typeof args[0] === 'string' ? args[0]
        : typeof args[0] === 'object' && typeof args[0].sql === 'string' ? args[0].sql
        : error(`No 'sql' statement provided.`);

      // Parse the parameters from provided arguments
      const parseParams = args =>
        Array.isArray(args[0].parameters) ? args[0].parameters
        : typeof args[0].parameters === 'object' ? [args[0].parameters]
        : Array.isArray(args[1]) ? args[1]
        : typeof args[1] === 'object' ? [args[1]]
        : args[0].parameters ? error(`'parameters' must be an object or array`)
        : args[1] ?  error(`Parameters must be an object or array`)
        : [];

      // Parse the supplied database, or default to config
      const parseDatabase = (config,args) =>
        config.transactionId ? config.database
        : typeof args[0].database === 'string' ? args[0].database
        : args[0].database ? error(`'database' must be a string.`)
        : config.database ? config.database
        : error(`No 'database' provided.`);

      // Parse the supplied hydrateColumnNames command, or default to config
      const parseHydrate = (config,args) =>
        typeof args[0].hydrateColumnNames === 'boolean' ? args[0].hydrateColumnNames
        : args[0].hydrateColumnNames ? error(`'hydrateColumnNames' must be a boolean.`)
        : config.hydrateColumnNames;

      // Prepare method params w/ supplied inputs if an object is passed
      const prepareParams = ({ secretArn,resourceArn },args) => {
        return Object.assign(
          { secretArn,resourceArn }, // return Arns
          typeof args[0] === 'object' ?
            omit(args[0],['hydrateColumnNames','parameters']) : {} // merge any inputs
        )
      };

      // Utility function for removing certain keys from an object
      const omit = (obj,values) => Object.keys(obj).reduce((acc,x) =>
        values.includes(x) ? acc : Object.assign(acc,{ [x]: obj[x] })
      ,{});

      // Utility function for picking certain keys from an object
      const pick = (obj,values) => Object.keys(obj).reduce((acc,x) =>
        values.includes(x) ? Object.assign(acc,{ [x]: obj[x] }) : acc
      ,{});

      // Utility function for flattening arrays
      const flatten = arr => arr.reduce((acc,x) => acc.concat(x),[]);

      // Normize parameters so that they are all in standard format
      const normalizeParams = params => params.reduce((acc,p) =>
        Array.isArray(p) ? acc.concat([normalizeParams(p)])
          : Object.keys(p).length === 2 && p.name && p.value ? acc.concat(p)
          : acc.concat(splitParams(p))
      ,[]); // end reduce


      // Prepare parameters
      const processParams = (sql,sqlParams,params,row=0) => {
        return {
          processedParams: params.reduce((acc,p,i) => {
            if (Array.isArray(p)) {
              let result = processParams(sql,sqlParams,p,row);
              if (row === 0) { sql = result.escapedSql; row++; }
              return acc.concat([result.processedParams])
            } else if (sqlParams[p.name]) {
              if (sqlParams[p.name].type === 'n_ph') {
                acc[sqlParams[p.name].index] = formatParam(p.name,p.value);
              } else if (row === 0) {
                let regex = new RegExp('::' + p.name + '\\b','g');
                sql = sql.replace(regex,D__Development_Workspace_typeormDataApiDriver_node_modules_sqlstring.escapeId(p.value));
              }
              return acc
            } else {
              return acc
            }
          },[]),
          escapedSql: sql
        }
      };

      // Converts parameter to the name/value format
      const formatParam = (n,v) => formatType(n,v,getType(v));

      const splitParams = p => Object.keys(p).reduce((arr,x) =>
        arr.concat({ name: x, value: p[x] }),[]);

      // This appears to be a bug, so hopefully it will go away soon, but named
      // parameters will *not* work if they are out of order! :facepalm:
      const getSqlParams = sql => {
        let p = 0; // position index for named parameters
        // TODO: probably need to remove comments from the sql
        // TODO: placeholders?
        // sql.match(/\:{1,2}\w+|\?+/g).map((p,i) => {
        return (sql.match(/\:{1,2}\w+/g) || []).map((p,i) => {
          return p === '??' ? { type: 'id' } // identifier
            : p === '?' ? { type: 'ph', label: '__d'+i  } // placeholder
            : p.startsWith('::') ? { type: 'n_id', label: p.substr(2) } // named id
            : { type: 'n_ph', label: p.substr(1) } // named placeholder
        }).reduce((acc,x,i) => {
          return Object.assign(acc,
            {
              [x.label]: {
                type: x.type, index: x.type === 'n_ph' ? p++ : undefined
              }
            }
          )
        },{}) // end reduce
      };

      // Gets the value type and returns the correct value field name
      // TODO: Support more types as the are released
      const getType = val =>
        typeof val === 'string' ? 'stringValue'
        : typeof val === 'boolean' ? 'booleanValue'
        : typeof val === 'number' && parseInt(val) === val ? 'longValue'
        : typeof val === 'number' && parseFloat(val) === val ? 'doubleValue'
        : val === null ? 'isNull'
        : Buffer.isBuffer(val) ? 'blobValue'
        // : Array.isArray(val) ? 'arrayValue' This doesn't work yet
        : undefined;

      // Creates a standard Data API parameter using the supplied inputs
      const formatType = (name,value,type) => {
        return {
          name,
          value: {
            [type ? type : error(`'${name}'' is an invalid type`)] :
              type === 'isNull' ? true : value
          }
        }
      }; // end formatType

      // Formats the results of a query response
      // TODO: Support generatedFields (use case insertId)
      const formatResults = (
        { // destructure results
          columnMetadata, // ONLY when hydrate or includeResultMetadata is true
          numberOfRecordsUpdated, // ONLY for executeStatement method
          records, // ONLY for executeStatement method
          generatedFields, // ONLY for INSERTS
          updateResults // ONLY on batchExecuteStatement
        },
        hydrate,
        includeMeta
      ) =>
        Object.assign(
          includeMeta ? { columnMetadata } : {},
          numberOfRecordsUpdated !== undefined ? { numberOfRecordsUpdated } : {},
          records ? {
            records: formatRecords(records, hydrate ? columnMetadata : false)
          } : {},
          updateResults ? { updateResults: formatUpdateResults(updateResults) } : {},
          generatedFields && generatedFields.length > 0 ?
            { insertId: generatedFields[0].longValue } : {}
        );

      // Processes records and either extracts Typed Values into an array, or
      // object with named column labels
      const formatRecords = (recs,columns) => {

        // Create map for efficient value parsing
        let fmap = recs && recs[0] ? recs[0].map((x,i) => {
          return Object.assign({},
            columns ? { label: columns[i].label } : {} ) // add column labels
        }) : {};

        // Map over all the records (rows)
        return recs ? recs.map(rec => {

          // Reduce each field in the record (row)
          return rec.reduce((acc,field,i) => {

            // If the field is null, always return null
            if (field.isNull === true) {
              return columns ? // object if hydrate, else array
                Object.assign(acc,{ [fmap[i].label]: null })
                : acc.concat(null)

            // If the field is mapped, return the mapped field
            } else if (fmap[i] && fmap[i].field) {
              return columns ? // object if hydrate, else array
                Object.assign(acc,{ [fmap[i].label]: field[fmap[i].field] })
                : acc.concat(field[fmap[i].field])

            // Else discover the field type
            } else {

              // Look for non-null fields
              Object.keys(field).map(type => {
                if (type !== 'isNull' && field[type] !== null) {
                  fmap[i]['field'] = type;
                }
              });

              // Return the mapped field (this should NEVER be null)
              return columns ? // object if hydrate, else array
                Object.assign(acc,{ [fmap[i].label]: field[fmap[i].field] })
                : acc.concat(field[fmap[i].field])
            }

          }, columns ? {} : []) // init object if hydrate, else init array
        }) : [] // empty record set returns an array
      }; // end formatRecords

      // Format updateResults and extract insertIds
      const formatUpdateResults = res => res.map(x => {
        return x.generatedFields && x.generatedFields.length > 0 ?
          { insertId: x.generatedFields[0].longValue } : {}
      });


      // Merge configuration data with supplied arguments
      const mergeConfig = ({secretArn,resourceArn,database},args) =>
        Object.assign({secretArn,resourceArn,database},args);



    /********************************************************************/
    /**  QUERY MANAGEMENT                                              **/
    /********************************************************************/

      // Query function (use standard form for `this` context)
      const query = async function(config,..._args) {

        // Flatten passed in args to single depth array
        const args = flatten(_args);

        // Parse and process sql
        const sql = parseSQL(args);
        const sqlParams = getSqlParams(sql);

        // Parse hydration setting
        const hydrateColumnNames = parseHydrate(config,args);

        // Parse and normalize parameters
        const parameters = normalizeParams(parseParams(args));

        // Process parameters and escape necessary SQL
        const { processedParams,escapedSql } = processParams(sql,sqlParams,parameters);

        // Determine if this is a batch request
        const isBatch = processedParams.length > 0
          && Array.isArray(processedParams[0]) ? true : false;

        const params = Object.assign(
          prepareParams(config,args),
          {
            database: parseDatabase(config,args), // add database
            sql: escapedSql // add escaped sql statement
          },
          // Only include parameters if they exist
          processedParams.length > 0 ?
            // Batch statements require parameterSets instead of parameters
            { [isBatch ? 'parameterSets' : 'parameters']: processedParams } : {},
          // Force meta data if set and not a batch
          hydrateColumnNames && !isBatch ? { includeResultMetadata: true } : {},
          // If a transactionId is passed, overwrite any manual input
          config.transactionId ? { transactionId: config.transactionId } : {}
        ); // end params

        try { // attempt to run the query

          // Capture the result for debugging
          let result = await (isBatch ? config.RDS.batchExecuteStatement(params).promise()
            : config.RDS.executeStatement(params).promise());

          // console.log(result)

          // Format and return the results
          return formatResults(
            result,
            hydrateColumnNames,
            args[0].includeResultMetadata === true ? true : false
          )

        } catch(e) {

          if (this && this.rollback) {
            let rollback = await config.RDS.rollbackTransaction(
              pick(params,['resourceArn','secretArn','transactionId'])
            ).promise();

            this.rollback(e,rollback);
          }
          // Throw the error
          throw e
        }

      }; // end query



    /********************************************************************/
    /**  TRANSACTION MANAGEMENT                                        **/
    /********************************************************************/

      // Init a transaction object and return methods
      const transaction = (config,_args) => {

        let args = typeof _args === 'object' ? [_args] : [{}];
        let queries = []; // keep track of queries
        let rollback = () => {}; // default rollback event

        const txConfig = Object.assign(
          prepareParams(config,args),
          {
            database: parseDatabase(config,args), // add database
            hydrateColumnNames: parseHydrate(config,args), // add hydrate
            RDS: config.RDS // reference the RDSDataService instance
          }
        );

        return {
          query: function(...args) {
            if (typeof args[0] === 'function') {
              queries.push(args[0]);
            } else {
              queries.push(() => [...args]);
            }
            return this
          },
          rollback: function(fn) {
            if (typeof fn === 'function') { rollback = fn; }
            return this
          },
          commit: async function() { return await commit(txConfig,queries,rollback) }
        }
      };

      // Commit transaction by running queries
      const commit = async (config,queries,rollback) => {

        let results = []; // keep track of results

        // Start a transaction
        const { transactionId } = await config.RDS.beginTransaction(
          pick(config,['resourceArn','secretArn','database'])
        ).promise();

        // Add transactionId to the config
        let txConfig = Object.assign(config, { transactionId });

        // Loop through queries
        for (let i = 0; i < queries.length; i++) {
          // Execute the queries, pass the rollback as context
          let result = await query.apply({rollback},[config,queries[i](results[results.length-1],results)]);
          // Add the result to the main results accumulator
          results.push(result);
        }

        // Commit our transaction
        const { transactionStatus } = await txConfig.RDS.commitTransaction(
          pick(config,['resourceArn','secretArn','transactionId'])
        ).promise();

        // Add the transaction status to the results
        results.push({transactionStatus});

        // Return the results
        return results
      };

    /********************************************************************/
    /**  INSTANTIATION                                                 **/
    /********************************************************************/

    // Export main function
    var D__Development_Workspace_typeormDataApiDriver_node_modules_dataApiClient = (params) => {

      // Set the options for the RDSDataService
      const options = typeof params.options === 'object' ? params.options
        : params.options !== undefined ? error(`'options' must be an object`)
        : {};

      // Update the default AWS http agent with our new sslAgent
      if (typeof params.keepAlive !== false) {
        awsSdk.config.update({ httpOptions: { agent: sslAgent } });
      }

      // Set the configuration for this instance
      const config = {

        // Require secretArn
        secretArn: typeof params.secretArn === 'string' ? params.secretArn
          : error(`'secretArn' string value required`),

        // Require resourceArn
        resourceArn: typeof params.resourceArn === 'string' ? params.resourceArn
         : error(`'resourceArn' string value required`),

        // Load optional database
        database: typeof params.database === 'string' ? params.database
          : params.database !== undefined ? error(`'database' must be a string`)
          : undefined,

        // Load optional schema DISABLED for now since this isn't used with MySQL
        // schema: typeof params.schema === 'string' ? params.schema
        //   : params.schema !== undefined ? error(`'schema' must be a string`)
        //   : undefined,

        // Set hydrateColumnNames (default to true)
        hydrateColumnNames:
          typeof params.hydrateColumnNames === 'boolean' ?
            params.hydrateColumnNames : true,

        // TODO: Put this in a separate module for testing?
        // Create an instance of RDSDataService
        RDS: new awsSdk.RDSDataService(options)

      }; // end config

      // Return public methods
      return {
        // Query method, pass config and parameters
        query: (...x) => query(config,...x),
        // Transaction method, pass config and parameters
        transaction: (x) => transaction(config,x),

        // Export promisified versions of the RDSDataService methods
        batchExecuteStatement: (args) =>
          config.RDS.batchExecuteStatement(
            mergeConfig(pick(config,['resourceArn','secretArn','database']),args)
          ).promise(),
        beginTransaction: (args) =>
          config.RDS.beginTransaction(
            mergeConfig(pick(config,['resourceArn','secretArn','database']),args)
          ).promise(),
        commitTransaction: (args) =>
          config.RDS.commitTransaction(
            mergeConfig(pick(config,['resourceArn','secretArn']),args)
          ).promise(),
        executeStatement: (args) =>
          config.RDS.executeStatement(
            mergeConfig(pick(config,['resourceArn','secretArn','database']),args)
          ).promise(),
        rollbackTransaction: (args) =>
          config.RDS.rollbackTransaction(
            mergeConfig(pick(config,['resourceArn','secretArn']),args)
          ).promise()
      }

    }; // end exports

    var DataApiDriver = /** @class */ (function () {
        function DataApiDriver(region, secretArn, resourceArn, database, loggerFn) {
            this.transaction = null;
            this.region = region;
            this.secretArn = secretArn;
            this.resourceArn = resourceArn;
            this.database = database;
            this.client = D__Development_Workspace_typeormDataApiDriver_node_modules_dataApiClient({
                secretArn: secretArn,
                resourceArn: resourceArn,
                database: database,
                options: {
                    region: region
                }
            });
            this.loggerFn = loggerFn;
        }
        DataApiDriver.transformQueryAndParameters = function (query, parameters) {
            var queryParamRegex = /\?(?=(([^(")\\]*(\\.|"([^"\\]*\\.)*[^"\\]*"))*[^"]*$))(?=(([^(')\\]*(\\.|'([^'\\]*\\.)*[^'\\]*'))*[^']*$))/g;
            var numberOfParametersInQueryString = 0;
            var newQueryString = query.replace(queryParamRegex, function () {
                var paramName = "param_" + numberOfParametersInQueryString;
                numberOfParametersInQueryString += 1;
                return ":" + paramName;
            });
            if (parameters &&
                parameters.length > 0 &&
                parameters.length % numberOfParametersInQueryString !== 0) {
                throw new Error("Number of parameters mismatch, got " + numberOfParametersInQueryString + " in query string             and " + parameters.length + " in input");
            }
            var transformedParameters = [];
            if (parameters && parameters.length > 0) {
                var numberOfObjects = parameters.length / numberOfParametersInQueryString;
                for (var i = 0; i < numberOfObjects; i += 1) {
                    var parameterObject = {};
                    for (var y = 0; y < numberOfParametersInQueryString; y += 1) {
                        var paramName = "param_" + y;
                        parameterObject[paramName] = parameters[i + y];
                    }
                    transformedParameters.push(parameterObject);
                }
            }
            return {
                queryString: newQueryString,
                parameters: transformedParameters
            };
        };
        DataApiDriver.prototype.query = function (query, parameters) {
            return __awaiter(this, void 0, void 0, function () {
                var transformedQueryData, clientOrTransaction, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            transformedQueryData = DataApiDriver.transformQueryAndParameters(query, parameters);
                            if (this.loggerFn) {
                                this.loggerFn(transformedQueryData.queryString, transformedQueryData.parameters);
                            }
                            clientOrTransaction = this.transaction || this.client;
                            return [4 /*yield*/, clientOrTransaction.query(transformedQueryData.queryString, transformedQueryData.parameters)];
                        case 1:
                            result = _a.sent();
                            if (result.records) {
                                return [2 /*return*/, result.records];
                            }
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        DataApiDriver.prototype.startTransaction = function () {
            if (this.transaction) {
                throw new Error('Transaction already started');
            }
            this.transaction = this.client.transaction();
        };
        DataApiDriver.prototype.commitTransaction = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.transaction) {
                                throw new Error("Transaction doesn't exist");
                            }
                            return [4 /*yield*/, this.transaction.commit()];
                        case 1:
                            _a.sent();
                            this.transaction = null;
                            return [2 /*return*/];
                    }
                });
            });
        };
        DataApiDriver.prototype.rollbackTransaction = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.transaction) {
                                throw new Error("Transaction doesn't exist");
                            }
                            return [4 /*yield*/, this.transaction.rollback()];
                        case 1:
                            _a.sent();
                            this.transaction = null;
                            return [2 /*return*/];
                    }
                });
            });
        };
        return DataApiDriver;
    }());

    return DataApiDriver;

})));
//# sourceMappingURL=typeorm-aurora-data-api-driver.umd.js.map
