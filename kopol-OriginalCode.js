
var csv = require( "fast-csv" );
var ml = require('machine_learning');
var request = require('request');

var features=[];
var effectivness=[];

module.exports = {
  getChartPeformance: function(message, callback)
  {
    csv.fromStream(request("http://bahadorsaket.com/others/ranking.csv"))
      .on('data', function(csvrow) {
         features.push([csvrow[0],csvrow[1],csvrow[2],csvrow[3]]);
         effectivness.push(csvrow[4]);
      })
      .on('end',function() {
         callback(getRecommendations(message));
      });
  }
}


function getRecommendations(message){
  var charts= ["PieChart","BarChart","LineChart","Scatterplot","Table"];

    var dt = new ml.DecisionTree({
      data : features,
      result : effectivness
  });

    dt.build();

    var VisRanking= {};
    for(i=0;i<message.length;i++)
    {
      for(j=0;j<charts.length;j++)
      {
        // console.log(dt.classify([message[i][0],message[i][1],message[i][2],charts[j]]))
        if(message[i][1] != "Numerical" && message[i][1] != "Nominal" && message[i][1] != "Ordinal")
        {
          console.log("Parameter 2 is incorrect! Accepted data attributes [Ordinal,Nominal,Numerical]");
        }
        if(message[i][2] != "Numerical" && message[i][2] != "Nominal" && message[i][2] != "Ordinal")
        {
          console.log("Parameter 3 is incorrect! Accepted data attributes [Ordinal,Nominal,Numerical]");
        }

        if(message[i][1] == "Numerical" || message[i][2] == "Numerical")
        {
          if(message[i][2] != "Numerical")
          {
            message[i][1] = message[i][2];
            message[i][2] = "Numerical";
          }
        }
        else
        {
          if(message[i][1] == "Ordinal" && message[i][2] == "Nominal")
          {
            message[i][1] = "Nominal";
            message[i][2] = "Numerical";
          }
          if(message[i][1] == "Ordinal" && message[i][2] == "Ordinal")
          {
            message[i][1] = "Ordinal";
            message[i][2] = "Numerical";

          }
          if(message[i][1] == "Nominal" && message[i][2] == "Nominal")
          {
            message[i][1] = "Nominal";
            message[i][2] = "Numerical";
          }
          if(message[i][1] == "Nominal" && message[i][2] == "Ordinal")
          {
            message[i][1] = "Nominal";
            message[i][2] = "Numerical";
          }
        }

        var rank = calculateRanking(dt.classify([message[i][0],message[i][1],message[i][2],charts[j]]))
        name = charts[j];
        VisRanking[name] = rank;
      }
      return VisRanking;
    }
    
}

function calculateRanking(obj){
  var rank=0;
  for(key in obj)
  { 
    if(key=="Very Good") rank = rank + (3* obj["Very Good"]);
    if(key=="Good") rank = rank + (2* obj["Good"])
  if(key=="OK") rank = rank + (1* obj["OK"])
  if(key=="Bad") rank = rank + (-2* obj["Bad"])
  if(key=="Very Bad") rank = rank + (-3* obj["Very Bad"])
  }
  return rank;
}
