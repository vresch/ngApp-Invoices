(function() {
	'use strict'

	angular
		.module("app")
		.controller("CustomersController", CustomersController);

	CustomersController.$inject = ['$location', 'api'];

	function CustomersController($location, api) {
		var vm = this;
		vm.customers = new api.Customer.query();
		vm.showCustomer = function(id) { $location.path("/customers/" + id); };
	};
})();
