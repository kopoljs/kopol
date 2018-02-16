
function readData(callback){
   var features=[];
  var effectivness=[];
 
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", function(){
    allText =this.responseText;
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');

    for (var i=1; i<allTextLines.length; i++) {
      var data = allTextLines[i].split(',');
      if (data.length == headers.length) {
          features.push([data[0],data[1],data[2],data[3]]);
          effectivness.push(data[4])
      }
    }
    callback(effectivness, features);
  })
  oReq.open("GET","http://bahadorsaket.com/others/ranking.csv");
  oReq.send();
}


function getChartPeformance(message,callback){
 
  readData(function(effectivness, features){
    var dt = new ml.DecisionTree({
        data : features,
        result : effectivness
    });
    dt.build();
    var ranking = getRecommendations(message, features,effectivness,dt);
    callback(ranking);
  })
}

function checkTaskValidity(task){
  if(task == "Retrieve" || task == "Anomalies" || task == "Cluster"  ||task == "Correlations" ||task == "Derived" ||task == "Distribution" ||
     task == "Extremum" ||task == "Filter" ||task == "Order" || task == "Range")
    return true;
  else
    return false;
}

function getRecommendations(message, features, effectivness, model,callback){

  var charts= ["PieChart","BarChart","LineChart","Scatterplot","Table"];
      VisRanking= {};
      for(j=0;j<charts.length;j++)
      {
        if(message[1] != "Numerical" && message[1] != "Nominal" && message[1] != "Ordinal")
        {
          console.log("Parameter 2 is incorrect! Accepted data attributes [Ordinal,Nominal,Numerical]");
        }
        if(message[2] != "Numerical" && message[2] != "Nominal" && message[2] != "Ordinal")
        {
          console.log("Parameter 3 is incorrect! Accepted data attributes [Ordinal,Nominal,Numerical]");
        }

        if(message[1] == "Numerical" || message[2] == "Numerical")
        {
          if(message[2] != "Numerical")
          {
            message[1] = message[2];
            message[2] = "Numerical";
          }
        }
        else
        {
          if(message[1] == "Ordinal" && message[2] == "Nominal")
          {
            message[1] = "Nominal";
            message[2] = "Numerical";
          }
          if(message[1] == "Ordinal" && message[2] == "Ordinal")
          {
            message[1] = "Ordinal";
            message[2] = "Numerical";

          }
          if(message[1] == "Nominal" && message[2] == "Nominal")
          {
            message[1] = "Nominal";
            message[2] = "Numerical";
          }
          if(message[1] == "Nominal" && message[2] == "Ordinal")
          {
            message[1] = "Nominal";
            message[2] = "Numerical";
          }
        }
        var rank = calculateRanking(model.classify([message[0],message[1],message[2],charts[j]]))
        name = charts[j];
        VisRanking[name] = rank;
      }
      if(checkTaskValidity(message[0]))
      {
        return Object.keys(VisRanking).sort(function(a,b){return VisRanking[b]-VisRanking[a]});
      }
      else{
        return ["Invalid task type! Please pick a task first."];
      }
}

function calculateRanking(obj){
  var rank=0;
  for(key in obj)
  { 
    if(key=="Very Good") rank = rank + (3* obj["Very Good"]);
    if(key=="Good") rank = rank + (2* obj["Good"]);
    if(key=="OK") rank = rank + (1* obj["OK"]);
    if(key=="Bad") rank = rank + (-2* obj["Bad"]);
    if(key=="Very Bad") rank = rank + (-3* obj["Very Bad"]);
  }
  return rank;
}
