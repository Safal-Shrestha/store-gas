const db = require('../../shared/db/postgres');
const dealerRepo = require('./dealer.repository');

const getAllDealers = async () => {
    return dealerRepo.getAllDealers(db);
};

const getDealerById = async (id) => {
    return dealerRepo.getDealerById(db, id);
};

const createDealer = async (data) => {
    return db.tx(async (t) => {
        if(data.contact && data.contact < 0){
            throw new Error('Invalid contact number');
        }

        const dealer = await dealerRepo.createDealer(t, data);

        return dealer;
    });
};

const deactivateDealer = async (id) => {
    return db.tx(async(t) => {
        const response = await dealerRepo.deactivateDealer(t, id);
        return response;
    });
};

const updateDealer = async (data, id) => {
    return db.tx(async(t) => {
        const updatedDealer = await dealerRepo.updateDealer(t, data, id);
        return updatedDealer;
    });
}

module.exports = {
    getAllDealers,
    getDealerById,
    createDealer,
    deactivateDealer,
    updateDealer
};