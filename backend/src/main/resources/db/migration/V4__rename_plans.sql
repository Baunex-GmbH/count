-- Rename plans: Starter→Basis, Professional→Smart, Enterprise→Complete
UPDATE tenant SET plan = 'Basis' WHERE plan = 'Starter';
UPDATE tenant SET plan = 'Smart' WHERE plan = 'Professional';
UPDATE tenant SET plan = 'Complete' WHERE plan = 'Enterprise';
