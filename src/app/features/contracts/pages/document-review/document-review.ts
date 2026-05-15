import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';

import { TextService } from '../../../../core/services/text.service';

const DOCUMENT_REVIEW_ITEM_IDS = [
  'informative-summary',
  'preliminary-schedule',
  'general-clauses',
  'specific-conditions',
  'info-leaflet',
] as const;

export type DocumentReviewItemId = (typeof DOCUMENT_REVIEW_ITEM_IDS)[number];

export interface DocumentReviewItem {
  id: DocumentReviewItemId;
  accepted: boolean;
}

const I18N_PREFIX = 'contracts.documentReview';

@Component({
  selector: 'app-document-review',
  imports: [],
  templateUrl: './document-review.html',
  styleUrl: './document-review.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DocumentReviewComponent {
  private readonly textService = inject(TextService);

  protected readonly expandedId = signal<string | null>(null);
  protected readonly validationAttempted = signal(false);

  protected readonly items = signal<DocumentReviewItem[]>(
    DOCUMENT_REVIEW_ITEM_IDS.map((id) => ({ id, accepted: false })),
  );

  protected readonly allAccepted = computed(() =>
    this.items().every((item) => item.accepted),
  );

  protected readonly showValidationError = computed(
    () => this.validationAttempted() && !this.allAccepted(),
  );

  protected readonly texts = computed(() => {
    this.textService.textsSignal();
    return {
      back: this.getText('back'),
      brandAriaLabel: this.getText('brandAriaLabel'),
      brandName: this.getText('brandName'),
      titleLine1: this.getText('titleLine1'),
      titleLine2: this.getText('titleLine2'),
      titleAccent: this.getText('titleAccent'),
      intro: this.getText('intro'),
      introStrong: this.getText('introStrong'),
      validationError: this.getText('validationError'),
      acceptButton: this.getText('acceptButton'),
    };
  });

  protected itemLabel(id: DocumentReviewItemId): string {
    return this.getText(`items.${id}.label`);
  }

  protected itemDetailText(id: DocumentReviewItemId): string {
    return this.getText(`items.${id}.detailText`);
  }

  private getText(key: string): string {
    return this.textService.getText(`${I18N_PREFIX}.${key}`);
  }

  protected isExpanded(id: string): boolean {
    return this.expandedId() === id;
  }

  protected checkboxStatus(item: DocumentReviewItem): string {
    return this.showValidationError() && !item.accepted ? 'error' : 'default';
  }

  protected toggleExpand(id: string): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  protected onCheckboxChange(event: Event): void {
    const custom = event as CustomEvent<{ value: string; checked: boolean }>;
    const id = custom.detail?.value;
    const checked = custom.detail?.checked;
    if (!id) return;

    this.items.update((list) =>
      list.map((item) => (item.id === id ? { ...item, accepted: checked } : item)),
    );

    if (this.items().every((i) => i.accepted)) {
      this.validationAttempted.set(false);
    }
  }

  protected goBack(): void {
    history.back();
  }

  protected acceptAndContinue(): void {
    if (!this.allAccepted()) {
      this.validationAttempted.set(true);
      return;
    }
    this.validationAttempted.set(false);
  }
}
