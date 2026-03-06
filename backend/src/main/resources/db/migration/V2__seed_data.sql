-- Seed data matching frontend mock data
-- Password for all users: count123

-- Tenants
INSERT INTO tenant (id, name, address, uid, plan) VALUES
('tenant-1', 'Schreinerei Hofer AG', 'Werkstrasse 12, 3600 Thun', 'CHE-114.827.593', 'Professional'),
('tenant-2', 'Gastro Seeland GmbH', 'Seevorstadt 28, 2502 Biel/Bienne', 'CHE-339.561.207', 'Enterprise'),
('tenant-3', 'Elektro Bühler & Söhne', 'Industriestrasse 5, 4600 Olten', 'CHE-472.918.364', 'Starter');

-- Users (bcrypt hash of 'count123')
INSERT INTO app_user (id, email, name, password_hash, role, avatar_initials) VALUES
('user-1', 'emre.oezbek@count.ch', 'Emre Özbek', '$2b$10$6fJP6lz26HidwLnGWAoRK.BluMH9eIz4EPA.mXu9DDhE9rT4OLAci', 'Hauptbuchhalter', 'EÖ'),
('user-2', 'sandra.hofer@treuhand-hofer.ch', 'Sandra Hofer', '$2b$10$6fJP6lz26HidwLnGWAoRK.BluMH9eIz4EPA.mXu9DDhE9rT4OLAci', 'Buchhalter', 'SH'),
('user-3', 'thomas.hofer@schreinerei-hofer.ch', 'Thomas Hofer', '$2b$10$6fJP6lz26HidwLnGWAoRK.BluMH9eIz4EPA.mXu9DDhE9rT4OLAci', 'User', 'TH'),
('user-4', 'patrizia.lang@gastro-seeland.ch', 'Patrizia Lang', '$2b$10$6fJP6lz26HidwLnGWAoRK.BluMH9eIz4EPA.mXu9DDhE9rT4OLAci', 'User', 'PL'),
('user-5', 'beat.buehler@elektro-buehler.ch', 'Beat Bühler', '$2b$10$6fJP6lz26HidwLnGWAoRK.BluMH9eIz4EPA.mXu9DDhE9rT4OLAci', 'User', 'BB');

-- User-Tenant mappings
INSERT INTO user_tenant (user_id, tenant_id) VALUES
('user-1', 'tenant-1'),
('user-1', 'tenant-2'),
('user-1', 'tenant-3'),
('user-2', 'tenant-1'),
('user-3', 'tenant-1'),
('user-4', 'tenant-2'),
('user-5', 'tenant-3');

-- Documents
INSERT INTO document (id, tenant_id, dateiname, dateityp, upload_datum, uploaded_by, status, ocr_result, vorschau_url) VALUES
('doc-1', 'tenant-1', 'Rechnung_Swisscom_2024-01.pdf', 'pdf', '2024-01-15T09:23:00', 'user-2', 'Verbucht',
 '{"betrag":189.50,"netto":175.39,"mwst":14.11,"mwstSatz":8.1,"datum":"2024-01-10","lieferant":"Swisscom (Schweiz) AG","belegTyp":"Rechnung","beschreibung":"Mobile Abo Business L, Januar 2024","confidence":94,"waehrung":"CHF"}', NULL),
('doc-2', 'tenant-1', 'Quittung_Migros_15012024.jpg', 'jpg', '2024-01-15T12:45:00', 'user-2', 'Verbucht',
 '{"betrag":47.85,"netto":44.27,"mwst":3.58,"mwstSatz":8.1,"datum":"2024-01-15","lieferant":"Migros-Genossenschafts-Bund","belegTyp":"Quittung","beschreibung":"Büromaterial und Verpflegung","confidence":87,"waehrung":"CHF"}', NULL),
('doc-3', 'tenant-1', 'Rechnung_Holzlieferant_Jan2024.pdf', 'pdf', '2024-01-18T08:00:00', 'user-2', 'In Pruefung',
 '{"betrag":4280.00,"netto":3959.30,"mwst":320.70,"mwstSatz":8.1,"datum":"2024-01-05","lieferant":"Holz Lehmann AG","belegTyp":"Rechnung","beschreibung":"Eichenholz 3m³, Buchenholz 2m³","confidence":91,"waehrung":"CHF"}', NULL),
