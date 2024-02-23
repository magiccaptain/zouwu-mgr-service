import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://emqx.z-ctyun-stage.36node.com:1883', {
  username: '659493a2334806cb74cbc8d9',
  password:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTk0OTNhMjMzNDgwNmNiNzRjYmM4ZDkiLCJhY2wiOnsicHViIjpbImRldmljZS82NTk0OTNhMjMzNDgwNmNiNzRjYmM4ZDkvaW5wdXRfYXVkaW9fc3RyZWFtIiwiZGV2aWNlLzY1OTQ5M2EyMzM0ODA2Y2I3NGNiYzhkOS9zdGF0ZSJdLCJzdWIiOlsiZGV2aWNlLzY1OTQ5M2EyMzM0ODA2Y2I3NGNiYzhkOS9vdXRwdXRfYXVkaW9fc3RyZWFtIiwiZGV2aWNlLzY1OTQ5M2EyMzM0ODA2Y2I3NGNiYzhkOS9jb21tYW5kIl19LCJpYXQiOjE3MDQyMzU5NTcsImV4cCI6MTcwNDI1NzU1N30.DJsL5LWCcqSUTIzvx_-pXrZ7nmjp4ON_kNix9TESNqYa9ZKRxLhhmqJ_0gksSJDF9V1ANeGUE48qtgeq1QNHHJNKdb3FjXpEhg2tm7iFXpDxweoG4d4OXy6e3K00TVx6tEBx7RrUJtPWflIQVmZ_QI52uF56z_IHfcxx-eZgabI',
});
const client2 = mqtt.connect('mqtt://emqx.z-ctyun-stage.36node.com:1883', {
  username: 'haivivi',
  password: 'Dfe3$2s',
});

console.log('start');

client2.on('connect', () => {
  console.log('client 2 connected');
  client.on('connect', () => {
    console.log('connected');
    client.subscribe('device/659493a2334806cb74cbc8d9/command', (err) => {
      console.log('subscribe');
      if (!err) {
        client2.publish('device/659493a2334806cb74cbc8d9/command', 'Hello mqtt');
        console.log('published');
      } else {
        console.log(err);
      }
    });
  });
});

client.on('message', (topic, message) => {
  // message is Buffer
  console.log(message.toString());
  client.end();
});
