import get from "lodash/get";
import React, { useState } from "react";
import Helmet from "react-helmet";
import { FaBookmark, FaEllipsisV, FaTimes, FaTrash } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { MdEmail, MdModeEdit, MdPrint } from "react-icons/md";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import {
  PoliciesDocument,
  PolicyDocument,
  Status,
  useDestroyPolicyMutation,
  usePolicyQuery,
  useUpdatePolicyMutation,
  useCreateBookmarkPolicyMutation
} from "../../generated/graphql";
import Button from "../../shared/components/Button";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import Menu from "../../shared/components/Menu";
import ResourceBar from "../../shared/components/ResourceBar";
import Table from "../../shared/components/Table";
import PolicyForm, { PolicyFormValues } from "./components/PolicyForm";
import SubPolicyForm, { SubPolicyFormValues } from "./components/SubPolicyForm";

const Policy = ({ match, history }: RouteComponentProps) => {
  const [inEditMode, setInEditMode] = useState(false);
  const toggleEditMode = () => setInEditMode(prev => !prev);
  const id = get(match, "params.id", "");
  const { loading, data } = usePolicyQuery({
    variables: { id },
    fetchPolicy: "network-only"
  });
  const [update, updateState] = useUpdatePolicyMutation({
    onCompleted: () => toast.success("Update Success"),
    onError: () => toast.error("Update Failed"),
    refetchQueries: [
      { query: PoliciesDocument, variables: { filter: {} } },
      { query: PolicyDocument, variables: { id } }
    ],
    awaitRefetchQueries: true
  });
  const [destroy] = useDestroyPolicyMutation({
    onCompleted: () => toast.success("Delete Success"),
    onError: () => toast.error("Delete Failed"),
    refetchQueries: [{ query: PolicyDocument, variables: { id } }],
    awaitRefetchQueries: true
  });
  const [destroyMain] = useDestroyPolicyMutation({
    onCompleted: () => {
      toast.success("Delete Success");
      history.push("/policy");
    },
    onError: () => toast.error("Delete Failed"),
    refetchQueries: [{ query: PoliciesDocument, variables: { filter: {} } }],
    awaitRefetchQueries: true
  });
  const [addBookmark] = useCreateBookmarkPolicyMutation({
    onCompleted: _ => toast.success("Added to bookmark"),
    onError: _ => toast.error("Failed to add bookmark")
  });

  function handleDeleteMain() {
    destroyMain({ variables: { id } });
  }

  function handleDelete(id: string) {
    destroy({ variables: { id } });
  }

  function handleUpdate(values: PolicyFormValues) {
    update({
      variables: {
        input: {
          id,
          title: values.title,
          policyCategoryId: values.policyCategoryId,
          description: values.description
        }
      }
    });
  }

  function handleUpdateSubPolicy(values: SubPolicyFormValues) {
    update({
      variables: {
        input: {
          id,
          resourceIds: values.resourceIds,
          itSystemIds: values.itSystemIds,
          businessProcessIds: values.businessProcessIds,
          description: values.description,
          referenceIds: values.referenceIds,
          controlIds: values.controlIds,
          riskIds: values.riskIds
        }
      }
    });
  }

  const title = oc(data).policy.title("");
  const description = oc(data).policy.description("");
  const policyCategoryId = oc(data).policy.policyCategory.id("");
  const parentId = oc(data).policy.parentId("");
  const children = oc(data).policy.children([]);
  const isSubPolicy: boolean = !!oc(data).policy.ancestry();
  const ancestry = oc(data).policy.ancestry("");
  const referenceIds = oc(data)
    .policy.references([])
    .map(item => item.id);
  const status = oc(data).policy.status("");
  const resources = oc(data).policy.resources([]);
  const controls = oc(data).policy.controls([]);
  const risks = oc(data).policy.risks([]);

  const isMaximumLevel = ancestry.split("/").length === 5;

  if (loading) return null;

  const renderPolicy = () => {
    return (
      <div className="mt-3">
        <div
          dangerouslySetInnerHTML={{
            __html: description
          }}
        ></div>
        <h5 className="mt-5">Resources</h5>
        {resources.map(resource => (
          <ResourceBar
            key={resource.id}
            resourceId={resource.id}
            name={resource.name}
            rating={resource.rating}
            visit={resource.visit}
            resuploadUrl={resource.resuploadUrl}
          />
        ))}
        <h5 className="mt-5">Risks</h5>
        <div>
          <ul>
            {risks.map(risk => {
              return (
                <li>
                  <Link to={`/risk/${risk.id}`}>{risk.name}</Link>
                </li>
              );
            })}
          </ul>
        </div>
        <h5 className="mt-5">Controls</h5>
        {controls.map(control => {
          return (
            <div>
              <ul>
                <li>
                  <Link to={`/control/${control.id}`}>
                    {control.description}
                  </Link>
                </li>
              </ul>
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
                    <td>{control.frequency}</td>
                    <td>{control.typeOfControl}</td>
                    <td>{control.nature}</td>
                    <td>{control.ipo}</td>
                    <td>{control.assertion}</td>
                    <td>{control.controlOwner}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPolicyInEditMode = () => {
    return isSubPolicy ? (
      <SubPolicyForm
        defaultValues={{
          parentId,
          title,
          description,
          referenceIds,
          resourceIds: oc(data)
            .policy.resources([])
            .map(r => r.id),
          itSystemIds: oc(data)
            .policy.itSystems([])
            .map(r => r.id),
          businessProcessIds: oc(data)
            .policy.businessProcesses([])
            .map(r => r.id),
          controlIds: oc(data)
            .policy.controls([])
            .map(r => r.id),
          riskIds: oc(data)
            .policy.risks([])
            .map(r => r.id),
          status: status as Status
        }}
        onSubmit={handleUpdateSubPolicy}
        submitting={updateState.loading}
      />
    ) : (
      <PolicyForm
        onSubmit={handleUpdate}
        defaultValues={{
          title,
          policyCategoryId,
          description,
          status: status as Status
        }}
        submitting={updateState.loading}
        isSubPolicy={isSubPolicy}
      />
    );
  };

  const renderPolicyAction = () => {
    if (inEditMode) {
      return (
        <Button onClick={toggleEditMode} color="">
          <FaTimes size={22} className="mr-2" />
          Cancel Edit
        </Button>
      );
    }
    return (
      <div className="d-flex align-items-center">
        {!isMaximumLevel && (
          <Link to={`/policy/${id}/create-sub-policy`}>
            <Button className="pwc">+ Create Sub-Policy</Button>
          </Link>
        )}
        <MdModeEdit
          size={22}
          className="mx-3 clickable"
          onClick={toggleEditMode}
        />
        <FaTrash
          onClick={handleDeleteMain}
          className="clickable text-red mr-3"
        />
        <Menu
          data={[
            {
              label: (
                <div>
                  <MdPrint /> Print
                </div>
              ),
              onClick: console.log
            },
            {
              label: (
                <div>
                  <IoMdDownload /> Download
                </div>
              ),
              onClick: console.log
            },
            {
              label: (
                <div>
                  <MdEmail /> Mail
                </div>
              ),
              onClick: console.log
            },
            {
              label: (
                <div>
                  <FaBookmark /> Bookmark
                </div>
              ),
              onClick: () =>
                addBookmark({ variables: { input: { policyId: id } } })
            }
          ]}
        >
          <FaEllipsisV />
        </Menu>
      </div>
    );
  };

  return (
    <div>
      <Helmet>
        <title>Policy - {title} - PricewaterhouseCoopers</title>
      </Helmet>
      <div className="d-flex justify-content-between">
        <HeaderWithBackButton heading={`Policy ${title}`} />
        {renderPolicyAction()}
      </div>
      {inEditMode ? renderPolicyInEditMode() : renderPolicy()}
      {children.length ? (
        <>
          <h5 className="mt-5">Sub policies</h5>
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>References</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {children.map(item => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/policy/${item.id}`}>{item.title}</Link>
                  </td>
                  <td>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: item.description ? item.description : ""
                      }}
                    ></div>
                  </td>
                  <td>
                    {oc(item)
                      .references([])
                      .map(ref => ref.name)
                      .join(", ")}
                  </td>
                  <td>
                    <FaTrash
                      onClick={() => handleDelete(item.id)}
                      className="clickable"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : null}
    </div>
  );
};

export default Policy;
