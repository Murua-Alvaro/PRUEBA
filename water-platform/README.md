# GROWA Agua · analytical application

A separate frontend and read-only backend replace the legacy embedded water viewer.

## Runtime

`python3 water-platform/server.py` starts the API and application using only Python's standard library. `PORT` defaults to 4173 for local preview and is supplied by Render in production. The server binds to 0.0.0.0. No installation or external database credentials are required. Source JSON is loaded into an indexed, read-only SQLite database in memory on each process start.

The archive contains 38,641 materialized records: 210 dams, 216 aquifer balances, 135 state/cycle irrigation records, 115 annual climate records, 1,018 monthly reservoir records, 30,652 daily records, 125 Sinaloa cuts, 6,095 undated quality measurements, 32 trend estimates, and 43 coverage metadata records. Metadata counts describe files and are not added as downloaded underlying observations. No REPDA personal records are exposed by this service.

## API

- `/health`: readiness, application version and indexed record count.
- `/api/catalog`: dataset contracts, numeric variables and units, state coverage and actual counts.
- `/api/summary`: server-filtered numeric statistics, missing values and entity options.
- `/api/query`: validated sorting and pagination; up to 250 rows per page.
- `/api/map`: filtered GeoJSON; accepts geographic bounds.
- `/api/record?id=`: source values and provenance.
- `/api/series`: separate time series for up to four selected entities, explicit missing values and gap thresholds.
- `/api/compare`: per-unit descriptive summaries without aggregating incompatible series.
- `/api/export`: all filtered records as CSV, including original censored text and provenance.

Common parameters: dataset, state, entity, q, from, to, metric and bbox (west,south,east,north). Query parameters are validated; SQL identifiers come from server allowlists, and user values are bound. Responses support gzip, ETags and a 128-entry LRU response cache. API CORS allows public read-only archive access. Exports guard formula-like text cells. No writes, authentication or user account storage are implemented. Saved views are explicitly local to the browser.

## Frontend

`dist/agua/index.html`, `platform.css` and `platform.js` form the standalone application. `config.js` selects the API origin for the static host; when served directly by the Python server it points to the same origin. The old portal's Agua entry embeds the new application and forwards shared-query parameters. Existing agricultural modules remain independent.

Features: source navigation, connected territory/variable/date/text filters, paginated and sortable records, spatial extent filtering, basemap switching and full-screen map, source record inspector, individual and comparative time series, source catalog, complete CSV and filtered GeoJSON export, shareable queries and locally saved views. Empty, loading and failed-connection states are explicit. Unsupported geographical or time-series views explain what is missing and offer a valid alternative.

## Data interpretation

National dam inventory uses secondary-source provenance. Existing exact-key territorial matches supply missing state labels; other missing states stay unassigned. Quality records keep absent dates, censored values and anomalous source numbers; unit gaps remain labeled. Storage means are separated from daily observations and Sinaloa system cuts. No interpolation, forecast or compliance classification is fabricated.

## Validation

`python3 -m unittest discover -s tests -p test_water_api.py -v` executes HTTP integration tests covering real counts, pagination and ordering, dates, per-unit comparisons, spatial filters, gzip, exports and rejected parameters. Frontend interaction and live deployment verification are performed separately in the browser.