('doc-4', 'tenant-1', 'Miete_Januar_2024.pdf', 'pdf', '2024-01-20T10:15:00', 'user-2', 'In Pruefung', NULL, NULL),
('doc-5', 'tenant-1', 'Werkzeug_Rechnung_Hilti.pdf', 'pdf', '2024-01-22T14:30:00', 'user-2', 'In Pruefung', NULL, NULL),
('doc-6', 'tenant-2', 'Rechnung_Aligro_Grosshandel.pdf', 'pdf', '2024-01-12T16:00:00', 'user-1', 'Verbucht',
 '{"betrag":3847.50,"netto":3558.28,"mwst":289.22,"mwstSatz":8.1,"datum":"2024-01-08","lieferant":"Aligro Demaurex & Cie SA","belegTyp":"Rechnung","beschreibung":"Lebensmittel Grosseinkauf KW2","confidence":95,"waehrung":"CHF"}', NULL),
('doc-7', 'tenant-2', 'Reinigung_CleanSwiss_Dez23.pdf', 'pdf', '2024-01-10T09:00:00', 'user-1', 'Verbucht',
 '{"betrag":680.00,"netto":629.05,"mwst":50.95,"mwstSatz":8.1,"datum":"2023-12-31","lieferant":"CleanSwiss GmbH","belegTyp":"Rechnung","beschreibung":"Küchenreinigung Dezember 2023","confidence":89,"waehrung":"CHF"}', NULL),
('doc-8', 'tenant-2', 'Getraenkelieferung_Feldschloesschen.pdf', 'pdf', '2024-01-28T07:30:00', 'user-1', 'In Pruefung', NULL, NULL),
('doc-9', 'tenant-2', 'Quittung_Metro_KW4.jpg', 'jpg', '2024-01-29T15:20:00', 'user-1', 'In Pruefung', NULL, NULL),
('doc-10', 'tenant-3', 'Rechnung_Elektromaterial_Demelectric.pdf', 'pdf', '2024-01-14T06:30:00', 'user-1', 'Verbucht',
 '{"betrag":2145.60,"netto":1984.83,"mwst":160.77,"mwstSatz":8.1,"datum":"2024-01-13","lieferant":"Demelectric AG","belegTyp":"Rechnung","beschreibung":"Kabel, Schalter, Sicherungen – Projekt Neubau Lenzburg","confidence":92,"waehrung":"CHF"}', NULL),
('doc-11', 'tenant-3', 'Strom_EWB_Dez2023.pdf', 'pdf', '2024-01-16T07:00:00', 'user-1', 'In Pruefung',
 '{"betrag":412.60,"netto":400.19,"mwst":12.41,"mwstSatz":3.8,"datum":"2024-01-02","lieferant":"Energie Wasser Bern (ewb)","belegTyp":"Rechnung","beschreibung":"Stromrechnung Dezember 2023, Gewerbe","confidence":90,"waehrung":"CHF"}', NULL),
('doc-12', 'tenant-3', 'Fahrzeug_Service_Rechnung.pdf', 'pdf', '2024-01-25T08:45:00', 'user-1', 'In Pruefung', NULL, NULL),
('doc-13', 'tenant-3', 'Versicherung_Helvetia_2024.pdf', 'pdf', '2024-01-30T10:00:00', 'user-1', 'In Pruefung', NULL, NULL);

