const jwt = require('jsonwebtoken');
const config = require('config');
const secret = config.get('JwtSecret');



module.exports = auth = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        jwt.verify(token, secret, (error, decoded) => {
            if (error) {

                return res.status(401).json({ msg: 'Token is not valid' });
            } else {
                // console.log(decoded)
                req.user = decoded.id;

                next();
            }
        });
    } catch (err) {
        console.error('something wrong with auth middleware');

    }
};