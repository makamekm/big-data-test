const ndjson = require("ndjson");
const pump = require("pump");
const createHotPromise = require("./hot-promise");
const swarm = require("./swarm");

module.exports = ({
  key,
  isMain,
  protocol,
  onData,
  onConnection,
  onDisconnection,
  minConnections,
}) => {
  minConnections = minConnections || 1;

  const outcomeToAll = ndjson.serialize();
  const connectionMap = new Map();
  const waitForMinConnections = createHotPromise();
  const checkMinConnections = () => {
    if (
      !waitForMinConnections.resolved() &&
      connectionMap.size >= minConnections
    ) {
      waitForMinConnections.resolve();
    }
  };

  const main = swarm({
    key: key,
    isMain: isMain,
    protocol: protocol,
    onConnection: (socket) => {
      const outcome = ndjson.serialize();
      const income = ndjson.parse();
      const connection = {
        socket,
        outcome,
        income,
      };
      onData && income.on("data", (data) => onData(data, connection));
      pump(outcome, socket, income);
      pump(outcomeToAll, socket);
      connectionMap.set(socket, connection);
      checkMinConnections();
      onConnection && onConnection(connection);
    },
    onDisconnection: (socket) => {
      const connection = connectionMap.get(socket);
      connectionMap.delete(socket);
      onDisconnection && onDisconnection(connection);
    },
  });

  return {
    main,
    connectionMap,
    outcomeToAll,
    waitForMinConnections: () => waitForMinConnections,
  };
};
