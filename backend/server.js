// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 5003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = "mongodb+srv://rvaisaali677:vaisaali18@cluster0.gemag.mongodb.net/";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define schema and model for listings
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
    media: [{ type: { type: String, enum: ['image'], required: true }, data: { type: String, required: true } }]
});

const Listing = mongoose.model('Listing', ListingSchema, 'listings');

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Routes
const router = express.Router();

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the Datalytics API!');
});

// POST route to create a new listing with image upload
router.post('/listings', upload.array('media', 5), async (req, res) => {
    try {
        // Convert uploaded files to Base64 and create media array
        const mediaFiles = req.files ? req.files.map(file => ({
            type: 'image',
            data: file.buffer.toString('base64') // Convert image buffer to Base64 without additional encoding
        })) : [];

        // Create a new listing with the request body and media files
        const newListing = new Listing({
            ...req.body,
            media: mediaFiles
        });

        await newListing.save();
        res.status(201).json({ message: 'Listing created successfully!', listing: newListing });
    } catch (err) {
        console.error('Error creating listing:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET route to fetch all listings
router.get('/listings', async (req, res) => {
    try {
        const listings = await Listing.find();
        res.json(listings);
    } catch (err) {
        console.error('Error fetching listings:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE route to delete a listing by its ID
router.delete('/listings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        await Listing.findByIdAndDelete(id);
        res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ message: 'Server error, failed to delete listing' });
    }
});

// Use the routes in the app
app.use('/api', router);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
