import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ITextAccessor, LanguageConfig, TextData, TextParams } from './text.interfaces';

const I18N_ASSETS_PATH = 'assets/i18n';
const SUPPORTED_LANGUAGES = ['es', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

@Injectable({
  providedIn: 'root',
})
export class TextService implements ITextAccessor {
  private readonly http = inject(HttpClient);

  private readonly texts = signal<TextData>({});
  private readonly currentLanguage = signal<SupportedLanguage>('es');
  private readonly isLoading = signal(false);
  private readonly error = signal<string | null>(null);

  private readonly languageConfig: LanguageConfig = {
    defaultLanguage: 'es',
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  readonly textsSignal = this.texts.asReadonly();
  readonly currentLanguageSignal = this.currentLanguage.asReadonly();
  readonly isLoadingSignal = this.isLoading.asReadonly();
  readonly errorSignal = this.error.asReadonly();
  readonly isReady = computed(() => !this.isLoading() && Object.keys(this.texts()).length > 0);

  async loadTexts(language: SupportedLanguage = this.languageConfig.defaultLanguage as SupportedLanguage): Promise<void> {
    const resolvedLanguage = this.resolveLanguage(language);

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const loadedTexts = await this.loadTextsFromAssets(resolvedLanguage);
      this.texts.set(loadedTexts);
      this.currentLanguage.set(resolvedLanguage);
    } catch (err) {
      const errorMessage = `Failed to load texts for language: ${resolvedLanguage}`;
      this.error.set(errorMessage);
      console.error(errorMessage, err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  getText(key: string, params?: TextParams): string {
    const value = this.getNestedProperty(this.texts(), key);
    const text = typeof value === 'string' ? value : key;
    return this.interpolateParams(text, params);
  }

  getTextSignal(key: string) {
    return computed(() => {
      const value = this.getNestedProperty(this.texts(), key);
      return typeof value === 'string' ? value : key;
    });
  }

  getTextWithParamsSignal(key: string, params?: TextParams) {
    return computed(() => this.getText(key, params));
  }

  async setLanguage(language: SupportedLanguage): Promise<void> {
    if (language !== this.currentLanguage()) {
      await this.loadTexts(language);
    }
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage();
  }

  private resolveLanguage(language: string): SupportedLanguage {
    if (this.isValidLanguage(language)) {
      return language;
    }

    console.warn(
      `Unsupported language: ${language}. Using default: ${this.languageConfig.defaultLanguage}`,
    );
    return this.languageConfig.defaultLanguage as SupportedLanguage;
  }

  private async loadTextsFromAssets(language: SupportedLanguage): Promise<TextData> {
    return firstValueFrom(this.http.get<TextData>(`${I18N_ASSETS_PATH}/${language}.json`));
  }

  private interpolateParams(text: string, params?: TextParams): string {
    if (!params) {
      return text;
    }

    return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => params[key]?.toString() ?? match);
  }

  private isValidLanguage(language: string): language is SupportedLanguage {
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(language);
  }

  private getNestedProperty(obj: TextData, path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => {
      if (current !== null && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }
}
