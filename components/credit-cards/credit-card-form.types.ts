export interface CreditCardFormProps {
  creditCardName: string;
  creditCardTitle: string;
  onClose: () => void;
  onSuccess: () => void;
  isModal?: boolean;
}
