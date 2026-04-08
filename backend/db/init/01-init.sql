CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE dealer_type AS ENUM ('IN_GAS', 'OUT_GAS');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE cylinder_state AS ENUM ('EMPTY', 'HALF', 'FULL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE sales_type AS ENUM ('NEW', 'REFILL', 'EXCHANGE_OUT', 'RETURN_EMPTY');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE purchase_type AS ENUM ('BUY_FILLED', 'EXCHANGE_FILLED_EMPTY', 'EXCHANGE_OUT_EMPTY', 'RETURN_EMPTY');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE credit_party AS ENUM ('CUSTOMER', 'DEALER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE credit_action AS ENUM ('INCURRED', 'PARTIAL_PAYMENT', 'CLEARED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE log_action AS ENUM ('CREDIT_INCURRED', 'CREDIT_PARTIAL_PAYMENT', 'CREDIT_CLEARED', 'INVENTORY_ADJUSTED', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE VIEW active_users AS SELECT * FROM users WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact BIGINT CHECK (contact >= 0),
    gas_allocated INTEGER DEFAULT 0 CHECK (gas_allocated >= 0),
    credit_balance INTEGER NOT NULL DEFAULT 0 CHECK (credit_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE VIEW active_customers AS SELECT * FROM customers WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS dealers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    contact BIGINT CHECK (contact >= 0),
    type dealer_type NOT NULL,
    credit_balance INTEGER NOT NULL DEFAULT 0 CHECK (credit_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE VIEW active_dealers AS SELECT * FROM dealers WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS in_gas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    purchase_rate_full INTEGER NOT NULL CHECK (purchase_rate_full >= 0),
    purchase_rate_half INTEGER NOT NULL CHECK (purchase_rate_half >= 0),
    purchase_deposit INTEGER NOT NULL DEFAULT 0 CHECK (purchase_deposit >= 0),
    new_sales_rate_full INTEGER NOT NULL CHECK (new_sales_rate_full >= 0),
    new_sales_rate_half INTEGER NOT NULL CHECK (new_sales_rate_half >= 0),
    refill_rate_full INTEGER NOT NULL CHECK (refill_rate_full >= 0),
    refill_rate_half INTEGER NOT NULL CHECK (refill_rate_half >= 0),
    cylinder_deposit INTEGER NOT NULL CHECK (cylinder_deposit >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS in_gas_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    in_gas_id UUID NOT NULL REFERENCES in_gas(id),
    state cylinder_state NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (in_gas_id, state)
);

CREATE TABLE IF NOT EXISTS out_gas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    empty_no INTEGER NOT NULL DEFAULT 0 CHECK (empty_no >= 0),
    cust_exchange_rate INTEGER NOT NULL CHECK (cust_exchange_rate >= 0),
    dealer_exchange_rate INTEGER NOT NULL CHECK (dealer_exchange_rate >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales_txn (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    total_payable INTEGER NOT NULL CHECK (total_payable >= 0),
    total_paid INTEGER NOT NULL CHECK (total_paid >= 0),
    is_credit BOOLEAN NOT NULL DEFAULT FALSE,
    is_waitlist BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (total_paid <= total_payable),
    CHECK (total_paid = total_payable OR (total_paid < total_payable AND is_credit = TRUE))
);

CREATE TABLE IF NOT EXISTS sales_line (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_id UUID NOT NULL REFERENCES sales_txn(id) ON DELETE CASCADE,
    type sales_type NOT NULL,
    in_gas_id UUID REFERENCES in_gas(id),
    out_gas_id UUID REFERENCES out_gas(id),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    cylinder_state cylinder_state NOT NULL DEFAULT 'FULL',
    unit_rate INTEGER NOT NULL DEFAULT 0 CHECK (unit_rate >= 0),
    exchange_out_rate INTEGER NOT NULL DEFAULT 0 CHECK (exchange_out_rate >= 0),

    deposit_per_unit  INTEGER         NOT NULL DEFAULT 0,
    deposit_total     INTEGER         NOT NULL DEFAULT 0,

    line_total        INTEGER         NOT NULL DEFAULT 0,

    CHECK (type != 'RETURN_EMPTY' OR cylinder_state = 'EMPTY'),
    CHECK (
        (type IN ('NEW', 'REFILL', 'RETURN_EMPTY') AND in_gas_id IS NOT NULL AND out_gas_id IS NULL) OR (type = 'EXCHANGE_OUT' AND in_gas_id IS NOT NULL AND out_gas_id IS NOT NULL)
    ),
    CHECK (type = 'EXCHANGE_OUT' OR exchange_out_rate = 0),
    CHECK (type NOT IN ('NEW', 'EXCHANGE_OUT') OR deposit_per_unit >= 0),
    CHECK (type != 'RETURN_EMPTY' OR deposit_per_unit <= 0)
);

CREATE TABLE IF NOT EXISTS purchase_txn (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID NOT NULL REFERENCES dealers(id),
    total_payable INTEGER NOT NULL CHECK (total_payable >= 0),
    total_paid INTEGER NOT NULL CHECK (total_paid >= 0),
    is_credit BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (total_paid <= total_payable),
    CHECK (total_paid = total_payable OR (total_paid < total_payable AND is_credit = TRUE))
);

CREATE TABLE IF NOT EXISTS purchase_line (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    txn_id UUID NOT NULL REFERENCES purchase_txn(id) ON DELETE CASCADE,
    type purchase_type NOT NULL,
    in_gas_id UUID REFERENCES in_gas(id),
    out_gas_id UUID REFERENCES out_gas(id),
    received_state cylinder_state NULL DEFAULT 'FULL',
    filled_received INTEGER NOT NULL DEFAULT 0 CHECK (filled_received >= 0),
    empty_given INTEGER NOT NULL DEFAULT 0 CHECK (empty_given >= 0),
    empty_received INTEGER NOT NULL DEFAULT 0 CHECK (empty_received >= 0),
    unit_rate INTEGER NOT NULL DEFAULT 0 CHECK (unit_rate >= 0),
    exchange_charge INTEGER NOT NULL DEFAULT 0 CHECK (exchange_charge >= 0),
    deposit_per_unit INTEGER NOT NULL DEFAULT 0,
    deposit_total INTEGER NOT NULL DEFAULT 0,
    line_total INTEGER NOT NULL DEFAULT 0,

    CHECK (
        (type IN ('BUY_FILLED', 'EXCHANGE_FILLED_EMPTY') AND received_state IN ('FULL', 'HALF'))
        OR
        (type = 'EXCHANGE_OUT_EMPTY' AND received_state = 'EMPTY')
        OR
        (type = 'RETURN_EMPTY' AND received_state IS NULL)
    ),
    CHECK (type = 'EXCHANGE_OUT_EMPTY' OR exchange_charge = 0),
    CHECK (type != 'BUY_FILLED' OR deposit_per_unit > 0),
    CHECK (type != 'RETURN_EMPTY' OR deposit_per_unit < 0),
    CHECK (
        (type = 'BUY_FILLED' AND in_gas_id IS NOT NULL AND out_gas_id IS NULL
            AND filled_received > 0)
        OR
        (type = 'EXCHANGE_FILLED_EMPTY' AND in_gas_id IS NOT NULL AND out_gas_id IS NULL
            AND filled_received > 0 AND empty_given > 0)
        OR
        (type = 'EXCHANGE_OUT_EMPTY' AND in_gas_id IS NOT NULL AND out_gas_id IS NOT NULL
            AND empty_received > 0 AND empty_given > 0)
        OR
        (type = 'RETURN_EMPTY' AND empty_given > 0 AND filled_received = 0 AND empty_received = 0)
    )
);

CREATE TABLE IF NOT EXISTS credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_type credit_party NOT NULL,
    party_id UUID NOT NULL,
    action credit_action NOT NULL,
    ref_table TEXT NOT NULL,
    ref_id UUID NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    notes TEXT,
    perfomed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);