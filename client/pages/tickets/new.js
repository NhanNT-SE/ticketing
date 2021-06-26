import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";
function NewTicket() {
  const [title, setTitle] = useState("Concert");
  const [price, setPrice] = useState("20");
  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push("/"),
  });
  const onSubmit = async (e) => {
    e.preventDefault();
    await doRequest();
  };
  const onBlur = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }
    setPrice(value.toFixed(2));
  };
  return (
    <form onSubmit={onSubmit}>
      <h1>Create New Ticket</h1>
      <div className="form-group">
        <label>Title</label>
        <input
          className="form-control"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Price</label>
        <input
          className="form-control"
          placeholder="Price"
          onBlur={onBlur}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      {errors}
      <button type="submit" className="btn btn-primary">
        Create
      </button>
    </form>
  );
}
export default NewTicket;
