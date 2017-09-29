(function() {
	'use strict'
	
	angular
		.module("app")
		.factory("api", api);
		
	api.$inject = ['$resource'];
	
	function api($resource) {
		return {
			Product: $resource("/api/products/:id", {id: "@id"},
				{ 'update': { method: "PUT" } }),
			Customer: $resource("/api/customers/:id", {id: "@id"},
				{ 'update': { method: "PUT" } }),
			Invoice: $resource("/api/invoices/:id", {id: "@id"},
				{ 'update': { method: "PUT" } }),
			InvoiceItems: $resource("/api/invoices/:invoice_id/items/:id", 
				{ invoice_id: "@invoice_id", 
				  id: "@id" },
				{ 'update': { method: "PUT" } })
		};
	};
})();