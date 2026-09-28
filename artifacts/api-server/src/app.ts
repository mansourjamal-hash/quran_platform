import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({origin:true,credentials:true}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// In production the API and the web app share one origin, which keeps
// authentication cookies simple and gives every center one common URL.
const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = process.env.WEB_ROOT || path.resolve(here, "../../quran-memorization-platform/dist/public");
app.use(express.static(webRoot));
app.get(/^(?!\/api(?:\/|$)).*/, (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path === "/api") return next();
  res.sendFile(path.join(webRoot, "index.html"), (err) => { if (err) next(err); });
});

export default app;
