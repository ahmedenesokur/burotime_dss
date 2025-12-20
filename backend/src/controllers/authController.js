// Authentication Controller
const jwt = require('jsonwebtoken');

// Mock user database (in production, this would be a real database)
const users = [
    {
        id: 1,
        email: 'kullanici.01@gmail.com',
        password: '123321',
        name: 'Test Kullanıcısı',
        role: 'admin'
    }
];

// Login endpoint
exports.login = (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                message: 'E-posta ve şifre gereklidir'
            });
        }
        
        // Find user
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            return res.status(401).json({
                message: 'E-posta veya şifre yanlış'
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET || 'your_secret_key_change_in_production',
            { expiresIn: '24h' }
        );
        
        // Return token and user info (without password)
        res.json({
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Sunucu hatası'
        });
    }
};

// Verify token middleware
exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                message: 'Token bulunamadı'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_change_in_production');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            message: 'Geçersiz token'
        });
    }
};

// Get current user
exports.getCurrentUser = (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                message: 'Token bulunamadı'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_change_in_production');
        
        res.json({
            user: decoded
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({
            message: 'Geçersiz token'
        });
    }
};

// Logout (client-side token deletion)
exports.logout = (req, res) => {
    res.json({
        message: 'Başarıyla çıkış yapıldı'
    });
};
