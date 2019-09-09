export interface IWebhook {
  accessTag?: string;
  requestPayload?: any;
  responsePayload?: any;
  webhook?: string;
  webhook_id?: number;
  object?: string;
  object_id?: number;
  object_payload?: any;
  object_payload_signature?: string;
}
