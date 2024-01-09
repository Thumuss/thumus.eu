"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/err", (req, res) => {
    res.render("err");
});
module.exports = router;
