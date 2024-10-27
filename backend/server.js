const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5003;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const mongoURI = "mongodb://localhost:27017/real-estate";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const ListingSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, minlength: 20, maxlength: 500 },
    size: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 1 },
    streetAddress: { type: String, required: true, maxlength: 150 },
    city: { type: String, required: true, maxlength: 50 },
    state: { type: String, required: true, maxlength: 50 },
    postalCode: { type: String, required: true, match: /^\d{6}$/ },
    mapLink: { type: String },
    propertyType: { type: String, required: true },
    purpose: { type: String, required: true },
    contact: {
        contactName: { type: String, required: true, maxlength: 100 },
        phone: { type: String, required: true, match: /^[789]\d{9}$/ },
        email: { type: String, required: true }
    },
    media: [{ type: { type: String, enum: ['image', 'video'] }, url: String }]
});

const Listing = mongoose.model('Listing', ListingSchema);

app.post('/api/listings', async (req, res) => {
    try {
        const newListing = new Listing(req.body);
        const savedListing = await newListing.save();
        res.status(201).json(savedListing);
    } catch (error) {
        console.error('Error saving listing:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
