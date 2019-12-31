import { capitalCase } from "capital-case";
import get from "lodash/get";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Badge, Table } from "reactstrap";
import { oc } from "ts-optchain";
import { useBusinessProcessQuery } from "../../generated/graphql";
import { UncontrolledCollapsible } from "../../shared/components/Collapsible";
import EmptyAttribute from "../../shared/components/EmptyAttribute";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import ResourceBar from "../../shared/components/ResourceBar";

const RiskAndControls = ({ match, history }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  const { data, loading } = useBusinessProcessQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });

  const name = oc(data).businessProcess.name("");
  const risks = oc(data).businessProcess.risks([]);
  const resources = oc(data).businessProcess.resources([]);

  if (loading) return <LoadingSpinner size={30} centered />;

  return (
    <div>
      <h1>{name}</h1>
      <UncontrolledCollapsible title="Risks">
        {risks.length ? (
          <ul>
            {risks.map(risk => (
              <li>
                <div className="mb-3 d-flex">
                  <h5>
                    {risk.name}{" "}
                    <Badge color="danger mx-3">
                      {capitalCase(risk.levelOfRisk || "")}
                    </Badge>
                    <Badge color="danger">
                      {capitalCase(risk.typeOfRisk || "")}
                    </Badge>
                  </h5>
                </div>
                {risk.controls.length ? (
                  risk.controls.map(control => (
                    <Table>
                      <thead>
                        <tr>
                          <th>Freq</th>
                          <th>Type of Control</th>
                          <th>Nature</th>
                          <th>IPO</th>
                          <th>Assertion</th>
                          <th>Control Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr key={control.id}>
                          <td>{capitalCase(control.frequency || "")}</td>
                          <td>{capitalCase(control.typeOfControl || "")}</td>
                          <td>{capitalCase(control.nature || "")}</td>
                          {/* <td>{capitalCase(control.ipo || "")}</td> */}
                          {/* <td>{capitalCase(control.assertion || "")}</td> */}
                          <td>{control.controlOwner}</td>
                        </tr>
                      </tbody>
                    </Table>
                  ))
                ) : (
                  <EmptyAttribute />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyAttribute />
        )}
      </UncontrolledCollapsible>
      <UncontrolledCollapsible title="Resources">
        {resources.length ? (
          resources.map(resource => {
            return <ResourceBar key={resource.id} {...resource} />;
          })
        ) : (
          <EmptyAttribute />
        )}
      </UncontrolledCollapsible>
    </div>
  );
};

export default RiskAndControls;