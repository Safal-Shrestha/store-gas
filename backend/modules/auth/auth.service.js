const db = require('../../shared/db/postgres');
const userRepo = require('./user.repository');
const bcrypt = require('bcrypt');

const getAllUsers = async () => {
    return userRepo.getAllUsers(db);
};

const getUserById = async (id) => {
    return userRepo.getUserById(db, id);
};

const resgisterUser = async (data) => {
    return db.tx(async (t) => {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;

        const user = await userRepo.createUser(t, data);
        return user;
    });
};

const authenticateUser = async (data) => {

    const user = await userRepo.getUserByName(db, data.name);
    if (!user) {
        throw new Error('Invalid Credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    console.log(isMatch);

    if (isMatch) {
        return user.id;
    } else {
        throw new Error('Invalid Credentials');
    }
};

const deactivateUser = async (id) => {
    return db.tx(async (t) => {
        const result = await userRepo.deactivateUser(db, id);
        return result;
    });
};

module.exports = {
    getAllUsers,
    getUserById,
    resgisterUser,
    authenticateUser,
    deactivateUser
};