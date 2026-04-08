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
};

const deactivateCustomer = async(id) => {
    return db.tx(async (t) => {
        const response = await customerRepo.deactivateCustomer(t, id);

        return response;
    });
};

const updateCustomer = async(data, id) => {
    return db.tx(async(t) => {
        const updatedCustomer = await customerRepo.updateCustomer(t, data, id);

        return updateCustomer;
    });
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    deactivateCustomer,
    updateCustomer
};