import useRequest from "../../hooks/use-request";
import Router from "next/router";
import { useEffect, useState } from "react";

const OrderShow = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expireAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timer = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [order]);

  return (
    <div>
      {timeLeft < 0 ? "Order expired" : `Time left to pay: ${timeLeft} seconds`}

    </div>
  );
};

OrderShow.getInitialProps = async (context, client, currentUser) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};
export default OrderShow;
