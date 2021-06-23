import axiosClient from "../api/axios-client";

function LandingPage({ currentUser }) {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
}

LandingPage.getInitialProps = async (context) => {
  console.log("LANDING PAGE!");
  const client = axiosClient(context);
  const { data } = await client.get("/api/users/current-user");
  return data;
};
export default LandingPage;
