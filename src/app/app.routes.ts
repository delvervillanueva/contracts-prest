import { Routes } from '@angular/router';

import { DocumentReviewComponent } from './features/contracts/pages/document-review/document-review';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'contracts' },
  {
    path: 'contracts',
    component: DocumentReviewComponent,
    title: 'Document review',
  },
];
