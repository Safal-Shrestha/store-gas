const getAllCustomers = async (db) => {
    return db.any(
        `SELECT * FROM customers ORDER BY created_at DESC`
    );
};

const getCustomerById = async (db, id) => {
    return db.one(
        `SELECT * FROM customers WHERE id = $1`,
        [id]
    );
};

const createCustomer = async (db, data) => {
  return db.one(
    `INSERT INTO customers (name, contact)
     VALUES ($1,$2)
     RETURNING *`,
    [data.name, data.contact]
  );
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    createCustomer
}