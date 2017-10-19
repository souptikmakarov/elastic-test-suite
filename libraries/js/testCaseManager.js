$(function() {
	var iconArr = {"loading": "libraries/img/loading.gif", "passed":"libraries/img/check.svg", "failed":"libraries/img/cross.png"};
	var stepNo, testCaseNo;

	my.TestScenarios = function () {
		this.Name = ko.observable();
		this.Condition = ko.observable();
		this.TestScenarioStatus = ko.observable("loading");
	};

	my.Steps = function () {
		this.Name = ko.observable();
		this.RequestType = ko.observable();
		this.Url = ko.observable();
		this.RequestBody = ko.observable();
		this.TestScenarios = ko.observableArray([]);
	};

	my.Task = function(){
		this.Name = ko.observable();
		this.Id = ko.observable();
		this.Steps = ko.observableArray([]);
		this.TaskScenarioStatus = ko.observable(iconArr["loading"]);
	};

	// ko.components.register('testCaseViewTemplate', {
	//     viewModel: my.viewModel,
	//     template: {fromUrl: "testCaseTemplate.html"}
	// });

	my.viewModel = {
		taskList: ko.observableArray([]),
		isTestCasesLoaded: ko.observable(false),
		isTestCasesFound: ko.observable(false),
		templateToLoad: ko.observable("testCaseViewTemplate"),
		toEditTestCase: ko.observable(),
		toCreateTestCase: ko.observable(),
		getAppendedString: function(param1, param2, param3 = "", param4 = "") {
			return param1 + param2 + param3 + param4;
		},
		loadTests: function () {
			my.viewModel.taskList([]);
			my.elasticService.search("testtool", {}, function (response) {
				if(response != null || response.hits.hits.total == 0){
					testCaseNo = response.hits.hits.length + 1;
					response.hits.hits.forEach(function(e){
						var temp = e._source;
						var steps = new Array();
						var testScenarios = new Array();
						temp.Steps.forEach(function(s){
							s.TestScenarios.forEach(function(ts){
								testScenarios.push(new my.TestScenarios()
									.Name(ts.Name)
									.Condition(ts.Condition)
									.TestScenarioStatus(ts.TestScenarioStatus));
							});
							steps.push(new my.Steps()
								.Name(s.Name)
								.RequestBody(s.RequestBody)
								.Url(s.Url)
								.RequestType(s.RequestType)
								.TestScenarios(testScenarios));
							testScenarios = new Array();
						});
						var task = new my.Task()
							.Id(temp.Id)
							.Name(temp.Name)
							.Steps(steps)
							.TaskScenarioStatus(iconArr["loading"]);
						my.viewModel.taskList.push(task);
						// console.log(task);
					});
					// console.log(my.viewModel.taskList());
					my.viewModel.isTestCasesFound(true);
				}
				my.viewModel.isTestCasesLoaded(true);
				// console.log(my.viewModel.isTestCasesLoaded());

			});
		},
		editUser: function(id){
			// console.log(id);
			my.elasticService.search("testtool", {"query": {"match": {"Id": id}}}, function(response){
				// console.log(response);
				if(response != null){
					response.hits.hits.forEach(function(e){
						var temp = e._source;
						var steps = new Array();
						var testScenarios = new Array();
						stepNo = temp.Steps.length + 1;
						// console.log(stepNo);
						temp.Steps.forEach(function(s){
							s.TestScenarios.forEach(function(ts){
								testScenarios.push(new my.TestScenarios()
									.Name(ts.Name)
									.Condition(ts.Condition)
									.TestScenarioStatus(ts.TestScenarioStatus));
							});
							steps.push(new my.Steps()
								.Name(s.Name)
								.RequestBody(s.RequestBody)
								.Url(s.Url)
								.RequestType(s.RequestType)
								.TestScenarios(testScenarios));
						});
						var task = new my.Task()
							.Id(temp.Id)
							.Name(temp.Name)
							.Steps(steps)
							.TaskScenarioStatus(iconArr["loading"]);
						my.viewModel.toEditTestCase(task);
					});
					my.viewModel.templateToLoad("testCaseEditTemplate");
				}
			});
		},
		deleteUser: function(id){
			my.elasticService.deleteUser("testtool", {"query": {"term": {"Id": id}}}, function(response){
				if(response.deleted == 1){
					alert("Test Case deleted successfully");
				}
				location.reload();
			});    
		},
		addTestScenario: function(id) {
			console.log(my.viewModel.toCreateTestCase().Steps()[id]);
			my.viewModel.toCreateTestCase().Steps()[id].TestScenarios().push(new my.TestScenarios()
			.Name("")
			.Condition("")
			.TestScenarioStatus(""));
			my.viewModel.templateToLoad("emptyTemplate");
			my.viewModel.templateToLoad("testCaseCreateTemplate");
		}
	};


	$(document).on('click', '#addStep', function(event) {
		var newTestScenarios = new Array();
		newTestScenarios.push(new my.TestScenarios()
			.Name("")
			.Condition("")
			.TestScenarioStatus(""));
		var newStep = new my.Steps()
			.Name("step" + stepNo)
			.RequestBody("")
			.Url("")
			.RequestType("")
			.TestScenarios(newTestScenarios);
		stepNo++;
		my.viewModel.toEditTestCase().Steps.push(newStep);
	});

	$(document).on('click', '#updateTestCase', function(event) {
		console.log(ko.toJSON(my.viewModel.toEditTestCase()));
		// my.elasticService.update("testtool", )
	});
	
	$(document).on('click', '#addTestCase', function(event) {
		stepNo = 1;
		var newTestScenarios = new Array();
		newTestScenarios.push(new my.TestScenarios()
				.Name("")
				.Condition("")
				.TestScenarioStatus(""));
		var newSteps = new Array();
		newSteps.push(new my.Steps()
			.Name("step" + stepNo)
			.RequestBody("")
			.Url("")
			.RequestType("")
			.TestScenarios(newTestScenarios));
		stepNo++;
		var newTestCase = new my.Task()
			.Id((testCaseNo || 0))
			.Name("Test Case " + (testCaseNo || 0))
			.Steps(newSteps)
			.TaskScenarioStatus(iconArr["loading"]);
		my.viewModel.toCreateTestCase(newTestCase);
		my.viewModel.templateToLoad("testCaseCreateTemplate");
	});

	$(document).on('click', '#addStepToInsert', function(event) {
		var newTestScenarios = new Array();
		newTestScenarios.push(new my.TestScenarios()
			.Name("")
			.Condition("")
			.TestScenarioStatus(""));
		var newStep = new my.Steps()
			.Name("step" + stepNo)
			.RequestBody("")
			.Url("")
			.RequestType("")
			.TestScenarios(newTestScenarios);
		stepNo++;
		my.viewModel.toCreateTestCase().Steps.push(newStep);
	});

	$(document).on('click', '#insertTestCase', function(event) {
		var data = ko.toJSON(my.viewModel.toCreateTestCase());
		// console.log(data);
		my.elasticService.insert("testtool", data, function(response){
			if (response.created == true) {
				alert("New test case added successfully");
				my.viewModel.templateToLoad("testCaseViewTemplate");
				location.reload();
			}
		});
	});





	// my.elasticService.testPing();
	my.viewModel.loadTests();
	// my.elasticService.search("testtool", {"query": {"match": {"Id": "2"}}}, function(resp){
	// 	console.log(resp);
	// });
	ko.applyBindings(my.viewModel);
});