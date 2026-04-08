const dbHelper = require('../../shared/db/db.helpers');

const getAllCustomers = async (db) => {
    const {query} = dbHelper.buildFindAllQuery('active_customers')
    return db.any(query);
};

const getCustomerById = async (db, id) => {
    const {query} = dbHelper.buildFindByColumnQuery('active_customers');
    return db.one(
        query,
        [id]
    );
};

const createCustomer = async (db, data) => {
  const { query, values } = dbHelper.buildInsertQuery('customers', data);
  return db.one(query, values);
};

const deactivateCustomer = async (db, id) => {
    const {query} = dbHelper.buildSoftDeleteQuery('customers');
    return db.none(query, [id]);
}

const updateCustomer = async (db, data, id) => {
    const allowedFields = ['name', 'contact', 'gas_allocated', 'credit_balance'];
    const {query, values} = dbHelper.buildUpdateQuery('customers', data, allowedFields);
    values.push(id);
    return db.one(query, values);
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deactivateCustomer
};