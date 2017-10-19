var my = {};
(function (my) {
	"use strict";
	// var host = 'http://localhost:9200/';
	var host = 'http://sfappvm08:8888/';
	var client = new elasticsearch.Client({
		hosts: host
	});
	function getUrl(path) {
		return host + path;
	}
	my.elasticService = (function () {
		var testPing = function () {
			client.ping({
				requestTimeout: 30000,
			}, function (error) {
				if (error) {
					console.error('elasticsearch cluster is down!');
				} else {
					console.log('All is well');
				}
			});
		},
		search = function (indexName, indexQuery, callback) {

			client.search({
				index : indexName,
				body: indexQuery
			}).then(function (response) {
				callback(response);
			}).catch(function(err){
				if (err.status === 404) {
					console.log("Index not found");
					callback(null);
				} else {
					throw err;
				}
			});
		},
		update = function(indexName, indexQuery, callback){

		},
		insert = function(indexName, indexQuery, callback){
			// console.log(indexQuery);
			client.index({
				index : indexName,
				type : 'testcases',
				body : indexQuery
			}).then(function(response){
				callback(response);
			}).catch(function(err){
				console.log(err);
			});
		},
		deleteUser = function(indexName, indexQuery, callback) {
			client.deleteByQuery({
				index : indexName,
				body : indexQuery
			}).then(function(response){
				callback(response);
			}).catch(function(err){
				console.log(err);
			});
		},
		getRequest = function(url, body, callback) {
			// console.log(getUrl(url));
			$.ajax({
				url: getUrl(url),
				type: 'GET',
				data: body,
				success: function(result,status,xhr){
					// console.log(status);
					callback(result, status);
				},
				error: function(xhr,status,err){
					// console.log(err);
					callback(err, status);
				},
				complete: function(xhr,status){
					// console.log(status);	
				}
			});
			
		},
		postRequest = function(url, body, callback) {
			$.ajax({
				url: getUrl(url),
				type: 'POST',
				data: body,
				success: function(result,status,xhr){
					// console.log(status);
					callback(result, status);
				},
				error: function(xhr,status,err){
					console.log(xhr);
					callback(err, status);
				},
				complete: function(xhr,status){
					// console.log(status);	
				}
			});
		},
		deleteRequest = function(url, body, callback) {
			$.ajax({
				url: getUrl(url),
				type: 'DELETE',
				data: body,
				success: function(result,status,xhr){
					// console.log(status);
					callback(result, status);
				},
				error: function(xhr,status,err){
					callback(err,status);
				},
				complete: function(xhr,status){
					// console.log(status);	
				}
			});
		};
		return {
			testPing: testPing,
			search: search,
			update: update,
			insert: insert,
			deleteUser: deleteUser,
			getRequest: getRequest,
			postRequest: postRequest,
			deleteRequest: deleteRequest
		};
	})();
}(my));