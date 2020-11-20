var fs = require('fs');
var _ = require('lodash');


var colors = [
  '#849FCD',
  '#DCA366',
  '#D1CA89',
  '#CC6E70',
  '#8D9292',
  '#9474AD',
  '#AD7767',
  '#D1CA89',
  '#849FCD',
  '#DCA366',
  '#D1CA89',
  '#CC6E70',
  '#8D9292'
]

if(typeof window !== 'undefined')
  var Chart = require('chart.js');


//

function handleFile() {
    var preview = document.getElementById('prv')
    reader = new FileReader();
    var file = document.getElementById('fi').files[0];
    var div = document.body.appendChild(document.createElement("div"));
    console.log('file',file);

    reader.onload = function(e) {
      var output = e.target.result;
      var json = extract(output);

      createGraph('bynames', messageByUsers(json));
      createGraph('bydate', dayDistribution(json), { type: 'line', backgroundColor: colors[2]});
      createGraph('byday', weekDayDistribution(json), { title: "number of message by weekday", backgroundColor: colors[0]} );
      createGraph('byhour', hourDistribution(json), { title: "number of message by hours", backgroundColor: colors[1]} );
      createGraph('message_length', byMessageLength(json), { title: "by mean message length"} );
      createGraph('words', mostCommonWords(json), { type: 'horizontalBar', backgroundColor: colors[5], title: 'Most commons words' });
    }
    reader.readAsText(file);

    //div.innerHTML = file.getAsText("utf-8");
}

function run() {
  var json = extract(fs.readFileSync('_chat.txt').toString());

  console.log("Number of message", json.length);
  console.log(messageByUsers(json));
  console.log(dayDistribution(json));
  console.log(weekDayDistribution(json));
  console.log(hourDistribution(json));
  console.log(byMessageLength(chat));
  console.log(mostCommonWords(chat));
}







function createGraph(name, aggregation, options) {
  var ctx = document.getElementById(name);
  console.log(ctx);

  options = options || {};
  var type = options.type || 'bar';
  var title = options.title || '# number of messages';


  var backgroundColor = options.backgroundColor ||  colors;

  var myChart = new Chart(ctx, {
      type: type,
      data: {
        labels: _.map(aggregation,"bucket"),
        datasets: [{
            label: title,
            data: _.map(aggregation,"value"),
            backgroundColor: backgroundColor,
        }]
      },
      scales: {
        yAxes: [{
          display: true,
          ticks: {
            min: 0,
            beginAtZero: true
          }
        }],
      },
    });
}






var weekday=new Array(7);
weekday[0]="Monday";
weekday[1]="Tuesday";
weekday[2]="Wednesday";
weekday[3]="Thursday";
weekday[4]="Friday";
weekday[5]="Saturday";
weekday[6]="Sunday";

//url sharing
// mean message length
// moste used words
// most users words by players
// most uncommonly common words by players
// number of emoticons by players
// Most uses emoticons


function extract(file) {
  regexp = /([0-9]{2}\/[0-9]{2}\/[0-9]{4})/
  var split = file.split(regexp)
  var messages = [];
  for(i = 1; i< split.length; i +=2) {
    messages.push(split[i] + split[i+1]);
  }

  //console.log(messages);


  chat = messages.map(function (line) {
    return parseLine(line);
  })
  chat = _.compact(chat);


  return chat;

}

function toCsv(chat) {
  chat.forEach(function (c) {
    console.log(c.name + ',' + c.date + ',' + c.hour);
  })
}

function parseLine(line) {
  var match = line.match(/([0-9]{2}\/[0-9]{2}\/[0-9]{4}) ([0-9]{2}:[0-9]{2}:[0-9]{2})\]([^:]*):(.*)/)
  console.log(line);
  if(!match)
    return

  return {
    date: match[1],
    hour: match[2],
    name: match[3],
    message: match[4],
  }
}



function numberOfMessage(chat) {
  // number of message
  return chat.length;
}



function messageByUsers(chat) {
  // distribution by users
  return aggregate(chat, "name");
}


function hourDistribution(chat) {
  return aggregate(chat, function (obj) {
    return parseInt(obj.hour.match(/([0-9]{2}):.*/)[1]);
  });
}

function byMessageLength(chat) {
  return aggregate(chat, "name", function (messages) {
    return  _.meanBy(messages, function (m) {
      return m.message.split(' ').length;
    });
  })
}

function weekDayDistribution(chat) {
  return aggregate(chat, function (obj) {
    var date = new Date(obj.date.slice(3,5) + '/' + obj.date.slice(0,2) + '/' + obj.date.slice(6,10));

    var day = date.getDay();
    return weekday[date.getDay()];
  });
}

function dayDistribution(chat) {
  return aggregate(chat, 'date');
}

function mostCommonWords(chat) {
  var text = _.map(chat, "message");
  //_.each(text, x => console.log(x.message));
  text = text.join(' ');
  text = text.replace("<image absente>", '');
  //console.log(text);
  //text = _.lowerCase(text);
  text = _.toLower(text);
  //console.log(text);
  text = text.split(/[ \']/);
  //text = _.map(text, _.lowerCase);
  text = _.countBy(text, x => x);
  text = _.entries(text);
  text = _.sortBy(text, x => x[1]).reverse();
  text = _.filter(text, x => x[0].length > 5);
  text = text.slice(1,20);
  var aggregation = {};

  return text.map(function (t) {
    return {
      bucket: t[0],
      value: t[1],
    }
  })
}




function aggregate(array, property, method) {
  var grouped = _.groupBy(array, property);
  return _.map(grouped, function (items, bucket) {
    if(!method)
      return {
        bucket: bucket,
        value:  items.length,
      }
    return {
      bucket: bucket,
      value: method(items),
    }
  });
}

//toCsv(chat);
if( typeof window === 'undefined' )
  run();
else {
  const button = document.getElementById("button");
  button.onclick = handleFile;
}



