import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
    res.json({
        message: 'API is working fine!'
    });
}

export const updateUser = (req, res, next) => {
    if(req.user.id !== req.params.id)
        return next(errorHandler(401, 'You can only update your own account!'))
    try {
        if (req.body.password) {
            req.nody.password = bcryptjs.hashSync(req.body.password, 10);
        }

        
    } catch (error) {
        next(error)
    }
        };