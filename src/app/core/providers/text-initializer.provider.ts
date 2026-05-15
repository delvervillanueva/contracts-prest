import { APP_INITIALIZER } from '@angular/core';

import { TextService } from '../services/text.service';

export function provideTextInitializer() {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: (textService: TextService) => () => textService.loadTexts(),
    deps: [TextService],
  };
}
