const db = require('../../shared/db/postgres');
const customerRepo = require('./customer.repository');

const getAllCustomers = async () => {
    return customerRepo.getAllCustomers(db);
};

const getCustomerById = async (id) => {
    return customerRepo.getCustomerById(db, id);
};

const createCustomer = async (data) => {
    return db.tx(async (t) => {
        if(data.contact && data.contact < 0){
            throw new Error('Invalid contact number');
        }

        const customer = await customerRepo.createCustomer(t, data);

        return customer;
    });
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer
}