const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoritesSchema = new Schema({
    postId: {
        type: String,
        required: true
    },
    favoriteById: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    comments: {
        type: Array,
        required: true
    },
    time: {
        type: String,
        default: () => new Date().toISOString().replace("T", " ").slice(0, 16)
    }
});

const favorite = mongoose.model("favorites", favoritesSchema);

module.exports = favorite;