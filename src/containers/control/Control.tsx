import React from "react";
import ControlForm, { CreateControlFormValues } from "./components/ControlForm";
import DialogButton from "../../shared/components/DialogButton";
import {
  useControlQuery,
  useUpdateControlMutation,
  TypeOfControl,
  Nature,
  Frequency,
  Status,
  useReviewControlDraftMutation
} from "../../generated/graphql";
import { RouteComponentProps } from "react-router";
import { notifySuccess, notifyGraphQLErrors } from "../../shared/utils/notif";
import get from "lodash/get";
import { toast } from "react-toastify";
import { oc } from "ts-optchain";
import HeaderWithBackButton from "../../shared/components/HeaderWithBack";
import BreadCrumb from "../../shared/components/BreadCrumb";
import useAccessRights from "../../shared/hooks/useAccessRights";

const Control = ({ match }: RouteComponentProps) => {
  const id = get(match, "params.id", "");
  const { loading, data } = useControlQuery({ variables: { id } });
  const draft = oc(data).control.draft.objectResult();
  const [reviewControl, reviewControlM] = useReviewControlDraftMutation({
    refetchQueries: ["control"],
    onError: notifyGraphQLErrors
  });
  function review({ publish }: { publish: boolean }) {
    reviewControl({ variables: { id, publish } }).then(() => {
      notifySuccess(publish ? "Changes published" : "Changes rejected");
    });
  }
  const [isAdmin] = useAccessRights(["admin"]);
  const [update, updateState] = useUpdateControlMutation({
    onCompleted: () => {
      toast.success("Update Success");
    },
    onError: () => toast.error("Update Failed"),
    refetchQueries: ["control"],
    awaitRefetchQueries: true
  });
  const renderControlAction = () => {
    if (draft && isAdmin) {
      return (
        <div>
          <DialogButton
            color="danger"
            className="mr-2"
            onConfirm={() => review({ publish: false })}
            loading={reviewControlM.loading}
          >
            Reject
          </DialogButton>
          <DialogButton
            color="primary"
            className="pwc"
            onConfirm={() => review({ publish: true })}
            loading={reviewControlM.loading}
          >
            Approve
          </DialogButton>
        </div>
      );
    }
    if (draft && !isAdmin) return null
  }
  const handleUpdate = (values: CreateControlFormValues) => {
    update({
      variables: {
        input: {
          id,
          ...values
        }
      }
    });
  };

  const controlOwner = oc(data).control.controlOwner("");
  let description = oc(data).control.description("");
  description= draft? `[Draft] ${description}`: description
  const assertion = oc(data).control.assertion([]);
  const frequency = oc(data).control.frequency("");
  const ipo = oc(data).control.ipo([]);
  const nature = oc(data).control.nature("");
  const typeOfControl = oc(data).control.typeOfControl("");
  const status = oc(data).control.status("");
  const riskIds = oc(data)
    .control.risks([])
    .map(risk => risk.id);
  const businessProcessIds = oc(data)
    .control.businessProcesses([])
    .map(bp => bp.id);
  const keyControl = oc(data).control.keyControl(false);

  if (loading) return null;

  return (
    <div>
      <BreadCrumb
        crumbs={[
          ["/control", "Controls"],
          ["/control/" + id, description]
        ]}
      />
      <div className="d-flex justify-content-between align-items-center">
      
      <HeaderWithBackButton heading={description} />
      {renderControlAction()}
      </div>
      <ControlForm
        onSubmit={handleUpdate}
        isDraft={draft? true:false}
        defaultValues={{
          controlOwner,
          description,
          assertion: assertion as CreateControlFormValues["assertion"],
          frequency: (frequency as Frequency) || Frequency.Annually,
          ipo: ipo as CreateControlFormValues["ipo"],
          nature: (nature as Nature) || Nature.Corrective,
          typeOfControl:
            (typeOfControl as TypeOfControl) || TypeOfControl.Automatic,
          status: (status as Status) || Status.Draft,
          riskIds,
          businessProcessIds,
          keyControl
        }}
        submitting={updateState.loading}
      />
    </div>
  );
};

export default Control;
