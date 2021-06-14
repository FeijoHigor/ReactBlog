const mongoose = require('../../database/index')
const Schema = mongoose.Schema

const CategorieSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts',
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

const Categories = mongoose.model('categories', CategorieSchema)

module.exports = Categories