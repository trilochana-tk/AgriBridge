const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
} else {
    console.log("Razorpay keys not configured - Demo Mode enabled");
}

// Test route
app.get("/", (req, res) => {
    res.send("AgriBridge Razorpay Backend is running!");
});

// Create Razorpay order
app.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount"
            });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: "agribridge_" + Date.now()
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: order
        });

    } catch (error) {
        console.error("Razorpay Error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to create Razorpay order"
        });
    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`AgriBridge backend running on http://localhost:${PORT}`);
});