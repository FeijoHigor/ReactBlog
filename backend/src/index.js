const express = require('express')
const app = express()
const cors = require('cors')
const Categories = require('./app/models/Categories')
const Posts = require('./app/models/Posts')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

function paginatedResults(model) {
    return async (req, res, next) => {
        var { _page, _limit} = req.query

        _page = parseInt(_page)
        _limit = parseInt(_limit)
        
        _page = !_page ? 1 : _page
        _limit = !_limit ? 10 : _limit

        const startIndex = (_page - 1) * _limit
        const endIndex = _page * _limit

        const results = {}
        
        if(endIndex < await model.countDocuments()) {
            results.next = {
                _page: _page + 1,
                _limit
            }
        }
        
        if(startIndex > 0) {
            results.previous = {
                _page: _page - 1,
                _limit
            }
        }
        
        try {
            results.results = await model.find().limit(_limit).skip(startIndex)
            res.paginatedResults = results
            next()
        } catch (err) {
            res.status(400).send({ err: 'Error on paginate results'})
        }
    }
}

app.get('/categories', paginatedResults(Categories), async (req, res) => {
    try {
        res.send( res.paginatedResults )
    } catch (err) {
        res.status(400).send({ err: 'Error on list catgories' })
    }
})

app.get('/category/:category_slug', async (req, res) => {
    try {
        const category = await Categories.findOne({ slug: req.params.category_slug}).populate('posts')

        res.send({ category })
    } catch(err) {
        res.status(400).send({ err: 'Error on show category' })
    }
})

app.get('/posts', paginatedResults(Posts), async (req, res) => {
    try {
        res.send( res.paginatedResults )
    } catch (err) {
        console.log(err)
        res.status(400).send({ err: 'Error on list posts' })
    }
})

app.get('/post/:post_slug', async (req, res) => {
    try {
        const post = await Posts.findOne({slug: req.params.post_slug}).populate('category')
        
        post.category.posts = undefined

        res.send({ post })

    } catch(err) {
        res.status(400).send({ err: 'Error on show post' })
        console.log(err)
    }
})

require('./app/controllers/Admin')(app)
require('./app/controllers/User')(app)

const PORT = 5000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})