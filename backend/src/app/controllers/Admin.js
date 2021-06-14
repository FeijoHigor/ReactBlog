const express = require('express')

const Categories = require('../models/Categories')
const Posts = require('../models/Posts')

const authMiddleWare = require('../auth/authMiddleware')

const router = express.Router()

router.use(authMiddleWare)

router.post('/categories/add', async (req, res) => {
    if(req.auth.isAdmin != 1) {
        return res.status(401).send({ err: 'You do not have permission' })
    }
    try {
        const { name, slug, description } = req.body
        const category = await Categories.create({name, slug, description})

        category.posts = undefined

        res.send({category})
    } catch (err) {
        res.status(400).send({ err: 'Error on create post' })
    }
})

router.patch('/categories/edit/:category_id', async (req, res) => {
    if(req.auth.isAdmin != 1) {
        return res.status(401).send({ err: 'You do not have permission' })
    }
    try {
        const { name, slug, description } = req.body
        const category = await Categories.findByIdAndUpdate(req.params.category_id, {
            name,
            slug,
            description
        })

        const updatedCategory = await Categories.findOne({_id: req.params.category_id})

        res.send({ updatedCategory })
        
    } catch (err) {
        res.status(400).send({ err: 'Error on update category' })
    }
})

router.delete('/categories/delete/:category_id', async (req, res) => {
    if(req.auth.isAdmin != 1) {
        return res.status(401).send({ err: 'You do not have permission' })
    }
    try {
        await Posts.remove({ category: req.params.category_id})

        await Categories.findOneAndDelete({_id: req.params.category_id})

        res.send()
    } catch (err) {
        res.status(400).send({ err: 'Error on delete category' })
    }
})

router.post('/posts/add', async (req, res) => {
    if(req.auth.isAdmin != 1) {
        return res.status(401).send({ err: 'You do not have permission' })
    }
    try {
        const {title, slug, description, content, category} = req.body
        const findCategory = await Categories.findOne({slug: category})
        if(!findCategory){
            return res.status(400).send({ err: 'This category does not exists' })
        }
        const post = await Posts.create({
            title,
            slug,
            description,
            content,
            category: findCategory._id
        })

        findCategory.posts.push(post)
        findCategory.save()

        res.send({ post })
    } catch (err) {
        console.log(err)
        res.status(400).send({ err: 'Error on create post' })
    }
})

router.patch('/posts/edit/:post_id', async (req, res) => {
    if(req.auth.isAdmin != 1) {
        return res.status(401).send({ err: 'You do not have permission' })
    }
    try {   
        const { title, slug, description, content, category} = req.body
        const post = await Posts.findOne({_id: req.params.post_id})
        const newCategory = await Categories.findOne({slug: category})

        if(!newCategory){
            return res.status(400).send({ err: 'This category does not exists' })
        }

        if(post.category._id != newCategory._id){
            const lastCategory = await Categories.findOne({_id: post.category})
            lastCategory.posts.splice(lastCategory.posts.indexOf(req.params.post_id), 1)
            lastCategory.save()

            newCategory.posts.push(post)
            newCategory.save()
            post.category = newCategory._id
            console.log('diferente')
        }

        post.title = title
        post.slug = slug
        post.description = description
        post.content = content
        post.save()

        res.send({ post })

    } catch (err) {
        res.status(400).send({ err: 'Error on update post' })
    }
})

router.delete('/posts/delete/:post_id', async (req, res) => {
    if(req.auth.isAdmin != 1) {
        return res.status(401).send({ err: 'You do not have permission' })
    }
    try {
        const post = await Posts.findOne({_id: req.params.post_id})

        const category = await Categories.findOne({_id: post.category})
        category.posts.splice(category.posts.indexOf(req.params._id, 1))
        category.save()
        await Posts.findOneAndDelete({_id: req.params.post_id})

        res.send()

    } catch (err) {
        console.log(err)
        res.status(400).send({ err: 'Error on delete post' })
    }
})

module.exports = app => app.use('/admin', router)
