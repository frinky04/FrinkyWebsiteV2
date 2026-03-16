import { defineConfig } from "vite";
import { generateContent } from "./scripts/generate-content.mjs";

const PAGES_GLOB = /[\\/]pages[\\/].*\.md$/;

function contentPlugin() {
  const rebuild = async (logger) => {
    await generateContent();
    logger?.info("[content] generated markdown content index");
  };

  return {
    name: "markdown-content-generator",
    async configResolved(config) {
      this.__logger = config.logger;
    },
    async buildStart() {
      await rebuild(this.__logger);
    },
    configureServer(server) {
      rebuild(server.config.logger).catch((error) => {
        server.config.logger.error(error?.message || String(error));
      });

      const refresh = async (file) => {
        if (!PAGES_GLOB.test(file)) return;
        try {
          await rebuild(server.config.logger);
          server.ws.send({ type: "full-reload" });
        } catch (error) {
          server.config.logger.error(error?.message || String(error));
        }
      };

      server.watcher.on("add", refresh);
      server.watcher.on("change", refresh);
      server.watcher.on("unlink", refresh);
    },
  };
}

export default defineConfig({
  plugins: [contentPlugin()],
});
