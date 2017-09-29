(function() {
	'use strict'

	angular
		.module("app")
		.controller("InvoicesController", InvoicesController);

	InvoicesController.$inject = ['$location', 'api'];

	function InvoicesController($location, api) {
		var vm = this;
		vm.invoices = new api.Invoice.query(appendEachName);
		vm.createInvoice = function() { $location.path("/invoices/"); };
		vm.showInvoice = function(id) { $location.path("/invoices/" + id); };

		function appendEachName() {
			vm.invoices.reduce(function(p, invoice) {
				return p.then(function() {
					return api.Customer.get({ id: invoice.customer_id }, function(customer) {
						invoice.name = customer.name;
					});
				});
			}, Promise.resolve());
		};
	};
})();
