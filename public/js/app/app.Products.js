(function() {
	'use strict'

	angular
		.module("app")
		.controller("ProductsController", ProductsController);

	ProductsController.$inject = ['$location', 'api'];

	function ProductsController($location, api) {
		var vm = this;
		vm.products = new api.Product.query();
		vm.showProduct = function(id) { $location.path("/products/" + id); };
	};
})();
