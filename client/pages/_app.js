import "../styles/globals.css";
import Header from "../components/header";
import "bootstrap/dist/css/bootstrap.css";
import axiosClient from "../api/axios-client";

function MyApp({ Component, pageProps, currentUser }) {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
}
MyApp.getInitialProps = async (context) => {
  const client = axiosClient(context.ctx);
  const { data } = await client.get("/api/users/current-user");
  let pageProps = {};
  if (context.Component.getInitialProps) {
    pageProps = await context.Component.getInitialProps(context.ctx);
  }
  console.log(pageProps);
  return {
    pageProps,
    ...data,
  };
};
export default MyApp;
