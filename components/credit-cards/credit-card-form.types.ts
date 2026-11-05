export interface CreditCardFormProps {
  creditCardName: string;
  creditCardTitle: string;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  isModal?: boolean;
}
