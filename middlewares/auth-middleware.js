const CustomError = require('../middlewares/custom-error')
const DatabaseFunc = require('../helpers/crud')
const JwtService = require('../helpers/auth')

const Crud = new DatabaseFunc()

async function getAccount (id) {
    let result
    result = await Crud.findOne('User',{id: id})
    if(!result) {
       return null
    };
    return result
}


function getTokenFromHeaders (req){
    const { headers: { authorization } } = req;

    if(authorization && authorization.split(' ')[0] === 'Token') {
        return authorization.split(' ')[1]; 
    }
    return null;
}

let requestOption = {
    issuer: 'POS',
    audience: 'POS'
}

const authenticate = async (req, res, next) => {
    
    var payload = {}
    var token = getTokenFromHeaders(req)
    var paths = req.originalUrl.split('/')

    if(token === null) {
        throw new CustomError(401, 'access denied')
    }

    payload = await JwtService.verify(token, requestOption)
    if(payload === false) {
        throw new CustomError(401, 'access denied')
    }
   
    var account = await getAccount(payload._id)

    if(account == null) {
        return res.status(403).send('invalid account details denied').end();
    }
    
    req.account = account
    next()
}
module.exports.auth = authenticate  