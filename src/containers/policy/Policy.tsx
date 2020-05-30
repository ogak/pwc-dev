import get from "lodash/get";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  Fragment,
} from "react";
import Helmet from "react-helmet";
import {
  AiFillEdit,
  AiOutlineClockCircle,
  AiOutlineEdit,
} from "react-icons/ai";
import {
  FaBars,
  FaBookmark,
  FaEllipsisV,
  FaExclamationCircle,
  FaFilePdf,
  FaMinus,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { Route, RouteComponentProps } from "react-router";
import { Link, NavLink } from "react-router-dom";
import { Badge, Nav, NavItem, TabContent, TabPane, Row, Col } from "reactstrap";
import { oc } from "ts-optchain";
import {
  useApproveRequestEditMutation,
  useCreateBookmarkPolicyMutation,
  useCreateRequestEditMutation,
  useDestroyPolicyMutation,
  usePolicyQuery,
  useReviewPolicyDraftMutation,
  useSubmitPolicyMutation,
  useUpdateDraftPolicyMutation,
  useReferencesQuery,
  usePolicyCategoriesQuery,
  useBookmarksQuery,
  // useUpdatePolicyMutation,
} from "../../generated/graphql";
import BreadCrumb, { CrumbItem } from "../../shared/components/BreadCrumb";
import Button from "../../shared/components/Button";
import Collapsible from "../../shared/components/Collapsible";
import ControlsTable from "../../shared/components/ControlsTable";
import DateHover from "../../shared/components/DateHover";
import DialogButton from "../../shared/components/DialogButton";
import HeaderWithBackButton from "../../shared/components/Header";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import Menu, { MenuData } from "../../shared/components/Menu";
import PoliciesTable from "../../shared/components/PoliciesTable";
import ResourcesTab from "../../shared/components/ResourcesTab";
import RisksList from "../../shared/components/RisksList";
import Tooltip from "../../shared/components/Tooltip";
import useAccessRights from "../../shared/hooks/useAccessRights";
import useDialogBox from "../../shared/hooks/useDialogBox";
import useWindowSize from "../../shared/hooks/useWindowSize";
import {
  downloadPdf,
  emailPdf,
  previewPdf,
} from "../../shared/utils/accessGeneratedPdf";
import { formatPolicyChart } from "../../shared/utils/formatPolicy";
import {
  notifyError,
  notifyGraphQLErrors,
  notifyInfo,
  notifySuccess,
} from "../../shared/utils/notif";
import PolicyDashboard from "./components/PolicyDashboard";
import PolicyForm, { PolicyFormValues } from "./components/PolicyForm";
import SubPolicyForm, { SubPolicyFormValues } from "./components/SubPolicyForm";
import { toLabelValue } from "../../shared/formatter";

type TParams = { id: string };

export default function Policy({
  match,
  history,
  location,
}: RouteComponentProps<TParams>) {
  const dialogBox = useDialogBox();
  const size = useWindowSize();
  const isSmallDevice = size.width <= 992;
  const subPolicyRef = useRef<HTMLInputElement>(null);
  const riskRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<HTMLInputElement>(null);
  const initialCollapse = ["Resources", "Risks", "Controls", "Sub-Policies"];
  const [collapse, setCollapse] = useState(initialCollapse);
  const toggleCollapse = (name: string) =>
    setCollapse((p) => {
      if (p.includes(name)) {
        return p.filter((item) => item !== name);
      }
      return p.concat(name);
    });
  const openAllCollapse = () => setCollapse(initialCollapse);
  const closeAllCollapse = () => setCollapse([]);

  const [inEditMode, setInEditMode] = useState(false);
  const toggleEditMode = () => setInEditMode((prev) => !prev);
  useEffect(() => {
    setInEditMode((p) => (p ? false : p));
  }, [location.pathname]);

  const { id } = match.params;

  const { loading, data } = usePolicyQuery({
    variables: { id, withChild: true },
    fetchPolicy: "network-only",
    pollInterval: 30000,
  });
  const referenceData = useReferencesQuery({
    fetchPolicy: "network-only",
    variables: { filter: { policies_id_matches_any: id } },
  });
  const { data: bookmarkData, loading: bookmarkLoading } = useBookmarksQuery({
    fetchPolicy: "network-only",
    variables: {
      filter: { originator_id_eq: id, originator_type_eq: "Policy" },
    },
  });
  const policyCategoriesData = usePolicyCategoriesQuery({
    variables: { filter: { policies_id_matches_any: id } },
  });

  const references = oc(referenceData)
    .data.navigatorReferences.collection([])
    .map(toLabelValue);
  const referenceIds = references.map((a) => a.value);

  const policyCategories = oc(policyCategoriesData)
    .data.navigatorPolicyCategories.collection([])
    .map(toLabelValue);
  const policyCategoryId = policyCategories.map((a) => a.value).pop() || "";
  const isDraft = data?.policy?.draft;
  const isAdminView = location.pathname.split("/")[1] === "policy-admin";
  const [isAdmin, isAdminReviewer, isAdminPreparer] = useAccessRights([
    "admin",
    "admin_reviewer",
    "admin_preparer",
  ]);
  const scrollToRisk = useCallback(
    () =>
      window.scrollTo({
        top: riskRef.current ? riskRef.current.offsetTop : 0,
        behavior: "smooth",
      }),
    []
  );
  const scrollToSubPolicy = useCallback(
    () =>
      window.scrollTo({
        top: subPolicyRef.current ? subPolicyRef.current.offsetTop : 0,
        behavior: "smooth",
      }),
    []
  );
  const scrollToControl = useCallback(
    () =>
      window.scrollTo({
        top: controlRef.current ? controlRef.current.offsetTop : 0,
        behavior: "smooth",
      }),
    []
  );

  useLayoutEffect(() => {
    if (location.hash.includes("risks")) {
      scrollToRisk();
    }
    if (location.hash.includes("controls")) {
      scrollToControl();
    }
    if (location.hash.includes("sub-policies")) {
      scrollToSubPolicy();
    }
  });

  // Delete current policy
  const [destroyMain] = useDestroyPolicyMutation({
    onCompleted: () => {
      const url = isAdminView ? "/policy-admin" : "/policy";
      notifySuccess("Delete Success");
      history.push(url);
    },
    onError: notifyGraphQLErrors,
    refetchQueries: [
      "policies",
      "policyCategories",
      "adminPolicyCategories",
      "reviewerPolicyCategoriesStatus",
      "preparerPolicies",
      "reviewerPolicies",
      "sideboxPolicy",
      "reviewerPolicies",
    ],
    awaitRefetchQueries: true,
  });
  function handleDeleteMain() {
    dialogBox({
      text: "Delete this policy?",
      callback: () => destroyMain({ variables: { id } }),
    });
  }

  // Delete child policy
  const [destroy] = useDestroyPolicyMutation({
    onCompleted: () => notifySuccess("Delete Success"),
    onError: notifyGraphQLErrors,
    refetchQueries: ["policy"],
    awaitRefetchQueries: true,
  });
  function handleDelete(id: string, title?: string) {
    dialogBox({
      text: `Delete policy "${title}"?`,
      callback: () => destroy({ variables: { id } }),
    });
  }

  // Bookmark policy
  const [addBookmark] = useCreateBookmarkPolicyMutation({
    onCompleted: (_) => notifySuccess("Added to bookmark"),
    onError: notifyGraphQLErrors,
    refetchQueries: ["policy", "bookmarks"],
    awaitRefetchQueries: true,
  });

  // const [update, updateState] = useUpdatePolicyMutation({
  //   onCompleted: () => {
  //     notifySuccess("Update Success");
  //     toggleEditMode();
  //   },
  //   onError: notifyGraphQLErrors,
  //   refetchQueries: ["policies", "policyTree", "policy"],
  //   awaitRefetchQueries: true
  // });
  // function handleUpdate(values: PolicyFormValues) {
  //   update({ variables: { input: { id, ...values } } });
  // }
  // function handleUpdateSubPolicy(values: SubPolicyFormValues) {
  //   update({ variables: { input: { id, ...values } } });
  // }
  // Update Policy As Draft
  const [updateDraft, updateDraftState] = useUpdateDraftPolicyMutation({
    onCompleted: () => {
      notifySuccess("Update Success");
      toggleEditMode();
    },
    onError: notifyGraphQLErrors,
    refetchQueries: [
      "policies",
      "preparerPolicies",
      "policyCategories",
      "reviewerPolicyCategoriesStatus",
      "adminPolicyCategories",
      "reviewerPolicies",
      "sideboxPolicy",
      "reviewerPolicies",
      "policy",
    ],
    awaitRefetchQueries: true,
  });
  function handleUpdateDraft(values: PolicyFormValues) {
    updateDraft({ variables: { input: { id, ...values } } });
  }
  function handleUpdateDraftSubPolicy(values: SubPolicyFormValues) {
    updateDraft({
      variables: { input: { id, ...values, parentId: data?.policy?.ancestry } },
    });
  }

  // Submit to reviewer
  const [submit, loadingSubmit] = useSubmitPolicyMutation({
    onCompleted: () => {
      notifySuccess("Submitted");
    },
    onError: notifyGraphQLErrors,
    refetchQueries: ["policy"],
  });
  function handleSubmit(values: PolicyFormValues) {
    submit({ variables: { input: { id, ...values } } });
    setInEditMode(!inEditMode);
  }
  function handleSubmitSubPolicy(values: SubPolicyFormValues) {
    submit({ variables: { input: { id, ...values } } });
    setInEditMode(!inEditMode);
  }
  function handleSubmitSubPolicySecond(values: SubPolicyFormValues) {
    submit({
      variables: { input: { id, ...values, parentId: data?.policy?.ancestry } },
    });
    setInEditMode(!inEditMode);
  }
  const [
    requestEditMutation,
    requestEditMutationInfo,
  ] = useCreateRequestEditMutation({
    variables: { id: oc(data).policy.id(""), type: "Policy" },
    onError: notifyGraphQLErrors,
    onCompleted: () => notifyInfo("Edit access requested"),
    refetchQueries: ["policy"],
  });

  const [
    approveEditMutation,
    approveEditMutationResult,
  ] = useApproveRequestEditMutation({
    refetchQueries: [
      "policy",
      "preparerPolicies",
      "reviewerPolicies",
      "sideboxPolicy",
      "reviewerPolicies",
    ],
    awaitRefetchQueries: true,
  });
  async function handleApproveRequest(id: string) {
    try {
      await approveEditMutation({ variables: { id, approve: true } });
      notifySuccess("You Gave Permission");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }
  async function handleRejectRequest(id: string) {
    try {
      await approveEditMutation({ variables: { id, approve: false } });
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  const [reviewPolicy, reviewPolicyM] = useReviewPolicyDraftMutation({
    refetchQueries: [
      "policy",
      "preparerPolicies",
      "reviewerPolicies",
      "sideboxPolicy",
      "reviewerPolicies",
    ],
  });
  async function review({ publish }: { publish: boolean }) {
    try {
      await reviewPolicy({ variables: { id, publish } });
      notifySuccess(publish ? "Changes Accepted" : "Changes Rejected");
    } catch (error) {
      notifyGraphQLErrors(error);
    }
  }

  const isSubmitted = data?.policy?.isSubmitted;
  const draft = data?.policy?.draft?.objectResult;
  const title = data?.policy?.title || "";
  const description = draft
    ? get(data, "policy.draft.objectResult.description", "")
    : data?.policy?.description || "";
  const hasEditAccess = oc(data).policy.hasEditAccess();
  // const requested = oc(data).policy.requestStatus() === "requested";

  // const policyCategoryId = oc(data).policy.policyCategory.id("");
  const parentId = oc(data).policy.parentId("");
  const children = oc(data).policy.children([]);
  const isSubPolicy: boolean = !!oc(data).policy.ancestry();
  const ancestry = oc(data).policy.ancestry("");
  const policyReferences = data?.policy?.references || [];
  // const referenceIds = references.map((item) => item.id);
  // const controls = oc(data).policy.controls([]);
  // const risks = oc(data).policy.risks([]);
  const controlCount = oc(data).policy.controlCount({});
  const riskCount = oc(data).policy.riskCount({});
  const subCount = oc(data).policy.subCount({});
  const isMaximumLevel = ancestry.split("/").length === 5;
  const ancestors = data?.policy?.ancestors || [];
  const lastUpdatedAt = data?.policy?.lastUpdatedAt;
  const bookmarked = bookmarkData?.bookmarks?.collection || [];
  const createdAt = data?.policy?.createdAt;
  const createdBy = data?.policy?.createdBy;
  const trueVersion = data?.policy?.trueVersion;
  const breadcrumb = ancestors.map((a: any) => [
    "/policy/" + a.id,
    a.title,
  ]) as CrumbItem[];
  if (loading) return <LoadingSpinner centered size={30} />;
  const policyChartData = formatPolicyChart({
    controlCount,
    riskCount,
    subCount,
  }).map((item) => ({
    ...item,
    onClick: item.label.includes("Risk")
      ? () => history.push(`${location.pathname}/details/#risks`)
      : item.label.includes("Control")
      ? () => history.push(`${location.pathname}/details/#controls`)
      : () => history.push(`${location.pathname}/details/#sub-policies`),
  }));
  const renderPolicy = () => {
    const tabs = isAdminView
      ? [{ to: `/policy-admin/${id}/details`, title: "Details" }]
      : [
          { to: `/policy/${id}`, title: "Dashboard" },
          { to: `/policy/${id}/details`, title: "Details" },
          { to: `/policy/${id}/resources`, title: "Resources" },
        ];
    return (
      <div>
        <Nav tabs className="tabs-pwc">
          {tabs.map((tab, index) => (
            <NavItem key={index}>
              <NavLink
                exact
                to={tab.to}
                className="nav-link"
                activeClassName="active"
              >
                {tab.title}
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <TabContent>
          <TabPane>
            <Route exact path="/policy/:id">
              <div className="mb-3 py-3">
                <PolicyDashboard data={policyChartData} />
              </div>
            </Route>
            <Route
              exact
              path={
                isAdminView
                  ? "/policy-admin/:id/details"
                  : "/policy/:id/details"
              }
            >
              <div className="text-right my-2 text-secondary">
                <div className="mb-1  ">Created By : {createdBy}</div>
                {lastUpdatedAt ? (
                  <DateHover withIcon>{lastUpdatedAt}</DateHover>
                ) : (
                  <div className="text-secondary">
                    <DateHover withIcon>{createdAt}</DateHover>
                  </div>
                )}

                <div className="mt-1  ">Version : {trueVersion}</div>
              </div>
              <div className="d-flex justify-content-end">
                {renderPolicyAction()}
              </div>

              <div
                className="mb-3 py-3"
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              />
              {policyReferences.length ? (
                <div
                  className="d-flex"
                  style={{ borderBottom: " 1px solid #d85604" }}
                >
                  <h6>
                    {policyReferences.map((reference) => (
                      <Badge key={reference.id} className="mx-1">
                        {reference.name}
                      </Badge>
                    ))}
                  </h6>
                </div>
              ) : (
                <div
                  className="d-flex"
                  style={{ borderBottom: " 1px solid #d85604" }}
                >
                  <h6>
                    {references.map((reference) => (
                      <Badge key={reference.value} className="mx-1">
                        {reference.label}
                      </Badge>
                    ))}
                  </h6>
                </div>
              )}

              <div ref={riskRef} style={{ borderBottom: " 1px solid #d85604" }}>
                <Collapsible
                  title="Risks"
                  show={collapse.includes("Risks")}
                  onClick={toggleCollapse}
                >
                  <RisksList
                    data={data}
                    // risks={risks}
                    // withRelatedControls={false}
                  />
                </Collapsible>
              </div>

              <div
                ref={controlRef}
                style={{ borderBottom: " 1px solid #d85604" }}
              >
                <Collapsible
                  title="Controls"
                  show={collapse.includes("Controls")}
                  onClick={toggleCollapse}
                >
                  <ControlsTable data={data} />
                </Collapsible>
              </div>

              <div ref={subPolicyRef}>
                <Collapsible
                  title="Sub-Policies"
                  show={collapse.includes("Sub-Policies")}
                  onClick={toggleCollapse}
                >
                  <PoliciesTable
                    policies={children}
                    isAdminView={isAdminView}
                    onDelete={handleDelete}
                  />
                </Collapsible>
              </div>
            </Route>
            <Route exact path="/policy/:id/resources">
              <ResourcesTab
                policyData={data}
                policy
                isDraft={isDraft}
                formDefaultValues={{
                  policyIds: [
                    {
                      value: id,
                      label: title,
                    },
                  ],
                }}
                queryFilters={{
                  policies_id_in: id,
                }}
              />
            </Route>
          </TabPane>
        </TabContent>
      </div>
    );
  };

  const renderPolicyInEditMode = () => {
    return (
      <div>
        <div className="d-flex justify-content-end">{renderPolicyAction()}</div>
        {isSubPolicy ? (
          <SubPolicyForm
            defaultValues={{
              parentId,
              title,
              description,
              referenceIds,
              resourceIds: oc(data)
                .policy.resources([])
                .map((r) => r.id),
              businessProcessIds: oc(data)
                .policy.businessProcesses([])
                .map((r) => r.id),
              controlIds: oc(data)
                .policy.controls([])
                .map((r) => r.id),
              riskIds: oc(data)
                .policy.risks([])
                .map((r) => r.id),
            }}
            saveAsDraftFirst={handleUpdateDraftSubPolicy}
            submitFirst={handleSubmitSubPolicy}
            submitSecond={handleSubmitSubPolicySecond}
            saveAsDraftSecond={handleUpdateDraftSubPolicy}
            secondDraftLoading={loadingSubmit.loading}
            toggleEditMode={toggleEditMode}
            submitting={updateDraftState.loading}
            submittingDraft={updateDraftState.loading}
            premise={
              ((isAdminPreparer && !isSubmitted) ||
                (isAdminReviewer && !isSubmitted)) &&
              !(
                (hasEditAccess && !draft && isAdminPreparer) ||
                (!draft && isSubmitted && isAdmin)
              )
            }
          />
        ) : (
          <PolicyForm
            handleSubmitToReviewer={handleSubmit}
            submitFromDraft={handleSubmit}
            loadingSubmit={loadingSubmit.loading}
            onSubmit={handleUpdateDraft}
            defaultValues={{
              title,
              policyCategoryId,
              description,
            }}
            submitting={updateDraftState.loading}
            submittingAsDraft={updateDraftState.loading}
            onSubmitAsDraft={handleUpdateDraft}
            toggleEditMode={toggleEditMode}
            premise={
              ((isAdminPreparer && !isSubmitted) ||
                (isAdminReviewer && !isSubmitted)) &&
              !(
                (hasEditAccess && !draft && isAdminPreparer) ||
                (!draft && isSubmitted && isAdmin)
              )
            }
          />
        )}
      </div>
    );
  };

  const renderGeneralAction = () => {
    const mainMenu: MenuData[] = [
      {
        label: (
          <div>
            <FaPlus /> Create Sub-Policy
          </div>
        ),
        onClick: () =>
          history.push(
            isAdminView
              ? `/policy-admin/${id}/create-sub-policy`
              : `/policy/${id}/create-sub-policy`
          ),
      },
      {
        label: (
          <div>
            <FaTrash /> Delete
          </div>
        ),
        onClick: handleDeleteMain,
      },
      { label: "divider" },
    ];
    const basicMenu: MenuData[] = bookmarked.length
      ? [
          {
            label: (
              <div>
                <FaFilePdf /> Preview
              </div>
            ),
            onClick: () =>
              previewPdf(`/prints/${id}/policy.pdf`, {
                onStart: () =>
                  notifySuccess("Downloading file for preview", {
                    autoClose: 10000,
                  }),
              }),
          },
          {
            label: (
              <div>
                <IoMdDownload /> Download
              </div>
            ),
            onClick: () => {
              downloadPdf(`/prints/${id}/policy.pdf`, {
                fileName: title,
                onStart: () => notifyInfo("Download Started"),
                onError: () => notifyError("Download Failed"),
                onCompleted: () => notifySuccess("Download Success"),
              });
            },
          },
          {
            label: (
              <div>
                <MdEmail /> Mail
              </div>
            ),
            onClick: () => emailPdf(title),
          },
        ]
      : [
          {
            label: (
              <div>
                <FaFilePdf /> Preview
              </div>
            ),
            onClick: () =>
              previewPdf(`/prints/${id}/policy.pdf`, {
                onStart: () =>
                  notifySuccess("Downloading file for preview", {
                    autoClose: 10000,
                  }),
              }),
          },
          {
            label: (
              <div>
                <IoMdDownload /> download
              </div>
            ),
            onClick: () => {
              downloadPdf(`/prints/${id}/policy.pdf`, {
                fileName: title,
                onStart: () => notifyInfo("Download Started"),
                onError: () => notifyError("Download Failed"),
                onCompleted: () => notifySuccess("Download Success"),
              });
            },
          },
          {
            label: (
              <div>
                <MdEmail /> Mail
              </div>
            ),
            onClick: () => emailPdf(title),
          },
          {
            label: (
              <div>
                <FaBookmark /> Bookmark
              </div>
            ),
            onClick: () =>
              addBookmark({ variables: { input: { policyId: id } } }),
          },
        ];
    let theMenu = [...basicMenu];
    if (isSmallDevice) {
      let noCreateMenu = [...mainMenu];
      noCreateMenu[0] = { label: "create" };
      const noCreateButton = noCreateMenu.filter((a) => a.label !== "create");
      let noDeleteMenu = [...mainMenu];
      noDeleteMenu[1] = { label: "Delete" };
      const noDeleteButton = noDeleteMenu.filter((a) => a.label !== "Delete");
      theMenu = bookmarkLoading
        ? [
            {
              label: (
                <Fragment>
                  <LoadingSpinner className="mt-2 mb-2" centered />
                </Fragment>
              ),
            },
          ]
        : isAdminReviewer
        ? [...noCreateButton, ...basicMenu]
        : !(isAdminReviewer || isAdmin || isAdminPreparer)
        ? basicMenu
        : [...noDeleteButton, ...basicMenu];
    }
    return (
      <div className="d-flex align-items-center">
        <div className="d-none d-lg-flex align-items-center ">
          {!isMaximumLevel && (isAdmin || isAdminPreparer) && (
            <Button
              tag={Link}
              to={
                isAdminView
                  ? `/policy-admin/${id}/create-sub-policy`
                  : `/policy/${id}/create-sub-policy`
              }
              className="pwc "
              style={{
                marginRight: `${
                  history.location.pathname.includes("details") ? "0px" : "10px"
                }`,
              }}
            >
              <FaPlus /> Sub-Policy
            </Button>
          )}
          {history.location.pathname.includes("details") && (
            <Tooltip
              description={
                collapse.length === initialCollapse.length
                  ? "Hide All Attribute"
                  : "Show All Attribute"
              }
            >
              <Button
                className="ml-3"
                color="transparent"
                onClick={() => {
                  collapse.length === initialCollapse.length
                    ? closeAllCollapse()
                    : openAllCollapse();
                }}
              >
                {collapse.length === initialCollapse.length ? (
                  <FaMinus size={20} />
                ) : (
                  <FaBars size={20} />
                )}
              </Button>
            </Tooltip>
          )}

          {isAdminReviewer && (
            <Tooltip description="Delete Policy">
              <Button
                onClick={handleDeleteMain}
                className="mr-3"
                color="transparent"
              >
                <FaTrash className="text-red" />
              </Button>
            </Tooltip>
          )}
        </div>
        <Menu data={theMenu}>
          <FaEllipsisV />
        </Menu>
      </div>
    );
  };

  const renderPolicyAction = () => {
    const hasEditAccess = oc(data).policy.hasEditAccess();
    const requestStatus = oc(data).policy.requestStatus();
    const requested = requestStatus === "requested";
    const notRequested = !requestStatus;
    const rejected = requestStatus === "rejected";
    const requestEdit = oc(data).policy.requestEdit.state();
    let actions: React.ReactNode = null;
    // PREMISES
    // 1: None
    const prem1 =
      (draft && isAdminPreparer && isSubmitted) || (!draft && isAdminReviewer);
    // 2: Approve or reject
    const prem2 = draft && isSubmitted && (isAdminReviewer || isAdmin);
    // 3: User Create as draft for admin preparer
    const prem3 =
      (isAdminPreparer && !isSubmitted) || (isAdminReviewer && !isSubmitted);
    // 4: Edit
    const prem4 =
      (hasEditAccess && !draft && isAdminPreparer) ||
      (!draft && isSubmitted && isAdmin);
    // 5: Request for edit
    const prem5 = !draft && (notRequested || rejected) && isAdminPreparer;
    // 6: Waiting approval
    const prem6 = requested && isAdminPreparer;
    // 7: Accept Request to edit
    const prem7 = requestEdit === "requested" && (isAdminReviewer || isAdmin);
    if (prem1) actions = null;
    if (prem2) {
      actions = (
        <div>
          <Button
            color="danger"
            className="mr-2"
            onClick={() =>
              dialogBox({
                callback: () => review({ publish: false }),
                title: "Reject changes?",
              })
            }
            loading={reviewPolicyM.loading}
          >
            Reject
          </Button>
          <Button
            color="primary"
            className="pwc"
            onClick={() =>
              dialogBox({
                callback: () => review({ publish: true }),
                title: "Accept changes?",
              })
            }
            loading={reviewPolicyM.loading}
          >
            Approve
          </Button>
        </div>
      );
    }
    if (prem3) {
      isAdminPreparer
        ? (actions = !inEditMode ? (
            // <div className="d-flex">
            <Tooltip description="Edit Policy">
              <Button
                onClick={toggleEditMode}
                color=""
                className="soft orange mr-2"
              >
                <AiFillEdit />
              </Button>
            </Tooltip>
          ) : // </div>
          null)
        : (actions = null);
    }
    if (prem4) {
      actions = inEditMode ? null : (
        <Tooltip description="Edit Policy">
          <Button onClick={toggleEditMode} color="" className="soft orange">
            <AiFillEdit />
          </Button>
        </Tooltip>
      );
    }

    if (prem5) {
      actions = (
        <Tooltip description="Request edit access">
          <Button
            onClick={() =>
              dialogBox({
                title: "Request access to edit?",
                callback: () => requestEditMutation(),
              })
            }
            loading={requestEditMutationInfo.loading}
            className="soft red mr-2"
            color=""
            disabled={requested}
          >
            <AiOutlineEdit />
          </Button>
        </Tooltip>
      );
    }

    if (prem6) {
      actions = (
        <Tooltip
          description="Waiting approval"
          subtitle="You will be able to edit as soon as Admin gave you permission"
        >
          <Button disabled className="soft orange mr-2">
            <AiOutlineClockCircle />
          </Button>
        </Tooltip>
      );
    }

    if (prem7) {
      actions = (
        <Tooltip description="Accept edit request">
          <DialogButton
            title={`Accept request to edit?`}
            message={`Request by ${oc(data).policy.requestEdit.user.name()}`}
            className="soft red mr-2"
            data={oc(data).policy.requestEdit.id()}
            onConfirm={handleApproveRequest}
            onReject={handleRejectRequest}
            actions={{ no: "Reject", yes: "Approve" }}
            loading={approveEditMutationResult.loading}
          >
            <FaExclamationCircle />
          </DialogButton>
        </Tooltip>
      );
    }

    return actions;
  };

  return (
    <div>
      <Helmet>
        <title>{title} - Policy - PricewaterhouseCoopers</title>
      </Helmet>

      <BreadCrumb
        crumbs={[
          ["/policy", "Policies"],
          ...breadcrumb,
          ["/policy/" + id, title],
        ]}
      />
      <Row className="d-flex justify-content-between">
        <Col>
          <HeaderWithBackButton
            draft={!!draft}
            policy
            review={
              isSubmitted ||
              (draft && isSubmitted && (isAdminReviewer || isAdmin)) ||
              false
            }
          >
            {title}
          </HeaderWithBackButton>
        </Col>
        {renderGeneralAction()}
      </Row>

      {inEditMode ? renderPolicyInEditMode() : renderPolicy()}
    </div>
  );
}
