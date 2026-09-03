// Thin wrapper. The implementation lives in packages/pseo-kit so every site
// runs the same gates. Paths resolve from the working directory, which npm
// sets to this site.
import "../../../packages/pseo-kit/scripts/check-seo.mjs";
