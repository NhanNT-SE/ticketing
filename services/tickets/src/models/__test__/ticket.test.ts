import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  const ticket = await Ticket.build({
    title: "title",
    price: 5,
    userId: "123",
  }).save();
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });
  await firstInstance!.save();
  expect.assertions(1);
  try {
    await secondInstance!.save();
  } catch (e) {
    expect(e).toBeDefined();
  }
});
