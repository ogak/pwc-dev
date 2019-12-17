import React from "react";
import { Link } from "react-router-dom";
import { Table } from "reactstrap";
import { oc } from "ts-optchain";
import { useRisksQuery } from "../../../generated/graphql";
import { date } from "../../../shared/formatter";

const formatDate = (v: Date) => date(v, { hour: "numeric", minute: "numeric" });

const RiskSideBox = () => {
  const { data } = useRisksQuery({
    variables: { limit: 5 },
    fetchPolicy: "network-only"
  });

  return (
    <aside>
      <div className="side-box p-2">
        <h4>Recently Added</h4>
        <Table>
          <thead>
            <tr>
              <th className="text-white">Risk</th>
              <th className="text-white">Added Date</th>
            </tr>
          </thead>
          <tbody>
            {oc(data)
              .risks.collection([])
              .map(risk => {
                return (
                  <tr key={risk.id}>
                    <td>
                      <Link to={`/risk/${risk.id}`} className="text-white">
                        {oc(risk).name("")}
                      </Link>
                    </td>
                    <td className="text-white">
                      {formatDate(oc(risk).updatedAt(""))}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </div>
    </aside>
  );
};

export default RiskSideBox;