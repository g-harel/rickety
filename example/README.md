```
example
├─ backend                 Server-side code
│  ├─ app.ts               Express app configuration, registers endpoint handlers
│  ├─ database.ts          Pretend async database access
│  └─ index.ts             Backend entry point, makes the app start listening
├─ common                  Shared code between both frontend and backend
│  ├─ endpoints.ts         Endpoint definitions
│  └─ types.ts             Shared endpoint request and response types
├─ frontend                Client-side code
│  ├─ app.tsx              Sample React component with onClick handlers to call endpoints
│  ├─ index.html           HTML page template
│  └─ index.tsx            Frontend entry point, renders the app into the root
└─ testing                 Tests and test setup code
   ├─ backend.test.ts      Endpoint handler test using express link
   ├─ frontend.test.tsx    Component test spying on endpoint calls
   ├─ integration.test.tsx Component test using express link and mocked database module
   └─ setup.ts             Testing environment setup
```

&nbsp;

## Setup

```
$ npm install
```

## Running

```
$ npm start
```

## Testing

```
$ npm test
```
