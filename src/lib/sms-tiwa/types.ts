/** Moolre SMS API response (https://docs.moolre.com/#/send-sms) */
export type MoolreSmsResponse = {
  status?: number;
  code?: string | number;
  message?: string;
  error?: string;
  rawResponse?: string;
};

export type SendTiwaSmsInput = {
  to: string;
  message: string;
};

export type SendTiwaSmsResult = {
  ok: boolean;
  response: MoolreSmsResponse | null;
  formattedPhone?: string;
  error?: string;
};
