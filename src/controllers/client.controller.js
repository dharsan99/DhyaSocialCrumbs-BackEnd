const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const slugify = (name) => name.toLowerCase().replace(/\s+/g, '-');

exports.createClient = async (req, res) => {
 const {
  name,
  category,
  slug,
  description,
  email,
  phone,
  website,
  logoUrl,
  platformHandles,
  subscription,
  brand,
  accessPermissions
} = req.body;
  try {
    const client = await prisma.client.create({
  data: {
    name,
    category,
    slug,
    description,
    email,
    phone,
    website,
    logoUrl,
    platformHandles: platformHandles ? JSON.stringify(platformHandles) : undefined,
    subscription: subscription ? JSON.stringify(subscription) : undefined,
    brand: brand ? JSON.stringify(brand) : undefined,
    accessPermissions: accessPermissions ? JSON.stringify(accessPermissions) : undefined
  }
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
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Client not found" });

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...updates,
        brand: {
          ...existing.brand,
          ...updates.brand,
        },
        preferences: {
          ...existing.preferences,
          ...updates.preferences,
        },
        accessPermissions: {
          ...existing.accessPermissions,
          ...updates.accessPermissions,
        },
        documents: updates.documents ?? existing.documents,
        requirements: updates.requirements ?? existing.requirements,
        assets: updates.assets ?? existing.assets,
      },
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
// PUT /clients/:id — Replace full client
exports.updateClient = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  try {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Client not found" });

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...payload,
        brand: payload.brand ?? {},
        preferences: payload.preferences ?? {},
        accessPermissions: payload.accessPermissions ?? {},
        documents: payload.documents ?? [],
        requirements: payload.requirements ?? [],
        assets: payload.assets ?? [],
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error("❌ [updateClient]", err.message);
    return res.status(500).json({ error: "Failed to update client" });
  }
};

exports.createFullClient = async (req, res) => {
 const {
  name,
  category,
  slug,
  description,
  email,
  phone,
  website,
  logoUrl,
  brand,
  subscription,
  accessPermissions,
  preferences,
  publicProfiles,
} = req.body;

try {
  const client = await prisma.client.create({
    data: {
      name,
      category,
      slug,
      description,
      email,
      phone,
      website,
      logoUrl,
      subscription: subscription ? JSON.stringify(subscription) : undefined,
      brand: brand ? JSON.stringify(brand) : undefined,
      preferences: preferences ? JSON.stringify(preferences) : undefined,
      accessPermissions: accessPermissions
        ? JSON.stringify(accessPermissions)
        : undefined,

      // ✅ Create related public social profiles
      publicProfiles: {
        create: (publicProfiles || []).map((profile) => ({
          platform: profile.platform,
          handle: profile.handle,
          pageName: profile.pageName,
          pageUrl: profile.pageUrl,
          followers: profile.followers,
          postsCount: profile.postsCount,
          profilePic: profile.profilePic,
          bio: profile.bio,
        })),
      },
    },
  });

  return res.json(client);
} catch (err) {
  console.error("❌ [createFullClient]", err);
  return res.status(500).json({ error: "Failed to create client" });
}
};