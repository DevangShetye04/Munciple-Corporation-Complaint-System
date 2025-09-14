const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

let complaintsCollection;

async function connectDB() {
    try {
        await client.connect();
        const db = client.db("Munciple_Corporation"); // ✅ use your database
        complaintsCollection = db.collection("Register_Complaint");
        console.log("✅ MongoDB Connected to Munciple_Corporation.Register_Complaint");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}
connectDB();

// API to save complaint
app.post("/complaints", async (req, res) => {
    try {
        const complaint = req.body;
        await complaintsCollection.insertOne(complaint);
        res.json({ success: true, message: "Complaint registered successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// API to fetch all complaints
app.get("/complaints", async (req, res) => {
    try {
        const complaints = await complaintsCollection.find().toArray();
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
