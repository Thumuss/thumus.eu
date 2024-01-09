"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const zod_1 = __importDefault(require("zod"));
const port = zod_1.default.number().int().nonnegative().lte(65535);
const zobj = zod_1.default
    .object({
    cert: zod_1.default.string().min(1).optional(),
    key: zod_1.default.string().min(1).optional(),
    webhook: zod_1.default.string().url(),
    host: zod_1.default.string().min(1).default("localhost"),
    ip: zod_1.default.string().ip({ version: "v4" }).optional(),
    subdomainServ: zod_1.default.string().min(1).default("serv"),
    subdomainAPI: zod_1.default.string().min(1).default("api"),
    subdomainDocs: zod_1.default.string().min(1).default("docs"),
    https: zod_1.default.boolean().default(true),
    http: zod_1.default.boolean().default(true),
    portHttp: port.optional().default(80),
    portHttps: port.optional().default(443),
    redirectHttp: zod_1.default.boolean().default(true),
})
    .superRefine((data, ctx) => {
    if (data.https && (!data.cert || !data.key))
        ctx.addIssue({
            code: zod_1.default.ZodIssueCode.custom,
            message: "If you use https, you need to set cert and key, two path to your cert.pem and key.pem ",
        });
});
function parseEnv() {
    const keys = Object.keys(zobj._def.schema.shape);
    return keys
        .map((a) => {
        const obj = process.env[a];
        if (!obj) {
            return undefined;
        }
        if (obj === "true" || obj === "false") {
            return { [a]: obj === "true" };
        }
        else if (!isNaN(parseInt(obj)) && !obj.includes(".")) {
            return { [a]: parseInt(obj) };
        }
        return { [a]: obj };
    })
        .filter((a) => typeof a !== "undefined")
        .reduce((a, b) => ({ ...a, ...b }), {});
}
const parsed = zobj.safeParse(parseEnv());
if (!parsed.success) {
    console.log(parsed.error);
    throw Error(parsed.error.errors.join("\n"));
}
exports.default = parsed.data;
