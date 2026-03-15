import {
  defineConfig
} from "../../../chunk-3GKGWDKU.mjs";
import "../../../chunk-DEKBIM76.mjs";
import {
  init_esm
} from "../../../chunk-CEGEFIIW.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "tr_dev_replace_me",
  maxDuration: 3600,
  dirs: ["./src/modules/reports/workflows", "./src/modules/fees/workflows"],
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
