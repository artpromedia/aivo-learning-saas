// Event publishing is done directly in service methods via publishEvent()
// from @aivo/events. This file serves as documentation of published events.
//
// Published events:
// - admin.tenant.created   → Notifies other services of new tenant
// - admin.tenant.suspended → Notifies other services to block access
// - brain.version.rollout.started → brain-svc processes Brain upgrades
// - brain.version.rollback → brain-svc reverts Brains to snapshots
// - comms.email.send → comms-svc sends lead/nurture/onboarding emails

export {};
