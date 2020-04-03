import React, { useState } from "react";
import Helmet from "react-helmet";
import {
  usePolicyCategoriesQuery,
  useDestroyPolicyCategoriesMutation
} from "../../../generated/graphql";
import Table from "../../../shared/components/Table";
import { RouteComponentProps } from "react-router-dom";
import { oc } from "ts-optchain";
import BreadCrumb from "../../../shared/components/BreadCrumb";
import Tooltip from "../../../shared/components/Tooltip";
import Button from "../../../shared/components/Button";
import { FaFileExport, FaFileImport, FaTrash } from "react-icons/fa";
import ImportModal from "../../../shared/components/ImportModal";
import {
  notifySuccess,
  notifyGraphQLErrors
} from "../../../shared/utils/notif";
import { toast } from "react-toastify";
import downloadXls from "../../../shared/utils/downloadXls";
import DialogButton from "../../../shared/components/DialogButton";
import useAccessRights from "../../../shared/hooks/useAccessRights";

const PolicyCategoryLines = ({ history }: RouteComponentProps) => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer"
  ]);
  const admins = isAdmin || isAdminPreparer || isAdminReviewer;
  const [selected, setSelected] = useState<string[]>([]);
  const { loading, data } = usePolicyCategoriesQuery({
    fetchPolicy: "network-only"
  });
  const policyCategories = oc(data).policyCategories.collection([]);
  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal(p => !p);
  const [destroy, destroyM] = useDestroyPolicyCategoriesMutation({
    onCompleted: () => {
      history.push("/policy-category");
      notifySuccess("Delete Success");
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["policyCategories"],
    awaitRefetchQueries: true
  });
  const handleDelete = (id: string) => {
    destroy({ variables: { input: { id } } });
  };

  function toggleCheck(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected(selected.concat(id));
    }
  }

  function toggleCheckAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelected(policyCategories.map(n => n.id));
    } else {
      setSelected([]);
    }
  }

  function handleExport() {
    downloadXls(
      "/prints/policy_category_excel.xlsx",
      {
        policy_category_ids: selected.map(Number)
      },
      {
        fileName: "Policy Categories.xlsx",
        onStart: () => toast.info("Download Start"),
        onCompleted: () => notifySuccess("Download Success"),
        onError: () => toast.error("Download Failed")
      }
    );
  }
  return (
    <div>
      <Helmet>
        <title>Policy Category - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="w-100">
        <BreadCrumb crumbs={[["/policyCategory", "Policy Category"]]} />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Policy Category</h4>
          {isAdminReviewer ? (
            <div className="d-flex">
              <Tooltip
                description="Export Policy Categories"
                subtitle={
                  selected.length
                    ? "Export selected policy categories"
                    : "Select policy categories first"
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
              <Tooltip description="Import Policy Categories">
                <Button
                  color=""
                  className="soft orange mr-2"
                  onClick={toggleImportModal}
                >
                  <FaFileImport />
                </Button>
              </Tooltip>
              <ImportModal
                title="Import Policy Categories"
                endpoint="/policy_categories/import"
                isOpen={modal}
                toggle={toggleImportModal}
              />
            </div>
          ) : null}
        </div>
      </div>
      <Table reloading={loading}>
        <thead>
          <tr>
            {isAdminReviewer ? (
              <th style={{ width: "5%" }}>
                <input
                  type="checkbox"
                  checked={selected.length === policyCategories.length}
                  onChange={toggleCheckAll}
                />
              </th>
            ) : null}

            <th style={{ width: "5%" }}>ID</th>
            <th style={{ width: "10%" }}>Category Name</th>
            <th style={{ width: "40%" }}>Related Policies</th>
            <th style={{ width: "15%" }}>Status</th>
            <th style={{ width: "12%" }}>Updated At</th>
            <th style={{ width: "12%" }}>Updated By</th>

            <th></th>
          </tr>
        </thead>
        <tbody>
          {policyCategories.map(policyCategory => {
            return (
              <tr
                key={policyCategory.id}
                onClick={() =>
                  history.push(`/policy-category/${policyCategory.id}`)
                }
              >
                {isAdminReviewer ? (
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(policyCategory.id)}
                      onClick={e => e.stopPropagation()}
                      onChange={() => toggleCheck(policyCategory.id)}
                    />
                  </td>
                ) : null}

                <td>{policyCategory.id}</td>
                <td>{policyCategory.name}</td>
                <td>
                  {oc(policyCategory)
                    .policies([])
                    .map(policy => policy.title)
                    .join(", ")}
                </td>
                <td>minta backend</td>
                <td>{policyCategory.updatedAt.split(" ")[0]}</td>
                <td>minta backend</td>
                {admins ? (
                  <td className="action">
                    <DialogButton
                      onConfirm={() => handleDelete(policyCategory.id)}
                      loading={destroyM.loading}
                      message={`Delete "${policyCategory.name}"?`}
                      className="soft red"
                    >
                      <FaTrash className="clickable" />
                    </DialogButton>
                  </td>
                ) : (
                  <td></td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default PolicyCategoryLines;
