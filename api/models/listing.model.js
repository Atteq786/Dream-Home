import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: Number,
        required: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        default: Date.now
    },
    bathrooms: {
        type: Number,
        required: true
    },
    bedrooms: {
        type: Number,
        required: true
    },
    furnished: {
        type: Boolean,
        required: true
    },
    parking: {
        type: Boolean,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    offer: {
        type: Boolean,
        required: true
    },
    imageUrls: {
        type: Array,
        required: true
    },
    useRefer: {
        type: String,
        required: true
    },

}, {timestamps: true});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
