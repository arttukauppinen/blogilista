const app = require("./app"); // varsinainen Express-sovellus
const http = require("http");
const config = require("./utils/config");
const logger = require("./utils/logger");
const middleware = require("./utils/middleware");
const server = http.createServer(app);

app.use(middleware.errorHandler);

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
