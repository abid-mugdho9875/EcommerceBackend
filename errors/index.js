"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.UnauthenticatedError = exports.NotFoundError = exports.CustomAPIError = exports.BadRequestError = void 0;
const BadRequest_1 = __importDefault(require("./BadRequest"));
exports.BadRequestError = BadRequest_1.default;
const CustomApiError_1 = __importDefault(require("./CustomApiError"));
exports.CustomAPIError = CustomApiError_1.default;
const NotFound_1 = __importDefault(require("./NotFound"));
exports.NotFoundError = NotFound_1.default;
const Unauthenticated_1 = __importDefault(require("./Unauthenticated"));
exports.UnauthenticatedError = Unauthenticated_1.default;
const Unauthorized_1 = __importDefault(require("./Unauthorized"));
exports.UnauthorizedError = Unauthorized_1.default;
