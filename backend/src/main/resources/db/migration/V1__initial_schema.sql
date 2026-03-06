-- Tenants
CREATE TABLE tenant (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    uid VARCHAR(50),
    plan VARCHAR(50) NOT NULL DEFAULT 'Starter'
);

-- Users
CREATE TABLE app_user (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    avatar_initials VARCHAR(10)
);

-- User-Tenant join table
CREATE TABLE user_tenant (
    user_id VARCHAR(50) NOT NULL REFERENCES app_user(id),
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenant(id),
    PRIMARY KEY (user_id, tenant_id)
);

-- Documents (Belege)
CREATE TABLE document (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenant(id),
    dateiname VARCHAR(500) NOT NULL,
    dateityp VARCHAR(20) NOT NULL,
    upload_datum TIMESTAMP NOT NULL,
    uploaded_by VARCHAR(50) NOT NULL REFERENCES app_user(id),
    status VARCHAR(50) NOT NULL DEFAULT 'In Pruefung',
    ocr_result JSONB,
    vorschau_url VARCHAR(1000)
);

CREATE INDEX idx_document_tenant ON document(tenant_id);

-- Audit entries
CREATE TABLE audit_entry (
    id VARCHAR(50) PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL REFERENCES document(id),
    timestamp TIMESTAMP NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT
);

CREATE INDEX idx_audit_document ON audit_entry(document_id);

-- Journal entries
CREATE TABLE journal_entry (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenant(id),
    document_id VARCHAR(50) REFERENCES document(id),
    buchungs_datum DATE NOT NULL,
    erfassungs_datum TIMESTAMP NOT NULL,
    belegnummer VARCHAR(50) NOT NULL,
    beschreibung TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'OCR-Vorschlag'
);

CREATE INDEX idx_journal_tenant ON journal_entry(tenant_id);

-- Journal lines (Buchungszeilen)
CREATE TABLE journal_line (
    id VARCHAR(50) PRIMARY KEY,
    journal_entry_id VARCHAR(50) NOT NULL REFERENCES journal_entry(id),
    konto_nummer VARCHAR(10) NOT NULL,
    konto_bezeichnung VARCHAR(255) NOT NULL,
    soll NUMERIC(15,2) NOT NULL DEFAULT 0,
    haben NUMERIC(15,2) NOT NULL DEFAULT 0,
    text VARCHAR(500)
);

CREATE INDEX idx_journal_line_entry ON journal_line(journal_entry_id);

-- Kontenrahmen (Chart of accounts)
CREATE TABLE konto (
    nummer VARCHAR(10) PRIMARY KEY,
    bezeichnung VARCHAR(255) NOT NULL,
    kategorie VARCHAR(50) NOT NULL
);
