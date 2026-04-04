const getAllDealers = async (db) => {
    return db.any(
        `SELECT * FROM dealers ORDER BY created_at DESC`
    );
};

const getDealerById = async (db, id) => {
    return db.one(
        `SELECT * FROM dealers WHERE id=$1`,
        [id]
    );
};

const createDealer = async (db, data) => {
    return db.one(
        `INSERT INTO dealers (name, contact, type)
         VALUES ($1,$2,$3)
         RETURNING *`,
         [data.name, data.contact, data.type]
    );
};

module.exports = {
    getAllDealers,
    getDealerById,
    createDealer
}