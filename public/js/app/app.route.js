(function() {
	'use strict'

	angular
		.module("app")
		.config(config);

	config.$inject = ['$stateProvider', '$urlRouterProvider'];

	function config($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.when('/', '/invoices/list');
		$urlRouterProvider.when('/invoices', '/invoices/list');
		$urlRouterProvider.when('/customers', '/customers/list');
		$urlRouterProvider.when('/products', '/products/list');
		$urlRouterProvider.otherwise('/');

		$stateProvider
		.state("products", {
			abstract: true,
			url: "/products",
			controller: "ProductsController",
			controllerAs: "vm",
			template: "<ui-view />"
		})
			.state("products.list", {
				url: "/list",
				templateUrl: "/products.html"
			})
			.state("products.details", {
				url: "/:id",
				controller: "ProductController",
				controllerAs: "vm",
				templateUrl: "/product.html"
			})
			.state("customers", {
				abstract: true,
				url: "/customers",
				controller: "CustomersController",
				controllerAs: "vm",
				template: "<ui-view />"
			})
			.state("customers.list", {
				url: "/list",
				templateUrl: "/list.html"
			})
			.state("customers.details", {
				url: "/:id",
				controller: "CustomerController",
				controllerAs: "vm",
				templateUrl: "/customer.html"
			})
			.state("invoices", {
				abstract: true,
				url: "/invoices",
				controller: "InvoicesController",
				controllerAs: "vm",
				template: "<ui-view />"
			})
			.state("invoices.list", {
				url: "/list",
				templateUrl: "/invoices.html"
			})
			.state("invoices.details", {
				url: "/:id",
				controller: "InvoiceController",
				controllerAs: "vm",
				templateUrl: "/invoice.html"
			})
	};
})();
