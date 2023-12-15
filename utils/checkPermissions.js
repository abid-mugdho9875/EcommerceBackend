"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const checkPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === "admin")
        return;
    if (requestUser._id.toString() === resourceUserId)
        return;
    throw new errors_1.UnauthorizedError("Not authorized to access this route");
};
