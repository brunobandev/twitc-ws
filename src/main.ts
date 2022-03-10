import * as http from "http";
import * as dotenv from "dotenv";
import { WebSocket } from "ws";

dotenv.config();

type Message = {
  [key: string]: string;
};

const defaultMessage: Message = {
  username: "",
  type: "",
  channel: "",
  message: "",
};

const channels: Array<string> = ["danielhe4rt", "flaviojmendes"];
const MESSAGE_REGEX =
  /^:.+!.+@(?<username>[A-z0-9]+).tmi.twitch.tv (?<type>[A-Z]+) #(?<channel>[A-z0-9]+) :(?<message>.+)/;

http
  .createServer(() => {
    const client = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    client.onopen = () => {
      client.send(`PASS ${process.env.TWITCH_OAUTH_PASS}`);
      client.send(`NICK ${process.env.TWITCH_YOUR_USERNAME}`);

      channels.forEach((channel) => {
        client.send(`JOIN #${channel}`);
        console.log(`Reading #${channel}...`);
      });
    };

    client.onmessage = (event) => {
      const match = MESSAGE_REGEX.exec(String(event.data));
      const { username, type, channel, message }: Message =
        match?.groups || defaultMessage;

      if (message.length === 0) return;
      console.log(`${type} #${channel} ${username}: ${message}`);
    };
  })
  .listen(4001);
