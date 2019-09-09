export interface ConfirmPaymentEmailPaylaod {
  invoiceNumber: string | null;
  totalWithVat: string;
  paymentValidationCode: string;
}
