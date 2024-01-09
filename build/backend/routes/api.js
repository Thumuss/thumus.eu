"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __importDefault(require("../utils/env"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_1 = __importDefault(require("express"));
const utils_1 = require("../utils");
const tempTokens = {};
const api = (database) => {
    const limit = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000 * 4, // 1h
        max: 20,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
    const router = express_1.default.Router();
    router.use(limit);
    router.use(express_1.default.json());
    router.post("/token/create", async (req, res) => {
        if (!req.ip)
            return;
        const newToken = (0, utils_1.generate_code)(256);
        await fetch(env_1.default.webhook, utils_1.embeds.tokenCreate({ newToken, ip: req.ip }));
        tempTokens[req.ip] = newToken;
        setTimeout(() => {
            if (!req.ip)
                return;
            delete tempTokens[req.ip];
        }, 1000 * 60 * 15);
        res.status(200).json(utils_1.status.VerifyTokenCreated);
    });
    router.post("/token/verify", async (req, res) => {
        if (!req.body.token)
            return res.status(400).json(utils_1.status.MissingTokenVerifyException);
        if (!req.ip)
            return;
        const index = tempTokens[req.ip] && tempTokens[req.ip] === req.body.token;
        if (!index)
            return res.status(400).json(utils_1.status.BadTokenVerifyException);
        const newToken = (0, utils_1.generate_code)(256);
        database.insertToken.run({ code: newToken, ip: req.ip });
        delete tempTokens[req.ip];
        await fetch(env_1.default.webhook, utils_1.embeds.tokenVerify({ newToken, ip: req.ip }));
        res.status(200).json({ ...utils_1.status.VerifyTokenAccepted, token: newToken });
    });
    router.use(function (req, res, next) {
        const isAToken = database.getCodeToken.get(req.body.token);
        if (!isAToken) {
            return res.status(400).json(utils_1.status.BadTokenException);
        }
        next();
    });
    router.post("/code/create", async (req, res) => {
        if (!req.body?.port)
            return res.status(400).json(utils_1.status.MissingPortException);
        if (!req.body?.code || req.body?.code === "random")
            req.body.code = (0, utils_1.generate_code)();
        database.insertCode.run({ code: req.body.code, port: req.body.port });
        res.status(200).json({
            ...utils_1.status.CodeCreated,
            code: req.body.code,
            url: (0, utils_1.resolveServing)(req.body.code),
        });
        await fetch(env_1.default.webhook, utils_1.embeds.codeCreate({
            code: req.body.code,
            port: req.body.port,
            ip: req.ip || "none",
        }));
    });
    router.post("/code/list", (req, res) => {
        res.status(200).json({
            ...utils_1.status.ListGiven,
            codes: database.getAllCode.all().map((a) => a.Code),
        });
    });
    router.post("/code/delete", async (req, res) => {
        if (!req.body?.code) {
            return res.status(400).json(utils_1.status.MissingCodeException);
        }
        const port = database.getPort.get(req.body.code);
        if (!port)
            return res.status(400).json(utils_1.status.CodeNotFoundException);
        await fetch(env_1.default.webhook, utils_1.embeds.codeDelete({
            code: req.body.code,
            port: port.Port.split(".")[0],
            ip: req.ip || "none",
        }));
        database.deleteCode.run(req.body.code);
        res.status(200).json(utils_1.status.CodeDeleted);
    });
    return router;
};
exports.default = api;
