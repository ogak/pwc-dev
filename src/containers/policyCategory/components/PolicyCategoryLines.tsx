import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaFileExport, FaFileImport } from "react-icons/fa";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { Input } from "reactstrap";
import styled from "styled-components";
import { capitalCase } from 'capital-case';
import PickIcon from "../../../assets/Icons/PickIcon";
import {
  useAdminPolicyCategoriesQuery,
  useDestroyPolicyCategoriesMutation,
  useReviewerPolicyCategoriesStatusQuery,
} from "../../../generated/graphql";
import BreadCrumb from "../../../shared/components/BreadCrumb";
import Button from "../../../shared/components/Button";
import DialogButton from "../../../shared/components/DialogButton";
import CheckBox from "../../../shared/components/forms/CheckBox";
import ImportModal from "../../../shared/components/ImportModal";
import Pagination from "../../../shared/components/Pagination";
import Table from "../../../shared/components/Table";
import Tooltip from "../../../shared/components/Tooltip";
import useAccessRights from "../../../shared/hooks/useAccessRights";
import useListState from "../../../shared/hooks/useList";
import downloadXls from "../../../shared/utils/downloadXls";
import {
  notifyGraphQLErrors,
  notifySuccess,
} from "../../../shared/utils/notif";
import DateHover from '../../../shared/components/DateHover';

const PolicyCategoryLines = ({ history }: RouteComponentProps) => {
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const isUser = !(isAdmin || isAdminReviewer || isAdminPreparer);

  const [selected, setSelected] = useState<string[]>([]);

  const { limit, handlePageChange, page } = useListState({ limit: 10 });

  // Queries
  const {
    loading: loadingAdmin,
    data: dataAdmin,
  } = useAdminPolicyCategoriesQuery({
    skip: isAdminReviewer,
    variables: {
      filter: isAdminPreparer ? {} : { draft_event_null: true },
      limit,
      page,
    },
    fetchPolicy: "network-only",
  });
  const {
    loading: loadingReviewer,
    data: dataReviewer,
  } = useReviewerPolicyCategoriesStatusQuery({
    skip: isAdminPreparer || isUser,
    variables: {
      filter: {},
      limit,
      page,
    },
    fetchPolicy: "network-only",
  });
  const policyCategories =
    dataAdmin?.preparerPolicyCategories?.collection ||
    dataReviewer?.reviewerPolicyCategoriesStatus?.collection ||
    [];
  const totalCount =
    dataAdmin?.preparerPolicyCategories?.metadata.totalCount ||
    dataReviewer?.reviewerPolicyCategoriesStatus?.metadata.totalCount ||
    0;

  const {
    data: dataReviewerToExport,
  } = useReviewerPolicyCategoriesStatusQuery({
    skip: isAdminPreparer || isUser,
    variables: {
      filter: {},
      limit: totalCount,
    },
    fetchPolicy: "network-only",
  });

  const policyCategToExport = dataReviewerToExport?.reviewerPolicyCategoriesStatus?.collection || []

  const [modal, setModal] = useState(false);
  const toggleImportModal = () => setModal((p) => !p);
  const [destroy, destroyM] = useDestroyPolicyCategoriesMutation({
    onCompleted: () => {
      history.push("/policy-category");
      notifySuccess("Delete Success");
    },
    onError: notifyGraphQLErrors,
    refetchQueries: [
      "policyCategories",
      "adminPolicyCategories",
      "reviewerPolicyCategoriesStatus",
    ],
    awaitRefetchQueries: true,
  });
  const handleDelete = (id: string) => {
    destroy({ variables: { input: { id } } });
  };

  function toggleCheck(id: string) {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else {
      setSelected(selected.concat(id));
    }
  }
  const [clicked, setClicked] = useState(true);
  const clickButton = () => setClicked((p) => !p);
  function toggleCheckAll() {
    if (clicked) {
      setSelected(policyCategToExport.map((n) => n.id));
    } else {
      setSelected([]);
    }
  }

  function handleExport() {
    downloadXls(
      "/prints/policy_category_excel.xlsx",
      {
        policy_category_ids: selected.map(Number),
      },
      {
        fileName: "Policy Categories.xlsx",
        onStart: () => toast.info("Download Start"),
        onCompleted: () => notifySuccess("Download Success"),
        onError: () => toast.error("Download Failed"),
      }
    );
  }
  return (
    <div>
      <Helmet>
        <title>Policy Category - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="w-100">
        <BreadCrumb crumbs={[["/policyCategory", "Policy Category Administrative"]]} />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 style={{ fontSize: "23px" }}>List of Policy Category</h4>
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
          {isAdminPreparer ? (
            <Button tag={Link} to="/policy-category/create" className="pwc">
              + Add policy category
            </Button>
          ) : null}
        </div>
      </div>
      <Table responsive reloading={loadingAdmin || loadingReviewer}>
        <thead>
          <tr>
            {isAdminReviewer ? (
              <th style={{ width: "5%" }}>
                <CheckBox
                  checked={selected.length === policyCategories.length || selected.length === policyCategToExport.length}
                  onClick={() => {
                    clickButton();
                    toggleCheckAll();
                  }}
                />
              </th>
            ) : null}

            <th style={{ width: "30%" }}>Category name</th>
            <th style={{ width: "25%" }}>Related policies</th>
            <th style={{ width: "15%" }}>Status</th>
            <th style={{ width: "12%" }}>Last updated</th>
            <th style={{ width: "12%" }}>Last updated by</th>

            <th></th>
          </tr>
        </thead>
        <tbody>
          {policyCategories.map((policyCategory) => {
            return (
              <tr
                key={policyCategory.id}
                onClick={() =>
                  history.push(`/policy-category/${policyCategory.id}`)
                }
              >
                {isAdminReviewer ? (
                  <td>
                    <CheckBox
                      checked={selected.includes(policyCategory.id)}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        toggleCheck(policyCategory.id);
                      }}
                    />
                  </td>
                ) : null}

                <td className="wrapped">{policyCategory.name}</td>
                <td className="wrapped">{policyCategory.policies?.map(pol => pol.title).join(", ")}</td>
                <td>{capitalCase(policyCategory?.status || "")}</td>
                <td>
                  <DateHover humanize={false}>
                    {policyCategory.updatedAt.split(" ")[0]}
                  </DateHover>
                </td>
                <td>{policyCategory.lastUpdatedBy}</td>
                {isAdminReviewer ? (
                  <td className="action">
                    <Tooltip description="Delete policy category">
                      <DialogButton
                        onConfirm={() => handleDelete(policyCategory.id)}
                        loading={destroyM.loading}
                        message={`Delete "${policyCategory.name}"?`}
                        className="soft red"
                      >
                        <PickIcon name="trash" className="clickable" />
                      </DialogButton>
                    </Tooltip>
                  </td>
                ) : (
                  <td></td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Pagination
        totalCount={totalCount}
        perPage={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default PolicyCategoryLines;

export const PwcCheckInput = styled(Input)`
  &:after {
    width: 15px;
    height: 15px;

    top: -2px;
    left: -1px;
    position: relative;
    visibility: hidden;
    background-color: var(--primary-grey);
    content: "";
    display: inline-block;
    visibility: visible;
    border: 5px solid var(--primary-grey);
  }
  &:checked::after {
    width: 15px;
    height: 15px;
    top: -2px;
    left: -1px;
    position: relative;
    background-color: white;
    display: inline-block;
    visibility: visible;
    border: 5px solid var(--tangerine);
  }
`;
