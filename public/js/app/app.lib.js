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