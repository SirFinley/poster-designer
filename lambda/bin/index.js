"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const claudia_api_builder_1 = __importDefault(require("claudia-api-builder"));
const api = new claudia_api_builder_1.default();
api.get('/', () => 'Hello world');
module.exports = api;
