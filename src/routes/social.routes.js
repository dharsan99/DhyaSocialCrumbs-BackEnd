const express = require("express");
const {
  listAccounts,
  deleteAccount,
  fetchPublicInfo, // ✅ New controller
} = require("../controllers/social.controller");

const router = express.Router();

/**
 * @route GET /api/social/accounts
 * @desc Lists all connected accounts (requires token)
 */
router.get("/accounts", listAccounts);

/**
 * @route DELETE /api/social/accounts/:id
 * @desc Deletes a connected social account
 */
router.delete("/accounts/:id", deleteAccount);

/**
 * @route GET /api/social/fetchPublicInfo?platform=instagram&handle=cristiano
 * @desc Fetches public profile info using RapidAPI
 */
router.get("/fetchPublicInfo", fetchPublicInfo); // ✅ NEW

module.exports = router;