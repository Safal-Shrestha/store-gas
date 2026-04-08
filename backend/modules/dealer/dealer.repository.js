const dbHelper = require('../../shared/db/db.helpers');

const getAllDealers = async (db) => {
    const {query} = dbHelper.buildFindAllQuery('active_dealers');
    return db.any(query);
};

const getDealerById = async (db, id) => {
    const {query} = dbHelper.buildFindByColumnQuery('active_dealers');
    return db.one(
        query,
        [id]
    );
};

const createDealer = async (db, data) => {
    const {query, values} = dbHelper.buildInsertQuery('dealers', data);
    return db.one(query, values);
};

const deactivateDealer = async(db, id) => {
    const {query} = dbHelper.buildSoftDeleteQuery('dealers');
    return db.none(query, [id]);
};

const updateDealer = async(db, data, id) => {
    const allowedFields = ['name', 'contact', 'credit_balance'];
    const{query, values} = dbHelper.buildUpdateQuery('dealers', data, allowedFields);
    values.push(id);
    return db.one(query, values);
};

module.exports = {
    getAllDealers,
    getDealerById,
    createDealer,
    deactivateDealer,
    updateDealer
};