-- Audit entries
INSERT INTO audit_entry (id, document_id, timestamp, user_id, user_name, action, details) VALUES
('audit-1', 'doc-1', '2024-01-15T09:23:00', 'user-2', 'Sandra Hofer', 'Hochgeladen', 'Dokument hochgeladen'),
('audit-3', 'doc-1', '2024-01-16T14:10:00', 'user-1', 'Emre Özbek', 'Status → In Prüfung', 'Zur Prüfung markiert'),
('audit-4', 'doc-1', '2024-01-17T10:30:00', 'user-1', 'Emre Özbek', 'Status → Verbucht', 'Buchung bestätigt und verbucht'),
('audit-5', 'doc-2', '2024-01-15T12:45:00', 'user-2', 'Sandra Hofer', 'Hochgeladen', 'Dokument hochgeladen'),
('audit-7', 'doc-2', '2024-01-16T14:15:00', 'user-1', 'Emre Özbek', 'Status → Verbucht', 'Buchung bestätigt und verbucht'),
('audit-8', 'doc-3', '2024-01-18T08:00:00', 'user-2', 'Sandra Hofer', 'Hochgeladen', 'Dokument hochgeladen'),
('audit-11', 'doc-4', '2024-01-20T10:15:00', 'user-2', 'Sandra Hofer', 'Hochgeladen', 'Dokument hochgeladen – wartet auf Prüfung'),
('audit-13', 'doc-5', '2024-01-22T14:30:00', 'user-2', 'Sandra Hofer', 'Hochgeladen', 'Dokument hochgeladen – wartet auf Prüfung'),
('audit-18', 'doc-6', '2024-01-12T16:00:00', 'user-1', 'Emre Özbek', 'Hochgeladen', 'Dokument hochgeladen'),
('audit-20', 'doc-6', '2024-01-13T08:00:00', 'user-1', 'Emre Özbek', 'Status → Verbucht', 'Buchung bestätigt und verbucht'),
('audit-21', 'doc-7', '2024-01-10T09:00:00', 'user-1', 'Emre Özbek', 'Hochgeladen', 'Dokument hochgeladen'),
('audit-23', 'doc-7', '2024-01-11T10:00:00', 'user-1', 'Emre Özbek', 'Status → Verbucht', 'Buchung bestätigt und verbucht'),
('audit-24', 'doc-8', '2024-01-28T07:30:00', 'user-1', 'Emre Özbek', 'Hochgeladen', 'Dokument hochgeladen – wartet auf Prüfung'),
('audit-26', 'doc-9', '2024-01-29T15:20:00', 'user-1', 'Emre Özbek', 'Hochgeladen', 'Dokument hochgeladen – wartet auf Prüfung'),
('audit-31', 'doc-10', '2024-01-14T06:30:00', 'user-1', 'Emre Özbek', 'Hochgeladen', 'Dokument hochgeladen'),
('audit-33', 'doc-10', '2024-01-15T09:00:00', 'user-1', 'Emre Özbek', 'Status → Verbucht', 'Buchung bestätigt und verbucht'),
('audit-34', 'doc-11', '2024-01-16T07:00:00', 'user-1', 'Emre Özbek', 'Hochgeladen', 'Dokument hochgeladen'),
('audit-37', 'doc-12', '2024-01-25T08:45:00', 'user-1', 'Emre Özbek', 'Hochgeladen', 'Dokument hochgeladen – wartet auf Prüfung'),
('audit-39', 'doc-13', '2024-01-30T10:00:00', 'user-1', 'Emre Özbek', 'Hochgeladen', 'Dokument hochgeladen – wartet auf Prüfung');

-- Journal entries
INSERT INTO journal_entry (id, tenant_id, document_id, buchungs_datum, erfassungs_datum, belegnummer, beschreibung, status) VALUES
('journal-1', 'tenant-1', 'doc-1', '2024-01-17', '2024-01-17T10:30:00', 'BEL-2024-001', 'Swisscom Mobile Abo Business L, Januar 2024', 'Manuell bestaetigt'),
('journal-2', 'tenant-1', 'doc-2', '2024-01-16', '2024-01-16T14:15:00', 'BEL-2024-002', 'Migros Büromaterial und Verpflegung', 'Manuell bestaetigt'),
('journal-3', 'tenant-2', 'doc-6', '2024-01-13', '2024-01-13T08:00:00', 'BEL-2024-003', 'Aligro Lebensmittel Grosseinkauf KW2', 'Manuell bestaetigt'),
('journal-4', 'tenant-2', 'doc-7', '2024-01-11', '2024-01-11T10:00:00', 'BEL-2024-004', 'CleanSwiss Küchenreinigung Dezember 2023', 'Manuell bestaetigt'),
('journal-5', 'tenant-3', 'doc-10', '2024-01-15', '2024-01-15T09:00:00', 'BEL-2024-005', 'Demelectric Elektromaterial Projekt Neubau', 'Manuell bestaetigt');

