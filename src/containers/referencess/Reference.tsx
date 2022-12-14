import React, { Fragment } from "react";
import Helmet from "react-helmet";
import BreadCrumb from "../../shared/components/BreadCrumb";
import HeaderWithBackButton from "../../shared/components/Header";
import { useReferenceQuery } from "../../generated/graphql";
import { RouteComponentProps } from "react-router-dom";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import { previewHtml } from "../../shared/formatter";
import { Row, Col } from "reactstrap";
import TangerineLink from "../../shared/components/Link";
import DateHover from '../../shared/components/DateHover';

type TParams = { id: string };

const Reference = ({
  match,
  history,
  location,
}: RouteComponentProps<TParams>) => {
  const { id } = match.params;

  const { loading, data } = useReferenceQuery({
    variables: { id },
    fetchPolicy: "network-only",
    pollInterval: 30000,
  });
  const name = data?.reference?.name || "";
  const policies = data?.reference?.policies;
  const createdBy = data?.reference?.createdBy;
  const createdAt = data?.reference?.createdAt;
  const updatedAt = data?.reference?.updatedAt;
  const lastUpdatedBy = data?.reference?.lastUpdatedBy;
  return (
    <div>
      <Helmet>
        <title>{name} - References - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb
        crumbs={[
          ["/references", "References"],
          ["/references/" + id, name],
        ]}
      />
      <div className="justify-content-between align-items-center">
        <HeaderWithBackButton>{name}</HeaderWithBackButton>
      </div>
      {loading ? (
        <LoadingSpinner centered size={30} />
      ) : (
        <Row>
          <Col>
            <Fragment>
              <dt> Created at </dt>
              <dd>
                <DateHover humanize={false}>
                  {createdAt.split("T")[0]}
                </DateHover>
              </dd>
            </Fragment>
            <Fragment>
              <dt>Created by</dt>
              <dd> {createdBy ? createdBy : "-"}</dd>
            </Fragment>
            <Fragment>
              <dt>Policies </dt>
              <ul>
                {policies?.map((policy) => (
                  <li key={policy.id}>
                    <TangerineLink to={`/policy/${policy.id}`}>
                      {previewHtml(policy.title || "")}
                    </TangerineLink>
                  </li>
                ))}
              </ul>
            </Fragment>
          </Col>

          <Col>
            <Fragment>
              <dt> Last updated</dt>
              <dd>
                <DateHover humanize={false}>
                  {updatedAt.split("T")[0]}
                </DateHover>
              </dd>
            </Fragment>
            <Fragment>
              <dt>Last updated by</dt>
              <dd>{lastUpdatedBy}</dd>
            </Fragment>
          </Col>
        </Row>
      )}
    </div>
  );
};
export default Reference;
