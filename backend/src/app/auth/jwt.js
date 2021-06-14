const jwt = require('jsonwebtoken')

const secret = 'test'

function sign(payload) {
    return jwt.sign(payload, secret, {expiresIn: 86400})
}


function verify(token) {
    return jwt.verify(token, secret)
}

module.exports = {sign, verify}