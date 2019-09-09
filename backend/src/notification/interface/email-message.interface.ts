interface EmailMessageDestination {
    Email: string;
    Name: string;
}

export interface EmailMessage<EmailPayload> {
    From?: EmailMessageDestination;
    To: EmailMessageDestination[];
    TemplateID: number;
    Variables: EmailPayload;
    TemplateLanguage?: boolean;
    Subject?: string;
}