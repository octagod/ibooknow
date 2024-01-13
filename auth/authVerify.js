const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token; 
    if(!token) res.status(401).json({error: 'Access Denied'});

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        if(verified){
            next();
        }else{
            res.status(401).json({error: 'Invalid Token'});
        }
    }catch(err) {
        res.status(400).json({error: 'Invalid Token'});
    }
}