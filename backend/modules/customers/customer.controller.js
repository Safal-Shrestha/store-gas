const customerService = require('./customer.service');

const getAllCustomers = async(req, res) => {
    try{
        const customers = await customerService.getAllCustomers();

        res.status(200).json(customers);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

const getCustomerById = async(req,res) => {
    try{
        const { id } = req.params;
        
        const customer = await customerService.getCustomerById(id);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json(customer);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

const createCustomer = async(req, res) => {
    try{

        const {name, contact} = req.body;

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const result = await customerService.createCustomer({
            name,
            contact
        });

        res.status(201).json(result);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer
};