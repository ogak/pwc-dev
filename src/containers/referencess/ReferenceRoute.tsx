import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Route, Switch } from "react-router-dom";
import ReferenceSideBox from "./components/ReferenceSideBox";
import References from "./References";
import CreateReference from "./CreateReference";
import Reference from "./Reference";
import Footer from "../../shared/components/Footer";

const ReferenceRoute = () => {
  return (
    <Container fluid className="p-0">
      <Row noGutters>
        <Col md={3}>
          <Route path="/references" component={ReferenceSideBox} />
        </Col>
        <Col md={9} className="p-4">
          <div style={{ minHeight: "80vh" }}>
            <Route exact path="/references" component={References} />
            <Switch>
              <Route
                exact
                path="/references/create"
                component={CreateReference}
              />
              <Route path="/references/:id" component={Reference} />
            </Switch>
          </div>
          <Footer />
        </Col>
      </Row>
    </Container>
  );
};

export default ReferenceRoute;
