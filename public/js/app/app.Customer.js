(function() {
	'use strict'
	
	angular
		.module("app")
		.controller("CustomerController", CustomerController);
		
	CustomerController.$inject = ['$stateParams', 'api'];
	
	function CustomerController($stateParams, api) {
		var vm = this;
		var customerId = Number($stateParams.id);
		vm.customer = new api.Customer.get({ id: customerId });
		vm.updateCustomer = updateCustomer;
		
		function updateCustomer() {
			vm.customer.$update(
				{
					name: vm.customer.name,
					address: Number(vm.customer.address),
					phone: vm.customer.phone
				}
			);
		};
	};
})();