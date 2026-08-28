export class CreateSubscriptionDto {
  name!: string;
  merchantName?: string;
  amount!: number;
  frequency?: string;
  category?: string;
  status?: string;
  icon?: string;
  color?: string;
  nextBillingAt?: Date;
  notes?: string;
}

export class UpdateSubscriptionDto {
  name?: string;
  merchantName?: string;
  amount?: number;
  frequency?: string;
  category?: string;
  status?: string;
  icon?: string;
  color?: string;
  nextBillingAt?: Date;
  notes?: string;
}
