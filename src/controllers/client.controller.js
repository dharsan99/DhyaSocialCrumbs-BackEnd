const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new client
exports.createClient = async (req, res) => {
  const { name, category } = req.body;
  try {
    const client = await prisma.client.create({
      data: { name, category },
    });
    return res.json(client);
  } catch (err) {
    console.error("❌ [createClient]", err.message);
    return res.status(500).json({ error: "Failed to create client" });
  }
};

// List all clients
exports.listClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(clients);
  } catch (err) {
    console.error("❌ [listClients]", err.message);
    return res.status(500).json({ error: "Failed to list clients" });
  }
};

// Update client preferences/settings
exports.updateClientSetting = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const updated = await prisma.client.update({
      where: { id },
      data: updates,
    });
    return res.json(updated);
  } catch (err) {
    console.error("❌ [updateClientSetting]", err.message);
    return res.status(500).json({ error: "Failed to update client settings" });
  }
};

// Start onboarding (mock)
exports.startOnboarding = async (req, res) => {
  const { id } = req.params;
  try {
    // In reality, this could do a lot more
    await prisma.client.update({
      where: { id },
      data: { notes: "Onboarding started at " + new Date().toISOString() },
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ [startOnboarding]", err.message);
    return res.status(500).json({ error: "Failed to start onboarding" });
  }
};