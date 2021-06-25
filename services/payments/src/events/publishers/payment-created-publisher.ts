import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@nhannt-tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
