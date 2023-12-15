"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
// import fileUpload from "express-fileupload";
const morgan_1 = __importDefault(require("morgan"));
const connect_1 = __importDefault(require("./db/connect"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const OrderRoutes_1 = __importDefault(require("./routes/OrderRoutes"));
const ProductRoutes_1 = __importDefault(require("./routes/ProductRoutes"));
const ReviewRoutes_1 = __importDefault(require("./routes/ReviewRoutes"));
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
const ErrorHandler_1 = __importDefault(require("./middleware/ErrorHandler"));
const NotFound_1 = __importDefault(require("./middleware/NotFound"));
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("tiny"));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)(process.env.JWT_SECRET));
app.use(express_1.default.static("./public"));
// app.use(fileUpload());
app.get("/", (req, res) => {
    res.send("ecommerce");
});
app.use("/api/v1/auth", AuthRoutes_1.default);
app.use("/api/v1/users", UserRoutes_1.default);
app.use("/api/v1/products", ProductRoutes_1.default);
app.use("/api/v1/reviews", ReviewRoutes_1.default);
app.use("/api/v1/orders", OrderRoutes_1.default);
app.use(NotFound_1.default);
app.use(ErrorHandler_1.default);
const port = process.env.PORT || 3000;
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, connect_1.default)(process.env.MONGO_URI);
        app.listen(port, () => console.log(`Server is listening on port ${port}...`));
    }
    catch (error) {
        console.error(error);
    }
});
start();
