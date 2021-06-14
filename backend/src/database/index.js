const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:react-blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true
})

module.exports = mongoose