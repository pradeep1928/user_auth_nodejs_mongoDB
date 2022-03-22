const mongoose = require("mongoose");

// creating new user Schema for mongodb database 
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        collection: 'users'       // this will create new collection named 'users' in given db
    }
)

const model = mongoose.model('userSchema', userSchema);
module.exports = model;