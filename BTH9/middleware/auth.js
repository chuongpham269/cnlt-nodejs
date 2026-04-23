// middleware/auth.js
const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }
    next();
};

module.exports = requireLogin;
