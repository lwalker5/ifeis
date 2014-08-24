IFeis.Router.map(function() {
	this.resource('feises', { path: '/'});
	this.resouce('feis', {path: '/:feis_id'});
});

IFeis.FeisesRoute = Ember.Route.extend({
	model: function(){
		//data from server
		return this.store.find('feises');
	}
});

IFeis.FeisRoute = Ember.Route.extend({
	model: function(params){
		return this.store.find('post',params.feis_id);
	}
})