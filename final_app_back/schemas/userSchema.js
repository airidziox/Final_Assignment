const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Default-avatar.jpg"
    },
    favorites: {
        type: Array,
        required: true
    },
    messages: {
        type: Array,
        required: true
    }
});

const user = mongoose.model("users", userSchema);

module.exports = user;