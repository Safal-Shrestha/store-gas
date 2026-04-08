const authService = require('./auth.service');

const getAllUsers = async (req, res) => {
    try{
        const users = await authService.getAllUsers();

        res.json(users);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserById = async (req, res) => {
    try{
        const {id} = req.params;
        const user = await authService.getUserById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found'});
        }

        res.status(200).json(user);
    } catch(err) {
        res.status(500).json({ Error: err.message });
    }
};

const signup = async (req, res) => {
    try {
        const {name, password} = req.body;

        if (!name || !password) {
            return res.status(400).json('Missing parameters');
        }

        const result = await authService.resgisterUser({
            name,
            password
        });

        res.status(201).json(result);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    try{
        const {name, password} = req.body;

        if (!name || !password) {
            return res.status(400).json('Missing parameters');
        }

        const response = await authService.authenticateUser({
            name,
            password
        });

        res.status(200).json(response);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

const deactivateUser = async (req, res) => {
    try{
        const {id} = req.params;

        const response = await authService.deactivateUser(id);

        res.status(204);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    signup,
    login,
    deactivateUser
}