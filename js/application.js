window.IFeis = Ember.Application.create({
	LOG_TRANSITIONS : true,
	LOG_BINDINGS : true,
	LOG_VIEW_LOOPS : true,
	LOG_STACKTRACE_ON_DEPRECIATION : true,
	LOG_VERSION : true,
	debugMode : true
});

IFeis.ApplicationAdapter = DS.FixtureAdapter.extend();