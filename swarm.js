const hyperswarm = require("hyperswarm");
const topicGen = require("./topic");

module.exports = ({ key, isMain, onConnection, onDisconnection, protocol }) => {
  protocol = protocol || "tcp";
  const swarm = hyperswarm(
    isMain
      ? {
          maxPeers: Infinity,
          maxServerSockets: 0,
          maxClientSockets: Infinity,
        }
      : {
          maxPeers: Infinity,
          maxServerSockets: Infinity,
          maxClientSockets: 0,
        }
  );

  const topic = topicGen(key);

  swarm.on("connection", (socket, details) => {
    // if (details.type !== protocol) {
    //   details.backoff();
    //   socket.destroy();
    //   return;
    // }
    if (details.type === protocol) {
      onConnection && onConnection(socket, details);
    }
    // process.stdin.pipe(socket).pipe(process.stdout)
  });

  swarm.on("disconnection", (socket, details) => {
    // if (details.type !== protocol) {
    //   return;
    // }
    if (details.type === protocol) {
      onDisconnection && onDisconnection(socket, details);
    }
  });

  swarm.join(topic, {
    lookup: true,
    announce: true,
  });

  return swarm;
};
