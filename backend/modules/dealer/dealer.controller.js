const dealerService = require('./dealer.service');

const getAllDealers = async (req, res) => {
    try{
        const dealers = await dealerService.getAllDealers();

        res.status(200).json(dealers);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

const getDealerById = async (req, res) => {
    try{
        const { id } = req.params;

        const dealer = await dealerService.getDealerById(id);

        res.status(200).json(dealer);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

const createDealer = async (req, res) => {
    try{
        const {name, contact, type} = req.body;

        if(!name) {
            return res.status(400).json({ error: 'Name cannot be empty' });
        }

        const result = await dealerService.createDealer({
            name,
            contact,
            type
        });

        res.status(201).json(result);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

const deactivateDealer = async (req, res) => {
    try{
        const {id} = req.params;
        const result = await dealerService.deactivateDealer(id);

        res.status(204).json(result);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

const updateDealer = async(req, res) => {
    try{
        const {id} = req.params;
        const data = req.body;

        const result = await dealerService.updateDealer(data, id);

        res.status(200).json(result);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllDealers,
    getDealerById,
    createDealer,
    deactivateDealer,
    updateDealer
};