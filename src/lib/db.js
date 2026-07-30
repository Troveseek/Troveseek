"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var adapter_libsql_1 = require("@prisma/adapter-libsql");
var client_1 = require("@prisma/client");
function createPrismaClient() {
    var envUrl = process.env.DATABASE_URL;
    var dbUrl = (!envUrl || envUrl === 'undefined') ? 'file:./dev.db' : envUrl;
    var adapter = new adapter_libsql_1.PrismaLibSql({ url: dbUrl });
    return new client_1.PrismaClient({ adapter: adapter });
}
var db = (_a = globalThis.prismaGlobal) !== null && _a !== void 0 ? _a : createPrismaClient();
exports.default = db;
if (process.env.NODE_ENV !== 'production')
    globalThis.prismaGlobal = db;
