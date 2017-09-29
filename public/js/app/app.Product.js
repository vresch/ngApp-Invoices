(function() {
	'use strict'

	angular
		.module("app")
		.controller("ProductController", ProductController);

	ProductController.$inject = ['$stateParams', 'api'];

	function ProductController($stateParams, api) {
		var vm = this;
		var productId = Number($stateParams.id);
		vm.product = new api.Product.get({ id: productId });
		vm.updateProduct = updateProduct;

		function updateProduct() {
			vm.product.$update(
				{
					name: vm.product.name,
					price: Number(vm.product.price)
				}
			);
		};
	};
})();
