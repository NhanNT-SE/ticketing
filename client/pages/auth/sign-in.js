import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";
function SignIn() {
  const [email, setEmail] = useState("nhan@gmail.com");
  const [password, setPassword] = useState("123456");
  const { doRequest, errors } = useRequest({
    url: "/api/users/sign-in",
    method: "post",
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push("/"),
  });
  const onSubmit = async (e) => {
    e.preventDefault();
    await doRequest();
  };
  return (
    <form onSubmit={onSubmit}>
      <h1>Sign in</h1>
      <div className="form-group">
        <label>Email address</label>
        <input
          className="form-control"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          className="form-control"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {errors}
      <button type="submit" className="btn btn-primary">
        Sign In
      </button>
    </form>
  );
}
export default SignIn;
