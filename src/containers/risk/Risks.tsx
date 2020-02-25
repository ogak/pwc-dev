import React, { useState } from "react";
import { FaTrash, FaPlus, FaFileExport, FaFileImport } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  RisksDocument,
  useDestroyRiskMutation,
  useRisksQuery
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import Table from "../../shared/components/Table";
import Helmet from "react-helmet";
import { capitalCase } from "capital-case";
import DialogButton from "../../shared/components/DialogButton";
import BreadCrumb from "../../shared/components/BreadCrumb";
import Tooltip from "../../shared/components/Tooltip";
import ImportModal from "../../shared/components/ImportModal";
import downloadXls from "../../shared/utils/downloadXls";
import { notifySuccess } from "../../shared/utils/notif";

const Risks = ({ history }: RouteComponentProps) => {
  const { loading, data } = useRisksQuery({ fetchPolicy: "network-only" });
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState(false);

  const toggleImportModal = () => setModal(p => !p);

  const [destroy, destroyM] = useDestroyRiskMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: [
      {
        query: RisksDocument,
        variables: { filter: {} }
      }
    ]
  });

  const risks = oc(data).risks.collection([]);

  function handleDelete(id: string) {
    destroy({ variables: { id } });
  }

  function toggleCheck(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected(selected.concat(id));
    }
  }

  function toggleCheckAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelected(risks.map(r => r.id));
    } else {
      setSelected([]);
    }
  }

  function handleExport() {
    downloadXls(
      "/prints/risk_excel.xlsx",
      {
        risk_ids: selected.map(Number)
      },
      {
        fileName: "Risks.xlsx",
        onStart: () => toast.info("Download Start"),
        onCompleted: () => notifySuccess("Download Success"),
        onError: () => toast.error("Download Failed")
      }
    );
  }

  return (
    <div>
      <Helmet>
        <title>Risks - PricewaterhouseCoopers</title>
      </Helmet>
      <BreadCrumb crumbs={[["/risk", "Risks"]]} />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Risks</h4>
        <div className="d-flex">
          <Tooltip description="Create Risk">
            <Button
              className="soft orange mr-2"
              tag={Link}
              to="/risk/create"
              color=""
            >
              <FaPlus />
            </Button>
          </Tooltip>
          <Tooltip
            description="Export Risk"
            subtitle={
              selected.length ? "Export selected risk" : "Select risks first"
            }
          >
            <Button
              color=""
              className="soft red mr-2"
              onClick={handleExport}
              disabled={!selected.length}
            >
              <FaFileExport />
            </Button>
          </Tooltip>
          <Tooltip description="Import Risk">
            <Button
              color=""
              className="soft orange mr-2"
              onClick={toggleImportModal}
            >
              <FaFileImport />
            </Button>
          </Tooltip>
          <ImportModal
            title="Import Risks"
            endpoint="/risks/import"
            isOpen={modal}
            toggle={toggleImportModal}
          />
        </div>
      </div>
      <Table reloading={loading}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selected.length === risks.length}
                onChange={toggleCheckAll}
              />
            </th>
            <th>Risk ID</th>
            <th>Risk</th>
            <th>Risk Level</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {risks.map(risk => {
            return (
              <tr
                key={risk.id}
                onClick={() => history.push(`/risk/${risk.id}`)}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(risk.id)}
                    onClick={e => e.stopPropagation()}
                    onChange={() => toggleCheck(risk.id)}
                  />
                </td>
                <td>{risk.id}</td>
                <td>{oc(risk).name("")}</td>
                <td>{capitalCase(oc(risk).levelOfRisk(""))}</td>
                <td className="action">
                  <DialogButton
                    onConfirm={() => handleDelete(risk.id)}
                    loading={destroyM.loading}
                    message={`Delete risk "${risk.name}"?`}
                    className="soft red"
                  >
                    <FaTrash />
                  </DialogButton>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default Risks;
