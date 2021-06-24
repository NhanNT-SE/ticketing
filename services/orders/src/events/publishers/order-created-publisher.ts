import { OrderCreatedEvent, Publisher, Subjects } from "@nhannt-tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject =  Subjects.OrderCreated;
    
}
