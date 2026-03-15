import {
  __commonJS,
  __name,
  __require,
  __toESM,
  init_esm
} from "./chunk-CEGEFIIW.mjs";

// node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/@prisma/client/runtime/library.js
var require_library = __commonJS({
  "node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/@prisma/client/runtime/library.js"(exports, module) {
    "use strict";
    init_esm();
    var yu = Object.create;
    var jt = Object.defineProperty;
    var bu2 = Object.getOwnPropertyDescriptor;
    var Eu = Object.getOwnPropertyNames;
    var wu = Object.getPrototypeOf;
    var xu = Object.prototype.hasOwnProperty;
    var Do = /* @__PURE__ */ __name((e, r) => () => (e && (r = e(e = 0)), r), "Do");
    var ue = /* @__PURE__ */ __name((e, r) => () => (r || e((r = { exports: {} }).exports, r), r.exports), "ue");
    var tr2 = /* @__PURE__ */ __name((e, r) => {
      for (var t in r) jt(e, t, { get: r[t], enumerable: true });
    }, "tr");
    var Oo = /* @__PURE__ */ __name((e, r, t, n) => {
      if (r && typeof r == "object" || typeof r == "function") for (let i of Eu(r)) !xu.call(e, i) && i !== t && jt(e, i, { get: /* @__PURE__ */ __name(() => r[i], "get"), enumerable: !(n = bu2(r, i)) || n.enumerable });
      return e;
    }, "Oo");
    var O2 = /* @__PURE__ */ __name((e, r, t) => (t = e != null ? yu(wu(e)) : {}, Oo(r || !e || !e.__esModule ? jt(t, "default", { value: e, enumerable: true }) : t, e)), "O");
    var vu2 = /* @__PURE__ */ __name((e) => Oo(jt({}, "__esModule", { value: true }), e), "vu");
    var hi = ue((_g, is2) => {
      "use strict";
      is2.exports = (e, r = process.argv) => {
        let t = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", n = r.indexOf(t + e), i = r.indexOf("--");
        return n !== -1 && (i === -1 || n < i);
      };
    });
    var as2 = ue((Ng, ss2) => {
      "use strict";
      var Fc = __require("node:os"), os2 = __require("node:tty"), de = hi(), { env: G2 } = process, Qe;
      de("no-color") || de("no-colors") || de("color=false") || de("color=never") ? Qe = 0 : (de("color") || de("colors") || de("color=true") || de("color=always")) && (Qe = 1);
      "FORCE_COLOR" in G2 && (G2.FORCE_COLOR === "true" ? Qe = 1 : G2.FORCE_COLOR === "false" ? Qe = 0 : Qe = G2.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(G2.FORCE_COLOR, 10), 3));
      function yi2(e) {
        return e === 0 ? false : { level: e, hasBasic: true, has256: e >= 2, has16m: e >= 3 };
      }
      __name(yi2, "yi");
      function bi2(e, r) {
        if (Qe === 0) return 0;
        if (de("color=16m") || de("color=full") || de("color=truecolor")) return 3;
        if (de("color=256")) return 2;
        if (e && !r && Qe === void 0) return 0;
        let t = Qe || 0;
        if (G2.TERM === "dumb") return t;
        if (process.platform === "win32") {
          let n = Fc.release().split(".");
          return Number(n[0]) >= 10 && Number(n[2]) >= 10586 ? Number(n[2]) >= 14931 ? 3 : 2 : 1;
        }
        if ("CI" in G2) return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((n) => n in G2) || G2.CI_NAME === "codeship" ? 1 : t;
        if ("TEAMCITY_VERSION" in G2) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(G2.TEAMCITY_VERSION) ? 1 : 0;
        if (G2.COLORTERM === "truecolor") return 3;
        if ("TERM_PROGRAM" in G2) {
          let n = parseInt((G2.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
          switch (G2.TERM_PROGRAM) {
            case "iTerm.app":
              return n >= 3 ? 3 : 2;
            case "Apple_Terminal":
              return 2;
          }
        }
        return /-256(color)?$/i.test(G2.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(G2.TERM) || "COLORTERM" in G2 ? 1 : t;
      }
      __name(bi2, "bi");
      function Mc(e) {
        let r = bi2(e, e && e.isTTY);
        return yi2(r);
      }
      __name(Mc, "Mc");
      ss2.exports = { supportsColor: Mc, stdout: yi2(bi2(true, os2.isatty(1))), stderr: yi2(bi2(true, os2.isatty(2))) };
    });
    var cs2 = ue((Lg, us2) => {
      "use strict";
      var $c2 = as2(), br2 = hi();
      function ls(e) {
        if (/^\d{3,4}$/.test(e)) {
          let t = /(\d{1,2})(\d{2})/.exec(e) || [];
          return { major: 0, minor: parseInt(t[1], 10), patch: parseInt(t[2], 10) };
        }
        let r = (e || "").split(".").map((t) => parseInt(t, 10));
        return { major: r[0], minor: r[1], patch: r[2] };
      }
      __name(ls, "ls");
      function Ei2(e) {
        let { CI: r, FORCE_HYPERLINK: t, NETLIFY: n, TEAMCITY_VERSION: i, TERM_PROGRAM: o, TERM_PROGRAM_VERSION: s, VTE_VERSION: a2, TERM: l } = process.env;
        if (t) return !(t.length > 0 && parseInt(t, 10) === 0);
        if (br2("no-hyperlink") || br2("no-hyperlinks") || br2("hyperlink=false") || br2("hyperlink=never")) return false;
        if (br2("hyperlink=true") || br2("hyperlink=always") || n) return true;
        if (!$c2.supportsColor(e) || e && !e.isTTY) return false;
        if ("WT_SESSION" in process.env) return true;
        if (process.platform === "win32" || r || i) return false;
        if (o) {
          let u = ls(s || "");
          switch (o) {
            case "iTerm.app":
              return u.major === 3 ? u.minor >= 1 : u.major > 3;
            case "WezTerm":
              return u.major >= 20200620;
            case "vscode":
              return u.major > 1 || u.major === 1 && u.minor >= 72;
            case "ghostty":
              return true;
          }
        }
        if (a2) {
          if (a2 === "0.50.0") return false;
          let u = ls(a2);
          return u.major > 0 || u.minor >= 50;
        }
        switch (l) {
          case "alacritty":
            return true;
        }
        return false;
      }
      __name(Ei2, "Ei");
      us2.exports = { supportsHyperlink: Ei2, stdout: Ei2(process.stdout), stderr: Ei2(process.stderr) };
    });
    var ps = ue((Kg, qc) => {
      qc.exports = { name: "@prisma/internals", version: "6.19.2", description: "This package is intended for Prisma's internal use", main: "dist/index.js", types: "dist/index.d.ts", repository: { type: "git", url: "https://github.com/prisma/prisma.git", directory: "packages/internals" }, homepage: "https://www.prisma.io", author: "Tim Suchanek <suchanek@prisma.io>", bugs: "https://github.com/prisma/prisma/issues", license: "Apache-2.0", scripts: { dev: "DEV=true tsx helpers/build.ts", build: "tsx helpers/build.ts", test: "dotenv -e ../../.db.env -- jest --silent", prepublishOnly: "pnpm run build" }, files: ["README.md", "dist", "!**/libquery_engine*", "!dist/get-generators/engines/*", "scripts"], devDependencies: { "@babel/helper-validator-identifier": "7.25.9", "@opentelemetry/api": "1.9.0", "@swc/core": "1.11.5", "@swc/jest": "0.2.37", "@types/babel__helper-validator-identifier": "7.15.2", "@types/jest": "29.5.14", "@types/node": "18.19.76", "@types/resolve": "1.20.6", archiver: "6.0.2", "checkpoint-client": "1.1.33", "cli-truncate": "4.0.0", dotenv: "16.5.0", empathic: "2.0.0", "escape-string-regexp": "5.0.0", execa: "8.0.1", "fast-glob": "3.3.3", "find-up": "7.0.0", "fp-ts": "2.16.9", "fs-extra": "11.3.0", "global-directory": "4.0.0", globby: "11.1.0", "identifier-regex": "1.0.0", "indent-string": "4.0.0", "is-windows": "1.0.2", "is-wsl": "3.1.0", jest: "29.7.0", "jest-junit": "16.0.0", kleur: "4.1.5", "mock-stdin": "1.0.0", "new-github-issue-url": "0.2.1", "node-fetch": "3.3.2", "npm-packlist": "5.1.3", open: "7.4.2", "p-map": "4.0.0", resolve: "1.22.10", "string-width": "7.2.0", "strip-indent": "4.0.0", "temp-dir": "2.0.0", tempy: "1.0.1", "terminal-link": "4.0.0", tmp: "0.2.3", "ts-pattern": "5.6.2", "ts-toolbelt": "9.6.0", typescript: "5.4.5", yarn: "1.22.22" }, dependencies: { "@prisma/config": "workspace:*", "@prisma/debug": "workspace:*", "@prisma/dmmf": "workspace:*", "@prisma/driver-adapter-utils": "workspace:*", "@prisma/engines": "workspace:*", "@prisma/fetch-engine": "workspace:*", "@prisma/generator": "workspace:*", "@prisma/generator-helper": "workspace:*", "@prisma/get-platform": "workspace:*", "@prisma/prisma-schema-wasm": "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", "@prisma/schema-engine-wasm": "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", "@prisma/schema-files-loader": "workspace:*", arg: "5.0.2", prompts: "2.4.2" }, peerDependencies: { typescript: ">=5.1.0" }, peerDependenciesMeta: { typescript: { optional: true } }, sideEffects: false };
    });
    var Ti2 = ue((gh, Qc) => {
      Qc.exports = { name: "@prisma/engines-version", version: "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", main: "index.js", types: "index.d.ts", license: "Apache-2.0", author: "Tim Suchanek <suchanek@prisma.io>", prisma: { enginesVersion: "c2990dca591cba766e3b7ef5d9e8a84796e47ab7" }, repository: { type: "git", url: "https://github.com/prisma/engines-wrapper.git", directory: "packages/engines-version" }, devDependencies: { "@types/node": "18.19.76", typescript: "4.9.5" }, files: ["index.js", "index.d.ts"], scripts: { build: "tsc -d" } };
    });
    var on = ue((nn) => {
      "use strict";
      Object.defineProperty(nn, "__esModule", { value: true });
      nn.enginesVersion = void 0;
      nn.enginesVersion = Ti2().prisma.enginesVersion;
    });
    var hs = ue((Ih, gs) => {
      "use strict";
      gs.exports = (e) => {
        let r = e.match(/^[ \t]*(?=\S)/gm);
        return r ? r.reduce((t, n) => Math.min(t, n.length), 1 / 0) : 0;
      };
    });
    var Di = ue((kh, Es2) => {
      "use strict";
      Es2.exports = (e, r = 1, t) => {
        if (t = { indent: " ", includeEmptyLines: false, ...t }, typeof e != "string") throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof e}\``);
        if (typeof r != "number") throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof r}\``);
        if (typeof t.indent != "string") throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof t.indent}\``);
        if (r === 0) return e;
        let n = t.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
        return e.replace(n, t.indent.repeat(r));
      };
    });
    var vs2 = ue((jh, tp) => {
      tp.exports = { name: "dotenv", version: "16.5.0", description: "Loads environment variables from .env file", main: "lib/main.js", types: "lib/main.d.ts", exports: { ".": { types: "./lib/main.d.ts", require: "./lib/main.js", default: "./lib/main.js" }, "./config": "./config.js", "./config.js": "./config.js", "./lib/env-options": "./lib/env-options.js", "./lib/env-options.js": "./lib/env-options.js", "./lib/cli-options": "./lib/cli-options.js", "./lib/cli-options.js": "./lib/cli-options.js", "./package.json": "./package.json" }, scripts: { "dts-check": "tsc --project tests/types/tsconfig.json", lint: "standard", pretest: "npm run lint && npm run dts-check", test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000", "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=lcov", prerelease: "npm test", release: "standard-version" }, repository: { type: "git", url: "git://github.com/motdotla/dotenv.git" }, homepage: "https://github.com/motdotla/dotenv#readme", funding: "https://dotenvx.com", keywords: ["dotenv", "env", ".env", "environment", "variables", "config", "settings"], readmeFilename: "README.md", license: "BSD-2-Clause", devDependencies: { "@types/node": "^18.11.3", decache: "^4.6.2", sinon: "^14.0.1", standard: "^17.0.0", "standard-version": "^9.5.0", tap: "^19.2.0", typescript: "^4.8.4" }, engines: { node: ">=12" }, browser: { fs: false } };
    });
    var As = ue((Bh, _e) => {
      "use strict";
      var Fi2 = __require("node:fs"), Mi2 = __require("node:path"), np = __require("node:os"), ip = __require("node:crypto"), op = vs2(), Ts = op.version, sp = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
      function ap(e) {
        let r = {}, t = e.toString();
        t = t.replace(/\r\n?/mg, `
`);
        let n;
        for (; (n = sp.exec(t)) != null; ) {
          let i = n[1], o = n[2] || "";
          o = o.trim();
          let s = o[0];
          o = o.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), s === '"' && (o = o.replace(/\\n/g, `
`), o = o.replace(/\\r/g, "\r")), r[i] = o;
        }
        return r;
      }
      __name(ap, "ap");
      function lp(e) {
        let r = Rs(e), t = B.configDotenv({ path: r });
        if (!t.parsed) {
          let s = new Error(`MISSING_DATA: Cannot parse ${r} for an unknown reason`);
          throw s.code = "MISSING_DATA", s;
        }
        let n = Ss(e).split(","), i = n.length, o;
        for (let s = 0; s < i; s++) try {
          let a2 = n[s].trim(), l = cp(t, a2);
          o = B.decrypt(l.ciphertext, l.key);
          break;
        } catch (a2) {
          if (s + 1 >= i) throw a2;
        }
        return B.parse(o);
      }
      __name(lp, "lp");
      function up(e) {
        console.log(`[dotenv@${Ts}][WARN] ${e}`);
      }
      __name(up, "up");
      function ot2(e) {
        console.log(`[dotenv@${Ts}][DEBUG] ${e}`);
      }
      __name(ot2, "ot");
      function Ss(e) {
        return e && e.DOTENV_KEY && e.DOTENV_KEY.length > 0 ? e.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
      }
      __name(Ss, "Ss");
      function cp(e, r) {
        let t;
        try {
          t = new URL(r);
        } catch (a2) {
          if (a2.code === "ERR_INVALID_URL") {
            let l = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
            throw l.code = "INVALID_DOTENV_KEY", l;
          }
          throw a2;
        }
        let n = t.password;
        if (!n) {
          let a2 = new Error("INVALID_DOTENV_KEY: Missing key part");
          throw a2.code = "INVALID_DOTENV_KEY", a2;
        }
        let i = t.searchParams.get("environment");
        if (!i) {
          let a2 = new Error("INVALID_DOTENV_KEY: Missing environment part");
          throw a2.code = "INVALID_DOTENV_KEY", a2;
        }
        let o = `DOTENV_VAULT_${i.toUpperCase()}`, s = e.parsed[o];
        if (!s) {
          let a2 = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o} in your .env.vault file.`);
          throw a2.code = "NOT_FOUND_DOTENV_ENVIRONMENT", a2;
        }
        return { ciphertext: s, key: n };
      }
      __name(cp, "cp");
      function Rs(e) {
        let r = null;
        if (e && e.path && e.path.length > 0) if (Array.isArray(e.path)) for (let t of e.path) Fi2.existsSync(t) && (r = t.endsWith(".vault") ? t : `${t}.vault`);
        else r = e.path.endsWith(".vault") ? e.path : `${e.path}.vault`;
        else r = Mi2.resolve(process.cwd(), ".env.vault");
        return Fi2.existsSync(r) ? r : null;
      }
      __name(Rs, "Rs");
      function Ps2(e) {
        return e[0] === "~" ? Mi2.join(np.homedir(), e.slice(1)) : e;
      }
      __name(Ps2, "Ps");
      function pp(e) {
        !!(e && e.debug) && ot2("Loading env from encrypted .env.vault");
        let t = B._parseVault(e), n = process.env;
        return e && e.processEnv != null && (n = e.processEnv), B.populate(n, t, e), { parsed: t };
      }
      __name(pp, "pp");
      function dp(e) {
        let r = Mi2.resolve(process.cwd(), ".env"), t = "utf8", n = !!(e && e.debug);
        e && e.encoding ? t = e.encoding : n && ot2("No encoding is specified. UTF-8 is used by default");
        let i = [r];
        if (e && e.path) if (!Array.isArray(e.path)) i = [Ps2(e.path)];
        else {
          i = [];
          for (let l of e.path) i.push(Ps2(l));
        }
        let o, s = {};
        for (let l of i) try {
          let u = B.parse(Fi2.readFileSync(l, { encoding: t }));
          B.populate(s, u, e);
        } catch (u) {
          n && ot2(`Failed to load ${l} ${u.message}`), o = u;
        }
        let a2 = process.env;
        return e && e.processEnv != null && (a2 = e.processEnv), B.populate(a2, s, e), o ? { parsed: s, error: o } : { parsed: s };
      }
      __name(dp, "dp");
      function mp(e) {
        if (Ss(e).length === 0) return B.configDotenv(e);
        let r = Rs(e);
        return r ? B._configVault(e) : (up(`You set DOTENV_KEY but you are missing a .env.vault file at ${r}. Did you forget to build it?`), B.configDotenv(e));
      }
      __name(mp, "mp");
      function fp(e, r) {
        let t = Buffer.from(r.slice(-64), "hex"), n = Buffer.from(e, "base64"), i = n.subarray(0, 12), o = n.subarray(-16);
        n = n.subarray(12, -16);
        try {
          let s = ip.createDecipheriv("aes-256-gcm", t, i);
          return s.setAuthTag(o), `${s.update(n)}${s.final()}`;
        } catch (s) {
          let a2 = s instanceof RangeError, l = s.message === "Invalid key length", u = s.message === "Unsupported state or unable to authenticate data";
          if (a2 || l) {
            let c = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
            throw c.code = "INVALID_DOTENV_KEY", c;
          } else if (u) {
            let c = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
            throw c.code = "DECRYPTION_FAILED", c;
          } else throw s;
        }
      }
      __name(fp, "fp");
      function gp(e, r, t = {}) {
        let n = !!(t && t.debug), i = !!(t && t.override);
        if (typeof r != "object") {
          let o = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
          throw o.code = "OBJECT_REQUIRED", o;
        }
        for (let o of Object.keys(r)) Object.prototype.hasOwnProperty.call(e, o) ? (i === true && (e[o] = r[o]), n && ot2(i === true ? `"${o}" is already defined and WAS overwritten` : `"${o}" is already defined and was NOT overwritten`)) : e[o] = r[o];
      }
      __name(gp, "gp");
      var B = { configDotenv: dp, _configVault: pp, _parseVault: lp, config: mp, decrypt: fp, parse: ap, populate: gp };
      _e.exports.configDotenv = B.configDotenv;
      _e.exports._configVault = B._configVault;
      _e.exports._parseVault = B._parseVault;
      _e.exports.config = B.config;
      _e.exports.decrypt = B.decrypt;
      _e.exports.parse = B.parse;
      _e.exports.populate = B.populate;
      _e.exports = B;
    });
    var Os = ue((Kh, cn) => {
      "use strict";
      cn.exports = (e = {}) => {
        let r;
        if (e.repoUrl) r = e.repoUrl;
        else if (e.user && e.repo) r = `https://github.com/${e.user}/${e.repo}`;
        else throw new Error("You need to specify either the `repoUrl` option or both the `user` and `repo` options");
        let t = new URL(`${r}/issues/new`), n = ["body", "title", "labels", "template", "milestone", "assignee", "projects"];
        for (let i of n) {
          let o = e[i];
          if (o !== void 0) {
            if (i === "labels" || i === "projects") {
              if (!Array.isArray(o)) throw new TypeError(`The \`${i}\` option should be an array`);
              o = o.join(",");
            }
            t.searchParams.set(i, o);
          }
        }
        return t.toString();
      };
      cn.exports.default = cn.exports;
    });
    var Ki2 = ue((vb, ea) => {
      "use strict";
      ea.exports = /* @__PURE__ */ function() {
        function e(r, t, n, i, o) {
          return r < t || n < t ? r > n ? n + 1 : r + 1 : i === o ? t : t + 1;
        }
        __name(e, "e");
        return function(r, t) {
          if (r === t) return 0;
          if (r.length > t.length) {
            var n = r;
            r = t, t = n;
          }
          for (var i = r.length, o = t.length; i > 0 && r.charCodeAt(i - 1) === t.charCodeAt(o - 1); ) i--, o--;
          for (var s = 0; s < i && r.charCodeAt(s) === t.charCodeAt(s); ) s++;
          if (i -= s, o -= s, i === 0 || o < 3) return o;
          var a2 = 0, l, u, c, p2, d2, f, h, g, I, T2, S2, b2, D = [];
          for (l = 0; l < i; l++) D.push(l + 1), D.push(r.charCodeAt(s + l));
          for (var me = D.length - 1; a2 < o - 3; ) for (I = t.charCodeAt(s + (u = a2)), T2 = t.charCodeAt(s + (c = a2 + 1)), S2 = t.charCodeAt(s + (p2 = a2 + 2)), b2 = t.charCodeAt(s + (d2 = a2 + 3)), f = a2 += 4, l = 0; l < me; l += 2) h = D[l], g = D[l + 1], u = e(h, u, c, I, g), c = e(u, c, p2, T2, g), p2 = e(c, p2, d2, S2, g), f = e(p2, d2, f, b2, g), D[l] = f, d2 = p2, p2 = c, c = u, u = h;
          for (; a2 < o; ) for (I = t.charCodeAt(s + (u = a2)), f = ++a2, l = 0; l < me; l += 2) h = D[l], D[l] = f = e(h, u, f, I, D[l + 1]), u = h;
          return f;
        };
      }();
    });
    var oa = Do(() => {
      "use strict";
    });
    var sa = Do(() => {
      "use strict";
    });
    var jf = {};
    tr2(jf, { DMMF: /* @__PURE__ */ __name(() => ct2, "DMMF"), Debug: /* @__PURE__ */ __name(() => N, "Debug"), Decimal: /* @__PURE__ */ __name(() => Fe2, "Decimal"), Extensions: /* @__PURE__ */ __name(() => ni, "Extensions"), MetricsClient: /* @__PURE__ */ __name(() => Lr, "MetricsClient"), PrismaClientInitializationError: /* @__PURE__ */ __name(() => P, "PrismaClientInitializationError"), PrismaClientKnownRequestError: /* @__PURE__ */ __name(() => z, "PrismaClientKnownRequestError"), PrismaClientRustPanicError: /* @__PURE__ */ __name(() => ae, "PrismaClientRustPanicError"), PrismaClientUnknownRequestError: /* @__PURE__ */ __name(() => V, "PrismaClientUnknownRequestError"), PrismaClientValidationError: /* @__PURE__ */ __name(() => Z, "PrismaClientValidationError"), Public: /* @__PURE__ */ __name(() => ii2, "Public"), Sql: /* @__PURE__ */ __name(() => ie2, "Sql"), createParam: /* @__PURE__ */ __name(() => va2, "createParam"), defineDmmfProperty: /* @__PURE__ */ __name(() => Ca, "defineDmmfProperty"), deserializeJsonResponse: /* @__PURE__ */ __name(() => Vr, "deserializeJsonResponse"), deserializeRawResult: /* @__PURE__ */ __name(() => Xn, "deserializeRawResult"), dmmfToRuntimeDataModel: /* @__PURE__ */ __name(() => Ns, "dmmfToRuntimeDataModel"), empty: /* @__PURE__ */ __name(() => Oa, "empty"), getPrismaClient: /* @__PURE__ */ __name(() => fu, "getPrismaClient"), getRuntime: /* @__PURE__ */ __name(() => Kn, "getRuntime"), join: /* @__PURE__ */ __name(() => Da, "join"), makeStrictEnum: /* @__PURE__ */ __name(() => gu2, "makeStrictEnum"), makeTypedQueryFactory: /* @__PURE__ */ __name(() => Ia, "makeTypedQueryFactory"), objectEnumValues: /* @__PURE__ */ __name(() => On, "objectEnumValues"), raw: /* @__PURE__ */ __name(() => no, "raw"), serializeJsonQuery: /* @__PURE__ */ __name(() => $n, "serializeJsonQuery"), skip: /* @__PURE__ */ __name(() => Mn2, "skip"), sqltag: /* @__PURE__ */ __name(() => io2, "sqltag"), warnEnvConflicts: /* @__PURE__ */ __name(() => hu, "warnEnvConflicts"), warnOnce: /* @__PURE__ */ __name(() => at, "warnOnce") });
    module.exports = vu2(jf);
    var ni = {};
    tr2(ni, { defineExtension: /* @__PURE__ */ __name(() => ko, "defineExtension"), getExtensionContext: /* @__PURE__ */ __name(() => _o2, "getExtensionContext") });
    function ko(e) {
      return typeof e == "function" ? e : (r) => r.$extends(e);
    }
    __name(ko, "ko");
    function _o2(e) {
      return e;
    }
    __name(_o2, "_o");
    var ii2 = {};
    tr2(ii2, { validator: /* @__PURE__ */ __name(() => No, "validator") });
    function No(...e) {
      return (r) => r;
    }
    __name(No, "No");
    var Bt2 = {};
    tr2(Bt2, { $: /* @__PURE__ */ __name(() => qo, "$"), bgBlack: /* @__PURE__ */ __name(() => ku2, "bgBlack"), bgBlue: /* @__PURE__ */ __name(() => Fu2, "bgBlue"), bgCyan: /* @__PURE__ */ __name(() => $u2, "bgCyan"), bgGreen: /* @__PURE__ */ __name(() => Nu, "bgGreen"), bgMagenta: /* @__PURE__ */ __name(() => Mu, "bgMagenta"), bgRed: /* @__PURE__ */ __name(() => _u, "bgRed"), bgWhite: /* @__PURE__ */ __name(() => qu, "bgWhite"), bgYellow: /* @__PURE__ */ __name(() => Lu2, "bgYellow"), black: /* @__PURE__ */ __name(() => Cu, "black"), blue: /* @__PURE__ */ __name(() => nr, "blue"), bold: /* @__PURE__ */ __name(() => W, "bold"), cyan: /* @__PURE__ */ __name(() => De, "cyan"), dim: /* @__PURE__ */ __name(() => Ce2, "dim"), gray: /* @__PURE__ */ __name(() => Hr, "gray"), green: /* @__PURE__ */ __name(() => qe, "green"), grey: /* @__PURE__ */ __name(() => Ou, "grey"), hidden: /* @__PURE__ */ __name(() => Ru2, "hidden"), inverse: /* @__PURE__ */ __name(() => Su, "inverse"), italic: /* @__PURE__ */ __name(() => Tu, "italic"), magenta: /* @__PURE__ */ __name(() => Iu, "magenta"), red: /* @__PURE__ */ __name(() => ce2, "red"), reset: /* @__PURE__ */ __name(() => Pu, "reset"), strikethrough: /* @__PURE__ */ __name(() => Au, "strikethrough"), underline: /* @__PURE__ */ __name(() => Y, "underline"), white: /* @__PURE__ */ __name(() => Du, "white"), yellow: /* @__PURE__ */ __name(() => Ie2, "yellow") });
    var oi;
    var Lo;
    var Fo;
    var Mo;
    var $o = true;
    typeof process < "u" && ({ FORCE_COLOR: oi, NODE_DISABLE_COLORS: Lo, NO_COLOR: Fo, TERM: Mo } = process.env || {}, $o = process.stdout && process.stdout.isTTY);
    var qo = { enabled: !Lo && Fo == null && Mo !== "dumb" && (oi != null && oi !== "0" || $o) };
    function F(e, r) {
      let t = new RegExp(`\\x1b\\[${r}m`, "g"), n = `\x1B[${e}m`, i = `\x1B[${r}m`;
      return function(o) {
        return !qo.enabled || o == null ? o : n + (~("" + o).indexOf(i) ? o.replace(t, i + n) : o) + i;
      };
    }
    __name(F, "F");
    var Pu = F(0, 0);
    var W = F(1, 22);
    var Ce2 = F(2, 22);
    var Tu = F(3, 23);
    var Y = F(4, 24);
    var Su = F(7, 27);
    var Ru2 = F(8, 28);
    var Au = F(9, 29);
    var Cu = F(30, 39);
    var ce2 = F(31, 39);
    var qe = F(32, 39);
    var Ie2 = F(33, 39);
    var nr = F(34, 39);
    var Iu = F(35, 39);
    var De = F(36, 39);
    var Du = F(37, 39);
    var Hr = F(90, 39);
    var Ou = F(90, 39);
    var ku2 = F(40, 49);
    var _u = F(41, 49);
    var Nu = F(42, 49);
    var Lu2 = F(43, 49);
    var Fu2 = F(44, 49);
    var Mu = F(45, 49);
    var $u2 = F(46, 49);
    var qu = F(47, 49);
    var Vu = 100;
    var Vo = ["green", "yellow", "blue", "magenta", "cyan", "red"];
    var Yr = [];
    var jo = Date.now();
    var ju2 = 0;
    var si = typeof process < "u" ? process.env : {};
    globalThis.DEBUG ??= si.DEBUG ?? "";
    globalThis.DEBUG_COLORS ??= si.DEBUG_COLORS ? si.DEBUG_COLORS === "true" : true;
    var zr = { enable(e) {
      typeof e == "string" && (globalThis.DEBUG = e);
    }, disable() {
      let e = globalThis.DEBUG;
      return globalThis.DEBUG = "", e;
    }, enabled(e) {
      let r = globalThis.DEBUG.split(",").map((i) => i.replace(/[.+?^${}()|[\]\\]/g, "\\$&")), t = r.some((i) => i === "" || i[0] === "-" ? false : e.match(RegExp(i.split("*").join(".*") + "$"))), n = r.some((i) => i === "" || i[0] !== "-" ? false : e.match(RegExp(i.slice(1).split("*").join(".*") + "$")));
      return t && !n;
    }, log: /* @__PURE__ */ __name((...e) => {
      let [r, t, ...n] = e;
      (console.warn ?? console.log)(`${r} ${t}`, ...n);
    }, "log"), formatters: {} };
    function Bu(e) {
      let r = { color: Vo[ju2++ % Vo.length], enabled: zr.enabled(e), namespace: e, log: zr.log, extend: /* @__PURE__ */ __name(() => {
      }, "extend") }, t = /* @__PURE__ */ __name((...n) => {
        let { enabled: i, namespace: o, color: s, log: a2 } = r;
        if (n.length !== 0 && Yr.push([o, ...n]), Yr.length > Vu && Yr.shift(), zr.enabled(o) || i) {
          let l = n.map((c) => typeof c == "string" ? c : Uu(c)), u = `+${Date.now() - jo}ms`;
          jo = Date.now(), globalThis.DEBUG_COLORS ? a2(Bt2[s](W(o)), ...l, Bt2[s](u)) : a2(o, ...l, u);
        }
      }, "t");
      return new Proxy(t, { get: /* @__PURE__ */ __name((n, i) => r[i], "get"), set: /* @__PURE__ */ __name((n, i, o) => r[i] = o, "set") });
    }
    __name(Bu, "Bu");
    var N = new Proxy(Bu, { get: /* @__PURE__ */ __name((e, r) => zr[r], "get"), set: /* @__PURE__ */ __name((e, r, t) => zr[r] = t, "set") });
    function Uu(e, r = 2) {
      let t = /* @__PURE__ */ new Set();
      return JSON.stringify(e, (n, i) => {
        if (typeof i == "object" && i !== null) {
          if (t.has(i)) return "[Circular *]";
          t.add(i);
        } else if (typeof i == "bigint") return i.toString();
        return i;
      }, r);
    }
    __name(Uu, "Uu");
    function Bo(e = 7500) {
      let r = Yr.map(([t, ...n]) => `${t} ${n.map((i) => typeof i == "string" ? i : JSON.stringify(i)).join(" ")}`).join(`
`);
      return r.length < e ? r : r.slice(-e);
    }
    __name(Bo, "Bo");
    function Uo() {
      Yr.length = 0;
    }
    __name(Uo, "Uo");
    var gr2 = N;
    var Go = O2(__require("node:fs"));
    function ai() {
      let e = process.env.PRISMA_QUERY_ENGINE_LIBRARY;
      if (!(e && Go.default.existsSync(e)) && process.arch === "ia32") throw new Error('The default query engine type (Node-API, "library") is currently not supported for 32bit Node. Please set `engineType = "binary"` in the "generator" block of your "schema.prisma" file (or use the environment variables "PRISMA_CLIENT_ENGINE_TYPE=binary" and/or "PRISMA_CLI_QUERY_ENGINE_TYPE=binary".)');
    }
    __name(ai, "ai");
    var li = ["darwin", "darwin-arm64", "debian-openssl-1.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x", "rhel-openssl-1.0.x", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x", "linux-arm64-openssl-1.1.x", "linux-arm64-openssl-1.0.x", "linux-arm64-openssl-3.0.x", "linux-arm-openssl-1.1.x", "linux-arm-openssl-1.0.x", "linux-arm-openssl-3.0.x", "linux-musl", "linux-musl-openssl-3.0.x", "linux-musl-arm64-openssl-1.1.x", "linux-musl-arm64-openssl-3.0.x", "linux-nixos", "linux-static-x64", "linux-static-arm64", "windows", "freebsd11", "freebsd12", "freebsd13", "freebsd14", "freebsd15", "openbsd", "netbsd", "arm"];
    var Ut = "libquery_engine";
    function Gt(e, r) {
      let t = r === "url";
      return e.includes("windows") ? t ? "query_engine.dll.node" : `query_engine-${e}.dll.node` : e.includes("darwin") ? t ? `${Ut}.dylib.node` : `${Ut}-${e}.dylib.node` : t ? `${Ut}.so.node` : `${Ut}-${e}.so.node`;
    }
    __name(Gt, "Gt");
    var Ko = O2(__require("node:child_process"));
    var mi2 = O2(__require("node:fs/promises"));
    var Ht = O2(__require("node:os"));
    var Oe = Symbol.for("@ts-pattern/matcher");
    var Gu = Symbol.for("@ts-pattern/isVariadic");
    var Wt = "@ts-pattern/anonymous-select-key";
    var ui = /* @__PURE__ */ __name((e) => !!(e && typeof e == "object"), "ui");
    var Qt = /* @__PURE__ */ __name((e) => e && !!e[Oe], "Qt");
    var Ee = /* @__PURE__ */ __name((e, r, t) => {
      if (Qt(e)) {
        let n = e[Oe](), { matched: i, selections: o } = n.match(r);
        return i && o && Object.keys(o).forEach((s) => t(s, o[s])), i;
      }
      if (ui(e)) {
        if (!ui(r)) return false;
        if (Array.isArray(e)) {
          if (!Array.isArray(r)) return false;
          let n = [], i = [], o = [];
          for (let s of e.keys()) {
            let a2 = e[s];
            Qt(a2) && a2[Gu] ? o.push(a2) : o.length ? i.push(a2) : n.push(a2);
          }
          if (o.length) {
            if (o.length > 1) throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
            if (r.length < n.length + i.length) return false;
            let s = r.slice(0, n.length), a2 = i.length === 0 ? [] : r.slice(-i.length), l = r.slice(n.length, i.length === 0 ? 1 / 0 : -i.length);
            return n.every((u, c) => Ee(u, s[c], t)) && i.every((u, c) => Ee(u, a2[c], t)) && (o.length === 0 || Ee(o[0], l, t));
          }
          return e.length === r.length && e.every((s, a2) => Ee(s, r[a2], t));
        }
        return Reflect.ownKeys(e).every((n) => {
          let i = e[n];
          return (n in r || Qt(o = i) && o[Oe]().matcherType === "optional") && Ee(i, r[n], t);
          var o;
        });
      }
      return Object.is(r, e);
    }, "Ee");
    var Ge2 = /* @__PURE__ */ __name((e) => {
      var r, t, n;
      return ui(e) ? Qt(e) ? (r = (t = (n = e[Oe]()).getSelectionKeys) == null ? void 0 : t.call(n)) != null ? r : [] : Array.isArray(e) ? Zr(e, Ge2) : Zr(Object.values(e), Ge2) : [];
    }, "Ge");
    var Zr = /* @__PURE__ */ __name((e, r) => e.reduce((t, n) => t.concat(r(n)), []), "Zr");
    function pe(e) {
      return Object.assign(e, { optional: /* @__PURE__ */ __name(() => Qu(e), "optional"), and: /* @__PURE__ */ __name((r) => q(e, r), "and"), or: /* @__PURE__ */ __name((r) => Wu(e, r), "or"), select: /* @__PURE__ */ __name((r) => r === void 0 ? Qo(e) : Qo(r, e), "select") });
    }
    __name(pe, "pe");
    function Qu(e) {
      return pe({ [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => {
        let t = {}, n = /* @__PURE__ */ __name((i, o) => {
          t[i] = o;
        }, "n");
        return r === void 0 ? (Ge2(e).forEach((i) => n(i, void 0)), { matched: true, selections: t }) : { matched: Ee(e, r, n), selections: t };
      }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => Ge2(e), "getSelectionKeys"), matcherType: "optional" }) });
    }
    __name(Qu, "Qu");
    function q(...e) {
      return pe({ [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => {
        let t = {}, n = /* @__PURE__ */ __name((i, o) => {
          t[i] = o;
        }, "n");
        return { matched: e.every((i) => Ee(i, r, n)), selections: t };
      }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => Zr(e, Ge2), "getSelectionKeys"), matcherType: "and" }) });
    }
    __name(q, "q");
    function Wu(...e) {
      return pe({ [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => {
        let t = {}, n = /* @__PURE__ */ __name((i, o) => {
          t[i] = o;
        }, "n");
        return Zr(e, Ge2).forEach((i) => n(i, void 0)), { matched: e.some((i) => Ee(i, r, n)), selections: t };
      }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => Zr(e, Ge2), "getSelectionKeys"), matcherType: "or" }) });
    }
    __name(Wu, "Wu");
    function A(e) {
      return { [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => ({ matched: !!e(r) }), "match") }) };
    }
    __name(A, "A");
    function Qo(...e) {
      let r = typeof e[0] == "string" ? e[0] : void 0, t = e.length === 2 ? e[1] : typeof e[0] == "string" ? void 0 : e[0];
      return pe({ [Oe]: () => ({ match: /* @__PURE__ */ __name((n) => {
        let i = { [r ?? Wt]: n };
        return { matched: t === void 0 || Ee(t, n, (o, s) => {
          i[o] = s;
        }), selections: i };
      }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => [r ?? Wt].concat(t === void 0 ? [] : Ge2(t)), "getSelectionKeys") }) });
    }
    __name(Qo, "Qo");
    function ye(e) {
      return typeof e == "number";
    }
    __name(ye, "ye");
    function Ve(e) {
      return typeof e == "string";
    }
    __name(Ve, "Ve");
    function je(e) {
      return typeof e == "bigint";
    }
    __name(je, "je");
    var eg = pe(A(function(e) {
      return true;
    }));
    var Be = /* @__PURE__ */ __name((e) => Object.assign(pe(e), { startsWith: /* @__PURE__ */ __name((r) => {
      return Be(q(e, (t = r, A((n) => Ve(n) && n.startsWith(t)))));
      var t;
    }, "startsWith"), endsWith: /* @__PURE__ */ __name((r) => {
      return Be(q(e, (t = r, A((n) => Ve(n) && n.endsWith(t)))));
      var t;
    }, "endsWith"), minLength: /* @__PURE__ */ __name((r) => Be(q(e, ((t) => A((n) => Ve(n) && n.length >= t))(r))), "minLength"), length: /* @__PURE__ */ __name((r) => Be(q(e, ((t) => A((n) => Ve(n) && n.length === t))(r))), "length"), maxLength: /* @__PURE__ */ __name((r) => Be(q(e, ((t) => A((n) => Ve(n) && n.length <= t))(r))), "maxLength"), includes: /* @__PURE__ */ __name((r) => {
      return Be(q(e, (t = r, A((n) => Ve(n) && n.includes(t)))));
      var t;
    }, "includes"), regex: /* @__PURE__ */ __name((r) => {
      return Be(q(e, (t = r, A((n) => Ve(n) && !!n.match(t)))));
      var t;
    }, "regex") }), "Be");
    var rg = Be(A(Ve));
    var be2 = /* @__PURE__ */ __name((e) => Object.assign(pe(e), { between: /* @__PURE__ */ __name((r, t) => be2(q(e, ((n, i) => A((o) => ye(o) && n <= o && i >= o))(r, t))), "between"), lt: /* @__PURE__ */ __name((r) => be2(q(e, ((t) => A((n) => ye(n) && n < t))(r))), "lt"), gt: /* @__PURE__ */ __name((r) => be2(q(e, ((t) => A((n) => ye(n) && n > t))(r))), "gt"), lte: /* @__PURE__ */ __name((r) => be2(q(e, ((t) => A((n) => ye(n) && n <= t))(r))), "lte"), gte: /* @__PURE__ */ __name((r) => be2(q(e, ((t) => A((n) => ye(n) && n >= t))(r))), "gte"), int: /* @__PURE__ */ __name(() => be2(q(e, A((r) => ye(r) && Number.isInteger(r)))), "int"), finite: /* @__PURE__ */ __name(() => be2(q(e, A((r) => ye(r) && Number.isFinite(r)))), "finite"), positive: /* @__PURE__ */ __name(() => be2(q(e, A((r) => ye(r) && r > 0))), "positive"), negative: /* @__PURE__ */ __name(() => be2(q(e, A((r) => ye(r) && r < 0))), "negative") }), "be");
    var tg = be2(A(ye));
    var Ue = /* @__PURE__ */ __name((e) => Object.assign(pe(e), { between: /* @__PURE__ */ __name((r, t) => Ue(q(e, ((n, i) => A((o) => je(o) && n <= o && i >= o))(r, t))), "between"), lt: /* @__PURE__ */ __name((r) => Ue(q(e, ((t) => A((n) => je(n) && n < t))(r))), "lt"), gt: /* @__PURE__ */ __name((r) => Ue(q(e, ((t) => A((n) => je(n) && n > t))(r))), "gt"), lte: /* @__PURE__ */ __name((r) => Ue(q(e, ((t) => A((n) => je(n) && n <= t))(r))), "lte"), gte: /* @__PURE__ */ __name((r) => Ue(q(e, ((t) => A((n) => je(n) && n >= t))(r))), "gte"), positive: /* @__PURE__ */ __name(() => Ue(q(e, A((r) => je(r) && r > 0))), "positive"), negative: /* @__PURE__ */ __name(() => Ue(q(e, A((r) => je(r) && r < 0))), "negative") }), "Ue");
    var ng = Ue(A(je));
    var ig = pe(A(function(e) {
      return typeof e == "boolean";
    }));
    var og = pe(A(function(e) {
      return typeof e == "symbol";
    }));
    var sg = pe(A(function(e) {
      return e == null;
    }));
    var ag = pe(A(function(e) {
      return e != null;
    }));
    var ci = class extends Error {
      static {
        __name(this, "ci");
      }
      constructor(r) {
        let t;
        try {
          t = JSON.stringify(r);
        } catch {
          t = r;
        }
        super(`Pattern matching error: no pattern matches value ${t}`), this.input = void 0, this.input = r;
      }
    };
    var pi = { matched: false, value: void 0 };
    function hr(e) {
      return new di(e, pi);
    }
    __name(hr, "hr");
    var di = class e {
      static {
        __name(this, "e");
      }
      constructor(r, t) {
        this.input = void 0, this.state = void 0, this.input = r, this.state = t;
      }
      with(...r) {
        if (this.state.matched) return this;
        let t = r[r.length - 1], n = [r[0]], i;
        r.length === 3 && typeof r[1] == "function" ? i = r[1] : r.length > 2 && n.push(...r.slice(1, r.length - 1));
        let o = false, s = {}, a2 = /* @__PURE__ */ __name((u, c) => {
          o = true, s[u] = c;
        }, "a"), l = !n.some((u) => Ee(u, this.input, a2)) || i && !i(this.input) ? pi : { matched: true, value: t(o ? Wt in s ? s[Wt] : s : this.input, this.input) };
        return new e(this.input, l);
      }
      when(r, t) {
        if (this.state.matched) return this;
        let n = !!r(this.input);
        return new e(this.input, n ? { matched: true, value: t(this.input, this.input) } : pi);
      }
      otherwise(r) {
        return this.state.matched ? this.state.value : r(this.input);
      }
      exhaustive() {
        if (this.state.matched) return this.state.value;
        throw new ci(this.input);
      }
      run() {
        return this.exhaustive();
      }
      returnType() {
        return this;
      }
    };
    var Ho = __require("node:util");
    var Ju = { warn: Ie2("prisma:warn") };
    var Ku = { warn: /* @__PURE__ */ __name(() => !process.env.PRISMA_DISABLE_WARNINGS, "warn") };
    function Jt2(e, ...r) {
      Ku.warn() && console.warn(`${Ju.warn} ${e}`, ...r);
    }
    __name(Jt2, "Jt");
    var Hu2 = (0, Ho.promisify)(Ko.default.exec);
    var ee = gr2("prisma:get-platform");
    var Yu = ["1.0.x", "1.1.x", "3.0.x"];
    async function Yo() {
      let e = Ht.default.platform(), r = process.arch;
      if (e === "freebsd") {
        let s = await Yt2("freebsd-version");
        if (s && s.trim().length > 0) {
          let l = /^(\d+)\.?/.exec(s);
          if (l) return { platform: "freebsd", targetDistro: `freebsd${l[1]}`, arch: r };
        }
      }
      if (e !== "linux") return { platform: e, arch: r };
      let t = await Zu(), n = await sc(), i = ec({ arch: r, archFromUname: n, familyDistro: t.familyDistro }), { libssl: o } = await rc(i);
      return { platform: "linux", libssl: o, arch: r, archFromUname: n, ...t };
    }
    __name(Yo, "Yo");
    function zu(e) {
      let r = /^ID="?([^"\n]*)"?$/im, t = /^ID_LIKE="?([^"\n]*)"?$/im, n = r.exec(e), i = n && n[1] && n[1].toLowerCase() || "", o = t.exec(e), s = o && o[1] && o[1].toLowerCase() || "", a2 = hr({ id: i, idLike: s }).with({ id: "alpine" }, ({ id: l }) => ({ targetDistro: "musl", familyDistro: l, originalDistro: l })).with({ id: "raspbian" }, ({ id: l }) => ({ targetDistro: "arm", familyDistro: "debian", originalDistro: l })).with({ id: "nixos" }, ({ id: l }) => ({ targetDistro: "nixos", originalDistro: l, familyDistro: "nixos" })).with({ id: "debian" }, { id: "ubuntu" }, ({ id: l }) => ({ targetDistro: "debian", familyDistro: "debian", originalDistro: l })).with({ id: "rhel" }, { id: "centos" }, { id: "fedora" }, ({ id: l }) => ({ targetDistro: "rhel", familyDistro: "rhel", originalDistro: l })).when(({ idLike: l }) => l.includes("debian") || l.includes("ubuntu"), ({ id: l }) => ({ targetDistro: "debian", familyDistro: "debian", originalDistro: l })).when(({ idLike: l }) => i === "arch" || l.includes("arch"), ({ id: l }) => ({ targetDistro: "debian", familyDistro: "arch", originalDistro: l })).when(({ idLike: l }) => l.includes("centos") || l.includes("fedora") || l.includes("rhel") || l.includes("suse"), ({ id: l }) => ({ targetDistro: "rhel", familyDistro: "rhel", originalDistro: l })).otherwise(({ id: l }) => ({ targetDistro: void 0, familyDistro: void 0, originalDistro: l }));
      return ee(`Found distro info:
${JSON.stringify(a2, null, 2)}`), a2;
    }
    __name(zu, "zu");
    async function Zu() {
      let e = "/etc/os-release";
      try {
        let r = await mi2.default.readFile(e, { encoding: "utf-8" });
        return zu(r);
      } catch {
        return { targetDistro: void 0, familyDistro: void 0, originalDistro: void 0 };
      }
    }
    __name(Zu, "Zu");
    function Xu(e) {
      let r = /^OpenSSL\s(\d+\.\d+)\.\d+/.exec(e);
      if (r) {
        let t = `${r[1]}.x`;
        return zo(t);
      }
    }
    __name(Xu, "Xu");
    function Wo(e) {
      let r = /libssl\.so\.(\d)(\.\d)?/.exec(e);
      if (r) {
        let t = `${r[1]}${r[2] ?? ".0"}.x`;
        return zo(t);
      }
    }
    __name(Wo, "Wo");
    function zo(e) {
      let r = (() => {
        if (Xo(e)) return e;
        let t = e.split(".");
        return t[1] = "0", t.join(".");
      })();
      if (Yu.includes(r)) return r;
    }
    __name(zo, "zo");
    function ec(e) {
      return hr(e).with({ familyDistro: "musl" }, () => (ee('Trying platform-specific paths for "alpine"'), ["/lib", "/usr/lib"])).with({ familyDistro: "debian" }, ({ archFromUname: r }) => (ee('Trying platform-specific paths for "debian" (and "ubuntu")'), [`/usr/lib/${r}-linux-gnu`, `/lib/${r}-linux-gnu`])).with({ familyDistro: "rhel" }, () => (ee('Trying platform-specific paths for "rhel"'), ["/lib64", "/usr/lib64"])).otherwise(({ familyDistro: r, arch: t, archFromUname: n }) => (ee(`Don't know any platform-specific paths for "${r}" on ${t} (${n})`), []));
    }
    __name(ec, "ec");
    async function rc(e) {
      let r = 'grep -v "libssl.so.0"', t = await Jo(e);
      if (t) {
        ee(`Found libssl.so file using platform-specific paths: ${t}`);
        let o = Wo(t);
        if (ee(`The parsed libssl version is: ${o}`), o) return { libssl: o, strategy: "libssl-specific-path" };
      }
      ee('Falling back to "ldconfig" and other generic paths');
      let n = await Yt2(`ldconfig -p | sed "s/.*=>s*//" | sed "s|.*/||" | grep libssl | sort | ${r}`);
      if (n || (n = await Jo(["/lib64", "/usr/lib64", "/lib", "/usr/lib"])), n) {
        ee(`Found libssl.so file using "ldconfig" or other generic paths: ${n}`);
        let o = Wo(n);
        if (ee(`The parsed libssl version is: ${o}`), o) return { libssl: o, strategy: "ldconfig" };
      }
      let i = await Yt2("openssl version -v");
      if (i) {
        ee(`Found openssl binary with version: ${i}`);
        let o = Xu(i);
        if (ee(`The parsed openssl version is: ${o}`), o) return { libssl: o, strategy: "openssl-binary" };
      }
      return ee("Couldn't find any version of libssl or OpenSSL in the system"), {};
    }
    __name(rc, "rc");
    async function Jo(e) {
      for (let r of e) {
        let t = await tc(r);
        if (t) return t;
      }
    }
    __name(Jo, "Jo");
    async function tc(e) {
      try {
        return (await mi2.default.readdir(e)).find((t) => t.startsWith("libssl.so.") && !t.startsWith("libssl.so.0"));
      } catch (r) {
        if (r.code === "ENOENT") return;
        throw r;
      }
    }
    __name(tc, "tc");
    async function ir() {
      let { binaryTarget: e } = await Zo();
      return e;
    }
    __name(ir, "ir");
    function nc(e) {
      return e.binaryTarget !== void 0;
    }
    __name(nc, "nc");
    async function fi() {
      let { memoized: e, ...r } = await Zo();
      return r;
    }
    __name(fi, "fi");
    var Kt = {};
    async function Zo() {
      if (nc(Kt)) return Promise.resolve({ ...Kt, memoized: true });
      let e = await Yo(), r = ic(e);
      return Kt = { ...e, binaryTarget: r }, { ...Kt, memoized: false };
    }
    __name(Zo, "Zo");
    function ic(e) {
      let { platform: r, arch: t, archFromUname: n, libssl: i, targetDistro: o, familyDistro: s, originalDistro: a2 } = e;
      r === "linux" && !["x64", "arm64"].includes(t) && Jt2(`Prisma only officially supports Linux on amd64 (x86_64) and arm64 (aarch64) system architectures (detected "${t}" instead). If you are using your own custom Prisma engines, you can ignore this warning, as long as you've compiled the engines for your system architecture "${n}".`);
      let l = "1.1.x";
      if (r === "linux" && i === void 0) {
        let c = hr({ familyDistro: s }).with({ familyDistro: "debian" }, () => "Please manually install OpenSSL via `apt-get update -y && apt-get install -y openssl` and try installing Prisma again. If you're running Prisma on Docker, add this command to your Dockerfile, or switch to an image that already has OpenSSL installed.").otherwise(() => "Please manually install OpenSSL and try installing Prisma again.");
        Jt2(`Prisma failed to detect the libssl/openssl version to use, and may not work as expected. Defaulting to "openssl-${l}".
${c}`);
      }
      let u = "debian";
      if (r === "linux" && o === void 0 && ee(`Distro is "${a2}". Falling back to Prisma engines built for "${u}".`), r === "darwin" && t === "arm64") return "darwin-arm64";
      if (r === "darwin") return "darwin";
      if (r === "win32") return "windows";
      if (r === "freebsd") return o;
      if (r === "openbsd") return "openbsd";
      if (r === "netbsd") return "netbsd";
      if (r === "linux" && o === "nixos") return "linux-nixos";
      if (r === "linux" && t === "arm64") return `${o === "musl" ? "linux-musl-arm64" : "linux-arm64"}-openssl-${i || l}`;
      if (r === "linux" && t === "arm") return `linux-arm-openssl-${i || l}`;
      if (r === "linux" && o === "musl") {
        let c = "linux-musl";
        return !i || Xo(i) ? c : `${c}-openssl-${i}`;
      }
      return r === "linux" && o && i ? `${o}-openssl-${i}` : (r !== "linux" && Jt2(`Prisma detected unknown OS "${r}" and may not work as expected. Defaulting to "linux".`), i ? `${u}-openssl-${i}` : o ? `${o}-openssl-${l}` : `${u}-openssl-${l}`);
    }
    __name(ic, "ic");
    async function oc(e) {
      try {
        return await e();
      } catch {
        return;
      }
    }
    __name(oc, "oc");
    function Yt2(e) {
      return oc(async () => {
        let r = await Hu2(e);
        return ee(`Command "${e}" successfully returned "${r.stdout}"`), r.stdout;
      });
    }
    __name(Yt2, "Yt");
    async function sc() {
      return typeof Ht.default.machine == "function" ? Ht.default.machine() : (await Yt2("uname -m"))?.trim();
    }
    __name(sc, "sc");
    function Xo(e) {
      return e.startsWith("1.");
    }
    __name(Xo, "Xo");
    var Xt3 = {};
    tr2(Xt3, { beep: /* @__PURE__ */ __name(() => kc, "beep"), clearScreen: /* @__PURE__ */ __name(() => Cc, "clearScreen"), clearTerminal: /* @__PURE__ */ __name(() => Ic, "clearTerminal"), cursorBackward: /* @__PURE__ */ __name(() => mc, "cursorBackward"), cursorDown: /* @__PURE__ */ __name(() => pc, "cursorDown"), cursorForward: /* @__PURE__ */ __name(() => dc, "cursorForward"), cursorGetPosition: /* @__PURE__ */ __name(() => hc, "cursorGetPosition"), cursorHide: /* @__PURE__ */ __name(() => Ec, "cursorHide"), cursorLeft: /* @__PURE__ */ __name(() => ts2, "cursorLeft"), cursorMove: /* @__PURE__ */ __name(() => cc2, "cursorMove"), cursorNextLine: /* @__PURE__ */ __name(() => yc, "cursorNextLine"), cursorPrevLine: /* @__PURE__ */ __name(() => bc, "cursorPrevLine"), cursorRestorePosition: /* @__PURE__ */ __name(() => gc, "cursorRestorePosition"), cursorSavePosition: /* @__PURE__ */ __name(() => fc, "cursorSavePosition"), cursorShow: /* @__PURE__ */ __name(() => wc, "cursorShow"), cursorTo: /* @__PURE__ */ __name(() => uc, "cursorTo"), cursorUp: /* @__PURE__ */ __name(() => rs, "cursorUp"), enterAlternativeScreen: /* @__PURE__ */ __name(() => Dc, "enterAlternativeScreen"), eraseDown: /* @__PURE__ */ __name(() => Tc, "eraseDown"), eraseEndLine: /* @__PURE__ */ __name(() => vc, "eraseEndLine"), eraseLine: /* @__PURE__ */ __name(() => ns, "eraseLine"), eraseLines: /* @__PURE__ */ __name(() => xc, "eraseLines"), eraseScreen: /* @__PURE__ */ __name(() => gi2, "eraseScreen"), eraseStartLine: /* @__PURE__ */ __name(() => Pc, "eraseStartLine"), eraseUp: /* @__PURE__ */ __name(() => Sc, "eraseUp"), exitAlternativeScreen: /* @__PURE__ */ __name(() => Oc, "exitAlternativeScreen"), iTerm: /* @__PURE__ */ __name(() => Lc, "iTerm"), image: /* @__PURE__ */ __name(() => Nc, "image"), link: /* @__PURE__ */ __name(() => _c, "link"), scrollDown: /* @__PURE__ */ __name(() => Ac, "scrollDown"), scrollUp: /* @__PURE__ */ __name(() => Rc, "scrollUp") });
    var Zt2 = O2(__require("node:process"), 1);
    var zt = globalThis.window?.document !== void 0;
    var gg = globalThis.process?.versions?.node !== void 0;
    var hg = globalThis.process?.versions?.bun !== void 0;
    var yg = globalThis.Deno?.version?.deno !== void 0;
    var bg = globalThis.process?.versions?.electron !== void 0;
    var Eg = globalThis.navigator?.userAgent?.includes("jsdom") === true;
    var wg = typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
    var xg = typeof DedicatedWorkerGlobalScope < "u" && globalThis instanceof DedicatedWorkerGlobalScope;
    var vg = typeof SharedWorkerGlobalScope < "u" && globalThis instanceof SharedWorkerGlobalScope;
    var Pg = typeof ServiceWorkerGlobalScope < "u" && globalThis instanceof ServiceWorkerGlobalScope;
    var Xr = globalThis.navigator?.userAgentData?.platform;
    var Tg = Xr === "macOS" || globalThis.navigator?.platform === "MacIntel" || globalThis.navigator?.userAgent?.includes(" Mac ") === true || globalThis.process?.platform === "darwin";
    var Sg = Xr === "Windows" || globalThis.navigator?.platform === "Win32" || globalThis.process?.platform === "win32";
    var Rg = Xr === "Linux" || globalThis.navigator?.platform?.startsWith("Linux") === true || globalThis.navigator?.userAgent?.includes(" Linux ") === true || globalThis.process?.platform === "linux";
    var Ag = Xr === "iOS" || globalThis.navigator?.platform === "MacIntel" && globalThis.navigator?.maxTouchPoints > 1 || /iPad|iPhone|iPod/.test(globalThis.navigator?.platform);
    var Cg = Xr === "Android" || globalThis.navigator?.platform === "Android" || globalThis.navigator?.userAgent?.includes(" Android ") === true || globalThis.process?.platform === "android";
    var C = "\x1B[";
    var rt2 = "\x1B]";
    var yr = "\x07";
    var et2 = ";";
    var es2 = !zt && Zt2.default.env.TERM_PROGRAM === "Apple_Terminal";
    var ac = !zt && Zt2.default.platform === "win32";
    var lc = zt ? () => {
      throw new Error("`process.cwd()` only works in Node.js, not the browser.");
    } : Zt2.default.cwd;
    var uc = /* @__PURE__ */ __name((e, r) => {
      if (typeof e != "number") throw new TypeError("The `x` argument is required");
      return typeof r != "number" ? C + (e + 1) + "G" : C + (r + 1) + et2 + (e + 1) + "H";
    }, "uc");
    var cc2 = /* @__PURE__ */ __name((e, r) => {
      if (typeof e != "number") throw new TypeError("The `x` argument is required");
      let t = "";
      return e < 0 ? t += C + -e + "D" : e > 0 && (t += C + e + "C"), r < 0 ? t += C + -r + "A" : r > 0 && (t += C + r + "B"), t;
    }, "cc");
    var rs = /* @__PURE__ */ __name((e = 1) => C + e + "A", "rs");
    var pc = /* @__PURE__ */ __name((e = 1) => C + e + "B", "pc");
    var dc = /* @__PURE__ */ __name((e = 1) => C + e + "C", "dc");
    var mc = /* @__PURE__ */ __name((e = 1) => C + e + "D", "mc");
    var ts2 = C + "G";
    var fc = es2 ? "\x1B7" : C + "s";
    var gc = es2 ? "\x1B8" : C + "u";
    var hc = C + "6n";
    var yc = C + "E";
    var bc = C + "F";
    var Ec = C + "?25l";
    var wc = C + "?25h";
    var xc = /* @__PURE__ */ __name((e) => {
      let r = "";
      for (let t = 0; t < e; t++) r += ns + (t < e - 1 ? rs() : "");
      return e && (r += ts2), r;
    }, "xc");
    var vc = C + "K";
    var Pc = C + "1K";
    var ns = C + "2K";
    var Tc = C + "J";
    var Sc = C + "1J";
    var gi2 = C + "2J";
    var Rc = C + "S";
    var Ac = C + "T";
    var Cc = "\x1Bc";
    var Ic = ac ? `${gi2}${C}0f` : `${gi2}${C}3J${C}H`;
    var Dc = C + "?1049h";
    var Oc = C + "?1049l";
    var kc = yr;
    var _c = /* @__PURE__ */ __name((e, r) => [rt2, "8", et2, et2, r, yr, e, rt2, "8", et2, et2, yr].join(""), "_c");
    var Nc = /* @__PURE__ */ __name((e, r = {}) => {
      let t = `${rt2}1337;File=inline=1`;
      return r.width && (t += `;width=${r.width}`), r.height && (t += `;height=${r.height}`), r.preserveAspectRatio === false && (t += ";preserveAspectRatio=0"), t + ":" + Buffer.from(e).toString("base64") + yr;
    }, "Nc");
    var Lc = { setCwd: /* @__PURE__ */ __name((e = lc()) => `${rt2}50;CurrentDir=${e}${yr}`, "setCwd"), annotation(e, r = {}) {
      let t = `${rt2}1337;`, n = r.x !== void 0, i = r.y !== void 0;
      if ((n || i) && !(n && i && r.length !== void 0)) throw new Error("`x`, `y` and `length` must be defined when `x` or `y` is defined");
      return e = e.replaceAll("|", ""), t += r.isHidden ? "AddHiddenAnnotation=" : "AddAnnotation=", r.length > 0 ? t += (n ? [e, r.length, r.x, r.y] : [r.length, e]).join("|") : t += e, t + yr;
    } };
    var en = O2(cs2(), 1);
    function or(e, r, { target: t = "stdout", ...n } = {}) {
      return en.default[t] ? Xt3.link(e, r) : n.fallback === false ? e : typeof n.fallback == "function" ? n.fallback(e, r) : `${e} (​${r}​)`;
    }
    __name(or, "or");
    or.isSupported = en.default.stdout;
    or.stderr = (e, r, t = {}) => or(e, r, { target: "stderr", ...t });
    or.stderr.isSupported = en.default.stderr;
    function wi2(e) {
      return or(e, e, { fallback: Y });
    }
    __name(wi2, "wi");
    var Vc = ps();
    var xi2 = Vc.version;
    function Er2(e) {
      let r = jc();
      return r || (e?.config.engineType === "library" ? "library" : e?.config.engineType === "binary" ? "binary" : e?.config.engineType === "client" ? "client" : Bc());
    }
    __name(Er2, "Er");
    function jc() {
      let e = process.env.PRISMA_CLIENT_ENGINE_TYPE;
      return e === "library" ? "library" : e === "binary" ? "binary" : e === "client" ? "client" : void 0;
    }
    __name(jc, "jc");
    function Bc() {
      return "library";
    }
    __name(Bc, "Bc");
    function vi2(e) {
      return e.name === "DriverAdapterError" && typeof e.cause == "object";
    }
    __name(vi2, "vi");
    function rn(e) {
      return { ok: true, value: e, map(r) {
        return rn(r(e));
      }, flatMap(r) {
        return r(e);
      } };
    }
    __name(rn, "rn");
    function sr(e) {
      return { ok: false, error: e, map() {
        return sr(e);
      }, flatMap() {
        return sr(e);
      } };
    }
    __name(sr, "sr");
    var ds2 = N("driver-adapter-utils");
    var Pi = class {
      static {
        __name(this, "Pi");
      }
      registeredErrors = [];
      consumeError(r) {
        return this.registeredErrors[r];
      }
      registerNewError(r) {
        let t = 0;
        for (; this.registeredErrors[t] !== void 0; ) t++;
        return this.registeredErrors[t] = { error: r }, t;
      }
    };
    var tn = /* @__PURE__ */ __name((e, r = new Pi()) => {
      let t = { adapterName: e.adapterName, errorRegistry: r, queryRaw: ke(r, e.queryRaw.bind(e)), executeRaw: ke(r, e.executeRaw.bind(e)), executeScript: ke(r, e.executeScript.bind(e)), dispose: ke(r, e.dispose.bind(e)), provider: e.provider, startTransaction: /* @__PURE__ */ __name(async (...n) => (await ke(r, e.startTransaction.bind(e))(...n)).map((o) => Uc(r, o)), "startTransaction") };
      return e.getConnectionInfo && (t.getConnectionInfo = Gc(r, e.getConnectionInfo.bind(e))), t;
    }, "tn");
    var Uc = /* @__PURE__ */ __name((e, r) => ({ adapterName: r.adapterName, provider: r.provider, options: r.options, queryRaw: ke(e, r.queryRaw.bind(r)), executeRaw: ke(e, r.executeRaw.bind(r)), commit: ke(e, r.commit.bind(r)), rollback: ke(e, r.rollback.bind(r)) }), "Uc");
    function ke(e, r) {
      return async (...t) => {
        try {
          return rn(await r(...t));
        } catch (n) {
          if (ds2("[error@wrapAsync]", n), vi2(n)) return sr(n.cause);
          let i = e.registerNewError(n);
          return sr({ kind: "GenericJs", id: i });
        }
      };
    }
    __name(ke, "ke");
    function Gc(e, r) {
      return (...t) => {
        try {
          return rn(r(...t));
        } catch (n) {
          if (ds2("[error@wrapSync]", n), vi2(n)) return sr(n.cause);
          let i = e.registerNewError(n);
          return sr({ kind: "GenericJs", id: i });
        }
      };
    }
    __name(Gc, "Gc");
    var Wc = O2(on());
    var M = O2(__require("node:path"));
    var Jc = O2(on());
    var wh = N("prisma:engines");
    function ms2() {
      return M.default.join(__dirname, "../");
    }
    __name(ms2, "ms");
    M.default.join(__dirname, "../query-engine-darwin");
    M.default.join(__dirname, "../query-engine-darwin-arm64");
    M.default.join(__dirname, "../query-engine-debian-openssl-1.0.x");
    M.default.join(__dirname, "../query-engine-debian-openssl-1.1.x");
    M.default.join(__dirname, "../query-engine-debian-openssl-3.0.x");
    M.default.join(__dirname, "../query-engine-linux-static-x64");
    M.default.join(__dirname, "../query-engine-linux-static-arm64");
    M.default.join(__dirname, "../query-engine-rhel-openssl-1.0.x");
    M.default.join(__dirname, "../query-engine-rhel-openssl-1.1.x");
    M.default.join(__dirname, "../query-engine-rhel-openssl-3.0.x");
    M.default.join(__dirname, "../libquery_engine-darwin.dylib.node");
    M.default.join(__dirname, "../libquery_engine-darwin-arm64.dylib.node");
    M.default.join(__dirname, "../libquery_engine-debian-openssl-1.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-debian-openssl-1.1.x.so.node");
    M.default.join(__dirname, "../libquery_engine-debian-openssl-3.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-1.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-1.1.x.so.node");
    M.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-3.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-linux-musl.so.node");
    M.default.join(__dirname, "../libquery_engine-linux-musl-openssl-3.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-rhel-openssl-1.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-rhel-openssl-1.1.x.so.node");
    M.default.join(__dirname, "../libquery_engine-rhel-openssl-3.0.x.so.node");
    M.default.join(__dirname, "../query_engine-windows.dll.node");
    var Si2 = O2(__require("node:fs"));
    var fs = gr2("chmodPlusX");
    function Ri(e) {
      if (process.platform === "win32") return;
      let r = Si2.default.statSync(e), t = r.mode | 64 | 8 | 1;
      if (r.mode === t) {
        fs(`Execution permissions of ${e} are fine`);
        return;
      }
      let n = t.toString(8).slice(-3);
      fs(`Have to call chmodPlusX on ${e}`), Si2.default.chmodSync(e, n);
    }
    __name(Ri, "Ri");
    function Ai(e) {
      let r = e.e, t = /* @__PURE__ */ __name((a2) => `Prisma cannot find the required \`${a2}\` system library in your system`, "t"), n = r.message.includes("cannot open shared object file"), i = `Please refer to the documentation about Prisma's system requirements: ${wi2("https://pris.ly/d/system-requirements")}`, o = `Unable to require(\`${Ce2(e.id)}\`).`, s = hr({ message: r.message, code: r.code }).with({ code: "ENOENT" }, () => "File does not exist.").when(({ message: a2 }) => n && a2.includes("libz"), () => `${t("libz")}. Please install it and try again.`).when(({ message: a2 }) => n && a2.includes("libgcc_s"), () => `${t("libgcc_s")}. Please install it and try again.`).when(({ message: a2 }) => n && a2.includes("libssl"), () => {
        let a2 = e.platformInfo.libssl ? `openssl-${e.platformInfo.libssl}` : "openssl";
        return `${t("libssl")}. Please install ${a2} and try again.`;
      }).when(({ message: a2 }) => a2.includes("GLIBC"), () => `Prisma has detected an incompatible version of the \`glibc\` C standard library installed in your system. This probably means your system may be too old to run Prisma. ${i}`).when(({ message: a2 }) => e.platformInfo.platform === "linux" && a2.includes("symbol not found"), () => `The Prisma engines are not compatible with your system ${e.platformInfo.originalDistro} on (${e.platformInfo.archFromUname}) which uses the \`${e.platformInfo.binaryTarget}\` binaryTarget by default. ${i}`).otherwise(() => `The Prisma engines do not seem to be compatible with your system. ${i}`);
      return `${o}
${s}

Details: ${r.message}`;
    }
    __name(Ai, "Ai");
    var ys2 = O2(hs(), 1);
    function Ci(e) {
      let r = (0, ys2.default)(e);
      if (r === 0) return e;
      let t = new RegExp(`^[ \\t]{${r}}`, "gm");
      return e.replace(t, "");
    }
    __name(Ci, "Ci");
    var bs = "prisma+postgres";
    var sn = `${bs}:`;
    function an(e) {
      return e?.toString().startsWith(`${sn}//`) ?? false;
    }
    __name(an, "an");
    function Ii(e) {
      if (!an(e)) return false;
      let { host: r } = new URL(e);
      return r.includes("localhost") || r.includes("127.0.0.1") || r.includes("[::1]");
    }
    __name(Ii, "Ii");
    var ws = O2(Di());
    function ki(e) {
      return String(new Oi(e));
    }
    __name(ki, "ki");
    var Oi = class {
      static {
        __name(this, "Oi");
      }
      constructor(r) {
        this.config = r;
      }
      toString() {
        let { config: r } = this, t = r.provider.fromEnvVar ? `env("${r.provider.fromEnvVar}")` : r.provider.value, n = JSON.parse(JSON.stringify({ provider: t, binaryTargets: Kc(r.binaryTargets) }));
        return `generator ${r.name} {
${(0, ws.default)(Hc(n), 2)}
}`;
      }
    };
    function Kc(e) {
      let r;
      if (e.length > 0) {
        let t = e.find((n) => n.fromEnvVar !== null);
        t ? r = `env("${t.fromEnvVar}")` : r = e.map((n) => n.native ? "native" : n.value);
      } else r = void 0;
      return r;
    }
    __name(Kc, "Kc");
    function Hc(e) {
      let r = Object.keys(e).reduce((t, n) => Math.max(t, n.length), 0);
      return Object.entries(e).map(([t, n]) => `${t.padEnd(r)} = ${Yc(n)}`).join(`
`);
    }
    __name(Hc, "Hc");
    function Yc(e) {
      return JSON.parse(JSON.stringify(e, (r, t) => Array.isArray(t) ? `[${t.map((n) => JSON.stringify(n)).join(", ")}]` : JSON.stringify(t)));
    }
    __name(Yc, "Yc");
    var nt2 = {};
    tr2(nt2, { error: /* @__PURE__ */ __name(() => Xc, "error"), info: /* @__PURE__ */ __name(() => Zc, "info"), log: /* @__PURE__ */ __name(() => zc, "log"), query: /* @__PURE__ */ __name(() => ep, "query"), should: /* @__PURE__ */ __name(() => xs, "should"), tags: /* @__PURE__ */ __name(() => tt2, "tags"), warn: /* @__PURE__ */ __name(() => _i, "warn") });
    var tt2 = { error: ce2("prisma:error"), warn: Ie2("prisma:warn"), info: De("prisma:info"), query: nr("prisma:query") };
    var xs = { warn: /* @__PURE__ */ __name(() => !process.env.PRISMA_DISABLE_WARNINGS, "warn") };
    function zc(...e) {
      console.log(...e);
    }
    __name(zc, "zc");
    function _i(e, ...r) {
      xs.warn() && console.warn(`${tt2.warn} ${e}`, ...r);
    }
    __name(_i, "_i");
    function Zc(e, ...r) {
      console.info(`${tt2.info} ${e}`, ...r);
    }
    __name(Zc, "Zc");
    function Xc(e, ...r) {
      console.error(`${tt2.error} ${e}`, ...r);
    }
    __name(Xc, "Xc");
    function ep(e, ...r) {
      console.log(`${tt2.query} ${e}`, ...r);
    }
    __name(ep, "ep");
    function ln2(e, r) {
      if (!e) throw new Error(`${r}. This should never happen. If you see this error, please, open an issue at https://pris.ly/prisma-prisma-bug-report`);
    }
    __name(ln2, "ln");
    function ar(e, r) {
      throw new Error(r);
    }
    __name(ar, "ar");
    function Ni({ onlyFirst: e = false } = {}) {
      let t = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
      return new RegExp(t, e ? void 0 : "g");
    }
    __name(Ni, "Ni");
    var rp = Ni();
    function wr2(e) {
      if (typeof e != "string") throw new TypeError(`Expected a \`string\`, got \`${typeof e}\``);
      return e.replace(rp, "");
    }
    __name(wr2, "wr");
    var it2 = O2(__require("node:path"));
    function Li(e) {
      return it2.default.sep === it2.default.posix.sep ? e : e.split(it2.default.sep).join(it2.default.posix.sep);
    }
    __name(Li, "Li");
    var qi = O2(As());
    var un = O2(__require("node:fs"));
    var xr2 = O2(__require("node:path"));
    function Cs2(e) {
      let r = e.ignoreProcessEnv ? {} : process.env, t = /* @__PURE__ */ __name((n) => n.match(/(.?\${(?:[a-zA-Z0-9_]+)?})/g)?.reduce(function(o, s) {
        let a2 = /(.?)\${([a-zA-Z0-9_]+)?}/g.exec(s);
        if (!a2) return o;
        let l = a2[1], u, c;
        if (l === "\\") c = a2[0], u = c.replace("\\$", "$");
        else {
          let p2 = a2[2];
          c = a2[0].substring(l.length), u = Object.hasOwnProperty.call(r, p2) ? r[p2] : e.parsed[p2] || "", u = t(u);
        }
        return o.replace(c, u);
      }, n) ?? n, "t");
      for (let n in e.parsed) {
        let i = Object.hasOwnProperty.call(r, n) ? r[n] : e.parsed[n];
        e.parsed[n] = t(i);
      }
      for (let n in e.parsed) r[n] = e.parsed[n];
      return e;
    }
    __name(Cs2, "Cs");
    var $i = gr2("prisma:tryLoadEnv");
    function st({ rootEnvPath: e, schemaEnvPath: r }, t = { conflictCheck: "none" }) {
      let n = Is2(e);
      t.conflictCheck !== "none" && hp(n, r, t.conflictCheck);
      let i = null;
      return Ds(n?.path, r) || (i = Is2(r)), !n && !i && $i("No Environment variables loaded"), i?.dotenvResult.error ? console.error(ce2(W("Schema Env Error: ")) + i.dotenvResult.error) : { message: [n?.message, i?.message].filter(Boolean).join(`
`), parsed: { ...n?.dotenvResult?.parsed, ...i?.dotenvResult?.parsed } };
    }
    __name(st, "st");
    function hp(e, r, t) {
      let n = e?.dotenvResult.parsed, i = !Ds(e?.path, r);
      if (n && r && i && un.default.existsSync(r)) {
        let o = qi.default.parse(un.default.readFileSync(r)), s = [];
        for (let a2 in o) n[a2] === o[a2] && s.push(a2);
        if (s.length > 0) {
          let a2 = xr2.default.relative(process.cwd(), e.path), l = xr2.default.relative(process.cwd(), r);
          if (t === "error") {
            let u = `There is a conflict between env var${s.length > 1 ? "s" : ""} in ${Y(a2)} and ${Y(l)}
Conflicting env vars:
${s.map((c) => `  ${W(c)}`).join(`
`)}

We suggest to move the contents of ${Y(l)} to ${Y(a2)} to consolidate your env vars.
`;
            throw new Error(u);
          } else if (t === "warn") {
            let u = `Conflict for env var${s.length > 1 ? "s" : ""} ${s.map((c) => W(c)).join(", ")} in ${Y(a2)} and ${Y(l)}
Env vars from ${Y(l)} overwrite the ones from ${Y(a2)}
      `;
            console.warn(`${Ie2("warn(prisma)")} ${u}`);
          }
        }
      }
    }
    __name(hp, "hp");
    function Is2(e) {
      if (yp(e)) {
        $i(`Environment variables loaded from ${e}`);
        let r = qi.default.config({ path: e, debug: process.env.DOTENV_CONFIG_DEBUG ? true : void 0 });
        return { dotenvResult: Cs2(r), message: Ce2(`Environment variables loaded from ${xr2.default.relative(process.cwd(), e)}`), path: e };
      } else $i(`Environment variables not found at ${e}`);
      return null;
    }
    __name(Is2, "Is");
    function Ds(e, r) {
      return e && r && xr2.default.resolve(e) === xr2.default.resolve(r);
    }
    __name(Ds, "Ds");
    function yp(e) {
      return !!(e && un.default.existsSync(e));
    }
    __name(yp, "yp");
    function Vi(e, r) {
      return Object.prototype.hasOwnProperty.call(e, r);
    }
    __name(Vi, "Vi");
    function pn(e, r) {
      let t = {};
      for (let n of Object.keys(e)) t[n] = r(e[n], n);
      return t;
    }
    __name(pn, "pn");
    function ji(e, r) {
      if (e.length === 0) return;
      let t = e[0];
      for (let n = 1; n < e.length; n++) r(t, e[n]) < 0 && (t = e[n]);
      return t;
    }
    __name(ji, "ji");
    function x2(e, r) {
      Object.defineProperty(e, "name", { value: r, configurable: true });
    }
    __name(x2, "x");
    var ks = /* @__PURE__ */ new Set();
    var at = /* @__PURE__ */ __name((e, r, ...t) => {
      ks.has(e) || (ks.add(e), _i(r, ...t));
    }, "at");
    var P = class e extends Error {
      static {
        __name(this, "e");
      }
      clientVersion;
      errorCode;
      retryable;
      constructor(r, t, n) {
        super(r), this.name = "PrismaClientInitializationError", this.clientVersion = t, this.errorCode = n, Error.captureStackTrace(e);
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientInitializationError";
      }
    };
    x2(P, "PrismaClientInitializationError");
    var z = class extends Error {
      static {
        __name(this, "z");
      }
      code;
      meta;
      clientVersion;
      batchRequestIdx;
      constructor(r, { code: t, clientVersion: n, meta: i, batchRequestIdx: o }) {
        super(r), this.name = "PrismaClientKnownRequestError", this.code = t, this.clientVersion = n, this.meta = i, Object.defineProperty(this, "batchRequestIdx", { value: o, enumerable: false, writable: true });
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientKnownRequestError";
      }
    };
    x2(z, "PrismaClientKnownRequestError");
    var ae = class extends Error {
      static {
        __name(this, "ae");
      }
      clientVersion;
      constructor(r, t) {
        super(r), this.name = "PrismaClientRustPanicError", this.clientVersion = t;
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientRustPanicError";
      }
    };
    x2(ae, "PrismaClientRustPanicError");
    var V = class extends Error {
      static {
        __name(this, "V");
      }
      clientVersion;
      batchRequestIdx;
      constructor(r, { clientVersion: t, batchRequestIdx: n }) {
        super(r), this.name = "PrismaClientUnknownRequestError", this.clientVersion = t, Object.defineProperty(this, "batchRequestIdx", { value: n, writable: true, enumerable: false });
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientUnknownRequestError";
      }
    };
    x2(V, "PrismaClientUnknownRequestError");
    var Z = class extends Error {
      static {
        __name(this, "Z");
      }
      name = "PrismaClientValidationError";
      clientVersion;
      constructor(r, { clientVersion: t }) {
        super(r), this.clientVersion = t;
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientValidationError";
      }
    };
    x2(Z, "PrismaClientValidationError");
    var we = class {
      static {
        __name(this, "we");
      }
      _map = /* @__PURE__ */ new Map();
      get(r) {
        return this._map.get(r)?.value;
      }
      set(r, t) {
        this._map.set(r, { value: t });
      }
      getOrCreate(r, t) {
        let n = this._map.get(r);
        if (n) return n.value;
        let i = t();
        return this.set(r, i), i;
      }
    };
    function We(e) {
      return e.substring(0, 1).toLowerCase() + e.substring(1);
    }
    __name(We, "We");
    function _s2(e, r) {
      let t = {};
      for (let n of e) {
        let i = n[r];
        t[i] = n;
      }
      return t;
    }
    __name(_s2, "_s");
    function lt(e) {
      let r;
      return { get() {
        return r || (r = { value: e() }), r.value;
      } };
    }
    __name(lt, "lt");
    function Ns(e) {
      return { models: Bi2(e.models), enums: Bi2(e.enums), types: Bi2(e.types) };
    }
    __name(Ns, "Ns");
    function Bi2(e) {
      let r = {};
      for (let { name: t, ...n } of e) r[t] = n;
      return r;
    }
    __name(Bi2, "Bi");
    function vr2(e) {
      return e instanceof Date || Object.prototype.toString.call(e) === "[object Date]";
    }
    __name(vr2, "vr");
    function mn(e) {
      return e.toString() !== "Invalid Date";
    }
    __name(mn, "mn");
    var Pr = 9e15;
    var Ye = 1e9;
    var Ui = "0123456789abcdef";
    var hn = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
    var yn = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
    var Gi = { precision: 20, rounding: 4, modulo: 1, toExpNeg: -7, toExpPos: 21, minE: -Pr, maxE: Pr, crypto: false };
    var $s;
    var Ne;
    var w = true;
    var En2 = "[DecimalError] ";
    var He2 = En2 + "Invalid argument: ";
    var qs2 = En2 + "Precision limit exceeded";
    var Vs2 = En2 + "crypto unavailable";
    var js2 = "[object Decimal]";
    var X = Math.floor;
    var U2 = Math.pow;
    var bp = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
    var Ep = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
    var wp = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
    var Bs = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
    var fe = 1e7;
    var E2 = 7;
    var xp = 9007199254740991;
    var vp = hn.length - 1;
    var Qi = yn.length - 1;
    var m2 = { toStringTag: js2 };
    m2.absoluteValue = m2.abs = function() {
      var e = new this.constructor(this);
      return e.s < 0 && (e.s = 1), y(e);
    };
    m2.ceil = function() {
      return y(new this.constructor(this), this.e + 1, 2);
    };
    m2.clampedTo = m2.clamp = function(e, r) {
      var t, n = this, i = n.constructor;
      if (e = new i(e), r = new i(r), !e.s || !r.s) return new i(NaN);
      if (e.gt(r)) throw Error(He2 + r);
      return t = n.cmp(e), t < 0 ? e : n.cmp(r) > 0 ? r : new i(n);
    };
    m2.comparedTo = m2.cmp = function(e) {
      var r, t, n, i, o = this, s = o.d, a2 = (e = new o.constructor(e)).d, l = o.s, u = e.s;
      if (!s || !a2) return !l || !u ? NaN : l !== u ? l : s === a2 ? 0 : !s ^ l < 0 ? 1 : -1;
      if (!s[0] || !a2[0]) return s[0] ? l : a2[0] ? -u : 0;
      if (l !== u) return l;
      if (o.e !== e.e) return o.e > e.e ^ l < 0 ? 1 : -1;
      for (n = s.length, i = a2.length, r = 0, t = n < i ? n : i; r < t; ++r) if (s[r] !== a2[r]) return s[r] > a2[r] ^ l < 0 ? 1 : -1;
      return n === i ? 0 : n > i ^ l < 0 ? 1 : -1;
    };
    m2.cosine = m2.cos = function() {
      var e, r, t = this, n = t.constructor;
      return t.d ? t.d[0] ? (e = n.precision, r = n.rounding, n.precision = e + Math.max(t.e, t.sd()) + E2, n.rounding = 1, t = Pp(n, Js(n, t)), n.precision = e, n.rounding = r, y(Ne == 2 || Ne == 3 ? t.neg() : t, e, r, true)) : new n(1) : new n(NaN);
    };
    m2.cubeRoot = m2.cbrt = function() {
      var e, r, t, n, i, o, s, a2, l, u, c = this, p2 = c.constructor;
      if (!c.isFinite() || c.isZero()) return new p2(c);
      for (w = false, o = c.s * U2(c.s * c, 1 / 3), !o || Math.abs(o) == 1 / 0 ? (t = J(c.d), e = c.e, (o = (e - t.length + 1) % 3) && (t += o == 1 || o == -2 ? "0" : "00"), o = U2(t, 1 / 3), e = X((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2)), o == 1 / 0 ? t = "5e" + e : (t = o.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + e), n = new p2(t), n.s = c.s) : n = new p2(o.toString()), s = (e = p2.precision) + 3; ; ) if (a2 = n, l = a2.times(a2).times(a2), u = l.plus(c), n = L(u.plus(c).times(a2), u.plus(l), s + 2, 1), J(a2.d).slice(0, s) === (t = J(n.d)).slice(0, s)) if (t = t.slice(s - 3, s + 1), t == "9999" || !i && t == "4999") {
        if (!i && (y(a2, e + 1, 0), a2.times(a2).times(a2).eq(c))) {
          n = a2;
          break;
        }
        s += 4, i = 1;
      } else {
        (!+t || !+t.slice(1) && t.charAt(0) == "5") && (y(n, e + 1, 1), r = !n.times(n).times(n).eq(c));
        break;
      }
      return w = true, y(n, e, p2.rounding, r);
    };
    m2.decimalPlaces = m2.dp = function() {
      var e, r = this.d, t = NaN;
      if (r) {
        if (e = r.length - 1, t = (e - X(this.e / E2)) * E2, e = r[e], e) for (; e % 10 == 0; e /= 10) t--;
        t < 0 && (t = 0);
      }
      return t;
    };
    m2.dividedBy = m2.div = function(e) {
      return L(this, new this.constructor(e));
    };
    m2.dividedToIntegerBy = m2.divToInt = function(e) {
      var r = this, t = r.constructor;
      return y(L(r, new t(e), 0, 1, 1), t.precision, t.rounding);
    };
    m2.equals = m2.eq = function(e) {
      return this.cmp(e) === 0;
    };
    m2.floor = function() {
      return y(new this.constructor(this), this.e + 1, 3);
    };
    m2.greaterThan = m2.gt = function(e) {
      return this.cmp(e) > 0;
    };
    m2.greaterThanOrEqualTo = m2.gte = function(e) {
      var r = this.cmp(e);
      return r == 1 || r === 0;
    };
    m2.hyperbolicCosine = m2.cosh = function() {
      var e, r, t, n, i, o = this, s = o.constructor, a2 = new s(1);
      if (!o.isFinite()) return new s(o.s ? 1 / 0 : NaN);
      if (o.isZero()) return a2;
      t = s.precision, n = s.rounding, s.precision = t + Math.max(o.e, o.sd()) + 4, s.rounding = 1, i = o.d.length, i < 32 ? (e = Math.ceil(i / 3), r = (1 / xn(4, e)).toString()) : (e = 16, r = "2.3283064365386962890625e-10"), o = Tr(s, 1, o.times(r), new s(1), true);
      for (var l, u = e, c = new s(8); u--; ) l = o.times(o), o = a2.minus(l.times(c.minus(l.times(c))));
      return y(o, s.precision = t, s.rounding = n, true);
    };
    m2.hyperbolicSine = m2.sinh = function() {
      var e, r, t, n, i = this, o = i.constructor;
      if (!i.isFinite() || i.isZero()) return new o(i);
      if (r = o.precision, t = o.rounding, o.precision = r + Math.max(i.e, i.sd()) + 4, o.rounding = 1, n = i.d.length, n < 3) i = Tr(o, 2, i, i, true);
      else {
        e = 1.4 * Math.sqrt(n), e = e > 16 ? 16 : e | 0, i = i.times(1 / xn(5, e)), i = Tr(o, 2, i, i, true);
        for (var s, a2 = new o(5), l = new o(16), u = new o(20); e--; ) s = i.times(i), i = i.times(a2.plus(s.times(l.times(s).plus(u))));
      }
      return o.precision = r, o.rounding = t, y(i, r, t, true);
    };
    m2.hyperbolicTangent = m2.tanh = function() {
      var e, r, t = this, n = t.constructor;
      return t.isFinite() ? t.isZero() ? new n(t) : (e = n.precision, r = n.rounding, n.precision = e + 7, n.rounding = 1, L(t.sinh(), t.cosh(), n.precision = e, n.rounding = r)) : new n(t.s);
    };
    m2.inverseCosine = m2.acos = function() {
      var e = this, r = e.constructor, t = e.abs().cmp(1), n = r.precision, i = r.rounding;
      return t !== -1 ? t === 0 ? e.isNeg() ? xe(r, n, i) : new r(0) : new r(NaN) : e.isZero() ? xe(r, n + 4, i).times(0.5) : (r.precision = n + 6, r.rounding = 1, e = new r(1).minus(e).div(e.plus(1)).sqrt().atan(), r.precision = n, r.rounding = i, e.times(2));
    };
    m2.inverseHyperbolicCosine = m2.acosh = function() {
      var e, r, t = this, n = t.constructor;
      return t.lte(1) ? new n(t.eq(1) ? 0 : NaN) : t.isFinite() ? (e = n.precision, r = n.rounding, n.precision = e + Math.max(Math.abs(t.e), t.sd()) + 4, n.rounding = 1, w = false, t = t.times(t).minus(1).sqrt().plus(t), w = true, n.precision = e, n.rounding = r, t.ln()) : new n(t);
    };
    m2.inverseHyperbolicSine = m2.asinh = function() {
      var e, r, t = this, n = t.constructor;
      return !t.isFinite() || t.isZero() ? new n(t) : (e = n.precision, r = n.rounding, n.precision = e + 2 * Math.max(Math.abs(t.e), t.sd()) + 6, n.rounding = 1, w = false, t = t.times(t).plus(1).sqrt().plus(t), w = true, n.precision = e, n.rounding = r, t.ln());
    };
    m2.inverseHyperbolicTangent = m2.atanh = function() {
      var e, r, t, n, i = this, o = i.constructor;
      return i.isFinite() ? i.e >= 0 ? new o(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN) : (e = o.precision, r = o.rounding, n = i.sd(), Math.max(n, e) < 2 * -i.e - 1 ? y(new o(i), e, r, true) : (o.precision = t = n - i.e, i = L(i.plus(1), new o(1).minus(i), t + e, 1), o.precision = e + 4, o.rounding = 1, i = i.ln(), o.precision = e, o.rounding = r, i.times(0.5))) : new o(NaN);
    };
    m2.inverseSine = m2.asin = function() {
      var e, r, t, n, i = this, o = i.constructor;
      return i.isZero() ? new o(i) : (r = i.abs().cmp(1), t = o.precision, n = o.rounding, r !== -1 ? r === 0 ? (e = xe(o, t + 4, n).times(0.5), e.s = i.s, e) : new o(NaN) : (o.precision = t + 6, o.rounding = 1, i = i.div(new o(1).minus(i.times(i)).sqrt().plus(1)).atan(), o.precision = t, o.rounding = n, i.times(2)));
    };
    m2.inverseTangent = m2.atan = function() {
      var e, r, t, n, i, o, s, a2, l, u = this, c = u.constructor, p2 = c.precision, d2 = c.rounding;
      if (u.isFinite()) {
        if (u.isZero()) return new c(u);
        if (u.abs().eq(1) && p2 + 4 <= Qi) return s = xe(c, p2 + 4, d2).times(0.25), s.s = u.s, s;
      } else {
        if (!u.s) return new c(NaN);
        if (p2 + 4 <= Qi) return s = xe(c, p2 + 4, d2).times(0.5), s.s = u.s, s;
      }
      for (c.precision = a2 = p2 + 10, c.rounding = 1, t = Math.min(28, a2 / E2 + 2 | 0), e = t; e; --e) u = u.div(u.times(u).plus(1).sqrt().plus(1));
      for (w = false, r = Math.ceil(a2 / E2), n = 1, l = u.times(u), s = new c(u), i = u; e !== -1; ) if (i = i.times(l), o = s.minus(i.div(n += 2)), i = i.times(l), s = o.plus(i.div(n += 2)), s.d[r] !== void 0) for (e = r; s.d[e] === o.d[e] && e--; ) ;
      return t && (s = s.times(2 << t - 1)), w = true, y(s, c.precision = p2, c.rounding = d2, true);
    };
    m2.isFinite = function() {
      return !!this.d;
    };
    m2.isInteger = m2.isInt = function() {
      return !!this.d && X(this.e / E2) > this.d.length - 2;
    };
    m2.isNaN = function() {
      return !this.s;
    };
    m2.isNegative = m2.isNeg = function() {
      return this.s < 0;
    };
    m2.isPositive = m2.isPos = function() {
      return this.s > 0;
    };
    m2.isZero = function() {
      return !!this.d && this.d[0] === 0;
    };
    m2.lessThan = m2.lt = function(e) {
      return this.cmp(e) < 0;
    };
    m2.lessThanOrEqualTo = m2.lte = function(e) {
      return this.cmp(e) < 1;
    };
    m2.logarithm = m2.log = function(e) {
      var r, t, n, i, o, s, a2, l, u = this, c = u.constructor, p2 = c.precision, d2 = c.rounding, f = 5;
      if (e == null) e = new c(10), r = true;
      else {
        if (e = new c(e), t = e.d, e.s < 0 || !t || !t[0] || e.eq(1)) return new c(NaN);
        r = e.eq(10);
      }
      if (t = u.d, u.s < 0 || !t || !t[0] || u.eq(1)) return new c(t && !t[0] ? -1 / 0 : u.s != 1 ? NaN : t ? 0 : 1 / 0);
      if (r) if (t.length > 1) o = true;
      else {
        for (i = t[0]; i % 10 === 0; ) i /= 10;
        o = i !== 1;
      }
      if (w = false, a2 = p2 + f, s = Ke(u, a2), n = r ? bn(c, a2 + 10) : Ke(e, a2), l = L(s, n, a2, 1), ut2(l.d, i = p2, d2)) do
        if (a2 += 10, s = Ke(u, a2), n = r ? bn(c, a2 + 10) : Ke(e, a2), l = L(s, n, a2, 1), !o) {
          +J(l.d).slice(i + 1, i + 15) + 1 == 1e14 && (l = y(l, p2 + 1, 0));
          break;
        }
      while (ut2(l.d, i += 10, d2));
      return w = true, y(l, p2, d2);
    };
    m2.minus = m2.sub = function(e) {
      var r, t, n, i, o, s, a2, l, u, c, p2, d2, f = this, h = f.constructor;
      if (e = new h(e), !f.d || !e.d) return !f.s || !e.s ? e = new h(NaN) : f.d ? e.s = -e.s : e = new h(e.d || f.s !== e.s ? f : NaN), e;
      if (f.s != e.s) return e.s = -e.s, f.plus(e);
      if (u = f.d, d2 = e.d, a2 = h.precision, l = h.rounding, !u[0] || !d2[0]) {
        if (d2[0]) e.s = -e.s;
        else if (u[0]) e = new h(f);
        else return new h(l === 3 ? -0 : 0);
        return w ? y(e, a2, l) : e;
      }
      if (t = X(e.e / E2), c = X(f.e / E2), u = u.slice(), o = c - t, o) {
        for (p2 = o < 0, p2 ? (r = u, o = -o, s = d2.length) : (r = d2, t = c, s = u.length), n = Math.max(Math.ceil(a2 / E2), s) + 2, o > n && (o = n, r.length = 1), r.reverse(), n = o; n--; ) r.push(0);
        r.reverse();
      } else {
        for (n = u.length, s = d2.length, p2 = n < s, p2 && (s = n), n = 0; n < s; n++) if (u[n] != d2[n]) {
          p2 = u[n] < d2[n];
          break;
        }
        o = 0;
      }
      for (p2 && (r = u, u = d2, d2 = r, e.s = -e.s), s = u.length, n = d2.length - s; n > 0; --n) u[s++] = 0;
      for (n = d2.length; n > o; ) {
        if (u[--n] < d2[n]) {
          for (i = n; i && u[--i] === 0; ) u[i] = fe - 1;
          --u[i], u[n] += fe;
        }
        u[n] -= d2[n];
      }
      for (; u[--s] === 0; ) u.pop();
      for (; u[0] === 0; u.shift()) --t;
      return u[0] ? (e.d = u, e.e = wn(u, t), w ? y(e, a2, l) : e) : new h(l === 3 ? -0 : 0);
    };
    m2.modulo = m2.mod = function(e) {
      var r, t = this, n = t.constructor;
      return e = new n(e), !t.d || !e.s || e.d && !e.d[0] ? new n(NaN) : !e.d || t.d && !t.d[0] ? y(new n(t), n.precision, n.rounding) : (w = false, n.modulo == 9 ? (r = L(t, e.abs(), 0, 3, 1), r.s *= e.s) : r = L(t, e, 0, n.modulo, 1), r = r.times(e), w = true, t.minus(r));
    };
    m2.naturalExponential = m2.exp = function() {
      return Wi2(this);
    };
    m2.naturalLogarithm = m2.ln = function() {
      return Ke(this);
    };
    m2.negated = m2.neg = function() {
      var e = new this.constructor(this);
      return e.s = -e.s, y(e);
    };
    m2.plus = m2.add = function(e) {
      var r, t, n, i, o, s, a2, l, u, c, p2 = this, d2 = p2.constructor;
      if (e = new d2(e), !p2.d || !e.d) return !p2.s || !e.s ? e = new d2(NaN) : p2.d || (e = new d2(e.d || p2.s === e.s ? p2 : NaN)), e;
      if (p2.s != e.s) return e.s = -e.s, p2.minus(e);
      if (u = p2.d, c = e.d, a2 = d2.precision, l = d2.rounding, !u[0] || !c[0]) return c[0] || (e = new d2(p2)), w ? y(e, a2, l) : e;
      if (o = X(p2.e / E2), n = X(e.e / E2), u = u.slice(), i = o - n, i) {
        for (i < 0 ? (t = u, i = -i, s = c.length) : (t = c, n = o, s = u.length), o = Math.ceil(a2 / E2), s = o > s ? o + 1 : s + 1, i > s && (i = s, t.length = 1), t.reverse(); i--; ) t.push(0);
        t.reverse();
      }
      for (s = u.length, i = c.length, s - i < 0 && (i = s, t = c, c = u, u = t), r = 0; i; ) r = (u[--i] = u[i] + c[i] + r) / fe | 0, u[i] %= fe;
      for (r && (u.unshift(r), ++n), s = u.length; u[--s] == 0; ) u.pop();
      return e.d = u, e.e = wn(u, n), w ? y(e, a2, l) : e;
    };
    m2.precision = m2.sd = function(e) {
      var r, t = this;
      if (e !== void 0 && e !== !!e && e !== 1 && e !== 0) throw Error(He2 + e);
      return t.d ? (r = Us(t.d), e && t.e + 1 > r && (r = t.e + 1)) : r = NaN, r;
    };
    m2.round = function() {
      var e = this, r = e.constructor;
      return y(new r(e), e.e + 1, r.rounding);
    };
    m2.sine = m2.sin = function() {
      var e, r, t = this, n = t.constructor;
      return t.isFinite() ? t.isZero() ? new n(t) : (e = n.precision, r = n.rounding, n.precision = e + Math.max(t.e, t.sd()) + E2, n.rounding = 1, t = Sp(n, Js(n, t)), n.precision = e, n.rounding = r, y(Ne > 2 ? t.neg() : t, e, r, true)) : new n(NaN);
    };
    m2.squareRoot = m2.sqrt = function() {
      var e, r, t, n, i, o, s = this, a2 = s.d, l = s.e, u = s.s, c = s.constructor;
      if (u !== 1 || !a2 || !a2[0]) return new c(!u || u < 0 && (!a2 || a2[0]) ? NaN : a2 ? s : 1 / 0);
      for (w = false, u = Math.sqrt(+s), u == 0 || u == 1 / 0 ? (r = J(a2), (r.length + l) % 2 == 0 && (r += "0"), u = Math.sqrt(r), l = X((l + 1) / 2) - (l < 0 || l % 2), u == 1 / 0 ? r = "5e" + l : (r = u.toExponential(), r = r.slice(0, r.indexOf("e") + 1) + l), n = new c(r)) : n = new c(u.toString()), t = (l = c.precision) + 3; ; ) if (o = n, n = o.plus(L(s, o, t + 2, 1)).times(0.5), J(o.d).slice(0, t) === (r = J(n.d)).slice(0, t)) if (r = r.slice(t - 3, t + 1), r == "9999" || !i && r == "4999") {
        if (!i && (y(o, l + 1, 0), o.times(o).eq(s))) {
          n = o;
          break;
        }
        t += 4, i = 1;
      } else {
        (!+r || !+r.slice(1) && r.charAt(0) == "5") && (y(n, l + 1, 1), e = !n.times(n).eq(s));
        break;
      }
      return w = true, y(n, l, c.rounding, e);
    };
    m2.tangent = m2.tan = function() {
      var e, r, t = this, n = t.constructor;
      return t.isFinite() ? t.isZero() ? new n(t) : (e = n.precision, r = n.rounding, n.precision = e + 10, n.rounding = 1, t = t.sin(), t.s = 1, t = L(t, new n(1).minus(t.times(t)).sqrt(), e + 10, 0), n.precision = e, n.rounding = r, y(Ne == 2 || Ne == 4 ? t.neg() : t, e, r, true)) : new n(NaN);
    };
    m2.times = m2.mul = function(e) {
      var r, t, n, i, o, s, a2, l, u, c = this, p2 = c.constructor, d2 = c.d, f = (e = new p2(e)).d;
      if (e.s *= c.s, !d2 || !d2[0] || !f || !f[0]) return new p2(!e.s || d2 && !d2[0] && !f || f && !f[0] && !d2 ? NaN : !d2 || !f ? e.s / 0 : e.s * 0);
      for (t = X(c.e / E2) + X(e.e / E2), l = d2.length, u = f.length, l < u && (o = d2, d2 = f, f = o, s = l, l = u, u = s), o = [], s = l + u, n = s; n--; ) o.push(0);
      for (n = u; --n >= 0; ) {
        for (r = 0, i = l + n; i > n; ) a2 = o[i] + f[n] * d2[i - n - 1] + r, o[i--] = a2 % fe | 0, r = a2 / fe | 0;
        o[i] = (o[i] + r) % fe | 0;
      }
      for (; !o[--s]; ) o.pop();
      return r ? ++t : o.shift(), e.d = o, e.e = wn(o, t), w ? y(e, p2.precision, p2.rounding) : e;
    };
    m2.toBinary = function(e, r) {
      return Ji(this, 2, e, r);
    };
    m2.toDecimalPlaces = m2.toDP = function(e, r) {
      var t = this, n = t.constructor;
      return t = new n(t), e === void 0 ? t : (ne(e, 0, Ye), r === void 0 ? r = n.rounding : ne(r, 0, 8), y(t, e + t.e + 1, r));
    };
    m2.toExponential = function(e, r) {
      var t, n = this, i = n.constructor;
      return e === void 0 ? t = ve(n, true) : (ne(e, 0, Ye), r === void 0 ? r = i.rounding : ne(r, 0, 8), n = y(new i(n), e + 1, r), t = ve(n, true, e + 1)), n.isNeg() && !n.isZero() ? "-" + t : t;
    };
    m2.toFixed = function(e, r) {
      var t, n, i = this, o = i.constructor;
      return e === void 0 ? t = ve(i) : (ne(e, 0, Ye), r === void 0 ? r = o.rounding : ne(r, 0, 8), n = y(new o(i), e + i.e + 1, r), t = ve(n, false, e + n.e + 1)), i.isNeg() && !i.isZero() ? "-" + t : t;
    };
    m2.toFraction = function(e) {
      var r, t, n, i, o, s, a2, l, u, c, p2, d2, f = this, h = f.d, g = f.constructor;
      if (!h) return new g(f);
      if (u = t = new g(1), n = l = new g(0), r = new g(n), o = r.e = Us(h) - f.e - 1, s = o % E2, r.d[0] = U2(10, s < 0 ? E2 + s : s), e == null) e = o > 0 ? r : u;
      else {
        if (a2 = new g(e), !a2.isInt() || a2.lt(u)) throw Error(He2 + a2);
        e = a2.gt(r) ? o > 0 ? r : u : a2;
      }
      for (w = false, a2 = new g(J(h)), c = g.precision, g.precision = o = h.length * E2 * 2; p2 = L(a2, r, 0, 1, 1), i = t.plus(p2.times(n)), i.cmp(e) != 1; ) t = n, n = i, i = u, u = l.plus(p2.times(i)), l = i, i = r, r = a2.minus(p2.times(i)), a2 = i;
      return i = L(e.minus(t), n, 0, 1, 1), l = l.plus(i.times(u)), t = t.plus(i.times(n)), l.s = u.s = f.s, d2 = L(u, n, o, 1).minus(f).abs().cmp(L(l, t, o, 1).minus(f).abs()) < 1 ? [u, n] : [l, t], g.precision = c, w = true, d2;
    };
    m2.toHexadecimal = m2.toHex = function(e, r) {
      return Ji(this, 16, e, r);
    };
    m2.toNearest = function(e, r) {
      var t = this, n = t.constructor;
      if (t = new n(t), e == null) {
        if (!t.d) return t;
        e = new n(1), r = n.rounding;
      } else {
        if (e = new n(e), r === void 0 ? r = n.rounding : ne(r, 0, 8), !t.d) return e.s ? t : e;
        if (!e.d) return e.s && (e.s = t.s), e;
      }
      return e.d[0] ? (w = false, t = L(t, e, 0, r, 1).times(e), w = true, y(t)) : (e.s = t.s, t = e), t;
    };
    m2.toNumber = function() {
      return +this;
    };
    m2.toOctal = function(e, r) {
      return Ji(this, 8, e, r);
    };
    m2.toPower = m2.pow = function(e) {
      var r, t, n, i, o, s, a2 = this, l = a2.constructor, u = +(e = new l(e));
      if (!a2.d || !e.d || !a2.d[0] || !e.d[0]) return new l(U2(+a2, u));
      if (a2 = new l(a2), a2.eq(1)) return a2;
      if (n = l.precision, o = l.rounding, e.eq(1)) return y(a2, n, o);
      if (r = X(e.e / E2), r >= e.d.length - 1 && (t = u < 0 ? -u : u) <= xp) return i = Gs2(l, a2, t, n), e.s < 0 ? new l(1).div(i) : y(i, n, o);
      if (s = a2.s, s < 0) {
        if (r < e.d.length - 1) return new l(NaN);
        if ((e.d[r] & 1) == 0 && (s = 1), a2.e == 0 && a2.d[0] == 1 && a2.d.length == 1) return a2.s = s, a2;
      }
      return t = U2(+a2, u), r = t == 0 || !isFinite(t) ? X(u * (Math.log("0." + J(a2.d)) / Math.LN10 + a2.e + 1)) : new l(t + "").e, r > l.maxE + 1 || r < l.minE - 1 ? new l(r > 0 ? s / 0 : 0) : (w = false, l.rounding = a2.s = 1, t = Math.min(12, (r + "").length), i = Wi2(e.times(Ke(a2, n + t)), n), i.d && (i = y(i, n + 5, 1), ut2(i.d, n, o) && (r = n + 10, i = y(Wi2(e.times(Ke(a2, r + t)), r), r + 5, 1), +J(i.d).slice(n + 1, n + 15) + 1 == 1e14 && (i = y(i, n + 1, 0)))), i.s = s, w = true, l.rounding = o, y(i, n, o));
    };
    m2.toPrecision = function(e, r) {
      var t, n = this, i = n.constructor;
      return e === void 0 ? t = ve(n, n.e <= i.toExpNeg || n.e >= i.toExpPos) : (ne(e, 1, Ye), r === void 0 ? r = i.rounding : ne(r, 0, 8), n = y(new i(n), e, r), t = ve(n, e <= n.e || n.e <= i.toExpNeg, e)), n.isNeg() && !n.isZero() ? "-" + t : t;
    };
    m2.toSignificantDigits = m2.toSD = function(e, r) {
      var t = this, n = t.constructor;
      return e === void 0 ? (e = n.precision, r = n.rounding) : (ne(e, 1, Ye), r === void 0 ? r = n.rounding : ne(r, 0, 8)), y(new n(t), e, r);
    };
    m2.toString = function() {
      var e = this, r = e.constructor, t = ve(e, e.e <= r.toExpNeg || e.e >= r.toExpPos);
      return e.isNeg() && !e.isZero() ? "-" + t : t;
    };
    m2.truncated = m2.trunc = function() {
      return y(new this.constructor(this), this.e + 1, 1);
    };
    m2.valueOf = m2.toJSON = function() {
      var e = this, r = e.constructor, t = ve(e, e.e <= r.toExpNeg || e.e >= r.toExpPos);
      return e.isNeg() ? "-" + t : t;
    };
    function J(e) {
      var r, t, n, i = e.length - 1, o = "", s = e[0];
      if (i > 0) {
        for (o += s, r = 1; r < i; r++) n = e[r] + "", t = E2 - n.length, t && (o += Je2(t)), o += n;
        s = e[r], n = s + "", t = E2 - n.length, t && (o += Je2(t));
      } else if (s === 0) return "0";
      for (; s % 10 === 0; ) s /= 10;
      return o + s;
    }
    __name(J, "J");
    function ne(e, r, t) {
      if (e !== ~~e || e < r || e > t) throw Error(He2 + e);
    }
    __name(ne, "ne");
    function ut2(e, r, t, n) {
      var i, o, s, a2;
      for (o = e[0]; o >= 10; o /= 10) --r;
      return --r < 0 ? (r += E2, i = 0) : (i = Math.ceil((r + 1) / E2), r %= E2), o = U2(10, E2 - r), a2 = e[i] % o | 0, n == null ? r < 3 ? (r == 0 ? a2 = a2 / 100 | 0 : r == 1 && (a2 = a2 / 10 | 0), s = t < 4 && a2 == 99999 || t > 3 && a2 == 49999 || a2 == 5e4 || a2 == 0) : s = (t < 4 && a2 + 1 == o || t > 3 && a2 + 1 == o / 2) && (e[i + 1] / o / 100 | 0) == U2(10, r - 2) - 1 || (a2 == o / 2 || a2 == 0) && (e[i + 1] / o / 100 | 0) == 0 : r < 4 ? (r == 0 ? a2 = a2 / 1e3 | 0 : r == 1 ? a2 = a2 / 100 | 0 : r == 2 && (a2 = a2 / 10 | 0), s = (n || t < 4) && a2 == 9999 || !n && t > 3 && a2 == 4999) : s = ((n || t < 4) && a2 + 1 == o || !n && t > 3 && a2 + 1 == o / 2) && (e[i + 1] / o / 1e3 | 0) == U2(10, r - 3) - 1, s;
    }
    __name(ut2, "ut");
    function fn(e, r, t) {
      for (var n, i = [0], o, s = 0, a2 = e.length; s < a2; ) {
        for (o = i.length; o--; ) i[o] *= r;
        for (i[0] += Ui.indexOf(e.charAt(s++)), n = 0; n < i.length; n++) i[n] > t - 1 && (i[n + 1] === void 0 && (i[n + 1] = 0), i[n + 1] += i[n] / t | 0, i[n] %= t);
      }
      return i.reverse();
    }
    __name(fn, "fn");
    function Pp(e, r) {
      var t, n, i;
      if (r.isZero()) return r;
      n = r.d.length, n < 32 ? (t = Math.ceil(n / 3), i = (1 / xn(4, t)).toString()) : (t = 16, i = "2.3283064365386962890625e-10"), e.precision += t, r = Tr(e, 1, r.times(i), new e(1));
      for (var o = t; o--; ) {
        var s = r.times(r);
        r = s.times(s).minus(s).times(8).plus(1);
      }
      return e.precision -= t, r;
    }
    __name(Pp, "Pp");
    var L = /* @__PURE__ */ function() {
      function e(n, i, o) {
        var s, a2 = 0, l = n.length;
        for (n = n.slice(); l--; ) s = n[l] * i + a2, n[l] = s % o | 0, a2 = s / o | 0;
        return a2 && n.unshift(a2), n;
      }
      __name(e, "e");
      function r(n, i, o, s) {
        var a2, l;
        if (o != s) l = o > s ? 1 : -1;
        else for (a2 = l = 0; a2 < o; a2++) if (n[a2] != i[a2]) {
          l = n[a2] > i[a2] ? 1 : -1;
          break;
        }
        return l;
      }
      __name(r, "r");
      function t(n, i, o, s) {
        for (var a2 = 0; o--; ) n[o] -= a2, a2 = n[o] < i[o] ? 1 : 0, n[o] = a2 * s + n[o] - i[o];
        for (; !n[0] && n.length > 1; ) n.shift();
      }
      __name(t, "t");
      return function(n, i, o, s, a2, l) {
        var u, c, p2, d2, f, h, g, I, T2, S2, b2, D, me, se, Kr, j, te, Ae, K, fr2, Vt = n.constructor, ti = n.s == i.s ? 1 : -1, H = n.d, k = i.d;
        if (!H || !H[0] || !k || !k[0]) return new Vt(!n.s || !i.s || (H ? k && H[0] == k[0] : !k) ? NaN : H && H[0] == 0 || !k ? ti * 0 : ti / 0);
        for (l ? (f = 1, c = n.e - i.e) : (l = fe, f = E2, c = X(n.e / f) - X(i.e / f)), K = k.length, te = H.length, T2 = new Vt(ti), S2 = T2.d = [], p2 = 0; k[p2] == (H[p2] || 0); p2++) ;
        if (k[p2] > (H[p2] || 0) && c--, o == null ? (se = o = Vt.precision, s = Vt.rounding) : a2 ? se = o + (n.e - i.e) + 1 : se = o, se < 0) S2.push(1), h = true;
        else {
          if (se = se / f + 2 | 0, p2 = 0, K == 1) {
            for (d2 = 0, k = k[0], se++; (p2 < te || d2) && se--; p2++) Kr = d2 * l + (H[p2] || 0), S2[p2] = Kr / k | 0, d2 = Kr % k | 0;
            h = d2 || p2 < te;
          } else {
            for (d2 = l / (k[0] + 1) | 0, d2 > 1 && (k = e(k, d2, l), H = e(H, d2, l), K = k.length, te = H.length), j = K, b2 = H.slice(0, K), D = b2.length; D < K; ) b2[D++] = 0;
            fr2 = k.slice(), fr2.unshift(0), Ae = k[0], k[1] >= l / 2 && ++Ae;
            do
              d2 = 0, u = r(k, b2, K, D), u < 0 ? (me = b2[0], K != D && (me = me * l + (b2[1] || 0)), d2 = me / Ae | 0, d2 > 1 ? (d2 >= l && (d2 = l - 1), g = e(k, d2, l), I = g.length, D = b2.length, u = r(g, b2, I, D), u == 1 && (d2--, t(g, K < I ? fr2 : k, I, l))) : (d2 == 0 && (u = d2 = 1), g = k.slice()), I = g.length, I < D && g.unshift(0), t(b2, g, D, l), u == -1 && (D = b2.length, u = r(k, b2, K, D), u < 1 && (d2++, t(b2, K < D ? fr2 : k, D, l))), D = b2.length) : u === 0 && (d2++, b2 = [0]), S2[p2++] = d2, u && b2[0] ? b2[D++] = H[j] || 0 : (b2 = [H[j]], D = 1);
            while ((j++ < te || b2[0] !== void 0) && se--);
            h = b2[0] !== void 0;
          }
          S2[0] || S2.shift();
        }
        if (f == 1) T2.e = c, $s = h;
        else {
          for (p2 = 1, d2 = S2[0]; d2 >= 10; d2 /= 10) p2++;
          T2.e = p2 + c * f - 1, y(T2, a2 ? o + T2.e + 1 : o, s, h);
        }
        return T2;
      };
    }();
    function y(e, r, t, n) {
      var i, o, s, a2, l, u, c, p2, d2, f = e.constructor;
      e: if (r != null) {
        if (p2 = e.d, !p2) return e;
        for (i = 1, a2 = p2[0]; a2 >= 10; a2 /= 10) i++;
        if (o = r - i, o < 0) o += E2, s = r, c = p2[d2 = 0], l = c / U2(10, i - s - 1) % 10 | 0;
        else if (d2 = Math.ceil((o + 1) / E2), a2 = p2.length, d2 >= a2) if (n) {
          for (; a2++ <= d2; ) p2.push(0);
          c = l = 0, i = 1, o %= E2, s = o - E2 + 1;
        } else break e;
        else {
          for (c = a2 = p2[d2], i = 1; a2 >= 10; a2 /= 10) i++;
          o %= E2, s = o - E2 + i, l = s < 0 ? 0 : c / U2(10, i - s - 1) % 10 | 0;
        }
        if (n = n || r < 0 || p2[d2 + 1] !== void 0 || (s < 0 ? c : c % U2(10, i - s - 1)), u = t < 4 ? (l || n) && (t == 0 || t == (e.s < 0 ? 3 : 2)) : l > 5 || l == 5 && (t == 4 || n || t == 6 && (o > 0 ? s > 0 ? c / U2(10, i - s) : 0 : p2[d2 - 1]) % 10 & 1 || t == (e.s < 0 ? 8 : 7)), r < 1 || !p2[0]) return p2.length = 0, u ? (r -= e.e + 1, p2[0] = U2(10, (E2 - r % E2) % E2), e.e = -r || 0) : p2[0] = e.e = 0, e;
        if (o == 0 ? (p2.length = d2, a2 = 1, d2--) : (p2.length = d2 + 1, a2 = U2(10, E2 - o), p2[d2] = s > 0 ? (c / U2(10, i - s) % U2(10, s) | 0) * a2 : 0), u) for (; ; ) if (d2 == 0) {
          for (o = 1, s = p2[0]; s >= 10; s /= 10) o++;
          for (s = p2[0] += a2, a2 = 1; s >= 10; s /= 10) a2++;
          o != a2 && (e.e++, p2[0] == fe && (p2[0] = 1));
          break;
        } else {
          if (p2[d2] += a2, p2[d2] != fe) break;
          p2[d2--] = 0, a2 = 1;
        }
        for (o = p2.length; p2[--o] === 0; ) p2.pop();
      }
      return w && (e.e > f.maxE ? (e.d = null, e.e = NaN) : e.e < f.minE && (e.e = 0, e.d = [0])), e;
    }
    __name(y, "y");
    function ve(e, r, t) {
      if (!e.isFinite()) return Ws2(e);
      var n, i = e.e, o = J(e.d), s = o.length;
      return r ? (t && (n = t - s) > 0 ? o = o.charAt(0) + "." + o.slice(1) + Je2(n) : s > 1 && (o = o.charAt(0) + "." + o.slice(1)), o = o + (e.e < 0 ? "e" : "e+") + e.e) : i < 0 ? (o = "0." + Je2(-i - 1) + o, t && (n = t - s) > 0 && (o += Je2(n))) : i >= s ? (o += Je2(i + 1 - s), t && (n = t - i - 1) > 0 && (o = o + "." + Je2(n))) : ((n = i + 1) < s && (o = o.slice(0, n) + "." + o.slice(n)), t && (n = t - s) > 0 && (i + 1 === s && (o += "."), o += Je2(n))), o;
    }
    __name(ve, "ve");
    function wn(e, r) {
      var t = e[0];
      for (r *= E2; t >= 10; t /= 10) r++;
      return r;
    }
    __name(wn, "wn");
    function bn(e, r, t) {
      if (r > vp) throw w = true, t && (e.precision = t), Error(qs2);
      return y(new e(hn), r, 1, true);
    }
    __name(bn, "bn");
    function xe(e, r, t) {
      if (r > Qi) throw Error(qs2);
      return y(new e(yn), r, t, true);
    }
    __name(xe, "xe");
    function Us(e) {
      var r = e.length - 1, t = r * E2 + 1;
      if (r = e[r], r) {
        for (; r % 10 == 0; r /= 10) t--;
        for (r = e[0]; r >= 10; r /= 10) t++;
      }
      return t;
    }
    __name(Us, "Us");
    function Je2(e) {
      for (var r = ""; e--; ) r += "0";
      return r;
    }
    __name(Je2, "Je");
    function Gs2(e, r, t, n) {
      var i, o = new e(1), s = Math.ceil(n / E2 + 4);
      for (w = false; ; ) {
        if (t % 2 && (o = o.times(r), Fs(o.d, s) && (i = true)), t = X(t / 2), t === 0) {
          t = o.d.length - 1, i && o.d[t] === 0 && ++o.d[t];
          break;
        }
        r = r.times(r), Fs(r.d, s);
      }
      return w = true, o;
    }
    __name(Gs2, "Gs");
    function Ls(e) {
      return e.d[e.d.length - 1] & 1;
    }
    __name(Ls, "Ls");
    function Qs2(e, r, t) {
      for (var n, i, o = new e(r[0]), s = 0; ++s < r.length; ) {
        if (i = new e(r[s]), !i.s) {
          o = i;
          break;
        }
        n = o.cmp(i), (n === t || n === 0 && o.s === t) && (o = i);
      }
      return o;
    }
    __name(Qs2, "Qs");
    function Wi2(e, r) {
      var t, n, i, o, s, a2, l, u = 0, c = 0, p2 = 0, d2 = e.constructor, f = d2.rounding, h = d2.precision;
      if (!e.d || !e.d[0] || e.e > 17) return new d2(e.d ? e.d[0] ? e.s < 0 ? 0 : 1 / 0 : 1 : e.s ? e.s < 0 ? 0 : e : NaN);
      for (r == null ? (w = false, l = h) : l = r, a2 = new d2(0.03125); e.e > -2; ) e = e.times(a2), p2 += 5;
      for (n = Math.log(U2(2, p2)) / Math.LN10 * 2 + 5 | 0, l += n, t = o = s = new d2(1), d2.precision = l; ; ) {
        if (o = y(o.times(e), l, 1), t = t.times(++c), a2 = s.plus(L(o, t, l, 1)), J(a2.d).slice(0, l) === J(s.d).slice(0, l)) {
          for (i = p2; i--; ) s = y(s.times(s), l, 1);
          if (r == null) if (u < 3 && ut2(s.d, l - n, f, u)) d2.precision = l += 10, t = o = a2 = new d2(1), c = 0, u++;
          else return y(s, d2.precision = h, f, w = true);
          else return d2.precision = h, s;
        }
        s = a2;
      }
    }
    __name(Wi2, "Wi");
    function Ke(e, r) {
      var t, n, i, o, s, a2, l, u, c, p2, d2, f = 1, h = 10, g = e, I = g.d, T2 = g.constructor, S2 = T2.rounding, b2 = T2.precision;
      if (g.s < 0 || !I || !I[0] || !g.e && I[0] == 1 && I.length == 1) return new T2(I && !I[0] ? -1 / 0 : g.s != 1 ? NaN : I ? 0 : g);
      if (r == null ? (w = false, c = b2) : c = r, T2.precision = c += h, t = J(I), n = t.charAt(0), Math.abs(o = g.e) < 15e14) {
        for (; n < 7 && n != 1 || n == 1 && t.charAt(1) > 3; ) g = g.times(e), t = J(g.d), n = t.charAt(0), f++;
        o = g.e, n > 1 ? (g = new T2("0." + t), o++) : g = new T2(n + "." + t.slice(1));
      } else return u = bn(T2, c + 2, b2).times(o + ""), g = Ke(new T2(n + "." + t.slice(1)), c - h).plus(u), T2.precision = b2, r == null ? y(g, b2, S2, w = true) : g;
      for (p2 = g, l = s = g = L(g.minus(1), g.plus(1), c, 1), d2 = y(g.times(g), c, 1), i = 3; ; ) {
        if (s = y(s.times(d2), c, 1), u = l.plus(L(s, new T2(i), c, 1)), J(u.d).slice(0, c) === J(l.d).slice(0, c)) if (l = l.times(2), o !== 0 && (l = l.plus(bn(T2, c + 2, b2).times(o + ""))), l = L(l, new T2(f), c, 1), r == null) if (ut2(l.d, c - h, S2, a2)) T2.precision = c += h, u = s = g = L(p2.minus(1), p2.plus(1), c, 1), d2 = y(g.times(g), c, 1), i = a2 = 1;
        else return y(l, T2.precision = b2, S2, w = true);
        else return T2.precision = b2, l;
        l = u, i += 2;
      }
    }
    __name(Ke, "Ke");
    function Ws2(e) {
      return String(e.s * e.s / 0);
    }
    __name(Ws2, "Ws");
    function gn(e, r) {
      var t, n, i;
      for ((t = r.indexOf(".")) > -1 && (r = r.replace(".", "")), (n = r.search(/e/i)) > 0 ? (t < 0 && (t = n), t += +r.slice(n + 1), r = r.substring(0, n)) : t < 0 && (t = r.length), n = 0; r.charCodeAt(n) === 48; n++) ;
      for (i = r.length; r.charCodeAt(i - 1) === 48; --i) ;
      if (r = r.slice(n, i), r) {
        if (i -= n, e.e = t = t - n - 1, e.d = [], n = (t + 1) % E2, t < 0 && (n += E2), n < i) {
          for (n && e.d.push(+r.slice(0, n)), i -= E2; n < i; ) e.d.push(+r.slice(n, n += E2));
          r = r.slice(n), n = E2 - r.length;
        } else n -= i;
        for (; n--; ) r += "0";
        e.d.push(+r), w && (e.e > e.constructor.maxE ? (e.d = null, e.e = NaN) : e.e < e.constructor.minE && (e.e = 0, e.d = [0]));
      } else e.e = 0, e.d = [0];
      return e;
    }
    __name(gn, "gn");
    function Tp(e, r) {
      var t, n, i, o, s, a2, l, u, c;
      if (r.indexOf("_") > -1) {
        if (r = r.replace(/(\d)_(?=\d)/g, "$1"), Bs.test(r)) return gn(e, r);
      } else if (r === "Infinity" || r === "NaN") return +r || (e.s = NaN), e.e = NaN, e.d = null, e;
      if (Ep.test(r)) t = 16, r = r.toLowerCase();
      else if (bp.test(r)) t = 2;
      else if (wp.test(r)) t = 8;
      else throw Error(He2 + r);
      for (o = r.search(/p/i), o > 0 ? (l = +r.slice(o + 1), r = r.substring(2, o)) : r = r.slice(2), o = r.indexOf("."), s = o >= 0, n = e.constructor, s && (r = r.replace(".", ""), a2 = r.length, o = a2 - o, i = Gs2(n, new n(t), o, o * 2)), u = fn(r, t, fe), c = u.length - 1, o = c; u[o] === 0; --o) u.pop();
      return o < 0 ? new n(e.s * 0) : (e.e = wn(u, c), e.d = u, w = false, s && (e = L(e, i, a2 * 4)), l && (e = e.times(Math.abs(l) < 54 ? U2(2, l) : Le.pow(2, l))), w = true, e);
    }
    __name(Tp, "Tp");
    function Sp(e, r) {
      var t, n = r.d.length;
      if (n < 3) return r.isZero() ? r : Tr(e, 2, r, r);
      t = 1.4 * Math.sqrt(n), t = t > 16 ? 16 : t | 0, r = r.times(1 / xn(5, t)), r = Tr(e, 2, r, r);
      for (var i, o = new e(5), s = new e(16), a2 = new e(20); t--; ) i = r.times(r), r = r.times(o.plus(i.times(s.times(i).minus(a2))));
      return r;
    }
    __name(Sp, "Sp");
    function Tr(e, r, t, n, i) {
      var o, s, a2, l, u = 1, c = e.precision, p2 = Math.ceil(c / E2);
      for (w = false, l = t.times(t), a2 = new e(n); ; ) {
        if (s = L(a2.times(l), new e(r++ * r++), c, 1), a2 = i ? n.plus(s) : n.minus(s), n = L(s.times(l), new e(r++ * r++), c, 1), s = a2.plus(n), s.d[p2] !== void 0) {
          for (o = p2; s.d[o] === a2.d[o] && o--; ) ;
          if (o == -1) break;
        }
        o = a2, a2 = n, n = s, s = o, u++;
      }
      return w = true, s.d.length = p2 + 1, s;
    }
    __name(Tr, "Tr");
    function xn(e, r) {
      for (var t = e; --r; ) t *= e;
      return t;
    }
    __name(xn, "xn");
    function Js(e, r) {
      var t, n = r.s < 0, i = xe(e, e.precision, 1), o = i.times(0.5);
      if (r = r.abs(), r.lte(o)) return Ne = n ? 4 : 1, r;
      if (t = r.divToInt(i), t.isZero()) Ne = n ? 3 : 2;
      else {
        if (r = r.minus(t.times(i)), r.lte(o)) return Ne = Ls(t) ? n ? 2 : 3 : n ? 4 : 1, r;
        Ne = Ls(t) ? n ? 1 : 4 : n ? 3 : 2;
      }
      return r.minus(i).abs();
    }
    __name(Js, "Js");
    function Ji(e, r, t, n) {
      var i, o, s, a2, l, u, c, p2, d2, f = e.constructor, h = t !== void 0;
      if (h ? (ne(t, 1, Ye), n === void 0 ? n = f.rounding : ne(n, 0, 8)) : (t = f.precision, n = f.rounding), !e.isFinite()) c = Ws2(e);
      else {
        for (c = ve(e), s = c.indexOf("."), h ? (i = 2, r == 16 ? t = t * 4 - 3 : r == 8 && (t = t * 3 - 2)) : i = r, s >= 0 && (c = c.replace(".", ""), d2 = new f(1), d2.e = c.length - s, d2.d = fn(ve(d2), 10, i), d2.e = d2.d.length), p2 = fn(c, 10, i), o = l = p2.length; p2[--l] == 0; ) p2.pop();
        if (!p2[0]) c = h ? "0p+0" : "0";
        else {
          if (s < 0 ? o-- : (e = new f(e), e.d = p2, e.e = o, e = L(e, d2, t, n, 0, i), p2 = e.d, o = e.e, u = $s), s = p2[t], a2 = i / 2, u = u || p2[t + 1] !== void 0, u = n < 4 ? (s !== void 0 || u) && (n === 0 || n === (e.s < 0 ? 3 : 2)) : s > a2 || s === a2 && (n === 4 || u || n === 6 && p2[t - 1] & 1 || n === (e.s < 0 ? 8 : 7)), p2.length = t, u) for (; ++p2[--t] > i - 1; ) p2[t] = 0, t || (++o, p2.unshift(1));
          for (l = p2.length; !p2[l - 1]; --l) ;
          for (s = 0, c = ""; s < l; s++) c += Ui.charAt(p2[s]);
          if (h) {
            if (l > 1) if (r == 16 || r == 8) {
              for (s = r == 16 ? 4 : 3, --l; l % s; l++) c += "0";
              for (p2 = fn(c, i, r), l = p2.length; !p2[l - 1]; --l) ;
              for (s = 1, c = "1."; s < l; s++) c += Ui.charAt(p2[s]);
            } else c = c.charAt(0) + "." + c.slice(1);
            c = c + (o < 0 ? "p" : "p+") + o;
          } else if (o < 0) {
            for (; ++o; ) c = "0" + c;
            c = "0." + c;
          } else if (++o > l) for (o -= l; o--; ) c += "0";
          else o < l && (c = c.slice(0, o) + "." + c.slice(o));
        }
        c = (r == 16 ? "0x" : r == 2 ? "0b" : r == 8 ? "0o" : "") + c;
      }
      return e.s < 0 ? "-" + c : c;
    }
    __name(Ji, "Ji");
    function Fs(e, r) {
      if (e.length > r) return e.length = r, true;
    }
    __name(Fs, "Fs");
    function Rp(e) {
      return new this(e).abs();
    }
    __name(Rp, "Rp");
    function Ap(e) {
      return new this(e).acos();
    }
    __name(Ap, "Ap");
    function Cp(e) {
      return new this(e).acosh();
    }
    __name(Cp, "Cp");
    function Ip(e, r) {
      return new this(e).plus(r);
    }
    __name(Ip, "Ip");
    function Dp(e) {
      return new this(e).asin();
    }
    __name(Dp, "Dp");
    function Op(e) {
      return new this(e).asinh();
    }
    __name(Op, "Op");
    function kp(e) {
      return new this(e).atan();
    }
    __name(kp, "kp");
    function _p(e) {
      return new this(e).atanh();
    }
    __name(_p, "_p");
    function Np(e, r) {
      e = new this(e), r = new this(r);
      var t, n = this.precision, i = this.rounding, o = n + 4;
      return !e.s || !r.s ? t = new this(NaN) : !e.d && !r.d ? (t = xe(this, o, 1).times(r.s > 0 ? 0.25 : 0.75), t.s = e.s) : !r.d || e.isZero() ? (t = r.s < 0 ? xe(this, n, i) : new this(0), t.s = e.s) : !e.d || r.isZero() ? (t = xe(this, o, 1).times(0.5), t.s = e.s) : r.s < 0 ? (this.precision = o, this.rounding = 1, t = this.atan(L(e, r, o, 1)), r = xe(this, o, 1), this.precision = n, this.rounding = i, t = e.s < 0 ? t.minus(r) : t.plus(r)) : t = this.atan(L(e, r, o, 1)), t;
    }
    __name(Np, "Np");
    function Lp(e) {
      return new this(e).cbrt();
    }
    __name(Lp, "Lp");
    function Fp(e) {
      return y(e = new this(e), e.e + 1, 2);
    }
    __name(Fp, "Fp");
    function Mp(e, r, t) {
      return new this(e).clamp(r, t);
    }
    __name(Mp, "Mp");
    function $p(e) {
      if (!e || typeof e != "object") throw Error(En2 + "Object expected");
      var r, t, n, i = e.defaults === true, o = ["precision", 1, Ye, "rounding", 0, 8, "toExpNeg", -Pr, 0, "toExpPos", 0, Pr, "maxE", 0, Pr, "minE", -Pr, 0, "modulo", 0, 9];
      for (r = 0; r < o.length; r += 3) if (t = o[r], i && (this[t] = Gi[t]), (n = e[t]) !== void 0) if (X(n) === n && n >= o[r + 1] && n <= o[r + 2]) this[t] = n;
      else throw Error(He2 + t + ": " + n);
      if (t = "crypto", i && (this[t] = Gi[t]), (n = e[t]) !== void 0) if (n === true || n === false || n === 0 || n === 1) if (n) if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes)) this[t] = true;
      else throw Error(Vs2);
      else this[t] = false;
      else throw Error(He2 + t + ": " + n);
      return this;
    }
    __name($p, "$p");
    function qp(e) {
      return new this(e).cos();
    }
    __name(qp, "qp");
    function Vp(e) {
      return new this(e).cosh();
    }
    __name(Vp, "Vp");
    function Ks(e) {
      var r, t, n;
      function i(o) {
        var s, a2, l, u = this;
        if (!(u instanceof i)) return new i(o);
        if (u.constructor = i, Ms2(o)) {
          u.s = o.s, w ? !o.d || o.e > i.maxE ? (u.e = NaN, u.d = null) : o.e < i.minE ? (u.e = 0, u.d = [0]) : (u.e = o.e, u.d = o.d.slice()) : (u.e = o.e, u.d = o.d ? o.d.slice() : o.d);
          return;
        }
        if (l = typeof o, l === "number") {
          if (o === 0) {
            u.s = 1 / o < 0 ? -1 : 1, u.e = 0, u.d = [0];
            return;
          }
          if (o < 0 ? (o = -o, u.s = -1) : u.s = 1, o === ~~o && o < 1e7) {
            for (s = 0, a2 = o; a2 >= 10; a2 /= 10) s++;
            w ? s > i.maxE ? (u.e = NaN, u.d = null) : s < i.minE ? (u.e = 0, u.d = [0]) : (u.e = s, u.d = [o]) : (u.e = s, u.d = [o]);
            return;
          }
          if (o * 0 !== 0) {
            o || (u.s = NaN), u.e = NaN, u.d = null;
            return;
          }
          return gn(u, o.toString());
        }
        if (l === "string") return (a2 = o.charCodeAt(0)) === 45 ? (o = o.slice(1), u.s = -1) : (a2 === 43 && (o = o.slice(1)), u.s = 1), Bs.test(o) ? gn(u, o) : Tp(u, o);
        if (l === "bigint") return o < 0 ? (o = -o, u.s = -1) : u.s = 1, gn(u, o.toString());
        throw Error(He2 + o);
      }
      __name(i, "i");
      if (i.prototype = m2, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.EUCLID = 9, i.config = i.set = $p, i.clone = Ks, i.isDecimal = Ms2, i.abs = Rp, i.acos = Ap, i.acosh = Cp, i.add = Ip, i.asin = Dp, i.asinh = Op, i.atan = kp, i.atanh = _p, i.atan2 = Np, i.cbrt = Lp, i.ceil = Fp, i.clamp = Mp, i.cos = qp, i.cosh = Vp, i.div = jp, i.exp = Bp, i.floor = Up, i.hypot = Gp, i.ln = Qp, i.log = Wp, i.log10 = Kp, i.log2 = Jp, i.max = Hp, i.min = Yp, i.mod = zp, i.mul = Zp, i.pow = Xp, i.random = ed, i.round = rd, i.sign = td, i.sin = nd, i.sinh = id, i.sqrt = od, i.sub = sd, i.sum = ad, i.tan = ld, i.tanh = ud, i.trunc = cd, e === void 0 && (e = {}), e && e.defaults !== true) for (n = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], r = 0; r < n.length; ) e.hasOwnProperty(t = n[r++]) || (e[t] = this[t]);
      return i.config(e), i;
    }
    __name(Ks, "Ks");
    function jp(e, r) {
      return new this(e).div(r);
    }
    __name(jp, "jp");
    function Bp(e) {
      return new this(e).exp();
    }
    __name(Bp, "Bp");
    function Up(e) {
      return y(e = new this(e), e.e + 1, 3);
    }
    __name(Up, "Up");
    function Gp() {
      var e, r, t = new this(0);
      for (w = false, e = 0; e < arguments.length; ) if (r = new this(arguments[e++]), r.d) t.d && (t = t.plus(r.times(r)));
      else {
        if (r.s) return w = true, new this(1 / 0);
        t = r;
      }
      return w = true, t.sqrt();
    }
    __name(Gp, "Gp");
    function Ms2(e) {
      return e instanceof Le || e && e.toStringTag === js2 || false;
    }
    __name(Ms2, "Ms");
    function Qp(e) {
      return new this(e).ln();
    }
    __name(Qp, "Qp");
    function Wp(e, r) {
      return new this(e).log(r);
    }
    __name(Wp, "Wp");
    function Jp(e) {
      return new this(e).log(2);
    }
    __name(Jp, "Jp");
    function Kp(e) {
      return new this(e).log(10);
    }
    __name(Kp, "Kp");
    function Hp() {
      return Qs2(this, arguments, -1);
    }
    __name(Hp, "Hp");
    function Yp() {
      return Qs2(this, arguments, 1);
    }
    __name(Yp, "Yp");
    function zp(e, r) {
      return new this(e).mod(r);
    }
    __name(zp, "zp");
    function Zp(e, r) {
      return new this(e).mul(r);
    }
    __name(Zp, "Zp");
    function Xp(e, r) {
      return new this(e).pow(r);
    }
    __name(Xp, "Xp");
    function ed(e) {
      var r, t, n, i, o = 0, s = new this(1), a2 = [];
      if (e === void 0 ? e = this.precision : ne(e, 1, Ye), n = Math.ceil(e / E2), this.crypto) if (crypto.getRandomValues) for (r = crypto.getRandomValues(new Uint32Array(n)); o < n; ) i = r[o], i >= 429e7 ? r[o] = crypto.getRandomValues(new Uint32Array(1))[0] : a2[o++] = i % 1e7;
      else if (crypto.randomBytes) {
        for (r = crypto.randomBytes(n *= 4); o < n; ) i = r[o] + (r[o + 1] << 8) + (r[o + 2] << 16) + ((r[o + 3] & 127) << 24), i >= 214e7 ? crypto.randomBytes(4).copy(r, o) : (a2.push(i % 1e7), o += 4);
        o = n / 4;
      } else throw Error(Vs2);
      else for (; o < n; ) a2[o++] = Math.random() * 1e7 | 0;
      for (n = a2[--o], e %= E2, n && e && (i = U2(10, E2 - e), a2[o] = (n / i | 0) * i); a2[o] === 0; o--) a2.pop();
      if (o < 0) t = 0, a2 = [0];
      else {
        for (t = -1; a2[0] === 0; t -= E2) a2.shift();
        for (n = 1, i = a2[0]; i >= 10; i /= 10) n++;
        n < E2 && (t -= E2 - n);
      }
      return s.e = t, s.d = a2, s;
    }
    __name(ed, "ed");
    function rd(e) {
      return y(e = new this(e), e.e + 1, this.rounding);
    }
    __name(rd, "rd");
    function td(e) {
      return e = new this(e), e.d ? e.d[0] ? e.s : 0 * e.s : e.s || NaN;
    }
    __name(td, "td");
    function nd(e) {
      return new this(e).sin();
    }
    __name(nd, "nd");
    function id(e) {
      return new this(e).sinh();
    }
    __name(id, "id");
    function od(e) {
      return new this(e).sqrt();
    }
    __name(od, "od");
    function sd(e, r) {
      return new this(e).sub(r);
    }
    __name(sd, "sd");
    function ad() {
      var e = 0, r = arguments, t = new this(r[e]);
      for (w = false; t.s && ++e < r.length; ) t = t.plus(r[e]);
      return w = true, y(t, this.precision, this.rounding);
    }
    __name(ad, "ad");
    function ld(e) {
      return new this(e).tan();
    }
    __name(ld, "ld");
    function ud(e) {
      return new this(e).tanh();
    }
    __name(ud, "ud");
    function cd(e) {
      return y(e = new this(e), e.e + 1, 1);
    }
    __name(cd, "cd");
    m2[Symbol.for("nodejs.util.inspect.custom")] = m2.toString;
    m2[Symbol.toStringTag] = "Decimal";
    var Le = m2.constructor = Ks(Gi);
    hn = new Le(hn);
    yn = new Le(yn);
    var Fe2 = Le;
    function Sr2(e) {
      return Le.isDecimal(e) ? true : e !== null && typeof e == "object" && typeof e.s == "number" && typeof e.e == "number" && typeof e.toFixed == "function" && Array.isArray(e.d);
    }
    __name(Sr2, "Sr");
    var ct2 = {};
    tr2(ct2, { ModelAction: /* @__PURE__ */ __name(() => Rr, "ModelAction"), datamodelEnumToSchemaEnum: /* @__PURE__ */ __name(() => pd, "datamodelEnumToSchemaEnum") });
    function pd(e) {
      return { name: e.name, values: e.values.map((r) => r.name) };
    }
    __name(pd, "pd");
    var Rr = ((b2) => (b2.findUnique = "findUnique", b2.findUniqueOrThrow = "findUniqueOrThrow", b2.findFirst = "findFirst", b2.findFirstOrThrow = "findFirstOrThrow", b2.findMany = "findMany", b2.create = "create", b2.createMany = "createMany", b2.createManyAndReturn = "createManyAndReturn", b2.update = "update", b2.updateMany = "updateMany", b2.updateManyAndReturn = "updateManyAndReturn", b2.upsert = "upsert", b2.delete = "delete", b2.deleteMany = "deleteMany", b2.groupBy = "groupBy", b2.count = "count", b2.aggregate = "aggregate", b2.findRaw = "findRaw", b2.aggregateRaw = "aggregateRaw", b2))(Rr || {});
    var Xs = O2(Di());
    var Zs = O2(__require("node:fs"));
    var Hs = { keyword: De, entity: De, value: /* @__PURE__ */ __name((e) => W(nr(e)), "value"), punctuation: nr, directive: De, function: De, variable: /* @__PURE__ */ __name((e) => W(nr(e)), "variable"), string: /* @__PURE__ */ __name((e) => W(qe(e)), "string"), boolean: Ie2, number: De, comment: Hr };
    var dd = /* @__PURE__ */ __name((e) => e, "dd");
    var vn2 = {};
    var md = 0;
    var v2 = { manual: vn2.Prism && vn2.Prism.manual, disableWorkerMessageHandler: vn2.Prism && vn2.Prism.disableWorkerMessageHandler, util: { encode: /* @__PURE__ */ __name(function(e) {
      if (e instanceof ge2) {
        let r = e;
        return new ge2(r.type, v2.util.encode(r.content), r.alias);
      } else return Array.isArray(e) ? e.map(v2.util.encode) : e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
    }, "encode"), type: /* @__PURE__ */ __name(function(e) {
      return Object.prototype.toString.call(e).slice(8, -1);
    }, "type"), objId: /* @__PURE__ */ __name(function(e) {
      return e.__id || Object.defineProperty(e, "__id", { value: ++md }), e.__id;
    }, "objId"), clone: /* @__PURE__ */ __name(function e(r, t) {
      let n, i, o = v2.util.type(r);
      switch (t = t || {}, o) {
        case "Object":
          if (i = v2.util.objId(r), t[i]) return t[i];
          n = {}, t[i] = n;
          for (let s in r) r.hasOwnProperty(s) && (n[s] = e(r[s], t));
          return n;
        case "Array":
          return i = v2.util.objId(r), t[i] ? t[i] : (n = [], t[i] = n, r.forEach(function(s, a2) {
            n[a2] = e(s, t);
          }), n);
        default:
          return r;
      }
    }, "e") }, languages: { extend: /* @__PURE__ */ __name(function(e, r) {
      let t = v2.util.clone(v2.languages[e]);
      for (let n in r) t[n] = r[n];
      return t;
    }, "extend"), insertBefore: /* @__PURE__ */ __name(function(e, r, t, n) {
      n = n || v2.languages;
      let i = n[e], o = {};
      for (let a2 in i) if (i.hasOwnProperty(a2)) {
        if (a2 == r) for (let l in t) t.hasOwnProperty(l) && (o[l] = t[l]);
        t.hasOwnProperty(a2) || (o[a2] = i[a2]);
      }
      let s = n[e];
      return n[e] = o, v2.languages.DFS(v2.languages, function(a2, l) {
        l === s && a2 != e && (this[a2] = o);
      }), o;
    }, "insertBefore"), DFS: /* @__PURE__ */ __name(function e(r, t, n, i) {
      i = i || {};
      let o = v2.util.objId;
      for (let s in r) if (r.hasOwnProperty(s)) {
        t.call(r, s, r[s], n || s);
        let a2 = r[s], l = v2.util.type(a2);
        l === "Object" && !i[o(a2)] ? (i[o(a2)] = true, e(a2, t, null, i)) : l === "Array" && !i[o(a2)] && (i[o(a2)] = true, e(a2, t, s, i));
      }
    }, "e") }, plugins: {}, highlight: /* @__PURE__ */ __name(function(e, r, t) {
      let n = { code: e, grammar: r, language: t };
      return v2.hooks.run("before-tokenize", n), n.tokens = v2.tokenize(n.code, n.grammar), v2.hooks.run("after-tokenize", n), ge2.stringify(v2.util.encode(n.tokens), n.language);
    }, "highlight"), matchGrammar: /* @__PURE__ */ __name(function(e, r, t, n, i, o, s) {
      for (let g in t) {
        if (!t.hasOwnProperty(g) || !t[g]) continue;
        if (g == s) return;
        let I = t[g];
        I = v2.util.type(I) === "Array" ? I : [I];
        for (let T2 = 0; T2 < I.length; ++T2) {
          let S2 = I[T2], b2 = S2.inside, D = !!S2.lookbehind, me = !!S2.greedy, se = 0, Kr = S2.alias;
          if (me && !S2.pattern.global) {
            let j = S2.pattern.toString().match(/[imuy]*$/)[0];
            S2.pattern = RegExp(S2.pattern.source, j + "g");
          }
          S2 = S2.pattern || S2;
          for (let j = n, te = i; j < r.length; te += r[j].length, ++j) {
            let Ae = r[j];
            if (r.length > e.length) return;
            if (Ae instanceof ge2) continue;
            if (me && j != r.length - 1) {
              S2.lastIndex = te;
              var p2 = S2.exec(e);
              if (!p2) break;
              var c = p2.index + (D ? p2[1].length : 0), d2 = p2.index + p2[0].length, a2 = j, l = te;
              for (let k = r.length; a2 < k && (l < d2 || !r[a2].type && !r[a2 - 1].greedy); ++a2) l += r[a2].length, c >= l && (++j, te = l);
              if (r[j] instanceof ge2) continue;
              u = a2 - j, Ae = e.slice(te, l), p2.index -= te;
            } else {
              S2.lastIndex = 0;
              var p2 = S2.exec(Ae), u = 1;
            }
            if (!p2) {
              if (o) break;
              continue;
            }
            D && (se = p2[1] ? p2[1].length : 0);
            var c = p2.index + se, p2 = p2[0].slice(se), d2 = c + p2.length, f = Ae.slice(0, c), h = Ae.slice(d2);
            let K = [j, u];
            f && (++j, te += f.length, K.push(f));
            let fr2 = new ge2(g, b2 ? v2.tokenize(p2, b2) : p2, Kr, p2, me);
            if (K.push(fr2), h && K.push(h), Array.prototype.splice.apply(r, K), u != 1 && v2.matchGrammar(e, r, t, j, te, true, g), o) break;
          }
        }
      }
    }, "matchGrammar"), tokenize: /* @__PURE__ */ __name(function(e, r) {
      let t = [e], n = r.rest;
      if (n) {
        for (let i in n) r[i] = n[i];
        delete r.rest;
      }
      return v2.matchGrammar(e, t, r, 0, 0, false), t;
    }, "tokenize"), hooks: { all: {}, add: /* @__PURE__ */ __name(function(e, r) {
      let t = v2.hooks.all;
      t[e] = t[e] || [], t[e].push(r);
    }, "add"), run: /* @__PURE__ */ __name(function(e, r) {
      let t = v2.hooks.all[e];
      if (!(!t || !t.length)) for (var n = 0, i; i = t[n++]; ) i(r);
    }, "run") }, Token: ge2 };
    v2.languages.clike = { comment: [{ pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/, lookbehind: true }, { pattern: /(^|[^\\:])\/\/.*/, lookbehind: true, greedy: true }], string: { pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: true }, "class-name": { pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i, lookbehind: true, inside: { punctuation: /[.\\]/ } }, keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/, boolean: /\b(?:true|false)\b/, function: /\w+(?=\()/, number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i, operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/, punctuation: /[{}[\];(),.:]/ };
    v2.languages.javascript = v2.languages.extend("clike", { "class-name": [v2.languages.clike["class-name"], { pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/, lookbehind: true }], keyword: [{ pattern: /((?:^|})\s*)(?:catch|finally)\b/, lookbehind: true }, { pattern: /(^|[^.])\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/, lookbehind: true }], number: /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/, function: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/, operator: /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/ });
    v2.languages.javascript["class-name"][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;
    v2.languages.insertBefore("javascript", "keyword", { regex: { pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=\s*($|[\r\n,.;})\]]))/, lookbehind: true, greedy: true }, "function-variable": { pattern: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/, alias: "function" }, parameter: [{ pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/, lookbehind: true, inside: v2.languages.javascript }, { pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i, inside: v2.languages.javascript }, { pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/, lookbehind: true, inside: v2.languages.javascript }, { pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/, lookbehind: true, inside: v2.languages.javascript }], constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/ });
    v2.languages.markup && v2.languages.markup.tag.addInlined("script", "javascript");
    v2.languages.js = v2.languages.javascript;
    v2.languages.typescript = v2.languages.extend("javascript", { keyword: /\b(?:abstract|as|async|await|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|is|keyof|let|module|namespace|new|null|of|package|private|protected|public|readonly|return|require|set|static|super|switch|this|throw|try|type|typeof|var|void|while|with|yield)\b/, builtin: /\b(?:string|Function|any|number|boolean|Array|symbol|console|Promise|unknown|never)\b/ });
    v2.languages.ts = v2.languages.typescript;
    function ge2(e, r, t, n, i) {
      this.type = e, this.content = r, this.alias = t, this.length = (n || "").length | 0, this.greedy = !!i;
    }
    __name(ge2, "ge");
    ge2.stringify = function(e, r) {
      return typeof e == "string" ? e : Array.isArray(e) ? e.map(function(t) {
        return ge2.stringify(t, r);
      }).join("") : fd(e.type)(e.content);
    };
    function fd(e) {
      return Hs[e] || dd;
    }
    __name(fd, "fd");
    function Ys(e) {
      return gd(e, v2.languages.javascript);
    }
    __name(Ys, "Ys");
    function gd(e, r) {
      return v2.tokenize(e, r).map((n) => ge2.stringify(n)).join("");
    }
    __name(gd, "gd");
    function zs2(e) {
      return Ci(e);
    }
    __name(zs2, "zs");
    var Pn = class e {
      static {
        __name(this, "e");
      }
      firstLineNumber;
      lines;
      static read(r) {
        let t;
        try {
          t = Zs.default.readFileSync(r, "utf-8");
        } catch {
          return null;
        }
        return e.fromContent(t);
      }
      static fromContent(r) {
        let t = r.split(/\r?\n/);
        return new e(1, t);
      }
      constructor(r, t) {
        this.firstLineNumber = r, this.lines = t;
      }
      get lastLineNumber() {
        return this.firstLineNumber + this.lines.length - 1;
      }
      mapLineAt(r, t) {
        if (r < this.firstLineNumber || r > this.lines.length + this.firstLineNumber) return this;
        let n = r - this.firstLineNumber, i = [...this.lines];
        return i[n] = t(i[n]), new e(this.firstLineNumber, i);
      }
      mapLines(r) {
        return new e(this.firstLineNumber, this.lines.map((t, n) => r(t, this.firstLineNumber + n)));
      }
      lineAt(r) {
        return this.lines[r - this.firstLineNumber];
      }
      prependSymbolAt(r, t) {
        return this.mapLines((n, i) => i === r ? `${t} ${n}` : `  ${n}`);
      }
      slice(r, t) {
        let n = this.lines.slice(r - 1, t).join(`
`);
        return new e(r, zs2(n).split(`
`));
      }
      highlight() {
        let r = Ys(this.toString());
        return new e(this.firstLineNumber, r.split(`
`));
      }
      toString() {
        return this.lines.join(`
`);
      }
    };
    var hd = { red: ce2, gray: Hr, dim: Ce2, bold: W, underline: Y, highlightSource: /* @__PURE__ */ __name((e) => e.highlight(), "highlightSource") };
    var yd = { red: /* @__PURE__ */ __name((e) => e, "red"), gray: /* @__PURE__ */ __name((e) => e, "gray"), dim: /* @__PURE__ */ __name((e) => e, "dim"), bold: /* @__PURE__ */ __name((e) => e, "bold"), underline: /* @__PURE__ */ __name((e) => e, "underline"), highlightSource: /* @__PURE__ */ __name((e) => e, "highlightSource") };
    function bd({ message: e, originalMethod: r, isPanic: t, callArguments: n }) {
      return { functionName: `prisma.${r}()`, message: e, isPanic: t ?? false, callArguments: n };
    }
    __name(bd, "bd");
    function Ed({ callsite: e, message: r, originalMethod: t, isPanic: n, callArguments: i }, o) {
      let s = bd({ message: r, originalMethod: t, isPanic: n, callArguments: i });
      if (!e || typeof window < "u" || process.env.NODE_ENV === "production") return s;
      let a2 = e.getLocation();
      if (!a2 || !a2.lineNumber || !a2.columnNumber) return s;
      let l = Math.max(1, a2.lineNumber - 3), u = Pn.read(a2.fileName)?.slice(l, a2.lineNumber), c = u?.lineAt(a2.lineNumber);
      if (u && c) {
        let p2 = xd(c), d2 = wd(c);
        if (!d2) return s;
        s.functionName = `${d2.code})`, s.location = a2, n || (u = u.mapLineAt(a2.lineNumber, (h) => h.slice(0, d2.openingBraceIndex))), u = o.highlightSource(u);
        let f = String(u.lastLineNumber).length;
        if (s.contextLines = u.mapLines((h, g) => o.gray(String(g).padStart(f)) + " " + h).mapLines((h) => o.dim(h)).prependSymbolAt(a2.lineNumber, o.bold(o.red("→"))), i) {
          let h = p2 + f + 1;
          h += 2, s.callArguments = (0, Xs.default)(i, h).slice(h);
        }
      }
      return s;
    }
    __name(Ed, "Ed");
    function wd(e) {
      let r = Object.keys(Rr).join("|"), n = new RegExp(String.raw`\.(${r})\(`).exec(e);
      if (n) {
        let i = n.index + n[0].length, o = e.lastIndexOf(" ", n.index) + 1;
        return { code: e.slice(o, i), openingBraceIndex: i };
      }
      return null;
    }
    __name(wd, "wd");
    function xd(e) {
      let r = 0;
      for (let t = 0; t < e.length; t++) {
        if (e.charAt(t) !== " ") return r;
        r++;
      }
      return r;
    }
    __name(xd, "xd");
    function vd({ functionName: e, location: r, message: t, isPanic: n, contextLines: i, callArguments: o }, s) {
      let a2 = [""], l = r ? " in" : ":";
      if (n ? (a2.push(s.red(`Oops, an unknown error occurred! This is ${s.bold("on us")}, you did nothing wrong.`)), a2.push(s.red(`It occurred in the ${s.bold(`\`${e}\``)} invocation${l}`))) : a2.push(s.red(`Invalid ${s.bold(`\`${e}\``)} invocation${l}`)), r && a2.push(s.underline(Pd(r))), i) {
        a2.push("");
        let u = [i.toString()];
        o && (u.push(o), u.push(s.dim(")"))), a2.push(u.join("")), o && a2.push("");
      } else a2.push(""), o && a2.push(o), a2.push("");
      return a2.push(t), a2.join(`
`);
    }
    __name(vd, "vd");
    function Pd(e) {
      let r = [e.fileName];
      return e.lineNumber && r.push(String(e.lineNumber)), e.columnNumber && r.push(String(e.columnNumber)), r.join(":");
    }
    __name(Pd, "Pd");
    function Tn(e) {
      let r = e.showColors ? hd : yd, t;
      return t = Ed(e, r), vd(t, r);
    }
    __name(Tn, "Tn");
    var la = O2(Ki2());
    function na(e, r, t) {
      let n = ia(e), i = Td(n), o = Rd(i);
      o ? Sn(o, r, t) : r.addErrorMessage(() => "Unknown error");
    }
    __name(na, "na");
    function ia(e) {
      return e.errors.flatMap((r) => r.kind === "Union" ? ia(r) : [r]);
    }
    __name(ia, "ia");
    function Td(e) {
      let r = /* @__PURE__ */ new Map(), t = [];
      for (let n of e) {
        if (n.kind !== "InvalidArgumentType") {
          t.push(n);
          continue;
        }
        let i = `${n.selectionPath.join(".")}:${n.argumentPath.join(".")}`, o = r.get(i);
        o ? r.set(i, { ...n, argument: { ...n.argument, typeNames: Sd(o.argument.typeNames, n.argument.typeNames) } }) : r.set(i, n);
      }
      return t.push(...r.values()), t;
    }
    __name(Td, "Td");
    function Sd(e, r) {
      return [...new Set(e.concat(r))];
    }
    __name(Sd, "Sd");
    function Rd(e) {
      return ji(e, (r, t) => {
        let n = ra(r), i = ra(t);
        return n !== i ? n - i : ta(r) - ta(t);
      });
    }
    __name(Rd, "Rd");
    function ra(e) {
      let r = 0;
      return Array.isArray(e.selectionPath) && (r += e.selectionPath.length), Array.isArray(e.argumentPath) && (r += e.argumentPath.length), r;
    }
    __name(ra, "ra");
    function ta(e) {
      switch (e.kind) {
        case "InvalidArgumentValue":
        case "ValueTooLarge":
          return 20;
        case "InvalidArgumentType":
          return 10;
        case "RequiredArgumentMissing":
          return -10;
        default:
          return 0;
      }
    }
    __name(ta, "ta");
    var le = class {
      static {
        __name(this, "le");
      }
      constructor(r, t) {
        this.name = r;
        this.value = t;
      }
      isRequired = false;
      makeRequired() {
        return this.isRequired = true, this;
      }
      write(r) {
        let { colors: { green: t } } = r.context;
        r.addMarginSymbol(t(this.isRequired ? "+" : "?")), r.write(t(this.name)), this.isRequired || r.write(t("?")), r.write(t(": ")), typeof this.value == "string" ? r.write(t(this.value)) : r.write(this.value);
      }
    };
    sa();
    var Ar = class {
      static {
        __name(this, "Ar");
      }
      constructor(r = 0, t) {
        this.context = t;
        this.currentIndent = r;
      }
      lines = [];
      currentLine = "";
      currentIndent = 0;
      marginSymbol;
      afterNextNewLineCallback;
      write(r) {
        return typeof r == "string" ? this.currentLine += r : r.write(this), this;
      }
      writeJoined(r, t, n = (i, o) => o.write(i)) {
        let i = t.length - 1;
        for (let o = 0; o < t.length; o++) n(t[o], this), o !== i && this.write(r);
        return this;
      }
      writeLine(r) {
        return this.write(r).newLine();
      }
      newLine() {
        this.lines.push(this.indentedCurrentLine()), this.currentLine = "", this.marginSymbol = void 0;
        let r = this.afterNextNewLineCallback;
        return this.afterNextNewLineCallback = void 0, r?.(), this;
      }
      withIndent(r) {
        return this.indent(), r(this), this.unindent(), this;
      }
      afterNextNewline(r) {
        return this.afterNextNewLineCallback = r, this;
      }
      indent() {
        return this.currentIndent++, this;
      }
      unindent() {
        return this.currentIndent > 0 && this.currentIndent--, this;
      }
      addMarginSymbol(r) {
        return this.marginSymbol = r, this;
      }
      toString() {
        return this.lines.concat(this.indentedCurrentLine()).join(`
`);
      }
      getCurrentLineLength() {
        return this.currentLine.length;
      }
      indentedCurrentLine() {
        let r = this.currentLine.padStart(this.currentLine.length + 2 * this.currentIndent);
        return this.marginSymbol ? this.marginSymbol + r.slice(1) : r;
      }
    };
    oa();
    var Rn = class {
      static {
        __name(this, "Rn");
      }
      constructor(r) {
        this.value = r;
      }
      write(r) {
        r.write(this.value);
      }
      markAsError() {
        this.value.markAsError();
      }
    };
    var An = /* @__PURE__ */ __name((e) => e, "An");
    var Cn = { bold: An, red: An, green: An, dim: An, enabled: false };
    var aa = { bold: W, red: ce2, green: qe, dim: Ce2, enabled: true };
    var Cr = { write(e) {
      e.writeLine(",");
    } };
    var Pe = class {
      static {
        __name(this, "Pe");
      }
      constructor(r) {
        this.contents = r;
      }
      isUnderlined = false;
      color = /* @__PURE__ */ __name((r) => r, "color");
      underline() {
        return this.isUnderlined = true, this;
      }
      setColor(r) {
        return this.color = r, this;
      }
      write(r) {
        let t = r.getCurrentLineLength();
        r.write(this.color(this.contents)), this.isUnderlined && r.afterNextNewline(() => {
          r.write(" ".repeat(t)).writeLine(this.color("~".repeat(this.contents.length)));
        });
      }
    };
    var ze = class {
      static {
        __name(this, "ze");
      }
      hasError = false;
      markAsError() {
        return this.hasError = true, this;
      }
    };
    var Ir = class extends ze {
      static {
        __name(this, "Ir");
      }
      items = [];
      addItem(r) {
        return this.items.push(new Rn(r)), this;
      }
      getField(r) {
        return this.items[r];
      }
      getPrintWidth() {
        return this.items.length === 0 ? 2 : Math.max(...this.items.map((t) => t.value.getPrintWidth())) + 2;
      }
      write(r) {
        if (this.items.length === 0) {
          this.writeEmpty(r);
          return;
        }
        this.writeWithItems(r);
      }
      writeEmpty(r) {
        let t = new Pe("[]");
        this.hasError && t.setColor(r.context.colors.red).underline(), r.write(t);
      }
      writeWithItems(r) {
        let { colors: t } = r.context;
        r.writeLine("[").withIndent(() => r.writeJoined(Cr, this.items).newLine()).write("]"), this.hasError && r.afterNextNewline(() => {
          r.writeLine(t.red("~".repeat(this.getPrintWidth())));
        });
      }
      asObject() {
      }
    };
    var Dr = class e extends ze {
      static {
        __name(this, "e");
      }
      fields = {};
      suggestions = [];
      addField(r) {
        this.fields[r.name] = r;
      }
      addSuggestion(r) {
        this.suggestions.push(r);
      }
      getField(r) {
        return this.fields[r];
      }
      getDeepField(r) {
        let [t, ...n] = r, i = this.getField(t);
        if (!i) return;
        let o = i;
        for (let s of n) {
          let a2;
          if (o.value instanceof e ? a2 = o.value.getField(s) : o.value instanceof Ir && (a2 = o.value.getField(Number(s))), !a2) return;
          o = a2;
        }
        return o;
      }
      getDeepFieldValue(r) {
        return r.length === 0 ? this : this.getDeepField(r)?.value;
      }
      hasField(r) {
        return !!this.getField(r);
      }
      removeAllFields() {
        this.fields = {};
      }
      removeField(r) {
        delete this.fields[r];
      }
      getFields() {
        return this.fields;
      }
      isEmpty() {
        return Object.keys(this.fields).length === 0;
      }
      getFieldValue(r) {
        return this.getField(r)?.value;
      }
      getDeepSubSelectionValue(r) {
        let t = this;
        for (let n of r) {
          if (!(t instanceof e)) return;
          let i = t.getSubSelectionValue(n);
          if (!i) return;
          t = i;
        }
        return t;
      }
      getDeepSelectionParent(r) {
        let t = this.getSelectionParent();
        if (!t) return;
        let n = t;
        for (let i of r) {
          let o = n.value.getFieldValue(i);
          if (!o || !(o instanceof e)) return;
          let s = o.getSelectionParent();
          if (!s) return;
          n = s;
        }
        return n;
      }
      getSelectionParent() {
        let r = this.getField("select")?.value.asObject();
        if (r) return { kind: "select", value: r };
        let t = this.getField("include")?.value.asObject();
        if (t) return { kind: "include", value: t };
      }
      getSubSelectionValue(r) {
        return this.getSelectionParent()?.value.fields[r].value;
      }
      getPrintWidth() {
        let r = Object.values(this.fields);
        return r.length == 0 ? 2 : Math.max(...r.map((n) => n.getPrintWidth())) + 2;
      }
      write(r) {
        let t = Object.values(this.fields);
        if (t.length === 0 && this.suggestions.length === 0) {
          this.writeEmpty(r);
          return;
        }
        this.writeWithContents(r, t);
      }
      asObject() {
        return this;
      }
      writeEmpty(r) {
        let t = new Pe("{}");
        this.hasError && t.setColor(r.context.colors.red).underline(), r.write(t);
      }
      writeWithContents(r, t) {
        r.writeLine("{").withIndent(() => {
          r.writeJoined(Cr, [...t, ...this.suggestions]).newLine();
        }), r.write("}"), this.hasError && r.afterNextNewline(() => {
          r.writeLine(r.context.colors.red("~".repeat(this.getPrintWidth())));
        });
      }
    };
    var Q = class extends ze {
      static {
        __name(this, "Q");
      }
      constructor(t) {
        super();
        this.text = t;
      }
      getPrintWidth() {
        return this.text.length;
      }
      write(t) {
        let n = new Pe(this.text);
        this.hasError && n.underline().setColor(t.context.colors.red), t.write(n);
      }
      asObject() {
      }
    };
    var pt = class {
      static {
        __name(this, "pt");
      }
      fields = [];
      addField(r, t) {
        return this.fields.push({ write(n) {
          let { green: i, dim: o } = n.context.colors;
          n.write(i(o(`${r}: ${t}`))).addMarginSymbol(i(o("+")));
        } }), this;
      }
      write(r) {
        let { colors: { green: t } } = r.context;
        r.writeLine(t("{")).withIndent(() => {
          r.writeJoined(Cr, this.fields).newLine();
        }).write(t("}")).addMarginSymbol(t("+"));
      }
    };
    function Sn(e, r, t) {
      switch (e.kind) {
        case "MutuallyExclusiveFields":
          Ad(e, r);
          break;
        case "IncludeOnScalar":
          Cd(e, r);
          break;
        case "EmptySelection":
          Id(e, r, t);
          break;
        case "UnknownSelectionField":
          _d(e, r);
          break;
        case "InvalidSelectionValue":
          Nd(e, r);
          break;
        case "UnknownArgument":
          Ld(e, r);
          break;
        case "UnknownInputField":
          Fd(e, r);
          break;
        case "RequiredArgumentMissing":
          Md(e, r);
          break;
        case "InvalidArgumentType":
          $d(e, r);
          break;
        case "InvalidArgumentValue":
          qd(e, r);
          break;
        case "ValueTooLarge":
          Vd(e, r);
          break;
        case "SomeFieldsMissing":
          jd(e, r);
          break;
        case "TooManyFieldsGiven":
          Bd(e, r);
          break;
        case "Union":
          na(e, r, t);
          break;
        default:
          throw new Error("not implemented: " + e.kind);
      }
    }
    __name(Sn, "Sn");
    function Ad(e, r) {
      let t = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      t && (t.getField(e.firstField)?.markAsError(), t.getField(e.secondField)?.markAsError()), r.addErrorMessage((n) => `Please ${n.bold("either")} use ${n.green(`\`${e.firstField}\``)} or ${n.green(`\`${e.secondField}\``)}, but ${n.red("not both")} at the same time.`);
    }
    __name(Ad, "Ad");
    function Cd(e, r) {
      let [t, n] = Or(e.selectionPath), i = e.outputType, o = r.arguments.getDeepSelectionParent(t)?.value;
      if (o && (o.getField(n)?.markAsError(), i)) for (let s of i.fields) s.isRelation && o.addSuggestion(new le(s.name, "true"));
      r.addErrorMessage((s) => {
        let a2 = `Invalid scalar field ${s.red(`\`${n}\``)} for ${s.bold("include")} statement`;
        return i ? a2 += ` on model ${s.bold(i.name)}. ${dt(s)}` : a2 += ".", a2 += `
Note that ${s.bold("include")} statements only accept relation fields.`, a2;
      });
    }
    __name(Cd, "Cd");
    function Id(e, r, t) {
      let n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (n) {
        let i = n.getField("omit")?.value.asObject();
        if (i) {
          Dd(e, r, i);
          return;
        }
        if (n.hasField("select")) {
          Od(e, r);
          return;
        }
      }
      if (t?.[We(e.outputType.name)]) {
        kd(e, r);
        return;
      }
      r.addErrorMessage(() => `Unknown field at "${e.selectionPath.join(".")} selection"`);
    }
    __name(Id, "Id");
    function Dd(e, r, t) {
      t.removeAllFields();
      for (let n of e.outputType.fields) t.addSuggestion(new le(n.name, "false"));
      r.addErrorMessage((n) => `The ${n.red("omit")} statement includes every field of the model ${n.bold(e.outputType.name)}. At least one field must be included in the result`);
    }
    __name(Dd, "Dd");
    function Od(e, r) {
      let t = e.outputType, n = r.arguments.getDeepSelectionParent(e.selectionPath)?.value, i = n?.isEmpty() ?? false;
      n && (n.removeAllFields(), pa2(n, t)), r.addErrorMessage((o) => i ? `The ${o.red("`select`")} statement for type ${o.bold(t.name)} must not be empty. ${dt(o)}` : `The ${o.red("`select`")} statement for type ${o.bold(t.name)} needs ${o.bold("at least one truthy value")}.`);
    }
    __name(Od, "Od");
    function kd(e, r) {
      let t = new pt();
      for (let i of e.outputType.fields) i.isRelation || t.addField(i.name, "false");
      let n = new le("omit", t).makeRequired();
      if (e.selectionPath.length === 0) r.arguments.addSuggestion(n);
      else {
        let [i, o] = Or(e.selectionPath), a2 = r.arguments.getDeepSelectionParent(i)?.value.asObject()?.getField(o);
        if (a2) {
          let l = a2?.value.asObject() ?? new Dr();
          l.addSuggestion(n), a2.value = l;
        }
      }
      r.addErrorMessage((i) => `The global ${i.red("omit")} configuration excludes every field of the model ${i.bold(e.outputType.name)}. At least one field must be included in the result`);
    }
    __name(kd, "kd");
    function _d(e, r) {
      let t = da2(e.selectionPath, r);
      if (t.parentKind !== "unknown") {
        t.field.markAsError();
        let n = t.parent;
        switch (t.parentKind) {
          case "select":
            pa2(n, e.outputType);
            break;
          case "include":
            Ud(n, e.outputType);
            break;
          case "omit":
            Gd(n, e.outputType);
            break;
        }
      }
      r.addErrorMessage((n) => {
        let i = [`Unknown field ${n.red(`\`${t.fieldName}\``)}`];
        return t.parentKind !== "unknown" && i.push(`for ${n.bold(t.parentKind)} statement`), i.push(`on model ${n.bold(`\`${e.outputType.name}\``)}.`), i.push(dt(n)), i.join(" ");
      });
    }
    __name(_d, "_d");
    function Nd(e, r) {
      let t = da2(e.selectionPath, r);
      t.parentKind !== "unknown" && t.field.value.markAsError(), r.addErrorMessage((n) => `Invalid value for selection field \`${n.red(t.fieldName)}\`: ${e.underlyingError}`);
    }
    __name(Nd, "Nd");
    function Ld(e, r) {
      let t = e.argumentPath[0], n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      n && (n.getField(t)?.markAsError(), Qd(n, e.arguments)), r.addErrorMessage((i) => ua(i, t, e.arguments.map((o) => o.name)));
    }
    __name(Ld, "Ld");
    function Fd(e, r) {
      let [t, n] = Or(e.argumentPath), i = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (i) {
        i.getDeepField(e.argumentPath)?.markAsError();
        let o = i.getDeepFieldValue(t)?.asObject();
        o && ma2(o, e.inputType);
      }
      r.addErrorMessage((o) => ua(o, n, e.inputType.fields.map((s) => s.name)));
    }
    __name(Fd, "Fd");
    function ua(e, r, t) {
      let n = [`Unknown argument \`${e.red(r)}\`.`], i = Jd(r, t);
      return i && n.push(`Did you mean \`${e.green(i)}\`?`), t.length > 0 && n.push(dt(e)), n.join(" ");
    }
    __name(ua, "ua");
    function Md(e, r) {
      let t;
      r.addErrorMessage((l) => t?.value instanceof Q && t.value.text === "null" ? `Argument \`${l.green(o)}\` must not be ${l.red("null")}.` : `Argument \`${l.green(o)}\` is missing.`);
      let n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (!n) return;
      let [i, o] = Or(e.argumentPath), s = new pt(), a2 = n.getDeepFieldValue(i)?.asObject();
      if (a2) {
        if (t = a2.getField(o), t && a2.removeField(o), e.inputTypes.length === 1 && e.inputTypes[0].kind === "object") {
          for (let l of e.inputTypes[0].fields) s.addField(l.name, l.typeNames.join(" | "));
          a2.addSuggestion(new le(o, s).makeRequired());
        } else {
          let l = e.inputTypes.map(ca).join(" | ");
          a2.addSuggestion(new le(o, l).makeRequired());
        }
        if (e.dependentArgumentPath) {
          n.getDeepField(e.dependentArgumentPath)?.markAsError();
          let [, l] = Or(e.dependentArgumentPath);
          r.addErrorMessage((u) => `Argument \`${u.green(o)}\` is required because argument \`${u.green(l)}\` was provided.`);
        }
      }
    }
    __name(Md, "Md");
    function ca(e) {
      return e.kind === "list" ? `${ca(e.elementType)}[]` : e.name;
    }
    __name(ca, "ca");
    function $d(e, r) {
      let t = e.argument.name, n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      n && n.getDeepFieldValue(e.argumentPath)?.markAsError(), r.addErrorMessage((i) => {
        let o = In("or", e.argument.typeNames.map((s) => i.green(s)));
        return `Argument \`${i.bold(t)}\`: Invalid value provided. Expected ${o}, provided ${i.red(e.inferredType)}.`;
      });
    }
    __name($d, "$d");
    function qd(e, r) {
      let t = e.argument.name, n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      n && n.getDeepFieldValue(e.argumentPath)?.markAsError(), r.addErrorMessage((i) => {
        let o = [`Invalid value for argument \`${i.bold(t)}\``];
        if (e.underlyingError && o.push(`: ${e.underlyingError}`), o.push("."), e.argument.typeNames.length > 0) {
          let s = In("or", e.argument.typeNames.map((a2) => i.green(a2)));
          o.push(` Expected ${s}.`);
        }
        return o.join("");
      });
    }
    __name(qd, "qd");
    function Vd(e, r) {
      let t = e.argument.name, n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(), i;
      if (n) {
        let s = n.getDeepField(e.argumentPath)?.value;
        s?.markAsError(), s instanceof Q && (i = s.text);
      }
      r.addErrorMessage((o) => {
        let s = ["Unable to fit value"];
        return i && s.push(o.red(i)), s.push(`into a 64-bit signed integer for field \`${o.bold(t)}\``), s.join(" ");
      });
    }
    __name(Vd, "Vd");
    function jd(e, r) {
      let t = e.argumentPath[e.argumentPath.length - 1], n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (n) {
        let i = n.getDeepFieldValue(e.argumentPath)?.asObject();
        i && ma2(i, e.inputType);
      }
      r.addErrorMessage((i) => {
        let o = [`Argument \`${i.bold(t)}\` of type ${i.bold(e.inputType.name)} needs`];
        return e.constraints.minFieldCount === 1 ? e.constraints.requiredFields ? o.push(`${i.green("at least one of")} ${In("or", e.constraints.requiredFields.map((s) => `\`${i.bold(s)}\``))} arguments.`) : o.push(`${i.green("at least one")} argument.`) : o.push(`${i.green(`at least ${e.constraints.minFieldCount}`)} arguments.`), o.push(dt(i)), o.join(" ");
      });
    }
    __name(jd, "jd");
    function Bd(e, r) {
      let t = e.argumentPath[e.argumentPath.length - 1], n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(), i = [];
      if (n) {
        let o = n.getDeepFieldValue(e.argumentPath)?.asObject();
        o && (o.markAsError(), i = Object.keys(o.getFields()));
      }
      r.addErrorMessage((o) => {
        let s = [`Argument \`${o.bold(t)}\` of type ${o.bold(e.inputType.name)} needs`];
        return e.constraints.minFieldCount === 1 && e.constraints.maxFieldCount == 1 ? s.push(`${o.green("exactly one")} argument,`) : e.constraints.maxFieldCount == 1 ? s.push(`${o.green("at most one")} argument,`) : s.push(`${o.green(`at most ${e.constraints.maxFieldCount}`)} arguments,`), s.push(`but you provided ${In("and", i.map((a2) => o.red(a2)))}. Please choose`), e.constraints.maxFieldCount === 1 ? s.push("one.") : s.push(`${e.constraints.maxFieldCount}.`), s.join(" ");
      });
    }
    __name(Bd, "Bd");
    function pa2(e, r) {
      for (let t of r.fields) e.hasField(t.name) || e.addSuggestion(new le(t.name, "true"));
    }
    __name(pa2, "pa");
    function Ud(e, r) {
      for (let t of r.fields) t.isRelation && !e.hasField(t.name) && e.addSuggestion(new le(t.name, "true"));
    }
    __name(Ud, "Ud");
    function Gd(e, r) {
      for (let t of r.fields) !e.hasField(t.name) && !t.isRelation && e.addSuggestion(new le(t.name, "true"));
    }
    __name(Gd, "Gd");
    function Qd(e, r) {
      for (let t of r) e.hasField(t.name) || e.addSuggestion(new le(t.name, t.typeNames.join(" | ")));
    }
    __name(Qd, "Qd");
    function da2(e, r) {
      let [t, n] = Or(e), i = r.arguments.getDeepSubSelectionValue(t)?.asObject();
      if (!i) return { parentKind: "unknown", fieldName: n };
      let o = i.getFieldValue("select")?.asObject(), s = i.getFieldValue("include")?.asObject(), a2 = i.getFieldValue("omit")?.asObject(), l = o?.getField(n);
      return o && l ? { parentKind: "select", parent: o, field: l, fieldName: n } : (l = s?.getField(n), s && l ? { parentKind: "include", field: l, parent: s, fieldName: n } : (l = a2?.getField(n), a2 && l ? { parentKind: "omit", field: l, parent: a2, fieldName: n } : { parentKind: "unknown", fieldName: n }));
    }
    __name(da2, "da");
    function ma2(e, r) {
      if (r.kind === "object") for (let t of r.fields) e.hasField(t.name) || e.addSuggestion(new le(t.name, t.typeNames.join(" | ")));
    }
    __name(ma2, "ma");
    function Or(e) {
      let r = [...e], t = r.pop();
      if (!t) throw new Error("unexpected empty path");
      return [r, t];
    }
    __name(Or, "Or");
    function dt({ green: e, enabled: r }) {
      return "Available options are " + (r ? `listed in ${e("green")}` : "marked with ?") + ".";
    }
    __name(dt, "dt");
    function In(e, r) {
      if (r.length === 1) return r[0];
      let t = [...r], n = t.pop();
      return `${t.join(", ")} ${e} ${n}`;
    }
    __name(In, "In");
    var Wd = 3;
    function Jd(e, r) {
      let t = 1 / 0, n;
      for (let i of r) {
        let o = (0, la.default)(e, i);
        o > Wd || o < t && (t = o, n = i);
      }
      return n;
    }
    __name(Jd, "Jd");
    var mt2 = class {
      static {
        __name(this, "mt");
      }
      modelName;
      name;
      typeName;
      isList;
      isEnum;
      constructor(r, t, n, i, o) {
        this.modelName = r, this.name = t, this.typeName = n, this.isList = i, this.isEnum = o;
      }
      _toGraphQLInputType() {
        let r = this.isList ? "List" : "", t = this.isEnum ? "Enum" : "";
        return `${r}${t}${this.typeName}FieldRefInput<${this.modelName}>`;
      }
    };
    function kr(e) {
      return e instanceof mt2;
    }
    __name(kr, "kr");
    var Dn2 = Symbol();
    var Yi = /* @__PURE__ */ new WeakMap();
    var Me = class {
      static {
        __name(this, "Me");
      }
      constructor(r) {
        r === Dn2 ? Yi.set(this, `Prisma.${this._getName()}`) : Yi.set(this, `new Prisma.${this._getNamespace()}.${this._getName()}()`);
      }
      _getName() {
        return this.constructor.name;
      }
      toString() {
        return Yi.get(this);
      }
    };
    var ft = class extends Me {
      static {
        __name(this, "ft");
      }
      _getNamespace() {
        return "NullTypes";
      }
    };
    var gt3 = class extends ft {
      static {
        __name(this, "gt");
      }
      #e;
    };
    zi(gt3, "DbNull");
    var ht = class extends ft {
      static {
        __name(this, "ht");
      }
      #e;
    };
    zi(ht, "JsonNull");
    var yt2 = class extends ft {
      static {
        __name(this, "yt");
      }
      #e;
    };
    zi(yt2, "AnyNull");
    var On = { classes: { DbNull: gt3, JsonNull: ht, AnyNull: yt2 }, instances: { DbNull: new gt3(Dn2), JsonNull: new ht(Dn2), AnyNull: new yt2(Dn2) } };
    function zi(e, r) {
      Object.defineProperty(e, "name", { value: r, configurable: true });
    }
    __name(zi, "zi");
    var fa = ": ";
    var kn3 = class {
      static {
        __name(this, "kn");
      }
      constructor(r, t) {
        this.name = r;
        this.value = t;
      }
      hasError = false;
      markAsError() {
        this.hasError = true;
      }
      getPrintWidth() {
        return this.name.length + this.value.getPrintWidth() + fa.length;
      }
      write(r) {
        let t = new Pe(this.name);
        this.hasError && t.underline().setColor(r.context.colors.red), r.write(t).write(fa).write(this.value);
      }
    };
    var Zi2 = class {
      static {
        __name(this, "Zi");
      }
      arguments;
      errorMessages = [];
      constructor(r) {
        this.arguments = r;
      }
      write(r) {
        r.write(this.arguments);
      }
      addErrorMessage(r) {
        this.errorMessages.push(r);
      }
      renderAllMessages(r) {
        return this.errorMessages.map((t) => t(r)).join(`
`);
      }
    };
    function _r(e) {
      return new Zi2(ga2(e));
    }
    __name(_r, "_r");
    function ga2(e) {
      let r = new Dr();
      for (let [t, n] of Object.entries(e)) {
        let i = new kn3(t, ha2(n));
        r.addField(i);
      }
      return r;
    }
    __name(ga2, "ga");
    function ha2(e) {
      if (typeof e == "string") return new Q(JSON.stringify(e));
      if (typeof e == "number" || typeof e == "boolean") return new Q(String(e));
      if (typeof e == "bigint") return new Q(`${e}n`);
      if (e === null) return new Q("null");
      if (e === void 0) return new Q("undefined");
      if (Sr2(e)) return new Q(`new Prisma.Decimal("${e.toFixed()}")`);
      if (e instanceof Uint8Array) return Buffer.isBuffer(e) ? new Q(`Buffer.alloc(${e.byteLength})`) : new Q(`new Uint8Array(${e.byteLength})`);
      if (e instanceof Date) {
        let r = mn(e) ? e.toISOString() : "Invalid Date";
        return new Q(`new Date("${r}")`);
      }
      return e instanceof Me ? new Q(`Prisma.${e._getName()}`) : kr(e) ? new Q(`prisma.${We(e.modelName)}.$fields.${e.name}`) : Array.isArray(e) ? Kd(e) : typeof e == "object" ? ga2(e) : new Q(Object.prototype.toString.call(e));
    }
    __name(ha2, "ha");
    function Kd(e) {
      let r = new Ir();
      for (let t of e) r.addItem(ha2(t));
      return r;
    }
    __name(Kd, "Kd");
    function _n(e, r) {
      let t = r === "pretty" ? aa : Cn, n = e.renderAllMessages(t), i = new Ar(0, { colors: t }).write(e).toString();
      return { message: n, args: i };
    }
    __name(_n, "_n");
    function Nn2({ args: e, errors: r, errorFormat: t, callsite: n, originalMethod: i, clientVersion: o, globalOmit: s }) {
      let a2 = _r(e);
      for (let p2 of r) Sn(p2, a2, s);
      let { message: l, args: u } = _n(a2, t), c = Tn({ message: l, callsite: n, originalMethod: i, showColors: t === "pretty", callArguments: u });
      throw new Z(c, { clientVersion: o });
    }
    __name(Nn2, "Nn");
    function Te(e) {
      return e.replace(/^./, (r) => r.toLowerCase());
    }
    __name(Te, "Te");
    function ba2(e, r, t) {
      let n = Te(t);
      return !r.result || !(r.result.$allModels || r.result[n]) ? e : Hd({ ...e, ...ya2(r.name, e, r.result.$allModels), ...ya2(r.name, e, r.result[n]) });
    }
    __name(ba2, "ba");
    function Hd(e) {
      let r = new we(), t = /* @__PURE__ */ __name((n, i) => r.getOrCreate(n, () => i.has(n) ? [n] : (i.add(n), e[n] ? e[n].needs.flatMap((o) => t(o, i)) : [n])), "t");
      return pn(e, (n) => ({ ...n, needs: t(n.name, /* @__PURE__ */ new Set()) }));
    }
    __name(Hd, "Hd");
    function ya2(e, r, t) {
      return t ? pn(t, ({ needs: n, compute: i }, o) => ({ name: o, needs: n ? Object.keys(n).filter((s) => n[s]) : [], compute: Yd(r, o, i) })) : {};
    }
    __name(ya2, "ya");
    function Yd(e, r, t) {
      let n = e?.[r]?.compute;
      return n ? (i) => t({ ...i, [r]: n(i) }) : t;
    }
    __name(Yd, "Yd");
    function Ea2(e, r) {
      if (!r) return e;
      let t = { ...e };
      for (let n of Object.values(r)) if (e[n.name]) for (let i of n.needs) t[i] = true;
      return t;
    }
    __name(Ea2, "Ea");
    function wa2(e, r) {
      if (!r) return e;
      let t = { ...e };
      for (let n of Object.values(r)) if (!e[n.name]) for (let i of n.needs) delete t[i];
      return t;
    }
    __name(wa2, "wa");
    var Ln2 = class {
      static {
        __name(this, "Ln");
      }
      constructor(r, t) {
        this.extension = r;
        this.previous = t;
      }
      computedFieldsCache = new we();
      modelExtensionsCache = new we();
      queryCallbacksCache = new we();
      clientExtensions = lt(() => this.extension.client ? { ...this.previous?.getAllClientExtensions(), ...this.extension.client } : this.previous?.getAllClientExtensions());
      batchCallbacks = lt(() => {
        let r = this.previous?.getAllBatchQueryCallbacks() ?? [], t = this.extension.query?.$__internalBatch;
        return t ? r.concat(t) : r;
      });
      getAllComputedFields(r) {
        return this.computedFieldsCache.getOrCreate(r, () => ba2(this.previous?.getAllComputedFields(r), this.extension, r));
      }
      getAllClientExtensions() {
        return this.clientExtensions.get();
      }
      getAllModelExtensions(r) {
        return this.modelExtensionsCache.getOrCreate(r, () => {
          let t = Te(r);
          return !this.extension.model || !(this.extension.model[t] || this.extension.model.$allModels) ? this.previous?.getAllModelExtensions(r) : { ...this.previous?.getAllModelExtensions(r), ...this.extension.model.$allModels, ...this.extension.model[t] };
        });
      }
      getAllQueryCallbacks(r, t) {
        return this.queryCallbacksCache.getOrCreate(`${r}:${t}`, () => {
          let n = this.previous?.getAllQueryCallbacks(r, t) ?? [], i = [], o = this.extension.query;
          return !o || !(o[r] || o.$allModels || o[t] || o.$allOperations) ? n : (o[r] !== void 0 && (o[r][t] !== void 0 && i.push(o[r][t]), o[r].$allOperations !== void 0 && i.push(o[r].$allOperations)), r !== "$none" && o.$allModels !== void 0 && (o.$allModels[t] !== void 0 && i.push(o.$allModels[t]), o.$allModels.$allOperations !== void 0 && i.push(o.$allModels.$allOperations)), o[t] !== void 0 && i.push(o[t]), o.$allOperations !== void 0 && i.push(o.$allOperations), n.concat(i));
        });
      }
      getAllBatchQueryCallbacks() {
        return this.batchCallbacks.get();
      }
    };
    var Nr = class e {
      static {
        __name(this, "e");
      }
      constructor(r) {
        this.head = r;
      }
      static empty() {
        return new e();
      }
      static single(r) {
        return new e(new Ln2(r));
      }
      isEmpty() {
        return this.head === void 0;
      }
      append(r) {
        return new e(new Ln2(r, this.head));
      }
      getAllComputedFields(r) {
        return this.head?.getAllComputedFields(r);
      }
      getAllClientExtensions() {
        return this.head?.getAllClientExtensions();
      }
      getAllModelExtensions(r) {
        return this.head?.getAllModelExtensions(r);
      }
      getAllQueryCallbacks(r, t) {
        return this.head?.getAllQueryCallbacks(r, t) ?? [];
      }
      getAllBatchQueryCallbacks() {
        return this.head?.getAllBatchQueryCallbacks() ?? [];
      }
    };
    var Fn = class {
      static {
        __name(this, "Fn");
      }
      constructor(r) {
        this.name = r;
      }
    };
    function xa2(e) {
      return e instanceof Fn;
    }
    __name(xa2, "xa");
    function va2(e) {
      return new Fn(e);
    }
    __name(va2, "va");
    var Pa = Symbol();
    var bt2 = class {
      static {
        __name(this, "bt");
      }
      constructor(r) {
        if (r !== Pa) throw new Error("Skip instance can not be constructed directly");
      }
      ifUndefined(r) {
        return r === void 0 ? Mn2 : r;
      }
    };
    var Mn2 = new bt2(Pa);
    function Se2(e) {
      return e instanceof bt2;
    }
    __name(Se2, "Se");
    var zd = { findUnique: "findUnique", findUniqueOrThrow: "findUniqueOrThrow", findFirst: "findFirst", findFirstOrThrow: "findFirstOrThrow", findMany: "findMany", count: "aggregate", create: "createOne", createMany: "createMany", createManyAndReturn: "createManyAndReturn", update: "updateOne", updateMany: "updateMany", updateManyAndReturn: "updateManyAndReturn", upsert: "upsertOne", delete: "deleteOne", deleteMany: "deleteMany", executeRaw: "executeRaw", queryRaw: "queryRaw", aggregate: "aggregate", groupBy: "groupBy", runCommandRaw: "runCommandRaw", findRaw: "findRaw", aggregateRaw: "aggregateRaw" };
    var Ta = "explicitly `undefined` values are not allowed";
    function $n({ modelName: e, action: r, args: t, runtimeDataModel: n, extensions: i = Nr.empty(), callsite: o, clientMethod: s, errorFormat: a2, clientVersion: l, previewFeatures: u, globalOmit: c }) {
      let p2 = new Xi({ runtimeDataModel: n, modelName: e, action: r, rootArgs: t, callsite: o, extensions: i, selectionPath: [], argumentPath: [], originalMethod: s, errorFormat: a2, clientVersion: l, previewFeatures: u, globalOmit: c });
      return { modelName: e, action: zd[r], query: Et(t, p2) };
    }
    __name($n, "$n");
    function Et({ select: e, include: r, ...t } = {}, n) {
      let i = t.omit;
      return delete t.omit, { arguments: Ra(t, n), selection: Zd(e, r, i, n) };
    }
    __name(Et, "Et");
    function Zd(e, r, t, n) {
      return e ? (r ? n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "include", secondField: "select", selectionPath: n.getSelectionPath() }) : t && n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "omit", secondField: "select", selectionPath: n.getSelectionPath() }), tm(e, n)) : Xd(n, r, t);
    }
    __name(Zd, "Zd");
    function Xd(e, r, t) {
      let n = {};
      return e.modelOrType && !e.isRawAction() && (n.$composites = true, n.$scalars = true), r && em(n, r, e), rm(n, t, e), n;
    }
    __name(Xd, "Xd");
    function em(e, r, t) {
      for (let [n, i] of Object.entries(r)) {
        if (Se2(i)) continue;
        let o = t.nestSelection(n);
        if (eo2(i, o), i === false || i === void 0) {
          e[n] = false;
          continue;
        }
        let s = t.findField(n);
        if (s && s.kind !== "object" && t.throwValidationError({ kind: "IncludeOnScalar", selectionPath: t.getSelectionPath().concat(n), outputType: t.getOutputTypeDescription() }), s) {
          e[n] = Et(i === true ? {} : i, o);
          continue;
        }
        if (i === true) {
          e[n] = true;
          continue;
        }
        e[n] = Et(i, o);
      }
    }
    __name(em, "em");
    function rm(e, r, t) {
      let n = t.getComputedFields(), i = { ...t.getGlobalOmit(), ...r }, o = wa2(i, n);
      for (let [s, a2] of Object.entries(o)) {
        if (Se2(a2)) continue;
        eo2(a2, t.nestSelection(s));
        let l = t.findField(s);
        n?.[s] && !l || (e[s] = !a2);
      }
    }
    __name(rm, "rm");
    function tm(e, r) {
      let t = {}, n = r.getComputedFields(), i = Ea2(e, n);
      for (let [o, s] of Object.entries(i)) {
        if (Se2(s)) continue;
        let a2 = r.nestSelection(o);
        eo2(s, a2);
        let l = r.findField(o);
        if (!(n?.[o] && !l)) {
          if (s === false || s === void 0 || Se2(s)) {
            t[o] = false;
            continue;
          }
          if (s === true) {
            l?.kind === "object" ? t[o] = Et({}, a2) : t[o] = true;
            continue;
          }
          t[o] = Et(s, a2);
        }
      }
      return t;
    }
    __name(tm, "tm");
    function Sa2(e, r) {
      if (e === null) return null;
      if (typeof e == "string" || typeof e == "number" || typeof e == "boolean") return e;
      if (typeof e == "bigint") return { $type: "BigInt", value: String(e) };
      if (vr2(e)) {
        if (mn(e)) return { $type: "DateTime", value: e.toISOString() };
        r.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: r.getSelectionPath(), argumentPath: r.getArgumentPath(), argument: { name: r.getArgumentName(), typeNames: ["Date"] }, underlyingError: "Provided Date object is invalid" });
      }
      if (xa2(e)) return { $type: "Param", value: e.name };
      if (kr(e)) return { $type: "FieldRef", value: { _ref: e.name, _container: e.modelName } };
      if (Array.isArray(e)) return nm(e, r);
      if (ArrayBuffer.isView(e)) {
        let { buffer: t, byteOffset: n, byteLength: i } = e;
        return { $type: "Bytes", value: Buffer.from(t, n, i).toString("base64") };
      }
      if (im(e)) return e.values;
      if (Sr2(e)) return { $type: "Decimal", value: e.toFixed() };
      if (e instanceof Me) {
        if (e !== On.instances[e._getName()]) throw new Error("Invalid ObjectEnumValue");
        return { $type: "Enum", value: e._getName() };
      }
      if (om(e)) return e.toJSON();
      if (typeof e == "object") return Ra(e, r);
      r.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: r.getSelectionPath(), argumentPath: r.getArgumentPath(), argument: { name: r.getArgumentName(), typeNames: [] }, underlyingError: `We could not serialize ${Object.prototype.toString.call(e)} value. Serialize the object to JSON or implement a ".toJSON()" method on it` });
    }
    __name(Sa2, "Sa");
    function Ra(e, r) {
      if (e.$type) return { $type: "Raw", value: e };
      let t = {};
      for (let n in e) {
        let i = e[n], o = r.nestArgument(n);
        Se2(i) || (i !== void 0 ? t[n] = Sa2(i, o) : r.isPreviewFeatureOn("strictUndefinedChecks") && r.throwValidationError({ kind: "InvalidArgumentValue", argumentPath: o.getArgumentPath(), selectionPath: r.getSelectionPath(), argument: { name: r.getArgumentName(), typeNames: [] }, underlyingError: Ta }));
      }
      return t;
    }
    __name(Ra, "Ra");
    function nm(e, r) {
      let t = [];
      for (let n = 0; n < e.length; n++) {
        let i = r.nestArgument(String(n)), o = e[n];
        if (o === void 0 || Se2(o)) {
          let s = o === void 0 ? "undefined" : "Prisma.skip";
          r.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: i.getSelectionPath(), argumentPath: i.getArgumentPath(), argument: { name: `${r.getArgumentName()}[${n}]`, typeNames: [] }, underlyingError: `Can not use \`${s}\` value within array. Use \`null\` or filter out \`${s}\` values` });
        }
        t.push(Sa2(o, i));
      }
      return t;
    }
    __name(nm, "nm");
    function im(e) {
      return typeof e == "object" && e !== null && e.__prismaRawParameters__ === true;
    }
    __name(im, "im");
    function om(e) {
      return typeof e == "object" && e !== null && typeof e.toJSON == "function";
    }
    __name(om, "om");
    function eo2(e, r) {
      e === void 0 && r.isPreviewFeatureOn("strictUndefinedChecks") && r.throwValidationError({ kind: "InvalidSelectionValue", selectionPath: r.getSelectionPath(), underlyingError: Ta });
    }
    __name(eo2, "eo");
    var Xi = class e {
      static {
        __name(this, "e");
      }
      constructor(r) {
        this.params = r;
        this.params.modelName && (this.modelOrType = this.params.runtimeDataModel.models[this.params.modelName] ?? this.params.runtimeDataModel.types[this.params.modelName]);
      }
      modelOrType;
      throwValidationError(r) {
        Nn2({ errors: [r], originalMethod: this.params.originalMethod, args: this.params.rootArgs ?? {}, callsite: this.params.callsite, errorFormat: this.params.errorFormat, clientVersion: this.params.clientVersion, globalOmit: this.params.globalOmit });
      }
      getSelectionPath() {
        return this.params.selectionPath;
      }
      getArgumentPath() {
        return this.params.argumentPath;
      }
      getArgumentName() {
        return this.params.argumentPath[this.params.argumentPath.length - 1];
      }
      getOutputTypeDescription() {
        if (!(!this.params.modelName || !this.modelOrType)) return { name: this.params.modelName, fields: this.modelOrType.fields.map((r) => ({ name: r.name, typeName: "boolean", isRelation: r.kind === "object" })) };
      }
      isRawAction() {
        return ["executeRaw", "queryRaw", "runCommandRaw", "findRaw", "aggregateRaw"].includes(this.params.action);
      }
      isPreviewFeatureOn(r) {
        return this.params.previewFeatures.includes(r);
      }
      getComputedFields() {
        if (this.params.modelName) return this.params.extensions.getAllComputedFields(this.params.modelName);
      }
      findField(r) {
        return this.modelOrType?.fields.find((t) => t.name === r);
      }
      nestSelection(r) {
        let t = this.findField(r), n = t?.kind === "object" ? t.type : void 0;
        return new e({ ...this.params, modelName: n, selectionPath: this.params.selectionPath.concat(r) });
      }
      getGlobalOmit() {
        return this.params.modelName && this.shouldApplyGlobalOmit() ? this.params.globalOmit?.[We(this.params.modelName)] ?? {} : {};
      }
      shouldApplyGlobalOmit() {
        switch (this.params.action) {
          case "findFirst":
          case "findFirstOrThrow":
          case "findUniqueOrThrow":
          case "findMany":
          case "upsert":
          case "findUnique":
          case "createManyAndReturn":
          case "create":
          case "update":
          case "updateManyAndReturn":
          case "delete":
            return true;
          case "executeRaw":
          case "aggregateRaw":
          case "runCommandRaw":
          case "findRaw":
          case "createMany":
          case "deleteMany":
          case "groupBy":
          case "updateMany":
          case "count":
          case "aggregate":
          case "queryRaw":
            return false;
          default:
            ar(this.params.action, "Unknown action");
        }
      }
      nestArgument(r) {
        return new e({ ...this.params, argumentPath: this.params.argumentPath.concat(r) });
      }
    };
    function Aa2(e) {
      if (!e._hasPreviewFlag("metrics")) throw new Z("`metrics` preview feature must be enabled in order to access metrics API", { clientVersion: e._clientVersion });
    }
    __name(Aa2, "Aa");
    var Lr = class {
      static {
        __name(this, "Lr");
      }
      _client;
      constructor(r) {
        this._client = r;
      }
      prometheus(r) {
        return Aa2(this._client), this._client._engine.metrics({ format: "prometheus", ...r });
      }
      json(r) {
        return Aa2(this._client), this._client._engine.metrics({ format: "json", ...r });
      }
    };
    function Ca(e, r) {
      let t = lt(() => sm(r));
      Object.defineProperty(e, "dmmf", { get: /* @__PURE__ */ __name(() => t.get(), "get") });
    }
    __name(Ca, "Ca");
    function sm(e) {
      return { datamodel: { models: ro(e.models), enums: ro(e.enums), types: ro(e.types) } };
    }
    __name(sm, "sm");
    function ro(e) {
      return Object.entries(e).map(([r, t]) => ({ name: r, ...t }));
    }
    __name(ro, "ro");
    var to = /* @__PURE__ */ new WeakMap();
    var qn = "$$PrismaTypedSql";
    var wt2 = class {
      static {
        __name(this, "wt");
      }
      constructor(r, t) {
        to.set(this, { sql: r, values: t }), Object.defineProperty(this, qn, { value: qn });
      }
      get sql() {
        return to.get(this).sql;
      }
      get values() {
        return to.get(this).values;
      }
    };
    function Ia(e) {
      return (...r) => new wt2(e, r);
    }
    __name(Ia, "Ia");
    function Vn(e) {
      return e != null && e[qn] === qn;
    }
    __name(Vn, "Vn");
    var cu = O2(Ti2());
    var pu = __require("node:async_hooks");
    var du = __require("node:events");
    var mu = O2(__require("node:fs"));
    var ri = O2(__require("node:path"));
    var ie2 = class e {
      static {
        __name(this, "e");
      }
      constructor(r, t) {
        if (r.length - 1 !== t.length) throw r.length === 0 ? new TypeError("Expected at least 1 string") : new TypeError(`Expected ${r.length} strings to have ${r.length - 1} values`);
        let n = t.reduce((s, a2) => s + (a2 instanceof e ? a2.values.length : 1), 0);
        this.values = new Array(n), this.strings = new Array(n + 1), this.strings[0] = r[0];
        let i = 0, o = 0;
        for (; i < t.length; ) {
          let s = t[i++], a2 = r[i];
          if (s instanceof e) {
            this.strings[o] += s.strings[0];
            let l = 0;
            for (; l < s.values.length; ) this.values[o++] = s.values[l++], this.strings[o] = s.strings[l];
            this.strings[o] += a2;
          } else this.values[o++] = s, this.strings[o] = a2;
        }
      }
      get sql() {
        let r = this.strings.length, t = 1, n = this.strings[0];
        for (; t < r; ) n += `?${this.strings[t++]}`;
        return n;
      }
      get statement() {
        let r = this.strings.length, t = 1, n = this.strings[0];
        for (; t < r; ) n += `:${t}${this.strings[t++]}`;
        return n;
      }
      get text() {
        let r = this.strings.length, t = 1, n = this.strings[0];
        for (; t < r; ) n += `$${t}${this.strings[t++]}`;
        return n;
      }
      inspect() {
        return { sql: this.sql, statement: this.statement, text: this.text, values: this.values };
      }
    };
    function Da(e, r = ",", t = "", n = "") {
      if (e.length === 0) throw new TypeError("Expected `join([])` to be called with an array of multiple elements, but got an empty array");
      return new ie2([t, ...Array(e.length - 1).fill(r), n], e);
    }
    __name(Da, "Da");
    function no(e) {
      return new ie2([e], []);
    }
    __name(no, "no");
    var Oa = no("");
    function io2(e, ...r) {
      return new ie2(e, r);
    }
    __name(io2, "io");
    function xt(e) {
      return { getKeys() {
        return Object.keys(e);
      }, getPropertyValue(r) {
        return e[r];
      } };
    }
    __name(xt, "xt");
    function re(e, r) {
      return { getKeys() {
        return [e];
      }, getPropertyValue() {
        return r();
      } };
    }
    __name(re, "re");
    function lr2(e) {
      let r = new we();
      return { getKeys() {
        return e.getKeys();
      }, getPropertyValue(t) {
        return r.getOrCreate(t, () => e.getPropertyValue(t));
      }, getPropertyDescriptor(t) {
        return e.getPropertyDescriptor?.(t);
      } };
    }
    __name(lr2, "lr");
    var jn = { enumerable: true, configurable: true, writable: true };
    function Bn(e) {
      let r = new Set(e);
      return { getPrototypeOf: /* @__PURE__ */ __name(() => Object.prototype, "getPrototypeOf"), getOwnPropertyDescriptor: /* @__PURE__ */ __name(() => jn, "getOwnPropertyDescriptor"), has: /* @__PURE__ */ __name((t, n) => r.has(n), "has"), set: /* @__PURE__ */ __name((t, n, i) => r.add(n) && Reflect.set(t, n, i), "set"), ownKeys: /* @__PURE__ */ __name(() => [...r], "ownKeys") };
    }
    __name(Bn, "Bn");
    var ka = Symbol.for("nodejs.util.inspect.custom");
    function he(e, r) {
      let t = am(r), n = /* @__PURE__ */ new Set(), i = new Proxy(e, { get(o, s) {
        if (n.has(s)) return o[s];
        let a2 = t.get(s);
        return a2 ? a2.getPropertyValue(s) : o[s];
      }, has(o, s) {
        if (n.has(s)) return true;
        let a2 = t.get(s);
        return a2 ? a2.has?.(s) ?? true : Reflect.has(o, s);
      }, ownKeys(o) {
        let s = _a(Reflect.ownKeys(o), t), a2 = _a(Array.from(t.keys()), t);
        return [.../* @__PURE__ */ new Set([...s, ...a2, ...n])];
      }, set(o, s, a2) {
        return t.get(s)?.getPropertyDescriptor?.(s)?.writable === false ? false : (n.add(s), Reflect.set(o, s, a2));
      }, getOwnPropertyDescriptor(o, s) {
        let a2 = Reflect.getOwnPropertyDescriptor(o, s);
        if (a2 && !a2.configurable) return a2;
        let l = t.get(s);
        return l ? l.getPropertyDescriptor ? { ...jn, ...l?.getPropertyDescriptor(s) } : jn : a2;
      }, defineProperty(o, s, a2) {
        return n.add(s), Reflect.defineProperty(o, s, a2);
      }, getPrototypeOf: /* @__PURE__ */ __name(() => Object.prototype, "getPrototypeOf") });
      return i[ka] = function() {
        let o = { ...this };
        return delete o[ka], o;
      }, i;
    }
    __name(he, "he");
    function am(e) {
      let r = /* @__PURE__ */ new Map();
      for (let t of e) {
        let n = t.getKeys();
        for (let i of n) r.set(i, t);
      }
      return r;
    }
    __name(am, "am");
    function _a(e, r) {
      return e.filter((t) => r.get(t)?.has?.(t) ?? true);
    }
    __name(_a, "_a");
    function Fr(e) {
      return { getKeys() {
        return e;
      }, has() {
        return false;
      }, getPropertyValue() {
      } };
    }
    __name(Fr, "Fr");
    function Mr(e, r) {
      return { batch: e, transaction: r?.kind === "batch" ? { isolationLevel: r.options.isolationLevel } : void 0 };
    }
    __name(Mr, "Mr");
    function Na(e) {
      if (e === void 0) return "";
      let r = _r(e);
      return new Ar(0, { colors: Cn }).write(r).toString();
    }
    __name(Na, "Na");
    var lm = "P2037";
    function $r({ error: e, user_facing_error: r }, t, n) {
      return r.error_code ? new z(um(r, n), { code: r.error_code, clientVersion: t, meta: r.meta, batchRequestIdx: r.batch_request_idx }) : new V(e, { clientVersion: t, batchRequestIdx: r.batch_request_idx });
    }
    __name($r, "$r");
    function um(e, r) {
      let t = e.message;
      return (r === "postgresql" || r === "postgres" || r === "mysql") && e.error_code === lm && (t += `
Prisma Accelerate has built-in connection pooling to prevent such errors: https://pris.ly/client/error-accelerate`), t;
    }
    __name(um, "um");
    var vt = "<unknown>";
    function La(e) {
      var r = e.split(`
`);
      return r.reduce(function(t, n) {
        var i = dm(n) || fm(n) || ym(n) || xm(n) || Em(n);
        return i && t.push(i), t;
      }, []);
    }
    __name(La, "La");
    var cm = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|rsc|<anonymous>|\/|[a-z]:\\|\\\\).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
    var pm = /\((\S*)(?::(\d+))(?::(\d+))\)/;
    function dm(e) {
      var r = cm.exec(e);
      if (!r) return null;
      var t = r[2] && r[2].indexOf("native") === 0, n = r[2] && r[2].indexOf("eval") === 0, i = pm.exec(r[2]);
      return n && i != null && (r[2] = i[1], r[3] = i[2], r[4] = i[3]), { file: t ? null : r[2], methodName: r[1] || vt, arguments: t ? [r[2]] : [], lineNumber: r[3] ? +r[3] : null, column: r[4] ? +r[4] : null };
    }
    __name(dm, "dm");
    var mm = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|rsc|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    function fm(e) {
      var r = mm.exec(e);
      return r ? { file: r[2], methodName: r[1] || vt, arguments: [], lineNumber: +r[3], column: r[4] ? +r[4] : null } : null;
    }
    __name(fm, "fm");
    var gm = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|rsc|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
    var hm = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
    function ym(e) {
      var r = gm.exec(e);
      if (!r) return null;
      var t = r[3] && r[3].indexOf(" > eval") > -1, n = hm.exec(r[3]);
      return t && n != null && (r[3] = n[1], r[4] = n[2], r[5] = null), { file: r[3], methodName: r[1] || vt, arguments: r[2] ? r[2].split(",") : [], lineNumber: r[4] ? +r[4] : null, column: r[5] ? +r[5] : null };
    }
    __name(ym, "ym");
    var bm = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i;
    function Em(e) {
      var r = bm.exec(e);
      return r ? { file: r[3], methodName: r[1] || vt, arguments: [], lineNumber: +r[4], column: r[5] ? +r[5] : null } : null;
    }
    __name(Em, "Em");
    var wm = /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    function xm(e) {
      var r = wm.exec(e);
      return r ? { file: r[2], methodName: r[1] || vt, arguments: [], lineNumber: +r[3], column: r[4] ? +r[4] : null } : null;
    }
    __name(xm, "xm");
    var oo2 = class {
      static {
        __name(this, "oo");
      }
      getLocation() {
        return null;
      }
    };
    var so2 = class {
      static {
        __name(this, "so");
      }
      _error;
      constructor() {
        this._error = new Error();
      }
      getLocation() {
        let r = this._error.stack;
        if (!r) return null;
        let n = La(r).find((i) => {
          if (!i.file) return false;
          let o = Li(i.file);
          return o !== "<anonymous>" && !o.includes("@prisma") && !o.includes("/packages/client/src/runtime/") && !o.endsWith("/runtime/binary.js") && !o.endsWith("/runtime/library.js") && !o.endsWith("/runtime/edge.js") && !o.endsWith("/runtime/edge-esm.js") && !o.startsWith("internal/") && !i.methodName.includes("new ") && !i.methodName.includes("getCallSite") && !i.methodName.includes("Proxy.") && i.methodName.split(".").length < 4;
        });
        return !n || !n.file ? null : { fileName: n.file, lineNumber: n.lineNumber, columnNumber: n.column };
      }
    };
    function Ze(e) {
      return e === "minimal" ? typeof $EnabledCallSite == "function" && e !== "minimal" ? new $EnabledCallSite() : new oo2() : new so2();
    }
    __name(Ze, "Ze");
    var Fa = { _avg: true, _count: true, _sum: true, _min: true, _max: true };
    function qr(e = {}) {
      let r = Pm(e);
      return Object.entries(r).reduce((n, [i, o]) => (Fa[i] !== void 0 ? n.select[i] = { select: o } : n[i] = o, n), { select: {} });
    }
    __name(qr, "qr");
    function Pm(e = {}) {
      return typeof e._count == "boolean" ? { ...e, _count: { _all: e._count } } : e;
    }
    __name(Pm, "Pm");
    function Un3(e = {}) {
      return (r) => (typeof e._count == "boolean" && (r._count = r._count._all), r);
    }
    __name(Un3, "Un");
    function Ma(e, r) {
      let t = Un3(e);
      return r({ action: "aggregate", unpacker: t, argsMapper: qr })(e);
    }
    __name(Ma, "Ma");
    function Tm(e = {}) {
      let { select: r, ...t } = e;
      return typeof r == "object" ? qr({ ...t, _count: r }) : qr({ ...t, _count: { _all: true } });
    }
    __name(Tm, "Tm");
    function Sm(e = {}) {
      return typeof e.select == "object" ? (r) => Un3(e)(r)._count : (r) => Un3(e)(r)._count._all;
    }
    __name(Sm, "Sm");
    function $a(e, r) {
      return r({ action: "count", unpacker: Sm(e), argsMapper: Tm })(e);
    }
    __name($a, "$a");
    function Rm(e = {}) {
      let r = qr(e);
      if (Array.isArray(r.by)) for (let t of r.by) typeof t == "string" && (r.select[t] = true);
      else typeof r.by == "string" && (r.select[r.by] = true);
      return r;
    }
    __name(Rm, "Rm");
    function Am(e = {}) {
      return (r) => (typeof e?._count == "boolean" && r.forEach((t) => {
        t._count = t._count._all;
      }), r);
    }
    __name(Am, "Am");
    function qa(e, r) {
      return r({ action: "groupBy", unpacker: Am(e), argsMapper: Rm })(e);
    }
    __name(qa, "qa");
    function Va(e, r, t) {
      if (r === "aggregate") return (n) => Ma(n, t);
      if (r === "count") return (n) => $a(n, t);
      if (r === "groupBy") return (n) => qa(n, t);
    }
    __name(Va, "Va");
    function ja(e, r) {
      let t = r.fields.filter((i) => !i.relationName), n = _s2(t, "name");
      return new Proxy({}, { get(i, o) {
        if (o in i || typeof o == "symbol") return i[o];
        let s = n[o];
        if (s) return new mt2(e, o, s.type, s.isList, s.kind === "enum");
      }, ...Bn(Object.keys(n)) });
    }
    __name(ja, "ja");
    var Ba = /* @__PURE__ */ __name((e) => Array.isArray(e) ? e : e.split("."), "Ba");
    var ao2 = /* @__PURE__ */ __name((e, r) => Ba(r).reduce((t, n) => t && t[n], e), "ao");
    var Ua = /* @__PURE__ */ __name((e, r, t) => Ba(r).reduceRight((n, i, o, s) => Object.assign({}, ao2(e, s.slice(0, o)), { [i]: n }), t), "Ua");
    function Cm(e, r) {
      return e === void 0 || r === void 0 ? [] : [...r, "select", e];
    }
    __name(Cm, "Cm");
    function Im(e, r, t) {
      return r === void 0 ? e ?? {} : Ua(r, t, e || true);
    }
    __name(Im, "Im");
    function lo2(e, r, t, n, i, o) {
      let a2 = e._runtimeDataModel.models[r].fields.reduce((l, u) => ({ ...l, [u.name]: u }), {});
      return (l) => {
        let u = Ze(e._errorFormat), c = Cm(n, i), p2 = Im(l, o, c), d2 = t({ dataPath: c, callsite: u })(p2), f = Dm(e, r);
        return new Proxy(d2, { get(h, g) {
          if (!f.includes(g)) return h[g];
          let T2 = [a2[g].type, t, g], S2 = [c, p2];
          return lo2(e, ...T2, ...S2);
        }, ...Bn([...f, ...Object.getOwnPropertyNames(d2)]) });
      };
    }
    __name(lo2, "lo");
    function Dm(e, r) {
      return e._runtimeDataModel.models[r].fields.filter((t) => t.kind === "object").map((t) => t.name);
    }
    __name(Dm, "Dm");
    var Om = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "create", "update", "upsert", "delete"];
    var km = ["aggregate", "count", "groupBy"];
    function uo(e, r) {
      let t = e._extensions.getAllModelExtensions(r) ?? {}, n = [_m(e, r), Lm(e, r), xt(t), re("name", () => r), re("$name", () => r), re("$parent", () => e._appliedParent)];
      return he({}, n);
    }
    __name(uo, "uo");
    function _m(e, r) {
      let t = Te(r), n = Object.keys(Rr).concat("count");
      return { getKeys() {
        return n;
      }, getPropertyValue(i) {
        let o = i, s = /* @__PURE__ */ __name((a2) => (l) => {
          let u = Ze(e._errorFormat);
          return e._createPrismaPromise((c) => {
            let p2 = { args: l, dataPath: [], action: o, model: r, clientMethod: `${t}.${i}`, jsModelName: t, transaction: c, callsite: u };
            return e._request({ ...p2, ...a2 });
          }, { action: o, args: l, model: r });
        }, "s");
        return Om.includes(o) ? lo2(e, r, s) : Nm(i) ? Va(e, i, s) : s({});
      } };
    }
    __name(_m, "_m");
    function Nm(e) {
      return km.includes(e);
    }
    __name(Nm, "Nm");
    function Lm(e, r) {
      return lr2(re("fields", () => {
        let t = e._runtimeDataModel.models[r];
        return ja(r, t);
      }));
    }
    __name(Lm, "Lm");
    function Ga(e) {
      return e.replace(/^./, (r) => r.toUpperCase());
    }
    __name(Ga, "Ga");
    var co = Symbol();
    function Pt(e) {
      let r = [Fm(e), Mm(e), re(co, () => e), re("$parent", () => e._appliedParent)], t = e._extensions.getAllClientExtensions();
      return t && r.push(xt(t)), he(e, r);
    }
    __name(Pt, "Pt");
    function Fm(e) {
      let r = Object.getPrototypeOf(e._originalClient), t = [...new Set(Object.getOwnPropertyNames(r))];
      return { getKeys() {
        return t;
      }, getPropertyValue(n) {
        return e[n];
      } };
    }
    __name(Fm, "Fm");
    function Mm(e) {
      let r = Object.keys(e._runtimeDataModel.models), t = r.map(Te), n = [...new Set(r.concat(t))];
      return lr2({ getKeys() {
        return n;
      }, getPropertyValue(i) {
        let o = Ga(i);
        if (e._runtimeDataModel.models[o] !== void 0) return uo(e, o);
        if (e._runtimeDataModel.models[i] !== void 0) return uo(e, i);
      }, getPropertyDescriptor(i) {
        if (!t.includes(i)) return { enumerable: false };
      } });
    }
    __name(Mm, "Mm");
    function Qa(e) {
      return e[co] ? e[co] : e;
    }
    __name(Qa, "Qa");
    function Wa(e) {
      if (typeof e == "function") return e(this);
      if (e.client?.__AccelerateEngine) {
        let t = e.client.__AccelerateEngine;
        this._originalClient._engine = new t(this._originalClient._accelerateEngineConfig);
      }
      let r = Object.create(this._originalClient, { _extensions: { value: this._extensions.append(e) }, _appliedParent: { value: this, configurable: true }, $on: { value: void 0 } });
      return Pt(r);
    }
    __name(Wa, "Wa");
    function Ja({ result: e, modelName: r, select: t, omit: n, extensions: i }) {
      let o = i.getAllComputedFields(r);
      if (!o) return e;
      let s = [], a2 = [];
      for (let l of Object.values(o)) {
        if (n) {
          if (n[l.name]) continue;
          let u = l.needs.filter((c) => n[c]);
          u.length > 0 && a2.push(Fr(u));
        } else if (t) {
          if (!t[l.name]) continue;
          let u = l.needs.filter((c) => !t[c]);
          u.length > 0 && a2.push(Fr(u));
        }
        $m(e, l.needs) && s.push(qm(l, he(e, s)));
      }
      return s.length > 0 || a2.length > 0 ? he(e, [...s, ...a2]) : e;
    }
    __name(Ja, "Ja");
    function $m(e, r) {
      return r.every((t) => Vi(e, t));
    }
    __name($m, "$m");
    function qm(e, r) {
      return lr2(re(e.name, () => e.compute(r)));
    }
    __name(qm, "qm");
    function Gn({ visitor: e, result: r, args: t, runtimeDataModel: n, modelName: i }) {
      if (Array.isArray(r)) {
        for (let s = 0; s < r.length; s++) r[s] = Gn({ result: r[s], args: t, modelName: i, runtimeDataModel: n, visitor: e });
        return r;
      }
      let o = e(r, i, t) ?? r;
      return t.include && Ka({ includeOrSelect: t.include, result: o, parentModelName: i, runtimeDataModel: n, visitor: e }), t.select && Ka({ includeOrSelect: t.select, result: o, parentModelName: i, runtimeDataModel: n, visitor: e }), o;
    }
    __name(Gn, "Gn");
    function Ka({ includeOrSelect: e, result: r, parentModelName: t, runtimeDataModel: n, visitor: i }) {
      for (let [o, s] of Object.entries(e)) {
        if (!s || r[o] == null || Se2(s)) continue;
        let l = n.models[t].fields.find((c) => c.name === o);
        if (!l || l.kind !== "object" || !l.relationName) continue;
        let u = typeof s == "object" ? s : {};
        r[o] = Gn({ visitor: i, result: r[o], args: u, modelName: l.type, runtimeDataModel: n });
      }
    }
    __name(Ka, "Ka");
    function Ha({ result: e, modelName: r, args: t, extensions: n, runtimeDataModel: i, globalOmit: o }) {
      return n.isEmpty() || e == null || typeof e != "object" || !i.models[r] ? e : Gn({ result: e, args: t ?? {}, modelName: r, runtimeDataModel: i, visitor: /* @__PURE__ */ __name((a2, l, u) => {
        let c = Te(l);
        return Ja({ result: a2, modelName: c, select: u.select, omit: u.select ? void 0 : { ...o?.[c], ...u.omit }, extensions: n });
      }, "visitor") });
    }
    __name(Ha, "Ha");
    var Vm = ["$connect", "$disconnect", "$on", "$transaction", "$extends"];
    var Ya = Vm;
    function za(e) {
      if (e instanceof ie2) return jm(e);
      if (Vn(e)) return Bm(e);
      if (Array.isArray(e)) {
        let t = [e[0]];
        for (let n = 1; n < e.length; n++) t[n] = Tt(e[n]);
        return t;
      }
      let r = {};
      for (let t in e) r[t] = Tt(e[t]);
      return r;
    }
    __name(za, "za");
    function jm(e) {
      return new ie2(e.strings, e.values);
    }
    __name(jm, "jm");
    function Bm(e) {
      return new wt2(e.sql, e.values);
    }
    __name(Bm, "Bm");
    function Tt(e) {
      if (typeof e != "object" || e == null || e instanceof Me || kr(e)) return e;
      if (Sr2(e)) return new Fe2(e.toFixed());
      if (vr2(e)) return /* @__PURE__ */ new Date(+e);
      if (ArrayBuffer.isView(e)) return e.slice(0);
      if (Array.isArray(e)) {
        let r = e.length, t;
        for (t = Array(r); r--; ) t[r] = Tt(e[r]);
        return t;
      }
      if (typeof e == "object") {
        let r = {};
        for (let t in e) t === "__proto__" ? Object.defineProperty(r, t, { value: Tt(e[t]), configurable: true, enumerable: true, writable: true }) : r[t] = Tt(e[t]);
        return r;
      }
      ar(e, "Unknown value");
    }
    __name(Tt, "Tt");
    function Xa(e, r, t, n = 0) {
      return e._createPrismaPromise((i) => {
        let o = r.customDataProxyFetch;
        return "transaction" in r && i !== void 0 && (r.transaction?.kind === "batch" && r.transaction.lock.then(), r.transaction = i), n === t.length ? e._executeRequest(r) : t[n]({ model: r.model, operation: r.model ? r.action : r.clientMethod, args: za(r.args ?? {}), __internalParams: r, query: /* @__PURE__ */ __name((s, a2 = r) => {
          let l = a2.customDataProxyFetch;
          return a2.customDataProxyFetch = nl(o, l), a2.args = s, Xa(e, a2, t, n + 1);
        }, "query") });
      });
    }
    __name(Xa, "Xa");
    function el(e, r) {
      let { jsModelName: t, action: n, clientMethod: i } = r, o = t ? n : i;
      if (e._extensions.isEmpty()) return e._executeRequest(r);
      let s = e._extensions.getAllQueryCallbacks(t ?? "$none", o);
      return Xa(e, r, s);
    }
    __name(el, "el");
    function rl(e) {
      return (r) => {
        let t = { requests: r }, n = r[0].extensions.getAllBatchQueryCallbacks();
        return n.length ? tl(t, n, 0, e) : e(t);
      };
    }
    __name(rl, "rl");
    function tl(e, r, t, n) {
      if (t === r.length) return n(e);
      let i = e.customDataProxyFetch, o = e.requests[0].transaction;
      return r[t]({ args: { queries: e.requests.map((s) => ({ model: s.modelName, operation: s.action, args: s.args })), transaction: o ? { isolationLevel: o.kind === "batch" ? o.isolationLevel : void 0 } : void 0 }, __internalParams: e, query(s, a2 = e) {
        let l = a2.customDataProxyFetch;
        return a2.customDataProxyFetch = nl(i, l), tl(a2, r, t + 1, n);
      } });
    }
    __name(tl, "tl");
    var Za = /* @__PURE__ */ __name((e) => e, "Za");
    function nl(e = Za, r = Za) {
      return (t) => e(r(t));
    }
    __name(nl, "nl");
    var il = N("prisma:client");
    var ol2 = { Vercel: "vercel", "Netlify CI": "netlify" };
    function sl({ postinstall: e, ciName: r, clientVersion: t, generator: n }) {
      if (il("checkPlatformCaching:postinstall", e), il("checkPlatformCaching:ciName", r), e === true && !(n?.output && typeof (n.output.fromEnvVar ?? n.output.value) == "string") && r && r in ol2) {
        let i = `Prisma has detected that this project was built on ${r}, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered. To fix this, make sure to run the \`prisma generate\` command during the build process.

Learn how: https://pris.ly/d/${ol2[r]}-build`;
        throw console.error(i), new P(i, t);
      }
    }
    __name(sl, "sl");
    function al(e, r) {
      return e ? e.datasources ? e.datasources : e.datasourceUrl ? { [r[0]]: { url: e.datasourceUrl } } : {} : {};
    }
    __name(al, "al");
    var dl = O2(__require("node:fs"));
    var St = O2(__require("node:path"));
    function Qn2(e) {
      let { runtimeBinaryTarget: r } = e;
      return `Add "${r}" to \`binaryTargets\` in the "schema.prisma" file and run \`prisma generate\` after saving it:

${Um(e)}`;
    }
    __name(Qn2, "Qn");
    function Um(e) {
      let { generator: r, generatorBinaryTargets: t, runtimeBinaryTarget: n } = e, i = { fromEnvVar: null, value: n }, o = [...t, i];
      return ki({ ...r, binaryTargets: o });
    }
    __name(Um, "Um");
    function Xe2(e) {
      let { runtimeBinaryTarget: r } = e;
      return `Prisma Client could not locate the Query Engine for runtime "${r}".`;
    }
    __name(Xe2, "Xe");
    function er(e) {
      let { searchedLocations: r } = e;
      return `The following locations have been searched:
${[...new Set(r)].map((i) => `  ${i}`).join(`
`)}`;
    }
    __name(er, "er");
    function ll(e) {
      let { runtimeBinaryTarget: r } = e;
      return `${Xe2(e)}

This happened because \`binaryTargets\` have been pinned, but the actual deployment also required "${r}".
${Qn2(e)}

${er(e)}`;
    }
    __name(ll, "ll");
    function Wn(e) {
      return `We would appreciate if you could take the time to share some information with us.
Please help us by answering a few questions: https://pris.ly/${e}`;
    }
    __name(Wn, "Wn");
    function Jn(e) {
      let { errorStack: r } = e;
      return r?.match(/\/\.next|\/next@|\/next\//) ? `

We detected that you are using Next.js, learn how to fix this: https://pris.ly/d/engine-not-found-nextjs.` : "";
    }
    __name(Jn, "Jn");
    function ul(e) {
      let { queryEngineName: r } = e;
      return `${Xe2(e)}${Jn(e)}

This is likely caused by a bundler that has not copied "${r}" next to the resulting bundle.
Ensure that "${r}" has been copied next to the bundle or in "${e.expectedLocation}".

${Wn("engine-not-found-bundler-investigation")}

${er(e)}`;
    }
    __name(ul, "ul");
    function cl(e) {
      let { runtimeBinaryTarget: r, generatorBinaryTargets: t } = e, n = t.find((i) => i.native);
      return `${Xe2(e)}

This happened because Prisma Client was generated for "${n?.value ?? "unknown"}", but the actual deployment required "${r}".
${Qn2(e)}

${er(e)}`;
    }
    __name(cl, "cl");
    function pl(e) {
      let { queryEngineName: r } = e;
      return `${Xe2(e)}${Jn(e)}

This is likely caused by tooling that has not copied "${r}" to the deployment folder.
Ensure that you ran \`prisma generate\` and that "${r}" has been copied to "${e.expectedLocation}".

${Wn("engine-not-found-tooling-investigation")}

${er(e)}`;
    }
    __name(pl, "pl");
    var Gm = N("prisma:client:engines:resolveEnginePath");
    var Qm = /* @__PURE__ */ __name(() => new RegExp("runtime[\\\\/]library\\.m?js$"), "Qm");
    async function ml(e, r) {
      let t = { binary: process.env.PRISMA_QUERY_ENGINE_BINARY, library: process.env.PRISMA_QUERY_ENGINE_LIBRARY }[e] ?? r.prismaPath;
      if (t !== void 0) return t;
      let { enginePath: n, searchedLocations: i } = await Wm(e, r);
      if (Gm("enginePath", n), n !== void 0 && e === "binary" && Ri(n), n !== void 0) return r.prismaPath = n;
      let o = await ir(), s = r.generator?.binaryTargets ?? [], a2 = s.some((d2) => d2.native), l = !s.some((d2) => d2.value === o), u = __filename.match(Qm()) === null, c = { searchedLocations: i, generatorBinaryTargets: s, generator: r.generator, runtimeBinaryTarget: o, queryEngineName: fl(e, o), expectedLocation: St.default.relative(process.cwd(), r.dirname), errorStack: new Error().stack }, p2;
      throw a2 && l ? p2 = cl(c) : l ? p2 = ll(c) : u ? p2 = ul(c) : p2 = pl(c), new P(p2, r.clientVersion);
    }
    __name(ml, "ml");
    async function Wm(e, r) {
      let t = await ir(), n = [], i = [r.dirname, St.default.resolve(__dirname, ".."), r.generator?.output?.value ?? __dirname, St.default.resolve(__dirname, "../../../.prisma/client"), "/tmp/prisma-engines", r.cwd];
      __filename.includes("resolveEnginePath") && i.push(ms2());
      for (let o of i) {
        let s = fl(e, t), a2 = St.default.join(o, s);
        if (n.push(o), dl.default.existsSync(a2)) return { enginePath: a2, searchedLocations: n };
      }
      return { enginePath: void 0, searchedLocations: n };
    }
    __name(Wm, "Wm");
    function fl(e, r) {
      return e === "library" ? Gt(r, "fs") : `query-engine-${r}${r === "windows" ? ".exe" : ""}`;
    }
    __name(fl, "fl");
    function gl(e) {
      return e ? e.replace(/".*"/g, '"X"').replace(/[\s:\[]([+-]?([0-9]*[.])?[0-9]+)/g, (r) => `${r[0]}5`) : "";
    }
    __name(gl, "gl");
    function hl(e) {
      return e.split(`
`).map((r) => r.replace(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)\s*/, "").replace(/\+\d+\s*ms$/, "")).join(`
`);
    }
    __name(hl, "hl");
    var yl = O2(Os());
    function bl({ title: e, user: r = "prisma", repo: t = "prisma", template: n = "bug_report.yml", body: i }) {
      return (0, yl.default)({ user: r, repo: t, template: n, title: e, body: i });
    }
    __name(bl, "bl");
    function El({ version: e, binaryTarget: r, title: t, description: n, engineVersion: i, database: o, query: s }) {
      let a2 = Bo(6e3 - (s?.length ?? 0)), l = hl(wr2(a2)), u = n ? `# Description
\`\`\`
${n}
\`\`\`` : "", c = wr2(`Hi Prisma Team! My Prisma Client just crashed. This is the report:
## Versions

| Name            | Version            |
|-----------------|--------------------|
| Node            | ${process.version?.padEnd(19)}| 
| OS              | ${r?.padEnd(19)}|
| Prisma Client   | ${e?.padEnd(19)}|
| Query Engine    | ${i?.padEnd(19)}|
| Database        | ${o?.padEnd(19)}|

${u}

## Logs
\`\`\`
${l}
\`\`\`

## Client Snippet
\`\`\`ts
// PLEASE FILL YOUR CODE SNIPPET HERE
\`\`\`

## Schema
\`\`\`prisma
// PLEASE ADD YOUR SCHEMA HERE IF POSSIBLE
\`\`\`

## Prisma Engine Query
\`\`\`
${s ? gl(s) : ""}
\`\`\`
`), p2 = bl({ title: t, body: c });
      return `${t}

This is a non-recoverable error which probably happens when the Prisma Query Engine has a panic.

${Y(p2)}

If you want the Prisma team to look into it, please open the link above 🙏
To increase the chance of success, please post your schema and a snippet of
how you used Prisma Client in the issue. 
`;
    }
    __name(El, "El");
    function wl(e, r) {
      throw new Error(r);
    }
    __name(wl, "wl");
    function Jm(e) {
      return e !== null && typeof e == "object" && typeof e.$type == "string";
    }
    __name(Jm, "Jm");
    function Km(e, r) {
      let t = {};
      for (let n of Object.keys(e)) t[n] = r(e[n], n);
      return t;
    }
    __name(Km, "Km");
    function Vr(e) {
      return e === null ? e : Array.isArray(e) ? e.map(Vr) : typeof e == "object" ? Jm(e) ? Hm(e) : e.constructor !== null && e.constructor.name !== "Object" ? e : Km(e, Vr) : e;
    }
    __name(Vr, "Vr");
    function Hm({ $type: e, value: r }) {
      switch (e) {
        case "BigInt":
          return BigInt(r);
        case "Bytes": {
          let { buffer: t, byteOffset: n, byteLength: i } = Buffer.from(r, "base64");
          return new Uint8Array(t, n, i);
        }
        case "DateTime":
          return new Date(r);
        case "Decimal":
          return new Le(r);
        case "Json":
          return JSON.parse(r);
        default:
          wl(r, "Unknown tagged value");
      }
    }
    __name(Hm, "Hm");
    var xl = "6.19.2";
    var zm = /* @__PURE__ */ __name(() => globalThis.process?.release?.name === "node", "zm");
    var Zm = /* @__PURE__ */ __name(() => !!globalThis.Bun || !!globalThis.process?.versions?.bun, "Zm");
    var Xm = /* @__PURE__ */ __name(() => !!globalThis.Deno, "Xm");
    var ef = /* @__PURE__ */ __name(() => typeof globalThis.Netlify == "object", "ef");
    var rf = /* @__PURE__ */ __name(() => typeof globalThis.EdgeRuntime == "object", "rf");
    var tf = /* @__PURE__ */ __name(() => globalThis.navigator?.userAgent === "Cloudflare-Workers", "tf");
    function nf() {
      return [[ef, "netlify"], [rf, "edge-light"], [tf, "workerd"], [Xm, "deno"], [Zm, "bun"], [zm, "node"]].flatMap((t) => t[0]() ? [t[1]] : []).at(0) ?? "";
    }
    __name(nf, "nf");
    var of = { node: "Node.js", workerd: "Cloudflare Workers", deno: "Deno and Deno Deploy", netlify: "Netlify Edge Functions", "edge-light": "Edge Runtime (Vercel Edge Functions, Vercel Edge Middleware, Next.js (Pages Router) Edge API Routes, Next.js (App Router) Edge Route Handlers or Next.js Middleware)" };
    function Kn() {
      let e = nf();
      return { id: e, prettyName: of[e] || e, isEdge: ["workerd", "deno", "netlify", "edge-light"].includes(e) };
    }
    __name(Kn, "Kn");
    function jr({ inlineDatasources: e, overrideDatasources: r, env: t, clientVersion: n }) {
      let i, o = Object.keys(e)[0], s = e[o]?.url, a2 = r[o]?.url;
      if (o === void 0 ? i = void 0 : a2 ? i = a2 : s?.value ? i = s.value : s?.fromEnvVar && (i = t[s.fromEnvVar]), s?.fromEnvVar !== void 0 && i === void 0) throw new P(`error: Environment variable not found: ${s.fromEnvVar}.`, n);
      if (i === void 0) throw new P("error: Missing URL environment variable, value, or override.", n);
      return i;
    }
    __name(jr, "jr");
    var Hn = class extends Error {
      static {
        __name(this, "Hn");
      }
      clientVersion;
      cause;
      constructor(r, t) {
        super(r), this.clientVersion = t.clientVersion, this.cause = t.cause;
      }
      get [Symbol.toStringTag]() {
        return this.name;
      }
    };
    var oe = class extends Hn {
      static {
        __name(this, "oe");
      }
      isRetryable;
      constructor(r, t) {
        super(r, t), this.isRetryable = t.isRetryable ?? true;
      }
    };
    function R(e, r) {
      return { ...e, isRetryable: r };
    }
    __name(R, "R");
    var ur = class extends oe {
      static {
        __name(this, "ur");
      }
      name = "InvalidDatasourceError";
      code = "P6001";
      constructor(r, t) {
        super(r, R(t, false));
      }
    };
    x2(ur, "InvalidDatasourceError");
    function vl2(e) {
      let r = { clientVersion: e.clientVersion }, t = Object.keys(e.inlineDatasources)[0], n = jr({ inlineDatasources: e.inlineDatasources, overrideDatasources: e.overrideDatasources, clientVersion: e.clientVersion, env: { ...e.env, ...typeof process < "u" ? process.env : {} } }), i;
      try {
        i = new URL(n);
      } catch {
        throw new ur(`Error validating datasource \`${t}\`: the URL must start with the protocol \`prisma://\``, r);
      }
      let { protocol: o, searchParams: s } = i;
      if (o !== "prisma:" && o !== sn) throw new ur(`Error validating datasource \`${t}\`: the URL must start with the protocol \`prisma://\` or \`prisma+postgres://\``, r);
      let a2 = s.get("api_key");
      if (a2 === null || a2.length < 1) throw new ur(`Error validating datasource \`${t}\`: the URL must contain a valid API key`, r);
      let l = Ii(i) ? "http:" : "https:";
      process.env.TEST_CLIENT_ENGINE_REMOTE_EXECUTOR && i.searchParams.has("use_http") && (l = "http:");
      let u = new URL(i.href.replace(o, l));
      return { apiKey: a2, url: u };
    }
    __name(vl2, "vl");
    var Pl = O2(on());
    var Yn = class {
      static {
        __name(this, "Yn");
      }
      apiKey;
      tracingHelper;
      logLevel;
      logQueries;
      engineHash;
      constructor({ apiKey: r, tracingHelper: t, logLevel: n, logQueries: i, engineHash: o }) {
        this.apiKey = r, this.tracingHelper = t, this.logLevel = n, this.logQueries = i, this.engineHash = o;
      }
      build({ traceparent: r, transactionId: t } = {}) {
        let n = { Accept: "application/json", Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json", "Prisma-Engine-Hash": this.engineHash, "Prisma-Engine-Version": Pl.enginesVersion };
        this.tracingHelper.isEnabled() && (n.traceparent = r ?? this.tracingHelper.getTraceParent()), t && (n["X-Transaction-Id"] = t);
        let i = this.#e();
        return i.length > 0 && (n["X-Capture-Telemetry"] = i.join(", ")), n;
      }
      #e() {
        let r = [];
        return this.tracingHelper.isEnabled() && r.push("tracing"), this.logLevel && r.push(this.logLevel), this.logQueries && r.push("query"), r;
      }
    };
    function sf(e) {
      return e[0] * 1e3 + e[1] / 1e6;
    }
    __name(sf, "sf");
    function po(e) {
      return new Date(sf(e));
    }
    __name(po, "po");
    var Br = class extends oe {
      static {
        __name(this, "Br");
      }
      name = "ForcedRetryError";
      code = "P5001";
      constructor(r) {
        super("This request must be retried", R(r, true));
      }
    };
    x2(Br, "ForcedRetryError");
    var cr = class extends oe {
      static {
        __name(this, "cr");
      }
      name = "NotImplementedYetError";
      code = "P5004";
      constructor(r, t) {
        super(r, R(t, false));
      }
    };
    x2(cr, "NotImplementedYetError");
    var $2 = class extends oe {
      static {
        __name(this, "$");
      }
      response;
      constructor(r, t) {
        super(r, t), this.response = t.response;
        let n = this.response.headers.get("prisma-request-id");
        if (n) {
          let i = `(The request id was: ${n})`;
          this.message = this.message + " " + i;
        }
      }
    };
    var pr = class extends $2 {
      static {
        __name(this, "pr");
      }
      name = "SchemaMissingError";
      code = "P5005";
      constructor(r) {
        super("Schema needs to be uploaded", R(r, true));
      }
    };
    x2(pr, "SchemaMissingError");
    var mo = "This request could not be understood by the server";
    var Rt = class extends $2 {
      static {
        __name(this, "Rt");
      }
      name = "BadRequestError";
      code = "P5000";
      constructor(r, t, n) {
        super(t || mo, R(r, false)), n && (this.code = n);
      }
    };
    x2(Rt, "BadRequestError");
    var At2 = class extends $2 {
      static {
        __name(this, "At");
      }
      name = "HealthcheckTimeoutError";
      code = "P5013";
      logs;
      constructor(r, t) {
        super("Engine not started: healthcheck timeout", R(r, true)), this.logs = t;
      }
    };
    x2(At2, "HealthcheckTimeoutError");
    var Ct = class extends $2 {
      static {
        __name(this, "Ct");
      }
      name = "EngineStartupError";
      code = "P5014";
      logs;
      constructor(r, t, n) {
        super(t, R(r, true)), this.logs = n;
      }
    };
    x2(Ct, "EngineStartupError");
    var It = class extends $2 {
      static {
        __name(this, "It");
      }
      name = "EngineVersionNotSupportedError";
      code = "P5012";
      constructor(r) {
        super("Engine version is not supported", R(r, false));
      }
    };
    x2(It, "EngineVersionNotSupportedError");
    var fo = "Request timed out";
    var Dt = class extends $2 {
      static {
        __name(this, "Dt");
      }
      name = "GatewayTimeoutError";
      code = "P5009";
      constructor(r, t = fo) {
        super(t, R(r, false));
      }
    };
    x2(Dt, "GatewayTimeoutError");
    var af = "Interactive transaction error";
    var Ot = class extends $2 {
      static {
        __name(this, "Ot");
      }
      name = "InteractiveTransactionError";
      code = "P5015";
      constructor(r, t = af) {
        super(t, R(r, false));
      }
    };
    x2(Ot, "InteractiveTransactionError");
    var lf = "Request parameters are invalid";
    var kt = class extends $2 {
      static {
        __name(this, "kt");
      }
      name = "InvalidRequestError";
      code = "P5011";
      constructor(r, t = lf) {
        super(t, R(r, false));
      }
    };
    x2(kt, "InvalidRequestError");
    var go2 = "Requested resource does not exist";
    var _t3 = class extends $2 {
      static {
        __name(this, "_t");
      }
      name = "NotFoundError";
      code = "P5003";
      constructor(r, t = go2) {
        super(t, R(r, false));
      }
    };
    x2(_t3, "NotFoundError");
    var ho = "Unknown server error";
    var Ur = class extends $2 {
      static {
        __name(this, "Ur");
      }
      name = "ServerError";
      code = "P5006";
      logs;
      constructor(r, t, n) {
        super(t || ho, R(r, true)), this.logs = n;
      }
    };
    x2(Ur, "ServerError");
    var yo2 = "Unauthorized, check your connection string";
    var Nt = class extends $2 {
      static {
        __name(this, "Nt");
      }
      name = "UnauthorizedError";
      code = "P5007";
      constructor(r, t = yo2) {
        super(t, R(r, false));
      }
    };
    x2(Nt, "UnauthorizedError");
    var bo2 = "Usage exceeded, retry again later";
    var Lt = class extends $2 {
      static {
        __name(this, "Lt");
      }
      name = "UsageExceededError";
      code = "P5008";
      constructor(r, t = bo2) {
        super(t, R(r, true));
      }
    };
    x2(Lt, "UsageExceededError");
    async function uf(e) {
      let r;
      try {
        r = await e.text();
      } catch {
        return { type: "EmptyError" };
      }
      try {
        let t = JSON.parse(r);
        if (typeof t == "string") switch (t) {
          case "InternalDataProxyError":
            return { type: "DataProxyError", body: t };
          default:
            return { type: "UnknownTextError", body: t };
        }
        if (typeof t == "object" && t !== null) {
          if ("is_panic" in t && "message" in t && "error_code" in t) return { type: "QueryEngineError", body: t };
          if ("EngineNotStarted" in t || "InteractiveTransactionMisrouted" in t || "InvalidRequestError" in t) {
            let n = Object.values(t)[0].reason;
            return typeof n == "string" && !["SchemaMissing", "EngineVersionNotSupported"].includes(n) ? { type: "UnknownJsonError", body: t } : { type: "DataProxyError", body: t };
          }
        }
        return { type: "UnknownJsonError", body: t };
      } catch {
        return r === "" ? { type: "EmptyError" } : { type: "UnknownTextError", body: r };
      }
    }
    __name(uf, "uf");
    async function Ft(e, r) {
      if (e.ok) return;
      let t = { clientVersion: r, response: e }, n = await uf(e);
      if (n.type === "QueryEngineError") throw new z(n.body.message, { code: n.body.error_code, clientVersion: r });
      if (n.type === "DataProxyError") {
        if (n.body === "InternalDataProxyError") throw new Ur(t, "Internal Data Proxy error");
        if ("EngineNotStarted" in n.body) {
          if (n.body.EngineNotStarted.reason === "SchemaMissing") return new pr(t);
          if (n.body.EngineNotStarted.reason === "EngineVersionNotSupported") throw new It(t);
          if ("EngineStartupError" in n.body.EngineNotStarted.reason) {
            let { msg: i, logs: o } = n.body.EngineNotStarted.reason.EngineStartupError;
            throw new Ct(t, i, o);
          }
          if ("KnownEngineStartupError" in n.body.EngineNotStarted.reason) {
            let { msg: i, error_code: o } = n.body.EngineNotStarted.reason.KnownEngineStartupError;
            throw new P(i, r, o);
          }
          if ("HealthcheckTimeout" in n.body.EngineNotStarted.reason) {
            let { logs: i } = n.body.EngineNotStarted.reason.HealthcheckTimeout;
            throw new At2(t, i);
          }
        }
        if ("InteractiveTransactionMisrouted" in n.body) {
          let i = { IDParseError: "Could not parse interactive transaction ID", NoQueryEngineFoundError: "Could not find Query Engine for the specified host and transaction ID", TransactionStartError: "Could not start interactive transaction" };
          throw new Ot(t, i[n.body.InteractiveTransactionMisrouted.reason]);
        }
        if ("InvalidRequestError" in n.body) throw new kt(t, n.body.InvalidRequestError.reason);
      }
      if (e.status === 401 || e.status === 403) throw new Nt(t, Gr(yo2, n));
      if (e.status === 404) return new _t3(t, Gr(go2, n));
      if (e.status === 429) throw new Lt(t, Gr(bo2, n));
      if (e.status === 504) throw new Dt(t, Gr(fo, n));
      if (e.status >= 500) throw new Ur(t, Gr(ho, n));
      if (e.status >= 400) throw new Rt(t, Gr(mo, n));
    }
    __name(Ft, "Ft");
    function Gr(e, r) {
      return r.type === "EmptyError" ? e : `${e}: ${JSON.stringify(r)}`;
    }
    __name(Gr, "Gr");
    function Tl(e) {
      let r = Math.pow(2, e) * 50, t = Math.ceil(Math.random() * r) - Math.ceil(r / 2), n = r + t;
      return new Promise((i) => setTimeout(() => i(n), n));
    }
    __name(Tl, "Tl");
    var $e2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    function Sl(e) {
      let r = new TextEncoder().encode(e), t = "", n = r.byteLength, i = n % 3, o = n - i, s, a2, l, u, c;
      for (let p2 = 0; p2 < o; p2 = p2 + 3) c = r[p2] << 16 | r[p2 + 1] << 8 | r[p2 + 2], s = (c & 16515072) >> 18, a2 = (c & 258048) >> 12, l = (c & 4032) >> 6, u = c & 63, t += $e2[s] + $e2[a2] + $e2[l] + $e2[u];
      return i == 1 ? (c = r[o], s = (c & 252) >> 2, a2 = (c & 3) << 4, t += $e2[s] + $e2[a2] + "==") : i == 2 && (c = r[o] << 8 | r[o + 1], s = (c & 64512) >> 10, a2 = (c & 1008) >> 4, l = (c & 15) << 2, t += $e2[s] + $e2[a2] + $e2[l] + "="), t;
    }
    __name(Sl, "Sl");
    function Rl(e) {
      if (!!e.generator?.previewFeatures.some((t) => t.toLowerCase().includes("metrics"))) throw new P("The `metrics` preview feature is not yet available with Accelerate.\nPlease remove `metrics` from the `previewFeatures` in your schema.\n\nMore information about Accelerate: https://pris.ly/d/accelerate", e.clientVersion);
    }
    __name(Rl, "Rl");
    var Al = { "@prisma/debug": "workspace:*", "@prisma/engines-version": "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", "@prisma/fetch-engine": "workspace:*", "@prisma/get-platform": "workspace:*" };
    var Mt = class extends oe {
      static {
        __name(this, "Mt");
      }
      name = "RequestError";
      code = "P5010";
      constructor(r, t) {
        super(`Cannot fetch data from service:
${r}`, R(t, true));
      }
    };
    x2(Mt, "RequestError");
    async function dr3(e, r, t = (n) => n) {
      let { clientVersion: n, ...i } = r, o = t(fetch);
      try {
        return await o(e, i);
      } catch (s) {
        let a2 = s.message ?? "Unknown error";
        throw new Mt(a2, { clientVersion: n, cause: s });
      }
    }
    __name(dr3, "dr");
    var pf = /^[1-9][0-9]*\.[0-9]+\.[0-9]+$/;
    var Cl = N("prisma:client:dataproxyEngine");
    async function df(e, r) {
      let t = Al["@prisma/engines-version"], n = r.clientVersion ?? "unknown";
      if (process.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION || globalThis.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION) return process.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION || globalThis.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION;
      if (e.includes("accelerate") && n !== "0.0.0" && n !== "in-memory") return n;
      let [i, o] = n?.split("-") ?? [];
      if (o === void 0 && pf.test(i)) return i;
      if (o !== void 0 || n === "0.0.0" || n === "in-memory") {
        let [s] = t.split("-") ?? [], [a2, l, u] = s.split("."), c = mf(`<=${a2}.${l}.${u}`), p2 = await dr3(c, { clientVersion: n });
        if (!p2.ok) throw new Error(`Failed to fetch stable Prisma version, unpkg.com status ${p2.status} ${p2.statusText}, response body: ${await p2.text() || "<empty body>"}`);
        let d2 = await p2.text();
        Cl("length of body fetched from unpkg.com", d2.length);
        let f;
        try {
          f = JSON.parse(d2);
        } catch (h) {
          throw console.error("JSON.parse error: body fetched from unpkg.com: ", d2), h;
        }
        return f.version;
      }
      throw new cr("Only `major.minor.patch` versions are supported by Accelerate.", { clientVersion: n });
    }
    __name(df, "df");
    async function Il(e, r) {
      let t = await df(e, r);
      return Cl("version", t), t;
    }
    __name(Il, "Il");
    function mf(e) {
      return encodeURI(`https://unpkg.com/prisma@${e}/package.json`);
    }
    __name(mf, "mf");
    var Dl = 3;
    var $t = N("prisma:client:dataproxyEngine");
    var qt = class {
      static {
        __name(this, "qt");
      }
      name = "DataProxyEngine";
      inlineSchema;
      inlineSchemaHash;
      inlineDatasources;
      config;
      logEmitter;
      env;
      clientVersion;
      engineHash;
      tracingHelper;
      remoteClientVersion;
      host;
      headerBuilder;
      startPromise;
      protocol;
      constructor(r) {
        Rl(r), this.config = r, this.env = r.env, this.inlineSchema = Sl(r.inlineSchema), this.inlineDatasources = r.inlineDatasources, this.inlineSchemaHash = r.inlineSchemaHash, this.clientVersion = r.clientVersion, this.engineHash = r.engineVersion, this.logEmitter = r.logEmitter, this.tracingHelper = r.tracingHelper;
      }
      apiKey() {
        return this.headerBuilder.apiKey;
      }
      version() {
        return this.engineHash;
      }
      async start() {
        this.startPromise !== void 0 && await this.startPromise, this.startPromise = (async () => {
          let { apiKey: r, url: t } = this.getURLAndAPIKey();
          this.host = t.host, this.protocol = t.protocol, this.headerBuilder = new Yn({ apiKey: r, tracingHelper: this.tracingHelper, logLevel: this.config.logLevel ?? "error", logQueries: this.config.logQueries, engineHash: this.engineHash }), this.remoteClientVersion = await Il(this.host, this.config), $t("host", this.host), $t("protocol", this.protocol);
        })(), await this.startPromise;
      }
      async stop() {
      }
      propagateResponseExtensions(r) {
        r?.logs?.length && r.logs.forEach((t) => {
          switch (t.level) {
            case "debug":
            case "trace":
              $t(t);
              break;
            case "error":
            case "warn":
            case "info": {
              this.logEmitter.emit(t.level, { timestamp: po(t.timestamp), message: t.attributes.message ?? "", target: t.target ?? "BinaryEngine" });
              break;
            }
            case "query": {
              this.logEmitter.emit("query", { query: t.attributes.query ?? "", timestamp: po(t.timestamp), duration: t.attributes.duration_ms ?? 0, params: t.attributes.params ?? "", target: t.target ?? "BinaryEngine" });
              break;
            }
            default:
              t.level;
          }
        }), r?.traces?.length && this.tracingHelper.dispatchEngineSpans(r.traces);
      }
      onBeforeExit() {
        throw new Error('"beforeExit" hook is not applicable to the remote query engine');
      }
      async url(r) {
        return await this.start(), `${this.protocol}//${this.host}/${this.remoteClientVersion}/${this.inlineSchemaHash}/${r}`;
      }
      async uploadSchema() {
        let r = { name: "schemaUpload", internal: true };
        return this.tracingHelper.runInChildSpan(r, async () => {
          let t = await dr3(await this.url("schema"), { method: "PUT", headers: this.headerBuilder.build(), body: this.inlineSchema, clientVersion: this.clientVersion });
          t.ok || $t("schema response status", t.status);
          let n = await Ft(t, this.clientVersion);
          if (n) throw this.logEmitter.emit("warn", { message: `Error while uploading schema: ${n.message}`, timestamp: /* @__PURE__ */ new Date(), target: "" }), n;
          this.logEmitter.emit("info", { message: `Schema (re)uploaded (hash: ${this.inlineSchemaHash})`, timestamp: /* @__PURE__ */ new Date(), target: "" });
        });
      }
      request(r, { traceparent: t, interactiveTransaction: n, customDataProxyFetch: i }) {
        return this.requestInternal({ body: r, traceparent: t, interactiveTransaction: n, customDataProxyFetch: i });
      }
      async requestBatch(r, { traceparent: t, transaction: n, customDataProxyFetch: i }) {
        let o = n?.kind === "itx" ? n.options : void 0, s = Mr(r, n);
        return (await this.requestInternal({ body: s, customDataProxyFetch: i, interactiveTransaction: o, traceparent: t })).map((l) => (l.extensions && this.propagateResponseExtensions(l.extensions), "errors" in l ? this.convertProtocolErrorsToClientError(l.errors) : l));
      }
      requestInternal({ body: r, traceparent: t, customDataProxyFetch: n, interactiveTransaction: i }) {
        return this.withRetry({ actionGerund: "querying", callback: /* @__PURE__ */ __name(async ({ logHttpCall: o }) => {
          let s = i ? `${i.payload.endpoint}/graphql` : await this.url("graphql");
          o(s);
          let a2 = await dr3(s, { method: "POST", headers: this.headerBuilder.build({ traceparent: t, transactionId: i?.id }), body: JSON.stringify(r), clientVersion: this.clientVersion }, n);
          a2.ok || $t("graphql response status", a2.status), await this.handleError(await Ft(a2, this.clientVersion));
          let l = await a2.json();
          if (l.extensions && this.propagateResponseExtensions(l.extensions), "errors" in l) throw this.convertProtocolErrorsToClientError(l.errors);
          return "batchResult" in l ? l.batchResult : l;
        }, "callback") });
      }
      async transaction(r, t, n) {
        let i = { start: "starting", commit: "committing", rollback: "rolling back" };
        return this.withRetry({ actionGerund: `${i[r]} transaction`, callback: /* @__PURE__ */ __name(async ({ logHttpCall: o }) => {
          if (r === "start") {
            let s = JSON.stringify({ max_wait: n.maxWait, timeout: n.timeout, isolation_level: n.isolationLevel }), a2 = await this.url("transaction/start");
            o(a2);
            let l = await dr3(a2, { method: "POST", headers: this.headerBuilder.build({ traceparent: t.traceparent }), body: s, clientVersion: this.clientVersion });
            await this.handleError(await Ft(l, this.clientVersion));
            let u = await l.json(), { extensions: c } = u;
            c && this.propagateResponseExtensions(c);
            let p2 = u.id, d2 = u["data-proxy"].endpoint;
            return { id: p2, payload: { endpoint: d2 } };
          } else {
            let s = `${n.payload.endpoint}/${r}`;
            o(s);
            let a2 = await dr3(s, { method: "POST", headers: this.headerBuilder.build({ traceparent: t.traceparent }), clientVersion: this.clientVersion });
            await this.handleError(await Ft(a2, this.clientVersion));
            let l = await a2.json(), { extensions: u } = l;
            u && this.propagateResponseExtensions(u);
            return;
          }
        }, "callback") });
      }
      getURLAndAPIKey() {
        return vl2({ clientVersion: this.clientVersion, env: this.env, inlineDatasources: this.inlineDatasources, overrideDatasources: this.config.overrideDatasources });
      }
      metrics() {
        throw new cr("Metrics are not yet supported for Accelerate", { clientVersion: this.clientVersion });
      }
      async withRetry(r) {
        for (let t = 0; ; t++) {
          let n = /* @__PURE__ */ __name((i) => {
            this.logEmitter.emit("info", { message: `Calling ${i} (n=${t})`, timestamp: /* @__PURE__ */ new Date(), target: "" });
          }, "n");
          try {
            return await r.callback({ logHttpCall: n });
          } catch (i) {
            if (!(i instanceof oe) || !i.isRetryable) throw i;
            if (t >= Dl) throw i instanceof Br ? i.cause : i;
            this.logEmitter.emit("warn", { message: `Attempt ${t + 1}/${Dl} failed for ${r.actionGerund}: ${i.message ?? "(unknown)"}`, timestamp: /* @__PURE__ */ new Date(), target: "" });
            let o = await Tl(t);
            this.logEmitter.emit("warn", { message: `Retrying after ${o}ms`, timestamp: /* @__PURE__ */ new Date(), target: "" });
          }
        }
      }
      async handleError(r) {
        if (r instanceof pr) throw await this.uploadSchema(), new Br({ clientVersion: this.clientVersion, cause: r });
        if (r) throw r;
      }
      convertProtocolErrorsToClientError(r) {
        return r.length === 1 ? $r(r[0], this.config.clientVersion, this.config.activeProvider) : new V(JSON.stringify(r), { clientVersion: this.config.clientVersion });
      }
      applyPendingMigrations() {
        throw new Error("Method not implemented.");
      }
    };
    function Ol(e) {
      if (e?.kind === "itx") return e.options.id;
    }
    __name(Ol, "Ol");
    var wo2 = O2(__require("node:os"));
    var kl = O2(__require("node:path"));
    var Eo2 = Symbol("PrismaLibraryEngineCache");
    function ff() {
      let e = globalThis;
      return e[Eo2] === void 0 && (e[Eo2] = {}), e[Eo2];
    }
    __name(ff, "ff");
    function gf(e) {
      let r = ff();
      if (r[e] !== void 0) return r[e];
      let t = kl.default.toNamespacedPath(e), n = { exports: {} }, i = 0;
      return process.platform !== "win32" && (i = wo2.default.constants.dlopen.RTLD_LAZY | wo2.default.constants.dlopen.RTLD_DEEPBIND), process.dlopen(n, t, i), r[e] = n.exports, n.exports;
    }
    __name(gf, "gf");
    var _l = { async loadLibrary(e) {
      let r = await fi(), t = await ml("library", e);
      try {
        return e.tracingHelper.runInChildSpan({ name: "loadLibrary", internal: true }, () => gf(t));
      } catch (n) {
        let i = Ai({ e: n, platformInfo: r, id: t });
        throw new P(i, e.clientVersion);
      }
    } };
    var xo;
    var Nl = { async loadLibrary(e) {
      let { clientVersion: r, adapter: t, engineWasm: n } = e;
      if (t === void 0) throw new P(`The \`adapter\` option for \`PrismaClient\` is required in this context (${Kn().prettyName})`, r);
      if (n === void 0) throw new P("WASM engine was unexpectedly `undefined`", r);
      xo === void 0 && (xo = (async () => {
        let o = await n.getRuntime(), s = await n.getQueryEngineWasmModule();
        if (s == null) throw new P("The loaded wasm module was unexpectedly `undefined` or `null` once loaded", r);
        let a2 = { "./query_engine_bg.js": o }, l = new WebAssembly.Instance(s, a2), u = l.exports.__wbindgen_start;
        return o.__wbg_set_wasm(l.exports), u(), o.QueryEngine;
      })());
      let i = await xo;
      return { debugPanic() {
        return Promise.reject("{}");
      }, dmmf() {
        return Promise.resolve("{}");
      }, version() {
        return { commit: "unknown", version: "unknown" };
      }, QueryEngine: i };
    } };
    var hf = "P2036";
    var Re = N("prisma:client:libraryEngine");
    function yf(e) {
      return e.item_type === "query" && "query" in e;
    }
    __name(yf, "yf");
    function bf(e) {
      return "level" in e ? e.level === "error" && e.message === "PANIC" : false;
    }
    __name(bf, "bf");
    var Ll = [...li, "native"];
    var Ef = 0xffffffffffffffffn;
    var vo = 1n;
    function wf() {
      let e = vo++;
      return vo > Ef && (vo = 1n), e;
    }
    __name(wf, "wf");
    var Qr = class {
      static {
        __name(this, "Qr");
      }
      name = "LibraryEngine";
      engine;
      libraryInstantiationPromise;
      libraryStartingPromise;
      libraryStoppingPromise;
      libraryStarted;
      executingQueryPromise;
      config;
      QueryEngineConstructor;
      libraryLoader;
      library;
      logEmitter;
      libQueryEnginePath;
      binaryTarget;
      datasourceOverrides;
      datamodel;
      logQueries;
      logLevel;
      lastQuery;
      loggerRustPanic;
      tracingHelper;
      adapterPromise;
      versionInfo;
      constructor(r, t) {
        this.libraryLoader = t ?? _l, r.engineWasm !== void 0 && (this.libraryLoader = t ?? Nl), this.config = r, this.libraryStarted = false, this.logQueries = r.logQueries ?? false, this.logLevel = r.logLevel ?? "error", this.logEmitter = r.logEmitter, this.datamodel = r.inlineSchema, this.tracingHelper = r.tracingHelper, r.enableDebugLogs && (this.logLevel = "debug");
        let n = Object.keys(r.overrideDatasources)[0], i = r.overrideDatasources[n]?.url;
        n !== void 0 && i !== void 0 && (this.datasourceOverrides = { [n]: i }), this.libraryInstantiationPromise = this.instantiateLibrary();
      }
      wrapEngine(r) {
        return { applyPendingMigrations: r.applyPendingMigrations?.bind(r), commitTransaction: this.withRequestId(r.commitTransaction.bind(r)), connect: this.withRequestId(r.connect.bind(r)), disconnect: this.withRequestId(r.disconnect.bind(r)), metrics: r.metrics?.bind(r), query: this.withRequestId(r.query.bind(r)), rollbackTransaction: this.withRequestId(r.rollbackTransaction.bind(r)), sdlSchema: r.sdlSchema?.bind(r), startTransaction: this.withRequestId(r.startTransaction.bind(r)), trace: r.trace.bind(r), free: r.free?.bind(r) };
      }
      withRequestId(r) {
        return async (...t) => {
          let n = wf().toString();
          try {
            return await r(...t, n);
          } finally {
            if (this.tracingHelper.isEnabled()) {
              let i = await this.engine?.trace(n);
              if (i) {
                let o = JSON.parse(i);
                this.tracingHelper.dispatchEngineSpans(o.spans);
              }
            }
          }
        };
      }
      async applyPendingMigrations() {
        throw new Error("Cannot call this method from this type of engine instance");
      }
      async transaction(r, t, n) {
        await this.start();
        let i = await this.adapterPromise, o = JSON.stringify(t), s;
        if (r === "start") {
          let l = JSON.stringify({ max_wait: n.maxWait, timeout: n.timeout, isolation_level: n.isolationLevel });
          s = await this.engine?.startTransaction(l, o);
        } else r === "commit" ? s = await this.engine?.commitTransaction(n.id, o) : r === "rollback" && (s = await this.engine?.rollbackTransaction(n.id, o));
        let a2 = this.parseEngineResponse(s);
        if (xf(a2)) {
          let l = this.getExternalAdapterError(a2, i?.errorRegistry);
          throw l ? l.error : new z(a2.message, { code: a2.error_code, clientVersion: this.config.clientVersion, meta: a2.meta });
        } else if (typeof a2.message == "string") throw new V(a2.message, { clientVersion: this.config.clientVersion });
        return a2;
      }
      async instantiateLibrary() {
        if (Re("internalSetup"), this.libraryInstantiationPromise) return this.libraryInstantiationPromise;
        ai(), this.binaryTarget = await this.getCurrentBinaryTarget(), await this.tracingHelper.runInChildSpan("load_engine", () => this.loadEngine()), this.version();
      }
      async getCurrentBinaryTarget() {
        {
          if (this.binaryTarget) return this.binaryTarget;
          let r = await this.tracingHelper.runInChildSpan("detect_platform", () => ir());
          if (!Ll.includes(r)) throw new P(`Unknown ${ce2("PRISMA_QUERY_ENGINE_LIBRARY")} ${ce2(W(r))}. Possible binaryTargets: ${qe(Ll.join(", "))} or a path to the query engine library.
You may have to run ${qe("prisma generate")} for your changes to take effect.`, this.config.clientVersion);
          return r;
        }
      }
      parseEngineResponse(r) {
        if (!r) throw new V("Response from the Engine was empty", { clientVersion: this.config.clientVersion });
        try {
          return JSON.parse(r);
        } catch {
          throw new V("Unable to JSON.parse response from engine", { clientVersion: this.config.clientVersion });
        }
      }
      async loadEngine() {
        if (!this.engine) {
          this.QueryEngineConstructor || (this.library = await this.libraryLoader.loadLibrary(this.config), this.QueryEngineConstructor = this.library.QueryEngine);
          try {
            let r = new WeakRef(this);
            this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(tn));
            let t = await this.adapterPromise;
            t && Re("Using driver adapter: %O", t), this.engine = this.wrapEngine(new this.QueryEngineConstructor({ datamodel: this.datamodel, env: process.env, logQueries: this.config.logQueries ?? false, ignoreEnvVarErrors: true, datasourceOverrides: this.datasourceOverrides ?? {}, logLevel: this.logLevel, configDir: this.config.cwd, engineProtocol: "json", enableTracing: this.tracingHelper.isEnabled() }, (n) => {
              r.deref()?.logger(n);
            }, t));
          } catch (r) {
            let t = r, n = this.parseInitError(t.message);
            throw typeof n == "string" ? t : new P(n.message, this.config.clientVersion, n.error_code);
          }
        }
      }
      logger(r) {
        let t = this.parseEngineResponse(r);
        t && (t.level = t?.level.toLowerCase() ?? "unknown", yf(t) ? this.logEmitter.emit("query", { timestamp: /* @__PURE__ */ new Date(), query: t.query, params: t.params, duration: Number(t.duration_ms), target: t.module_path }) : bf(t) ? this.loggerRustPanic = new ae(Po(this, `${t.message}: ${t.reason} in ${t.file}:${t.line}:${t.column}`), this.config.clientVersion) : this.logEmitter.emit(t.level, { timestamp: /* @__PURE__ */ new Date(), message: t.message, target: t.module_path }));
      }
      parseInitError(r) {
        try {
          return JSON.parse(r);
        } catch {
        }
        return r;
      }
      parseRequestError(r) {
        try {
          return JSON.parse(r);
        } catch {
        }
        return r;
      }
      onBeforeExit() {
        throw new Error('"beforeExit" hook is not applicable to the library engine since Prisma 5.0.0, it is only relevant and implemented for the binary engine. Please add your event listener to the `process` object directly instead.');
      }
      async start() {
        if (this.libraryInstantiationPromise || (this.libraryInstantiationPromise = this.instantiateLibrary()), await this.libraryInstantiationPromise, await this.libraryStoppingPromise, this.libraryStartingPromise) return Re(`library already starting, this.libraryStarted: ${this.libraryStarted}`), this.libraryStartingPromise;
        if (this.libraryStarted) return;
        let r = /* @__PURE__ */ __name(async () => {
          Re("library starting");
          try {
            let t = { traceparent: this.tracingHelper.getTraceParent() };
            await this.engine?.connect(JSON.stringify(t)), this.libraryStarted = true, this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(tn)), await this.adapterPromise, Re("library started");
          } catch (t) {
            let n = this.parseInitError(t.message);
            throw typeof n == "string" ? t : new P(n.message, this.config.clientVersion, n.error_code);
          } finally {
            this.libraryStartingPromise = void 0;
          }
        }, "r");
        return this.libraryStartingPromise = this.tracingHelper.runInChildSpan("connect", r), this.libraryStartingPromise;
      }
      async stop() {
        if (await this.libraryInstantiationPromise, await this.libraryStartingPromise, await this.executingQueryPromise, this.libraryStoppingPromise) return Re("library is already stopping"), this.libraryStoppingPromise;
        if (!this.libraryStarted) {
          await (await this.adapterPromise)?.dispose(), this.adapterPromise = void 0;
          return;
        }
        let r = /* @__PURE__ */ __name(async () => {
          await new Promise((n) => setImmediate(n)), Re("library stopping");
          let t = { traceparent: this.tracingHelper.getTraceParent() };
          await this.engine?.disconnect(JSON.stringify(t)), this.engine?.free && this.engine.free(), this.engine = void 0, this.libraryStarted = false, this.libraryStoppingPromise = void 0, this.libraryInstantiationPromise = void 0, await (await this.adapterPromise)?.dispose(), this.adapterPromise = void 0, Re("library stopped");
        }, "r");
        return this.libraryStoppingPromise = this.tracingHelper.runInChildSpan("disconnect", r), this.libraryStoppingPromise;
      }
      version() {
        return this.versionInfo = this.library?.version(), this.versionInfo?.version ?? "unknown";
      }
      debugPanic(r) {
        return this.library?.debugPanic(r);
      }
      async request(r, { traceparent: t, interactiveTransaction: n }) {
        Re(`sending request, this.libraryStarted: ${this.libraryStarted}`);
        let i = JSON.stringify({ traceparent: t }), o = JSON.stringify(r);
        try {
          await this.start();
          let s = await this.adapterPromise;
          this.executingQueryPromise = this.engine?.query(o, i, n?.id), this.lastQuery = o;
          let a2 = this.parseEngineResponse(await this.executingQueryPromise);
          if (a2.errors) throw a2.errors.length === 1 ? this.buildQueryError(a2.errors[0], s?.errorRegistry) : new V(JSON.stringify(a2.errors), { clientVersion: this.config.clientVersion });
          if (this.loggerRustPanic) throw this.loggerRustPanic;
          return { data: a2 };
        } catch (s) {
          if (s instanceof P) throw s;
          if (s.code === "GenericFailure" && s.message?.startsWith("PANIC:")) throw new ae(Po(this, s.message), this.config.clientVersion);
          let a2 = this.parseRequestError(s.message);
          throw typeof a2 == "string" ? s : new V(`${a2.message}
${a2.backtrace}`, { clientVersion: this.config.clientVersion });
        }
      }
      async requestBatch(r, { transaction: t, traceparent: n }) {
        Re("requestBatch");
        let i = Mr(r, t);
        await this.start();
        let o = await this.adapterPromise;
        this.lastQuery = JSON.stringify(i), this.executingQueryPromise = this.engine?.query(this.lastQuery, JSON.stringify({ traceparent: n }), Ol(t));
        let s = await this.executingQueryPromise, a2 = this.parseEngineResponse(s);
        if (a2.errors) throw a2.errors.length === 1 ? this.buildQueryError(a2.errors[0], o?.errorRegistry) : new V(JSON.stringify(a2.errors), { clientVersion: this.config.clientVersion });
        let { batchResult: l, errors: u } = a2;
        if (Array.isArray(l)) return l.map((c) => c.errors && c.errors.length > 0 ? this.loggerRustPanic ?? this.buildQueryError(c.errors[0], o?.errorRegistry) : { data: c });
        throw u && u.length === 1 ? new Error(u[0].error) : new Error(JSON.stringify(a2));
      }
      buildQueryError(r, t) {
        if (r.user_facing_error.is_panic) return new ae(Po(this, r.user_facing_error.message), this.config.clientVersion);
        let n = this.getExternalAdapterError(r.user_facing_error, t);
        return n ? n.error : $r(r, this.config.clientVersion, this.config.activeProvider);
      }
      getExternalAdapterError(r, t) {
        if (r.error_code === hf && t) {
          let n = r.meta?.id;
          ln2(typeof n == "number", "Malformed external JS error received from the engine");
          let i = t.consumeError(n);
          return ln2(i, "External error with reported id was not registered"), i;
        }
      }
      async metrics(r) {
        await this.start();
        let t = await this.engine.metrics(JSON.stringify(r));
        return r.format === "prometheus" ? t : this.parseEngineResponse(t);
      }
    };
    function xf(e) {
      return typeof e == "object" && e !== null && e.error_code !== void 0;
    }
    __name(xf, "xf");
    function Po(e, r) {
      return El({ binaryTarget: e.binaryTarget, title: r, version: e.config.clientVersion, engineVersion: e.versionInfo?.commit, database: e.config.activeProvider, query: e.lastQuery });
    }
    __name(Po, "Po");
    function Fl({ url: e, adapter: r, copyEngine: t, targetBuildType: n }) {
      let i = [], o = [], s = /* @__PURE__ */ __name((g) => {
        i.push({ _tag: "warning", value: g });
      }, "s"), a2 = /* @__PURE__ */ __name((g) => {
        let I = g.join(`
`);
        o.push({ _tag: "error", value: I });
      }, "a"), l = !!e?.startsWith("prisma://"), u = an(e), c = !!r, p2 = l || u;
      !c && t && p2 && n !== "client" && n !== "wasm-compiler-edge" && s(["recommend--no-engine", "In production, we recommend using `prisma generate --no-engine` (See: `prisma generate --help`)"]);
      let d2 = p2 || !t;
      c && (d2 || n === "edge") && (n === "edge" ? a2(["Prisma Client was configured to use the `adapter` option but it was imported via its `/edge` endpoint.", "Please either remove the `/edge` endpoint or remove the `adapter` from the Prisma Client constructor."]) : p2 ? a2(["You've provided both a driver adapter and an Accelerate database URL. Driver adapters currently cannot connect to Accelerate.", "Please provide either a driver adapter with a direct database URL or an Accelerate URL and no driver adapter."]) : t || a2(["Prisma Client was configured to use the `adapter` option but `prisma generate` was run with `--no-engine`.", "Please run `prisma generate` without `--no-engine` to be able to use Prisma Client with the adapter."]));
      let f = { accelerate: d2, ppg: u, driverAdapters: c };
      function h(g) {
        return g.length > 0;
      }
      __name(h, "h");
      return h(o) ? { ok: false, diagnostics: { warnings: i, errors: o }, isUsing: f } : { ok: true, diagnostics: { warnings: i }, isUsing: f };
    }
    __name(Fl, "Fl");
    function Ml({ copyEngine: e = true }, r) {
      let t;
      try {
        t = jr({ inlineDatasources: r.inlineDatasources, overrideDatasources: r.overrideDatasources, env: { ...r.env, ...process.env }, clientVersion: r.clientVersion });
      } catch {
      }
      let { ok: n, isUsing: i, diagnostics: o } = Fl({ url: t, adapter: r.adapter, copyEngine: e, targetBuildType: "library" });
      for (let p2 of o.warnings) at(...p2.value);
      if (!n) {
        let p2 = o.errors[0];
        throw new Z(p2.value, { clientVersion: r.clientVersion });
      }
      let s = Er2(r.generator), a2 = s === "library", l = s === "binary", u = s === "client", c = (i.accelerate || i.ppg) && !i.driverAdapters;
      return i.accelerate ? new qt(r) : (i.driverAdapters, a2 ? new Qr(r) : new Qr(r));
    }
    __name(Ml, "Ml");
    function $l({ generator: e }) {
      return e?.previewFeatures ?? [];
    }
    __name($l, "$l");
    var ql = /* @__PURE__ */ __name((e) => ({ command: e }), "ql");
    var Vl = /* @__PURE__ */ __name((e) => e.strings.reduce((r, t, n) => `${r}@P${n}${t}`), "Vl");
    function Wr(e) {
      try {
        return jl(e, "fast");
      } catch {
        return jl(e, "slow");
      }
    }
    __name(Wr, "Wr");
    function jl(e, r) {
      return JSON.stringify(e.map((t) => Ul(t, r)));
    }
    __name(jl, "jl");
    function Ul(e, r) {
      if (Array.isArray(e)) return e.map((t) => Ul(t, r));
      if (typeof e == "bigint") return { prisma__type: "bigint", prisma__value: e.toString() };
      if (vr2(e)) return { prisma__type: "date", prisma__value: e.toJSON() };
      if (Fe2.isDecimal(e)) return { prisma__type: "decimal", prisma__value: e.toJSON() };
      if (Buffer.isBuffer(e)) return { prisma__type: "bytes", prisma__value: e.toString("base64") };
      if (vf(e)) return { prisma__type: "bytes", prisma__value: Buffer.from(e).toString("base64") };
      if (ArrayBuffer.isView(e)) {
        let { buffer: t, byteOffset: n, byteLength: i } = e;
        return { prisma__type: "bytes", prisma__value: Buffer.from(t, n, i).toString("base64") };
      }
      return typeof e == "object" && r === "slow" ? Gl(e) : e;
    }
    __name(Ul, "Ul");
    function vf(e) {
      return e instanceof ArrayBuffer || e instanceof SharedArrayBuffer ? true : typeof e == "object" && e !== null ? e[Symbol.toStringTag] === "ArrayBuffer" || e[Symbol.toStringTag] === "SharedArrayBuffer" : false;
    }
    __name(vf, "vf");
    function Gl(e) {
      if (typeof e != "object" || e === null) return e;
      if (typeof e.toJSON == "function") return e.toJSON();
      if (Array.isArray(e)) return e.map(Bl);
      let r = {};
      for (let t of Object.keys(e)) r[t] = Bl(e[t]);
      return r;
    }
    __name(Gl, "Gl");
    function Bl(e) {
      return typeof e == "bigint" ? e.toString() : Gl(e);
    }
    __name(Bl, "Bl");
    var Pf = /^(\s*alter\s)/i;
    var Ql = N("prisma:client");
    function To(e, r, t, n) {
      if (!(e !== "postgresql" && e !== "cockroachdb") && t.length > 0 && Pf.exec(r)) throw new Error(`Running ALTER using ${n} is not supported
Using the example below you can still execute your query with Prisma, but please note that it is vulnerable to SQL injection attacks and requires you to take care of input sanitization.

Example:
  await prisma.$executeRawUnsafe(\`ALTER USER prisma WITH PASSWORD '\${password}'\`)

More Information: https://pris.ly/d/execute-raw
`);
    }
    __name(To, "To");
    var So2 = /* @__PURE__ */ __name(({ clientMethod: e, activeProvider: r }) => (t) => {
      let n = "", i;
      if (Vn(t)) n = t.sql, i = { values: Wr(t.values), __prismaRawParameters__: true };
      else if (Array.isArray(t)) {
        let [o, ...s] = t;
        n = o, i = { values: Wr(s || []), __prismaRawParameters__: true };
      } else switch (r) {
        case "sqlite":
        case "mysql": {
          n = t.sql, i = { values: Wr(t.values), __prismaRawParameters__: true };
          break;
        }
        case "cockroachdb":
        case "postgresql":
        case "postgres": {
          n = t.text, i = { values: Wr(t.values), __prismaRawParameters__: true };
          break;
        }
        case "sqlserver": {
          n = Vl(t), i = { values: Wr(t.values), __prismaRawParameters__: true };
          break;
        }
        default:
          throw new Error(`The ${r} provider does not support ${e}`);
      }
      return i?.values ? Ql(`prisma.${e}(${n}, ${i.values})`) : Ql(`prisma.${e}(${n})`), { query: n, parameters: i };
    }, "So");
    var Wl = { requestArgsToMiddlewareArgs(e) {
      return [e.strings, ...e.values];
    }, middlewareArgsToRequestArgs(e) {
      let [r, ...t] = e;
      return new ie2(r, t);
    } };
    var Jl = { requestArgsToMiddlewareArgs(e) {
      return [e];
    }, middlewareArgsToRequestArgs(e) {
      return e[0];
    } };
    function Ro(e) {
      return function(t, n) {
        let i, o = /* @__PURE__ */ __name((s = e) => {
          try {
            return s === void 0 || s?.kind === "itx" ? i ??= Kl(t(s)) : Kl(t(s));
          } catch (a2) {
            return Promise.reject(a2);
          }
        }, "o");
        return { get spec() {
          return n;
        }, then(s, a2) {
          return o().then(s, a2);
        }, catch(s) {
          return o().catch(s);
        }, finally(s) {
          return o().finally(s);
        }, requestTransaction(s) {
          let a2 = o(s);
          return a2.requestTransaction ? a2.requestTransaction(s) : a2;
        }, [Symbol.toStringTag]: "PrismaPromise" };
      };
    }
    __name(Ro, "Ro");
    function Kl(e) {
      return typeof e.then == "function" ? e : Promise.resolve(e);
    }
    __name(Kl, "Kl");
    var Tf = xi2.split(".")[0];
    var Sf = { isEnabled() {
      return false;
    }, getTraceParent() {
      return "00-10-10-00";
    }, dispatchEngineSpans() {
    }, getActiveContext() {
    }, runInChildSpan(e, r) {
      return r();
    } };
    var Ao2 = class {
      static {
        __name(this, "Ao");
      }
      isEnabled() {
        return this.getGlobalTracingHelper().isEnabled();
      }
      getTraceParent(r) {
        return this.getGlobalTracingHelper().getTraceParent(r);
      }
      dispatchEngineSpans(r) {
        return this.getGlobalTracingHelper().dispatchEngineSpans(r);
      }
      getActiveContext() {
        return this.getGlobalTracingHelper().getActiveContext();
      }
      runInChildSpan(r, t) {
        return this.getGlobalTracingHelper().runInChildSpan(r, t);
      }
      getGlobalTracingHelper() {
        let r = globalThis[`V${Tf}_PRISMA_INSTRUMENTATION`], t = globalThis.PRISMA_INSTRUMENTATION;
        return r?.helper ?? t?.helper ?? Sf;
      }
    };
    function Hl() {
      return new Ao2();
    }
    __name(Hl, "Hl");
    function Yl(e, r = () => {
    }) {
      let t, n = new Promise((i) => t = i);
      return { then(i) {
        return --e === 0 && t(r()), i?.(n);
      } };
    }
    __name(Yl, "Yl");
    function zl(e) {
      return typeof e == "string" ? e : e.reduce((r, t) => {
        let n = typeof t == "string" ? t : t.level;
        return n === "query" ? r : r && (t === "info" || r === "info") ? "info" : n;
      }, void 0);
    }
    __name(zl, "zl");
    function zn(e) {
      return typeof e.batchRequestIdx == "number";
    }
    __name(zn, "zn");
    function Zl(e) {
      if (e.action !== "findUnique" && e.action !== "findUniqueOrThrow") return;
      let r = [];
      return e.modelName && r.push(e.modelName), e.query.arguments && r.push(Co2(e.query.arguments)), r.push(Co2(e.query.selection)), r.join("");
    }
    __name(Zl, "Zl");
    function Co2(e) {
      return `(${Object.keys(e).sort().map((t) => {
        let n = e[t];
        return typeof n == "object" && n !== null ? `(${t} ${Co2(n)})` : t;
      }).join(" ")})`;
    }
    __name(Co2, "Co");
    var Rf = { aggregate: false, aggregateRaw: false, createMany: true, createManyAndReturn: true, createOne: true, deleteMany: true, deleteOne: true, executeRaw: true, findFirst: false, findFirstOrThrow: false, findMany: false, findRaw: false, findUnique: false, findUniqueOrThrow: false, groupBy: false, queryRaw: false, runCommandRaw: true, updateMany: true, updateManyAndReturn: true, updateOne: true, upsertOne: true };
    function Io2(e) {
      return Rf[e];
    }
    __name(Io2, "Io");
    var Zn = class {
      static {
        __name(this, "Zn");
      }
      constructor(r) {
        this.options = r;
        this.batches = {};
      }
      batches;
      tickActive = false;
      request(r) {
        let t = this.options.batchBy(r);
        return t ? (this.batches[t] || (this.batches[t] = [], this.tickActive || (this.tickActive = true, process.nextTick(() => {
          this.dispatchBatches(), this.tickActive = false;
        }))), new Promise((n, i) => {
          this.batches[t].push({ request: r, resolve: n, reject: i });
        })) : this.options.singleLoader(r);
      }
      dispatchBatches() {
        for (let r in this.batches) {
          let t = this.batches[r];
          delete this.batches[r], t.length === 1 ? this.options.singleLoader(t[0].request).then((n) => {
            n instanceof Error ? t[0].reject(n) : t[0].resolve(n);
          }).catch((n) => {
            t[0].reject(n);
          }) : (t.sort((n, i) => this.options.batchOrder(n.request, i.request)), this.options.batchLoader(t.map((n) => n.request)).then((n) => {
            if (n instanceof Error) for (let i = 0; i < t.length; i++) t[i].reject(n);
            else for (let i = 0; i < t.length; i++) {
              let o = n[i];
              o instanceof Error ? t[i].reject(o) : t[i].resolve(o);
            }
          }).catch((n) => {
            for (let i = 0; i < t.length; i++) t[i].reject(n);
          }));
        }
      }
      get [Symbol.toStringTag]() {
        return "DataLoader";
      }
    };
    function mr2(e, r) {
      if (r === null) return r;
      switch (e) {
        case "bigint":
          return BigInt(r);
        case "bytes": {
          let { buffer: t, byteOffset: n, byteLength: i } = Buffer.from(r, "base64");
          return new Uint8Array(t, n, i);
        }
        case "decimal":
          return new Fe2(r);
        case "datetime":
        case "date":
          return new Date(r);
        case "time":
          return /* @__PURE__ */ new Date(`1970-01-01T${r}Z`);
        case "bigint-array":
          return r.map((t) => mr2("bigint", t));
        case "bytes-array":
          return r.map((t) => mr2("bytes", t));
        case "decimal-array":
          return r.map((t) => mr2("decimal", t));
        case "datetime-array":
          return r.map((t) => mr2("datetime", t));
        case "date-array":
          return r.map((t) => mr2("date", t));
        case "time-array":
          return r.map((t) => mr2("time", t));
        default:
          return r;
      }
    }
    __name(mr2, "mr");
    function Xn(e) {
      let r = [], t = Af(e);
      for (let n = 0; n < e.rows.length; n++) {
        let i = e.rows[n], o = { ...t };
        for (let s = 0; s < i.length; s++) o[e.columns[s]] = mr2(e.types[s], i[s]);
        r.push(o);
      }
      return r;
    }
    __name(Xn, "Xn");
    function Af(e) {
      let r = {};
      for (let t = 0; t < e.columns.length; t++) r[e.columns[t]] = null;
      return r;
    }
    __name(Af, "Af");
    var Cf = N("prisma:client:request_handler");
    var ei = class {
      static {
        __name(this, "ei");
      }
      client;
      dataloader;
      logEmitter;
      constructor(r, t) {
        this.logEmitter = t, this.client = r, this.dataloader = new Zn({ batchLoader: rl(async ({ requests: n, customDataProxyFetch: i }) => {
          let { transaction: o, otelParentCtx: s } = n[0], a2 = n.map((p2) => p2.protocolQuery), l = this.client._tracingHelper.getTraceParent(s), u = n.some((p2) => Io2(p2.protocolQuery.action));
          return (await this.client._engine.requestBatch(a2, { traceparent: l, transaction: If(o), containsWrite: u, customDataProxyFetch: i })).map((p2, d2) => {
            if (p2 instanceof Error) return p2;
            try {
              return this.mapQueryEngineResult(n[d2], p2);
            } catch (f) {
              return f;
            }
          });
        }), singleLoader: /* @__PURE__ */ __name(async (n) => {
          let i = n.transaction?.kind === "itx" ? Xl(n.transaction) : void 0, o = await this.client._engine.request(n.protocolQuery, { traceparent: this.client._tracingHelper.getTraceParent(), interactiveTransaction: i, isWrite: Io2(n.protocolQuery.action), customDataProxyFetch: n.customDataProxyFetch });
          return this.mapQueryEngineResult(n, o);
        }, "singleLoader"), batchBy: /* @__PURE__ */ __name((n) => n.transaction?.id ? `transaction-${n.transaction.id}` : Zl(n.protocolQuery), "batchBy"), batchOrder(n, i) {
          return n.transaction?.kind === "batch" && i.transaction?.kind === "batch" ? n.transaction.index - i.transaction.index : 0;
        } });
      }
      async request(r) {
        try {
          return await this.dataloader.request(r);
        } catch (t) {
          let { clientMethod: n, callsite: i, transaction: o, args: s, modelName: a2 } = r;
          this.handleAndLogRequestError({ error: t, clientMethod: n, callsite: i, transaction: o, args: s, modelName: a2, globalOmit: r.globalOmit });
        }
      }
      mapQueryEngineResult({ dataPath: r, unpacker: t }, n) {
        let i = n?.data, o = this.unpack(i, r, t);
        return process.env.PRISMA_CLIENT_GET_TIME ? { data: o } : o;
      }
      handleAndLogRequestError(r) {
        try {
          this.handleRequestError(r);
        } catch (t) {
          throw this.logEmitter && this.logEmitter.emit("error", { message: t.message, target: r.clientMethod, timestamp: /* @__PURE__ */ new Date() }), t;
        }
      }
      handleRequestError({ error: r, clientMethod: t, callsite: n, transaction: i, args: o, modelName: s, globalOmit: a2 }) {
        if (Cf(r), Df(r, i)) throw r;
        if (r instanceof z && Of(r)) {
          let u = eu(r.meta);
          Nn2({ args: o, errors: [u], callsite: n, errorFormat: this.client._errorFormat, originalMethod: t, clientVersion: this.client._clientVersion, globalOmit: a2 });
        }
        let l = r.message;
        if (n && (l = Tn({ callsite: n, originalMethod: t, isPanic: r.isPanic, showColors: this.client._errorFormat === "pretty", message: l })), l = this.sanitizeMessage(l), r.code) {
          let u = s ? { modelName: s, ...r.meta } : r.meta;
          throw new z(l, { code: r.code, clientVersion: this.client._clientVersion, meta: u, batchRequestIdx: r.batchRequestIdx });
        } else {
          if (r.isPanic) throw new ae(l, this.client._clientVersion);
          if (r instanceof V) throw new V(l, { clientVersion: this.client._clientVersion, batchRequestIdx: r.batchRequestIdx });
          if (r instanceof P) throw new P(l, this.client._clientVersion);
          if (r instanceof ae) throw new ae(l, this.client._clientVersion);
        }
        throw r.clientVersion = this.client._clientVersion, r;
      }
      sanitizeMessage(r) {
        return this.client._errorFormat && this.client._errorFormat !== "pretty" ? wr2(r) : r;
      }
      unpack(r, t, n) {
        if (!r || (r.data && (r = r.data), !r)) return r;
        let i = Object.keys(r)[0], o = Object.values(r)[0], s = t.filter((u) => u !== "select" && u !== "include"), a2 = ao2(o, s), l = i === "queryRaw" ? Xn(a2) : Vr(a2);
        return n ? n(l) : l;
      }
      get [Symbol.toStringTag]() {
        return "RequestHandler";
      }
    };
    function If(e) {
      if (e) {
        if (e.kind === "batch") return { kind: "batch", options: { isolationLevel: e.isolationLevel } };
        if (e.kind === "itx") return { kind: "itx", options: Xl(e) };
        ar(e, "Unknown transaction kind");
      }
    }
    __name(If, "If");
    function Xl(e) {
      return { id: e.id, payload: e.payload };
    }
    __name(Xl, "Xl");
    function Df(e, r) {
      return zn(e) && r?.kind === "batch" && e.batchRequestIdx !== r.index;
    }
    __name(Df, "Df");
    function Of(e) {
      return e.code === "P2009" || e.code === "P2012";
    }
    __name(Of, "Of");
    function eu(e) {
      if (e.kind === "Union") return { kind: "Union", errors: e.errors.map(eu) };
      if (Array.isArray(e.selectionPath)) {
        let [, ...r] = e.selectionPath;
        return { ...e, selectionPath: r };
      }
      return e;
    }
    __name(eu, "eu");
    var ru = xl;
    var su = O2(Ki2());
    var _ = class extends Error {
      static {
        __name(this, "_");
      }
      constructor(r) {
        super(r + `
Read more at https://pris.ly/d/client-constructor`), this.name = "PrismaClientConstructorValidationError";
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientConstructorValidationError";
      }
    };
    x2(_, "PrismaClientConstructorValidationError");
    var tu = ["datasources", "datasourceUrl", "errorFormat", "adapter", "log", "transactionOptions", "omit", "__internal"];
    var nu = ["pretty", "colorless", "minimal"];
    var iu = ["info", "query", "warn", "error"];
    var kf = { datasources: /* @__PURE__ */ __name((e, { datasourceNames: r }) => {
      if (e) {
        if (typeof e != "object" || Array.isArray(e)) throw new _(`Invalid value ${JSON.stringify(e)} for "datasources" provided to PrismaClient constructor`);
        for (let [t, n] of Object.entries(e)) {
          if (!r.includes(t)) {
            let i = Jr(t, r) || ` Available datasources: ${r.join(", ")}`;
            throw new _(`Unknown datasource ${t} provided to PrismaClient constructor.${i}`);
          }
          if (typeof n != "object" || Array.isArray(n)) throw new _(`Invalid value ${JSON.stringify(e)} for datasource "${t}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
          if (n && typeof n == "object") for (let [i, o] of Object.entries(n)) {
            if (i !== "url") throw new _(`Invalid value ${JSON.stringify(e)} for datasource "${t}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
            if (typeof o != "string") throw new _(`Invalid value ${JSON.stringify(o)} for datasource "${t}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
          }
        }
      }
    }, "datasources"), adapter: /* @__PURE__ */ __name((e, r) => {
      if (!e && Er2(r.generator) === "client") throw new _('Using engine type "client" requires a driver adapter to be provided to PrismaClient constructor.');
      if (e !== null) {
        if (e === void 0) throw new _('"adapter" property must not be undefined, use null to conditionally disable driver adapters.');
        if (Er2(r.generator) === "binary") throw new _('Cannot use a driver adapter with the "binary" Query Engine. Please use the "library" Query Engine.');
      }
    }, "adapter"), datasourceUrl: /* @__PURE__ */ __name((e) => {
      if (typeof e < "u" && typeof e != "string") throw new _(`Invalid value ${JSON.stringify(e)} for "datasourceUrl" provided to PrismaClient constructor.
Expected string or undefined.`);
    }, "datasourceUrl"), errorFormat: /* @__PURE__ */ __name((e) => {
      if (e) {
        if (typeof e != "string") throw new _(`Invalid value ${JSON.stringify(e)} for "errorFormat" provided to PrismaClient constructor.`);
        if (!nu.includes(e)) {
          let r = Jr(e, nu);
          throw new _(`Invalid errorFormat ${e} provided to PrismaClient constructor.${r}`);
        }
      }
    }, "errorFormat"), log: /* @__PURE__ */ __name((e) => {
      if (!e) return;
      if (!Array.isArray(e)) throw new _(`Invalid value ${JSON.stringify(e)} for "log" provided to PrismaClient constructor.`);
      function r(t) {
        if (typeof t == "string" && !iu.includes(t)) {
          let n = Jr(t, iu);
          throw new _(`Invalid log level "${t}" provided to PrismaClient constructor.${n}`);
        }
      }
      __name(r, "r");
      for (let t of e) {
        r(t);
        let n = { level: r, emit: /* @__PURE__ */ __name((i) => {
          let o = ["stdout", "event"];
          if (!o.includes(i)) {
            let s = Jr(i, o);
            throw new _(`Invalid value ${JSON.stringify(i)} for "emit" in logLevel provided to PrismaClient constructor.${s}`);
          }
        }, "emit") };
        if (t && typeof t == "object") for (let [i, o] of Object.entries(t)) if (n[i]) n[i](o);
        else throw new _(`Invalid property ${i} for "log" provided to PrismaClient constructor`);
      }
    }, "log"), transactionOptions: /* @__PURE__ */ __name((e) => {
      if (!e) return;
      let r = e.maxWait;
      if (r != null && r <= 0) throw new _(`Invalid value ${r} for maxWait in "transactionOptions" provided to PrismaClient constructor. maxWait needs to be greater than 0`);
      let t = e.timeout;
      if (t != null && t <= 0) throw new _(`Invalid value ${t} for timeout in "transactionOptions" provided to PrismaClient constructor. timeout needs to be greater than 0`);
    }, "transactionOptions"), omit: /* @__PURE__ */ __name((e, r) => {
      if (typeof e != "object") throw new _('"omit" option is expected to be an object.');
      if (e === null) throw new _('"omit" option can not be `null`');
      let t = [];
      for (let [n, i] of Object.entries(e)) {
        let o = Nf(n, r.runtimeDataModel);
        if (!o) {
          t.push({ kind: "UnknownModel", modelKey: n });
          continue;
        }
        for (let [s, a2] of Object.entries(i)) {
          let l = o.fields.find((u) => u.name === s);
          if (!l) {
            t.push({ kind: "UnknownField", modelKey: n, fieldName: s });
            continue;
          }
          if (l.relationName) {
            t.push({ kind: "RelationInOmit", modelKey: n, fieldName: s });
            continue;
          }
          typeof a2 != "boolean" && t.push({ kind: "InvalidFieldValue", modelKey: n, fieldName: s });
        }
      }
      if (t.length > 0) throw new _(Lf(e, t));
    }, "omit"), __internal: /* @__PURE__ */ __name((e) => {
      if (!e) return;
      let r = ["debug", "engine", "configOverride"];
      if (typeof e != "object") throw new _(`Invalid value ${JSON.stringify(e)} for "__internal" to PrismaClient constructor`);
      for (let [t] of Object.entries(e)) if (!r.includes(t)) {
        let n = Jr(t, r);
        throw new _(`Invalid property ${JSON.stringify(t)} for "__internal" provided to PrismaClient constructor.${n}`);
      }
    }, "__internal") };
    function au(e, r) {
      for (let [t, n] of Object.entries(e)) {
        if (!tu.includes(t)) {
          let i = Jr(t, tu);
          throw new _(`Unknown property ${t} provided to PrismaClient constructor.${i}`);
        }
        kf[t](n, r);
      }
      if (e.datasourceUrl && e.datasources) throw new _('Can not use "datasourceUrl" and "datasources" options at the same time. Pick one of them');
    }
    __name(au, "au");
    function Jr(e, r) {
      if (r.length === 0 || typeof e != "string") return "";
      let t = _f(e, r);
      return t ? ` Did you mean "${t}"?` : "";
    }
    __name(Jr, "Jr");
    function _f(e, r) {
      if (r.length === 0) return null;
      let t = r.map((i) => ({ value: i, distance: (0, su.default)(e, i) }));
      t.sort((i, o) => i.distance < o.distance ? -1 : 1);
      let n = t[0];
      return n.distance < 3 ? n.value : null;
    }
    __name(_f, "_f");
    function Nf(e, r) {
      return ou(r.models, e) ?? ou(r.types, e);
    }
    __name(Nf, "Nf");
    function ou(e, r) {
      let t = Object.keys(e).find((n) => We(n) === r);
      if (t) return e[t];
    }
    __name(ou, "ou");
    function Lf(e, r) {
      let t = _r(e);
      for (let o of r) switch (o.kind) {
        case "UnknownModel":
          t.arguments.getField(o.modelKey)?.markAsError(), t.addErrorMessage(() => `Unknown model name: ${o.modelKey}.`);
          break;
        case "UnknownField":
          t.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(), t.addErrorMessage(() => `Model "${o.modelKey}" does not have a field named "${o.fieldName}".`);
          break;
        case "RelationInOmit":
          t.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(), t.addErrorMessage(() => 'Relations are already excluded by default and can not be specified in "omit".');
          break;
        case "InvalidFieldValue":
          t.arguments.getDeepFieldValue([o.modelKey, o.fieldName])?.markAsError(), t.addErrorMessage(() => "Omit field option value must be a boolean.");
          break;
      }
      let { message: n, args: i } = _n(t, "colorless");
      return `Error validating "omit" option:

${i}

${n}`;
    }
    __name(Lf, "Lf");
    function lu(e) {
      return e.length === 0 ? Promise.resolve([]) : new Promise((r, t) => {
        let n = new Array(e.length), i = null, o = false, s = 0, a2 = /* @__PURE__ */ __name(() => {
          o || (s++, s === e.length && (o = true, i ? t(i) : r(n)));
        }, "a"), l = /* @__PURE__ */ __name((u) => {
          o || (o = true, t(u));
        }, "l");
        for (let u = 0; u < e.length; u++) e[u].then((c) => {
          n[u] = c, a2();
        }, (c) => {
          if (!zn(c)) {
            l(c);
            return;
          }
          c.batchRequestIdx === u ? l(c) : (i || (i = c), a2());
        });
      });
    }
    __name(lu, "lu");
    var rr2 = N("prisma:client");
    typeof globalThis == "object" && (globalThis.NODE_CLIENT = true);
    var Ff = { requestArgsToMiddlewareArgs: /* @__PURE__ */ __name((e) => e, "requestArgsToMiddlewareArgs"), middlewareArgsToRequestArgs: /* @__PURE__ */ __name((e) => e, "middlewareArgsToRequestArgs") };
    var Mf = Symbol.for("prisma.client.transaction.id");
    var $f = { id: 0, nextId() {
      return ++this.id;
    } };
    function fu(e) {
      class r {
        static {
          __name(this, "r");
        }
        _originalClient = this;
        _runtimeDataModel;
        _requestHandler;
        _connectionPromise;
        _disconnectionPromise;
        _engineConfig;
        _accelerateEngineConfig;
        _clientVersion;
        _errorFormat;
        _tracingHelper;
        _previewFeatures;
        _activeProvider;
        _globalOmit;
        _extensions;
        _engine;
        _appliedParent;
        _createPrismaPromise = Ro();
        constructor(n) {
          e = n?.__internal?.configOverride?.(e) ?? e, sl(e), n && au(n, e);
          let i = new du.EventEmitter().on("error", () => {
          });
          this._extensions = Nr.empty(), this._previewFeatures = $l(e), this._clientVersion = e.clientVersion ?? ru, this._activeProvider = e.activeProvider, this._globalOmit = n?.omit, this._tracingHelper = Hl();
          let o = e.relativeEnvPaths && { rootEnvPath: e.relativeEnvPaths.rootEnvPath && ri.default.resolve(e.dirname, e.relativeEnvPaths.rootEnvPath), schemaEnvPath: e.relativeEnvPaths.schemaEnvPath && ri.default.resolve(e.dirname, e.relativeEnvPaths.schemaEnvPath) }, s;
          if (n?.adapter) {
            s = n.adapter;
            let l = e.activeProvider === "postgresql" || e.activeProvider === "cockroachdb" ? "postgres" : e.activeProvider;
            if (s.provider !== l) throw new P(`The Driver Adapter \`${s.adapterName}\`, based on \`${s.provider}\`, is not compatible with the provider \`${l}\` specified in the Prisma schema.`, this._clientVersion);
            if (n.datasources || n.datasourceUrl !== void 0) throw new P("Custom datasource configuration is not compatible with Prisma Driver Adapters. Please define the database connection string directly in the Driver Adapter configuration.", this._clientVersion);
          }
          let a2 = !s && o && st(o, { conflictCheck: "none" }) || e.injectableEdgeEnv?.();
          try {
            let l = n ?? {}, u = l.__internal ?? {}, c = u.debug === true;
            c && N.enable("prisma:client");
            let p2 = ri.default.resolve(e.dirname, e.relativePath);
            mu.default.existsSync(p2) || (p2 = e.dirname), rr2("dirname", e.dirname), rr2("relativePath", e.relativePath), rr2("cwd", p2);
            let d2 = u.engine || {};
            if (l.errorFormat ? this._errorFormat = l.errorFormat : process.env.NODE_ENV === "production" ? this._errorFormat = "minimal" : process.env.NO_COLOR ? this._errorFormat = "colorless" : this._errorFormat = "colorless", this._runtimeDataModel = e.runtimeDataModel, this._engineConfig = { cwd: p2, dirname: e.dirname, enableDebugLogs: c, allowTriggerPanic: d2.allowTriggerPanic, prismaPath: d2.binaryPath ?? void 0, engineEndpoint: d2.endpoint, generator: e.generator, showColors: this._errorFormat === "pretty", logLevel: l.log && zl(l.log), logQueries: l.log && !!(typeof l.log == "string" ? l.log === "query" : l.log.find((f) => typeof f == "string" ? f === "query" : f.level === "query")), env: a2?.parsed ?? {}, flags: [], engineWasm: e.engineWasm, compilerWasm: e.compilerWasm, clientVersion: e.clientVersion, engineVersion: e.engineVersion, previewFeatures: this._previewFeatures, activeProvider: e.activeProvider, inlineSchema: e.inlineSchema, overrideDatasources: al(l, e.datasourceNames), inlineDatasources: e.inlineDatasources, inlineSchemaHash: e.inlineSchemaHash, tracingHelper: this._tracingHelper, transactionOptions: { maxWait: l.transactionOptions?.maxWait ?? 2e3, timeout: l.transactionOptions?.timeout ?? 5e3, isolationLevel: l.transactionOptions?.isolationLevel }, logEmitter: i, isBundled: e.isBundled, adapter: s }, this._accelerateEngineConfig = { ...this._engineConfig, accelerateUtils: { resolveDatasourceUrl: jr, getBatchRequestPayload: Mr, prismaGraphQLToJSError: $r, PrismaClientUnknownRequestError: V, PrismaClientInitializationError: P, PrismaClientKnownRequestError: z, debug: N("prisma:client:accelerateEngine"), engineVersion: cu.version, clientVersion: e.clientVersion } }, rr2("clientVersion", e.clientVersion), this._engine = Ml(e, this._engineConfig), this._requestHandler = new ei(this, i), l.log) for (let f of l.log) {
              let h = typeof f == "string" ? f : f.emit === "stdout" ? f.level : null;
              h && this.$on(h, (g) => {
                nt2.log(`${nt2.tags[h] ?? ""}`, g.message || g.query);
              });
            }
          } catch (l) {
            throw l.clientVersion = this._clientVersion, l;
          }
          return this._appliedParent = Pt(this);
        }
        get [Symbol.toStringTag]() {
          return "PrismaClient";
        }
        $on(n, i) {
          return n === "beforeExit" ? this._engine.onBeforeExit(i) : n && this._engineConfig.logEmitter.on(n, i), this;
        }
        $connect() {
          try {
            return this._engine.start();
          } catch (n) {
            throw n.clientVersion = this._clientVersion, n;
          }
        }
        async $disconnect() {
          try {
            await this._engine.stop();
          } catch (n) {
            throw n.clientVersion = this._clientVersion, n;
          } finally {
            Uo();
          }
        }
        $executeRawInternal(n, i, o, s) {
          let a2 = this._activeProvider;
          return this._request({ action: "executeRaw", args: o, transaction: n, clientMethod: i, argsMapper: So2({ clientMethod: i, activeProvider: a2 }), callsite: Ze(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
        }
        $executeRaw(n, ...i) {
          return this._createPrismaPromise((o) => {
            if (n.raw !== void 0 || n.sql !== void 0) {
              let [s, a2] = uu(n, i);
              return To(this._activeProvider, s.text, s.values, Array.isArray(n) ? "prisma.$executeRaw`<SQL>`" : "prisma.$executeRaw(sql`<SQL>`)"), this.$executeRawInternal(o, "$executeRaw", s, a2);
            }
            throw new Z("`$executeRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw\n", { clientVersion: this._clientVersion });
          });
        }
        $executeRawUnsafe(n, ...i) {
          return this._createPrismaPromise((o) => (To(this._activeProvider, n, i, "prisma.$executeRawUnsafe(<SQL>, [...values])"), this.$executeRawInternal(o, "$executeRawUnsafe", [n, ...i])));
        }
        $runCommandRaw(n) {
          if (e.activeProvider !== "mongodb") throw new Z(`The ${e.activeProvider} provider does not support $runCommandRaw. Use the mongodb provider.`, { clientVersion: this._clientVersion });
          return this._createPrismaPromise((i) => this._request({ args: n, clientMethod: "$runCommandRaw", dataPath: [], action: "runCommandRaw", argsMapper: ql, callsite: Ze(this._errorFormat), transaction: i }));
        }
        async $queryRawInternal(n, i, o, s) {
          let a2 = this._activeProvider;
          return this._request({ action: "queryRaw", args: o, transaction: n, clientMethod: i, argsMapper: So2({ clientMethod: i, activeProvider: a2 }), callsite: Ze(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
        }
        $queryRaw(n, ...i) {
          return this._createPrismaPromise((o) => {
            if (n.raw !== void 0 || n.sql !== void 0) return this.$queryRawInternal(o, "$queryRaw", ...uu(n, i));
            throw new Z("`$queryRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw\n", { clientVersion: this._clientVersion });
          });
        }
        $queryRawTyped(n) {
          return this._createPrismaPromise((i) => {
            if (!this._hasPreviewFlag("typedSql")) throw new Z("`typedSql` preview feature must be enabled in order to access $queryRawTyped API", { clientVersion: this._clientVersion });
            return this.$queryRawInternal(i, "$queryRawTyped", n);
          });
        }
        $queryRawUnsafe(n, ...i) {
          return this._createPrismaPromise((o) => this.$queryRawInternal(o, "$queryRawUnsafe", [n, ...i]));
        }
        _transactionWithArray({ promises: n, options: i }) {
          let o = $f.nextId(), s = Yl(n.length), a2 = n.map((l, u) => {
            if (l?.[Symbol.toStringTag] !== "PrismaPromise") throw new Error("All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function.");
            let c = i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel, p2 = { kind: "batch", id: o, index: u, isolationLevel: c, lock: s };
            return l.requestTransaction?.(p2) ?? l;
          });
          return lu(a2);
        }
        async _transactionWithCallback({ callback: n, options: i }) {
          let o = { traceparent: this._tracingHelper.getTraceParent() }, s = { maxWait: i?.maxWait ?? this._engineConfig.transactionOptions.maxWait, timeout: i?.timeout ?? this._engineConfig.transactionOptions.timeout, isolationLevel: i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel }, a2 = await this._engine.transaction("start", o, s), l;
          try {
            let u = { kind: "itx", ...a2 };
            l = await n(this._createItxClient(u)), await this._engine.transaction("commit", o, a2);
          } catch (u) {
            throw await this._engine.transaction("rollback", o, a2).catch(() => {
            }), u;
          }
          return l;
        }
        _createItxClient(n) {
          return he(Pt(he(Qa(this), [re("_appliedParent", () => this._appliedParent._createItxClient(n)), re("_createPrismaPromise", () => Ro(n)), re(Mf, () => n.id)])), [Fr(Ya)]);
        }
        $transaction(n, i) {
          let o;
          typeof n == "function" ? this._engineConfig.adapter?.adapterName === "@prisma/adapter-d1" ? o = /* @__PURE__ */ __name(() => {
            throw new Error("Cloudflare D1 does not support interactive transactions. We recommend you to refactor your queries with that limitation in mind, and use batch transactions with `prisma.$transactions([])` where applicable.");
          }, "o") : o = /* @__PURE__ */ __name(() => this._transactionWithCallback({ callback: n, options: i }), "o") : o = /* @__PURE__ */ __name(() => this._transactionWithArray({ promises: n, options: i }), "o");
          let s = { name: "transaction", attributes: { method: "$transaction" } };
          return this._tracingHelper.runInChildSpan(s, o);
        }
        _request(n) {
          n.otelParentCtx = this._tracingHelper.getActiveContext();
          let i = n.middlewareArgsMapper ?? Ff, o = { args: i.requestArgsToMiddlewareArgs(n.args), dataPath: n.dataPath, runInTransaction: !!n.transaction, action: n.action, model: n.model }, s = { operation: { name: "operation", attributes: { method: o.action, model: o.model, name: o.model ? `${o.model}.${o.action}` : o.action } } }, a2 = /* @__PURE__ */ __name(async (l) => {
            let { runInTransaction: u, args: c, ...p2 } = l, d2 = { ...n, ...p2 };
            c && (d2.args = i.middlewareArgsToRequestArgs(c)), n.transaction !== void 0 && u === false && delete d2.transaction;
            let f = await el(this, d2);
            return d2.model ? Ha({ result: f, modelName: d2.model, args: d2.args, extensions: this._extensions, runtimeDataModel: this._runtimeDataModel, globalOmit: this._globalOmit }) : f;
          }, "a");
          return this._tracingHelper.runInChildSpan(s.operation, () => new pu.AsyncResource("prisma-client-request").runInAsyncScope(() => a2(o)));
        }
        async _executeRequest({ args: n, clientMethod: i, dataPath: o, callsite: s, action: a2, model: l, argsMapper: u, transaction: c, unpacker: p2, otelParentCtx: d2, customDataProxyFetch: f }) {
          try {
            n = u ? u(n) : n;
            let h = { name: "serialize" }, g = this._tracingHelper.runInChildSpan(h, () => $n({ modelName: l, runtimeDataModel: this._runtimeDataModel, action: a2, args: n, clientMethod: i, callsite: s, extensions: this._extensions, errorFormat: this._errorFormat, clientVersion: this._clientVersion, previewFeatures: this._previewFeatures, globalOmit: this._globalOmit }));
            return N.enabled("prisma:client") && (rr2("Prisma Client call:"), rr2(`prisma.${i}(${Na(n)})`), rr2("Generated request:"), rr2(JSON.stringify(g, null, 2) + `
`)), c?.kind === "batch" && await c.lock, this._requestHandler.request({ protocolQuery: g, modelName: l, action: a2, clientMethod: i, dataPath: o, callsite: s, args: n, extensions: this._extensions, transaction: c, unpacker: p2, otelParentCtx: d2, otelChildCtx: this._tracingHelper.getActiveContext(), globalOmit: this._globalOmit, customDataProxyFetch: f });
          } catch (h) {
            throw h.clientVersion = this._clientVersion, h;
          }
        }
        $metrics = new Lr(this);
        _hasPreviewFlag(n) {
          return !!this._engineConfig.previewFeatures?.includes(n);
        }
        $applyPendingMigrations() {
          return this._engine.applyPendingMigrations();
        }
        $extends = Wa;
      }
      return r;
    }
    __name(fu, "fu");
    function uu(e, r) {
      return qf(e) ? [new ie2(e, r), Wl] : [e, Jl];
    }
    __name(uu, "uu");
    function qf(e) {
      return Array.isArray(e) && Array.isArray(e.raw);
    }
    __name(qf, "qf");
    var Vf = /* @__PURE__ */ new Set(["toJSON", "$$typeof", "asymmetricMatch", Symbol.iterator, Symbol.toStringTag, Symbol.isConcatSpreadable, Symbol.toPrimitive]);
    function gu2(e) {
      return new Proxy(e, { get(r, t) {
        if (t in r) return r[t];
        if (!Vf.has(t)) throw new TypeError(`Invalid enum value: ${String(t)}`);
      } });
    }
    __name(gu2, "gu");
    function hu(e) {
      st(e, { conflictCheck: "warn" });
    }
    __name(hu, "hu");
  }
});

// node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client/index.js
var require_client = __commonJS({
  "node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client/index.js"(exports) {
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    var {
      PrismaClientKnownRequestError: PrismaClientKnownRequestError2,
      PrismaClientUnknownRequestError: PrismaClientUnknownRequestError2,
      PrismaClientRustPanicError: PrismaClientRustPanicError2,
      PrismaClientInitializationError: PrismaClientInitializationError2,
      PrismaClientValidationError: PrismaClientValidationError2,
      getPrismaClient: getPrismaClient2,
      sqltag: sqltag2,
      empty: empty2,
      join: join2,
      raw: raw2,
      skip: skip2,
      Decimal: Decimal2,
      Debug: Debug3,
      objectEnumValues: objectEnumValues2,
      makeStrictEnum: makeStrictEnum2,
      Extensions: Extensions2,
      warnOnce: warnOnce2,
      defineDmmfProperty: defineDmmfProperty2,
      Public: Public2,
      getRuntime: getRuntime2,
      createParam: createParam2
    } = require_library();
    var Prisma = {};
    exports.Prisma = Prisma;
    exports.$Enums = {};
    Prisma.prismaVersion = {
      client: "6.19.2",
      engine: "c2990dca591cba766e3b7ef5d9e8a84796e47ab7"
    };
    Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError2;
    Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError2;
    Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError2;
    Prisma.PrismaClientInitializationError = PrismaClientInitializationError2;
    Prisma.PrismaClientValidationError = PrismaClientValidationError2;
    Prisma.Decimal = Decimal2;
    Prisma.sql = sqltag2;
    Prisma.empty = empty2;
    Prisma.join = join2;
    Prisma.raw = raw2;
    Prisma.validator = Public2.validator;
    Prisma.getExtensionContext = Extensions2.getExtensionContext;
    Prisma.defineExtension = Extensions2.defineExtension;
    Prisma.DbNull = objectEnumValues2.instances.DbNull;
    Prisma.JsonNull = objectEnumValues2.instances.JsonNull;
    Prisma.AnyNull = objectEnumValues2.instances.AnyNull;
    Prisma.NullTypes = {
      DbNull: objectEnumValues2.classes.DbNull,
      JsonNull: objectEnumValues2.classes.JsonNull,
      AnyNull: objectEnumValues2.classes.AnyNull
    };
    var path = __require("path");
    exports.Prisma.TransactionIsolationLevel = makeStrictEnum2({
      ReadUncommitted: "ReadUncommitted",
      ReadCommitted: "ReadCommitted",
      RepeatableRead: "RepeatableRead",
      Serializable: "Serializable"
    });
    exports.Prisma.UserScalarFieldEnum = {
      id: "id",
      email: "email",
      passwordHash: "passwordHash",
      firstName: "firstName",
      lastName: "lastName",
      role: "role",
      phone: "phone",
      avatarUrl: "avatarUrl",
      isActive: "isActive",
      lastLoginAt: "lastLoginAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      deletedAt: "deletedAt"
    };
    exports.Prisma.StudentProfileScalarFieldEnum = {
      id: "id",
      userId: "userId",
      rollNumber: "rollNumber",
      registrationNo: "registrationNo",
      classId: "classId",
      sectionId: "sectionId",
      status: "status",
      guardianName: "guardianName",
      guardianPhone: "guardianPhone",
      dateOfBirth: "dateOfBirth",
      gender: "gender",
      enrollmentDate: "enrollmentDate",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.TeacherProfileScalarFieldEnum = {
      id: "id",
      userId: "userId",
      employeeId: "employeeId",
      qualification: "qualification",
      specialization: "specialization",
      joiningDate: "joiningDate",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.FamilyProfileScalarFieldEnum = {
      id: "id",
      userId: "userId",
      relationship: "relationship",
      occupation: "occupation",
      address: "address",
      emergencyPhone: "emergencyPhone",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.FamilyStudentLinkScalarFieldEnum = {
      id: "id",
      familyProfileId: "familyProfileId",
      studentProfileId: "studentProfileId",
      relationship: "relationship",
      isPrimary: "isPrimary",
      isActive: "isActive",
      linkedAt: "linkedAt",
      linkedById: "linkedById",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.DepartmentScalarFieldEnum = {
      id: "id",
      name: "name",
      description: "description",
      isActive: "isActive",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.SubjectScalarFieldEnum = {
      id: "id",
      name: "name",
      code: "code",
      departmentId: "departmentId",
      description: "description",
      isActive: "isActive",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.SubjectClassLinkScalarFieldEnum = {
      id: "id",
      subjectId: "subjectId",
      classId: "classId",
      syllabus: "syllabus",
      isElective: "isElective",
      electiveGroupName: "electiveGroupName",
      isActive: "isActive",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.TeacherSubjectScalarFieldEnum = {
      id: "id",
      teacherId: "teacherId",
      subjectId: "subjectId",
      classId: "classId",
      sectionId: "sectionId",
      createdAt: "createdAt"
    };
    exports.Prisma.ClassScalarFieldEnum = {
      id: "id",
      name: "name",
      grade: "grade",
      isActive: "isActive",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.SectionScalarFieldEnum = {
      id: "id",
      name: "name",
      classId: "classId",
      classTeacherId: "classTeacherId",
      isActive: "isActive",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.TagScalarFieldEnum = {
      id: "id",
      name: "name",
      category: "category",
      createdAt: "createdAt"
    };
    exports.Prisma.QuestionScalarFieldEnum = {
      id: "id",
      subjectId: "subjectId",
      classId: "classId",
      createdById: "createdById",
      type: "type",
      title: "title",
      description: "description",
      imageUrl: "imageUrl",
      difficulty: "difficulty",
      marks: "marks",
      expectedTime: "expectedTime",
      modelAnswer: "modelAnswer",
      gradingRubric: "gradingRubric",
      explanation: "explanation",
      isActive: "isActive",
      usageCount: "usageCount",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      deletedAt: "deletedAt"
    };
    exports.Prisma.McqOptionScalarFieldEnum = {
      id: "id",
      questionId: "questionId",
      label: "label",
      text: "text",
      imageUrl: "imageUrl",
      isCorrect: "isCorrect",
      sortOrder: "sortOrder",
      createdAt: "createdAt"
    };
    exports.Prisma.QuestionTagScalarFieldEnum = {
      id: "id",
      questionId: "questionId",
      tagId: "tagId",
      createdAt: "createdAt"
    };
    exports.Prisma.ExamScalarFieldEnum = {
      id: "id",
      title: "title",
      description: "description",
      subjectId: "subjectId",
      createdById: "createdById",
      academicSessionId: "academicSessionId",
      type: "type",
      status: "status",
      deliveryMode: "deliveryMode",
      totalMarks: "totalMarks",
      passingMarks: "passingMarks",
      duration: "duration",
      scheduledStartAt: "scheduledStartAt",
      scheduledEndAt: "scheduledEndAt",
      instructions: "instructions",
      shuffleQuestions: "shuffleQuestions",
      showResultAfter: "showResultAfter",
      allowReview: "allowReview",
      maxAttempts: "maxAttempts",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      deletedAt: "deletedAt"
    };
    exports.Prisma.ExamQuestionScalarFieldEnum = {
      id: "id",
      examId: "examId",
      questionId: "questionId",
      sortOrder: "sortOrder",
      marks: "marks",
      isRequired: "isRequired",
      createdAt: "createdAt"
    };
    exports.Prisma.ExamClassAssignmentScalarFieldEnum = {
      id: "id",
      examId: "examId",
      classId: "classId",
      sectionId: "sectionId",
      createdAt: "createdAt"
    };
    exports.Prisma.ExamSessionScalarFieldEnum = {
      id: "id",
      examId: "examId",
      studentId: "studentId",
      attemptNumber: "attemptNumber",
      status: "status",
      startedAt: "startedAt",
      submittedAt: "submittedAt",
      timeSpent: "timeSpent",
      ipAddress: "ipAddress",
      userAgent: "userAgent",
      tabSwitchCount: "tabSwitchCount",
      fullscreenExits: "fullscreenExits",
      copyPasteAttempts: "copyPasteAttempts",
      isFlagged: "isFlagged",
      enteredById: "enteredById",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.StudentAnswerScalarFieldEnum = {
      id: "id",
      sessionId: "sessionId",
      examQuestionId: "examQuestionId",
      answerText: "answerText",
      selectedOptionId: "selectedOptionId",
      isMarkedForReview: "isMarkedForReview",
      answeredAt: "answeredAt",
      timeSpent: "timeSpent",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.AnswerGradeScalarFieldEnum = {
      id: "id",
      studentAnswerId: "studentAnswerId",
      gradedBy: "gradedBy",
      graderId: "graderId",
      marksAwarded: "marksAwarded",
      maxMarks: "maxMarks",
      feedback: "feedback",
      aiConfidence: "aiConfidence",
      aiModelUsed: "aiModelUsed",
      aiPromptTokens: "aiPromptTokens",
      aiResponseTokens: "aiResponseTokens",
      isReviewed: "isReviewed",
      reviewedAt: "reviewedAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ExamResultScalarFieldEnum = {
      id: "id",
      sessionId: "sessionId",
      examId: "examId",
      studentId: "studentId",
      totalMarks: "totalMarks",
      obtainedMarks: "obtainedMarks",
      percentage: "percentage",
      grade: "grade",
      isPassed: "isPassed",
      rank: "rank",
      publishedAt: "publishedAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.AcademicSessionScalarFieldEnum = {
      id: "id",
      name: "name",
      startDate: "startDate",
      endDate: "endDate",
      isCurrent: "isCurrent",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.StudentPromotionScalarFieldEnum = {
      id: "id",
      studentProfileId: "studentProfileId",
      academicSessionId: "academicSessionId",
      fromClassId: "fromClassId",
      fromSectionId: "fromSectionId",
      toClassId: "toClassId",
      toSectionId: "toSectionId",
      status: "status",
      remarks: "remarks",
      promotedById: "promotedById",
      promotedAt: "promotedAt",
      createdAt: "createdAt"
    };
    exports.Prisma.SchoolSettingsScalarFieldEnum = {
      id: "id",
      schoolName: "schoolName",
      schoolLogo: "schoolLogo",
      address: "address",
      phone: "phone",
      email: "email",
      website: "website",
      gradingScale: "gradingScale",
      timezone: "timezone",
      academicYear: "academicYear",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      reportHeaderText: "reportHeaderText",
      principalName: "principalName",
      examControllerName: "examControllerName",
      reportFooterText: "reportFooterText",
      signatureImageUrl: "signatureImageUrl",
      passingPercentage: "passingPercentage"
    };
    exports.Prisma.AuditLogScalarFieldEnum = {
      id: "id",
      userId: "userId",
      action: "action",
      entityType: "entityType",
      entityId: "entityId",
      metadata: "metadata",
      ipAddress: "ipAddress",
      createdAt: "createdAt"
    };
    exports.Prisma.NotificationScalarFieldEnum = {
      id: "id",
      userId: "userId",
      title: "title",
      message: "message",
      type: "type",
      isRead: "isRead",
      actionUrl: "actionUrl",
      createdAt: "createdAt"
    };
    exports.Prisma.PasswordResetTokenScalarFieldEnum = {
      id: "id",
      email: "email",
      token: "token",
      expiresAt: "expiresAt",
      createdAt: "createdAt"
    };
    exports.Prisma.TestCampaignScalarFieldEnum = {
      id: "id",
      name: "name",
      slug: "slug",
      description: "description",
      type: "type",
      status: "status",
      academicSessionId: "academicSessionId",
      targetClassId: "targetClassId",
      targetClassGrade: "targetClassGrade",
      maxSeats: "maxSeats",
      registrationStartAt: "registrationStartAt",
      registrationEndAt: "registrationEndAt",
      testStartAt: "testStartAt",
      testEndAt: "testEndAt",
      testDuration: "testDuration",
      totalMarks: "totalMarks",
      passingMarks: "passingMarks",
      shuffleQuestions: "shuffleQuestions",
      shuffleOptions: "shuffleOptions",
      allowCalculator: "allowCalculator",
      negativeMarking: "negativeMarking",
      negativeMarkValue: "negativeMarkValue",
      instructions: "instructions",
      resultPublishAt: "resultPublishAt",
      showRankToApplicant: "showRankToApplicant",
      showScoreToApplicant: "showScoreToApplicant",
      showCutoffToApplicant: "showCutoffToApplicant",
      hasScholarship: "hasScholarship",
      eligibilityCriteria: "eligibilityCriteria",
      createdById: "createdById",
      deletedAt: "deletedAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.CampaignQuestionScalarFieldEnum = {
      id: "id",
      campaignId: "campaignId",
      questionId: "questionId",
      sortOrder: "sortOrder",
      marks: "marks",
      isRequired: "isRequired",
      sectionLabel: "sectionLabel",
      paperVersion: "paperVersion",
      createdAt: "createdAt"
    };
    exports.Prisma.CampaignScholarshipTierScalarFieldEnum = {
      id: "id",
      campaignId: "campaignId",
      tier: "tier",
      name: "name",
      description: "description",
      minPercentage: "minPercentage",
      maxPercentage: "maxPercentage",
      maxRecipients: "maxRecipients",
      benefitDetails: "benefitDetails",
      isActive: "isActive",
      sortOrder: "sortOrder",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.CampaignEvaluationStageScalarFieldEnum = {
      id: "id",
      campaignId: "campaignId",
      stage: "stage",
      name: "name",
      description: "description",
      sortOrder: "sortOrder",
      isRequired: "isRequired",
      weightPercentage: "weightPercentage",
      passingCriteria: "passingCriteria",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ApplicantScalarFieldEnum = {
      id: "id",
      campaignId: "campaignId",
      firstName: "firstName",
      lastName: "lastName",
      email: "email",
      phone: "phone",
      dateOfBirth: "dateOfBirth",
      gender: "gender",
      guardianName: "guardianName",
      guardianPhone: "guardianPhone",
      guardianEmail: "guardianEmail",
      address: "address",
      city: "city",
      previousSchool: "previousSchool",
      previousClass: "previousClass",
      previousGrade: "previousGrade",
      photoUrl: "photoUrl",
      documentUrls: "documentUrls",
      status: "status",
      applicationNumber: "applicationNumber",
      accessToken: "accessToken",
      accessTokenExpiresAt: "accessTokenExpiresAt",
      paperVersion: "paperVersion",
      isEmailVerified: "isEmailVerified",
      isPhoneVerified: "isPhoneVerified",
      emailOtp: "emailOtp",
      phoneOtp: "phoneOtp",
      otpExpiresAt: "otpExpiresAt",
      otpAttempts: "otpAttempts",
      ipAddress: "ipAddress",
      userAgent: "userAgent",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ApplicantTestSessionScalarFieldEnum = {
      id: "id",
      applicantId: "applicantId",
      campaignId: "campaignId",
      status: "status",
      startedAt: "startedAt",
      submittedAt: "submittedAt",
      timeSpent: "timeSpent",
      ipAddress: "ipAddress",
      userAgent: "userAgent",
      tabSwitchCount: "tabSwitchCount",
      fullscreenExits: "fullscreenExits",
      copyPasteAttempts: "copyPasteAttempts",
      browserFingerprint: "browserFingerprint",
      isFlagged: "isFlagged",
      flagReason: "flagReason",
      questionOrder: "questionOrder",
      optionOrders: "optionOrders",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ApplicantAnswerScalarFieldEnum = {
      id: "id",
      sessionId: "sessionId",
      campaignQuestionId: "campaignQuestionId",
      answerText: "answerText",
      selectedOptionId: "selectedOptionId",
      isMarkedForReview: "isMarkedForReview",
      answeredAt: "answeredAt",
      timeSpent: "timeSpent",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ApplicantAnswerGradeScalarFieldEnum = {
      id: "id",
      applicantAnswerId: "applicantAnswerId",
      gradedBy: "gradedBy",
      graderId: "graderId",
      marksAwarded: "marksAwarded",
      maxMarks: "maxMarks",
      feedback: "feedback",
      aiConfidence: "aiConfidence",
      aiModelUsed: "aiModelUsed",
      aiPromptTokens: "aiPromptTokens",
      aiResponseTokens: "aiResponseTokens",
      aiReasoning: "aiReasoning",
      isReviewed: "isReviewed",
      reviewedAt: "reviewedAt",
      isNegativeMarked: "isNegativeMarked",
      negativeMarks: "negativeMarks",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ApplicantResultScalarFieldEnum = {
      id: "id",
      applicantId: "applicantId",
      campaignId: "campaignId",
      totalMarks: "totalMarks",
      obtainedMarks: "obtainedMarks",
      percentage: "percentage",
      rank: "rank",
      percentile: "percentile",
      grade: "grade",
      isPassed: "isPassed",
      sectionScores: "sectionScores",
      computedAt: "computedAt",
      publishedAt: "publishedAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ApplicantScholarshipScalarFieldEnum = {
      id: "id",
      applicantId: "applicantId",
      campaignId: "campaignId",
      tierId: "tierId",
      tier: "tier",
      percentageAwarded: "percentageAwarded",
      isAccepted: "isAccepted",
      acceptedAt: "acceptedAt",
      declinedAt: "declinedAt",
      validFrom: "validFrom",
      validUntil: "validUntil",
      isRenewable: "isRenewable",
      renewalCriteria: "renewalCriteria",
      awardedAt: "awardedAt",
      awardedById: "awardedById",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.AdmissionDecisionRecordScalarFieldEnum = {
      id: "id",
      applicantId: "applicantId",
      campaignId: "campaignId",
      decision: "decision",
      stage: "stage",
      remarks: "remarks",
      conditions: "conditions",
      assignedClassId: "assignedClassId",
      assignedSectionId: "assignedSectionId",
      decidedById: "decidedById",
      decidedAt: "decidedAt",
      createdAt: "createdAt"
    };
    exports.Prisma.PeriodSlotScalarFieldEnum = {
      id: "id",
      name: "name",
      shortName: "shortName",
      startTime: "startTime",
      endTime: "endTime",
      sortOrder: "sortOrder",
      isBreak: "isBreak",
      isActive: "isActive",
      classId: "classId",
      sectionId: "sectionId",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ElectiveSlotGroupScalarFieldEnum = {
      id: "id",
      classId: "classId",
      sectionId: "sectionId",
      periodSlotId: "periodSlotId",
      dayOfWeek: "dayOfWeek",
      academicSessionId: "academicSessionId",
      name: "name",
      isActive: "isActive",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.TimetableEntryScalarFieldEnum = {
      id: "id",
      classId: "classId",
      sectionId: "sectionId",
      subjectId: "subjectId",
      teacherProfileId: "teacherProfileId",
      periodSlotId: "periodSlotId",
      dayOfWeek: "dayOfWeek",
      academicSessionId: "academicSessionId",
      room: "room",
      isElectiveSlot: "isElectiveSlot",
      electiveSlotGroupId: "electiveSlotGroupId",
      isActive: "isActive",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.DailyAttendanceScalarFieldEnum = {
      id: "id",
      studentProfileId: "studentProfileId",
      classId: "classId",
      sectionId: "sectionId",
      date: "date",
      status: "status",
      remarks: "remarks",
      markedById: "markedById",
      academicSessionId: "academicSessionId",
      isEdited: "isEdited",
      editedById: "editedById",
      editedAt: "editedAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.SubjectAttendanceScalarFieldEnum = {
      id: "id",
      studentProfileId: "studentProfileId",
      classId: "classId",
      sectionId: "sectionId",
      subjectId: "subjectId",
      timetableEntryId: "timetableEntryId",
      periodSlotId: "periodSlotId",
      date: "date",
      status: "status",
      remarks: "remarks",
      markedById: "markedById",
      academicSessionId: "academicSessionId",
      isEdited: "isEdited",
      editedById: "editedById",
      editedAt: "editedAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.DiaryEntryScalarFieldEnum = {
      id: "id",
      teacherProfileId: "teacherProfileId",
      classId: "classId",
      sectionId: "sectionId",
      subjectId: "subjectId",
      academicSessionId: "academicSessionId",
      date: "date",
      title: "title",
      content: "content",
      status: "status",
      isEdited: "isEdited",
      editedAt: "editedAt",
      deletedAt: "deletedAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.DiaryReadReceiptScalarFieldEnum = {
      id: "id",
      diaryEntryId: "diaryEntryId",
      studentProfileId: "studentProfileId",
      readAt: "readAt"
    };
    exports.Prisma.DiaryPrincipalNoteScalarFieldEnum = {
      id: "id",
      diaryEntryId: "diaryEntryId",
      principalId: "principalId",
      note: "note",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.DatesheetScalarFieldEnum = {
      id: "id",
      title: "title",
      description: "description",
      examType: "examType",
      academicSessionId: "academicSessionId",
      status: "status",
      startDate: "startDate",
      endDate: "endDate",
      publishedAt: "publishedAt",
      publishedById: "publishedById",
      createdById: "createdById",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.DatesheetEntryScalarFieldEnum = {
      id: "id",
      datesheetId: "datesheetId",
      classId: "classId",
      sectionId: "sectionId",
      subjectId: "subjectId",
      examDate: "examDate",
      startTime: "startTime",
      endTime: "endTime",
      room: "room",
      instructions: "instructions",
      totalMarks: "totalMarks",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.DatesheetDutyScalarFieldEnum = {
      id: "id",
      datesheetEntryId: "datesheetEntryId",
      teacherProfileId: "teacherProfileId",
      role: "role",
      room: "room",
      notes: "notes",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.FeeCategoryScalarFieldEnum = {
      id: "id",
      name: "name",
      description: "description",
      frequency: "frequency",
      isMandatory: "isMandatory",
      isRefundable: "isRefundable",
      isActive: "isActive",
      sortOrder: "sortOrder",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.FeeStructureScalarFieldEnum = {
      id: "id",
      categoryId: "categoryId",
      classId: "classId",
      academicSessionId: "academicSessionId",
      amount: "amount",
      effectiveFrom: "effectiveFrom",
      isActive: "isActive",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.FeeAssignmentScalarFieldEnum = {
      id: "id",
      studentProfileId: "studentProfileId",
      academicSessionId: "academicSessionId",
      generatedForMonth: "generatedForMonth",
      totalAmount: "totalAmount",
      paidAmount: "paidAmount",
      balanceAmount: "balanceAmount",
      discountAmount: "discountAmount",
      lateFeesApplied: "lateFeesApplied",
      dueDate: "dueDate",
      status: "status",
      generatedById: "generatedById",
      cancelledById: "cancelledById",
      cancelReason: "cancelReason",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.FeeLineItemScalarFieldEnum = {
      id: "id",
      feeAssignmentId: "feeAssignmentId",
      feeStructureId: "feeStructureId",
      categoryName: "categoryName",
      amount: "amount"
    };
    exports.Prisma.FeeDiscountScalarFieldEnum = {
      id: "id",
      feeAssignmentId: "feeAssignmentId",
      reason: "reason",
      amount: "amount",
      appliedById: "appliedById",
      createdAt: "createdAt"
    };
    exports.Prisma.FeePaymentScalarFieldEnum = {
      id: "id",
      feeAssignmentId: "feeAssignmentId",
      familyPaymentId: "familyPaymentId",
      amount: "amount",
      paymentMethod: "paymentMethod",
      referenceNumber: "referenceNumber",
      receiptNumber: "receiptNumber",
      status: "status",
      reversedById: "reversedById",
      reversalReason: "reversalReason",
      reversedAt: "reversedAt",
      recordedById: "recordedById",
      paidAt: "paidAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.FamilyPaymentScalarFieldEnum = {
      id: "id",
      familyProfileId: "familyProfileId",
      totalAmount: "totalAmount",
      paymentMethod: "paymentMethod",
      referenceNumber: "referenceNumber",
      masterReceiptNumber: "masterReceiptNumber",
      allocationStrategy: "allocationStrategy",
      allocationDetails: "allocationDetails",
      status: "status",
      reversedById: "reversedById",
      reversalReason: "reversalReason",
      reversedAt: "reversedAt",
      recordedById: "recordedById",
      paidAt: "paidAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.FeeSettingsScalarFieldEnum = {
      id: "id",
      dueDayOfMonth: "dueDayOfMonth",
      lateFeePerDay: "lateFeePerDay",
      maxLateFee: "maxLateFee",
      receiptPrefix: "receiptPrefix",
      familyReceiptPrefix: "familyReceiptPrefix",
      gracePeriodDays: "gracePeriodDays",
      academicSessionId: "academicSessionId",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.FeeCreditScalarFieldEnum = {
      id: "id",
      studentProfileId: "studentProfileId",
      familyProfileId: "familyProfileId",
      academicSessionId: "academicSessionId",
      amount: "amount",
      remainingAmount: "remainingAmount",
      reason: "reason",
      referenceNumber: "referenceNumber",
      status: "status",
      createdById: "createdById",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.StudentFeeDiscountScalarFieldEnum = {
      id: "id",
      studentProfileId: "studentProfileId",
      academicSessionId: "academicSessionId",
      discountType: "discountType",
      value: "value",
      reason: "reason",
      feeCategoryId: "feeCategoryId",
      isActive: "isActive",
      validFrom: "validFrom",
      validUntil: "validUntil",
      approvedById: "approvedById",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.StudentSubjectEnrollmentScalarFieldEnum = {
      id: "id",
      studentProfileId: "studentProfileId",
      subjectId: "subjectId",
      classId: "classId",
      academicSessionId: "academicSessionId",
      isActive: "isActive",
      enrolledAt: "enrolledAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ResultTermScalarFieldEnum = {
      id: "id",
      name: "name",
      academicSessionId: "academicSessionId",
      classId: "classId",
      description: "description",
      isActive: "isActive",
      isPublished: "isPublished",
      isComputing: "isComputing",
      lockOwner: "lockOwner",
      lockAcquiredAt: "lockAcquiredAt",
      lockExpiresAt: "lockExpiresAt",
      publishedAt: "publishedAt",
      computedAt: "computedAt",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ResultExamGroupScalarFieldEnum = {
      id: "id",
      resultTermId: "resultTermId",
      name: "name",
      weight: "weight",
      aggregateMode: "aggregateMode",
      bestOfCount: "bestOfCount",
      sortOrder: "sortOrder",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ResultExamLinkScalarFieldEnum = {
      id: "id",
      examGroupId: "examGroupId",
      examId: "examId",
      createdAt: "createdAt"
    };
    exports.Prisma.ConsolidatedResultScalarFieldEnum = {
      id: "id",
      resultTermId: "resultTermId",
      studentId: "studentId",
      subjectId: "subjectId",
      groupScores: "groupScores",
      totalMarks: "totalMarks",
      obtainedMarks: "obtainedMarks",
      percentage: "percentage",
      grade: "grade",
      isPassed: "isPassed",
      isStale: "isStale",
      rankInClass: "rankInClass",
      rankInSection: "rankInSection",
      computedAt: "computedAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ConsolidatedStudentSummaryScalarFieldEnum = {
      id: "id",
      resultTermId: "resultTermId",
      studentId: "studentId",
      sectionId: "sectionId",
      totalSubjects: "totalSubjects",
      passedSubjects: "passedSubjects",
      failedSubjects: "failedSubjects",
      grandTotalMarks: "grandTotalMarks",
      grandObtainedMarks: "grandObtainedMarks",
      overallPercentage: "overallPercentage",
      overallGrade: "overallGrade",
      isOverallPassed: "isOverallPassed",
      rankInClass: "rankInClass",
      rankInSection: "rankInSection",
      attendancePercentage: "attendancePercentage",
      totalDays: "totalDays",
      presentDays: "presentDays",
      classTeacherRemarks: "classTeacherRemarks",
      principalRemarks: "principalRemarks",
      isStale: "isStale",
      computedAt: "computedAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.SortOrder = {
      asc: "asc",
      desc: "desc"
    };
    exports.Prisma.NullableJsonNullValueInput = {
      DbNull: Prisma.DbNull,
      JsonNull: Prisma.JsonNull
    };
    exports.Prisma.JsonNullValueInput = {
      JsonNull: Prisma.JsonNull
    };
    exports.Prisma.QueryMode = {
      default: "default",
      insensitive: "insensitive"
    };
    exports.Prisma.NullsOrder = {
      first: "first",
      last: "last"
    };
    exports.Prisma.JsonNullValueFilter = {
      DbNull: Prisma.DbNull,
      JsonNull: Prisma.JsonNull,
      AnyNull: Prisma.AnyNull
    };
    exports.UserRole = exports.$Enums.UserRole = {
      ADMIN: "ADMIN",
      PRINCIPAL: "PRINCIPAL",
      TEACHER: "TEACHER",
      STUDENT: "STUDENT",
      FAMILY: "FAMILY"
    };
    exports.Gender = exports.$Enums.Gender = {
      MALE: "MALE",
      FEMALE: "FEMALE",
      OTHER: "OTHER"
    };
    exports.QuestionType = exports.$Enums.QuestionType = {
      MCQ: "MCQ",
      SHORT_ANSWER: "SHORT_ANSWER",
      LONG_ANSWER: "LONG_ANSWER"
    };
    exports.Difficulty = exports.$Enums.Difficulty = {
      EASY: "EASY",
      MEDIUM: "MEDIUM",
      HARD: "HARD"
    };
    exports.TagCategory = exports.$Enums.TagCategory = {
      TOPIC: "TOPIC",
      DIFFICULTY: "DIFFICULTY",
      BLOOM_LEVEL: "BLOOM_LEVEL",
      CUSTOM: "CUSTOM"
    };
    exports.ExamDeliveryMode = exports.$Enums.ExamDeliveryMode = {
      ONLINE: "ONLINE",
      WRITTEN: "WRITTEN"
    };
    exports.ExamType = exports.$Enums.ExamType = {
      QUIZ: "QUIZ",
      MIDTERM: "MIDTERM",
      FINAL: "FINAL",
      PRACTICE: "PRACTICE",
      CUSTOM: "CUSTOM"
    };
    exports.ExamStatus = exports.$Enums.ExamStatus = {
      DRAFT: "DRAFT",
      PUBLISHED: "PUBLISHED",
      ACTIVE: "ACTIVE",
      COMPLETED: "COMPLETED",
      ARCHIVED: "ARCHIVED"
    };
    exports.SessionStatus = exports.$Enums.SessionStatus = {
      NOT_STARTED: "NOT_STARTED",
      IN_PROGRESS: "IN_PROGRESS",
      SUBMITTED: "SUBMITTED",
      TIMED_OUT: "TIMED_OUT",
      GRADING: "GRADING",
      GRADED: "GRADED",
      ABSENT: "ABSENT"
    };
    exports.ShowResultAfter = exports.$Enums.ShowResultAfter = {
      IMMEDIATELY: "IMMEDIATELY",
      AFTER_DEADLINE: "AFTER_DEADLINE",
      MANUAL: "MANUAL"
    };
    exports.GradedBy = exports.$Enums.GradedBy = {
      SYSTEM: "SYSTEM",
      AI: "AI",
      TEACHER: "TEACHER"
    };
    exports.NotificationType = exports.$Enums.NotificationType = {
      EXAM_ASSIGNED: "EXAM_ASSIGNED",
      EXAM_REMINDER: "EXAM_REMINDER",
      RESULT_PUBLISHED: "RESULT_PUBLISHED",
      GRADE_REVIEWED: "GRADE_REVIEWED",
      SYSTEM: "SYSTEM",
      ADMISSION: "ADMISSION",
      ATTENDANCE_ALERT: "ATTENDANCE_ALERT",
      DIARY_PUBLISHED: "DIARY_PUBLISHED"
    };
    exports.StudentStatus = exports.$Enums.StudentStatus = {
      ACTIVE: "ACTIVE",
      PROMOTED: "PROMOTED",
      GRADUATED: "GRADUATED",
      HELD_BACK: "HELD_BACK",
      WITHDRAWN: "WITHDRAWN"
    };
    exports.CampaignType = exports.$Enums.CampaignType = {
      ADMISSION: "ADMISSION",
      SCHOLARSHIP: "SCHOLARSHIP",
      ADMISSION_SCHOLARSHIP: "ADMISSION_SCHOLARSHIP"
    };
    exports.CampaignStatus = exports.$Enums.CampaignStatus = {
      DRAFT: "DRAFT",
      REGISTRATION_OPEN: "REGISTRATION_OPEN",
      REGISTRATION_CLOSED: "REGISTRATION_CLOSED",
      TEST_ACTIVE: "TEST_ACTIVE",
      TEST_CLOSED: "TEST_CLOSED",
      GRADING: "GRADING",
      RESULTS_READY: "RESULTS_READY",
      RESULTS_PUBLISHED: "RESULTS_PUBLISHED",
      COMPLETED: "COMPLETED",
      ARCHIVED: "ARCHIVED"
    };
    exports.ApplicantStatus = exports.$Enums.ApplicantStatus = {
      REGISTERED: "REGISTERED",
      VERIFIED: "VERIFIED",
      TEST_IN_PROGRESS: "TEST_IN_PROGRESS",
      TEST_COMPLETED: "TEST_COMPLETED",
      GRADED: "GRADED",
      SHORTLISTED: "SHORTLISTED",
      INTERVIEW_SCHEDULED: "INTERVIEW_SCHEDULED",
      ACCEPTED: "ACCEPTED",
      REJECTED: "REJECTED",
      WAITLISTED: "WAITLISTED",
      ENROLLED: "ENROLLED",
      WITHDRAWN: "WITHDRAWN",
      EXPIRED: "EXPIRED"
    };
    exports.ScholarshipTier = exports.$Enums.ScholarshipTier = {
      FULL_100: "FULL_100",
      SEVENTY_FIVE: "SEVENTY_FIVE",
      HALF_50: "HALF_50",
      QUARTER_25: "QUARTER_25",
      NONE: "NONE"
    };
    exports.VerificationType = exports.$Enums.VerificationType = {
      EMAIL_OTP: "EMAIL_OTP",
      PHONE_OTP: "PHONE_OTP",
      BOTH: "BOTH"
    };
    exports.AdmissionDecisionType = exports.$Enums.AdmissionDecisionType = {
      PENDING: "PENDING",
      ACCEPTED: "ACCEPTED",
      REJECTED: "REJECTED",
      WAITLISTED: "WAITLISTED",
      SCHOLARSHIP_OFFERED: "SCHOLARSHIP_OFFERED"
    };
    exports.EvaluationStage = exports.$Enums.EvaluationStage = {
      WRITTEN_TEST: "WRITTEN_TEST",
      INTERVIEW: "INTERVIEW",
      DOCUMENT_REVIEW: "DOCUMENT_REVIEW",
      FINAL_DECISION: "FINAL_DECISION"
    };
    exports.DatesheetStatus = exports.$Enums.DatesheetStatus = {
      DRAFT: "DRAFT",
      PUBLISHED: "PUBLISHED",
      ARCHIVED: "ARCHIVED"
    };
    exports.AggregateMode = exports.$Enums.AggregateMode = {
      SINGLE: "SINGLE",
      AVERAGE: "AVERAGE",
      BEST_OF: "BEST_OF",
      SUM: "SUM"
    };
    exports.AttendanceStatus = exports.$Enums.AttendanceStatus = {
      PRESENT: "PRESENT",
      ABSENT: "ABSENT",
      LATE: "LATE",
      EXCUSED: "EXCUSED"
    };
    exports.DiaryStatus = exports.$Enums.DiaryStatus = {
      DRAFT: "DRAFT",
      PUBLISHED: "PUBLISHED"
    };
    exports.DayOfWeek = exports.$Enums.DayOfWeek = {
      MONDAY: "MONDAY",
      TUESDAY: "TUESDAY",
      WEDNESDAY: "WEDNESDAY",
      THURSDAY: "THURSDAY",
      FRIDAY: "FRIDAY",
      SATURDAY: "SATURDAY",
      SUNDAY: "SUNDAY"
    };
    exports.FeeFrequency = exports.$Enums.FeeFrequency = {
      MONTHLY: "MONTHLY",
      TERM: "TERM",
      ANNUAL: "ANNUAL",
      ONE_TIME: "ONE_TIME"
    };
    exports.FeeAssignmentStatus = exports.$Enums.FeeAssignmentStatus = {
      PENDING: "PENDING",
      PARTIAL: "PARTIAL",
      PAID: "PAID",
      OVERDUE: "OVERDUE",
      CANCELLED: "CANCELLED",
      WAIVED: "WAIVED"
    };
    exports.PaymentMethod = exports.$Enums.PaymentMethod = {
      CASH: "CASH",
      BANK_TRANSFER: "BANK_TRANSFER",
      ONLINE: "ONLINE",
      CHEQUE: "CHEQUE"
    };
    exports.PaymentStatus = exports.$Enums.PaymentStatus = {
      COMPLETED: "COMPLETED",
      REVERSED: "REVERSED"
    };
    exports.AllocationStrategy = exports.$Enums.AllocationStrategy = {
      OLDEST_FIRST: "OLDEST_FIRST",
      CHILD_PRIORITY: "CHILD_PRIORITY",
      EQUAL_SPLIT: "EQUAL_SPLIT",
      MANUAL: "MANUAL",
      CUSTOM: "CUSTOM"
    };
    exports.CreditStatus = exports.$Enums.CreditStatus = {
      ACTIVE: "ACTIVE",
      EXHAUSTED: "EXHAUSTED",
      REFUNDED: "REFUNDED"
    };
    exports.StudentDiscountType = exports.$Enums.StudentDiscountType = {
      FLAT: "FLAT",
      PERCENTAGE: "PERCENTAGE"
    };
    exports.Prisma.ModelName = {
      User: "User",
      StudentProfile: "StudentProfile",
      TeacherProfile: "TeacherProfile",
      FamilyProfile: "FamilyProfile",
      FamilyStudentLink: "FamilyStudentLink",
      Department: "Department",
      Subject: "Subject",
      SubjectClassLink: "SubjectClassLink",
      TeacherSubject: "TeacherSubject",
      Class: "Class",
      Section: "Section",
      Tag: "Tag",
      Question: "Question",
      McqOption: "McqOption",
      QuestionTag: "QuestionTag",
      Exam: "Exam",
      ExamQuestion: "ExamQuestion",
      ExamClassAssignment: "ExamClassAssignment",
      ExamSession: "ExamSession",
      StudentAnswer: "StudentAnswer",
      AnswerGrade: "AnswerGrade",
      ExamResult: "ExamResult",
      AcademicSession: "AcademicSession",
      StudentPromotion: "StudentPromotion",
      SchoolSettings: "SchoolSettings",
      AuditLog: "AuditLog",
      Notification: "Notification",
      PasswordResetToken: "PasswordResetToken",
      TestCampaign: "TestCampaign",
      CampaignQuestion: "CampaignQuestion",
      CampaignScholarshipTier: "CampaignScholarshipTier",
      CampaignEvaluationStage: "CampaignEvaluationStage",
      Applicant: "Applicant",
      ApplicantTestSession: "ApplicantTestSession",
      ApplicantAnswer: "ApplicantAnswer",
      ApplicantAnswerGrade: "ApplicantAnswerGrade",
      ApplicantResult: "ApplicantResult",
      ApplicantScholarship: "ApplicantScholarship",
      AdmissionDecisionRecord: "AdmissionDecisionRecord",
      PeriodSlot: "PeriodSlot",
      ElectiveSlotGroup: "ElectiveSlotGroup",
      TimetableEntry: "TimetableEntry",
      DailyAttendance: "DailyAttendance",
      SubjectAttendance: "SubjectAttendance",
      DiaryEntry: "DiaryEntry",
      DiaryReadReceipt: "DiaryReadReceipt",
      DiaryPrincipalNote: "DiaryPrincipalNote",
      Datesheet: "Datesheet",
      DatesheetEntry: "DatesheetEntry",
      DatesheetDuty: "DatesheetDuty",
      FeeCategory: "FeeCategory",
      FeeStructure: "FeeStructure",
      FeeAssignment: "FeeAssignment",
      FeeLineItem: "FeeLineItem",
      FeeDiscount: "FeeDiscount",
      FeePayment: "FeePayment",
      FamilyPayment: "FamilyPayment",
      FeeSettings: "FeeSettings",
      FeeCredit: "FeeCredit",
      StudentFeeDiscount: "StudentFeeDiscount",
      StudentSubjectEnrollment: "StudentSubjectEnrollment",
      ResultTerm: "ResultTerm",
      ResultExamGroup: "ResultExamGroup",
      ResultExamLink: "ResultExamLink",
      ConsolidatedResult: "ConsolidatedResult",
      ConsolidatedStudentSummary: "ConsolidatedStudentSummary"
    };
    var config = {
      "generator": {
        "name": "client",
        "provider": {
          "fromEnvVar": null,
          "value": "prisma-client-js"
        },
        "output": {
          "value": "C:\\Users\\Tanve\\Desktop\\Projects\\portfolio\\node_modules\\.pnpm\\@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3\\node_modules\\@prisma\\client",
          "fromEnvVar": null
        },
        "config": {
          "engineType": "library"
        },
        "binaryTargets": [
          {
            "fromEnvVar": null,
            "value": "windows",
            "native": true
          }
        ],
        "previewFeatures": [],
        "sourceFilePath": "C:\\Users\\Tanve\\Desktop\\Projects\\portfolio\\prisma\\schema.prisma"
      },
      "relativeEnvPaths": {
        "rootEnvPath": null,
        "schemaEnvPath": "../../../../../../.env"
      },
      "relativePath": "../../../../../../prisma",
      "clientVersion": "6.19.2",
      "engineVersion": "c2990dca591cba766e3b7ef5d9e8a84796e47ab7",
      "datasourceNames": [
        "db"
      ],
      "activeProvider": "postgresql",
      "postinstall": false,
      "inlineDatasources": {
        "db": {
          "url": {
            "fromEnvVar": "DATABASE_URL",
            "value": null
          }
        }
      },
      "inlineSchema": `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  ADMIN
  PRINCIPAL
  TEACHER
  STUDENT
  FAMILY
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum QuestionType {
  MCQ
  SHORT_ANSWER
  LONG_ANSWER
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum TagCategory {
  TOPIC
  DIFFICULTY
  BLOOM_LEVEL
  CUSTOM
}

enum ExamDeliveryMode {
  ONLINE
  WRITTEN
}

enum ExamType {
  QUIZ
  MIDTERM
  FINAL
  PRACTICE
  CUSTOM
}

enum ExamStatus {
  DRAFT
  PUBLISHED
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum SessionStatus {
  NOT_STARTED
  IN_PROGRESS
  SUBMITTED
  TIMED_OUT
  GRADING
  GRADED
  ABSENT
}

enum ShowResultAfter {
  IMMEDIATELY
  AFTER_DEADLINE
  MANUAL
}

enum GradedBy {
  SYSTEM
  AI
  TEACHER
}

enum NotificationType {
  EXAM_ASSIGNED
  EXAM_REMINDER
  RESULT_PUBLISHED
  GRADE_REVIEWED
  SYSTEM
  ADMISSION
  ATTENDANCE_ALERT
  DIARY_PUBLISHED
}

enum StudentStatus {
  ACTIVE
  PROMOTED
  GRADUATED
  HELD_BACK
  WITHDRAWN
}

// ============================================
// ADMISSION & SCHOLARSHIP ENUMS
// ============================================

enum CampaignType {
  ADMISSION
  SCHOLARSHIP
  ADMISSION_SCHOLARSHIP
}

enum CampaignStatus {
  DRAFT
  REGISTRATION_OPEN
  REGISTRATION_CLOSED
  TEST_ACTIVE
  TEST_CLOSED
  GRADING
  RESULTS_READY
  RESULTS_PUBLISHED
  COMPLETED
  ARCHIVED
}

enum ApplicantStatus {
  REGISTERED
  VERIFIED
  TEST_IN_PROGRESS
  TEST_COMPLETED
  GRADED
  SHORTLISTED
  INTERVIEW_SCHEDULED
  ACCEPTED
  REJECTED
  WAITLISTED
  ENROLLED
  WITHDRAWN
  EXPIRED
}

enum ScholarshipTier {
  FULL_100
  SEVENTY_FIVE
  HALF_50
  QUARTER_25
  NONE
}

enum VerificationType {
  EMAIL_OTP
  PHONE_OTP
  BOTH
}

enum AdmissionDecisionType {
  PENDING
  ACCEPTED
  REJECTED
  WAITLISTED
  SCHOLARSHIP_OFFERED
}

enum EvaluationStage {
  WRITTEN_TEST
  INTERVIEW
  DOCUMENT_REVIEW
  FINAL_DECISION
}

// ============================================
// DATESHEET ENUMS
// ============================================

enum DatesheetStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum AggregateMode {
  SINGLE // Exactly one exam per subject expected
  AVERAGE // Average all linked exams
  BEST_OF // Best N of M (uses bestOfCount)
  SUM // Sum all
}

// ============================================
// ATTENDANCE & TIMETABLE ENUMS
// ============================================

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}

enum DiaryStatus {
  DRAFT
  PUBLISHED
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

// ============================================
// USER TABLES
// ============================================

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  firstName    String
  lastName     String
  role         UserRole
  phone        String?
  avatarUrl    String?
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?

  studentProfile  StudentProfile?
  teacherProfile  TeacherProfile?
  familyProfile   FamilyProfile?
  questions       Question[]
  examsCreated    Exam[]
  examSessions    ExamSession[]
  answerGrades    AnswerGrade[]      @relation("GraderUser")
  examResults     ExamResult[]
  sessionsEntered ExamSession[]      @relation("MarksEnteredBy")
  auditLogs       AuditLog[]
  notifications   Notification[]
  promotionsDone  StudentPromotion[]

  // Admission relations
  campaignsCreated       TestCampaign[]
  applicantGrades        ApplicantAnswerGrade[]    @relation("ApplicantGraderUser")
  scholarshipsAwarded    ApplicantScholarship[]    @relation("ScholarshipAwarder")
  admissionDecisionsMade AdmissionDecisionRecord[]

  // Attendance relations
  dailyAttendanceMarked   DailyAttendance[]   @relation("DailyAttendanceMarker")
  dailyAttendanceEdited   DailyAttendance[]   @relation("DailyAttendanceEditor")
  subjectAttendanceMarked SubjectAttendance[] @relation("SubjectAttendanceMarker")
  subjectAttendanceEdited SubjectAttendance[] @relation("SubjectAttendanceEditor")
  classTeacherSections    Section[]           @relation("ClassTeacher")

  // Diary relations
  diaryPrincipalNotes DiaryPrincipalNote[]

  // Family relations
  familyStudentLinksCreated FamilyStudentLink[] @relation("LinkCreator")

  // Datesheet relations
  publishedDatesheets Datesheet[] @relation("DatesheetPublisher")
  createdDatesheets   Datesheet[] @relation("DatesheetCreator")

  // Fee relations
  feesGenerated           FeeAssignment[]      @relation("FeeGeneratedBy")
  discountsApplied        FeeDiscount[]        @relation("DiscountAppliedBy")
  paymentsRecorded        FeePayment[]         @relation("PaymentRecordedBy")
  familyPaymentsRecorded  FamilyPayment[]      @relation("FamilyPaymentRecordedBy")
  creditsCreated          FeeCredit[]          @relation("CreditCreatedBy")
  studentDiscountsCreated StudentFeeDiscount[] @relation("StudentDiscountCreatedBy")

  // Report/Consolidated result relations
  consolidatedResults          ConsolidatedResult[]
  consolidatedStudentSummaries ConsolidatedStudentSummary[]

  @@index([role])
  @@index([isActive])
  @@index([deletedAt])
}

model StudentProfile {
  id             String        @id @default(uuid())
  userId         String        @unique
  rollNumber     String
  registrationNo String        @unique
  classId        String
  sectionId      String
  status         StudentStatus @default(ACTIVE)
  guardianName   String?
  guardianPhone  String?
  dateOfBirth    DateTime?
  gender         Gender?
  enrollmentDate DateTime      @default(now())
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  user       User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  class      Class              @relation(fields: [classId], references: [id])
  section    Section            @relation(fields: [sectionId], references: [id])
  promotions StudentPromotion[]

  // Attendance relations
  dailyAttendance   DailyAttendance[]
  subjectAttendance SubjectAttendance[]

  // Diary relations
  diaryReadReceipts DiaryReadReceipt[]

  // Family relations
  familyLinks FamilyStudentLink[]

  // Subject enrollment (for electives)
  subjectEnrollments StudentSubjectEnrollment[]

  // Fee relations
  feeAssignments      FeeAssignment[]
  feeCredits          FeeCredit[]
  feeDiscountsApplied StudentFeeDiscount[]

  @@index([classId])
  @@index([sectionId])
  @@index([rollNumber])
  @@index([status])
  @@index([classId, sectionId])
  @@index([classId, sectionId, status])
}

model TeacherProfile {
  id             String   @id @default(uuid())
  userId         String   @unique
  employeeId     String   @unique
  qualification  String?
  specialization String?
  joiningDate    DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  teacherSubjects  TeacherSubject[]
  timetableEntries TimetableEntry[]

  // Diary relations
  diaryEntries DiaryEntry[]

  // Datesheet relations
  datesheetDuties DatesheetDuty[]
}

model FamilyProfile {
  id             String   @id @default(uuid())
  userId         String   @unique
  relationship   String   @db.VarChar(100)
  occupation     String?  @db.VarChar(200)
  address        String?  @db.Text
  emergencyPhone String?  @db.VarChar(20)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user           User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  studentLinks   FamilyStudentLink[]
  familyPayments FamilyPayment[]
  feeCredits     FeeCredit[]
}

model FamilyStudentLink {
  id               String   @id @default(uuid())
  familyProfileId  String
  studentProfileId String
  relationship     String   @db.VarChar(100)
  isPrimary        Boolean  @default(false)
  isActive         Boolean  @default(true)
  linkedAt         DateTime @default(now())
  linkedById       String
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  familyProfile  FamilyProfile  @relation(fields: [familyProfileId], references: [id], onDelete: Cascade)
  studentProfile StudentProfile @relation(fields: [studentProfileId], references: [id])
  linkedBy       User           @relation("LinkCreator", fields: [linkedById], references: [id])

  @@unique([familyProfileId, studentProfileId])
  @@index([familyProfileId])
  @@index([studentProfileId])
  @@index([isActive])
}

// ============================================
// ORGANIZATION TABLES
// ============================================

model Department {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subjects Subject[]
}

model Subject {
  id           String   @id @default(uuid())
  name         String
  code         String   @unique
  departmentId String
  description  String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  department                Department                 @relation(fields: [departmentId], references: [id])
  teacherSubjects           TeacherSubject[]
  questions                 Question[]
  exams                     Exam[]
  subjectClassLinks         SubjectClassLink[]
  timetableEntries          TimetableEntry[]
  subjectAttendance         SubjectAttendance[]
  diaryEntries              DiaryEntry[]
  datesheetEntries          DatesheetEntry[]
  studentSubjectEnrollments StudentSubjectEnrollment[]
  consolidatedResults       ConsolidatedResult[]

  @@index([departmentId])
}

// ============================================
// SUBJECT-CLASS LINK (which subjects are taught in which classes)
// ============================================

model SubjectClassLink {
  id                String   @id @default(uuid())
  subjectId         String
  classId           String
  syllabus          String?
  isElective        Boolean  @default(false) // true = optional subject (CS vs Bio)
  electiveGroupName String? // e.g. "Science Elective", "Arts Elective" — students pick one from the group
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  subject Subject @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  class   Class   @relation(fields: [classId], references: [id], onDelete: Cascade)

  @@unique([subjectId, classId])
  @@index([classId])
  @@index([subjectId])
  @@index([classId, isElective])
}

model TeacherSubject {
  id        String   @id @default(uuid())
  teacherId String
  subjectId String
  classId   String
  sectionId String
  createdAt DateTime @default(now())

  teacher TeacherProfile @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  subject Subject        @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  class   Class          @relation(fields: [classId], references: [id])
  section Section        @relation(fields: [sectionId], references: [id])

  @@unique([teacherId, subjectId, classId, sectionId])
  @@index([teacherId])
  @@index([classId])
  @@index([subjectId])
  @@index([sectionId])
  @@index([teacherId, classId, sectionId])
}

model Class {
  id        String   @id @default(uuid())
  name      String
  grade     Int
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sections                  Section[]
  students                  StudentProfile[]
  examClassAssignments      ExamClassAssignment[]
  subjectClassLinks         SubjectClassLink[]
  questions                 Question[]
  teacherSubjects           TeacherSubject[]
  promotionsFrom            StudentPromotion[]         @relation("PromotionFromClass")
  promotionsTo              StudentPromotion[]         @relation("PromotionToClass")
  testCampaigns             TestCampaign[]
  admissionPlacements       AdmissionDecisionRecord[]
  timetableEntries          TimetableEntry[]
  dailyAttendance           DailyAttendance[]
  subjectAttendance         SubjectAttendance[]
  diaryEntries              DiaryEntry[]
  datesheetEntries          DatesheetEntry[]
  periodSlots               PeriodSlot[] // class-specific period overrides
  studentSubjectEnrollments StudentSubjectEnrollment[]
  feeStructures             FeeStructure[]
  electiveSlotGroups        ElectiveSlotGroup[]
  resultTerms               ResultTerm[]

  @@index([grade])
}

model Section {
  id             String   @id @default(uuid())
  name           String
  classId        String
  classTeacherId String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  class                Class                     @relation(fields: [classId], references: [id], onDelete: Cascade)
  classTeacher         User?                     @relation("ClassTeacher", fields: [classTeacherId], references: [id])
  students             StudentProfile[]
  teacherSubjects      TeacherSubject[]
  examClassAssignments ExamClassAssignment[]
  promotionsFrom       StudentPromotion[]        @relation("PromotionFromSection")
  promotionsTo         StudentPromotion[]        @relation("PromotionToSection")
  admissionPlacements  AdmissionDecisionRecord[]
  timetableEntries     TimetableEntry[]
  periodSlots          PeriodSlot[]
  dailyAttendance      DailyAttendance[]
  subjectAttendance    SubjectAttendance[]
  diaryEntries         DiaryEntry[]
  datesheetEntries     DatesheetEntry[]
  electiveSlotGroups   ElectiveSlotGroup[]

  @@unique([classId, name])
  @@index([classId])
  @@index([classTeacherId])
}

// ============================================
// QUESTION BANK TABLES
// ============================================

model Tag {
  id        String      @id @default(uuid())
  name      String      @unique
  category  TagCategory
  createdAt DateTime    @default(now())

  questionTags QuestionTag[]

  @@index([category])
}

model Question {
  id            String       @id @default(uuid())
  subjectId     String
  classId       String?
  createdById   String
  type          QuestionType
  title         String
  description   String?
  imageUrl      String?
  difficulty    Difficulty
  marks         Decimal
  expectedTime  Int?
  modelAnswer   String?
  gradingRubric Json?
  explanation   String?
  isActive      Boolean      @default(true)
  usageCount    Int          @default(0)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  deletedAt     DateTime?

  subject           Subject            @relation(fields: [subjectId], references: [id])
  class             Class?             @relation(fields: [classId], references: [id])
  createdBy         User               @relation(fields: [createdById], references: [id])
  mcqOptions        McqOption[]
  questionTags      QuestionTag[]
  examQuestions     ExamQuestion[]
  campaignQuestions CampaignQuestion[]

  @@index([subjectId])
  @@index([classId])
  @@index([createdById])
  @@index([type])
  @@index([difficulty])
  @@index([isActive])
  @@index([deletedAt])
}

model McqOption {
  id         String   @id @default(uuid())
  questionId String
  label      String
  text       String
  imageUrl   String?
  isCorrect  Boolean  @default(false)
  sortOrder  Int
  createdAt  DateTime @default(now())

  question         Question          @relation(fields: [questionId], references: [id], onDelete: Cascade)
  studentAnswers   StudentAnswer[]   @relation("SelectedOption")
  applicantAnswers ApplicantAnswer[] @relation("ApplicantSelectedOption")

  @@unique([questionId, label])
  @@index([questionId])
}

model QuestionTag {
  id         String   @id @default(uuid())
  questionId String
  tagId      String
  createdAt  DateTime @default(now())

  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  tag      Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([questionId, tagId])
}

// ============================================
// EXAM TABLES
// ============================================

model Exam {
  id                String           @id @default(uuid())
  title             String
  description       String?
  subjectId         String
  createdById       String
  academicSessionId String?
  type              ExamType
  status            ExamStatus       @default(DRAFT)
  deliveryMode      ExamDeliveryMode @default(ONLINE)
  totalMarks        Decimal
  passingMarks      Decimal
  duration          Int
  scheduledStartAt  DateTime?
  scheduledEndAt    DateTime?
  instructions      String?
  shuffleQuestions  Boolean          @default(false)
  showResultAfter   ShowResultAfter  @default(IMMEDIATELY)
  allowReview       Boolean          @default(true)
  maxAttempts       Int              @default(1)
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  deletedAt         DateTime?

  subject              Subject               @relation(fields: [subjectId], references: [id])
  createdBy            User                  @relation(fields: [createdById], references: [id])
  academicSession      AcademicSession?      @relation(fields: [academicSessionId], references: [id])
  examQuestions        ExamQuestion[]
  examClassAssignments ExamClassAssignment[]
  examSessions         ExamSession[]
  examResults          ExamResult[]
  resultExamLinks      ResultExamLink[]

  @@index([subjectId])
  @@index([createdById])
  @@index([academicSessionId])
  @@index([status])
  @@index([deliveryMode])
  @@index([scheduledStartAt])
  @@index([scheduledEndAt])
  @@index([type])
  @@index([deletedAt])
  @@index([subjectId, status])
  @@index([status, deliveryMode])
}

model ExamQuestion {
  id         String   @id @default(uuid())
  examId     String
  questionId String
  sortOrder  Int
  marks      Decimal
  isRequired Boolean  @default(true)
  createdAt  DateTime @default(now())

  exam           Exam            @relation(fields: [examId], references: [id], onDelete: Cascade)
  question       Question        @relation(fields: [questionId], references: [id])
  studentAnswers StudentAnswer[]

  @@unique([examId, sortOrder])
  @@index([examId])
  @@index([questionId])
}

model ExamClassAssignment {
  id        String   @id @default(uuid())
  examId    String
  classId   String
  sectionId String
  createdAt DateTime @default(now())

  exam    Exam    @relation(fields: [examId], references: [id], onDelete: Cascade)
  class   Class   @relation(fields: [classId], references: [id])
  section Section @relation(fields: [sectionId], references: [id])

  @@unique([examId, classId, sectionId])
  @@index([examId])
  @@index([classId])
  @@index([sectionId])
}

// ============================================
// EXAM SESSION TABLES
// ============================================

model ExamSession {
  id                String        @id @default(uuid())
  examId            String
  studentId         String
  attemptNumber     Int           @default(1)
  status            SessionStatus @default(NOT_STARTED)
  startedAt         DateTime?
  submittedAt       DateTime?
  timeSpent         Int?
  ipAddress         String?
  userAgent         String?
  tabSwitchCount    Int           @default(0)
  fullscreenExits   Int           @default(0)
  copyPasteAttempts Int           @default(0)
  isFlagged         Boolean       @default(false)
  enteredById       String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  exam           Exam            @relation(fields: [examId], references: [id])
  student        User            @relation(fields: [studentId], references: [id])
  enteredBy      User?           @relation("MarksEnteredBy", fields: [enteredById], references: [id])
  studentAnswers StudentAnswer[]
  examResult     ExamResult?

  @@unique([examId, studentId, attemptNumber])
  @@index([studentId])
  @@index([status])
  @@index([enteredById])
  @@index([examId, status])
}

model StudentAnswer {
  id                String    @id @default(uuid())
  sessionId         String
  examQuestionId    String
  answerText        String?
  selectedOptionId  String?
  isMarkedForReview Boolean   @default(false)
  answeredAt        DateTime?
  timeSpent         Int?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  session        ExamSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  examQuestion   ExamQuestion @relation(fields: [examQuestionId], references: [id])
  selectedOption McqOption?   @relation("SelectedOption", fields: [selectedOptionId], references: [id])
  answerGrade    AnswerGrade?

  @@unique([sessionId, examQuestionId])
  @@index([sessionId])
  @@index([examQuestionId])
}

// ============================================
// GRADING TABLES
// ============================================

model AnswerGrade {
  id               String    @id @default(uuid())
  studentAnswerId  String    @unique
  gradedBy         GradedBy
  graderId         String?
  marksAwarded     Decimal
  maxMarks         Decimal
  feedback         String?
  aiConfidence     Decimal?
  aiModelUsed      String?
  aiPromptTokens   Int?
  aiResponseTokens Int?
  isReviewed       Boolean   @default(false)
  reviewedAt       DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  studentAnswer StudentAnswer @relation(fields: [studentAnswerId], references: [id], onDelete: Cascade)
  grader        User?         @relation("GraderUser", fields: [graderId], references: [id])

  @@index([gradedBy])
  @@index([isReviewed])
  @@index([graderId])
}

model ExamResult {
  id            String    @id @default(uuid())
  sessionId     String    @unique
  examId        String
  studentId     String
  totalMarks    Decimal
  obtainedMarks Decimal
  percentage    Decimal
  grade         String?
  isPassed      Boolean
  rank          Int?
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  session ExamSession @relation(fields: [sessionId], references: [id])
  exam    Exam        @relation(fields: [examId], references: [id])
  student User        @relation(fields: [studentId], references: [id])

  @@index([examId])
  @@index([studentId])
  @@index([publishedAt])
  @@index([isPassed])
  @@index([examId, studentId])
  @@index([examId, isPassed])
  @@index([examId, percentage(sort: Desc)])
  @@index([examId, createdAt(sort: Desc)])
  @@index([studentId, createdAt(sort: Desc)])
}

// ============================================
// ACADEMIC SESSION
// ============================================

model AcademicSession {
  id        String   @id @default(uuid())
  name      String   @unique
  startDate DateTime
  endDate   DateTime
  isCurrent Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  exams                     Exam[]
  promotions                StudentPromotion[]
  testCampaigns             TestCampaign[]
  timetableEntries          TimetableEntry[]
  dailyAttendance           DailyAttendance[]
  subjectAttendance         SubjectAttendance[]
  diaryEntries              DiaryEntry[]
  datesheets                Datesheet[]
  studentSubjectEnrollments StudentSubjectEnrollment[]
  feeStructures             FeeStructure[]
  feeAssignments            FeeAssignment[]
  feeSettings               FeeSettings?
  feeCredits                FeeCredit[]
  studentFeeDiscounts       StudentFeeDiscount[]
  resultTerms               ResultTerm[]
  electiveSlotGroups        ElectiveSlotGroup[]

  @@index([isCurrent])
}

// ============================================
// STUDENT PROMOTION / YEAR TRANSITION
// ============================================

model StudentPromotion {
  id                String        @id @default(uuid())
  studentProfileId  String
  academicSessionId String
  fromClassId       String
  fromSectionId     String
  toClassId         String?
  toSectionId       String?
  status            StudentStatus
  remarks           String?
  promotedById      String
  promotedAt        DateTime      @default(now())
  createdAt         DateTime      @default(now())

  studentProfile  StudentProfile  @relation(fields: [studentProfileId], references: [id])
  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])
  fromClass       Class           @relation("PromotionFromClass", fields: [fromClassId], references: [id])
  fromSection     Section         @relation("PromotionFromSection", fields: [fromSectionId], references: [id])
  toClass         Class?          @relation("PromotionToClass", fields: [toClassId], references: [id])
  toSection       Section?        @relation("PromotionToSection", fields: [toSectionId], references: [id])
  promotedBy      User            @relation(fields: [promotedById], references: [id])

  @@index([studentProfileId])
  @@index([academicSessionId])
  @@index([fromClassId])
  @@index([fromSectionId])
  @@index([toClassId])
  @@index([toSectionId])
  @@index([promotedById])
  @@index([status])
}

// ============================================
// SYSTEM TABLES
// ============================================

model SchoolSettings {
  id           String   @id @default(uuid())
  schoolName   String
  schoolLogo   String?
  address      String?
  phone        String?
  email        String?
  website      String?
  gradingScale Json
  timezone     String   @default("Asia/Karachi")
  academicYear String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Report branding
  reportHeaderText   String? // Custom text below school name on reports
  principalName      String? // For signature blocks
  examControllerName String? // For signature blocks
  reportFooterText   String? // Custom disclaimer/footer on reports
  signatureImageUrl  String? // Principal's digital signature
  passingPercentage  Decimal @default(33) // Minimum percentage to pass
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String
  action     String
  entityType String
  entityId   String
  metadata   Json?
  ipAddress  String?
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([entityType])
  @@index([entityId])
  @@index([createdAt])
  @@index([action])
  @@index([entityType, entityId])
  @@index([userId, createdAt])
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  title     String
  message   String
  type      NotificationType
  isRead    Boolean          @default(false)
  actionUrl String?
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
  @@index([userId, isRead])
  @@index([userId, createdAt])
}

// ============================================
// PASSWORD RESET
// ============================================

model PasswordResetToken {
  id        String   @id @default(uuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([email])
}

// ============================================
// ADMISSION TEST CAMPAIGN
// ============================================

model TestCampaign {
  id                String         @id @default(uuid())
  name              String
  slug              String         @unique
  description       String?
  type              CampaignType
  status            CampaignStatus @default(DRAFT)
  academicSessionId String?
  targetClassId     String?
  targetClassGrade  Int?
  maxSeats          Int?

  // Registration window
  registrationStartAt DateTime?
  registrationEndAt   DateTime?

  // Test configuration
  testStartAt       DateTime?
  testEndAt         DateTime?
  testDuration      Int // minutes
  totalMarks        Decimal
  passingMarks      Decimal
  shuffleQuestions  Boolean   @default(false)
  shuffleOptions    Boolean   @default(false)
  allowCalculator   Boolean   @default(false)
  negativeMarking   Boolean   @default(false)
  negativeMarkValue Decimal? // e.g., 0.25 per wrong answer
  instructions      String?

  // Result configuration
  resultPublishAt       DateTime?
  showRankToApplicant   Boolean   @default(false)
  showScoreToApplicant  Boolean   @default(true)
  showCutoffToApplicant Boolean   @default(false)

  // Scholarship
  hasScholarship Boolean @default(false)

  // Eligibility
  eligibilityCriteria Json? // { minAge, maxAge, previousGradeMin, requiredDocuments }

  createdById String
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  academicSession       AcademicSession?          @relation(fields: [academicSessionId], references: [id])
  targetClass           Class?                    @relation(fields: [targetClassId], references: [id])
  createdBy             User                      @relation(fields: [createdById], references: [id])
  campaignQuestions     CampaignQuestion[]
  scholarshipTiers      CampaignScholarshipTier[]
  evaluationStages      CampaignEvaluationStage[]
  applicants            Applicant[]
  applicantResults      ApplicantResult[]
  applicantScholarships ApplicantScholarship[]
  admissionDecisions    AdmissionDecisionRecord[]

  @@index([status])
  @@index([type])
  @@index([createdById])
  @@index([academicSessionId])
  @@index([slug])
  @@index([deletedAt])
  @@index([registrationStartAt])
  @@index([testStartAt])
}

// ============================================
// CAMPAIGN QUESTIONS (links shared Question Bank to Campaign)
// ============================================

model CampaignQuestion {
  id           String   @id @default(uuid())
  campaignId   String
  questionId   String
  sortOrder    Int
  marks        Decimal
  isRequired   Boolean  @default(true)
  sectionLabel String?
  paperVersion String   @default("A") // Paper version: A, B, C, etc.
  createdAt    DateTime @default(now())

  campaign         TestCampaign      @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  question         Question          @relation(fields: [questionId], references: [id])
  applicantAnswers ApplicantAnswer[]

  @@unique([campaignId, paperVersion, sortOrder])
  @@unique([campaignId, questionId])
  @@index([campaignId])
  @@index([questionId])
  @@index([campaignId, paperVersion])
}

// ============================================
// CAMPAIGN SCHOLARSHIP TIERS
// ============================================

model CampaignScholarshipTier {
  id             String          @id @default(uuid())
  campaignId     String
  tier           ScholarshipTier
  name           String
  description    String?
  minPercentage  Decimal
  maxPercentage  Decimal?
  maxRecipients  Int
  benefitDetails String?
  isActive       Boolean         @default(true)
  sortOrder      Int
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  campaign              TestCampaign           @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  applicantScholarships ApplicantScholarship[]

  @@unique([campaignId, tier])
  @@index([campaignId])
}

// ============================================
// CAMPAIGN EVALUATION STAGES
// ============================================

model CampaignEvaluationStage {
  id               String          @id @default(uuid())
  campaignId       String
  stage            EvaluationStage
  name             String
  description      String?
  sortOrder        Int
  isRequired       Boolean         @default(true)
  weightPercentage Decimal?
  passingCriteria  String?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  campaign TestCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@unique([campaignId, stage])
  @@unique([campaignId, sortOrder])
  @@index([campaignId])
}

// ============================================
// APPLICANT (external candidate — isolated from User)
// ============================================

model Applicant {
  id             String    @id @default(uuid())
  campaignId     String
  firstName      String
  lastName       String
  email          String
  phone          String?
  dateOfBirth    DateTime?
  gender         Gender?
  guardianName   String?
  guardianPhone  String?
  guardianEmail  String?
  address        String?
  city           String?
  previousSchool String?
  previousClass  String?
  previousGrade  String?
  photoUrl       String?
  documentUrls   Json? // string[]

  // Application tracking
  status               ApplicantStatus @default(REGISTERED)
  applicationNumber    String          @unique
  accessToken          String          @unique // 6-digit numeric PIN (plaintext, rate-limited)
  accessTokenExpiresAt DateTime?
  paperVersion         String          @default("A") // Assigned paper version: A, B, C, etc.

  // Verification
  isEmailVerified Boolean   @default(false)
  isPhoneVerified Boolean   @default(false)
  emailOtp        String?
  phoneOtp        String?
  otpExpiresAt    DateTime?
  otpAttempts     Int       @default(0)

  // Metadata
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  campaign    TestCampaign              @relation(fields: [campaignId], references: [id])
  testSession ApplicantTestSession?
  result      ApplicantResult?
  scholarship ApplicantScholarship?
  decisions   AdmissionDecisionRecord[]

  @@unique([campaignId, email])
  @@index([campaignId])
  @@index([status])
  @@index([applicationNumber])
  @@index([email])
  @@index([createdAt])
}

// ============================================
// APPLICANT TEST SESSION
// ============================================

model ApplicantTestSession {
  id                 String        @id @default(uuid())
  applicantId        String        @unique
  campaignId         String
  status             SessionStatus @default(NOT_STARTED)
  startedAt          DateTime?
  submittedAt        DateTime?
  timeSpent          Int? // seconds
  ipAddress          String?
  userAgent          String?
  tabSwitchCount     Int           @default(0)
  fullscreenExits    Int           @default(0)
  copyPasteAttempts  Int           @default(0)
  browserFingerprint String?
  isFlagged          Boolean       @default(false)
  flagReason         String?
  questionOrder      Json? // string[] — shuffled question IDs
  optionOrders       Json? // { [questionId]: string[] } — shuffled option IDs
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  applicant        Applicant         @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  applicantAnswers ApplicantAnswer[]

  @@index([campaignId])
  @@index([status])
}

// ============================================
// APPLICANT ANSWER
// ============================================

model ApplicantAnswer {
  id                 String    @id @default(uuid())
  sessionId          String
  campaignQuestionId String
  answerText         String?
  selectedOptionId   String?
  isMarkedForReview  Boolean   @default(false)
  answeredAt         DateTime?
  timeSpent          Int? // seconds
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  session          ApplicantTestSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  campaignQuestion CampaignQuestion      @relation(fields: [campaignQuestionId], references: [id])
  selectedOption   McqOption?            @relation("ApplicantSelectedOption", fields: [selectedOptionId], references: [id])
  grade            ApplicantAnswerGrade?

  @@unique([sessionId, campaignQuestionId])
  @@index([sessionId])
  @@index([campaignQuestionId])
}

// ============================================
// APPLICANT ANSWER GRADE
// ============================================

model ApplicantAnswerGrade {
  id                String    @id @default(uuid())
  applicantAnswerId String    @unique
  gradedBy          GradedBy
  graderId          String?
  marksAwarded      Decimal
  maxMarks          Decimal
  feedback          String?
  aiConfidence      Decimal?
  aiModelUsed       String?
  aiPromptTokens    Int?
  aiResponseTokens  Int?
  aiReasoning       String?
  isReviewed        Boolean   @default(false)
  reviewedAt        DateTime?
  isNegativeMarked  Boolean   @default(false)
  negativeMarks     Decimal   @default(0)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  applicantAnswer ApplicantAnswer @relation(fields: [applicantAnswerId], references: [id], onDelete: Cascade)
  grader          User?           @relation("ApplicantGraderUser", fields: [graderId], references: [id])

  @@index([gradedBy])
  @@index([isReviewed])
}

// ============================================
// APPLICANT RESULT
// ============================================

model ApplicantResult {
  id            String    @id @default(uuid())
  applicantId   String    @unique
  campaignId    String
  totalMarks    Decimal
  obtainedMarks Decimal
  percentage    Decimal
  rank          Int?
  percentile    Decimal?
  grade         String?
  isPassed      Boolean
  sectionScores Json? // { [sectionLabel]: { marks, total, percentage } }
  computedAt    DateTime  @default(now())
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  applicant Applicant    @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  campaign  TestCampaign @relation(fields: [campaignId], references: [id])

  @@index([campaignId])
  @@index([percentage])
  @@index([rank])
  @@index([isPassed])
}

// ============================================
// APPLICANT SCHOLARSHIP
// ============================================

model ApplicantScholarship {
  id                String          @id @default(uuid())
  applicantId       String          @unique
  campaignId        String
  tierId            String
  tier              ScholarshipTier // denormalized for query performance
  percentageAwarded Decimal
  isAccepted        Boolean? // null = pending
  acceptedAt        DateTime?
  declinedAt        DateTime?
  validFrom         DateTime?
  validUntil        DateTime?
  isRenewable       Boolean         @default(false)
  renewalCriteria   Json? // { minPercentage, minAttendance, reviewPeriod }
  awardedAt         DateTime        @default(now())
  awardedById       String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  applicant       Applicant               @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  campaign        TestCampaign            @relation(fields: [campaignId], references: [id])
  scholarshipTier CampaignScholarshipTier @relation(fields: [tierId], references: [id])
  awardedBy       User?                   @relation("ScholarshipAwarder", fields: [awardedById], references: [id])

  @@index([campaignId])
  @@index([tier])
  @@index([isAccepted])
}

// ============================================
// ADMISSION DECISION RECORD (audit trail)
// ============================================

model AdmissionDecisionRecord {
  id                String                @id @default(uuid())
  applicantId       String
  campaignId        String
  decision          AdmissionDecisionType
  stage             EvaluationStage       @default(WRITTEN_TEST)
  remarks           String?
  conditions        String?
  assignedClassId   String?
  assignedSectionId String?
  decidedById       String
  decidedAt         DateTime              @default(now())
  createdAt         DateTime              @default(now())

  applicant       Applicant    @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  campaign        TestCampaign @relation(fields: [campaignId], references: [id])
  assignedClass   Class?       @relation(fields: [assignedClassId], references: [id])
  assignedSection Section?     @relation(fields: [assignedSectionId], references: [id])
  decidedBy       User         @relation(fields: [decidedById], references: [id])

  @@index([applicantId])
  @@index([campaignId])
  @@index([decision])
  @@index([decidedAt])
  @@index([decidedById])
  @@index([assignedClassId])
  @@index([assignedSectionId])
}

// ============================================
// TIMETABLE SYSTEM
// ============================================

model PeriodSlot {
  id        String   @id @default(uuid())
  name      String
  shortName String
  startTime String // HH:mm format (e.g., "08:00")
  endTime   String // HH:mm format (e.g., "08:45")
  sortOrder Int
  isBreak   Boolean  @default(false)
  isActive  Boolean  @default(true)
  classId   String? // null = global, set = class-level or section-level override
  sectionId String? // null = global/class-level, set = section-specific override
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  class              Class?              @relation(fields: [classId], references: [id])
  section            Section?            @relation(fields: [sectionId], references: [id])
  timetableEntries   TimetableEntry[]
  subjectAttendance  SubjectAttendance[]
  electiveSlotGroups ElectiveSlotGroup[]

  @@unique([sortOrder, classId, sectionId])
  @@index([isActive])
  @@index([sortOrder])
  @@index([classId])
  @@index([sectionId])
}

model ElectiveSlotGroup {
  id                String    @id @default(uuid())
  classId           String
  sectionId         String
  periodSlotId      String
  dayOfWeek         DayOfWeek
  academicSessionId String
  name              String? // Optional label: "Science Elective Block"
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  class           Class            @relation(fields: [classId], references: [id])
  section         Section          @relation(fields: [sectionId], references: [id])
  periodSlot      PeriodSlot       @relation(fields: [periodSlotId], references: [id])
  academicSession AcademicSession  @relation(fields: [academicSessionId], references: [id])
  entries         TimetableEntry[]

  @@unique([classId, sectionId, periodSlotId, dayOfWeek, academicSessionId])
  @@index([classId, sectionId, academicSessionId])
  @@index([periodSlotId, dayOfWeek])
}

model TimetableEntry {
  id                  String    @id @default(uuid())
  classId             String
  sectionId           String
  subjectId           String
  teacherProfileId    String
  periodSlotId        String
  dayOfWeek           DayOfWeek
  academicSessionId   String
  room                String?
  isElectiveSlot      Boolean   @default(false)
  electiveSlotGroupId String?
  isActive            Boolean   @default(true)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  class             Class               @relation(fields: [classId], references: [id])
  section           Section             @relation(fields: [sectionId], references: [id])
  subject           Subject             @relation(fields: [subjectId], references: [id])
  teacherProfile    TeacherProfile      @relation(fields: [teacherProfileId], references: [id])
  periodSlot        PeriodSlot          @relation(fields: [periodSlotId], references: [id])
  academicSession   AcademicSession     @relation(fields: [academicSessionId], references: [id])
  electiveSlotGroup ElectiveSlotGroup?  @relation(fields: [electiveSlotGroupId], references: [id])
  subjectAttendance SubjectAttendance[]

  @@unique([classId, sectionId, subjectId, periodSlotId, dayOfWeek, academicSessionId])
  @@index([teacherProfileId, dayOfWeek, academicSessionId])
  @@index([classId, sectionId, academicSessionId])
  @@index([electiveSlotGroupId])
  @@index([periodSlotId])
  @@index([isActive])
  @@index([subjectId])
  @@index([academicSessionId])
  @@index([dayOfWeek])
  @@index([isElectiveSlot])
}

// ============================================
// ATTENDANCE SYSTEM
// ============================================

model DailyAttendance {
  id                String           @id @default(uuid())
  studentProfileId  String
  classId           String
  sectionId         String
  date              DateTime         @db.Date
  status            AttendanceStatus
  remarks           String?
  markedById        String
  academicSessionId String
  isEdited          Boolean          @default(false)
  editedById        String?
  editedAt          DateTime?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  studentProfile  StudentProfile  @relation(fields: [studentProfileId], references: [id])
  class           Class           @relation(fields: [classId], references: [id])
  section         Section         @relation(fields: [sectionId], references: [id])
  markedBy        User            @relation("DailyAttendanceMarker", fields: [markedById], references: [id])
  editedBy        User?           @relation("DailyAttendanceEditor", fields: [editedById], references: [id])
  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])

  @@unique([studentProfileId, date, academicSessionId])
  @@index([classId, sectionId, date])
  @@index([date, academicSessionId])
  @@index([markedById])
  @@index([editedById])
  @@index([academicSessionId])
  @@index([status])
}

model SubjectAttendance {
  id                String           @id @default(uuid())
  studentProfileId  String
  classId           String
  sectionId         String
  subjectId         String
  timetableEntryId  String?
  periodSlotId      String
  date              DateTime         @db.Date
  status            AttendanceStatus
  remarks           String?
  markedById        String
  academicSessionId String
  isEdited          Boolean          @default(false)
  editedById        String?
  editedAt          DateTime?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  studentProfile  StudentProfile  @relation(fields: [studentProfileId], references: [id])
  class           Class           @relation(fields: [classId], references: [id])
  section         Section         @relation(fields: [sectionId], references: [id])
  subject         Subject         @relation(fields: [subjectId], references: [id])
  timetableEntry  TimetableEntry? @relation(fields: [timetableEntryId], references: [id])
  periodSlot      PeriodSlot      @relation(fields: [periodSlotId], references: [id])
  markedBy        User            @relation("SubjectAttendanceMarker", fields: [markedById], references: [id])
  editedBy        User?           @relation("SubjectAttendanceEditor", fields: [editedById], references: [id])
  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])

  @@unique([studentProfileId, subjectId, periodSlotId, date, academicSessionId])
  @@index([classId, sectionId, date, periodSlotId])
  @@index([subjectId, date])
  @@index([markedById])
  @@index([editedById])
  @@index([academicSessionId])
  @@index([studentProfileId, date])
  @@index([status])
  @@index([timetableEntryId])
}

// ============================================
// DIARY SYSTEM
// ============================================

model DiaryEntry {
  id                String      @id @default(uuid())
  teacherProfileId  String
  classId           String
  sectionId         String
  subjectId         String
  academicSessionId String
  date              DateTime    @db.Date
  title             String      @db.VarChar(255)
  content           String      @db.Text
  status            DiaryStatus @default(PUBLISHED)
  isEdited          Boolean     @default(false)
  editedAt          DateTime?
  deletedAt         DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  teacherProfile  TeacherProfile       @relation(fields: [teacherProfileId], references: [id])
  class           Class                @relation(fields: [classId], references: [id])
  section         Section              @relation(fields: [sectionId], references: [id])
  subject         Subject              @relation(fields: [subjectId], references: [id])
  academicSession AcademicSession      @relation(fields: [academicSessionId], references: [id])
  readReceipts    DiaryReadReceipt[]
  principalNotes  DiaryPrincipalNote[]

  @@unique([teacherProfileId, classId, sectionId, subjectId, date, academicSessionId])
  @@index([classId, sectionId, date])
  @@index([teacherProfileId, date])
  @@index([subjectId, date])
  @@index([academicSessionId])
  @@index([date, status])
  @@index([deletedAt])
}

model DiaryReadReceipt {
  id               String   @id @default(uuid())
  diaryEntryId     String
  studentProfileId String
  readAt           DateTime @default(now())

  diaryEntry     DiaryEntry     @relation(fields: [diaryEntryId], references: [id], onDelete: Cascade)
  studentProfile StudentProfile @relation(fields: [studentProfileId], references: [id])

  @@unique([diaryEntryId, studentProfileId])
  @@index([diaryEntryId])
  @@index([studentProfileId])
}

model DiaryPrincipalNote {
  id           String   @id @default(uuid())
  diaryEntryId String
  principalId  String
  note         String   @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  diaryEntry DiaryEntry @relation(fields: [diaryEntryId], references: [id], onDelete: Cascade)
  principal  User       @relation(fields: [principalId], references: [id])

  @@index([diaryEntryId])
  @@index([principalId])
}

// ============================================
// DATESHEET SYSTEM
// ============================================

model Datesheet {
  id                String          @id @default(uuid())
  title             String
  description       String?
  examType          ExamType
  academicSessionId String
  status            DatesheetStatus @default(DRAFT)
  startDate         DateTime        @db.Date
  endDate           DateTime        @db.Date
  publishedAt       DateTime?
  publishedById     String?
  createdById       String
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  academicSession AcademicSession  @relation(fields: [academicSessionId], references: [id])
  publishedBy     User?            @relation("DatesheetPublisher", fields: [publishedById], references: [id])
  createdBy       User             @relation("DatesheetCreator", fields: [createdById], references: [id])
  entries         DatesheetEntry[]

  @@index([academicSessionId])
  @@index([status])
  @@index([examType])
  @@index([startDate, endDate])
  @@index([publishedById])
  @@index([createdById])
}

model DatesheetEntry {
  id           String   @id @default(uuid())
  datesheetId  String
  classId      String
  sectionId    String
  subjectId    String
  examDate     DateTime @db.Date
  startTime    String // HH:mm format
  endTime      String // HH:mm format
  room         String?
  instructions String?
  totalMarks   Decimal?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  datesheet Datesheet       @relation(fields: [datesheetId], references: [id], onDelete: Cascade)
  class     Class           @relation(fields: [classId], references: [id])
  section   Section         @relation(fields: [sectionId], references: [id])
  subject   Subject         @relation(fields: [subjectId], references: [id])
  duties    DatesheetDuty[]

  @@unique([datesheetId, classId, sectionId, subjectId, examDate])
  @@index([datesheetId])
  @@index([classId, sectionId])
  @@index([examDate])
  @@index([subjectId])
  @@index([sectionId])
}

model DatesheetDuty {
  id               String   @id @default(uuid())
  datesheetEntryId String
  teacherProfileId String
  role             String   @default("INVIGILATOR")
  room             String?
  notes            String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  datesheetEntry DatesheetEntry @relation(fields: [datesheetEntryId], references: [id], onDelete: Cascade)
  teacherProfile TeacherProfile @relation(fields: [teacherProfileId], references: [id])

  @@unique([datesheetEntryId, teacherProfileId])
  @@index([teacherProfileId])
  @@index([datesheetEntryId])
}

// ============================================
// FEE MANAGEMENT ENUMS
// ============================================

enum FeeFrequency {
  MONTHLY
  TERM
  ANNUAL
  ONE_TIME
}

enum FeeAssignmentStatus {
  PENDING
  PARTIAL
  PAID
  OVERDUE
  CANCELLED
  WAIVED
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  ONLINE
  CHEQUE
}

enum PaymentStatus {
  COMPLETED
  REVERSED
}

enum AllocationStrategy {
  OLDEST_FIRST
  CHILD_PRIORITY
  EQUAL_SPLIT
  MANUAL
  CUSTOM
}

// ============================================
// FEE MANAGEMENT MODELS
// ============================================

model FeeCategory {
  id           String       @id @default(uuid())
  name         String       @unique
  description  String?
  frequency    FeeFrequency
  isMandatory  Boolean      @default(true)
  isRefundable Boolean      @default(false)
  isActive     Boolean      @default(true)
  sortOrder    Int          @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  structures       FeeStructure[]
  studentDiscounts StudentFeeDiscount[]

  @@index([isActive])
  @@index([frequency])
}

model FeeStructure {
  id                String   @id @default(uuid())
  categoryId        String
  classId           String
  academicSessionId String
  amount            Decimal  @db.Decimal(12, 2)
  effectiveFrom     DateTime @default(now())
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  category        FeeCategory     @relation(fields: [categoryId], references: [id])
  class           Class           @relation(fields: [classId], references: [id])
  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])
  lineItems       FeeLineItem[]

  @@unique([categoryId, classId, academicSessionId])
  @@index([classId, academicSessionId])
  @@index([categoryId])
}

model FeeAssignment {
  id                String              @id @default(uuid())
  studentProfileId  String
  academicSessionId String
  generatedForMonth String              @db.VarChar(7) // "2026-01" format
  totalAmount       Decimal             @db.Decimal(12, 2)
  paidAmount        Decimal             @default(0) @db.Decimal(12, 2)
  balanceAmount     Decimal             @db.Decimal(12, 2)
  discountAmount    Decimal             @default(0) @db.Decimal(12, 2)
  lateFeesApplied   Decimal             @default(0) @db.Decimal(12, 2)
  dueDate           DateTime
  status            FeeAssignmentStatus @default(PENDING)
  generatedById     String
  cancelledById     String?
  cancelReason      String?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  studentProfile  StudentProfile  @relation(fields: [studentProfileId], references: [id])
  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])
  generatedBy     User            @relation("FeeGeneratedBy", fields: [generatedById], references: [id])
  lineItems       FeeLineItem[]
  payments        FeePayment[]
  discounts       FeeDiscount[]

  @@unique([studentProfileId, academicSessionId, generatedForMonth])
  @@index([studentProfileId, academicSessionId])
  @@index([academicSessionId, generatedForMonth])
  @@index([academicSessionId, status, dueDate])
  @@index([status])
  @@index([dueDate])
  @@index([generatedForMonth, status])
}

model FeeLineItem {
  id              String  @id @default(uuid())
  feeAssignmentId String
  feeStructureId  String
  categoryName    String // denormalized for receipt display
  amount          Decimal @db.Decimal(12, 2)

  feeAssignment FeeAssignment @relation(fields: [feeAssignmentId], references: [id], onDelete: Cascade)
  feeStructure  FeeStructure  @relation(fields: [feeStructureId], references: [id])

  @@index([feeAssignmentId])
}

model FeeDiscount {
  id              String   @id @default(uuid())
  feeAssignmentId String
  reason          String
  amount          Decimal  @db.Decimal(12, 2)
  appliedById     String
  createdAt       DateTime @default(now())

  feeAssignment FeeAssignment @relation(fields: [feeAssignmentId], references: [id])
  appliedBy     User          @relation("DiscountAppliedBy", fields: [appliedById], references: [id])

  @@index([feeAssignmentId])
}

model FeePayment {
  id              String        @id @default(uuid())
  feeAssignmentId String
  familyPaymentId String?
  amount          Decimal       @db.Decimal(12, 2)
  paymentMethod   PaymentMethod
  referenceNumber String?
  receiptNumber   String        @unique
  status          PaymentStatus @default(COMPLETED)
  reversedById    String?
  reversalReason  String?
  reversedAt      DateTime?
  recordedById    String
  paidAt          DateTime      @default(now())
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  feeAssignment FeeAssignment  @relation(fields: [feeAssignmentId], references: [id])
  familyPayment FamilyPayment? @relation(fields: [familyPaymentId], references: [id])
  recordedBy    User           @relation("PaymentRecordedBy", fields: [recordedById], references: [id])

  @@index([feeAssignmentId, status])
  @@index([familyPaymentId])
  @@index([receiptNumber])
  @@index([status])
  @@index([paidAt])
}

model FamilyPayment {
  id                  String             @id @default(uuid())
  familyProfileId     String
  totalAmount         Decimal            @db.Decimal(12, 2)
  paymentMethod       PaymentMethod
  referenceNumber     String?
  masterReceiptNumber String             @unique
  allocationStrategy  AllocationStrategy
  allocationDetails   Json?
  status              PaymentStatus      @default(COMPLETED)
  reversedById        String?
  reversalReason      String?
  reversedAt          DateTime?
  recordedById        String
  paidAt              DateTime           @default(now())
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  familyProfile FamilyProfile @relation(fields: [familyProfileId], references: [id])
  recordedBy    User          @relation("FamilyPaymentRecordedBy", fields: [recordedById], references: [id])
  childPayments FeePayment[]

  @@index([familyProfileId])
  @@index([masterReceiptNumber])
  @@index([status])
  @@index([paidAt])
}

model FeeSettings {
  id                  String   @id @default(uuid())
  dueDayOfMonth       Int      @default(10)
  lateFeePerDay       Decimal  @default(0) @db.Decimal(10, 2)
  maxLateFee          Decimal  @default(0) @db.Decimal(10, 2)
  receiptPrefix       String   @default("FRCP")
  familyReceiptPrefix String   @default("FMRC")
  gracePeriodDays     Int      @default(0)
  academicSessionId   String   @unique
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])
}

// Advance credit: stores excess payments for auto-apply on next fee generation
model FeeCredit {
  id                String       @id @default(uuid())
  studentProfileId  String
  familyProfileId   String?
  academicSessionId String
  amount            Decimal      @db.Decimal(12, 2)
  remainingAmount   Decimal      @db.Decimal(12, 2)
  reason            String // e.g. "Advance payment", "Overpayment refund credit"
  referenceNumber   String? // links to receipt or family receipt
  status            CreditStatus @default(ACTIVE)
  createdById       String
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  studentProfile  StudentProfile  @relation(fields: [studentProfileId], references: [id])
  familyProfile   FamilyProfile?  @relation(fields: [familyProfileId], references: [id])
  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])
  createdBy       User            @relation("CreditCreatedBy", fields: [createdById], references: [id])

  @@index([studentProfileId, status])
  @@index([familyProfileId, status])
  @@index([academicSessionId])
}

enum CreditStatus {
  ACTIVE
  EXHAUSTED
  REFUNDED
}

// ── Permanent student-level fee discount (negotiated at admission time) ──
// This is a RECURRING discount: when fees are generated, this discount is
// auto-applied to each new FeeAssignment. e.g. "Parent bargained Rs. 500 off"
// or "Staff child — 100% tuition waiver". Tracks who approved, reason, and
// optional category-level granularity.

enum StudentDiscountType {
  FLAT // Fixed amount off per month (e.g. Rs. 500 off)
  PERCENTAGE // Percentage off (e.g. 10% off total)
}

model StudentFeeDiscount {
  id                String              @id @default(uuid())
  studentProfileId  String
  academicSessionId String
  discountType      StudentDiscountType
  value             Decimal             @db.Decimal(12, 2) // amount for FLAT, percentage for PERCENTAGE
  reason            String // e.g. "Admission negotiation", "Staff child", "Scholarship 50%"
  feeCategoryId     String? // null = applies to ALL categories, set = only this category
  isActive          Boolean             @default(true)
  validFrom         DateTime            @default(now())
  validUntil        DateTime? // null = no expiry (permanent for the session)
  approvedById      String // admin/principal who approved
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  studentProfile  StudentProfile  @relation(fields: [studentProfileId], references: [id])
  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])
  feeCategory     FeeCategory?    @relation(fields: [feeCategoryId], references: [id])
  approvedBy      User            @relation("StudentDiscountCreatedBy", fields: [approvedById], references: [id])

  @@unique([studentProfileId, academicSessionId, feeCategoryId])
  @@index([studentProfileId, academicSessionId, isActive])
  @@index([academicSessionId])
}

// ============================================
// STUDENT SUBJECT ENROLLMENT (Electives Support)
// ============================================

model StudentSubjectEnrollment {
  id                String   @id @default(uuid())
  studentProfileId  String
  subjectId         String
  classId           String
  academicSessionId String
  isActive          Boolean  @default(true)
  enrolledAt        DateTime @default(now())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  studentProfile  StudentProfile  @relation(fields: [studentProfileId], references: [id], onDelete: Cascade)
  subject         Subject         @relation(fields: [subjectId], references: [id])
  class           Class           @relation(fields: [classId], references: [id])
  academicSession AcademicSession @relation(fields: [academicSessionId], references: [id])

  @@unique([studentProfileId, subjectId, academicSessionId])
  @@index([studentProfileId, academicSessionId])
  @@index([classId, subjectId, academicSessionId])
  @@index([subjectId])
}

// ============================================
// REPORT & CONSOLIDATED RESULT SYSTEM
// ============================================

model ResultTerm {
  id                String    @id @default(uuid())
  name              String
  academicSessionId String
  classId           String
  description       String?
  isActive          Boolean   @default(true)
  isPublished       Boolean   @default(false)
  isComputing       Boolean   @default(false) // Lock to prevent concurrent computation
  lockOwner         String?
  lockAcquiredAt    DateTime?
  lockExpiresAt     DateTime?
  publishedAt       DateTime?
  computedAt        DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  academicSession       AcademicSession              @relation(fields: [academicSessionId], references: [id])
  class                 Class                        @relation(fields: [classId], references: [id])
  examGroups            ResultExamGroup[]
  consolidatedResults   ConsolidatedResult[]
  consolidatedSummaries ConsolidatedStudentSummary[]

  @@unique([name, academicSessionId, classId])
  @@index([academicSessionId])
  @@index([classId])
  @@index([isPublished])
  @@index([isActive])
  @@index([isComputing, lockExpiresAt])
}

model ResultExamGroup {
  id            String        @id @default(uuid())
  resultTermId  String
  name          String
  weight        Decimal       @db.Decimal(5, 2) // percentage weight e.g. 30.00
  aggregateMode AggregateMode @default(SINGLE)
  bestOfCount   Int? // Only used when aggregateMode = BEST_OF
  sortOrder     Int
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  resultTerm ResultTerm       @relation(fields: [resultTermId], references: [id], onDelete: Cascade)
  examLinks  ResultExamLink[]

  @@unique([resultTermId, sortOrder])
  @@unique([resultTermId, name])
  @@index([resultTermId])
}

model ResultExamLink {
  id          String   @id @default(uuid())
  examGroupId String
  examId      String
  createdAt   DateTime @default(now())

  examGroup ResultExamGroup @relation(fields: [examGroupId], references: [id], onDelete: Cascade)
  exam      Exam            @relation(fields: [examId], references: [id])

  @@unique([examGroupId, examId])
  @@index([examGroupId])
  @@index([examId])
}

model ConsolidatedResult {
  id           String @id @default(uuid())
  resultTermId String
  studentId    String // User.id
  subjectId    String

  // Per-group breakdown (JSON for flexibility)
  // Array of { groupId, groupName, obtained, total, percentage, status }
  groupScores Json

  // Consolidated scores
  totalMarks    Decimal @db.Decimal(10, 2)
  obtainedMarks Decimal @db.Decimal(10, 2)
  percentage    Decimal @db.Decimal(5, 2)
  grade         String?
  isPassed      Boolean
  isStale       Boolean @default(false) // true = needs recomputation

  // Rankings
  rankInClass   Int?
  rankInSection Int?

  computedAt DateTime @default(now())
  updatedAt  DateTime @updatedAt

  resultTerm ResultTerm @relation(fields: [resultTermId], references: [id], onDelete: Cascade)
  student    User       @relation(fields: [studentId], references: [id])
  subject    Subject    @relation(fields: [subjectId], references: [id])

  @@unique([resultTermId, studentId, subjectId])
  @@index([resultTermId, studentId])
  @@index([resultTermId, subjectId])
  @@index([resultTermId, rankInClass])
  @@index([resultTermId, rankInSection])
  @@index([isStale])
}

model ConsolidatedStudentSummary {
  id           String @id @default(uuid())
  resultTermId String
  studentId    String // User.id
  sectionId    String // Student's section at time of computation

  totalSubjects  Int
  passedSubjects Int
  failedSubjects Int

  grandTotalMarks    Decimal @db.Decimal(10, 2)
  grandObtainedMarks Decimal @db.Decimal(10, 2)
  overallPercentage  Decimal @db.Decimal(5, 2)
  overallGrade       String?
  isOverallPassed    Boolean

  rankInClass   Int?
  rankInSection Int?

  // Attendance for the period
  attendancePercentage Decimal? @db.Decimal(5, 2)
  totalDays            Int?
  presentDays          Int?

  // Remarks
  classTeacherRemarks String? @db.Text
  principalRemarks    String? @db.Text

  isStale    Boolean  @default(false)
  computedAt DateTime @default(now())
  updatedAt  DateTime @updatedAt

  resultTerm ResultTerm @relation(fields: [resultTermId], references: [id], onDelete: Cascade)
  student    User       @relation(fields: [studentId], references: [id])

  @@unique([resultTermId, studentId])
  @@index([resultTermId, rankInClass])
  @@index([resultTermId, rankInSection])
  @@index([resultTermId, overallPercentage])
  @@index([resultTermId, sectionId])
  @@index([isStale])
}
`,
      "inlineSchemaHash": "f9bc5917319e62e68add44c2d1900f99c52f8deb79d09739237154a484c91409",
      "copyEngine": true
    };
    var fs = __require("fs");
    config.dirname = __dirname;
    if (!fs.existsSync(path.join(__dirname, "schema.prisma"))) {
      const alternativePaths = [
        "node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client",
        ".pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client"
      ];
      const alternativePath = alternativePaths.find((altPath) => {
        return fs.existsSync(path.join(process.cwd(), altPath, "schema.prisma"));
      }) ?? alternativePaths[0];
      config.dirname = path.join(process.cwd(), alternativePath);
      config.isBundled = true;
    }
    config.runtimeDataModel = JSON.parse('{"models":{"User":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"email","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"passwordHash","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"firstName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"lastName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"role","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"UserRole","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"phone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"avatarUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"lastLoginAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"deletedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"studentProfile","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"StudentProfileToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"teacherProfile","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TeacherProfile","nativeType":null,"relationName":"TeacherProfileToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"familyProfile","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FamilyProfile","nativeType":null,"relationName":"FamilyProfileToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"questions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Question","nativeType":null,"relationName":"QuestionToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"examsCreated","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Exam","nativeType":null,"relationName":"ExamToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"examSessions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamSession","nativeType":null,"relationName":"ExamSessionToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"answerGrades","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AnswerGrade","nativeType":null,"relationName":"GraderUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"examResults","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamResult","nativeType":null,"relationName":"ExamResultToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"sessionsEntered","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamSession","nativeType":null,"relationName":"MarksEnteredBy","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"auditLogs","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AuditLog","nativeType":null,"relationName":"AuditLogToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"notifications","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Notification","nativeType":null,"relationName":"NotificationToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"promotionsDone","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentPromotion","nativeType":null,"relationName":"StudentPromotionToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"campaignsCreated","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TestCampaign","nativeType":null,"relationName":"TestCampaignToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"applicantGrades","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantAnswerGrade","nativeType":null,"relationName":"ApplicantGraderUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"scholarshipsAwarded","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantScholarship","nativeType":null,"relationName":"ScholarshipAwarder","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"admissionDecisionsMade","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AdmissionDecisionRecord","nativeType":null,"relationName":"AdmissionDecisionRecordToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"dailyAttendanceMarked","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DailyAttendance","nativeType":null,"relationName":"DailyAttendanceMarker","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"dailyAttendanceEdited","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DailyAttendance","nativeType":null,"relationName":"DailyAttendanceEditor","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectAttendanceMarked","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"SubjectAttendance","nativeType":null,"relationName":"SubjectAttendanceMarker","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectAttendanceEdited","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"SubjectAttendance","nativeType":null,"relationName":"SubjectAttendanceEditor","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"classTeacherSections","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"ClassTeacher","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"diaryPrincipalNotes","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DiaryPrincipalNote","nativeType":null,"relationName":"DiaryPrincipalNoteToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"familyStudentLinksCreated","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FamilyStudentLink","nativeType":null,"relationName":"LinkCreator","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"publishedDatesheets","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Datesheet","nativeType":null,"relationName":"DatesheetPublisher","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdDatesheets","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Datesheet","nativeType":null,"relationName":"DatesheetCreator","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"feesGenerated","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeAssignment","nativeType":null,"relationName":"FeeGeneratedBy","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"discountsApplied","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeDiscount","nativeType":null,"relationName":"DiscountAppliedBy","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"paymentsRecorded","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeePayment","nativeType":null,"relationName":"PaymentRecordedBy","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"familyPaymentsRecorded","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FamilyPayment","nativeType":null,"relationName":"FamilyPaymentRecordedBy","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"creditsCreated","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeCredit","nativeType":null,"relationName":"CreditCreatedBy","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"studentDiscountsCreated","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentFeeDiscount","nativeType":null,"relationName":"StudentDiscountCreatedBy","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"consolidatedResults","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ConsolidatedResult","nativeType":null,"relationName":"ConsolidatedResultToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"consolidatedStudentSummaries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ConsolidatedStudentSummary","nativeType":null,"relationName":"ConsolidatedStudentSummaryToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"StudentProfile":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"rollNumber","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"registrationNo","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"StudentStatus","nativeType":null,"default":"ACTIVE","isGenerated":false,"isUpdatedAt":false},{"name":"guardianName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"guardianPhone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"dateOfBirth","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"gender","kind":"enum","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Gender","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"enrollmentDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"StudentProfileToUser","relationFromFields":["userId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToStudentProfile","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"section","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"SectionToStudentProfile","relationFromFields":["sectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"promotions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentPromotion","nativeType":null,"relationName":"StudentProfileToStudentPromotion","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"dailyAttendance","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DailyAttendance","nativeType":null,"relationName":"DailyAttendanceToStudentProfile","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectAttendance","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"SubjectAttendance","nativeType":null,"relationName":"StudentProfileToSubjectAttendance","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"diaryReadReceipts","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DiaryReadReceipt","nativeType":null,"relationName":"DiaryReadReceiptToStudentProfile","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"familyLinks","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FamilyStudentLink","nativeType":null,"relationName":"FamilyStudentLinkToStudentProfile","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectEnrollments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentSubjectEnrollment","nativeType":null,"relationName":"StudentProfileToStudentSubjectEnrollment","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"feeAssignments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeAssignment","nativeType":null,"relationName":"FeeAssignmentToStudentProfile","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"feeCredits","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeCredit","nativeType":null,"relationName":"FeeCreditToStudentProfile","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"feeDiscountsApplied","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentFeeDiscount","nativeType":null,"relationName":"StudentFeeDiscountToStudentProfile","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"TeacherProfile":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"employeeId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"qualification","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"specialization","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"joiningDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"TeacherProfileToUser","relationFromFields":["userId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"teacherSubjects","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TeacherSubject","nativeType":null,"relationName":"TeacherProfileToTeacherSubject","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"timetableEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TimetableEntry","nativeType":null,"relationName":"TeacherProfileToTimetableEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"diaryEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DiaryEntry","nativeType":null,"relationName":"DiaryEntryToTeacherProfile","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"datesheetDuties","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DatesheetDuty","nativeType":null,"relationName":"DatesheetDutyToTeacherProfile","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"FamilyProfile":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"relationship","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["VarChar",["100"]],"isGenerated":false,"isUpdatedAt":false},{"name":"occupation","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["VarChar",["200"]],"isGenerated":false,"isUpdatedAt":false},{"name":"address","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"emergencyPhone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["VarChar",["20"]],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"FamilyProfileToUser","relationFromFields":["userId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"studentLinks","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FamilyStudentLink","nativeType":null,"relationName":"FamilyProfileToFamilyStudentLink","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"familyPayments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FamilyPayment","nativeType":null,"relationName":"FamilyPaymentToFamilyProfile","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"feeCredits","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeCredit","nativeType":null,"relationName":"FamilyProfileToFeeCredit","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"FamilyStudentLink":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"familyProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"studentProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"relationship","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["VarChar",["100"]],"isGenerated":false,"isUpdatedAt":false},{"name":"isPrimary","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"linkedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"linkedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"familyProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FamilyProfile","nativeType":null,"relationName":"FamilyProfileToFamilyStudentLink","relationFromFields":["familyProfileId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"studentProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"FamilyStudentLinkToStudentProfile","relationFromFields":["studentProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"linkedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"LinkCreator","relationFromFields":["linkedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["familyProfileId","studentProfileId"]],"uniqueIndexes":[{"name":null,"fields":["familyProfileId","studentProfileId"]}],"isGenerated":false},"Department":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"subjects","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Subject","nativeType":null,"relationName":"DepartmentToSubject","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Subject":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"code","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"departmentId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"department","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Department","nativeType":null,"relationName":"DepartmentToSubject","relationFromFields":["departmentId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"teacherSubjects","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TeacherSubject","nativeType":null,"relationName":"SubjectToTeacherSubject","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"questions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Question","nativeType":null,"relationName":"QuestionToSubject","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"exams","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Exam","nativeType":null,"relationName":"ExamToSubject","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectClassLinks","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"SubjectClassLink","nativeType":null,"relationName":"SubjectToSubjectClassLink","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"timetableEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TimetableEntry","nativeType":null,"relationName":"SubjectToTimetableEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectAttendance","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"SubjectAttendance","nativeType":null,"relationName":"SubjectToSubjectAttendance","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"diaryEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DiaryEntry","nativeType":null,"relationName":"DiaryEntryToSubject","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"datesheetEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DatesheetEntry","nativeType":null,"relationName":"DatesheetEntryToSubject","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"studentSubjectEnrollments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentSubjectEnrollment","nativeType":null,"relationName":"StudentSubjectEnrollmentToSubject","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"consolidatedResults","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ConsolidatedResult","nativeType":null,"relationName":"ConsolidatedResultToSubject","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"SubjectClassLink":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"subjectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"syllabus","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isElective","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"electiveGroupName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"subject","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Subject","nativeType":null,"relationName":"SubjectToSubjectClassLink","relationFromFields":["subjectId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToSubjectClassLink","relationFromFields":["classId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["subjectId","classId"]],"uniqueIndexes":[{"name":null,"fields":["subjectId","classId"]}],"isGenerated":false},"TeacherSubject":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"teacherId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"subjectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"teacher","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TeacherProfile","nativeType":null,"relationName":"TeacherProfileToTeacherSubject","relationFromFields":["teacherId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"subject","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Subject","nativeType":null,"relationName":"SubjectToTeacherSubject","relationFromFields":["subjectId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToTeacherSubject","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"section","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"SectionToTeacherSubject","relationFromFields":["sectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["teacherId","subjectId","classId","sectionId"]],"uniqueIndexes":[{"name":null,"fields":["teacherId","subjectId","classId","sectionId"]}],"isGenerated":false},"Class":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"grade","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"sections","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"ClassToSection","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"students","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"ClassToStudentProfile","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"examClassAssignments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamClassAssignment","nativeType":null,"relationName":"ClassToExamClassAssignment","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectClassLinks","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"SubjectClassLink","nativeType":null,"relationName":"ClassToSubjectClassLink","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"questions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Question","nativeType":null,"relationName":"ClassToQuestion","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"teacherSubjects","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TeacherSubject","nativeType":null,"relationName":"ClassToTeacherSubject","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"promotionsFrom","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentPromotion","nativeType":null,"relationName":"PromotionFromClass","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"promotionsTo","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentPromotion","nativeType":null,"relationName":"PromotionToClass","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"testCampaigns","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TestCampaign","nativeType":null,"relationName":"ClassToTestCampaign","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"admissionPlacements","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AdmissionDecisionRecord","nativeType":null,"relationName":"AdmissionDecisionRecordToClass","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"timetableEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TimetableEntry","nativeType":null,"relationName":"ClassToTimetableEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"dailyAttendance","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DailyAttendance","nativeType":null,"relationName":"ClassToDailyAttendance","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectAttendance","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"SubjectAttendance","nativeType":null,"relationName":"ClassToSubjectAttendance","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"diaryEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DiaryEntry","nativeType":null,"relationName":"ClassToDiaryEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"datesheetEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DatesheetEntry","nativeType":null,"relationName":"ClassToDatesheetEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"periodSlots","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"PeriodSlot","nativeType":null,"relationName":"ClassToPeriodSlot","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"studentSubjectEnrollments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentSubjectEnrollment","nativeType":null,"relationName":"ClassToStudentSubjectEnrollment","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"feeStructures","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeStructure","nativeType":null,"relationName":"ClassToFeeStructure","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"electiveSlotGroups","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ElectiveSlotGroup","nativeType":null,"relationName":"ClassToElectiveSlotGroup","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"resultTerms","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ResultTerm","nativeType":null,"relationName":"ClassToResultTerm","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Section":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classTeacherId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToSection","relationFromFields":["classId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"classTeacher","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"ClassTeacher","relationFromFields":["classTeacherId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"students","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"SectionToStudentProfile","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"teacherSubjects","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TeacherSubject","nativeType":null,"relationName":"SectionToTeacherSubject","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"examClassAssignments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamClassAssignment","nativeType":null,"relationName":"ExamClassAssignmentToSection","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"promotionsFrom","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentPromotion","nativeType":null,"relationName":"PromotionFromSection","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"promotionsTo","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentPromotion","nativeType":null,"relationName":"PromotionToSection","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"admissionPlacements","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AdmissionDecisionRecord","nativeType":null,"relationName":"AdmissionDecisionRecordToSection","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"timetableEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TimetableEntry","nativeType":null,"relationName":"SectionToTimetableEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"periodSlots","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"PeriodSlot","nativeType":null,"relationName":"PeriodSlotToSection","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"dailyAttendance","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DailyAttendance","nativeType":null,"relationName":"DailyAttendanceToSection","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectAttendance","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"SubjectAttendance","nativeType":null,"relationName":"SectionToSubjectAttendance","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"diaryEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DiaryEntry","nativeType":null,"relationName":"DiaryEntryToSection","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"datesheetEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DatesheetEntry","nativeType":null,"relationName":"DatesheetEntryToSection","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"electiveSlotGroups","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ElectiveSlotGroup","nativeType":null,"relationName":"ElectiveSlotGroupToSection","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["classId","name"]],"uniqueIndexes":[{"name":null,"fields":["classId","name"]}],"isGenerated":false},"Tag":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"category","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TagCategory","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"questionTags","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"QuestionTag","nativeType":null,"relationName":"QuestionTagToTag","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Question":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"subjectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"type","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"QuestionType","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"title","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"imageUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"difficulty","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Difficulty","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"marks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"expectedTime","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"modelAnswer","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"gradingRubric","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"explanation","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"usageCount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"deletedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"subject","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Subject","nativeType":null,"relationName":"QuestionToSubject","relationFromFields":["subjectId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToQuestion","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"QuestionToUser","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"mcqOptions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"McqOption","nativeType":null,"relationName":"McqOptionToQuestion","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"questionTags","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"QuestionTag","nativeType":null,"relationName":"QuestionToQuestionTag","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"examQuestions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamQuestion","nativeType":null,"relationName":"ExamQuestionToQuestion","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"campaignQuestions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"CampaignQuestion","nativeType":null,"relationName":"CampaignQuestionToQuestion","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"McqOption":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"questionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"label","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"text","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"imageUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isCorrect","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"sortOrder","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"question","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Question","nativeType":null,"relationName":"McqOptionToQuestion","relationFromFields":["questionId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"studentAnswers","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentAnswer","nativeType":null,"relationName":"SelectedOption","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"applicantAnswers","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantAnswer","nativeType":null,"relationName":"ApplicantSelectedOption","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["questionId","label"]],"uniqueIndexes":[{"name":null,"fields":["questionId","label"]}],"isGenerated":false},"QuestionTag":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"questionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"tagId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"question","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Question","nativeType":null,"relationName":"QuestionToQuestionTag","relationFromFields":["questionId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"tag","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Tag","nativeType":null,"relationName":"QuestionTagToTag","relationFromFields":["tagId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["questionId","tagId"]],"uniqueIndexes":[{"name":null,"fields":["questionId","tagId"]}],"isGenerated":false},"Exam":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"title","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"subjectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"type","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamType","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"ExamStatus","nativeType":null,"default":"DRAFT","isGenerated":false,"isUpdatedAt":false},{"name":"deliveryMode","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"ExamDeliveryMode","nativeType":null,"default":"ONLINE","isGenerated":false,"isUpdatedAt":false},{"name":"totalMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"passingMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"duration","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"scheduledStartAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"scheduledEndAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"instructions","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"shuffleQuestions","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"showResultAfter","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"ShowResultAfter","nativeType":null,"default":"IMMEDIATELY","isGenerated":false,"isUpdatedAt":false},{"name":"allowReview","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"maxAttempts","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":1,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"deletedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"subject","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Subject","nativeType":null,"relationName":"ExamToSubject","relationFromFields":["subjectId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"ExamToUser","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToExam","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"examQuestions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamQuestion","nativeType":null,"relationName":"ExamToExamQuestion","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"examClassAssignments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamClassAssignment","nativeType":null,"relationName":"ExamToExamClassAssignment","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"examSessions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamSession","nativeType":null,"relationName":"ExamToExamSession","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"examResults","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamResult","nativeType":null,"relationName":"ExamToExamResult","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"resultExamLinks","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ResultExamLink","nativeType":null,"relationName":"ExamToResultExamLink","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ExamQuestion":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"examId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"questionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sortOrder","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"marks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isRequired","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"exam","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Exam","nativeType":null,"relationName":"ExamToExamQuestion","relationFromFields":["examId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"question","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Question","nativeType":null,"relationName":"ExamQuestionToQuestion","relationFromFields":["questionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"studentAnswers","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentAnswer","nativeType":null,"relationName":"ExamQuestionToStudentAnswer","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["examId","sortOrder"]],"uniqueIndexes":[{"name":null,"fields":["examId","sortOrder"]}],"isGenerated":false},"ExamClassAssignment":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"examId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"exam","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Exam","nativeType":null,"relationName":"ExamToExamClassAssignment","relationFromFields":["examId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToExamClassAssignment","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"section","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"ExamClassAssignmentToSection","relationFromFields":["sectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["examId","classId","sectionId"]],"uniqueIndexes":[{"name":null,"fields":["examId","classId","sectionId"]}],"isGenerated":false},"ExamSession":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"examId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"studentId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"attemptNumber","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":1,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"SessionStatus","nativeType":null,"default":"NOT_STARTED","isGenerated":false,"isUpdatedAt":false},{"name":"startedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"submittedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"timeSpent","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"ipAddress","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"userAgent","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"tabSwitchCount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"fullscreenExits","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"copyPasteAttempts","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"isFlagged","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"enteredById","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"exam","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Exam","nativeType":null,"relationName":"ExamToExamSession","relationFromFields":["examId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"student","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"ExamSessionToUser","relationFromFields":["studentId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"enteredBy","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"MarksEnteredBy","relationFromFields":["enteredById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"studentAnswers","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentAnswer","nativeType":null,"relationName":"ExamSessionToStudentAnswer","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"examResult","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamResult","nativeType":null,"relationName":"ExamResultToExamSession","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["examId","studentId","attemptNumber"]],"uniqueIndexes":[{"name":null,"fields":["examId","studentId","attemptNumber"]}],"isGenerated":false},"StudentAnswer":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"sessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"examQuestionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"answerText","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"selectedOptionId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isMarkedForReview","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"answeredAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"timeSpent","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"session","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamSession","nativeType":null,"relationName":"ExamSessionToStudentAnswer","relationFromFields":["sessionId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"examQuestion","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamQuestion","nativeType":null,"relationName":"ExamQuestionToStudentAnswer","relationFromFields":["examQuestionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"selectedOption","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"McqOption","nativeType":null,"relationName":"SelectedOption","relationFromFields":["selectedOptionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"answerGrade","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AnswerGrade","nativeType":null,"relationName":"AnswerGradeToStudentAnswer","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["sessionId","examQuestionId"]],"uniqueIndexes":[{"name":null,"fields":["sessionId","examQuestionId"]}],"isGenerated":false},"AnswerGrade":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"studentAnswerId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"gradedBy","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"GradedBy","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"graderId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"marksAwarded","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"maxMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"feedback","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"aiConfidence","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"aiModelUsed","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"aiPromptTokens","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"aiResponseTokens","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isReviewed","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"reviewedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"studentAnswer","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentAnswer","nativeType":null,"relationName":"AnswerGradeToStudentAnswer","relationFromFields":["studentAnswerId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"grader","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"GraderUser","relationFromFields":["graderId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ExamResult":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"sessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"examId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"studentId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"totalMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"obtainedMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"percentage","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"grade","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isPassed","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Boolean","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"rank","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"publishedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"session","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamSession","nativeType":null,"relationName":"ExamResultToExamSession","relationFromFields":["sessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"exam","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Exam","nativeType":null,"relationName":"ExamToExamResult","relationFromFields":["examId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"student","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"ExamResultToUser","relationFromFields":["studentId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"AcademicSession":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"startDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"endDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isCurrent","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"exams","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Exam","nativeType":null,"relationName":"AcademicSessionToExam","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"promotions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentPromotion","nativeType":null,"relationName":"AcademicSessionToStudentPromotion","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"testCampaigns","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TestCampaign","nativeType":null,"relationName":"AcademicSessionToTestCampaign","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"timetableEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TimetableEntry","nativeType":null,"relationName":"AcademicSessionToTimetableEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"dailyAttendance","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DailyAttendance","nativeType":null,"relationName":"AcademicSessionToDailyAttendance","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectAttendance","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"SubjectAttendance","nativeType":null,"relationName":"AcademicSessionToSubjectAttendance","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"diaryEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DiaryEntry","nativeType":null,"relationName":"AcademicSessionToDiaryEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"datesheets","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Datesheet","nativeType":null,"relationName":"AcademicSessionToDatesheet","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"studentSubjectEnrollments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentSubjectEnrollment","nativeType":null,"relationName":"AcademicSessionToStudentSubjectEnrollment","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"feeStructures","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeStructure","nativeType":null,"relationName":"AcademicSessionToFeeStructure","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"feeAssignments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeAssignment","nativeType":null,"relationName":"AcademicSessionToFeeAssignment","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"feeSettings","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeSettings","nativeType":null,"relationName":"AcademicSessionToFeeSettings","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"feeCredits","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeCredit","nativeType":null,"relationName":"AcademicSessionToFeeCredit","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"studentFeeDiscounts","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentFeeDiscount","nativeType":null,"relationName":"AcademicSessionToStudentFeeDiscount","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"resultTerms","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ResultTerm","nativeType":null,"relationName":"AcademicSessionToResultTerm","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"electiveSlotGroups","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ElectiveSlotGroup","nativeType":null,"relationName":"AcademicSessionToElectiveSlotGroup","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"StudentPromotion":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"studentProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"fromClassId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"fromSectionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"toClassId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"toSectionId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentStatus","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"remarks","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"promotedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"promotedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"studentProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"StudentProfileToStudentPromotion","relationFromFields":["studentProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToStudentPromotion","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"fromClass","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"PromotionFromClass","relationFromFields":["fromClassId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"fromSection","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"PromotionFromSection","relationFromFields":["fromSectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"toClass","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"PromotionToClass","relationFromFields":["toClassId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"toSection","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"PromotionToSection","relationFromFields":["toSectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"promotedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"StudentPromotionToUser","relationFromFields":["promotedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"SchoolSettings":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"schoolName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"schoolLogo","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"address","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"phone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"email","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"website","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"gradingScale","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"timezone","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":"Asia/Karachi","isGenerated":false,"isUpdatedAt":false},{"name":"academicYear","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"reportHeaderText","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"principalName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"examControllerName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"reportFooterText","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"signatureImageUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"passingPercentage","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Decimal","nativeType":null,"default":33,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"AuditLog":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"action","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"entityType","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"entityId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"metadata","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"ipAddress","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"AuditLogToUser","relationFromFields":["userId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Notification":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"title","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"message","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"type","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"NotificationType","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isRead","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"actionUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"NotificationToUser","relationFromFields":["userId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"PasswordResetToken":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"email","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"token","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"expiresAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"TestCampaign":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"slug","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"type","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"CampaignType","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"CampaignStatus","nativeType":null,"default":"DRAFT","isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"targetClassId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"targetClassGrade","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"maxSeats","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"registrationStartAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"registrationEndAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"testStartAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"testEndAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"testDuration","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"totalMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"passingMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"shuffleQuestions","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"shuffleOptions","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"allowCalculator","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"negativeMarking","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"negativeMarkValue","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"instructions","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"resultPublishAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"showRankToApplicant","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"showScoreToApplicant","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"showCutoffToApplicant","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"hasScholarship","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"eligibilityCriteria","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"deletedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"academicSession","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToTestCampaign","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"targetClass","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToTestCampaign","relationFromFields":["targetClassId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"TestCampaignToUser","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"campaignQuestions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"CampaignQuestion","nativeType":null,"relationName":"CampaignQuestionToTestCampaign","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"scholarshipTiers","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"CampaignScholarshipTier","nativeType":null,"relationName":"CampaignScholarshipTierToTestCampaign","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"evaluationStages","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"CampaignEvaluationStage","nativeType":null,"relationName":"CampaignEvaluationStageToTestCampaign","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"applicants","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Applicant","nativeType":null,"relationName":"ApplicantToTestCampaign","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"applicantResults","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantResult","nativeType":null,"relationName":"ApplicantResultToTestCampaign","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"applicantScholarships","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantScholarship","nativeType":null,"relationName":"ApplicantScholarshipToTestCampaign","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"admissionDecisions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AdmissionDecisionRecord","nativeType":null,"relationName":"AdmissionDecisionRecordToTestCampaign","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"CampaignQuestion":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"campaignId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"questionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sortOrder","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"marks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isRequired","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionLabel","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"paperVersion","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":"A","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"campaign","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TestCampaign","nativeType":null,"relationName":"CampaignQuestionToTestCampaign","relationFromFields":["campaignId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"question","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Question","nativeType":null,"relationName":"CampaignQuestionToQuestion","relationFromFields":["questionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"applicantAnswers","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantAnswer","nativeType":null,"relationName":"ApplicantAnswerToCampaignQuestion","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["campaignId","paperVersion","sortOrder"],["campaignId","questionId"]],"uniqueIndexes":[{"name":null,"fields":["campaignId","paperVersion","sortOrder"]},{"name":null,"fields":["campaignId","questionId"]}],"isGenerated":false},"CampaignScholarshipTier":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"campaignId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"tier","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ScholarshipTier","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"minPercentage","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"maxPercentage","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"maxRecipients","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"benefitDetails","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"sortOrder","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"campaign","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TestCampaign","nativeType":null,"relationName":"CampaignScholarshipTierToTestCampaign","relationFromFields":["campaignId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"applicantScholarships","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantScholarship","nativeType":null,"relationName":"ApplicantScholarshipToCampaignScholarshipTier","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["campaignId","tier"]],"uniqueIndexes":[{"name":null,"fields":["campaignId","tier"]}],"isGenerated":false},"CampaignEvaluationStage":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"campaignId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"stage","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"EvaluationStage","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sortOrder","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isRequired","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"weightPercentage","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"passingCriteria","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"campaign","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TestCampaign","nativeType":null,"relationName":"CampaignEvaluationStageToTestCampaign","relationFromFields":["campaignId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["campaignId","stage"],["campaignId","sortOrder"]],"uniqueIndexes":[{"name":null,"fields":["campaignId","stage"]},{"name":null,"fields":["campaignId","sortOrder"]}],"isGenerated":false},"Applicant":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"campaignId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"firstName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"lastName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"email","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"phone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"dateOfBirth","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"gender","kind":"enum","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Gender","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"guardianName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"guardianPhone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"guardianEmail","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"address","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"city","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"previousSchool","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"previousClass","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"previousGrade","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"photoUrl","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"documentUrls","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"ApplicantStatus","nativeType":null,"default":"REGISTERED","isGenerated":false,"isUpdatedAt":false},{"name":"applicationNumber","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"accessToken","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"accessTokenExpiresAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"paperVersion","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":"A","isGenerated":false,"isUpdatedAt":false},{"name":"isEmailVerified","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"isPhoneVerified","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"emailOtp","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"phoneOtp","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"otpExpiresAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"otpAttempts","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"ipAddress","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"userAgent","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"campaign","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TestCampaign","nativeType":null,"relationName":"ApplicantToTestCampaign","relationFromFields":["campaignId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"testSession","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantTestSession","nativeType":null,"relationName":"ApplicantToApplicantTestSession","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"result","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantResult","nativeType":null,"relationName":"ApplicantToApplicantResult","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"scholarship","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantScholarship","nativeType":null,"relationName":"ApplicantToApplicantScholarship","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"decisions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AdmissionDecisionRecord","nativeType":null,"relationName":"AdmissionDecisionRecordToApplicant","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["campaignId","email"]],"uniqueIndexes":[{"name":null,"fields":["campaignId","email"]}],"isGenerated":false},"ApplicantTestSession":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"applicantId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"campaignId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"SessionStatus","nativeType":null,"default":"NOT_STARTED","isGenerated":false,"isUpdatedAt":false},{"name":"startedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"submittedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"timeSpent","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"ipAddress","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"userAgent","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"tabSwitchCount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"fullscreenExits","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"copyPasteAttempts","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"browserFingerprint","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isFlagged","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"flagReason","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"questionOrder","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"optionOrders","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"applicant","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Applicant","nativeType":null,"relationName":"ApplicantToApplicantTestSession","relationFromFields":["applicantId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"applicantAnswers","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantAnswer","nativeType":null,"relationName":"ApplicantAnswerToApplicantTestSession","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ApplicantAnswer":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"sessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"campaignQuestionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"answerText","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"selectedOptionId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isMarkedForReview","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"answeredAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"timeSpent","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"session","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantTestSession","nativeType":null,"relationName":"ApplicantAnswerToApplicantTestSession","relationFromFields":["sessionId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"campaignQuestion","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"CampaignQuestion","nativeType":null,"relationName":"ApplicantAnswerToCampaignQuestion","relationFromFields":["campaignQuestionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"selectedOption","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"McqOption","nativeType":null,"relationName":"ApplicantSelectedOption","relationFromFields":["selectedOptionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"grade","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantAnswerGrade","nativeType":null,"relationName":"ApplicantAnswerToApplicantAnswerGrade","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["sessionId","campaignQuestionId"]],"uniqueIndexes":[{"name":null,"fields":["sessionId","campaignQuestionId"]}],"isGenerated":false},"ApplicantAnswerGrade":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"applicantAnswerId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"gradedBy","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"GradedBy","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"graderId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"marksAwarded","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"maxMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"feedback","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"aiConfidence","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"aiModelUsed","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"aiPromptTokens","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"aiResponseTokens","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"aiReasoning","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isReviewed","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"reviewedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isNegativeMarked","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"negativeMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Decimal","nativeType":null,"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"applicantAnswer","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ApplicantAnswer","nativeType":null,"relationName":"ApplicantAnswerToApplicantAnswerGrade","relationFromFields":["applicantAnswerId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"grader","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"ApplicantGraderUser","relationFromFields":["graderId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ApplicantResult":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"applicantId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"campaignId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"totalMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"obtainedMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"percentage","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"rank","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"percentile","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"grade","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isPassed","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Boolean","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionScores","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"computedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"publishedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"applicant","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Applicant","nativeType":null,"relationName":"ApplicantToApplicantResult","relationFromFields":["applicantId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"campaign","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TestCampaign","nativeType":null,"relationName":"ApplicantResultToTestCampaign","relationFromFields":["campaignId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ApplicantScholarship":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"applicantId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"campaignId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"tierId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"tier","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ScholarshipTier","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"percentageAwarded","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isAccepted","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Boolean","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"acceptedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"declinedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"validFrom","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"validUntil","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isRenewable","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"renewalCriteria","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"awardedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"awardedById","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"applicant","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Applicant","nativeType":null,"relationName":"ApplicantToApplicantScholarship","relationFromFields":["applicantId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"campaign","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TestCampaign","nativeType":null,"relationName":"ApplicantScholarshipToTestCampaign","relationFromFields":["campaignId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"scholarshipTier","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"CampaignScholarshipTier","nativeType":null,"relationName":"ApplicantScholarshipToCampaignScholarshipTier","relationFromFields":["tierId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"awardedBy","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"ScholarshipAwarder","relationFromFields":["awardedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"AdmissionDecisionRecord":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"applicantId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"campaignId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"decision","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AdmissionDecisionType","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"stage","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"EvaluationStage","nativeType":null,"default":"WRITTEN_TEST","isGenerated":false,"isUpdatedAt":false},{"name":"remarks","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"conditions","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"assignedClassId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"assignedSectionId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"decidedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"decidedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"applicant","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Applicant","nativeType":null,"relationName":"AdmissionDecisionRecordToApplicant","relationFromFields":["applicantId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"campaign","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TestCampaign","nativeType":null,"relationName":"AdmissionDecisionRecordToTestCampaign","relationFromFields":["campaignId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"assignedClass","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"AdmissionDecisionRecordToClass","relationFromFields":["assignedClassId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"assignedSection","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"AdmissionDecisionRecordToSection","relationFromFields":["assignedSectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"decidedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"AdmissionDecisionRecordToUser","relationFromFields":["decidedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"PeriodSlot":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"shortName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"startTime","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"endTime","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sortOrder","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isBreak","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"class","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToPeriodSlot","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"section","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"PeriodSlotToSection","relationFromFields":["sectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"timetableEntries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TimetableEntry","nativeType":null,"relationName":"PeriodSlotToTimetableEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectAttendance","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"SubjectAttendance","nativeType":null,"relationName":"PeriodSlotToSubjectAttendance","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"electiveSlotGroups","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ElectiveSlotGroup","nativeType":null,"relationName":"ElectiveSlotGroupToPeriodSlot","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["sortOrder","classId","sectionId"]],"uniqueIndexes":[{"name":null,"fields":["sortOrder","classId","sectionId"]}],"isGenerated":false},"ElectiveSlotGroup":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"periodSlotId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"dayOfWeek","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DayOfWeek","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToElectiveSlotGroup","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"section","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"ElectiveSlotGroupToSection","relationFromFields":["sectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"periodSlot","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"PeriodSlot","nativeType":null,"relationName":"ElectiveSlotGroupToPeriodSlot","relationFromFields":["periodSlotId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToElectiveSlotGroup","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"entries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TimetableEntry","nativeType":null,"relationName":"ElectiveSlotGroupToTimetableEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["classId","sectionId","periodSlotId","dayOfWeek","academicSessionId"]],"uniqueIndexes":[{"name":null,"fields":["classId","sectionId","periodSlotId","dayOfWeek","academicSessionId"]}],"isGenerated":false},"TimetableEntry":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"subjectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"teacherProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"periodSlotId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"dayOfWeek","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DayOfWeek","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"room","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isElectiveSlot","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"electiveSlotGroupId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToTimetableEntry","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"section","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"SectionToTimetableEntry","relationFromFields":["sectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"subject","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Subject","nativeType":null,"relationName":"SubjectToTimetableEntry","relationFromFields":["subjectId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"teacherProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TeacherProfile","nativeType":null,"relationName":"TeacherProfileToTimetableEntry","relationFromFields":["teacherProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"periodSlot","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"PeriodSlot","nativeType":null,"relationName":"PeriodSlotToTimetableEntry","relationFromFields":["periodSlotId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToTimetableEntry","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"electiveSlotGroup","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ElectiveSlotGroup","nativeType":null,"relationName":"ElectiveSlotGroupToTimetableEntry","relationFromFields":["electiveSlotGroupId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"subjectAttendance","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"SubjectAttendance","nativeType":null,"relationName":"SubjectAttendanceToTimetableEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["classId","sectionId","subjectId","periodSlotId","dayOfWeek","academicSessionId"]],"uniqueIndexes":[{"name":null,"fields":["classId","sectionId","subjectId","periodSlotId","dayOfWeek","academicSessionId"]}],"isGenerated":false},"DailyAttendance":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"studentProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"date","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":["Date",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AttendanceStatus","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"remarks","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"markedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isEdited","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"editedById","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"editedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"studentProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"DailyAttendanceToStudentProfile","relationFromFields":["studentProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToDailyAttendance","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"section","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"DailyAttendanceToSection","relationFromFields":["sectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"markedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"DailyAttendanceMarker","relationFromFields":["markedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"editedBy","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"DailyAttendanceEditor","relationFromFields":["editedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToDailyAttendance","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["studentProfileId","date","academicSessionId"]],"uniqueIndexes":[{"name":null,"fields":["studentProfileId","date","academicSessionId"]}],"isGenerated":false},"SubjectAttendance":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"studentProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"subjectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"timetableEntryId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"periodSlotId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"date","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":["Date",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AttendanceStatus","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"remarks","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"markedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isEdited","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"editedById","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"editedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"studentProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"StudentProfileToSubjectAttendance","relationFromFields":["studentProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToSubjectAttendance","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"section","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"SectionToSubjectAttendance","relationFromFields":["sectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"subject","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Subject","nativeType":null,"relationName":"SubjectToSubjectAttendance","relationFromFields":["subjectId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"timetableEntry","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TimetableEntry","nativeType":null,"relationName":"SubjectAttendanceToTimetableEntry","relationFromFields":["timetableEntryId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"periodSlot","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"PeriodSlot","nativeType":null,"relationName":"PeriodSlotToSubjectAttendance","relationFromFields":["periodSlotId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"markedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"SubjectAttendanceMarker","relationFromFields":["markedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"editedBy","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"SubjectAttendanceEditor","relationFromFields":["editedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToSubjectAttendance","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["studentProfileId","subjectId","periodSlotId","date","academicSessionId"]],"uniqueIndexes":[{"name":null,"fields":["studentProfileId","subjectId","periodSlotId","date","academicSessionId"]}],"isGenerated":false},"DiaryEntry":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"teacherProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"subjectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"date","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":["Date",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"title","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["VarChar",["255"]],"isGenerated":false,"isUpdatedAt":false},{"name":"content","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DiaryStatus","nativeType":null,"default":"PUBLISHED","isGenerated":false,"isUpdatedAt":false},{"name":"isEdited","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"editedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"deletedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"teacherProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TeacherProfile","nativeType":null,"relationName":"DiaryEntryToTeacherProfile","relationFromFields":["teacherProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToDiaryEntry","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"section","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"DiaryEntryToSection","relationFromFields":["sectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"subject","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Subject","nativeType":null,"relationName":"DiaryEntryToSubject","relationFromFields":["subjectId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToDiaryEntry","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"readReceipts","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DiaryReadReceipt","nativeType":null,"relationName":"DiaryEntryToDiaryReadReceipt","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"principalNotes","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DiaryPrincipalNote","nativeType":null,"relationName":"DiaryEntryToDiaryPrincipalNote","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["teacherProfileId","classId","sectionId","subjectId","date","academicSessionId"]],"uniqueIndexes":[{"name":null,"fields":["teacherProfileId","classId","sectionId","subjectId","date","academicSessionId"]}],"isGenerated":false},"DiaryReadReceipt":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"diaryEntryId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"studentProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"readAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"diaryEntry","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DiaryEntry","nativeType":null,"relationName":"DiaryEntryToDiaryReadReceipt","relationFromFields":["diaryEntryId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"studentProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"DiaryReadReceiptToStudentProfile","relationFromFields":["studentProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["diaryEntryId","studentProfileId"]],"uniqueIndexes":[{"name":null,"fields":["diaryEntryId","studentProfileId"]}],"isGenerated":false},"DiaryPrincipalNote":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"diaryEntryId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"principalId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"note","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"diaryEntry","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DiaryEntry","nativeType":null,"relationName":"DiaryEntryToDiaryPrincipalNote","relationFromFields":["diaryEntryId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"principal","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"DiaryPrincipalNoteToUser","relationFromFields":["principalId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Datesheet":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"title","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"examType","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ExamType","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DatesheetStatus","nativeType":null,"default":"DRAFT","isGenerated":false,"isUpdatedAt":false},{"name":"startDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":["Date",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"endDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":["Date",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"publishedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"publishedById","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToDatesheet","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"publishedBy","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"DatesheetPublisher","relationFromFields":["publishedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"DatesheetCreator","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"entries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DatesheetEntry","nativeType":null,"relationName":"DatesheetToDatesheetEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"DatesheetEntry":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"datesheetId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"subjectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"examDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":["Date",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"startTime","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"endTime","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"room","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"instructions","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"totalMarks","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"datesheet","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Datesheet","nativeType":null,"relationName":"DatesheetToDatesheetEntry","relationFromFields":["datesheetId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToDatesheetEntry","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"section","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Section","nativeType":null,"relationName":"DatesheetEntryToSection","relationFromFields":["sectionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"subject","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Subject","nativeType":null,"relationName":"DatesheetEntryToSubject","relationFromFields":["subjectId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"duties","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DatesheetDuty","nativeType":null,"relationName":"DatesheetDutyToDatesheetEntry","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["datesheetId","classId","sectionId","subjectId","examDate"]],"uniqueIndexes":[{"name":null,"fields":["datesheetId","classId","sectionId","subjectId","examDate"]}],"isGenerated":false},"DatesheetDuty":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"datesheetEntryId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"teacherProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"role","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":"INVIGILATOR","isGenerated":false,"isUpdatedAt":false},{"name":"room","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"notes","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"datesheetEntry","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DatesheetEntry","nativeType":null,"relationName":"DatesheetDutyToDatesheetEntry","relationFromFields":["datesheetEntryId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"teacherProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"TeacherProfile","nativeType":null,"relationName":"DatesheetDutyToTeacherProfile","relationFromFields":["teacherProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["datesheetEntryId","teacherProfileId"]],"uniqueIndexes":[{"name":null,"fields":["datesheetEntryId","teacherProfileId"]}],"isGenerated":false},"FeeCategory":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"frequency","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeFrequency","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isMandatory","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"isRefundable","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"sortOrder","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"structures","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeStructure","nativeType":null,"relationName":"FeeCategoryToFeeStructure","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"studentDiscounts","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentFeeDiscount","nativeType":null,"relationName":"FeeCategoryToStudentFeeDiscount","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"FeeStructure":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"categoryId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"amount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["12","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"effectiveFrom","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"category","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeCategory","nativeType":null,"relationName":"FeeCategoryToFeeStructure","relationFromFields":["categoryId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToFeeStructure","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToFeeStructure","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"lineItems","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeLineItem","nativeType":null,"relationName":"FeeLineItemToFeeStructure","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["categoryId","classId","academicSessionId"]],"uniqueIndexes":[{"name":null,"fields":["categoryId","classId","academicSessionId"]}],"isGenerated":false},"FeeAssignment":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"studentProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"generatedForMonth","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["VarChar",["7"]],"isGenerated":false,"isUpdatedAt":false},{"name":"totalAmount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["12","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"paidAmount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Decimal","nativeType":["Decimal",["12","2"]],"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"balanceAmount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["12","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"discountAmount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Decimal","nativeType":["Decimal",["12","2"]],"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"lateFeesApplied","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Decimal","nativeType":["Decimal",["12","2"]],"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"dueDate","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"FeeAssignmentStatus","nativeType":null,"default":"PENDING","isGenerated":false,"isUpdatedAt":false},{"name":"generatedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"cancelledById","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"cancelReason","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"studentProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"FeeAssignmentToStudentProfile","relationFromFields":["studentProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToFeeAssignment","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"generatedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"FeeGeneratedBy","relationFromFields":["generatedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"lineItems","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeLineItem","nativeType":null,"relationName":"FeeAssignmentToFeeLineItem","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"payments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeePayment","nativeType":null,"relationName":"FeeAssignmentToFeePayment","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"discounts","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeDiscount","nativeType":null,"relationName":"FeeAssignmentToFeeDiscount","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["studentProfileId","academicSessionId","generatedForMonth"]],"uniqueIndexes":[{"name":null,"fields":["studentProfileId","academicSessionId","generatedForMonth"]}],"isGenerated":false},"FeeLineItem":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"feeAssignmentId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"feeStructureId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"categoryName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"amount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["12","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"feeAssignment","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeAssignment","nativeType":null,"relationName":"FeeAssignmentToFeeLineItem","relationFromFields":["feeAssignmentId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"feeStructure","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeStructure","nativeType":null,"relationName":"FeeLineItemToFeeStructure","relationFromFields":["feeStructureId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"FeeDiscount":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"feeAssignmentId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"reason","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"amount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["12","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"appliedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"feeAssignment","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeAssignment","nativeType":null,"relationName":"FeeAssignmentToFeeDiscount","relationFromFields":["feeAssignmentId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"appliedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"DiscountAppliedBy","relationFromFields":["appliedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"FeePayment":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"feeAssignmentId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"familyPaymentId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"amount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["12","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"paymentMethod","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"PaymentMethod","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"referenceNumber","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"receiptNumber","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"PaymentStatus","nativeType":null,"default":"COMPLETED","isGenerated":false,"isUpdatedAt":false},{"name":"reversedById","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"reversalReason","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"reversedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"recordedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"paidAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"feeAssignment","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeAssignment","nativeType":null,"relationName":"FeeAssignmentToFeePayment","relationFromFields":["feeAssignmentId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"familyPayment","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FamilyPayment","nativeType":null,"relationName":"FamilyPaymentToFeePayment","relationFromFields":["familyPaymentId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"recordedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"PaymentRecordedBy","relationFromFields":["recordedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"FamilyPayment":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"familyProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"totalAmount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["12","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"paymentMethod","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"PaymentMethod","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"referenceNumber","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"masterReceiptNumber","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"allocationStrategy","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AllocationStrategy","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"allocationDetails","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"PaymentStatus","nativeType":null,"default":"COMPLETED","isGenerated":false,"isUpdatedAt":false},{"name":"reversedById","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"reversalReason","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"reversedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"recordedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"paidAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"familyProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FamilyProfile","nativeType":null,"relationName":"FamilyPaymentToFamilyProfile","relationFromFields":["familyProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"recordedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"FamilyPaymentRecordedBy","relationFromFields":["recordedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"childPayments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeePayment","nativeType":null,"relationName":"FamilyPaymentToFeePayment","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"FeeSettings":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"dueDayOfMonth","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":10,"isGenerated":false,"isUpdatedAt":false},{"name":"lateFeePerDay","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Decimal","nativeType":["Decimal",["10","2"]],"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"maxLateFee","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Decimal","nativeType":["Decimal",["10","2"]],"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"receiptPrefix","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":"FRCP","isGenerated":false,"isUpdatedAt":false},{"name":"familyReceiptPrefix","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":"FMRC","isGenerated":false,"isUpdatedAt":false},{"name":"gracePeriodDays","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","nativeType":null,"default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToFeeSettings","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"FeeCredit":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"studentProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"familyProfileId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"amount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["12","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"remainingAmount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["12","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"reason","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"referenceNumber","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"CreditStatus","nativeType":null,"default":"ACTIVE","isGenerated":false,"isUpdatedAt":false},{"name":"createdById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"studentProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"FeeCreditToStudentProfile","relationFromFields":["studentProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"familyProfile","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FamilyProfile","nativeType":null,"relationName":"FamilyProfileToFeeCredit","relationFromFields":["familyProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToFeeCredit","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"CreditCreatedBy","relationFromFields":["createdById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"StudentFeeDiscount":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"studentProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"discountType","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentDiscountType","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"value","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["12","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"reason","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"feeCategoryId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"validFrom","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"validUntil","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"approvedById","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"studentProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"StudentFeeDiscountToStudentProfile","relationFromFields":["studentProfileId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToStudentFeeDiscount","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"feeCategory","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FeeCategory","nativeType":null,"relationName":"FeeCategoryToStudentFeeDiscount","relationFromFields":["feeCategoryId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"approvedBy","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"StudentDiscountCreatedBy","relationFromFields":["approvedById"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["studentProfileId","academicSessionId","feeCategoryId"]],"uniqueIndexes":[{"name":null,"fields":["studentProfileId","academicSessionId","feeCategoryId"]}],"isGenerated":false},"StudentSubjectEnrollment":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"studentProfileId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"subjectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"enrolledAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"studentProfile","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"StudentProfile","nativeType":null,"relationName":"StudentProfileToStudentSubjectEnrollment","relationFromFields":["studentProfileId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"subject","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Subject","nativeType":null,"relationName":"StudentSubjectEnrollmentToSubject","relationFromFields":["subjectId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToStudentSubjectEnrollment","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToStudentSubjectEnrollment","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["studentProfileId","subjectId","academicSessionId"]],"uniqueIndexes":[{"name":null,"fields":["studentProfileId","subjectId","academicSessionId"]}],"isGenerated":false},"ResultTerm":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"academicSessionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"isPublished","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"isComputing","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"lockOwner","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"lockAcquiredAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"lockExpiresAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"publishedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"computedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"academicSession","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AcademicSession","nativeType":null,"relationName":"AcademicSessionToResultTerm","relationFromFields":["academicSessionId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"class","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Class","nativeType":null,"relationName":"ClassToResultTerm","relationFromFields":["classId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"examGroups","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ResultExamGroup","nativeType":null,"relationName":"ResultExamGroupToResultTerm","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"consolidatedResults","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ConsolidatedResult","nativeType":null,"relationName":"ConsolidatedResultToResultTerm","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"consolidatedSummaries","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ConsolidatedStudentSummary","nativeType":null,"relationName":"ConsolidatedStudentSummaryToResultTerm","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["name","academicSessionId","classId"]],"uniqueIndexes":[{"name":null,"fields":["name","academicSessionId","classId"]}],"isGenerated":false},"ResultExamGroup":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"resultTermId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"weight","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["5","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"aggregateMode","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"AggregateMode","nativeType":null,"default":"SINGLE","isGenerated":false,"isUpdatedAt":false},{"name":"bestOfCount","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sortOrder","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"resultTerm","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ResultTerm","nativeType":null,"relationName":"ResultExamGroupToResultTerm","relationFromFields":["resultTermId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"examLinks","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ResultExamLink","nativeType":null,"relationName":"ResultExamGroupToResultExamLink","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["resultTermId","sortOrder"],["resultTermId","name"]],"uniqueIndexes":[{"name":null,"fields":["resultTermId","sortOrder"]},{"name":null,"fields":["resultTermId","name"]}],"isGenerated":false},"ResultExamLink":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"examGroupId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"examId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"examGroup","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ResultExamGroup","nativeType":null,"relationName":"ResultExamGroupToResultExamLink","relationFromFields":["examGroupId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"exam","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Exam","nativeType":null,"relationName":"ExamToResultExamLink","relationFromFields":["examId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["examGroupId","examId"]],"uniqueIndexes":[{"name":null,"fields":["examGroupId","examId"]}],"isGenerated":false},"ConsolidatedResult":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"resultTermId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"studentId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"subjectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"groupScores","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Json","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"totalMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["10","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"obtainedMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["10","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"percentage","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["5","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"grade","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isPassed","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Boolean","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isStale","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"rankInClass","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"rankInSection","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"computedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"resultTerm","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ResultTerm","nativeType":null,"relationName":"ConsolidatedResultToResultTerm","relationFromFields":["resultTermId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"student","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"ConsolidatedResultToUser","relationFromFields":["studentId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"subject","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Subject","nativeType":null,"relationName":"ConsolidatedResultToSubject","relationFromFields":["subjectId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["resultTermId","studentId","subjectId"]],"uniqueIndexes":[{"name":null,"fields":["resultTermId","studentId","subjectId"]}],"isGenerated":false},"ConsolidatedStudentSummary":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"uuid","args":[4]},"isGenerated":false,"isUpdatedAt":false},{"name":"resultTermId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"studentId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"sectionId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"totalSubjects","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"passedSubjects","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"failedSubjects","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"grandTotalMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["10","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"grandObtainedMarks","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["10","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"overallPercentage","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["5","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"overallGrade","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"isOverallPassed","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Boolean","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"rankInClass","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"rankInSection","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"attendancePercentage","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Decimal","nativeType":["Decimal",["5","2"]],"isGenerated":false,"isUpdatedAt":false},{"name":"totalDays","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"presentDays","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"classTeacherRemarks","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"principalRemarks","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"isStale","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","nativeType":null,"default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"computedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"resultTerm","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ResultTerm","nativeType":null,"relationName":"ConsolidatedStudentSummaryToResultTerm","relationFromFields":["resultTermId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"student","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","nativeType":null,"relationName":"ConsolidatedStudentSummaryToUser","relationFromFields":["studentId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["resultTermId","studentId"]],"uniqueIndexes":[{"name":null,"fields":["resultTermId","studentId"]}],"isGenerated":false}},"enums":{"UserRole":{"values":[{"name":"ADMIN","dbName":null},{"name":"PRINCIPAL","dbName":null},{"name":"TEACHER","dbName":null},{"name":"STUDENT","dbName":null},{"name":"FAMILY","dbName":null}],"dbName":null},"Gender":{"values":[{"name":"MALE","dbName":null},{"name":"FEMALE","dbName":null},{"name":"OTHER","dbName":null}],"dbName":null},"QuestionType":{"values":[{"name":"MCQ","dbName":null},{"name":"SHORT_ANSWER","dbName":null},{"name":"LONG_ANSWER","dbName":null}],"dbName":null},"Difficulty":{"values":[{"name":"EASY","dbName":null},{"name":"MEDIUM","dbName":null},{"name":"HARD","dbName":null}],"dbName":null},"TagCategory":{"values":[{"name":"TOPIC","dbName":null},{"name":"DIFFICULTY","dbName":null},{"name":"BLOOM_LEVEL","dbName":null},{"name":"CUSTOM","dbName":null}],"dbName":null},"ExamDeliveryMode":{"values":[{"name":"ONLINE","dbName":null},{"name":"WRITTEN","dbName":null}],"dbName":null},"ExamType":{"values":[{"name":"QUIZ","dbName":null},{"name":"MIDTERM","dbName":null},{"name":"FINAL","dbName":null},{"name":"PRACTICE","dbName":null},{"name":"CUSTOM","dbName":null}],"dbName":null},"ExamStatus":{"values":[{"name":"DRAFT","dbName":null},{"name":"PUBLISHED","dbName":null},{"name":"ACTIVE","dbName":null},{"name":"COMPLETED","dbName":null},{"name":"ARCHIVED","dbName":null}],"dbName":null},"SessionStatus":{"values":[{"name":"NOT_STARTED","dbName":null},{"name":"IN_PROGRESS","dbName":null},{"name":"SUBMITTED","dbName":null},{"name":"TIMED_OUT","dbName":null},{"name":"GRADING","dbName":null},{"name":"GRADED","dbName":null},{"name":"ABSENT","dbName":null}],"dbName":null},"ShowResultAfter":{"values":[{"name":"IMMEDIATELY","dbName":null},{"name":"AFTER_DEADLINE","dbName":null},{"name":"MANUAL","dbName":null}],"dbName":null},"GradedBy":{"values":[{"name":"SYSTEM","dbName":null},{"name":"AI","dbName":null},{"name":"TEACHER","dbName":null}],"dbName":null},"NotificationType":{"values":[{"name":"EXAM_ASSIGNED","dbName":null},{"name":"EXAM_REMINDER","dbName":null},{"name":"RESULT_PUBLISHED","dbName":null},{"name":"GRADE_REVIEWED","dbName":null},{"name":"SYSTEM","dbName":null},{"name":"ADMISSION","dbName":null},{"name":"ATTENDANCE_ALERT","dbName":null},{"name":"DIARY_PUBLISHED","dbName":null}],"dbName":null},"StudentStatus":{"values":[{"name":"ACTIVE","dbName":null},{"name":"PROMOTED","dbName":null},{"name":"GRADUATED","dbName":null},{"name":"HELD_BACK","dbName":null},{"name":"WITHDRAWN","dbName":null}],"dbName":null},"CampaignType":{"values":[{"name":"ADMISSION","dbName":null},{"name":"SCHOLARSHIP","dbName":null},{"name":"ADMISSION_SCHOLARSHIP","dbName":null}],"dbName":null},"CampaignStatus":{"values":[{"name":"DRAFT","dbName":null},{"name":"REGISTRATION_OPEN","dbName":null},{"name":"REGISTRATION_CLOSED","dbName":null},{"name":"TEST_ACTIVE","dbName":null},{"name":"TEST_CLOSED","dbName":null},{"name":"GRADING","dbName":null},{"name":"RESULTS_READY","dbName":null},{"name":"RESULTS_PUBLISHED","dbName":null},{"name":"COMPLETED","dbName":null},{"name":"ARCHIVED","dbName":null}],"dbName":null},"ApplicantStatus":{"values":[{"name":"REGISTERED","dbName":null},{"name":"VERIFIED","dbName":null},{"name":"TEST_IN_PROGRESS","dbName":null},{"name":"TEST_COMPLETED","dbName":null},{"name":"GRADED","dbName":null},{"name":"SHORTLISTED","dbName":null},{"name":"INTERVIEW_SCHEDULED","dbName":null},{"name":"ACCEPTED","dbName":null},{"name":"REJECTED","dbName":null},{"name":"WAITLISTED","dbName":null},{"name":"ENROLLED","dbName":null},{"name":"WITHDRAWN","dbName":null},{"name":"EXPIRED","dbName":null}],"dbName":null},"ScholarshipTier":{"values":[{"name":"FULL_100","dbName":null},{"name":"SEVENTY_FIVE","dbName":null},{"name":"HALF_50","dbName":null},{"name":"QUARTER_25","dbName":null},{"name":"NONE","dbName":null}],"dbName":null},"VerificationType":{"values":[{"name":"EMAIL_OTP","dbName":null},{"name":"PHONE_OTP","dbName":null},{"name":"BOTH","dbName":null}],"dbName":null},"AdmissionDecisionType":{"values":[{"name":"PENDING","dbName":null},{"name":"ACCEPTED","dbName":null},{"name":"REJECTED","dbName":null},{"name":"WAITLISTED","dbName":null},{"name":"SCHOLARSHIP_OFFERED","dbName":null}],"dbName":null},"EvaluationStage":{"values":[{"name":"WRITTEN_TEST","dbName":null},{"name":"INTERVIEW","dbName":null},{"name":"DOCUMENT_REVIEW","dbName":null},{"name":"FINAL_DECISION","dbName":null}],"dbName":null},"DatesheetStatus":{"values":[{"name":"DRAFT","dbName":null},{"name":"PUBLISHED","dbName":null},{"name":"ARCHIVED","dbName":null}],"dbName":null},"AggregateMode":{"values":[{"name":"SINGLE","dbName":null},{"name":"AVERAGE","dbName":null},{"name":"BEST_OF","dbName":null},{"name":"SUM","dbName":null}],"dbName":null},"AttendanceStatus":{"values":[{"name":"PRESENT","dbName":null},{"name":"ABSENT","dbName":null},{"name":"LATE","dbName":null},{"name":"EXCUSED","dbName":null}],"dbName":null},"DiaryStatus":{"values":[{"name":"DRAFT","dbName":null},{"name":"PUBLISHED","dbName":null}],"dbName":null},"DayOfWeek":{"values":[{"name":"MONDAY","dbName":null},{"name":"TUESDAY","dbName":null},{"name":"WEDNESDAY","dbName":null},{"name":"THURSDAY","dbName":null},{"name":"FRIDAY","dbName":null},{"name":"SATURDAY","dbName":null},{"name":"SUNDAY","dbName":null}],"dbName":null},"FeeFrequency":{"values":[{"name":"MONTHLY","dbName":null},{"name":"TERM","dbName":null},{"name":"ANNUAL","dbName":null},{"name":"ONE_TIME","dbName":null}],"dbName":null},"FeeAssignmentStatus":{"values":[{"name":"PENDING","dbName":null},{"name":"PARTIAL","dbName":null},{"name":"PAID","dbName":null},{"name":"OVERDUE","dbName":null},{"name":"CANCELLED","dbName":null},{"name":"WAIVED","dbName":null}],"dbName":null},"PaymentMethod":{"values":[{"name":"CASH","dbName":null},{"name":"BANK_TRANSFER","dbName":null},{"name":"ONLINE","dbName":null},{"name":"CHEQUE","dbName":null}],"dbName":null},"PaymentStatus":{"values":[{"name":"COMPLETED","dbName":null},{"name":"REVERSED","dbName":null}],"dbName":null},"AllocationStrategy":{"values":[{"name":"OLDEST_FIRST","dbName":null},{"name":"CHILD_PRIORITY","dbName":null},{"name":"EQUAL_SPLIT","dbName":null},{"name":"MANUAL","dbName":null},{"name":"CUSTOM","dbName":null}],"dbName":null},"CreditStatus":{"values":[{"name":"ACTIVE","dbName":null},{"name":"EXHAUSTED","dbName":null},{"name":"REFUNDED","dbName":null}],"dbName":null},"StudentDiscountType":{"values":[{"name":"FLAT","dbName":null},{"name":"PERCENTAGE","dbName":null}],"dbName":null}},"types":{}}');
    defineDmmfProperty2(exports.Prisma, config.runtimeDataModel);
    config.engineWasm = void 0;
    config.compilerWasm = void 0;
    var { warnEnvConflicts: warnEnvConflicts2 } = require_library();
    warnEnvConflicts2({
      rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
      schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
    });
    var PrismaClient2 = getPrismaClient2(config);
    exports.PrismaClient = PrismaClient2;
    Object.assign(exports, Prisma);
    path.join(__dirname, "query_engine-windows.dll.node");
    path.join(process.cwd(), "node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client/query_engine-windows.dll.node");
    path.join(__dirname, "schema.prisma");
    path.join(process.cwd(), "node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client/schema.prisma");
  }
});

// node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client/default.js
var require_default = __commonJS({
  "node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/.prisma/client/default.js"(exports, module) {
    init_esm();
    module.exports = { ...require_client() };
  }
});

// node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/@prisma/client/default.js
var require_default2 = __commonJS({
  "node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_magicast@0.3.5_typescript@5.9.3__typescript@5.9.3/node_modules/@prisma/client/default.js"(exports, module) {
    init_esm();
    module.exports = {
      ...require_default()
    };
  }
});

// node_modules/.pnpm/postgres-array@3.0.4/node_modules/postgres-array/index.js
var require_postgres_array = __commonJS({
  "node_modules/.pnpm/postgres-array@3.0.4/node_modules/postgres-array/index.js"(exports) {
    "use strict";
    init_esm();
    var BACKSLASH = "\\";
    var DQUOT = '"';
    var LBRACE = "{";
    var RBRACE = "}";
    var LBRACKET = "[";
    var EQUALS = "=";
    var COMMA = ",";
    var NULL_STRING = "NULL";
    function makeParseArrayWithTransform(transform) {
      const haveTransform = transform != null;
      return /* @__PURE__ */ __name(function parseArray3(str) {
        const rbraceIndex = str.length - 1;
        if (rbraceIndex === 1) {
          return [];
        }
        if (str[rbraceIndex] !== RBRACE) {
          throw new Error("Invalid array text - must end with }");
        }
        let position = 0;
        if (str[position] === LBRACKET) {
          position = str.indexOf(EQUALS) + 1;
        }
        if (str[position++] !== LBRACE) {
          throw new Error("Invalid array text - must start with {");
        }
        const output = [];
        let current = output;
        const stack = [];
        let currentStringStart = position;
        let currentString = "";
        let expectValue = true;
        for (; position < rbraceIndex; ++position) {
          let char = str[position];
          if (char === DQUOT) {
            currentStringStart = ++position;
            let dquot = str.indexOf(DQUOT, currentStringStart);
            let backSlash = str.indexOf(BACKSLASH, currentStringStart);
            while (backSlash !== -1 && backSlash < dquot) {
              position = backSlash;
              const part2 = str.slice(currentStringStart, position);
              currentString += part2;
              currentStringStart = ++position;
              if (dquot === position++) {
                dquot = str.indexOf(DQUOT, position);
              }
              backSlash = str.indexOf(BACKSLASH, position);
            }
            position = dquot;
            const part = str.slice(currentStringStart, position);
            currentString += part;
            current.push(haveTransform ? transform(currentString) : currentString);
            currentString = "";
            expectValue = false;
          } else if (char === LBRACE) {
            const newArray = [];
            current.push(newArray);
            stack.push(current);
            current = newArray;
            currentStringStart = position + 1;
            expectValue = true;
          } else if (char === COMMA) {
            expectValue = true;
          } else if (char === RBRACE) {
            expectValue = false;
            const arr = stack.pop();
            if (arr === void 0) {
              throw new Error("Invalid array text - too many '}'");
            }
            current = arr;
          } else if (expectValue) {
            currentStringStart = position;
            while ((char = str[position]) !== COMMA && char !== RBRACE && position < rbraceIndex) {
              ++position;
            }
            const part = str.slice(currentStringStart, position--);
            current.push(
              part === NULL_STRING ? null : haveTransform ? transform(part) : part
            );
            expectValue = false;
          } else {
            throw new Error("Was expecting delimeter");
          }
        }
        return output;
      }, "parseArray");
    }
    __name(makeParseArrayWithTransform, "makeParseArrayWithTransform");
    var parseArray2 = makeParseArrayWithTransform();
    exports.parse = (source, transform) => transform != null ? makeParseArrayWithTransform(transform)(source) : parseArray2(source);
  }
});

// src/lib/prisma.ts
init_esm();
var import_client = __toESM(require_default2());

// node_modules/.pnpm/@prisma+adapter-neon@6.19.2/node_modules/@prisma/adapter-neon/dist/index.mjs
init_esm();

// node_modules/.pnpm/@neondatabase+serverless@1.0.2/node_modules/@neondatabase/serverless/index.mjs
init_esm();
var So = Object.create;
var Ie = Object.defineProperty;
var Eo = Object.getOwnPropertyDescriptor;
var Ao = Object.getOwnPropertyNames;
var Co = Object.getPrototypeOf;
var _o = Object.prototype.hasOwnProperty;
var Io = /* @__PURE__ */ __name((r, e, t) => e in r ? Ie(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t, "Io");
var a = /* @__PURE__ */ __name((r, e) => Ie(r, "name", { value: e, configurable: true }), "a");
var G = /* @__PURE__ */ __name((r, e) => () => (r && (e = r(r = 0)), e), "G");
var T = /* @__PURE__ */ __name((r, e) => () => (e || r((e = { exports: {} }).exports, e), e.exports), "T");
var ie = /* @__PURE__ */ __name((r, e) => {
  for (var t in e) Ie(r, t, {
    get: e[t],
    enumerable: true
  });
}, "ie");
var Dn = /* @__PURE__ */ __name((r, e, t, n) => {
  if (e && typeof e == "object" || typeof e == "function") for (let i of Ao(e)) !_o.call(r, i) && i !== t && Ie(r, i, { get: /* @__PURE__ */ __name(() => e[i], "get"), enumerable: !(n = Eo(e, i)) || n.enumerable });
  return r;
}, "Dn");
var Se = /* @__PURE__ */ __name((r, e, t) => (t = r != null ? So(Co(r)) : {}, Dn(e || !r || !r.__esModule ? Ie(t, "default", { value: r, enumerable: true }) : t, r)), "Se");
var O = /* @__PURE__ */ __name((r) => Dn(Ie({}, "__esModule", { value: true }), r), "O");
var E = /* @__PURE__ */ __name((r, e, t) => Io(r, typeof e != "symbol" ? e + "" : e, t), "E");
var Qn = T((lt) => {
  "use strict";
  p();
  lt.byteLength = Po;
  lt.toByteArray = Ro;
  lt.fromByteArray = ko;
  var ae = [], te = [], To = typeof Uint8Array < "u" ? Uint8Array : Array, qt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (Ee = 0, On = qt.length; Ee < On; ++Ee) ae[Ee] = qt[Ee], te[qt.charCodeAt(Ee)] = Ee;
  var Ee, On;
  te[45] = 62;
  te[95] = 63;
  function qn(r) {
    var e = r.length;
    if (e % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
    var t = r.indexOf("=");
    t === -1 && (t = e);
    var n = t === e ? 0 : 4 - t % 4;
    return [t, n];
  }
  __name(qn, "qn");
  a(qn, "getLens");
  function Po(r) {
    var e = qn(r), t = e[0], n = e[1];
    return (t + n) * 3 / 4 - n;
  }
  __name(Po, "Po");
  a(Po, "byteLength");
  function Bo(r, e, t) {
    return (e + t) * 3 / 4 - t;
  }
  __name(Bo, "Bo");
  a(Bo, "_byteLength");
  function Ro(r) {
    var e, t = qn(r), n = t[0], i = t[1], s = new To(Bo(r, n, i)), o = 0, u = i > 0 ? n - 4 : n, c;
    for (c = 0; c < u; c += 4) e = te[r.charCodeAt(c)] << 18 | te[r.charCodeAt(c + 1)] << 12 | te[r.charCodeAt(c + 2)] << 6 | te[r.charCodeAt(c + 3)], s[o++] = e >> 16 & 255, s[o++] = e >> 8 & 255, s[o++] = e & 255;
    return i === 2 && (e = te[r.charCodeAt(
      c
    )] << 2 | te[r.charCodeAt(c + 1)] >> 4, s[o++] = e & 255), i === 1 && (e = te[r.charCodeAt(c)] << 10 | te[r.charCodeAt(c + 1)] << 4 | te[r.charCodeAt(c + 2)] >> 2, s[o++] = e >> 8 & 255, s[o++] = e & 255), s;
  }
  __name(Ro, "Ro");
  a(Ro, "toByteArray");
  function Lo(r) {
    return ae[r >> 18 & 63] + ae[r >> 12 & 63] + ae[r >> 6 & 63] + ae[r & 63];
  }
  __name(Lo, "Lo");
  a(Lo, "tripletToBase64");
  function Fo(r, e, t) {
    for (var n, i = [], s = e; s < t; s += 3) n = (r[s] << 16 & 16711680) + (r[s + 1] << 8 & 65280) + (r[s + 2] & 255), i.push(Lo(n));
    return i.join("");
  }
  __name(Fo, "Fo");
  a(Fo, "encodeChunk");
  function ko(r) {
    for (var e, t = r.length, n = t % 3, i = [], s = 16383, o = 0, u = t - n; o < u; o += s) i.push(Fo(
      r,
      o,
      o + s > u ? u : o + s
    ));
    return n === 1 ? (e = r[t - 1], i.push(ae[e >> 2] + ae[e << 4 & 63] + "==")) : n === 2 && (e = (r[t - 2] << 8) + r[t - 1], i.push(ae[e >> 10] + ae[e >> 4 & 63] + ae[e << 2 & 63] + "=")), i.join("");
  }
  __name(ko, "ko");
  a(ko, "fromByteArray");
});
var Nn = T((Qt) => {
  p();
  Qt.read = function(r, e, t, n, i) {
    var s, o, u = i * 8 - n - 1, c = (1 << u) - 1, l = c >> 1, f = -7, y = t ? i - 1 : 0, g = t ? -1 : 1, A = r[e + y];
    for (y += g, s = A & (1 << -f) - 1, A >>= -f, f += u; f > 0; s = s * 256 + r[e + y], y += g, f -= 8) ;
    for (o = s & (1 << -f) - 1, s >>= -f, f += n; f > 0; o = o * 256 + r[e + y], y += g, f -= 8) ;
    if (s === 0) s = 1 - l;
    else {
      if (s === c) return o ? NaN : (A ? -1 : 1) * (1 / 0);
      o = o + Math.pow(2, n), s = s - l;
    }
    return (A ? -1 : 1) * o * Math.pow(2, s - n);
  };
  Qt.write = function(r, e, t, n, i, s) {
    var o, u, c, l = s * 8 - i - 1, f = (1 << l) - 1, y = f >> 1, g = i === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, A = n ? 0 : s - 1, C = n ? 1 : -1, D = e < 0 || e === 0 && 1 / e < 0 ? 1 : 0;
    for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (u = isNaN(e) ? 1 : 0, o = f) : (o = Math.floor(Math.log(e) / Math.LN2), e * (c = Math.pow(2, -o)) < 1 && (o--, c *= 2), o + y >= 1 ? e += g / c : e += g * Math.pow(2, 1 - y), e * c >= 2 && (o++, c /= 2), o + y >= f ? (u = 0, o = f) : o + y >= 1 ? (u = (e * c - 1) * Math.pow(2, i), o = o + y) : (u = e * Math.pow(2, y - 1) * Math.pow(2, i), o = 0)); i >= 8; r[t + A] = u & 255, A += C, u /= 256, i -= 8) ;
    for (o = o << i | u, l += i; l > 0; r[t + A] = o & 255, A += C, o /= 256, l -= 8) ;
    r[t + A - C] |= D * 128;
  };
});
var ii = T((Re) => {
  "use strict";
  p();
  var Nt = Qn(), Pe = Nn(), Wn = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  Re.Buffer = h;
  Re.SlowBuffer = Qo;
  Re.INSPECT_MAX_BYTES = 50;
  var ft = 2147483647;
  Re.kMaxLength = ft;
  h.TYPED_ARRAY_SUPPORT = Mo();
  !h.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
  function Mo() {
    try {
      let r = new Uint8Array(1), e = { foo: a(function() {
        return 42;
      }, "foo") };
      return Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(r, e), r.foo() === 42;
    } catch {
      return false;
    }
  }
  __name(Mo, "Mo");
  a(Mo, "typedArraySupport");
  Object.defineProperty(h.prototype, "parent", { enumerable: true, get: a(function() {
    if (h.isBuffer(this)) return this.buffer;
  }, "get") });
  Object.defineProperty(h.prototype, "offset", { enumerable: true, get: a(function() {
    if (h.isBuffer(
      this
    )) return this.byteOffset;
  }, "get") });
  function he(r) {
    if (r > ft) throw new RangeError('The value "' + r + '" is invalid for option "size"');
    let e = new Uint8Array(r);
    return Object.setPrototypeOf(e, h.prototype), e;
  }
  __name(he, "he");
  a(he, "createBuffer");
  function h(r, e, t) {
    if (typeof r == "number") {
      if (typeof e == "string") throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      );
      return $t(r);
    }
    return Gn(r, e, t);
  }
  __name(h, "h");
  a(h, "Buffer");
  h.poolSize = 8192;
  function Gn(r, e, t) {
    if (typeof r == "string") return Do(r, e);
    if (ArrayBuffer.isView(r)) return Oo(r);
    if (r == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
    if (ue(r, ArrayBuffer) || r && ue(r.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (ue(r, SharedArrayBuffer) || r && ue(
      r.buffer,
      SharedArrayBuffer
    ))) return jt(r, e, t);
    if (typeof r == "number") throw new TypeError('The "value" argument must not be of type number. Received type number');
    let n = r.valueOf && r.valueOf();
    if (n != null && n !== r) return h.from(n, e, t);
    let i = qo(r);
    if (i) return i;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof r[Symbol.toPrimitive] == "function") return h.from(r[Symbol.toPrimitive]("string"), e, t);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
  }
  __name(Gn, "Gn");
  a(Gn, "from");
  h.from = function(r, e, t) {
    return Gn(r, e, t);
  };
  Object.setPrototypeOf(
    h.prototype,
    Uint8Array.prototype
  );
  Object.setPrototypeOf(h, Uint8Array);
  function Vn(r) {
    if (typeof r != "number") throw new TypeError(
      '"size" argument must be of type number'
    );
    if (r < 0) throw new RangeError('The value "' + r + '" is invalid for option "size"');
  }
  __name(Vn, "Vn");
  a(Vn, "assertSize");
  function Uo(r, e, t) {
    return Vn(r), r <= 0 ? he(r) : e !== void 0 ? typeof t == "string" ? he(r).fill(e, t) : he(r).fill(e) : he(r);
  }
  __name(Uo, "Uo");
  a(Uo, "alloc");
  h.alloc = function(r, e, t) {
    return Uo(r, e, t);
  };
  function $t(r) {
    return Vn(r), he(r < 0 ? 0 : Gt(r) | 0);
  }
  __name($t, "$t");
  a($t, "allocUnsafe");
  h.allocUnsafe = function(r) {
    return $t(
      r
    );
  };
  h.allocUnsafeSlow = function(r) {
    return $t(r);
  };
  function Do(r, e) {
    if ((typeof e != "string" || e === "") && (e = "utf8"), !h.isEncoding(e)) throw new TypeError("Unknown encoding: " + e);
    let t = zn(r, e) | 0, n = he(t), i = n.write(
      r,
      e
    );
    return i !== t && (n = n.slice(0, i)), n;
  }
  __name(Do, "Do");
  a(Do, "fromString");
  function Wt(r) {
    let e = r.length < 0 ? 0 : Gt(r.length) | 0, t = he(e);
    for (let n = 0; n < e; n += 1) t[n] = r[n] & 255;
    return t;
  }
  __name(Wt, "Wt");
  a(Wt, "fromArrayLike");
  function Oo(r) {
    if (ue(r, Uint8Array)) {
      let e = new Uint8Array(r);
      return jt(e.buffer, e.byteOffset, e.byteLength);
    }
    return Wt(r);
  }
  __name(Oo, "Oo");
  a(Oo, "fromArrayView");
  function jt(r, e, t) {
    if (e < 0 || r.byteLength < e) throw new RangeError('"offset" is outside of buffer bounds');
    if (r.byteLength < e + (t || 0)) throw new RangeError('"length" is outside of buffer bounds');
    let n;
    return e === void 0 && t === void 0 ? n = new Uint8Array(r) : t === void 0 ? n = new Uint8Array(r, e) : n = new Uint8Array(
      r,
      e,
      t
    ), Object.setPrototypeOf(n, h.prototype), n;
  }
  __name(jt, "jt");
  a(jt, "fromArrayBuffer");
  function qo(r) {
    if (h.isBuffer(r)) {
      let e = Gt(r.length) | 0, t = he(e);
      return t.length === 0 || r.copy(t, 0, 0, e), t;
    }
    if (r.length !== void 0) return typeof r.length != "number" || zt(r.length) ? he(0) : Wt(r);
    if (r.type === "Buffer" && Array.isArray(r.data)) return Wt(r.data);
  }
  __name(qo, "qo");
  a(qo, "fromObject");
  function Gt(r) {
    if (r >= ft) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + ft.toString(16) + " bytes");
    return r | 0;
  }
  __name(Gt, "Gt");
  a(Gt, "checked");
  function Qo(r) {
    return +r != r && (r = 0), h.alloc(+r);
  }
  __name(Qo, "Qo");
  a(Qo, "SlowBuffer");
  h.isBuffer = a(function(e) {
    return e != null && e._isBuffer === true && e !== h.prototype;
  }, "isBuffer");
  h.compare = a(function(e, t) {
    if (ue(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), ue(t, Uint8Array) && (t = h.from(t, t.offset, t.byteLength)), !h.isBuffer(e) || !h.isBuffer(t)) throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    );
    if (e === t) return 0;
    let n = e.length, i = t.length;
    for (let s = 0, o = Math.min(n, i); s < o; ++s) if (e[s] !== t[s]) {
      n = e[s], i = t[s];
      break;
    }
    return n < i ? -1 : i < n ? 1 : 0;
  }, "compare");
  h.isEncoding = a(function(e) {
    switch (String(e).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  }, "isEncoding");
  h.concat = a(function(e, t) {
    if (!Array.isArray(e)) throw new TypeError(
      '"list" argument must be an Array of Buffers'
    );
    if (e.length === 0) return h.alloc(0);
    let n;
    if (t === void 0)
      for (t = 0, n = 0; n < e.length; ++n) t += e[n].length;
    let i = h.allocUnsafe(t), s = 0;
    for (n = 0; n < e.length; ++n) {
      let o = e[n];
      if (ue(o, Uint8Array)) s + o.length > i.length ? (h.isBuffer(o) || (o = h.from(o)), o.copy(i, s)) : Uint8Array.prototype.set.call(i, o, s);
      else if (h.isBuffer(o)) o.copy(i, s);
      else throw new TypeError('"list" argument must be an Array of Buffers');
      s += o.length;
    }
    return i;
  }, "concat");
  function zn(r, e) {
    if (h.isBuffer(r)) return r.length;
    if (ArrayBuffer.isView(r) || ue(r, ArrayBuffer)) return r.byteLength;
    if (typeof r != "string") throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof r
    );
    let t = r.length, n = arguments.length > 2 && arguments[2] === true;
    if (!n && t === 0) return 0;
    let i = false;
    for (; ; ) switch (e) {
      case "ascii":
      case "latin1":
      case "binary":
        return t;
      case "utf8":
      case "utf-8":
        return Ht(r).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return t * 2;
      case "hex":
        return t >>> 1;
      case "base64":
        return ni(r).length;
      default:
        if (i) return n ? -1 : Ht(r).length;
        e = ("" + e).toLowerCase(), i = true;
    }
  }
  __name(zn, "zn");
  a(zn, "byteLength");
  h.byteLength = zn;
  function No(r, e, t) {
    let n = false;
    if ((e === void 0 || e < 0) && (e = 0), e > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, e >>>= 0, t <= e)) return "";
    for (r || (r = "utf8"); ; ) switch (r) {
      case "hex":
        return Zo(this, e, t);
      case "utf8":
      case "utf-8":
        return Yn(this, e, t);
      case "ascii":
        return Ko(this, e, t);
      case "latin1":
      case "binary":
        return Yo(
          this,
          e,
          t
        );
      case "base64":
        return Vo(this, e, t);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Jo(
          this,
          e,
          t
        );
      default:
        if (n) throw new TypeError("Unknown encoding: " + r);
        r = (r + "").toLowerCase(), n = true;
    }
  }
  __name(No, "No");
  a(
    No,
    "slowToString"
  );
  h.prototype._isBuffer = true;
  function Ae(r, e, t) {
    let n = r[e];
    r[e] = r[t], r[t] = n;
  }
  __name(Ae, "Ae");
  a(Ae, "swap");
  h.prototype.swap16 = a(function() {
    let e = this.length;
    if (e % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (let t = 0; t < e; t += 2) Ae(this, t, t + 1);
    return this;
  }, "swap16");
  h.prototype.swap32 = a(function() {
    let e = this.length;
    if (e % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (let t = 0; t < e; t += 4) Ae(this, t, t + 3), Ae(this, t + 1, t + 2);
    return this;
  }, "swap32");
  h.prototype.swap64 = a(
    function() {
      let e = this.length;
      if (e % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (let t = 0; t < e; t += 8) Ae(this, t, t + 7), Ae(this, t + 1, t + 6), Ae(this, t + 2, t + 5), Ae(this, t + 3, t + 4);
      return this;
    },
    "swap64"
  );
  h.prototype.toString = a(function() {
    let e = this.length;
    return e === 0 ? "" : arguments.length === 0 ? Yn(
      this,
      0,
      e
    ) : No.apply(this, arguments);
  }, "toString");
  h.prototype.toLocaleString = h.prototype.toString;
  h.prototype.equals = a(function(e) {
    if (!h.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
    return this === e ? true : h.compare(this, e) === 0;
  }, "equals");
  h.prototype.inspect = a(function() {
    let e = "", t = Re.INSPECT_MAX_BYTES;
    return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">";
  }, "inspect");
  Wn && (h.prototype[Wn] = h.prototype.inspect);
  h.prototype.compare = a(function(e, t, n, i, s) {
    if (ue(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), !h.isBuffer(e)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e);
    if (t === void 0 && (t = 0), n === void 0 && (n = e ? e.length : 0), i === void 0 && (i = 0), s === void 0 && (s = this.length), t < 0 || n > e.length || i < 0 || s > this.length) throw new RangeError("out of range index");
    if (i >= s && t >= n) return 0;
    if (i >= s) return -1;
    if (t >= n) return 1;
    if (t >>>= 0, n >>>= 0, i >>>= 0, s >>>= 0, this === e) return 0;
    let o = s - i, u = n - t, c = Math.min(o, u), l = this.slice(
      i,
      s
    ), f = e.slice(t, n);
    for (let y = 0; y < c; ++y) if (l[y] !== f[y]) {
      o = l[y], u = f[y];
      break;
    }
    return o < u ? -1 : u < o ? 1 : 0;
  }, "compare");
  function Kn(r, e, t, n, i) {
    if (r.length === 0) return -1;
    if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, zt(t) && (t = i ? 0 : r.length - 1), t < 0 && (t = r.length + t), t >= r.length) {
      if (i) return -1;
      t = r.length - 1;
    } else if (t < 0) if (i) t = 0;
    else return -1;
    if (typeof e == "string" && (e = h.from(
      e,
      n
    )), h.isBuffer(e)) return e.length === 0 ? -1 : jn(r, e, t, n, i);
    if (typeof e == "number") return e = e & 255, typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(r, e, t) : Uint8Array.prototype.lastIndexOf.call(r, e, t) : jn(r, [e], t, n, i);
    throw new TypeError("val must be string, number or Buffer");
  }
  __name(Kn, "Kn");
  a(Kn, "bidirectionalIndexOf");
  function jn(r, e, t, n, i) {
    let s = 1, o = r.length, u = e.length;
    if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
      if (r.length < 2 || e.length < 2) return -1;
      s = 2, o /= 2, u /= 2, t /= 2;
    }
    function c(f, y) {
      return s === 1 ? f[y] : f.readUInt16BE(y * s);
    }
    __name(c, "c");
    a(c, "read");
    let l;
    if (i) {
      let f = -1;
      for (l = t; l < o; l++) if (c(r, l) === c(e, f === -1 ? 0 : l - f)) {
        if (f === -1 && (f = l), l - f + 1 === u) return f * s;
      } else f !== -1 && (l -= l - f), f = -1;
    } else for (t + u > o && (t = o - u), l = t; l >= 0; l--) {
      let f = true;
      for (let y = 0; y < u; y++) if (c(r, l + y) !== c(e, y)) {
        f = false;
        break;
      }
      if (f) return l;
    }
    return -1;
  }
  __name(jn, "jn");
  a(jn, "arrayIndexOf");
  h.prototype.includes = a(function(e, t, n) {
    return this.indexOf(
      e,
      t,
      n
    ) !== -1;
  }, "includes");
  h.prototype.indexOf = a(function(e, t, n) {
    return Kn(this, e, t, n, true);
  }, "indexOf");
  h.prototype.lastIndexOf = a(function(e, t, n) {
    return Kn(this, e, t, n, false);
  }, "lastIndexOf");
  function Wo(r, e, t, n) {
    t = Number(t) || 0;
    let i = r.length - t;
    n ? (n = Number(n), n > i && (n = i)) : n = i;
    let s = e.length;
    n > s / 2 && (n = s / 2);
    let o;
    for (o = 0; o < n; ++o) {
      let u = parseInt(e.substr(o * 2, 2), 16);
      if (zt(u)) return o;
      r[t + o] = u;
    }
    return o;
  }
  __name(Wo, "Wo");
  a(Wo, "hexWrite");
  function jo(r, e, t, n) {
    return ht(Ht(e, r.length - t), r, t, n);
  }
  __name(jo, "jo");
  a(jo, "utf8Write");
  function Ho(r, e, t, n) {
    return ht(ra(e), r, t, n);
  }
  __name(Ho, "Ho");
  a(
    Ho,
    "asciiWrite"
  );
  function $o(r, e, t, n) {
    return ht(ni(e), r, t, n);
  }
  __name($o, "$o");
  a($o, "base64Write");
  function Go(r, e, t, n) {
    return ht(
      na(e, r.length - t),
      r,
      t,
      n
    );
  }
  __name(Go, "Go");
  a(Go, "ucs2Write");
  h.prototype.write = a(function(e, t, n, i) {
    if (t === void 0) i = "utf8", n = this.length, t = 0;
    else if (n === void 0 && typeof t == "string") i = t, n = this.length, t = 0;
    else if (isFinite(t))
      t = t >>> 0, isFinite(n) ? (n = n >>> 0, i === void 0 && (i = "utf8")) : (i = n, n = void 0);
    else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    let s = this.length - t;
    if ((n === void 0 || n > s) && (n = s), e.length > 0 && (n < 0 || t < 0) || t > this.length) throw new RangeError("Attempt to write outside buffer bounds");
    i || (i = "utf8");
    let o = false;
    for (; ; ) switch (i) {
      case "hex":
        return Wo(this, e, t, n);
      case "utf8":
      case "utf-8":
        return jo(this, e, t, n);
      case "ascii":
      case "latin1":
      case "binary":
        return Ho(this, e, t, n);
      case "base64":
        return $o(this, e, t, n);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return Go(this, e, t, n);
      default:
        if (o) throw new TypeError("Unknown encoding: " + i);
        i = ("" + i).toLowerCase(), o = true;
    }
  }, "write");
  h.prototype.toJSON = a(function() {
    return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
  }, "toJSON");
  function Vo(r, e, t) {
    return e === 0 && t === r.length ? Nt.fromByteArray(r) : Nt.fromByteArray(r.slice(e, t));
  }
  __name(Vo, "Vo");
  a(Vo, "base64Slice");
  function Yn(r, e, t) {
    t = Math.min(r.length, t);
    let n = [], i = e;
    for (; i < t; ) {
      let s = r[i], o = null, u = s > 239 ? 4 : s > 223 ? 3 : s > 191 ? 2 : 1;
      if (i + u <= t) {
        let c, l, f, y;
        switch (u) {
          case 1:
            s < 128 && (o = s);
            break;
          case 2:
            c = r[i + 1], (c & 192) === 128 && (y = (s & 31) << 6 | c & 63, y > 127 && (o = y));
            break;
          case 3:
            c = r[i + 1], l = r[i + 2], (c & 192) === 128 && (l & 192) === 128 && (y = (s & 15) << 12 | (c & 63) << 6 | l & 63, y > 2047 && (y < 55296 || y > 57343) && (o = y));
            break;
          case 4:
            c = r[i + 1], l = r[i + 2], f = r[i + 3], (c & 192) === 128 && (l & 192) === 128 && (f & 192) === 128 && (y = (s & 15) << 18 | (c & 63) << 12 | (l & 63) << 6 | f & 63, y > 65535 && y < 1114112 && (o = y));
        }
      }
      o === null ? (o = 65533, u = 1) : o > 65535 && (o -= 65536, n.push(o >>> 10 & 1023 | 55296), o = 56320 | o & 1023), n.push(o), i += u;
    }
    return zo(n);
  }
  __name(Yn, "Yn");
  a(Yn, "utf8Slice");
  var Hn = 4096;
  function zo(r) {
    let e = r.length;
    if (e <= Hn) return String.fromCharCode.apply(String, r);
    let t = "", n = 0;
    for (; n < e; ) t += String.fromCharCode.apply(String, r.slice(n, n += Hn));
    return t;
  }
  __name(zo, "zo");
  a(zo, "decodeCodePointsArray");
  function Ko(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i = e; i < t; ++i) n += String.fromCharCode(r[i] & 127);
    return n;
  }
  __name(Ko, "Ko");
  a(Ko, "asciiSlice");
  function Yo(r, e, t) {
    let n = "";
    t = Math.min(r.length, t);
    for (let i = e; i < t; ++i) n += String.fromCharCode(r[i]);
    return n;
  }
  __name(Yo, "Yo");
  a(Yo, "latin1Slice");
  function Zo(r, e, t) {
    let n = r.length;
    (!e || e < 0) && (e = 0), (!t || t < 0 || t > n) && (t = n);
    let i = "";
    for (let s = e; s < t; ++s) i += ia[r[s]];
    return i;
  }
  __name(Zo, "Zo");
  a(Zo, "hexSlice");
  function Jo(r, e, t) {
    let n = r.slice(e, t), i = "";
    for (let s = 0; s < n.length - 1; s += 2) i += String.fromCharCode(n[s] + n[s + 1] * 256);
    return i;
  }
  __name(Jo, "Jo");
  a(Jo, "utf16leSlice");
  h.prototype.slice = a(function(e, t) {
    let n = this.length;
    e = ~~e, t = t === void 0 ? n : ~~t, e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < e && (t = e);
    let i = this.subarray(e, t);
    return Object.setPrototypeOf(i, h.prototype), i;
  }, "slice");
  function q(r, e, t) {
    if (r % 1 !== 0 || r < 0) throw new RangeError("offset is not uint");
    if (r + e > t) throw new RangeError("Trying to access beyond buffer length");
  }
  __name(q, "q");
  a(q, "checkOffset");
  h.prototype.readUintLE = h.prototype.readUIntLE = a(
    function(e, t, n) {
      e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
      let i = this[e], s = 1, o = 0;
      for (; ++o < t && (s *= 256); ) i += this[e + o] * s;
      return i;
    },
    "readUIntLE"
  );
  h.prototype.readUintBE = h.prototype.readUIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(
      e,
      t,
      this.length
    );
    let i = this[e + --t], s = 1;
    for (; t > 0 && (s *= 256); ) i += this[e + --t] * s;
    return i;
  }, "readUIntBE");
  h.prototype.readUint8 = h.prototype.readUInt8 = a(
    function(e, t) {
      return e = e >>> 0, t || q(e, 1, this.length), this[e];
    },
    "readUInt8"
  );
  h.prototype.readUint16LE = h.prototype.readUInt16LE = a(function(e, t) {
    return e = e >>> 0, t || q(
      e,
      2,
      this.length
    ), this[e] | this[e + 1] << 8;
  }, "readUInt16LE");
  h.prototype.readUint16BE = h.prototype.readUInt16BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 2, this.length), this[e] << 8 | this[e + 1];
  }, "readUInt16BE");
  h.prototype.readUint32LE = h.prototype.readUInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
  }, "readUInt32LE");
  h.prototype.readUint32BE = h.prototype.readUInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
  }, "readUInt32BE");
  h.prototype.readBigUInt64LE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, s = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + n * 2 ** 24;
    return BigInt(i) + (BigInt(s) << BigInt(32));
  }, "readBigUInt64LE"));
  h.prototype.readBigUInt64BE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], s = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n;
    return (BigInt(i) << BigInt(
      32
    )) + BigInt(s);
  }, "readBigUInt64BE"));
  h.prototype.readIntLE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(
      e,
      t,
      this.length
    );
    let i = this[e], s = 1, o = 0;
    for (; ++o < t && (s *= 256); ) i += this[e + o] * s;
    return s *= 128, i >= s && (i -= Math.pow(2, 8 * t)), i;
  }, "readIntLE");
  h.prototype.readIntBE = a(function(e, t, n) {
    e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
    let i = t, s = 1, o = this[e + --i];
    for (; i > 0 && (s *= 256); ) o += this[e + --i] * s;
    return s *= 128, o >= s && (o -= Math.pow(2, 8 * t)), o;
  }, "readIntBE");
  h.prototype.readInt8 = a(function(e, t) {
    return e = e >>> 0, t || q(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e];
  }, "readInt8");
  h.prototype.readInt16LE = a(function(e, t) {
    e = e >>> 0, t || q(
      e,
      2,
      this.length
    );
    let n = this[e] | this[e + 1] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, "readInt16LE");
  h.prototype.readInt16BE = a(function(e, t) {
    e = e >>> 0, t || q(e, 2, this.length);
    let n = this[e + 1] | this[e] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, "readInt16BE");
  h.prototype.readInt32LE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
  }, "readInt32LE");
  h.prototype.readInt32BE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
  }, "readInt32BE");
  h.prototype.readBigInt64LE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (n << 24);
    return (BigInt(i) << BigInt(
      32
    )) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24);
  }, "readBigInt64LE"));
  h.prototype.readBigInt64BE = we(a(function(e) {
    e = e >>> 0, Be(e, "offset");
    let t = this[e], n = this[e + 7];
    (t === void 0 || n === void 0) && je(e, this.length - 8);
    let i = (t << 24) + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e];
    return (BigInt(i) << BigInt(32)) + BigInt(
      this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n
    );
  }, "readBigInt64BE"));
  h.prototype.readFloatLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(this, e, true, 23, 4);
  }, "readFloatLE");
  h.prototype.readFloatBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 4, this.length), Pe.read(this, e, false, 23, 4);
  }, "readFloatBE");
  h.prototype.readDoubleLE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(this, e, true, 52, 8);
  }, "readDoubleLE");
  h.prototype.readDoubleBE = a(function(e, t) {
    return e = e >>> 0, t || q(e, 8, this.length), Pe.read(
      this,
      e,
      false,
      52,
      8
    );
  }, "readDoubleBE");
  function V(r, e, t, n, i, s) {
    if (!h.isBuffer(r)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (e > i || e < s) throw new RangeError('"value" argument is out of bounds');
    if (t + n > r.length) throw new RangeError("Index out of range");
  }
  __name(V, "V");
  a(V, "checkInt");
  h.prototype.writeUintLE = h.prototype.writeUIntLE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
      let u = Math.pow(2, 8 * n) - 1;
      V(
        this,
        e,
        t,
        n,
        u,
        0
      );
    }
    let s = 1, o = 0;
    for (this[t] = e & 255; ++o < n && (s *= 256); ) this[t + o] = e / s & 255;
    return t + n;
  }, "writeUIntLE");
  h.prototype.writeUintBE = h.prototype.writeUIntBE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
      let u = Math.pow(2, 8 * n) - 1;
      V(this, e, t, n, u, 0);
    }
    let s = n - 1, o = 1;
    for (this[t + s] = e & 255; --s >= 0 && (o *= 256); ) this[t + s] = e / o & 255;
    return t + n;
  }, "writeUIntBE");
  h.prototype.writeUint8 = h.prototype.writeUInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1;
  }, "writeUInt8");
  h.prototype.writeUint16LE = h.prototype.writeUInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeUInt16LE");
  h.prototype.writeUint16BE = h.prototype.writeUInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeUInt16BE");
  h.prototype.writeUint32LE = h.prototype.writeUInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      4294967295,
      0
    ), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4;
  }, "writeUInt32LE");
  h.prototype.writeUint32BE = h.prototype.writeUInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      4294967295,
      0
    ), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeUInt32BE");
  function Zn(r, e, t, n, i) {
    ri(e, n, i, r, t, 7);
    let s = Number(e & BigInt(4294967295));
    r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, t;
  }
  __name(Zn, "Zn");
  a(Zn, "wrtBigUInt64LE");
  function Jn(r, e, t, n, i) {
    ri(e, n, i, r, t, 7);
    let s = Number(e & BigInt(4294967295));
    r[t + 7] = s, s = s >> 8, r[t + 6] = s, s = s >> 8, r[t + 5] = s, s = s >> 8, r[t + 4] = s;
    let o = Number(e >> BigInt(32) & BigInt(4294967295));
    return r[t + 3] = o, o = o >> 8, r[t + 2] = o, o = o >> 8, r[t + 1] = o, o = o >> 8, r[t] = o, t + 8;
  }
  __name(Jn, "Jn");
  a(Jn, "wrtBigUInt64BE");
  h.prototype.writeBigUInt64LE = we(a(function(e, t = 0) {
    return Zn(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
  }, "writeBigUInt64LE"));
  h.prototype.writeBigUInt64BE = we(a(function(e, t = 0) {
    return Jn(this, e, t, BigInt(0), BigInt(
      "0xffffffffffffffff"
    ));
  }, "writeBigUInt64BE"));
  h.prototype.writeIntLE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, !i) {
      let c = Math.pow(2, 8 * n - 1);
      V(this, e, t, n, c - 1, -c);
    }
    let s = 0, o = 1, u = 0;
    for (this[t] = e & 255; ++s < n && (o *= 256); )
      e < 0 && u === 0 && this[t + s - 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntLE");
  h.prototype.writeIntBE = a(function(e, t, n, i) {
    if (e = +e, t = t >>> 0, !i) {
      let c = Math.pow(2, 8 * n - 1);
      V(this, e, t, n, c - 1, -c);
    }
    let s = n - 1, o = 1, u = 0;
    for (this[t + s] = e & 255; --s >= 0 && (o *= 256); ) e < 0 && u === 0 && this[t + s + 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
    return t + n;
  }, "writeIntBE");
  h.prototype.writeInt8 = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1;
  }, "writeInt8");
  h.prototype.writeInt16LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
  }, "writeInt16LE");
  h.prototype.writeInt16BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
  }, "writeInt16BE");
  h.prototype.writeInt32LE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      2147483647,
      -2147483648
    ), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4;
  }, "writeInt32LE");
  h.prototype.writeInt32BE = a(function(e, t, n) {
    return e = +e, t = t >>> 0, n || V(
      this,
      e,
      t,
      4,
      2147483647,
      -2147483648
    ), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
  }, "writeInt32BE");
  h.prototype.writeBigInt64LE = we(a(function(e, t = 0) {
    return Zn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  }, "writeBigInt64LE"));
  h.prototype.writeBigInt64BE = we(
    a(function(e, t = 0) {
      return Jn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }, "writeBigInt64BE")
  );
  function Xn(r, e, t, n, i, s) {
    if (t + n > r.length) throw new RangeError("Index out of range");
    if (t < 0) throw new RangeError("Index out of range");
  }
  __name(Xn, "Xn");
  a(Xn, "checkIEEE754");
  function ei(r, e, t, n, i) {
    return e = +e, t = t >>> 0, i || Xn(r, e, t, 4, 34028234663852886e22, -34028234663852886e22), Pe.write(r, e, t, n, 23, 4), t + 4;
  }
  __name(ei, "ei");
  a(
    ei,
    "writeFloat"
  );
  h.prototype.writeFloatLE = a(function(e, t, n) {
    return ei(this, e, t, true, n);
  }, "writeFloatLE");
  h.prototype.writeFloatBE = a(function(e, t, n) {
    return ei(this, e, t, false, n);
  }, "writeFloatBE");
  function ti(r, e, t, n, i) {
    return e = +e, t = t >>> 0, i || Xn(r, e, t, 8, 17976931348623157e292, -17976931348623157e292), Pe.write(
      r,
      e,
      t,
      n,
      52,
      8
    ), t + 8;
  }
  __name(ti, "ti");
  a(ti, "writeDouble");
  h.prototype.writeDoubleLE = a(function(e, t, n) {
    return ti(this, e, t, true, n);
  }, "writeDoubleLE");
  h.prototype.writeDoubleBE = a(function(e, t, n) {
    return ti(this, e, t, false, n);
  }, "writeDoubleBE");
  h.prototype.copy = a(function(e, t, n, i) {
    if (!h.isBuffer(e)) throw new TypeError("argument should be a Buffer");
    if (n || (n = 0), !i && i !== 0 && (i = this.length), t >= e.length && (t = e.length), t || (t = 0), i > 0 && i < n && (i = n), i === n || e.length === 0 || this.length === 0) return 0;
    if (t < 0) throw new RangeError("targetStart out of bounds");
    if (n < 0 || n >= this.length) throw new RangeError("Index out of range");
    if (i < 0) throw new RangeError("sourceEnd out of bounds");
    i > this.length && (i = this.length), e.length - t < i - n && (i = e.length - t + n);
    let s = i - n;
    return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, i) : Uint8Array.prototype.set.call(e, this.subarray(n, i), t), s;
  }, "copy");
  h.prototype.fill = a(function(e, t, n, i) {
    if (typeof e == "string") {
      if (typeof t == "string" ? (i = t, t = 0, n = this.length) : typeof n == "string" && (i = n, n = this.length), i !== void 0 && typeof i != "string") throw new TypeError("encoding must be a string");
      if (typeof i == "string" && !h.isEncoding(i)) throw new TypeError(
        "Unknown encoding: " + i
      );
      if (e.length === 1) {
        let o = e.charCodeAt(0);
        (i === "utf8" && o < 128 || i === "latin1") && (e = o);
      }
    } else typeof e == "number" ? e = e & 255 : typeof e == "boolean" && (e = Number(e));
    if (t < 0 || this.length < t || this.length < n) throw new RangeError("Out of range index");
    if (n <= t) return this;
    t = t >>> 0, n = n === void 0 ? this.length : n >>> 0, e || (e = 0);
    let s;
    if (typeof e == "number") for (s = t; s < n; ++s) this[s] = e;
    else {
      let o = h.isBuffer(e) ? e : h.from(
        e,
        i
      ), u = o.length;
      if (u === 0) throw new TypeError('The value "' + e + '" is invalid for argument "value"');
      for (s = 0; s < n - t; ++s) this[s + t] = o[s % u];
    }
    return this;
  }, "fill");
  var Te = {};
  function Vt(r, e, t) {
    var n;
    Te[r] = (n = class extends t {
      static {
        __name(this, "n");
      }
      constructor() {
        super(), Object.defineProperty(this, "message", { value: e.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${r}]`, this.stack, delete this.name;
      }
      get code() {
        return r;
      }
      set code(s) {
        Object.defineProperty(
          this,
          "code",
          { configurable: true, enumerable: true, value: s, writable: true }
        );
      }
      toString() {
        return `${this.name} [${r}]: ${this.message}`;
      }
    }, a(n, "NodeError"), n);
  }
  __name(Vt, "Vt");
  a(Vt, "E");
  Vt("ERR_BUFFER_OUT_OF_BOUNDS", function(r) {
    return r ? `${r} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
  }, RangeError);
  Vt(
    "ERR_INVALID_ARG_TYPE",
    function(r, e) {
      return `The "${r}" argument must be of type number. Received type ${typeof e}`;
    },
    TypeError
  );
  Vt("ERR_OUT_OF_RANGE", function(r, e, t) {
    let n = `The value of "${r}" is out of range.`, i = t;
    return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? i = $n(String(t)) : typeof t == "bigint" && (i = String(
      t
    ), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (i = $n(i)), i += "n"), n += ` It must be ${e}. Received ${i}`, n;
  }, RangeError);
  function $n(r) {
    let e = "", t = r.length, n = r[0] === "-" ? 1 : 0;
    for (; t >= n + 4; t -= 3) e = `_${r.slice(t - 3, t)}${e}`;
    return `${r.slice(0, t)}${e}`;
  }
  __name($n, "$n");
  a($n, "addNumericalSeparator");
  function Xo(r, e, t) {
    Be(e, "offset"), (r[e] === void 0 || r[e + t] === void 0) && je(e, r.length - (t + 1));
  }
  __name(Xo, "Xo");
  a(Xo, "checkBounds");
  function ri(r, e, t, n, i, s) {
    if (r > t || r < e) {
      let o = typeof e == "bigint" ? "n" : "", u;
      throw s > 3 ? e === 0 || e === BigInt(0) ? u = `>= 0${o} and < 2${o} ** ${(s + 1) * 8}${o}` : u = `>= -(2${o} ** ${(s + 1) * 8 - 1}${o}) and < 2 ** ${(s + 1) * 8 - 1}${o}` : u = `>= ${e}${o} and <= ${t}${o}`, new Te.ERR_OUT_OF_RANGE("value", u, r);
    }
    Xo(n, i, s);
  }
  __name(ri, "ri");
  a(ri, "checkIntBI");
  function Be(r, e) {
    if (typeof r != "number") throw new Te.ERR_INVALID_ARG_TYPE(e, "number", r);
  }
  __name(Be, "Be");
  a(Be, "validateNumber");
  function je(r, e, t) {
    throw Math.floor(r) !== r ? (Be(r, t), new Te.ERR_OUT_OF_RANGE(t || "offset", "an integer", r)) : e < 0 ? new Te.ERR_BUFFER_OUT_OF_BOUNDS() : new Te.ERR_OUT_OF_RANGE(t || "offset", `>= ${t ? 1 : 0} and <= ${e}`, r);
  }
  __name(je, "je");
  a(je, "boundsError");
  var ea = /[^+/0-9A-Za-z-_]/g;
  function ta(r) {
    if (r = r.split("=")[0], r = r.trim().replace(ea, ""), r.length < 2) return "";
    for (; r.length % 4 !== 0; ) r = r + "=";
    return r;
  }
  __name(ta, "ta");
  a(ta, "base64clean");
  function Ht(r, e) {
    e = e || 1 / 0;
    let t, n = r.length, i = null, s = [];
    for (let o = 0; o < n; ++o) {
      if (t = r.charCodeAt(o), t > 55295 && t < 57344) {
        if (!i) {
          if (t > 56319) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          } else if (o + 1 === n) {
            (e -= 3) > -1 && s.push(239, 191, 189);
            continue;
          }
          i = t;
          continue;
        }
        if (t < 56320) {
          (e -= 3) > -1 && s.push(239, 191, 189), i = t;
          continue;
        }
        t = (i - 55296 << 10 | t - 56320) + 65536;
      } else i && (e -= 3) > -1 && s.push(239, 191, 189);
      if (i = null, t < 128) {
        if ((e -= 1) < 0) break;
        s.push(t);
      } else if (t < 2048) {
        if ((e -= 2) < 0) break;
        s.push(t >> 6 | 192, t & 63 | 128);
      } else if (t < 65536) {
        if ((e -= 3) < 0) break;
        s.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
      } else if (t < 1114112) {
        if ((e -= 4) < 0) break;
        s.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
      } else throw new Error("Invalid code point");
    }
    return s;
  }
  __name(Ht, "Ht");
  a(Ht, "utf8ToBytes");
  function ra(r) {
    let e = [];
    for (let t = 0; t < r.length; ++t) e.push(r.charCodeAt(t) & 255);
    return e;
  }
  __name(ra, "ra");
  a(
    ra,
    "asciiToBytes"
  );
  function na(r, e) {
    let t, n, i, s = [];
    for (let o = 0; o < r.length && !((e -= 2) < 0); ++o) t = r.charCodeAt(
      o
    ), n = t >> 8, i = t % 256, s.push(i), s.push(n);
    return s;
  }
  __name(na, "na");
  a(na, "utf16leToBytes");
  function ni(r) {
    return Nt.toByteArray(
      ta(r)
    );
  }
  __name(ni, "ni");
  a(ni, "base64ToBytes");
  function ht(r, e, t, n) {
    let i;
    for (i = 0; i < n && !(i + t >= e.length || i >= r.length); ++i)
      e[i + t] = r[i];
    return i;
  }
  __name(ht, "ht");
  a(ht, "blitBuffer");
  function ue(r, e) {
    return r instanceof e || r != null && r.constructor != null && r.constructor.name != null && r.constructor.name === e.name;
  }
  __name(ue, "ue");
  a(ue, "isInstance");
  function zt(r) {
    return r !== r;
  }
  __name(zt, "zt");
  a(zt, "numberIsNaN");
  var ia = function() {
    let r = "0123456789abcdef", e = new Array(256);
    for (let t = 0; t < 16; ++t) {
      let n = t * 16;
      for (let i = 0; i < 16; ++i) e[n + i] = r[t] + r[i];
    }
    return e;
  }();
  function we(r) {
    return typeof BigInt > "u" ? sa : r;
  }
  __name(we, "we");
  a(we, "defineBigIntMethod");
  function sa() {
    throw new Error("BigInt not supported");
  }
  __name(sa, "sa");
  a(sa, "BufferBigIntNotDefined");
});
var b;
var v;
var x;
var d;
var m;
var p = G(() => {
  "use strict";
  b = globalThis, v = globalThis.setImmediate ?? ((r) => setTimeout(r, 0)), x = globalThis.clearImmediate ?? ((r) => clearTimeout(r)), d = typeof globalThis.Buffer == "function" && typeof globalThis.Buffer.allocUnsafe == "function" ? globalThis.Buffer : ii().Buffer, m = globalThis.process ?? {};
  m.env ?? (m.env = {});
  try {
    m.nextTick(() => {
    });
  } catch {
    let e = Promise.resolve();
    m.nextTick = e.then.bind(e);
  }
});
var ge = T((Rl, Kt) => {
  "use strict";
  p();
  var Le = typeof Reflect == "object" ? Reflect : null, si = Le && typeof Le.apply == "function" ? Le.apply : a(function(e, t, n) {
    return Function.prototype.apply.call(e, t, n);
  }, "ReflectApply"), pt;
  Le && typeof Le.ownKeys == "function" ? pt = Le.ownKeys : Object.getOwnPropertySymbols ? pt = a(function(e) {
    return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
  }, "ReflectOwnKeys") : pt = a(function(e) {
    return Object.getOwnPropertyNames(e);
  }, "ReflectOwnKeys");
  function oa(r) {
    console && console.warn && console.warn(r);
  }
  __name(oa, "oa");
  a(
    oa,
    "ProcessEmitWarning"
  );
  var ai = Number.isNaN || a(function(e) {
    return e !== e;
  }, "NumberIsNaN");
  function B() {
    B.init.call(this);
  }
  __name(B, "B");
  a(B, "EventEmitter");
  Kt.exports = B;
  Kt.exports.once = la;
  B.EventEmitter = B;
  B.prototype._events = void 0;
  B.prototype._eventsCount = 0;
  B.prototype._maxListeners = void 0;
  var oi = 10;
  function dt(r) {
    if (typeof r != "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r);
  }
  __name(dt, "dt");
  a(dt, "checkListener");
  Object.defineProperty(B, "defaultMaxListeners", { enumerable: true, get: a(function() {
    return oi;
  }, "get"), set: a(
    function(r) {
      if (typeof r != "number" || r < 0 || ai(r)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r + ".");
      oi = r;
    },
    "set"
  ) });
  B.init = function() {
    (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
  };
  B.prototype.setMaxListeners = a(function(e) {
    if (typeof e != "number" || e < 0 || ai(e)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
    return this._maxListeners = e, this;
  }, "setMaxListeners");
  function ui(r) {
    return r._maxListeners === void 0 ? B.defaultMaxListeners : r._maxListeners;
  }
  __name(ui, "ui");
  a(ui, "_getMaxListeners");
  B.prototype.getMaxListeners = a(function() {
    return ui(this);
  }, "getMaxListeners");
  B.prototype.emit = a(function(e) {
    for (var t = [], n = 1; n < arguments.length; n++) t.push(arguments[n]);
    var i = e === "error", s = this._events;
    if (s !== void 0) i = i && s.error === void 0;
    else if (!i) return false;
    if (i) {
      var o;
      if (t.length > 0 && (o = t[0]), o instanceof Error) throw o;
      var u = new Error("Unhandled error." + (o ? " (" + o.message + ")" : ""));
      throw u.context = o, u;
    }
    var c = s[e];
    if (c === void 0) return false;
    if (typeof c == "function") si(c, this, t);
    else for (var l = c.length, f = pi(c, l), n = 0; n < l; ++n) si(f[n], this, t);
    return true;
  }, "emit");
  function ci(r, e, t, n) {
    var i, s, o;
    if (dt(
      t
    ), s = r._events, s === void 0 ? (s = r._events = /* @__PURE__ */ Object.create(null), r._eventsCount = 0) : (s.newListener !== void 0 && (r.emit("newListener", e, t.listener ? t.listener : t), s = r._events), o = s[e]), o === void 0) o = s[e] = t, ++r._eventsCount;
    else if (typeof o == "function" ? o = s[e] = n ? [t, o] : [o, t] : n ? o.unshift(t) : o.push(t), i = ui(r), i > 0 && o.length > i && !o.warned) {
      o.warned = true;
      var u = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
      u.name = "MaxListenersExceededWarning", u.emitter = r, u.type = e, u.count = o.length, oa(u);
    }
    return r;
  }
  __name(ci, "ci");
  a(ci, "_addListener");
  B.prototype.addListener = a(function(e, t) {
    return ci(this, e, t, false);
  }, "addListener");
  B.prototype.on = B.prototype.addListener;
  B.prototype.prependListener = a(function(e, t) {
    return ci(this, e, t, true);
  }, "prependListener");
  function aa() {
    if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = true, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
  }
  __name(aa, "aa");
  a(aa, "onceWrapper");
  function li(r, e, t) {
    var n = {
      fired: false,
      wrapFn: void 0,
      target: r,
      type: e,
      listener: t
    }, i = aa.bind(n);
    return i.listener = t, n.wrapFn = i, i;
  }
  __name(li, "li");
  a(li, "_onceWrap");
  B.prototype.once = a(function(e, t) {
    return dt(t), this.on(e, li(this, e, t)), this;
  }, "once");
  B.prototype.prependOnceListener = a(function(e, t) {
    return dt(t), this.prependListener(e, li(this, e, t)), this;
  }, "prependOnceListener");
  B.prototype.removeListener = a(function(e, t) {
    var n, i, s, o, u;
    if (dt(t), i = this._events, i === void 0) return this;
    if (n = i[e], n === void 0) return this;
    if (n === t || n.listener === t) --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete i[e], i.removeListener && this.emit("removeListener", e, n.listener || t));
    else if (typeof n != "function") {
      for (s = -1, o = n.length - 1; o >= 0; o--) if (n[o] === t || n[o].listener === t) {
        u = n[o].listener, s = o;
        break;
      }
      if (s < 0) return this;
      s === 0 ? n.shift() : ua(n, s), n.length === 1 && (i[e] = n[0]), i.removeListener !== void 0 && this.emit("removeListener", e, u || t);
    }
    return this;
  }, "removeListener");
  B.prototype.off = B.prototype.removeListener;
  B.prototype.removeAllListeners = a(function(e) {
    var t, n, i;
    if (n = this._events, n === void 0) return this;
    if (n.removeListener === void 0) return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : n[e] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete n[e]), this;
    if (arguments.length === 0) {
      var s = Object.keys(n), o;
      for (i = 0; i < s.length; ++i) o = s[i], o !== "removeListener" && this.removeAllListeners(
        o
      );
      return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
    }
    if (t = n[e], typeof t == "function") this.removeListener(e, t);
    else if (t !== void 0) for (i = t.length - 1; i >= 0; i--) this.removeListener(e, t[i]);
    return this;
  }, "removeAllListeners");
  function fi(r, e, t) {
    var n = r._events;
    if (n === void 0) return [];
    var i = n[e];
    return i === void 0 ? [] : typeof i == "function" ? t ? [i.listener || i] : [i] : t ? ca(i) : pi(i, i.length);
  }
  __name(fi, "fi");
  a(fi, "_listeners");
  B.prototype.listeners = a(function(e) {
    return fi(this, e, true);
  }, "listeners");
  B.prototype.rawListeners = a(function(e) {
    return fi(this, e, false);
  }, "rawListeners");
  B.listenerCount = function(r, e) {
    return typeof r.listenerCount == "function" ? r.listenerCount(e) : hi.call(r, e);
  };
  B.prototype.listenerCount = hi;
  function hi(r) {
    var e = this._events;
    if (e !== void 0) {
      var t = e[r];
      if (typeof t == "function")
        return 1;
      if (t !== void 0) return t.length;
    }
    return 0;
  }
  __name(hi, "hi");
  a(hi, "listenerCount");
  B.prototype.eventNames = a(function() {
    return this._eventsCount > 0 ? pt(this._events) : [];
  }, "eventNames");
  function pi(r, e) {
    for (var t = new Array(e), n = 0; n < e; ++n) t[n] = r[n];
    return t;
  }
  __name(pi, "pi");
  a(pi, "arrayClone");
  function ua(r, e) {
    for (; e + 1 < r.length; e++) r[e] = r[e + 1];
    r.pop();
  }
  __name(ua, "ua");
  a(ua, "spliceOne");
  function ca(r) {
    for (var e = new Array(r.length), t = 0; t < e.length; ++t) e[t] = r[t].listener || r[t];
    return e;
  }
  __name(ca, "ca");
  a(ca, "unwrapListeners");
  function la(r, e) {
    return new Promise(function(t, n) {
      function i(o) {
        r.removeListener(e, s), n(o);
      }
      __name(i, "i");
      a(i, "errorListener");
      function s() {
        typeof r.removeListener == "function" && r.removeListener("error", i), t([].slice.call(arguments));
      }
      __name(s, "s");
      a(s, "resolver"), di(r, e, s, { once: true }), e !== "error" && fa(r, i, { once: true });
    });
  }
  __name(la, "la");
  a(la, "once");
  function fa(r, e, t) {
    typeof r.on == "function" && di(r, "error", e, t);
  }
  __name(fa, "fa");
  a(
    fa,
    "addErrorHandlerIfEventEmitter"
  );
  function di(r, e, t, n) {
    if (typeof r.on == "function") n.once ? r.once(e, t) : r.on(e, t);
    else if (typeof r.addEventListener == "function") r.addEventListener(e, a(/* @__PURE__ */ __name(function i(s) {
      n.once && r.removeEventListener(e, i), t(s);
    }, "i"), "wrapListener"));
    else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r);
  }
  __name(di, "di");
  a(di, "eventTargetAgnosticAddListener");
});
var wi = {};
ie(wi, { Socket: /* @__PURE__ */ __name(() => ce, "Socket"), isIP: /* @__PURE__ */ __name(() => ha, "isIP") });
function ha(r) {
  return 0;
}
__name(ha, "ha");
var mi;
var yi;
var S;
var ce;
var Fe = G(() => {
  "use strict";
  p();
  mi = Se(ge(), 1);
  a(ha, "isIP");
  yi = /^[^.]+\./, S = class S2 extends mi.EventEmitter {
    static {
      __name(this, "S");
    }
    constructor() {
      super(...arguments);
      E(this, "opts", {});
      E(this, "connecting", false);
      E(this, "pending", true);
      E(
        this,
        "writable",
        true
      );
      E(this, "encrypted", false);
      E(this, "authorized", false);
      E(this, "destroyed", false);
      E(this, "ws", null);
      E(this, "writeBuffer");
      E(this, "tlsState", 0);
      E(this, "tlsRead");
      E(this, "tlsWrite");
    }
    static get poolQueryViaFetch() {
      return S2.opts.poolQueryViaFetch ?? S2.defaults.poolQueryViaFetch;
    }
    static set poolQueryViaFetch(t) {
      S2.opts.poolQueryViaFetch = t;
    }
    static get fetchEndpoint() {
      return S2.opts.fetchEndpoint ?? S2.defaults.fetchEndpoint;
    }
    static set fetchEndpoint(t) {
      S2.opts.fetchEndpoint = t;
    }
    static get fetchConnectionCache() {
      return true;
    }
    static set fetchConnectionCache(t) {
      console.warn("The `fetchConnectionCache` option is deprecated (now always `true`)");
    }
    static get fetchFunction() {
      return S2.opts.fetchFunction ?? S2.defaults.fetchFunction;
    }
    static set fetchFunction(t) {
      S2.opts.fetchFunction = t;
    }
    static get webSocketConstructor() {
      return S2.opts.webSocketConstructor ?? S2.defaults.webSocketConstructor;
    }
    static set webSocketConstructor(t) {
      S2.opts.webSocketConstructor = t;
    }
    get webSocketConstructor() {
      return this.opts.webSocketConstructor ?? S2.webSocketConstructor;
    }
    set webSocketConstructor(t) {
      this.opts.webSocketConstructor = t;
    }
    static get wsProxy() {
      return S2.opts.wsProxy ?? S2.defaults.wsProxy;
    }
    static set wsProxy(t) {
      S2.opts.wsProxy = t;
    }
    get wsProxy() {
      return this.opts.wsProxy ?? S2.wsProxy;
    }
    set wsProxy(t) {
      this.opts.wsProxy = t;
    }
    static get coalesceWrites() {
      return S2.opts.coalesceWrites ?? S2.defaults.coalesceWrites;
    }
    static set coalesceWrites(t) {
      S2.opts.coalesceWrites = t;
    }
    get coalesceWrites() {
      return this.opts.coalesceWrites ?? S2.coalesceWrites;
    }
    set coalesceWrites(t) {
      this.opts.coalesceWrites = t;
    }
    static get useSecureWebSocket() {
      return S2.opts.useSecureWebSocket ?? S2.defaults.useSecureWebSocket;
    }
    static set useSecureWebSocket(t) {
      S2.opts.useSecureWebSocket = t;
    }
    get useSecureWebSocket() {
      return this.opts.useSecureWebSocket ?? S2.useSecureWebSocket;
    }
    set useSecureWebSocket(t) {
      this.opts.useSecureWebSocket = t;
    }
    static get forceDisablePgSSL() {
      return S2.opts.forceDisablePgSSL ?? S2.defaults.forceDisablePgSSL;
    }
    static set forceDisablePgSSL(t) {
      S2.opts.forceDisablePgSSL = t;
    }
    get forceDisablePgSSL() {
      return this.opts.forceDisablePgSSL ?? S2.forceDisablePgSSL;
    }
    set forceDisablePgSSL(t) {
      this.opts.forceDisablePgSSL = t;
    }
    static get disableSNI() {
      return S2.opts.disableSNI ?? S2.defaults.disableSNI;
    }
    static set disableSNI(t) {
      S2.opts.disableSNI = t;
    }
    get disableSNI() {
      return this.opts.disableSNI ?? S2.disableSNI;
    }
    set disableSNI(t) {
      this.opts.disableSNI = t;
    }
    static get disableWarningInBrowsers() {
      return S2.opts.disableWarningInBrowsers ?? S2.defaults.disableWarningInBrowsers;
    }
    static set disableWarningInBrowsers(t) {
      S2.opts.disableWarningInBrowsers = t;
    }
    get disableWarningInBrowsers() {
      return this.opts.disableWarningInBrowsers ?? S2.disableWarningInBrowsers;
    }
    set disableWarningInBrowsers(t) {
      this.opts.disableWarningInBrowsers = t;
    }
    static get pipelineConnect() {
      return S2.opts.pipelineConnect ?? S2.defaults.pipelineConnect;
    }
    static set pipelineConnect(t) {
      S2.opts.pipelineConnect = t;
    }
    get pipelineConnect() {
      return this.opts.pipelineConnect ?? S2.pipelineConnect;
    }
    set pipelineConnect(t) {
      this.opts.pipelineConnect = t;
    }
    static get subtls() {
      return S2.opts.subtls ?? S2.defaults.subtls;
    }
    static set subtls(t) {
      S2.opts.subtls = t;
    }
    get subtls() {
      return this.opts.subtls ?? S2.subtls;
    }
    set subtls(t) {
      this.opts.subtls = t;
    }
    static get pipelineTLS() {
      return S2.opts.pipelineTLS ?? S2.defaults.pipelineTLS;
    }
    static set pipelineTLS(t) {
      S2.opts.pipelineTLS = t;
    }
    get pipelineTLS() {
      return this.opts.pipelineTLS ?? S2.pipelineTLS;
    }
    set pipelineTLS(t) {
      this.opts.pipelineTLS = t;
    }
    static get rootCerts() {
      return S2.opts.rootCerts ?? S2.defaults.rootCerts;
    }
    static set rootCerts(t) {
      S2.opts.rootCerts = t;
    }
    get rootCerts() {
      return this.opts.rootCerts ?? S2.rootCerts;
    }
    set rootCerts(t) {
      this.opts.rootCerts = t;
    }
    wsProxyAddrForHost(t, n) {
      let i = this.wsProxy;
      if (i === void 0) throw new Error("No WebSocket proxy is configured. Please see https://github.com/neondatabase/serverless/blob/main/CONFIG.md#wsproxy-string--host-string-port-number--string--string");
      return typeof i == "function" ? i(t, n) : `${i}?address=${t}:${n}`;
    }
    setNoDelay() {
      return this;
    }
    setKeepAlive() {
      return this;
    }
    ref() {
      return this;
    }
    unref() {
      return this;
    }
    connect(t, n, i) {
      this.connecting = true, i && this.once("connect", i);
      let s = a(() => {
        this.connecting = false, this.pending = false, this.emit("connect"), this.emit("ready");
      }, "handleWebSocketOpen"), o = a((c, l = false) => {
        c.binaryType = "arraybuffer", c.addEventListener("error", (f) => {
          this.emit("error", f), this.emit("close");
        }), c.addEventListener("message", (f) => {
          if (this.tlsState === 0) {
            let y = d.from(f.data);
            this.emit("data", y);
          }
        }), c.addEventListener("close", () => {
          this.emit("close");
        }), l ? s() : c.addEventListener(
          "open",
          s
        );
      }, "configureWebSocket"), u;
      try {
        u = this.wsProxyAddrForHost(n, typeof t == "string" ? parseInt(t, 10) : t);
      } catch (c) {
        this.emit("error", c), this.emit("close");
        return;
      }
      try {
        let l = (this.useSecureWebSocket ? "wss:" : "ws:") + "//" + u;
        if (this.webSocketConstructor !== void 0) this.ws = new this.webSocketConstructor(l), o(this.ws);
        else try {
          this.ws = new WebSocket(l), o(this.ws);
        } catch {
          this.ws = new __unstable_WebSocket(l), o(this.ws);
        }
      } catch (c) {
        let f = (this.useSecureWebSocket ? "https:" : "http:") + "//" + u;
        fetch(f, { headers: { Upgrade: "websocket" } }).then(
          (y) => {
            if (this.ws = y.webSocket, this.ws == null) throw c;
            this.ws.accept(), o(this.ws, true);
          }
        ).catch((y) => {
          this.emit(
            "error",
            new Error(`All attempts to open a WebSocket to connect to the database failed. Please refer to https://github.com/neondatabase/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined. Details: ${y}`)
          ), this.emit("close");
        });
      }
    }
    async startTls(t) {
      if (this.subtls === void 0) throw new Error(
        "For Postgres SSL connections, you must set `neonConfig.subtls` to the subtls library. See https://github.com/neondatabase/serverless/blob/main/CONFIG.md for more information."
      );
      this.tlsState = 1;
      let n = await this.subtls.TrustedCert.databaseFromPEM(this.rootCerts), i = new this.subtls.WebSocketReadQueue(this.ws), s = i.read.bind(i), o = this.rawWrite.bind(this), { read: u, write: c } = await this.subtls.startTls(t, n, s, o, { useSNI: !this.disableSNI, expectPreData: this.pipelineTLS ? new Uint8Array([83]) : void 0 });
      this.tlsRead = u, this.tlsWrite = c, this.tlsState = 2, this.encrypted = true, this.authorized = true, this.emit("secureConnection", this), this.tlsReadLoop();
    }
    async tlsReadLoop() {
      for (; ; ) {
        let t = await this.tlsRead();
        if (t === void 0) break;
        {
          let n = d.from(t);
          this.emit("data", n);
        }
      }
    }
    rawWrite(t) {
      if (!this.coalesceWrites) {
        this.ws && this.ws.send(t);
        return;
      }
      if (this.writeBuffer === void 0) this.writeBuffer = t, setTimeout(() => {
        this.ws && this.ws.send(this.writeBuffer), this.writeBuffer = void 0;
      }, 0);
      else {
        let n = new Uint8Array(
          this.writeBuffer.length + t.length
        );
        n.set(this.writeBuffer), n.set(t, this.writeBuffer.length), this.writeBuffer = n;
      }
    }
    write(t, n = "utf8", i = (s) => {
    }) {
      return t.length === 0 ? (i(), true) : (typeof t == "string" && (t = d.from(t, n)), this.tlsState === 0 ? (this.rawWrite(t), i()) : this.tlsState === 1 ? this.once("secureConnection", () => {
        this.write(
          t,
          n,
          i
        );
      }) : (this.tlsWrite(t), i()), true);
    }
    end(t = d.alloc(0), n = "utf8", i = () => {
    }) {
      return this.write(t, n, () => {
        this.ws.close(), i();
      }), this;
    }
    destroy() {
      return this.destroyed = true, this.end();
    }
  };
  a(S, "Socket"), E(S, "defaults", {
    poolQueryViaFetch: false,
    fetchEndpoint: a((t, n, i) => {
      let s;
      return i?.jwtAuth ? s = t.replace(yi, "apiauth.") : s = t.replace(yi, "api."), "https://" + s + "/sql";
    }, "fetchEndpoint"),
    fetchConnectionCache: true,
    fetchFunction: void 0,
    webSocketConstructor: void 0,
    wsProxy: a((t) => t + "/v2", "wsProxy"),
    useSecureWebSocket: true,
    forceDisablePgSSL: true,
    coalesceWrites: true,
    pipelineConnect: "password",
    subtls: void 0,
    rootCerts: "",
    pipelineTLS: false,
    disableSNI: false,
    disableWarningInBrowsers: false
  }), E(S, "opts", {});
  ce = S;
});
var gi = {};
ie(gi, { parse: /* @__PURE__ */ __name(() => Yt, "parse") });
function Yt(r, e = false) {
  let { protocol: t } = new URL(r), n = "http:" + r.substring(
    t.length
  ), { username: i, password: s, host: o, hostname: u, port: c, pathname: l, search: f, searchParams: y, hash: g } = new URL(
    n
  );
  s = decodeURIComponent(s), i = decodeURIComponent(i), l = decodeURIComponent(l);
  let A = i + ":" + s, C = e ? Object.fromEntries(y.entries()) : f;
  return {
    href: r,
    protocol: t,
    auth: A,
    username: i,
    password: s,
    host: o,
    hostname: u,
    port: c,
    pathname: l,
    search: f,
    query: C,
    hash: g
  };
}
__name(Yt, "Yt");
var Zt = G(() => {
  "use strict";
  p();
  a(Yt, "parse");
});
var tr = T((Ai) => {
  "use strict";
  p();
  Ai.parse = function(r, e) {
    return new er(r, e).parse();
  };
  var vt = class vt2 {
    static {
      __name(this, "vt");
    }
    constructor(e, t) {
      this.source = e, this.transform = t || Ca, this.position = 0, this.entries = [], this.recorded = [], this.dimension = 0;
    }
    isEof() {
      return this.position >= this.source.length;
    }
    nextCharacter() {
      var e = this.source[this.position++];
      return e === "\\" ? { value: this.source[this.position++], escaped: true } : { value: e, escaped: false };
    }
    record(e) {
      this.recorded.push(
        e
      );
    }
    newEntry(e) {
      var t;
      (this.recorded.length > 0 || e) && (t = this.recorded.join(""), t === "NULL" && !e && (t = null), t !== null && (t = this.transform(t)), this.entries.push(t), this.recorded = []);
    }
    consumeDimensions() {
      if (this.source[0] === "[") for (; !this.isEof(); ) {
        var e = this.nextCharacter();
        if (e.value === "=") break;
      }
    }
    parse(e) {
      var t, n, i;
      for (this.consumeDimensions(); !this.isEof(); ) if (t = this.nextCharacter(), t.value === "{" && !i) this.dimension++, this.dimension > 1 && (n = new vt2(this.source.substr(this.position - 1), this.transform), this.entries.push(n.parse(
        true
      )), this.position += n.position - 2);
      else if (t.value === "}" && !i) {
        if (this.dimension--, !this.dimension && (this.newEntry(), e)) return this.entries;
      } else t.value === '"' && !t.escaped ? (i && this.newEntry(true), i = !i) : t.value === "," && !i ? this.newEntry() : this.record(t.value);
      if (this.dimension !== 0) throw new Error("array dimension not balanced");
      return this.entries;
    }
  };
  a(vt, "ArrayParser");
  var er = vt;
  function Ca(r) {
    return r;
  }
  __name(Ca, "Ca");
  a(Ca, "identity");
});
var rr = T((Zl, Ci) => {
  p();
  var _a = tr();
  Ci.exports = { create: a(function(r, e) {
    return { parse: a(function() {
      return _a.parse(r, e);
    }, "parse") };
  }, "create") };
});
var Ti = T((ef, Ii) => {
  "use strict";
  p();
  var Ia = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/, Ta = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/, Pa = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/, Ba = /^-?infinity$/;
  Ii.exports = a(function(e) {
    if (Ba.test(e)) return Number(e.replace("i", "I"));
    var t = Ia.exec(e);
    if (!t) return Ra(
      e
    ) || null;
    var n = !!t[8], i = parseInt(t[1], 10);
    n && (i = _i(i));
    var s = parseInt(t[2], 10) - 1, o = t[3], u = parseInt(
      t[4],
      10
    ), c = parseInt(t[5], 10), l = parseInt(t[6], 10), f = t[7];
    f = f ? 1e3 * parseFloat(f) : 0;
    var y, g = La(e);
    return g != null ? (y = new Date(Date.UTC(i, s, o, u, c, l, f)), nr(i) && y.setUTCFullYear(i), g !== 0 && y.setTime(y.getTime() - g)) : (y = new Date(i, s, o, u, c, l, f), nr(i) && y.setFullYear(i)), y;
  }, "parseDate");
  function Ra(r) {
    var e = Ta.exec(r);
    if (e) {
      var t = parseInt(e[1], 10), n = !!e[4];
      n && (t = _i(t));
      var i = parseInt(e[2], 10) - 1, s = e[3], o = new Date(t, i, s);
      return nr(
        t
      ) && o.setFullYear(t), o;
    }
  }
  __name(Ra, "Ra");
  a(Ra, "getDate");
  function La(r) {
    if (r.endsWith("+00")) return 0;
    var e = Pa.exec(r.split(" ")[1]);
    if (e) {
      var t = e[1];
      if (t === "Z") return 0;
      var n = t === "-" ? -1 : 1, i = parseInt(e[2], 10) * 3600 + parseInt(
        e[3] || 0,
        10
      ) * 60 + parseInt(e[4] || 0, 10);
      return i * n * 1e3;
    }
  }
  __name(La, "La");
  a(La, "timeZoneOffset");
  function _i(r) {
    return -(r - 1);
  }
  __name(_i, "_i");
  a(_i, "bcYearToNegativeYear");
  function nr(r) {
    return r >= 0 && r < 100;
  }
  __name(nr, "nr");
  a(nr, "is0To99");
});
var Bi = T((nf, Pi) => {
  p();
  Pi.exports = ka;
  var Fa = Object.prototype.hasOwnProperty;
  function ka(r) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var n in t) Fa.call(t, n) && (r[n] = t[n]);
    }
    return r;
  }
  __name(ka, "ka");
  a(ka, "extend");
});
var Fi = T((af, Li) => {
  "use strict";
  p();
  var Ma = Bi();
  Li.exports = ke;
  function ke(r) {
    if (!(this instanceof ke))
      return new ke(r);
    Ma(this, Va(r));
  }
  __name(ke, "ke");
  a(ke, "PostgresInterval");
  var Ua = [
    "seconds",
    "minutes",
    "hours",
    "days",
    "months",
    "years"
  ];
  ke.prototype.toPostgres = function() {
    var r = Ua.filter(this.hasOwnProperty, this);
    return this.milliseconds && r.indexOf("seconds") < 0 && r.push("seconds"), r.length === 0 ? "0" : r.map(function(e) {
      var t = this[e] || 0;
      return e === "seconds" && this.milliseconds && (t = (t + this.milliseconds / 1e3).toFixed(6).replace(
        /\.?0+$/,
        ""
      )), t + " " + e;
    }, this).join(" ");
  };
  var Da = { years: "Y", months: "M", days: "D", hours: "H", minutes: "M", seconds: "S" }, Oa = ["years", "months", "days"], qa = ["hours", "minutes", "seconds"];
  ke.prototype.toISOString = ke.prototype.toISO = function() {
    var r = Oa.map(t, this).join(""), e = qa.map(t, this).join("");
    return "P" + r + "T" + e;
    function t(n) {
      var i = this[n] || 0;
      return n === "seconds" && this.milliseconds && (i = (i + this.milliseconds / 1e3).toFixed(6).replace(
        /0+$/,
        ""
      )), i + Da[n];
    }
    __name(t, "t");
  };
  var ir = "([+-]?\\d+)", Qa = ir + "\\s+years?", Na = ir + "\\s+mons?", Wa = ir + "\\s+days?", ja = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?", Ha = new RegExp([Qa, Na, Wa, ja].map(function(r) {
    return "(" + r + ")?";
  }).join("\\s*")), Ri = { years: 2, months: 4, days: 6, hours: 9, minutes: 10, seconds: 11, milliseconds: 12 }, $a = ["hours", "minutes", "seconds", "milliseconds"];
  function Ga(r) {
    var e = r + "000000".slice(r.length);
    return parseInt(
      e,
      10
    ) / 1e3;
  }
  __name(Ga, "Ga");
  a(Ga, "parseMilliseconds");
  function Va(r) {
    if (!r) return {};
    var e = Ha.exec(r), t = e[8] === "-";
    return Object.keys(Ri).reduce(function(n, i) {
      var s = Ri[i], o = e[s];
      return !o || (o = i === "milliseconds" ? Ga(o) : parseInt(o, 10), !o) || (t && ~$a.indexOf(i) && (o *= -1), n[i] = o), n;
    }, {});
  }
  __name(Va, "Va");
  a(Va, "parse");
});
var Mi = T((lf, ki) => {
  "use strict";
  p();
  ki.exports = a(function(e) {
    if (/^\\x/.test(e)) return new d(e.substr(
      2
    ), "hex");
    for (var t = "", n = 0; n < e.length; ) if (e[n] !== "\\") t += e[n], ++n;
    else if (/[0-7]{3}/.test(e.substr(n + 1, 3))) t += String.fromCharCode(parseInt(e.substr(n + 1, 3), 8)), n += 4;
    else {
      for (var i = 1; n + i < e.length && e[n + i] === "\\"; ) i++;
      for (var s = 0; s < Math.floor(i / 2); ++s) t += "\\";
      n += Math.floor(i / 2) * 2;
    }
    return new d(t, "binary");
  }, "parseBytea");
});
var Wi = T((pf, Ni) => {
  p();
  var Ve = tr(), ze = rr(), xt = Ti(), Di = Fi(), Oi = Mi();
  function St(r) {
    return a(function(t) {
      return t === null ? t : r(t);
    }, "nullAllowed");
  }
  __name(St, "St");
  a(St, "allowNull");
  function qi(r) {
    return r === null ? r : r === "TRUE" || r === "t" || r === "true" || r === "y" || r === "yes" || r === "on" || r === "1";
  }
  __name(qi, "qi");
  a(qi, "parseBool");
  function za(r) {
    return r ? Ve.parse(r, qi) : null;
  }
  __name(za, "za");
  a(za, "parseBoolArray");
  function Ka(r) {
    return parseInt(r, 10);
  }
  __name(Ka, "Ka");
  a(Ka, "parseBaseTenInt");
  function sr(r) {
    return r ? Ve.parse(r, St(Ka)) : null;
  }
  __name(sr, "sr");
  a(sr, "parseIntegerArray");
  function Ya(r) {
    return r ? Ve.parse(r, St(function(e) {
      return Qi(e).trim();
    })) : null;
  }
  __name(Ya, "Ya");
  a(Ya, "parseBigIntegerArray");
  var Za = a(function(r) {
    if (!r) return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = cr(t)), t;
    });
    return e.parse();
  }, "parsePointArray"), or = a(function(r) {
    if (!r) return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = parseFloat(t)), t;
    });
    return e.parse();
  }, "parseFloatArray"), re = a(function(r) {
    if (!r) return null;
    var e = ze.create(r);
    return e.parse();
  }, "parseStringArray"), ar = a(function(r) {
    if (!r) return null;
    var e = ze.create(
      r,
      function(t) {
        return t !== null && (t = xt(t)), t;
      }
    );
    return e.parse();
  }, "parseDateArray"), Ja = a(function(r) {
    if (!r)
      return null;
    var e = ze.create(r, function(t) {
      return t !== null && (t = Di(t)), t;
    });
    return e.parse();
  }, "parseIntervalArray"), Xa = a(function(r) {
    return r ? Ve.parse(r, St(Oi)) : null;
  }, "parseByteAArray"), ur = a(function(r) {
    return parseInt(r, 10);
  }, "parseInteger"), Qi = a(function(r) {
    var e = String(r);
    return /^\d+$/.test(e) ? e : r;
  }, "parseBigInteger"), Ui = a(function(r) {
    return r ? Ve.parse(r, St(JSON.parse)) : null;
  }, "parseJsonArray"), cr = a(
    function(r) {
      return r[0] !== "(" ? null : (r = r.substring(1, r.length - 1).split(","), { x: parseFloat(r[0]), y: parseFloat(
        r[1]
      ) });
    },
    "parsePoint"
  ), eu = a(function(r) {
    if (r[0] !== "<" && r[1] !== "(") return null;
    for (var e = "(", t = "", n = false, i = 2; i < r.length - 1; i++) {
      if (n || (e += r[i]), r[i] === ")") {
        n = true;
        continue;
      } else if (!n) continue;
      r[i] !== "," && (t += r[i]);
    }
    var s = cr(e);
    return s.radius = parseFloat(t), s;
  }, "parseCircle"), tu = a(function(r) {
    r(20, Qi), r(21, ur), r(23, ur), r(26, ur), r(700, parseFloat), r(701, parseFloat), r(16, qi), r(1082, xt), r(1114, xt), r(1184, xt), r(
      600,
      cr
    ), r(651, re), r(718, eu), r(1e3, za), r(1001, Xa), r(1005, sr), r(1007, sr), r(1028, sr), r(1016, Ya), r(1017, Za), r(1021, or), r(1022, or), r(1231, or), r(1014, re), r(1015, re), r(1008, re), r(1009, re), r(1040, re), r(1041, re), r(
      1115,
      ar
    ), r(1182, ar), r(1185, ar), r(1186, Di), r(1187, Ja), r(17, Oi), r(114, JSON.parse.bind(JSON)), r(3802, JSON.parse.bind(JSON)), r(199, Ui), r(3807, Ui), r(3907, re), r(2951, re), r(791, re), r(1183, re), r(1270, re);
  }, "init");
  Ni.exports = { init: tu };
});
var Hi = T((mf, ji) => {
  "use strict";
  p();
  var z = 1e6;
  function ru(r) {
    var e = r.readInt32BE(0), t = r.readUInt32BE(
      4
    ), n = "";
    e < 0 && (e = ~e + (t === 0), t = ~t + 1 >>> 0, n = "-");
    var i = "", s, o, u, c, l, f;
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i = c + u + i;
    }
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i = c + u + i;
    }
    {
      if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0) return n + u + i;
      for (c = "", l = 6 - u.length, f = 0; f < l; f++) c += "0";
      i = c + u + i;
    }
    return s = e % z, o = 4294967296 * s + t, u = "" + o % z, n + u + i;
  }
  __name(ru, "ru");
  a(ru, "readInt8");
  ji.exports = ru;
});
var Ki = T((bf, zi) => {
  p();
  var nu = Hi(), L = a(function(r, e, t, n, i) {
    t = t || 0, n = n || false, i = i || function(A, C, D) {
      return A * Math.pow(2, D) + C;
    };
    var s = t >> 3, o = a(function(A) {
      return n ? ~A & 255 : A;
    }, "inv"), u = 255, c = 8 - t % 8;
    e < c && (u = 255 << 8 - e & 255, c = e), t && (u = u >> t % 8);
    var l = 0;
    t % 8 + e >= 8 && (l = i(0, o(r[s]) & u, c));
    for (var f = e + t >> 3, y = s + 1; y < f; y++) l = i(l, o(
      r[y]
    ), 8);
    var g = (e + t) % 8;
    return g > 0 && (l = i(l, o(r[f]) >> 8 - g, g)), l;
  }, "parseBits"), Vi = a(function(r, e, t) {
    var n = Math.pow(2, t - 1) - 1, i = L(r, 1), s = L(r, t, 1);
    if (s === 0) return 0;
    var o = 1, u = a(function(l, f, y) {
      l === 0 && (l = 1);
      for (var g = 1; g <= y; g++) o /= 2, (f & 1 << y - g) > 0 && (l += o);
      return l;
    }, "parsePrecisionBits"), c = L(r, e, t + 1, false, u);
    return s == Math.pow(
      2,
      t + 1
    ) - 1 ? c === 0 ? i === 0 ? 1 / 0 : -1 / 0 : NaN : (i === 0 ? 1 : -1) * Math.pow(2, s - n) * c;
  }, "parseFloatFromBits"), iu = a(function(r) {
    return L(r, 1) == 1 ? -1 * (L(r, 15, 1, true) + 1) : L(r, 15, 1);
  }, "parseInt16"), $i = a(function(r) {
    return L(r, 1) == 1 ? -1 * (L(
      r,
      31,
      1,
      true
    ) + 1) : L(r, 31, 1);
  }, "parseInt32"), su = a(function(r) {
    return Vi(r, 23, 8);
  }, "parseFloat32"), ou = a(function(r) {
    return Vi(r, 52, 11);
  }, "parseFloat64"), au = a(function(r) {
    var e = L(r, 16, 32);
    if (e == 49152) return NaN;
    for (var t = Math.pow(1e4, L(r, 16, 16)), n = 0, i = [], s = L(r, 16), o = 0; o < s; o++) n += L(r, 16, 64 + 16 * o) * t, t /= 1e4;
    var u = Math.pow(10, L(
      r,
      16,
      48
    ));
    return (e === 0 ? 1 : -1) * Math.round(n * u) / u;
  }, "parseNumeric"), Gi = a(function(r, e) {
    var t = L(e, 1), n = L(
      e,
      63,
      1
    ), i = new Date((t === 0 ? 1 : -1) * n / 1e3 + 9466848e5);
    return r || i.setTime(i.getTime() + i.getTimezoneOffset() * 6e4), i.usec = n % 1e3, i.getMicroSeconds = function() {
      return this.usec;
    }, i.setMicroSeconds = function(s) {
      this.usec = s;
    }, i.getUTCMicroSeconds = function() {
      return this.usec;
    }, i;
  }, "parseDate"), Ke = a(
    function(r) {
      for (var e = L(
        r,
        32
      ), t = L(r, 32, 32), n = L(r, 32, 64), i = 96, s = [], o = 0; o < e; o++) s[o] = L(r, 32, i), i += 32, i += 32;
      var u = a(function(l) {
        var f = L(r, 32, i);
        if (i += 32, f == 4294967295) return null;
        var y;
        if (l == 23 || l == 20) return y = L(r, f * 8, i), i += f * 8, y;
        if (l == 25) return y = r.toString(this.encoding, i >> 3, (i += f << 3) >> 3), y;
        console.log("ERROR: ElementType not implemented: " + l);
      }, "parseElement"), c = a(function(l, f) {
        var y = [], g;
        if (l.length > 1) {
          var A = l.shift();
          for (g = 0; g < A; g++) y[g] = c(l, f);
          l.unshift(A);
        } else for (g = 0; g < l[0]; g++) y[g] = u(f);
        return y;
      }, "parse");
      return c(s, n);
    },
    "parseArray"
  ), uu = a(function(r) {
    return r.toString("utf8");
  }, "parseText"), cu = a(function(r) {
    return r === null ? null : L(r, 8) > 0;
  }, "parseBool"), lu = a(function(r) {
    r(20, nu), r(21, iu), r(23, $i), r(26, $i), r(1700, au), r(700, su), r(701, ou), r(16, cu), r(1114, Gi.bind(null, false)), r(1184, Gi.bind(null, true)), r(1e3, Ke), r(1007, Ke), r(1016, Ke), r(1008, Ke), r(1009, Ke), r(25, uu);
  }, "init");
  zi.exports = { init: lu };
});
var Zi = T((Sf, Yi) => {
  p();
  Yi.exports = {
    BOOL: 16,
    BYTEA: 17,
    CHAR: 18,
    INT8: 20,
    INT2: 21,
    INT4: 23,
    REGPROC: 24,
    TEXT: 25,
    OID: 26,
    TID: 27,
    XID: 28,
    CID: 29,
    JSON: 114,
    XML: 142,
    PG_NODE_TREE: 194,
    SMGR: 210,
    PATH: 602,
    POLYGON: 604,
    CIDR: 650,
    FLOAT4: 700,
    FLOAT8: 701,
    ABSTIME: 702,
    RELTIME: 703,
    TINTERVAL: 704,
    CIRCLE: 718,
    MACADDR8: 774,
    MONEY: 790,
    MACADDR: 829,
    INET: 869,
    ACLITEM: 1033,
    BPCHAR: 1042,
    VARCHAR: 1043,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    TIMETZ: 1266,
    BIT: 1560,
    VARBIT: 1562,
    NUMERIC: 1700,
    REFCURSOR: 1790,
    REGPROCEDURE: 2202,
    REGOPER: 2203,
    REGOPERATOR: 2204,
    REGCLASS: 2205,
    REGTYPE: 2206,
    UUID: 2950,
    TXID_SNAPSHOT: 2970,
    PG_LSN: 3220,
    PG_NDISTINCT: 3361,
    PG_DEPENDENCIES: 3402,
    TSVECTOR: 3614,
    TSQUERY: 3615,
    GTSVECTOR: 3642,
    REGCONFIG: 3734,
    REGDICTIONARY: 3769,
    JSONB: 3802,
    REGNAMESPACE: 4089,
    REGROLE: 4096
  };
});
var Je = T((Ze) => {
  p();
  var fu = Wi(), hu = Ki(), pu = rr(), du = Zi();
  Ze.getTypeParser = yu;
  Ze.setTypeParser = mu;
  Ze.arrayParser = pu;
  Ze.builtins = du;
  var Ye = { text: {}, binary: {} };
  function Ji(r) {
    return String(r);
  }
  __name(Ji, "Ji");
  a(Ji, "noParse");
  function yu(r, e) {
    return e = e || "text", Ye[e] && Ye[e][r] || Ji;
  }
  __name(yu, "yu");
  a(yu, "getTypeParser");
  function mu(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), Ye[e][r] = t;
  }
  __name(mu, "mu");
  a(mu, "setTypeParser");
  fu.init(function(r, e) {
    Ye.text[r] = e;
  });
  hu.init(function(r, e) {
    Ye.binary[r] = e;
  });
});
var At = T((If, Xi) => {
  "use strict";
  p();
  var wu = Je();
  function Et(r) {
    this._types = r || wu, this.text = {}, this.binary = {};
  }
  __name(Et, "Et");
  a(Et, "TypeOverrides");
  Et.prototype.getOverrides = function(r) {
    switch (r) {
      case "text":
        return this.text;
      case "binary":
        return this.binary;
      default:
        return {};
    }
  };
  Et.prototype.setTypeParser = function(r, e, t) {
    typeof e == "function" && (t = e, e = "text"), this.getOverrides(e)[r] = t;
  };
  Et.prototype.getTypeParser = function(r, e) {
    return e = e || "text", this.getOverrides(e)[r] || this._types.getTypeParser(r, e);
  };
  Xi.exports = Et;
});
function Xe(r) {
  let e = 1779033703, t = 3144134277, n = 1013904242, i = 2773480762, s = 1359893119, o = 2600822924, u = 528734635, c = 1541459225, l = 0, f = 0, y = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ], g = a((I, w) => I >>> w | I << 32 - w, "rrot"), A = new Uint32Array(64), C = new Uint8Array(64), D = a(() => {
    for (let R = 0, j = 0; R < 16; R++, j += 4) A[R] = C[j] << 24 | C[j + 1] << 16 | C[j + 2] << 8 | C[j + 3];
    for (let R = 16; R < 64; R++) {
      let j = g(A[R - 15], 7) ^ g(A[R - 15], 18) ^ A[R - 15] >>> 3, le = g(
        A[R - 2],
        17
      ) ^ g(A[R - 2], 19) ^ A[R - 2] >>> 10;
      A[R] = A[R - 16] + j + A[R - 7] + le | 0;
    }
    let I = e, w = t, Z = n, W = i, J = s, X = o, se = u, oe = c;
    for (let R = 0; R < 64; R++) {
      let j = g(J, 6) ^ g(J, 11) ^ g(J, 25), le = J & X ^ ~J & se, de = oe + j + le + y[R] + A[R] | 0, We = g(I, 2) ^ g(
        I,
        13
      ) ^ g(I, 22), fe = I & w ^ I & Z ^ w & Z, _e = We + fe | 0;
      oe = se, se = X, X = J, J = W + de | 0, W = Z, Z = w, w = I, I = de + _e | 0;
    }
    e = e + I | 0, t = t + w | 0, n = n + Z | 0, i = i + W | 0, s = s + J | 0, o = o + X | 0, u = u + se | 0, c = c + oe | 0, f = 0;
  }, "process"), Y = a((I) => {
    typeof I == "string" && (I = new TextEncoder().encode(I));
    for (let w = 0; w < I.length; w++) C[f++] = I[w], f === 64 && D();
    l += I.length;
  }, "add"), P = a(() => {
    if (C[f++] = 128, f == 64 && D(), f + 8 > 64) {
      for (; f < 64; ) C[f++] = 0;
      D();
    }
    for (; f < 58; ) C[f++] = 0;
    let I = l * 8;
    C[f++] = I / 1099511627776 & 255, C[f++] = I / 4294967296 & 255, C[f++] = I >>> 24, C[f++] = I >>> 16 & 255, C[f++] = I >>> 8 & 255, C[f++] = I & 255, D();
    let w = new Uint8Array(
      32
    );
    return w[0] = e >>> 24, w[1] = e >>> 16 & 255, w[2] = e >>> 8 & 255, w[3] = e & 255, w[4] = t >>> 24, w[5] = t >>> 16 & 255, w[6] = t >>> 8 & 255, w[7] = t & 255, w[8] = n >>> 24, w[9] = n >>> 16 & 255, w[10] = n >>> 8 & 255, w[11] = n & 255, w[12] = i >>> 24, w[13] = i >>> 16 & 255, w[14] = i >>> 8 & 255, w[15] = i & 255, w[16] = s >>> 24, w[17] = s >>> 16 & 255, w[18] = s >>> 8 & 255, w[19] = s & 255, w[20] = o >>> 24, w[21] = o >>> 16 & 255, w[22] = o >>> 8 & 255, w[23] = o & 255, w[24] = u >>> 24, w[25] = u >>> 16 & 255, w[26] = u >>> 8 & 255, w[27] = u & 255, w[28] = c >>> 24, w[29] = c >>> 16 & 255, w[30] = c >>> 8 & 255, w[31] = c & 255, w;
  }, "digest");
  return r === void 0 ? { add: Y, digest: P } : (Y(r), P());
}
__name(Xe, "Xe");
var es = G(() => {
  "use strict";
  p();
  a(Xe, "sha256");
});
var U;
var et;
var ts = G(() => {
  "use strict";
  p();
  U = class U2 {
    static {
      __name(this, "U");
    }
    constructor() {
      E(this, "_dataLength", 0);
      E(this, "_bufferLength", 0);
      E(this, "_state", new Int32Array(4));
      E(this, "_buffer", new ArrayBuffer(68));
      E(this, "_buffer8");
      E(this, "_buffer32");
      this._buffer8 = new Uint8Array(this._buffer, 0, 68), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
    }
    static hashByteArray(e, t = false) {
      return this.onePassHasher.start().appendByteArray(
        e
      ).end(t);
    }
    static hashStr(e, t = false) {
      return this.onePassHasher.start().appendStr(e).end(t);
    }
    static hashAsciiStr(e, t = false) {
      return this.onePassHasher.start().appendAsciiStr(e).end(t);
    }
    static _hex(e) {
      let t = U2.hexChars, n = U2.hexOut, i, s, o, u;
      for (u = 0; u < 4; u += 1) for (s = u * 8, i = e[u], o = 0; o < 8; o += 2) n[s + 1 + o] = t.charAt(i & 15), i >>>= 4, n[s + 0 + o] = t.charAt(
        i & 15
      ), i >>>= 4;
      return n.join("");
    }
    static _md5cycle(e, t) {
      let n = e[0], i = e[1], s = e[2], o = e[3];
      n += (i & s | ~i & o) + t[0] - 680876936 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[1] - 389564586 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[2] + 606105819 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[3] - 1044525330 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[4] - 176418897 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[5] + 1200080426 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[6] - 1473231341 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[7] - 45705983 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[8] + 1770035416 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[9] - 1958414417 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[10] - 42063 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[11] - 1990404162 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[12] + 1804603682 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[13] - 40341101 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[14] - 1502002290 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[15] + 1236535329 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & o | s & ~o) + t[1] - 165796510 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[6] - 1069501632 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[11] + 643717713 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[0] - 373897302 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[5] - 701558691 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[10] + 38016083 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[15] - 660478335 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[4] - 405537848 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[9] + 568446438 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[14] - 1019803690 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[3] - 187363961 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[8] + 1163531501 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[13] - 1444681467 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[2] - 51403784 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[7] + 1735328473 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[12] - 1926607734 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i ^ s ^ o) + t[5] - 378558 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[8] - 2022574463 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[11] + 1839030562 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[14] - 35309556 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[1] - 1530992060 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[4] + 1272893353 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[7] - 155497632 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[10] - 1094730640 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[13] + 681279174 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[0] - 358537222 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[3] - 722521979 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[6] + 76029189 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[9] - 640364487 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[12] - 421815835 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[15] + 530742520 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[2] - 995338651 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (s ^ (i | ~o)) + t[0] - 198630844 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[7] + 1126891415 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[14] - 1416354905 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[5] - 57434055 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[12] + 1700485571 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[3] - 1894986606 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[10] - 1051523 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[1] - 2054922799 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[8] + 1873313359 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[15] - 30611744 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[6] - 1560198380 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[13] + 1309151649 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[4] - 145523070 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[11] - 1120210379 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[2] + 718787259 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[9] - 343485551 | 0, i = (i << 21 | i >>> 11) + s | 0, e[0] = n + e[0] | 0, e[1] = i + e[1] | 0, e[2] = s + e[2] | 0, e[3] = o + e[3] | 0;
    }
    start() {
      return this._dataLength = 0, this._bufferLength = 0, this._state.set(U2.stateIdentity), this;
    }
    appendStr(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o;
      for (o = 0; o < e.length; o += 1) {
        if (s = e.charCodeAt(o), s < 128) t[i++] = s;
        else if (s < 2048) t[i++] = (s >>> 6) + 192, t[i++] = s & 63 | 128;
        else if (s < 55296 || s > 56319) t[i++] = (s >>> 12) + 224, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
        else {
          if (s = (s - 55296) * 1024 + (e.charCodeAt(++o) - 56320) + 65536, s > 1114111) throw new Error(
            "Unicode standard supports code points up to U+10FFFF"
          );
          t[i++] = (s >>> 18) + 240, t[i++] = s >>> 12 & 63 | 128, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
        }
        i >= 64 && (this._dataLength += 64, U2._md5cycle(this._state, n), i -= 64, n[0] = n[16]);
      }
      return this._bufferLength = i, this;
    }
    appendAsciiStr(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
      for (; ; ) {
        for (s = Math.min(e.length - o, 64 - i); s--; ) t[i++] = e.charCodeAt(o++);
        if (i < 64) break;
        this._dataLength += 64, U2._md5cycle(this._state, n), i = 0;
      }
      return this._bufferLength = i, this;
    }
    appendByteArray(e) {
      let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
      for (; ; ) {
        for (s = Math.min(e.length - o, 64 - i); s--; ) t[i++] = e[o++];
        if (i < 64) break;
        this._dataLength += 64, U2._md5cycle(this._state, n), i = 0;
      }
      return this._bufferLength = i, this;
    }
    getState() {
      let e = this._state;
      return { buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)), buflen: this._bufferLength, length: this._dataLength, state: [e[0], e[1], e[2], e[3]] };
    }
    setState(e) {
      let t = e.buffer, n = e.state, i = this._state, s;
      for (this._dataLength = e.length, this._bufferLength = e.buflen, i[0] = n[0], i[1] = n[1], i[2] = n[2], i[3] = n[3], s = 0; s < t.length; s += 1) this._buffer8[s] = t.charCodeAt(s);
    }
    end(e = false) {
      let t = this._bufferLength, n = this._buffer8, i = this._buffer32, s = (t >> 2) + 1;
      this._dataLength += t;
      let o = this._dataLength * 8;
      if (n[t] = 128, n[t + 1] = n[t + 2] = n[t + 3] = 0, i.set(U2.buffer32Identity.subarray(s), s), t > 55 && (U2._md5cycle(this._state, i), i.set(U2.buffer32Identity)), o <= 4294967295) i[14] = o;
      else {
        let u = o.toString(16).match(/(.*?)(.{0,8})$/);
        if (u === null) return;
        let c = parseInt(
          u[2],
          16
        ), l = parseInt(u[1], 16) || 0;
        i[14] = c, i[15] = l;
      }
      return U2._md5cycle(this._state, i), e ? this._state : U2._hex(
        this._state
      );
    }
  };
  a(U, "Md5"), E(U, "stateIdentity", new Int32Array([1732584193, -271733879, -1732584194, 271733878])), E(U, "buffer32Identity", new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])), E(U, "hexChars", "0123456789abcdef"), E(U, "hexOut", []), E(U, "onePassHasher", new U());
  et = U;
});
var lr = {};
ie(lr, { createHash: /* @__PURE__ */ __name(() => bu, "createHash"), createHmac: /* @__PURE__ */ __name(() => vu, "createHmac"), randomBytes: /* @__PURE__ */ __name(() => gu, "randomBytes") });
function gu(r) {
  return crypto.getRandomValues(d.alloc(r));
}
__name(gu, "gu");
function bu(r) {
  if (r === "sha256") return { update: a(function(e) {
    return { digest: a(
      function() {
        return d.from(Xe(e));
      },
      "digest"
    ) };
  }, "update") };
  if (r === "md5") return { update: a(function(e) {
    return {
      digest: a(function() {
        return typeof e == "string" ? et.hashStr(e) : et.hashByteArray(e);
      }, "digest")
    };
  }, "update") };
  throw new Error(`Hash type '${r}' not supported`);
}
__name(bu, "bu");
function vu(r, e) {
  if (r !== "sha256") throw new Error(`Only sha256 is supported (requested: '${r}')`);
  return { update: a(function(t) {
    return { digest: a(
      function() {
        typeof e == "string" && (e = new TextEncoder().encode(e)), typeof t == "string" && (t = new TextEncoder().encode(
          t
        ));
        let n = e.length;
        if (n > 64) e = Xe(e);
        else if (n < 64) {
          let c = new Uint8Array(64);
          c.set(e), e = c;
        }
        let i = new Uint8Array(
          64
        ), s = new Uint8Array(64);
        for (let c = 0; c < 64; c++) i[c] = 54 ^ e[c], s[c] = 92 ^ e[c];
        let o = new Uint8Array(t.length + 64);
        o.set(i, 0), o.set(t, 64);
        let u = new Uint8Array(96);
        return u.set(s, 0), u.set(Xe(o), 64), d.from(Xe(u));
      },
      "digest"
    ) };
  }, "update") };
}
__name(vu, "vu");
var fr = G(() => {
  "use strict";
  p();
  es();
  ts();
  a(gu, "randomBytes");
  a(bu, "createHash");
  a(vu, "createHmac");
});
var tt = T((Qf, hr) => {
  "use strict";
  p();
  hr.exports = {
    host: "localhost",
    user: m.platform === "win32" ? m.env.USERNAME : m.env.USER,
    database: void 0,
    password: null,
    connectionString: void 0,
    port: 5432,
    rows: 0,
    binary: false,
    max: 10,
    idleTimeoutMillis: 3e4,
    client_encoding: "",
    ssl: false,
    application_name: void 0,
    fallback_application_name: void 0,
    options: void 0,
    parseInputDatesAsUTC: false,
    statement_timeout: false,
    lock_timeout: false,
    idle_in_transaction_session_timeout: false,
    query_timeout: false,
    connect_timeout: 0,
    keepalives: 1,
    keepalives_idle: 0
  };
  var Me = Je(), xu = Me.getTypeParser(20, "text"), Su = Me.getTypeParser(
    1016,
    "text"
  );
  hr.exports.__defineSetter__("parseInt8", function(r) {
    Me.setTypeParser(20, "text", r ? Me.getTypeParser(
      23,
      "text"
    ) : xu), Me.setTypeParser(1016, "text", r ? Me.getTypeParser(1007, "text") : Su);
  });
});
var rt = T((Wf, ns) => {
  "use strict";
  p();
  var Eu = (fr(), O(lr)), Au = tt();
  function Cu(r) {
    var e = r.replace(
      /\\/g,
      "\\\\"
    ).replace(/"/g, '\\"');
    return '"' + e + '"';
  }
  __name(Cu, "Cu");
  a(Cu, "escapeElement");
  function rs(r) {
    for (var e = "{", t = 0; t < r.length; t++) t > 0 && (e = e + ","), r[t] === null || typeof r[t] > "u" ? e = e + "NULL" : Array.isArray(r[t]) ? e = e + rs(r[t]) : r[t] instanceof d ? e += "\\\\x" + r[t].toString("hex") : e += Cu(Ct(r[t]));
    return e = e + "}", e;
  }
  __name(rs, "rs");
  a(rs, "arrayString");
  var Ct = a(function(r, e) {
    if (r == null) return null;
    if (r instanceof d) return r;
    if (ArrayBuffer.isView(r)) {
      var t = d.from(r.buffer, r.byteOffset, r.byteLength);
      return t.length === r.byteLength ? t : t.slice(r.byteOffset, r.byteOffset + r.byteLength);
    }
    return r instanceof Date ? Au.parseInputDatesAsUTC ? Tu(r) : Iu(r) : Array.isArray(r) ? rs(r) : typeof r == "object" ? _u(r, e) : r.toString();
  }, "prepareValue");
  function _u(r, e) {
    if (r && typeof r.toPostgres == "function") {
      if (e = e || [], e.indexOf(r) !== -1) throw new Error('circular reference detected while preparing "' + r + '" for query');
      return e.push(r), Ct(r.toPostgres(Ct), e);
    }
    return JSON.stringify(r);
  }
  __name(_u, "_u");
  a(_u, "prepareObject");
  function N(r, e) {
    for (r = "" + r; r.length < e; ) r = "0" + r;
    return r;
  }
  __name(N, "N");
  a(N, "pad");
  function Iu(r) {
    var e = -r.getTimezoneOffset(), t = r.getFullYear(), n = t < 1;
    n && (t = Math.abs(t) + 1);
    var i = N(t, 4) + "-" + N(r.getMonth() + 1, 2) + "-" + N(r.getDate(), 2) + "T" + N(
      r.getHours(),
      2
    ) + ":" + N(r.getMinutes(), 2) + ":" + N(r.getSeconds(), 2) + "." + N(r.getMilliseconds(), 3);
    return e < 0 ? (i += "-", e *= -1) : i += "+", i += N(Math.floor(e / 60), 2) + ":" + N(e % 60, 2), n && (i += " BC"), i;
  }
  __name(Iu, "Iu");
  a(Iu, "dateToString");
  function Tu(r) {
    var e = r.getUTCFullYear(), t = e < 1;
    t && (e = Math.abs(e) + 1);
    var n = N(e, 4) + "-" + N(r.getUTCMonth() + 1, 2) + "-" + N(r.getUTCDate(), 2) + "T" + N(r.getUTCHours(), 2) + ":" + N(r.getUTCMinutes(), 2) + ":" + N(r.getUTCSeconds(), 2) + "." + N(
      r.getUTCMilliseconds(),
      3
    );
    return n += "+00:00", t && (n += " BC"), n;
  }
  __name(Tu, "Tu");
  a(Tu, "dateToStringUTC");
  function Pu(r, e, t) {
    return r = typeof r == "string" ? { text: r } : r, e && (typeof e == "function" ? r.callback = e : r.values = e), t && (r.callback = t), r;
  }
  __name(Pu, "Pu");
  a(Pu, "normalizeQueryConfig");
  var pr = a(function(r) {
    return Eu.createHash("md5").update(r, "utf-8").digest("hex");
  }, "md5"), Bu = a(
    function(r, e, t) {
      var n = pr(e + r), i = pr(d.concat([d.from(n), t]));
      return "md5" + i;
    },
    "postgresMd5PasswordHash"
  );
  ns.exports = {
    prepareValue: a(function(e) {
      return Ct(e);
    }, "prepareValueWrapper"),
    normalizeQueryConfig: Pu,
    postgresMd5PasswordHash: Bu,
    md5: pr
  };
});
var nt = {};
ie(nt, { default: /* @__PURE__ */ __name(() => ku, "default") });
var ku;
var it = G(() => {
  "use strict";
  p();
  ku = {};
});
var ds = T((th, ps) => {
  "use strict";
  p();
  var yr = (fr(), O(lr));
  function Mu(r) {
    if (r.indexOf("SCRAM-SHA-256") === -1) throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");
    let e = yr.randomBytes(
      18
    ).toString("base64");
    return { mechanism: "SCRAM-SHA-256", clientNonce: e, response: "n,,n=*,r=" + e, message: "SASLInitialResponse" };
  }
  __name(Mu, "Mu");
  a(Mu, "startSession");
  function Uu(r, e, t) {
    if (r.message !== "SASLInitialResponse") throw new Error(
      "SASL: Last message was not SASLInitialResponse"
    );
    if (typeof e != "string") throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
    if (typeof t != "string") throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
    let n = qu(t);
    if (n.nonce.startsWith(r.clientNonce)) {
      if (n.nonce.length === r.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    var i = d.from(n.salt, "base64"), s = Wu(e, i, n.iteration), o = Ue(s, "Client Key"), u = Nu(
      o
    ), c = "n=*,r=" + r.clientNonce, l = "r=" + n.nonce + ",s=" + n.salt + ",i=" + n.iteration, f = "c=biws,r=" + n.nonce, y = c + "," + l + "," + f, g = Ue(u, y), A = hs(o, g), C = A.toString("base64"), D = Ue(s, "Server Key"), Y = Ue(D, y);
    r.message = "SASLResponse", r.serverSignature = Y.toString("base64"), r.response = f + ",p=" + C;
  }
  __name(Uu, "Uu");
  a(Uu, "continueSession");
  function Du(r, e) {
    if (r.message !== "SASLResponse") throw new Error("SASL: Last message was not SASLResponse");
    if (typeof e != "string") throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
    let { serverSignature: t } = Qu(
      e
    );
    if (t !== r.serverSignature) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
  }
  __name(Du, "Du");
  a(Du, "finalizeSession");
  function Ou(r) {
    if (typeof r != "string") throw new TypeError("SASL: text must be a string");
    return r.split("").map((e, t) => r.charCodeAt(t)).every((e) => e >= 33 && e <= 43 || e >= 45 && e <= 126);
  }
  __name(Ou, "Ou");
  a(Ou, "isPrintableChars");
  function ls(r) {
    return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(r);
  }
  __name(ls, "ls");
  a(ls, "isBase64");
  function fs(r) {
    if (typeof r != "string") throw new TypeError("SASL: attribute pairs text must be a string");
    return new Map(r.split(",").map((e) => {
      if (!/^.=/.test(e)) throw new Error("SASL: Invalid attribute pair entry");
      let t = e[0], n = e.substring(2);
      return [t, n];
    }));
  }
  __name(fs, "fs");
  a(fs, "parseAttributePairs");
  function qu(r) {
    let e = fs(r), t = e.get("r");
    if (t) {
      if (!Ou(t)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
    let n = e.get("s");
    if (n) {
      if (!ls(n)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
    let i = e.get("i");
    if (i) {
      if (!/^[1-9][0-9]*$/.test(i)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
    } else throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
    let s = parseInt(i, 10);
    return { nonce: t, salt: n, iteration: s };
  }
  __name(qu, "qu");
  a(qu, "parseServerFirstMessage");
  function Qu(r) {
    let t = fs(r).get("v");
    if (t) {
      if (!ls(t)) throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
    } else throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
    return { serverSignature: t };
  }
  __name(Qu, "Qu");
  a(Qu, "parseServerFinalMessage");
  function hs(r, e) {
    if (!d.isBuffer(r)) throw new TypeError("first argument must be a Buffer");
    if (!d.isBuffer(e)) throw new TypeError(
      "second argument must be a Buffer"
    );
    if (r.length !== e.length) throw new Error("Buffer lengths must match");
    if (r.length === 0) throw new Error("Buffers cannot be empty");
    return d.from(r.map((t, n) => r[n] ^ e[n]));
  }
  __name(hs, "hs");
  a(hs, "xorBuffers");
  function Nu(r) {
    return yr.createHash("sha256").update(r).digest();
  }
  __name(Nu, "Nu");
  a(Nu, "sha256");
  function Ue(r, e) {
    return yr.createHmac("sha256", r).update(e).digest();
  }
  __name(Ue, "Ue");
  a(Ue, "hmacSha256");
  function Wu(r, e, t) {
    for (var n = Ue(
      r,
      d.concat([e, d.from([0, 0, 0, 1])])
    ), i = n, s = 0; s < t - 1; s++) n = Ue(r, n), i = hs(i, n);
    return i;
  }
  __name(Wu, "Wu");
  a(Wu, "Hi");
  ps.exports = { startSession: Mu, continueSession: Uu, finalizeSession: Du };
});
var mr = {};
ie(mr, { join: /* @__PURE__ */ __name(() => ju, "join") });
function ju(...r) {
  return r.join("/");
}
__name(ju, "ju");
var wr = G(() => {
  "use strict";
  p();
  a(
    ju,
    "join"
  );
});
var gr = {};
ie(gr, { stat: /* @__PURE__ */ __name(() => Hu, "stat") });
function Hu(r, e) {
  e(new Error("No filesystem"));
}
__name(Hu, "Hu");
var br = G(() => {
  "use strict";
  p();
  a(Hu, "stat");
});
var vr = {};
ie(vr, { default: /* @__PURE__ */ __name(() => $u, "default") });
var $u;
var xr = G(() => {
  "use strict";
  p();
  $u = {};
});
var ys = {};
ie(ys, { StringDecoder: /* @__PURE__ */ __name(() => Sr, "StringDecoder") });
var Er;
var Sr;
var ms = G(() => {
  "use strict";
  p();
  Er = class Er {
    static {
      __name(this, "Er");
    }
    constructor(e) {
      E(this, "td");
      this.td = new TextDecoder(e);
    }
    write(e) {
      return this.td.decode(e, { stream: true });
    }
    end(e) {
      return this.td.decode(e);
    }
  };
  a(Er, "StringDecoder");
  Sr = Er;
});
var vs = T((fh, bs) => {
  "use strict";
  p();
  var { Transform: Gu } = (xr(), O(vr)), { StringDecoder: Vu } = (ms(), O(ys)), ve = Symbol(
    "last"
  ), It = Symbol("decoder");
  function zu(r, e, t) {
    let n;
    if (this.overflow) {
      if (n = this[It].write(r).split(
        this.matcher
      ), n.length === 1) return t();
      n.shift(), this.overflow = false;
    } else this[ve] += this[It].write(r), n = this[ve].split(this.matcher);
    this[ve] = n.pop();
    for (let i = 0; i < n.length; i++) try {
      gs(this, this.mapper(n[i]));
    } catch (s) {
      return t(s);
    }
    if (this.overflow = this[ve].length > this.maxLength, this.overflow && !this.skipOverflow) {
      t(new Error(
        "maximum buffer reached"
      ));
      return;
    }
    t();
  }
  __name(zu, "zu");
  a(zu, "transform");
  function Ku(r) {
    if (this[ve] += this[It].end(), this[ve])
      try {
        gs(this, this.mapper(this[ve]));
      } catch (e) {
        return r(e);
      }
    r();
  }
  __name(Ku, "Ku");
  a(Ku, "flush");
  function gs(r, e) {
    e !== void 0 && r.push(e);
  }
  __name(gs, "gs");
  a(gs, "push");
  function ws(r) {
    return r;
  }
  __name(ws, "ws");
  a(ws, "noop");
  function Yu(r, e, t) {
    switch (r = r || /\r?\n/, e = e || ws, t = t || {}, arguments.length) {
      case 1:
        typeof r == "function" ? (e = r, r = /\r?\n/) : typeof r == "object" && !(r instanceof RegExp) && !r[Symbol.split] && (t = r, r = /\r?\n/);
        break;
      case 2:
        typeof r == "function" ? (t = e, e = r, r = /\r?\n/) : typeof e == "object" && (t = e, e = ws);
    }
    t = Object.assign({}, t), t.autoDestroy = true, t.transform = zu, t.flush = Ku, t.readableObjectMode = true;
    let n = new Gu(t);
    return n[ve] = "", n[It] = new Vu("utf8"), n.matcher = r, n.mapper = e, n.maxLength = t.maxLength, n.skipOverflow = t.skipOverflow || false, n.overflow = false, n._destroy = function(i, s) {
      this._writableState.errorEmitted = false, s(i);
    }, n;
  }
  __name(Yu, "Yu");
  a(Yu, "split");
  bs.exports = Yu;
});
var Es = T((dh, pe) => {
  "use strict";
  p();
  var xs = (wr(), O(mr)), Zu = (xr(), O(vr)).Stream, Ju = vs(), Ss = (it(), O(nt)), Xu = 5432, Tt = m.platform === "win32", st = m.stderr, ec = 56, tc = 7, rc = 61440, nc = 32768;
  function ic(r) {
    return (r & rc) == nc;
  }
  __name(ic, "ic");
  a(ic, "isRegFile");
  var De = ["host", "port", "database", "user", "password"], Ar = De.length, sc = De[Ar - 1];
  function Cr() {
    var r = st instanceof Zu && st.writable === true;
    if (r) {
      var e = Array.prototype.slice.call(arguments).concat(`
`);
      st.write(Ss.format.apply(Ss, e));
    }
  }
  __name(Cr, "Cr");
  a(Cr, "warn");
  Object.defineProperty(pe.exports, "isWin", { get: a(function() {
    return Tt;
  }, "get"), set: a(function(r) {
    Tt = r;
  }, "set") });
  pe.exports.warnTo = function(r) {
    var e = st;
    return st = r, e;
  };
  pe.exports.getFileName = function(r) {
    var e = r || m.env, t = e.PGPASSFILE || (Tt ? xs.join(e.APPDATA || "./", "postgresql", "pgpass.conf") : xs.join(e.HOME || "./", ".pgpass"));
    return t;
  };
  pe.exports.usePgPass = function(r, e) {
    return Object.prototype.hasOwnProperty.call(m.env, "PGPASSWORD") ? false : Tt ? true : (e = e || "<unkn>", ic(r.mode) ? r.mode & (ec | tc) ? (Cr('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', e), false) : true : (Cr('WARNING: password file "%s" is not a plain file', e), false));
  };
  var oc = pe.exports.match = function(r, e) {
    return De.slice(0, -1).reduce(function(t, n, i) {
      return i == 1 && Number(r[n] || Xu) === Number(
        e[n]
      ) ? t && true : t && (e[n] === "*" || e[n] === r[n]);
    }, true);
  };
  pe.exports.getPassword = function(r, e, t) {
    var n, i = e.pipe(
      Ju()
    );
    function s(c) {
      var l = ac(c);
      l && uc(l) && oc(r, l) && (n = l[sc], i.end());
    }
    __name(s, "s");
    a(s, "onLine");
    var o = a(function() {
      e.destroy(), t(n);
    }, "onEnd"), u = a(function(c) {
      e.destroy(), Cr("WARNING: error on reading file: %s", c), t(
        void 0
      );
    }, "onErr");
    e.on("error", u), i.on("data", s).on("end", o).on("error", u);
  };
  var ac = pe.exports.parseLine = function(r) {
    if (r.length < 11 || r.match(/^\s+#/)) return null;
    for (var e = "", t = "", n = 0, i = 0, s = 0, o = {}, u = false, c = a(
      function(f, y, g) {
        var A = r.substring(y, g);
        Object.hasOwnProperty.call(m.env, "PGPASS_NO_DEESCAPE") || (A = A.replace(/\\([:\\])/g, "$1")), o[De[f]] = A;
      },
      "addToObj"
    ), l = 0; l < r.length - 1; l += 1) {
      if (e = r.charAt(l + 1), t = r.charAt(
        l
      ), u = n == Ar - 1, u) {
        c(n, i);
        break;
      }
      l >= 0 && e == ":" && t !== "\\" && (c(n, i, l + 1), i = l + 2, n += 1);
    }
    return o = Object.keys(o).length === Ar ? o : null, o;
  }, uc = pe.exports.isValidEntry = function(r) {
    for (var e = { 0: function(o) {
      return o.length > 0;
    }, 1: function(o) {
      return o === "*" ? true : (o = Number(o), isFinite(o) && o > 0 && o < 9007199254740992 && Math.floor(o) === o);
    }, 2: function(o) {
      return o.length > 0;
    }, 3: function(o) {
      return o.length > 0;
    }, 4: function(o) {
      return o.length > 0;
    } }, t = 0; t < De.length; t += 1) {
      var n = e[t], i = r[De[t]] || "", s = n(i);
      if (!s) return false;
    }
    return true;
  };
});
var Cs = T((gh, _r) => {
  "use strict";
  p();
  var wh = (wr(), O(mr)), As = (br(), O(gr)), Pt = Es();
  _r.exports = function(r, e) {
    var t = Pt.getFileName();
    As.stat(t, function(n, i) {
      if (n || !Pt.usePgPass(i, t)) return e(void 0);
      var s = As.createReadStream(
        t
      );
      Pt.getPassword(r, s, e);
    });
  };
  _r.exports.warnTo = Pt.warnTo;
});
var _s = {};
ie(_s, { default: /* @__PURE__ */ __name(() => cc, "default") });
var cc;
var Is = G(() => {
  "use strict";
  p();
  cc = {};
});
var Ps = T((xh, Ts) => {
  "use strict";
  p();
  var lc = (Zt(), O(gi)), Ir = (br(), O(gr));
  function Tr(r) {
    if (r.charAt(0) === "/") {
      var t = r.split(" ");
      return { host: t[0], database: t[1] };
    }
    var e = lc.parse(/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(r) ? encodeURI(r).replace(/\%25(\d\d)/g, "%$1") : r, true), t = e.query;
    for (var n in t) Array.isArray(t[n]) && (t[n] = t[n][t[n].length - 1]);
    var i = (e.auth || ":").split(":");
    if (t.user = i[0], t.password = i.splice(1).join(
      ":"
    ), t.port = e.port, e.protocol == "socket:") return t.host = decodeURI(e.pathname), t.database = e.query.db, t.client_encoding = e.query.encoding, t;
    t.host || (t.host = e.hostname);
    var s = e.pathname;
    if (!t.host && s && /^%2f/i.test(s)) {
      var o = s.split("/");
      t.host = decodeURIComponent(o[0]), s = o.splice(1).join("/");
    }
    switch (s && s.charAt(
      0
    ) === "/" && (s = s.slice(1) || null), t.database = s && decodeURI(s), (t.ssl === "true" || t.ssl === "1") && (t.ssl = true), t.ssl === "0" && (t.ssl = false), (t.sslcert || t.sslkey || t.sslrootcert || t.sslmode) && (t.ssl = {}), t.sslcert && (t.ssl.cert = Ir.readFileSync(t.sslcert).toString()), t.sslkey && (t.ssl.key = Ir.readFileSync(t.sslkey).toString()), t.sslrootcert && (t.ssl.ca = Ir.readFileSync(t.sslrootcert).toString()), t.sslmode) {
      case "disable": {
        t.ssl = false;
        break;
      }
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        break;
      case "no-verify": {
        t.ssl.rejectUnauthorized = false;
        break;
      }
    }
    return t;
  }
  __name(Tr, "Tr");
  a(Tr, "parse");
  Ts.exports = Tr;
  Tr.parse = Tr;
});
var Bt = T((Ah, Ls) => {
  "use strict";
  p();
  var fc = (Is(), O(_s)), Rs = tt(), Bs = Ps().parse, H = a(function(r, e, t) {
    return t === void 0 ? t = m.env["PG" + r.toUpperCase()] : t === false || (t = m.env[t]), e[r] || t || Rs[r];
  }, "val"), hc = a(function() {
    switch (m.env.PGSSLMODE) {
      case "disable":
        return false;
      case "prefer":
      case "require":
      case "verify-ca":
      case "verify-full":
        return true;
      case "no-verify":
        return { rejectUnauthorized: false };
    }
    return Rs.ssl;
  }, "readSSLConfigFromEnvironment"), Oe = a(function(r) {
    return "'" + ("" + r).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  }, "quoteParamValue"), ne = a(function(r, e, t) {
    var n = e[t];
    n != null && r.push(t + "=" + Oe(n));
  }, "add"), Br = class Br {
    static {
      __name(this, "Br");
    }
    constructor(e) {
      e = typeof e == "string" ? Bs(e) : e || {}, e.connectionString && (e = Object.assign({}, e, Bs(e.connectionString))), this.user = H("user", e), this.database = H("database", e), this.database === void 0 && (this.database = this.user), this.port = parseInt(H("port", e), 10), this.host = H("host", e), Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: H("password", e)
      }), this.binary = H("binary", e), this.options = H("options", e), this.ssl = typeof e.ssl > "u" ? hc() : e.ssl, typeof this.ssl == "string" && this.ssl === "true" && (this.ssl = true), this.ssl === "no-verify" && (this.ssl = { rejectUnauthorized: false }), this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this.client_encoding = H("client_encoding", e), this.replication = H("replication", e), this.isDomainSocket = !(this.host || "").indexOf("/"), this.application_name = H("application_name", e, "PGAPPNAME"), this.fallback_application_name = H("fallback_application_name", e, false), this.statement_timeout = H("statement_timeout", e, false), this.lock_timeout = H("lock_timeout", e, false), this.idle_in_transaction_session_timeout = H("idle_in_transaction_session_timeout", e, false), this.query_timeout = H("query_timeout", e, false), e.connectionTimeoutMillis === void 0 ? this.connect_timeout = m.env.PGCONNECT_TIMEOUT || 0 : this.connect_timeout = Math.floor(e.connectionTimeoutMillis / 1e3), e.keepAlive === false ? this.keepalives = 0 : e.keepAlive === true && (this.keepalives = 1), typeof e.keepAliveInitialDelayMillis == "number" && (this.keepalives_idle = Math.floor(e.keepAliveInitialDelayMillis / 1e3));
    }
    getLibpqConnectionString(e) {
      var t = [];
      ne(t, this, "user"), ne(t, this, "password"), ne(t, this, "port"), ne(t, this, "application_name"), ne(
        t,
        this,
        "fallback_application_name"
      ), ne(t, this, "connect_timeout"), ne(t, this, "options");
      var n = typeof this.ssl == "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
      if (ne(t, n, "sslmode"), ne(t, n, "sslca"), ne(t, n, "sslkey"), ne(t, n, "sslcert"), ne(t, n, "sslrootcert"), this.database && t.push("dbname=" + Oe(this.database)), this.replication && t.push("replication=" + Oe(this.replication)), this.host && t.push("host=" + Oe(this.host)), this.isDomainSocket) return e(null, t.join(" "));
      this.client_encoding && t.push("client_encoding=" + Oe(this.client_encoding)), fc.lookup(this.host, function(i, s) {
        return i ? e(i, null) : (t.push("hostaddr=" + Oe(s)), e(null, t.join(" ")));
      });
    }
  };
  a(Br, "ConnectionParameters");
  var Pr = Br;
  Ls.exports = Pr;
});
var Ms = T((Ih, ks) => {
  "use strict";
  p();
  var pc = Je(), Fs = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/, Lr = class Lr {
    static {
      __name(this, "Lr");
    }
    constructor(e, t) {
      this.command = null, this.rowCount = null, this.oid = null, this.rows = [], this.fields = [], this._parsers = void 0, this._types = t, this.RowCtor = null, this.rowAsArray = e === "array", this.rowAsArray && (this.parseRow = this._parseRowAsArray);
    }
    addCommandComplete(e) {
      var t;
      e.text ? t = Fs.exec(e.text) : t = Fs.exec(e.command), t && (this.command = t[1], t[3] ? (this.oid = parseInt(
        t[2],
        10
      ), this.rowCount = parseInt(t[3], 10)) : t[2] && (this.rowCount = parseInt(t[2], 10)));
    }
    _parseRowAsArray(e) {
      for (var t = new Array(
        e.length
      ), n = 0, i = e.length; n < i; n++) {
        var s = e[n];
        s !== null ? t[n] = this._parsers[n](s) : t[n] = null;
      }
      return t;
    }
    parseRow(e) {
      for (var t = {}, n = 0, i = e.length; n < i; n++) {
        var s = e[n], o = this.fields[n].name;
        s !== null ? t[o] = this._parsers[n](
          s
        ) : t[o] = null;
      }
      return t;
    }
    addRow(e) {
      this.rows.push(e);
    }
    addFields(e) {
      this.fields = e, this.fields.length && (this._parsers = new Array(e.length));
      for (var t = 0; t < e.length; t++) {
        var n = e[t];
        this._types ? this._parsers[t] = this._types.getTypeParser(n.dataTypeID, n.format || "text") : this._parsers[t] = pc.getTypeParser(n.dataTypeID, n.format || "text");
      }
    }
  };
  a(Lr, "Result");
  var Rr = Lr;
  ks.exports = Rr;
});
var qs = T((Bh, Os) => {
  "use strict";
  p();
  var { EventEmitter: dc } = ge(), Us = Ms(), Ds = rt(), kr = class kr extends dc {
    static {
      __name(this, "kr");
    }
    constructor(e, t, n) {
      super(), e = Ds.normalizeQueryConfig(e, t, n), this.text = e.text, this.values = e.values, this.rows = e.rows, this.types = e.types, this.name = e.name, this.binary = e.binary, this.portal = e.portal || "", this.callback = e.callback, this._rowMode = e.rowMode, m.domain && e.callback && (this.callback = m.domain.bind(e.callback)), this._result = new Us(this._rowMode, this.types), this._results = this._result, this.isPreparedStatement = false, this._canceledDueToError = false, this._promise = null;
    }
    requiresPreparation() {
      return this.name || this.rows ? true : !this.text || !this.values ? false : this.values.length > 0;
    }
    _checkForMultirow() {
      this._result.command && (Array.isArray(this._results) || (this._results = [this._result]), this._result = new Us(this._rowMode, this.types), this._results.push(this._result));
    }
    handleRowDescription(e) {
      this._checkForMultirow(), this._result.addFields(e.fields), this._accumulateRows = this.callback || !this.listeners("row").length;
    }
    handleDataRow(e) {
      let t;
      if (!this._canceledDueToError) {
        try {
          t = this._result.parseRow(
            e.fields
          );
        } catch (n) {
          this._canceledDueToError = n;
          return;
        }
        this.emit("row", t, this._result), this._accumulateRows && this._result.addRow(t);
      }
    }
    handleCommandComplete(e, t) {
      this._checkForMultirow(), this._result.addCommandComplete(
        e
      ), this.rows && t.sync();
    }
    handleEmptyQuery(e) {
      this.rows && e.sync();
    }
    handleError(e, t) {
      if (this._canceledDueToError && (e = this._canceledDueToError, this._canceledDueToError = false), this.callback) return this.callback(e);
      this.emit("error", e);
    }
    handleReadyForQuery(e) {
      if (this._canceledDueToError) return this.handleError(
        this._canceledDueToError,
        e
      );
      if (this.callback) try {
        this.callback(null, this._results);
      } catch (t) {
        m.nextTick(() => {
          throw t;
        });
      }
      this.emit(
        "end",
        this._results
      );
    }
    submit(e) {
      if (typeof this.text != "string" && typeof this.name != "string") return new Error(
        "A query must have either text or a name. Supplying neither is unsupported."
      );
      let t = e.parsedStatements[this.name];
      return this.text && t && this.text !== t ? new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`) : this.values && !Array.isArray(this.values) ? new Error("Query values must be an array") : (this.requiresPreparation() ? this.prepare(e) : e.query(this.text), null);
    }
    hasBeenParsed(e) {
      return this.name && e.parsedStatements[this.name];
    }
    handlePortalSuspended(e) {
      this._getRows(e, this.rows);
    }
    _getRows(e, t) {
      e.execute({ portal: this.portal, rows: t }), t ? e.flush() : e.sync();
    }
    prepare(e) {
      this.isPreparedStatement = true, this.hasBeenParsed(e) || e.parse({ text: this.text, name: this.name, types: this.types });
      try {
        e.bind({ portal: this.portal, statement: this.name, values: this.values, binary: this.binary, valueMapper: Ds.prepareValue });
      } catch (t) {
        this.handleError(t, e);
        return;
      }
      e.describe({ type: "P", name: this.portal || "" }), this._getRows(e, this.rows);
    }
    handleCopyInResponse(e) {
      e.sendCopyFail("No source stream defined");
    }
    handleCopyData(e, t) {
    }
  };
  a(kr, "Query");
  var Fr = kr;
  Os.exports = Fr;
});
var ln = T((_) => {
  "use strict";
  p();
  Object.defineProperty(_, "__esModule", { value: true });
  _.NoticeMessage = _.DataRowMessage = _.CommandCompleteMessage = _.ReadyForQueryMessage = _.NotificationResponseMessage = _.BackendKeyDataMessage = _.AuthenticationMD5Password = _.ParameterStatusMessage = _.ParameterDescriptionMessage = _.RowDescriptionMessage = _.Field = _.CopyResponse = _.CopyDataMessage = _.DatabaseError = _.copyDone = _.emptyQuery = _.replicationStart = _.portalSuspended = _.noData = _.closeComplete = _.bindComplete = _.parseComplete = void 0;
  _.parseComplete = { name: "parseComplete", length: 5 };
  _.bindComplete = { name: "bindComplete", length: 5 };
  _.closeComplete = { name: "closeComplete", length: 5 };
  _.noData = { name: "noData", length: 5 };
  _.portalSuspended = { name: "portalSuspended", length: 5 };
  _.replicationStart = { name: "replicationStart", length: 4 };
  _.emptyQuery = { name: "emptyQuery", length: 4 };
  _.copyDone = { name: "copyDone", length: 4 };
  var Kr = class Kr extends Error {
    static {
      __name(this, "Kr");
    }
    constructor(e, t, n) {
      super(e), this.length = t, this.name = n;
    }
  };
  a(Kr, "DatabaseError");
  var Mr = Kr;
  _.DatabaseError = Mr;
  var Yr = class Yr {
    static {
      __name(this, "Yr");
    }
    constructor(e, t) {
      this.length = e, this.chunk = t, this.name = "copyData";
    }
  };
  a(Yr, "CopyDataMessage");
  var Ur = Yr;
  _.CopyDataMessage = Ur;
  var Zr = class Zr {
    static {
      __name(this, "Zr");
    }
    constructor(e, t, n, i) {
      this.length = e, this.name = t, this.binary = n, this.columnTypes = new Array(i);
    }
  };
  a(Zr, "CopyResponse");
  var Dr = Zr;
  _.CopyResponse = Dr;
  var Jr = class Jr {
    static {
      __name(this, "Jr");
    }
    constructor(e, t, n, i, s, o, u) {
      this.name = e, this.tableID = t, this.columnID = n, this.dataTypeID = i, this.dataTypeSize = s, this.dataTypeModifier = o, this.format = u;
    }
  };
  a(Jr, "Field");
  var Or = Jr;
  _.Field = Or;
  var Xr = class Xr {
    static {
      __name(this, "Xr");
    }
    constructor(e, t) {
      this.length = e, this.fieldCount = t, this.name = "rowDescription", this.fields = new Array(this.fieldCount);
    }
  };
  a(Xr, "RowDescriptionMessage");
  var qr = Xr;
  _.RowDescriptionMessage = qr;
  var en = class en {
    static {
      __name(this, "en");
    }
    constructor(e, t) {
      this.length = e, this.parameterCount = t, this.name = "parameterDescription", this.dataTypeIDs = new Array(this.parameterCount);
    }
  };
  a(en, "ParameterDescriptionMessage");
  var Qr = en;
  _.ParameterDescriptionMessage = Qr;
  var tn = class tn {
    static {
      __name(this, "tn");
    }
    constructor(e, t, n) {
      this.length = e, this.parameterName = t, this.parameterValue = n, this.name = "parameterStatus";
    }
  };
  a(tn, "ParameterStatusMessage");
  var Nr = tn;
  _.ParameterStatusMessage = Nr;
  var rn = class rn {
    static {
      __name(this, "rn");
    }
    constructor(e, t) {
      this.length = e, this.salt = t, this.name = "authenticationMD5Password";
    }
  };
  a(rn, "AuthenticationMD5Password");
  var Wr = rn;
  _.AuthenticationMD5Password = Wr;
  var nn = class nn {
    static {
      __name(this, "nn");
    }
    constructor(e, t, n) {
      this.length = e, this.processID = t, this.secretKey = n, this.name = "backendKeyData";
    }
  };
  a(nn, "BackendKeyDataMessage");
  var jr = nn;
  _.BackendKeyDataMessage = jr;
  var sn = class sn {
    static {
      __name(this, "sn");
    }
    constructor(e, t, n, i) {
      this.length = e, this.processId = t, this.channel = n, this.payload = i, this.name = "notification";
    }
  };
  a(sn, "NotificationResponseMessage");
  var Hr = sn;
  _.NotificationResponseMessage = Hr;
  var on = class on {
    static {
      __name(this, "on");
    }
    constructor(e, t) {
      this.length = e, this.status = t, this.name = "readyForQuery";
    }
  };
  a(on, "ReadyForQueryMessage");
  var $r = on;
  _.ReadyForQueryMessage = $r;
  var an = class an {
    static {
      __name(this, "an");
    }
    constructor(e, t) {
      this.length = e, this.text = t, this.name = "commandComplete";
    }
  };
  a(an, "CommandCompleteMessage");
  var Gr = an;
  _.CommandCompleteMessage = Gr;
  var un = class un {
    static {
      __name(this, "un");
    }
    constructor(e, t) {
      this.length = e, this.fields = t, this.name = "dataRow", this.fieldCount = t.length;
    }
  };
  a(un, "DataRowMessage");
  var Vr = un;
  _.DataRowMessage = Vr;
  var cn = class cn {
    static {
      __name(this, "cn");
    }
    constructor(e, t) {
      this.length = e, this.message = t, this.name = "notice";
    }
  };
  a(cn, "NoticeMessage");
  var zr = cn;
  _.NoticeMessage = zr;
});
var Qs = T((Rt) => {
  "use strict";
  p();
  Object.defineProperty(Rt, "__esModule", { value: true });
  Rt.Writer = void 0;
  var hn = class hn {
    static {
      __name(this, "hn");
    }
    constructor(e = 256) {
      this.size = e, this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(e);
    }
    ensure(e) {
      if (this.buffer.length - this.offset < e) {
        let n = this.buffer, i = n.length + (n.length >> 1) + e;
        this.buffer = d.allocUnsafe(i), n.copy(
          this.buffer
        );
      }
    }
    addInt32(e) {
      return this.ensure(4), this.buffer[this.offset++] = e >>> 24 & 255, this.buffer[this.offset++] = e >>> 16 & 255, this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addInt16(e) {
      return this.ensure(2), this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
    }
    addCString(e) {
      if (!e) this.ensure(1);
      else {
        let t = d.byteLength(e);
        this.ensure(t + 1), this.buffer.write(e, this.offset, "utf-8"), this.offset += t;
      }
      return this.buffer[this.offset++] = 0, this;
    }
    addString(e = "") {
      let t = d.byteLength(e);
      return this.ensure(t), this.buffer.write(e, this.offset), this.offset += t, this;
    }
    add(e) {
      return this.ensure(
        e.length
      ), e.copy(this.buffer, this.offset), this.offset += e.length, this;
    }
    join(e) {
      if (e) {
        this.buffer[this.headerPosition] = e;
        let t = this.offset - (this.headerPosition + 1);
        this.buffer.writeInt32BE(t, this.headerPosition + 1);
      }
      return this.buffer.slice(e ? 0 : 5, this.offset);
    }
    flush(e) {
      let t = this.join(e);
      return this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(this.size), t;
    }
  };
  a(hn, "Writer");
  var fn = hn;
  Rt.Writer = fn;
});
var Ws = T((Ft) => {
  "use strict";
  p();
  Object.defineProperty(Ft, "__esModule", { value: true });
  Ft.serialize = void 0;
  var pn = Qs(), F = new pn.Writer(), yc = a((r) => {
    F.addInt16(3).addInt16(0);
    for (let n of Object.keys(r)) F.addCString(
      n
    ).addCString(r[n]);
    F.addCString("client_encoding").addCString("UTF8");
    let e = F.addCString("").flush(), t = e.length + 4;
    return new pn.Writer().addInt32(t).add(e).flush();
  }, "startup"), mc = a(() => {
    let r = d.allocUnsafe(
      8
    );
    return r.writeInt32BE(8, 0), r.writeInt32BE(80877103, 4), r;
  }, "requestSsl"), wc = a((r) => F.addCString(r).flush(
    112
  ), "password"), gc = a(function(r, e) {
    return F.addCString(r).addInt32(d.byteLength(e)).addString(e), F.flush(112);
  }, "sendSASLInitialResponseMessage"), bc = a(function(r) {
    return F.addString(r).flush(112);
  }, "sendSCRAMClientFinalMessage"), vc = a((r) => F.addCString(r).flush(81), "query"), Ns = [], xc = a((r) => {
    let e = r.name || "";
    e.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", e, e.length), console.error("This can cause conflicts and silent errors executing queries"));
    let t = r.types || Ns, n = t.length, i = F.addCString(e).addCString(r.text).addInt16(n);
    for (let s = 0; s < n; s++) i.addInt32(t[s]);
    return F.flush(80);
  }, "parse"), qe = new pn.Writer(), Sc = a(function(r, e) {
    for (let t = 0; t < r.length; t++) {
      let n = e ? e(r[t], t) : r[t];
      n == null ? (F.addInt16(0), qe.addInt32(-1)) : n instanceof d ? (F.addInt16(
        1
      ), qe.addInt32(n.length), qe.add(n)) : (F.addInt16(0), qe.addInt32(d.byteLength(n)), qe.addString(n));
    }
  }, "writeValues"), Ec = a((r = {}) => {
    let e = r.portal || "", t = r.statement || "", n = r.binary || false, i = r.values || Ns, s = i.length;
    return F.addCString(e).addCString(t), F.addInt16(s), Sc(i, r.valueMapper), F.addInt16(s), F.add(qe.flush()), F.addInt16(n ? 1 : 0), F.flush(66);
  }, "bind"), Ac = d.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]), Cc = a((r) => {
    if (!r || !r.portal && !r.rows) return Ac;
    let e = r.portal || "", t = r.rows || 0, n = d.byteLength(e), i = 4 + n + 1 + 4, s = d.allocUnsafe(1 + i);
    return s[0] = 69, s.writeInt32BE(i, 1), s.write(e, 5, "utf-8"), s[n + 5] = 0, s.writeUInt32BE(t, s.length - 4), s;
  }, "execute"), _c = a(
    (r, e) => {
      let t = d.allocUnsafe(16);
      return t.writeInt32BE(16, 0), t.writeInt16BE(1234, 4), t.writeInt16BE(
        5678,
        6
      ), t.writeInt32BE(r, 8), t.writeInt32BE(e, 12), t;
    },
    "cancel"
  ), dn = a((r, e) => {
    let n = 4 + d.byteLength(e) + 1, i = d.allocUnsafe(1 + n);
    return i[0] = r, i.writeInt32BE(n, 1), i.write(e, 5, "utf-8"), i[n] = 0, i;
  }, "cstringMessage"), Ic = F.addCString("P").flush(68), Tc = F.addCString("S").flush(68), Pc = a((r) => r.name ? dn(68, `${r.type}${r.name || ""}`) : r.type === "P" ? Ic : Tc, "describe"), Bc = a((r) => {
    let e = `${r.type}${r.name || ""}`;
    return dn(67, e);
  }, "close"), Rc = a((r) => F.add(r).flush(100), "copyData"), Lc = a((r) => dn(102, r), "copyFail"), Lt = a((r) => d.from([r, 0, 0, 0, 4]), "codeOnlyBuffer"), Fc = Lt(72), kc = Lt(83), Mc = Lt(88), Uc = Lt(99), Dc = {
    startup: yc,
    password: wc,
    requestSsl: mc,
    sendSASLInitialResponseMessage: gc,
    sendSCRAMClientFinalMessage: bc,
    query: vc,
    parse: xc,
    bind: Ec,
    execute: Cc,
    describe: Pc,
    close: Bc,
    flush: a(
      () => Fc,
      "flush"
    ),
    sync: a(() => kc, "sync"),
    end: a(() => Mc, "end"),
    copyData: Rc,
    copyDone: a(() => Uc, "copyDone"),
    copyFail: Lc,
    cancel: _c
  };
  Ft.serialize = Dc;
});
var js = T((kt) => {
  "use strict";
  p();
  Object.defineProperty(kt, "__esModule", { value: true });
  kt.BufferReader = void 0;
  var Oc = d.allocUnsafe(0), mn = class mn {
    static {
      __name(this, "mn");
    }
    constructor(e = 0) {
      this.offset = e, this.buffer = Oc, this.encoding = "utf-8";
    }
    setBuffer(e, t) {
      this.offset = e, this.buffer = t;
    }
    int16() {
      let e = this.buffer.readInt16BE(this.offset);
      return this.offset += 2, e;
    }
    byte() {
      let e = this.buffer[this.offset];
      return this.offset++, e;
    }
    int32() {
      let e = this.buffer.readInt32BE(
        this.offset
      );
      return this.offset += 4, e;
    }
    uint32() {
      let e = this.buffer.readUInt32BE(this.offset);
      return this.offset += 4, e;
    }
    string(e) {
      let t = this.buffer.toString(this.encoding, this.offset, this.offset + e);
      return this.offset += e, t;
    }
    cstring() {
      let e = this.offset, t = e;
      for (; this.buffer[t++] !== 0; ) ;
      return this.offset = t, this.buffer.toString(this.encoding, e, t - 1);
    }
    bytes(e) {
      let t = this.buffer.slice(this.offset, this.offset + e);
      return this.offset += e, t;
    }
  };
  a(mn, "BufferReader");
  var yn = mn;
  kt.BufferReader = yn;
});
var Gs = T((Mt) => {
  "use strict";
  p();
  Object.defineProperty(Mt, "__esModule", { value: true });
  Mt.Parser = void 0;
  var k = ln(), qc = js(), wn = 1, Qc = 4, Hs = wn + Qc, $s = d.allocUnsafe(0), bn = class bn {
    static {
      __name(this, "bn");
    }
    constructor(e) {
      if (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0, this.reader = new qc.BufferReader(), e?.mode === "binary") throw new Error("Binary mode not supported yet");
      this.mode = e?.mode || "text";
    }
    parse(e, t) {
      this.mergeBuffer(e);
      let n = this.bufferOffset + this.bufferLength, i = this.bufferOffset;
      for (; i + Hs <= n; ) {
        let s = this.buffer[i], o = this.buffer.readUInt32BE(
          i + wn
        ), u = wn + o;
        if (u + i <= n) {
          let c = this.handlePacket(i + Hs, s, o, this.buffer);
          t(c), i += u;
        } else break;
      }
      i === n ? (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0) : (this.bufferLength = n - i, this.bufferOffset = i);
    }
    mergeBuffer(e) {
      if (this.bufferLength > 0) {
        let t = this.bufferLength + e.byteLength;
        if (t + this.bufferOffset > this.buffer.byteLength) {
          let i;
          if (t <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) i = this.buffer;
          else {
            let s = this.buffer.byteLength * 2;
            for (; t >= s; ) s *= 2;
            i = d.allocUnsafe(s);
          }
          this.buffer.copy(i, 0, this.bufferOffset, this.bufferOffset + this.bufferLength), this.buffer = i, this.bufferOffset = 0;
        }
        e.copy(this.buffer, this.bufferOffset + this.bufferLength), this.bufferLength = t;
      } else this.buffer = e, this.bufferOffset = 0, this.bufferLength = e.byteLength;
    }
    handlePacket(e, t, n, i) {
      switch (t) {
        case 50:
          return k.bindComplete;
        case 49:
          return k.parseComplete;
        case 51:
          return k.closeComplete;
        case 110:
          return k.noData;
        case 115:
          return k.portalSuspended;
        case 99:
          return k.copyDone;
        case 87:
          return k.replicationStart;
        case 73:
          return k.emptyQuery;
        case 68:
          return this.parseDataRowMessage(e, n, i);
        case 67:
          return this.parseCommandCompleteMessage(
            e,
            n,
            i
          );
        case 90:
          return this.parseReadyForQueryMessage(e, n, i);
        case 65:
          return this.parseNotificationMessage(
            e,
            n,
            i
          );
        case 82:
          return this.parseAuthenticationResponse(e, n, i);
        case 83:
          return this.parseParameterStatusMessage(
            e,
            n,
            i
          );
        case 75:
          return this.parseBackendKeyData(e, n, i);
        case 69:
          return this.parseErrorMessage(e, n, i, "error");
        case 78:
          return this.parseErrorMessage(e, n, i, "notice");
        case 84:
          return this.parseRowDescriptionMessage(
            e,
            n,
            i
          );
        case 116:
          return this.parseParameterDescriptionMessage(e, n, i);
        case 71:
          return this.parseCopyInMessage(
            e,
            n,
            i
          );
        case 72:
          return this.parseCopyOutMessage(e, n, i);
        case 100:
          return this.parseCopyData(e, n, i);
        default:
          return new k.DatabaseError("received invalid response: " + t.toString(16), n, "error");
      }
    }
    parseReadyForQueryMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.string(1);
      return new k.ReadyForQueryMessage(t, i);
    }
    parseCommandCompleteMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.cstring();
      return new k.CommandCompleteMessage(t, i);
    }
    parseCopyData(e, t, n) {
      let i = n.slice(e, e + (t - 4));
      return new k.CopyDataMessage(t, i);
    }
    parseCopyInMessage(e, t, n) {
      return this.parseCopyMessage(
        e,
        t,
        n,
        "copyInResponse"
      );
    }
    parseCopyOutMessage(e, t, n) {
      return this.parseCopyMessage(e, t, n, "copyOutResponse");
    }
    parseCopyMessage(e, t, n, i) {
      this.reader.setBuffer(e, n);
      let s = this.reader.byte() !== 0, o = this.reader.int16(), u = new k.CopyResponse(t, i, s, o);
      for (let c = 0; c < o; c++) u.columnTypes[c] = this.reader.int16();
      return u;
    }
    parseNotificationMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int32(), s = this.reader.cstring(), o = this.reader.cstring();
      return new k.NotificationResponseMessage(t, i, s, o);
    }
    parseRowDescriptionMessage(e, t, n) {
      this.reader.setBuffer(
        e,
        n
      );
      let i = this.reader.int16(), s = new k.RowDescriptionMessage(t, i);
      for (let o = 0; o < i; o++) s.fields[o] = this.parseField();
      return s;
    }
    parseField() {
      let e = this.reader.cstring(), t = this.reader.uint32(), n = this.reader.int16(), i = this.reader.uint32(), s = this.reader.int16(), o = this.reader.int32(), u = this.reader.int16() === 0 ? "text" : "binary";
      return new k.Field(e, t, n, i, s, o, u);
    }
    parseParameterDescriptionMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int16(), s = new k.ParameterDescriptionMessage(t, i);
      for (let o = 0; o < i; o++)
        s.dataTypeIDs[o] = this.reader.int32();
      return s;
    }
    parseDataRowMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int16(), s = new Array(i);
      for (let o = 0; o < i; o++) {
        let u = this.reader.int32();
        s[o] = u === -1 ? null : this.reader.string(u);
      }
      return new k.DataRowMessage(t, s);
    }
    parseParameterStatusMessage(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.cstring(), s = this.reader.cstring();
      return new k.ParameterStatusMessage(
        t,
        i,
        s
      );
    }
    parseBackendKeyData(e, t, n) {
      this.reader.setBuffer(e, n);
      let i = this.reader.int32(), s = this.reader.int32();
      return new k.BackendKeyDataMessage(t, i, s);
    }
    parseAuthenticationResponse(e, t, n) {
      this.reader.setBuffer(
        e,
        n
      );
      let i = this.reader.int32(), s = { name: "authenticationOk", length: t };
      switch (i) {
        case 0:
          break;
        case 3:
          s.length === 8 && (s.name = "authenticationCleartextPassword");
          break;
        case 5:
          if (s.length === 12) {
            s.name = "authenticationMD5Password";
            let o = this.reader.bytes(4);
            return new k.AuthenticationMD5Password(t, o);
          }
          break;
        case 10:
          {
            s.name = "authenticationSASL", s.mechanisms = [];
            let o;
            do
              o = this.reader.cstring(), o && s.mechanisms.push(o);
            while (o);
          }
          break;
        case 11:
          s.name = "authenticationSASLContinue", s.data = this.reader.string(t - 8);
          break;
        case 12:
          s.name = "authenticationSASLFinal", s.data = this.reader.string(t - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + i);
      }
      return s;
    }
    parseErrorMessage(e, t, n, i) {
      this.reader.setBuffer(e, n);
      let s = {}, o = this.reader.string(1);
      for (; o !== "\0"; ) s[o] = this.reader.cstring(), o = this.reader.string(1);
      let u = s.M, c = i === "notice" ? new k.NoticeMessage(t, u) : new k.DatabaseError(u, t, i);
      return c.severity = s.S, c.code = s.C, c.detail = s.D, c.hint = s.H, c.position = s.P, c.internalPosition = s.p, c.internalQuery = s.q, c.where = s.W, c.schema = s.s, c.table = s.t, c.column = s.c, c.dataType = s.d, c.constraint = s.n, c.file = s.F, c.line = s.L, c.routine = s.R, c;
    }
  };
  a(bn, "Parser");
  var gn = bn;
  Mt.Parser = gn;
});
var vn = T((xe) => {
  "use strict";
  p();
  Object.defineProperty(xe, "__esModule", { value: true });
  xe.DatabaseError = xe.serialize = xe.parse = void 0;
  var Nc = ln();
  Object.defineProperty(xe, "DatabaseError", { enumerable: true, get: a(
    function() {
      return Nc.DatabaseError;
    },
    "get"
  ) });
  var Wc = Ws();
  Object.defineProperty(xe, "serialize", {
    enumerable: true,
    get: a(function() {
      return Wc.serialize;
    }, "get")
  });
  var jc = Gs();
  function Hc(r, e) {
    let t = new jc.Parser();
    return r.on("data", (n) => t.parse(n, e)), new Promise((n) => r.on("end", () => n()));
  }
  __name(Hc, "Hc");
  a(Hc, "parse");
  xe.parse = Hc;
});
var Vs = {};
ie(Vs, { connect: /* @__PURE__ */ __name(() => $c, "connect") });
function $c({ socket: r, servername: e }) {
  return r.startTls(e), r;
}
__name($c, "$c");
var zs = G(
  () => {
    "use strict";
    p();
    a($c, "connect");
  }
);
var En = T((Xh, Zs) => {
  "use strict";
  p();
  var Ks = (Fe(), O(wi)), Gc = ge().EventEmitter, { parse: Vc, serialize: Q } = vn(), Ys = Q.flush(), zc = Q.sync(), Kc = Q.end(), Sn = class Sn extends Gc {
    static {
      __name(this, "Sn");
    }
    constructor(e) {
      super(), e = e || {}, this.stream = e.stream || new Ks.Socket(), this._keepAlive = e.keepAlive, this._keepAliveInitialDelayMillis = e.keepAliveInitialDelayMillis, this.lastBuffer = false, this.parsedStatements = {}, this.ssl = e.ssl || false, this._ending = false, this._emitMessage = false;
      var t = this;
      this.on("newListener", function(n) {
        n === "message" && (t._emitMessage = true);
      });
    }
    connect(e, t) {
      var n = this;
      this._connecting = true, this.stream.setNoDelay(true), this.stream.connect(e, t), this.stream.once("connect", function() {
        n._keepAlive && n.stream.setKeepAlive(true, n._keepAliveInitialDelayMillis), n.emit("connect");
      });
      let i = a(function(s) {
        n._ending && (s.code === "ECONNRESET" || s.code === "EPIPE") || n.emit("error", s);
      }, "reportStreamError");
      if (this.stream.on("error", i), this.stream.on("close", function() {
        n.emit("end");
      }), !this.ssl) return this.attachListeners(
        this.stream
      );
      this.stream.once("data", function(s) {
        var o = s.toString("utf8");
        switch (o) {
          case "S":
            break;
          case "N":
            return n.stream.end(), n.emit("error", new Error("The server does not support SSL connections"));
          default:
            return n.stream.end(), n.emit("error", new Error("There was an error establishing an SSL connection"));
        }
        var u = (zs(), O(Vs));
        let c = { socket: n.stream };
        n.ssl !== true && (Object.assign(c, n.ssl), "key" in n.ssl && (c.key = n.ssl.key)), Ks.isIP(t) === 0 && (c.servername = t);
        try {
          n.stream = u.connect(c);
        } catch (l) {
          return n.emit(
            "error",
            l
          );
        }
        n.attachListeners(n.stream), n.stream.on("error", i), n.emit("sslconnect");
      });
    }
    attachListeners(e) {
      e.on(
        "end",
        () => {
          this.emit("end");
        }
      ), Vc(e, (t) => {
        var n = t.name === "error" ? "errorMessage" : t.name;
        this._emitMessage && this.emit("message", t), this.emit(n, t);
      });
    }
    requestSsl() {
      this.stream.write(Q.requestSsl());
    }
    startup(e) {
      this.stream.write(Q.startup(e));
    }
    cancel(e, t) {
      this._send(Q.cancel(e, t));
    }
    password(e) {
      this._send(Q.password(e));
    }
    sendSASLInitialResponseMessage(e, t) {
      this._send(Q.sendSASLInitialResponseMessage(e, t));
    }
    sendSCRAMClientFinalMessage(e) {
      this._send(Q.sendSCRAMClientFinalMessage(
        e
      ));
    }
    _send(e) {
      return this.stream.writable ? this.stream.write(e) : false;
    }
    query(e) {
      this._send(Q.query(e));
    }
    parse(e) {
      this._send(Q.parse(e));
    }
    bind(e) {
      this._send(Q.bind(e));
    }
    execute(e) {
      this._send(Q.execute(e));
    }
    flush() {
      this.stream.writable && this.stream.write(Ys);
    }
    sync() {
      this._ending = true, this._send(Ys), this._send(zc);
    }
    ref() {
      this.stream.ref();
    }
    unref() {
      this.stream.unref();
    }
    end() {
      if (this._ending = true, !this._connecting || !this.stream.writable) {
        this.stream.end();
        return;
      }
      return this.stream.write(Kc, () => {
        this.stream.end();
      });
    }
    close(e) {
      this._send(Q.close(e));
    }
    describe(e) {
      this._send(Q.describe(e));
    }
    sendCopyFromChunk(e) {
      this._send(Q.copyData(e));
    }
    endCopyFrom() {
      this._send(Q.copyDone());
    }
    sendCopyFail(e) {
      this._send(Q.copyFail(e));
    }
  };
  a(Sn, "Connection");
  var xn = Sn;
  Zs.exports = xn;
});
var eo = T((np, Xs) => {
  "use strict";
  p();
  var Yc = ge().EventEmitter, rp = (it(), O(nt)), Zc = rt(), An = ds(), Jc = Cs(), Xc = At(), el = Bt(), Js = qs(), tl = tt(), rl = En(), Cn = class Cn extends Yc {
    static {
      __name(this, "Cn");
    }
    constructor(e) {
      super(), this.connectionParameters = new el(e), this.user = this.connectionParameters.user, this.database = this.connectionParameters.database, this.port = this.connectionParameters.port, this.host = this.connectionParameters.host, Object.defineProperty(
        this,
        "password",
        { configurable: true, enumerable: false, writable: true, value: this.connectionParameters.password }
      ), this.replication = this.connectionParameters.replication;
      var t = e || {};
      this._Promise = t.Promise || b.Promise, this._types = new Xc(t.types), this._ending = false, this._connecting = false, this._connected = false, this._connectionError = false, this._queryable = true, this.connection = t.connection || new rl({ stream: t.stream, ssl: this.connectionParameters.ssl, keepAlive: t.keepAlive || false, keepAliveInitialDelayMillis: t.keepAliveInitialDelayMillis || 0, encoding: this.connectionParameters.client_encoding || "utf8" }), this.queryQueue = [], this.binary = t.binary || tl.binary, this.processID = null, this.secretKey = null, this.ssl = this.connectionParameters.ssl || false, this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this._connectionTimeoutMillis = t.connectionTimeoutMillis || 0;
    }
    _errorAllQueries(e) {
      let t = a((n) => {
        m.nextTick(() => {
          n.handleError(e, this.connection);
        });
      }, "enqueueError");
      this.activeQuery && (t(this.activeQuery), this.activeQuery = null), this.queryQueue.forEach(t), this.queryQueue.length = 0;
    }
    _connect(e) {
      var t = this, n = this.connection;
      if (this._connectionCallback = e, this._connecting || this._connected) {
        let i = new Error("Client has already been connected. You cannot reuse a client.");
        m.nextTick(
          () => {
            e(i);
          }
        );
        return;
      }
      this._connecting = true, this.connectionTimeoutHandle, this._connectionTimeoutMillis > 0 && (this.connectionTimeoutHandle = setTimeout(() => {
        n._ending = true, n.stream.destroy(new Error("timeout expired"));
      }, this._connectionTimeoutMillis)), this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
        t.ssl ? n.requestSsl() : n.startup(t.getStartupConf());
      }), n.on("sslconnect", function() {
        n.startup(t.getStartupConf());
      }), this._attachListeners(
        n
      ), n.once("end", () => {
        let i = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
        clearTimeout(this.connectionTimeoutHandle), this._errorAllQueries(i), this._ending || (this._connecting && !this._connectionError ? this._connectionCallback ? this._connectionCallback(i) : this._handleErrorEvent(i) : this._connectionError || this._handleErrorEvent(i)), m.nextTick(() => {
          this.emit("end");
        });
      });
    }
    connect(e) {
      if (e) {
        this._connect(e);
        return;
      }
      return new this._Promise((t, n) => {
        this._connect((i) => {
          i ? n(i) : t();
        });
      });
    }
    _attachListeners(e) {
      e.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this)), e.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this)), e.on("authenticationSASL", this._handleAuthSASL.bind(this)), e.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this)), e.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this)), e.on("backendKeyData", this._handleBackendKeyData.bind(this)), e.on("error", this._handleErrorEvent.bind(this)), e.on("errorMessage", this._handleErrorMessage.bind(this)), e.on("readyForQuery", this._handleReadyForQuery.bind(this)), e.on("notice", this._handleNotice.bind(this)), e.on("rowDescription", this._handleRowDescription.bind(this)), e.on("dataRow", this._handleDataRow.bind(this)), e.on("portalSuspended", this._handlePortalSuspended.bind(
        this
      )), e.on("emptyQuery", this._handleEmptyQuery.bind(this)), e.on("commandComplete", this._handleCommandComplete.bind(this)), e.on("parseComplete", this._handleParseComplete.bind(this)), e.on("copyInResponse", this._handleCopyInResponse.bind(this)), e.on("copyData", this._handleCopyData.bind(this)), e.on("notification", this._handleNotification.bind(this));
    }
    _checkPgPass(e) {
      let t = this.connection;
      typeof this.password == "function" ? this._Promise.resolve().then(() => this.password()).then((n) => {
        if (n !== void 0) {
          if (typeof n != "string") {
            t.emit("error", new TypeError(
              "Password must be a string"
            ));
            return;
          }
          this.connectionParameters.password = this.password = n;
        } else this.connectionParameters.password = this.password = null;
        e();
      }).catch((n) => {
        t.emit("error", n);
      }) : this.password !== null ? e() : Jc(
        this.connectionParameters,
        (n) => {
          n !== void 0 && (this.connectionParameters.password = this.password = n), e();
        }
      );
    }
    _handleAuthCleartextPassword(e) {
      this._checkPgPass(() => {
        this.connection.password(this.password);
      });
    }
    _handleAuthMD5Password(e) {
      this._checkPgPass(
        () => {
          let t = Zc.postgresMd5PasswordHash(this.user, this.password, e.salt);
          this.connection.password(t);
        }
      );
    }
    _handleAuthSASL(e) {
      this._checkPgPass(() => {
        this.saslSession = An.startSession(e.mechanisms), this.connection.sendSASLInitialResponseMessage(
          this.saslSession.mechanism,
          this.saslSession.response
        );
      });
    }
    _handleAuthSASLContinue(e) {
      An.continueSession(
        this.saslSession,
        this.password,
        e.data
      ), this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
    }
    _handleAuthSASLFinal(e) {
      An.finalizeSession(this.saslSession, e.data), this.saslSession = null;
    }
    _handleBackendKeyData(e) {
      this.processID = e.processID, this.secretKey = e.secretKey;
    }
    _handleReadyForQuery(e) {
      this._connecting && (this._connecting = false, this._connected = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback && (this._connectionCallback(null, this), this._connectionCallback = null), this.emit("connect"));
      let { activeQuery: t } = this;
      this.activeQuery = null, this.readyForQuery = true, t && t.handleReadyForQuery(this.connection), this._pulseQueryQueue();
    }
    _handleErrorWhileConnecting(e) {
      if (!this._connectionError) {
        if (this._connectionError = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback) return this._connectionCallback(e);
        this.emit("error", e);
      }
    }
    _handleErrorEvent(e) {
      if (this._connecting) return this._handleErrorWhileConnecting(e);
      this._queryable = false, this._errorAllQueries(e), this.emit("error", e);
    }
    _handleErrorMessage(e) {
      if (this._connecting) return this._handleErrorWhileConnecting(e);
      let t = this.activeQuery;
      if (!t) {
        this._handleErrorEvent(e);
        return;
      }
      this.activeQuery = null, t.handleError(
        e,
        this.connection
      );
    }
    _handleRowDescription(e) {
      this.activeQuery.handleRowDescription(e);
    }
    _handleDataRow(e) {
      this.activeQuery.handleDataRow(e);
    }
    _handlePortalSuspended(e) {
      this.activeQuery.handlePortalSuspended(this.connection);
    }
    _handleEmptyQuery(e) {
      this.activeQuery.handleEmptyQuery(this.connection);
    }
    _handleCommandComplete(e) {
      this.activeQuery.handleCommandComplete(e, this.connection);
    }
    _handleParseComplete(e) {
      this.activeQuery.name && (this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text);
    }
    _handleCopyInResponse(e) {
      this.activeQuery.handleCopyInResponse(this.connection);
    }
    _handleCopyData(e) {
      this.activeQuery.handleCopyData(
        e,
        this.connection
      );
    }
    _handleNotification(e) {
      this.emit("notification", e);
    }
    _handleNotice(e) {
      this.emit("notice", e);
    }
    getStartupConf() {
      var e = this.connectionParameters, t = { user: e.user, database: e.database }, n = e.application_name || e.fallback_application_name;
      return n && (t.application_name = n), e.replication && (t.replication = "" + e.replication), e.statement_timeout && (t.statement_timeout = String(parseInt(e.statement_timeout, 10))), e.lock_timeout && (t.lock_timeout = String(parseInt(e.lock_timeout, 10))), e.idle_in_transaction_session_timeout && (t.idle_in_transaction_session_timeout = String(parseInt(e.idle_in_transaction_session_timeout, 10))), e.options && (t.options = e.options), t;
    }
    cancel(e, t) {
      if (e.activeQuery === t) {
        var n = this.connection;
        this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
          n.cancel(
            e.processID,
            e.secretKey
          );
        });
      } else e.queryQueue.indexOf(t) !== -1 && e.queryQueue.splice(e.queryQueue.indexOf(t), 1);
    }
    setTypeParser(e, t, n) {
      return this._types.setTypeParser(e, t, n);
    }
    getTypeParser(e, t) {
      return this._types.getTypeParser(e, t);
    }
    escapeIdentifier(e) {
      return '"' + e.replace(/"/g, '""') + '"';
    }
    escapeLiteral(e) {
      for (var t = false, n = "'", i = 0; i < e.length; i++) {
        var s = e[i];
        s === "'" ? n += s + s : s === "\\" ? (n += s + s, t = true) : n += s;
      }
      return n += "'", t === true && (n = " E" + n), n;
    }
    _pulseQueryQueue() {
      if (this.readyForQuery === true) if (this.activeQuery = this.queryQueue.shift(), this.activeQuery) {
        this.readyForQuery = false, this.hasExecuted = true;
        let e = this.activeQuery.submit(this.connection);
        e && m.nextTick(() => {
          this.activeQuery.handleError(e, this.connection), this.readyForQuery = true, this._pulseQueryQueue();
        });
      } else this.hasExecuted && (this.activeQuery = null, this.emit("drain"));
    }
    query(e, t, n) {
      var i, s, o, u, c;
      if (e == null) throw new TypeError(
        "Client was passed a null or undefined query"
      );
      return typeof e.submit == "function" ? (o = e.query_timeout || this.connectionParameters.query_timeout, s = i = e, typeof t == "function" && (i.callback = i.callback || t)) : (o = this.connectionParameters.query_timeout, i = new Js(e, t, n), i.callback || (s = new this._Promise((l, f) => {
        i.callback = (y, g) => y ? f(y) : l(g);
      }))), o && (c = i.callback, u = setTimeout(() => {
        var l = new Error("Query read timeout");
        m.nextTick(
          () => {
            i.handleError(l, this.connection);
          }
        ), c(l), i.callback = () => {
        };
        var f = this.queryQueue.indexOf(i);
        f > -1 && this.queryQueue.splice(f, 1), this._pulseQueryQueue();
      }, o), i.callback = (l, f) => {
        clearTimeout(u), c(l, f);
      }), this.binary && !i.binary && (i.binary = true), i._result && !i._result._types && (i._result._types = this._types), this._queryable ? this._ending ? (m.nextTick(() => {
        i.handleError(new Error("Client was closed and is not queryable"), this.connection);
      }), s) : (this.queryQueue.push(i), this._pulseQueryQueue(), s) : (m.nextTick(() => {
        i.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
      }), s);
    }
    ref() {
      this.connection.ref();
    }
    unref() {
      this.connection.unref();
    }
    end(e) {
      if (this._ending = true, !this.connection._connecting) if (e) e();
      else return this._Promise.resolve();
      if (this.activeQuery || !this._queryable ? this.connection.stream.destroy() : this.connection.end(), e) this.connection.once("end", e);
      else return new this._Promise((t) => {
        this.connection.once("end", t);
      });
    }
  };
  a(Cn, "Client");
  var Ut = Cn;
  Ut.Query = Js;
  Xs.exports = Ut;
});
var io = T((op, no) => {
  "use strict";
  p();
  var nl = ge().EventEmitter, to = a(function() {
  }, "NOOP"), ro = a((r, e) => {
    let t = r.findIndex(e);
    return t === -1 ? void 0 : r.splice(t, 1)[0];
  }, "removeWhere"), Tn = class Tn {
    static {
      __name(this, "Tn");
    }
    constructor(e, t, n) {
      this.client = e, this.idleListener = t, this.timeoutId = n;
    }
  };
  a(Tn, "IdleItem");
  var _n = Tn, Pn = class Pn {
    static {
      __name(this, "Pn");
    }
    constructor(e) {
      this.callback = e;
    }
  };
  a(Pn, "PendingItem");
  var Qe = Pn;
  function il() {
    throw new Error("Release called on client which has already been released to the pool.");
  }
  __name(il, "il");
  a(il, "throwOnDoubleRelease");
  function Dt(r, e) {
    if (e)
      return { callback: e, result: void 0 };
    let t, n, i = a(function(o, u) {
      o ? t(o) : n(u);
    }, "cb"), s = new r(function(o, u) {
      n = o, t = u;
    }).catch((o) => {
      throw Error.captureStackTrace(o), o;
    });
    return { callback: i, result: s };
  }
  __name(Dt, "Dt");
  a(Dt, "promisify");
  function sl(r, e) {
    return a(/* @__PURE__ */ __name(function t(n) {
      n.client = e, e.removeListener("error", t), e.on("error", () => {
        r.log(
          "additional client error after disconnection due to error",
          n
        );
      }), r._remove(e), r.emit("error", n, e);
    }, "t"), "idleListener");
  }
  __name(sl, "sl");
  a(sl, "makeIdleListener");
  var Bn = class Bn extends nl {
    static {
      __name(this, "Bn");
    }
    constructor(e, t) {
      super(), this.options = Object.assign({}, e), e != null && "password" in e && Object.defineProperty(this.options, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: e.password
      }), e != null && e.ssl && e.ssl.key && Object.defineProperty(this.options.ssl, "key", { enumerable: false }), this.options.max = this.options.max || this.options.poolSize || 10, this.options.min = this.options.min || 0, this.options.maxUses = this.options.maxUses || 1 / 0, this.options.allowExitOnIdle = this.options.allowExitOnIdle || false, this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0, this.log = this.options.log || function() {
      }, this.Client = this.options.Client || t || ot().Client, this.Promise = this.options.Promise || b.Promise, typeof this.options.idleTimeoutMillis > "u" && (this.options.idleTimeoutMillis = 1e4), this._clients = [], this._idle = [], this._expired = /* @__PURE__ */ new WeakSet(), this._pendingQueue = [], this._endCallback = void 0, this.ending = false, this.ended = false;
    }
    _isFull() {
      return this._clients.length >= this.options.max;
    }
    _isAboveMin() {
      return this._clients.length > this.options.min;
    }
    _pulseQueue() {
      if (this.log("pulse queue"), this.ended) {
        this.log("pulse queue ended");
        return;
      }
      if (this.ending) {
        this.log("pulse queue on ending"), this._idle.length && this._idle.slice().map((t) => {
          this._remove(t.client);
        }), this._clients.length || (this.ended = true, this._endCallback());
        return;
      }
      if (!this._pendingQueue.length) {
        this.log("no queued requests");
        return;
      }
      if (!this._idle.length && this._isFull()) return;
      let e = this._pendingQueue.shift();
      if (this._idle.length) {
        let t = this._idle.pop();
        clearTimeout(
          t.timeoutId
        );
        let n = t.client;
        n.ref && n.ref();
        let i = t.idleListener;
        return this._acquireClient(n, e, i, false);
      }
      if (!this._isFull()) return this.newClient(e);
      throw new Error("unexpected condition");
    }
    _remove(e) {
      let t = ro(
        this._idle,
        (n) => n.client === e
      );
      t !== void 0 && clearTimeout(t.timeoutId), this._clients = this._clients.filter(
        (n) => n !== e
      ), e.end(), this.emit("remove", e);
    }
    connect(e) {
      if (this.ending) {
        let i = new Error("Cannot use a pool after calling end on the pool");
        return e ? e(i) : this.Promise.reject(i);
      }
      let t = Dt(this.Promise, e), n = t.result;
      if (this._isFull() || this._idle.length) {
        if (this._idle.length && m.nextTick(() => this._pulseQueue()), !this.options.connectionTimeoutMillis) return this._pendingQueue.push(new Qe(t.callback)), n;
        let i = a((u, c, l) => {
          clearTimeout(o), t.callback(u, c, l);
        }, "queueCallback"), s = new Qe(i), o = setTimeout(() => {
          ro(
            this._pendingQueue,
            (u) => u.callback === i
          ), s.timedOut = true, t.callback(new Error("timeout exceeded when trying to connect"));
        }, this.options.connectionTimeoutMillis);
        return o.unref && o.unref(), this._pendingQueue.push(s), n;
      }
      return this.newClient(new Qe(t.callback)), n;
    }
    newClient(e) {
      let t = new this.Client(this.options);
      this._clients.push(
        t
      );
      let n = sl(this, t);
      this.log("checking client timeout");
      let i, s = false;
      this.options.connectionTimeoutMillis && (i = setTimeout(() => {
        this.log("ending client due to timeout"), s = true, t.connection ? t.connection.stream.destroy() : t.end();
      }, this.options.connectionTimeoutMillis)), this.log("connecting new client"), t.connect((o) => {
        if (i && clearTimeout(i), t.on("error", n), o) this.log("client failed to connect", o), this._clients = this._clients.filter((u) => u !== t), s && (o = new Error("Connection terminated due to connection timeout", { cause: o })), this._pulseQueue(), e.timedOut || e.callback(o, void 0, to);
        else {
          if (this.log("new client connected"), this.options.maxLifetimeSeconds !== 0) {
            let u = setTimeout(() => {
              this.log("ending client due to expired lifetime"), this._expired.add(t), this._idle.findIndex((l) => l.client === t) !== -1 && this._acquireClient(
                t,
                new Qe((l, f, y) => y()),
                n,
                false
              );
            }, this.options.maxLifetimeSeconds * 1e3);
            u.unref(), t.once("end", () => clearTimeout(u));
          }
          return this._acquireClient(t, e, n, true);
        }
      });
    }
    _acquireClient(e, t, n, i) {
      i && this.emit("connect", e), this.emit("acquire", e), e.release = this._releaseOnce(e, n), e.removeListener("error", n), t.timedOut ? i && this.options.verify ? this.options.verify(e, e.release) : e.release() : i && this.options.verify ? this.options.verify(e, (s) => {
        if (s) return e.release(s), t.callback(s, void 0, to);
        t.callback(void 0, e, e.release);
      }) : t.callback(void 0, e, e.release);
    }
    _releaseOnce(e, t) {
      let n = false;
      return (i) => {
        n && il(), n = true, this._release(e, t, i);
      };
    }
    _release(e, t, n) {
      if (e.on("error", t), e._poolUseCount = (e._poolUseCount || 0) + 1, this.emit("release", n, e), n || this.ending || !e._queryable || e._ending || e._poolUseCount >= this.options.maxUses) {
        e._poolUseCount >= this.options.maxUses && this.log("remove expended client"), this._remove(e), this._pulseQueue();
        return;
      }
      if (this._expired.has(e)) {
        this.log("remove expired client"), this._expired.delete(e), this._remove(e), this._pulseQueue();
        return;
      }
      let s;
      this.options.idleTimeoutMillis && this._isAboveMin() && (s = setTimeout(() => {
        this.log("remove idle client"), this._remove(e);
      }, this.options.idleTimeoutMillis), this.options.allowExitOnIdle && s.unref()), this.options.allowExitOnIdle && e.unref(), this._idle.push(new _n(
        e,
        t,
        s
      )), this._pulseQueue();
    }
    query(e, t, n) {
      if (typeof e == "function") {
        let s = Dt(this.Promise, e);
        return v(function() {
          return s.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
        }), s.result;
      }
      typeof t == "function" && (n = t, t = void 0);
      let i = Dt(this.Promise, n);
      return n = i.callback, this.connect((s, o) => {
        if (s) return n(s);
        let u = false, c = a((l) => {
          u || (u = true, o.release(l), n(l));
        }, "onError");
        o.once("error", c), this.log("dispatching query");
        try {
          o.query(e, t, (l, f) => {
            if (this.log("query dispatched"), o.removeListener(
              "error",
              c
            ), !u) return u = true, o.release(l), l ? n(l) : n(void 0, f);
          });
        } catch (l) {
          return o.release(l), n(l);
        }
      }), i.result;
    }
    end(e) {
      if (this.log("ending"), this.ending) {
        let n = new Error("Called end on pool more than once");
        return e ? e(n) : this.Promise.reject(n);
      }
      this.ending = true;
      let t = Dt(this.Promise, e);
      return this._endCallback = t.callback, this._pulseQueue(), t.result;
    }
    get waitingCount() {
      return this._pendingQueue.length;
    }
    get idleCount() {
      return this._idle.length;
    }
    get expiredCount() {
      return this._clients.reduce((e, t) => e + (this._expired.has(t) ? 1 : 0), 0);
    }
    get totalCount() {
      return this._clients.length;
    }
  };
  a(Bn, "Pool");
  var In = Bn;
  no.exports = In;
});
var so = {};
ie(so, { default: /* @__PURE__ */ __name(() => ol, "default") });
var ol;
var oo = G(() => {
  "use strict";
  p();
  ol = {};
});
var ao = T((lp, al) => {
  al.exports = { name: "pg", version: "8.8.0", description: "PostgreSQL client - pure javascript & libpq with the same API", keywords: [
    "database",
    "libpq",
    "pg",
    "postgre",
    "postgres",
    "postgresql",
    "rdbms"
  ], homepage: "https://github.com/brianc/node-postgres", repository: { type: "git", url: "git://github.com/brianc/node-postgres.git", directory: "packages/pg" }, author: "Brian Carlson <brian.m.carlson@gmail.com>", main: "./lib", dependencies: { "buffer-writer": "2.0.0", "packet-reader": "1.0.0", "pg-connection-string": "^2.5.0", "pg-pool": "^3.5.2", "pg-protocol": "^1.5.0", "pg-types": "^2.1.0", pgpass: "1.x" }, devDependencies: {
    async: "2.6.4",
    bluebird: "3.5.2",
    co: "4.6.0",
    "pg-copy-streams": "0.3.0"
  }, peerDependencies: { "pg-native": ">=3.0.1" }, peerDependenciesMeta: { "pg-native": { optional: true } }, scripts: { test: "make test-all" }, files: ["lib", "SPONSORS.md"], license: "MIT", engines: { node: ">= 8.0.0" }, gitHead: "c99fb2c127ddf8d712500db2c7b9a5491a178655" };
});
var lo = T((fp, co) => {
  "use strict";
  p();
  var uo = ge().EventEmitter, ul = (it(), O(nt)), Rn = rt(), Ne = co.exports = function(r, e, t) {
    uo.call(this), r = Rn.normalizeQueryConfig(r, e, t), this.text = r.text, this.values = r.values, this.name = r.name, this.callback = r.callback, this.state = "new", this._arrayMode = r.rowMode === "array", this._emitRowEvents = false, this.on("newListener", function(n) {
      n === "row" && (this._emitRowEvents = true);
    }.bind(this));
  };
  ul.inherits(Ne, uo);
  var cl = { sqlState: "code", statementPosition: "position", messagePrimary: "message", context: "where", schemaName: "schema", tableName: "table", columnName: "column", dataTypeName: "dataType", constraintName: "constraint", sourceFile: "file", sourceLine: "line", sourceFunction: "routine" };
  Ne.prototype.handleError = function(r) {
    var e = this.native.pq.resultErrorFields();
    if (e) for (var t in e) {
      var n = cl[t] || t;
      r[n] = e[t];
    }
    this.callback ? this.callback(r) : this.emit("error", r), this.state = "error";
  };
  Ne.prototype.then = function(r, e) {
    return this._getPromise().then(
      r,
      e
    );
  };
  Ne.prototype.catch = function(r) {
    return this._getPromise().catch(r);
  };
  Ne.prototype._getPromise = function() {
    return this._promise ? this._promise : (this._promise = new Promise(function(r, e) {
      this._once("end", r), this._once("error", e);
    }.bind(this)), this._promise);
  };
  Ne.prototype.submit = function(r) {
    this.state = "running";
    var e = this;
    this.native = r.native, r.native.arrayMode = this._arrayMode;
    var t = a(function(s, o, u) {
      if (r.native.arrayMode = false, v(function() {
        e.emit("_done");
      }), s) return e.handleError(s);
      e._emitRowEvents && (u.length > 1 ? o.forEach(
        (c, l) => {
          c.forEach((f) => {
            e.emit("row", f, u[l]);
          });
        }
      ) : o.forEach(function(c) {
        e.emit("row", c, u);
      })), e.state = "end", e.emit("end", u), e.callback && e.callback(null, u);
    }, "after");
    if (m.domain && (t = m.domain.bind(t)), this.name) {
      this.name.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", this.name, this.name.length), console.error("This can cause conflicts and silent errors executing queries"));
      var n = (this.values || []).map(Rn.prepareValue);
      if (r.namedQueries[this.name]) {
        if (this.text && r.namedQueries[this.name] !== this.text) {
          let s = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
          return t(s);
        }
        return r.native.execute(this.name, n, t);
      }
      return r.native.prepare(this.name, this.text, n.length, function(s) {
        return s ? t(s) : (r.namedQueries[e.name] = e.text, e.native.execute(e.name, n, t));
      });
    } else if (this.values) {
      if (!Array.isArray(
        this.values
      )) {
        let s = new Error("Query values must be an array");
        return t(s);
      }
      var i = this.values.map(Rn.prepareValue);
      r.native.query(this.text, i, t);
    } else r.native.query(this.text, t);
  };
});
var yo = T((yp, po) => {
  "use strict";
  p();
  var ll = (oo(), O(so)), fl = At(), dp = ao(), fo = ge().EventEmitter, hl = (it(), O(nt)), pl = Bt(), ho = lo(), K = po.exports = function(r) {
    fo.call(this), r = r || {}, this._Promise = r.Promise || b.Promise, this._types = new fl(r.types), this.native = new ll({ types: this._types }), this._queryQueue = [], this._ending = false, this._connecting = false, this._connected = false, this._queryable = true;
    var e = this.connectionParameters = new pl(r);
    this.user = e.user, Object.defineProperty(this, "password", { configurable: true, enumerable: false, writable: true, value: e.password }), this.database = e.database, this.host = e.host, this.port = e.port, this.namedQueries = {};
  };
  K.Query = ho;
  hl.inherits(K, fo);
  K.prototype._errorAllQueries = function(r) {
    let e = a((t) => {
      m.nextTick(() => {
        t.native = this.native, t.handleError(r);
      });
    }, "enqueueError");
    this._hasActiveQuery() && (e(this._activeQuery), this._activeQuery = null), this._queryQueue.forEach(e), this._queryQueue.length = 0;
  };
  K.prototype._connect = function(r) {
    var e = this;
    if (this._connecting) {
      m.nextTick(() => r(new Error("Client has already been connected. You cannot reuse a client.")));
      return;
    }
    this._connecting = true, this.connectionParameters.getLibpqConnectionString(function(t, n) {
      if (t) return r(t);
      e.native.connect(n, function(i) {
        if (i) return e.native.end(), r(i);
        e._connected = true, e.native.on("error", function(s) {
          e._queryable = false, e._errorAllQueries(s), e.emit("error", s);
        }), e.native.on("notification", function(s) {
          e.emit("notification", { channel: s.relname, payload: s.extra });
        }), e.emit("connect"), e._pulseQueryQueue(true), r();
      });
    });
  };
  K.prototype.connect = function(r) {
    if (r) {
      this._connect(r);
      return;
    }
    return new this._Promise((e, t) => {
      this._connect((n) => {
        n ? t(n) : e();
      });
    });
  };
  K.prototype.query = function(r, e, t) {
    var n, i, s, o, u;
    if (r == null) throw new TypeError("Client was passed a null or undefined query");
    if (typeof r.submit == "function") s = r.query_timeout || this.connectionParameters.query_timeout, i = n = r, typeof e == "function" && (r.callback = e);
    else if (s = this.connectionParameters.query_timeout, n = new ho(r, e, t), !n.callback) {
      let c, l;
      i = new this._Promise((f, y) => {
        c = f, l = y;
      }), n.callback = (f, y) => f ? l(f) : c(y);
    }
    return s && (u = n.callback, o = setTimeout(() => {
      var c = new Error(
        "Query read timeout"
      );
      m.nextTick(() => {
        n.handleError(c, this.connection);
      }), u(c), n.callback = () => {
      };
      var l = this._queryQueue.indexOf(n);
      l > -1 && this._queryQueue.splice(l, 1), this._pulseQueryQueue();
    }, s), n.callback = (c, l) => {
      clearTimeout(o), u(c, l);
    }), this._queryable ? this._ending ? (n.native = this.native, m.nextTick(() => {
      n.handleError(
        new Error("Client was closed and is not queryable")
      );
    }), i) : (this._queryQueue.push(n), this._pulseQueryQueue(), i) : (n.native = this.native, m.nextTick(() => {
      n.handleError(new Error("Client has encountered a connection error and is not queryable"));
    }), i);
  };
  K.prototype.end = function(r) {
    var e = this;
    this._ending = true, this._connected || this.once("connect", this.end.bind(this, r));
    var t;
    return r || (t = new this._Promise(function(n, i) {
      r = a((s) => s ? i(s) : n(), "cb");
    })), this.native.end(function() {
      e._errorAllQueries(new Error("Connection terminated")), m.nextTick(() => {
        e.emit("end"), r && r();
      });
    }), t;
  };
  K.prototype._hasActiveQuery = function() {
    return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
  };
  K.prototype._pulseQueryQueue = function(r) {
    if (this._connected && !this._hasActiveQuery()) {
      var e = this._queryQueue.shift();
      if (!e) {
        r || this.emit("drain");
        return;
      }
      this._activeQuery = e, e.submit(this);
      var t = this;
      e.once("_done", function() {
        t._pulseQueryQueue();
      });
    }
  };
  K.prototype.cancel = function(r) {
    this._activeQuery === r ? this.native.cancel(function() {
    }) : this._queryQueue.indexOf(r) !== -1 && this._queryQueue.splice(this._queryQueue.indexOf(r), 1);
  };
  K.prototype.ref = function() {
  };
  K.prototype.unref = function() {
  };
  K.prototype.setTypeParser = function(r, e, t) {
    return this._types.setTypeParser(
      r,
      e,
      t
    );
  };
  K.prototype.getTypeParser = function(r, e) {
    return this._types.getTypeParser(r, e);
  };
});
var Ln = T((gp, mo) => {
  "use strict";
  p();
  mo.exports = yo();
});
var ot = T((vp, at) => {
  "use strict";
  p();
  var dl = eo(), yl = tt(), ml = En(), wl = io(), { DatabaseError: gl } = vn(), bl = a(
    (r) => {
      var e;
      return e = class extends wl {
        static {
          __name(this, "e");
        }
        constructor(n) {
          super(n, r);
        }
      }, a(e, "BoundPool"), e;
    },
    "poolFactory"
  ), Fn = a(
    function(r) {
      this.defaults = yl, this.Client = r, this.Query = this.Client.Query, this.Pool = bl(this.Client), this._pools = [], this.Connection = ml, this.types = Je(), this.DatabaseError = gl;
    },
    "PG"
  );
  typeof m.env.NODE_PG_FORCE_NATIVE < "u" ? at.exports = new Fn(Ln()) : (at.exports = new Fn(dl), Object.defineProperty(at.exports, "native", {
    configurable: true,
    enumerable: false,
    get() {
      var r = null;
      try {
        r = new Fn(Ln());
      } catch (e) {
        if (e.code !== "MODULE_NOT_FOUND") throw e;
      }
      return Object.defineProperty(at.exports, "native", { value: r }), r;
    }
  }));
});
p();
p();
Fe();
Zt();
p();
var pa = Object.defineProperty;
var da = Object.defineProperties;
var ya = Object.getOwnPropertyDescriptors;
var bi = Object.getOwnPropertySymbols;
var ma = Object.prototype.hasOwnProperty;
var wa = Object.prototype.propertyIsEnumerable;
var vi = a(
  (r, e, t) => e in r ? pa(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t,
  "__defNormalProp"
);
var ga = a((r, e) => {
  for (var t in e || (e = {})) ma.call(e, t) && vi(r, t, e[t]);
  if (bi) for (var t of bi(e)) wa.call(e, t) && vi(r, t, e[t]);
  return r;
}, "__spreadValues");
var ba = a((r, e) => da(r, ya(e)), "__spreadProps");
var va = 1008e3;
var xi = new Uint8Array(
  new Uint16Array([258]).buffer
)[0] === 2;
var xa = new TextDecoder();
var Jt = new TextEncoder();
var yt = Jt.encode("0123456789abcdef");
var mt = Jt.encode("0123456789ABCDEF");
var Sa = Jt.encode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
var Si = Sa.slice();
Si[62] = 45;
Si[63] = 95;
var He;
var wt;
function Ea(r, { alphabet: e, scratchArr: t } = {}) {
  if (!He) if (He = new Uint16Array(256), wt = new Uint16Array(256), xi) for (let C = 0; C < 256; C++) He[C] = yt[C & 15] << 8 | yt[C >>> 4], wt[C] = mt[C & 15] << 8 | mt[C >>> 4];
  else for (let C = 0; C < 256; C++) He[C] = yt[C & 15] | yt[C >>> 4] << 8, wt[C] = mt[C & 15] | mt[C >>> 4] << 8;
  r.byteOffset % 4 !== 0 && (r = new Uint8Array(r));
  let n = r.length, i = n >>> 1, s = n >>> 2, o = t || new Uint16Array(n), u = new Uint32Array(
    r.buffer,
    r.byteOffset,
    s
  ), c = new Uint32Array(o.buffer, o.byteOffset, i), l = e === "upper" ? wt : He, f = 0, y = 0, g;
  if (xi)
    for (; f < s; ) g = u[f++], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255];
  else for (; f < s; )
    g = u[f++], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255];
  for (f <<= 2; f < n; ) o[f] = l[r[f++]];
  return xa.decode(o.subarray(0, n));
}
__name(Ea, "Ea");
a(Ea, "_toHex");
function Aa(r, e = {}) {
  let t = "", n = r.length, i = va >>> 1, s = Math.ceil(n / i), o = new Uint16Array(s > 1 ? i : n);
  for (let u = 0; u < s; u++) {
    let c = u * i, l = c + i;
    t += Ea(r.subarray(c, l), ba(ga(
      {},
      e
    ), { scratchArr: o }));
  }
  return t;
}
__name(Aa, "Aa");
a(Aa, "_toHexChunked");
function Ei(r, e = {}) {
  return e.alphabet !== "upper" && typeof r.toHex == "function" ? r.toHex() : Aa(r, e);
}
__name(Ei, "Ei");
a(Ei, "toHex");
p();
var gt = class gt2 {
  static {
    __name(this, "gt");
  }
  constructor(e, t) {
    this.strings = e;
    this.values = t;
  }
  toParameterizedQuery(e = { query: "", params: [] }) {
    let { strings: t, values: n } = this;
    for (let i = 0, s = t.length; i < s; i++) if (e.query += t[i], i < n.length) {
      let o = n[i];
      if (o instanceof Ge) e.query += o.sql;
      else if (o instanceof Ce) if (o.queryData instanceof gt2) o.queryData.toParameterizedQuery(
        e
      );
      else {
        if (o.queryData.params?.length) throw new Error("This query is not composable");
        e.query += o.queryData.query;
      }
      else {
        let { params: u } = e;
        u.push(o), e.query += "$" + u.length, (o instanceof d || ArrayBuffer.isView(o)) && (e.query += "::bytea");
      }
    }
    return e;
  }
};
a(gt, "SqlTemplate");
var $e = gt;
var Xt = class Xt2 {
  static {
    __name(this, "Xt");
  }
  constructor(e) {
    this.sql = e;
  }
};
a(Xt, "UnsafeRawSql");
var Ge = Xt;
p();
function bt() {
  typeof window < "u" && typeof document < "u" && typeof console < "u" && typeof console.warn == "function" && console.warn(`          
        ************************************************************
        *                                                          *
        *  WARNING: Running SQL directly from the browser can have *
        *  security implications. Even if your database is         *
        *  protected by Row-Level Security (RLS), use it at your   *
        *  own risk. This approach is great for fast prototyping,  *
        *  but ensure proper safeguards are in place to prevent    *
        *  misuse or execution of expensive SQL queries by your    *
        *  end users.                                              *
        *                                                          *
        *  If you've assessed the risks, suppress this message     *
        *  using the disableWarningInBrowsers configuration        *
        *  parameter.                                              *
        *                                                          *
        ************************************************************`);
}
__name(bt, "bt");
a(bt, "warnIfBrowser");
Fe();
var as = Se(At());
var us = Se(rt());
var _t = class _t2 extends Error {
  static {
    __name(this, "_t");
  }
  constructor(t) {
    super(t);
    E(this, "name", "NeonDbError");
    E(this, "severity");
    E(this, "code");
    E(this, "detail");
    E(this, "hint");
    E(this, "position");
    E(this, "internalPosition");
    E(
      this,
      "internalQuery"
    );
    E(this, "where");
    E(this, "schema");
    E(this, "table");
    E(this, "column");
    E(this, "dataType");
    E(this, "constraint");
    E(this, "file");
    E(this, "line");
    E(this, "routine");
    E(this, "sourceError");
    "captureStackTrace" in Error && typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, _t2);
  }
};
a(
  _t,
  "NeonDbError"
);
var be = _t;
var is = "transaction() expects an array of queries, or a function returning an array of queries";
var Ru = ["severity", "code", "detail", "hint", "position", "internalPosition", "internalQuery", "where", "schema", "table", "column", "dataType", "constraint", "file", "line", "routine"];
function Lu(r) {
  return r instanceof d ? "\\x" + Ei(r) : r;
}
__name(Lu, "Lu");
a(Lu, "encodeBuffersAsBytea");
function ss(r) {
  let { query: e, params: t } = r instanceof $e ? r.toParameterizedQuery() : r;
  return { query: e, params: t.map((n) => Lu((0, us.prepareValue)(n))) };
}
__name(ss, "ss");
a(ss, "prepareQuery");
function cs(r, {
  arrayMode: e,
  fullResults: t,
  fetchOptions: n,
  isolationLevel: i,
  readOnly: s,
  deferrable: o,
  authToken: u,
  disableWarningInBrowsers: c
} = {}) {
  if (!r) throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
  let l;
  try {
    l = Yt(r);
  } catch {
    throw new Error(
      "Database connection string provided to `neon()` is not a valid URL. Connection string: " + String(r)
    );
  }
  let { protocol: f, username: y, hostname: g, port: A, pathname: C } = l;
  if (f !== "postgres:" && f !== "postgresql:" || !y || !g || !C) throw new Error("Database connection string format for `neon()` should be: postgresql://user:password@host.tld/dbname?option=value");
  function D(P, ...I) {
    if (!(Array.isArray(P) && Array.isArray(P.raw) && Array.isArray(I))) throw new Error('This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).');
    return new Ce(
      Y,
      new $e(P, I)
    );
  }
  __name(D, "D");
  a(D, "templateFn"), D.query = (P, I, w) => new Ce(Y, { query: P, params: I ?? [] }, w), D.unsafe = (P) => new Ge(
    P
  ), D.transaction = async (P, I) => {
    if (typeof P == "function" && (P = P(D)), !Array.isArray(P)) throw new Error(is);
    P.forEach((W) => {
      if (!(W instanceof Ce)) throw new Error(is);
    });
    let w = P.map((W) => W.queryData), Z = P.map((W) => W.opts ?? {});
    return Y(w, Z, I);
  };
  async function Y(P, I, w) {
    let { fetchEndpoint: Z, fetchFunction: W } = ce, J = Array.isArray(
      P
    ) ? { queries: P.map((ee) => ss(ee)) } : ss(P), X = n ?? {}, se = e ?? false, oe = t ?? false, R = i, j = s, le = o;
    w !== void 0 && (w.fetchOptions !== void 0 && (X = { ...X, ...w.fetchOptions }), w.arrayMode !== void 0 && (se = w.arrayMode), w.fullResults !== void 0 && (oe = w.fullResults), w.isolationLevel !== void 0 && (R = w.isolationLevel), w.readOnly !== void 0 && (j = w.readOnly), w.deferrable !== void 0 && (le = w.deferrable)), I !== void 0 && !Array.isArray(I) && I.fetchOptions !== void 0 && (X = { ...X, ...I.fetchOptions });
    let de = u;
    !Array.isArray(I) && I?.authToken !== void 0 && (de = I.authToken);
    let We = typeof Z == "function" ? Z(g, A, { jwtAuth: de !== void 0 }) : Z, fe = { "Neon-Connection-String": r, "Neon-Raw-Text-Output": "true", "Neon-Array-Mode": "true" }, _e = await Fu(de);
    _e && (fe.Authorization = `Bearer ${_e}`), Array.isArray(P) && (R !== void 0 && (fe["Neon-Batch-Isolation-Level"] = R), j !== void 0 && (fe["Neon-Batch-Read-Only"] = String(j)), le !== void 0 && (fe["Neon-Batch-Deferrable"] = String(le))), c || ce.disableWarningInBrowsers || bt();
    let ye;
    try {
      ye = await (W ?? fetch)(We, { method: "POST", body: JSON.stringify(J), headers: fe, ...X });
    } catch (ee) {
      let M = new be(
        `Error connecting to database: ${ee}`
      );
      throw M.sourceError = ee, M;
    }
    if (ye.ok) {
      let ee = await ye.json();
      if (Array.isArray(P)) {
        let M = ee.results;
        if (!Array.isArray(M)) throw new be("Neon internal error: unexpected result format");
        return M.map(($2, me) => {
          let Ot = I[me] ?? {}, vo = Ot.arrayMode ?? se, xo = Ot.fullResults ?? oe;
          return os(
            $2,
            { arrayMode: vo, fullResults: xo, types: Ot.types }
          );
        });
      } else {
        let M = I ?? {}, $2 = M.arrayMode ?? se, me = M.fullResults ?? oe;
        return os(ee, { arrayMode: $2, fullResults: me, types: M.types });
      }
    } else {
      let { status: ee } = ye;
      if (ee === 400) {
        let M = await ye.json(), $2 = new be(M.message);
        for (let me of Ru) $2[me] = M[me] ?? void 0;
        throw $2;
      } else {
        let M = await ye.text();
        throw new be(
          `Server error (HTTP status ${ee}): ${M}`
        );
      }
    }
  }
  __name(Y, "Y");
  return a(Y, "execute"), D;
}
__name(cs, "cs");
a(cs, "neon");
var dr = class dr2 {
  static {
    __name(this, "dr");
  }
  constructor(e, t, n) {
    this.execute = e;
    this.queryData = t;
    this.opts = n;
  }
  then(e, t) {
    return this.execute(this.queryData, this.opts).then(e, t);
  }
  catch(e) {
    return this.execute(this.queryData, this.opts).catch(e);
  }
  finally(e) {
    return this.execute(
      this.queryData,
      this.opts
    ).finally(e);
  }
};
a(dr, "NeonQueryPromise");
var Ce = dr;
function os(r, {
  arrayMode: e,
  fullResults: t,
  types: n
}) {
  let i = new as.default(n), s = r.fields.map((c) => c.name), o = r.fields.map((c) => i.getTypeParser(
    c.dataTypeID
  )), u = e === true ? r.rows.map((c) => c.map((l, f) => l === null ? null : o[f](l))) : r.rows.map((c) => Object.fromEntries(
    c.map((l, f) => [s[f], l === null ? null : o[f](l)])
  ));
  return t ? (r.viaNeonFetch = true, r.rowAsArray = e, r.rows = u, r._parsers = o, r._types = i, r) : u;
}
__name(os, "os");
a(os, "processQueryResult");
async function Fu(r) {
  if (typeof r == "string") return r;
  if (typeof r == "function") try {
    return await Promise.resolve(r());
  } catch (e) {
    let t = new be("Error getting auth token.");
    throw e instanceof Error && (t = new be(`Error getting auth token: ${e.message}`)), t;
  }
}
__name(Fu, "Fu");
a(Fu, "getAuthToken");
p();
var go = Se(ot());
p();
var wo = Se(ot());
var kn = class kn2 extends wo.Client {
  static {
    __name(this, "kn");
  }
  constructor(t) {
    super(t);
    this.config = t;
  }
  get neonConfig() {
    return this.connection.stream;
  }
  connect(t) {
    let { neonConfig: n } = this;
    n.forceDisablePgSSL && (this.ssl = this.connection.ssl = false), this.ssl && n.useSecureWebSocket && console.warn("SSL is enabled for both Postgres (e.g. ?sslmode=require in the connection string + forceDisablePgSSL = false) and the WebSocket tunnel (useSecureWebSocket = true). Double encryption will increase latency and CPU usage. It may be appropriate to disable SSL in the Postgres connection parameters or set forceDisablePgSSL = true.");
    let i = typeof this.config != "string" && this.config?.host !== void 0 || typeof this.config != "string" && this.config?.connectionString !== void 0 || m.env.PGHOST !== void 0, s = m.env.USER ?? m.env.USERNAME;
    if (!i && this.host === "localhost" && this.user === s && this.database === s && this.password === null) throw new Error(`No database host or connection string was set, and key parameters have default values (host: localhost, user: ${s}, db: ${s}, password: null). Is an environment variable missing? Alternatively, if you intended to connect with these parameters, please set the host to 'localhost' explicitly.`);
    let o = super.connect(t), u = n.pipelineTLS && this.ssl, c = n.pipelineConnect === "password";
    if (!u && !n.pipelineConnect) return o;
    let l = this.connection;
    if (u && l.on(
      "connect",
      () => l.stream.emit("data", "S")
    ), c) {
      l.removeAllListeners("authenticationCleartextPassword"), l.removeAllListeners("readyForQuery"), l.once("readyForQuery", () => l.on("readyForQuery", this._handleReadyForQuery.bind(this)));
      let f = this.ssl ? "sslconnect" : "connect";
      l.on(f, () => {
        this.neonConfig.disableWarningInBrowsers || bt(), this._handleAuthCleartextPassword(), this._handleReadyForQuery();
      });
    }
    return o;
  }
  async _handleAuthSASLContinue(t) {
    if (typeof crypto > "u" || crypto.subtle === void 0 || crypto.subtle.importKey === void 0) throw new Error("Cannot use SASL auth when `crypto.subtle` is not defined");
    let n = crypto.subtle, i = this.saslSession, s = this.password, o = t.data;
    if (i.message !== "SASLInitialResponse" || typeof s != "string" || typeof o != "string") throw new Error(
      "SASL: protocol error"
    );
    let u = Object.fromEntries(o.split(",").map((M) => {
      if (!/^.=/.test(M)) throw new Error(
        "SASL: Invalid attribute pair entry"
      );
      let $2 = M[0], me = M.substring(2);
      return [$2, me];
    })), c = u.r, l = u.s, f = u.i;
    if (!c || !/^[!-+--~]+$/.test(c)) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing/unprintable");
    if (!l || !/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(l)) throw new Error(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing/not base64"
    );
    if (!f || !/^[1-9][0-9]*$/.test(f)) throw new Error(
      "SASL: SCRAM-SERVER-FIRST-MESSAGE: missing/invalid iteration count"
    );
    if (!c.startsWith(i.clientNonce))
      throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
    if (c.length === i.clientNonce.length) throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
    let y = parseInt(f, 10), g = d.from(l, "base64"), A = new TextEncoder(), C = A.encode(s), D = await n.importKey(
      "raw",
      C,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), Y = new Uint8Array(await n.sign("HMAC", D, d.concat(
      [g, d.from([0, 0, 0, 1])]
    ))), P = Y;
    for (var I = 0; I < y - 1; I++) Y = new Uint8Array(await n.sign("HMAC", D, Y)), P = d.from(
      P.map((M, $2) => P[$2] ^ Y[$2])
    );
    let w = P, Z = await n.importKey(
      "raw",
      w,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), W = new Uint8Array(await n.sign("HMAC", Z, A.encode("Client Key"))), J = await n.digest(
      "SHA-256",
      W
    ), X = "n=*,r=" + i.clientNonce, se = "r=" + c + ",s=" + l + ",i=" + y, oe = "c=biws,r=" + c, R = X + "," + se + "," + oe, j = await n.importKey(
      "raw",
      J,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );
    var le = new Uint8Array(await n.sign(
      "HMAC",
      j,
      A.encode(R)
    )), de = d.from(W.map((M, $2) => W[$2] ^ le[$2])), We = de.toString("base64");
    let fe = await n.importKey(
      "raw",
      w,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    ), _e = await n.sign("HMAC", fe, A.encode("Server Key")), ye = await n.importKey("raw", _e, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
    var ee = d.from(
      await n.sign("HMAC", ye, A.encode(R))
    );
    i.message = "SASLResponse", i.serverSignature = ee.toString("base64"), i.response = oe + ",p=" + We, this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
  }
};
a(
  kn,
  "NeonClient"
);
var ut = kn;
Fe();
var bo = Se(Bt());
function vl(r, e) {
  if (e) return { callback: e, result: void 0 };
  let t, n, i = a(function(o, u) {
    o ? t(o) : n(u);
  }, "cb"), s = new r(function(o, u) {
    n = o, t = u;
  });
  return { callback: i, result: s };
}
__name(vl, "vl");
a(vl, "promisify");
var Un = class Un2 extends go.Pool {
  static {
    __name(this, "Un");
  }
  constructor() {
    super(...arguments);
    E(this, "Client", ut);
    E(this, "hasFetchUnsupportedListeners", false);
    E(this, "addListener", this.on);
  }
  on(t, n) {
    return t !== "error" && (this.hasFetchUnsupportedListeners = true), super.on(t, n);
  }
  query(t, n, i) {
    if (!ce.poolQueryViaFetch || this.hasFetchUnsupportedListeners || typeof t == "function") return super.query(
      t,
      n,
      i
    );
    typeof n == "function" && (i = n, n = void 0);
    let s = vl(this.Promise, i);
    i = s.callback;
    try {
      let o = new bo.default(
        this.options
      ), u = encodeURIComponent, c = encodeURI, l = `postgresql://${u(o.user)}:${u(o.password)}@${u(o.host)}/${c(o.database)}`, f = typeof t == "string" ? t : t.text, y = n ?? t.values ?? [];
      cs(l, { fullResults: true, arrayMode: t.rowMode === "array" }).query(f, y, { types: t.types ?? this.options?.types }).then((A) => i(void 0, A)).catch((A) => i(
        A
      ));
    } catch (o) {
      i(o);
    }
    return s.result;
  }
};
a(Un, "NeonPool");
var Mn = Un;
Fe();
var ct = Se(ot());
var export_DatabaseError = ct.DatabaseError;
var export_defaults = ct.defaults;
var export_escapeIdentifier = ct.escapeIdentifier;
var export_escapeLiteral = ct.escapeLiteral;
var export_types = ct.types;

// node_modules/.pnpm/@prisma+driver-adapter-utils@6.19.2/node_modules/@prisma/driver-adapter-utils/dist/index.mjs
init_esm();

// node_modules/.pnpm/@prisma+debug@6.19.2/node_modules/@prisma/debug/dist/index.mjs
init_esm();
var __defProp = Object.defineProperty;
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
}, "__export");
var colors_exports = {};
__export(colors_exports, {
  $: /* @__PURE__ */ __name(() => $, "$"),
  bgBlack: /* @__PURE__ */ __name(() => bgBlack, "bgBlack"),
  bgBlue: /* @__PURE__ */ __name(() => bgBlue, "bgBlue"),
  bgCyan: /* @__PURE__ */ __name(() => bgCyan, "bgCyan"),
  bgGreen: /* @__PURE__ */ __name(() => bgGreen, "bgGreen"),
  bgMagenta: /* @__PURE__ */ __name(() => bgMagenta, "bgMagenta"),
  bgRed: /* @__PURE__ */ __name(() => bgRed, "bgRed"),
  bgWhite: /* @__PURE__ */ __name(() => bgWhite, "bgWhite"),
  bgYellow: /* @__PURE__ */ __name(() => bgYellow, "bgYellow"),
  black: /* @__PURE__ */ __name(() => black, "black"),
  blue: /* @__PURE__ */ __name(() => blue, "blue"),
  bold: /* @__PURE__ */ __name(() => bold, "bold"),
  cyan: /* @__PURE__ */ __name(() => cyan, "cyan"),
  dim: /* @__PURE__ */ __name(() => dim, "dim"),
  gray: /* @__PURE__ */ __name(() => gray, "gray"),
  green: /* @__PURE__ */ __name(() => green, "green"),
  grey: /* @__PURE__ */ __name(() => grey, "grey"),
  hidden: /* @__PURE__ */ __name(() => hidden, "hidden"),
  inverse: /* @__PURE__ */ __name(() => inverse, "inverse"),
  italic: /* @__PURE__ */ __name(() => italic, "italic"),
  magenta: /* @__PURE__ */ __name(() => magenta, "magenta"),
  red: /* @__PURE__ */ __name(() => red, "red"),
  reset: /* @__PURE__ */ __name(() => reset, "reset"),
  strikethrough: /* @__PURE__ */ __name(() => strikethrough, "strikethrough"),
  underline: /* @__PURE__ */ __name(() => underline, "underline"),
  white: /* @__PURE__ */ __name(() => white, "white"),
  yellow: /* @__PURE__ */ __name(() => yellow, "yellow")
});
var FORCE_COLOR;
var NODE_DISABLE_COLORS;
var NO_COLOR;
var TERM;
var isTTY = true;
if (typeof process !== "undefined") {
  ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
  isTTY = process.stdout && process.stdout.isTTY;
}
var $ = {
  enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
};
function init(x2, y) {
  let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
  let open = `\x1B[${x2}m`, close = `\x1B[${y}m`;
  return function(txt) {
    if (!$.enabled || txt == null) return txt;
    return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
  };
}
__name(init, "init");
var reset = init(0, 0);
var bold = init(1, 22);
var dim = init(2, 22);
var italic = init(3, 23);
var underline = init(4, 24);
var inverse = init(7, 27);
var hidden = init(8, 28);
var strikethrough = init(9, 29);
var black = init(30, 39);
var red = init(31, 39);
var green = init(32, 39);
var yellow = init(33, 39);
var blue = init(34, 39);
var magenta = init(35, 39);
var cyan = init(36, 39);
var white = init(37, 39);
var gray = init(90, 39);
var grey = init(90, 39);
var bgBlack = init(40, 49);
var bgRed = init(41, 49);
var bgGreen = init(42, 49);
var bgYellow = init(43, 49);
var bgBlue = init(44, 49);
var bgMagenta = init(45, 49);
var bgCyan = init(46, 49);
var bgWhite = init(47, 49);
var MAX_ARGS_HISTORY = 100;
var COLORS = ["green", "yellow", "blue", "magenta", "cyan", "red"];
var argsHistory = [];
var lastTimestamp = Date.now();
var lastColor = 0;
var processEnv = typeof process !== "undefined" ? process.env : {};
globalThis.DEBUG ??= processEnv.DEBUG ?? "";
globalThis.DEBUG_COLORS ??= processEnv.DEBUG_COLORS ? processEnv.DEBUG_COLORS === "true" : true;
var topProps = {
  enable(namespace) {
    if (typeof namespace === "string") {
      globalThis.DEBUG = namespace;
    }
  },
  disable() {
    const prev = globalThis.DEBUG;
    globalThis.DEBUG = "";
    return prev;
  },
  // this is the core logic to check if logging should happen or not
  enabled(namespace) {
    const listenedNamespaces = globalThis.DEBUG.split(",").map((s) => {
      return s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    });
    const isListened = listenedNamespaces.some((listenedNamespace) => {
      if (listenedNamespace === "" || listenedNamespace[0] === "-") return false;
      return namespace.match(RegExp(listenedNamespace.split("*").join(".*") + "$"));
    });
    const isExcluded = listenedNamespaces.some((listenedNamespace) => {
      if (listenedNamespace === "" || listenedNamespace[0] !== "-") return false;
      return namespace.match(RegExp(listenedNamespace.slice(1).split("*").join(".*") + "$"));
    });
    return isListened && !isExcluded;
  },
  log: /* @__PURE__ */ __name((...args) => {
    const [namespace, format, ...rest] = args;
    const logWithFormatting = console.warn ?? console.log;
    logWithFormatting(`${namespace} ${format}`, ...rest);
  }, "log"),
  formatters: {}
  // not implemented
};
function debugCreate(namespace) {
  const instanceProps = {
    color: COLORS[lastColor++ % COLORS.length],
    enabled: topProps.enabled(namespace),
    namespace,
    log: topProps.log,
    extend: /* @__PURE__ */ __name(() => {
    }, "extend")
    // not implemented
  };
  const debugCall = /* @__PURE__ */ __name((...args) => {
    const { enabled, namespace: namespace2, color, log } = instanceProps;
    if (args.length !== 0) {
      argsHistory.push([namespace2, ...args]);
    }
    if (argsHistory.length > MAX_ARGS_HISTORY) {
      argsHistory.shift();
    }
    if (topProps.enabled(namespace2) || enabled) {
      const stringArgs = args.map((arg) => {
        if (typeof arg === "string") {
          return arg;
        }
        return safeStringify(arg);
      });
      const ms2 = `+${Date.now() - lastTimestamp}ms`;
      lastTimestamp = Date.now();
      if (globalThis.DEBUG_COLORS) {
        log(colors_exports[color](bold(namespace2)), ...stringArgs, colors_exports[color](ms2));
      } else {
        log(namespace2, ...stringArgs, ms2);
      }
    }
  }, "debugCall");
  return new Proxy(debugCall, {
    get: /* @__PURE__ */ __name((_, prop) => instanceProps[prop], "get"),
    set: /* @__PURE__ */ __name((_, prop, value) => instanceProps[prop] = value, "set")
  });
}
__name(debugCreate, "debugCreate");
var Debug2 = new Proxy(debugCreate, {
  get: /* @__PURE__ */ __name((_, prop) => topProps[prop], "get"),
  set: /* @__PURE__ */ __name((_, prop, value) => topProps[prop] = value, "set")
});
function safeStringify(value, indent = 2) {
  const cache = /* @__PURE__ */ new Set();
  return JSON.stringify(
    value,
    (key, value2) => {
      if (typeof value2 === "object" && value2 !== null) {
        if (cache.has(value2)) {
          return `[Circular *]`;
        }
        cache.add(value2);
      } else if (typeof value2 === "bigint") {
        return value2.toString();
      }
      return value2;
    },
    indent
  );
}
__name(safeStringify, "safeStringify");

// node_modules/.pnpm/@prisma+driver-adapter-utils@6.19.2/node_modules/@prisma/driver-adapter-utils/dist/index.mjs
var DriverAdapterError = class extends Error {
  static {
    __name(this, "DriverAdapterError");
  }
  name = "DriverAdapterError";
  cause;
  constructor(payload) {
    super(typeof payload["message"] === "string" ? payload["message"] : payload.kind);
    this.cause = payload;
  }
};
var debug = Debug2("driver-adapter-utils");
var ColumnTypeEnum = {
  // Scalars
  Int32: 0,
  Int64: 1,
  Float: 2,
  Double: 3,
  Numeric: 4,
  Boolean: 5,
  Character: 6,
  Text: 7,
  Date: 8,
  Time: 9,
  DateTime: 10,
  Json: 11,
  Enum: 12,
  Bytes: 13,
  Set: 14,
  Uuid: 15,
  // Arrays
  Int32Array: 64,
  Int64Array: 65,
  FloatArray: 66,
  DoubleArray: 67,
  NumericArray: 68,
  BooleanArray: 69,
  CharacterArray: 70,
  TextArray: 71,
  DateArray: 72,
  TimeArray: 73,
  DateTimeArray: 74,
  JsonArray: 75,
  EnumArray: 76,
  BytesArray: 77,
  UuidArray: 78,
  // Custom
  UnknownNumber: 128
};
var mockAdapterErrors = {
  queryRaw: new Error("Not implemented: queryRaw"),
  executeRaw: new Error("Not implemented: executeRaw"),
  startTransaction: new Error("Not implemented: startTransaction"),
  executeScript: new Error("Not implemented: executeScript"),
  dispose: new Error("Not implemented: dispose")
};

// node_modules/.pnpm/@prisma+adapter-neon@6.19.2/node_modules/@prisma/adapter-neon/dist/index.mjs
var import_postgres_array = __toESM(require_postgres_array(), 1);
var name = "@prisma/adapter-neon";
var { builtins: ScalarColumnType, getTypeParser } = export_types;
var ArrayColumnType = {
  BIT_ARRAY: 1561,
  BOOL_ARRAY: 1e3,
  BYTEA_ARRAY: 1001,
  BPCHAR_ARRAY: 1014,
  CHAR_ARRAY: 1002,
  CIDR_ARRAY: 651,
  DATE_ARRAY: 1182,
  FLOAT4_ARRAY: 1021,
  FLOAT8_ARRAY: 1022,
  INET_ARRAY: 1041,
  INT2_ARRAY: 1005,
  INT4_ARRAY: 1007,
  INT8_ARRAY: 1016,
  JSONB_ARRAY: 3807,
  JSON_ARRAY: 199,
  MONEY_ARRAY: 791,
  NUMERIC_ARRAY: 1231,
  OID_ARRAY: 1028,
  TEXT_ARRAY: 1009,
  TIMESTAMP_ARRAY: 1115,
  TIMESTAMPTZ_ARRAY: 1185,
  TIME_ARRAY: 1183,
  UUID_ARRAY: 2951,
  VARBIT_ARRAY: 1563,
  VARCHAR_ARRAY: 1015,
  XML_ARRAY: 143
};
var UnsupportedNativeDataType = class _UnsupportedNativeDataType extends Error {
  static {
    __name(this, "_UnsupportedNativeDataType");
  }
  // map of type codes to type names
  static typeNames = {
    16: "bool",
    17: "bytea",
    18: "char",
    19: "name",
    20: "int8",
    21: "int2",
    22: "int2vector",
    23: "int4",
    24: "regproc",
    25: "text",
    26: "oid",
    27: "tid",
    28: "xid",
    29: "cid",
    30: "oidvector",
    32: "pg_ddl_command",
    71: "pg_type",
    75: "pg_attribute",
    81: "pg_proc",
    83: "pg_class",
    114: "json",
    142: "xml",
    194: "pg_node_tree",
    269: "table_am_handler",
    325: "index_am_handler",
    600: "point",
    601: "lseg",
    602: "path",
    603: "box",
    604: "polygon",
    628: "line",
    650: "cidr",
    700: "float4",
    701: "float8",
    705: "unknown",
    718: "circle",
    774: "macaddr8",
    790: "money",
    829: "macaddr",
    869: "inet",
    1033: "aclitem",
    1042: "bpchar",
    1043: "varchar",
    1082: "date",
    1083: "time",
    1114: "timestamp",
    1184: "timestamptz",
    1186: "interval",
    1266: "timetz",
    1560: "bit",
    1562: "varbit",
    1700: "numeric",
    1790: "refcursor",
    2202: "regprocedure",
    2203: "regoper",
    2204: "regoperator",
    2205: "regclass",
    2206: "regtype",
    2249: "record",
    2275: "cstring",
    2276: "any",
    2277: "anyarray",
    2278: "void",
    2279: "trigger",
    2280: "language_handler",
    2281: "internal",
    2283: "anyelement",
    2287: "_record",
    2776: "anynonarray",
    2950: "uuid",
    2970: "txid_snapshot",
    3115: "fdw_handler",
    3220: "pg_lsn",
    3310: "tsm_handler",
    3361: "pg_ndistinct",
    3402: "pg_dependencies",
    3500: "anyenum",
    3614: "tsvector",
    3615: "tsquery",
    3642: "gtsvector",
    3734: "regconfig",
    3769: "regdictionary",
    3802: "jsonb",
    3831: "anyrange",
    3838: "event_trigger",
    3904: "int4range",
    3906: "numrange",
    3908: "tsrange",
    3910: "tstzrange",
    3912: "daterange",
    3926: "int8range",
    4072: "jsonpath",
    4089: "regnamespace",
    4096: "regrole",
    4191: "regcollation",
    4451: "int4multirange",
    4532: "nummultirange",
    4533: "tsmultirange",
    4534: "tstzmultirange",
    4535: "datemultirange",
    4536: "int8multirange",
    4537: "anymultirange",
    4538: "anycompatiblemultirange",
    4600: "pg_brin_bloom_summary",
    4601: "pg_brin_minmax_multi_summary",
    5017: "pg_mcv_list",
    5038: "pg_snapshot",
    5069: "xid8",
    5077: "anycompatible",
    5078: "anycompatiblearray",
    5079: "anycompatiblenonarray",
    5080: "anycompatiblerange"
  };
  type;
  constructor(code) {
    super();
    this.type = _UnsupportedNativeDataType.typeNames[code] || "Unknown";
    this.message = `Unsupported column type ${this.type}`;
  }
};
function fieldToColumnType(fieldTypeId) {
  switch (fieldTypeId) {
    case ScalarColumnType.INT2:
    case ScalarColumnType.INT4:
      return ColumnTypeEnum.Int32;
    case ScalarColumnType.INT8:
      return ColumnTypeEnum.Int64;
    case ScalarColumnType.FLOAT4:
      return ColumnTypeEnum.Float;
    case ScalarColumnType.FLOAT8:
      return ColumnTypeEnum.Double;
    case ScalarColumnType.BOOL:
      return ColumnTypeEnum.Boolean;
    case ScalarColumnType.DATE:
      return ColumnTypeEnum.Date;
    case ScalarColumnType.TIME:
    case ScalarColumnType.TIMETZ:
      return ColumnTypeEnum.Time;
    case ScalarColumnType.TIMESTAMP:
    case ScalarColumnType.TIMESTAMPTZ:
      return ColumnTypeEnum.DateTime;
    case ScalarColumnType.NUMERIC:
    case ScalarColumnType.MONEY:
      return ColumnTypeEnum.Numeric;
    case ScalarColumnType.JSON:
    case ScalarColumnType.JSONB:
      return ColumnTypeEnum.Json;
    case ScalarColumnType.UUID:
      return ColumnTypeEnum.Uuid;
    case ScalarColumnType.OID:
      return ColumnTypeEnum.Int64;
    case ScalarColumnType.BPCHAR:
    case ScalarColumnType.TEXT:
    case ScalarColumnType.VARCHAR:
    case ScalarColumnType.BIT:
    case ScalarColumnType.VARBIT:
    case ScalarColumnType.INET:
    case ScalarColumnType.CIDR:
    case ScalarColumnType.XML:
      return ColumnTypeEnum.Text;
    case ScalarColumnType.BYTEA:
      return ColumnTypeEnum.Bytes;
    case ArrayColumnType.INT2_ARRAY:
    case ArrayColumnType.INT4_ARRAY:
      return ColumnTypeEnum.Int32Array;
    case ArrayColumnType.FLOAT4_ARRAY:
      return ColumnTypeEnum.FloatArray;
    case ArrayColumnType.FLOAT8_ARRAY:
      return ColumnTypeEnum.DoubleArray;
    case ArrayColumnType.NUMERIC_ARRAY:
    case ArrayColumnType.MONEY_ARRAY:
      return ColumnTypeEnum.NumericArray;
    case ArrayColumnType.BOOL_ARRAY:
      return ColumnTypeEnum.BooleanArray;
    case ArrayColumnType.CHAR_ARRAY:
      return ColumnTypeEnum.CharacterArray;
    case ArrayColumnType.BPCHAR_ARRAY:
    case ArrayColumnType.TEXT_ARRAY:
    case ArrayColumnType.VARCHAR_ARRAY:
    case ArrayColumnType.VARBIT_ARRAY:
    case ArrayColumnType.BIT_ARRAY:
    case ArrayColumnType.INET_ARRAY:
    case ArrayColumnType.CIDR_ARRAY:
    case ArrayColumnType.XML_ARRAY:
      return ColumnTypeEnum.TextArray;
    case ArrayColumnType.DATE_ARRAY:
      return ColumnTypeEnum.DateArray;
    case ArrayColumnType.TIME_ARRAY:
      return ColumnTypeEnum.TimeArray;
    case ArrayColumnType.TIMESTAMP_ARRAY:
      return ColumnTypeEnum.DateTimeArray;
    case ArrayColumnType.JSON_ARRAY:
    case ArrayColumnType.JSONB_ARRAY:
      return ColumnTypeEnum.JsonArray;
    case ArrayColumnType.BYTEA_ARRAY:
      return ColumnTypeEnum.BytesArray;
    case ArrayColumnType.UUID_ARRAY:
      return ColumnTypeEnum.UuidArray;
    case ArrayColumnType.INT8_ARRAY:
    case ArrayColumnType.OID_ARRAY:
      return ColumnTypeEnum.Int64Array;
    default:
      if (fieldTypeId >= 1e4) {
        return ColumnTypeEnum.Text;
      }
      throw new UnsupportedNativeDataType(fieldTypeId);
  }
}
__name(fieldToColumnType, "fieldToColumnType");
function normalize_array(element_normalizer) {
  return (str) => (0, import_postgres_array.parse)(str, element_normalizer);
}
__name(normalize_array, "normalize_array");
function normalize_numeric(numeric) {
  return numeric;
}
__name(normalize_numeric, "normalize_numeric");
function normalize_date(date) {
  return date;
}
__name(normalize_date, "normalize_date");
function normalize_timestamp(time) {
  return `${time.replace(" ", "T")}+00:00`;
}
__name(normalize_timestamp, "normalize_timestamp");
function normalize_timestamptz(time) {
  return time.replace(" ", "T").replace(/[+-]\d{2}(:\d{2})?$/, "+00:00");
}
__name(normalize_timestamptz, "normalize_timestamptz");
function normalize_time(time) {
  return time;
}
__name(normalize_time, "normalize_time");
function normalize_timez(time) {
  return time.replace(/[+-]\d{2}(:\d{2})?$/, "");
}
__name(normalize_timez, "normalize_timez");
function normalize_money(money) {
  return money.slice(1);
}
__name(normalize_money, "normalize_money");
function normalize_xml(xml) {
  return xml;
}
__name(normalize_xml, "normalize_xml");
function toJson(json) {
  return json;
}
__name(toJson, "toJson");
function encodeBuffer(buffer) {
  return Array.from(new Uint8Array(buffer));
}
__name(encodeBuffer, "encodeBuffer");
var parsePgBytes = getTypeParser(ScalarColumnType.BYTEA);
var parseBytesArray = getTypeParser(ArrayColumnType.BYTEA_ARRAY);
function normalizeByteaArray(serializedBytesArray) {
  const buffers = parseBytesArray(serializedBytesArray);
  return buffers.map((buf) => buf ? encodeBuffer(buf) : null);
}
__name(normalizeByteaArray, "normalizeByteaArray");
function convertBytes(serializedBytes) {
  const buffer = parsePgBytes(serializedBytes);
  return encodeBuffer(buffer);
}
__name(convertBytes, "convertBytes");
function normalizeBit(bit) {
  return bit;
}
__name(normalizeBit, "normalizeBit");
var customParsers = {
  [ScalarColumnType.NUMERIC]: normalize_numeric,
  [ArrayColumnType.NUMERIC_ARRAY]: normalize_array(normalize_numeric),
  [ScalarColumnType.TIME]: normalize_time,
  [ArrayColumnType.TIME_ARRAY]: normalize_array(normalize_time),
  [ScalarColumnType.TIMETZ]: normalize_timez,
  [ScalarColumnType.DATE]: normalize_date,
  [ArrayColumnType.DATE_ARRAY]: normalize_array(normalize_date),
  [ScalarColumnType.TIMESTAMP]: normalize_timestamp,
  [ArrayColumnType.TIMESTAMP_ARRAY]: normalize_array(normalize_timestamp),
  [ScalarColumnType.TIMESTAMPTZ]: normalize_timestamptz,
  [ArrayColumnType.TIMESTAMPTZ_ARRAY]: normalize_array(normalize_timestamptz),
  [ScalarColumnType.MONEY]: normalize_money,
  [ArrayColumnType.MONEY_ARRAY]: normalize_array(normalize_money),
  [ScalarColumnType.JSON]: toJson,
  [ArrayColumnType.JSON_ARRAY]: normalize_array(toJson),
  [ScalarColumnType.JSONB]: toJson,
  [ArrayColumnType.JSONB_ARRAY]: normalize_array(toJson),
  [ScalarColumnType.BYTEA]: convertBytes,
  [ArrayColumnType.BYTEA_ARRAY]: normalizeByteaArray,
  [ArrayColumnType.BIT_ARRAY]: normalize_array(normalizeBit),
  [ArrayColumnType.VARBIT_ARRAY]: normalize_array(normalizeBit),
  [ArrayColumnType.XML_ARRAY]: normalize_array(normalize_xml)
};
function mapArg(arg, argType) {
  if (arg === null) {
    return null;
  }
  if (Array.isArray(arg) && argType.arity === "list") {
    return arg.map((value) => mapArg(value, argType));
  }
  if (typeof arg === "string" && argType.scalarType === "datetime") {
    arg = new Date(arg);
  }
  if (arg instanceof Date) {
    switch (argType.dbType) {
      case "TIME":
      case "TIMETZ":
        return formatTime(arg);
      case "DATE":
        return formatDate(arg);
      default:
        return formatDateTime(arg);
    }
  }
  if (typeof arg === "string" && argType.scalarType === "bytes") {
    return Buffer.from(arg, "base64");
  }
  if (Array.isArray(arg) && argType.scalarType === "bytes") {
    return Buffer.from(arg);
  }
  if (ArrayBuffer.isView(arg)) {
    return Buffer.from(arg.buffer, arg.byteOffset, arg.byteLength);
  }
  return arg;
}
__name(mapArg, "mapArg");
function formatDateTime(date) {
  const pad = /* @__PURE__ */ __name((n, z = 2) => String(n).padStart(z, "0"), "pad");
  const ms2 = date.getUTCMilliseconds();
  return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate()) + " " + pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms2 ? "." + String(ms2).padStart(3, "0") : "");
}
__name(formatDateTime, "formatDateTime");
function formatDate(date) {
  const pad = /* @__PURE__ */ __name((n, z = 2) => String(n).padStart(z, "0"), "pad");
  return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate());
}
__name(formatDate, "formatDate");
function formatTime(date) {
  const pad = /* @__PURE__ */ __name((n, z = 2) => String(n).padStart(z, "0"), "pad");
  const ms2 = date.getUTCMilliseconds();
  return pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms2 ? "." + String(ms2).padStart(3, "0") : "");
}
__name(formatTime, "formatTime");
function convertDriverError(error) {
  if (isDriverError(error)) {
    return {
      originalCode: error.code,
      originalMessage: error.message,
      ...mapDriverError(error)
    };
  }
  throw error;
}
__name(convertDriverError, "convertDriverError");
function mapDriverError(error) {
  switch (error.code) {
    case "22001":
      return {
        kind: "LengthMismatch",
        column: error.column
      };
    case "22003":
      return {
        kind: "ValueOutOfRange",
        cause: error.message
      };
    case "23505": {
      const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
      return {
        kind: "UniqueConstraintViolation",
        constraint: fields !== void 0 ? { fields } : void 0
      };
    }
    case "23502": {
      const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
      return {
        kind: "NullConstraintViolation",
        constraint: fields !== void 0 ? { fields } : void 0
      };
    }
    case "23503": {
      let constraint;
      if (error.column) {
        constraint = { fields: [error.column] };
      } else if (error.constraint) {
        constraint = { index: error.constraint };
      }
      return {
        kind: "ForeignKeyConstraintViolation",
        constraint
      };
    }
    case "3D000":
      return {
        kind: "DatabaseDoesNotExist",
        db: error.message.split(" ").at(1)?.split('"').at(1)
      };
    case "28000":
      return {
        kind: "DatabaseAccessDenied",
        db: error.message.split(",").find((s) => s.startsWith(" database"))?.split('"').at(1)
      };
    case "28P01":
      return {
        kind: "AuthenticationFailed",
        user: error.message.split(" ").pop()?.split('"').at(1)
      };
    case "40001":
      return {
        kind: "TransactionWriteConflict"
      };
    case "42P01":
      return {
        kind: "TableDoesNotExist",
        table: error.message.split(" ").at(1)?.split('"').at(1)
      };
    case "42703":
      return {
        kind: "ColumnNotFound",
        column: error.message.split(" ").at(1)?.split('"').at(1)
      };
    case "42P04":
      return {
        kind: "DatabaseAlreadyExists",
        db: error.message.split(" ").at(1)?.split('"').at(1)
      };
    case "53300":
      return {
        kind: "TooManyConnections",
        cause: error.message
      };
    default:
      return {
        kind: "postgres",
        code: error.code ?? "N/A",
        severity: error.severity ?? "N/A",
        message: error.message,
        detail: error.detail,
        column: error.column,
        hint: error.hint
      };
  }
}
__name(mapDriverError, "mapDriverError");
function isDriverError(error) {
  return typeof error.code === "string" && typeof error.message === "string" && typeof error.severity === "string" && (typeof error.detail === "string" || error.detail === void 0) && (typeof error.column === "string" || error.column === void 0) && (typeof error.hint === "string" || error.hint === void 0);
}
__name(isDriverError, "isDriverError");
var debug2 = Debug2("prisma:driver-adapter:neon");
var NeonQueryable = class {
  static {
    __name(this, "NeonQueryable");
  }
  provider = "postgres";
  adapterName = name;
  /**
   * Execute a query given as SQL, interpolating the given parameters.
   */
  async queryRaw(query) {
    const tag = "[js::query_raw]";
    debug2(`${tag} %O`, query);
    const { fields, rows } = await this.performIO(query);
    const columnNames = fields.map((field) => field.name);
    let columnTypes = [];
    try {
      columnTypes = fields.map((field) => fieldToColumnType(field.dataTypeID));
    } catch (e) {
      if (e instanceof UnsupportedNativeDataType) {
        throw new DriverAdapterError({
          kind: "UnsupportedNativeDataType",
          type: e.type
        });
      }
      throw e;
    }
    return {
      columnNames,
      columnTypes,
      rows
    };
  }
  /**
   * Execute a query given as SQL, interpolating the given parameters and
   * returning the number of affected rows.
   * Note: Queryable expects a u64, but napi.rs only supports u32.
   */
  async executeRaw(query) {
    const tag = "[js::execute_raw]";
    debug2(`${tag} %O`, query);
    return (await this.performIO(query)).rowCount ?? 0;
  }
};
var NeonWsQueryable = class extends NeonQueryable {
  static {
    __name(this, "NeonWsQueryable");
  }
  constructor(client) {
    super();
    this.client = client;
  }
  async performIO(query) {
    const { sql, args } = query;
    try {
      const result = await this.client.query(
        {
          text: sql,
          rowMode: "array",
          types: {
            // This is the error expected:
            // No overload matches this call.
            // The last overload gave the following error.
            //   Type '(oid: number, format?: any) => (json: string) => unknown' is not assignable to type '{ <T>(oid: number): TypeParser<string, string | T>; <T>(oid: number, format: "text"): TypeParser<string, string | T>; <T>(oid: number, format: "binary"): TypeParser<...>; }'.
            //     Type '(json: string) => unknown' is not assignable to type 'TypeParser<Buffer, any>'.
            //       Types of parameters 'json' and 'value' are incompatible.
            //         Type 'Buffer' is not assignable to type 'string'.ts(2769)
            //
            // Because pg-types types expect us to handle both binary and text protocol versions,
            // where as far we can see, pg will ever pass only text version.
            //
            // @ts-expect-error
            getTypeParser: /* @__PURE__ */ __name((oid, format) => {
              if (format === "text" && customParsers[oid]) {
                return customParsers[oid];
              }
              return export_types.getTypeParser(oid, format);
            }, "getTypeParser")
          }
        },
        args.map((arg, i) => mapArg(arg, query.argTypes[i]))
      );
      return result;
    } catch (e) {
      this.onError(e);
    }
  }
  onError(e) {
    debug2("Error in onError: %O", e);
    throw new DriverAdapterError(convertDriverError(e));
  }
};
var NeonTransaction = class extends NeonWsQueryable {
  static {
    __name(this, "NeonTransaction");
  }
  constructor(client, options, cleanup) {
    super(client);
    this.options = options;
    this.cleanup = cleanup;
  }
  async commit() {
    debug2(`[js::commit]`);
    this.cleanup?.();
    this.client.release();
  }
  async rollback() {
    debug2(`[js::rollback]`);
    this.cleanup?.();
    this.client.release();
  }
};
var PrismaNeonAdapter = class extends NeonWsQueryable {
  static {
    __name(this, "PrismaNeonAdapter");
  }
  constructor(pool, options) {
    super(pool);
    this.options = options;
  }
  isRunning = true;
  executeScript(_script) {
    throw new Error("Not implemented yet");
  }
  async startTransaction(isolationLevel) {
    const options = {
      usePhantomQuery: false
    };
    const tag = "[js::startTransaction]";
    debug2("%s options: %O", tag, options);
    const conn = await this.client.connect().catch((error) => this.onError(error));
    const onError = /* @__PURE__ */ __name((err) => {
      debug2(`Error from pool connection: ${err.message} %O`, err);
      this.options?.onConnectionError?.(err);
    }, "onError");
    conn.on("error", onError);
    const cleanup = /* @__PURE__ */ __name(() => {
      conn.removeListener("error", onError);
    }, "cleanup");
    try {
      const tx = new NeonTransaction(conn, options, cleanup);
      await tx.executeRaw({ sql: "BEGIN", args: [], argTypes: [] });
      if (isolationLevel) {
        await tx.executeRaw({
          sql: `SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`,
          args: [],
          argTypes: []
        });
      }
      return tx;
    } catch (error) {
      cleanup();
      conn.release(error);
      this.onError(error);
    }
  }
  getConnectionInfo() {
    return {
      schemaName: this.options?.schema,
      supportsRelationJoins: true
    };
  }
  async dispose() {
    if (this.isRunning) {
      await this.client.end();
      this.isRunning = false;
    }
  }
  underlyingDriver() {
    return this.client;
  }
};
var PrismaNeonAdapterFactory = class {
  static {
    __name(this, "PrismaNeonAdapterFactory");
  }
  constructor(config, options) {
    this.config = config;
    this.options = options;
  }
  provider = "postgres";
  adapterName = name;
  async connect() {
    const pool = new Mn(this.config);
    pool.on("error", (err) => {
      debug2(`Error from pool client: ${err.message} %O`, err);
      this.options?.onPoolError?.(err);
    });
    return new PrismaNeonAdapter(pool, this.options);
  }
};

// src/lib/prisma.ts
var globalForPrisma = globalThis;
function createPrismaClient() {
  if (process.env.DATABASE_URL) {
    const adapter = new PrismaNeonAdapterFactory({ connectionString: process.env.DATABASE_URL });
    return new import_client.PrismaClient({
      adapter,
      log: process.env.NODE_ENV !== "production" ? ["query", "error", "warn"] : ["error"]
    });
  }
  return new import_client.PrismaClient({
    log: ["query", "error", "warn"]
  });
}
__name(createPrismaClient, "createPrismaClient");
var prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// src/modules/audit/audit-queries.ts
init_esm();

// src/utils/pagination.ts
init_esm();

// src/lib/constants.ts
init_esm();
var SESSION_MAX_AGE = 30 * 24 * 60 * 60;
var MAX_FILE_SIZE_MB = 5;
var MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
var ADMISSION_AUTO_SAVE_INTERVAL_MS = 60 * 1e3;
var ADMISSION_HEARTBEAT_INTERVAL_MS = 30 * 1e3;
var ADMISSION_SUBMIT_GRACE_PERIOD_MS = 30 * 1e3;
var ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: {
    ADMIN: "/admin",
    PRINCIPAL: "/principal",
    TEACHER: "/teacher",
    STUDENT: "/student",
    FAMILY: "/family"
  },
  ADMIN: {
    USERS: "/admin/users",
    CLASSES: "/admin/classes",
    SUBJECTS: "/admin/subjects",
    DEPARTMENTS: "/admin/departments",
    TIMETABLE: "/admin/timetable",
    DATESHEET: "/admin/datesheet",
    DATESHEET_NEW: "/admin/datesheet/new",
    ATTENDANCE: "/admin/attendance",
    YEAR_TRANSITION: "/admin/year-transition",
    NOTIFICATIONS: "/admin/notifications",
    SETTINGS: "/admin/settings",
    FEES: "/admin/fees",
    FEES_CATEGORIES: "/admin/fees/categories",
    FEES_STRUCTURES: "/admin/fees/structures",
    FEES_GENERATE: "/admin/fees/generate",
    FEES_COLLECT: "/admin/fees/collect",
    FEES_REPORTS: "/admin/fees/reports",
    FEES_DISCOUNTS: "/admin/fees/discounts",
    AUDIT_LOG: "/admin/audit-log",
    REPORTS: "/admin/reports",
    REPORTS_RESULT_TERMS: "/admin/reports/result-terms",
    REPORTS_CONSOLIDATION: "/admin/reports/consolidation",
    REPORTS_DMC: "/admin/reports/dmc",
    REPORTS_GAZETTE: "/admin/reports/gazette",
    REPORTS_REMARKS: "/admin/reports/remarks"
  },
  PRINCIPAL: {
    TEACHERS: "/principal/teachers",
    STUDENTS: "/principal/students",
    CLASSES: "/principal/classes",
    EXAMS: "/principal/exams",
    TIMETABLE: "/principal/timetable",
    DATESHEET: "/principal/datesheet",
    ATTENDANCE: "/principal/attendance",
    DIARY: "/principal/diary",
    FEES: "/principal/fees",
    ANALYTICS: "/principal/analytics",
    NOTIFICATIONS: "/principal/notifications",
    PROFILE: "/principal/profile",
    CHANGE_PASSWORD: "/principal/profile/change-password"
  },
  TEACHER: {
    QUESTIONS: "/teacher/questions",
    EXAMS: "/teacher/exams",
    GRADING: "/teacher/grading",
    RESULTS: "/teacher/results",
    ATTENDANCE: "/teacher/attendance",
    TIMETABLE: "/teacher/timetable",
    DATESHEET: "/teacher/datesheet",
    DIARY: "/teacher/diary",
    NOTIFICATIONS: "/teacher/notifications"
  },
  STUDENT: {
    EXAMS: "/student/exams",
    RESULTS: "/student/results",
    ATTENDANCE: "/student/attendance",
    TIMETABLE: "/student/timetable",
    DATESHEET: "/student/datesheet",
    DIARY: "/student/diary",
    FEES: "/student/fees",
    NOTIFICATIONS: "/student/notifications"
  },
  FAMILY: {
    DASHBOARD: "/family",
    ATTENDANCE: "/family/attendance",
    EXAMS: "/family/exams",
    RESULTS: "/family/results",
    TIMETABLE: "/family/timetable",
    DATESHEET: "/family/datesheet",
    DIARY: "/family/diary",
    FEES: "/family/fees",
    NOTIFICATIONS: "/family/notifications",
    PROFILE: "/family/profile",
    CHANGE_PASSWORD: "/family/profile/change-password"
  },
  PROFILE: "/profile",
  CHANGE_PASSWORD: "/profile/change-password",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  // Candidate Test Portal (admin-generated links)
  TEST: {
    TAKE: /* @__PURE__ */ __name((token) => `/test/${token}`, "TAKE")
  },
  // Admin Admission Management
  ADMIN_ADMISSIONS: {
    ROOT: "/admin/admissions",
    CAMPAIGNS: "/admin/admissions",
    NEW_CAMPAIGN: "/admin/admissions/new",
    CAMPAIGN_DETAIL: /* @__PURE__ */ __name((id) => `/admin/admissions/${id}`, "CAMPAIGN_DETAIL"),
    CAMPAIGN_QUESTIONS: /* @__PURE__ */ __name((id) => `/admin/admissions/${id}`, "CAMPAIGN_QUESTIONS"),
    CAMPAIGN_TIERS: /* @__PURE__ */ __name((id) => `/admin/admissions/${id}`, "CAMPAIGN_TIERS"),
    CAMPAIGN_APPLICANTS: /* @__PURE__ */ __name((id) => `/admin/admissions/${id}`, "CAMPAIGN_APPLICANTS"),
    CAMPAIGN_APPLICANT: /* @__PURE__ */ __name((id, appId) => `/admin/admissions/${id}`, "CAMPAIGN_APPLICANT"),
    CAMPAIGN_GRADING: /* @__PURE__ */ __name((id) => `/admin/admissions/${id}`, "CAMPAIGN_GRADING"),
    CAMPAIGN_MERIT: /* @__PURE__ */ __name((id) => `/admin/admissions/${id}`, "CAMPAIGN_MERIT"),
    CAMPAIGN_SCHOLARSHIPS: /* @__PURE__ */ __name((id) => `/admin/admissions/${id}`, "CAMPAIGN_SCHOLARSHIPS"),
    CAMPAIGN_ENROLLMENT: /* @__PURE__ */ __name((id) => `/admin/admissions/${id}`, "CAMPAIGN_ENROLLMENT"),
    CAMPAIGN_ANALYTICS: /* @__PURE__ */ __name((id) => `/admin/admissions/${id}`, "CAMPAIGN_ANALYTICS")
  }
};

// src/modules/audit/audit-queries.ts
async function createAuditLog(userId, action, entityType, entityId, metadata, ipAddress) {
  return prisma.auditLog.create({
    data: { userId, action, entityType, entityId, metadata: metadata ?? {}, ipAddress }
  });
}
__name(createAuditLog, "createAuditLog");

export {
  prisma,
  ROUTES,
  createAuditLog
};
/*! Bundled license information:

@prisma/client/runtime/library.js:
  (*! Bundled license information:
  
  decimal.js/decimal.mjs:
    (*!
     *  decimal.js v10.5.0
     *  An arbitrary-precision Decimal type for JavaScript.
     *  https://github.com/MikeMcl/decimal.js
     *  Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
     *  MIT Licence
     *)
  *)

@neondatabase/serverless/index.mjs:
  (*! Bundled license information:
  
  ieee754/index.js:
    (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  
  buffer/index.js:
    (*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     *)
  *)
*/
//# sourceMappingURL=chunk-IJ3NSDH3.mjs.map
