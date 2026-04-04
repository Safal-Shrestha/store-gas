const db = require('../../shared/db/postgres');
const dealerRepo = require('./dealer.repository');

const getAllDealers = async () => {
    return dealerRepo.getAllDealers(db);
}

const getDealerById = async (id) => {
    return dealerRepo.getDealerById(db, id);
}

const createDealer = async (data) => {
    return db.tx(async (t) => {
        if(data.contact && data.contact < 0){
            throw new Error('Invalid contact number');
        }

        const dealer = await dealerRepo.createDealer(t, data);

        return dealer;
    });
}

module.exports = {
    getAllDealers,
    getDealerById,
    createDealer
}