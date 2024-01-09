"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpOrS = exports.resolveDocs = exports.resolveServing = exports.resolveAPI = exports.status = exports.embeds = exports.generate_code = exports.dbs = void 0;
const env_1 = __importDefault(require("./utils/env"));
function generate_code(i = 32) {
    const alp = "abcdefghijklmopqrstuvwxyz0123456789";
    return new Array(i)
        .fill(undefined)
        .map(() => alp[Math.round(Math.random() * alp.length)])
        .join("");
}
exports.generate_code = generate_code;
const dbs = (db) => {
    const insertCode = db.prepare("INSERT INTO Codes (Code, Port) VALUES (@code, @port)");
    const getPort = db.prepare("SELECT Port FROM Codes WHERE Code=?");
    const deleteCode = db.prepare("DELETE FROM Codes WHERE Code=?");
    const getAllCode = db.prepare("SELECT Code FROM Codes");
    const insertToken = db.prepare("INSERT INTO Tokens (Code, Ip) VALUES (@code, @ip)");
    const getCodeToken = db.prepare("SELECT Id FROM Tokens WHERE Code=?");
    const deleteToken = db.prepare("DELETE FROM Tokens WHERE Code=?");
    return {
        insertCode,
        getPort,
        deleteCode,
        insertToken,
        getCodeToken,
        deleteToken,
        getAllCode,
    };
};
exports.dbs = dbs;
const baseOptions = (embed) => ({
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        embeds: [embed],
    }),
});
const Colors = {
    YELLOW: 16776960,
    GREEN: 65280,
    RED: 16711680,
};
const embeds = {
    tokenCreate: ({ newToken, ip }) => baseOptions({
        title: "New verification token as been created",
        color: Colors.YELLOW,
        description: `\`${newToken}\` by \`${ip}\``,
    }),
    tokenVerify: ({ newToken, ip }) => baseOptions({
        title: "New token as been added",
        color: Colors.GREEN,
        description: `\`${newToken}\` by \`${ip}\``,
    }),
    codeCreate: ({ code, port, ip, }) => baseOptions({
        title: "New code as been added",
        color: Colors.GREEN,
        description: `\`${code}\` at port \`${port}\` by \`${ip}\``,
    }),
    codeDelete: ({ code, port, ip, }) => baseOptions({
        title: "New code as been added",
        color: Colors.RED,
        description: `\`${code}\` at port \`${port}\` by \`${ip}\``,
    }),
};
exports.embeds = embeds;
const docs = (url) => ({
    docs: {
        url: resolveDocs(url),
        message: "Link to the documentation for more precision",
    },
});
const ownStatusGenerator = () => {
    let i = -1;
    return ({ type, message, ...args }) => {
        // I don't want to make the possibility to see what is in the args
        i++;
        return {
            [type]: {
                code: 2400 + i,
                type,
                message,
                kind: type.includes("Exception") ? "Error" : "OK",
                ...args,
                ...docs(`/status/${type}`),
            },
        }; // Horrible system
    };
};
const ownStatus = ownStatusGenerator();
const status = {
    NotFoundException: {
        code: 404,
        type: "NotFoundException",
        message: "Page not found",
    },
    UnauthorizeException: {
        code: 401,
        type: "UnauthorizeException",
        message: "Unauthorize, you need to login",
        ...docs("/status/UnauthorizedException"),
    },
    ...ownStatus({
        type: "GenericResponse",
        message: "Null based response",
    }),
    ...ownStatus({
        type: "BadTokenException",
        message: "A bad token has been provided",
    }),
    ...ownStatus({
        type: "MissingPortException",
        message: "No port was provided",
    }),
    ...ownStatus({
        type: "MissingTokenException",
        message: "No token was provided",
    }),
    ...ownStatus({
        type: "MissingTokenVerifyException",
        message: "No token was provided for verifying the account",
    }),
    ...ownStatus({
        type: "BadTokenVerifyException",
        message: "A bad token has been provided for verifying the account",
    }),
    ...ownStatus({
        type: "MissingCodeException",
        message: "No code was provided",
    }),
    ...ownStatus({
        type: "CodeNotFoundException",
        message: "This code is expired or doesn't exist",
    }),
    ...ownStatus({
        type: "VerifyTokenCreated",
        message: "A new token has been send to the webhook",
    }),
    ...ownStatus({
        type: "VerifyTokenAccepted",
        message: "A new token has been created for you",
        token: "placeholder",
    }),
    ...ownStatus({
        type: "CodeCreated",
        message: "A new code has been created for you",
        code: "placeholder",
        url: "placeholder",
    }),
    ...ownStatus({
        type: "ListGiven",
        message: "The list of codes",
        codes: "placeholder",
    }),
    ...ownStatus({
        type: "CodeDeleted",
        message: "The code has been deleted",
    }),
};
exports.status = status;
function httpOrS() {
    return env_1.default.https;
}
exports.httpOrS = httpOrS;
function goodPortOrNot() {
    if (httpOrS()) {
        return env_1.default.portHttps === 443;
    }
    return env_1.default.portHttp === 80;
}
function resolveWithSubdomain(sub, path = "") {
    const type = httpOrS() ? "https" : "http";
    return `${type}://${sub}.${env_1.default.host}${goodPortOrNot() ? "" : `:${httpOrS() ? env_1.default.portHttps : env_1.default.portHttp}`}${path}`;
}
const resolveServing = (code) => resolveWithSubdomain(`${code}.${env_1.default.subdomainServ}`);
exports.resolveServing = resolveServing;
const resolveAPI = () => resolveWithSubdomain(env_1.default.subdomainAPI);
exports.resolveAPI = resolveAPI;
function resolveDocs(path) {
    return resolveWithSubdomain(env_1.default.subdomainDocs, path);
}
exports.resolveDocs = resolveDocs;
