(function() {
	'use strict'

	angular
		.module("app")
		.controller("InvoiceController", InvoiceController);

	InvoiceController.$inject = ['$stateParams', '$location', 'api', 'lib'];

	function InvoiceController($stateParams, $location, api, lib) {
		var vm = this;
		vm.customers = new api.Customer.query();
		vm.products = new api.Product.query();
		vm.updateCustomer = updateCustomer;
		vm.updateItem = updateItem;
		vm.updateTotal = updateTotal;
		vm.selectProduct = selectProduct;
		vm.deselectProduct = deselectProduct;

		activate();

		//if location with id => query db for existing invoice, else - create new empty invoice
		function activate() {
			if ($stateParams.id) {
				var invoiceId = Number($stateParams.id);
				vm.invoice = new api.Invoice.get({ id: invoiceId }, function() {
					vm.customer = new api.Customer.get({ id: vm.invoice.customer_id }); //creating selected customer
				});

				//creating selected products collection
				vm.invoiceItems = new api.InvoiceItems.query({ invoice_id: invoiceId }, function() {
					vm.invoiceItems.reduce(function(p, invoiceItem) {
						return p.then(function() {
							return api.Product.get({ id: invoiceItem.product_id }, function(product) {
								invoiceItem.name = product.name;
								invoiceItem.price = product.price;
								//remove item from product list
								var removeIndex = vm.products.map(function(i) { return i.id; }).indexOf(invoiceItem.product_id);
								~removeIndex && vm.products.splice(removeIndex, 1);
							});
						});
					}, Promise.resolve()
					);
				});
			} else {
				//creating empty invoice instance
				vm.invoice = new api.Invoice;
				vm.invoice.discount = 0;
				vm.invoice.total = 0.00;
				vm.invoice.$save(function() {
					vm.invoiceItems = new api.InvoiceItems.query({ invoice_id: vm.invoice.id }); //creates invoices's products collection
					vm.customer = new api.Customer;	//creating selected customer instance
				});
			};
		};

		//update selected customer
		function updateCustomer() {
			//update (PUT) invoice's customer_id in db
			vm.invoice.customer_id = vm.customer.id;
			vm.invoice.$update(
				{
					customer_id: vm.invoice.customer_id
				}
			);
		};

		//move product from products collection to invoiceItems collection
		function selectProduct(item) {
			if (item) {
				var itemSelected = new api.InvoiceItems({
					invoice_id: Number(vm.invoice.id),
					product_id: item.id,
					quantity: 1
				});
				vm.invoiceItems.push(itemSelected);
				var index = vm.invoiceItems.indexOf(itemSelected);
				itemSelected.$save(function() {
					vm.invoiceItems[index].name = item.name;
					vm.invoiceItems[index].price = item.price;

					vm.updateTotal();
				});

				//remove item from products list
				var removeIndex = vm.products.map(function(i) { return i.id; }).indexOf(item.id);
				~removeIndex && vm.products.splice(removeIndex, 1);
			};
		};

		//move product from invoiceItems collection to products collection
		function deselectProduct(item) {
			if (item) {
				var itemSelected = new api.Product({
					id: item.id,
					name: item.name,
					price: item.price
				});
				vm.products.push(itemSelected);

				//remove item from invoiceItems list
				var removeIndex = vm.invoiceItems.map(function(i) { return i.id; }).indexOf(item.id);
				vm.invoiceItems[removeIndex].$delete(function() {
					~removeIndex && vm.invoiceItems.splice(removeIndex, 1);
					vm.updateTotal();
				});
			};
		};

		//update selected product info
		function updateItem(item) {
			var name = item.name;
			var price = item.price;
			var index = vm.invoiceItems.indexOf(item);
			vm.invoiceItems[index].quantity = Number(item.quantity);
			vm.invoiceItems[index].$update(
				{
					quantity: vm.invoiceItems[index].quantity
				}, function() {
					vm.invoiceItems[index].name = name;
					vm.invoiceItems[index].price = price;

					vm.updateTotal();
				}
			);
		};

		//update total
		function updateTotal() {
			vm.invoice.total = lib.calcTotal(vm.invoiceItems, vm.invoice.discount);
			vm.invoice.$update(
				{
					discount: Number(vm.invoice.discount),
					total: Number(vm.invoice.total)
				}
			);
		};

	};
})();
