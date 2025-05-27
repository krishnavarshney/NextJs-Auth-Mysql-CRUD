# Critical and High Severity Vulnerabilities

This document lists all vulnerabilities identified as 'Critical' or 'High' severity from the `npm audit` report.

| Package Name | Severity | Affected Range | Recommended Fix | More Info |
|---|---|---|---|---|
| body-parser | high | <1.20.3 | `npm audit fix` or manual update | [GHSA-qwcr-r2fm-qrc7](https://github.com/advisories/GHSA-qwcr-r2fm-qrc7) |
| braces | high | <3.0.3 | `npm audit fix` or manual update | [GHSA-grv7-fg5c-xmjg](https://github.com/advisories/GHSA-grv7-fg5c-xmjg) |
| cross-spawn | high | 7.0.0 - 7.0.4 | `npm audit fix` or manual update | [GHSA-3xgq-45jj-v275](https://github.com/advisories/GHSA-3xgq-45jj-v275) |
| express | high | <4.19.2 | `npm audit fix` or manual update | [GHSA-rv95-896h-c2vc](https://github.com/advisories/GHSA-rv95-896h-c2vc) |
| express | high | <4.20.0 | `npm audit fix` or manual update | [GHSA-qw6h-vgh9-j6wx](https://github.com/advisories/GHSA-qw6h-vgh9-j6wx) |
| mysql2 | critical | <3.9.4 | `npm audit fix` or manual update | [GHSA-fpw7-j2hg-69v5](https://github.com/advisories/GHSA-fpw7-j2hg-69v5) |
| mysql2 | critical | <3.9.7 | `npm audit fix` or manual update | [GHSA-4rch-2fh8-94vw](https://github.com/advisories/GHSA-4rch-2fh8-94vw) |
| mysql2 | high | <3.9.8 | `npm audit fix` or manual update | [GHSA-pmh2-wpjm-fj45](https://github.com/advisories/GHSA-pmh2-wpjm-fj45) |
| next | critical | >=0.9.9 <13.4.20-canary.13 | `npm audit fix` or manual update (see note) | [GHSA-c59h-r6p8-q9wc](https://github.com/advisories/GHSA-c59h-r6p8-q9wc) |
| next | critical | >=13.4.0 <14.1.1 | `npm audit fix` or manual update (see note) | [GHSA-fr5h-rqp8-mj6g](https://github.com/advisories/GHSA-fr5h-rqp8-mj6g) |
| next | critical | >=13.4.0 <13.5.1 | `npm audit fix` or manual update (see note) | [GHSA-77r5-gw3j-2mpf](https://github.com/advisories/GHSA-77r5-gw3j-2mpf) |
| next | critical | >=13.3.1 <13.5.0 | `npm audit fix` or manual update (see note) | [GHSA-fq54-2j52-jc42](https://github.com/advisories/GHSA-fq54-2j52-jc42) |
| next | critical | >=10.0.0 <14.2.7 | `npm audit fix` or manual update (see note) | [GHSA-g77x-44xx-532m](https://github.com/advisories/GHSA-g77x-44xx-532m) |
| next | critical | >=9.5.5 <14.2.15 | `npm audit fix` or manual update (see note) | [GHSA-7gfc-8cq8-jh5f](https://github.com/advisories/GHSA-7gfc-8cq8-jh5f) |
| next | critical | >=13.0.0 <13.5.8 | `npm audit fix` or manual update (see note) | [GHSA-7m27-7ghc-44w9](https://github.com/advisories/GHSA-7m27-7ghc-44w9) |
| next | critical | >=13.0.0 <13.5.9 | `npm audit fix` or manual update (see note) | [GHSA-f82v-jwr5-mffw](https://github.com/advisories/GHSA-f82v-jwr5-mffw) |
| next | critical | <14.2.24 | `npm audit fix` or manual update (see note) | [GHSA-qpjv-v59x-3qc4](https://github.com/advisories/GHSA-qpjv-v59x-3qc4) |
| path-to-regexp | high | <0.1.12 | `npm audit fix` or manual update | [GHSA-rhx6-c78j-4q9w](https://github.com/advisories/GHSA-rhx6-c78j-4q9w) |
| path-to-regexp | high | <0.1.10 | `npm audit fix` or manual update | [GHSA-9wv6-86v2-598j](https://github.com/advisories/GHSA-9wv6-86v2-598j) |
| semver | high | >=7.0.0 <7.5.2 | `npm audit fix` or manual update | [GHSA-c2qf-rxjj-qqgw](https://github.com/advisories/GHSA-c2qf-rxjj-qqgw) |
| semver | high | >=6.0.0 <6.3.1 | `npm audit fix` or manual update | [GHSA-c2qf-rxjj-qqgw](https://github.com/advisories/GHSA-c2qf-rxjj-qqgw) |

*Note for 'next' package vulnerabilities: The original audit output (`npm_audit.json`) indicates a fix is available with version `13.5.11`. Users should update to this version or newer.*
