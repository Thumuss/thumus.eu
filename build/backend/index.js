"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies in node
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
// Setup env
const env_1 = __importDefault(require("./utils/env"));
// Express dependencies
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const vhost_1 = __importDefault(require("vhost"));
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
// DB
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const db = (0, better_sqlite3_1.default)("./dist/db/database.db");
db.pragma("journal_mode = WAL");
const utils_1 = require("./utils");
// Api
const codes = (0, utils_1.dbs)(db);
const api_js_1 = __importDefault(require("./routes/api.js"));
const api = (0, api_js_1.default)(codes);
// Apps
const http_app = (0, express_1.default)();
const https_app = (0, utils_1.httpOrS)() ? (0, express_1.default)() : http_app;
// Config
https_app.set("view engine", "ejs");
https_app.use((0, cors_1.default)());
const staticOptions = {
    dotfiles: "ignore",
    extensions: ["html"],
    index: true,
    lastModified: false,
};
// Redirect all http req to https
if (env_1.default.redirectHttp)
    http_app.get("*", (req, res) => {
        res.redirect("https://" + req.headers.host + req.url);
    });
// Setup api
https_app.use((0, vhost_1.default)(`api.${env_1.default.host}`, api));
/*
Hardcode code
Redirection to the subdomain link to the port
*/
https_app.use((0, vhost_1.default)(`*.serv.${env_1.default.host}`, (0, express_http_proxy_1.default)((req) => {
    if (!req.headers.host)
        req.headers.host = "";
    const code = req.headers.host.split(".serv").slice(0, -1).join(".");
    const codeFromDb = codes.getPort.get(code);
    return codeFromDb?.Port // If it exists
        ? "http://127.0.0.1:" + codeFromDb?.Port?.split(".")[0] // then proxy that local port
        : `https://${env_1.default.host}/404`; // else redirection to an error
}, {
    memoizeHost: false,
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        //todo: create a better reqOptDeco
        const headers = proxyReqOpts?.headers || {};
        headers["cookie"] = srcReq?.headers?.["cookie"] ? srcReq?.headers?.["cookie"] : "";
        headers["origin_ip"] = srcReq?.headers?.origin_ip || srcReq?.ip;
        proxyReqOpts.headers = headers;
        return proxyReqOpts;
    },
    preserveHostHdr: true, // prevents redirection to a domain (alias google thank you so much for that fcking redirection to your website)
})));
https_app.use((0, vhost_1.default)(`${env_1.default.subdomainDocs}.${env_1.default.host}`, express_1.default.static("docs", { extensions: ["html"] })));
/*
https_app.use(
  vhost(`*.${env.host}`, (req, res) => {
    // If we don't recognise the subdomain
    res.redirect(`https://${env.host}` + req.url); // redirect to the main page
  })
);*/
const router = express_1.default.Router();
router.use(function (req, res, next) {
    const name = req.vhost[0];
    if (!name)
        next();
    req.originalUrl = req.url;
    req.url = `/static/${name}/${req.url}`;
    next();
});
router.use(express_1.default.static("../frontend/extern", staticOptions));
https_app.use((0, vhost_1.default)(`*.${env_1.default.host}`, router));
https_app.use(express_1.default.static("../frontend/build", staticOptions)); // Main page
http_1.default.createServer(http_app).listen(env_1.default.portHttp, env_1.default.ip); // For machine w multiple ips
if ((0, utils_1.httpOrS)())
    https_1.default
        .createServer({
        cert: fs_1.default.readFileSync(env_1.default.cert), // self signed cert is !fine
        key: fs_1.default.readFileSync(env_1.default.key),
    }, https_app)
        .listen(env_1.default.portHttps, env_1.default.ip);
