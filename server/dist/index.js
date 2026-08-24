"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express")); //express framework
const cors_1 = __importDefault(require("cors")); //cors to allow frontend to talk to backend
const helmet_1 = __importDefault(require("helmet")); //adds security headers to every response
const cookie_parser_1 = __importDefault(require("cookie-parser")); //allows reading cookies from incomming requests
const morgan_1 = __importDefault(require("morgan"));
//Routers
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const vocabulary_1 = __importDefault(require("./routes/vocabulary"));
const quiz_1 = __importDefault(require("./routes/quiz"));
const documents_1 = __importDefault(require("./routes/documents"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1); //tells express to trust first proxy infront of it
//middleware
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL, credentials: true })); // tells express which frontend URL is allowed to make requests // credentials: true is required so cookies get sent with requests
app.use((0, helmet_1.default)({ contentSecurityPolicy: false })); // contentSecurityPolicy is turned off because it breaks things in development
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
//Routing
app.use('/auth', auth_1.default);
app.use('/chat', chat_1.default);
app.use('/vocabulary', vocabulary_1.default);
app.use('/documents', documents_1.default);
app.use('/quiz', quiz_1.default);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=index.js.map