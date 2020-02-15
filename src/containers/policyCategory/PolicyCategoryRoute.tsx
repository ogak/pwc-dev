import React from "react";
import { Route, Switch } from "react-router";
import PolicyCategories from "./PolicyCategories";
import CreatePolicyCategory from "./CreatePolicyCategory";
import PolicyCategory from "./PolicyCategory";
import PolicyCategorySideBox from "./components/PolicyCategorySideBox";
import { Row, Col, Container } from "reactstrap";
import EmptyScreen from "../../shared/components/EmptyScreen";

const PolicyCategoryRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/policy-category" component={PolicyCategorySideBox} />
        </Col>
        <Col md={9} className="p-4">
          <Route exact path="/policy-category" component={EmptyScreen} />
          <Switch>
            <Route
              exact
              path="/policy-category/create"
              component={CreatePolicyCategory}
            />
            <Route
              exact
              path="/policy-category/:id"
              component={PolicyCategory}
            />
          </Switch>
        </Col>
      </Row>
    </Container>
  );
};

export default PolicyCategoryRoute;
