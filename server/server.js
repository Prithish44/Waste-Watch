const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/save", express.static("save"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "save";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

app.post("/save", upload.single("image"), (req, res) => {
  const { latitude, longitude } = req.body;
  const imagePath = req.file ? `/save/${req.file.filename}` : null;

  console.log("Received Upload:");
  console.log("Image Path:", imagePath);
  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);

  if (!imagePath || !latitude || !longitude) {
    return res.status(400).json({ error: "Missing image or location data" });
  }

  const newData = {
    image: imagePath,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    timestamp: new Date().toISOString(),
  };

  const dataFilePath = path.join(__dirname, "data.json");

  // Read existing data
  let existingData = [];
  if (fs.existsSync(dataFilePath)) {
    try {
      const rawData = fs.readFileSync(dataFilePath, "utf8");
      existingData = JSON.parse(rawData);
    } catch (err) {
      console.error("Failed to parse existing JSON, initializing empty array.");
    }
  }

  existingData.push(newData);

  // Write updated data
  fs.writeFile(dataFilePath, JSON.stringify(existingData, null, 2), (err) => {
    if (err) {
      console.error("Failed to write data:", err);
      return res.status(500).json({ error: "Failed to save data" });
    }

    console.log("Data saved to data.json ✅");
    res.status(200).json({ message: "Upload successful", data: newData });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
