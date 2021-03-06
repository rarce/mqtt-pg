var mqtt = require('mqtt');
var pg = require('pg');
var config = require('config');

var connection = null;
pg.connect(config.get('pgConfig'), function(err, client) {
  if(err) return console.error('error fetching client from pool', err);
  connection = client;
});

var configMqtt = JSON.parse(JSON.stringify(config.get('mqttConfig')));
var client = mqtt.connect(configMqtt);

client.on("message", function(topic, payload) {
  if (topic==config.get('subscribeChannel'))
  connection.query(
    'INSERT INTO '+config.get('pgTable')+' (timestamp, topic, data) VALUES ($1,$2,$3)',
    [new Date(),topic, JSON.parse(payload)],
    function(err, result) {
      // handle an error from the query
      if(err) return console.error('error inserting data', err);
      console.log([topic, payload].join(": "));
    });
});

client.subscribe(config.get('subscribeChannel'));
