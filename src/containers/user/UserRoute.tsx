import React, { Fragment } from "react";
import { Switch, Route } from "react-router-dom";
import Users from "./Users";
import CreateUser from "./CreateUser";
import Department from "./Departments";
import Footer from "../../shared/components/Footer";

const UserRoute = () => {
  return (
    <Fragment>
      <div style={{ minHeight: "85vh" }}>
        <Switch>
          <Route exact path="/user" component={Users} />
          <Route exact path="/user/create" component={CreateUser} />
          <Route exact path="/user/department" component={Department} />
        </Switch>
      </div>
      <Footer />
    </Fragment>
  );
};

export default UserRoute;
