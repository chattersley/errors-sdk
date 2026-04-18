# @joule-genie/errors-sdk

Browser SDK for ui-defect-farmer.

## Usage

```ts
import {
  configure,
  installGlobalHandlers,
  attachAxiosInterceptor,
  reportError,
} from "@joule-genie/errors-sdk"

configure({
  dsn: import.meta.env.VITE_ERROR_DSN,
  ingestURL: "https://errors.joule-genie.com/events",
  environment: "production",
  release: import.meta.env.VITE_RELEASE,
})
installGlobalHandlers()
attachAxiosInterceptor(axios) // optional

// Or report manually from an error boundary:
reportError({
  source: "boundary",
  message: error.message,
  stack: error.stack,
  context: { componentStack },
})
```

See `../../api/openapi.yaml` for the event shape.
