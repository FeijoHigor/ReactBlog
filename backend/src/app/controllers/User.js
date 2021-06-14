const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const authMiddleWare = require('../auth/authMiddleware')

const jwt = require('../auth/jwt')
const authMiddleware = require('../auth/authMiddleware')

const router = express.Router()

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, isAdmin } = req.body

        if( await User.findOne({ email })){
            return res.status(409).send({ err: 'This email is already registered' })
        }

        const user = await User.create({name, email, password, isAdmin})

        user.password = undefined
        
        res.status(201).send({ 
            user,
            token: jwt.sign({user: user._id})
        })
        
    } catch (err) {
        res.status(400).send({ err: 'Error on create user' })
    }
})

router.get('/login', async (req, res) => {
    try {
        const [hashtype, hash] = req.headers.authorization.split(' ')
        const [email, password] = Buffer.from(hash, 'base64').toString().split(':')

        const user = await User.findOne({ email }).select('+password')

        if(!user){
            return res.status(404).send({ err: 'User does not exists' })
        }

        if(! await bcrypt.compare(password, user.password)){
            return res.status(401).send({ err: 'Email or password is wrong' })
        }

        user.password = undefined
        
        res.status(202).send({
            user,
            token: jwt.sign({user: user._id})
        })

    } catch (err) {
        res.status(400).send({ err: 'Error on login' })
    }
})

router.get('/me', authMiddleware, (req, res) => {
    try {
        if(req.err) {
            res.status(401).send( req.err )
        }  
        
        if(req.auth) {
            res.send( req.auth )
        }

    }catch(err) {
        res.status(400).send({ err: 'Error on login' })
    }
})

module.exports = app => app.use('/user', router)