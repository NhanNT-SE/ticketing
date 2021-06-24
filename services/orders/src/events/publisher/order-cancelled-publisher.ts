import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from "@nhannt-tickets/common";
export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
