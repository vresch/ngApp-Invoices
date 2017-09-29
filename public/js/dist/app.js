(function() {
	'use strict'

	angular
		.module("app", [
			"ngResource",
			"ui.router"
		])
})();

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

(function() {
	'use strict'

	angular
		.module("app")
		.directive("dirCustomer", CustomerDirective);

	function CustomerDirective() {
		return {
      restrict: "EA",
      templateUrl: "/customers.html"
    }
	};
})();

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

(function() {
	'use strict'
	
	angular
		.module("app")
		.factory("lib", lib);
		
	function lib() {
		var lib = {};
		
		lib.calcTotal = function (items, discount) {
			if (items) {
				var total = 0;
				for(var item of items) {
					total += item.price * Number(item.quantity);
				}
				total -= total * (Number(discount) * 0.01);
				
				return total.toFixed(2);
			}
			else return 0;
		}
			
		return lib;
	};
})();
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
