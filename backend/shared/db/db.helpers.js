const buildInsertQuery = (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const columns = keys.join(', ');
    const placeholders = keys.map((key, i)=> `$${i+1}`).join(', ');

    return {
        query: `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`, values
    };
};

const buildFindAllQuery = (table) => {
    return {
        query: `SELECT * FROM ${table}`
    };
};

const buildFindByColumnQuery = (table, column = 'id') => {
    return {
        query: `SELECT * FROM ${table} WHERE ${column} = $1`
    };
};

const buildSoftDeleteQuery = (table) => {

    return {
        query: `UPDATE ${table} SET deleted_at = NOW() WHERE id = $1`
    }
}

const buildUpdateQuery = (table, data, allowedFields) => {
    const keys = Object.keys(data).filter(k => allowedFields.includes(k));

    if(keys.length === 0) {
        throw new Error('No valid fields to update');
    }

    const values = keys.map(k => data[k]);

    const setClause = keys
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');

    return{
        query: `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id =  $${keys.length + 1} RETURNING *`, values
    }
};

module.exports = {
    buildInsertQuery,
    buildFindAllQuery,
    buildFindByColumnQuery,
    buildSoftDeleteQuery,
    buildUpdateQuery
};