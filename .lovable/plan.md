

## Why Cloud Run Build Fails

The Node.js buildpack runs `npm install` → `npm run build` → `npm start`. Your project is missing:
- A `start` script (buildpack doesn't know how to serve the app)
- The `serve` package (needed to serve static files)
- A Node `engines` field (buildpack may pick wrong version)

## Fix — 3 changes to package.json

### 1. Add `serve` to dependencies
```json
"serve": "^14.2.4"
```

### 2. Add `start` script
```json
"start": "serve dist -s -l $PORT"
```
- `-s` enables single-page app mode (rewrites to `index.html`)
- `$PORT` is injected by Cloud Run automatically

### 3. Add engines field
```json
"engines": {
  "node": "20"
}
```

### Cloud Run Settings
- **Runtime**: Node.js
- **Build context directory**: `/` (or leave default)
- **Entry point**: leave blank (it will use `npm start`)
- **Function target**: leave blank

After these changes, the buildpack will: install deps → run `vite build` → run `serve dist` on the correct port.

