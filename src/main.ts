import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { App } from './app/app';

// @ts-expect-error Local Stencil bundle (no published typings for this path)
import { defineCustomElements } from '../stencil-library/_pkg/package/dist/esm/loader.js';

void defineCustomElements(window)
  .then(() => bootstrapApplication(App, appConfig))
  .catch((err: unknown) => console.error(err));
