"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
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
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var data_api_client_1 = require("data-api-client");
var DataApiDriver = /** @class */ (function () {
    function DataApiDriver(region, secretArn, resourceArn, database, loggerFn) {
        this.transaction = null;
        this.region = region;
        this.secretArn = secretArn;
        this.resourceArn = resourceArn;
        this.database = database;
        this.client = data_api_client_1.default({
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
exports.default = DataApiDriver;
//# sourceMappingURL=typeorm-aurora-data-api-driver.js.map