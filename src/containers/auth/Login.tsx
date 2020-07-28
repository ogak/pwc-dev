import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { oc } from "ts-optchain";
import pwcLogoOutline from "../../assets/images/pwc-logo-outline.png";
import {
  useLoginMutation,
  LoginMutationVariables,
  useUsersQuery,
} from "../../generated/graphql";
import { authorize } from "../../redux/auth";
import Button from "../../shared/components/Button";
import { notifySuccess } from "../../shared/utils/notif";
import Captcha from "react-numeric-captcha";
import useWindowSize from "../../shared/hooks/useWindowSize";
import { Row, Col } from "reactstrap";
export default function Login({ history }: RouteComponentProps) {
  const dispatch = useDispatch();
  const [captcha, setCaptcha] = useState(false);
  const [login, { loading }] = useLoginMutation();
  const [mail, sMail] = useState("");
  const { data, loading: loadingUsers } = useUsersQuery({
    variables: { filter: { email_cont: mail } },
  });
  const { register, handleSubmit, watch } = useForm<LoginMutationVariables>();
  const checkEmail = watch("email");
  useEffect(() => {
    sMail(checkEmail);
  }, [checkEmail]);

  //refreshes Captcha when error
  const email = data?.users?.collection.map((a) => a.email);
  const [t, st] = useState({
    refresh: () => {},
  });

  async function onSubmit(values: LoginMutationVariables) {
    try {
      const res = await login({ variables: values });
      if (!res.data?.login) {
        t.refresh();
        throw new Error("Error");
      }
      notifySuccess("Welcome");
      dispatch(
        authorize(
          {
            id: res.data.login.id,
            email: oc(res).data.login.email(""),
            firstName: oc(res).data.login.firstName(""),
            lastName: oc(res).data.login.lastName(""),
            name: oc(res).data.login.name(""),
            phone: oc(res).data.login.phone(""),
            jobPosition: oc(res).data.login.jobPosition(""),
            department: oc(res).data.login.department.name(""),
            roles: oc(res).data.login.roles([]),
          },
          oc(res).data.login.token("")
        )
      );
      history.push("/");
    } catch (error) {
      if (email?.includes(checkEmail) === false) {
        toast.error(
          <div>
            <h5>Email is not registered in database</h5>
            <div>Please try again</div>
          </div>
        );
      } else {
        toast.error(
          <div>
            <h5>Wrong password</h5>
            <div>Please try again</div>
          </div>
        );
      }
    }
  }
  const screenSize = useWindowSize();

  return (
    <Row className="login-background" style={{ height: "101vh" }}>
      <div>
        <Image className="mt-0 ml-5" src={pwcLogoOutline} alt="pwc-logo" />
      </div>
      {screenSize.width > 850 ? <Col></Col> : null}
      <Col
        style={{ marginTop: `${screenSize.width < 491 ? "0vh" : "30vh"}` }}
        className="ml-3"
      >
        <Container>
          <Helmet>
            <title>Login - PricewaterhouseCoopers</title>
          </Helmet>
          <div
            style={{
              border: "1px solid rgba(0,0,0,0.2)",
              padding: "1vw",
              borderRadius: "3px",
              backgroundColor: "rgba(255,255,255,.7)",
            }}
          >
            <H1>Welcome, Please Sign in Here</H1>
            <Form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
              <Label>Email</Label>
              <br />
              <Input
                name="email"
                placeholder="Enter email address"
                required
                ref={register({ required: true })}
              />
              <br />
              <br />
              <Label>Password</Label>
              <br />
              <Input
                name="password"
                type="password"
                placeholder="Enter password"
                required
                ref={register({ required: true })}
              />
              <br />
              <br />
              <Captcha
                ref={(e: any) => st(e)}
                onChange={setCaptcha}
                placeholder="Insert captcha"
              />
              <br />
              <br />

              <Button
                className="pwc"
                color="primary"
                type="submit"
                block
                loading={loading || loadingUsers}
                disabled={!captcha}
              >
                Login
              </Button>
              <div className="text-center my-4">
                <Link to="/forgot-password" className="link-pwc">
                  Forgot Password?
                </Link>
              </div>
            </Form>
          </div>
        </Container>
      </Col>
    </Row>
  );
}

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const Form = styled.form`
  width: 30vw;
`;

export const Image = styled.img`
  width: 200px;
  height: auto;
  margin: 70px;
`;

export const H1 = styled.h1`
  margin-bottom: 30px;
`;

export const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  color: #3a3838;
  margin-bottom: 10px;
`;

export const Input = styled.input`
  border: 1px solid #c4c4c4;
  box-sizing: border-box;
  border-radius: 3px;
  height: 38px;
  width: 100%;
  padding: 5px 10px 5px 10px;
  ::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 25px;
    color: var(--darker-grey);
  }
`;
