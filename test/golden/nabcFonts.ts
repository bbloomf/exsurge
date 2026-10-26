// Gregorio's NABC fonts, by name, as exsurge-ts/nabc-<name> publishes them
// (see rollup.config.mjs, whose nabcFonts test/bundle.test.ts builds)

import { gregall } from "../../src/nabc/gregall";
import { grelaon } from "../../src/nabc/grelaon";
import { gresgmodern } from "../../src/nabc/gresgmodern";

export const nabcFonts = { gregall, gresgmodern, grelaon };
