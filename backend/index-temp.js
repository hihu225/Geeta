// Theme Schema & Model
const themeSchema = new mongoose.Schema({
  name: String,
  description: String,
  tags: [String],
  verses: [{
    chapter: Number,
    verse: Number,
    shloka: String,
    translation: String,
    explanation: String,
    relevance: String // "Why this verse?" explanation
  }]
});

const Theme = mongoose.model("Theme", themeSchema);

// Get all themes
app.get("/api/themes", async (req, res) => {
  try {
    const themes = await Theme.find().select('name description tags');
    res.json(themes);
  } catch (error) {
    console.error("Error fetching themes:", error);
    res.status(500).json({ error: "Failed to fetch themes" });
  }
});

// Get specific theme with verses
app.get("/api/themes/:id", async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ error: "Theme not found" });
    }
    res.json(theme);
  } catch (error) {
    console.error("Error fetching theme:", error);
    res.status(500).json({ error: "Failed to fetch theme" });
  }
});

// Admin endpoint to create themes (protected in production)
app.post("/api/themes", async (req, res) => {
  try {
    const newTheme = new Theme(req.body);
    await newTheme.save();
    res.status(201).json(newTheme);
  } catch (error) {
    console.error("Error creating theme:", error);
    res.status(500).json({ error: "Failed to create theme" });
  }
});
