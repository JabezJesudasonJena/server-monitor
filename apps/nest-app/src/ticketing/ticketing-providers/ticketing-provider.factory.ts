import { Injectable } from "@nestjs/common";
import { ITicketingProvider } from "./ticketing-providers.interface.js";
import { ServiceNowTicketingProvider } from "./service-now-ticketing-provider.interface.js";


@Injectable()
export class TicketingProviderFactory {
    create(config: Record<string, any>) {
        switch(config.type) {
            case ServiceNowTicketingProvider.name:
                return new ServiceNowTicketingProvider(config);
            default:
                throw new Error('Invalid provider type');
        }
    }
}