-- Journal lines
INSERT INTO journal_line (id, journal_entry_id, konto_nummer, konto_bezeichnung, soll, haben, text) VALUES
('jl-1', 'journal-1', '6600', 'Telefonaufwand', 175.39, 0, 'Swisscom Abo netto'),
('jl-2', 'journal-1', '1170', 'Vorsteuer (MwSt)', 14.11, 0, 'Vorsteuer 8.1%'),
('jl-3', 'journal-1', '2000', 'Kreditoren (Verbindlichkeiten L+L)', 0, 189.50, 'Verbindlichkeit Swisscom'),
('jl-4', 'journal-2', '6500', 'Büromaterial und Drucksachen', 44.27, 0, 'Büromaterial netto'),
('jl-5', 'journal-2', '1170', 'Vorsteuer (MwSt)', 3.58, 0, 'Vorsteuer 8.1%'),
('jl-6', 'journal-2', '2000', 'Kreditoren (Verbindlichkeiten L+L)', 0, 47.85, 'Verbindlichkeit Migros'),
('jl-7', 'journal-3', '4000', 'Materialaufwand', 3558.28, 0, 'Lebensmittel netto'),
('jl-8', 'journal-3', '1170', 'Vorsteuer (MwSt)', 289.22, 0, 'Vorsteuer 8.1%'),
('jl-9', 'journal-3', '2000', 'Kreditoren (Verbindlichkeiten L+L)', 0, 3847.50, 'Verbindlichkeit Aligro'),
('jl-10', 'journal-4', '6000', 'Mietaufwand Räumlichkeiten', 629.05, 0, 'Reinigung netto'),
('jl-11', 'journal-4', '1170', 'Vorsteuer (MwSt)', 50.95, 0, 'Vorsteuer 8.1%'),
('jl-12', 'journal-4', '2000', 'Kreditoren (Verbindlichkeiten L+L)', 0, 680.00, 'Verbindlichkeit CleanSwiss'),
('jl-13', 'journal-5', '4000', 'Materialaufwand', 1984.83, 0, 'Elektromaterial netto'),
('jl-14', 'journal-5', '1170', 'Vorsteuer (MwSt)', 160.77, 0, 'Vorsteuer 8.1%'),
('jl-15', 'journal-5', '2000', 'Kreditoren (Verbindlichkeiten L+L)', 0, 2145.60, 'Verbindlichkeit Demelectric');

-- Kontenrahmen (Swiss KMU chart of accounts)
INSERT INTO konto (nummer, bezeichnung, kategorie) VALUES
('1000', 'Kasse', 'Aktiven'),
('1020', 'Bankguthaben', 'Aktiven'),
('1100', 'Forderungen aus Lieferungen und Leistungen', 'Aktiven'),
('1170', 'Vorsteuer (MwSt)', 'Aktiven'),
('1200', 'Vorräte Handelswaren', 'Aktiven'),
('1500', 'Maschinen und Apparate', 'Aktiven'),
('1510', 'Büroeinrichtungen', 'Aktiven'),
('2000', 'Kreditoren (Verbindlichkeiten L+L)', 'Passiven'),
('2200', 'Geschuldete MwSt', 'Passiven'),
('2800', 'Eigenkapital', 'Passiven'),
('3000', 'Handelswarenaufwand', 'Aufwand'),
('4000', 'Materialaufwand', 'Aufwand'),
('4200', 'Miete', 'Aufwand'),
('4300', 'Versicherungsaufwand', 'Aufwand'),
('4400', 'Energieaufwand', 'Aufwand'),
('4500', 'Verwaltungsaufwand', 'Aufwand'),
('4600', 'Werbeaufwand', 'Aufwand'),
('5000', 'Löhne', 'Aufwand'),
('5700', 'Sozialversicherungsaufwand', 'Aufwand'),
('6000', 'Mietaufwand Räumlichkeiten', 'Aufwand'),
('6500', 'Büromaterial und Drucksachen', 'Aufwand'),
('6570', 'IT-Aufwand', 'Aufwand'),
('6600', 'Telefonaufwand', 'Aufwand'),
('7000', 'Handelserlös', 'Ertrag'),
('7010', 'Dienstleistungserlös', 'Ertrag'),
('8000', 'Ausserordentlicher Ertrag', 'Ertrag');
