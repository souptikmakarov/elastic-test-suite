$(function() {
	var iconArr = {"loading": "libraries/img/loading.gif", "passed":"libraries/img/check.svg", "failed":"libraries/img/cross.png"}
	my.TestScenarios = function () {
		this.Name = ko.observable();
		this.Condition = ko.observable();
		this.TestScenarioStatus = ko.observable(iconArr["loading"]);
	};
	my.Steps = function () {
		this.Name = ko.observable();
		this.RequestType = ko.observable();
		this.Url = ko.observable();
		this.RequestBody = ko.observable();
		this.TestScenarios = ko.observableArray([]);
		this.StepCompletion = ko.observable(iconArr["loading"]);
	};
	my.Task = function(){
		this.Name = ko.observable();
		this.Id = ko.observable();
		this.Steps = ko.observableArray([]);
		this.TaskScenarioStatus = ko.observable(iconArr["loading"]);
	};
	my.viewModel = {
		taskList: ko.observableArray([]),
		isTestCasesLoaded: ko.observable(false),
		isTestCasesFound: ko.observable(false),
		statusIcon: ko.observable(iconArr["failed"]),
		getAppendedString: function(param1, param2, param3 = "", param4 = "") {
			return param1 + param2 + param3 + param4;
		},
		loadTests: function () {
			my.viewModel.taskList([]);
			my.elasticService.search("testtool", {}, function (response) {
				if(response != null){
					response.hits.hits.forEach(function(e){
						var temp = e._source;
						var steps = new Array();
						var testScenarios = new Array();
						temp.Steps.forEach(function(s){
							s.TestScenarios.forEach(function(ts){
								testScenarios.push(new my.TestScenarios()
									.Name(ts.Name)
									.Condition(ts.Condition));
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
							.Steps(steps);
						my.viewModel.taskList.push(task);
						// console.log(task);
					});
					// console.log(my.viewModel.taskList());
					my.viewModel.isTestCasesFound(true);
				}
				
				// debugger;
				
				// console.log(my.viewModel.isTestCasesLoaded());
				my.viewModel.isTestCasesLoaded(true);
				// console.log(my.viewModel.isTestCasesLoaded());

			});
		},
		runTest: function(id) {
			var task_to_run = my.viewModel.taskList()[id];
			var taskExecResult = true;
			var stepCnt = task_to_run.Steps().length;
			// console.log(task_to_run.Steps());
			var stepsRunner = function(i){
				var stepIndex = i || 0;
				// console.log(step);
				if(stepIndex < stepCnt){
					step = task_to_run.Steps()[stepIndex];
					switch(step.RequestType().toUpperCase()){
						case "GET":
							// console.log("In GET");
							my.elasticService.getRequest(step.Url(), step.RequestBody(), runTestScenarios);
							break;
						case "POST":
							// console.log("In POST");
							my.elasticService.postRequest(step.Url(), step.RequestBody(), runTestScenarios);
							break;
						case "DELETE":
							// console.log("In DELETE");
							my.elasticService.deleteRequest(step.Url(), step.RequestBody(), runTestScenarios);
							break;
						default:
							console.log("No method found to handle RequestType");
					}
				}else{
					task_to_run.TaskScenarioStatus(iconArr[taskExecResult ? "passed" : "failed"]);
				}
				
				function runTestScenarios(response, status){
					console.log(response);
					// console.log(status);
					var stepExecResult = true;
					var tsRunner = function(j){
						var tsIndex = j || 0;
						if(tsIndex < step.TestScenarios().length){
							ts = step.TestScenarios()[tsIndex];
							var toRun = ts.Condition();
							// console.log(toRun);
							var execResult;
							try{
								execResult = eval(toRun);
							}catch(e){
								execResult = false;
							}
							ts.TestScenarioStatus(iconArr[execResult ? "passed" : "failed"]);
							stepExecResult = stepExecResult && execResult;
							tsRunner(tsIndex + 1);
						}else{
							step.StepCompletion(iconArr[stepExecResult ? "passed" : "failed"]);
							taskExecResult = taskExecResult && stepExecResult;
							console.log("Called next step");
							setTimeout(function(){stepsRunner(stepIndex + 1)},1000);
						}
					}
					tsRunner();
				}
			}
			stepsRunner();
		}
	};

 	// my.elasticService.postRequest("search-test-case-en/_search", '{    "size": 50,    "query": {       "bool": {            "must" : {             "multi_match" : {                "query" : "inspiron laptop",                "fields" : [ "winsnp.browseproductid", "relevancye^5"],                "operator":   "or"             }          },          "filter": [             {"term": {"country": "us" }},             {"term": {"language":"en"}},             {"terms": {"documenttype": ["stdcfgsc","winsnp"]}}          ]       }    } }', function(response, status){
 	// 	// console.log(eval('response.acknowledged == true || response == "Not Found"'));
 	// 	console.log(response);
 	// 	console.log(status);
 	// });
	// my.elasticService.testPing();
	my.viewModel.loadTests();
	ko.applyBindings(my.viewModel);
});