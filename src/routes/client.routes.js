const express = require("express");
const router = express.Router();
const {
  createClient,
  listClients,
  updateClient,
  startOnboarding,
  updateClientSetting,
  createFullClient, // ✅ New
} = require("../controllers/client.controller");

router.post("/", createClient);
router.post("/full", createFullClient); // ✅ New route
router.get("/", listClients);
router.put("/:id", updateClient);
router.patch("/:id/settings", updateClientSetting);
router.post("/:id/start-onboarding", startOnboarding);

module.exports = router;