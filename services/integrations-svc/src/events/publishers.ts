// Event publishing is done directly in service and sync methods via publishEvent()
// from @aivo/events. This file documents published events.
//
// Published events:
// - integrations.roster.synced → admin-svc analytics (after any SIS sync)
// - integrations.lti.launch → learning-svc creates session (after LTI launch)
// - identity.user.created (batch via identity-client) → comms-svc sends invitations

export {};
