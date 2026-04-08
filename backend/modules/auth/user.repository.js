const dbHelper = require('../../shared/db/db.helpers');

const getAllUsers = async (db) => {
    const {query} = dbHelper.buildFindAllQuery('active_users');
    return db.any(query);
};

const getUserById = async (db, id) => {
    const {query} = dbHelper.buildFindByColumnQuery('active_users');
    return db.one(query,[id]);
};

const getUserByName = async (db, name) => {
    const {query} = dbHelper.buildFindByColumnQuery('active_users', 'name');
    return db.one(query, [name]);
};

const createUser = async (db, data) => {
    const {query, values} = dbHelper.buildInsertQuery('users', data);
    return db.one(query, values);
};

const deactivateUser = async(db, id) => {
    const {query} = dbHelper.buildSoftDeleteQuery('users');
    return db.none(query, [id]);
};

module.exports = {
    getAllUsers,
    getUserById,
    getUserByName,
    createUser,
    deactivateUser
};