export interface ContactState {
  current: number;
  sending: boolean;
  sent: boolean;
  attempt?: { body: string; key: string };
}

export const createContactState = (): ContactState => ({ current: 0, sending: false, sent: false });
