import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

export interface DocumentReviewItem {
  id: string;
  label: string;
  accepted: boolean;
  detailText: string;
}

@Component({
  selector: 'app-document-review',
  imports: [],
  templateUrl: './document-review.html',
  styleUrl: './document-review.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DocumentReviewComponent {
  protected readonly expandedId = signal<string | null>(null);

  protected readonly validationAttempted = signal(false);

  protected readonly items = signal<DocumentReviewItem[]>([
    {
      id: 'informative-summary',
      label: 'Hoja resumen informativa',
      accepted: false,
      detailText: `Año base de 360 días para el cálculo de intereses, comisiones y demás conceptos económicos vinculados al presente contrato. Los intereses ordinarios se devengarán diariamente sobre el saldo vivo pendiente de amortización y se liquidarán conforme a la periodicidad pactada en las condiciones particulares. El tipo de interés nominal anual (TIN) aplicable será el indicado en el anexo de condiciones financieras, sin perjuicio de las revisiones que, en su caso, procedan según la cláusula de indexación o revisión acordada.

La falta de pago puntual de cualquier cuota dará lugar, además de los intereses ordinarios, a la exigencia de intereses de demora en el porcentaje legalmente permitido, sin perjuicio del derecho del acreedor a reclamar el vencimiento anticipado del saldo pendiente y a iniciar las acciones oportunas para el cobro de la deuda.

El prestatario declara haber recibido, con carácter previo a la firma, la información normalizada europea (INE) y la documentación precontractual exigida por la normativa de consumo, habiendo tenido la posibilidad de solicitar aclaraciones y conservar copia de la totalidad de los documentos que integran la operación de crédito.`,
    },
    {
      id: 'preliminary-schedule',
      label: 'Cronograma preliminar',
      accepted: false,
      detailText: `El cronograma preliminar de amortización muestra la evolución prevista del capital pendiente y el reparto estimado entre principal e intereses para cada periodo, calculado según el sistema de amortización pactado y el tipo de interés vigente en la fecha de elaboración.

Los importes son orientativos y podrán variar ligeramente en función de la fecha efectiva de desembolso, de los días naturales de cada mes y de eventuales revisiones del tipo de interés si las hubiera. La primera y la última cuota podrán ser diferentes al resto por efectos de prorrateo temporal.

El calendario definitivo se incorporará a la documentación contractual y podrá consultarse en el área privada del cliente una vez formalizada la operación.`,
    },
    {
      id: 'general-clauses',
      label: 'Cláusulas generales',
      accepted: false,
      detailText: `Las presentes cláusulas generales regulan las condiciones comunes aplicables al producto contratado, incluyendo las obligaciones de las partes, la tramitación de incidencias, la protección de datos personales y la competencia jurisdiccional.

Quedan expresamente incorporadas las normas legales de carácter imperativo en materia de transparencia y protección de la clientela de servicios bancarios. Cualquier modificación contractual deberá constar por escrito y, en su caso, cumplir los requisitos formales exigidos por la ley.

El idioma contractual será el indicado en la documentación firmada. Las comunicaciones entre las partes se efectuarán por los medios y direcciones señalados en el contrato, salvo notificación fehaciente de cambio.`,
    },
    {
      id: 'specific-conditions',
      label: 'Condiciones específicas',
      accepted: false,
      detailText: `Las condiciones específicas complementan las cláusulas generales y recogen los parámetros particulares de la operación: importe, plazo, cuotas, garantías, seguros vinculados y cualquier otra estipulación acordada de forma individualizada.

En caso de contradicción entre la documentación contractual, prevalecerán las condiciones específicas en lo que respecta a los extremos objeto de pacto particular, sin perjuicio de las normas imperativas.

El prestatario se obliga a mantener la situación patrimonial y la información facilitada en el momento de la concesión, comunicando cualquier circunstancia relevante que pudiera afectar al cumplimiento del contrato.`,
    },
    {
      id: 'info-leaflet',
      label: 'Cartilla de información',
      accepted: false,
      detailText: `La cartilla de información tiene por objeto facilitar una descripción clara y sencilla de las principales características del producto, de forma accesible y comprensible para el cliente.

No sustituye a la documentación contractual completa, pero permite identificar de un vistazo los elementos esenciales del crédito y los derechos del consumidor.

Si necesita ampliar información, puede dirigirse a su oficina o canal digital habitual. Le recomendamos conservar esta cartilla junto con el resto de documentos de la operación.`,
    },
  ]);

  protected readonly allAccepted = computed(() =>
    this.items().every((item) => item.accepted),
  );

  protected readonly showValidationError = computed(
    () => this.validationAttempted() && !this.allAccepted(),
  );

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
