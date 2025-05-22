const express = require("express");
const { connectFacebook, facebookCallback, listAccounts,   deleteAccount } = require("../controllers/social.controller");

const router = express.Router();

/**
 * @route GET /api/social/connect/facebook
 * @desc Initiates Facebook login flow
 */
router.get("/connect/facebook", connectFacebook);

/**
 * @route GET /api/social/callback/facebook
 * @desc Handles Facebook OAuth redirect
 */
router.get("/callback/facebook", facebookCallback);

/**
 * @route GET /api/social/accounts
 * @desc Lists all connected accounts (requires token)
 */
router.get("/accounts", listAccounts);

router.delete("/accounts/:id", deleteAccount); // ✅ DELETE route


module.exports = router;